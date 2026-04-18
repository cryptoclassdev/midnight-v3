import { PublicKey } from "@solana/web3.js";
import { withSolanaConnectionFallbacks } from "@/lib/solana";
import { USDC_MINT } from "@midnight/shared";

export interface WalletBalances {
  solLamports: number;
  usdcMicroAmount: number;
}

const USDC_MINT_PUBKEY = new PublicKey(USDC_MINT);

/** Minimum SOL required for transaction fees (~0.03 SOL) */
export const MIN_SOL_FOR_FEES = 30_000_000;

export async function fetchWalletBalances(pubkey: string): Promise<WalletBalances> {
  const owner = new PublicKey(pubkey);

  const [solLamports, tokenAccounts] = await withSolanaConnectionFallbacks(
    async (connection) => {
      const [sol, tokens] = await Promise.all([
        connection.getBalance(owner, "confirmed"),
        connection.getTokenAccountsByOwner(owner, { mint: USDC_MINT_PUBKEY }),
      ]);
      return [sol, tokens] as const;
    },
  );

  let usdcMicroAmount = 0;
  for (const { account } of tokenAccounts.value) {
    // USDC amount is stored as a u64 at bytes 64-72 of the token account data
    const data = account.data;
    if (data.length >= 72) {
      const amount = Number(data.readBigUInt64LE(64));
      usdcMicroAmount += amount;
    }
  }

  return { solLamports, usdcMicroAmount };
}

export function getBalanceError(
  balances: WalletBalances,
  tradeAmountMicro: number,
): string | null {
  if (balances.solLamports < MIN_SOL_FOR_FEES) {
    return "Insufficient SOL for transaction fees. You need ~0.03 SOL.";
  }
  if (balances.usdcMicroAmount < tradeAmountMicro) {
    const haveUsd = (balances.usdcMicroAmount / 1_000_000).toFixed(2);
    const needUsd = (tradeAmountMicro / 1_000_000).toFixed(2);
    return `Insufficient USDC. You have $${haveUsd} but need $${needUsd}.`;
  }
  return null;
}

import { Hono } from "hono";
import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

/** Seeker Genesis Token (SGT) collection address on mainnet */
const SGT_COLLECTION_ADDRESS = "sgt1wtKMfMFqdmxJHR2bLmUBkYAaar6MkHp62Fhvjsg";

const connection = new Connection(SOLANA_RPC_URL);

export const seekerRoutes = new Hono();

/** POST /seeker/verify — Check if wallet holds a Seeker Genesis Token */
seekerRoutes.post("/seeker/verify", async (c) => {
  const body = await c.req.json<{ address?: string }>();
  const address = body.address;

  if (!address || typeof address !== "string") {
    return c.json({ error: "Wallet address is required" }, 400);
  }

  let publicKey: PublicKey;
  try {
    publicKey = new PublicKey(address);
  } catch {
    return c.json({ error: "Invalid wallet address" }, 400);
  }

  try {
    const isSeeker = await checkSGTOwnership(publicKey);
    return c.json({ isSeeker });
  } catch {
    return c.json({ error: "Failed to verify Seeker ownership" }, 500);
  }
});

async function checkSGTOwnership(owner: PublicKey): Promise<boolean> {
  const heliusApiKey = process.env.HELIUS_API_KEY;
  const rpcUrl = heliusApiKey
    ? `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
    : SOLANA_RPC_URL;

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getAssetsByOwner",
      params: {
        ownerAddress: owner.toBase58(),
        page: 1,
        limit: 1000,
      },
    }),
  });

  const data = await response.json();
  const assets = data?.result?.items;

  if (!Array.isArray(assets)) {
    return false;
  }

  return assets.some((asset: any) => {
    const group = asset.grouping?.find(
      (g: any) => g.group_key === "collection",
    );
    return group?.group_value === SGT_COLLECTION_ADDRESS;
  });
}

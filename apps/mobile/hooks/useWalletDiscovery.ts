import { useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import { WALLET_REGISTRY, SEEKER_WALLET, type WalletInfo } from "@/lib/wallet-registry";

/**
 * Discovers which Solana wallet apps are installed on the device
 * by probing each wallet's custom URI scheme via `Linking.canOpenURL()`.
 *
 * Seeker's built-in wallet shares the generic `solana-wallet://` scheme
 * with other MWA wallets, so it's shown when MWA is available but no
 * other known wallets account for the device.
 */
export function useWalletDiscovery() {
  const [installedWallets, setInstalledWallets] = useState<WalletInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS !== "android") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function discover() {
      // Check each known wallet's custom URI scheme
      const knownResults = await Promise.all(
        WALLET_REGISTRY.map(async (wallet) => {
          try {
            const canOpen = await Linking.canOpenURL(wallet.scheme);
            return canOpen ? wallet : null;
          } catch {
            return null;
          }
        }),
      );

      const found = knownResults.filter((w): w is WalletInfo => w !== null);

      // Check if the generic MWA scheme is handled (any wallet at all)
      let hasMwaSupport = false;
      try {
        hasMwaSupport = await Linking.canOpenURL("solana-wallet://");
      } catch {
        // ignore
      }

      // If MWA is available but no known wallets were detected,
      // the device likely has Seeker's built-in wallet or another MWA wallet
      if (hasMwaSupport && found.length === 0) {
        found.push(SEEKER_WALLET);
      }

      if (!cancelled) {
        setInstalledWallets(found);
        setLoading(false);
      }
    }

    discover();

    return () => {
      cancelled = true;
    };
  }, []);

  return { installedWallets, loading };
}

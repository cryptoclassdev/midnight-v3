/**
 * Known Solana wallet apps with MWA (Mobile Wallet Adapter) support.
 *
 * `scheme` — custom URI scheme used for detection via Linking.canOpenURL().
 * `packageName` — Android package used by WalletTargetModule to route
 *   the solana-wallet:// intent to a specific wallet app.
 */

export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  scheme: string;
  packageName: string;
}

export const WALLET_REGISTRY: WalletInfo[] = [
  {
    id: "phantom",
    name: "Phantom",
    icon: "👻",
    scheme: "phantom://",
    packageName: "app.phantom",
  },
  {
    id: "solflare",
    name: "Solflare",
    icon: "🔥",
    scheme: "solflare://",
    packageName: "com.solflare.mobile",
  },
  {
    id: "backpack",
    name: "Backpack",
    icon: "🎒",
    scheme: "backpack://",
    packageName: "app.backpack",
  },
  {
    id: "ultimate",
    name: "Ultimate",
    icon: "💎",
    scheme: "ultimate://",
    packageName: "com.aspect.ultimate",
  },
];

/** Seeker's built-in wallet — detected via the generic MWA scheme */
export const SEEKER_WALLET: WalletInfo = {
  id: "seeker",
  name: "Seeker Wallet",
  icon: "📱",
  scheme: "solana-wallet://",
  packageName: "com.solana.seeker",
};

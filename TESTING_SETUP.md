# Wallet Testing Setup — Android Emulator

End-to-end testing guide for MWA (Mobile Wallet Adapter) wallet connect and transaction signing flows on the Midnight app.

## 1. Android Emulator Setup

### Create AVD

1. Android Studio → Device Manager → **Create Virtual Device**
2. Device: **Pixel 7** or **Pixel 8**
3. System image: **API 34 (Android 14)** — select the image with the **Google Play** icon (Google APIs + Play Store)
4. Config: RAM 4 GB, Internal Storage 8 GB
5. Launch emulator, verify boot completes

### Google Account

Open Play Store on the emulator and sign in with a dev-only Gmail account.

## 2. Install Wallets from Play Store

Search and install each wallet on the emulator:

| Wallet | Package ID | Play Store Search |
|--------|-----------|-------------------|
| Phantom | `app.phantom` | "Phantom Crypto Wallet" |
| Solflare | `com.solflare.mobile` | "Solflare Solana Wallet" |
| Backpack | `app.backpack` | "Backpack Wallet" |

After installing each wallet:

1. Open the app
2. Create a new wallet (save seed phrase — dev only)
3. Switch to **Devnet** in wallet settings
4. Note the wallet's Solana address for airdrop later

## 3. Install fakewallet (Dev Wallet)

```bash
git clone https://github.com/solana-mobile/mobile-wallet-adapter /tmp/mwa
```

1. Open `/tmp/mwa/android` in Android Studio
2. Select **fakewallet** in the run configuration dropdown
3. Build & deploy to the same emulator
4. Verify fakewallet launches

## 4. Run the App on Emulator

```bash
# Rebuild native app with devnet cluster
EXPO_PUBLIC_SOLANA_CLUSTER=devnet pnpm --filter mobile android
```

Or equivalently:

```bash
cd apps/mobile
EXPO_PUBLIC_SOLANA_CLUSTER=devnet npx expo run:android
```

Verify:
- App installs and loads on emulator
- Metro bundles JS successfully
- Feed loads from the API

## 5. Wallet Connect Testing

### Procedure per wallet

1. Open app → Profile tab → tap **Connect Wallet**
2. WalletPicker bottom sheet should list installed wallets
3. Tap the target wallet name
4. Wallet app opens with authorization prompt
5. Approve in wallet
6. Return to app — wallet address should appear in Profile

### Checklist per wallet

| Check | fakewallet | Phantom | Solflare | Backpack |
|-------|-----------|---------|----------|----------|
| MWA handoff works (app → wallet → app) | | | | |
| Wallet address received and displayed | | | | |
| SKR domain resolution attempted | | | | |
| No crashes or errors | | | | |
| Disconnect works (Profile → Disconnect) | | | | |

### Test order

1. **fakewallet** — auto-approves, validates the flow works at all
2. **Phantom** — most popular, highest priority
3. **Solflare** — second most popular
4. **Backpack** — third priority

## 6. Devnet SOL Airdrop

```bash
# Install Solana CLI if not present
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Airdrop devnet SOL to each test wallet
solana airdrop 2 <PHANTOM_ADDRESS> --url devnet
solana airdrop 2 <SOLFLARE_ADDRESS> --url devnet
solana airdrop 2 <BACKPACK_ADDRESS> --url devnet
```

## 7. Transaction Signing Testing

### Checklist per wallet

| Check | fakewallet | Phantom | Solflare | Backpack |
|-------|-----------|---------|----------|----------|
| Transaction signing prompt appears | | | | |
| Wallet flags transaction as malicious? | | | | |
| Transaction succeeds or expected error | | | | |
| App handles wallet rejection gracefully | | | | |

> **Note:** Prediction markets may not have devnet markets available via Jupiter. If not, verify the signing prompt appears and the wallet handles it correctly, even if the API returns an error about the market.

## 8. Network Verification

```bash
# Confirm emulator has internet
adb shell ping -c 3 api.devnet.solana.com

# Verify devnet RPC responds
curl https://api.devnet.solana.com -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

## 9. Environment Variables

| Variable | Where | Purpose | Default |
|----------|-------|---------|---------|
| `EXPO_PUBLIC_SOLANA_CLUSTER` | Mobile | Cluster selection (`mainnet-beta`, `devnet`, `testnet`) | `mainnet-beta` |
| `EXPO_PUBLIC_SOLANA_RPC_URL` | Mobile | Custom RPC endpoint | `clusterApiUrl(cluster)` |
| `SOLANA_RPC_URL` | API | RPC endpoint for relay service | mainnet public RPC |

## 10. Troubleshooting

### App won't build after Kotlin changes

Run a clean build:

```bash
cd apps/mobile/android && ./gradlew clean && cd ../../..
pnpm --filter mobile android
```

### WalletPicker doesn't list wallets

- Verify wallets are installed: `adb shell pm list packages | grep -E "phantom|solflare|backpack"`
- Ensure the emulator has Google Play services (API 34 with Play Store image)

### MWA handoff fails / "No wallet found"

- Confirm the wallet supports MWA (all listed wallets do)
- Check logcat for intent resolution errors: `adb logcat | grep -i "solana-wallet"`

### Devnet not working

- Confirm env var is set: check Metro logs for `EXPO_PUBLIC_SOLANA_CLUSTER`
- Verify the wallet is also switched to devnet in its settings

### Transaction signing shows "malicious" warning (Phantom)

This is a known Phantom behavior for unrecognized programs on devnet. The transaction can still be approved manually.

## 11. Known Issues

| Wallet | Issue | Severity |
|--------|-------|----------|
| Phantom | May flag devnet transactions as "malicious" | Low — can approve manually |
| fakewallet | Auto-approves everything — not realistic for UX testing | Expected behavior |
| Backpack | Slower MWA handoff on emulator | Low |

# Mobile app assets

Current files here are used by `app.json` for icons, splash, and notifications. Before dApp Store submission, replace these with production-quality versions:

| File | Purpose | Required spec |
|------|---------|---------------|
| `icon.png` | iOS launcher + splash source | 1024×1024 PNG, square, no alpha |
| `adaptive-icon.png` | Android adaptive launcher + iOS icon fallback | 1024×1024 PNG, 25% safe zone (logo inside centered ~66% square) |
| `splash.png` *(missing — optional)* | Dedicated splash image | 1242×2436 PNG, dark bg (#030303), brand mark centered. If absent, `icon.png` is used. |
| `notification-icon.png` *(missing — needed)* | Android notification channel icon | 96×96 PNG, **monochrome white on transparent**. Android renders color icons as white squares. |

## Wiring

When you have the missing files, update `app.json`:

```json
"splash": { "image": "./assets/splash.png", ... }

"plugins": [
  ...
  ["expo-notifications", { "icon": "./assets/notification-icon.png", "color": "#4C8BD0" }]
]
```

Keep existing paths until the replacements are ready — they are not submission blockers but the notification icon will look broken on Android (white square) until a monochrome version ships.

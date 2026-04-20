# Midnight - Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Monorepo | Turborepo + pnpm | Build orchestration, caching |
| Mobile | Expo SDK 52+ / expo-router v4 | React Native app with file-based routing |
| Language | TypeScript (strict) | End-to-end type safety |
| Backend | Hono (Node.js) | Lightweight API server |
| Database | PostgreSQL + Prisma ORM | Data persistence (Supabase hosted) |
| AI | Gemini 2.0 Flash | Title rewriting + summarization |
| Server State | TanStack Query | Caching, pagination, background refresh |
| Local State | Zustand | Theme, category selection, read tracking |
| Swipe UX | react-native-pager-view | Native vertical paging (TikTok-style) |
| Animations | react-native-reanimated | GPU-accelerated card transitions |
| Images | expo-image | Blurhash placeholders, caching |
| HTTP | ky | Lightweight fetch wrapper with retry |
| Fonts | Playfair Display + DM Sans | Editorial typography (serif headlines, sans body) |
| Haptics | expo-haptics | Tactile feedback on swipe snap |
| RSS | rss-parser | Parse RSS/Atom feeds |
| Market Data | CoinGecko API | Crypto prices |
| Cron | node-cron | Scheduled feed fetching |

@AGENTS.md

## Design Context

### Users

Midnight serves two audiences equally:

1. **Crypto-native traders** checking market-moving news and prediction markets between trades on mobile. They want speed, signal-to-noise ratio, and data density without clutter.
2. **Curious tech enthusiasts** browsing crypto and AI trends casually. They want approachable, well-summarized content they can swipe through in 2-minute sessions.

Both groups are mobile-first, short-attention-span, and expect the app to respect their time. The core job-to-be-done: **"Keep me informed in 60 seconds."**

### Brand Personality

**Minimal. Smart. Clean.**

- **Minimal** — Every element earns its place. No decoration for decoration's sake. White space is a feature.
- **Smart** — The design signals intelligence through typographic hierarchy and data presentation, not through complexity.
- **Clean** — Crisp edges, high contrast, precise spacing. The interface feels engineered, not decorated.

**Emotional goal:** The user should feel *informed and in control* — like they have an unfair information advantage, delivered effortlessly.

### Aesthetic Direction

**Visual tone:** Dark, typographic, culturally aware. Sits at the intersection of TikTok's addictive swipe UX and Zora/Foundation's web3-native aesthetic.

**References:**
- **TikTok / Reels** — Content-forward, minimal chrome, full-screen immersion, dopamine-driven swipe mechanics
- **Zora / Foundation** — Dark canvas, bold typography, cultural credibility, web3-native feel

**Anti-references (explicitly avoid):**
- **Cluttered crypto apps** — No chart walls, no 50-tab interfaces, no CoinMarketCap/CoinGecko density
- **Corporate / Enterprise** — No generic SaaS feel, no blue-gray dashboards, no cookie-cutter components
- **Playful / Cartoonish** — No rounded bubbly UI, no pastel colors, no emoji-heavy design

### Design Principles

1. **Content is the interface.** The news card IS the screen. Minimize UI chrome. Let headlines, summaries, and data speak.
2. **Dark-first, always.** The dark theme (`#030303`) is the brand identity. Light mode exists for accessibility, not as an equal alternative.
3. **Typography does the heavy lifting.** Three fonts plus brand font, strict hierarchy: Anton screams headlines, Inter delivers content, JetBrains Mono signals data, BlauerNue is for logo/branding only. Never mix roles.
4. **Blue for action, mint for data.** `#4C8BD0` draws attention to interactions and branding. `#00D4AA` highlights prediction markets and positive signals. Don't dilute either.
5. **Engineered, not decorated.** No shadows, no gradients-as-fills, no ornamental elements. Borders are thin (0.5px), corners are smooth (continuous curvature), spacing is deliberate.

### Animation & Motion

**Philosophy: Minimal & functional.** Every animation must aid comprehension or confirm an interaction — never decorate. Motion should feel like a natural consequence of the user's action, not a performance.

**Durations:**
- Micro-interactions (press feedback, toggles): 100–150ms
- Data updates (price changes, odds shifting): 200–300ms
- Page transitions (navigation, modals): 250–350ms
- Scroll effects (parallax, header collapse): driven by gesture velocity, no fixed duration

**Easing:**
- Default: `Easing.out(Easing.cubic)` — fast entry, smooth settle
- Springs: Use `withSpring` only for gesture-driven interactions (swipe, drag). Keep damping high (15–20), stiffness moderate (100–150) — no bouncing or overshoot
- Never use linear easing or elastic/bounce curves

**What animates:**
- **Page transitions** — Screen pushes, modal presentations, tab crossfades. Keep consistent with platform conventions.
- **Micro-interactions** — Button scale-down on press (0.97), toggle slides, pull-to-refresh. Haptic feedback (`expo-haptics`) pairs with visual feedback on key actions.
- **Data updates** — Price tickers, market odds bars, and percentage badges animate value changes. Use `withTiming` for smooth number transitions, not abrupt swaps.
- **Scroll effects** — Parallax on card hero images, collapsing headers on market list. Tied to scroll position via `useAnimatedScrollHandler`, not time-based.

**What stays static:**
- Text content (headlines, summaries) — appears instantly, no fade-in or typewriter effects
- Color changes (theme toggle) — instant swap, no crossfade
- Layout shifts — avoid animated reflows; if content size changes, it should feel immediate

**Implementation:** Use `react-native-reanimated` for all animations. Run on the UI thread (`useAnimatedStyle`, `useSharedValue`). Never use `Animated` from React Native core.

import { DeviceMobile, BookOpen, Coins } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import PhoneMockup from "@/components/PhoneMockup";

const marqueeItems = [
  { accent: "blue" as const, label: "READ → PREDICT → BET" },
  { accent: "gray" as const, label: "THE FEED IS THE TRADING INTERFACE" },
  { accent: "mint" as const, label: "60 WORDS. ONE POSITION." },
  { accent: "blue" as const, label: "LIVE ON SOLANA MAINNET" },
  { accent: "gray" as const, label: "SIGNAL, NOT NOISE" },
  { accent: "mint" as const, label: "YES / NO. BEFORE THE MARKET MOVES." },
];

const accentColor = {
  blue: "text-[#4C8BD0]",
  mint: "text-[#00D4AA]",
  gray: "text-[#444444]",
};

export default function Home() {
  return (
    <>
      {/* Nav */}
      <nav className="w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-xl z-50 sticky top-0">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Midnight"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="text-base font-brand font-medium tracking-tight text-[#f4f4f5]">
              Midnight
            </span>
          </div>
          {/* TODO: swap href to Typeform waitlist URL */}
          <a
            href="#"
            className="bg-[#4C8BD0] text-white font-sans font-medium text-xs px-5 py-2.5 rounded-full hover:bg-[#5a9de0] active:scale-[0.97] transition-[transform,background-color] duration-150"
          >
            Join Waitlist
          </a>
        </div>
      </nav>

      {/* Hero */}
      <header className="w-full relative overflow-hidden bg-black border-b border-white/[0.06] min-h-[92vh] flex items-center">
        <div className="absolute inset-0 bg-glow-top opacity-100 pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          {/* Left */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            <div className="inline-flex items-center gap-2.5 w-max">
              <span className="w-1.5 h-1.5 bg-[#00D4AA] rounded-full animate-pulse-slow" />
              <span className="font-mono text-[9px] font-normal uppercase tracking-[0.2em] text-[#555555]">
                Live on Solana Mainnet
              </span>
            </div>

            <h1 className="text-7xl sm:text-8xl lg:text-[108px] font-anton leading-[0.92] text-[#f4f4f5]">
              Read <span className="text-[#666666]">less.</span>
              <br />
              Predict <span className="text-[#00D4AA]">more.</span>
            </h1>

            <p className="text-[#777777] text-[15px] font-sans leading-7 max-w-md">
              Crypto moves on information asymmetry. The people who win process
              signal faster. Midnight compresses the loop — read, predict, bet —
              before the trade is gone.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              {/* TODO: swap href to Typeform waitlist URL */}
              <a
                href="#"
                className="bg-[#4C8BD0] text-white font-sans font-medium text-sm py-4 px-8 rounded-full hover:bg-[#5a9de0] active:scale-[0.97] transition-[transform,background-color] duration-150 flex items-center justify-center gap-2.5"
              >
                Join Waitlist
              </a>
            </div>
          </div>

          {/* Right — Phone Mockup */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative mt-16 lg:mt-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[680px] bg-glow-top opacity-25 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[480px] bg-glow-center opacity-70 blur-[80px] rounded-full pointer-events-none" />
            <PhoneMockup />
          </div>
        </div>
      </header>

      {/* Marquee — single doubled-list approach for seamless loop */}
      <div className="w-full bg-black py-5 overflow-hidden border-b border-white/[0.06] relative z-20">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3.5 mx-10 font-mono text-[9px] uppercase tracking-[0.22em]"
            >
              <span className={accentColor[item.accent]}>•</span>
              <span className="text-[#444444]">{item.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <section className="w-full bg-[#030303] border-b border-white/[0.04] py-14">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-3 divide-x divide-white/[0.04]">
            <div className="flex flex-col items-center gap-2 px-8">
              <span className="font-anton text-5xl text-[#f4f4f5] tabular-nums">
                60
              </span>
              <span className="font-mono text-[8px] text-[#3a3a3a] uppercase tracking-[0.22em] mt-1">
                Words Per Story
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 px-8">
              <span className="font-anton text-5xl text-[#f4f4f5] tabular-nums">
                15 MIN
              </span>
              <span className="font-mono text-[8px] text-[#3a3a3a] uppercase tracking-[0.22em] mt-1">
                Feed Refresh
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 px-8">
              <span className="font-anton text-5xl text-[#f4f4f5] tabular-nums">
                SOL
              </span>
              <span className="font-mono text-[8px] text-[#3a3a3a] uppercase tracking-[0.22em] mt-1">
                Prediction Layer
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section
        id="how-it-works"
        className="w-full bg-black py-40 border-b border-white/[0.06] relative"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.025] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-6 md:px-8 relative z-10">
          <div className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <h2 className="text-6xl md:text-7xl font-anton leading-[0.92] text-[#f4f4f5]">
              How it works
            </h2>
            <p className="text-[#555555] text-sm font-sans leading-relaxed max-w-xs">
              The loop: read the signal, form a view, place the bet — before the
              market moves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="p-10 bg-white/[0.02] border border-white/[0.06] rounded-2xl relative group hover:bg-[#4C8BD0]/[0.03] hover:border-[#4C8BD0]/[0.18] transition-colors duration-300 overflow-hidden">
              <span className="absolute top-8 right-8 font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.22em]">
                No. 01
              </span>
              <div className="flex flex-col h-full mt-4">
                <div className="w-10 h-10 rounded-full border border-[#4C8BD0]/25 text-[#4C8BD0] flex items-center justify-center mb-10">
                  <DeviceMobile size={18} />
                </div>
                <h3 className="text-lg font-semibold text-[#f4f4f5] mb-3 tracking-tight">
                  Open &amp; Swipe
                </h3>
                <p className="text-[#555555] text-sm font-sans leading-6">
                  Swipe through market-moving stories the moment they break. The
                  feed is the trading interface.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-10 bg-white/[0.02] border border-white/[0.06] rounded-2xl relative group hover:bg-[#4C8BD0]/[0.03] hover:border-[#4C8BD0]/[0.18] transition-colors duration-300 overflow-hidden">
              <span className="absolute top-8 right-8 font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.22em]">
                No. 02
              </span>
              <div className="flex flex-col h-full mt-4">
                <div className="w-10 h-10 rounded-full border border-[#4C8BD0]/25 text-[#4C8BD0] flex items-center justify-center mb-10">
                  <BookOpen size={18} />
                </div>
                <h3 className="text-lg font-semibold text-[#f4f4f5] mb-3 tracking-tight">
                  Read 60 Words
                </h3>
                <p className="text-[#555555] text-sm font-sans leading-6">
                  60 words. That is all you need to form a view. Signal only,
                  nothing else.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-10 bg-[#4C8BD0]/[0.02] border border-[#4C8BD0]/[0.08] rounded-2xl relative group hover:bg-[#4C8BD0]/[0.04] hover:border-[#4C8BD0]/[0.18] transition-colors duration-300 overflow-hidden">
              <span className="absolute top-8 right-8 font-mono text-[8px] text-[#4C8BD0]/40 uppercase tracking-[0.22em]">
                No. 03
              </span>
              <div className="flex flex-col h-full mt-4">
                <div className="w-10 h-10 rounded-full border border-[#4C8BD0]/25 text-[#4C8BD0] flex items-center justify-center mb-10">
                  <Coins size={18} />
                </div>
                <h3 className="text-lg font-semibold text-[#4C8BD0] mb-3 tracking-tight">
                  Place Bets
                </h3>
                <p className="text-[#555555] text-sm font-sans leading-6">
                  Tap YES or NO before you swipe away. Prediction markets settle
                  on Solana in seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Edge — feature grid */}
      <section className="w-full bg-[#030303] py-32 border-b border-white/[0.04]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#444444]">
                The Advantage
              </span>
              <h2 className="font-anton text-5xl md:text-6xl leading-[0.92] text-[#f4f4f5] mt-3">
                Built for the edge.
              </h2>
            </div>
            <p className="text-[#444444] text-sm font-sans leading-relaxed max-w-xs">
              Every feature is a speed multiplier. Every screen removes one more
              reason to hesitate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden">
            <div className="bg-[#030303] p-10 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors duration-300">
              <div className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em]">
                01
              </div>
              <h3 className="font-anton text-2xl text-[#f4f4f5] leading-tight mt-2">
                AI Distilled Signal
              </h3>
              <p className="text-[#444444] text-sm font-sans leading-relaxed mt-1">
                Gemini strips every story to 60 words. Pure signal. No filler,
                no fluff.
              </p>
            </div>
            <div className="bg-[#030303] p-10 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors duration-300">
              <div className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em]">
                02
              </div>
              <h3 className="font-anton text-2xl text-[#f4f4f5] leading-tight mt-2">
                Embedded Markets
              </h3>
              <p className="text-[#444444] text-sm font-sans leading-relaxed mt-1">
                Prediction markets live inside the feed. Read a headline, place
                a position — one tap.
              </p>
            </div>
            <div className="bg-[#030303] p-10 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors duration-300">
              <div className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em]">
                03
              </div>
              <h3 className="font-anton text-2xl text-[#f4f4f5] leading-tight mt-2">
                Live Price Data
              </h3>
              <p className="text-[#444444] text-sm font-sans leading-relaxed mt-1">
                Top 20 coins updated every 5 minutes. Market context alongside
                every story.
              </p>
            </div>
            <div className="bg-[#030303] p-10 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors duration-300">
              <div className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em]">
                04
              </div>
              <h3 className="font-anton text-2xl text-[#f4f4f5] leading-tight mt-2">
                Solana Speed
              </h3>
              <p className="text-[#444444] text-sm font-sans leading-relaxed mt-1">
                Instant settlements on Solana mainnet. The fastest prediction
                layer in crypto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="download"
        className="w-full bg-black py-40 px-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-glow-bottom opacity-70 pointer-events-none" />

        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center relative z-10">
          <div className="flex items-center gap-2.5 mb-6">
            <Image
              src="/logo.png"
              alt="Midnight"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <span className="text-2xl font-brand font-medium tracking-tight text-[#f4f4f5]">
              Midnight
            </span>
          </div>

          <h2 className="text-6xl md:text-8xl font-anton leading-[0.92] text-[#f4f4f5]">
            The information edge.
          </h2>
          <h2 className="text-6xl md:text-8xl font-anton leading-[0.92] text-[#555555] mb-8">
            Delivered.
          </h2>

          <p className="text-[#555555] text-sm font-sans leading-relaxed max-w-xs mb-10">
            Crypto alpha in 60 words. One tap to take a position.
          </p>

          {/* TODO: swap href to Typeform waitlist URL */}
          <a
            href="#"
            className="bg-[#4C8BD0] text-white font-sans font-medium text-sm py-4 px-10 rounded-full hover:bg-[#5a9de0] active:scale-[0.97] transition-[transform,background-color] duration-150 shadow-[0_0_40px_rgba(76,139,208,0.15)]"
          >
            Join Waitlist →
          </a>

          <p className="mt-8 font-mono text-[8px] text-[#333333] uppercase tracking-[0.18em]">
            No wallet required to read · Live on Solana
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#030303] border-t border-white/[0.04] pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          {/* Row 1 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Midnight"
                width={24}
                height={24}
                className="rounded-lg"
              />
              <span className="text-sm font-brand font-medium tracking-tight text-[#f4f4f5]">
                Midnight
              </span>
            </div>

            <div className="flex items-center gap-5">
              <a
                href="/terms"
                className="text-[#555555] text-xs font-sans hover:text-[#f4f4f5] transition-colors"
              >
                Terms
              </a>
              <a
                href="/privacy"
                className="text-[#555555] text-xs font-sans hover:text-[#f4f4f5] transition-colors"
              >
                Privacy
              </a>
            </div>

            <a
              href="#"
              className="w-9 h-9 rounded-full border border-white/[0.07] flex items-center justify-center text-[#444444] hover:text-[#f4f4f5] hover:border-white/[0.14] transition-colors"
              aria-label="X (Twitter)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.622 5.905-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>

          {/* Row 2 */}
          <div className="border-t border-[#4C8BD0]/[0.07] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em]">
              © 2026 Midnight Tech. All rights reserved.
            </span>
            <div className="flex items-center gap-2 font-mono text-[8px] text-[#333333] uppercase tracking-[0.2em]">
              <div className="w-1.5 h-1.5 bg-[#00D4AA] rounded-full" />
              Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

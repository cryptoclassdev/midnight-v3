import Image from "next/image";
import PhoneMockup from "@/components/PhoneMockup";

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
              Midnight is a crypto news feed where every story is compressed to
              60 words. Swipe through the feed, form a view, and place on-chain
              predictions. All in one place.
            </p>

            {/* TODO: swap href to Typeform waitlist URL */}
            <a
              href="#"
              className="w-max bg-[#4C8BD0] text-white font-sans font-medium text-sm py-4 px-8 rounded-full hover:bg-[#5a9de0] active:scale-[0.97] transition-[transform,background-color] duration-150"
            >
              Join Waitlist
            </a>
          </div>

          {/* Right — Phone Mockup */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative mt-16 lg:mt-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[680px] bg-glow-top opacity-25 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[480px] bg-glow-center opacity-70 blur-[80px] rounded-full pointer-events-none" />
            <PhoneMockup />
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="w-full bg-[#030303] py-24 border-b border-white/[0.04]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <h2 className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#444444] mb-10">
            Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden">
            <div className="bg-[#030303] p-10 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors duration-300">
              <div className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em]">
                01
              </div>
              <h3 className="font-anton text-2xl text-[#f4f4f5] leading-tight mt-2">
                60-Word Stories
              </h3>
              <p className="text-[#444444] text-sm font-sans leading-relaxed mt-1">
              60-word articles. Only signal, zero fluff.
              </p>
            </div>
            <div className="bg-[#030303] p-10 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors duration-300">
              <div className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em]">
                02
              </div>
              <h3 className="font-anton text-2xl text-[#f4f4f5] leading-tight mt-2">
                Prediction Markets
              </h3>
              <p className="text-[#444444] text-sm font-sans leading-relaxed mt-1">
                Each story has a prediction market attached. Read a headline,
                Swipe to YES or NO.
              </p>
            </div>
            <div className="bg-[#030303] p-10 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors duration-300">
              <div className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em]">
                03
              </div>
              <h3 className="font-anton text-2xl text-[#f4f4f5] leading-tight mt-2">
                All Solana Wallets
              </h3>
              <p className="text-[#444444] text-sm font-sans leading-relaxed mt-1">
                Connect any Solana wallet to place predictions. Phantom,
                Backpack, Solflare, and more.
              </p>
            </div>
            <div className="bg-[#030303] p-10 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors duration-300">
              <div className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em]">
                04
              </div>
              <h3 className="font-anton text-2xl text-[#f4f4f5] leading-tight mt-2">
                Settles on Solana
              </h3>
              <p className="text-[#444444] text-sm font-sans leading-relaxed mt-1">
                Predictions settle on-chain.
              </p>
            </div>
          </div>
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
          <div className="border-t border-[#4C8BD0]/[0.07] pt-6">
            <span className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em]">
              © 2026 Midnight Tech. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

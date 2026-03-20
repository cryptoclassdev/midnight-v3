import Image from "next/image";
import Link from "next/link";

export default function TermsPage() {
  return (
    <>
      <nav className="w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-xl z-50 sticky top-0">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
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
          </Link>
          <Link
            href="/"
            className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#555555] hover:text-[#f4f4f5] transition-colors"
          >
            ← Back
          </Link>
        </div>
      </nav>

      <main className="w-full bg-[#030303] min-h-screen">
        <div className="max-w-2xl mx-auto px-6 md:px-8 py-24">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#444444]">
            Legal
          </span>
          <h1 className="font-anton text-5xl text-[#f4f4f5] mt-4 mb-16 leading-[0.92]">
            Terms of Service
          </h1>

          <div className="flex flex-col gap-12">
            <section>
              <h2 className="font-sans font-semibold text-sm text-[#f4f4f5] mb-3 tracking-tight">
                Using Midnight
              </h2>
              <p className="font-sans text-sm text-[#555555] leading-7">
                Midnight is a news feed and prediction market platform. By using
                the app you agree to read content for informational purposes,
                participate in on-chain prediction markets at your own
                discretion, and accept the inherent risks of interacting with
                blockchain protocols. You are responsible for any positions you
                open.
              </p>
            </section>

            <section>
              <h2 className="font-sans font-semibold text-sm text-[#f4f4f5] mb-3 tracking-tight">
                Prediction Markets
              </h2>
              <p className="font-sans text-sm text-[#555555] leading-7">
                Nothing on Midnight constitutes financial advice. Prediction
                markets are probabilistic tools, not investment guidance.
                Outcomes are determined by on-chain resolution mechanisms and
                are final once settled on Solana. Midnight does not control or
                guarantee the outcome of any market.
              </p>
            </section>

            <section>
              <h2 className="font-sans font-semibold text-sm text-[#f4f4f5] mb-3 tracking-tight">
                Your Account
              </h2>
              <p className="font-sans text-sm text-[#555555] leading-7">
                No account is required to read the feed. Wallet connection is
                optional and used solely to participate in prediction markets.
                Midnight is non-custodial — we never hold your funds. You
                retain full control of your wallet and private keys at all
                times.
              </p>
            </section>

            <section>
              <h2 className="font-sans font-semibold text-sm text-[#f4f4f5] mb-3 tracking-tight">
                Contact
              </h2>
              <p className="font-sans text-sm text-[#555555] leading-7">
                {/* TODO: replace with actual contact email/link */}
                Questions about these terms? Reach out at{" "}
                <a
                  href="#"
                  className="text-[#4C8BD0] hover:text-[#5a9de0] transition-colors"
                >
                  legal@midnight.so
                </a>
                .
              </p>
            </section>
          </div>

          <p className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.18em] mt-20">
            Last updated March 2026
          </p>
        </div>
      </main>
    </>
  );
}

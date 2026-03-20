import Image from "next/image";
import Link from "next/link";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <div className="flex flex-col gap-12">
            <section>
              <h2 className="font-sans font-semibold text-sm text-[#f4f4f5] mb-3 tracking-tight">
                What We Collect
              </h2>
              <p className="font-sans text-sm text-[#555555] leading-7">
                Midnight collects minimal data to operate the service: feed
                interaction signals (swipes, reads) used to improve content
                ranking, and basic analytics about app usage. No personally
                identifiable information is required to use the app. We do not
                require an email address, phone number, or real name.
              </p>
            </section>

            <section>
              <h2 className="font-sans font-semibold text-sm text-[#f4f4f5] mb-3 tracking-tight">
                What We Do Not Collect
              </h2>
              <p className="font-sans text-sm text-[#555555] leading-7">
                We do not sell your data to third parties. We do not run
                advertising tracking pixels. We do not share behavioral data
                with data brokers. Our business model is the product, not your
                attention sold to advertisers.
              </p>
            </section>

            <section>
              <h2 className="font-sans font-semibold text-sm text-[#f4f4f5] mb-3 tracking-tight">
                Wallet Addresses
              </h2>
              <p className="font-sans text-sm text-[#555555] leading-7">
                If you connect a wallet to place predictions, your public wallet
                address is used to submit on-chain transactions. Wallet
                addresses are public by the nature of blockchain infrastructure.
                Midnight does not attempt to link wallet addresses to personal
                identity, and we do not store private keys or seed phrases under
                any circumstances.
              </p>
            </section>

            <section>
              <h2 className="font-sans font-semibold text-sm text-[#f4f4f5] mb-3 tracking-tight">
                Contact
              </h2>
              <p className="font-sans text-sm text-[#555555] leading-7">
                {/* TODO: replace with actual contact email/link */}
                Privacy questions or data requests? Reach out at{" "}
                <a
                  href="#"
                  className="text-[#4C8BD0] hover:text-[#5a9de0] transition-colors"
                >
                  privacy@midnight.so
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

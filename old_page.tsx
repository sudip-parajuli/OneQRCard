import Link from "next/link";
import { PLAN_DETAILS } from "@/lib/types";
import { SITE } from "@/lib/config";

export default function HomePage() {
  return (
    <main>
      {/* Nav */}
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="font-semibold text-lg">{SITE.name}</div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-stone-600 hover:text-stone-900">
            Pricing
          </Link>
          <Link
            href="/create"
            className="bg-stone-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-stone-800"
          >
            Create your card
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight max-w-3xl mx-auto">
          {SITE.tagline}
        </h1>
        <p className="text-stone-500 mt-5 max-w-xl mx-auto text-lg">
          Replace paper business cards with a digital card guests scan to save
          your contact, follow your socials, and visit your site — all from
          one tap.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/create"
            className="bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800"
          >
            Create your card — Start Free!
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20 grid sm:grid-cols-3 gap-6">
        {[
          {
            title: "Save to contacts",
            desc: "One tap saves your number, WhatsApp, and email straight to their phone.",
          },
          {
            title: "All your socials",
            desc: "Website, Facebook, Instagram, TikTok, YouTube — every link opens the right app.",
          },
          {
            title: "Your own subdomain",
            desc: `yourname.${SITE.domain} — printed as a QR code on your card.`,
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white border border-stone-200 rounded-2xl p-6"
          >
            <div className="font-semibold mb-2">{f.title}</div>
            <div className="text-sm text-stone-500 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </section>

      {/* How It Works Mockups */}
      <section className="max-w-5xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-2xl font-semibold mb-2">How it works</h2>
        <p className="text-stone-500 mb-12 max-w-md mx-auto">
          See how seamless it is for clients and customers to connect with your business.
        </p>

        <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-center justify-center">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">Step 1 — Scan</div>
            <div className="w-[245px] h-[510px] bg-stone-950 rounded-[38px] p-2.5 shadow-2xl relative flex-shrink-0 border border-stone-800">
              <div className="w-full h-full bg-[#0b1a3a] rounded-[28px] overflow-hidden relative flex items-center justify-center">
                <div className="w-[150px] h-[150px] bg-white/5 border-2 border-white/30 rounded-2xl relative">
                  <div className="absolute -top-[2px] -left-[2px] w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute -top-[2px] -right-[2px] w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute -bottom-[2px] -left-[2px] w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute -bottom-[2px] -right-[2px] w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                  <div className="absolute top-1/2 left-2 right-2 h-[2px] bg-blue-500 animate-pulse"></div>
                </div>
                <div className="absolute bottom-6 left-0 right-0 text-center text-white/70 text-xs px-4">
                  Point camera at QR code
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Arrow */}
          <div className="hidden md:flex items-center justify-center text-stone-300 text-2xl h-[510px] pt-8">
            <i className="ti ti-arrow-right" aria-hidden="true"></i>
          </div>
          {/* Mobile Arrow */}
          <div className="flex md:hidden items-center justify-center text-stone-300 text-xl py-2">
            <i className="ti ti-arrow-down" aria-hidden="true"></i>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">Step 2 — Card Opens</div>
            <div className="w-[245px] h-[510px] bg-stone-950 rounded-[38px] p-2.5 shadow-2xl relative flex-shrink-0 border border-stone-800">
              <div className="w-full h-full rounded-[28px] overflow-hidden relative bg-gradient-to-b from-[#2b5bdb] to-[#6e96ee]">
                <div className="pt-6 px-4 pb-14 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#cc2222] border-2 border-[#f0c14b] flex items-center justify-center mx-auto mb-2 text-[8px] font-bold text-white tracking-widest leading-none">EASYMOTO</div>
                  <div className="font-bold text-white text-sm leading-tight">Easymoto</div>
                  <div className="text-[10px] text-blue-100 mt-1 leading-normal">Convenient ride for every adventures</div>
                </div>

                <div className="absolute top-[138px] left-0 right-0 bottom-0 bg-white rounded-t-3xl p-4 overflow-y-auto scrollbar-none">
                  <div className="flex flex-col gap-2">
                    <div className="py-2 bg-[#2b5bdb] text-white rounded-xl text-center text-[11px] font-semibold shadow-sm">
                      Save to contacts
                    </div>
                    <div className="py-1.5 bg-white border border-[#2b5bdb] text-[#2b5bdb] rounded-xl text-center text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-blue-50/50 transition-colors">
                      <i className="ti ti-download text-xs" aria-hidden="true"></i>
                      Download business card
                    </div>
                    <div className="py-1.5 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl px-2.5 flex items-center gap-2 text-[10px] font-semibold">
                      <i className="ti ti-star text-amber-500 text-xs" aria-hidden="true"></i>
                      Review us on Google
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border border-stone-100 rounded-xl text-[10px] text-stone-850 font-medium bg-stone-50/50">
                      <i className="ti ti-phone text-stone-400 text-xs" aria-hidden="true"></i>
                      Call — 98XXXXXXXX
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border border-stone-100 rounded-xl text-[10px] text-stone-850 font-medium bg-stone-50/50">
                      <i className="ti ti-brand-whatsapp text-stone-400 text-xs" aria-hidden="true"></i>
                      WhatsApp
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border border-stone-100 rounded-xl text-[10px] text-stone-850 font-medium bg-stone-50/50">
                      <i className="ti ti-world text-stone-400 text-xs" aria-hidden="true"></i>
                      Website
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border border-stone-100 rounded-xl text-[10px] text-stone-850 font-medium bg-stone-50/50">
                      <i className="ti ti-brand-facebook text-stone-400 text-xs" aria-hidden="true"></i>
                      Facebook
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border border-stone-100 rounded-xl text-[10px] text-stone-850 font-medium bg-stone-50/50">
                      <i className="ti ti-brand-instagram text-stone-400 text-xs" aria-hidden="true"></i>
                      Instagram
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Arrow */}
          <div className="hidden md:flex items-center justify-center text-stone-300 text-2xl h-[510px] pt-8">
            <i className="ti ti-arrow-right" aria-hidden="true"></i>
          </div>
          {/* Mobile Arrow */}
          <div className="flex md:hidden items-center justify-center text-stone-300 text-xl py-2">
            <i className="ti ti-arrow-down" aria-hidden="true"></i>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">Step 3 — Saved</div>
            <div className="w-[245px] h-[510px] bg-stone-950 rounded-[38px] p-2.5 shadow-2xl relative flex-shrink-0 border border-stone-800">
              <div className="w-full h-full bg-[#f5f5f5] rounded-[28px] overflow-hidden flex flex-col pt-8">
                <div className="text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-[#cc2222] border-2 border-[#f0c14b] flex items-center justify-center mx-auto mb-2 text-[8px] font-bold text-white tracking-widest leading-none">EASYMOTO</div>
                  <div className="text-sm font-semibold text-stone-900 leading-tight">Easymoto</div>
                  <div className="text-[10px] text-stone-400 mb-4">New contact</div>
                </div>
                <div className="bg-white rounded-2xl mx-4 py-1 flex-1 border border-stone-200/50 shadow-sm text-[10px]">
                  <div className="flex justify-between items-center py-2.5 px-3 border-b border-stone-100">
                    <span className="text-stone-400">mobile</span>
                    <span className="text-stone-900 font-medium">98XXXXXXXX</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 px-3 border-b border-stone-100">
                    <span className="text-stone-400">whatsapp</span>
                    <span className="text-stone-900 font-medium">+977 98XXXXXXXX</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 px-3">
                    <span className="text-stone-400">website</span>
                    <span className="text-blue-600 font-medium">easymoto.com.np</span>
                  </div>
                </div>
                <div className="m-4 p-2.5 bg-[#2b5bdb] text-white rounded-xl text-center text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5">
                  <i className="ti ti-check text-sm" aria-hidden="true"></i>
                  Contact saved
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branded QR & Printed Cards Section */}
      <section className="bg-stone-100 border-y border-stone-200/80 py-20 my-12">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h2 className="text-3xl font-semibold tracking-tight text-stone-900 mb-4">
              Branded QR Codes &amp; Printed Cards
            </h2>
            <p className="text-stone-500 mb-6 leading-relaxed text-sm">
              Every digital card comes with a custom QR code embedded with your logo. Plus, generate a professional, print-ready physical business card in one click.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center flex-shrink-0 text-xs mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm">Logo-embedded QR Codes</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Custom brand colors and logo inside the QR code itself.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center flex-shrink-0 text-xs mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm">300 DPI Print-Ready Layout</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Standard 3.5" x 2" sizing with background watermarks and custom themes.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative h-[280px] sm:h-[320px] w-full flex items-center justify-center">
            {/* Business Card Mockup */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="absolute left-4 top-4 sm:left-8 sm:top-6 w-[72%] max-w-[380px] aspect-[1.75] shadow-2xl rounded-xl overflow-hidden border border-stone-200/60 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <img
                src="/business_card_mockup.png"
                alt="Printed Business Card Mockup"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* QR Code Mockup */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-6 w-[36%] max-w-[180px] aspect-square shadow-2xl rounded-2xl p-3 bg-white border border-stone-200/60 transform rotate-6 hover:rotate-0 transition-transform duration-300">
              <img
                src="/qr_mockup.png"
                alt="Branded QR Code"
                className="w-full h-full object-contain rounded-lg border border-stone-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-semibold text-center mb-2">
          One-time payment. Lifetime hosting.
        </h2>
        <p className="text-stone-500 text-center mb-10">
          No subscriptions — pay once, use it forever.
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {Object.entries(PLAN_DETAILS).map(([id, plan]) => (
            <div
              key={id}
              className={`rounded-2xl p-6 border ${
                id === "pro"
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white"
              }`}
            >
              <div className="font-semibold text-lg mb-1">{plan.name}</div>
              <div className="text-2xl font-semibold mb-4">
                Rs {plan.priceNPR.toLocaleString()} / ${plan.priceUSD}
                <span className="text-sm font-normal opacity-60"> one-time</span>
              </div>
              <ul className="text-sm space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="opacity-50">—</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/create?plan=${id}`}
                className={`block text-center py-2.5 rounded-lg font-medium text-sm ${
                  id === "pro"
                    ? "bg-white text-stone-900"
                    : "bg-stone-900 text-white"
                }`}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-5xl mx-auto px-6 py-10 text-center text-sm text-stone-400 border-t border-stone-200">
        {SITE.name} — questions?{" "}
        <a href={`mailto:${SITE.supportEmail}`} className="underline">
          {SITE.supportEmail}
        </a>
      </footer>
    </main>
  );
}

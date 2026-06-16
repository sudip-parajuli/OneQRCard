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

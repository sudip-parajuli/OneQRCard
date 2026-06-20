import Link from "next/link";
import PricingCards from "@/components/PricingCards";
import { SITE } from "@/lib/config";

export default function PricingPage() {
  const faqs = [
    {
      q: "Does the QR code change if I edit my card?",
      a: "Never. Your QR code is permanent. Edit your info as many times as you want — the same QR code always opens your updated card, with no need to reprint anything."
    },
    {
      q: "What happens after the 15-day free trial?",
      a: "Your card goes read-only — it still shows to customers who scan it, but with a small upgrade watermark at the bottom. Your QR code still works. You can upgrade anytime to unlock editing and remove the banner."
    },
    {
      q: "What is a \"team card\"?",
      a: "If you run a business with staff, each person gets their own card under your main workspace — with their own contact details, role, and details, but inheriting your shared brand color and logo. Pro includes 1 extra team card (2 slots total); Business includes 4 extra team cards (5 slots total)."
    },
    {
      q: "What does \"subdomain coming soon\" mean?",
      a: "Currently, profiles are hosted at one-qr-card.vercel.app/card/yourname. When we launch our custom domain features (coming soon), Pro and Business users can move to yourname.one-qr-card.com automatically. The same QR code will continue to work seamlessly during and after the switch."
    },
    {
      q: "Can I pay in NPR?",
      a: "Yes. We accept eSewa and Khalti for NPR payments, as well as Stripe and credit cards for USD payments. Standard payment gateway verification takes just a few minutes."
    },
    {
      q: "Do I need to create an account?",
      a: "No password needed. Just enter your email when creating your card. Whenever you want to edit your card or view your CRM inbox, enter your email on the /edit page and we will send you a passwordless magic login link."
    }
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900 font-medium">
        &larr; Back home
      </Link>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-6 mb-2 text-stone-900">Pricing Plans</h1>
      <p className="text-stone-500 mb-10 text-sm sm:text-base max-w-xl">
        Every plan is a single, one-time payment — no recurring fees, no subscription anxiety. Your profile stays online for life.
      </p>

      <PricingCards />

      {/* Payment methods footer */}
      <div className="mt-12 text-sm text-stone-500 max-w-2xl bg-white border border-stone-250/60 p-5 rounded-2xl shadow-xs">
        <p className="mb-2">
          <strong className="text-stone-700">Payment methods:</strong> eSewa,
          Khalti, bank transfer (for NPR) and Stripe / card payments (for USD). Your card goes live as soon as
          payment is confirmed — usually within a few minutes.
        </p>
        <p>
          Need a custom theme, multiple cards for a whole team, or printed NFC
          cards? Message us on WhatsApp after checkout and we&apos;ll set it up.
        </p>
      </div>

      {/* FAQ Section */}
      <section className="mt-20 max-w-3xl">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Frequently Asked Questions</h2>
        <p className="text-stone-500 text-sm mb-8">
          Have questions about billing, subdomains, or editing? We have answers.
        </p>

        <div className="bg-white border border-stone-200 rounded-3xl divide-y divide-stone-200/80 shadow-xs overflow-hidden">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group py-5 px-6" open={idx === 0}>
              <summary className="font-bold text-stone-900 text-sm sm:text-base cursor-pointer flex justify-between items-center hover:text-brand transition-colors focus:outline-none list-none [&::-webkit-details-marker]:hidden">
                <span>{faq.q}</span>
                <span className="transition-transform duration-300 group-open:rotate-180 text-stone-400 group-hover:text-brand shrink-0 ml-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </summary>
              <p className="text-stone-500 mt-3 text-xs sm:text-sm leading-relaxed max-w-2xl">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

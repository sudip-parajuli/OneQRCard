import Link from "next/link";
import { PLAN_DETAILS } from "@/lib/types";

export default function PricingPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← Back home
      </Link>
      <h1 className="text-3xl font-semibold mt-6 mb-2">Pricing</h1>
      <p className="text-stone-500 mb-10">
        Every plan is a single, one-time payment — no recurring fees, no
        subscriptions. Your card stays online for life.
      </p>

      <div className="grid sm:grid-cols-3 gap-6">
        {Object.entries(PLAN_DETAILS).map(([id, plan]) => (
          <div
            key={id}
            className={`rounded-2xl p-6 border flex flex-col ${
              id === "pro"
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white"
            }`}
          >
            <div className="font-semibold text-lg mb-1">{plan.name}</div>
            <div className="text-3xl font-semibold mb-1">
              Rs {plan.priceNPR.toLocaleString()} / ${plan.priceUSD}
            </div>
            <div
              className={`text-xs mb-5 ${
                id === "pro" ? "opacity-60" : "text-stone-400"
              }`}
            >
              one-time payment
            </div>
            <ul className="text-sm space-y-2.5 mb-8 flex-1">
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

      <div className="mt-12 text-sm text-stone-500 max-w-2xl">
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
    </main>
  );
}

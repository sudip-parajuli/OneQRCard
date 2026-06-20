"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardData, PLAN_DETAILS } from "@/lib/types";
import Image from "next/image";

interface CheckoutClientProps {
  card: CardData;
  initialProvider?: "esewa" | "khalti" | "stripe";
}

export default function CheckoutClient({ card, initialProvider }: CheckoutClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"esewa" | "khalti" | "stripe">(
    initialProvider === "khalti" || initialProvider === "stripe" ? initialProvider : "esewa"
  );
  const [txnId, setTxnId] = useState("");
  const [senderWallet, setSenderWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planInfo = PLAN_DETAILS[card.plan];
  const priceNPR = planInfo?.priceNPR || 0;
  const priceUSD = planInfo?.priceUSD || 0;

  // Read personal stripe checkout links from env
  const stripeProLink = process.env.NEXT_PUBLIC_USD_PAYMENT_LINK_PRO || "https://stripe.com/";
  const stripeBusinessLink = process.env.NEXT_PUBLIC_USD_PAYMENT_LINK_BUSINESS || "https://stripe.com/";
  const stripeLink = card.plan === "pro" ? stripeProLink : stripeBusinessLink;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!txnId.trim() || !senderWallet.trim()) {
      setError("Please fill in both Transaction ID and Sender details.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/payment/submit-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          txn_id: txnId,
          sender_wallet: senderWallet,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Submission failed");
      }

      // Redirect to success page showing pending validation status
      router.push(`/payment/success?provider=manual&slug=${card.slug}&cardId=${card.id}`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-stone-200/60 p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Checkout</h1>
          <p className="text-xs text-stone-500 mt-1">Activate your paid digital business card</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200/50 p-4 mb-6 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200/50">
            <span className="text-stone-500 font-medium">Business Card</span>
            <span className="font-semibold text-stone-900">{card.business_name}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-stone-500 font-medium">Plan Tier ({card.plan.toUpperCase()})</span>
            <span className="font-semibold text-stone-900">
              Rs. {priceNPR.toLocaleString()} / ${priceUSD}
            </span>
          </div>
        </div>

        {/* Tabs selector */}
        <div className="grid grid-cols-3 bg-stone-100 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab("esewa")}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              tab === "esewa"
                ? "bg-white text-emerald-800 shadow-sm border border-emerald-100"
                : "text-stone-500 hover:text-stone-950"
            }`}
          >
            eSewa (QR)
          </button>
          <button
            type="button"
            onClick={() => setTab("khalti")}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              tab === "khalti"
                ? "bg-white text-purple-800 shadow-sm border border-purple-100"
                : "text-stone-500 hover:text-stone-950"
            }`}
          >
            Khalti (QR)
          </button>
          <button
            type="button"
            onClick={() => setTab("stripe")}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              tab === "stripe"
                ? "bg-white text-indigo-800 shadow-sm border border-indigo-100"
                : "text-stone-500 hover:text-stone-950"
            }`}
          >
            USD Stripe
          </button>
        </div>

        {/* Payment Guidelines depending on Tab */}
        <div className="bg-stone-50/50 rounded-2xl border border-stone-200/50 p-5 mb-6 text-center flex flex-col items-center justify-center">
          {tab === "esewa" && (
            <>
              <p className="text-xs text-stone-500 mb-4 font-medium leading-relaxed">
                Scan using eSewa to transfer <span className="font-bold text-emerald-700">Rs. {priceNPR.toLocaleString()}</span>.
              </p>
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm max-w-[200px] w-full">
                <img
                  src="/esewa_qr.png"
                  alt="eSewa Payment QR Code"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </>
          )}

          {tab === "khalti" && (
            <>
              <p className="text-xs text-stone-500 mb-4 font-medium leading-relaxed">
                Scan using Khalti to transfer <span className="font-bold text-purple-700">Rs. {priceNPR.toLocaleString()}</span>.
              </p>
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm max-w-[200px] w-full">
                <img
                  src="/khalti_qr.png"
                  alt="Khalti Payment QR Code"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </>
          )}

          {tab === "stripe" && (
            <>
              <p className="text-xs text-stone-500 mb-5 font-medium leading-relaxed">
                Click below to pay <span className="font-bold text-indigo-700">${priceUSD} USD</span> securely via card. Khalti will route the remittance directly to our wallet.
              </p>
              <a
                href={stripeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-sm transition-all cursor-pointer w-full mb-2"
              >
                Pay via International Stripe Card
              </a>
              <span className="text-[10px] text-stone-400">Opens in a new tab</span>
            </>
          )}
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="txnId" className="block text-xs font-semibold text-stone-600 mb-1">
              Transaction ID (Txn ID) / Receipt Number
            </label>
            <input
              id="txnId"
              type="text"
              required
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              placeholder="e.g. 5D8A9X2J1"
              className="input font-medium"
            />
          </div>

          <div>
            <label htmlFor="senderWallet" className="block text-xs font-semibold text-stone-600 mb-1">
              Sender Wallet Name / Phone / Email
            </label>
            <input
              id="senderWallet"
              type="text"
              required
              value={senderWallet}
              onChange={(e) => setSenderWallet(e.target.value)}
              placeholder="e.g. Ram Bahadur (9860000000)"
              className="input font-medium"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-medium rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting details...
              </>
            ) : (
              "Submit Payment for Verification"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

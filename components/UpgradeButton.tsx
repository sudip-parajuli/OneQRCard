"use client";

import { useState } from "react";
import { PLAN_DETAILS, PlanId } from "@/lib/types";

interface UpgradeButtonProps {
  cardId: string;
  currentPlan: PlanId;
  defaultCountry?: string;
}

export default function UpgradeButton({ cardId, currentPlan, defaultCountry }: UpgradeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<PlanId | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<"esewa" | "stripe">(
    defaultCountry === "NP" ? "esewa" : "stripe"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentPlan === "business") return null;

  // Available upgrades
  const upgrades: { id: PlanId; label: string }[] = [];
  if (currentPlan === "basic") {
    upgrades.push({ id: "pro", label: "Upgrade to Pro" });
    upgrades.push({ id: "business", label: "Upgrade to Business" });
  } else if (currentPlan === "pro") {
    upgrades.push({ id: "business", label: "Upgrade to Business" });
  }

  // Calculate pricing difference
  const currentPriceNPR = PLAN_DETAILS[currentPlan].priceNPR;
  const currentPriceUSD = PLAN_DETAILS[currentPlan].priceUSD;

  function getPriceDifference(plan: PlanId) {
    const diffNPR = PLAN_DETAILS[plan].priceNPR - currentPriceNPR;
    const diffUSD = PLAN_DETAILS[plan].priceUSD - currentPriceUSD;
    return { npr: diffNPR, usd: diffUSD };
  }

  async function handleUpgradeSubmit() {
    if (!targetPlan) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          targetPlan,
          paymentProvider,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to initiate upgrade checkout.");
      }

      if (paymentProvider === "stripe") {
        window.location.href = result.url;
      } else {
        // eSewa Form submit
        const form = document.createElement("form");
        form.method = "POST";
        form.action = result.esewaUrl;
        Object.entries(result.fields).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
      <div className="flex-1">
        <h3 className="font-semibold text-amber-900 text-base">Unlock premium capabilities</h3>
        <p className="text-xs text-amber-700 mt-1 max-w-xl">
          Upgrade your plan today. You will only pay the price difference. Unlocks custom themes, custom subdomains, multiple user support, and more!
        </p>
      </div>
      <div>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setTargetPlan(upgrades[0]?.id || null);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center cursor-pointer w-full md:w-auto"
        >
          🚀 Upgrade Plan
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 overflow-hidden shadow-2xl p-6">
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-stone-900">Upgrade Card Plan</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                }}
                className="text-stone-400 hover:text-stone-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </header>

            <div className="space-y-6">
              {/* Select Upgrade Option */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Select New Plan
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {upgrades.map((up) => {
                    const diff = getPriceDifference(up.id);
                    const selected = targetPlan === up.id;
                    return (
                      <button
                        key={up.id}
                        onClick={() => setTargetPlan(up.id)}
                        className={`text-left p-4 rounded-2xl border transition-all ${
                          selected
                            ? "border-amber-600 bg-amber-50 ring-2 ring-amber-600"
                            : "border-stone-200 bg-white hover:border-stone-300"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-stone-950 text-sm">
                            {PLAN_DETAILS[up.id].name}
                          </span>
                          <span className="text-xs font-bold text-amber-700">
                            Pay Rs {diff.npr.toLocaleString()} / ${diff.usd}
                          </span>
                        </div>
                        <ul className="text-[10px] text-stone-500 mt-2 space-y-1">
                          {PLAN_DETAILS[up.id].features.slice(0, 2).map((feat, i) => (
                            <li key={i}>• {feat}</li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Payment Method */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentProvider("esewa")}
                    className={`py-3 px-2 text-center rounded-xl border text-xs font-medium transition-all ${
                      paymentProvider === "esewa"
                        ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600 text-emerald-950"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    eSewa / NPR
                  </button>
                  <button
                    onClick={() => setPaymentProvider("stripe")}
                    className={`py-3 px-2 text-center rounded-xl border text-xs font-medium transition-all ${
                      paymentProvider === "stripe"
                        ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 text-indigo-950"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    Card / USD
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

              <button
                onClick={handleUpgradeSubmit}
                disabled={loading || !targetPlan}
                className="w-full bg-stone-950 hover:bg-stone-900 text-white font-semibold text-sm py-3.5 rounded-2xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

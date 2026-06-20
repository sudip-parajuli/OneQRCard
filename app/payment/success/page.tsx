"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");
  const [cardSlug, setCardSlug] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const provider = params.get("provider");
    const cardId = params.get("cardId");
    const slugParam = params.get("slug");

    if (slugParam) {
      setCardSlug(slugParam);
    }

    if (provider === "free") {
      setPlan("basic");
      setStatus("ok");
      return;
    }

    if (!cardId) {
      if (slugParam) {
        setStatus("ok");
      } else {
        setStatus("error");
      }
      return;
    }

    let attempts = 0;
    const maxAttempts = provider === "stripe" ? 12 : 1;

    const checkStatus = () => {
      fetch(`/api/payment/status?cardId=${cardId}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.slug) {
            setCardSlug(res.slug);
          }
          if (res.plan) {
            setPlan(res.plan);
          }
          if (res.workspaceId) {
            setWorkspaceId(res.workspaceId);
          }

          if (provider === "stripe") {
            if (res.status === "paid") {
              setStatus("ok");
              clearInterval(interval);
            } else if (attempts >= maxAttempts) {
              setStatus("error");
              clearInterval(interval);
            }
          } else {
            setStatus("ok");
            clearInterval(interval);
          }
        })
        .catch(() => {
          if (attempts >= maxAttempts) {
            setStatus("error");
            clearInterval(interval);
          }
        });
    };

    attempts++;
    checkStatus();

    let interval: any;
    if (provider === "stripe") {
      interval = setInterval(() => {
        attempts++;
        checkStatus();
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [params]);

  const provider = params.get("provider");

  return (
    <main className="max-w-md mx-auto px-6 py-24 text-center">
      {status === "checking" && (
        <>
          <h1 className="text-xl font-semibold mb-2 text-stone-900">Confirming your payment…</h1>
          <p className="text-stone-500 text-sm">This usually takes a few seconds.</p>
        </>
      )}
      {status === "ok" && cardSlug && (
        <>
          <h1 className="text-2xl font-bold mb-2 text-stone-900">
            {provider === "free"
              ? "Card created successfully! 🎉"
              : provider === "manual"
              ? "Verification Pending ⏳"
              : "Payment successful 🎉"}
          </h1>
          <p className="text-stone-500 mb-6 text-sm leading-relaxed">
            {provider === "free"
              ? "Your free digital card is now live."
              : provider === "manual"
              ? "We have received your payment details. Once verified by our admin, your card will be activated (usually within 15-30 minutes)."
              : "Your digital card is now live and active."}
          </p>

          {/* Lifetime Add Teammate Card Callout */}
          {plan === "business" && workspaceId && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-6 text-center max-w-sm mx-auto shadow-sm">
              <h3 className="font-bold text-purple-950 text-sm mb-1">🎉 Lifetime Plan Active!</h3>
              <p className="text-xs text-purple-700 leading-relaxed mb-4">
                You have unlocked 1 primary card + 4 team cards (5 slots total). Would you like to create a team card for a colleague right now?
              </p>
              <Link
                href={`/create?workspaceId=${workspaceId}`}
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all"
              >
                + Add Team Card Now
              </Link>
            </div>
          )}

          {/* Bookmark Link Callout for Self-Edit */}
          {provider !== "free" && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-6 text-xs text-stone-600 space-y-1 text-center max-w-sm mx-auto">
              <span className="font-bold text-stone-900 block">💡 Bookmark the Card Manager</span>
              <p className="leading-relaxed">
                Bookmark{" "}
                <Link href="/edit" className="underline font-semibold text-brand hover:text-brand-hover">
                  allscan.app/edit
                </Link>{" "}
                to access your card manager dashboard and update your details anytime.
              </p>
            </div>
          )}

          {provider === "manual" && (
            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-5 mb-6 text-xs text-stone-600 space-y-3 text-left max-w-sm mx-auto shadow-sm">
              <p className="font-semibold text-stone-900 text-sm">Want to speed up activation?</p>
              <p className="leading-relaxed">Directly inform us after paying to get approved instantly:</p>
              <div className="flex flex-col gap-2 pt-1 font-semibold">
                <a
                  href={`https://wa.me/9779866243388?text=Hello%2C%20I%20have%20submitted%20the%20payment%20verification%20details%20for%20my%20digital%20card%20(slug%3A%20${cardSlug}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  💬 Chat on WhatsApp (9866243388)
                </a>
                <a
                  href={`mailto:sparajuli802@gmail.com?subject=OneQRCard%20Payment%20Verification&body=Hello%2C%20I%20have%20submitted%20the%20payment%20verification%20details%20for%20my%20digital%20card%20(slug%3A%20${cardSlug}).`}
                  className="inline-flex items-center gap-1.5 text-stone-850 hover:text-stone-950 transition-colors"
                >
                  ✉️ Email: sparajuli802@gmail.com
                </a>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href={`/card/${cardSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-block bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors text-sm shadow-sm"
            >
              {provider === "manual" ? "Preview your card" : "View your card"}
            </a>
            <Link
              href="/edit/dashboard"
              className="w-full sm:w-auto inline-block bg-white border border-stone-200 text-stone-700 px-6 py-3 rounded-xl font-medium hover:bg-stone-50 transition-colors text-sm shadow-sm"
            >
              Go to Dashboard
            </Link>
          </div>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-xl font-semibold mb-2 text-stone-900">We couldn&apos;t confirm payment</h1>
          <p className="text-stone-500 mb-6 text-sm">
            If money was deducted, contact us on WhatsApp with your transaction
            ID or card email, and we&apos;ll activate your card manually.
          </p>
          <button
            onClick={() => router.push("/create")}
            className="text-sm text-stone-600 underline cursor-pointer"
          >
            Back to card creator
          </button>
        </>
      )}
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessInner />
    </Suspense>
  );
}

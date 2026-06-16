"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentSuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");
  const [cardSlug, setCardSlug] = useState<string | null>(null);

  useEffect(() => {
    const provider = params.get("provider");
    const cardId = params.get("cardId");

    if (provider === "free" || provider === "manual") {
      const slug = params.get("slug");
      if (slug) {
        setCardSlug(slug);
        setStatus("ok");
      } else {
        setStatus("error");
      }
      return;
    }

    if (provider === "stripe") {
      if (!cardId) {
        setStatus("error");
        return;
      }

      let attempts = 0;
      const maxAttempts = 12; // 12 * 1.5s = 18s max polling time
      const interval = setInterval(() => {
        attempts++;
        fetch(`/api/payment/status?cardId=${cardId}`)
          .then((r) => r.json())
          .then((res) => {
            if (res.status === "paid" && res.slug) {
              clearInterval(interval);
              setCardSlug(res.slug);
              setStatus("ok");
            } else if (attempts >= maxAttempts) {
              clearInterval(interval);
              setStatus("error");
            }
          })
          .catch(() => {
            if (attempts >= maxAttempts) {
              clearInterval(interval);
              setStatus("error");
            }
          });
      }, 1500);

      return () => clearInterval(interval);
    } else {
      // Legacy eSewa flow
      const data = params.get("data");
      if (!cardId || !data) {
        setStatus("error");
        return;
      }

      try {
        const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
        const verifyUrl = `/api/payment/verify?cardId=${cardId}&total_amount=${decoded.total_amount}&transaction_uuid=${decoded.transaction_uuid}`;

        fetch(verifyUrl)
          .then((r) => r.json())
          .then((res) => {
            if (res.verified && res.card) {
              setCardSlug(res.card.slug);
              setStatus("ok");
            } else {
              setStatus("error");
            }
          })
          .catch(() => setStatus("error"));
      } catch {
        setStatus("error");
      }
    }
  }, [params]);

  return (
    <main className="max-w-md mx-auto px-6 py-24 text-center">
      {status === "checking" && (
        <>
          <h1 className="text-xl font-semibold mb-2">Confirming your payment…</h1>
          <p className="text-stone-500 text-sm">This usually takes a few seconds.</p>
        </>
      )}
      {status === "ok" && cardSlug && (
        <>
          <h1 className="text-2xl font-semibold mb-2">
            {params.get("provider") === "free"
              ? "Card created successfully! 🎉"
              : params.get("provider") === "manual"
              ? "Verification Pending ⏳"
              : "Payment successful 🎉"}
          </h1>
          <p className="text-stone-500 mb-6 text-sm">
            {params.get("provider") === "free"
              ? "Your free digital card is now live."
              : params.get("provider") === "manual"
              ? "We have received your payment details. Once verified by our admin, your card will be activated (usually within 15-30 minutes)."
              : "Your digital card is now live and active."}
          </p>

          {params.get("provider") === "manual" && (
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
                  className="inline-flex items-center gap-1.5 text-stone-800 hover:text-stone-950 transition-colors"
                >
                  ✉️ Email: sparajuli802@gmail.com
                </a>
              </div>
            </div>
          )}

          <a
            href={`/card/${cardSlug}`}
            className="inline-block bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors"
          >
            {params.get("provider") === "manual" ? "Preview your card" : "View your card"}
          </a>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-xl font-semibold mb-2">We couldn&apos;t confirm payment</h1>
          <p className="text-stone-500 mb-6 text-sm">
            If money was deducted, contact us on WhatsApp with your transaction
            ID or card email, and we&apos;ll activate your card manually.
          </p>
          <button
            onClick={() => router.push("/create")}
            className="text-sm text-stone-600 underline"
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

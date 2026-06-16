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
          <h1 className="text-2xl font-semibold mb-2">Payment successful 🎉</h1>
          <p className="text-stone-500 mb-6 text-sm">Your digital card is now live and active.</p>
          <a
            href={`/card/${cardSlug}`}
            className="inline-block bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors"
          >
            View your card
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

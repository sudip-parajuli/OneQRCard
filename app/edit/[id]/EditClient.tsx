"use client";

import { useState } from "react";
import CardForm from "@/components/CardForm";
import UpgradeButton from "@/components/UpgradeButton";
import ScanAnalytics from "@/components/ScanAnalytics";
import InboxCRM from "@/components/InboxCRM";
import { CardData } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EditClientProps {
  initialData: CardData;
}

export default function EditClient({ initialData }: EditClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleEditSubmit(updatedData: CardData) {
    setSubmitting(true);
    setSubmitError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/cards/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to update card details");
      }

      setSuccess(true);
      router.refresh();
      // Scroll to top to show success banner
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/edit/dashboard"
          className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          ← Back to dashboard
        </Link>
        {initialData.payment_status === "paid" && (
          <a
            href={
              initialData.subdomain
                ? `https://${initialData.slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || "yourcard.app"}`
                : `/card/${initialData.slug}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 border border-stone-200 py-1.5 px-3 rounded-lg text-stone-700 transition-colors"
          >
            View live card
          </a>
        )}
      </div>

      <h1 className="text-3xl font-semibold tracking-tight mb-1">Edit your card</h1>
      <p className="text-stone-500 mb-8 text-sm">
        Modify your card details, themes, and social links. Changes are reflected live immediately.
      </p>

      {success && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-2xl mb-8 flex justify-between items-center animate-fade-in">
          <div>
            <h3 className="font-semibold text-sm">Changes saved successfully!</h3>
            <p className="text-xs opacity-90 mt-0.5">Your live digital business card has been updated.</p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="text-xs font-bold underline cursor-pointer text-emerald-900 hover:text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {initialData.id && (
        <ScanAnalytics cardId={initialData.id} plan={initialData.plan} />
      )}

      {initialData.id && (
        <InboxCRM cardId={initialData.id} plan={initialData.plan} />
      )}

      {initialData.payment_status === "paid" && (
        <div id="upgrade-section">
          <UpgradeButton
            cardId={initialData.id || ""}
            currentPlan={initialData.plan}
          />
        </div>
      )}

      <CardForm
        initialData={initialData}
        mode="edit"
        onSubmit={handleEditSubmit}
        submitting={submitting}
        submitError={submitError}
      />
    </main>
  );
}

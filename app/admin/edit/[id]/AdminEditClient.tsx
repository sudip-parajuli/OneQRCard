"use client";

import { useState } from "react";
import CardForm from "@/components/CardForm";
import { CardData } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminEditClientProps {
  initialData: CardData;
}

export default function AdminEditClient({ initialData }: AdminEditClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleAdminEditSubmit(updatedData: CardData) {
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
          href="/admin"
          className="text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          ← Back to Dashboard
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

      <h1 className="text-3xl font-semibold tracking-tight mb-1">Edit Card (Admin Mode)</h1>
      <p className="text-stone-500 mb-8 text-sm">
        Modify any client card configuration. You have super-admin privileges to override tiers, ownership, and activation status.
      </p>

      {success && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-2xl mb-8 flex justify-between items-center animate-fade-in">
          <div>
            <h3 className="font-semibold text-sm">Card updated successfully!</h3>
            <p className="text-xs opacity-90 mt-0.5">Your updates have been applied to this digital business card.</p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="text-xs font-bold underline cursor-pointer text-emerald-900 hover:text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

      <CardForm
        initialData={initialData}
        mode="edit"
        onSubmit={handleAdminEditSubmit}
        submitting={submitting}
        submitError={submitError}
        isAdmin={true}
      />
    </main>
  );
}

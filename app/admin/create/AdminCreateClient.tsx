"use client";

import { useState } from "react";
import CardForm from "@/components/CardForm";
import { CardData } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EMPTY: CardData = {
  slug: "",
  business_name: "",
  tagline: "",
  brand_color: "#085041",
  theme: "classic",
  logo_data_url: null,
  phone: "",
  whatsapp: "",
  website: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  youtube: "",
  email: "",
  plan: "basic",
  subdomain: null,
  payment_status: "paid", // Default to paid for cash payments
  owner_email: "",
  custom_links: [],
  address: "",
  design_settings: {
    vibe: null,
    bg_texture: "none",
    embossed_effect: false,
    alignment: "center",
    default_nav_tab: null,
    animation: "none",
  },
};

export default function AdminCreateClient() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleAdminSubmit(data: CardData) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          payment_status: "paid", // Ensure it is created active
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create card");

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/admin" className="text-xs font-semibold text-stone-500 hover:text-stone-900 underline">
          ← Back to Dashboard
        </Link>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight mb-1">Create Digital Card (Cash Payment)</h1>
      <p className="text-stone-500 mb-8 text-sm">
        Create a card of any plan for a client. Bypasses the payment gateway and activates instantly.
      </p>

      <CardForm
        initialData={EMPTY}
        mode="create"
        onSubmit={handleAdminSubmit}
        submitting={submitting}
        submitError={submitError}
      />
    </main>
  );
}

"use client";

import { Suspense, useState } from "react";
import CardForm from "@/components/CardForm";
import { CardData, PlanId } from "@/lib/types";
import { useSearchParams } from "next/navigation";

interface CreateClientProps {
  defaultCountry?: string;
}

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
  payment_status: "pending",
  owner_email: "",
};

function CreateClientInner({ defaultCountry }: CreateClientProps) {
  const params = useSearchParams();
  const initialPlan = (params.get("plan") as PlanId) || "basic";

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialData: CardData = {
    ...EMPTY,
    plan: initialPlan,
  };

  async function handleCreateSubmit(data: CardData, paymentProvider?: "esewa" | "stripe") {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Create the card record (pending payment)
      const createRes = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error || "Could not save card");

      // 2. Select payment method
      if (paymentProvider === "stripe") {
        // Stripe flow
        const stripeRes = await fetch("/api/payment/stripe/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId: created.card.id }),
        });
        const stripeSession = await stripeRes.json();
        if (!stripeRes.ok) throw new Error(stripeSession.error || "Could not start Stripe payment");

        // Redirect to Stripe checkout page
        window.location.href = stripeSession.url;
      } else {
        // eSewa flow
        const payRes = await fetch("/api/payment/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId: created.card.id }),
        });
        const pay = await payRes.json();
        if (!payRes.ok) throw new Error(pay.error || "Could not start payment");

        // Auto-submit a form to eSewa with the signed fields
        const form = document.createElement("form");
        form.method = "POST";
        form.action = pay.esewaUrl;
        Object.entries(pay.fields).forEach(([key, value]) => {
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
      setSubmitError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight mb-1">Create your digital card</h1>
      <p className="text-stone-500 mb-8 text-sm">
        Fill in your details, choose your preferred payment method, and activate your card instantly.
      </p>

      <CardForm
        initialData={initialData}
        mode="create"
        onSubmit={handleCreateSubmit}
        submitting={submitting}
        submitError={submitError}
        defaultCountry={defaultCountry}
      />
    </main>
  );
}

export default function CreateClient({ defaultCountry }: CreateClientProps) {
  return (
    <Suspense fallback={null}>
      <CreateClientInner defaultCountry={defaultCountry} />
    </Suspense>
  );
}

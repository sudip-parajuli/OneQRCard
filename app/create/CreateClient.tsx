"use client";

import { Suspense, useState, useEffect } from "react";
import CardForm from "@/components/CardForm";
import { CardData, PlanId } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";

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
  custom_links: [],
  address: "",
};

import { supabase } from "@/lib/supabase";

function CreateClientInner({ defaultCountry }: CreateClientProps) {
  const params = useSearchParams();
  const initialPlan = (params.get("plan") as PlanId) || "basic";
  const parentId = params.get("parent_id");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [parentCard, setParentCard] = useState<CardData | null>(null);
  const [loadingParent, setLoadingParent] = useState(!!parentId);

  // Load parent card details if creating a team member card
  useEffect(() => {
    if (!parentId) return;
    supabase
      .from("cards")
      .select("*")
      .eq("id", parentId)
      .maybeSingle()
      .then(({ data: pc, error }) => {
        if (error || !pc) {
          setSubmitError(error?.message || "Could not retrieve the parent card parameters.");
        } else {
          setParentCard(pc as CardData);
        }
        setLoadingParent(false);
      });
  }, [parentId]);

  const router = useRouter();

  let initialData: CardData = {
    ...EMPTY,
    plan: initialPlan,
  };

  if (parentCard) {
    initialData = {
      ...EMPTY,
      parent_id: parentCard.id,
      plan: parentCard.plan,
      business_name: parentCard.business_name,
      tagline: parentCard.tagline,
      brand_color: parentCard.brand_color,
      theme: parentCard.theme,
      logo_data_url: parentCard.logo_data_url,
      background_data_url: parentCard.background_data_url,
      card_layout: parentCard.card_layout,
      show_logo_on_card: parentCard.show_logo_on_card,
      payment_status: "paid", // Auto-activated as part of team slot
      owner_email: parentCard.owner_email,
    };
  }

  async function handleCreateSubmit(data: CardData, paymentProvider?: "esewa" | "khalti" | "stripe") {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Create the card record (pending payment or team-active)
      const createRes = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error || "Could not save card");

      // 2. Bypass payment for basic plan or team cards
      if (data.plan === "basic" || data.parent_id) {
        // Redirect to dashboard or success page
        router.push("/edit/dashboard");
        router.refresh();
        return;
      }

      // 3. Redirect to manual checkout page
      const providerParam = paymentProvider ? `?provider=${paymentProvider}` : "";
      router.push(`/payment/checkout/${created.card.id}${providerParam}`);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  }

  if (loadingParent) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-stone-500 mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-stone-500">Loading team card configurations...</span>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight mb-1">
        {parentId ? `Add Team Card for ${parentCard?.business_name}` : "Create your digital card"}
      </h1>
      <p className="text-stone-500 mb-8 text-sm">
        {parentId
          ? "Create a card for your team member. It inherits your brand identity and is fully active."
          : "Fill in your details, choose your preferred payment method, and activate your card instantly."}
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

"use client";

import { Suspense, useState, useEffect } from "react";
import CardForm from "@/components/CardForm";
import { CardData, PlanId } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { BUSINESS_TYPE_DEFAULTS, getDefaultSectionsForType } from "@/lib/business-types";
import { supabase } from "@/lib/supabase";

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
  design_settings: {
    vibe: null,
    bg_texture: "none",
    embossed_effect: false,
    alignment: "center",
    default_nav_tab: null,
    animation: "none",
  },
};

function CreateClientInner({ defaultCountry }: CreateClientProps) {
  const params = useSearchParams();
  const initialPlan = (params.get("plan") as PlanId) || "basic";
  const parentId = params.get("parent_id");
  const workspaceId = params.get("workspaceId");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [parentCard, setParentCard] = useState<CardData | null>(null);
  const [workspaceCard, setWorkspaceCard] = useState<CardData | null>(null);
  const [loadingParent, setLoadingParent] = useState(!!parentId);
  const [loadingWorkspace, setLoadingWorkspace] = useState(!!workspaceId);

  const router = useRouter();

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

  // Load workspace primary card details if workspaceId is provided
  useEffect(() => {
    if (!workspaceId) return;
    supabase
      .from("cards")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("is_primary", true)
      .maybeSingle()
      .then(({ data: wc, error }) => {
        if (error || !wc) {
          console.error("Could not retrieve workspace primary card", error);
        } else {
          setWorkspaceCard(wc as CardData);
        }
        setLoadingWorkspace(false);
      });
  }, [workspaceId]);

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
      workspace_id: parentCard.workspace_id,
    };
  } else if (workspaceCard) {
    initialData = {
      ...EMPTY,
      workspace_id: workspaceId || undefined,
      plan: workspaceCard.plan,
      business_name: workspaceCard.business_name,
      tagline: workspaceCard.tagline,
      brand_color: workspaceCard.brand_color,
      theme: workspaceCard.theme,
      logo_data_url: workspaceCard.logo_data_url,
      background_data_url: workspaceCard.background_data_url,
      card_layout: workspaceCard.card_layout,
      show_logo_on_card: workspaceCard.show_logo_on_card,
      payment_status: "paid", // Auto-activated as part of team slot
      owner_email: workspaceCard.owner_email,
    };
  } else {
    // Standard general fallback initially, can be changed in step 1 of CardForm
    const defaults = BUSINESS_TYPE_DEFAULTS.general;
    const sections = getDefaultSectionsForType("general");
    initialData = {
      ...EMPTY,
      plan: initialPlan,
      business_type: "general",
      brand_color: defaults.suggestedColor,
      sections: sections,
      section_order: sections.map((s) => s.type),
    };
  }

  async function handleCreateSubmit(data: CardData, paymentProvider?: "esewa" | "khalti" | "stripe") {
    setSubmitting(true);
    setSubmitError(null);

    const submissionData = {
      ...data,
      workspace_id: workspaceId || data.workspace_id || undefined,
    };

    try {
      // 1. Create the card record
      const createRes = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error || "Could not save card");

      // 2. Bypass payment for basic plan, team cards, or workspaceId cards
      if (data.plan === "basic" || data.parent_id || workspaceId) {
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

  if (loadingParent || loadingWorkspace) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 text-stone-500 mb-2 border-4 border-t-brand border-stone-200 rounded-full" />
        <span className="text-xs text-stone-500">Loading configurations...</span>
      </main>
    );
  }

  return (
    <CardForm
      initialData={initialData}
      mode="create"
      onSubmit={handleCreateSubmit}
      submitting={submitting}
      submitError={submitError}
      defaultCountry={defaultCountry}
    />
  );
}

export default function CreateClient({ defaultCountry }: CreateClientProps) {
  return (
    <Suspense fallback={null}>
      <CreateClientInner defaultCountry={defaultCountry} />
    </Suspense>
  );
}

"use client";

import { Suspense, useState, useEffect } from "react";
import CardForm from "@/components/CardForm";
import { CardData, PlanId } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { BUSINESS_TYPE_DEFAULTS, getDefaultSectionsForType } from "@/lib/business-types";
import { motion } from "framer-motion";

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
  const workspaceId = params.get("workspaceId");

  const [step, setStep] = useState<0 | 1>(parentId || workspaceId ? 1 : 0);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [parentCard, setParentCard] = useState<CardData | null>(null);
  const [workspaceCard, setWorkspaceCard] = useState<CardData | null>(null);
  const [loadingParent, setLoadingParent] = useState(!!parentId);
  const [loadingWorkspace, setLoadingWorkspace] = useState(!!workspaceId);

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
    const typeKey = selectedType || "general";
    const defaults = BUSINESS_TYPE_DEFAULTS[typeKey] || BUSINESS_TYPE_DEFAULTS.general;
    const sections = getDefaultSectionsForType(typeKey);
    initialData = {
      ...EMPTY,
      plan: initialPlan,
      business_type: typeKey,
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
      // 1. Create the card record (pending payment or team-active)
      const createRes = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error || "Could not save card");

      // 2. Bypass payment for basic plan, team cards, or workspaceId cards
      if (data.plan === "basic" || data.parent_id || workspaceId) {
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

  if (loadingParent || loadingWorkspace) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-stone-500 mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-stone-500">Loading configurations...</span>
      </main>
    );
  }

  if (step === 0) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl"
          >
            What kind of business do you run?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-sm text-stone-500"
          >
            Select a category to pre-configure your default sections, suggested theme colors, and visual layout. You can customize everything later.
          </motion.p>
        </div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.04 }
            }
          }}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
        >
          {Object.entries(BUSINESS_TYPE_DEFAULTS).map(([key, detail]) => {
            const isSelected = selectedType === key;
            return (
              <motion.button
                key={key}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedType(key);
                  setTimeout(() => {
                    setStep(1);
                  }, 300);
                }}
                className={`relative flex flex-col items-center text-center p-6 bg-white border rounded-2xl transition-all cursor-pointer select-none h-full justify-between gap-4 ${
                  isSelected
                    ? "border-brand bg-brand-light/30 ring-2 ring-brand"
                    : "border-stone-200 hover:border-stone-300 hover:shadow-sm"
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 bg-brand rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow"
                  >
                    ✓
                  </motion.div>
                )}
                
                <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center text-3xl border border-stone-100/50 shadow-inner">
                  {detail.emoji}
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-stone-900 text-sm leading-tight">
                    {detail.label}
                  </h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed max-w-[200px] mx-auto">
                    {detail.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => {
              setSelectedType("general");
              setStep(1);
            }}
            className="text-xs text-stone-400 hover:text-stone-700 underline font-medium cursor-pointer"
          >
            Skip — I&apos;ll build my own layout from scratch
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {!parentId && !workspaceId && (
        <div className="mb-4">
          <button
            onClick={() => {
              setSelectedType(null);
              setStep(0);
            }}
            className="text-xs text-stone-500 hover:text-stone-850 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            ← Choose another business category
          </button>
        </div>
      )}

      <h1 className="text-3xl font-semibold tracking-tight mb-1">
        {parentId || workspaceId ? `Add Team Card` : "Create your digital card"}
      </h1>
      <p className="text-stone-500 mb-8 text-sm">
        {parentId || workspaceId
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

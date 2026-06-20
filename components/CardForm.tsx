"use client";

import { useEffect, useRef, useState } from "react";
import CardPreview from "@/components/CardPreview";
import { generateQRCodeWithLogo } from "@/lib/qr-helper";
import { CardData, PLAN_DETAILS, PlanId, THEME_LABELS, ThemeId } from "@/lib/types";
import { buildVCard, slugify } from "@/lib/utils";
import { SITE } from "@/lib/config";
import { generateBusinessCard } from "@/lib/business-card";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { 
  MenuEditor, 
  GalleryEditor, 
  ServicesEditor, 
  HoursEditor, 
  LocationEditor, 
  ReviewEditor, 
  BookingEditor, 
  WifiEditor, 
  LeadCaptureEditor, 
  AmenitiesEditor, 
  ScheduleEditor, 
  PricingTableEditor, 
  FeaturedProductsEditor, 
  CoursesEditor,
  ContactEditor,
  SocialsEditor
} from "@/components/SectionEditors";
import { isSectionLocked } from "@/lib/sections";
import { DEFAULT_TITLES, DEFAULT_DATA, SectionType } from "@/lib/business-types";

const MAX_LOGO_BYTES = 300 * 1024; // ~300KB

const STEPS = [
  { number: 1, label: "Plan & Account", short: "Plan" },
  { number: 2, label: "Business Details", short: "Details" },
  { number: 3, label: "Brand & Styling", short: "Style" },
  { number: 4, label: "Contact & Hours", short: "Contact" },
  { number: 5, label: "Card Content", short: "Content" },
];

interface CardFormProps {
  initialData: CardData;
  mode: "create" | "edit";
  onSubmit: (data: CardData, paymentProvider?: "esewa" | "khalti" | "stripe") => Promise<void>;
  submitting: boolean;
  submitError: string | null;
  defaultCountry?: string;
  isAdmin?: boolean;
}

export default function CardForm({
  initialData,
  mode,
  onSubmit,
  submitting,
  submitError: externalSubmitError,
  defaultCountry,
  isAdmin = false,
}: CardFormProps) {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const [data, setData] = useState<CardData>(initialData);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [bgImageError, setBgImageError] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewTab, setPreviewTab] = useState<"digital" | "business">("digital");
  const [businessCardPreview, setBusinessCardPreview] = useState<string | null>(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);

  // Wizard flow states (Create Mode Only)
  const isWizard = mode === "create";
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    if (currentStep === 1) {
      if (!data.owner_email || !data.owner_email.trim()) {
        setSubmitError("Account email is required.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.owner_email)) {
        setSubmitError("Please enter a valid email address.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!data.business_name || !data.business_name.trim()) {
        setSubmitError("Business name is required.");
        return;
      }
    }
    setSubmitError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setSubmitError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;
    
    // Validate Step 1 if moving past it
    if (currentStep === 1 || targetStep > 1) {
      if (!data.owner_email || !data.owner_email.trim()) {
        setSubmitError("Account email is required.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.owner_email)) {
        setSubmitError("Please enter a valid email address.");
        return;
      }
    }
    
    // Validate Step 2 if moving past it
    if (currentStep === 2 || targetStep > 2) {
      if (!data.business_name || !data.business_name.trim()) {
        setSubmitError("Business name is required.");
        return;
      }
    }
    
    setSubmitError(null);
    setCurrentStep(targetStep);
  };

  // Initialize payment provider based on country
  const [paymentProvider, setPaymentProvider] = useState<"esewa" | "khalti" | "stripe">(
    defaultCountry === "NP" ? "esewa" : "stripe"
  );

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || SITE.domain;
  const isSubdomainPlan = false; // Disabled until custom domain is ready
  const previewSlug = data.business_name ? slugify(data.business_name) : "your-business";
  const previewUrl = `https://${baseDomain}/card/${previewSlug}`;

  // Update payment provider if defaultCountry changes
  useEffect(() => {
    if (defaultCountry) {
      setPaymentProvider(defaultCountry === "NP" ? "esewa" : "stripe");
    }
  }, [defaultCountry]);

  // Regenerate QR preview whenever the resulting URL, brand color, logo, business name, or plan changes
  useEffect(() => {
    setQrLoading(true);
    const isPaid = data.plan !== "basic";
    generateQRCodeWithLogo(
      previewUrl,
      data.brand_color || "#085041",
      data.logo_data_url,
      data.business_name,
      isPaid,
      data.qr_customization
    )
      .then((res) => {
        setQr(res);
        setQrLoading(false);
      })
      .catch((err) => {
        console.error("Failed to generate QR preview:", err);
        setQr(null);
        setQrLoading(false);
      });
  }, [previewUrl, data.brand_color, data.logo_data_url, data.business_name, data.plan, data.qr_customization]);

  // Enforce plan constraints based on tier
  useEffect(() => {
    if (data.plan === "basic") {
      setData((d) => ({
        ...d,
        theme: "classic",
        logo_data_url: null,
        brand_color: "#085041",
        background_data_url: null,
        card_layout: "classic",
        text_color: null,
      }));
    } else if (data.plan === "pro") {
      setData((d) => ({
        ...d,
        theme: (d.theme === "glassmorphic" || d.theme === "neonDark") ? "classic" : d.theme,
        background_data_url: null,
        card_layout: "classic",
      }));
    }
  }, [data.plan]);

  // Generate physical business card preview when active tab is business card
  useEffect(() => {
    if (previewTab !== "business") return;

    let active = true;
    setGeneratingPreview(true);
    generateBusinessCard(data)
      .then((url) => {
        if (active) {
          setBusinessCardPreview(url);
          setGeneratingPreview(false);
        }
      })
      .catch((err) => {
        console.error("Failed to generate business card preview:", err);
        if (active) {
          setGeneratingPreview(false);
        }
      });

    return () => {
      active = false;
    };
  }, [data, previewTab]);

  function update<K extends keyof CardData>(key: K, value: CardData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function updateSectionData(idx: number, newData: any) {
    const list = [...(data.sections || [])];
    list[idx] = { ...list[idx], data: newData };
    update("sections", list);
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo must be under 300KB. Try a smaller or compressed image.");
      return;
    }
    setLogoError(null);
    const reader = new FileReader();
    reader.onload = () => update("logo_data_url", reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleBackgroundUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setBgImageError("Background image must be under 300KB.");
      return;
    }
    setBgImageError(null);
    const reader = new FileReader();
    reader.onload = () => update("background_data_url", reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isWizard && currentStep < 5) {
      nextStep();
      return;
    }
    if (!data.business_name.trim()) {
      setSubmitError("Business name is required.");
      return;
    }
    if (!data.owner_email || !data.owner_email.trim()) {
      setSubmitError("Account email is required.");
      return;
    }
    setSubmitError(null);
    await onSubmit(data, paymentProvider);
  }

  function downloadVCardPreview() {
    const vcard = buildVCard(data);
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.business_name || "card"}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleDownloadCard() {
    try {
      const dataUrl = await generateBusinessCard(data);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${data.business_name || "business"}_card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to generate business card:", err);
      alert("Failed to generate your business card. Please try again.");
    }
  }

  function handleDownloadQR() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `${data.business_name || "card"}_qr_code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const renderSection = (stepNum: number, children: React.ReactNode) => {
    if (isWizard && currentStep !== stepNum) return null;
    return children;
  };

  const brandColor = data.brand_color || "#085041";

  return (
    <form onSubmit={handleFormSubmit} className="grid lg:grid-cols-[1fr_380px] gap-10">
      {/* Form Fields */}
      <div className="space-y-8">
        {isWizard && (
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="relative flex items-center justify-between w-full">
              {/* Connection Line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-100 rounded-full z-0">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`, backgroundColor: brandColor }}
                />
              </div>

              {/* Steps */}
              {STEPS.map((step) => {
                const isCompleted = currentStep > step.number;
                const isActive = currentStep === step.number;
                return (
                  <button
                    key={step.number}
                    type="button"
                    onClick={() => handleStepClick(step.number)}
                    className="relative z-10 flex flex-col items-center group focus:outline-none"
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 border shadow-sm ${
                        isCompleted
                          ? "text-white"
                          : isActive
                          ? "bg-white font-bold"
                          : "bg-white text-stone-400 border-stone-200 hover:border-stone-300 hover:text-stone-600"
                      }`}
                      style={
                        isCompleted
                          ? { backgroundColor: brandColor, borderColor: brandColor }
                          : isActive
                          ? { borderColor: brandColor, color: brandColor, boxShadow: `0 0 0 4px ${brandColor}25` }
                          : {}
                      }
                    >
                      {isCompleted ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-white">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-semibold mt-2 transition-colors duration-300 hidden sm:block ${
                        isActive ? "font-bold" : isCompleted ? "text-stone-600" : "text-stone-400 group-hover:text-stone-500"
                      }`}
                      style={isActive ? { color: brandColor } : {}}
                    >
                      {step.label}
                    </span>
                    <span
                      className={`text-[9px] font-semibold mt-1 transition-colors duration-300 sm:hidden ${
                        isActive ? "font-bold" : isCompleted ? "text-stone-600" : "text-stone-400"
                      }`}
                      style={isActive ? { color: brandColor } : {}}
                    >
                      {step.short}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={isWizard ? currentStep : "edit"}
            initial={isWizard ? { opacity: 0, x: 15 } : undefined}
            animate={isWizard ? { opacity: 1, x: 0 } : undefined}
            exit={isWizard ? { opacity: 0, x: -15 } : undefined}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Account Email (Magic Link login target) */}
            {renderSection(1, (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
              >
                <h2 className="font-semibold text-stone-900 mb-3 text-sm">Account Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Account Email (Required for management & updates)" required>
                    <input
                      type="email"
                      required
                      value={data.owner_email || ""}
                      onChange={(e) => update("owner_email", e.target.value)}
                      placeholder="you@example.com"
                      className="input"
                    />
                  </Field>
                  {isAdmin && (
                    <Field label="Payment Activation Status">
                      <select
                        value={data.payment_status}
                        onChange={(e) => update("payment_status", e.target.value as any)}
                        className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 py-1 text-sm outline-none focus:border-stone-500"
                      >
                        <option value="paid">Active (Paid)</option>
                        <option value="pending">Pending Payment</option>
                      </select>
                    </Field>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 mt-2">
                  This email is used to log in via a passwordless Magic Link to manage/edit your card in the future.
                </p>
              </motion.section>
            ))}

            {/* Plan Selection */}
            {renderSection(1, (mode === "create" || isAdmin) && !data.parent_id && (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
              >
                <h2 className="font-semibold text-stone-900 mb-3 text-sm">Choose Plan</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {Object.entries(PLAN_DETAILS).map(([id, plan]) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={id}
                      type="button"
                      onClick={() => update("plan", id as PlanId)}
                      className={`text-left rounded-xl border p-4 transition-all ${
                        data.plan === id
                          ? "border-brand ring-2 ring-brand bg-brand-light"
                          : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/50"
                      }`}
                    >
                      <div className="font-semibold text-stone-900">{plan.name}</div>
                      <div className="text-xs text-stone-500 mt-1">
                        Rs {plan.priceNPR.toLocaleString()} / ${plan.priceUSD}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.section>
            ))}

            {/* Payment Method Selector (Create Mode Only) */}
            {renderSection(1, mode === "create" && data.plan !== "basic" && !data.parent_id && (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="bg-stone-100 p-6 rounded-2xl border border-stone-200"
              >
                <h2 className="font-semibold text-stone-900 mb-1 text-sm">Payment Method</h2>
                <p className="text-[11px] text-stone-500 mb-4">
                  Select your payment method. Region-based default is auto-detected.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setPaymentProvider("esewa")}
                    className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all cursor-pointer ${
                      paymentProvider === "esewa"
                        ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600 text-emerald-950 font-medium"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    <span className="font-semibold text-sm">eSewa (NPR)</span>
                    <span className="text-[10px] opacity-75 mt-0.5">Rs {PLAN_DETAILS[data.plan].priceNPR.toLocaleString()}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setPaymentProvider("khalti")}
                    className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all cursor-pointer ${
                      paymentProvider === "khalti"
                        ? "border-purple-600 bg-purple-50/80 ring-2 ring-purple-600 text-purple-950 font-medium"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    <span className="font-semibold text-sm">Khalti (NPR)</span>
                    <span className="text-[10px] opacity-75 mt-0.5">Rs {PLAN_DETAILS[data.plan].priceNPR.toLocaleString()}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setPaymentProvider("stripe")}
                    className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all cursor-pointer ${
                      paymentProvider === "stripe"
                        ? "border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600 text-indigo-950 font-medium"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    <span className="font-semibold text-sm">Card (USD)</span>
                    <span className="text-[10px] opacity-75 mt-0.5">${PLAN_DETAILS[data.plan].priceUSD}</span>
                  </motion.button>
                </div>
              </motion.section>
            ))}

            {/* Business details */}
            {renderSection(2, (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
              >
                <h2 className="font-semibold text-stone-900 mb-3 text-sm">Business details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Business name" required>
                    <input
                      required
                      value={data.business_name}
                      onChange={(e) => update("business_name", e.target.value)}
                      placeholder="Easymoto"
                      className="input"
                    />
                  </Field>
                  <Field label="Tagline">
                    <input
                      value={data.tagline || ""}
                      onChange={(e) => update("tagline", e.target.value)}
                      placeholder="Two-wheeler rentals, Kathmandu"
                      className="input"
                    />
                  </Field>
                  {data.plan !== "basic" && (
                    <>
                      <Field label="Member Name (Optional — e.g. for team cards)">
                        <input
                          value={data.member_name || ""}
                          onChange={(e) => update("member_name", e.target.value)}
                          placeholder="Sudip Parajuli"
                          className="input"
                        />
                      </Field>
                      <Field label="Member Role (Optional — e.g. Founder & CEO)">
                        <input
                          value={data.member_role || ""}
                          onChange={(e) => update("member_role", e.target.value)}
                          placeholder="Founder & CEO"
                          className="input"
                        />
                      </Field>
                    </>
                  )}
                  <Field label="Brand color">
                    {data.plan === "basic" ? (
                      <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 text-xs text-stone-500 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full border border-stone-300" style={{ backgroundColor: "#085041" }}></div>
                          <span>Locked to default branding.</span>
                        </div>
                        <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Pro/Business only</span>
                      </div>
                    ) : (
                      <input
                        type="color"
                        value={data.brand_color || "#085041"}
                        onChange={(e) => update("brand_color", e.target.value)}
                        className="h-10 w-full rounded-lg border border-stone-200 cursor-pointer"
                      />
                    )}
                  </Field>

                  <Field label="Text color">
                    {data.plan === "basic" ? (
                      <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 text-xs text-stone-500 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full border border-stone-300" style={{ backgroundColor: "#ffffff" }}></div>
                          <span>Locked to default colors.</span>
                        </div>
                        <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Pro/Business only</span>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={data.text_color || "#ffffff"}
                          onChange={(e) => update("text_color", e.target.value)}
                          className="h-10 flex-1 rounded-lg border border-stone-250 cursor-pointer"
                        />
                        {data.text_color && (
                          <button
                            type="button"
                            onClick={() => update("text_color", null)}
                            className="text-xs text-stone-500 hover:text-stone-700 border border-stone-200 rounded-lg px-2.5 h-10 transition-colors"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    )}
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Logo (optional, under 300KB)">
                      {data.plan === "basic" ? (
                        <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 text-xs text-stone-500 flex items-center justify-between">
                          <span>Logo upload is locked on Basic plan.</span>
                          <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Pro/Business only</span>
                        </div>
                      ) : (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleLogoUpload}
                            className="text-xs mt-1 block w-full text-stone-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
                          />
                          {logoError && <p className="text-xs text-red-500 mt-1">{logoError}</p>}
                          {data.logo_data_url && (
                            <button
                              type="button"
                              onClick={() => {
                                update("logo_data_url", null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              className="text-xs text-stone-500 underline mt-1 block"
                            >
                              Remove logo
                            </button>
                          )}

                          <div className="mt-3 flex items-center gap-2">
                            <input
                              id="show_logo_on_card"
                              type="checkbox"
                              checked={data.show_logo_on_card !== false}
                              onChange={(e) => update("show_logo_on_card", e.target.checked)}
                              className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                            />
                            <label htmlFor="show_logo_on_card" className="text-xs font-medium text-stone-700 select-none cursor-pointer">
                              Show logo/initials emblem on physical business card layout
                            </label>
                          </div>
                        </>
                      )}
                    </Field>
                  </div>
                </div>
              </motion.section>
            ))}

            {/* Theme selection */}
            {renderSection(2, (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-stone-900 text-sm">Theme</h2>
                  {data.plan === "basic" ? (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-medium">
                      Pro/Business gets all themes
                    </span>
                  ) : data.plan === "pro" ? (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-medium">
                      Business unlocks premium themes
                    </span>
                  ) : null}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(Object.keys(THEME_LABELS) as ThemeId[]).map((id) => {
                    const isLocked =
                      (data.plan === "basic" && id !== "classic") ||
                      (data.plan === "pro" && (id === "glassmorphic" || id === "neonDark"));
                    const lockText = (id === "glassmorphic" || id === "neonDark") ? "Business only" : "Pro/Business only";
                    return (
                      <motion.button
                        whileHover={isLocked ? {} : { scale: 1.02 }}
                        whileTap={isLocked ? {} : { scale: 0.98 }}
                        key={id}
                        type="button"
                        disabled={isLocked}
                        onClick={() => update("theme", id)}
                        className={`text-left rounded-xl border px-4 py-3 text-sm transition-all ${
                          data.theme === id
                            ? "border-brand ring-2 ring-brand bg-brand-light font-medium text-stone-900"
                            : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/50 text-stone-700"
                        } ${isLocked ? "opacity-45 cursor-not-allowed bg-stone-50/70" : ""}`}
                      >
                        <span className="flex justify-between items-center w-full">
                          <span>{THEME_LABELS[id]}</span>
                          {isLocked && (
                            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                              {lockText}
                            </span>
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>
            ))}

            {/* Business Customizations (Only for Business Plan) */}
            {renderSection(3, (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-stone-900 text-sm">Business Tier Features</h2>
                  {data.plan !== "business" && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-medium">
                      Business plan only
                    </span>
                  )}
                </div>
                <div className={`space-y-4 ${data.plan !== "business" ? "opacity-50 pointer-events-none" : ""}`}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Custom Card Background Image (optional)">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleBackgroundUpload}
                        disabled={data.plan !== "business"}
                        className="text-xs mt-1 block w-full text-stone-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 disabled:opacity-50"
                      />
                      {bgImageError && <p className="text-xs text-red-500 mt-1">{bgImageError}</p>}
                      {data.background_data_url && (
                        <button
                          type="button"
                          onClick={() => update("background_data_url", null)}
                          className="text-xs text-stone-500 underline mt-1 block"
                        >
                          Remove background image
                        </button>
                      )}
                    </Field>

                    <Field label="Physical Business Card Layout">
                      <select
                        value={data.card_layout || "classic"}
                        onChange={(e) => update("card_layout", e.target.value as any)}
                        disabled={data.plan !== "business"}
                        className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 py-1 text-sm outline-none focus:border-stone-500 transition-colors disabled:opacity-50"
                      >
                        <option value="classic">Classic (Brand Color background)</option>
                        <option value="modern_dark">Modern Dark (Slate & glowing border)</option>
                        <option value="minimal_light">Minimal Light (Clean white & borderless)</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </motion.section>
            ))}

            {/* QR Code Customization (Pro/Business Plan Only) */}
            {renderSection(3, (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="font-semibold text-stone-900 text-sm">QR Code Customization</h2>
                    <p className="text-stone-500 text-[11px] mt-0.5">Stand out with custom module dot patterns and corner eye designs.</p>
                  </div>
                  {data.plan === "basic" && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-medium">
                      Pro/Business only
                    </span>
                  )}
                </div>

                {data.plan === "basic" ? (
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs text-stone-500 leading-relaxed">
                    Custom QR styling is locked on the Free Trial plan. Upgrade to the <strong className="text-stone-900">Pro</strong> or <strong className="text-stone-900">Business</strong> plan to customize your QR code dots and corner frames.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">Dot Pattern Style</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "square", label: "Square" },
                          { id: "rounded", label: "Rounded" },
                          { id: "dots", label: "Dots" }
                        ].map((style) => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => {
                              const currentCustom = data.qr_customization || {};
                              update("qr_customization", {
                                ...currentCustom,
                                dotStyle: style.id as any
                              });
                            }}
                            className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                              (data.qr_customization?.dotStyle || "square") === style.id
                                ? "border-brand bg-brand-light text-brand ring-2 ring-brand font-bold"
                                : "border-stone-200 hover:border-stone-300 text-stone-700 bg-white font-medium"
                            }`}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">Corner Eyes Shape</span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "square", label: "Square Corners" },
                          { id: "rounded", label: "Rounded Corners" }
                        ].map((style) => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => {
                              const currentCustom = data.qr_customization || {};
                              update("qr_customization", {
                                ...currentCustom,
                                cornerStyle: style.id as any
                              });
                            }}
                            className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                              (data.qr_customization?.cornerStyle || "square") === style.id
                                ? "border-brand bg-brand-light text-brand ring-2 ring-brand font-bold"
                                : "border-stone-200 hover:border-stone-300 text-stone-700 bg-white font-medium"
                            }`}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200/50">
                      <div>
                        <span className="text-xs font-semibold text-stone-700 block">Embed Brand Logo</span>
                        <span className="text-[10px] text-stone-400">Show logo or initials inside center circle of the QR code</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={data.qr_customization?.logoEnabled !== false}
                        onChange={(e) => {
                          const currentCustom = data.qr_customization || {};
                          update("qr_customization", {
                            ...currentCustom,
                            logoEnabled: e.target.checked
                          });
                        }}
                        className="rounded text-brand focus:ring-brand border-stone-300 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </motion.section>
            ))}

            {/* Custom Links (Business Plan Only) */}
            {renderSection(3, (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="font-semibold text-stone-900 text-sm">Custom Links</h2>
                    <p className="text-stone-500 text-[11px] mt-0.5">Add unlimited custom buttons (e.g. Booking, Portfolio, Menu, PDF Catalog, etc.)</p>
                  </div>
                  {data.plan !== "business" && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-medium">
                      Business plan only
                    </span>
                  )}
                </div>

                {data.plan !== "business" ? (
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs text-stone-500 leading-relaxed">
                    Custom Links feature is locked on your current plan. Upgrade to the <strong className="text-stone-900">Business Tier</strong> to add unlimited personalized buttons to your card.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(data.custom_links || []).map((link, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-stone-50 p-3.5 rounded-xl border border-stone-200/60 relative group">
                        <div className="flex-1 grid sm:grid-cols-2 gap-3 w-full">
                          <div>
                            <span className="text-[10px] font-semibold text-stone-500 mb-1 block">Button Label</span>
                            <input
                              type="text"
                              value={link.label || ""}
                              onChange={(e) => {
                                const list = [...(data.custom_links || [])];
                                list[idx].label = e.target.value;
                                update("custom_links", list);
                              }}
                              placeholder="e.g. View Our Menu"
                              className="input bg-white h-9 text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-stone-500 mb-1 block">Button Link (URL)</span>
                            <input
                              type="text"
                              value={link.url || ""}
                              onChange={(e) => {
                                const list = [...(data.custom_links || [])];
                                list[idx].url = e.target.value;
                                update("custom_links", list);
                              }}
                              placeholder="e.g. www.myrestaurant.com/menu"
                              className="input bg-white h-9 text-xs"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (data.custom_links || []).filter((_, i) => i !== idx);
                            update("custom_links", list);
                          }}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold h-9 px-2 transition-colors cursor-pointer self-end sm:self-center mt-2 sm:mt-5"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        const list = [...(data.custom_links || []), { label: "", url: "" }];
                        update("custom_links", list);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 border border-stone-300 hover:bg-stone-50 bg-white px-3 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add Custom Link
                    </button>
                  </div>
                )}
              </motion.section>
            ))}

            {/* Contact + socials */}
            {renderSection(4, (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
              >
                <h2 className="font-semibold text-stone-900 mb-3 text-sm">Contact &amp; social links</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Phone number">
                    <input
                      value={data.phone || ""}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="9860702780"
                      className="input"
                    />
                  </Field>
                  <Field label="WhatsApp (with country code)">
                    <input
                      value={data.whatsapp || ""}
                      onChange={(e) => update("whatsapp", e.target.value)}
                      placeholder="9779851401903"
                      className="input"
                    />
                  </Field>
                  <Field label="Public Email">
                    <input
                      value={data.email || ""}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="hello@business.com"
                      className="input"
                    />
                  </Field>
                  <Field label="Website">
                    <input
                      value={data.website || ""}
                      onChange={(e) => update("website", e.target.value)}
                      placeholder="https://www.example.com"
                      className="input"
                    />
                  </Field>
                  <Field label="Facebook">
                    <input
                      value={data.facebook || ""}
                      onChange={(e) => update("facebook", e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="input"
                    />
                  </Field>
                  <Field label="Instagram">
                    <input
                      value={data.instagram || ""}
                      onChange={(e) => update("instagram", e.target.value)}
                      placeholder="https://instagram.com/yourpage"
                      className="input"
                    />
                  </Field>
                  <Field label="TikTok">
                    <input
                      value={data.tiktok || ""}
                      onChange={(e) => update("tiktok", e.target.value)}
                      placeholder="https://tiktok.com/@yourpage"
                      className="input"
                    />
                  </Field>
                  <Field label="YouTube">
                    <input
                      value={data.youtube || ""}
                      onChange={(e) => update("youtube", e.target.value)}
                      placeholder="https://youtube.com/@yourchannel"
                      className="input"
                    />
                  </Field>
                  <Field label="Google Review Link">
                    <input
                      value={data.google_review || ""}
                      onChange={(e) => update("google_review", e.target.value)}
                      placeholder="https://g.page/r/..."
                      className="input"
                    />
                  </Field>
                  <Field label="Address (Optional)">
                    <input
                      value={data.address || ""}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="e.g. Putalisadak, Kathmandu"
                      className="input"
                    />
                  </Field>
                  <Field label="Location URL (Direct Google Maps link)">
                    <input
                      value={data.location_url || ""}
                      onChange={(e) => update("location_url", e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                      className="input"
                    />
                  </Field>
                </div>
              </motion.section>
            ))}

            {/* Weekly Opening Hours (Standard and Business plans) */}
            {renderSection(4, (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="font-semibold text-stone-900 text-sm">Opening Hours</h2>
                    <p className="text-stone-500 text-[11px] mt-0.5">Configure your weekly operating hours to display a live Open/Closed badge on your card.</p>
                  </div>
                  {data.plan === "basic" && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-medium">
                      Pro/Business only
                    </span>
                  )}
                </div>

                {data.plan === "basic" ? (
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs text-stone-500 leading-relaxed">
                    Opening Hours configuration is locked on the Free Trial plan. Upgrade to the <strong className="text-stone-900">Standard</strong> or <strong className="text-stone-900">Lifetime</strong> plan to show a live status badge.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                      const dayHours = (data.opening_hours as any)?.[day] || { open: "09:00", close: "17:00", isClosed: false };
                      
                      const updateDay = (field: string, val: any) => {
                        const currentHours = (data.opening_hours as any) || {};
                        const updatedHours = {
                          ...currentHours,
                          [day]: {
                            ...dayHours,
                            [field]: val
                          }
                        };
                        update("opening_hours", updatedHours);
                      };

                      return (
                        <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200/50 gap-3 text-xs">
                          <span className="font-bold text-stone-700 capitalize w-24">{day}</span>
                          
                          <div className="flex items-center gap-4 flex-1 justify-end font-medium">
                            <label className="flex items-center gap-1.5 text-stone-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={dayHours.isClosed}
                                onChange={(e) => updateDay("isClosed", e.target.checked)}
                                className="rounded text-brand focus:ring-brand border-stone-300 cursor-pointer"
                              />
                              Closed
                            </label>

                            {!dayHours.isClosed && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={dayHours.open}
                                  onChange={(e) => updateDay("open", e.target.value)}
                                  className="bg-white border border-stone-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand"
                                />
                                <span className="text-stone-400">to</span>
                                <input
                                  type="time"
                                  value={dayHours.close}
                                  onChange={(e) => updateDay("close", e.target.value)}
                                  className="bg-white border border-stone-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.section>
            ))}

            {/* Dynamic Sections Editors */}
            {renderSection(5, data.sections && Array.isArray(data.sections) && (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6"
              >
                <div>
                  <h2 className="font-semibold text-stone-900 text-sm">Profile Content Sections</h2>
                  <p className="text-stone-500 text-[11px] mt-0.5">Customize the details, categories, and media shown in your scannable profile sections.</p>
                </div>

                {data.sections.length > 0 && (
                  <div className="space-y-4">
                    {data.sections.map((section, idx) => {
                      if (section.type === "hero" || section.type === "room_service") return null;
                      const locked = isSectionLocked(section.type, data.plan, section.data);

                      return (
                        <div key={section.type} className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-stone-50 border-b border-stone-200">
                            <div className="flex items-center gap-2">
                              {/* Reordering buttons */}
                              <div className="flex items-center bg-stone-200/60 rounded px-1.5 py-0.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const list = [...(data.sections || [])];
                                    const temp = list[idx - 1];
                                    list[idx - 1] = list[idx];
                                    list[idx] = temp;
                                    update("sections", list);
                                  }}
                                  className="px-1 text-stone-500 hover:text-stone-800 disabled:opacity-30 font-bold"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === (data.sections?.length ?? 0) - 1}
                                  onClick={() => {
                                    const list = [...(data.sections || [])];
                                    const temp = list[idx + 1];
                                    list[idx + 1] = list[idx];
                                    list[idx] = temp;
                                    update("sections", list);
                                  }}
                                  className="px-1 text-stone-500 hover:text-stone-800 disabled:opacity-30 font-bold"
                                >
                                  ▼
                                </button>
                              </div>
                              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                                {locked && <span className="text-xs">🔒</span>}
                                {section.title}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono capitalize">({section.type})</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-xs text-stone-600 font-medium cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={section.enabled !== false}
                                  disabled={locked}
                                  onChange={(e) => {
                                    const list = [...(data.sections || [])];
                                    list[idx] = { ...list[idx], enabled: e.target.checked };
                                    update("sections", list);
                                  }}
                                  className="rounded border-stone-300 text-brand focus:ring-brand disabled:opacity-50"
                                />
                                Enabled
                              </label>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  const list = (data.sections || []).filter((_, i) => i !== idx);
                                  update("sections", list);
                                }}
                                className="text-stone-400 hover:text-red-500 font-bold text-xs p-1"
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          {section.enabled !== false && (
                            locked ? (
                              <div className="flex flex-col items-center justify-center p-6 text-center bg-stone-50 border-t border-stone-200">
                                <span className="text-2xl mb-2">🔒</span>
                                <h4 className="text-xs font-bold text-stone-800">Feature Locked</h4>
                                <p className="text-[10px] text-stone-500 mt-1 max-w-xs">
                                  The {section.title} section is only available on premium plans. Upgrade to unlock this and other advanced features.
                                </p>
                                <a
                                  href="#upgrade-section"
                                  className="mt-3 text-[10px] bg-brand text-white font-bold px-3.5 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                                >
                                  Upgrade Now
                                </a>
                              </div>
                            ) : (
                              <div className="p-4 border-t border-stone-100">
                                {section.type === "menu" && (
                                  <MenuEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                    brandColor={data.brand_color || "#7c3aed"}
                                  />
                                )}
                                {section.type === "gallery" && (
                                  <GalleryEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                    brandColor={data.brand_color || "#7c3aed"}
                                  />
                                )}
                                {section.type === "services" && (
                                  <ServicesEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                    brandColor={data.brand_color || "#7c3aed"}
                                  />
                                )}
                                {section.type === "hours" && (
                                  <HoursEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                  />
                                )}
                                {section.type === "location" && (
                                  <LocationEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                  />
                                )}
                                {section.type === "review" && (
                                  <ReviewEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                  />
                                )}
                                {section.type === "booking" && (
                                  <BookingEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                    plan={data.plan}
                                  />
                                )}
                                {section.type === "wifi" && (
                                  <WifiEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                  />
                                )}
                                {section.type === "lead_capture" && (
                                  <LeadCaptureEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                  />
                                )}
                                {section.type === "amenities" && (
                                  <AmenitiesEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                  />
                                )}
                                {section.type === "schedule" && (
                                  <ScheduleEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                  />
                                )}
                                {section.type === "pricing_table" && (
                                  <PricingTableEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                  />
                                )}
                                {section.type === "featured_products" && (
                                  <FeaturedProductsEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                  />
                                )}
                                {section.type === "courses" && (
                                  <CoursesEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                  />
                                )}
                                {section.type === "contact" && (
                                  <ContactEditor />
                                )}
                                {section.type === "socials" && (
                                  <SocialsEditor />
                                )}
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Section Pool */}
                {(() => {
                  const activeTypes = (data.sections || []).map((s) => s.type);
                  const availableTypes: SectionType[] = [
                    "menu",
                    "gallery",
                    "services",
                    "booking",
                    "hours",
                    "location",
                    "wifi",
                    "amenities",
                    "lead_capture",
                    "review",
                    "schedule",
                    "pricing_table",
                    "featured_products",
                    "courses",
                    "contact",
                    "socials",
                  ];
                  const pool = availableTypes.filter((type) => !activeTypes.includes(type));
                  if (pool.length === 0) return null;

                  return (
                    <div className="pt-4 border-t border-stone-150 flex flex-col gap-2">
                      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Add Profile Section</span>
                      <div className="flex flex-wrap gap-2">
                        {pool.map((type) => {
                          const title = DEFAULT_TITLES[type];
                          const isLocked = isSectionLocked(type, data.plan);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                const newSection = {
                                  type,
                                  title,
                                  enabled: true,
                                  data: JSON.parse(JSON.stringify(DEFAULT_DATA[type])),
                                };
                                const list = [...(data.sections || []), newSection];
                                update("sections", list);
                              }}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                isLocked
                                  ? "bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100"
                                  : "bg-white hover:bg-brand/5 text-stone-700 border-stone-200 hover:border-brand/40"
                              }`}
                            >
                              {isLocked && <span>🔒</span>}
                              <span>+ {title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </motion.section>
            ))}

            {(submitError || externalSubmitError) && (
              <p className="text-sm text-red-500 font-medium">{submitError || externalSubmitError}</p>
            )}

            {isWizard ? (
              <div className="flex items-center justify-between pt-6 border-t border-stone-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 transition-colors cursor-pointer text-sm"
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}
                
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer text-sm"
                    style={{ backgroundColor: brandColor }}
                  >
                    Next Step →
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 cursor-pointer text-sm"
                    style={{ backgroundColor: brandColor }}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : workspaceId ? (
                      "Create team card"
                    ) : data.plan === "basic" ? (
                      "Activate free card"
                    ) : paymentProvider === "esewa" ? (
                      `Pay Rs ${PLAN_DETAILS[data.plan].priceNPR.toLocaleString()} via eSewa`
                    ) : paymentProvider === "khalti" ? (
                      `Pay Rs ${PLAN_DETAILS[data.plan].priceNPR.toLocaleString()} via Khalti`
                    ) : (
                      `Pay $${PLAN_DETAILS[data.plan].priceUSD} via Stripe`
                    )}
                  </motion.button>
                )}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 w-full sm:w-auto cursor-pointer"
                style={{ backgroundColor: brandColor }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Live Preview Side Panel */}
      <div className="lg:sticky lg:top-10 self-start space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-xs uppercase tracking-wider text-stone-500">Live preview</h2>
            
            {/* Tab Selector */}
            <div className="flex bg-stone-200/60 p-0.5 rounded-lg text-xs">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setPreviewTab("digital")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  previewTab === "digital"
                    ? "bg-white text-brand shadow-sm"
                    : "text-stone-500 hover:text-brand"
                }`}
              >
                Digital Card
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setPreviewTab("business")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  previewTab === "business"
                    ? "bg-white text-brand shadow-sm"
                    : "text-stone-500 hover:text-brand"
                }`}
              >
                Business Card
              </motion.button>
            </div>
          </div>

          <div className="bg-stone-100 rounded-2xl p-6 flex flex-col items-center justify-center border border-stone-200/50 shadow-inner min-h-[380px] w-full relative">
            {previewTab === "digital" ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${data.theme}-${data.brand_color}-${data.text_color}-${data.background_data_url}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex justify-center"
                >
                  <CardPreview
                    data={data}
                    onSaveContact={downloadVCardPreview}
                    onDownloadCard={data.plan !== "basic" ? handleDownloadCard : undefined}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="w-full flex flex-col items-center gap-4">
                {generatingPreview ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-stone-500 mb-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs text-stone-500">Generating preview...</span>
                  </div>
                ) : businessCardPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={businessCardPreview}
                      alt="Physical Business Card Preview"
                      className="w-full rounded-lg shadow-md border border-stone-200 object-contain aspect-[1.75]"
                    />
                    {data.plan === "basic" ? (
                      <div className="text-center p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-[11px] text-amber-700 font-semibold">Business Card Download locked on Basic plan</p>
                        <p className="text-[10px] text-amber-600 mt-0.5">Upgrade to Pro or Business to download.</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDownloadCard}
                        style={{ backgroundColor: data.brand_color || "#085041" }}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-white hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3.5 h-3.5"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Business Card (PNG)
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-stone-400 py-12">Failed to load preview</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3 text-stone-500">QR code preview</div>
          <div className="relative mx-auto w-[180px] h-[180px] flex items-center justify-center mb-3">
            {qrLoading && (
              <div className="absolute inset-0 bg-stone-100/80 animate-pulse rounded-lg flex items-center justify-center border border-stone-200 z-10">
                <div className="w-8 h-8 rounded-full border-4 border-t-brand border-stone-200 animate-spin" />
              </div>
            )}
            {qr ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qr}
                alt="QR code preview"
                className={`mx-auto rounded-lg shadow-sm border border-stone-100 transition-opacity duration-200 ${
                  qrLoading ? "opacity-20" : "opacity-100"
                }`}
              />
            ) : !qrLoading ? (
              <div className="text-xs text-stone-400">Failed to generate QR</div>
            ) : null}
          </div>
          {qr && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleDownloadQR}
              style={{ borderColor: data.brand_color || "#085041", color: data.brand_color || "#085041" }}
              className="mt-3 w-full py-2 border rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download QR Code
            </motion.button>
          )}
          <div className="text-[10px] text-stone-400 mt-3 break-all font-mono select-all">{previewUrl}</div>
          {data.plan === "basic" && (
            <p className="text-[11px] text-stone-400 mt-2 italic">
              Upgrade to Pro for a custom subdomain instead of a /card/ path.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-600 mb-1 block">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      {children}
    </label>
  );
}

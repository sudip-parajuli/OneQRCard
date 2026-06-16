"use client";

import { useEffect, useRef, useState } from "react";
import CardPreview from "@/components/CardPreview";
import { generateQRCodeWithLogo } from "@/lib/qr-helper";
import { CardData, PLAN_DETAILS, PlanId, THEME_LABELS, ThemeId } from "@/lib/types";
import { buildVCard, slugify } from "@/lib/utils";
import { SITE } from "@/lib/config";
import { generateBusinessCard } from "@/lib/business-card";

const MAX_LOGO_BYTES = 300 * 1024; // ~300KB

interface CardFormProps {
  initialData: CardData;
  mode: "create" | "edit";
  onSubmit: (data: CardData, paymentProvider?: "esewa" | "stripe") => Promise<void>;
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
  const [data, setData] = useState<CardData>(initialData);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [bgImageError, setBgImageError] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewTab, setPreviewTab] = useState<"digital" | "business">("digital");
  const [businessCardPreview, setBusinessCardPreview] = useState<string | null>(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);

  // Initialize payment provider based on country
  const [paymentProvider, setPaymentProvider] = useState<"esewa" | "stripe">(
    defaultCountry === "NP" ? "esewa" : "stripe"
  );

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || SITE.domain;
  const isSubdomainPlan = data.plan !== "basic";
  const previewSlug = data.business_name ? slugify(data.business_name) : "your-business";
  const previewUrl = isSubdomainPlan
    ? `https://${previewSlug}.${baseDomain}`
    : `https://${baseDomain}/card/${previewSlug}`;

  // Update payment provider if defaultCountry changes
  useEffect(() => {
    if (defaultCountry) {
      setPaymentProvider(defaultCountry === "NP" ? "esewa" : "stripe");
    }
  }, [defaultCountry]);

  // Regenerate QR preview whenever the resulting URL, brand color, logo, business name, or plan changes
  useEffect(() => {
    const isPaid = data.plan !== "basic";
    generateQRCodeWithLogo(
      previewUrl,
      data.brand_color || "#085041",
      data.logo_data_url,
      data.business_name,
      isPaid
    )
      .then(setQr)
      .catch((err) => {
        console.error("Failed to generate QR preview:", err);
        setQr(null);
      });
  }, [previewUrl, data.brand_color, data.logo_data_url, data.business_name, data.plan]);

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

  return (
    <form onSubmit={handleFormSubmit} className="grid lg:grid-cols-[1fr_380px] gap-10">
      {/* Form Fields */}
      <div className="space-y-8">
        {/* Account Email (Magic Link login target) */}
        <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
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
        </section>

        {/* Plan Selection */}
        {(mode === "create" || isAdmin) && !data.parent_id && (
          <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-stone-900 mb-3 text-sm">Choose Plan</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {Object.entries(PLAN_DETAILS).map(([id, plan]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => update("plan", id as PlanId)}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    data.plan === id
                      ? "border-stone-900 ring-2 ring-stone-900 bg-stone-50"
                      : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/50"
                  }`}
                >
                  <div className="font-semibold text-stone-900">{plan.name}</div>
                  <div className="text-xs text-stone-500 mt-1">
                    Rs {plan.priceNPR.toLocaleString()} / ${plan.priceUSD}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Payment Method Selector (Create Mode Only) */}
        {mode === "create" && data.plan !== "basic" && !data.parent_id && (
          <section className="bg-stone-100 p-6 rounded-2xl border border-stone-200">
            <h2 className="font-semibold text-stone-900 mb-1 text-sm">Payment Method</h2>
            <p className="text-[11px] text-stone-500 mb-4">
              Select your payment method. Region-based default is auto-detected.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentProvider("esewa")}
                className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all ${
                  paymentProvider === "esewa"
                    ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600 text-emerald-950 font-medium"
                    : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                }`}
              >
                <span className="font-semibold text-sm">eSewa / NPR</span>
                <span className="text-[10px] opacity-75 mt-0.5">Rs {PLAN_DETAILS[data.plan].priceNPR.toLocaleString()}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentProvider("stripe")}
                className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all ${
                  paymentProvider === "stripe"
                    ? "border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600 text-indigo-950 font-medium"
                    : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                }`}
              >
                <span className="font-semibold text-sm">Card / USD</span>
                <span className="text-[10px] opacity-75 mt-0.5">${PLAN_DETAILS[data.plan].priceUSD}</span>
              </button>
            </div>
          </section>
        )}

        {/* Business details */}
        <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
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
                    className="h-10 flex-1 rounded-lg border border-stone-200 cursor-pointer"
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
                        className="text-xs text-stone-500 underline mt-1"
                      >
                        Remove logo
                      </button>
                    )}
                  </>
                )}
              </Field>
            </div>
          </div>
        </section>

        {/* Theme selection */}
        <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
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
                <button
                  key={id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => update("theme", id)}
                  className={`text-left rounded-xl border px-4 py-3 text-sm transition-all ${
                    data.theme === id
                      ? "border-stone-900 ring-2 ring-stone-900 bg-stone-50 font-medium text-stone-900"
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
                </button>
              );
            })}
          </div>
        </section>

        {/* Business Customizations (Only for Business Plan) */}
        <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
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
        </section>

        {/* Contact + socials */}
        <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
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
          </div>
        </section>

        {(submitError || externalSubmitError) && (
          <p className="text-sm text-red-500 font-medium">{submitError || externalSubmitError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-stone-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : mode === "create" ? (
            data.plan === "basic" ? (
              "Activate free card"
            ) : paymentProvider === "esewa" ? (
              `Pay Rs ${PLAN_DETAILS[data.plan].priceNPR.toLocaleString()} & activate`
            ) : (
              `Pay $${PLAN_DETAILS[data.plan].priceUSD} & activate`
            )
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Live Preview Side Panel */}
      <div className="lg:sticky lg:top-10 self-start space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-xs uppercase tracking-wider text-stone-500">Live preview</h2>
            
            {/* Tab Selector */}
            <div className="flex bg-stone-200/60 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPreviewTab("digital")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  previewTab === "digital"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Digital Card
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("business")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  previewTab === "business"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Business Card
              </button>
            </div>
          </div>

          <div className="bg-stone-100 rounded-2xl p-6 flex flex-col items-center justify-center border border-stone-200/50 shadow-inner min-h-[380px] relative">
            {previewTab === "digital" ? (
              <CardPreview
                data={data}
                onSaveContact={downloadVCardPreview}
                onDownloadCard={data.plan !== "basic" ? handleDownloadCard : undefined}
              />
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
          {qr ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR code preview" className="mx-auto rounded-lg shadow-sm border border-stone-100" />
              <button
                type="button"
                onClick={handleDownloadQR}
                style={{ borderColor: data.brand_color || "#085041", color: data.brand_color || "#085041" }}
                className="mt-3 w-full py-2 border rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
              </button>
            </>
          ) : (
            <div className="w-[220px] h-[220px] mx-auto bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-xs">
              Generating...
            </div>
          )}
          <div className="text-[10px] text-stone-400 mt-3 break-all font-mono select-all">{previewUrl}</div>
          {!isSubdomainPlan && (
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

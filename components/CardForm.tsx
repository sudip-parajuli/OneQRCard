"use client";

import { useEffect, useRef, useState } from "react";
import CardPreview from "@/components/CardPreview";
import { generateQRCodeWithLogo } from "@/lib/qr-helper";
import { CardData, PLAN_DETAILS, PlanId, THEME_LABELS, ThemeId } from "@/lib/types";
import { buildVCard, slugify } from "@/lib/utils";
import { SITE } from "@/lib/config";
import { generateBusinessCard, generateQRFlyer } from "@/lib/business-card";
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
import { DEFAULT_TITLES, DEFAULT_DATA, SectionType, BUSINESS_TYPE_DEFAULTS, getDefaultSectionsForType } from "@/lib/business-types";

const MAX_LOGO_BYTES = 300 * 1024; // ~300KB

const THEME_LABELS_FOR_SOCIALS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  viber: "Viber",
  x_twitter: "X (Twitter)",
  threads: "Threads",
  linkedin: "LinkedIn",
  telegram: "Telegram"
};

const miniIcons: Record<string, JSX.Element> = {
  facebook: (
    <svg className="w-4 h-4 text-[#1877f2]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
    </svg>
  ),
  instagram: (
    <svg className="w-4 h-4 text-[#e4405f]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  ),
  tiktok: (
    <svg className="w-4 h-4 text-stone-900" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  ),
  youtube: (
    <svg className="w-4 h-4 text-[#ff0000]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  ),
  viber: (
    <svg className="w-4 h-4 text-[#7360f2]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="10" r="1.5" />
      <path d="M8 10.5c.5-1.5 2-2 3.5-1.5" />
    </svg>
  ),
  x_twitter: (
    <svg className="w-4 h-4 text-stone-900" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  ),
  threads: (
    <svg className="w-4 h-4 text-stone-900" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 1 0 10 10c0-2.5-2.5-4-5-4s-4 1.5-4 4 1.5 4 4 4 5-1.5 5-4" />
    </svg>
  ),
  linkedin: (
    <svg className="w-4 h-4 text-[#0077b5]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  telegram: (
    <svg className="w-4 h-4 text-[#229ed9]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  link: (
    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
};


const STEPS = [
  { number: 1, label: "Category", short: "Category" },
  { number: 2, label: "The Basics", short: "Basics" },
  { number: 3, label: "Content & Sections", short: "Content" },
  { number: 4, label: "Style & Layout", short: "Styling" },
  { number: 5, label: "Review & Pay", short: "Pay" },
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
  
  const [data, setData] = useState<CardData>(() => {
    const sections = [...(initialData.sections || [])];
    let updated = false;

    if (!sections.some((s) => s.type === "contact")) {
      sections.push({
        type: "contact",
        title: "Contact Details",
        enabled: true,
        data: {},
      });
      updated = true;
    }

    if (!sections.some((s) => s.type === "socials")) {
      sections.push({
        type: "socials",
        title: "Social Links",
        enabled: true,
        data: {},
      });
      updated = true;
    }

    if (!sections.some((s) => s.type === "review")) {
      sections.push({
        type: "review",
        title: "Rate Us & Review",
        enabled: true,
        data: { google_review_url: initialData.google_review || "" },
      });
      updated = true;
    }

    return {
      ...initialData,
      sections,
    };
  });
  const [activeTabOverride, setActiveTabOverride] = useState<string | undefined>(undefined);

  // Wizard flow states (Create Mode Only)
  const isWizard = mode === "create";
  const [currentStep, setCurrentStep] = useState(data.parent_id || workspaceId ? 2 : 1);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);


  const triggerTabFocus = (sectionType: string) => {
    const mapping: Record<string, string> = {
      menu: "menu",
      services: "services",
      courses: "services",
      gallery: "gallery",
      featured_products: "products",
      pricing_table: "products",
      wifi: "wifi",
      location: "location",
      hours: "location",
      booking: "booking",
      lead_capture: "booking",
      review: "profile",
      contact: "profile",
      socials: "profile",
      basics: "profile",
    };
    const targetTab = mapping[sectionType] || "profile";
    setActiveTabOverride(targetTab);
  };

  const [socialLinksList, setSocialLinksList] = useState<{ id: string; platform: string; value: string }[]>([]);
  const [isSocialsInitialized, setIsSocialsInitialized] = useState(false);

  useEffect(() => {
    if (isSocialsInitialized) return;
    const initialLinks: { id: string; platform: string; value: string }[] = [];
    const keys = ["facebook", "instagram", "tiktok", "youtube", "viber", "x_twitter", "threads", "linkedin", "telegram"] as const;
    keys.forEach((k, idx) => {
      if (initialData[k]) {
        initialLinks.push({ id: `${k}_${idx}`, platform: k, value: initialData[k] || "" });
      }
    });
    if (initialLinks.length === 0) {
      initialLinks.push({ id: "init_0", platform: "facebook", value: "" });
    }
    setSocialLinksList(initialLinks);
    setIsSocialsInitialized(true);
  }, [initialData, isSocialsInitialized]);

  useEffect(() => {
    if (!isSocialsInitialized) return;
    const nextSocials: Record<string, string> = {
      facebook: "",
      instagram: "",
      tiktok: "",
      youtube: "",
      viber: "",
      x_twitter: "",
      threads: "",
      linkedin: "",
      telegram: "",
    };
    socialLinksList.forEach((item) => {
      const val = item.value.trim();
      if (val && item.platform) {
        nextSocials[item.platform] = val;
      }
    });
    setData((prev) => {
      let changed = false;
      const keys = Object.keys(nextSocials);
      for (const k of keys) {
        if (prev[k as keyof CardData] !== nextSocials[k]) {
          changed = true;
          break;
        }
      }
      if (!changed) return prev;
      return { ...prev, ...nextSocials };
    });
  }, [socialLinksList, isSocialsInitialized]);

  const detectPlatform = (url: string): string => {
    const normalized = url.toLowerCase().trim();
    if (!normalized) return "link";
    if (normalized.includes("facebook.com") || normalized.includes("fb.com")) return "facebook";
    if (normalized.includes("instagram.com") || normalized.includes("ig.me") || normalized.includes("instagr.am")) return "instagram";
    if (normalized.includes("tiktok.com")) return "tiktok";
    if (normalized.includes("youtube.com") || normalized.includes("youtu.be")) return "youtube";
    if (normalized.includes("viber")) return "viber";
    if (normalized.includes("twitter.com") || normalized.includes("x.com")) return "x_twitter";
    if (normalized.includes("threads.net")) return "threads";
    if (normalized.includes("linkedin.com")) return "linkedin";
    if (normalized.includes("t.me") || normalized.includes("telegram.me")) return "telegram";
    return "link";
  };

  const addSocialLinkField = () => {
    const keys = ["facebook", "instagram", "tiktok", "youtube", "viber", "x_twitter", "threads", "linkedin", "telegram"] as const;
    const selectedPlatforms = socialLinksList.map(item => item.platform);
    const nextPlatform = keys.find(k => !selectedPlatforms.includes(k)) || "facebook";
    setSocialLinksList((prev) => [
      ...prev,
      { id: `new_${Date.now()}`, platform: nextPlatform, value: "" }
    ]);
  };

  const removeSocialLinkField = (id: string) => {
    setSocialLinksList((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (filtered.length === 0) {
        return [{ id: `init_${Date.now()}`, platform: "facebook", value: "" }];
      }
      return filtered;
    });
  };

  const updateSocialLinkField = (id: string, field: "platform" | "value", val: string) => {
    setSocialLinksList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === "value") {
          const detected = detectPlatform(val);
          if (detected !== "link") {
            updated.platform = detected;
          }
        }
        return updated;
      })
    );
  };

  const [logoError, setLogoError] = useState<string | null>(null);
  const [bgImageError, setBgImageError] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [businessCardPreview, setBusinessCardPreview] = useState<string | null>(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  
  // Stand Flyer preview and edit tabs states
  const [editDesignTab, setEditDesignTab] = useState<"card" | "qr" | "bc" | "flyer">("card");
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);
  const [generatingFlyerPreview, setGeneratingFlyerPreview] = useState(false);

  // Initialize design_settings defaults
  useEffect(() => {
    setData((prev) => {
      const show_wallet = prev.design_settings?.show_wallet ?? false;
      const wifi_title = prev.design_settings?.stand_flyer?.wifi_title ?? "Relax & Connect!";
      const wifi_text1 = prev.design_settings?.stand_flyer?.wifi_text1 ?? "Enjoy free WiFi while";
      const wifi_text2 = prev.design_settings?.stand_flyer?.wifi_text2 ?? "you are at our venue.";
      const theme = prev.design_settings?.stand_flyer?.theme ?? "dark_matte";
      const bg_texture = prev.design_settings?.stand_flyer?.bg_texture ?? "none";
      const show_logo = prev.design_settings?.stand_flyer?.show_logo ?? true;

      return {
        ...prev,
        design_settings: {
          ...prev.design_settings,
          show_wallet,
          stand_flyer: {
            ...prev.design_settings?.stand_flyer,
            wifi_title,
            wifi_text1,
            wifi_text2,
            theme,
            bg_texture,
            show_logo,
          },
        },
      };
    });
  }, []);

  // Sync Google Review input and handle sections default mapping
  useEffect(() => {
    setData((prev) => {
      let updated = false;
      const sections = [...(prev.sections || [])];
      
      const contactIdx = sections.findIndex((s) => s.type === "contact");
      if (contactIdx === -1) {
        sections.push({
          type: "contact",
          title: "Contact Details",
          enabled: true,
          data: {},
        });
        updated = true;
      }

      const socialsIdx = sections.findIndex((s) => s.type === "socials");
      if (socialsIdx === -1) {
        sections.push({
          type: "socials",
          title: "Social Links",
          enabled: true,
          data: {},
        });
        updated = true;
      }

      const reviewIdx = sections.findIndex((s) => s.type === "review");
      let nextGoogleReview = prev.google_review;
      if (reviewIdx === -1) {
        sections.push({
          type: "review",
          title: "Rate Us & Review",
          enabled: true,
          data: { google_review_url: prev.google_review || "" },
        });
        updated = true;
      } else {
        const currentUrl = sections[reviewIdx].data?.google_review_url || "";
        const expectedUrl = prev.google_review || "";
        if (currentUrl !== expectedUrl) {
          if (expectedUrl === "" && currentUrl !== "") {
            nextGoogleReview = currentUrl;
            updated = true;
          } else {
            sections[reviewIdx] = {
              ...sections[reviewIdx],
              data: {
                ...sections[reviewIdx].data,
                google_review_url: expectedUrl,
              },
            };
            updated = true;
          }
        }
      }

      if (updated) {
        return {
          ...prev,
          google_review: nextGoogleReview,
          sections,
        };
      }
      return prev;
    });
  }, [data.google_review, data.sections]);

  // Generate stand flyer preview
  useEffect(() => {
    const shouldGenerate = (isWizard && currentStep === 4) || (!isWizard && editDesignTab === "flyer");
    if (!shouldGenerate) return;

    let active = true;
    setGeneratingFlyerPreview(true);
    generateQRFlyer(data)
      .then((url) => {
        if (active) {
          setFlyerPreview(url);
          setGeneratingFlyerPreview(false);
        }
      })
      .catch((err) => {
        console.error("Failed to generate stand flyer preview:", err);
        if (active) {
          setGeneratingFlyerPreview(false);
        }
      });

    return () => {
      active = false;
    };
  }, [data, isWizard, currentStep, editDesignTab]);


  // Initialize payment provider based on country
  const [paymentProvider, setPaymentProvider] = useState<"esewa" | "khalti" | "stripe">(
    defaultCountry === "NP" ? "esewa" : "stripe"
  );

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || SITE.domain;
  const previewSlug = data.business_name ? slugify(data.business_name) : "your-business";
  const previewUrl = `https://${baseDomain}/card/${previewSlug}`;

  // Update payment provider if defaultCountry changes
  useEffect(() => {
    if (defaultCountry) {
      setPaymentProvider(defaultCountry === "NP" ? "esewa" : "stripe");
    }
  }, [defaultCountry]);

  // Regenerate QR preview
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

  // Enforce plan constraints
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

  // Generate business card preview
  useEffect(() => {
    const shouldGenerate = (isWizard && currentStep === 4) || (!isWizard && editDesignTab === "bc");
    if (!shouldGenerate) return;

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
  }, [data, isWizard, currentStep, editDesignTab]);

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

  const handleCategorySelect = (key: string) => {
    const defaults = BUSINESS_TYPE_DEFAULTS[key] || BUSINESS_TYPE_DEFAULTS.general;
    const sections = getDefaultSectionsForType(key);
    
    // Ensure contact, socials, and review are always present
    if (!sections.some(s => s.type === "contact")) {
      sections.push({ type: "contact", title: "Contact Details", enabled: true, data: {} });
    }
    if (!sections.some(s => s.type === "socials")) {
      sections.push({ type: "socials", title: "Social Links", enabled: true, data: {} });
    }
    if (!sections.some(s => s.type === "review")) {
      sections.push({
        type: "review",
        title: "Rate Us & Review",
        enabled: true,
        data: { google_review_url: data.google_review || "" }
      });
    }

    setData((d) => ({
      ...d,
      business_type: key,
      brand_color: defaults.suggestedColor,
      sections: sections,
      section_order: sections.map((s) => s.type),
    }));
    setTimeout(() => {
      setCurrentStep(2);
    }, 300);
  };

  const nextStep = () => {
    if (currentStep === 2) {
      if (!data.business_name || !data.business_name.trim()) {
        setSubmitError("Business name is required.");
        return;
      }
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
    setSubmitError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setSubmitError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep >= currentStep) return; // Can only jump back to completed steps
    setSubmitError(null);
    setCurrentStep(targetStep);
  };

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

  function handleDownloadBusinessCard() {
    if (!businessCardPreview) return;
    const a = document.createElement("a");
    a.href = businessCardPreview;
    a.download = `${data.business_name || "business"}_card.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleDownloadFlyer() {
    if (!flyerPreview) return;
    const a = document.createElement("a");
    a.href = flyerPreview;
    a.download = `${data.business_name || "business"}_flyer.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function moveProfileSection(type: "contact" | "socials" | "review", direction: "up" | "down") {
    const list = [...(data.sections || [])];
    const idx = list.findIndex((s) => s.type === type);
    if (idx === -1) return;

    if (direction === "up" && idx > 0) {
      const temp = list[idx - 1];
      list[idx - 1] = list[idx];
      list[idx] = temp;
      update("sections", list);
    } else if (direction === "down" && idx < list.length - 1) {
      const temp = list[idx + 1];
      list[idx + 1] = list[idx];
      list[idx] = temp;
      update("sections", list);
    }
  }

  const brandColor = data.brand_color || "#085041";

  // RENDER STEP 1: CATEGORY SELECTION (Full Screen)
  if (isWizard && currentStep === 1) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between max-w-xs mx-auto mb-8 border border-stone-200 bg-white rounded-full py-2 px-4 shadow-sm text-xs font-semibold text-stone-500">
          <span>Step 1 of 5</span>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-stone-200"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-stone-200"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-stone-200"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-stone-200"></span>
          </div>
        </div>

        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
            What kind of business do you run?
          </h1>
          <p className="mt-3 text-sm text-stone-500">
            Select a category to pre-configure your default sections, suggested theme colors, and visual layout. You can customize everything later.
          </p>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto">
          {Object.entries(BUSINESS_TYPE_DEFAULTS).map(([key, detail]) => {
            const isSelected = data.business_type === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCategorySelect(key)}
                className={`relative flex flex-col items-center text-center p-5 bg-white border rounded-2xl cursor-pointer select-none h-full justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 ${
                  isSelected
                    ? "border-brand bg-brand-light/30 ring-2 ring-brand"
                    : "border-stone-200 hover:border-stone-300 hover:shadow-xs"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center text-3xl border border-stone-100/50 shadow-inner">
                  {detail.emoji}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-stone-900 text-sm leading-tight">
                    {detail.label}
                  </h3>
                  <p className="text-[11px] text-stone-500 leading-normal max-w-[180px] mx-auto">
                    {detail.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => handleCategorySelect("general")}
            className="text-xs text-stone-400 hover:text-stone-700 underline font-medium cursor-pointer"
          >
            Skip — General business
          </button>
        </div>
      </main>
    );
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
          e.preventDefault();
        }
      }}
      className="space-y-8 max-w-7xl mx-auto px-4 py-6"
    >
      
      {/* Step Indicator Header (Steps 2-4) */}
      {isWizard && (
        <div className="bg-white border border-stone-250/60 rounded-2xl p-4 shadow-sm max-w-xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step) => {
              const isCompleted = currentStep > step.number;
              const isActive = currentStep === step.number;
              return (
                <button
                  key={step.number}
                  type="button"
                  disabled={!isCompleted}
                  onClick={() => handleStepClick(step.number)}
                  className={`flex flex-col items-center group ${isCompleted ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                      isCompleted
                        ? "text-white"
                        : isActive
                        ? "bg-white font-bold"
                        : "bg-white text-stone-300 border-stone-200"
                    }`}
                    style={
                      isCompleted
                        ? { backgroundColor: brandColor, borderColor: brandColor }
                        : isActive
                        ? { borderColor: brandColor, color: brandColor, boxShadow: `0 0 0 3px ${brandColor}20` }
                        : {}
                    }
                  >
                    {isCompleted ? "✓" : step.number}
                  </div>
                  <span
                    className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${
                      isActive ? "font-bold" : isCompleted ? "text-stone-700" : "text-stone-300"
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

      {/* Back button link */}
      {isWizard && currentStep > 1 && (
        <div className="max-w-5xl mx-auto flex items-center">
          <button
            type="button"
            onClick={prevStep}
            className="text-xs font-semibold text-stone-500 hover:text-stone-850 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            &larr; Back
          </button>
        </div>
      )}

      {/* SUBMISSION ERROR */}
      {(submitError || externalSubmitError) && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold max-w-xl mx-auto">
          {submitError || externalSubmitError}
        </div>
      )}

      {/* STEP 2: THE BASICS */}
      {isWizard && currentStep === 2 && (
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 max-w-5xl mx-auto items-start">
          <div className="bg-white border border-stone-200 rounded-3xl p-8 space-y-6 shadow-sm" onFocusCapture={() => triggerTabFocus("basics")}>
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">The basics</h2>
            
            <div className="space-y-4">
              <Field label="Business name" required>
                <input
                  required
                  autoFocus
                  value={data.business_name}
                  onChange={(e) => update("business_name", e.target.value)}
                  placeholder="e.g. The Himalayan Bistro"
                  className="input text-lg font-bold"
                />
              </Field>

              <Field label="Tagline (optional)">
                <input
                  value={data.tagline || ""}
                  onChange={(e) => update("tagline", e.target.value)}
                  placeholder="e.g. Taste the authentic Himalayan spice"
                  className="input"
                />
              </Field>

              <Field label="Account email" required>
                <input
                  type="email"
                  required
                  value={data.owner_email || ""}
                  onChange={(e) => update("owner_email", e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                />
                <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed">
                  No password needed. Enter this email on the <strong>/edit</strong> page to log in instantly via a magic link.
                </p>
              </Field>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-stone-600 block">Select pricing plan</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "basic", name: "Free Trial", price: "Rs 0" },
                  { id: "pro", name: "Pro", price: "Rs 500" },
                  { id: "business", name: "Business", price: "Rs 1,000" }
                ].map((p) => {
                  const isSel = data.plan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => update("plan", p.id as PlanId)}
                      className={`py-3 px-2 border rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSel 
                          ? "border-brand bg-brand-light ring-2 ring-brand"
                          : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      <span className="font-bold text-xs text-stone-900">{p.name}</span>
                      <span className="text-[10px] text-stone-500 font-semibold mt-0.5">{p.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>



            <div className="pt-4">
              <button
                type="button"
                onClick={nextStep}
                style={{ backgroundColor: brandColor }}
                className="w-full py-3 bg-brand text-white rounded-2xl font-bold text-sm shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
              >
                Continue &rarr;
              </button>
            </div>
          </div>

          {/* Sticky preview column */}
          <div className="hidden lg:sticky lg:top-24 lg:flex flex-col gap-6">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Live card preview</h3>
            <CardPreview data={data} onSaveContact={downloadVCardPreview} activeTabOverride={activeTabOverride} />
          </div>
        </div>
      )}      {/* STEP 3: CONTENT & SECTIONS (Wizard) OR ALL EDITORS (Edit Mode) */}
      {((isWizard && currentStep === 3) || !isWizard) && (
        <div className={`grid gap-6 items-start ${isWizard ? "lg:grid-cols-[1.2fr_0.8fr]" : "lg:grid-cols-[1.1fr_1.1fr_0.8fr]"}`}>
          {/* Column 1: Editors left (Content tab in edit mode, Step 3 in wizard) */}
          <div className="space-y-8">
            {/* Profile (About Page) Content & Sections */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6 shadow-sm text-left">
              <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5 flex items-center justify-between">
                <span>👤 Profile (About Page) Content</span>
                <span className="text-[9px] font-bold text-stone-400 uppercase">Step 3 of 5</span>
              </h3>

              {/* About & Bio Description */}
              <div className="space-y-4" onFocusCapture={() => triggerTabFocus("basics")}>
                <Field label="Bio Description (About summary)">
                  <textarea
                    value={data.bio || ""}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="Share a short description of your business or yourself..."
                    rows={4}
                    className="w-full border border-stone-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-brand outline-none"
                  />
                </Field>
              </div>

              {/* Sorted list of Profile Sections (Contact, Socials, Review) */}
              {(() => {
                const profileSections = (data.sections || []).filter(
                  (s) => s.type === "contact" || s.type === "socials" || s.type === "review"
                );

                return profileSections.map((section) => {
                  const idx = data.sections?.findIndex((s) => s.type === section.type) ?? -1;
                  if (idx === -1) return null;

                  let sectionTitle = "";
                  if (section.type === "contact") sectionTitle = "📞 Contact Details";
                  else if (section.type === "socials") sectionTitle = "🌐 Social Links";
                  else if (section.type === "review") sectionTitle = "⭐ Rate Us & Review";

                  return (
                    <div key={section.type} id={`section-editor-${section.type}`} className="border border-stone-200 rounded-2xl bg-white overflow-visible transition-all duration-300">
                      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-stone-50 border-b border-stone-200 rounded-t-xl">
                        <div className="flex items-center gap-2">
                          {/* Reordering */}
                          <div className="flex items-center bg-stone-200/50 rounded px-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => moveProfileSection(section.type as any, "up")}
                              className="px-1 text-stone-500 hover:text-stone-850 font-bold text-xs"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => moveProfileSection(section.type as any, "down")}
                              className="px-1 text-stone-500 hover:text-stone-850 font-bold text-xs"
                            >
                              ▼
                            </button>
                          </div>
                          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                            {sectionTitle}
                          </span>
                        </div>

                        <label className="flex items-center gap-1.5 text-xs text-stone-600 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={section.enabled !== false}
                            onChange={(e) => {
                              const list = [...(data.sections || [])];
                              list[idx] = { ...list[idx], enabled: e.target.checked };
                              update("sections", list);
                            }}
                            className="rounded border-stone-300 text-brand focus:ring-brand scale-90"
                          />
                          Enabled
                        </label>
                      </div>

                      {section.enabled !== false && (
                        <div className="p-4 border-t border-stone-100 bg-white" onFocusCapture={() => triggerTabFocus(section.type)}>
                          {section.type === "contact" && (
                            <div className="grid sm:grid-cols-2 gap-4">
                              <Field label="Phone number">
                                <input
                                  value={data.phone || ""}
                                  onChange={(e) => update("phone", e.target.value)}
                                  placeholder="e.g. 98XXXXXXXX"
                                  className="input"
                                />
                              </Field>
                              <Field label="WhatsApp (with country code)">
                                <input
                                  value={data.whatsapp || ""}
                                  onChange={(e) => update("whatsapp", e.target.value)}
                                  placeholder="e.g. 97798XXXXXXXX"
                                  className="input"
                                />
                              </Field>
                              <Field label="Public Email">
                                <input
                                  value={data.email || ""}
                                  onChange={(e) => update("email", e.target.value)}
                                  placeholder="e.g. contact@business.com"
                                  className="input"
                                />
                              </Field>
                              <Field label="Website">
                                <input
                                  value={data.website || ""}
                                  onChange={(e) => update("website", e.target.value)}
                                  placeholder="e.g. https://www.yourdomain.com"
                                  className="input"
                                />
                              </Field>
                            </div>
                          )}

                          {section.type === "socials" && (
                            <div className="space-y-4">
                              <div className="space-y-3">
                                {socialLinksList.map((item) => {
                                  const selectedPlatforms = socialLinksList.map(x => x.platform);
                                  return (
                                    <div key={item.id} className="flex gap-2 items-center animate-fade-in">
                                      {/* Platform Select */}
                                      <div className="flex gap-2 items-center border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 select-none shrink-0 h-11">
                                        {miniIcons[item.platform] || miniIcons.link}
                                        <select
                                          value={item.platform}
                                          onChange={(e) => updateSocialLinkField(item.id, "platform", e.target.value)}
                                          className="bg-transparent text-xs font-semibold text-stone-700 outline-none border-none cursor-pointer pr-1"
                                        >
                                          {Object.entries(THEME_LABELS_FOR_SOCIALS).map(([k, label]) => {
                                            const isChosen = selectedPlatforms.includes(k) && item.platform !== k;
                                            if (isChosen) return null;
                                            return (
                                              <option key={k} value={k}>
                                                {label}
                                              </option>
                                            );
                                          })}
                                        </select>
                                      </div>

                                      {/* URL Input */}
                                      <div className="flex-1">
                                        <input
                                          value={item.value}
                                          onChange={(e) => updateSocialLinkField(item.id, "value", e.target.value)}
                                          placeholder={`Paste your ${THEME_LABELS_FOR_SOCIALS[item.platform] || "profile"} link here...`}
                                          className="input h-11"
                                        />
                                      </div>

                                      {/* Remove */}
                                      <button
                                        type="button"
                                        onClick={() => removeSocialLinkField(item.id)}
                                        className="p-2.5 rounded-xl border border-stone-200 hover:border-red-200 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center h-11 w-11"
                                        title="Remove link"
                                      >
                                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                          <polyline points="3 6 5 6 21 6" />
                                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>

                              {socialLinksList.length < Object.keys(THEME_LABELS_FOR_SOCIALS).length && (
                                <button
                                  type="button"
                                  onClick={addSocialLinkField}
                                  className="w-full py-2.5 border border-dashed border-stone-300 hover:border-brand/40 text-stone-600 hover:text-brand hover:bg-brand/5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <span>+</span> Add Social Link
                                </button>
                              )}
                            </div>
                          )}

                          {section.type === "review" && (
                            <div className="space-y-4">
                              <Field label="Google Review URL">
                                <input
                                  value={data.google_review || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setData((prev) => {
                                      const sections = [...(prev.sections || [])];
                                      const idx = sections.findIndex((s) => s.type === "review");
                                      if (idx !== -1) {
                                        sections[idx] = {
                                          ...sections[idx],
                                          data: {
                                            ...sections[idx].data,
                                            google_review_url: val,
                                          },
                                        };
                                      }
                                      return {
                                        ...prev,
                                        google_review: val,
                                        sections,
                                      };
                                    });
                                  }}
                                  placeholder="e.g. https://g.page/r/XXXXXXXX/review"
                                  className="input"
                                />
                              </Field>
                              <p className="text-[10px] text-stone-400 leading-normal">
                                Link directly to your Google Maps review page to collect 5-star ratings from your customers.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Additional Tab Sections Card */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6 shadow-sm text-left">
              <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5">
                📁 Additional Tab Sections
              </h3>

              {(() => {
                const tabSections = (data.sections || []).filter(
                  (s) => s.type !== "hero" && s.type !== "room_service" && s.type !== "contact" && s.type !== "socials" && s.type !== "review"
                );

                if (tabSections.length === 0) {
                  return (
                    <div className="text-[10px] text-stone-400 border border-dashed border-stone-200 p-4 rounded-xl text-center bg-stone-50 font-medium">
                      No additional tab sections active. Use the pool below to add sections like Menu, Gallery, Services, etc.
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {tabSections.map((section) => {
                      const idx = data.sections?.findIndex((s) => s.type === section.type) ?? -1;
                      if (idx === -1) return null;
                      const locked = isSectionLocked(section.type, data.plan, section.data);

                      return (
                        <div key={section.type} id={`section-editor-${section.type}`} className="border border-stone-200 rounded-xl bg-white overflow-visible transition-all duration-300">
                          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-stone-50 border-b border-stone-200 rounded-t-xl">
                            <div className="flex items-center gap-2">
                              {/* Reordering */}
                              <div className="flex items-center bg-stone-200/50 rounded px-1.5 py-0.5">
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
                                  className="px-1 text-stone-500 hover:text-stone-850 disabled:opacity-30 font-bold text-xs"
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
                                  className="px-1 text-stone-500 hover:text-stone-850 disabled:opacity-30 font-bold text-xs"
                                >
                                  ▼
                                </button>
                              </div>
                              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                                {locked && <span>🔒</span>}
                                {section.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {data.plan === "business" && (
                                <select
                                  value={section.theme || ""}
                                  onChange={(e) => {
                                    const list = [...(data.sections || [])];
                                    list[idx] = { ...list[idx], theme: (e.target.value || undefined) as any };
                                    update("sections", list);
                                  }}
                                  className="h-7 rounded border border-stone-250 bg-white px-2 text-[10px] outline-none font-medium text-stone-700 focus:border-brand/40"
                                >
                                  <option value="">Default Theme</option>
                                  <option value="classic">Classic</option>
                                  <option value="minimal">Minimal</option>
                                  <option value="bold">Bold</option>
                                  <option value="gradient">Gradient</option>
                                  <option value="glassmorphic">Glassmorphic</option>
                                  <option value="neonDark">Neon Dark</option>
                                </select>
                              )}
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
                                  className="rounded border-stone-300 text-brand focus:ring-brand disabled:opacity-50 scale-90"
                                />
                                Enabled
                              </label>

                              <button
                                type="button"
                                onClick={() => {
                                  const list = (data.sections || []).filter((_, i) => i !== idx);
                                  update("sections", list);
                                }}
                                className="text-stone-400 hover:text-red-500 font-semibold text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          {section.enabled !== false && (
                            locked ? (
                              <div className="flex flex-col items-center justify-center p-6 text-center bg-stone-50 border-t border-stone-200 rounded-b-xl">
                                <span className="text-xl mb-1">🔒</span>
                                <h4 className="text-xs font-bold text-stone-850">Feature Locked</h4>
                                <p className="text-[10px] text-stone-500 mt-0.5">
                                  Upgrade to unlock this advanced visual section.
                                </p>
                              </div>
                            ) : (
                              <div className="p-4 border-t border-stone-100" onFocusCapture={() => triggerTabFocus(section.type)}>
                                {section.type === "menu" && (
                                  <MenuEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                    brandColor={data.brand_color}
                                  />
                                )}
                                {section.type === "gallery" && (
                                  <GalleryEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                    brandColor={data.brand_color}
                                  />
                                )}
                                {section.type === "services" && (
                                  <ServicesEditor
                                    data={section.data}
                                    onChange={(newData) => updateSectionData(idx, newData)}
                                    brandColor={data.brand_color}
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
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

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
                  "schedule",
                  "pricing_table",
                  "featured_products",
                  "courses",
                ];
                const pool = availableTypes.filter((type) => !activeTypes.includes(type));
                if (pool.length === 0) return null;

                return (
                  <div className="pt-4 border-t border-stone-150 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Add Additional Section</span>
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
            </div>

            {/* Navigation for Step 3 in Wizard Mode */}
            {isWizard && currentStep === 3 && (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  style={{ backgroundColor: brandColor }}
                  className="w-full py-3.5 bg-brand text-white rounded-2xl font-bold text-sm shadow-sm hover:opacity-95 transition-opacity cursor-pointer text-center"
                >
                  Continue to Styling &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Column 2: Design & Styles (Center) - ONLY visible in Edit Mode here */}
          {!isWizard && (
            <div className="space-y-6 animate-fade-in">
              {/* Tab Selector Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {(["card", "qr", "bc", "flyer"] as const).map((tab) => {
                  const labels = {
                    card: "Card Style",
                    qr: "QR Art",
                    bc: "Print Card",
                    flyer: "Stand Flyer"
                  };
                  const emojis = {
                    card: "🎨",
                    qr: "🔲",
                    bc: "🪪",
                    flyer: "📋"
                  };
                  const isSel = editDesignTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setEditDesignTab(tab);
                        setActiveTabOverride(tab === "card" ? "profile" : "share");
                      }}
                      className={`py-2 px-1 border rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                        isSel
                          ? "border-brand bg-brand-light ring-1 ring-brand text-stone-900"
                          : "border-stone-200 bg-white hover:bg-stone-50 text-stone-600"
                      }`}
                    >
                      <span className="block text-sm mb-0.5">{emojis[tab]}</span>
                      <span>{labels[tab]}</span>
                    </button>
                  );
                })}
              </div>

              {/* RENDER ACTIVE TAB INPUTS */}
              {editDesignTab === "card" && (
                <div 
                  onFocusCapture={() => setActiveTabOverride("profile")}
                  className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6 shadow-sm text-left"
                >
                  <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5">🎨 Digital Card Style</h3>

                  {/* Theme Selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Card Theme</label>
                    <select
                      value={data.theme}
                      onChange={(e) => update("theme", e.target.value as ThemeId)}
                      className="w-full h-9 rounded-lg border border-stone-250 bg-white px-2.5 text-xs outline-none focus:border-stone-500 text-stone-700 font-medium cursor-pointer"
                    >
                      {(Object.keys(THEME_LABELS) as ThemeId[]).map((id) => {
                        const isBusinessOnly = id === "glassmorphic" || id === "neonDark" || id === "claymorphic" || id === "neumorphic" || id === "skeuomorphic" || id === "liquidGlass";
                        const isLocked =
                          (data.plan === "basic" && id !== "classic") ||
                          (data.plan === "pro" && isBusinessOnly);
                        const lockSuffix = isLocked ? ` (🔒 ${isBusinessOnly ? "Business" : "Pro"})` : "";
                        return (
                          <option key={id} value={id} disabled={isLocked}>
                            {THEME_LABELS[id]}{lockSuffix}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Brand Color</label>
                      {data.plan === "basic" ? (
                        <div className="h-9 rounded-lg border border-stone-200 bg-stone-50 flex items-center px-2 gap-1.5 text-[10px] text-stone-400">
                          <div className="w-3.5 h-3.5 rounded-full border border-stone-300" style={{ backgroundColor: "#085041" }}></div>
                          <span>Locked</span>
                        </div>
                      ) : (
                        <input
                          type="color"
                          value={data.brand_color || "#085041"}
                          onChange={(e) => update("brand_color", e.target.value)}
                          className="h-9 w-full rounded-lg border border-stone-250 cursor-pointer p-0.5"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Text Color</label>
                      {data.plan === "basic" ? (
                        <div className="h-9 rounded-lg border border-stone-250 bg-stone-55 flex items-center px-2 gap-1.5 text-[10px] text-stone-400">
                          <div className="w-3.5 h-3.5 rounded-full border border-stone-300" style={{ backgroundColor: "#ffffff" }}></div>
                          <span>Locked</span>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <input
                            type="color"
                            value={data.text_color || "#ffffff"}
                            onChange={(e) => update("text_color", e.target.value)}
                            className="h-9 flex-1 rounded-lg border border-stone-250 cursor-pointer p-0.5"
                          />
                          {data.text_color && (
                            <button
                              type="button"
                              onClick={() => update("text_color", null)}
                              className="text-[9px] text-stone-500 border border-stone-250 rounded-lg px-2 h-9 hover:bg-stone-50"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Logo Upload</label>
                    {data.plan === "basic" ? (
                      <div className="text-[10px] text-stone-400 border border-dashed border-stone-200 p-2 rounded-lg text-center bg-stone-50 font-medium">
                        🔒 Locked on Free Trial
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleLogoUpload}
                          className="text-[10px] block w-full text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-stone-150 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                        />
                        {logoError && <p className="text-[10px] text-red-500 font-medium">{logoError}</p>}
                        {data.logo_data_url && (
                          <button
                            type="button"
                            onClick={() => update("logo_data_url", null)}
                            className="text-[10px] text-red-500 hover:underline font-semibold block"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Show Apple/Google Wallet toggle */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <label className="flex items-center gap-2 text-xs font-semibold text-stone-750 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={data.plan !== "business"}
                        checked={!!data.design_settings?.show_wallet}
                        onChange={(e) => {
                          update("design_settings", {
                            ...(data.design_settings || {}),
                            show_wallet: e.target.checked
                          });
                        }}
                        className="rounded border-stone-300 text-brand focus:ring-brand disabled:opacity-50"
                      />
                      <span>Show &quot;Add to Apple/Google Wallet&quot; button</span>
                    </label>
                    {data.plan !== "business" && (
                      <p className="text-[9px] text-amber-600 font-semibold">
                        🔒 Premium Business Feature
                      </p>
                    )}
                  </div>
                </div>
              )}

              {editDesignTab === "qr" && (
                <div 
                  onFocusCapture={() => setActiveTabOverride("share")}
                  className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm text-left"
                >
                  <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5">🔲 Custom QR Code Art</h3>
                  {data.plan === "basic" ? (
                    <div className="text-[10px] text-stone-400 border border-dashed border-stone-200 p-4 rounded-xl text-center bg-stone-50 font-medium leading-relaxed">
                      🔒 Custom QR Code Art features are locked on Free trial. Upgrade to Pro or Business to make your QR code scan as art!
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
                      {/* Left: Inputs */}
                      <div className="space-y-3.5 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Dot Shape</label>
                            <select
                              value={data.qr_customization?.dotStyle || "square"}
                              onChange={(e) => {
                                update("qr_customization", {
                                  ...(data.qr_customization || {}),
                                  dotStyle: e.target.value as any
                                });
                              }}
                              className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                            >
                              <option value="square">Rigid Square</option>
                              <option value="rounded">Smooth Rounded</option>
                              <option value="dots">Circular Dots</option>
                              <option value="waves">Flowing Waves (Business)</option>
                              <option value="teardrops">Teardrops (Business)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Corner Frame</label>
                            <select
                              value={data.qr_customization?.cornerStyle || "square"}
                              onChange={(e) => {
                                update("qr_customization", {
                                  ...(data.qr_customization || {}),
                                  cornerStyle: e.target.value as any
                                });
                              }}
                              className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                            >
                              <option value="square">Rigid Squares</option>
                              <option value="rounded">Soft Rounded</option>
                              <option value="custom_frame">Camera Lens Circle (Business)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Logo Center</label>
                            <label className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold cursor-pointer py-1">
                              <input
                                type="checkbox"
                                checked={data.qr_customization?.logoEnabled !== false}
                                onChange={(e) => {
                                  update("qr_customization", {
                                    ...(data.qr_customization || {}),
                                    logoEnabled: e.target.checked
                                  });
                                }}
                                className="rounded border-stone-300 text-brand focus:ring-brand scale-90"
                              />
                              Center branding
                            </label>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">QR Color Style</label>
                            <select
                              value={data.qr_customization?.colorStyle || "solid"}
                              onChange={(e) => {
                                update("qr_customization", {
                                  ...(data.qr_customization || {}),
                                  colorStyle: e.target.value as any
                                });
                              }}
                              className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                            >
                              <option value="solid">Solid brand color</option>
                              <option value="gradient">High-Contrast Gradient (Business)</option>
                              <option value="spotlight">Corner Spotlighting (Business)</option>
                            </select>
                          </div>
                        </div>

                        {data.qr_customization?.colorStyle === "gradient" && (
                          <div className="grid grid-cols-2 gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-150 animate-fade-in">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-stone-500 uppercase block">Gradient start</label>
                              <input
                                type="color"
                                value={data.qr_customization?.gradientColor1 || brandColor}
                                onChange={(e) => {
                                  update("qr_customization", {
                                    ...(data.qr_customization || {}),
                                    gradientColor1: e.target.value
                                  });
                                }}
                                className="h-8 w-full rounded border border-stone-250 cursor-pointer p-0.5 bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-stone-500 uppercase block">Gradient end</label>
                              <input
                                type="color"
                                value={data.qr_customization?.gradientColor2 || "#10b981"}
                                onChange={(e) => {
                                  update("qr_customization", {
                                    ...(data.qr_customization || {}),
                                    gradientColor2: e.target.value
                                  });
                                }}
                                className="h-8 w-full rounded border border-stone-250 cursor-pointer p-0.5 bg-white"
                              />
                            </div>
                          </div>
                        )}

                        {data.qr_customization?.colorStyle === "spotlight" && (
                          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-150 animate-fade-in space-y-1">
                            <label className="text-[9px] font-bold text-stone-500 uppercase block">Spotlight Corner Color</label>
                            <input
                              type="color"
                              value={data.qr_customization?.spotlightColor || brandColor}
                              onChange={(e) => {
                                update("qr_customization", {
                                  ...(data.qr_customization || {}),
                                  spotlightColor: e.target.value
                                  });
                              }}
                              className="h-8 w-full rounded border border-stone-200 cursor-pointer p-0.5 bg-white"
                            />
                            <p className="text-[9px] text-stone-400 mt-1 leading-normal">
                              Highlights the three corner squares in a bold accent color.
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">QR Background Pattern</label>
                            <select
                              disabled={data.plan !== "business"}
                              value={data.qr_customization?.bg_texture || "none"}
                              onChange={(e) => {
                                update("qr_customization", {
                                  ...(data.qr_customization || {}),
                                  bg_texture: e.target.value as any
                                });
                              }}
                              className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer disabled:bg-stone-50 disabled:text-stone-400"
                            >
                              <option value="none">None (Solid white)</option>
                              <option value="wood">Earthy Wood {data.plan !== "business" && "🔒"}</option>
                              <option value="geometric">Geometric Dot-Grid {data.plan !== "business" && "🔒"}</option>
                              <option value="marble">Marble Veins {data.plan !== "business" && "🔒"}</option>
                              <option value="linen">Linen Crosshatch {data.plan !== "business" && "🔒"}</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">3D Depth Effect</label>
                            <select
                              disabled={data.plan !== "business"}
                              value={data.qr_customization?.threeDStyle || "none"}
                              onChange={(e) => {
                                update("qr_customization", {
                                  ...(data.qr_customization || {}),
                                  threeDStyle: e.target.value as any
                                });
                              }}
                              className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer disabled:bg-stone-50 disabled:text-stone-400"
                            >
                              <option value="none">Flat (2D)</option>
                              <option value="raised">3D Shadow Raised {data.plan !== "business" && "🔒"}</option>
                              <option value="embossed">Embossed depth {data.plan !== "business" && "🔒"}</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">CTA Symbol Accent</label>
                          <select
                            disabled={data.plan !== "business"}
                            value={data.qr_customization?.cta_style || "default"}
                            onChange={(e) => {
                              update("qr_customization", {
                                ...(data.qr_customization || {}),
                                cta_style: e.target.value as any
                              });
                            }}
                            className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer disabled:bg-stone-50 disabled:text-stone-400"
                          >
                            <option value="default">Standard Frame</option>
                            <option value="arrow">Down Arrow Symbol ⬇️ {data.plan !== "business" && "🔒"}</option>
                            <option value="hand">Pointing Hand 👉 {data.plan !== "business" && "🔒"}</option>
                            <option value="star">Promotional Star ⭐ {data.plan !== "business" && "🔒"}</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Physical CTA Frame Banner (Business)</label>
                          <input
                            disabled={data.plan !== "business"}
                            value={data.qr_customization?.custom_cta_frame || ""}
                            onChange={(e) => {
                              update("qr_customization", {
                                ...(data.qr_customization || {}),
                                custom_cta_frame: e.target.value
                              });
                            }}
                            placeholder="e.g. Scan me to explore our menu"
                            className="input py-1 text-xs disabled:bg-stone-50 disabled:text-stone-400"
                          />
                        </div>
                      </div>

                      {/* Right: Live Preview & Download */}
                      <div className="flex flex-col gap-4 items-center bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-xs w-full">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Live QR Art Preview</span>
                        {qrLoading ? (
                          <div className="w-8 h-8 rounded-full border-4 border-t-brand border-stone-200 animate-spin my-8" />
                        ) : qr ? (
                          <>
                            <img src={qr} alt="Live Custom QR" className="max-w-[200px] object-contain rounded-lg shadow-sm border border-stone-100 animate-fade-in bg-white" />
                            <button
                              type="button"
                              onClick={() => {
                                if (!qr) return;
                                const a = document.createElement("a");
                                a.href = qr;
                                a.download = `${data.business_name || "business"}_qr_code.png`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              }}
                              className="py-2.5 px-4 bg-brand text-white text-xs font-bold rounded-xl shadow-md w-full flex items-center justify-center gap-1.5 hover:opacity-90 transition-all cursor-pointer"
                              style={{ backgroundColor: brandColor }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              Download QR Code
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-stone-400 font-medium my-8">No QR available</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editDesignTab === "bc" && (
                <div 
                  onFocusCapture={() => setActiveTabOverride("share")}
                  className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm text-left"
                >
                  <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5">🪪 Printable Business Card Design</h3>
                  {data.plan !== "business" ? (
                    <div className="text-[10px] text-stone-400 border border-dashed border-stone-200 p-4 rounded-xl text-center bg-stone-55 font-medium leading-relaxed">
                      🔒 Custom printable card styling is locked. Upgrade to the Business plan to unlock card themes, background textures, rounded borders, watermark opacities, and neon border glows!
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
                      {/* Left: Inputs */}
                      <div className="space-y-3.5 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Card Theme</label>
                            <select
                              value={data.design_settings?.business_card?.theme || "classic"}
                              onChange={(e) => {
                                update("design_settings", {
                                  ...(data.design_settings || {}),
                                  business_card: {
                                    ...(data.design_settings?.business_card || {}),
                                    theme: e.target.value as any
                                  }
                                });
                              }}
                              className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                            >
                              <option value="classic">Classic (Brand background)</option>
                              <option value="modern_dark">Modern Dark (slate + glow)</option>
                              <option value="minimal_light">Minimal Light (borderless)</option>
                              <option value="luxury_gold">Luxury Gold (matte charcoal & gold)</option>
                              <option value="neon_glow">Neon Glow (electric cyan/green)</option>
                              <option value="organic_wood">Organic Wood (earthy brown)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Background Texture</label>
                            <select
                              value={data.design_settings?.business_card?.bg_texture || "none"}
                              onChange={(e) => {
                                update("design_settings", {
                                  ...(data.design_settings || {}),
                                  business_card: {
                                    ...(data.design_settings?.business_card || {}),
                                    bg_texture: e.target.value as any
                                  }
                                });
                              }}
                              className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                            >
                              <option value="none">None (Solid background)</option>
                              <option value="metal">Brushed Metal</option>
                              <option value="wood">Organic Wood Grain</option>
                              <option value="geometric">Geometric Grid</option>
                              <option value="marble">Thin Marble Veins</option>
                              <option value="linen">Linen Crosshatch</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold cursor-pointer py-1">
                            <input
                              type="checkbox"
                              checked={data.design_settings?.business_card?.show_logo !== false}
                              onChange={(e) => {
                                update("design_settings", {
                                  ...(data.design_settings || {}),
                                  business_card: {
                                    ...(data.design_settings?.business_card || {}),
                                    show_logo: e.target.checked
                                  }
                                });
                              }}
                              className="rounded border-stone-300 text-brand focus:ring-brand scale-90"
                            />
                            Show Front Logo
                          </label>

                          <label className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold cursor-pointer py-1">
                            <input
                              type="checkbox"
                              checked={!!data.design_settings?.business_card?.watermark_logo}
                              onChange={(e) => {
                                update("design_settings", {
                                  ...(data.design_settings || {}),
                                  business_card: {
                                    ...(data.design_settings?.business_card || {}),
                                    watermark_logo: e.target.checked
                                  }
                                });
                              }}
                              className="rounded border-stone-300 text-brand focus:ring-brand scale-90"
                            />
                            Watermark BG Logo
                          </label>
                        </div>

                        {data.design_settings?.business_card?.watermark_logo && (
                          <div className="space-y-1 p-2 bg-stone-50 border border-stone-150 rounded-xl animate-fade-in">
                            <div className="flex justify-between items-center text-[10px] font-bold text-stone-550">
                              <span>Watermark Opacity</span>
                              <span>{Math.round((data.design_settings?.business_card?.watermark_opacity || 0.15) * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.05"
                              max="1.0"
                              step="0.05"
                              value={data.design_settings?.business_card?.watermark_opacity ?? 0.15}
                              onChange={(e) => {
                                update("design_settings", {
                                  ...(data.design_settings || {}),
                                  business_card: {
                                    ...(data.design_settings?.business_card || {}),
                                    watermark_opacity: parseFloat(e.target.value)
                                  }
                                });
                              }}
                              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Border Radius</label>
                            <select
                              value={data.design_settings?.business_card?.border_radius || "medium"}
                              onChange={(e) => {
                                update("design_settings", {
                                  ...(data.design_settings || {}),
                                  business_card: {
                                    ...(data.design_settings?.business_card || {}),
                                    border_radius: e.target.value as any
                                  }
                                });
                              }}
                              className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                            >
                              <option value="none">Square (none)</option>
                              <option value="small">Small (rounded)</option>
                              <option value="medium">Medium (standard)</option>
                              <option value="large">Large (extra round)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Visual Border Glow</label>
                            <label className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold cursor-pointer py-2">
                              <input
                                type="checkbox"
                                checked={!!data.design_settings?.business_card?.border_glow}
                                onChange={(e) => {
                                  update("design_settings", {
                                    ...(data.design_settings || {}),
                                    business_card: {
                                      ...(data.design_settings?.business_card || {}),
                                      border_glow: e.target.checked
                                    }
                                  });
                                }}
                                className="rounded border-stone-300 text-brand focus:ring-brand scale-90"
                              />
                              Cyan/Neon border glow
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Right: Preview & Download */}
                      <div className="flex flex-col gap-4 items-center bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-xs w-full">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Live Business Card Preview</span>
                        {generatingPreview ? (
                          <div className="w-8 h-8 rounded-full border-4 border-t-brand border-stone-200 animate-spin my-8" />
                        ) : businessCardPreview ? (
                          <>
                            <img src={businessCardPreview} alt="Business Card Preview" className="max-w-full rounded-lg shadow-md border animate-fade-in animate-duration-300" />
                            <button
                              type="button"
                              onClick={handleDownloadBusinessCard}
                              className="py-2.5 px-4 bg-brand text-white text-xs font-bold rounded-xl shadow-md w-full flex items-center justify-center gap-1.5 hover:opacity-90 transition-all cursor-pointer"
                              style={{ backgroundColor: brandColor }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              Download Business Card
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-stone-400 font-medium my-8">No preview available</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editDesignTab === "flyer" && (
                <div 
                  onFocusCapture={() => setActiveTabOverride("share")}
                  className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm text-left"
                >
                  <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5">📋 Stand Flyer Customization</h3>
                  {data.plan !== "business" ? (
                    <div className="text-[10px] text-stone-400 border border-dashed border-stone-200 p-4 rounded-xl text-center bg-stone-50 font-medium leading-relaxed">
                      🔒 Custom printable stand flyer is locked. Upgrade to the Business plan to customize WiFi headers and print beautiful side-by-side stand tables.
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
                      {/* Left: Inputs */}
                      <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">WiFi Section Title</label>
                          <input
                            type="text"
                            value={data.design_settings?.stand_flyer?.wifi_title ?? ""}
                            onChange={(e) => {
                              update("design_settings", {
                                ...(data.design_settings || {}),
                                stand_flyer: {
                                  ...(data.design_settings?.stand_flyer || {}),
                                  wifi_title: e.target.value
                                }
                              });
                            }}
                            placeholder="Relax & Connect!"
                            className="input"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">WiFi Subtitle Line 1</label>
                          <input
                            type="text"
                            value={data.design_settings?.stand_flyer?.wifi_text1 ?? ""}
                            onChange={(e) => {
                              update("design_settings", {
                                ...(data.design_settings || {}),
                                stand_flyer: {
                                  ...(data.design_settings?.stand_flyer || {}),
                                  wifi_text1: e.target.value
                                }
                              });
                            }}
                            placeholder="Enjoy free WiFi while"
                            className="input"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">WiFi Subtitle Line 2</label>
                          <input
                            type="text"
                            value={data.design_settings?.stand_flyer?.wifi_text2 ?? ""}
                            onChange={(e) => {
                              update("design_settings", {
                                ...(data.design_settings || {}),
                                stand_flyer: {
                                  ...(data.design_settings?.stand_flyer || {}),
                                  wifi_text2: e.target.value
                                }
                              });
                            }}
                            placeholder="you are at our venue."
                            className="input"
                          />
                        </div>

                        {/* Flyer styling controls */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Flyer Theme</label>
                            <select
                              value={data.design_settings?.stand_flyer?.theme || "dark_matte"}
                              onChange={(e) => {
                                update("design_settings", {
                                  ...(data.design_settings || {}),
                                  stand_flyer: {
                                    ...(data.design_settings?.stand_flyer || {}),
                                    theme: e.target.value as any
                                  }
                                });
                              }}
                              className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                            >
                              <option value="dark_matte">Dark Matte (Charcoal)</option>
                              <option value="light_elegant">Light Elegant (Cream)</option>
                              <option value="brand_accent">Brand Accent (Color)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Background Texture</label>
                            <select
                              value={data.design_settings?.stand_flyer?.bg_texture || "none"}
                              onChange={(e) => {
                                update("design_settings", {
                                  ...(data.design_settings || {}),
                                  stand_flyer: {
                                    ...(data.design_settings?.stand_flyer || {}),
                                    bg_texture: e.target.value as any
                                  }
                                });
                              }}
                              className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                            >
                              <option value="none">None (Solid)</option>
                              <option value="geometric">Geometric Radial Grid</option>
                              <option value="linen">Elegant Linen</option>
                              <option value="wood">Wood Grain</option>
                              <option value="marble">Classic Marble</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-stone-100">
                          <label className="flex items-center gap-2 text-xs font-semibold text-stone-750 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={data.design_settings?.stand_flyer?.show_logo !== false}
                              onChange={(e) => {
                                update("design_settings", {
                                  ...(data.design_settings || {}),
                                  stand_flyer: {
                                    ...(data.design_settings?.stand_flyer || {}),
                                    show_logo: e.target.checked
                                  }
                                });
                              }}
                              className="rounded border-stone-300 text-brand focus:ring-brand scale-90"
                            />
                            <span>Show Business Logo at the Top</span>
                          </label>
                        </div>

                        {(!data.sections?.some(s => s.type === "wifi" && s.enabled !== false && s.data?.ssid)) ? (
                          <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-xl text-center space-y-2.5">
                            <p className="text-[10px] text-amber-800 font-medium leading-normal">
                              ⚠️ <strong>WiFi Credentials Not Configured:</strong> The Stand Flyer requires active WiFi details to show a side-by-side WiFi QR code. Currently, it only displays the Business QR.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setData((prev) => {
                                  const sections = [...(prev.sections || [])];
                                  const wifiIdx = sections.findIndex(s => s.type === "wifi");
                                  if (wifiIdx === -1) {
                                    sections.push({
                                      type: "wifi",
                                      title: "WiFi Access",
                                      enabled: true,
                                      data: { ssid: "", password: "", show_password: true }
                                    });
                                  } else {
                                    sections[wifiIdx] = {
                                      ...sections[wifiIdx],
                                      enabled: true
                                    };
                                  }
                                  return { ...prev, sections };
                                });
                                
                                setTimeout(() => {
                                  document.getElementById("section-editor-wifi")?.scrollIntoView({ behavior: "smooth" });
                                  const el = document.getElementById("section-editor-wifi");
                                  if (el) {
                                    el.classList.add("ring-2", "ring-brand");
                                    setTimeout(() => el.classList.remove("ring-2", "ring-brand"), 2000);
                                  }
                                }, 100);
                              }}
                              className="py-1.5 px-3 bg-brand/10 hover:bg-brand/15 text-brand text-[10px] font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                              + Add WiFi Credentials
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {/* Right: Preview & Download */}
                      <div className="flex flex-col gap-4 items-center bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-xs w-full">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Live Stand Flyer Preview</span>
                        {generatingFlyerPreview ? (
                          <div className="w-8 h-8 rounded-full border-4 border-t-brand border-stone-200 animate-spin my-8" />
                        ) : flyerPreview ? (
                          <>
                            <img src={flyerPreview} alt="Stand Flyer Preview" className="max-w-[200px] rounded-lg shadow-md border animate-fade-in" />
                            <button
                              type="button"
                              onClick={handleDownloadFlyer}
                              className="py-2.5 px-4 bg-brand text-white text-xs font-bold rounded-xl shadow-md w-full flex items-center justify-center gap-1.5 hover:opacity-90 transition-all cursor-pointer"
                              style={{ backgroundColor: brandColor }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              Download Stand Flyer
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-stone-400 font-medium my-8">No preview available</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: brandColor }}
                  className="w-full py-3 bg-brand text-white rounded-2xl font-bold text-sm shadow-sm hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Column 3: Live Preview (Right) */}
          <div className="hidden lg:sticky lg:top-24 lg:flex flex-col gap-6">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Live digital card preview
            </h3>
            
            <div className="bg-stone-100 rounded-3xl p-5 border border-stone-200 shadow-inner flex flex-col items-center gap-4 min-h-[300px]">
              <CardPreview 
                data={data} 
                onSaveContact={downloadVCardPreview} 
                activeTabOverride={activeTabOverride}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: STYLE & LAYOUT (Wizard Mode only) */}
      {isWizard && currentStep === 4 && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="grid lg:grid-cols-[1.1fr_1.1fr_0.8fr] gap-6 items-start">
          
          {/* Column 1 (Left): Style overrides & navigation */}
          <div 
            onFocusCapture={() => setActiveTabOverride("profile")}
            className="space-y-6 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm"
          >
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5 flex items-center gap-1.5">
              <span>🧭 Layout &amp; Navigation</span>
            </h3>

             {/* Theme Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Card Theme</label>
              <select
                value={data.theme}
                onChange={(e) => update("theme", e.target.value as ThemeId)}
                className="w-full h-9 rounded-lg border border-stone-250 bg-white px-2.5 text-xs outline-none focus:border-stone-500 text-stone-700 font-medium cursor-pointer"
              >
                {(Object.keys(THEME_LABELS) as ThemeId[]).map((id) => {
                  const isBusinessOnly = id === "glassmorphic" || id === "neonDark" || id === "claymorphic" || id === "neumorphic" || id === "skeuomorphic" || id === "liquidGlass";
                  const isLocked =
                    (data.plan === "basic" && id !== "classic") ||
                    (data.plan === "pro" && isBusinessOnly);
                  const lockSuffix = isLocked ? ` (🔒 ${isBusinessOnly ? "Business" : "Pro"})` : "";
                  return (
                    <option key={id} value={id} disabled={isLocked}>
                      {THEME_LABELS[id]}{lockSuffix}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Default Landing Navigation Tab Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Default Landing Tab</label>
              {data.plan !== "business" ? (
                <div className="text-[10px] text-stone-400 bg-stone-50 border border-stone-200 p-2 rounded-lg font-medium">
                  🔒 Locked on Free/Pro (Loads based on category template)
                </div>
              ) : (
                <select
                  value={data.design_settings?.default_nav_tab || ""}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    update("design_settings", {
                      ...(data.design_settings || {}),
                      default_nav_tab: val
                    });
                  }}
                  className="w-full h-9 rounded-lg border border-stone-250 bg-white px-2.5 text-xs outline-none focus:border-stone-500 text-stone-700 font-medium cursor-pointer"
                >
                  <option value="">Auto-detected (Recommended)</option>
                  <option value="profile">About</option>
                  {(() => {
                    const uniqueTabs: { id: string, label: string, key: string }[] = [];
                    const added = new Set<string>();
                    
                    data.sections?.filter((s: any) => s.enabled !== false && s.type !== "hero" && s.type !== "room_service").forEach((s: any) => {
                      let label = s.title;
                      let id = "";
                      if (s.type === "menu") { label = "Menu"; id = "menu"; }
                      else if (s.type === "services" || s.type === "courses") { label = "Services"; id = "services"; }
                      else if (s.type === "gallery") { label = "Gallery"; id = "gallery"; }
                      else if (s.type === "featured_products" || s.type === "pricing_table") { label = "Products"; id = "products"; }
                      else if (s.type === "wifi") { label = "WiFi"; id = "wifi"; }
                      else if (s.type === "location" || s.type === "hours") { label = "Location"; id = "location"; }
                      else if (s.type === "booking" || s.type === "lead_capture") { label = "Booking"; id = "booking"; }
                      else if (s.type === "review") { label = "Reviews"; id = "review"; }
                      else return;

                      if (!added.has(id)) {
                        added.add(id);
                        uniqueTabs.push({ id, label, key: s.type });
                      }
                    });

                    return uniqueTabs.map((t) => (
                      <option key={t.key} value={t.id}>
                        {t.label} Section
                      </option>
                    ));
                  })()}
                </select>
              )}
            </div>

            {/* Content Alignment Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Content Alignment</label>
              {data.plan !== "business" ? (
                <div className="text-[10px] text-stone-400 bg-stone-50 border border-stone-200 p-2 rounded-lg font-medium">
                  🔒 Locked on Free/Pro (Default centered)
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {(["left", "center", "right"] as const).map((align) => {
                    const isSel = (data.design_settings?.alignment || "center") === align;
                    return (
                      <button
                        key={align}
                        type="button"
                        onClick={() => {
                          update("design_settings", {
                            ...(data.design_settings || {}),
                            alignment: align
                          });
                        }}
                        className={`py-1.5 px-2 border rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                          isSel
                            ? "border-brand bg-brand-light ring-1 ring-brand text-stone-900"
                            : "border-stone-200 bg-white hover:bg-stone-50 text-stone-600"
                        }`}
                      >
                        {align.charAt(0).toUpperCase() + align.slice(1)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section Reordering List */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Section Order &amp; Status</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {data.sections?.filter((s: any) => s.type !== "hero" && s.type !== "room_service").map((section: any, idx: number) => {
                  const locked = isSectionLocked(section.type, data.plan, section.data);
                  return (
                    <div key={section.type} className="flex items-center justify-between p-2 border border-stone-150 rounded-xl bg-stone-50/50 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <div className="flex flex-col">
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
                            className="text-[9px] text-stone-400 hover:text-stone-700 disabled:opacity-30 leading-none py-0.5"
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
                            className="text-[9px] text-stone-400 hover:text-stone-700 disabled:opacity-30 leading-none py-0.5"
                          >
                            ▼
                          </button>
                        </div>
                        <span className="font-semibold text-stone-700 truncate max-w-[100px]">
                          {locked && "🔒 "}{section.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={section.enabled !== false}
                          disabled={locked}
                          onChange={(e) => {
                            const list = [...(data.sections || [])];
                            const idxInSection = list.findIndex(s => s.type === section.type);
                            if (idxInSection !== -1) {
                              list[idxInSection] = { ...list[idxInSection], enabled: e.target.checked };
                              update("sections", list);
                            }
                          }}
                          className="rounded border-stone-300 text-brand focus:ring-brand scale-90"
                        />
                        <span className="text-[10px] text-stone-500 font-medium">On</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section theme overrides (Business plan only) */}
            {data.plan === "business" && data.sections && data.sections.filter((s: any) => s.type !== "hero" && s.type !== "room_service" && s.enabled !== false).length > 0 && (
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">🎨 Section Theme Overrides</label>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {data.sections
                    .filter((s: any) => s.type !== "hero" && s.type !== "room_service" && s.enabled !== false)
                    .map((sec: any) => (
                      <div key={sec.type} className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold text-stone-600 truncate">{sec.title}</span>
                        <select
                          value={sec.theme || ""}
                          onChange={(e) => {
                            const list = [...(data.sections || [])];
                            const idx = list.findIndex(x => x.type === sec.type);
                            if (idx !== -1) {
                              list[idx] = { ...list[idx], theme: (e.target.value || undefined) as any };
                              update("sections", list);
                            }
                          }}
                          className="h-7 rounded border border-stone-250 bg-white px-1.5 text-[10px] outline-none text-stone-700 font-medium cursor-pointer w-28"
                        >
                          <option value="">Inherit</option>
                          <option value="classic">Classic</option>
                          <option value="minimal">Minimal</option>
                          <option value="bold">Bold</option>
                          <option value="gradient">Gradient</option>
                          <option value="glassmorphic">Glassmorphic</option>
                          <option value="neonDark">Neon Dark</option>
                        </select>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Show Apple/Google Wallet toggle */}
            <div className="space-y-1.5 pt-2 pb-2 border-t border-stone-100">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-750 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={data.plan !== "business"}
                  checked={!!data.design_settings?.show_wallet}
                  onChange={(e) => {
                    update("design_settings", {
                      ...(data.design_settings || {}),
                      show_wallet: e.target.checked
                    });
                  }}
                  className="rounded border-stone-300 text-brand focus:ring-brand disabled:opacity-50"
                />
                <span>Show &quot;Add to Apple/Google Wallet&quot; button</span>
              </label>
              {data.plan !== "business" && (
                <p className="text-[9px] text-amber-600 font-semibold">
                  🔒 Premium Business Feature
                </p>
              )}
            </div>

            {/* Button to go to Step 5 */}
            <div className="pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={nextStep}
                style={{ backgroundColor: brandColor }}
                className="w-full py-3.5 bg-brand text-white rounded-2xl font-bold text-sm shadow-sm hover:opacity-95 transition-opacity cursor-pointer text-center"
              >
                Continue to Review &rarr;
              </button>
            </div>
          </div>

          {/* Column 2 (Center): Branding & Colors panel */}
          <div 
            onFocusCapture={() => setActiveTabOverride("profile")}
            className="space-y-6"
          >
            {/* Vibes & Colors Block */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm text-left">
              <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5 flex justify-between items-center">
                <span>🎨 Vibes &amp; Colors</span>
                {data.plan !== "basic" && (
                  <span className="text-[9px] font-bold text-brand bg-brand-light/30 border border-brand/20 px-2 py-0.5 rounded uppercase">
                    {data.plan}
                  </span>
                )}
              </h3>

              {/* Vibe Presets selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Color vibe preset</label>
                {data.plan !== "business" ? (
                  <div className="text-[10px] text-stone-400 bg-stone-50 border border-stone-200 p-2 rounded-lg font-medium">
                    🔒 Locked on Free/Pro (Choose custom color below or upgrade to Business for presets)
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "corporate", label: "Corporate", desc: "Navy / Professional", color: "#1e40af" },
                      { id: "luxury", label: "Luxury", desc: "Gold / Matte Black", color: "#d4af37" },
                      { id: "creative", label: "Creative", desc: "Pink / Flowing", color: "#ec4899" },
                      { id: "eco", label: "Eco-Friendly", desc: "Green / Earthy", color: "#15803d" },
                    ].map((v) => {
                      const isSel = data.design_settings?.vibe === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            let vibeColor = "#085041";
                            if (v.id === "corporate") vibeColor = "#1e40af";
                            else if (v.id === "luxury") vibeColor = "#d4af37";
                            else if (v.id === "creative") vibeColor = "#ec4899";
                            else if (v.id === "eco") vibeColor = "#15803d";

                            setData((d) => ({
                              ...d,
                              brand_color: vibeColor,
                              text_color: null,
                              design_settings: {
                                ...(d.design_settings || {}),
                                vibe: v.id as any
                              }
                            }));
                          }}
                          className={`p-2 border rounded-xl flex flex-col items-start transition-all cursor-pointer text-left h-full ${
                            isSel
                              ? "border-brand bg-brand-light ring-1 ring-brand"
                              : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }}></span>
                            <span className="font-bold text-[11px] text-stone-900">{v.label}</span>
                          </div>
                          <span className="text-[9px] text-stone-400 font-semibold mt-0.5">{v.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {data.plan === "business" && data.design_settings?.vibe && (
                  <button
                    type="button"
                    onClick={() => {
                      update("design_settings", {
                        ...(data.design_settings || {}),
                        vibe: null
                      });
                    }}
                    className="text-[9px] text-stone-450 hover:text-stone-700 font-bold block"
                  >
                    Clear Preset / Custom Color
                  </button>
                )}
              </div>

              {/* Colors Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Brand Color</label>
                  {data.plan === "basic" ? (
                    <div className="h-9 rounded-lg border border-stone-200 bg-stone-50 flex items-center px-2 gap-1.5 text-[10px] text-stone-450">
                      <div className="w-3.5 h-3.5 rounded-full border border-stone-300" style={{ backgroundColor: "#085041" }}></div>
                      <span>Locked</span>
                    </div>
                  ) : (
                    <input
                      type="color"
                      value={data.brand_color || "#085041"}
                      onChange={(e) => update("brand_color", e.target.value)}
                      className="h-9 w-full rounded-lg border border-stone-250 cursor-pointer p-0.5"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Text Color</label>
                  {data.plan === "basic" ? (
                    <div className="h-9 rounded-lg border border-stone-200 bg-stone-55 flex items-center px-2 gap-1.5 text-[10px] text-stone-400">
                      <div className="w-3.5 h-3.5 rounded-full border border-stone-300" style={{ backgroundColor: "#ffffff" }}></div>
                      <span>Locked</span>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <input
                        type="color"
                        value={data.text_color || "#ffffff"}
                        onChange={(e) => update("text_color", e.target.value)}
                        className="h-9 flex-1 rounded-lg border border-stone-250 cursor-pointer p-0.5"
                      />
                      {data.text_color && (
                        <button
                          type="button"
                          onClick={() => update("text_color", null)}
                          className="text-[9px] text-stone-500 border border-stone-250 rounded-lg px-2 h-9 hover:bg-stone-50"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Logo & Background Image Uploads */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Logo Upload</label>
                  {data.plan === "basic" ? (
                    <div className="text-[10px] text-stone-400 border border-dashed border-stone-200 p-2 rounded-lg text-center bg-stone-50 font-medium">
                      🔒 Locked on Free Trial
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleLogoUpload}
                        className="text-[10px] block w-full text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-stone-150 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                      />
                      {logoError && <p className="text-[10px] text-red-500 font-medium">{logoError}</p>}
                      {data.logo_data_url && (
                        <button
                          type="button"
                          onClick={() => update("logo_data_url", null)}
                          className="text-[10px] text-red-500 hover:underline font-semibold block"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Custom Background Image</label>
                  {data.plan !== "business" ? (
                    <div className="text-[10px] text-stone-400 bg-stone-50 border border-stone-200 p-2 rounded-lg font-medium">
                      🔒 Locked on Free/Pro (Upgrade to Business to upload custom BG image)
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleBackgroundUpload}
                        className="text-[10px] block w-full text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-stone-150 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                      />
                      {bgImageError && <p className="text-[10px] text-red-500 font-medium">{bgImageError}</p>}
                      {data.background_data_url && (
                        <button
                          type="button"
                          onClick={() => update("background_data_url", null)}
                          className="text-[10px] text-stone-500 hover:underline font-semibold block"
                        >
                          Remove Background
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Background Textures */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Background Texture</label>
                {data.plan !== "business" ? (
                  <div className="text-[10px] text-stone-400 bg-stone-50 border border-stone-200 p-2 rounded-lg font-medium">
                    🔒 Locked on Free/Pro (Upgrade to Business to choose custom textures)
                  </div>
                ) : (
                  <select
                    value={data.design_settings?.bg_texture || "none"}
                    onChange={(e) => {
                      update("design_settings", {
                        ...(data.design_settings || {}),
                        bg_texture: e.target.value as any
                      });
                    }}
                    className="w-full h-9 rounded-lg border border-stone-250 bg-white px-2.5 text-xs outline-none focus:border-stone-500 text-stone-700 font-medium cursor-pointer"
                  >
                    <option value="none">None (Solid color)</option>
                    <option value="metal">Brushed Metal</option>
                    <option value="wood">Wood Grain / Organic</option>
                    <option value="geometric">Geometric Radial Grid</option>
                    <option value="motion">Flowing Motion Gradient</option>
                  </select>
                )}
              </div>

              {/* Neomorphic toggle & animations selection */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">3D Neomorphism</label>
                  {data.plan !== "business" ? (
                    <div className="text-[10px] text-stone-400 bg-stone-50 border border-stone-200 p-2 rounded-lg font-medium">
                      🔒 Locked on Free/Pro
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 text-xs font-semibold text-stone-750 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!data.design_settings?.embossed_effect}
                        onChange={(e) => {
                          update("design_settings", {
                            ...(data.design_settings || {}),
                            embossed_effect: e.target.checked
                          });
                        }}
                        className="rounded border-stone-300 text-brand focus:ring-brand"
                      />
                      <span>Embossed Effect</span>
                    </label>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Intro Animation</label>
                  {data.plan !== "business" ? (
                    <div className="text-[10px] text-stone-400 bg-stone-50 border border-stone-200 p-2 rounded-lg font-medium">
                      🔒 Locked on Free/Pro
                    </div>
                  ) : (
                    <select
                      value={data.design_settings?.animation || "none"}
                      onChange={(e) => {
                        update("design_settings", {
                          ...(data.design_settings || {}),
                          animation: e.target.value as any
                        });
                      }}
                      className="w-full h-9 rounded-lg border border-stone-250 bg-white px-2.5 text-xs outline-none focus:border-stone-500 text-stone-700 font-medium cursor-pointer"
                    >
                      <option value="none">None</option>
                      <option value="float">Floating / Levitate</option>
                      <option value="pulse">Soft Pulse</option>
                      <option value="fade">Fade In</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Business Card Layout Override */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">🪪 Downloadable Card Layout</label>
                {data.plan === "basic" ? (
                  <div className="text-[10px] text-stone-450 bg-stone-50 border border-stone-250 p-2 rounded-lg font-medium">
                    🔒 Locked on Free Trial
                  </div>
                ) : (
                  <select
                    disabled={data.plan === "pro"}
                    value={data.card_layout || "classic"}
                    onChange={(e) => update("card_layout", e.target.value as any)}
                    className="h-9 w-full rounded-lg border border-stone-250 bg-white px-2.5 text-xs outline-none focus:border-stone-500 text-stone-700 font-medium cursor-pointer disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed"
                  >
                    <option value="classic">Classic (Brand background)</option>
                    <option value="modern_dark">Modern Dark (slate + glow)</option>
                    <option value="minimal_light">Minimal Light (borderless)</option>
                  </select>
                )}
              </div>

            </div>
          </div>

          {/* Column 3 (Right): Sticky preview column */}
          <div className="hidden lg:sticky lg:top-24 lg:flex flex-col gap-6">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Live design preview</h3>
            
            <div className="bg-stone-100 rounded-3xl p-5 border border-stone-200 shadow-inner flex flex-col items-center gap-4">
              <CardPreview 
                data={data} 
                onSaveContact={downloadVCardPreview} 
                activeTabOverride={activeTabOverride}
              />
            </div>
          </div>

          </div>

          {/* Row 2: Custom QR Code Art */}
          <div 
            onFocusCapture={() => setActiveTabOverride("share")}
            className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6 shadow-sm text-left"
          >
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5 flex items-center justify-between">
              <span>🔲 Custom QR Code Art</span>
              {data.plan !== "basic" && (
                <span className="text-[9px] font-bold text-brand bg-brand-light/30 border border-brand/20 px-2 py-0.5 rounded uppercase">
                  Premium
                </span>
              )}
            </h3>

            {data.plan === "basic" ? (
              <div className="text-[10px] text-stone-400 border border-dashed border-stone-200 p-4 rounded-xl text-center bg-stone-50 font-medium leading-relaxed">
                🔒 Custom QR Code Art features are locked on Free trial. Upgrade to Pro or Business to make your QR code scan as art!
              </div>
            ) : (
              <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
                {/* Left: Inputs */}
                <div className="space-y-3.5 text-xs">
                  {/* Dot styles & corner style */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Dot Shape</label>
                      <select
                        value={data.qr_customization?.dotStyle || "square"}
                        onChange={(e) => {
                          update("qr_customization", {
                            ...(data.qr_customization || {}),
                            dotStyle: e.target.value as any
                          });
                        }}
                        className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                      >
                        <option value="square">Rigid Square</option>
                        <option value="rounded">Smooth Rounded</option>
                        <option value="dots">Circular Dots</option>
                        <option value="waves">Flowing Waves (Business)</option>
                        <option value="teardrops">Teardrops (Business)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Corner Frame</label>
                      <select
                        value={data.qr_customization?.cornerStyle || "square"}
                        onChange={(e) => {
                          update("qr_customization", {
                            ...(data.qr_customization || {}),
                            cornerStyle: e.target.value as any
                          });
                        }}
                        className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                      >
                        <option value="square">Rigid Squares</option>
                        <option value="rounded">Soft Rounded</option>
                        <option value="custom_frame">Camera Lens Circle (Business)</option>
                      </select>
                    </div>
                  </div>

                  {/* Logo Center customization */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Logo Center</label>
                      <label className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.qr_customization?.logoEnabled !== false}
                          onChange={(e) => {
                            update("qr_customization", {
                              ...(data.qr_customization || {}),
                              logoEnabled: e.target.checked
                            });
                          }}
                          className="rounded border-stone-300 text-brand focus:ring-brand scale-90"
                        />
                        Center branding
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Logo Frame Style</label>
                      <select
                        disabled={data.qr_customization?.logoEnabled === false}
                        value={data.qr_customization?.centerLogoType || "standard"}
                        onChange={(e) => {
                          update("qr_customization", {
                            ...(data.qr_customization || {}),
                            centerLogoType: e.target.value as any
                          });
                        }}
                        className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer disabled:bg-stone-50 disabled:text-stone-400"
                      >
                        <option value="standard">Standard Circular clip</option>
                        <option value="pixelated">Retro Pixelated block</option>
                      </select>
                    </div>
                  </div>

                  {/* QR Color Style */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">QR Color Style</label>
                    <select
                      value={data.qr_customization?.colorStyle || "solid"}
                      onChange={(e) => {
                        update("qr_customization", {
                          ...(data.qr_customization || {}),
                          colorStyle: e.target.value as any
                        });
                      }}
                      className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                    >
                      <option value="solid">Solid brand color</option>
                      <option value="gradient">High-Contrast Gradient (Business)</option>
                      <option value="spotlight">Corner Spotlighting (Business)</option>
                    </select>
                  </div>

                  {/* Dynamic Color Style pickers */}
                  {data.qr_customization?.colorStyle === "gradient" && (
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-150 animate-fade-in">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-stone-500 uppercase block">Gradient start</label>
                        <input
                          type="color"
                          value={data.qr_customization?.gradientColor1 || brandColor}
                          onChange={(e) => {
                            update("qr_customization", {
                              ...(data.qr_customization || {}),
                              gradientColor1: e.target.value
                            });
                          }}
                          className="h-8 w-full rounded border border-stone-250 cursor-pointer p-0.5 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-stone-500 uppercase block">Gradient end</label>
                        <input
                          type="color"
                          value={data.qr_customization?.gradientColor2 || "#10b981"}
                          onChange={(e) => {
                            update("qr_customization", {
                              ...(data.qr_customization || {}),
                              gradientColor2: e.target.value
                            });
                          }}
                          className="h-8 w-full rounded border border-stone-250 cursor-pointer p-0.5 bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {data.qr_customization?.colorStyle === "spotlight" && (
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-150 animate-fade-in space-y-1">
                      <label className="text-[9px] font-bold text-stone-500 uppercase block">Spotlight Corner Color</label>
                      <input
                        type="color"
                        value={data.qr_customization?.spotlightColor || brandColor}
                        onChange={(e) => {
                          update("qr_customization", {
                            ...(data.qr_customization || {}),
                            spotlightColor: e.target.value
                          });
                        }}
                        className="h-8 w-full rounded border border-stone-200 cursor-pointer p-0.5 bg-white"
                      />
                      <p className="text-[9px] text-stone-450 mt-1 leading-normal">
                        Highlights the three corner squares in a bold accent color.
                      </p>
                    </div>
                  )}

                  {/* QR Background Texture & 3D Shadow Style */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">QR Background Pattern</label>
                      <select
                        disabled={data.plan !== "business"}
                        value={data.qr_customization?.bg_texture || "none"}
                        onChange={(e) => {
                          update("qr_customization", {
                            ...(data.qr_customization || {}),
                            bg_texture: e.target.value as any
                          });
                        }}
                        className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer disabled:bg-stone-50 disabled:text-stone-400"
                      >
                        <option value="none">None (Solid white)</option>
                        <option value="wood">Earthy Wood {data.plan !== "business" && "🔒"}</option>
                        <option value="geometric">Geometric Dot-Grid {data.plan !== "business" && "🔒"}</option>
                        <option value="marble">Marble Veins {data.plan !== "business" && "🔒"}</option>
                        <option value="linen">Linen Crosshatch {data.plan !== "business" && "🔒"}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">3D Depth Effect</label>
                      <select
                        disabled={data.plan !== "business"}
                        value={data.qr_customization?.threeDStyle || "none"}
                        onChange={(e) => {
                          update("qr_customization", {
                            ...(data.qr_customization || {}),
                            threeDStyle: e.target.value as any
                          });
                        }}
                        className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer disabled:bg-stone-50 disabled:text-stone-400"
                      >
                        <option value="none">Flat (2D)</option>
                        <option value="raised">3D Shadow Raised {data.plan !== "business" && "🔒"}</option>
                        <option value="embossed">Embossed depth {data.plan !== "business" && "🔒"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Call-to-Action Visual Symbol */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">CTA Symbol Accent</label>
                    <select
                      disabled={data.plan !== "business"}
                      value={data.qr_customization?.cta_style || "default"}
                      onChange={(e) => {
                        update("qr_customization", {
                          ...(data.qr_customization || {}),
                          cta_style: e.target.value as any
                        });
                      }}
                      className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer disabled:bg-stone-50 disabled:text-stone-400"
                    >
                      <option value="default">Standard Frame</option>
                      <option value="arrow">Down Arrow Symbol ⬇️ {data.plan !== "business" && "🔒"}</option>
                      <option value="hand">Pointing Hand 👉 {data.plan !== "business" && "🔒"}</option>
                      <option value="star">Promotional Star ⭐ {data.plan !== "business" && "🔒"}</option>
                    </select>
                  </div>

                  {/* Physical Engraved / Custom CTA banner */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Physical CTA Frame Banner (Business)</label>
                    <input
                      disabled={data.plan !== "business"}
                      value={data.qr_customization?.custom_cta_frame || ""}
                      onChange={(e) => {
                        update("qr_customization", {
                          ...(data.qr_customization || {}),
                          custom_cta_frame: e.target.value
                        });
                      }}
                      placeholder="e.g. Scan me to explore our menu"
                      className="input py-1 text-xs disabled:bg-stone-50 disabled:text-stone-400"
                    />
                    <p className="text-[9px] text-stone-450 leading-normal mt-1.5">
                      Adds an integrated colored frame banner below the QR code.
                    </p>
                  </div>
                </div>

                {/* Right: Live Preview & Download */}
                <div className="flex flex-col gap-4 items-center bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-xs w-full">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Live QR Art Preview</span>
                  {qrLoading ? (
                    <div className="w-8 h-8 rounded-full border-4 border-t-brand border-stone-200 animate-spin my-8" />
                  ) : qr ? (
                    <>
                      <img src={qr} alt="Live Custom QR" className="max-w-[200px] object-contain rounded-lg shadow-sm border border-stone-100 animate-fade-in bg-white" />
                      <button
                        type="button"
                        onClick={() => {
                          if (!qr) return;
                          const a = document.createElement("a");
                          a.href = qr;
                          a.download = `${data.business_name || "business"}_qr_code.png`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }}
                        className="py-2.5 px-4 bg-brand text-white text-xs font-bold rounded-xl shadow-md w-full flex items-center justify-center gap-1.5 hover:opacity-90 transition-all cursor-pointer"
                        style={{ backgroundColor: brandColor }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download QR Code
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-stone-400 font-medium my-8">No QR available</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Row 3: Printable Business Card Design */}
          <div 
            onFocusCapture={() => setActiveTabOverride("share")}
            className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6 shadow-sm text-left"
          >
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5 flex items-center justify-between">
              <span>🪪 Printable Business Card Design</span>
              <span className="text-[9px] font-bold text-brand bg-brand-light/30 border border-brand/20 px-2 py-0.5 rounded uppercase">
                {data.plan === "business" ? "Business" : "🔒 Business Feature"}
              </span>
            </h3>

            {data.plan !== "business" ? (
              <div className="text-[10px] text-stone-400 border border-dashed border-stone-200 p-4 rounded-xl text-center bg-stone-50 font-medium leading-relaxed">
                🔒 Custom printable card styling is locked. Upgrade to the Business plan to unlock card themes, background textures, rounded borders, watermark opacities, and neon border glows!
              </div>
            ) : (
              <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
                {/* Left: Inputs */}
                <div className="space-y-3.5 text-xs">
                  {/* Theme & Background Texture */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Card Theme</label>
                      <select
                        value={data.design_settings?.business_card?.theme || "classic"}
                        onChange={(e) => {
                          update("design_settings", {
                            ...(data.design_settings || {}),
                            business_card: {
                              ...(data.design_settings?.business_card || {}),
                              theme: e.target.value as any
                            }
                          });
                        }}
                        className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                      >
                        <option value="classic">Classic (Brand background)</option>
                        <option value="modern_dark">Modern Dark (slate + glow)</option>
                        <option value="minimal_light">Minimal Light (borderless)</option>
                        <option value="luxury_gold">Luxury Gold (matte charcoal & gold)</option>
                        <option value="neon_glow">Neon Glow (electric cyan/green)</option>
                        <option value="organic_wood">Organic Wood (earthy brown)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Background Texture</label>
                      <select
                        value={data.design_settings?.business_card?.bg_texture || "none"}
                        onChange={(e) => {
                          update("design_settings", {
                            ...(data.design_settings || {}),
                            business_card: {
                              ...(data.design_settings?.business_card || {}),
                              bg_texture: e.target.value as any
                            }
                          });
                        }}
                        className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                      >
                        <option value="none">None (Solid background)</option>
                        <option value="metal">Brushed Metal</option>
                        <option value="wood">Organic Wood Grain</option>
                        <option value="geometric">Geometric Grid</option>
                        <option value="marble">Thin Marble Veins</option>
                        <option value="linen">Linen Crosshatch</option>
                      </select>
                    </div>
                  </div>

                  {/* Logo Display & Watermark Toggle */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={data.design_settings?.business_card?.show_logo !== false}
                        onChange={(e) => {
                          update("design_settings", {
                            ...(data.design_settings || {}),
                            business_card: {
                              ...(data.design_settings?.business_card || {}),
                              show_logo: e.target.checked
                            }
                          });
                        }}
                        className="rounded border-stone-300 text-brand focus:ring-brand scale-90"
                      />
                      Show Front Logo
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={!!data.design_settings?.business_card?.watermark_logo}
                        onChange={(e) => {
                          update("design_settings", {
                            ...(data.design_settings || {}),
                            business_card: {
                              ...(data.design_settings?.business_card || {}),
                              watermark_logo: e.target.checked
                            }
                          });
                        }}
                        className="rounded border-stone-300 text-brand focus:ring-brand scale-90"
                      />
                      Watermark BG Logo
                    </label>
                  </div>

                  {/* Watermark Opacity slider */}
                  {data.design_settings?.business_card?.watermark_logo && (
                    <div className="space-y-1 p-2 bg-stone-50 border border-stone-150 rounded-xl animate-fade-in">
                      <div className="flex justify-between items-center text-[10px] font-bold text-stone-555">
                        <span>Watermark Opacity</span>
                        <span>{Math.round((data.design_settings?.business_card?.watermark_opacity || 0.15) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="1.0"
                        step="0.05"
                        value={data.design_settings?.business_card?.watermark_opacity ?? 0.15}
                        onChange={(e) => {
                          update("design_settings", {
                            ...(data.design_settings || {}),
                            business_card: {
                              ...(data.design_settings?.business_card || {}),
                              watermark_opacity: parseFloat(e.target.value)
                            }
                          });
                        }}
                        className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand"
                      />
                    </div>
                  )}

                  {/* Border Radius & Glow */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Border Radius</label>
                      <select
                        value={data.design_settings?.business_card?.border_radius || "medium"}
                        onChange={(e) => {
                          update("design_settings", {
                            ...(data.design_settings || {}),
                            business_card: {
                              ...(data.design_settings?.business_card || {}),
                              border_radius: e.target.value as any
                            }
                          });
                        }}
                        className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                      >
                        <option value="none">Square (none)</option>
                        <option value="small">Small (rounded)</option>
                        <option value="medium">Medium (standard)</option>
                        <option value="large">Large (extra round)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold cursor-pointer py-2">
                        <input
                          type="checkbox"
                          checked={!!data.design_settings?.business_card?.border_glow}
                          onChange={(e) => {
                            update("design_settings", {
                              ...(data.design_settings || {}),
                              business_card: {
                                ...(data.design_settings?.business_card || {}),
                                border_glow: e.target.checked
                              }
                            });
                          }}
                          className="rounded border-stone-300 text-brand focus:ring-brand scale-90"
                        />
                        Cyan/Neon border glow
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right: Preview & Download */}
                <div className="flex flex-col gap-4 items-center bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-xs w-full">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Live Business Card Preview</span>
                  {generatingPreview ? (
                    <div className="w-8 h-8 rounded-full border-4 border-t-brand border-stone-200 animate-spin my-8" />
                  ) : businessCardPreview ? (
                    <>
                      <img src={businessCardPreview} alt="Business Card Preview" className="max-w-full rounded-lg shadow-md border animate-fade-in animate-duration-300" />
                      <button
                        type="button"
                        onClick={handleDownloadBusinessCard}
                        className="py-2.5 px-4 bg-brand text-white text-xs font-bold rounded-xl shadow-md w-full flex items-center justify-center gap-1.5 hover:opacity-90 transition-all cursor-pointer"
                        style={{ backgroundColor: brandColor }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Business Card
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-stone-400 font-medium my-8">No preview available</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Row 4: A6 Stand Flyer Design */}
          <div 
            onFocusCapture={() => setActiveTabOverride("share")}
            className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6 shadow-sm"
          >
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5 flex items-center justify-between">
              <span>📋 Stand Flyer Customization (A6 Stand Flyer)</span>
              <span className="text-[9px] font-bold text-brand bg-brand-light/30 border border-brand/20 px-2 py-0.5 rounded uppercase">
                {data.plan === "business" ? "Business" : "🔒 Business Feature"}
              </span>
            </h3>

            {data.plan !== "business" ? (
              <div className="text-[10px] text-stone-400 border border-dashed border-stone-200 p-4 rounded-xl text-center bg-stone-50 font-medium leading-relaxed">
                🔒 Custom printable stand flyer is locked. Upgrade to the Business plan to customize WiFi headers and print beautiful stand table flyers.
              </div>
            ) : (
              <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
                {/* Inputs */}
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">WiFi Section Title</label>
                    <input
                      type="text"
                      value={data.design_settings?.stand_flyer?.wifi_title ?? ""}
                      onChange={(e) => {
                        update("design_settings", {
                          ...(data.design_settings || {}),
                          stand_flyer: {
                            ...(data.design_settings?.stand_flyer || {}),
                            wifi_title: e.target.value
                          }
                        });
                      }}
                      placeholder="Relax & Connect!"
                      className="input w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">WiFi Subtitle Line 1</label>
                    <input
                      type="text"
                      value={data.design_settings?.stand_flyer?.wifi_text1 ?? ""}
                      onChange={(e) => {
                        update("design_settings", {
                          ...(data.design_settings || {}),
                          stand_flyer: {
                            ...(data.design_settings?.stand_flyer || {}),
                            wifi_text1: e.target.value
                          }
                        });
                      }}
                      placeholder="Enjoy free WiFi while"
                      className="input w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">WiFi Subtitle Line 2</label>
                    <input
                      type="text"
                      value={data.design_settings?.stand_flyer?.wifi_text2 ?? ""}
                      onChange={(e) => {
                        update("design_settings", {
                          ...(data.design_settings || {}),
                          stand_flyer: {
                            ...(data.design_settings?.stand_flyer || {}),
                            wifi_text2: e.target.value
                          }
                        });
                      }}
                      placeholder="you are at our venue."
                      className="input w-full"
                    />
                  </div>

                  {/* Flyer styling controls */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Flyer Theme</label>
                      <select
                        value={data.design_settings?.stand_flyer?.theme || "dark_matte"}
                        onChange={(e) => {
                          update("design_settings", {
                            ...(data.design_settings || {}),
                            stand_flyer: {
                              ...(data.design_settings?.stand_flyer || {}),
                              theme: e.target.value as any
                            }
                          });
                        }}
                        className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                      >
                        <option value="dark_matte">Dark Matte (Charcoal)</option>
                        <option value="light_elegant">Light Elegant (Cream)</option>
                        <option value="brand_accent">Brand Accent (Color)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Background Texture</label>
                      <select
                        value={data.design_settings?.stand_flyer?.bg_texture || "none"}
                        onChange={(e) => {
                          update("design_settings", {
                            ...(data.design_settings || {}),
                            stand_flyer: {
                              ...(data.design_settings?.stand_flyer || {}),
                              bg_texture: e.target.value as any
                            }
                          });
                        }}
                        className="w-full h-8 rounded border border-stone-250 bg-white px-2 text-xs outline-none text-stone-700 cursor-pointer"
                      >
                        <option value="none">None (Solid)</option>
                        <option value="geometric">Geometric Radial Grid</option>
                        <option value="linen">Elegant Linen</option>
                        <option value="wood">Wood Grain</option>
                        <option value="marble">Classic Marble</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <label className="flex items-center gap-2 text-xs font-semibold text-stone-750 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.design_settings?.stand_flyer?.show_logo !== false}
                        onChange={(e) => {
                          update("design_settings", {
                            ...(data.design_settings || {}),
                            stand_flyer: {
                              ...(data.design_settings?.stand_flyer || {}),
                              show_logo: e.target.checked
                            }
                          });
                        }}
                        className="rounded border-stone-300 text-brand focus:ring-brand scale-90"
                      />
                      <span>Show Business Logo at the Top</span>
                    </label>
                  </div>

                  {(!data.sections?.some(s => s.type === "wifi" && s.enabled !== false && s.data?.ssid)) ? (
                    <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-xl text-center space-y-2.5">
                      <p className="text-[10px] text-amber-800 font-medium leading-normal">
                        ⚠️ <strong>WiFi Credentials Not Configured:</strong> The Stand Flyer requires active WiFi details to show a side-by-side WiFi QR code. Currently, it only displays the Business QR.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setData((prev) => {
                            const sections = [...(prev.sections || [])];
                            const wifiIdx = sections.findIndex(s => s.type === "wifi");
                            if (wifiIdx === -1) {
                              sections.push({
                                type: "wifi",
                                title: "WiFi Access",
                                enabled: true,
                                  data: { ssid: "", password: "", show_password: true }
                              });
                            } else {
                              sections[wifiIdx] = {
                                ...sections[wifiIdx],
                                enabled: true
                              };
                            }
                            return { ...prev, sections };
                          });
                          
                          setCurrentStep(3);
                          
                          setTimeout(() => {
                            document.getElementById("section-editor-wifi")?.scrollIntoView({ behavior: "smooth" });
                            const el = document.getElementById("section-editor-wifi");
                            if (el) {
                              el.classList.add("ring-2", "ring-brand");
                              setTimeout(() => el.classList.remove("ring-2", "ring-brand"), 2000);
                            }
                          }, 150);
                        }}
                        className="py-1.5 px-3 bg-brand/10 hover:bg-brand/15 text-brand text-[10px] font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        + Add WiFi Credentials
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Preview & Download */}
                <div className="flex flex-col gap-4 items-center bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-xs">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Live Stand Flyer Preview</span>
                  {generatingFlyerPreview ? (
                    <div className="w-8 h-8 rounded-full border-4 border-t-brand border-stone-200 animate-spin my-8" />
                  ) : flyerPreview ? (
                    <>
                      <img src={flyerPreview} alt="Stand Flyer Preview" className="max-w-[200px] rounded-lg shadow-md border animate-fade-in" />
                      <button
                        type="button"
                        onClick={handleDownloadFlyer}
                        className="py-2.5 px-4 bg-brand text-white text-xs font-bold rounded-xl shadow-md w-full flex items-center justify-center gap-1.5 hover:opacity-90 transition-all cursor-pointer"
                        style={{ backgroundColor: brandColor }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Stand Flyer
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-stone-400 font-medium my-8">No preview available</span>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* STEP 5: REVIEW & PAY */}
      {isWizard && currentStep === 5 && (
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 max-w-5xl mx-auto items-start animate-fade-in text-left">
          
          {/* LEFT: Read-only Card Preview */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Final card layout</h3>
            <div className="p-4 bg-stone-150 border border-stone-200 rounded-3xl shadow-inner flex justify-center">
              <CardPreview data={data} activeTabOverride={activeTabOverride} />
            </div>
          </div>

          {/* RIGHT: Plan summary & Payment */}
          <div className="bg-white border border-stone-200 rounded-3xl p-8 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-3 font-sans">Review &amp; Pay</h2>
            
            {/* Plan Summary */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center font-bold text-stone-900 text-sm">
                <span>{PLAN_DETAILS[data.plan].name} Plan</span>
                <span className="text-brand">
                  {data.plan === "basic" ? "Rs 0" : data.plan === "pro" ? "Rs 500" : "Rs 1,000"}
                </span>
              </div>
              <p className="text-[10px] text-stone-450 font-medium">
                {data.plan === "basic" ? "Expires after 15 days — upgrade anytime" : "One-time payment · Lifetime hosting"}
              </p>
              
              <div className="h-px bg-stone-200 my-2" />
              
              <ul className="text-[11px] text-stone-600 space-y-1.5 font-medium">
                {data.plan === "basic" && (
                  <>
                    <li>• 15-day free trial period</li>
                    <li>• Classic theme only</li>
                    <li>• Watermark watermark banner at bottom</li>
                  </>
                )}
                {data.plan === "pro" && (
                  <>
                    <li>• Lifetime hosting, no subscriptions</li>
                    <li>• Logo-embedded branded QR</li>
                    <li>• 2 card slots (1 primary + 1 team)</li>
                    <li>• All standard themes included</li>
                  </>
                )}
                {data.plan === "business" && (
                  <>
                    <li>• Lifetime hosting, no subscriptions</li>
                    <li>• Premium Glassmorphic &amp; Neon Dark themes</li>
                    <li>• Upload custom background image</li>
                    <li>• 5 card slots (1 primary + 4 team)</li>
                  </>
                )}
              </ul>
            </div>

            {/* Payment Method Selector */}
            {data.plan !== "basic" ? (
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-700 block uppercase tracking-wider">Choose payment method</label>
                <div className="grid grid-cols-3 gap-3">
                  {/* eSewa */}
                  <button
                    type="button"
                    onClick={() => setPaymentProvider("esewa")}
                    className={`flex flex-col items-center justify-center p-3.5 border rounded-2xl transition-all cursor-pointer ${
                      paymentProvider === "esewa"
                        ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600 text-emerald-950 font-bold"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    <span className="text-xs">eSewa</span>
                    <span className="text-[9px] opacity-75 font-semibold mt-0.5">NPR</span>
                  </button>

                  {/* Khalti */}
                  <button
                    type="button"
                    onClick={() => setPaymentProvider("khalti")}
                    className={`flex flex-col items-center justify-center p-3.5 border rounded-2xl transition-all cursor-pointer ${
                      paymentProvider === "khalti"
                        ? "border-purple-600 bg-purple-50 ring-2 ring-purple-600 text-purple-950 font-bold"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    <span className="text-xs">Khalti</span>
                    <span className="text-[9px] opacity-75 font-semibold mt-0.5">NPR</span>
                  </button>

                  {/* Stripe */}
                  <button
                    type="button"
                    onClick={() => setPaymentProvider("stripe")}
                    className={`flex flex-col items-center justify-center p-3.5 border rounded-2xl transition-all cursor-pointer ${
                      paymentProvider === "stripe"
                        ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 text-indigo-950 font-bold"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    <span className="text-xs">Stripe</span>
                    <span className="text-[9px] opacity-75 font-semibold mt-0.5">USD</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl text-xs text-stone-550 font-semibold">
                Free Trial — No payment details required.
              </div>
            )}

            {/* Email Confirmation */}
            <div className="text-xs text-stone-600 leading-normal">
              Your card will be managed via passwordless magic link at <strong className="text-stone-900">{data.owner_email}</strong>.
            </div>

            {/* Above-the-fold Submit Action */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: brandColor }}
                className="w-full py-3.5 bg-brand text-white rounded-2xl font-bold text-sm shadow-md hover:opacity-95 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : data.plan === "basic" ? (
                  "Activate free card &rarr;"
                ) : paymentProvider === "esewa" ? (
                  `Pay Rs ${PLAN_DETAILS[data.plan].priceNPR.toLocaleString()} & go live →`
                ) : paymentProvider === "khalti" ? (
                  `Pay Rs ${PLAN_DETAILS[data.plan].priceNPR.toLocaleString()} & go live →`
                ) : (
                  `Pay $${PLAN_DETAILS[data.plan].priceUSD} & go live →`
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Floating collapsible preview toggle button (Mobile Only, Steps 2-3) */}
      {isWizard && (currentStep === 2 || currentStep === 3) && (
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={() => setMobilePreviewOpen(true)}
            className="bg-brand text-white font-semibold text-xs px-4.5 py-3 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            👁️ Preview Live
          </button>
        </div>
      )}

      {/* Mobile Preview Modal Overlay */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:hidden">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto relative flex flex-col items-center shadow-2xl space-y-6">
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-850 font-bold"
            >
              ✕
            </button>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider text-center">Live Preview</h3>
            <div className="w-full">
              <CardPreview 
                data={data} 
                onSaveContact={downloadVCardPreview} 
                isEditing={currentStep === 3} 
                onChange={(updatedFields) => setData(d => ({ ...d, ...updatedFields }))}
                activeTabOverride={activeTabOverride}
              />
            </div>
          </div>
        </div>
      )}

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
      <span className="text-xs font-medium text-stone-600 mb-1.5 block">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      {children}
    </label>
  );
}

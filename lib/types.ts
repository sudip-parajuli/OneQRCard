export type ThemeId = "classic" | "minimal" | "bold" | "gradient";

export type PlanId = "basic" | "pro" | "business";

export interface CardData {
  id?: string;
  slug: string;
  business_name: string;
  tagline: string;
  brand_color: string;
  theme: ThemeId;
  logo_data_url: string | null;
  phone: string;
  whatsapp: string;
  website: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  email: string;
  plan: PlanId;
  subdomain: string | null;
  payment_status: "pending" | "paid";
  currency?: "NPR" | "USD";
  payment_provider?: "esewa" | "stripe";
  stripe_session_id?: string | null;
  amount_paid?: number | null;
  owner_email?: string | null;
  google_review?: string;
  created_at?: string;
}

export const THEME_LABELS: Record<ThemeId, string> = {
  classic: "Classic — header band",
  minimal: "Minimal — clean & centered",
  bold: "Bold — full color",
  gradient: "Gradient — soft glow",
};

export const PLAN_DETAILS: Record<
  PlanId,
  { name: string; priceNPR: number; priceUSD: number; features: string[] }
> = {
  basic: {
    name: "Basic",
    priceNPR: 0,
    priceUSD: 0,
    features: [
      "Hosted at one-qr-card.vercel.app/card/[slug]",
      "Standard Classic theme only",
      "No logo upload or visual customization",
      "Locked brand color",
      "QR code (PNG download)",
      "Save-to-contacts button",
      "Lifetime hosting",
    ],
  },
  pro: {
    name: "Pro",
    priceNPR: 1000,
    priceUSD: 10,
    features: [
      "Custom subdomain (clientname.one-qr-card.vercel.app)",
      "All themes (Classic, Minimal, Bold, Gradient)",
      "Custom brand color & logo upload",
      "Downloadable customized business card (with QR code)",
      "QR code (PNG + SVG)",
      "Save-to-contacts button",
      "Lifetime hosting & self-edit anytime",
    ],
  },
  business: {
    name: "Business",
    priceNPR: 2000,
    priceUSD: 20,
    features: [
      "Everything in Pro",
      "Up to 5 team member cards",
      "Shared brand kit (logo + color)",
      "Downloadable customized business cards for all team members",
      "Priority support & edits",
      "Lifetime hosting",
    ],
  },
};

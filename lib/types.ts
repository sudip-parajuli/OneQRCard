export type ThemeId = "classic" | "minimal" | "bold" | "gradient" | "glassmorphic" | "neonDark";

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
  background_data_url?: string | null;
  card_layout?: "classic" | "modern_dark" | "minimal_light";
  text_color?: string | null;
  parent_id?: string | null;
  member_name?: string | null;
  member_role?: string | null;
  show_logo_on_card?: boolean;
  created_at?: string;
}

export const THEME_LABELS: Record<ThemeId, string> = {
  classic: "Classic — header band",
  minimal: "Minimal — clean & centered",
  bold: "Bold — full color",
  gradient: "Gradient — soft glow",
  glassmorphic: "Glassmorphic — frosted card (Business)",
  neonDark: "Neon Dark — premium dark mode (Business)",
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
      "15-day free trial period",
    ],
  },
  pro: {
    name: "Pro",
    priceNPR: 500,
    priceUSD: 5,
    features: [
      "Custom subdomain (clientname.one-qr-card.vercel.app)",
      "All themes (Classic, Minimal, Bold, Gradient)",
      "Custom brand color, text color & logo upload",
      "Logo embedded inside the QR Code itself",
      "Downloadable customized business card (with QR code)",
      "QR code (PNG + SVG)",
      "Save-to-contacts button",
      "Create up to 2 cards total (1 primary + 1 team slot)",
      "Lifetime hosting & self-edit anytime",
    ],
  },
  business: {
    name: "Business",
    priceNPR: 1000,
    priceUSD: 10,
    features: [
      "Everything in Pro",
      "Premium themes (Glassmorphic, Neon Dark)",
      "Upload custom background images",
      "Custom layouts for downloadable card with watermark logo",
      "Create up to 5 cards total (1 primary + 4 team slots)",
      "Shared brand kit & priority support",
      "Lifetime hosting",
    ],
  },
};

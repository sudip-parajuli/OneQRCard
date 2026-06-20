export type ThemeId = "classic" | "minimal" | "bold" | "gradient" | "glassmorphic" | "neonDark" | "claymorphic" | "neumorphic" | "skeuomorphic" | "liquidGlass";

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
  bio?: string;
  viber?: string;
  x_twitter?: string;
  threads?: string;
  linkedin?: string;
  telegram?: string;
  plan: PlanId;
  subdomain: string | null;
  payment_status: "pending" | "paid" | "pending_verification";
  currency?: "NPR" | "USD";
  payment_provider?: "esewa" | "stripe" | "manual";
  stripe_session_id?: string | null;
  amount_paid?: number | null;
  owner_email?: string | null;
  txn_id?: string | null;
  sender_wallet?: string | null;
  custom_links?: { label: string; url: string }[] | null;
  address?: string | null;
  google_review?: string;
  location_url?: string | null;
  background_data_url?: string | null;
  card_layout?: "classic" | "modern_dark" | "minimal_light";
  text_color?: string | null;
  parent_id?: string | null;
  member_name?: string | null;
  member_role?: string | null;
  show_logo_on_card?: boolean;
  workspace_id?: string | null;
  is_primary?: boolean;
  opening_hours?: Record<string, { open: string; close: string; isClosed: boolean }> | null;
  business_type?: string;
  sections?: any[] | null;
  section_order?: string[] | null;
  qr_customization?: {
    dotStyle?: "square" | "rounded" | "dots" | "waves" | "teardrops";
    cornerStyle?: "square" | "rounded" | "custom_frame";
    logoEnabled?: boolean;
    centerLogoType?: "standard" | "pixelated";
    colorStyle?: "solid" | "gradient" | "spotlight";
    gradientColor1?: string;
    gradientColor2?: string;
    spotlightColor?: string;
    custom_cta_frame?: string;
    bg_texture?: "none" | "wood" | "geometric" | "marble" | "linen" | null;
    threeDStyle?: "none" | "raised" | "embossed" | null;
    cta_style?: "default" | "arrow" | "hand" | "star" | null;
  } | null;
  design_settings?: {
    vibe?: "corporate" | "luxury" | "creative" | "eco" | null;
    bg_texture?: "none" | "metal" | "wood" | "geometric" | "motion" | null;
    embossed_effect?: boolean;
    alignment?: "left" | "center" | "right";
    default_nav_tab?: string | null;
    animation?: "none" | "float" | "fade" | "pulse" | null;
    business_card?: {
      theme?: "classic" | "modern_dark" | "minimal_light" | "luxury_gold" | "neon_glow" | "organic_wood" | null;
      bg_texture?: "none" | "metal" | "wood" | "geometric" | "marble" | "linen" | null;
      show_logo?: boolean;
      watermark_logo?: boolean;
      watermark_opacity?: number;
      border_radius?: "none" | "small" | "medium" | "large";
      border_glow?: boolean;
    } | null;
  } | null;
  created_at?: string;
}

export const THEME_LABELS: Record<ThemeId, string> = {
  classic: "Classic — header band",
  minimal: "Minimal — clean & centered",
  bold: "Bold — full color",
  gradient: "Gradient — soft glow",
  glassmorphic: "Glassmorphic — frosted card (Business)",
  neonDark: "Neon Dark — premium dark mode (Business)",
  claymorphic: "Claymorphic — soft 3D clay (Business)",
  neumorphic: "Neumorphic — soft extruded shadows (Business)",
  skeuomorphic: "Skeuomorphic — physical texture (Business)",
  liquidGlass: "Liquid Glass — high-gloss refraction (Business)",
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
      "Custom subdomain — yourname.one-qr-card.com (Coming soon. Hosted at /card/[slug] in the meantime. Same QR, no interruptions when we switch.)",
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

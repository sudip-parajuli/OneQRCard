import { SectionConfig, SectionType } from "./business-types";

export interface MenuItem {
  id: string;
  name: string;
  price: string;
  description?: string;
  photo_data_url?: string;
  is_popular?: boolean;
  is_sold_out?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuSectionData {
  categories: MenuCategory[];
  show_prices: boolean;
  order_cta: "call" | "whatsapp" | "none";
}

export interface GalleryImage {
  id: string;
  data_url: string;
  caption?: string;
}

export interface GallerySectionData {
  images: GalleryImage[];
  layout: "grid" | "strip";
}

export interface ServiceItem {
  id: string;
  name: string;
  price?: string;
  duration?: string;
  description?: string;
  is_popular?: boolean;
  booking_url?: string;
}

export interface ServicesSectionData {
  services: ServiceItem[];
}

export interface HoursSectionData {
  hours?: Record<string, { open: string; close: string; isClosed: boolean }>;
}

export interface LocationSectionData {
  address?: string;
  google_maps_url?: string;
}

export interface ReviewSectionData {
  google_review_url?: string;
}

export interface BookingSectionData {
  mode: "link" | "form";
  booking_url?: string;
}

export interface WifiSectionData {
  ssid: string;
  password?: string;
  show_password?: boolean;
}

export interface LeadCaptureSectionData {
  title?: string;
  success_message?: string;
  fields?: {
    name: boolean;
    phone: boolean;
    email: boolean;
    message: boolean;
  };
}

export interface AmenitiesSectionData {
  amenities: { id: string; label: string; emoji: string }[];
}

export interface ScheduleClassItem {
  id: string;
  name: string;
  day: string;
  time: string;
  instructor?: string;
  capacity?: string;
  is_full?: boolean;
}

export interface ScheduleSectionData {
  classes: ScheduleClassItem[];
}

export interface PricingPlanItem {
  id: string;
  name: string;
  price: string;
  features: string;
  is_popular?: boolean;
  cta_link?: string;
  cta_label?: string;
}

export interface PricingTableSectionData {
  plans: PricingPlanItem[];
}

export interface FeaturedProductItem {
  id: string;
  name: string;
  price: string;
  description?: string;
  photo_url?: string;
  shop_link?: string;
}

export interface FeaturedProductsSectionData {
  products: FeaturedProductItem[];
}

export interface CourseItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface CoursesSectionData {
  courses: CourseItem[];
}

/**
 * Gating logic for sections depending on user's active plan.
 * basic = Free
 * pro = Standard
 * business = Lifetime
 */
export function isSectionLocked(type: string, plan: string, data?: any): boolean {
  if (plan === "business") return false; // Business unlocks everything

  // Basic (Free) locks everything except hero, contact, socials
  if (plan === "basic") {
    return type !== "hero" && type !== "contact" && type !== "socials";
  }

  // Pro (Standard) locks advanced interactive/specialty sections
  if (plan === "pro") {
    const premiumSections = [
      "lead_capture",
      "amenities",
      "schedule",
      "pricing_table",
      "featured_products",
      "courses",
      "room_service",
    ];
    if (premiumSections.includes(type)) return true;

    // Booking mode B (request form) is locked for Pro
    if (type === "booking" && data?.mode === "form") return true;

    return false;
  }

  return false;
}

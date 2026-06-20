import { ThemeId } from "./types";

export type SectionType =
  | "hero"
  | "menu"
  | "gallery"
  | "services"
  | "booking"
  | "hours"
  | "location"
  | "wifi"
  | "amenities"
  | "room_service"
  | "lead_capture"
  | "review"
  | "schedule"
  | "pricing_table"
  | "featured_products"
  | "contact"
  | "socials"
  | "courses";

export interface SectionConfig {
  type: SectionType;
  title: string;
  enabled: boolean;
  data: any;
  theme?: ThemeId;
}

export interface BusinessTypeDetail {
  label: string;
  emoji: string;
  description: string;
  defaultSections: SectionType[];
  suggestedColor: string;
}

export const BUSINESS_TYPE_DEFAULTS: Record<string, BusinessTypeDetail> = {
  restaurant: {
    label: "Restaurant / Café / Bar",
    emoji: "🍽️",
    description: "Show your menu, take reservations, collect reviews",
    defaultSections: ["hero", "menu", "hours", "location", "contact", "socials", "review"],
    suggestedColor: "#c0392b",
  },
  hotel: {
    label: "Hotel / Resort / Guest House",
    emoji: "🏨",
    description: "Amenities, room service, WiFi details, local tips",
    defaultSections: ["hero", "amenities", "room_service", "wifi", "location", "contact", "socials"],
    suggestedColor: "#1a5276",
  },
  salon: {
    label: "Salon / Spa / Barbershop",
    emoji: "✂️",
    description: "Services with prices, appointments, before/after gallery",
    defaultSections: ["hero", "services", "gallery", "booking", "contact", "socials", "review"],
    suggestedColor: "#6c3483",
  },
  tattoo: {
    label: "Tattoo / Piercing Studio",
    emoji: "🎨",
    description: "Portfolio first, then booking and contact",
    defaultSections: ["hero", "gallery", "services", "booking", "contact", "socials"],
    suggestedColor: "#1c1c1c",
  },
  retail: {
    label: "Retail Shop / Boutique",
    emoji: "🛍️",
    description: "Featured products, location, hours",
    defaultSections: ["hero", "featured_products", "hours", "location", "contact", "socials"],
    suggestedColor: "#e67e22",
  },
  clinic: {
    label: "Clinic / Hospital / Pharmacy",
    emoji: "🏥",
    description: "Services, appointment booking, emergency contact",
    defaultSections: ["hero", "services", "booking", "hours", "location", "contact", "socials"],
    suggestedColor: "#1a7a4a",
  },
  consultancy: {
    label: "Consultancy / Law / Accounting",
    emoji: "💼",
    description: "Services, lead capture, book a call",
    defaultSections: ["hero", "services", "lead_capture", "booking", "contact", "socials"],
    suggestedColor: "#2c3e50",
  },
  fitness: {
    label: "Gym / Yoga / Personal Trainer",
    emoji: "💪",
    description: "Class schedule, membership plans, contact",
    defaultSections: ["hero", "schedule", "pricing_table", "contact", "socials", "review"],
    suggestedColor: "#e74c3c",
  },
  education: {
    label: "School / Coaching / Tutor",
    emoji: "📚",
    description: "Courses, schedule, fees, contact",
    defaultSections: ["hero", "courses", "schedule", "pricing_table", "contact", "socials"],
    suggestedColor: "#2980b9",
  },
  creative: {
    label: "Photographer / Designer / Artist",
    emoji: "📷",
    description: "Portfolio gallery, packages, booking",
    defaultSections: ["hero", "gallery", "services", "booking", "contact", "socials"],
    suggestedColor: "#2c2c2c",
  },
  general: {
    label: "General Business",
    emoji: "🏢",
    description: "Build your own layout from scratch",
    defaultSections: ["hero", "contact", "socials"],
    suggestedColor: "#085041",
  },
};

export const DEFAULT_TITLES: Record<SectionType, string> = {
  hero: "Welcome",
  menu: "Our Menu",
  gallery: "Gallery",
  services: "Services",
  booking: "Book Appointment",
  hours: "Opening Hours",
  location: "Our Location",
  wifi: "Free WiFi Connect",
  amenities: "Amenities",
  room_service: "Room Service",
  lead_capture: "Get in Touch",
  review: "Rate Us & Review",
  schedule: "Weekly Schedule",
  pricing_table: "Membership Plans",
  featured_products: "Featured Products",
  contact: "Contact Details",
  socials: "Follow Us",
  courses: "Courses Offered",
};

export const DEFAULT_DATA: Record<SectionType, any> = {
  hero: {},
  menu: { categories: [] },
  gallery: { images: [], layout: "grid" },
  services: { services: [] },
  booking: { mode: "link", booking_url: "" },
  hours: { hours: {} },
  location: { address: "", google_maps_url: "", location_url: "" },
  wifi: { ssid: "", password: "", show_password: true },
  amenities: { amenities: [] },
  room_service: {},
  lead_capture: {
    fields: { name: true, phone: true, email: true, message: true },
    success_message: "Thank you! We'll get back to you shortly.",
  },
  review: { google_review_url: "" },
  schedule: { classes: [] },
  pricing_table: { plans: [] },
  featured_products: { products: [] },
  contact: {},
  socials: {},
  courses: { courses: [] },
};

export function getDefaultSectionsForType(type: string): SectionConfig[] {
  const detail = BUSINESS_TYPE_DEFAULTS[type] || BUSINESS_TYPE_DEFAULTS.general;
  return detail.defaultSections.map((secType) => ({
    type: secType,
    title: DEFAULT_TITLES[secType],
    enabled: true,
    data: JSON.parse(JSON.stringify(DEFAULT_DATA[secType])),
  }));
}

# UPGRADE PLAN — Business-Type Aware Digital Presence Builder
# Drop this file in your project root and tell Antigravity: "Proceed with UPGRADE_PLAN.md"

---

## What we're building

Moving from a generic digital business card to a **Business Profile Builder**.
The core shift: when a customer creates a card, we ask what kind of business
they run first. Their answer determines the default section layout, content
fields, and design theme shown to their customers when they scan the QR code.

The QR code is still the delivery mechanism. What's behind it is now a
fully structured, business-type-specific micro-site — not just a list of links.

Each page is made of **sections** (components stacked vertically). Every business
type gets a sensible default stack, but the owner can reorder, hide, or add
sections from a fixed library. This keeps it simple enough to build in one
week but flexible enough to serve a dozen business categories.

---

## Phase 1 — Business type selector at card creation

### Goal
Before any other field on /create, ask "What kind of business do you run?"
The answer pre-configures the section stack, default theme colors, and
suggested content. The user can still change everything — this is a
smart starting point, not a locked template.

### Business types to support (launch set)

| Type ID | Label | Primary use case when scanned |
|---|---|---|
| restaurant | Restaurant / Café / Bar | View menu, call to order, Google review |
| hotel | Hotel / Resort / Guest House | Amenities, room service, WiFi, contact |
| salon | Salon / Spa / Barbershop | Services & prices, book appointment, portfolio |
| tattoo | Tattoo / Piercing Studio | Portfolio gallery, book appointment, contact |
| retail | Retail Shop / Boutique | Featured products, location, hours, contact |
| clinic | Clinic / Hospital / Pharmacy | Services, book appointment, call, location |
| consultancy | Consultancy / Law / Accounting | Services, lead capture form, book call, LinkedIn |
| fitness | Gym / Yoga / Personal Trainer | Class schedule, membership plans, contact |
| education | School / Coaching / Tutor | Courses, schedule, fees, contact |
| creative | Photographer / Designer / Artist | Portfolio gallery, packages, contact, book |
| general | General Business | Blank slate — manual section selection |

### New DB column — `supabase/migration_005_business_type.sql`
```sql
alter table cards
  add column if not exists business_type text default 'general',
  add column if not exists sections jsonb default '[]'::jsonb,
  add column if not exists section_order text[] default '{}';

-- sections stores an array of section config objects, e.g.:
-- [
--   { "type": "menu", "title": "Our Menu", "enabled": true, "data": {...} },
--   { "type": "gallery", "title": "Portfolio", "enabled": true, "data": {...} },
--   { "type": "hours", "title": "Opening Hours", "enabled": true, "data": {...} }
-- ]
```

### New file: `lib/business-types.ts`
Define the default section stack for each business type:
```ts
export const BUSINESS_TYPE_DEFAULTS: Record<string, {
  label: string;
  emoji: string;
  description: string;
  defaultSections: SectionType[];
  suggestedColor: string;
}> = {
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
```

### UI change: `/create` step 0
Before any other field, show a full-screen business type selector:
- Grid of type cards (emoji + label + description), 2 columns on mobile / 3 on desktop
- When the user taps one, animate a checkmark onto it and auto-advance to the
  next step after a 300ms delay (feels snappy, not rushed)
- Persist the choice in state; it drives everything downstream
- A "Skip — I'll pick my own sections" option in small text below the grid

---

## Phase 2 — Section library (the core of the upgrade)

### Goal
Build a library of reusable section components, each with:
1. An **editor panel** (what the business owner configures)
2. A **public renderer** (what the end customer sees when they scan)
3. A **default data shape** for when the section is first added

### Section types to build

---

### Section: `menu`
**For:** restaurants, cafés, bars, room service, bakeries

**Editor panel fields:**
- Menu categories (add/remove/reorder): e.g. "Starters," "Mains," "Drinks," "Desserts"
- Per category: add items with name, price, description (optional), photo (optional)
- Toggle: show/hide prices
- Toggle: mark items as "Popular" (shows a small badge)
- Toggle: mark items as "Sold out" (shows strikethrough)

**Public renderer:**
- Tab bar or accordion at the top to switch between categories
- Each item: name (bold) + price (right-aligned) + a tap-to-expand that reveals
  the description and photo if present
- "Popular" badge in the brand color
- "Sold out" items shown grayed with strikethrough, not hidden (still builds trust)
- No cart or ordering — this is a browse-only digital menu, not an ordering app.
  The CTA under the menu is "Call to order" or "WhatsApp to order" — keeps it simple.

**Data shape:**
```ts
interface MenuSection {
  type: "menu";
  categories: {
    id: string;
    name: string;
    items: {
      id: string;
      name: string;
      price: string;
      description?: string;
      photo_url?: string;
      is_popular?: boolean;
      is_sold_out?: boolean;
    }[];
  }[];
  show_prices: boolean;
  order_cta: "call" | "whatsapp" | "none";
}
```

---

### Section: `gallery`
**For:** tattoo studios, photographers, designers, salons (before/after), restaurants (food photos)

**Editor panel fields:**
- Upload up to 12 photos (compressed to max 800px wide on upload, stored in Supabase Storage)
- Per photo: optional caption
- Layout choice: grid (2-col) or horizontal scroll strip
- Optional: group into named albums (e.g. "Black & Grey," "Color Work," "Lettering")

**Public renderer:**
- Grid or strip as chosen
- Tap a photo → full-screen lightbox with swipe navigation
- Caption shown below photo in lightbox
- Lazy-load images (only load what's in viewport)

---

### Section: `services`
**For:** salons, clinics, consultancies, gyms, tutors, tattoo studios

**Editor panel fields:**
- List of services: name, price (optional), duration (optional), short description
- Mark services as "Most popular"
- Optional "Book" CTA per service (links to booking section or external URL)

**Public renderer:**
- Clean vertical list, each service as a card
- Name + price right-aligned + duration in gray
- Description below, collapsed by default with a "See more" tap
- "Popular" badge
- Per-service "Book" button if configured

---

### Section: `booking`
**For:** salons, clinics, tattoo studios, consultancies, personal trainers, photographers

**Two modes (owner picks one):**

**Mode A — Link out:** just a button that opens an external booking URL
(Calendly, Google Calendar booking page, Practo, etc.) — zero setup from us,
covers 80% of use cases immediately.

**Mode B — Simple request form (built-in):**
- Customer fills: name, phone, preferred date + time (text field, not a calendar
  widget — keep it simple), service they want
- On submit: sends a WhatsApp message to the business owner with the request details
  (using wa.me with prefilled text — no backend needed, fires client-side)
  AND stores the request in a `booking_requests` Supabase table for the owner's dashboard.

Start with Mode A. Build Mode B in a later sprint once Mode A is live and
owners are asking for something more.

---

### Section: `hours`
**For:** restaurants, retail shops, clinics, gyms — any business with regular hours

**Editor panel fields:**
- Per day of week: open time + close time, or mark as "Closed"
- Holiday override: add specific dates with a note (e.g. "Dec 25 — Closed for Christmas")

**Public renderer:**
- Live status badge: "Open now" (green) / "Closes at 9pm" / "Closed — opens tomorrow at 10am"
- Tap to expand the full weekly schedule
- Holiday overrides shown if today is one

---

### Section: `location`
**For:** any physical business

**Editor panel fields:**
- Google Maps embed URL (paste from Google Maps share)
- Street address (text)
- "Get directions" button — opens Google Maps or Apple Maps app automatically

**Public renderer:**
- Embedded map (iframe) at reduced height (~200px) — tap to open full map in maps app
- Address below
- "Get directions" button in brand color

---

### Section: `wifi`
**For:** hotels, cafés, restaurants, coworking spaces

**Editor panel fields:**
- Network name (SSID)
- Password
- Toggle: show password visibly or hide behind a "reveal" tap

**Public renderer:**
- WiFi name + password row
- On iOS/Android: "Connect" button that generates a `WIFI:S:networkname;T:WPA;P:password;;` QR
  code inline that the phone's camera can scan to auto-connect (no typing needed)
- This is genuinely delightful for hotel guests and café customers and almost
  nobody offers it as part of a QR card product

---

### Section: `amenities`
**For:** hotels, resorts, guest houses

**Editor panel fields:**
- List of amenities with icons: WiFi, Pool, Parking, Restaurant, Gym, Spa,
  Airport Shuttle, Room Service, AC, Hot Water, etc. (icon set, user picks which apply)
- Optional: add a custom amenity not in the preset list

**Public renderer:**
- Responsive icon grid (4 per row on mobile)
- Each amenity: icon + label
- Clean, instantly scannable

---

### Section: `lead_capture`
**For:** consultancies, freelancers, agencies, B2B services

**Editor panel fields:**
- Form title (e.g. "Get a free quote" / "Book a consultation")
- Fields to show: Name (always on), Phone (toggle), Email (toggle),
  Message (toggle, with custom placeholder)
- Where to send submissions: email address

**Public renderer:**
- Clean form, mobile-optimized large inputs
- On submit: store in `leads` Supabase table + email notification to business owner
- Success state: "Thanks! We'll reach out within [owner-configured timeframe]"

---

### Section: `review`
**For:** any business that wants Google reviews

**With sentiment gating (as designed earlier):**
- "How was your experience?" + two tap options (thumbs up / thumbs down)
- Thumbs up → opens Google review link in new tab
- Thumbs down → opens a short private feedback form (stores in Supabase, emails owner)
  with a message: "Thank you — we'll be in touch to make this right."

---

### Section: `schedule`
**For:** gyms, yoga studios, tutors, clinics

**Editor panel fields:**
- Weekly class/session schedule: day, time, class name, instructor, capacity (optional)
- Mark sessions as "Full" (shown grayed)

**Public renderer:**
- Day-tabbed view (Mon/Tue/Wed...)
- Each session: time + class name + instructor
- "Full" sessions shown with a badge, not removed

---

### Section: `pricing_table`
**For:** gyms, tutors, SaaS-style service businesses

**Editor panel fields:**
- 2-4 plan/membership cards: name, price, billing period (monthly/yearly/one-time),
  feature list, highlight one as "Most popular"
- CTA per plan: "Join now" / "Enquire" / custom label + link

**Public renderer:**
- Horizontal scroll on mobile (3 cards side by side)
- Highlighted card gets brand color background
- Clean feature list with checkmarks

---

### Section: `featured_products`
**For:** retail shops, boutiques, home businesses

**Editor panel fields:**
- Up to 8 product cards: name, photo, price, short description, optional external link
  (e.g. to their Daraz/Instagram shop)

**Public renderer:**
- 2-column product grid on mobile
- Tap → product detail sheet slides up (name, full description, price, "Buy / Enquire" CTA)
- No cart, no checkout — this is a showcase, the CTA sends to WhatsApp/external store

---

## Phase 3 — Section editor UI in /create

### Goal
After the user picks their business type and sees the default section stack,
give them an intuitive section editor — not a wall of form fields.

### Section stack UI
- Vertical list of active sections, each as a card with:
  - Drag handle (reorder)
  - Section type icon + name
  - "Edit" button (expands an editor panel inline or opens a drawer)
  - Toggle to enable/disable without deleting
  - "Remove" button (moves to the "add section" pool)
- At the bottom: "+ Add section" button that opens a sheet of available section types
  not yet in the stack

### Section editor panels
Each section type has its own editor panel component. These live in
`components/section-editors/MenuEditor.tsx`, `GalleryEditor.tsx`, etc.

The editor panel for each section should feel like a mini-form focused only
on that section — not overwhelming the user with all fields at once.

### Live preview
The right-side CardPreview (already exists) should update in real-time as the
user edits any section. The preview shows the actual public-renderer output,
not a placeholder — so what the owner sees in the editor is exactly what their
customers will see.

---

## Phase 4 — Public page renderer

### Goal
`/card/[slug]` renders each section in the card's `section_order` array,
picking the right public renderer component for each section type.

### New file: `components/sections/SectionRenderer.tsx`
```tsx
import MenuSection from "./MenuSection";
import GallerySection from "./GallerySection";
import ServicesSection from "./ServicesSection";
import HoursSection from "./HoursSection";
import LocationSection from "./LocationSection";
import WifiSection from "./WifiSection";
import BookingSection from "./BookingSection";
import ReviewSection from "./ReviewSection";
import LeadCaptureSection from "./LeadCaptureSection";
import AmenitiesSection from "./AmenitiesSection";
import ScheduleSection from "./ScheduleSection";
import PricingTableSection from "./PricingTableSection";
import FeaturedProductsSection from "./FeaturedProductsSection";
import ContactSection from "./ContactSection";
import SocialsSection from "./SocialsSection";

const RENDERERS: Record<string, React.ComponentType<{ data: any; card: CardData }>> = {
  menu: MenuSection,
  gallery: GallerySection,
  services: ServicesSection,
  hours: HoursSection,
  location: LocationSection,
  wifi: WifiSection,
  booking: BookingSection,
  review: ReviewSection,
  lead_capture: LeadCaptureSection,
  amenities: AmenitiesSection,
  schedule: ScheduleSection,
  pricing_table: PricingTableSection,
  featured_products: FeaturedProductsSection,
  contact: ContactSection,
  socials: SocialsSection,
};

export default function SectionRenderer({ section, card }: { section: any; card: CardData }) {
  const Component = RENDERERS[section.type];
  if (!Component || !section.enabled) return null;
  return <Component data={section.data} card={card} />;
}
```

And in `/card/[slug]/page.tsx`, replace the single `<LiveCard>` with:
```tsx
{card.sections.map((section: any) => (
  <SectionRenderer key={section.type} section={section} card={card} />
))}
```

---

## Phase 5 — Plan gating by section type

Not every section should be available on every plan. This is your primary
mechanism for making Lifetime feel premium:

| Section | Free | Standard | Lifetime |
|---|---|---|---|
| hero, contact, socials | ✅ | ✅ | ✅ |
| hours, location, review (basic) | ❌ | ✅ | ✅ |
| menu, gallery, services, wifi | ❌ | ✅ | ✅ |
| booking (mode A — link out) | ❌ | ✅ | ✅ |
| booking (mode B — built-in form) | ❌ | ❌ | ✅ |
| lead_capture, amenities, schedule | ❌ | ❌ | ✅ |
| pricing_table, featured_products | ❌ | ❌ | ✅ |
| review with sentiment gating | ❌ | ❌ | ✅ |
| wifi auto-connect QR | ❌ | ❌ | ✅ |

In the section editor, show locked sections with a padlock icon and a
"Upgrade to unlock" CTA rather than hiding them entirely — seeing what
you're missing is more motivating than not knowing it exists.

---

## Phase 6 — New Supabase tables needed

```sql
-- Run as migration_006_sections_data.sql

-- Stores lead capture form submissions
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  name text,
  phone text,
  email text,
  message text,
  created_at timestamptz default now()
);

-- Stores booking requests (Mode B)
create table if not exists booking_requests (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  customer_name text,
  customer_phone text,
  preferred_datetime text,
  service_requested text,
  created_at timestamptz default now()
);

-- Stores private feedback (unhappy path from review section)
create table if not exists private_feedback (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  feedback text,
  created_at timestamptz default now()
);

-- Scan analytics
create table if not exists scan_events (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  scanned_at timestamptz default now(),
  source text -- 'qr' | 'link' | 'nfc'
);
```

---

## Phase 7 — Owner dashboard additions

The existing /dashboard (from the multi-card workspace plan) should now also show:

- **Leads inbox:** table of lead capture submissions per card, with name/phone/email/message
  and a "Mark as contacted" toggle — so the owner has a mini-CRM right in the dashboard
- **Booking requests:** same pattern — list of requests with customer name/phone/service/time
- **Feedback:** count of private negative feedback with a "View & respond" option
- **Scan count:** 7-day sparkline per card, total scans all-time

---

## Build order for Antigravity

Work through phases in this exact order. Run `npm run build` and manual
QA on a real mobile phone after each phase before starting the next.

1. **Phase 1** — Business type selector (database + UI step 0 in /create)
2. **Phase 2 parts 1-3** — menu, gallery, services sections only (the highest-demand ones)
3. **Phase 4** — Public renderer for the 3 sections above
4. **Phase 2 parts 4-8** — hours, location, review, booking, wifi
5. **Phase 4 additions** — add renderers for the new sections
6. **Phase 3** — Section editor UI with drag-to-reorder in /create
7. **Phase 2 parts 9-13** — lead_capture, amenities, schedule, pricing_table, featured_products
8. **Phase 5** — Plan gating with padlock UI
9. **Phase 6** — New Supabase tables
10. **Phase 7** — Dashboard additions (leads inbox, booking requests, feedback, analytics)

---

## Revised positioning after this upgrade

This is no longer "a digital business card." It's:

**"A scannable business profile — built for your type of business,
in under 10 minutes, with no website needed."**

The QR code is the distribution. The business-type-aware profile is the product.
This is a meaningful jump in value that justifies higher pricing, a longer
sales pitch, and most importantly — genuine word of mouth, because the
restaurant owner whose customers now never ask "can I see the menu?" will
tell their friends who own restaurants.

---

*Drop this file in the project root and tell Antigravity:*
*"Read UPGRADE_PLAN.md and proceed with Phase 1 first. Ask me before starting Phase 2."*

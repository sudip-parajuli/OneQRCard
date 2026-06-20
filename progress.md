# Digital Presence Builder — Progress Log

This log tracks the upgrades, feature development, and current progress of the Business-Type Aware Digital Presence Builder project.

---

## 🚀 Current Status (Overhaul v2)

* **Next.js Build**: Successful (Exit Code 0).
* **Supabase Integration**: Ready & verified (all SQL migrations executed on remote Supabase).
* **Completed Upgrades**:
  * **Immediate Actions**: Applied remote DB schema changes, fixed Lifetime subdomain copy, and renamed self-edit links.
  * **Phase 1 (Homepage Overhaul)**: Implemented problem-first hero, Before/After split panel, animated QR code reveal, horizontal scroll mockup showcase, and dynamic paid card counters.
  * **Phase 2 (Pricing Overhaul)**: Redesigned pricing cards layout, updated tier descriptions (Free Trial, Pro, Business), updated comparative features table, and integrated native FAQ accordions.
  * **Demo Profiles**: Seeded 5 live templates (`demo-restaurant`, `demo-salon`, `demo-hotel`, `demo-creative`, and `demo-consultant`).

---

## 📈 Phase-by-Phase Progress

### Phase 0: Planning & Decisions
- [x] Defined free trial limits (15 days, then read-only).
- [x] Standardized tier-specific card allowances and feature gating (Basic, Pro, Business).
- [x] Integrated base pricing numbers in NPR/USD.

### Phase 1: Business Type Selector at Creation
- [x] Added `business_type`, `sections` JSONB, and `section_order` columns to the `cards` database schema.
- [x] Created full-screen grid step 0 selector on the `/create` flow.
- [x] Programmed smart presets (theme colors, default layout sections) matching the selected business type.

### Phase 2 & 4: Sections Library (Editors & Renderers)
- [x] Created TypeScript interfaces for all section types in `lib/sections.ts`.
- [x] Created visual editors inside `components/SectionEditors.tsx` for all sections:
  * Menu, Gallery, Services, Hours, Location, Review, Booking, WiFi, Lead Capture, Amenities, Schedule, Pricing Table, Featured Products, and Courses.
- [x] Built visual renderers in `components/SectionRenderers.tsx` inheriting active theme styles (`glassmorphic`, `neonDark`, `minimal`, `bold`, etc.).

### Phase 3: Dynamic Section Customization UI
- [x] Integrated Move Up ▲ / Move Down ▼ reordering buttons inside `components/CardForm.tsx`.
- [x] Supported dynamic section removal.
- [x] Added an inline "+ Add Profile Section" pool selector displaying available sections not yet in the active stack.

### Refactored Phase 4: App-Like Tabbed Layout
- [x] Refactored `components/CardPreview.tsx` to display active sections in a horizontal, swipe-responsive tab navigation bar rather than a vertical stack.
- [x] Prioritized landing tab routing based on business type (e.g. restaurant lands on **🍽️ Menu** tab, salon lands on **✂️ Services** tab).
- [x] Housed bio and quick links under the **👤 About** tab, preventing duplicate social/contact widgets.
- [x] Created a mini brand header for non-profile tabs to show logo, title, and open status.

### Phase 5: Plan Gating & Padlock UI
- [x] Implemented the `isSectionLocked` utility inside `lib/sections.ts`.
- [x] Masked premium sections (leads, schedule, products, etc.) with padlock overlays in the customizer form, disabling inputs and showing an "Upgrade to unlock" CTA linking to the upgrade section.
- [x] Enforced gates on advanced options (restricting WiFi scan-to-connect QR and Booking request forms to the Business plan).

### Phase 6: Supabase Tables & public endpoints
- [x] Wrote SQL schema migrations for `leads`, `booking_requests`, and `feedback` tables.
- [x] Created public POST endpoints to submit and record customer submissions.
- [x] Developed card owner verified API route for Inbox retrieval at `/api/cards/[id]/inbox`.

### Phase 7: Owner Inbox CRM Dashboard
- [x] Designed the `<InboxCRM>` dashboard tabs displaying Leads, Bookings, and Private Feedback.
- [x] Integrated the CRM dashboard inside the card owner's edit workspace page (`app/edit/[id]/EditClient.tsx`).

---

## 🛠️ Recent Changes & Updates

### June 2026: Mobile Profile Tabbed Layout Refactor
* **Issue**: The stacked layout had contact links, addresses, and social icons repeating multiple times if custom sections were added.
* **Resolution**: Moved all custom sections into their own navigation tabs at the top. The landing tab priority defaults dynamically to the main business feature (Menu for restaurants, Services for salons/consultants, Gallery for creatives, etc.).
* **WiFi Bootstrapping Scenarios**: Documented captive portal "Walled Garden" DNS whitelisting integration details, printed whiteboard QR stickers, and offline NFC tags to connect guests who don't have internet data.

### June 2026: Complete Overhaul Phases 4–9 Completed
* **Workspace Dashboard (Phase 4 & 9)**: Removed the single-card redirect lock, implemented top-level workspace analytics summary widgets (total scans, leads, bookings, feedback), card limit progress indicators, and per-card quick stats. Added explanatory copywriting on single QR consolidation.
* **Custom Branded QR customizer (Phase 5)**: Created canvas drawing engine in `lib/qr-helper.ts` supporting custom dot patterns (square, rounded, dots), corner eye styles (square, rounded), and center logo clipping. Embedded custom controls in Step 3 (Style & Custom Links) of the creation wizard.
* **Self-Edit Discoverability & Watermark (Phases 6 & 8)**: Added isOwner floating dashboard shortcut at the bottom of public pages. Added a clean ad banner watermark to all basic plan cards.
* **Backend Expiry Enforcement (Phase 7)**: Implemented server-side validation on leads, bookings, and feedback POST endpoints to reject entries with `403 Forbidden` if a Basic tier card's 15-day trial period has ended.

### June 2026: Public Customer Profile Refactor & Cleanups
* **Redundant Blocks Cleaned**: Removed `DownloadBusinessCard`, `ShareQR`, and `CardMap` components from the bottom of the public customer page (`app/card/[slug]/page.tsx`), eliminating duplicated/repeated contact details, location, and social links that were previously stacked on the page.
* **Integrated Share Tab**: Housed the custom QR code viewer and sharing tools into a dedicated **Share** tab (`🔗 Share`) inside the `CardPreview` component, keeping all profile features inside a single premium tab container.
* **Empty Slug Guard**: Implemented placeholder instruction card inside the `ShareQR` component to guide users through custom link generation (slug selection) before showing QR codes.
* **Walled Garden Offline Tip**: Added detailed guidance inside `WifiEditor` on how to set up Guest WiFi as Open with a Walled Garden (DNS Whitelist) pointing to the card domain, solving the chicken-and-egg problem of needing internet to scan the card.
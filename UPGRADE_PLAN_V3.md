UPGRADE PLAN — Step 1 Redesign: Individual vs Business
Paste this into Antigravity and say "proceed with this plan."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace the current Step 1 "What kind of business do you run?" grid
(11 business type options) with a simpler two-choice step:
"Is this card for you personally, or for your business?"

TWO OPTIONS:
- Individual / Personal card
- Business / Organization card

After picking one of these two, the user moves to Step 2 as before.
The business_type logic that currently drives section presets is NOT
removed — it is just moved and simplified. See details below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — NEW UI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout: full screen step, centered, minimal.
Headline: "Who is this card for?"
Subheadline: "We'll set up the right layout for you."

Show exactly TWO large option cards side by side (stacked on mobile):

CARD A — Individual / Personal
Icon: a single person silhouette SVG (not an emoji)
Title: "Just me"
Description: "Freelancer, professional, student, or anyone
who wants a personal digital card with their own contact
details, portfolio, and social links."
Examples shown in small muted text below description:
"e.g. Photographer · Consultant · Job seeker · Artist · Developer"

CARD B — Business / Organization
Icon: a building/storefront SVG (not an emoji)
Title: "My business"
Description: "A shop, restaurant, clinic, hotel, salon,
or any business that wants a digital profile customers
can scan to find their menu, services, location, and contact."
Examples shown in small muted text below description:
"e.g. Restaurant · Hotel · Salon · Clinic · Retail shop · Café"

Styling for both cards:
- Large cards, generous padding (p-8 on desktop, p-6 on mobile)
- Rounded-2xl border border-stone-200 bg-white shadow-sm
- On hover: border-brand shadow-md transition-all
- On selected: border-2 border-brand bg-brand/5 with a checkmark
  badge in the top-right corner of the card
- Icon: 48x48px SVG, color: text-stone-400, centered above the title
- Title: text-xl font-bold text-stone-900
- Description: text-sm text-stone-500 mt-2 leading-relaxed
- Examples: text-xs text-stone-400 mt-3 font-medium

Auto-advance to Step 2 after 350ms when a card is selected.
Do NOT show a "Continue" button — selection itself advances.

Below the two cards, in very small muted text:
"Not sure? Pick either — you can adjust everything in the next step."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT CHANGES IN THE DATA MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The existing business_type column in the cards table stays as-is.
Map the two new choices to existing values:

- "Just me" → sets business_type = 'individual' (new value, add to
  the BUSINESS_TYPE_DEFAULTS in lib/business-types.ts — see below)
- "My business" → sets business_type = 'general' (existing value,
  which gives a blank slate with hero + contact + socials as defaults)

The 11 specific business type options (restaurant, hotel, salon, etc.)
are NOT deleted — they are just no longer shown in Step 1. They become
an optional refinement in Step 3 (Customize), shown only when
business_type = 'general'. More on this below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEW INDIVIDUAL PRESET — add to lib/business-types.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add this entry to BUSINESS_TYPE_DEFAULTS:

individual: {
  label: "Personal / Individual",
  emoji: "👤",
  description: "Personal digital card for professionals and freelancers",
  defaultSections: ["hero", "contact", "socials", "gallery", "services"],
  suggestedColor: "#2c3e50",
}

The individual preset:
- Does NOT preload menu, hours, location, amenities, wifi — those are
  business concepts
- DOES preload gallery (portfolio) and services (packages/rates) because
  freelancers and creatives use these
- Default theme: Minimal (clean, personal, not corporate-looking)
- Default suggested color: a neutral dark (not the brand green which
  reads as "business")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 OPTIONAL REFINEMENT FOR BUSINESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When the user picks "My business" in Step 1, show an optional
refinement selector at the TOP of the Step 3 (Customize) panel:

Label: "What best describes your business? (optional)"
Subtext: "Helps us suggest the right sections — skip if unsure."

Show the 11 business type options as a compact horizontal scroll
of small pill/chip buttons (not large cards):
- Each pill: emoji + label, e.g. "🍽️ Restaurant"
- Selected pill: bg-brand text-white
- Unselected: bg-stone-100 text-stone-600 border border-stone-200
- Height: ~36px, font-size: 13px
- Horizontal scroll, no wrapping, scrollbar hidden

When a pill is selected, it updates business_type in state AND
re-runs the section preset loader (same logic as before) to swap
in the relevant default sections. Show a small toast notification:
"Sections updated for [type]" that disappears after 2 seconds.

This way:
- Businesses who know their type get the right preset
- Businesses who don't know or don't fit get the general blank slate
- Nobody is forced to disclose or categorize themselves
- The existing preset system is fully preserved

For "Just me" (individual) pickers: do NOT show this refinement
in Step 3 at all. The individual preset is the only option for them.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COPY CHANGES ACROSS THE APP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Anywhere in the codebase that says "What kind of business do you run?"
replace with "Who is this card for?"

Anywhere that says "Business type" as a label in the editor or
dashboard replace with "Card type" or just remove the label entirely
if the context is clear.

In the dashboard, show the card type badge as either:
- "Personal card" (for individual)
- "Business card" (for general/any specific business type)

In the pricing page and homepage, the copy should acknowledge both
audiences. Specifically update the homepage hero subheadline from:
"Replace paper business cards with a digital card guests scan..."
to:
"Whether you're a freelancer sharing your portfolio or a restaurant
showing your menu — one QR code puts everything in your customers'
and contacts' hands instantly."

And the trust line below the CTAs, currently:
"Used by restaurants, hotels, salons & consultancies across Nepal"
Update to:
"Used by freelancers, restaurants, hotels & salons across Nepal"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION EDITOR LABELS — make them work for both audiences
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Some section labels currently read as business-only. Update these
to work for both individuals and businesses:

"Services" section:
- For business: title stays "Services"
- For individual: title shows as "What I offer" (or "My Services")
  Change this by checking card.business_type === 'individual' in the
  renderer and swapping the displayed title. The section type stays
  the same in the DB — only the display label changes.

"Gallery" section:
- For business: "Our Gallery" or "Photo Gallery"
- For individual: "My Portfolio"
  Same pattern — check business_type in renderer, swap display title.

"Lead capture" section:
- For business: "Get a quote" / "Contact us"
- For individual: "Work with me" / "Get in touch"
  Same pattern.

"Hero" section placeholder text in the editor:
- Business name field placeholder: "Your Business Name"
  → Change to: "Your name or business name"
- Tagline field placeholder: "e.g. Best coffee in Kathmandu"
  → Change to: "e.g. Freelance designer · Full-stack developer · Café owner"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUILD ORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Do in this order. Run npm run build after each item.

1. Add 'individual' to BUSINESS_TYPE_DEFAULTS in lib/business-types.ts
   with the preset defined above. This is a pure data change, no UI.

2. Replace Step 1 UI in the create flow with the two-card layout.
   Wire "Just me" → individual, "My business" → general.
   Confirm auto-advance works and business_type is set correctly
   in the form state before proceeding.

3. Add the optional business type pill selector to the top of Step 3
   for business pickers only. Confirm it updates sections correctly
   when a pill is selected.

4. Update copy: "What kind of business?" → "Who is this card for?"
   everywhere in the codebase (grep for the old string).

5. Update section display labels based on business_type = individual
   (Services → "What I offer", Gallery → "My Portfolio", etc.)

6. Update homepage hero subheadline and trust line to include
   individuals alongside businesses.

7. Update dashboard card type badge labels.

Run npm run build. Test the full create flow from Step 1 to the
payment/activation screen on both mobile and desktop before shipping.
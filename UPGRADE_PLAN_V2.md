<USER_REQUEST>
# UPGRADE PLAN v2 â€” One-QR-Card Complete Overhaul
# Read this plan and start with Phase 1."

---

## Context & what we know from auditing the live site

The product is functional and real. The core gap is not features â€” it's
presentation, flow clarity, and surfacing what's already built in ways
users can actually find and understand.

Key facts that shape every decision below:
- Subdomain feature is listed but broken (Vercel + no custom domain yet).
  Handle this honestly in the UI rather than hiding it.
- Pro = 2 card slots (1 primary + 1 team). Business = 5 slots. This
  multi-card workspace is built in the DB but has no post-purchase UI.
- The magic-link edit system exists but there is no "Edit my card" entry
  point anywhere visible on the site.
- The original product insight â€” businesses have multiple QR codes and
  need one â€” is not on the homepage. That's the #1 sales message and
  it's missing.
- Branded/logo-embedded QR is a genuine differentiator. It's a bullet
  point on the pricing page. It should be a hero visual.

---

## Phase 1 â€” Homepage complete rewrite

### Goal
The homepage has one job: make a restaurant owner or hotel manager
immediately understand "I have this problem, this solves it" and click
create. Right now it doesn't do that.

### 1a. Hero section rewrite

Replace the current hero with a problem-first headline structure:

**Headline (large):**
"You have 5 QR codes. Your customers have one phone."

**Subheadline:**
"One-QR-Card replaces your separate QR codes for contact, WhatsApp,
Google reviews, social media, menu, and more â€” with a single scannable
profile for your business."

**CTA:** "Create your free card" (primary) + "See an example â†’" (secondary,
opens a demo card in a new tab â€” create a real demo card for Easymoto
or a fictional restaurant you control and link it here)

**Trust line below CTAs:**
"Used by restaurants, hotels, salons & consultancies across Nepal"
(update this number/text once you have real users)

### 1b. "The problem" section â€” 
<truncated 20049 bytes>
py.
   No DB changes. Pure content + UI.

4. **Phase 7** â€” Free trial expiration cron + DB column + expired banner.
   This is the most important business logic â€” free cards without
   expiry enforcement cost you hosting forever.

5. **Phase 8** â€” Free tier ad banner (self-ad, bottom of page).
   1 hour of work, passive user acquisition forever.

6. **Phase 4** â€” Multi-card workspace dashboard + team card post-purchase
   flow. This surfaces a feature that's already built but invisible.

7. **Phase 3** â€” Multi-step wizard for /create. Biggest UX change.
   Do it after the above are stable so you're not moving the target.

8. **Phase 5** â€” Branded QR customization upgrade + qr-code-styling
   npm package + homepage animated QR visual.

9. **Phase 9** â€” "Single QR" selling point woven through the product.
   Copy + micro-animation changes. Do last since it touches many files.

---

## Immediate action items (do before starting any code)

1. Fix the subdomain copy on the pricing page â€” takes 2 minutes,
   currently misleading paying customers.

2. Add "Manage my card" to the site nav â€” 5 minutes, immediately
   helps every existing paid user.

3. Create 4-5 demo cards (restaurant, hotel, salon, photographer,
   consultant) on the live site and bookmark their URLs â€” you'll
   need these for the homepage business-type showcase in Phase 1.

4. Confirm the 15-day trial expiry is or isn't enforced in the current
   code â€” if it isn't, Phase 7 is urgent, not optional.

the credentials for a admin is 
sparajuli802@gmail.com
sudip@oneqrcode12345
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-06-20T10:18:51+05:45.

The user's current state is as follows:
Active Document: c:\Users\Acer\Desktop\digital-card-app\progress.md (LANGUAGE_MARKDOWN)
Cursor is on line: 66
Other open documents:
- c:\Users\Acer\Desktop\digital-card-app\progress.md (LANGUAGE_MARKDOWN)
Running terminal commands:
- npm run dev (in c:\Users\Acer\Desktop\digital-card-app, running for 47m52s)
</ADDITIONAL_METADATA>
<USER_REQUEST>
# UPGRADE PLAN v2 â€” One-QR-Card Complete Overhaul
# Read this plan and start with Phase 1."

---

## Context & what we know from auditing the live site

The product is functional and real. The core gap is not features â€” it's
presentation, flow clarity, and surfacing what's already built in ways
users can actually find and understand.

Key facts that shape every decision below:
- Subdomain feature is listed but broken (Vercel + no custom domain yet).
  Handle this honestly in the UI rather than hiding it.
- Pro = 2 card slots (1 primary + 1 team). Business = 5 slots. This
  multi-card workspace is built in the DB but has no post-purchase UI.
- The magic-link edit system exists but there is no "Edit my card" entry
  point anywhere visible on the site.
- The original product insight â€” businesses have multiple QR codes and
  need one â€” is not on the homepage. That's the #1 sales message and
  it's missing.
- Branded/logo-embedded QR is a genuine differentiator. It's a bullet
  point on the pricing page. It should be a hero visual.

---

## Phase 1 â€” Homepage complete rewrite

### Goal
The homepage has one job: make a restaurant owner or hotel manager
immediately understand "I have this problem, this solves it" and click
create. Right now it doesn't do that.

### 1a. Hero section rewrite

Replace the current hero with a problem-first headline structure:

**Headline (large):**
"You have 5 QR codes. Your customers have one phone."

**Subheadline:**
"One-QR-Card replaces your separate QR codes for contact, WhatsApp,
Google reviews, social media, menu, and more â€” with a single scannable
profile for your business."

**CTA:** "Create your free card" (primary) + "See an example â†’" (secondary,
opens a demo card in a new tab â€” create a real demo card for Easymoto
or a fictional restaurant you control and link it here)

**Trust line below CTAs:**
"Used by restaurants, hotels, salons & consultancies across Nepal"
(update this number/text once you have real users)

### 1b. "The problem" section â€” 
<truncated 20049 bytes>
py.
   No DB changes. Pure content + UI.

4. **Phase 7** â€” Free trial expiration cron + DB column + expired banner.
   This is the most important business logic â€” free cards without
   expiry enforcement cost you hosting forever.

5. **Phase 8** â€” Free tier ad banner (self-ad, bottom of page).
   1 hour of work, passive user acquisition forever.

6. **Phase 4** â€” Multi-card workspace dashboard + team card post-purchase
   flow. This surfaces a feature that's already built but invisible.

7. **Phase 3** â€” Multi-step wizard for /create. Biggest UX change.
   Do it after the above are stable so you're not moving the target.

8. **Phase 5** â€” Branded QR customization upgrade + qr-code-styling
   npm package + homepage animated QR visual.

9. **Phase 9** â€” "Single QR" selling point woven through the product.
   Copy + micro-animation changes. Do last since it touches many files.

---

## Immediate action items (do before starting any code)

1. Fix the subdomain copy on the pricing page â€” takes 2 minutes,
   currently misleading paying customers.

2. Add "Manage my card" to the site nav â€” 5 minutes, immediately
   helps every existing paid user.

3. Create 4-5 demo cards (restaurant, hotel, salon, photographer,
   consultant) on the live site and bookmark their URLs â€” you'll
   need these for the homepage business-type showcase in Phase 1.

4. Confirm the 15-day trial expiry is or isn't enforced in the current
   code â€” if it isn't, Phase 7 is urgent, not optional.

the credentials for a admin is 
sparajuli802@gmail.com
sudip@oneqrcode12345
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-06-20T10:18:51+05:45.

The user's current state is as follows:
Active Document: c:\Users\Acer\Desktop\digital-card-app\progress.md (LANGUAGE_MARKDOWN)
Cursor is on line: 66
Other open documents:
- c:\Users\Acer\Desktop\digital-card-app\progress.md (LANGUAGE_MARKDOWN)
Running terminal commands:
- npm run dev (in c:\Users\Acer\Desktop\digital-card-app, running for 47m52s)
</ADDITIONAL_METADATA>

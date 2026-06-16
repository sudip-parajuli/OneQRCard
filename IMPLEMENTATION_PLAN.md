# Implementation Plan — Global Launch

Three upgrades, designed to be done **in this order** (each phase is independently
shippable and testable before moving to the next):

1. **Rebrand & decouple** — make the app a standalone product, not tied to a
   SIA Enterprises subdomain
2. **International payments** — add Stripe Checkout alongside eSewa, with
   region-aware routing and dual NPR/USD pricing
3. **Self-edit flow** — passwordless (magic link) login so customers can
   update their own card after purchase

Each phase below lists: what changes, new files, modified files, schema
changes, env vars, and a testing checklist.

---

## Phase 0 — Before you start

- New repo (separate from the agency site) — keep this project's git history,
  just give it a new remote.
- Pick a product name + domain (e.g. `tapcard.io`, `linkcard.app`, whatever's
  available). Everything below uses `yourcard.app` as a placeholder — replace
  via find-and-replace.
- New Vercel project pointing at the new domain + wildcard subdomain
  (`*.yourcard.app`) — same wildcard setup as before, just a different domain.

---

## Phase 1 — Rebrand & decouple

### Goal
Remove all hardcoded "SIA Enterprises" / "siaenterprises.com.np" references
and centralize branding in one config file, so the product can be whitewalled
or rebranded later without a search-and-replace.

### New file: `lib/config.ts`
```ts
export const SITE = {
  name: "YourCard",
  domain: process.env.NEXT_PUBLIC_BASE_DOMAIN || "yourcard.app",
  supportEmail: "support@yourcard.app",
  supportWhatsApp: "https://wa.me/9779800000000", // your support line
};
```

### Modified files
- `app/layout.tsx` — page title/description from `SITE.name`
- `app/page.tsx` — nav brand name, footer text
- `app/card/[slug]/page.tsx` — "Made with ..." footer link
- `README.md` — update domain examples

### Env vars
- `NEXT_PUBLIC_BASE_DOMAIN=yourcard.app`
- `NEXT_PUBLIC_BASE_URL=https://yourcard.app`

### Testing checklist
- [ ] No occurrences of `siaenterprises` remain (`grep -ri siaenterprises .`)
- [ ] `npm run build` passes
- [ ] Subdomain middleware still rewrites correctly with new domain (test
      locally via `/etc/hosts` entry like `127.0.0.1 testcard.yourcard.app`)

---

## Phase 2 — International payments (Stripe + eSewa)

### Goal
- Nepali customers can still pay via eSewa (NPR).
- Everyone else pays via Stripe Checkout (USD), which covers cards, Apple
  Pay, Google Pay, and 40+ currencies automatically.
- Customer picks a payment method on the `/create` page; default suggestion
  is based on their country (via Vercel's geo headers), but it's always a
  free choice — never auto-redirect without confirmation.

### Pricing model
Add USD prices alongside NPR. Suggested mapping (~1 USD ≈ Rs 135, rounded to
clean numbers):

| Plan     | NPR (one-time) | USD (one-time) |
|----------|-----------------|------------------|
| Basic    | Rs 500          | $5               |
| Pro      | Rs 1,500        | $15              |
| Business | Rs 3,500        | $35              |

### Schema changes — `supabase/migration_002_payments.sql`
```sql
alter table cards
  add column if not exists currency text default 'NPR' check (currency in ('NPR','USD')),
  add column if not exists payment_provider text check (payment_provider in ('esewa','stripe')),
  add column if not exists stripe_session_id text,
  add column if not exists amount_paid integer; -- smallest currency unit (paisa / cents)

create index if not exists cards_stripe_session_idx on cards (stripe_session_id);
```

### Modified file: `lib/types.ts`
Restructure `PLAN_DETAILS` to hold both currencies:
```ts
export const PLAN_DETAILS: Record<PlanId, {
  name: string;
  priceNPR: number;
  priceUSD: number; // in whole dollars
  features: string[];
}> = {
  basic:    { name: "Basic",    priceNPR: 500,  priceUSD: 5,  features: [...] },
  pro:      { name: "Pro",      priceNPR: 1500, priceUSD: 15, features: [...] },
  business: { name: "Business", priceNPR: 3500, priceUSD: 35, features: [...] },
};
```
Update every place that read `plan.price` (`app/page.tsx`, `app/pricing/page.tsx`,
`app/create/page.tsx`) to show the right currency based on the selected
payment method/region.

### New: payment method picker on `/create`
Add a step before the "Pay & activate" button:
```
[ Pay with eSewa — Rs 500 ]   [ Pay with card — $5 ]
```
- Detect default via `req.geo?.country` (Vercel) — if `"NP"`, highlight
  eSewa; otherwise highlight Stripe. Both buttons always visible.
- Store the choice in component state; `handleSubmit` branches based on it.

### New file: `app/api/payment/stripe/create-session/route.ts`
```ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { PLAN_DETAILS, PlanId } from "@/lib/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { cardId } = await req.json();
  const db = supabaseAdmin();
  const { data: card } = await db.from("cards").select("*").eq("id", cardId).single();
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const plan = card.plan as PlanId;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: `${PLAN_DETAILS[plan].name} digital card — ${card.business_name}` },
        unit_amount: PLAN_DETAILS[plan].priceUSD * 100, // cents
      },
      quantity: 1,
    }],
    metadata: { cardId: card.id },
    success_url: `${baseUrl}/payment/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/payment/failure?cardId=${card.id}`,
  });

  await db.from("cards").update({
    currency: "USD",
    payment_provider: "stripe",
    stripe_session_id: session.id,
  }).eq("id", card.id);

  return NextResponse.json({ url: session.url });
}
```

### New file: `app/api/webhooks/stripe/route.ts`
Stripe webhooks are the **reliable** way to confirm payment (the success
redirect can be closed/interrupted by the user). This is the source of truth
for flipping `payment_status` to `paid`.
```ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const cardId = session.metadata?.cardId;
    if (cardId) {
      await supabaseAdmin().from("cards").update({
        payment_status: "paid",
        amount_paid: session.amount_total,
      }).eq("id", cardId);
    }
  }

  return NextResponse.json({ received: true });
}
```
> Note: this route needs the **raw body** for signature verification — in the
> App Router, `req.text()` gives you that as long as you don't add body
> parsing middleware in front of it. Don't add this path to any JSON-parsing
> middleware matcher.

### Modified file: `app/payment/success/page.tsx`
Branch on `?provider=stripe` vs the existing eSewa `?data=` flow:
- If `provider=stripe`: poll `/api/cards?slug=...` (or a new
  `/api/payment/status?cardId=`) for up to ~10s waiting for
  `payment_status === 'paid'` (webhook may take a moment), then show success.
- Otherwise: keep existing eSewa verification logic.

### Env vars to add
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe dashboard setup
1. Create a Stripe account, get test keys from the Developers tab.
2. Add a webhook endpoint pointing to `https://yourcard.app/api/webhooks/stripe`,
   subscribed to `checkout.session.completed`. Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.
3. For local testing, use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

### Testing checklist
- [ ] eSewa flow still works end-to-end (regression)
- [ ] Stripe test card `4242 4242 4242 4242` completes checkout and webhook
      flips `payment_status` to `paid`
- [ ] Card becomes visible at `/card/[slug]` immediately after webhook fires
- [ ] Cancelling Stripe checkout lands on `/payment/failure` without charging
- [ ] Webhook signature check rejects tampered payloads (test with wrong secret)

---

## Phase 3 — Self-edit flow (magic link)

### Goal
After paying, a customer can come back later, prove ownership of their card
via a one-time email link (no password), and edit their details — logo,
links, theme, color — with changes going live immediately.

### Why magic link (not passwords)
- Zero password-reset support burden for a small team
- Supabase Auth handles it natively — minimal new code
- Matches the "buy once, occasionally tweak" usage pattern

### Schema changes — `supabase/migration_003_self_edit.sql`
```sql
alter table cards
  add column if not exists owner_email text;

create index if not exists cards_owner_email_idx on cards (owner_email);

-- Allow a logged-in user to read/update only their own card(s)
create policy "Owners can view their own cards"
  on cards for select
  using (auth.jwt() ->> 'email' = owner_email);

create policy "Owners can update their own cards"
  on cards for update
  using (auth.jwt() ->> 'email' = owner_email);
```
> These policies apply when requests carry a **user's auth token** (via the
> anon key + session), as opposed to the service-role key used by existing
> API routes. Both can coexist.

### New dependency
```bash
npm install @supabase/ssr
```

### New file: `lib/supabase-server.ts`
Server-side Supabase client that reads/writes the auth cookie, per
`@supabase/ssr` docs (`createServerClient` with `cookies()` from
`next/headers`).

### Modified file: `lib/supabase.ts`
Add a **browser** client using `createBrowserClient` from `@supabase/ssr`
(replaces the plain `createClient` for anything used client-side, so the
session cookie is shared correctly).

### Modified: `app/create/page.tsx`
Add an `email` field to the form (required) — this becomes `owner_email` on
the card record, and is also where we send the post-purchase magic link.

### New file: `app/edit/page.tsx`
"Manage your card" — a single email input + "Send login link" button. Calls
`supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: ".../edit/callback" } })`.

### New file: `app/edit/callback/route.ts`
Auth callback — exchanges the magic-link code for a session
(`supabase.auth.exchangeCodeForSession`), sets cookies, redirects to
`/edit/dashboard`.

### New file: `app/edit/dashboard/page.tsx`
- Server component: get current session via `lib/supabase-server.ts`
- Query `cards` where `owner_email = session.user.email` (RLS makes this
  automatic — `select *` naturally returns only their rows)
- If exactly one card: redirect straight to `/edit/[id]`
- If multiple (Business plan, future multi-card support): list them

### New file: `app/edit/[id]/page.tsx`
- Reuses the **same form UI as `/create`** — extract the form body into a
  shared component `components/CardForm.tsx` that both `/create` and
  `/edit/[id]` render, parameterized by:
  - initial `data` (empty for create, fetched card for edit)
  - submit label ("Pay & activate" vs "Save changes")
  - submit handler (create+pay vs PUT update)
- On save: `PUT /api/cards/[id]` with the updated fields (no payment involved
  — editing is free, included in the original purchase)

### New file: `app/api/cards/[id]/route.ts`
```ts
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // Use the request's auth-bound Supabase client (lib/supabase-server.ts),
  // NOT supabaseAdmin — so RLS enforces that only the owner can update.
  const supabase = createServerSupabase();
  const body = await req.json();

  const { data, error } = await supabase
    .from("cards")
    .update({
      business_name: body.business_name,
      tagline: body.tagline,
      brand_color: body.brand_color,
      theme: body.theme,
      logo_data_url: body.logo_data_url,
      phone: body.phone,
      whatsapp: body.whatsapp,
      website: body.website,
      facebook: body.facebook,
      instagram: body.instagram,
      tiktok: body.tiktok,
      youtube: body.youtube,
      email: body.email,
      // slug, subdomain, plan, payment fields are NOT editable here
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ card: data });
}
```

### Post-purchase email
After `payment_status` flips to `paid` (in both the eSewa verify route and
the Stripe webhook), send the customer a magic link automatically so their
first login is frictionless:
```ts
await supabase.auth.signInWithOtp({ email: card.owner_email, options: { emailRedirectTo: editCallbackUrl } });
```
This requires Supabase's email provider configured (Project Settings → Auth
→ SMTP, or use Supabase's default for low volume — fine to start).

### Middleware update
`@supabase/ssr` needs the middleware to refresh the auth session cookie on
every request. Add this alongside the existing subdomain logic in
`middleware.ts` (the subdomain rewrite and the auth refresh are independent —
just run both and merge the response).

### Env vars
No new ones beyond Supabase (already configured). Confirm email templates in
Supabase Dashboard → Auth → Email Templates (customize the magic link email
subject/body to match your brand).

### Testing checklist
- [ ] Purchase a card → receive magic link email automatically
- [ ] Magic link logs you in and lands on `/edit/[id]` with your card prefilled
- [ ] Editing and saving updates the live `/card/[slug]` page immediately
- [ ] A different email cannot access someone else's card (test by trying
      `/edit/[someone-elses-id]` while logged in as a different user — should
      get a 403/empty result via RLS)
- [ ] slug/plan/payment fields are NOT editable through this flow

---

## Suggested order of work in Antigravity

1. Phase 1 (rebrand) — small, low-risk, do first
2. Phase 2 (Stripe) — additive, doesn't touch existing eSewa code paths
3. Phase 3 (self-edit) — biggest change; extract `CardForm` component as a
   prerequisite refactor before building `/edit`

After each phase: `npm run build` + the checklist above before moving on.

---

## Open decisions to make before starting

- **Product name & domain** — needed for Phase 1 config and Stripe product
  names.
- **USD pricing** — confirm $5/$15/$35 or adjust.
- **Email sending** — use Supabase's built-in email (rate-limited, fine for
  early traffic) or connect a provider (Resend, Postmark) via Supabase SMTP
  settings for higher volume / better deliverability.
- **Stripe payout currency/country** — affects which country you register
  your Stripe account in; doesn't block development (test mode works
  regardless).

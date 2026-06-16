# SIA Digital Cards

A self-serve digital business card builder: clients design their card
(theme, colors, logo, contact + social links), pay once, and get a
permanent QR code that opens a "save to contacts" page with all their links.

- **Basic plan** — hosted at `yourcard.app/card/[slug]`
- **Pro / Business plans** — hosted at `[slug].yourcard.app` (custom subdomain)
- **Payment** — one-time via eSewa (no subscriptions)

---

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase project keys (see step 2).
The eSewa values in `.env.example` are the official **sandbox/test**
credentials — payments work end-to-end in test mode without any setup.

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## 2. Supabase setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `supabase/schema.sql` — this creates the
   `cards` table and locks it down with Row Level Security.
3. Copy your **Project URL**, **anon public key**, and **service_role key**
   from Project Settings → API into `.env.local`.

The app only ever writes to the database via the service-role key inside
API routes (`lib/supabase.ts` → `supabaseAdmin()`), so the anon key is only
used for the safety-net read policy.

---

## 3. eSewa setup (one-time payments)

The flow uses **eSewa ePay v2**:

1. `/create` → user fills the form → clicks "Pay & activate card"
2. `/api/cards` creates a row with `payment_status = 'pending'`
3. `/api/payment/initiate` signs the request (HMAC-SHA256) and the browser
   auto-submits a form to eSewa
4. On success, eSewa redirects to `/payment/success`, which calls
   `/api/payment/verify` to confirm the transaction and flips
   `payment_status` to `'paid'` — only then does the card become public
5. On failure, eSewa redirects to `/payment/failure`

**To go live:**
1. Register as an eSewa merchant at [merchant.esewa.com.np](https://merchant.esewa.com.np)
2. Replace `ESEWA_MERCHANT_CODE` and `ESEWA_SECRET_KEY` with your real values
3. Switch `ESEWA_PAYMENT_URL` to `https://epay.esewa.com.np/api/epay/main/v2/form`
   and `ESEWA_STATUS_URL` to `https://epay.esewa.com.np/api/epay/transaction/status/`

**Want Khalti instead/as well?** The same pattern applies — swap the
signing logic in `/api/payment/initiate` and the verification call in
`/api/payment/verify` for Khalti's API. Happy to add this as a second
option (a payment-method picker) in a follow-up.

---

## 4. Deploying with subdomains per client (Vercel)

1. Push this repo to GitHub and import it into Vercel.
2. In Vercel → Project → Settings → Domains, add:
   - `yourcard.app`
   - `*.yourcard.app` (wildcard)
3. At your domain registrar, point both to Vercel:
   - `A` record for `@` → Vercel's IP (shown in the Vercel dashboard)
   - `CNAME` record for `*` → `cname.vercel-dns.com`
4. Set `NEXT_PUBLIC_BASE_DOMAIN=yourcard.app` in your Vercel
   environment variables (Production).

Once deployed, any Pro/Business client with slug `easymoto` is
automatically reachable at `easymoto.yourcard.app` — the
`middleware.ts` file rewrites that request to `/card/easymoto` behind
the scenes. No per-client deploys needed.

---

## 5. How a client's card goes from form to live QR

1. Client (or your team) fills out `/create`: business name, tagline,
   brand color, logo (uploaded as a compressed image, stored as base64 —
   fine up to ~300KB), theme, and contact/social links.
2. The live preview on the right updates instantly, including the QR
   code, which always points at the *final* URL (subdomain or `/card/`
   path depending on plan).
3. On payment, the card flips to `paid` and is live at that URL within
   seconds — no manual deployment.
4. You (or the client) download the QR as a PNG to print on a physical
   card, sticker, or table tent.

---

## 6. Themes

Four built-in themes live in `components/CardPreview.tsx`:

- **classic** — colored header band, white body (default)
- **minimal** — plain white, centered logo and links
- **bold** — full-color background with a white "sheet" for links
- **gradient** — diagonal gradient header with a floating link card

Adding a 5th theme: add the id to `ThemeId` in `lib/types.ts`, add a
label to `THEME_LABELS`, and add a new branch in `CardPreview.tsx`.

---

## 7. Editing a card after purchase

There's currently no client-facing "edit" flow — the simplest approach
for now is for your team to update the row directly in Supabase (Table
Editor → `cards`). A self-serve edit page (auth via magic link tied to
the card's email) is a natural Phase 2 addition.

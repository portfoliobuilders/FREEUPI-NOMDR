# FREEUPI

Open-source UPI payment planner for creating structured QR payment requests, partial settlements, instalments and invoice-based collections.

FREEUPI helps merchants and individuals plan legitimate UPI collections. It generates standard `upi://pay` URIs and QR codes. It does **not** process money, hold funds, or bypass MDR, NPCI, RBI, bank, PSP, or merchant-acquirer rules.

## Screenshots

Place product captures in `docs/screenshots/` after a local run:

- Generator: `docs/screenshots/generator.png`
- Dashboard: `docs/screenshots/dashboard.png`
- Invoice: `docs/screenshots/invoice.png`
- Print: `docs/screenshots/print.png`

## Features

- Guest QR generation with local drafts (no account required)
- Single payment, equal split, and custom payment plans
- Integer paise math (no floating-point money)
- Standard UPI URI + high-resolution QR download and print
- Manual payment status with a clear “Manually marked as paid” label
- Optional Supabase auth (email + magic link) and invoice persistence
- Dashboard analytics, invoice detail, calculator, compliance page
- `/setup` checklist for the hosted Supabase schema and auth redirect URLs
- Installable PWA with standalone display

## Architecture

```
app/                  Next.js App Router pages
components/           UI, payment cards, dashboard, layout
lib/money.ts          Integer paise helpers
lib/upi/              URI generation and VPA validation
lib/payments/         Plan creation, validation, verification interface
lib/supabase/         Browser, server, and proxy session clients
supabase/migrations/  PostgreSQL schema + RLS
```

Money is stored and calculated in **paise**. UPI deep links use rupee strings with two decimal places. Payment verification is an interface (`PaymentVerificationProvider`) with a manual MVP implementation only — no fake PSP webhooks.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui + Lucide + Framer Motion
- React Hook Form + Zod
- Supabase Auth + PostgreSQL
- Vercel-ready deployment
- qrcode / qrcode.react for QR rendering

## Quick start

```bash
git clone https://github.com/portfoliobuilders/FREEUPI-NOMDR.git
cd FREEUPI-NOMDR
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). QR generation works without Supabase. Saving invoices requires auth configuration.

## Installation

```bash
npm install
npm run test
npm run lint
npm run typecheck
npm run build
```

## Supabase setup

This repo is wired to project `qjwatcktobybdmdwgymi`.

### 1. Copy API keys

In Supabase: **Project Settings → API**.

```env
NEXT_PUBLIC_SUPABASE_URL=https://qjwatcktobybdmdwgymi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` also works. Never put `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` in a client component or a `NEXT_PUBLIC_*` variable.

### 2. Auth URL configuration

In Supabase: **Authentication → URL Configuration**.

Site URL:

```text
https://freeupinomdr.vercel.app
```

Redirect URLs (add all of these):

```text
https://freeupinomdr.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

Enable Email and Magic Link providers.

### 3. Database

Run `supabase/migrations/0001_init.sql` in the SQL editor, or:

```bash
npx supabase login
npx supabase link --project-ref qjwatcktobybdmdwgymi
npm run schema:push
```

The migration creates `profiles`, `invoices`, and `payment_requests` with Row Level Security so users can only access their own rows.

Easiest in-app path: open `/setup`. It copies the SQL and links to the SQL editor and auth URL settings.

Dashboard shortcuts:

- SQL editor: https://supabase.com/dashboard/project/qjwatcktobybdmdwgymi/sql/new
- Auth URL config: https://supabase.com/dashboard/project/qjwatcktobybdmdwgymi/auth/url-configuration
- API keys: https://supabase.com/dashboard/project/qjwatcktobybdmdwgymi/settings/api-keys

GitHub Actions workflow **Apply Supabase schema** does the same when the `SUPABASE_ACCESS_TOKEN` repository secret is set.

Health check: `GET /api/health` reports whether Auth is reachable and whether the invoice tables exist. If `supabaseConfigured` is `false`, the Vercel environment variables below are missing or invalid.

## Environment setup

Local `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://qjwatcktobybdmdwgymi.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

See `.env.example`. Restart `npm run dev` after changing env files.

## Vercel setup

If signup shows that accounts are unavailable, the deployment does not have valid Supabase keys. Production health currently fails until these are set.

1. Open the Vercel project → **Settings → Environment Variables**.
2. Add these for **Production**, **Preview**, and **Development**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qjwatcktobybdmdwgymi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=https://freeupinomdr.vercel.app
```

3. Do **not** add `SUPABASE_SERVICE_ROLE_KEY` as `NEXT_PUBLIC_*`. Keep the service role key server-only if you use schema push.
4. Redeploy after saving variables. `NEXT_PUBLIC_*` values are baked in at build time, so a new deployment is required.

### Production deployment

After env vars are saved:

```bash
git push origin main
```

Or from the Vercel CLI:

```bash
vercel --prod
```

Confirm `GET https://freeupinomdr.vercel.app/api/health` returns `"supabaseConfigured": true`. Then create an account at `/signup`.

## Security

- Zod validation on payment and auth inputs
- UPI ID format checks and text sanitization
- RLS plus server-side `auth.uid()` ownership checks
- Rate limiting architecture on auth and invoice writes
- No UPI PIN, OTP, CVV, card, or banking password fields
- Service role key is never sent to the browser
- Errors do not log payment credentials

## Compliance

FREEUPI is a planning and QR generation utility. Users remain responsible for NPCI rules, RBI regulations, PSP/bank rules, merchant agreements, applicable MDR, and tax requirements.

FREEUPI should not be used to artificially structure transactions for the purpose of circumventing applicable fees, financial controls, fraud controls, or regulatory requirements.

Read `/compliance` in the app for the full notice.

## Contributing

Issues and pull requests are welcome. Keep money math in integer paise, do not add automatic “stay under ₹2,000” or “avoid MDR” features, and do not introduce fake payment-provider integrations.

## License

MIT

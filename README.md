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
- Single payment, equal instalments, and custom payment plans
- Integer paise math (no floating-point money)
- Standard UPI URI + high-resolution QR download and print
- Manual payment status with a clear “Manually marked as paid” label
- Optional Supabase auth (email + magic link) and invoice persistence
- Dashboard analytics, invoice detail, calculator, compliance page
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
npx tsc --noEmit
npm run build
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the project URL and anon key into `.env.local`.
3. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never expose it as `NEXT_PUBLIC_*`.
4. Enable Email and Magic Link providers in Authentication.
5. Set the site URL and redirect URLs to `{NEXT_PUBLIC_SITE_URL}/auth/callback`.

## Environment setup

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

See `.env.example`.

## Database setup

Run `supabase/migrations/0001_init.sql` in the Supabase SQL editor (or `supabase db push` if you use the CLI).

The migration creates:

- `profiles`
- `invoices`
- `payment_requests`

It enables Row Level Security so users can only read and write their own invoices and related payment requests.

## Vercel deployment

1. Import the GitHub repository into Vercel.
2. Set the environment variables above.
3. Deploy. The production `NEXT_PUBLIC_SITE_URL` must match your domain.
4. Add the production callback URL in the Supabase auth settings.

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

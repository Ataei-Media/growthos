# GrowthOS — Setup & Deployment

Goal: a new engineer deploys GrowthOS to production in **under 30 minutes**.

The product is a pay-to-unlock Revenue Report: a visitor enters a URL, answers
five questions, gets a free preview, pays **€29** once, and unlocks the full
report + PDF. This guide wires the seven services it depends on.

---

## 0. Prerequisites

- **Node 20+** (repo pins Node 24 via `.nvmrc`).
- Accounts: Supabase, Stripe, OpenAI, Firecrawl, ScreenshotOne, Resend, PostHog, Vercel.

```bash
git clone <repo> && cd growthos
cp .env.example .env.local
npm install
```

Fill `.env.local` as you complete each section below, then `npm run dev`.

---

## 1. Supabase (database + storage of reports)

1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → API**: copy the Project URL, the `anon` key, and the
   `service_role` key.
3. Run the migrations in order (SQL Editor, or `supabase db push`):
   `supabase/migrations/0001 → 0004`. `0003`/`0004` are the ones the revenue
   flow needs (`revenue_reports`, `ai_generations`).
4. Env:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

`revenue_reports` has RLS enabled with no policies — only the service role
(server-side) touches it, which is correct for anonymous buyers.

## 2. OpenAI (the report)

1. Create an API key at [platform.openai.com](https://platform.openai.com).
2. Env:
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o
   ```
   **`OPENAI_MODEL` is required** — the app fails fast with a clear error if it's
   missing. The provider is model-agnostic; switching models is only an env
   change. **Recommended models:** `gpt-4o` (best quality/€), `gpt-4o-mini`
   (cheapest, lower quality), `gpt-4.1`. Add your model + its pricing to
   `src/config/ai-pricing.ts` so AI-cost tracking is accurate.

## 3. Firecrawl (website crawling)

1. Get an API key at [firecrawl.dev](https://firecrawl.dev).
2. Env: `FIRECRAWL_API_KEY=fc-...`

## 4. ScreenshotOne (site screenshot)

1. Sign up at [screenshotone.com](https://screenshotone.com), copy Access + Secret keys.
2. Env:
   ```
   SCREENSHOTONE_ACCESS_KEY=...
   SCREENSHOTONE_SECRET_KEY=...
   ```

## 5. Stripe (the €29 payment)

1. **Developers → API keys**: copy the secret + publishable keys (test mode first).
2. **Developers → Webhooks → Add endpoint**:
   - URL: `https://YOUR_DOMAIN/api/webhooks/stripe`
   - Event: `checkout.session.completed`
   - Copy the **Signing secret** (`whsec_...`).
3. Env:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
   The €29 price is created inline (`price_data`), so no Stripe Product setup is
   needed. Local webhook testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## 6. Resend (report email + drip)

1. Get an API key at [resend.com](https://resend.com) and verify your sending domain.
2. Env:
   ```
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL="GrowthOS <noreply@yourdomain.com>"
   ```
   The 4-email post-purchase sequence is scheduled natively via Resend
   `scheduledAt` — no cron required.

## 7. PostHog (analytics, heatmaps, recordings)

1. Create a project at [posthog.com](https://posthog.com), copy the Project API key.
2. Env:
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_...
   NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
   ```
3. In PostHog, enable **Session Replay** and **Heatmaps** (autocapture is on by
   default). Funnel events (`landing_page_visit`, `website_submitted`,
   `analysis_started/finished`, `payment_started/completed`, `report_downloaded`)
   arrive automatically.

## 8. Admin dashboard

Set the emails allowed into `/admin` (must sign in via Supabase Auth):
```
ADMIN_EMAILS="you@yourcompany.com,cofounder@yourcompany.com"
```

## 9. App URL

```
NEXT_PUBLIC_APP_URL=https://yourdomain.com   # http://localhost:3000 locally
```

---

## 10. Deploy to Vercel

1. Import the repo in Vercel.
2. Paste every variable from `.env.local` into **Settings → Environment Variables**
   (set `NEXT_PUBLIC_APP_URL` to the production domain).
3. Deploy. Update the Stripe webhook URL to the production domain.
4. Report generation can take 60–120s — on Vercel **Pro**, the generate route
   already sets `maxDuration = 300`.

---

## Environment variables (complete list)

| Variable | Where | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | app | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | ✅ |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | OpenAI | ✅ |
| `FIRECRAWL_API_KEY` | Firecrawl | ✅ |
| `SCREENSHOTONE_ACCESS_KEY` / `SCREENSHOTONE_SECRET_KEY` | ScreenshotOne | ✅ |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe | ✅ |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Resend | ✅ |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | PostHog | recommended |
| `ADMIN_EMAILS` | admin | for `/admin` |

---

## Production checklist

- [ ] Migrations `0001–0004` applied to the production database.
- [ ] Stripe in **live** mode; webhook points at prod `/api/webhooks/stripe`; test a real €29 purchase.
- [ ] Resend sending domain verified; confirm the report email arrives.
- [ ] `OPENAI_MODEL` set; pricing for that model added to `src/config/ai-pricing.ts`.
- [ ] Run a full flow against a real store URL: analyze → preview → pay → unlock → PDF → email.
- [ ] PostHog receiving events; Session Replay + Heatmaps enabled.
- [ ] `ADMIN_EMAILS` set; `/admin` loads for an allowed user.
- [ ] `npm run build` green; smoke-test `/`, `/start`, a real `/report/[id]`.
- [ ] Watch the first days in `/admin`: conversion, payment rate, AI cost vs revenue (unit economics).

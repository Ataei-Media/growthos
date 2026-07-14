# GrowthOS

**Find the revenue leaks in your business.** GrowthOS is an AI Growth Consultant:
a user enters their website URL and, within 60–120 seconds, receives a complete
AI Growth Audit spanning CRO, SEO, Ads, Email and revenue strategy.

## Tech stack

| Layer            | Technology                                   |
| ---------------- | -------------------------------------------- |
| Framework        | Next.js 15 (App Router) · React 19 · TS      |
| Styling          | Tailwind CSS v4 · shadcn/ui (new-york)       |
| Auth & DB        | Supabase (Postgres + Auth)                   |
| Payments         | Stripe (Checkout · Billing Portal)           |
| AI               | OpenAI                                        |
| Email            | Resend                                        |
| Crawling         | Firecrawl                                     |
| Screenshots      | ScreenshotOne                                 |
| PDF export       | @react-pdf/renderer                          |
| Analytics        | PostHog                                       |
| Hosting          | Vercel                                        |

## Getting started

```bash
# Requires Node 20+ (see .nvmrc → Node 24 LTS)
cp .env.example .env.local   # fill in real keys as milestones come online
npm install
npm run dev                  # http://localhost:3000
```

## Scripts

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the dev server (Turbopack)         |
| `npm run build`        | Production build                         |
| `npm run start`        | Serve the production build               |
| `npm run lint`         | ESLint                                   |
| `npm run typecheck`    | `tsc --noEmit` type checking             |
| `npm run format`       | Format with Prettier                     |

## Project structure

```
src/
  app/                 # App Router routes, layouts, route handlers
  components/
    ui/                # shadcn/ui primitives
    layout/            # app shell (sidebar, headers)
    marketing/         # landing-page sections
    shared/            # cross-feature components
  config/              # site + navigation config
  features/            # feature-scoped logic (audits, marketing, etc.)
  hooks/               # reusable React hooks
  lib/
    env.ts             # type-safe environment access (zod)
    utils.ts           # cn() + shared helpers
    supabase/          # Supabase browser/server clients
    stripe/            # Stripe SDK + helpers
    ai/                # OpenAI client + prompt orchestration
    audit/             # crawling, screenshot, analysis pipeline
    email/             # Resend templates & senders
    analytics/         # PostHog
    pdf/               # React-PDF report documents
  server/
    actions/           # server actions
    services/          # server-side domain services
  types/               # cross-cutting domain types
supabase/
  migrations/          # SQL schema migrations
```

## Environment variables

All variables are documented in [`.env.example`](./.env.example) and validated
at runtime by [`src/lib/env.ts`](./src/lib/env.ts). Public values are prefixed
`NEXT_PUBLIC_*`; everything else is a server-only secret.

## Milestones

1. **Project setup** ✅ — scaffolding, design system, env, architecture
2. Landing page
3. Authentication
4. Dashboard
5. Website Audit engine
6. AI Reports
7. Stripe billing
8. Competitor Analysis
9. Marketing Generator
10. Production optimization

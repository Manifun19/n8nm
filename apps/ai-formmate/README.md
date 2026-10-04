# AI FormMate

**Government Exam Forms — Easier, Faster, Smarter.**

An AI-powered *government application assistant*. Candidates save their profile,
education history and documents once, then reuse them to prepare each exam
application accurately.

> AI FormMate is an **assistant**, not an auto-submitter. It does not claim
> support for every government website. The user always completes OTP, CAPTCHA,
> payment authentication and the final submission themselves.

---

## What AI FormMate will never do

- Solve or bypass CAPTCHA, OTP, MFA, payment authentication or anti-bot controls.
- Store OTPs, passwords or payment credentials.
- Submit an application without the user's explicit approval.
- Generate or alter a photograph or signature identity (only crop / resize /
  compress / convert the user's own image).
- Present an AI reading of a notification as official authority.

---

## Status — Phase 1 complete

| Phase | Scope | State |
| --- | --- | --- |
| 1 | Project setup, auth, database foundations, layout, navigation, dashboard | **Done** |
| 2 | Candidate profile | Not started |
| 3 | Document vault | Not started |
| 4–5 | Photo & signature assistants | Not started |
| 6–7 | PDF tools, screenshot manager | Not started |
| 8–10 | Exam rules, notification analyzer, AI field mapping | Not started |
| 11–13 | Application preparation, form assistant, tracker | Not started |
| 14–16 | Security hardening, full testing, production deployment | Not started |

Routes for phases 2–13 exist in the navigation and render an honest
"planned for a later phase" placeholder rather than a non-functional UI.

---

## Stack

- **Next.js 16** (App Router, React 19, Turbopack) + **TypeScript** in strict mode
- **Tailwind CSS 4** with design tokens in `src/app/globals.css`
- **Supabase** — Postgres, Auth and private object storage
- **Zod** for validation schemas
- **Vitest** + Testing Library for unit and component tests
- Vercel-compatible; no server runtime beyond Next.js itself

## Getting started

```bash
cd apps/ai-formmate
npm install
cp .env.example .env.local     # then fill in your Supabase project values
npm run dev                    # http://localhost:3000
```

Without Supabase credentials the app still builds and runs: the marketing and
help pages work, protected routes redirect to sign-in, and the sign-in screen
explains that the deployment is unconfigured.

### Database

Apply the migrations in `supabase/migrations/` in order, either with the
Supabase CLI (`supabase db push`) or by running them in the SQL editor:

- `0001_init.sql` — tables, enums, `updated_at` triggers, the new-user trigger,
  row level security policies, and seeded document categories.
- `0002_storage.sql` — the five **private** storage buckets and per-user object
  policies (a user can only touch objects under their own `<user_id>/` prefix).

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest suite |
| `npm run lint` | ESLint (`next/core-web-vitals` + `next/typescript`) |
| `npm run verify` | typecheck → test → build |

## Architecture

```
src/
  app/               Routes only — thin, delegating to features and services
    (auth)/          Sign in / sign up
    (app)/           Authenticated shell: dashboard + phase placeholders
    auth/            OAuth callback and POST-only sign-out
  components/
    ui/              Presentational primitives (button, card, badge, field…)
    layout/          App shell, sidebar, bottom nav, drawer, locale switcher
  features/          Feature modules (auth, dashboard) — logic + views
  services/          Server-side data access (Supabase queries)
  lib/
    i18n/            Translation catalogues, provider and server helpers
    supabase/        Browser / server / proxy clients
    utils/           cn(), error redaction and logging
  config/            env, routes, navigation — no magic strings in components
  types/             Domain types mirroring the database schema
  validations/       Zod schemas
supabase/migrations/ SQL schema and storage policies
```

Business logic stays out of components: `features/dashboard/summary.ts` is pure
and unit tested, and the same service layer will back the future Flutter client.

### Internationalisation

No user-visible string is hard-coded in a component. Every string lives in
`src/lib/i18n/dictionaries/{en,hi}.ts`; the Hindi catalogue is typed as a
complete `Record<TranslationKey, string>`, so a missing translation is a type
error, and a test asserts both catalogues stay in sync.

The locale is stored in the `formmate_locale` cookie, read by the server layout,
so server components render in the chosen language too.

### Security posture (Phase 1)

- Every user-owned table has RLS restricting rows to `auth.uid()`.
- All five storage buckets are private; object policies require the first path
  segment to equal the caller's user id.
- The proxy (`src/proxy.ts`) refreshes the session and redirects unauthenticated
  visitors away from protected routes; `(app)/layout.tsx` re-checks server-side
  so a page can never render user data if the proxy is bypassed.
- `getUser()` is used everywhere instead of `getSession()`, so the JWT is
  validated rather than trusted from the cookie.
- Sign-out is POST-only; the auth callback and post-sign-in redirect only accept
  same-origin relative paths, so neither can be used as an open redirect.
- Sign-in failures return one generic message and never reveal whether an email
  is registered.
- `logError()` redacts Aadhaar, OTP, password, token, card and similar keys
  before anything reaches a log sink; users only ever see translated copy.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.ts`.
- The service-role key is server-only and never referenced from client code.

### Provenance model

Anything that can change — exam rules, extracted requirements, notifications —
carries an `information_source` (`official` / `ai_interpretation` /
`user_entered`), a `confidence` level, a `source_url` and `last_verified_at`.
The UI has dedicated badge tones for each so an AI reading is never presented as
official authority.

## Accessibility

Semantic landmarks, a skip link, labelled form controls with
`aria-describedby` hints and errors, `aria-current` on the active navigation
entry, visible focus rings, ≥44px touch targets, and a `prefers-reduced-motion`
override.

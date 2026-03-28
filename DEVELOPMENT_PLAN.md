# MGP.AI — MVP Development Plan

**Date**: 2026-03-27
**Goal**: Launch a working, revenue-generating AI fitness & nutrition product
**Stack**: React + TypeScript + Vite (frontend) · Express (backend) · Supabase (auth/DB) · Google Gemini (AI) · Drizzle ORM (PostgreSQL)

---

## Current State Assessment

### What's Built
- Full onboarding flow (7 steps: name, gender, weight, training days, muscle focus, equipment, AI coach selector)
- 21-day fitness program structure
- Workout session page with AI coach integration
- Google Gemini AI integration (coaching, exercise selection, OCR)
- Supabase auth (email/password + Google OAuth)
- Express API with rate limiting, helmet, CORS
- Progress tracking (workout completions, streaks)
- Nutrition page scaffold
- Rewards system scaffold
- Responsive UI with dark theme (Tailwind + shadcn/ui)

### What's Missing for MVP Launch
- `DATABASE_URL` and server-side env vars not configured
- No Stripe / payment integration
- Nutrition tracking is not functional (no logging, no history)
- Workout generation is not end-to-end tested
- No deployment pipeline (Vercel/Railway + Supabase)
- No landing page / marketing entry point
- No email onboarding / transactional emails
- AI assistant page (`/assistant`) may be incomplete
- No user data persistence across sessions verified
- OCR feature not wired to a real workflow

---

## Phase 0 — Environment & Local Dev (Day 1)

**Goal**: Get `npm run dev` running cleanly with all services connected.

### Tasks
- [ ] Audit `.env` — add all missing server-side keys (`DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_ANON_API_KEY`)
- [ ] Verify Supabase project is active and Postgres connection works
- [ ] Run Drizzle migrations (`npx drizzle-kit push`) to create tables
- [ ] Confirm `npm run dev` starts both Vite (5000) and Express (3001)
- [ ] Walk through app in browser: login → onboarding → dashboard → workout → AI coach
- [ ] Fix any runtime errors blocking the core flow

**Exit Criteria**: App runs locally, user can sign up, complete onboarding, and reach the home dashboard.

---

## Phase 1 — Core MVP Functionality (Days 2–5)

**Goal**: End-to-end working product — a real user can sign up, get a workout plan, and interact with the AI.

### 1.1 Authentication & Onboarding
- [ ] Verify Supabase email/password signup works end-to-end
- [ ] Verify Google OAuth flow works (requires valid `GOOGLE_CLIENT_ID` + callback URL)
- [ ] Ensure onboarding data (weight, goals, equipment, schedule) is saved to Supabase `profiles` table
- [ ] Redirect new users to `/onboarding`; existing users to `/` (home dashboard)
- [ ] Add profile completion check — block dashboard access until onboarding is done

### 1.2 Workout Generation
- [ ] Wire Gemini AI to generate a personalized 21-day workout plan on onboarding completion
- [ ] Store generated workout plan per user in database
- [ ] `/` (Home) page: display today's workout card with correct day number
- [ ] `/workout/:id` page: show exercises for that day, support completion marking
- [ ] Ensure workout completion is persisted (`workoutCompletions` table)
- [ ] Streak / progress calculation working and displayed on Home

### 1.3 AI Assistant
- [ ] `/assistant` page: functional chat interface with Gemini
- [ ] Context-aware: AI knows user's fitness profile (goals, equipment, current day)
- [ ] `/assistant/chat`: conversation history preserved per session
- [ ] Suggested prompts / quick actions to reduce friction for new users

### 1.4 Nutrition (MVP Scope)
- [ ] Daily calorie target displayed based on user profile (height, weight, goal)
- [ ] Manual food log (text entry or search) — basic, no barcode yet
- [ ] AI nutrition advice: `/api/generate` endpoint for meal suggestions
- [ ] OCR nutrition label scanning: wire existing `/api/extract-ocr` to the Nutrition page

### 1.5 Data Persistence
- [ ] All user data (profile, workouts, nutrition logs) stored in Supabase / Postgres
- [ ] React Query cache invalidated on mutations
- [ ] Logout clears session cleanly

---

## Phase 2 — UI/UX Polish (Days 5–7)

**Goal**: Product looks and feels like a real app a user would pay for.

### Tasks
- [ ] **Landing Page** (`/landing` or `/`for unauthenticated users): hero section, feature highlights, CTA to sign up
- [ ] **Home Dashboard**: clean stats display (streak, calories, today's workout summary)
- [ ] **Onboarding**: smooth progress bar, back/next transitions
- [ ] **Workout Session**: clear exercise cards (name, sets/reps, rest timer, GIF/image)
- [ ] **Mobile**: verify all pages are usable on 375px viewport
- [ ] Loading states on every async action
- [ ] Error states with user-friendly messages (not raw errors)
- [ ] Empty states for users with no data yet
- [ ] Toast notifications for key actions (workout complete, profile saved, etc.)

---

## Phase 3 — Payments & Monetization (Days 7–10)

**Goal**: Users can pay for the product.

### Strategy: Freemium
| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 7-day trial of full features |
| Pro | $9.99/mo | Unlimited AI coaching, nutrition tracking, all features |
| Annual | $79/yr | Same as Pro, 2 months free |

### Tasks
- [ ] Integrate **Stripe** (Stripe Checkout or Stripe Elements)
- [ ] Create Stripe products & price IDs for Pro Monthly and Annual
- [ ] Add `subscription_status`, `stripe_customer_id` to user profile in DB
- [ ] `/api/create-checkout-session` endpoint
- [ ] `/api/webhook` Stripe webhook handler (checkout.session.completed, subscription events)
- [ ] Paywall: after 7 days or feature limit, redirect to `/upgrade`
- [ ] `/upgrade` page with pricing cards
- [ ] `/api/billing-portal` for subscription management
- [ ] Free trial auto-starts on signup (set `trial_ends_at` in DB)

---

## Phase 4 — Deployment (Days 10–14)

**Goal**: App is live at a real URL, accessible to users.

### Architecture
```
Frontend  →  Vercel (React SPA)
Backend   →  Railway (Express server)
Database  →  Supabase (Postgres + Auth)
AI        →  Google Gemini API
Payments  →  Stripe
```

### Tasks
- [ ] **Supabase**: confirm production project is active, run migrations
- [ ] **Railway**: deploy Express server
  - Set all env vars in Railway dashboard
  - Configure `PORT`, `NODE_ENV=production`, all API keys
  - Verify `/api/health` endpoint
- [ ] **Vercel**: deploy Vite frontend
  - Set `VITE_API_URL` to Railway server URL
  - Configure rewrites for SPA routing
  - Set all `VITE_*` env vars
- [ ] **DNS**: configure custom domain (e.g., `app.mgp.ai`)
- [ ] **CORS**: update `ALLOWED_ORIGINS` in Railway to include Vercel URL
- [ ] **Google OAuth**: add production callback URL to Google Cloud Console
- [ ] **Stripe**: switch from test keys to live keys, update webhook endpoint URL
- [ ] **Supabase Auth**: add production site URL to allowed redirect URLs
- [ ] Smoke test entire user flow on production

---

## Phase 5 — Growth & Iteration (Post-Launch)

**Goal**: Get first paying users and iterate based on feedback.

### Week 1 After Launch
- [ ] Set up **PostHog** or **Mixpanel** analytics (free tier)
  - Track: signup, onboarding completion, workout completion, AI usage, upgrade conversion
- [ ] Set up **Sentry** for error tracking
- [ ] **Transactional email** via Resend or SendGrid:
  - Welcome email on signup
  - Day 1 workout reminder
  - Trial ending soon reminder
- [ ] Add feedback widget (Canny or simple form)

### Week 2–4
- [ ] Analyze onboarding drop-off funnel
- [ ] A/B test pricing page copy
- [ ] Add more workout variety (strength, HIIT, yoga)
- [ ] Improve AI prompts based on user conversations
- [ ] Build food delivery integration (Uber Eats / DoorDash API) if demand validated

### Future Roadmap
- Mobile app (React Native / Expo)
- Wearable integration (Apple Health, Garmin, Whoop)
- Community features (challenges, leaderboards)
- Meal planning & grocery lists
- Video exercise demos
- Coach marketplace

---

## Technical Debt to Address

| Issue | Priority | Notes |
|-------|----------|-------|
| TypeScript strict mode disabled | Medium | `noImplicitAny: false`, `strictNullChecks: false` — enable gradually |
| No test suite | Medium | Add Vitest for unit tests, Playwright for E2E |
| Replit-specific code in prod | High | Remove REPLIT_DEV_DOMAIN references |
| No CI/CD pipeline | Medium | GitHub Actions for lint + build on PR |
| `.env` committed to git | Critical | Add `.env` to `.gitignore`, rotate any exposed keys |
| No error boundaries in React | Medium | Wrap routes in ErrorBoundary components |
| Database schema is minimal | Low | Add `profiles`, `nutrition_logs`, `meal_plans` tables |

---

## Environment Variables Checklist

### Frontend (Vite — prefix with `VITE_`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_API_KEY=
VITE_SUPABASE_PROJECT_ID=
VITE_API_URL=http://localhost:3001   # Railway URL in prod
VITE_STRIPE_PUBLISHABLE_KEY=        # Phase 3
```

### Backend (Express)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=                        # Supabase Postgres connection string
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=                      # Random 64-char string
ALLOWED_ORIGINS=http://localhost:5000
STRIPE_SECRET_KEY=                   # Phase 3
STRIPE_WEBHOOK_SECRET=               # Phase 3
```

---

## Success Metrics (MVP)

| Metric | Target (30 days post-launch) |
|--------|------------------------------|
| Signups | 100 |
| Onboarding completion rate | > 60% |
| Day 7 retention | > 30% |
| Paying users (conversion) | > 5% of free |
| MRR | $100–$500 |
| AI interactions per active user | > 5/week |

---

## Immediate Next Steps (Start Now)

1. **Fix `.env`** — add missing server env vars so backend boots
2. **Run `npm run dev`** — identify and fix any startup errors
3. **Walk the full user flow** — signup → onboarding → home → workout → AI
4. **Fix critical blockers** — anything preventing the core loop from working
5. **Build landing page** — first thing a real user sees
6. **Integrate Stripe** — monetization is non-negotiable for MVP
7. **Deploy to Railway + Vercel** — get a real URL to share

---

*This plan is a living document. Update it as priorities shift based on user feedback and technical discoveries.*

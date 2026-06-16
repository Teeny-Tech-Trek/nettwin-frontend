<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=8,18,28&height=260&section=header&text=NetTwin%20Frontend&fontSize=72&fontColor=ffffff&fontAlignY=42&desc=Digital%20Twin%20Builder%20%E2%80%A2%20React%20%E2%80%A2%20Vite&descAlignY=62&descSize=20&animation=fadeIn&stroke=2DD4BF&strokeWidth=1" width="100%"/>

</div>

<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=800&color=2DD4BF&center=true&vCenter=true&multiline=false&repeat=true&width=680&height=50&lines=9-Step+Twin+Wizard+%F0%9F%A7%99;React+18+%2B+Vite+%2B+TypeScript+%2B+Jotai+%E2%9A%A1;JWT+Auth+%2B+Source+Ingestion+%28Resume%2FWebsite%29+%F0%9F%93%84;Public+Chatbot+%2B+Lead+Capture+%F0%9F%92%AC)](https://git.io/typing-svg)

</div>

<br/>

<div align="center">

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix-000000?style=for-the-badge)](https://ui.shadcn.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-Checkout-0066CC?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## 🎯 Overview

**NetTwin Frontend** is the React SPA for a personal digital twin platform. Users build an AI-powered twin of themselves (identity, experience, skills, personality, story), ingest source material (resume/website), generate a shareable public chatbot, capture leads, and manage subscription billing via Razorpay.

**Stack:** React 18 + Vite + TypeScript + Jotai (state) + React Query (server state). Authentication via JWT (access token in localStorage, refresh token in httpOnly cookie).

---

## 🏗️ Architecture

```
Public Routes (PublicLayout)
├─ /                      → Home marketing page
├─ /login, /signup        → Auth forms + Google OAuth
├─ /chatbot/:id           → Public shareable twin chatbot
└─ /resume, /portfolio    → Public twin profile views

Protected Routes (AuthenticatedLayout)
├─ /dashboard             → Overview + KPIs
├─ /wizard                → 9-step twin creation/edit
├─ /settings              → Profile + integrations
└─ /billing               → Plan selection + Razorpay checkout

Data Flow: Page → Logics/use* Hook → services/* → Axios (Bearer + refresh interceptor)
Auth State: Jotai (persisted) + React Context (session restore on reload)
```

---

## 🛠️ Tech Stack

| Concern | Technology |
|:---|:---|
| **Framework** | React 18.3 + React Router 6 |
| **Build** | Vite 5.4 |
| **Language** | TypeScript 5.8 |
| **State** | Jotai (persisted auth) + Context + `useState` |
| **Server State** | React Query 5 (configured, underused) |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui |
| **HTTP** | Axios (interceptors for auth + auto-refresh) |
| **Forms** | React Hook Form + Zod (installed) |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **Payments** | Razorpay (checkout popup) |
| **Deploy** | Vercel |

---

## 📁 Project Structure

```
src/
├── App.tsx                      # Routes + provider setup
├── main.tsx                     # React root
├── axios.config.ts              # Axios singleton + auth interceptors
├── config/                      # apiConfig, Razorpay settings
├── services/api.service.ts      # Auth, twin, chat, lead, billing API calls
├── contexts/
│   ├── AuthContext.tsx         # Auth state + session restore
│   ├── DigitalTwinContext.tsx  # Twin CRUD + ingestion
│   └── ProtectedRoute.tsx      # Route guard + role checks
├── atoms/authAtom.ts            # Jotai persisted auth
├── pages/
│   ├── Login.tsx, Signup.tsx
│   ├── Dashboard.tsx
│   ├── DigitalTwinWizard.tsx   # 9-step form
│   ├── Chatbot.tsx             # Public shareable twin
│   ├── Settings.tsx
│   └── Billing.tsx
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   ├── wizard/                  # Step forms (Step1Identity → Step9Links)
│   ├── SourcesPanel.tsx        # Resume/website ingestion UI
│   ├── ChatModal.tsx           # Lead chat viewer
│   └── shared/                  # AppLayout, Navbar, Footer
├── features/billing/            # Razorpay + billing components
├── types/                       # TypeScript domain models
├── hooks/                       # useAuth, usePlanLimits, useGoogleAuth
└── lib/                         # Utils, constants
```

---

## 🚀 Getting Started

### 1. Install & Configure

```bash
npm install

# Create .env.local
cp .env.example .env.local
```

### 2. Environment Variables

| Var | Required | Purpose | Example |
|:---|:---|:---|:---|
| `VITE_API_BASE_URL` | ✓ | Backend API base (must include `/api`) | `http://localhost:5000/api` |
| `VITE_IMAGE_BASE_URL` | — | Static/image CDN; if blank, derived from API base | — |
| `VITE_GOOGLE_CLIENT_ID` | ✓ | Google OAuth client ID | `...googleusercontent.com` |
| `VITE_RAZORPAY_KEY` | ✓ | Razorpay public key | `rzp_test_...` |

### 3. Run Locally

```bash
npm run dev              # Vite dev server → http://localhost:8080
npm run build            # Production build
npm run lint             # ESLint
```

> Make sure the backend (`digital_twin_backend`) is running on `localhost:5000`.

---

## 📖 Key Features

### 1. Authentication

**Signup/Login flows:**
- Email/password form → `POST /auth/signup` or `/auth/login`
- Stores access token in `localStorage.token`
- Refresh token in httpOnly cookie (auto-sent)
- Session restore on page reload checks `/auth/profile` in background

**Google OAuth:**
- Click Google button → opens Google sign-in popup
- Exchange ID token → `POST /auth/google/exchange-code`
- New users → redirected to `/wizard` (create twin)
- Returning users → redirected to `/dashboard`

### 2. Digital Twin Wizard (9 Steps)

**Step-by-step form:**
1. **Identity** — name, role, tagline, bio
2. **Experience** — company, role, duration, projects
3. **Education** — institution, degree, year
4. **Skills** — skill tags, core domains, signature strengths
5. **Personality** — traits, leadership/decision style, tone, archetype, values
6. **Story** — mission, impact, themes
7. **Networking** — audience, intent, boundaries
8. **Links** — LinkedIn, website, portfolio, socials
9. **Sources** — resume/website ingestion (async, polling until `ready`)

**Success screen:** Shows AI persona prompt + JSON export. CTAs to view live twin, create another, or go to dashboard.

### 3. Source Ingestion (Resume / Website)

```
Frontend                                Backend
Upload resume/crawl website  →  POST /api/sources/ingest-*
   ↓                             ↓
Store file                       AI Engine processes (async)
   ↓                             ↓
Poll ingestion-status  ←  GET /api/sources/ingestion-status/:id
   ↓
Ready message when status="ready"
```

### 4. Public Chatbot (`/chatbot/:id`)

- Shareable link with QR code
- Public profile display (identity + links)
- Chat interface (RAG over ingested sources)
- Lead capture gate (email)
- Share modal (social + QR code)

### 5. Billing / Razorpay

**Plan selection:**
1. Click "Upgrade" → `POST /api/billing/create-order { planId }`
2. Razorpay popup opens (amount in paise)
3. User pays
4. Success callback → `POST /api/billing/verify-payment { orderId, paymentId, signature }`
5. Subscription activated, plan badge updated

**Quotas:** `usePlanLimits` hook fetches `/api/billing/status`, shows alerts at limit (advisory only — backend enforces).

---

## 🔐 Authentication & Authorization

**Token management:**
- **Access token** — short-lived JWT in localStorage, sent via Bearer header
- **Refresh token** — long-lived JWT in httpOnly cookie
- **Single-flight refresh** — concurrent 401s share one refresh call (no token burning)

**Protected routes** (`ProtectedRoute`):
- Check `useAuth()` + loading state
- Redirect to `/login` if no user (preserves `state.from` for back-navigation)
- Role-based guards: `requireOwner`, `requireAdmin`, `requireOrganization`

---

## 🧠 Data Models

**Key types** (`src/types/`):
- **User** — email, name, role (individual|organization), subscription
- **DigitalTwinProfile** — identity, experience[], education[], skills, personality, story, links
- **ChatSession** — sessionId, twinId, messages[], leadCaptured
- **Lead** — sessionId, name, email, service, message, status, capturedAt
- **Plan** — name, price, features, limits

---

## 💳 Billing Integration

**Razorpay flow:**
1. Get public key from `VITE_RAZORPAY_KEY` env var
2. Create order via backend → get `orderId` + `amount`
3. Inject Razorpay script dynamically
4. Open checkout popup (amounts in paise)
5. Verify signature server-side (`POST /api/billing/verify-payment`)
6. Activate subscription + update local state

**Features:** Plan limit enforcement (UX advisory), kill-switch support (backend `PAYMENTS_ENABLED`), fallback contact email.

---

## ⚠️ Known Issues & Tech Debt

- **React Query underused** — all fetching is manual via `Logics/*` hooks + window events
- **No `ThemeProvider`** — despite `next-themes` being installed
- **Large commented-out code blocks** — in ProtectedRoute, settings, wizard components
- **Orphan files** — ErrorBoundary, SettingsPage.jsx, DeletionRequestsPanel.jsx (unrouted)
- **Mixed file extensions** — `.jsx` and `.tsx` inconsistent
- **Misspelled component** — the dashboard component is `Dasboard.tsx` (imported as `Dashboard`)
- **Two lockfiles** — `package-lock.json` + `bun.lockb` (standardize on npm)
- **XSS risk:** Access token in localStorage (not HttpOnly) — required for Bearer injection

---

## 🚢 Deployment

**Vercel auto-deploy:**
```bash
git push origin main
# Vercel builds and deploys automatically
```

**SPA rewrite** in `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Set all `VITE_*` env vars in Vercel project settings.

---

## 🎓 Common Tasks

| I want to… | Start here |
|:---|:---|
| Add a wizard step | `src/components/wizard/steps/Step*` + update `/wizard` orchestrator |
| Change API call | `src/services/api.service.ts` module |
| Update auth behavior | `src/contexts/AuthContext.tsx` + `src/atoms/authAtom.ts` |
| Work on billing | `src/features/billing/*` (components, services, utils) |
| Modify plan limits | `src/hooks/usePlanLimits.ts` + backend `/billing/status` |
| Tweak public chatbot | `src/pages/Chatbot.tsx` + `src/services/api.service.ts` |
| Add a UI component | `npx shadcn@latest add <name>` |

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=8,18,28&height=120&section=footer" width="100%"/>

**Gradient used: `8,18,28` (teal-navy)**

</div>

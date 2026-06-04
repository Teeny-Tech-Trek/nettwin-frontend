# NetTwin Frontend Technical Documentation

## Introduction
The frontend implements the owner and visitor interface layer for NetTwin.  
Primary responsibilities include authentication UX, Digital Twin authoring, dashboard operations, billing visibility, and public twin pages.  
Routing, layout policy, session continuity, and API communication are centralized in `src/App.tsx`, `src/contexts/*`, and `src/services/api.service.ts`.

## Technology Stack
| Technology | Usage in Frontend |
|---|---|
| Next.js | Not used in current codebase; application runs on Vite + React Router. |
| React | UI framework for pages, layouts, feature components, and shared controls. |
| TypeScript | Static typing across contexts, services, pages, and domain models. |
| Tailwind CSS | Utility-first styling; shared primitives under `components/ui`. |
| Axios | HTTP transport with centralized interceptors in `src/axios.config.ts`. |
| React Query | Server-state caching and request lifecycle handling. |
| React Hook Form | Form state and submission handling in auth and wizard flows. |
| Zod | Client-side schema validation for form payloads. |
| State Management | Context state (`AuthContext`, `DigitalTwinContext`) + React Query cache. |

## Deployment
Frontend is hosted on Vercel.  
Build output is generated from the Vite pipeline (`npm run build`) and served as static assets.  
Runtime API targets are controlled through frontend environment variables.

## Frontend Architecture
User  
↓  
Page  
↓  
Component  
↓  
Hook  
↓  
API Service  
↓  
Backend

- **Page**: route-level orchestration (`Login`, `Dashboard`, `Billing`, `ProfileSettings`, `Chatbot`).
- **Component**: feature composition (`components/wizard/*`, `features/billing/components/*`, `components/ui/*`).
- **Hook**: reusable behavior for auth, toasts, viewport/device handling, and async triggers.
- **API Service**: endpoint wrappers (`authService`, `digitalTwinService`, `leadService`, `chatService`).
- **Backend**: Node API for auth/twin/leads/billing and Python AI proxy path.

## Folder Structure
- `app`: reserved; routing currently implemented under `src` with React Router.
- `components`: reusable and feature-specific UI, including wizard and shared primitives.
- `layouts`: `PublicLayout` and `AuthenticatedLayout` for route chrome policy.
- `hooks`: shared hooks including auth helpers and toast integration.
- `services`: centralized API service definitions and domain HTTP wrappers.
- `store`: no global Redux-style store; context is used for application-level state.
- `utils`: helper functions for rendering and small cross-cutting utilities.
- `constants`: module-level constants are present; no single central constants package.
- `types`: domain interfaces for Digital Twin, billing, dashboard, and service contracts.

## Route Overview
- **Authentication**: `/login`, `/signup`, `/forgot-password`, `/reset-password/:token`.
- **Dashboard**: `/dashboard` (protected owner route).
- **Digital Twin**: `/wizard`, `/chatbot/:id`, `/resume`, `/portfolio`.
- **Leads**: lead workflows are surfaced through dashboard/service integrations.
- **Billing**: `/billing` with feature module under `src/features/billing`.
- **Settings**: `/profile` for user profile and media updates.

## State Management
- **Auth State**: `AuthContext` manages token/user lifecycle and initialization guard.
- **User State**: user payload lives in context and is patched after profile mutations.
- **Twin State**: Digital Twin lifecycle is handled by `DigitalTwinContext` + service calls.
- **Lead State**: lead data is API-driven and held at page/feature scope with query caching.

## API Layer
- **Axios Configuration**: base URL, `withCredentials`, and bearer token attachment.
- **Request Handling**: domain-level service methods map UI actions to backend endpoints.
- **Response Handling**: service methods normalize payloads for component consumption.
- **Error Handling**: 401 handling uses single-flight refresh and request replay; hard logout only on refresh failure.

## Authentication Flow
1. Login/signup/google returns `accessToken` and user payload.
2. Refresh token is held in httpOnly cookie; access token is retained client-side.
3. `AuthContext` hydrates cached session, then revalidates profile.
4. `ProtectedRoute` blocks redirect decisions until initialization completes.
5. Interceptor refresh path retries failed requests once with a rotated access token.
6. Logout clears server refresh state and local session data.

## Core Frontend Modules
- **Dashboard**: owner entry point for twin status, ingestion visibility, and operational actions.
- **Digital Twin Management**: multi-step wizard creates and updates structured profile data.
- **Lead Management**: consumes lead APIs for retrieval and status transitions.
- **Billing**: plan/entitlement UI and payment-trigger interactions in billing feature module.
- **Profile Management**: profile read/update, password flow, and avatar upload/removal.

## Summary
Frontend architecture uses explicit route/layout ownership, context-driven auth state, and service-based API boundaries.  
Digital Twin, billing, and chat surfaces are integrated through a single SPA runtime with clear separation between UI composition, state handling, and transport logic.

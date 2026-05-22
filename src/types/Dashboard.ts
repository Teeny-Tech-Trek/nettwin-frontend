// ─────────────────────────────────────────────────────────────────────────
// dashboard.types.ts
//
// Shared type contracts for the Dashboard feature.
//
// These interfaces are intentionally IDENTICAL to the ones that previously
// lived inline in Dashboard.tsx — nothing about the data shape, the API
// response mapping, or the backend integration has changed. They are pulled
// out here only so the logic container (Dashboard.tsx) and the presentational
// view (DashboardView.tsx) can both import the exact same definitions and
// stay in sync.
// ─────────────────────────────────────────────────────────────────────────

export interface DigitalTwin {
  _id: string;
  identity: {
    name: string;
    role: string;
    tagline: string;
    bio: string;
  };
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
}

export interface Lead {
  _id: string;
  name: string;
  // Backend Lead schema stores the visitor's email under `userEmail`
  // (see digital_twin_backend/src/models/Lead.js). Older code paths and
  // the chatbot form also accept `email`, so we keep both optional in
  // the FE type and read whichever is populated. Don't drop either —
  // doing so silently regresses existing leads.
  email?: string;
  userEmail?: string;
  phone: string;
  company: string;
  message: string;
  interest: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  createdAt: string;
  twinId: {
    identity: {
      name: string;
    };
  };
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  avatar?: string;
}

// Precomputed lead counts by status (built in the container from the real
// `leads` array). Drives the analytics stat cards in the active dashboard.
export interface StatusCounts {
  all: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
}

export type LeadStatus = Lead['status'];
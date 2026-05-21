import { ReactNode } from 'react';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

/**
 * AuthenticatedLayout — for logged-in app surfaces.
 *
 * Crucially: NO public Navbar, NO marketing Footer. Authenticated pages
 * own their own chrome (Dashboard has its own header with user menu;
 * Wizard has breadcrumbs; etc). Mixing the marketing footer into the
 * Dashboard was a UX smell that looked like a half-finished SaaS.
 *
 * The wrapper exists so we have a single, named place to add app-wide
 * concerns later — for instance:
 *   - global keyboard shortcuts only relevant when signed in
 *   - in-app announcement banner
 *   - session-timeout warning toast
 * Adding them once here is much cleaner than touching every page.
 */
export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return <div className="min-h-screen bg-slate-950">{children}</div>;
}

export default AuthenticatedLayout;

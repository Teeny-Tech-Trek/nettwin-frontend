import { ReactNode } from 'react';
import Navigation from '@/pages/LandingPages/Navbar';
import AppFooter from '@/pages/LandingPages/Footer';

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * PublicLayout — for marketing / unauthenticated pages.
 *
 * Renders the public Navigation bar above the page content and the
 * AppFooter beneath it. Used for routes like `/`, `/login`, `/signup`,
 * `/resume`, `/portfolio` and the public chatbot view.
 *
 * If a page wants to opt out of the navbar or footer for a specific
 * variant (e.g. a fullscreen public landing), it can render its own
 * layout inline instead of using this wrapper. Don't add per-page
 * boolean props here — that's how the old path-matching mess started.
 */
export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}

export default PublicLayout;

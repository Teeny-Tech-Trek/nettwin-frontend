import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard for authenticated pages.
 *
 * IMPORTANT: this component MUST gate on `isInitializing`, never on
 * `user === null` alone. During app boot AuthContext is asynchronously
 * restoring the session — if we Navigate-to-/login during that window,
 * the browser back button creates a logout loop:
 *
 *   protected page → kicks to /login → user clicks back → still mid-init →
 *   kicks to /login again ad infinitum.
 *
 * We also pass the user's intended URL as router state so /login can send
 * them back where they wanted to go after authenticating, instead of always
 * dropping them on /dashboard. (Login page can read `location.state?.from`.)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  // First-paint guard: we don't know yet whether the user is logged in.
  // Show a centered spinner skeleton — never redirect during this window.
  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background"
        role="status"
        aria-live="polite"
        aria-label="Restoring your session"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Restoring your session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

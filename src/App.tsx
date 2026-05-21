/**
 * App.tsx
 * ───────
 *
 * Route table + layout architecture.
 *
 * Two layouts:
 *   • PublicLayout         — wraps marketing / unauthenticated pages
 *                            (Navigation + content + Footer)
 *   • AuthenticatedLayout  — wraps signed-in pages
 *                            (NO public Navbar, NO Footer — pages render
 *                             their own chrome)
 *
 * The previous implementation lived in a single `LayoutWrapper` that
 * matched the current pathname against two hardcoded arrays
 * (`hideNavbarPaths`, `hideFooterPaths`) to decide what to hide. That
 * coupled the layout choice to free-floating string lists and meant
 * every new auth-only route silently inherited the marketing footer
 * until someone remembered to update the array. The layout-per-route
 * pattern below makes the choice explicit at the route definition site.
 *
 * Protected routes additionally compose `<ProtectedRoute>` for session
 * gating — see contexts/ProtectedRoute.tsx for redirect logic.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { DigitalTwinProvider } from "./contexts/DigitalTwinContext";
import ProtectedRoute from "./contexts/ProtectedRoute";
import HomeAllPage from "./pages/LandingPages/HomeAllPage";
import Resume from "./pages/Resume";
import Portfolio from "./pages/Portfolio";
import Billing from "./pages/Billing";
import PublicLayout from "./layouts/PublicLayout";
import AuthenticatedLayout from "./layouts/AuthenticatedLayout";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DigitalTwinProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ─────────── Public (marketing) routes ─────────── */}
              <Route
                path="/"
                element={
                  <PublicLayout>
                    <HomeAllPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicLayout>
                    <Login />
                  </PublicLayout>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicLayout>
                    <Signup />
                  </PublicLayout>
                }
              />

              {/* Public twin views — visitors land here from a shared link
                  so they need to NOT see the app's authenticated chrome
                  but DO see the marketing footer for legitimacy. */}
              <Route
                path="/chatbot/:id"
                element={
                  <PublicLayout>
                    <Chatbot />
                  </PublicLayout>
                }
              />
              <Route
                path="/resume"
                element={
                  <PublicLayout>
                    <Resume />
                  </PublicLayout>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <PublicLayout>
                    <Portfolio />
                  </PublicLayout>
                }
              />

              {/* ─────────── Authenticated routes ─────────── */}
              {/* Dashboard, wizard, billing — no marketing footer here. */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Dashboard />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wizard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Index />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Billing />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              {/* 404 inherits the public layout so a logged-out user
                  hitting a bad URL still sees the marketing nav. */}
              <Route
                path="*"
                element={
                  <PublicLayout>
                    <NotFound />
                  </PublicLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </DigitalTwinProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;

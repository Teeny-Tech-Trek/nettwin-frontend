// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { useToast } from '@/hooks/use-toast';

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   avatar?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (name: string, email: string, password: string) => Promise<void>;
//   googleAuth: (googleData: any) => Promise<void>;
//   logout: () => void;
//   isLoading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const { toast } = useToast();

//   // const API_BASE_URL = 'https://api.digitaltwin.techtrekkers.ai/api/auth';
//   const API_BASE_URL = 'http://localhost:5000/api/auth';

// useEffect(() => {
//   const storedToken = localStorage.getItem('token');
//   const storedUser = localStorage.getItem('user');

//   if (storedToken) {
//     setToken(storedToken);
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     } else {
//       // If we have token but no user data, fetch profile
//       getProfile();
//     }
//   }
//   setIsLoading(false);
// }, []);
  

//   const signup = async (name: string, email: string, password: string) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/signup`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name, email, password }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Signup failed');
//       }

//       const { user: userData, token: authToken } = data;

//       // Store in state and localStorage
//       setUser(userData);
//       setToken(authToken);
//       localStorage.setItem('token', authToken);
//       localStorage.setItem('user', JSON.stringify(userData));

//       toast({
//         title: 'Welcome to Proptr!',
//         description: 'Your digital twin has been created successfully.',
//       });
//     } catch (error: any) {
//       toast({
//         title: 'Signup failed',
//         description: error.message,
//         variant: 'destructive',
//       });
//       throw error;
//     }
//   };

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Login failed');
//       }

//       const { user: userData, token: authToken } = data;

//       // Store in state and localStorage
//       setUser(userData);
//       setToken(authToken);
//       localStorage.setItem('token', authToken);
//       localStorage.setItem('user', JSON.stringify(userData));

//       toast({
//         title: 'Welcome back!',
//         description: 'Successfully logged in.',
//       });
//     } catch (error: any) {
//       toast({
//         title: 'Login failed',
//         description: error.message,
//         variant: 'destructive',
//       });
//       throw error;
//     }
//   };

//   const googleAuth = async (googleData: any) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/google`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           googleId: googleData.googleId,
//           name: googleData.name,
//           email: googleData.email,
//           avatar: googleData.imageUrl,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Google authentication failed');
//       }

//       const { user: userData, token: authToken } = data;

//       // Store in state and localStorage
//       setUser(userData);
//       setToken(authToken);
//       localStorage.setItem('token', authToken);
//       localStorage.setItem('user', JSON.stringify(userData));

//       toast({
//         title: 'Welcome to Proptr!',
//         description: 'Successfully signed in with Google.',
//       });
//     } catch (error: any) {
//       toast({
//         title: 'Google authentication failed',
//         description: error.message,
//         variant: 'destructive',
//       });
//       throw error;
//     }
//   };
// const getProfile = async () => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/profile`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });

//     if (response.ok) {
//       const userData = await response.json();
//       setUser(userData);
//       localStorage.setItem('user', JSON.stringify(userData));
//     }
//   } catch (error) {
//     console.error('Failed to fetch profile:', error);
//   }
// };
//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
    
//     toast({
//       title: 'Logged out',
//       description: 'You have been successfully logged out.',
//     });
//   };

//   const value = {
//     user,
//     token,
//     login,
//     signup,
//     googleAuth,
//     logout,
//     isLoading,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };


import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/api.service';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  profilePicture?: string;
  // Public S3 URL set by the avatar upload (POST /api/upload/avatar →
  // User.avatarUrl). Takes precedence over profilePicture/avatar when present.
  avatarUrl?: string | null;
  emailVerified?: boolean;
  onboardingCompleted?: boolean;
}

// Returned to callers (e.g. Login/Signup pages) so they can decide where
// to redirect — new Google users go to /wizard, returning users to /dashboard.
export interface GoogleAuthResult {
  isNewUser: boolean;
  linked: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleAuth: (idToken: string) => Promise<GoogleAuthResult>;
  logout: () => Promise<void>;
  // Merge a partial user update into the cached AuthContext user AND
  // into localStorage. Use after profile edits (name, photo upload, photo
  // remove) so that:
  //   • Components that read `user` from context (e.g. Dashboard header
  //     avatar) re-render with the new value immediately.
  //   • The next full page reload boots from a fresh cached user instead
  //     of the stale one (which is what made deleted avatars keep 404ing
  //     on refresh).
  updateUser: (patch: Partial<User>) => void;
  // True until the *first* session-restore attempt has fully completed.
  // ProtectedRoute MUST gate on this — never on `user === null` alone —
  // otherwise we redirect to /login during the in-flight /auth/profile
  // call and create the "back-button logs me out" race.
  isInitializing: boolean;
  // True while a login/signup/google network request is in-flight.
  // Separate from isInitializing so the route guard logic stays unambiguous.
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Backend (src/modules/auth) returns { accessToken, user } and sets the refresh
// token as an httpOnly cookie. We persist accessToken+user in localStorage to
// keep the existing "stay logged in" UX; axios attaches it as Bearer on every
// request.
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Two distinct flags — see AuthContextType comments for the why.
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const persistSession = (accessToken: string, userData: User) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Merge a partial user patch into context state AND localStorage.
  // Called from screens that mutate the user record server-side (profile
  // name edit, profile picture upload/remove) so that other surfaces
  // re-render and a page refresh hydrates from the new values rather
  // than the stale cached ones.
  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      const next = { ...(prev ?? ({} as User)), ...patch } as User;
      try {
        localStorage.setItem('user', JSON.stringify(next));
      } catch {
        // Storage quota / privacy mode — state still updates in-memory.
      }
      return next;
    });
  };

  // Returns true if profile fetch succeeded, false if it failed (e.g. 401
  // after refresh also failed → axios interceptor will have already
  // dispatched 'auth:logout' which clears session).
  const getProfile = async (): Promise<boolean> => {
    try {
      const res = await authService.getProfile();
      const userData = res.user ?? res;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return false;
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // Session-restore effect.
  //
  // BUG WE FIXED: previously this hook called `getProfile()` without
  // awaiting and then synchronously set isLoading=false. ProtectedRoute
  // would observe (user=null, isLoading=false) for one render and
  // immediately <Navigate to="/login" replace />, which is what made
  // the browser back button look like a logout.
  //
  // NEW BEHAVIOR:
  //   1. If there's no stored token → we're definitely logged out; flip
  //      isInitializing off immediately, ProtectedRoute redirects cleanly.
  //   2. If we have a token AND cached user data → hydrate from cache
  //      synchronously so first paint is correct, then revalidate the
  //      profile in the background. Stale cache is fine — the next
  //      request that 401s will trigger silent refresh in axios.
  //   3. If we have a token but no cached user → AWAIT the profile fetch
  //      before flipping isInitializing. ProtectedRoute keeps showing
  //      the skeleton during this window. No premature redirect.
  // ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken) {
        if (!cancelled) setIsInitializing(false);
        return;
      }

      setToken(storedToken);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Corrupted cache — fall through to network revalidate.
          localStorage.removeItem('user');
        }
        if (!cancelled) setIsInitializing(false);
        // Background revalidate; failure here is handled by the axios
        // interceptor (silent refresh, then auth:logout if that fails).
        getProfile();
        return;
      }

      // Token without cached user → must hit network before declaring init done.
      await getProfile();
      if (!cancelled) setIsInitializing(false);
    };

    init();

    // Listen for axios interceptor's "session is dead" signal. We clear
    // session state here (the single owner) but DO NOT call
    // window.location.href — React Router + ProtectedRoute will redirect
    // organically on the next render when `user` flips to null.
    const onForcedLogout = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const wasLoggedIn = !!localStorage.getItem('token');
      clearSession();
      // Only show the toast for users who *were* logged in. Anonymous users
      // hitting a 401 on a guarded endpoint shouldn't see a "Session expired"
      // banner — that's confusing on first visit.
      if (wasLoggedIn) {
        toast({
          title: 'Session expired',
          description: 'Please sign in again to continue.',
          variant: 'destructive',
        });
      }
      if (import.meta.env.DEV) {
        console.log('[auth] forced logout, reason:', detail?.reason);
      }
    };
    window.addEventListener('auth:logout', onForcedLogout as EventListener);

    return () => {
      cancelled = true;
      window.removeEventListener('auth:logout', onForcedLogout as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authService.signup(name, email, password);
      persistSession(data.accessToken, data.user);

      toast({
        title: 'Welcome to Digital Twin!',
        description: 'Your account has been created successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      persistSession(data.accessToken, data.user);

      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in.',
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Accepts the raw Google ID token (response.credential from Google Identity
  // Services). The backend verifies the JWT against GOOGLE_CLIENT_ID — never
  // pass a client-decoded payload here.
  const googleAuth = async (idToken: string): Promise<GoogleAuthResult> => {
    setIsLoading(true);
    try {
      const data = await authService.googleAuth(idToken);
      persistSession(data.accessToken, data.user);

      toast({
        title: data.isNewUser ? 'Welcome to Digital Twin!' : 'Welcome back!',
        description: data.message || 'Successfully signed in with Google.',
      });

      return { isNewUser: !!data.isNewUser, linked: !!data.linked };
    } catch (error: any) {
      toast({
        title: 'Google authentication failed',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Server-side logout revokes refresh tokens and clears the httpOnly
      // cookie. Best-effort: clear local state even if the call fails so the
      // user is never stuck "logged in" client-side.
      await authService.logout();
    } catch (error) {
      console.error('Server logout failed; clearing local session anyway:', error);
    } finally {
      clearSession();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    }
  };

  const value = {
    user,
    token,
    login,
    signup,
    googleAuth,
    logout,
    updateUser,
    isInitializing,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
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
  const [isLoading, setIsLoading] = useState(true);
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

  const getProfile = async () => {
    try {
      const res = await authService.getProfile();
      const userData = res.user ?? res;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        getProfile();
      }
    }
    setIsLoading(false);
  }, []);

  const signup = async (name: string, email: string, password: string) => {
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
    }
  };

  const login = async (email: string, password: string) => {
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
    }
  };

  // Accepts the raw Google ID token (response.credential from Google Identity
  // Services). The backend verifies the JWT against GOOGLE_CLIENT_ID — never
  // pass a client-decoded payload here.
  const googleAuth = async (idToken: string): Promise<GoogleAuthResult> => {
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
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
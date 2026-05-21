// src/services/api.service.ts
import axiosInstance from '@/axios.config';

// ==================== AUTH SERVICES ====================
export const authService = {
  // Signup with email/password
  signup: async (name: string, email: string, password: string) => {
    const response = await axiosInstance.post('/auth/signup', {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Login with email/password
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Google OAuth.
  // The backend (POST /api/auth/google) expects `{ token }` where `token`
  // is the raw Google ID JWT (`response.credential` from Google Identity Services).
  // It verifies the token server-side against GOOGLE_CLIENT_ID — never send
  // a client-decoded payload.
  googleAuth: async (idToken: string) => {
    const response = await axiosInstance.post('/auth/google', {
      token: idToken,
    });
    return response.data;
  },

  // Rotate access token using the httpOnly refresh cookie.
  // The cookie travels because axios has withCredentials enabled.
  // The backend controller reads the cookie, but its Joi schema currently
  // requires a non-empty `refreshToken` field in the body — we send a
  // placeholder to satisfy validation. (See notes: backend bug.)
  refresh: async () => {
    const response = await axiosInstance.post('/auth/refresh', {
      refreshToken: 'cookie',
    });
    return response.data;
  },

  // Server-side logout: revokes all refresh tokens and clears the cookie.
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  },

  // Get public user profile
  getPublicProfile: async (userId: string) => {
    const response = await axiosInstance.get(`/auth/public/${userId}`);
    return response.data;
  },

  // Update profile picture
  updateProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await axiosInstance.put('/auth/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ==================== DIGITAL TWIN SERVICES ====================
export const digitalTwinService = {
  // Create digital twin
  create: async (data: any) => {
    const response = await axiosInstance.post('/digital-twin/create', data);
    return response.data;
  },

  // Get the user's single twin. 404 if they haven't created one yet.
  get: async () => {
    const response = await axiosInstance.get('/digital-twin/get');
    return response.data;
  },

  // Get public digital twin
  getPublic: async (twinId: string) => {
    const response = await axiosInstance.get(`/digital-twin/public/${twinId}`);
    return response.data;
  },

  // Update specific section
  updateSection: async (section: string, data: any) => {
    const response = await axiosInstance.patch(`/digital-twin/update/${section}`, data);
    return response.data;
  },

  // Delete the user's single twin.
  delete: async () => {
    const response = await axiosInstance.delete('/digital-twin/delete');
    return response.data;
  },
};

// ==================== CHAT SERVICES ====================
export const chatService = {
  // Send chat message
  sendMessage: async (data: {
    twinId: string;
    messages: Array<{ role: string; content: string }>;
    userEmail: string;
  }) => {
    const response = await axiosInstance.post('/chat', data);
    return response.data;
  },
};

// ==================== LEAD SERVICES ====================
export const leadService = {
  // Create lead
  create: async (leadData: {
    name: string;
    email: string;
    phone: string;
    company: string;
    interest: string;
    twinId: string;
  }) => {
    const response = await axiosInstance.post('/leads', leadData);
    return response.data;
  },

  // Get leads for a twin
  getByTwinId: async (twinId: string) => {
    const response = await axiosInstance.get(`/leads/${twinId}`);
    return response.data;
  },

  // Update lead status
  updateStatus: async (leadId: string, status: string) => {
    const response = await axiosInstance.patch(`/leads/${leadId}/status`, {
      status,
    });
    return response.data;
  },
};

// Billing lives in features/billing (its own types, Razorpay glue, hooks).
// Re-exporting here keeps the convention consistent with other domain
// services so callers can do `import { billingService } from '@/services/api.service'`.
import { billingService } from '@/features/billing/services/billing.service';
export { billingService };

// Export all services as a single object (optional)
export const apiService = {
  auth: authService,
  digitalTwin: digitalTwinService,
  chat: chatService,
  lead: leadService,
  billing: billingService,
};

export default apiService;
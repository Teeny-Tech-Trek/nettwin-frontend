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

  // Remove the current profile picture (server deletes the file and
  // clears the user.profilePicture field). Returns the updated user.
  removeProfilePicture: async () => {
    const response = await axiosInstance.delete('/auth/profile/picture');
    return response.data;
  },

  // Update display name (and optionally other profile fields the backend
  // allows). Backend route is PUT /auth/profile guarded by updateProfileSchema —
  // it accepts `name` and validates it server-side.
  updateProfile: async (updates: { name?: string }) => {
    const response = await axiosInstance.put('/auth/profile', updates);
    return response.data;
  },

  // Change password. Backend revokes all refresh tokens on success, so the
  // caller should treat this as a "log everywhere out + redirect to login"
  // signal.
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await axiosInstance.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};

// ==================== DIGITAL TWIN SERVICES ====================
//
// The create/get/delete endpoints save the structured DigitalTwin in Mongo
// AND mirror the data to the AI backend (portfolio-chatbot-backend) so the
// hybrid-RAG chatbot has an up-to-date index. That mirroring happens server
// side — no frontend changes needed.
//
// The /ingest/* endpoints below are new and feed the AI engine with
// unstructured sources (resume file, website URL) that the structured
// wizard form can't capture. They return a `jobId` that the dashboard
// polls until ingestion is "ready".
export const digitalTwinService = {
  // Create or update the user's single twin (upsert keyed on user id).
  // Also kicks off an AI-backend profile sync on the server side.
  create: async (data: any) => {
    const response = await axiosInstance.post('/digital-twin/create', data);
    return response.data;
  },

  // Get the user's single twin. 404 if they haven't created one yet.
  get: async () => {
    const response = await axiosInstance.get('/digital-twin/get');
    return response.data;
  },

  // Get public digital twin (for the QR-code landing chatbot).
  getPublic: async (twinId: string) => {
    const response = await axiosInstance.get(`/digital-twin/public/${twinId}`);
    return response.data;
  },

  // Patch one section of the twin (the backend route is PATCH
  // /digital-twin/section with `{ section, data }` in the body — the URL
  // used to interpolate the section name, which never matched the route).
  updateSection: async (section: string, data: any) => {
    const response = await axiosInstance.patch('/digital-twin/section', {
      section,
      data,
    });
    return response.data;
  },

  // Delete the user's single twin. Also tears down the AI-backend tenant
  // (FAISS files + Neo4j nodes) on the server side.
  delete: async () => {
    const response = await axiosInstance.delete('/digital-twin/delete');
    return response.data;
  },

  // ────────────── AI-engine source ingestion ──────────────
  // Upload a resume (PDF / DOCX / TXT). Returns { jobId, tenantId }. The
  // AI worker extracts → chunks → embeds → indexes. Poll
  // /ingestion-status (or /jobs/:jobId) until status === "ready".
  ingestResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(
      '/digital-twin/ingest/resume',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data as {
      success: boolean;
      jobId: string;
      tenantId: string;
      message?: string;
    };
  },

  // Kick off a same-origin BFS crawl of a website URL. If `url` is empty,
  // the backend falls back to `twin.links.website` / `twin.links.portfolio`.
  ingestWebsite: async (opts: { url?: string; maxPages?: number; maxDepth?: number }) => {
    const response = await axiosInstance.post('/digital-twin/ingest/website', opts);
    return response.data as {
      success: boolean;
      jobId: string;
      tenantId: string;
      url: string;
    };
  },

  // Per-source ingestion status block. Returns a snapshot keyed by source
  // type — useful for "Resume: ready • Website: indexing • Profile: ready"
  // UI on the dashboard.
  //
  // Also returns `notice` — set to "sent" exactly once when this poll is
  // the one that flipped the twin to ready and triggered the welcome
  // email. The dashboard uses this to flash a success toast.
  ingestionStatus: async () => {
    const response = await axiosInstance.get('/digital-twin/ingestion-status');
    return response.data as {
      success: boolean;
      notice?: 'sent' | 'previously-sent' | 'dry-run' | null;
      data: {
        tenant_id: string;
        overall_status: 'empty' | 'partial' | 'ready';
        resume?: { state: string; chunks?: number; updated_at?: string };
        website?: { state: string; chunks?: number; updated_at?: string; pages_crawled?: number };
        profile?: { state: string; chunks?: number; updated_at?: string };
        ready_sources: string[];
        detail: Record<string, unknown>;
      };
    };
  },

  // Single-job progress (used to drive the "embedding… 60%" UI).
  jobStatus: async (jobId: string) => {
    const response = await axiosInstance.get(`/digital-twin/jobs/${jobId}`);
    return response.data as {
      success: boolean;
      data: {
        job_id: string;
        tenant_id: string;
        kind: 'resume' | 'website' | 'profile';
        status: 'queued' | 'running' | 'done' | 'failed';
        stage: string;
        progress_pct: number;
        error?: string | null;
      };
    };
  },

  // Force a re-push of the structured profile to the AI engine. Useful
  // when the AI backend was down during a save, or after a model upgrade.
  resync: async () => {
    const response = await axiosInstance.post('/digital-twin/resync');
    return response.data as {
      success: boolean;
      jobId: string;
      tenantId: string;
    };
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


// import { Bot, Plus, Download, ExternalLink, LogOut, Sparkles, Zap, Trash2, Users, Mail, Building, Calendar, Filter, User, FileText, Briefcase, Camera, Menu, X, CreditCard } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import { useState, useEffect, useCallback, useRef } from "react";
// import QRCode from "react-qr-code";
// import { motion, AnimatePresence } from "framer-motion";
// import { useDigitalTwin } from "@/contexts/DigitalTwinContext";
// import { useAuth } from "@/contexts/AuthContext";
// import { useToast } from "@/hooks/use-toast";
// import { authService, leadService } from '@/services/api.service';
// import { IMAGE_BASE_URL } from '@/axios.config';
// import { Skeleton } from '@/components/ui/skeleton';
// // Pencil = Edit Twin CTA shown when the user already owns a twin.
// // Eye    = View Twin (public chatbot link).
// import { Pencil, Eye } from 'lucide-react';


// interface DigitalTwin {
//   _id: string;
//   identity: {
//     name: string;
//     role: string;
//     tagline: string;
//     bio: string;
//   };
//   isActive: boolean;
//   createdAt: string;
//   lastUpdated: string;
// }

// interface Lead {
//   _id: string;
//   name: string;
//   email: string;
//   phone: string;
//   company: string;
//   message: string;
//   interest: string;
//   status: 'new' | 'contacted' | 'qualified' | 'converted';
//   createdAt: string;
//   twinId: {
//     identity: {
//       name: string;
//     };
//   };
// }

// interface UserProfile {
//   _id: string;
//   name: string;
//   email: string;
//   profilePicture?: string;
//   avatar?: string;
// }

// const Dashboard = () => {
//   const { digitalTwin, isLoading, loadDigitalTwin, deleteTwin } = useDigitalTwin();
//   const { logout } = useAuth();
//   const { toast } = useToast();
//   // Imperative router push. Used by the Create/Edit CTAs to land the
//   // user on the wizard (single-twin model — the wizard auto-detects
//   // create vs edit by reading the digitalTwin from context).
//   const navigate = useNavigate();
//   const [twins, setTwins] = useState<DigitalTwin[]>([]);
//   const [leads, setLeads] = useState<Lead[]>([]);
//   const [isLoadingLeads, setIsLoadingLeads] = useState(false);
//   const [activeFilter, setActiveFilter] = useState<string>('all');
//   const [userMenuOpen, setUserMenuOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   // Cache-buster bumped on every successful avatar upload so the <img>
//   // element refetches even when the URL path is identical (the server
//   // usually overwrites the same filename, so the browser would otherwise
//   // serve the stale local copy from disk cache).
//   const [avatarCacheKey, setAvatarCacheKey] = useState<number>(0);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const hasFetched = useRef(false);

//   // Public URL used in the QR code and the "View Live" link.
//   //
//   // Previously this was hardcoded to `https://digitaltwin.techtrekkers.ai`,
//   // which is the OLD production domain. The current production frontend
//   // lives at `https://nettwin.techtrekkers.ai`, so QR codes generated on
//   // the new site pointed at the wrong host and resolved either to a stale
//   // app or to a 404 depending on DNS state — that's why scans stopped
//   // opening the twin page.
//   //
//   // We now resolve at runtime in this order:
//   //   1. VITE_PUBLIC_APP_URL (deploy-time override, useful for previews)
//   //   2. window.location.origin (matches the host the user is currently on,
//   //      which is correct in dev, preview, and prod — and naturally uses
//   //      https in production because the page itself is served over https)
//   // This keeps the QR aligned with whichever domain the dashboard is
//   // actually being served from, so scanning is reliable everywhere.
//   const publicAppOrigin =
//     (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) ||
//     (typeof window !== 'undefined' ? window.location.origin : '');
//   const twinPublicUrl = (id: string) => `${publicAppOrigin}/chatbot/${id}`;

//   useEffect(() => {
//     if (hasFetched.current) return;
//     hasFetched.current = true;

//     const fetchData = async () => {
//       try {
//         await loadDigitalTwin();
//         await fetchUserProfile();
//       } catch (error: any) {
//         toast({
//           title: "Load failed",
//           description: error.message || "Failed to load digital twin",
//           variant: "destructive",
//         });
//       }
//     };

//     fetchData();
//   }, [loadDigitalTwin, toast]);

//   // ──────────────────────────────────────────────────────────────────────
//   // Single-twin sync.
//   //
//   // Product model: each user owns at most one twin. The DigitalTwinContext
//   // already fetches it via loadDigitalTwin() on mount; we mirror that
//   // single object into a one-element `twins` array so the existing
//   // `twins.map(...)` rendering below stays intact (rather than ripping
//   // the JSX apart for a single-twin-specific layout). When the wizard
//   // dispatches `twin:saved` after create/edit, we re-fetch so the
//   // dashboard reflects the latest state without a manual reload.
//   // ──────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (digitalTwin) {
//       setTwins([digitalTwin]);
//       fetchLeads(digitalTwin._id);
//     } else {
//       setTwins([]);
//       setLeads([]);
//     }
//   }, [digitalTwin]);

//   // Listen for twin:saved (dispatched by wizard on save and by context on
//   // delete) so the cached `digitalTwin` reloads from the server. Keeps
//   // the dashboard in sync after edits/deletes triggered elsewhere.
//   useEffect(() => {
//     const onTwinSaved = () => {
//       loadDigitalTwin();
//     };
//     window.addEventListener('twin:saved', onTwinSaved);
//     return () => window.removeEventListener('twin:saved', onTwinSaved);
//   }, [loadDigitalTwin]);

//   // ──────────────────────────────────────────────────────────────────────
//   // BUG FIX: header was stuck showing "Loading..." forever.
//   //
//   // The backend GET /auth/profile responds with `{ success: true, user }`
//   // but this code used to do `setUserProfile(userData)` directly, which
//   // stored the wrapper object — so `userProfile.name` was always
//   // undefined and fell through to the `'Loading...'` placeholder in the
//   // header. The other call site (updateProfilePicture) does
//   // `setUserProfile(result.user)` because its response shape happens to
//   // be `{ message, user }` without `success` — but the same field name
//   // tripped us up.
//   //
//   // We now defensively unwrap: prefer `userData.user`, fall back to
//   // `userData` itself in case some intermediate layer returns the user
//   // directly. Either shape now lands in state as the actual user object.
//   // ──────────────────────────────────────────────────────────────────────
//   const fetchUserProfile = async () => {
//     try {
//       const userData = await authService.getProfile();
//       const user = userData?.user ?? userData;
//       setUserProfile(user);

//       // Profile-picture nudge: if the user has no photo, show the upload
//       // modal after a beat. Skip the nudge entirely if we somehow got
//       // back a malformed response so we don't spam.
//       if (user && !user.profilePicture && !user.avatar) {
//         setTimeout(() => setIsProfileModalOpen(true), 2000);
//       }
//     } catch (error: any) {
//       console.error('Failed to fetch user profile:', error);
//     }
//   };

//   const fetchLeads = async (twinId: string) => {
//     setIsLoadingLeads(true);
//     try {
//       const leadsData = await leadService.getByTwinId(twinId);
//       setLeads(leadsData.data || []);
//     } catch (error: any) {
//       toast({
//         title: "Failed to load leads",
//         description: error.message || "Please try again later",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoadingLeads(false);
//     }
//   };

//   // ──────────────────────────────────────────────────────────────────────
//   // Profile picture upload.
//   //
//   // Validations done client-side BEFORE we send anything to the server:
//   //   • MIME type must start with `image/` (jpg, png, webp, gif…)
//   //   • Size ≤ 5 MB — matches the backend multer limit in
//   //     profileController.js. Doing this check here means the user gets
//   //     instant feedback instead of a confusing 413 from nginx.
//   //   • Reject empty files (drag-drop edge case)
//   //
//   // After a successful upload we:
//   //   1. Update userProfile state from `result.user`
//   //   2. Append a cache-busting `?v=<timestamp>` to the next render of
//   //      the avatar src so the browser doesn't show the old image from
//   //      its disk cache. The state update alone isn't enough because
//   //      profilePicture path is often the SAME URL (server overwrites).
//   // ──────────────────────────────────────────────────────────────────────
//   const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

//   const handleProfilePictureUpload = async (file: File) => {
//     // Pre-flight validations. Each early-return surfaces an actionable
//     // toast so the user knows exactly what to change.
//     if (!file.type.startsWith('image/')) {
//       toast({
//         title: 'Unsupported file',
//         description: 'Please choose an image file (JPG, PNG, WebP, or GIF).',
//         variant: 'destructive',
//       });
//       return;
//     }
//     if (file.size === 0) {
//       toast({
//         title: 'Empty file',
//         description: 'That file appears to be empty. Try a different image.',
//         variant: 'destructive',
//       });
//       return;
//     }
//     if (file.size > MAX_AVATAR_BYTES) {
//       const mb = (file.size / 1024 / 1024).toFixed(1);
//       toast({
//         title: 'File too large',
//         description: `Profile pictures must be 5 MB or less — yours is ${mb} MB.`,
//         variant: 'destructive',
//       });
//       return;
//     }

//     setIsUploading(true);
//     try {
//       const result = await authService.updateProfilePicture(file);
//       const updatedUser = result?.user ?? result;
//       setUserProfile(updatedUser);
//       // Bump cache key so the <img> with the new src refetches from server
//       // even when the path is unchanged (server may have overwritten the
//       // same filename).
//       setAvatarCacheKey(Date.now());

//       toast({
//         title: 'Success',
//         description: 'Profile picture updated successfully.',
//       });

//       setIsProfileModalOpen(false);
//     } catch (error: any) {
//       // 413 from nginx surfaces here as a generic error with no response
//       // body — special-case it so users know the limit. Server-side multer
//       // catches the rest.
//       const status = error?.response?.status;
//       const serverMsg = error?.response?.data?.message;
//       const description =
//         status === 413
//           ? 'The server rejected the file as too large. Try an image under 5 MB.'
//           : serverMsg || error?.message || 'Failed to upload profile picture';
//       toast({
//         title: 'Upload failed',
//         description,
//         variant: 'destructive',
//       });
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // Reset the same-file edge case: if a user picks file A, the upload
//   // fails, and they re-pick file A, the input's `change` event won't fire
//   // again because the value hasn't changed. Clearing the input restores
//   // retry behavior.
//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       handleProfilePictureUpload(file);
//     }
//     event.target.value = '';
//   };

//   const downloadQR = useCallback((id: string) => {
//     const svg = document.getElementById(`qr-${id}`);
//     if (svg) {
//       const svgData = new XMLSerializer().serializeToString(svg);
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");
//       const img = new Image();
//       img.onload = () => {
//         canvas.width = img.width;
//         canvas.height = img.height;
//         ctx?.drawImage(img, 0, 0);
//         const pngFile = canvas.toDataURL("image/png");
//         const downloadLink = document.createElement("a");
//         downloadLink.download = `digital-twin-qr-${id}.png`;
//         downloadLink.href = pngFile;
//         downloadLink.click();
//       };
//       img.src = "data:image/svg+xml;base64," + btoa(svgData);
//     }
//   }, []);

//   // Single-twin delete. Context's deleteTwin nulls the cached digitalTwin
//   // AND dispatches `twin:saved` so any other surface (header CTAs,
//   // sidebar) refreshes its create-vs-edit decision.
//   const handleDelete = useCallback(async () => {
//     try {
//       await deleteTwin();
//       setTwins([]);
//       setLeads([]);
//       toast({
//         title: "Success",
//         description: "Digital twin deleted successfully.",
//       });
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to delete digital twin.",
//         variant: "destructive",
//       });
//     }
//   }, [deleteTwin, toast]);

//   // Use AuthContext's logout — it revokes the refresh token server-side,
//   // clears both `token` and `user` from localStorage, dispatches the
//   // logout toast, and lets ProtectedRoute redirect via React Router on
//   // the next render. The previous version (window.location.href + a
//   // partial localStorage clear) left the refresh-token cookie alive on
//   // the server, broke logout-everywhere security, and skipped the toast.
//   const handleLogout = async () => {
//     await logout();
//     navigate('/login', { replace: true });
//   };

//   // Build the avatar src for an <img> tag.
//   //
//   //   • If the user has a server-uploaded profilePicture (a relative
//   //     /uploads/... path), prefix with IMAGE_BASE_URL and append
//   //     ?v=avatarCacheKey to bust the browser cache after re-upload.
//   //   • Else if they have an `avatar` (e.g. Google OAuth full URL),
//   //     use it as-is.
//   //   • Else return null so the caller renders the initials fallback.
//   const getAvatarSrc = (): string | null => {
//     if (!userProfile) return null;
//     if (userProfile.profilePicture) {
//       const sep = userProfile.profilePicture.includes('?') ? '&' : '?';
//       return `${IMAGE_BASE_URL}${userProfile.profilePicture}${sep}v=${avatarCacheKey}`;
//     }
//     if (userProfile.avatar) {
//       // Google/Microsoft OAuth provide absolute URLs; don't double-prefix.
//       return /^https?:\/\//i.test(userProfile.avatar)
//         ? userProfile.avatar
//         : `${IMAGE_BASE_URL}${userProfile.avatar}`;
//     }
//     return null;
//   };

//   const getInitials = (name?: string | null) => {
//     if (!name || typeof name !== 'string') return 'U';
//     return name
//       .trim()
//       .split(/\s+/)
//       .filter(Boolean)
//       .map((n) => n[0])
//       .join('')
//       .toUpperCase() || 'U';
//   };

//   const filteredLeads = leads.filter(lead => {
//     if (activeFilter === 'all') return true;
//     return lead.status === activeFilter;
//   });

//   const getStatusColor = (status: string) => {
//     const colors = {
//       new: 'bg-blue-100 text-blue-800 border-blue-200',
//       contacted: 'bg-purple-100 text-purple-800 border-purple-200',
//       qualified: 'bg-green-100 text-green-800 border-green-200',
//       converted: 'bg-emerald-100 text-emerald-800 border-emerald-200'
//     };
//     return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
//   };

//   const getStatusCount = (status: string) => {
//     return leads.filter(lead => lead.status === status).length;
//   };

//   // Dashboard loading skeleton — modeled on the real layout (header strip,
//   // action card row, two twin cards) so the page doesn't reflow when data
//   // arrives. Better perceived performance than a centered spinner because
//   // the eye sees structure immediately and content fills in.
//   if (isLoading) {
//     return (
//       <div
//         className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] px-4 py-6 sm:py-8"
//         role="status"
//         aria-live="polite"
//         aria-label="Loading dashboard"
//       >
//         <div className="max-w-7xl mx-auto space-y-6">
//           {/* Header strip */}
//           <div className="flex items-center justify-between">
//             <Skeleton className="h-8 w-40 bg-cyan-500/10" />
//             <Skeleton className="h-10 w-10 rounded-full bg-cyan-500/10" />
//           </div>

//           {/* Quick actions row */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {[0, 1, 2].map((i) => (
//               <Skeleton key={i} className="h-20 sm:h-24 rounded-2xl bg-cyan-500/10" />
//             ))}
//           </div>

//           {/* Twin cards placeholder */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
//             {[0, 1].map((i) => (
//               <div
//                 key={i}
//                 className="p-6 sm:p-8 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-cyan-500/20 space-y-4"
//               >
//                 <Skeleton className="h-7 w-3/4 bg-cyan-500/10" />
//                 <Skeleton className="h-4 w-1/2 bg-cyan-500/10" />
//                 <Skeleton className="h-20 w-full bg-cyan-500/10" />
//                 <div className="flex items-end justify-between pt-2">
//                   <Skeleton className="h-24 w-24 rounded-lg bg-cyan-500/10" />
//                   <Skeleton className="h-9 w-24 rounded-md bg-cyan-500/10" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <span className="sr-only">Loading your dashboard…</span>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929]">
//       {/* Profile Picture Modal */}
//       <AnimatePresence>
//         {isProfileModalOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-[#132F4C] rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-cyan-500/20"
//             >
//               <div className="text-center">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
//                 </div>
//                 <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Add Profile Picture</h3>
//                 <p className="text-sm sm:text-base text-slate-300 mb-6 px-2">
//                   Make your profile stand out with a professional photo
//                 </p>
                
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={handleFileSelect}
//                   accept="image/*"
//                   className="hidden"
//                 />
                
//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   disabled={isUploading}
//                   className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 text-white py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3 shadow-lg shadow-cyan-500/20 text-sm sm:text-base"
//                 >
//                   {isUploading ? "Uploading..." : "Choose Photo"}
//                 </button>
                
//                 <button
//                   onClick={() => setIsProfileModalOpen(false)}
//                   disabled={isUploading}
//                   className="w-full text-slate-300 py-3 rounded-xl font-medium hover:bg-white/5 transition border border-white/10 text-sm sm:text-base"
//                 >
//                   Skip for now
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Header */}
//       <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A1929]/80 border-b border-cyan-500/10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-2 sm:gap-3">
//               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
//                 <img src="https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/logo.png" alt="logo" className="w-full h-full object-contain" />
//               </div>
//               <div className="min-w-0">
//                 <h1 className="text-base sm:text-xl font-bold text-white truncate">NetTwin</h1>
//                 <p className="text-xs sm:text-sm text-cyan-300 truncate hidden xs:block">Professional AI Assistant</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 sm:gap-6">
//               {/* Desktop Navigation */}
//               <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
//                 <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
//                   <FileText className="w-4 h-4" />
//                   <span className="text-slate-400">Resume</span>
//                   <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full border border-cyan-500/30">Soon</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
//                   <Briefcase className="w-4 h-4" />
//                   <span className="text-slate-400">Portfolio</span>
//                   <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-1 rounded-full border border-teal-500/30">Soon</span>
//                 </div>
//                 <Link to="/dashboard" className="text-cyan-400 font-semibold border-b-2 border-cyan-400 text-sm">
//                   Dashboard
//                 </Link>
//               </nav>

//               {/* Mobile Menu Button */}
//               <button
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="lg:hidden p-2 text-cyan-400 hover:bg-white/5 rounded-lg transition"
//               >
//                 {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//               </button>

//               {/* User Menu */}
//               <div className="relative hidden sm:block">
//                 <button
//                   onClick={() => setUserMenuOpen(!userMenuOpen)}
//                   className="flex items-center gap-2 lg:gap-3 p-2 rounded-xl lg:rounded-2xl bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:bg-white/10 hover:border-cyan-500/30 transition"
//                 >
//                   {getAvatarSrc() ? (
//                     <img
//                       src={getAvatarSrc() ?? ''}
//                       alt={userProfile?.name ?? 'Profile'}
//                       onError={(e) => {
//                         // If the image 404s (deleted, expired CDN link),
//                         // hide it so the initials fallback below renders.
//                         (e.currentTarget as HTMLImageElement).style.display = 'none';
//                       }}
//                       className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover ring-2 ring-cyan-500/30 flex-shrink-0"
//                     />
//                   ) : (
//                     <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex-shrink-0">
//                       {userProfile ? getInitials(userProfile.name) : 'U'}
//                     </div>
//                   )}
//                   <div className="hidden md:block text-left min-w-0">
//                     {/* Header name + status. If userProfile is still null
//                         (first paint, profile fetch in flight) we show a
//                         small skeleton instead of the old "Loading..." text
//                         — that text used to stick forever because the API
//                         response was being stored unwrapped (see fetchUserProfile). */}
//                     <div className="text-sm font-medium text-white truncate max-w-[120px]">
//                       {userProfile?.name ?? (
//                         <Skeleton className="h-4 w-20 bg-cyan-500/10 inline-block align-middle" />
//                       )}
//                     </div>
//                     <div className="text-xs text-cyan-300 truncate">
//                       {userProfile ? 'Digital Twin' : (
//                         <Skeleton className="h-3 w-16 bg-cyan-500/10 inline-block align-middle" />
//                       )}
//                     </div>
//                   </div>
//                 </button>

//                 <AnimatePresence>
//                   {userMenuOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                       className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-[#132F4C] backdrop-blur-xl rounded-2xl shadow-xl border border-cyan-500/20 overflow-hidden z-50"
//                     >
//                       <div className="p-4 border-b border-cyan-500/10">
//                         <div className="text-sm font-semibold text-white truncate">{userProfile?.email}</div>
//                         <div className="text-xs text-cyan-300">Professional Plan</div>
//                       </div>
//                       <div className="p-2">
//                         {/* <button 
//                           onClick={() => {
//                             setUserMenuOpen(false);
//                             setIsProfileModalOpen(true);
//                           }}
//                           className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition text-sm"
//                         >
//                           <Camera className="w-4 h-4 flex-shrink-0" />
//                           <span>Update Photo</span>
//                         </button> */}
//                         <Link
//                           to="/profile"
//                           onClick={() => setUserMenuOpen(false)}
//                           className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition text-sm"
//                         >
//                           <User className="w-4 h-4 flex-shrink-0" />
//                           <span>Profile Settings</span>
//                         </Link>
//                         <Link
//                           to="/billing"
//                           onClick={() => setUserMenuOpen(false)}
//                           className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition text-sm"
//                         >
//                           <CreditCard className="w-4 h-4 flex-shrink-0" />
//                           <span>Billing &amp; Plan</span>
//                         </Link>
//                       </div>
//                       <div className="p-2 border-t border-cyan-500/10">
//                         <button
//                           onClick={handleLogout}
//                           className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition text-sm"
//                         >
//                           <LogOut className="w-4 h-4 flex-shrink-0" />
//                           <span>Sign Out</span>
//                         </button>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {/* Mobile User Avatar */}
//               <button
//                 onClick={() => setUserMenuOpen(!userMenuOpen)}
//                 className="sm:hidden"
//               >
//                 {getAvatarSrc() ? (
//                   <img
//                     src={getAvatarSrc() ?? ''}
//                     alt={userProfile?.name ?? 'Profile'}
//                     onError={(e) => {
//                       (e.currentTarget as HTMLImageElement).style.display = 'none';
//                     }}
//                     className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/30"
//                   />
//                 ) : (
//                   <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-lg shadow-cyan-500/20">
//                     {userProfile ? getInitials(userProfile.name) : 'U'}
//                   </div>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Mobile Menu */}
//           <AnimatePresence>
//             {mobileMenuOpen && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: 'auto' }}
//                 exit={{ opacity: 0, height: 0 }}
//                 className="lg:hidden mt-4 pt-4 border-t border-cyan-500/10"
//               >
//                 <nav className="flex flex-col gap-3">
//                   <div className="flex items-center gap-2 text-slate-400 font-medium text-sm p-2">
//                     <FileText className="w-4 h-4" />
//                     <span className="text-slate-400">Resume</span>
//                     <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full border border-cyan-500/30">Soon</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-slate-400 font-medium text-sm p-2">
//                     <Briefcase className="w-4 h-4" />
//                     <span className="text-slate-400">Portfolio</span>
//                     <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-1 rounded-full border border-teal-500/30">Soon</span>
//                   </div>
//                   <Link to="/dashboard" className="text-cyan-400 font-semibold text-sm p-2 bg-cyan-500/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
//                     Dashboard
//                   </Link>
//                 </nav>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Mobile User Menu */}
//           <AnimatePresence>
//             {userMenuOpen && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: 'auto' }}
//                 exit={{ opacity: 0, height: 0 }}
//                 className="sm:hidden mt-4 pt-4 border-t border-cyan-500/10"
//               >
//                 <div className="p-3 bg-white/5 rounded-xl mb-3">
//                   <div className="text-sm font-semibold text-white truncate">{userProfile?.email}</div>
//                   <div className="text-xs text-cyan-300">Professional Plan</div>
//                 </div>
//                 <div className="flex flex-col gap-2">
//                   <button 
//                     onClick={() => {
//                       setUserMenuOpen(false);
//                       setIsProfileModalOpen(true);
//                     }}
//                     className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition text-sm"
//                   >
//                     <Camera className="w-4 h-4" />
//                     Update Photo
//                   </button>
//                   <Link
//                     to="/profile"
//                     onClick={() => setUserMenuOpen(false)}
//                     className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition text-sm"
//                   >
//                     <User className="w-4 h-4" />
//                     Profile Settings
//                   </Link>
//                   <button 
//                     onClick={handleLogout}
//                     className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition text-sm border-t border-cyan-500/10 mt-2 pt-3"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     Sign Out
//                   </button>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="p-4 sm:p-6 lg:p-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Hero Section */}
//           <div className="text-center mb-8 sm:mb-12 px-4">
//             <motion.h1 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4"
//             >
//               Your Digital Presence,
//               <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent block sm:inline"> Reimagined</span>
//             </motion.h1>
//             <motion.p 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto px-4"
//             >
//               Manage your AI Net twins, track leads, and showcase your professional portfolio in one place.
//             </motion.p>
//           </div>

//           {/* Quick Actions */}
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
//           >
//             <Link
//               to="/resume"
//               className="group p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-cyan-500/20 shadow-sm hover:shadow-lg hover:shadow-cyan-500/10 hover:bg-white/10 hover:border-cyan-500/30 transition"
//             >
//               <div className="flex items-center gap-3 sm:gap-4">
//                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/20 transition flex-shrink-0">
//                   <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
//                 </div>
//                 <div className="text-left min-w-0">
//                   <h3 className="font-semibold text-white text-sm sm:text-base truncate">Smart Resume</h3>
//                   <p className="text-xs sm:text-sm text-slate-400 truncate">AI-powered resume builder</p>
//                 </div>
//               </div>
//             </Link>

//             <Link
//               to="/portfolio"
//               className="group p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-teal-500/20 shadow-sm hover:shadow-lg hover:shadow-teal-500/10 hover:bg-white/10 hover:border-teal-500/30 transition"
//             >
//               <div className="flex items-center gap-3 sm:gap-4">
//                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-500/20 transition flex-shrink-0">
//                   <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
//                 </div>
//                 <div className="text-left min-w-0">
//                   <h3 className="font-semibold text-white text-sm sm:text-base truncate">Portfolio</h3>
//                   <p className="text-xs sm:text-sm text-slate-400 truncate">Showcase your work</p>
//                 </div>
//               </div>
//             </Link>

//             {/*
//               Single-twin product model: this slot is either a "Create"
//               CTA (no twin yet) or an "Edit Twin" CTA (one already exists).
//               Hiding the create path when a twin exists prevents the user
//               from re-entering the wizard expecting to add a second one
//               and being silently dropped onto an upsert that overwrites
//               their existing data.

//               `digitalTwin` is the single-source-of-truth from the context;
//               the local `twins` array is just a UI convenience for the
//               cards grid below.
//             */}
//             {!digitalTwin ? (
//               <button
//                 type="button"
//                 onClick={() => navigate('/wizard')}
//                 className="group p-4 sm:p-6 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-xl sm:rounded-2xl border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] transition sm:col-span-2 lg:col-span-1 text-left"
//               >
//                 <div className="flex items-center gap-3 sm:gap-4">
//                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition flex-shrink-0">
//                     <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//                   </div>
//                   <div className="text-left min-w-0">
//                     <h3 className="font-semibold text-white text-sm sm:text-base truncate">New Digital Twin</h3>
//                     <p className="text-xs sm:text-sm text-white/90 truncate">Create AI assistant</p>
//                   </div>
//                 </div>
//               </button>
//             ) : (
//               <button
//                 type="button"
//                 onClick={() => navigate('/wizard')}
//                 className="group p-4 sm:p-6 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-xl sm:rounded-2xl border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] transition sm:col-span-2 lg:col-span-1 text-left"
//                 title="Edit your Digital Twin"
//               >
//                 <div className="flex items-center gap-3 sm:gap-4">
//                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition flex-shrink-0">
//                     <Pencil className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//                   </div>
//                   <div className="text-left min-w-0">
//                     <h3 className="font-semibold text-white text-sm sm:text-base truncate">Edit Digital Twin</h3>
//                     <p className="text-xs sm:text-sm text-white/90 truncate">Update your AI assistant</p>
//                   </div>
//                 </div>
//               </button>
//             )}
//           </motion.div>

//           {twins.length === 0 ? (
//             <motion.div 
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center py-12 sm:py-16 lg:py-20 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-sm border border-cyan-500/20 px-4"
//             >
//               <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-cyan-400" />
//               <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">No Digital Twin Yet</h3>
//               <p className="text-slate-300 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto px-4">
//                 Create your first digital twin to start generating leads and engaging with your audience 24/7.
//               </p>
//               {/* Empty-state CTA. No gating — users hitting this state by
//                   definition have 0 twins, so navigate straight into the
//                   wizard. */}
//               <button
//                 type="button"
//                 onClick={() => navigate('/wizard')}
//                 className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-cyan-500 to-teal-400 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-cyan-600 hover:to-teal-500 transition font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 text-sm sm:text-base"
//               >
//                 <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
//                 Create Your First Twin
//               </button>
//             </motion.div>
//           ) : (
//             <div className="space-y-6 sm:space-y-8">
//               {/* Digital Twin Cards */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
//                 {twins.map((twin) => (
//                   <motion.div
//                     key={twin._id}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="p-6 sm:p-8 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-sm border border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition"
//                   >
//                     <div className="flex items-start justify-between mb-4 sm:mb-6 gap-4">
//                       <div className="min-w-0 flex-1">
//                         <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{twin.identity.name}</h2>
//                         <p className="text-cyan-300 mt-1 text-sm sm:text-base truncate">{twin.identity.role}</p>
//                       </div>
//                       {/* Card-level action cluster. Edit and Delete sit
//                           side-by-side; clicking Edit routes back to the
//                           wizard which pre-fills from the existing twin
//                           via the digitalTwin context. */}
//                       <div className="flex items-center gap-1 flex-shrink-0">
//                         <button
//                           onClick={() => navigate('/wizard')}
//                           className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl transition"
//                           title="Edit this twin"
//                           aria-label="Edit digital twin"
//                         >
//                           <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
//                         </button>
//                         <button
//                           onClick={() => handleDelete()}
//                           className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
//                           title="Delete this twin"
//                           aria-label="Delete digital twin"
//                         >
//                           <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
//                         </button>
//                       </div>
//                     </div>
                    
//                     <p className="text-slate-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base line-clamp-3">{twin.identity.bio}</p>
                    
//                     <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
//                       <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400">
//                         <span className="flex items-center gap-1">
//                           <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-teal-400" />
//                           <span className="text-teal-300">Active</span>
//                         </span>
//                         <span className="hidden xs:inline">Updated {new Date(twin.lastUpdated).toLocaleDateString()}</span>
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-between flex-wrap gap-4">
//                       <div className="flex flex-col items-center">
//                         <div className="p-2 bg-white rounded-lg sm:rounded-xl">
//                           <QRCode
//                             id={`qr-${twin._id}`}
//                             value={twinPublicUrl(twin._id)}
//                             size={80}
//                             className="sm:w-[100px] sm:h-[100px]"
//                           />
//                         </div>
//                         <button
//                           onClick={() => downloadQR(twin._id)}
//                           className="mt-2 sm:mt-3 text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm font-medium flex items-center gap-1"
//                         >
//                           <Download className="w-3 h-3" />
//                           Download QR
//                         </button>
//                       </div>
//                       <Link
//                         to={`/chatbot/${twin._id}`}
//                         className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition font-medium text-sm sm:text-base"
//                       >
//                         <ExternalLink className="w-4 h-4" />
//                         View Live
//                       </Link>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>

//               {/* Leads Section */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-sm border border-cyan-500/20 overflow-hidden"
//               >
//                 <div className="p-4 sm:p-6 lg:p-8 border-b border-cyan-500/10">
//                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
//                     <div className="flex items-center gap-3 sm:gap-4">
//                       <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
//                         <Users className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
//                       </div>
//                       <div className="min-w-0">
//                         <h2 className="text-xl sm:text-2xl font-bold text-white">Lead Management</h2>
//                         <p className="text-slate-300 text-sm sm:text-base hidden sm:block">Track and manage your generated leads</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
//                       <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
//                       <select
//                         value={activeFilter}
//                         onChange={(e) => setActiveFilter(e.target.value)}
//                         className="flex-1 sm:flex-none bg-white/5 border border-cyan-500/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30"
//                       >
//                         <option value="all" className="bg-[#132F4C]">All Leads</option>
//                         <option value="new" className="bg-[#132F4C]">New</option>
//                         <option value="contacted" className="bg-[#132F4C]">Contacted</option>
//                         <option value="qualified" className="bg-[#132F4C]">Qualified</option>
//                         <option value="converted" className="bg-[#132F4C]">Converted</option>
//                       </select>
//                     </div>
//                   </div>

//                   {/* Status Overview */}
//                   <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
//                     {['new', 'contacted', 'qualified', 'converted'].map((status) => (
//                       <div
//                         key={status}
//                         className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition cursor-pointer flex-shrink-0 ${
//                           activeFilter === status
//                             ? 'bg-cyan-500/20 shadow-sm border-cyan-500/50 ring-2 ring-cyan-500/30'
//                             : 'border-cyan-500/10 hover:border-cyan-500/30 bg-white/5'
//                         }`}
//                         onClick={() => setActiveFilter(status)}
//                       >
//                         <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
//                           status === 'new' ? 'bg-cyan-400' :
//                           status === 'contacted' ? 'bg-teal-400' :
//                           status === 'qualified' ? 'bg-emerald-400' : 'bg-green-400'
//                         }`} />
//                         <span className="text-xs sm:text-sm font-medium capitalize text-white whitespace-nowrap">{status}</span>
//                         <span className="text-xs sm:text-sm text-slate-400">({getStatusCount(status)})</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Leads List */}
//                 <div className="p-4 sm:p-6 lg:p-8">
//                   {isLoadingLeads ? (
//                     <div className="flex justify-center items-center py-12">
//                       <div className="flex flex-col items-center gap-3">
//                         <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
//                         <div className="text-slate-300 text-sm sm:text-base">Loading leads...</div>
//                       </div>
//                     </div>
//                   ) : filteredLeads.length === 0 ? (
//                     <div className="text-center py-12">
//                       <Mail className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-600 mb-4" />
//                       <p className="text-slate-400 text-sm sm:text-base lg:text-lg px-4">
//                         {activeFilter === 'all'
//                           ? "No leads yet. Share your digital twin to start generating leads!"
//                           : `No ${activeFilter} leads found.`}
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="space-y-3 sm:space-y-4">
//                       {filteredLeads.map((lead, index) => (
//                         <motion.div
//                           key={lead._id}
//                           initial={{ opacity: 0, x: -20 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{ delay: index * 0.1 }}
//                           className="group p-4 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl border border-cyan-500/10 hover:border-cyan-500/30 hover:bg-white/10 transition"
//                         >
//                           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//                             <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
//                               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-cyan-500/20 flex-shrink-0 text-sm sm:text-base">
//                                 {(lead.name || "Unknown")
//                                   .split(' ')
//                                   .map(n => n[0])
//                                   .join('')
//                                   .toUpperCase()}
//                               </div>
//                               <div className="min-w-0 flex-1">
//                                 <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
//                                   <h3 className="font-semibold text-white text-sm sm:text-base lg:text-lg truncate">{lead.name}</h3>
//                                   <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(lead.status)}`}>
//                                     {lead.status}
//                                   </span>
//                                 </div>
//                                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-slate-300">
//                                   <span className="flex items-center gap-2 truncate">
//                                     <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
//                                     <span className="truncate">{lead.email}</span>
//                                   </span>
//                                   {lead.phone && (
//                                     <span className="flex items-center gap-2 truncate">
//                                       <Building className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
//                                       {lead.phone}
//                                     </span>
//                                   )}
//                                   <span className="flex items-center gap-2">
//                                     <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
//                                     {new Date(lead.createdAt).toLocaleDateString()}
//                                   </span>
//                                 </div>
//                                 {lead.message && (
//                                   <p className="text-slate-400 mt-2 sm:mt-3 line-clamp-2 text-xs sm:text-sm">{lead.message}</p>
//                                 )}
//                               </div>
//                             </div>
                            
//                             <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
//                               <select
//                                 value={lead.status}
//                                 onChange={async (e) => {
//                                   const newStatus = e.target.value;
//                                   await leadService.updateStatus(lead._id, newStatus);
//                                   setLeads((prev) =>
//                                     prev.map((l) =>
//                                       l._id === lead._id
//                                         ? { ...l, status: newStatus as Lead['status'] }
//                                         : l
//                                     )
//                                   );
//                                 }}
//                                 className="flex-1 sm:flex-none bg-white/5 border border-cyan-500/20 rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
//                               >
//                                 <option value="new" className="bg-[#132F4C]">New</option>
//                                 <option value="contacted" className="bg-[#132F4C]">Contacted</option>
//                                 <option value="qualified" className="bg-[#132F4C]">Qualified</option>
//                                 <option value="converted" className="bg-[#132F4C]">Converted</option>
//                               </select>
                              
//                               <button className="hidden lg:block opacity-0 group-hover:opacity-100 text-cyan-400 hover:text-cyan-300 font-medium transition text-sm whitespace-nowrap">
//                                 View Details
//                               </button>
//                             </div>
//                           </div>
//                         </motion.div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </motion.div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;


// ─────────────────────────────────────────────────────────────────────────
// Dashboard.tsx  —  LOGIC CONTAINER ("smart" component)
//
// This is a DROP-IN replacement for the previous Dashboard component. The
// default export name and the route it serves are unchanged, so nothing in
// your router needs to change.
//
// IMPORTANT: every hook, piece of state, effect, API call, handler, and the
// auth/refresh-token flow below is IDENTICAL in behavior to the original
// component. No business logic, API integration, state shape, or backend
// mapping has been modified. The ONLY change is that all of the rendering
// has been moved out into <DashboardView /> (DashboardView.tsx), and this
// container now feeds it real data + callbacks through props.
//
//   Dashboard.tsx  (this file)  → owns logic, state, side effects, APIs
//   DashboardView.tsx           → owns presentation only (no logic)
// ─────────────────────────────────────────────────────────────────────────





import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDigitalTwin } from '@/contexts/DigitalTwinContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authService, leadService, digitalTwinService } from '@/services/api.service';
import { IMAGE_BASE_URL } from '@/axios.config';
import { Skeleton } from '@/components/ui/skeleton';
import { SourcesPanel } from '@/components/SourcesPanel';
// Pencil = Edit Twin CTA shown when the user already owns a twin.
// Eye    = View Twin (public chatbot link).
import { Pencil, Eye } from 'lucide-react';

import DashboardView from '../components/DasboardUiView';
import type { DigitalTwin, Lead, UserProfile, StatusCounts } from '../types/Dashboard';
import { useBilling } from '@/features/billing/hooks/useBilling';
import UpgradeRequiredModal from '@/features/billing/components/UpgradeRequiredModal';

const Dashboard = () => {
  const { digitalTwin, isLoading, loadDigitalTwin, deleteTwin } = useDigitalTwin();
  const { logout, updateUser } = useAuth();
  const { toast } = useToast();
  // Imperative router push. Used by the Create/Edit CTAs to land the user on
  // the wizard (single-twin model — the wizard auto-detects create vs edit by
  // reading the digitalTwin from context).
  const navigate = useNavigate();

  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // Cache-buster bumped on every successful avatar upload so the <img>
  // element refetches even when the URL path is identical (the server usually
  // overwrites the same filename, so the browser would otherwise serve the
  // stale local copy from disk cache).
  const [avatarCacheKey, setAvatarCacheKey] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFetched = useRef(false);

  // Billing status drives the quota-exceeded upgrade modal. The hook does its
  // own initial fetch; we just consume the result.
  const { billingStatus } = useBilling();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Show the upgrade modal once per browser session when the owner has hit
  // their monthly message limit. The dismissal sticks across navigations
  // (sessionStorage) so we don't pester them on every Dashboard return.
  useEffect(() => {
    if (!billingStatus) return;
    const { messages } = billingStatus.usage;
    const limit = messages.limit;
    const hitLimit = limit !== -1 && limit > 0 && messages.used >= limit;
    if (!hitLimit) return;
    const dismissKey = `upgradeModalDismissed:${billingStatus.subscription.currentPeriodEnd || 'none'}`;
    if (sessionStorage.getItem(dismissKey)) return;
    setUpgradeModalOpen(true);
  }, [billingStatus]);

  const dismissUpgradeModal = () => {
    if (billingStatus) {
      const key = `upgradeModalDismissed:${billingStatus.subscription.currentPeriodEnd || 'none'}`;
      sessionStorage.setItem(key, '1');
    }
    setUpgradeModalOpen(false);
  };

  // Public URL used in the QR code and the "View Live" link.
  //   1. VITE_PUBLIC_APP_URL (deploy-time override, useful for previews)
  //   2. window.location.origin (matches the host the user is currently on —
  //      correct in dev, preview, and prod, and naturally https in prod)
  const publicAppOrigin =
    (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const twinPublicUrl = (id: string) => `${publicAppOrigin}/chatbot/${id}`;

  // Initial load.
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        await loadDigitalTwin();
        await fetchUserProfile();
      } catch (error: any) {
        toast({
          title: 'Load failed',
          description: error.message || 'Failed to load digital twin',
          variant: 'destructive',
        });
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDigitalTwin, toast]);

  // Single-twin sync. Mirror the single context object into a one-element
  // array so the existing list rendering stays intact, and (re)load leads.
  useEffect(() => {
    if (digitalTwin) {
      setTwins([digitalTwin]);
      fetchLeads(digitalTwin._id);
    } else {
      setTwins([]);
      setLeads([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digitalTwin]);

  // Listen for twin:saved (dispatched by the wizard on save and by the context
  // on delete) so the cached digitalTwin reloads from the server.
  useEffect(() => {
    const onTwinSaved = () => {
      loadDigitalTwin();
    };
    window.addEventListener('twin:saved', onTwinSaved);
    return () => window.removeEventListener('twin:saved', onTwinSaved);
  }, [loadDigitalTwin]);

  // "Twin ready" email trigger.
  //
  // The Node endpoint /api/digital-twin/ingestion-status is what actually
  // fires the welcome email (idempotent via twin.aiReadyEmailedAt). It only
  // sends when an authenticated caller hits it AND the AI backend has
  // flipped overall_status to "ready".
  //
  // The SuccessScreen polls it during the post-wizard view, but if the user
  // closes that tab before indexing finishes, nobody triggers it. So we
  // also poll here whenever the dashboard is open and the twin hasn't been
  // notified yet — this covers the "closed the wizard, came back later" case.
  useEffect(() => {
    if (!digitalTwin?._id) return;
    // @ts-expect-error — aiReadyEmailedAt is server-set, not on the TS type
    if (digitalTwin.aiReadyEmailedAt) return;

    let cancelled = false;
    const POLL_MS = 5000;
    const TIMEOUT_MS = 10 * 60 * 1000;
    const startedAt = Date.now();

    const tick = async () => {
      if (cancelled) return;
      try {
        const res = await digitalTwinService.ingestionStatus();
        if (res?.notice === 'sent' || res?.notice === 'previously-sent') {
          // Email is out (or was already out) — stop polling and refresh the
          // cached twin so aiReadyEmailedAt becomes visible.
          loadDigitalTwin();
          return;
        }
      } catch {
        // Transient — keep polling.
      }
      if (Date.now() - startedAt > TIMEOUT_MS) return;
      setTimeout(tick, POLL_MS);
    };
    tick();
    return () => { cancelled = true; };
  }, [digitalTwin?._id, loadDigitalTwin]);

  // GET /auth/profile responds with `{ success: true, user }`; defensively
  // unwrap so `userProfile` is always the actual user object.
  const fetchUserProfile = async () => {
    try {
      const userData = await authService.getProfile();
      const user = userData?.user ?? userData;
      setUserProfile(user);

      // Profile-picture nudge: if the user has no photo, show the upload modal
      // after a beat. Skip if the response was malformed so we don't spam.
      if (user && !user.profilePicture && !user.avatar) {
        setTimeout(() => setIsProfileModalOpen(true), 2000);
      }
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchLeads = async (twinId: string) => {
    setIsLoadingLeads(true);
    try {
      const leadsData = await leadService.getByTwinId(twinId);
      setLeads(leadsData.data || []);
    } catch (error: any) {
      toast({
        title: 'Failed to load leads',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLeads(false);
    }
  };

  // Profile picture upload. Client-side validations mirror the backend multer
  // limit so the user gets instant feedback instead of a confusing 413.
  const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

  const handleProfilePictureUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Unsupported file',
        description: 'Please choose an image file (JPG, PNG, WebP, or GIF).',
        variant: 'destructive',
      });
      return;
    }
    if (file.size === 0) {
      toast({
        title: 'Empty file',
        description: 'That file appears to be empty. Try a different image.',
        variant: 'destructive',
      });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      toast({
        title: 'File too large',
        description: `Profile pictures must be 5 MB or less — yours is ${mb} MB.`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await authService.updateProfilePicture(file);
      const updatedUser = result?.user ?? result;
      setUserProfile(updatedUser);
      // Bump cache key so the <img> with the new src refetches from server even
      // when the path is unchanged (server may have overwritten the same file).
      setAvatarCacheKey(Date.now());
      // Persist the new picture URL into AuthContext + localStorage so a
      // page refresh hydrates with the new image immediately instead of
      // re-requesting the previous one (which may now 404 because the
      // backend deletes the old file on replace).
      if (updatedUser?.profilePicture !== undefined) {
        updateUser({
          profilePicture: updatedUser.profilePicture,
          avatar: updatedUser.avatar,
        });
      }

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully.',
      });

      setIsProfileModalOpen(false);
    } catch (error: any) {
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message;
      const description =
        status === 413
          ? 'The server rejected the file as too large. Try an image under 5 MB.'
          : serverMsg || error?.message || 'Failed to upload profile picture';
      toast({
        title: 'Upload failed',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Clearing the input restores retry behavior when the user re-picks the same
  // file after a failed upload.
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleProfilePictureUpload(file);
    }
    event.target.value = '';
  };

  const downloadQR = useCallback((id: string) => {
    const svg = document.getElementById(`qr-${id}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `digital-twin-qr-${id}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  }, []);

  // Single-twin delete. Context's deleteTwin nulls the cached digitalTwin AND
  // dispatches twin:saved so any other surface refreshes its create-vs-edit
  // decision.
  const handleDelete = useCallback(async () => {
    try {
      await deleteTwin();
      setTwins([]);
      setLeads([]);
      toast({
        title: 'Success',
        description: 'Your net twin has been deleted successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete net twin.',
        variant: 'destructive',
      });
    }
  }, [deleteTwin, toast]);

  // AuthContext's logout revokes the refresh token server-side, clears
  // localStorage, dispatches the logout toast, then we route to /login.
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Update a single lead's status. Same flow as before: call the service, then
  // optimistically patch local state so the UI reflects the change instantly.
  const handleLeadStatusChange = async (leadId: string, newStatus: string) => {
    await leadService.updateStatus(leadId, newStatus);
    setLeads((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, status: newStatus as Lead['status'] } : l)),
    );
  };

  // Build the avatar src for an <img> tag.
  //   • server-uploaded profilePicture → prefix IMAGE_BASE_URL + cache-bust
  //   • OAuth `avatar` (absolute URL)  → use as-is
  //   • otherwise                       → null (caller renders initials)
  const getAvatarSrc = (): string | null => {
    if (!userProfile) return null;
    if (userProfile.profilePicture) {
      const sep = userProfile.profilePicture.includes('?') ? '&' : '?';
      return `${IMAGE_BASE_URL}${userProfile.profilePicture}${sep}v=${avatarCacheKey}`;
    }
    if (userProfile.avatar) {
      return /^https?:\/\//i.test(userProfile.avatar)
        ? userProfile.avatar
        : `${IMAGE_BASE_URL}${userProfile.avatar}`;
    }
    return null;
  };

  const getStatusCount = (status: string) => leads.filter((lead) => lead.status === status).length;

  // Derived data passed to the view.
  const filteredLeads = leads.filter((lead) => {
    if (activeFilter === 'all') return true;
    return lead.status === activeFilter;
  });

  const statusCounts: StatusCounts = {
    all: leads.length,
    new: getStatusCount('new'),
    contacted: getStatusCount('contacted'),
    qualified: getStatusCount('qualified'),
    converted: getStatusCount('converted'),
  };

  const avatarSrc = getAvatarSrc();

  return (
    <>
    {billingStatus && (
      <UpgradeRequiredModal
        open={upgradeModalOpen}
        onClose={dismissUpgradeModal}
        planName={billingStatus.plan.name}
        used={billingStatus.usage.messages.used}
        limit={billingStatus.usage.messages.limit}
        periodEnd={billingStatus.subscription.currentPeriodEnd}
      />
    )}
    <DashboardView
      // loading
      isLoading={isLoading}
      isLoadingLeads={isLoadingLeads}
      isUploading={isUploading}
      // data
      digitalTwin={digitalTwin}
      twins={twins}
      leads={leads}
      filteredLeads={filteredLeads}
      statusCounts={statusCounts}
      userProfile={userProfile}
      avatarSrc={avatarSrc}
      // ui state
      activeFilter={activeFilter}
      userMenuOpen={userMenuOpen}
      mobileMenuOpen={mobileMenuOpen}
      isProfileModalOpen={isProfileModalOpen}
      // ref
      fileInputRef={fileInputRef}
      // helpers
      twinPublicUrl={twinPublicUrl}
      // handlers
      onToggleUserMenu={() => setUserMenuOpen((o) => !o)}
      onCloseUserMenu={() => setUserMenuOpen(false)}
      onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)}
      onCloseMobileMenu={() => setMobileMenuOpen(false)}
      onOpenProfileModal={() => setIsProfileModalOpen(true)}
      onCloseProfileModal={() => setIsProfileModalOpen(false)}
      onUpdatePhoto={() => {
        setUserMenuOpen(false);
        setIsProfileModalOpen(true);
      }}
      onChoosePhoto={() => fileInputRef.current?.click()}
      onFileSelect={handleFileSelect}
      onSelectFilter={(filter) => setActiveFilter(filter)}
      onCreateTwin={() => navigate('/wizard')}
      onEditTwin={() => navigate('/wizard')}
      onDeleteTwin={handleDelete}
      onDownloadQR={downloadQR}
      onLeadStatusChange={handleLeadStatusChange}
      onLogout={handleLogout}
      // TODO: wire to your help/docs route or an explainer modal when ready.
      onLearnMore={() => { /* placeholder — no destructive action */ }}
    />
    </>
  );
};

export default Dashboard;
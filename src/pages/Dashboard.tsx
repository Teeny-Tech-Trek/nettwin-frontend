// import { Bot, Plus, Download, ExternalLink, LogOut, Sparkles, Zap, TrendingUp, Trash2, Users, Mail, Building, Calendar, Filter, User, FileText, Briefcase, Camera } from "lucide-react";
// import { Link } from "react-router-dom";
// import { useState, useEffect, useCallback, useRef } from "react";
// import QRCode from "react-qr-code";
// import { motion, AnimatePresence } from "framer-motion";
// import { useDigitalTwin } from "@/contexts/DigitalTwinContext";
// import { useToast } from "@/hooks/use-toast";

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

// const Dashboard = () => {
//   const { digitalTwin, isLoading, loadDigitalTwin, deleteTwin } = useDigitalTwin();
//   const { toast } = useToast();
//   const [twins, setTwins] = useState<DigitalTwin[]>([]);
//   const [leads, setLeads] = useState<Lead[]>([]);
//   const [isLoadingLeads, setIsLoadingLeads] = useState(false);
//   const [activeFilter, setActiveFilter] = useState<string>('all');
//   const [userMenuOpen, setUserMenuOpen] = useState(false);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const hasFetched = useRef(false);

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

//   // Sync context digitalTwin to state and fetch leads when twin is available
//   useEffect(() => {
//     if (digitalTwin) {
//       setTwins([digitalTwin]);
//       fetchLeads(digitalTwin._id);
//     }
//   }, [digitalTwin]);

//   const fetchUserProfile = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('https://api.digitaltwin.techtrekkers.ai/api/auth/profile', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) throw new Error('Failed to fetch user profile');

//       const userData = await response.json();
//       setUserProfile(userData);

//       // Show profile picture modal if user doesn't have one
//       if (!userData.profilePicture && !userData.avatar) {
//         setTimeout(() => {
//           setIsProfileModalOpen(true);
//         }, 2000);
//       }
//     } catch (error: any) {
//       console.error('Failed to fetch user profile:', error);
//     }
//   };

//   const fetchLeads = async (twinId: string) => {
//     setIsLoadingLeads(true);
//     try {
//       const response = await fetch(`https://api.digitaltwin.techtrekkers.ai/api/leads/${twinId}`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//       });

//       if (!response.ok) throw new Error('Failed to fetch leads');

//       const leadsData = await response.json();
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

//   const handleProfilePictureUpload = async (file: File) => {
//     setIsUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append('profilePicture', file);

//       const token = localStorage.getItem('token');
//       const response = await fetch('https://api.digitaltwin.techtrekkers.ai/api/auth/profile/picture', {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       if (!response.ok) throw new Error('Failed to upload profile picture');

//       const result = await response.json();
//       setUserProfile(result.user);
      
//       toast({
//         title: "Success",
//         description: "Profile picture updated successfully",
//       });

//       setIsProfileModalOpen(false);
//     } catch (error: any) {
//       toast({
//         title: "Upload failed",
//         description: error.message || "Failed to upload profile picture",
//         variant: "destructive",
//       });
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       handleProfilePictureUpload(file);
//     }
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

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     window.location.href = '/login';
//   };

//   const getInitials = (name: string) => {
//     return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
//           <div className="text-lg text-slate-600 font-medium">Loading your dashboard...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
//       {/* Profile Picture Modal */}
//       <AnimatePresence>
//         {isProfileModalOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl"
//             >
//               <div className="text-center">
//                 <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Camera className="w-8 h-8 text-primary" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-slate-800 mb-2">Add Profile Picture</h3>
//                 <p className="text-slate-600 mb-6">
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
//                   className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
//                 >
//                   {isUploading ? "Uploading..." : "Choose Photo"}
//                 </button>
                
//                 <button
//                   onClick={() => setIsProfileModalOpen(false)}
//                   disabled={isUploading}
//                   className="w-full text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50 transition"
//                 >
//                   Skip for now
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Header */}
//       <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/20">
//         <div className="max-w-7xl mx-auto px-8 py-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
//                 <Bot className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-slate-800">DigitalTwin</h1>
//                 <p className="text-sm text-slate-500">Professional AI Assistant</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-6">
//               {/* Navigation */}
//               <nav className="hidden md:flex items-center gap-6">
//                 <div className="flex items-center gap-2 text-slate-400 font-medium">
//                   <FileText className="w-4 h-4" />
//                   <span className="text-slate-400">Resume</span>
//                   <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">Soon</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-slate-400 font-medium">
//                   <Briefcase className="w-4 h-4" />
//                   <span className="text-slate-400">Portfolio</span>
//                   <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">Soon</span>
//                 </div>
//                 <Link to="/dashboard" className="text-primary font-semibold border-b-2 border-primary">
//                   Dashboard
//                 </Link>
//               </nav>

//               {/* User Menu */}
//               <div className="relative">
//                 <button
//                   onClick={() => setUserMenuOpen(!userMenuOpen)}
//                   className="flex items-center gap-3 p-2 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 transition"
//                 >
//                   {userProfile?.profilePicture || userProfile?.avatar ? (
//                    <img
//   src={
//     userProfile.profilePicture
//       ? `https://api.digitaltwin.techtrekkers.ai${userProfile.profilePicture}`
//       : userProfile.avatar
//   }
//   alt={userProfile.name}
//   className="w-8 h-8 rounded-full object-cover"
// />

//                   ) : (
//                     <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-semibold text-sm">
//                       {userProfile ? getInitials(userProfile.name) : 'U'}
//                     </div>
//                   )}
//                   <div className="hidden sm:block text-left">
//                     <div className="text-sm font-medium text-slate-800">
//                       {userProfile?.name || 'Loading...'}
//                     </div>
//                     <div className="text-xs text-slate-500">Premium Plan</div>
//                   </div>
//                 </button>

//                 <AnimatePresence>
//                   {userMenuOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                       className="absolute right-0 top-full mt-2 w-64 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden z-50"
//                     >
//                       <div className="p-4 border-b border-white/20">
//                         <div className="text-sm font-semibold text-slate-800">{userProfile?.email}</div>
//                         <div className="text-xs text-slate-500">Professional Plan</div>
//                       </div>
//                       <div className="p-2">
//                         <button 
//                           onClick={() => {
//                             setUserMenuOpen(false);
//                             setIsProfileModalOpen(true);
//                           }}
//                           className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-600 hover:bg-white/50 transition"
//                         >
//                           <Camera className="w-4 h-4" />
//                           Update Photo
//                         </button>
//                         <button className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-600 hover:bg-white/50 transition">
//                           <User className="w-4 h-4" />
//                           Profile Settings
//                         </button>
//                       </div>
//                       <div className="p-2 border-t border-white/20">
//                         <button 
//                           onClick={handleLogout}
//                           className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50/50 transition"
//                         >
//                           <LogOut className="w-4 h-4" />
//                           Sign Out
//                         </button>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="p-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Hero Section */}
//           <div className="text-center mb-12">
//             <motion.h1 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-4xl md:text-5xl font-bold text-slate-800 mb-4"
//             >
//               Your Digital Presence,
//               <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"> Reimagined</span>
//             </motion.h1>
//             <motion.p 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="text-xl text-slate-600 max-w-2xl mx-auto"
//             >
//               Manage your AI digital twins, track leads, and showcase your professional portfolio in one place.
//             </motion.p>
//           </div>

//           {/* Quick Actions */}
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
//           >
//             <Link
//               to="/resume"
//               className="group p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm hover:shadow-md hover:bg-white/90 transition"
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
//                   <FileText className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div className="text-left">
//                   <h3 className="font-semibold text-slate-800">Smart Resume</h3>
//                   <p className="text-sm text-slate-600">AI-powered resume builder</p>
//                 </div>
//               </div>
//             </Link>

//             <Link
//               to="/portfolio"
//               className="group p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm hover:shadow-md hover:bg-white/90 transition"
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
//                   <Briefcase className="w-6 h-6 text-purple-600" />
//                 </div>
//                 <div className="text-left">
//                   <h3 className="font-semibold text-slate-800">Portfolio</h3>
//                   <p className="text-sm text-slate-600">Showcase your work</p>
//                 </div>
//               </div>
//             </Link>

//             <Link
//               to="/wizard"
//               className="group p-6 bg-gradient-to-br from-primary to-primary/70 rounded-2xl border border-primary/20 shadow-sm hover:shadow-lg hover:scale-[1.02] transition"
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
//                   <Plus className="w-6 h-6 text-white" />
//                 </div>
//                 <div className="text-left">
//                   <h3 className="font-semibold text-white">New Digital Twin</h3>
//                   <p className="text-sm text-white/90">Create AI assistant</p>
//                 </div>
//               </div>
//             </Link>
//           </motion.div>

//           {twins.length === 0 ? (
//             <motion.div 
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20"
//             >
//               <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary/60" />
//               <h3 className="text-2xl font-bold text-slate-800 mb-4">No Digital Twin Yet</h3>
//               <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
//                 Create your first digital twin to start generating leads and engaging with your audience 24/7.
//               </p>
//               <Link
//                 to="/wizard"
//                 className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl hover:bg-primary/90 transition font-semibold shadow-lg hover:shadow-xl"
//               >
//                 <Plus className="w-5 h-5" />
//                 Create Your First Twin
//               </Link>
//             </motion.div>
//           ) : (
//             <div className="space-y-8">
//               {/* Digital Twin Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 {twins.map((twin) => (
//                   <motion.div
//                     key={twin._id}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 hover:shadow-md transition"
//                   >
//                     <div className="flex items-center justify-between mb-6">
//                       <div>
//                         <h2 className="text-2xl font-bold text-slate-800">{twin.identity.name}</h2>
//                         <p className="text-slate-600 mt-1">{twin.identity.role}</p>
//                       </div>
//                       <button
//                         onClick={handleDelete}
//                         className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition"
//                       >
//                         <Trash2 className="w-5 h-5" />
//                       </button>
//                     </div>
                    
//                     <p className="text-slate-700 leading-relaxed mb-6">{twin.identity.bio}</p>
                    
//                     <div className="flex items-center justify-between mb-6">
//                       <div className="flex items-center gap-4 text-sm text-slate-500">
//                         <span className="flex items-center gap-1">
//                           <Zap className="w-4 h-4 text-green-500" />
//                           Active
//                         </span>
//                         <span>Updated {new Date(twin.lastUpdated).toLocaleDateString()}</span>
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div className="flex flex-col items-center">
//                         <QRCode 
//                           id={`qr-${twin._id}`} 
//                           value={`https://digitaltwin.techtrekkers.ai/chatbot/${twin._id}`} 
//                           size={100} 
//                         />
//                         <button
//                           onClick={() => downloadQR(twin._id)}
//                           className="mt-3 text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
//                         >
//                           <Download className="w-3 h-3" />
//                           Download QR
//                         </button>
//                       </div>
//                       <Link
//                         to={`/chatbot/${twin._id}`}
//                         className="flex items-center gap-2 text-slate-600 hover:text-primary transition font-medium"
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
//                 className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 overflow-hidden"
//               >
//                 <div className="p-8 border-b border-white/20">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
//                         <Users className="w-6 h-6 text-primary" />
//                       </div>
//                       <div>
//                         <h2 className="text-2xl font-bold text-slate-800">Lead Management</h2>
//                         <p className="text-slate-600">Track and manage your generated leads</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <Filter className="w-4 h-4 text-slate-500" />
//                       <select
//                         value={activeFilter}
//                         onChange={(e) => setActiveFilter(e.target.value)}
//                         className="bg-white/50 border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
//                       >
//                         <option value="all">All Leads</option>
//                         <option value="new">New</option>
//                         <option value="contacted">Contacted</option>
//                         <option value="qualified">Qualified</option>
//                         <option value="converted">Converted</option>
//                       </select>
//                     </div>
//                   </div>

//                   {/* Status Overview */}
//                   <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
//                     {['new', 'contacted', 'qualified', 'converted'].map((status) => (
//                       <div
//                         key={status}
//                         className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition cursor-pointer flex-shrink-0 ${
//                           activeFilter === status
//                             ? 'bg-white shadow-sm border-primary/30 ring-2 ring-primary/20'
//                             : 'border-white/30 hover:border-white/50 bg-white/30'
//                         }`}
//                         onClick={() => setActiveFilter(status)}
//                       >
//                         <div className={`w-3 h-3 rounded-full ${
//                           status === 'new' ? 'bg-blue-500' :
//                           status === 'contacted' ? 'bg-purple-500' :
//                           status === 'qualified' ? 'bg-green-500' : 'bg-emerald-500'
//                         }`} />
//                         <span className="text-sm font-medium capitalize text-slate-700">{status}</span>
//                         <span className="text-sm text-slate-500">({getStatusCount(status)})</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Leads List */}
//                 <div className="p-8">
//                   {isLoadingLeads ? (
//                     <div className="flex justify-center items-center py-12">
//                       <div className="flex flex-col items-center gap-3">
//                         <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
//                         <div className="text-slate-600">Loading leads...</div>
//                       </div>
//                     </div>
//                   ) : filteredLeads.length === 0 ? (
//                     <div className="text-center py-12">
//                       <Mail className="w-16 h-16 mx-auto text-slate-300 mb-4" />
//                       <p className="text-slate-500 text-lg">
//                         {activeFilter === 'all'
//                           ? "No leads yet. Share your digital twin to start generating leads!"
//                           : `No ${activeFilter} leads found.`}
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       {filteredLeads.map((lead, index) => (
//                         <motion.div
//                           key={lead._id}
//                           initial={{ opacity: 0, x: -20 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{ delay: index * 0.1 }}
//                           className="group p-6 bg-white/50 rounded-2xl border border-white/30 hover:border-white/50 hover:bg-white/70 transition"
//                         >
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-4">
//                               <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-white font-semibold">
//                                 {(lead.name || "Unknown")
//                                   .split(' ')
//                                   .map(n => n[0])
//                                   .join('')
//                                   .toUpperCase()}
//                               </div>
//                               <div>
//                                 <div className="flex items-center gap-3 mb-2">
//                                   <h3 className="font-semibold text-slate-800 text-lg">{lead.name}</h3>
//                                   <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
//                                     {lead.status}
//                                   </span>
//                                 </div>
//                                 <div className="flex items-center gap-6 text-sm text-slate-600">
//                                   <span className="flex items-center gap-2">
//                                     <Mail className="w-4 h-4" />
//                                     {lead.email}
//                                   </span>
//                                   {lead.phone && (
//                                     <span className="flex items-center gap-2">
//                                       <Building className="w-4 h-4" />
//                                       {lead.phone}
//                                     </span>
//                                   )}
//                                   <span className="flex items-center gap-2">
//                                     <Calendar className="w-4 h-4" />
//                                     {new Date(lead.createdAt).toLocaleDateString()}
//                                   </span>
//                                 </div>
//                                 {lead.message && (
//                                   <p className="text-slate-700 mt-3 line-clamp-2">{lead.message}</p>
//                                 )}
//                               </div>
//                             </div>
                            
//                             <div className="flex items-center gap-4">
//                               <select
//                                 value={lead.status}
//                                 onChange={async (e) => {
//                                   const newStatus = e.target.value;
//                                   await fetch(`https://api.digitaltwin.techtrekkers.ai/api/leads/${lead._id}/status`, {
//                                     method: 'PATCH',
//                                     headers: {
//                                       'Content-Type': 'application/json',
//                                       'Authorization': `Bearer ${localStorage.getItem('token')}`,
//                                     },
//                                     body: JSON.stringify({ status: newStatus }),
//                                   });
//                                   setLeads((prev) =>
//                                     prev.map((l) =>
//                                       l._id === lead._id
//                                         ? { ...l, status: newStatus as Lead['status'] }
//                                         : l
//                                     )
//                                   );
//                                 }}
//                                 className="bg-white border border-white/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
//                               >
//                                 <option value="new">New</option>
//                                 <option value="contacted">Contacted</option>
//                                 <option value="qualified">Qualified</option>
//                                 <option value="converted">Converted</option>
//                               </select>
                              
//                               <button className="opacity-0 group-hover:opacity-100 text-primary hover:text-primary/80 font-medium transition">
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

// import { Bot, Plus, Download, ExternalLink, LogOut, Sparkles, Zap, Trash2, Users, Mail, Building, Calendar, Filter, User, FileText, Briefcase, Camera } from "lucide-react";
// import { Link } from "react-router-dom";
// import { useState, useEffect, useCallback, useRef } from "react";
// import QRCode from "react-qr-code";
// import { motion, AnimatePresence } from "framer-motion";
// import { useDigitalTwin } from "@/contexts/DigitalTwinContext";
// import { useToast } from "@/hooks/use-toast";
// import { authService, leadService } from '@/services/api.service';
// import { IMAGE_BASE_URL } from '@/axios.config';
// import logoImg from "@/Images/ChatGPT_Image_Nov_13__2025__08_06_06_PM-removebg-preview.png"


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
//   const { toast } = useToast();
//   const [twins, setTwins] = useState<DigitalTwin[]>([]);
//   const [leads, setLeads] = useState<Lead[]>([]);
//   const [isLoadingLeads, setIsLoadingLeads] = useState(false);
//   const [activeFilter, setActiveFilter] = useState<string>('all');
//   const [userMenuOpen, setUserMenuOpen] = useState(false);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const hasFetched = useRef(false);

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

//   // Sync context digitalTwin to state and fetch leads when twin is available
//   useEffect(() => {
//     if (digitalTwin) {
//       setTwins([digitalTwin]);
//       fetchLeads(digitalTwin._id);
//     }
//   }, [digitalTwin]);

//   const fetchUserProfile = async () => {
//     try {
//       const userData = await authService.getProfile();
//       setUserProfile(userData);

//       // Show profile picture modal if user doesn't have one
//       if (!userData.profilePicture && !userData.avatar) {
//         setTimeout(() => {
//           setIsProfileModalOpen(true);
//         }, 2000);
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

//   const handleProfilePictureUpload = async (file: File) => {
//     setIsUploading(true);
//     try {
//       const result = await authService.updateProfilePicture(file);
//       setUserProfile(result.user);
      
//       toast({
//         title: "Success",
//         description: "Profile picture updated successfully",
//       });

//       setIsProfileModalOpen(false);
//     } catch (error: any) {
//       toast({
//         title: "Upload failed",
//         description: error.message || "Failed to upload profile picture",
//         variant: "destructive",
//       });
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       handleProfilePictureUpload(file);
//     }
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

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     window.location.href = '/login';
//   };

//   const getInitials = (name: string) => {
//     return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
//           <div className="text-lg text-slate-600 font-medium">Loading your dashboard...</div>
//         </div>
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
//               className="bg-[#132F4C] rounded-3xl p-8 max-w-md w-full shadow-xl border border-cyan-500/20"
//             >
//               <div className="text-center">
//                 <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Camera className="w-8 h-8 text-cyan-400" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-white mb-2">Add Profile Picture</h3>
//                 <p className="text-slate-300 mb-6">
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
//                   className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 text-white py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3 shadow-lg shadow-cyan-500/20"
//                 >
//                   {isUploading ? "Uploading..." : "Choose Photo"}
//                 </button>
                
//                 <button
//                   onClick={() => setIsProfileModalOpen(false)}
//                   disabled={isUploading}
//                   className="w-full text-slate-300 py-3 rounded-xl font-medium hover:bg-white/5 transition border border-white/10"
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
//         <div className="max-w-7xl mx-auto px-8 py-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10  rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
//                 <img src={logoImg} alt="logo" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-white">DigitalTwin</h1>
//                 <p className="text-sm text-cyan-300">Professional AI Assistant</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-6">
//               {/* Navigation */}
//               <nav className="hidden md:flex items-center gap-6">
//                 <div className="flex items-center gap-2 text-slate-400 font-medium">
//                   <FileText className="w-4 h-4" />
//                   <span className="text-slate-400">Resume</span>
//                   <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full border border-cyan-500/30">Soon</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-slate-400 font-medium">
//                   <Briefcase className="w-4 h-4" />
//                   <span className="text-slate-400">Portfolio</span>
//                   <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-1 rounded-full border border-teal-500/30">Soon</span>
//                 </div>
//                 <Link to="/dashboard" className="text-cyan-400 font-semibold border-b-2 border-cyan-400">
//                   Dashboard
//                 </Link>
//               </nav>

//               {/* User Menu */}
//               <div className="relative">
//                 <button
//                   onClick={() => setUserMenuOpen(!userMenuOpen)}
//                   className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:bg-white/10 hover:border-cyan-500/30 transition"
//                 >
//                   {userProfile?.profilePicture || userProfile?.avatar ? (
//                     <img
//                       src={
//                         userProfile.profilePicture
//                           ? `${IMAGE_BASE_URL}${userProfile.profilePicture}`
//                           : `${IMAGE_BASE_URL}${userProfile.avatar}`
//                       }
//                       alt={userProfile.name}
//                       className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/30"
//                     />
//                   ) : (
//                     <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-cyan-500/20">
//                       {userProfile ? getInitials(userProfile.name) : 'U'}
//                     </div>
//                   )}
//                   <div className="hidden sm:block text-left">
//                     <div className="text-sm font-medium text-white">
//                       {userProfile?.name || 'Loading...'}
//                     </div>
//                     <div className="text-xs text-cyan-300">Premium Plan</div>
//                   </div>
//                 </button>

//                 <AnimatePresence>
//                   {userMenuOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                       className="absolute right-0 top-full mt-2 w-64 bg-[#132F4C] backdrop-blur-xl rounded-2xl shadow-xl border border-cyan-500/20 overflow-hidden z-50"
//                     >
//                       <div className="p-4 border-b border-cyan-500/10">
//                         <div className="text-sm font-semibold text-white">{userProfile?.email}</div>
//                         <div className="text-xs text-cyan-300">Professional Plan</div>
//                       </div>
//                       <div className="p-2">
//                         <button 
//                           onClick={() => {
//                             setUserMenuOpen(false);
//                             setIsProfileModalOpen(true);
//                           }}
//                           className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition"
//                         >
//                           <Camera className="w-4 h-4" />
//                           Update Photo
//                         </button>
//                         <button className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition">
//                           <User className="w-4 h-4" />
//                           Profile Settings
//                         </button>
//                       </div>
//                       <div className="p-2 border-t border-cyan-500/10">
//                         <button 
//                           onClick={handleLogout}
//                           className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
//                         >
//                           <LogOut className="w-4 h-4" />
//                           Sign Out
//                         </button>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="p-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Hero Section */}
//           <div className="text-center mb-12">
//             <motion.h1 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-4xl md:text-5xl font-bold text-white mb-4"
//             >
//               Your Digital Presence,
//               <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent"> Reimagined</span>
//             </motion.h1>
//             <motion.p 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="text-xl text-slate-300 max-w-2xl mx-auto"
//             >
//               Manage your AI digital twins, track leads, and showcase your professional portfolio in one place.
//             </motion.p>
//           </div>

//           {/* Quick Actions */}
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
//           >
//             <Link
//               to="/resume"
//               className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-cyan-500/20 shadow-sm hover:shadow-lg hover:shadow-cyan-500/10 hover:bg-white/10 hover:border-cyan-500/30 transition"
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/20 transition">
//                   <FileText className="w-6 h-6 text-cyan-400" />
//                 </div>
//                 <div className="text-left">
//                   <h3 className="font-semibold text-white">Smart Resume</h3>
//                   <p className="text-sm text-slate-400">AI-powered resume builder</p>
//                 </div>
//               </div>
//             </Link>

//             <Link
//               to="/portfolio"
//               className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-teal-500/20 shadow-sm hover:shadow-lg hover:shadow-teal-500/10 hover:bg-white/10 hover:border-teal-500/30 transition"
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-500/20 transition">
//                   <Briefcase className="w-6 h-6 text-teal-400" />
//                 </div>
//                 <div className="text-left">
//                   <h3 className="font-semibold text-white">Portfolio</h3>
//                   <p className="text-sm text-slate-400">Showcase your work</p>
//                 </div>
//               </div>
//             </Link>

//             <Link
//               to="/wizard"
//               className="group p-6 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-2xl border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] transition"
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
//                   <Plus className="w-6 h-6 text-white" />
//                 </div>
//                 <div className="text-left">
//                   <h3 className="font-semibold text-white">New Digital Twin</h3>
//                   <p className="text-sm text-white/90">Create AI assistant</p>
//                 </div>
//               </div>
//             </Link>
//           </motion.div>

//           {twins.length === 0 ? (
//             <motion.div 
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-3xl shadow-sm border border-cyan-500/20"
//             >
//               <Sparkles className="w-16 h-16 mx-auto mb-6 text-cyan-400" />
//               <h3 className="text-2xl font-bold text-white mb-4">No Digital Twin Yet</h3>
//               <p className="text-slate-300 text-lg mb-8 max-w-md mx-auto">
//                 Create your first digital twin to start generating leads and engaging with your audience 24/7.
//               </p>
//               <Link
//                 to="/wizard"
//                 className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-teal-400 text-white px-8 py-4 rounded-2xl hover:from-cyan-600 hover:to-teal-500 transition font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30"
//               >
//                 <Plus className="w-5 h-5" />
//                 Create Your First Twin
//               </Link>
//             </motion.div>
//           ) : (
//             <div className="space-y-8">
//               {/* Digital Twin Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 {twins.map((twin) => (
//                   <motion.div
//                     key={twin._id}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl shadow-sm border border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition"
//                   >
//                     <div className="flex items-center justify-between mb-6">
//                       <div>
//                         <h2 className="text-2xl font-bold text-white">{twin.identity.name}</h2>
//                         <p className="text-cyan-300 mt-1">{twin.identity.role}</p>
//                       </div>
//                       <button
//                         onClick={handleDelete}
//                         className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
//                       >
//                         <Trash2 className="w-5 h-5" />
//                       </button>
//                     </div>
                    
//                     <p className="text-slate-300 leading-relaxed mb-6">{twin.identity.bio}</p>
                    
//                     <div className="flex items-center justify-between mb-6">
//                       <div className="flex items-center gap-4 text-sm text-slate-400">
//                         <span className="flex items-center gap-1">
//                           <Zap className="w-4 h-4 text-teal-400" />
//                           <span className="text-teal-300">Active</span>
//                         </span>
//                         <span>Updated {new Date(twin.lastUpdated).toLocaleDateString()}</span>
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div className="flex flex-col items-center">
//                         <div className="p-2 bg-white rounded-xl">
//                           <QRCode 
//                             id={`qr-${twin._id}`} 
//                             value={`https://digitaltwin.techtrekkers.ai/chatbot/${twin._id}`} 
//                             size={100} 
//                           />
//                         </div>
//                         <button
//                           onClick={() => downloadQR(twin._id)}
//                           className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1"
//                         >
//                           <Download className="w-3 h-3" />
//                           Download QR
//                         </button>
//                       </div>
//                       <Link
//                         to={`/chatbot/${twin._id}`}
//                         className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition font-medium"
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
//                 className="bg-white/5 backdrop-blur-sm rounded-3xl shadow-sm border border-cyan-500/20 overflow-hidden"
//               >
//                 <div className="p-8 border-b border-cyan-500/10">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
//                         <Users className="w-6 h-6 text-cyan-400" />
//                       </div>
//                       <div>
//                         <h2 className="text-2xl font-bold text-white">Lead Management</h2>
//                         <p className="text-slate-300">Track and manage your generated leads</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <Filter className="w-4 h-4 text-slate-400" />
//                       <select
//                         value={activeFilter}
//                         onChange={(e) => setActiveFilter(e.target.value)}
//                         className="bg-white/5 border border-cyan-500/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30"
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
//                   <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
//                     {['new', 'contacted', 'qualified', 'converted'].map((status) => (
//                       <div
//                         key={status}
//                         className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition cursor-pointer flex-shrink-0 ${
//                           activeFilter === status
//                             ? 'bg-cyan-500/20 shadow-sm border-cyan-500/50 ring-2 ring-cyan-500/30'
//                             : 'border-cyan-500/10 hover:border-cyan-500/30 bg-white/5'
//                         }`}
//                         onClick={() => setActiveFilter(status)}
//                       >
//                         <div className={`w-3 h-3 rounded-full ${
//                           status === 'new' ? 'bg-cyan-400' :
//                           status === 'contacted' ? 'bg-teal-400' :
//                           status === 'qualified' ? 'bg-emerald-400' : 'bg-green-400'
//                         }`} />
//                         <span className="text-sm font-medium capitalize text-white">{status}</span>
//                         <span className="text-sm text-slate-400">({getStatusCount(status)})</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Leads List */}
//                 <div className="p-8">
//                   {isLoadingLeads ? (
//                     <div className="flex justify-center items-center py-12">
//                       <div className="flex flex-col items-center gap-3">
//                         <div className="w-8 h-8 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
//                         <div className="text-slate-300">Loading leads...</div>
//                       </div>
//                     </div>
//                   ) : filteredLeads.length === 0 ? (
//                     <div className="text-center py-12">
//                       <Mail className="w-16 h-16 mx-auto text-slate-600 mb-4" />
//                       <p className="text-slate-400 text-lg">
//                         {activeFilter === 'all'
//                           ? "No leads yet. Share your digital twin to start generating leads!"
//                           : `No ${activeFilter} leads found.`}
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       {filteredLeads.map((lead, index) => (
//                         <motion.div
//                           key={lead._id}
//                           initial={{ opacity: 0, x: -20 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{ delay: index * 0.1 }}
//                           className="group p-6 bg-white/5 rounded-2xl border border-cyan-500/10 hover:border-cyan-500/30 hover:bg-white/10 transition"
//                         >
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-4">
//                               <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-cyan-500/20">
//                                 {(lead.name || "Unknown")
//                                   .split(' ')
//                                   .map(n => n[0])
//                                   .join('')
//                                   .toUpperCase()}
//                               </div>
//                               <div>
//                                 <div className="flex items-center gap-3 mb-2">
//                                   <h3 className="font-semibold text-white text-lg">{lead.name}</h3>
//                                   <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
//                                     {lead.status}
//                                   </span>
//                                 </div>
//                                 <div className="flex items-center gap-6 text-sm text-slate-300">
//                                   <span className="flex items-center gap-2">
//                                     <Mail className="w-4 h-4" />
//                                     {lead.email}
//                                   </span>
//                                   {lead.phone && (
//                                     <span className="flex items-center gap-2">
//                                       <Building className="w-4 h-4" />
//                                       {lead.phone}
//                                     </span>
//                                   )}
//                                   <span className="flex items-center gap-2">
//                                     <Calendar className="w-4 h-4" />
//                                     {new Date(lead.createdAt).toLocaleDateString()}
//                                   </span>
//                                 </div>
//                                 {lead.message && (
//                                   <p className="text-slate-400 mt-3 line-clamp-2">{lead.message}</p>
//                                 )}
//                               </div>
//                             </div>
                            
//                             <div className="flex items-center gap-4">
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
//                                 className="bg-white/5 border border-cyan-500/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
//                               >
//                                 <option value="new" className="bg-[#132F4C]">New</option>
//                                 <option value="contacted" className="bg-[#132F4C]">Contacted</option>
//                                 <option value="qualified" className="bg-[#132F4C]">Qualified</option>
//                                 <option value="converted" className="bg-[#132F4C]">Converted</option>
//                               </select>
                              
//                               <button className="opacity-0 group-hover:opacity-100 text-cyan-400 hover:text-cyan-300 font-medium transition">
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


import { Bot, Plus, Download, ExternalLink, LogOut, Sparkles, Zap, Trash2, Users, Mail, Building, Calendar, Filter, User, FileText, Briefcase, Camera, Menu, X, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import { useDigitalTwin } from "@/contexts/DigitalTwinContext";
import { useToast } from "@/hooks/use-toast";
import { authService, leadService } from '@/services/api.service';
import { IMAGE_BASE_URL } from '@/axios.config';
import logoImg from "@/Images/ChatGPT_Image_Nov_13__2025__08_06_06_PM-removebg-preview.png"


interface DigitalTwin {
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

interface Lead {
  _id: string;
  name: string;
  email: string;
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

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  avatar?: string;
}

const Dashboard = () => {
  const { digitalTwin, isLoading, loadDigitalTwin, deleteTwin } = useDigitalTwin();
  const { toast } = useToast();
  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        await loadDigitalTwin();
        await fetchUserProfile();
      } catch (error: any) {
        toast({
          title: "Load failed",
          description: error.message || "Failed to load digital twin",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [loadDigitalTwin, toast]);

  // Sync context digitalTwin to state and fetch leads when twin is available
  useEffect(() => {
    if (digitalTwin) {
      setTwins([digitalTwin]);
      fetchLeads(digitalTwin._id);
    }
  }, [digitalTwin]);

  const fetchUserProfile = async () => {
    try {
      const userData = await authService.getProfile();
      setUserProfile(userData);

      // Show profile picture modal if user doesn't have one
      if (!userData.profilePicture && !userData.avatar) {
        setTimeout(() => {
          setIsProfileModalOpen(true);
        }, 2000);
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
        title: "Failed to load leads",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await authService.updateProfilePicture(file);
      setUserProfile(result.user);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });

      setIsProfileModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleProfilePictureUpload(file);
    }
  };

  const downloadQR = useCallback((id: string) => {
    const svg = document.getElementById(`qr-${id}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `digital-twin-qr-${id}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      await deleteTwin();
      setTwins([]);
      setLeads([]);
      toast({
        title: "Success",
        description: "Digital twin deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete digital twin.",
        variant: "destructive",
      });
    }
  }, [deleteTwin, toast]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const getInitials = (name?: string | null) => {
    if (!name || typeof name !== 'string') return 'U';
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const filteredLeads = leads.filter(lead => {
    if (activeFilter === 'all') return true;
    return lead.status === activeFilter;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      contacted: 'bg-purple-100 text-purple-800 border-purple-200',
      qualified: 'bg-green-100 text-green-800 border-green-200',
      converted: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusCount = (status: string) => {
    return leads.filter(lead => lead.status === status).length;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="text-base sm:text-lg text-slate-600 font-medium text-center">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929]">
      {/* Profile Picture Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#132F4C] rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-cyan-500/20"
            >
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Add Profile Picture</h3>
                <p className="text-sm sm:text-base text-slate-300 mb-6 px-2">
                  Make your profile stand out with a professional photo
                </p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 text-white py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3 shadow-lg shadow-cyan-500/20 text-sm sm:text-base"
                >
                  {isUploading ? "Uploading..." : "Choose Photo"}
                </button>
                
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  disabled={isUploading}
                  className="w-full text-slate-300 py-3 rounded-xl font-medium hover:bg-white/5 transition border border-white/10 text-sm sm:text-base"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A1929]/80 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
                <img src={logoImg} alt="logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-white truncate">DigitalTwin</h1>
                <p className="text-xs sm:text-sm text-cyan-300 truncate hidden xs:block">Professional AI Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
                <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                  <FileText className="w-4 h-4" />
                  <span className="text-slate-400">Resume</span>
                  <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full border border-cyan-500/30">Soon</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-slate-400">Portfolio</span>
                  <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-1 rounded-full border border-teal-500/30">Soon</span>
                </div>
                <Link to="/dashboard" className="text-cyan-400 font-semibold border-b-2 border-cyan-400 text-sm">
                  Dashboard
                </Link>
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-cyan-400 hover:bg-white/5 rounded-lg transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* User Menu */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 lg:gap-3 p-2 rounded-xl lg:rounded-2xl bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:bg-white/10 hover:border-cyan-500/30 transition"
                >
                  {userProfile?.profilePicture || userProfile?.avatar ? (
                    <img
                      src={
                        userProfile.profilePicture
                          ? `${IMAGE_BASE_URL}${userProfile.profilePicture}`
                          : `${IMAGE_BASE_URL}${userProfile.avatar}`
                      }
                      alt={userProfile.name}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover ring-2 ring-cyan-500/30 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex-shrink-0">
                      {userProfile ? getInitials(userProfile.name) : 'U'}
                    </div>
                  )}
                  <div className="hidden md:block text-left min-w-0">
                    <div className="text-sm font-medium text-white truncate max-w-[120px]">
                      {userProfile?.name || 'Loading...'}
                    </div>
                    <div className="text-xs text-cyan-300 truncate">Premium Plan</div>
                  </div>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-[#132F4C] backdrop-blur-xl rounded-2xl shadow-xl border border-cyan-500/20 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-cyan-500/10">
                        <div className="text-sm font-semibold text-white truncate">{userProfile?.email}</div>
                        <div className="text-xs text-cyan-300">Professional Plan</div>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setUserMenuOpen(false);
                            setIsProfileModalOpen(true);
                          }}
                          className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition text-sm"
                        >
                          <Camera className="w-4 h-4 flex-shrink-0" />
                          <span>Update Photo</span>
                        </button>
                        <button className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition text-sm">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span>Profile Settings</span>
                        </button>
                        <Link
                          to="/billing"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition text-sm"
                        >
                          <CreditCard className="w-4 h-4 flex-shrink-0" />
                          <span>Billing &amp; Plan</span>
                        </Link>
                      </div>
                      <div className="p-2 border-t border-cyan-500/10">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition text-sm"
                        >
                          <LogOut className="w-4 h-4 flex-shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile User Avatar */}
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="sm:hidden"
              >
                {userProfile?.profilePicture || userProfile?.avatar ? (
                  <img
                    src={
                      userProfile.profilePicture
                        ? `${IMAGE_BASE_URL}${userProfile.profilePicture}`
                        : `${IMAGE_BASE_URL}${userProfile.avatar}`
                    }
                    alt={userProfile.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/30"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-lg shadow-cyan-500/20">
                    {userProfile ? getInitials(userProfile.name) : 'U'}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-4 pt-4 border-t border-cyan-500/10"
              >
                <nav className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-slate-400 font-medium text-sm p-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-slate-400">Resume</span>
                    <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full border border-cyan-500/30">Soon</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 font-medium text-sm p-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-slate-400">Portfolio</span>
                    <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-1 rounded-full border border-teal-500/30">Soon</span>
                  </div>
                  <Link to="/dashboard" className="text-cyan-400 font-semibold text-sm p-2 bg-cyan-500/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile User Menu */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden mt-4 pt-4 border-t border-cyan-500/10"
              >
                <div className="p-3 bg-white/5 rounded-xl mb-3">
                  <div className="text-sm font-semibold text-white truncate">{userProfile?.email}</div>
                  <div className="text-xs text-cyan-300">Professional Plan</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      setUserMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition text-sm"
                  >
                    <Camera className="w-4 h-4" />
                    Update Photo
                  </button>
                  <button className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition text-sm">
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition text-sm border-t border-cyan-500/10 mt-2 pt-3"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4"
            >
              Your Digital Presence,
              <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent block sm:inline"> Reimagined</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto px-4"
            >
              Manage your AI digital twins, track leads, and showcase your professional portfolio in one place.
            </motion.p>
          </div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
          >
            <Link
              to="/resume"
              className="group p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-cyan-500/20 shadow-sm hover:shadow-lg hover:shadow-cyan-500/10 hover:bg-white/10 hover:border-cyan-500/30 transition"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/20 transition flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-semibold text-white text-sm sm:text-base truncate">Smart Resume</h3>
                  <p className="text-xs sm:text-sm text-slate-400 truncate">AI-powered resume builder</p>
                </div>
              </div>
            </Link>

            <Link
              to="/portfolio"
              className="group p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-teal-500/20 shadow-sm hover:shadow-lg hover:shadow-teal-500/10 hover:bg-white/10 hover:border-teal-500/30 transition"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-500/20 transition flex-shrink-0">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-semibold text-white text-sm sm:text-base truncate">Portfolio</h3>
                  <p className="text-xs sm:text-sm text-slate-400 truncate">Showcase your work</p>
                </div>
              </div>
            </Link>

            <Link
              to="/wizard"
              className="group p-4 sm:p-6 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-xl sm:rounded-2xl border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] transition sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition flex-shrink-0">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-semibold text-white text-sm sm:text-base truncate">New Digital Twin</h3>
                  <p className="text-xs sm:text-sm text-white/90 truncate">Create AI assistant</p>
                </div>
              </div>
            </Link>
          </motion.div>

          {twins.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 sm:py-16 lg:py-20 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-sm border border-cyan-500/20 px-4"
            >
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-cyan-400" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">No Digital Twin Yet</h3>
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto px-4">
                Create your first digital twin to start generating leads and engaging with your audience 24/7.
              </p>
              <Link
                to="/wizard"
                className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-cyan-500 to-teal-400 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-cyan-600 hover:to-teal-500 transition font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Your First Twin
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {/* Digital Twin Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {twins.map((twin) => (
                  <motion.div
                    key={twin._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 sm:p-8 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-sm border border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition"
                  >
                    <div className="flex items-start justify-between mb-4 sm:mb-6 gap-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{twin.identity.name}</h2>
                        <p className="text-cyan-300 mt-1 text-sm sm:text-base truncate">{twin.identity.role}</p>
                      </div>
                      <button
                        onClick={handleDelete}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    
                    <p className="text-slate-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base line-clamp-3">{twin.identity.bio}</p>
                    
                    <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-teal-400" />
                          <span className="text-teal-300">Active</span>
                        </span>
                        <span className="hidden xs:inline">Updated {new Date(twin.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex flex-col items-center">
                        <div className="p-2 bg-white rounded-lg sm:rounded-xl">
                          <QRCode 
                            id={`qr-${twin._id}`} 
                            value={`https://digitaltwin.techtrekkers.ai/chatbot/${twin._id}`} 
                            size={80}
                            className="sm:w-[100px] sm:h-[100px]"
                          />
                        </div>
                        <button
                          onClick={() => downloadQR(twin._id)}
                          className="mt-2 sm:mt-3 text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm font-medium flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Download QR
                        </button>
                      </div>
                      <Link
                        to={`/chatbot/${twin._id}`}
                        className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition font-medium text-sm sm:text-base"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Live
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Leads Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-sm border border-cyan-500/20 overflow-hidden"
              >
                <div className="p-4 sm:p-6 lg:p-8 border-b border-cyan-500/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Lead Management</h2>
                        <p className="text-slate-300 text-sm sm:text-base hidden sm:block">Track and manage your generated leads</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <select
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="flex-1 sm:flex-none bg-white/5 border border-cyan-500/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30"
                      >
                        <option value="all" className="bg-[#132F4C]">All Leads</option>
                        <option value="new" className="bg-[#132F4C]">New</option>
                        <option value="contacted" className="bg-[#132F4C]">Contacted</option>
                        <option value="qualified" className="bg-[#132F4C]">Qualified</option>
                        <option value="converted" className="bg-[#132F4C]">Converted</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Overview */}
                  <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                    {['new', 'contacted', 'qualified', 'converted'].map((status) => (
                      <div
                        key={status}
                        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition cursor-pointer flex-shrink-0 ${
                          activeFilter === status
                            ? 'bg-cyan-500/20 shadow-sm border-cyan-500/50 ring-2 ring-cyan-500/30'
                            : 'border-cyan-500/10 hover:border-cyan-500/30 bg-white/5'
                        }`}
                        onClick={() => setActiveFilter(status)}
                      >
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                          status === 'new' ? 'bg-cyan-400' :
                          status === 'contacted' ? 'bg-teal-400' :
                          status === 'qualified' ? 'bg-emerald-400' : 'bg-green-400'
                        }`} />
                        <span className="text-xs sm:text-sm font-medium capitalize text-white whitespace-nowrap">{status}</span>
                        <span className="text-xs sm:text-sm text-slate-400">({getStatusCount(status)})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leads List */}
                <div className="p-4 sm:p-6 lg:p-8">
                  {isLoadingLeads ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
                        <div className="text-slate-300 text-sm sm:text-base">Loading leads...</div>
                      </div>
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-600 mb-4" />
                      <p className="text-slate-400 text-sm sm:text-base lg:text-lg px-4">
                        {activeFilter === 'all'
                          ? "No leads yet. Share your digital twin to start generating leads!"
                          : `No ${activeFilter} leads found.`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {filteredLeads.map((lead, index) => (
                        <motion.div
                          key={lead._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group p-4 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl border border-cyan-500/10 hover:border-cyan-500/30 hover:bg-white/10 transition"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-cyan-500/20 flex-shrink-0 text-sm sm:text-base">
                                {(lead.name || "Unknown")
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                                  <h3 className="font-semibold text-white text-sm sm:text-base lg:text-lg truncate">{lead.name}</h3>
                                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(lead.status)}`}>
                                    {lead.status}
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-slate-300">
                                  <span className="flex items-center gap-2 truncate">
                                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate">{lead.email}</span>
                                  </span>
                                  {lead.phone && (
                                    <span className="flex items-center gap-2 truncate">
                                      <Building className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                      {lead.phone}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {lead.message && (
                                  <p className="text-slate-400 mt-2 sm:mt-3 line-clamp-2 text-xs sm:text-sm">{lead.message}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
                              <select
                                value={lead.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  await leadService.updateStatus(lead._id, newStatus);
                                  setLeads((prev) =>
                                    prev.map((l) =>
                                      l._id === lead._id
                                        ? { ...l, status: newStatus as Lead['status'] }
                                        : l
                                    )
                                  );
                                }}
                                className="flex-1 sm:flex-none bg-white/5 border border-cyan-500/20 rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                              >
                                <option value="new" className="bg-[#132F4C]">New</option>
                                <option value="contacted" className="bg-[#132F4C]">Contacted</option>
                                <option value="qualified" className="bg-[#132F4C]">Qualified</option>
                                <option value="converted" className="bg-[#132F4C]">Converted</option>
                              </select>
                              
                              <button className="hidden lg:block opacity-0 group-hover:opacity-100 text-cyan-400 hover:text-cyan-300 font-medium transition text-sm whitespace-nowrap">
                                View Details
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
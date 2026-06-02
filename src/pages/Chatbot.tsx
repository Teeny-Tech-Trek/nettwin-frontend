
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Bot, Send, User, ArrowLeft, Mail, Building, Star, ExternalLink, Linkedin, Sparkles, Globe, Briefcase, Users, Share2 } from "lucide-react";
// import { useState, useRef, useEffect, useMemo } from "react";
// import { useParams, Link } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import { authService, digitalTwinService, chatService, leadService } from '@/services/api.service';
// import { IMAGE_BASE_URL } from '@/axios.config';


// interface Message {
//   id: string;
//   role: "user" | "assistant";
//   content: string;
//   timestamp: Date;
// }

// interface PublicAgent {
//   _id: string;
//   identity: {
//     name: string;
//     role: string;
//     bio: string;
//     tagline?: string;
//     profilePicture?: string;
//   };
//   businesses: {
//     name: string;
//     description: string;
//     role?: string;
//     link?: string;
//     products?: string[];
//     duration?: string;
//   }[];
//   experience?: {
//     company: string;
//     role: string;
//     duration?: string;
//     key_projects?: string[];
//   }[];
//   education?: { institution: string; degree: string; year?: string }[];
//   skills?: {
//     list?: string[];
//     coreDomains?: string;
//     signatureStrengths?: string;
//   };
//   story?: { mission?: string; impact?: string; themes?: string[] };
//   personality?: { tone?: string; traits?: string[] };
//   user?: {
//     profilePicture?: string;
//     avatar?: string;
//   };
//   links?: {
//     linkedin?: string;
//     website?: string;
//     portfolio?: string;
//     socials?: string[];
//   };
// }

// interface LeadFormData {
//   name: string;
//   email: string;
//   phone: string;
//   company: string;
//   interest: string;
// }

// interface UserProfile {
//   _id: string;
//   name: string;
//   email: string;
//   profilePicture?: string;
//   avatar?: string;
// }

// const Chatbot = () => {
//   const { id } = useParams<{ id: string }>();
//   const { toast } = useToast();
//   const [agent, setAgent] = useState<PublicAgent | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showLeadModal, setShowLeadModal] = useState(false);
//   const [showLinksModal, setShowLinksModal] = useState(false);
//   const [showBusinessModal, setShowBusinessModal] = useState(false);
//   const [showExpertiseModal, setShowExpertiseModal] = useState(false);

//   // Persistent chat session id — keyed per twin so a visitor browsing
//   // multiple twins doesn't accidentally cross-pollinate their conversation
//   // memory on the AI engine. We use crypto.randomUUID where available and
//   // fall back to a timestamp-based id on older browsers.
//   const sessionId = useMemo(() => {
//     if (!id) return '';
//     const storageKey = `chat_session_id:${id}`;
//     try {
//       const existing = localStorage.getItem(storageKey);
//       if (existing) return existing;
//       const fresh =
//         typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
//           ? crypto.randomUUID()
//           : `nettwin-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
//       localStorage.setItem(storageKey, fresh);
//       return fresh;
//     } catch {
//       // localStorage can be unavailable (private mode, blocked cookies).
//       // Fall back to an in-memory id; loses cross-reload continuity but
//       // still gives the AI engine a stable id within this page session.
//       return `nettwin-${id}-${Date.now()}`;
//     }
//   }, [id]);
//   const [leadData, setLeadData] = useState<LeadFormData>({ name: "", email: "", phone: "", company: "", interest: "" });
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [isMobile, setIsMobile] = useState(false);
//   // True after the owner has hit their monthly chat-message quota — freezes
//   // the composer and surfaces a "currently not available" banner.
//   const [quotaExceeded, setQuotaExceeded] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const rootRef = useRef<HTMLDivElement>(null);

//   // Check mobile viewport
//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 768);
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // LAYOUT-ONLY: keep the app sized to the EXACT visible area.
//   // CSS units (vh/svh/dvh) can't react to the iOS on-screen keyboard, so we
//   // read window.visualViewport (its height + offset shrink/move when the
//   // keyboard or browser toolbars appear) and pin the root to it. This does NOT
//   // touch any chat state, handlers, or API calls — it only sets size/position.
//   useEffect(() => {
//     const vv = typeof window !== "undefined" ? window.visualViewport : null;
//     const applyViewport = () => {
//       const el = rootRef.current;
//       if (!el) return;
//       if (vv) {
//         el.style.height = `${vv.height}px`;
//         el.style.top = `${vv.offsetTop}px`;
//       } else {
//         el.style.height = `${window.innerHeight}px`;
//         el.style.top = "0px";
//       }
//     };
//     applyViewport();
//     if (vv) {
//       vv.addEventListener("resize", applyViewport);
//       vv.addEventListener("scroll", applyViewport);
//     }
//     window.addEventListener("resize", applyViewport);
//     window.addEventListener("orientationchange", applyViewport);
//     return () => {
//       if (vv) {
//         vv.removeEventListener("resize", applyViewport);
//         vv.removeEventListener("scroll", applyViewport);
//       }
//       window.removeEventListener("resize", applyViewport);
//       window.removeEventListener("orientationchange", applyViewport);
//     };
//   }, [agent]);

//   useEffect(() => {
//   if (messagesEndRef.current) {
//     messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
//   }
// }, [messages]);

//   // Fetch Public Digital Twin
//   useEffect(() => {
//     const fetchAgent = async () => {
//       try {
//         setError(null);
//         const result = await digitalTwinService.getPublic(id!);
//         const twin = result.data;
//         if (!twin || !twin.identity || !twin.identity.name) {
//           throw new Error("Digital twin data is missing required fields");
//         }
//         setAgent(twin);
//         setMessages([
//           {
//             id: "1",
//             role: "assistant",
//             content: `Hello! I'm the digital twin of ${twin.identity.name}, ${twin.identity.role}. ${twin.identity.tagline || 'I can share insights on my expertise, businesses, and collaboration opportunities.'} What sparks your interest today?`,
//             timestamp: new Date(),
//           },
//         ]);
//       } catch (err: any) {
//         console.error("Failed to fetch public agent:", err);
//         setError(err.message || "Unable to load digital twin.");
//       }
//     };
//     fetchAgent();
//   }, [id]);

//   // Auto scroll to bottom
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Detect interest keywords to trigger lead modal
//   const checkForInterest = (content: string) => {
//     const interestKeywords = ["interested", "contact", "partnership", "collaborate", "business", "investment", "work together", "connect", "meeting", "call"];
//     return interestKeywords.some((kw) => content.toLowerCase().includes(kw));
//   };

//   // Send message to chat API
//   const handleSend = async (customInput?: string) => {
//     const messageContent = customInput || input;
//     if (!messageContent.trim() || !agent) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       role: "user",
//       content: messageContent,
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMessage]);
//     if (!customInput) setInput("");
//     setLoading(true);

//     // Check for interest and trigger modal
//     if (checkForInterest(messageContent)) {
//       setLeadData((prev) => ({ ...prev, interest: messageContent }));
//       setTimeout(() => setShowLeadModal(true), 1000);
//     }

//     try {
//       const data = await chatService.sendMessage({
//         twinId: agent._id,
//         messages: [
//           ...messages.map((m) => ({
//             role: m.role,
//             content: m.content,
//           })),
//           { role: "user", content: messageContent },
//         ],
//         userEmail: userProfile?.email || "guest@example.com",
//         sessionId,
//       });
      
//       const aiMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         role: "assistant",
//         content: data.reply || "I'm processing that strategically—let's refine your query for deeper insights.",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (err: any) {
//       console.error("Chat API error:", err);
//       // Quota exceeded — the owner has hit their plan's monthly message
//       // limit. Surface a clear "currently not available" message instead
//       // of the generic error, and freeze further sends for this session.
//       const status = err?.response?.status;
//       const code = err?.response?.data?.error;
//       if (status === 429 || code === "QUOTA_EXCEEDED") {
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: (Date.now() + 3).toString(),
//             role: "assistant",
//             content:
//               "This digital twin is currently not available — its owner has reached their monthly chat limit. Please check back after their next renewal, or reach out to them directly.",
//             timestamp: new Date(),
//           },
//         ]);
//         setQuotaExceeded(true);
//         return;
//       }
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: (Date.now() + 2).toString(),
//           role: "assistant",
//           content: "Apologies—my network glitched. As an experienced advisor, let's pivot: What's your core business challenge?",
//           timestamp: new Date(),
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle template button clicks
//   const handleTemplateClick = (template: string) => {
//     handleSend(template);
//   };

//   // Submit lead form
//   const handleLeadSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!leadData.name || !leadData.email || !leadData.company) return;

//     try {
//       await leadService.create({ 
//         ...leadData, 
//         twinId: agent?._id! 
//       });

//       setShowLeadModal(false);
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: (Date.now() + 3).toString(),
//           role: "assistant",
//           content: `Thanks for sharing, ${leadData.name}! I've noted your interest in "${leadData.interest}". My human counterpart will reach out soon via ${leadData.email} to discuss opportunities at ${leadData.company}. What's next on your mind?`,
//           timestamp: new Date(),
//         },
//       ]);
//       setLeadData({ name: "", email: userProfile?.email || "", phone: "", company: "", interest: "" });

//       toast({
//         title: "Success!",
//         description: "Your interest has been recorded. We'll contact you soon.",
//       });
//     } catch (err) {
//       console.error("Lead submission error:", err);
//       toast({
//         title: "Submission failed",
//         description: "Please try again or contact us directly.",
//         variant: "destructive",
//       });
//     }
//   };

//   // Handle Enter key press
//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const getAgentProfilePicture = () => {
//     if (!agent) return null;
//     return agent.user?.profilePicture
//       ? `${IMAGE_BASE_URL}${agent.user.profilePicture}`
//       : agent.user?.avatar
//       ? `${IMAGE_BASE_URL}${agent.user.avatar}`
//       : null;
//   };

//   const getUserProfilePicture = () => {
//     return userProfile?.profilePicture || userProfile?.avatar;
//   };

//   // Navigate to external links
//   const navigateToLink = (url: string) => {
//     if (url) {
//       window.open(url, '_blank', 'noopener,noreferrer');
//     }
//   };

//   // Get domain from URL for display
//   const getDomainFromUrl = (url: string) => {
//     try {
//       const domain = new URL(url).hostname.replace('www.', '');
//       return domain;
//     } catch {
//       return url;
//     }
//   };

//   // Get icon for link type
//   const getLinkIcon = (url: string) => {
//     if (url.includes('linkedin.com')) return <Linkedin className="w-4 h-4" />;
//     if (url.includes('github.com')) return <Briefcase className="w-4 h-4" />;
//     if (url.includes('portfolio') || url.includes('teenytechtrek')) return <Briefcase className="w-4 h-4" />;
//     if (url.includes('autoreach')) return <Sparkles className="w-4 h-4" />;
//     if (url.includes('estate')) return <Building className="w-4 h-4" />;
//     if (url.includes('digitaltwin')) return <Users className="w-4 h-4" />;
//     return <Globe className="w-4 h-4" />;
//   };

//   // Get link type for styling
//   const getLinkType = (url: string) => {
//     if (url.includes('linkedin.com')) return 'linkedin';
//     if (url.includes('portfolio') || url.includes('teenytechtrek')) return 'portfolio';
//     if (url.includes('autoreach')) return 'product';
//     if (url.includes('estate')) return 'estate';
//     if (url.includes('digitaltwin')) return 'digitaltwin';
//     return 'website';
//   };

//   // Quick Templates
//   //
//   // Expertise / Business open a structured card populated from
//   // the twin's stored profile (already returned by /digital-twin/public).
//   // They do NOT send a chat message — the LLM is not asked to invent
//   // facts the user has already entered.
//   // LinkedIn opens the twin's LinkedIn profile directly in a new window
//   // (only shown if LinkedIn URL is provided).
//   const templates = [
//     {
//       label: "Expertise",
//       icon: <Star className="w-3.5 h-3.5" />,
//       onClick: () => setShowExpertiseModal(true),
//     },
//     {
//       label: "Business",
//       icon: <Building className="w-3.5 h-3.5" />,
//       onClick: () => setShowBusinessModal(true),
//     },
//     ...(agent?.links?.linkedin ? [{
//       label: "LinkedIn",
//       icon: <Linkedin className="w-3.5 h-3.5" />,
//       onClick: () => {
//         if (agent?.links?.linkedin) {
//           const url = agent.links.linkedin.startsWith("http")
//             ? agent.links.linkedin
//             : `https://${agent.links.linkedin}`;
//           window.open(url, "_blank");
//         }
//       },
//     }] : []),
//     {
//       label: "Connect",
//       icon: <Mail className="w-3.5 h-3.5" />,
//       onClick: () => {
//         setLeadData((prev) => ({ ...prev, interest: "Partnership inquiry" }));
//         setShowLeadModal(true);
//       },
//     },
//   ];

//   // Loading or Error States
//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] p-4">
//         <div className="text-center max-w-md px-4">
//           <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
//             <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" />
//           </div>
//           <p className="text-base sm:text-lg font-semibold mb-4 text-red-400">⚠️ {error}</p>
//           <Link to="/dashboard">
//             <Button variant="outline" className="border-cyan-500/30 text-white hover:bg-white/5 text-sm">
//               Go Back
//             </Button>
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (!agent) {
//     return (
//       <div className="flex items-center justify-center min-h-[100dvh] bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] px-4">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-9 h-9 sm:w-10 sm:h-10 border-[3px] border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
//           <div className="text-sm sm:text-base text-slate-400 font-medium text-center">Loading digital twin...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     /*
//       Responsive, ChatGPT/Claude-style layout:
//       - Pinned to the LIVE visible viewport (see the visualViewport effect
//         above) via position:fixed, so it always fills the exact area between the
//         browser toolbars / above the on-screen keyboard -> no top clip, no
//         bottom gap, no keyboard gap, on both Safari and Chrome. The inline
//         100dvh is only the first-paint fallback before the effect runs.
//       - Compact, refined sizing tuned for both phone and laptop.
//       - Centered narrow reading column (max-w-3xl) for clean message flow.
//     */
//     <div
//       ref={rootRef}
//       style={{ position: "fixed", left: 0, right: 0 }}
//       className="flex flex-col h-[100dvh] overflow-hidden bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] text-slate-200 antialiased"
//     >
//       {/* Header */}
//       <motion.div
//         initial={{ y: -16, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         className="flex-shrink-0 border-b border-white/[0.06] backdrop-blur-xl bg-[#0A1929]/80 z-40"
//       >
//         <div className="mx-auto w-full max-w-5xl px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5">
//           <div className="flex items-center justify-between gap-2">
//             <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
//               <Link to="/dashboard">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 h-8 w-8 p-0"
//                   aria-label="Go back"
//                 >
//                   <ArrowLeft className="w-4 h-4" />
//                 </Button>
//               </Link>

//               {/* Agent Profile Picture */}
//               {getAgentProfilePicture() ? (
//                 <img
//                   src={getAgentProfilePicture()!}
//                   alt={agent.identity.name}
//                   className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-cyan-500/30 flex-shrink-0"
//                 />
//               ) : (
//                 <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center flex-shrink-0">
//                   <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
//                 </div>
//               )}

//               <div className="min-w-0 flex-1 leading-tight">
//                 <h1 className="text-sm sm:text-[15px] font-semibold text-white tracking-tight truncate">
//                   {agent.identity.name}
//                 </h1>
//                 <p className="text-[11px] sm:text-xs text-cyan-300/80 font-medium truncate">
//                   {agent.identity.role}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-1.5 flex-shrink-0">
//               {/* Links Button */}
//               {(agent.links?.linkedin || agent.links?.website || agent.links?.portfolio || agent.links?.socials) && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => setShowLinksModal(true)}
//                   className="rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 h-8 w-8 p-0"
//                   aria-label="View all links"
//                 >
//                   <Share2 className="w-4 h-4" />
//                 </Button>
//               )}

//               <div className="flex items-center gap-1.5 bg-white/[0.06] rounded-full px-2 sm:px-2.5 py-1">
//                 <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
//                 <span className="text-[11px] sm:text-xs text-slate-300 font-medium">Live</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* Chat Area */}
//       <ScrollArea className="flex-1 min-h-0">
//         <div className="mx-auto w-full max-w-3xl px-3 sm:px-5 py-4 sm:py-6">
//           <div className="space-y-4 sm:space-y-5">
//             <AnimatePresence>
//               {messages.map((message) => {
//                 const isUser = message.role === "user";
//                 return (
//                   <motion.div
//                     key={message.id}
//                     initial={{ opacity: 0, y: 12 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.3, ease: "easeOut" }}
//                     className={`flex items-start gap-2 sm:gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
//                   >
//                     {/* Avatar */}
//                     <div className="flex-shrink-0 mt-0.5">
//                       {!isUser ? (
//                         getAgentProfilePicture() ? (
//                           <img
//                             src={getAgentProfilePicture()!}
//                             alt={agent.identity.name}
//                             className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-cyan-500/30"
//                           />
//                         ) : (
//                           <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
//                             <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
//                           </div>
//                         )
//                       ) : (
//                         getUserProfilePicture() ? (
//                           <img
//                             src={getUserProfilePicture()}
//                             alt={userProfile?.name || "User"}
//                             className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/10"
//                           />
//                         ) : (
//                           <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
//                             <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-200" />
//                           </div>
//                         )
//                       )}
//                     </div>

//                     {/* Bubble */}
//                     <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
//                       <div
//                         className={`px-3.5 py-2.5 rounded-2xl text-[13.5px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
//                           isUser
//                             ? "bg-cyan-500/15 border border-cyan-400/20 text-white rounded-tr-md"
//                             : "bg-white/[0.06] border border-white/[0.06] text-slate-100 rounded-tl-md"
//                         }`}
//                       >
//                         {message.content}
//                       </div>
//                       <span className="text-[10px] text-slate-500 px-1">
//                         {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                       </span>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </AnimatePresence>

//             {loading && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="flex items-center gap-2.5 text-slate-400 ml-9 sm:ml-[42px]"
//               >
//                 <div className="flex gap-1">
//                   <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
//                   <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
//                   <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
//                 </div>
//                 <span className="text-xs italic">Thinking...</span>
//               </motion.div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>
//         </div>
//       </ScrollArea>

//       {/* Footer: Quick Templates + Input */}
//       <div className="flex-shrink-0 border-t border-white/[0.06] backdrop-blur-xl bg-[#0A1929]/85 z-30 pb-[env(safe-area-inset-bottom)]">
//         <div className="mx-auto w-full max-w-3xl px-3 sm:px-5">
//           {/* Quick Templates */}
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="pt-2.5 sm:pt-3"
//           >
//             <div className="flex gap-1.5 sm:gap-2 justify-start sm:justify-center overflow-x-auto pb-0.5 scrollbar-hide">
//               {templates.map((template, idx) => (
//                 <Button
//                   key={idx}
//                   variant="outline"
//                   size="sm"
//                   onClick={template.onClick}
//                   className="flex items-center gap-1.5 rounded-full text-[12px] sm:text-xs border-white/10 bg-white/[0.03] text-slate-300 hover:bg-cyan-500/15 hover:text-white hover:border-cyan-400/30 transition-all duration-200 h-8 px-3 whitespace-nowrap flex-shrink-0"
//                   aria-label={template.label}
//                 >
//                   {template.icon}
//                   <span className="font-medium">{template.label}</span>
//                 </Button>
//               ))}
//             </div>
//           </motion.div>

//           {/* Input Area */}
//           <motion.div
//             initial={{ y: 12, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.15 }}
//             className="pt-2.5 pb-3 sm:pb-4"
//           >
//             {quotaExceeded && (
//               <div className="mb-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[12px] sm:text-[13px] text-amber-200 text-center">
//                 This digital twin is currently not available — its owner has reached their monthly chat limit.
//               </div>
//             )}
//             <div className="flex items-center gap-2 p-1.5 rounded-full bg-white/[0.05] border border-white/10 focus-within:border-cyan-400/40 focus-within:bg-white/[0.07] transition-all duration-200">
//               <Input
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 placeholder={
//                   quotaExceeded
//                     ? "Chat unavailable — owner's monthly limit reached"
//                     : `Message ${agent.identity.name}...`
//                 }
//                 className="flex-1 min-w-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9 text-[14px] sm:text-[15px] px-3 sm:px-4 text-white placeholder:text-slate-500"
//                 disabled={loading || quotaExceeded}
//                 aria-label="Type your message"
//               />
//               <Button
//                 onClick={() => handleSend()}
//                 disabled={!input.trim() || loading || quotaExceeded}
//                 variant="default"
//                 size="sm"
//                 className="h-9 w-9 p-0 rounded-full bg-gradient-to-br from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 border-0 disabled:opacity-40 transition-all duration-200 flex-shrink-0"
//                 aria-label="Send message"
//               >
//                 <Send className="w-4 h-4" />
//               </Button>
//             </div>
//             <p className="text-[10px] text-slate-500 text-center mt-1.5 hidden sm:block">
//               Enter to send · Shift + Enter for new line
//             </p>
//           </motion.div>
//         </div>
//       </div>

//       {/* Links Modal */}
//       <Dialog open={showLinksModal} onOpenChange={setShowLinksModal}>
//         <DialogContent className="w-[calc(100%-1.5rem)] max-w-sm rounded-2xl bg-[#102A43] border border-white/10 p-0 flex flex-col max-h-[85dvh] overflow-hidden [&>button]:right-3.5 [&>button]:top-3.5 [&>button]:z-10 [&>button]:flex [&>button]:h-7 [&>button]:w-7 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-white/5 [&>button]:text-slate-300 [&>button]:opacity-100 [&>button]:ring-0 [&>button]:ring-offset-0 [&>button]:hover:bg-white/15 [&>button]:hover:text-white [&>button]:transition-colors">
//           <DialogHeader className="pl-5 pr-14 pt-5 pb-3 flex-shrink-0">
//             <DialogTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
//               <Share2 className="w-4.5 h-4.5 text-cyan-400 flex-shrink-0" />
//               Connect & Explore
//             </DialogTitle>
//           </DialogHeader>
//           <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5 space-y-2.5">
//             {/* LinkedIn */}
//             {agent.links?.linkedin && (
//               <Button
//                 onClick={() => {
//                   navigateToLink(agent.links!.linkedin!);
//                   setShowLinksModal(false);
//                 }}
//                 className="w-full justify-start gap-3 h-13 py-3 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/25 text-white transition-all duration-200 text-left rounded-xl"
//               >
//                 <Linkedin className="w-5 h-5 text-blue-400 flex-shrink-0" />
//                 <div className="flex-1 min-w-0">
//                   <div className="font-medium text-sm truncate">LinkedIn</div>
//                   <div className="text-[11px] text-blue-300/70 truncate">Professional Profile</div>
//                 </div>
//                 <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50" />
//               </Button>
//             )}

//             {/* Website */}
//             {agent.links?.website && (
//               <Button
//                 onClick={() => {
//                   navigateToLink(agent.links!.website!);
//                   setShowLinksModal(false);
//                 }}
//                 className="w-full justify-start gap-3 h-13 py-3 bg-cyan-600/15 hover:bg-cyan-600/25 border border-cyan-500/25 text-white transition-all duration-200 text-left rounded-xl"
//               >
//                 <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0" />
//                 <div className="flex-1 min-w-0">
//                   <div className="font-medium text-sm truncate">Website</div>
//                   <div className="text-[11px] text-cyan-300/70 truncate">{getDomainFromUrl(agent.links!.website!)}</div>
//                 </div>
//                 <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50" />
//               </Button>
//             )}

//             {/* Portfolio */}
//             {agent.links?.portfolio && (
//               <Button
//                 onClick={() => {
//                   navigateToLink(agent.links!.portfolio!);
//                   setShowLinksModal(false);
//                 }}
//                 className="w-full justify-start gap-3 h-13 py-3 bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/25 text-white transition-all duration-200 text-left rounded-xl"
//               >
//                 <Briefcase className="w-5 h-5 text-purple-400 flex-shrink-0" />
//                 <div className="flex-1 min-w-0">
//                   <div className="font-medium text-sm truncate">Portfolio</div>
//                   <div className="text-[11px] text-purple-300/70 truncate">Teeny Tech Trek</div>
//                 </div>
//                 <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50" />
//               </Button>
//             )}

//             {/* Social Links */}
//             {agent.links?.socials && agent.links.socials.map((social, index) => (
//               <Button
//                 key={index}
//                 onClick={() => {
//                   navigateToLink(social);
//                   setShowLinksModal(false);
//                 }}
//                 className="w-full justify-start gap-3 h-12 py-3 bg-teal-600/15 hover:bg-teal-600/25 border border-teal-500/25 text-white transition-all duration-200 text-left rounded-xl"
//               >
//                 {getLinkIcon(social)}
//                 <div className="flex-1 min-w-0">
//                   <div className="font-medium text-sm truncate">{getDomainFromUrl(social)}</div>
//                 </div>
//                 <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50" />
//               </Button>
//             ))}

//             {/* Additional Info */}
//             <div className="text-center pt-3 mt-1 border-t border-white/5">
//               <p className="text-xs text-slate-400">
//                 Feel free to explore my work and connect!
//               </p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Business Profile Modal — populated from stored twin profile only */}
//       <Dialog open={showBusinessModal} onOpenChange={setShowBusinessModal}>
//         <DialogContent className="w-[calc(100%-1.5rem)] max-w-md rounded-2xl bg-[#102A43] border border-white/10 p-0 flex flex-col max-h-[88dvh] overflow-hidden [&>button]:right-3.5 [&>button]:top-3.5 [&>button]:z-10 [&>button]:flex [&>button]:h-7 [&>button]:w-7 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-white/5 [&>button]:text-slate-300 [&>button]:opacity-100 [&>button]:ring-0 [&>button]:ring-offset-0 [&>button]:hover:bg-white/15 [&>button]:hover:text-white [&>button]:transition-colors">
//           <DialogHeader className="pl-5 pr-14 pt-5 pb-3 flex-shrink-0">
//             <DialogTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
//               <Building className="w-4.5 h-4.5 text-cyan-400 flex-shrink-0" />
//               Business
//             </DialogTitle>
//           </DialogHeader>
//           <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5 space-y-4 text-sm text-slate-200">
//             {agent.businesses && agent.businesses.length > 0 ? (
//               agent.businesses.map((b, idx) => (
//                 <div key={`${b.name}-${idx}`} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       <div className="text-white font-semibold leading-tight">{b.name}</div>
//                       {b.role && <div className="text-cyan-300/90 text-xs mt-0.5">{b.role}</div>}
//                     </div>
//                     {b.duration && (
//                       <div className="text-[11px] text-slate-400 whitespace-nowrap pt-0.5">{b.duration}</div>
//                     )}
//                   </div>
//                   {b.description && (
//                     <p className="text-slate-300 leading-relaxed">{b.description}</p>
//                   )}
//                   {b.products && b.products.length > 0 && (
//                     <div className="flex flex-wrap gap-1.5 pt-1">
//                       {b.products.map((p) => (
//                         <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-200 border border-cyan-500/20">
//                           {p}
//                         </span>
//                       ))}
//                     </div>
//                   )}
//                   {b.link && (
//                     <a
//                       href={b.link}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200"
//                     >
//                       <Globe className="w-3.5 h-3.5" /> {getDomainFromUrl(b.link)}
//                     </a>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <p className="text-slate-400 text-sm">No business details have been shared yet.</p>
//             )}

//             {agent.story?.mission && (
//               <div className="rounded-xl border border-white/10 bg-white/5 p-4">
//                 <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Mission</div>
//                 <p className="text-slate-200 leading-relaxed">{agent.story.mission}</p>
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Expertise Profile Modal */}
//       <Dialog open={showExpertiseModal} onOpenChange={setShowExpertiseModal}>
//         <DialogContent className="w-[calc(100%-1.5rem)] max-w-md rounded-2xl bg-[#102A43] border border-white/10 p-0 flex flex-col max-h-[88dvh] overflow-hidden [&>button]:right-3.5 [&>button]:top-3.5 [&>button]:z-10 [&>button]:flex [&>button]:h-7 [&>button]:w-7 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-white/5 [&>button]:text-slate-300 [&>button]:opacity-100 [&>button]:ring-0 [&>button]:ring-offset-0 [&>button]:hover:bg-white/15 [&>button]:hover:text-white [&>button]:transition-colors">
//           <DialogHeader className="pl-5 pr-14 pt-5 pb-3 flex-shrink-0">
//             <DialogTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
//               <Star className="w-4.5 h-4.5 text-cyan-400 flex-shrink-0" />
//               Expertise
//             </DialogTitle>
//           </DialogHeader>
//           <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5 space-y-4 text-sm text-slate-200">
//             {agent.skills?.list && agent.skills.list.length > 0 && (
//               <div>
//                 <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Skills</div>
//                 <div className="flex flex-wrap gap-1.5">
//                   {agent.skills.list.map((s) => (
//                     <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-200 border border-cyan-500/20">
//                       {s}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//             {agent.skills?.coreDomains && (
//               <div>
//                 <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Core domains</div>
//                 <p className="text-slate-200 leading-relaxed whitespace-pre-line">{agent.skills.coreDomains}</p>
//               </div>
//             )}
//             {agent.skills?.signatureStrengths && (
//               <div>
//                 <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Signature strengths</div>
//                 <p className="text-slate-200 leading-relaxed whitespace-pre-line">{agent.skills.signatureStrengths}</p>
//               </div>
//             )}
//             {agent.experience && agent.experience.length > 0 && (
//               <div>
//                 <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Experience</div>
//                 <div className="space-y-2">
//                   {agent.experience.map((e, idx) => (
//                     <div key={`${e.company}-${idx}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
//                       <div className="text-white font-medium leading-tight">{e.role}</div>
//                       <div className="text-cyan-300/90 text-xs mt-0.5">
//                         {e.company}{e.duration ? ` · ${e.duration}` : ""}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//             {agent.education && agent.education.length > 0 && (
//               <div>
//                 <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Education</div>
//                 <div className="space-y-2">
//                   {agent.education.map((ed, idx) => (
//                     <div key={`${ed.institution}-${idx}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
//                       <div className="text-white font-medium leading-tight">{ed.degree}</div>
//                       <div className="text-cyan-300/90 text-xs mt-0.5">
//                         {ed.institution}{ed.year ? ` · ${ed.year}` : ""}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//             {!agent.skills?.list?.length &&
//               !agent.skills?.coreDomains &&
//               !agent.skills?.signatureStrengths &&
//               !agent.experience?.length &&
//               !agent.education?.length && (
//                 <p className="text-slate-400 text-sm">No expertise details have been shared yet.</p>
//               )}
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Lead Capture Modal */}
//       <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
//         <DialogContent className="w-[calc(100%-1.5rem)] max-w-sm rounded-2xl bg-[#102A43] border border-white/10 p-0 flex flex-col max-h-[88dvh] overflow-hidden [&>button]:right-3.5 [&>button]:top-3.5 [&>button]:z-10 [&>button]:flex [&>button]:h-7 [&>button]:w-7 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-white/5 [&>button]:text-slate-300 [&>button]:opacity-100 [&>button]:ring-0 [&>button]:ring-offset-0 [&>button]:hover:bg-white/15 [&>button]:hover:text-white [&>button]:transition-colors">
//           <DialogHeader className="pl-5 pr-14 pt-5 pb-3 flex-shrink-0">
//             <DialogTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
//               <Building className="w-4.5 h-4.5 text-cyan-400 flex-shrink-0" />
//               Let's Connect for Business
//             </DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleLeadSubmit} className="flex flex-col min-h-0 flex-1">
//             {/* Scrollable fields */}
//             <div className="flex-1 min-h-0 overflow-y-auto px-5 space-y-3">
//               <div className="space-y-1.5">
//                 <Label htmlFor="name" className="text-slate-300 text-xs">Full Name *</Label>
//                 <Input
//                   id="name"
//                   value={leadData.name}
//                   onChange={(e) => setLeadData((prev) => ({ ...prev, name: e.target.value }))}
//                   required
//                   className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/40 focus:border-cyan-500/50 h-10 text-sm rounded-lg"
//                 />
//               </div>
//               <div className="space-y-1.5">
//                 <Label htmlFor="email" className="text-slate-300 text-xs">Email *</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={leadData.email}
//                   onChange={(e) => setLeadData((prev) => ({ ...prev, email: e.target.value }))}
//                   required
//                   className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/40 focus:border-cyan-500/50 h-10 text-sm rounded-lg"
//                 />
//               </div>
//               <div className="space-y-1.5">
//                 <Label htmlFor="phone" className="text-slate-300 text-xs">Phone</Label>
//                 <Input
//                   id="phone"
//                   value={leadData.phone}
//                   onChange={(e) => setLeadData((prev) => ({ ...prev, phone: e.target.value }))}
//                   className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/40 focus:border-cyan-500/50 h-10 text-sm rounded-lg"
//                 />
//               </div>
//               <div className="space-y-1.5">
//                 <Label htmlFor="company" className="text-slate-300 text-xs">Company *</Label>
//                 <Input
//                   id="company"
//                   value={leadData.company}
//                   onChange={(e) => setLeadData((prev) => ({ ...prev, company: e.target.value }))}
//                   required
//                   className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/40 focus:border-cyan-500/50 h-10 text-sm rounded-lg"
//                 />
//               </div>
//               <div className="space-y-1.5">
//                 <Label htmlFor="interest" className="text-slate-300 text-xs">Area of Interest</Label>
//                 <Textarea
//                   id="interest"
//                   value={leadData.interest}
//                   onChange={(e) => setLeadData((prev) => ({ ...prev, interest: e.target.value }))}
//                   placeholder="What specifically are you interested in?"
//                   rows={2}
//                   className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/40 focus:border-cyan-500/50 resize-none text-sm rounded-lg"
//                 />
//               </div>
//             </div>
//             {/* Pinned submit button (always visible) */}
//             <div className="flex-shrink-0 px-5 pt-3 pb-5 mt-2 border-t border-white/5">
//               <Button
//                 type="submit"
//                 className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 border-0 text-white font-semibold h-11 transition-all duration-200 text-sm"
//               >
//                 Submit & Continue Chat
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default Chatbot;







//////////////////////////////////////////////////////////////////



// frontend/src/components/Chatbot.tsx// frontend/src/components/Chatbot.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, ArrowLeft, Mail, Building, Star, ExternalLink, Linkedin, Sparkles, Globe, Briefcase, Users, Share2 } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { authService, digitalTwinService, chatService, leadService } from '@/services/api.service';
import { IMAGE_BASE_URL } from '@/axios.config';


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface PublicAgent {
  _id: string;
  identity: {
    name: string;
    role: string;
    bio: string;
    tagline?: string;
    profilePicture?: string;
  };
  businesses: {
    name: string;
    description: string;
    role?: string;
    link?: string;
    products?: string[];
    duration?: string;
  }[];
  experience?: {
    company: string;
    role: string;
    duration?: string;
    key_projects?: string[];
  }[];
  education?: { institution: string; degree: string; year?: string }[];
  skills?: {
    list?: string[];
    coreDomains?: string;
    signatureStrengths?: string;
  };
  story?: { mission?: string; impact?: string; themes?: string[] };
  personality?: { tone?: string; traits?: string[] };
  user?: {
    profilePicture?: string;
    avatar?: string;
  };
  links?: {
    linkedin?: string;
    website?: string;
    portfolio?: string;
    socials?: string[];
  };
}

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  interest: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  avatar?: string;
}

const Chatbot = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [agent, setAgent] = useState<PublicAgent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showExpertiseModal, setShowExpertiseModal] = useState(false);

  // Persistent chat session id — keyed per twin so a visitor browsing
  // multiple twins doesn't accidentally cross-pollinate their conversation
  // memory on the AI engine. We use crypto.randomUUID where available and
  // fall back to a timestamp-based id on older browsers.
  const sessionId = useMemo(() => {
    if (!id) return '';
    const storageKey = `chat_session_id:${id}`;
    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) return existing;
      const fresh =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `nettwin-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(storageKey, fresh);
      return fresh;
    } catch {
      // localStorage can be unavailable (private mode, blocked cookies).
      // Fall back to an in-memory id; loses cross-reload continuity but
      // still gives the AI engine a stable id within this page session.
      return `nettwin-${id}-${Date.now()}`;
    }
  }, [id]);
  const [leadData, setLeadData] = useState<LeadFormData>({ name: "", email: "", phone: "", company: "", interest: "" });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  // True after the owner has hit their monthly chat-message quota — freezes
  // the composer and surfaces a "currently not available" banner.
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // LAYOUT-ONLY: keep the app sized to the EXACT visible area.
  // CSS units (vh/svh/dvh) can't react to the iOS on-screen keyboard, so we
  // read window.visualViewport (its height + offset shrink/move when the
  // keyboard or browser toolbars appear) and pin the root to it. This does NOT
  // touch any chat state, handlers, or API calls — it only sets size/position.
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    const applyViewport = () => {
      const el = rootRef.current;
      if (!el) return;
      if (vv) {
        // Pin to the EXACT visible rect — height/top fix the vertical clip
        // (keyboard/toolbars) and width/left fix the horizontal clip: without
        // width+left the element spans the wider *layout* viewport, pushing the
        // right edge (send button, header actions) off-screen while typing.
        el.style.height = `${vv.height}px`;
        el.style.width = `${vv.width}px`;
        el.style.top = `${vv.offsetTop}px`;
        el.style.left = `${vv.offsetLeft}px`;
      } else {
        el.style.height = `${window.innerHeight}px`;
        el.style.width = "100%";
        el.style.top = "0px";
        el.style.left = "0px";
      }
    };
    applyViewport();
    if (vv) {
      vv.addEventListener("resize", applyViewport);
      vv.addEventListener("scroll", applyViewport);
    }
    window.addEventListener("resize", applyViewport);
    window.addEventListener("orientationchange", applyViewport);
    return () => {
      if (vv) {
        vv.removeEventListener("resize", applyViewport);
        vv.removeEventListener("scroll", applyViewport);
      }
      window.removeEventListener("resize", applyViewport);
      window.removeEventListener("orientationchange", applyViewport);
    };
  }, [agent]);

  useEffect(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }
}, [messages]);

  // Fetch Public Digital Twin
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setError(null);
        const result = await digitalTwinService.getPublic(id!);
        const twin = result.data;
        if (!twin || !twin.identity || !twin.identity.name) {
          throw new Error("Digital twin data is missing required fields");
        }
        setAgent(twin);
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: `Hello! I'm the digital twin of ${twin.identity.name}, ${twin.identity.role}. ${twin.identity.tagline || 'I can share insights on my expertise, businesses, and collaboration opportunities.'} What sparks your interest today?`,
            timestamp: new Date(),
          },
        ]);
      } catch (err: any) {
        console.error("Failed to fetch public agent:", err);
        setError(err.message || "Unable to load digital twin.");
      }
    };
    fetchAgent();
  }, [id]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect interest keywords to trigger lead modal
  const checkForInterest = (content: string) => {
    const interestKeywords = ["interested", "contact", "partnership", "collaborate", "business", "investment", "work together", "connect", "meeting", "call"];
    return interestKeywords.some((kw) => content.toLowerCase().includes(kw));
  };

  // Send message to chat API
  const handleSend = async (customInput?: string) => {
    const messageContent = customInput || input;
    if (!messageContent.trim() || !agent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    if (!customInput) setInput("");
    setLoading(true);

    // Check for interest and trigger modal
    if (checkForInterest(messageContent)) {
      setLeadData((prev) => ({ ...prev, interest: messageContent }));
      setTimeout(() => setShowLeadModal(true), 1000);
    }

    try {
      const data = await chatService.sendMessage({
        twinId: agent._id,
        messages: [
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user", content: messageContent },
        ],
        userEmail: userProfile?.email || "guest@example.com",
        sessionId,
      });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "I'm processing that strategically—let's refine your query for deeper insights.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("Chat API error:", err);
      // Quota exceeded — the owner has hit their plan's monthly message
      // limit. Surface a clear "currently not available" message instead
      // of the generic error, and freeze further sends for this session.
      const status = err?.response?.status;
      const code = err?.response?.data?.error;
      if (status === 429 || code === "QUOTA_EXCEEDED") {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 3).toString(),
            role: "assistant",
            content:
              "This digital twin is currently not available — its owner has reached their monthly chat limit. Please check back after their next renewal, or reach out to them directly.",
            timestamp: new Date(),
          },
        ]);
        setQuotaExceeded(true);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: "Apologies—my network glitched. As an experienced advisor, let's pivot: What's your core business challenge?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle template button clicks
  const handleTemplateClick = (template: string) => {
    handleSend(template);
  };

  // Submit lead form
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.name || !leadData.email || !leadData.company) return;

    try {
      await leadService.create({ 
        ...leadData, 
        twinId: agent?._id! 
      });

      setShowLeadModal(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 3).toString(),
          role: "assistant",
          content: `Thanks for sharing, ${leadData.name}! I've noted your interest in "${leadData.interest}". My human counterpart will reach out soon via ${leadData.email} to discuss opportunities at ${leadData.company}. What's next on your mind?`,
          timestamp: new Date(),
        },
      ]);
      setLeadData({ name: "", email: userProfile?.email || "", phone: "", company: "", interest: "" });

      toast({
        title: "Success!",
        description: "Your interest has been recorded. We'll contact you soon.",
      });
    } catch (err) {
      console.error("Lead submission error:", err);
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAgentProfilePicture = () => {
    if (!agent) return null;
    return agent.user?.profilePicture
      ? `${IMAGE_BASE_URL}${agent.user.profilePicture}`
      : agent.user?.avatar
      ? `${IMAGE_BASE_URL}${agent.user.avatar}`
      : null;
  };

  const getUserProfilePicture = () => {
    return userProfile?.profilePicture || userProfile?.avatar;
  };

  // Navigate to external links
  const navigateToLink = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Get domain from URL for display
  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  // Get icon for link type
  const getLinkIcon = (url: string) => {
    if (url.includes('linkedin.com')) return <Linkedin className="w-4 h-4" />;
    if (url.includes('github.com')) return <Briefcase className="w-4 h-4" />;
    if (url.includes('portfolio') || url.includes('teenytechtrek')) return <Briefcase className="w-4 h-4" />;
    if (url.includes('autoreach')) return <Sparkles className="w-4 h-4" />;
    if (url.includes('estate')) return <Building className="w-4 h-4" />;
    if (url.includes('digitaltwin')) return <Users className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  // Get link type for styling
  const getLinkType = (url: string) => {
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('portfolio') || url.includes('teenytechtrek')) return 'portfolio';
    if (url.includes('autoreach')) return 'product';
    if (url.includes('estate')) return 'estate';
    if (url.includes('digitaltwin')) return 'digitaltwin';
    return 'website';
  };

  // Quick Templates
  //
  // Expertise / Business open a structured card populated from
  // the twin's stored profile (already returned by /digital-twin/public).
  // They do NOT send a chat message — the LLM is not asked to invent
  // facts the user has already entered.
  // LinkedIn opens the twin's LinkedIn profile directly in a new window
  // (only shown if LinkedIn URL is provided).
  const templates = [
    {
      label: "Expertise",
      icon: <Star className="w-3.5 h-3.5 text-amber-500" />,
      onClick: () => setShowExpertiseModal(true),
    },
    {
      label: "Business",
      icon: <Building className="w-3.5 h-3.5 text-blue-600" />,
      onClick: () => setShowBusinessModal(true),
    },
    ...(agent?.links?.linkedin ? [{
      label: "LinkedIn",
      icon: <Linkedin className="w-3.5 h-3.5 text-[#0a66c2]" />,
      onClick: () => {
        if (agent?.links?.linkedin) {
          const url = agent.links.linkedin.startsWith("http")
            ? agent.links.linkedin
            : `https://${agent.links.linkedin}`;
          window.open(url, "_blank");
        }
      },
    }] : []),
    {
      label: "Connect",
      icon: <Mail className="w-3.5 h-3.5 text-cyan-600" />,
      onClick: () => {
        setLeadData((prev) => ({ ...prev, interest: "Partnership inquiry" }));
        setShowLeadModal(true);
      },
    },
  ];

  // Loading or Error States
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-white p-4">
        <div className="text-center max-w-md px-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
          </div>
          <p className="text-base sm:text-lg font-semibold mb-4 text-red-500">⚠️ {error}</p>
          <Link to="/dashboard">
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 text-sm">
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-white px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 border-[3px] border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-sm sm:text-base text-slate-500 font-medium text-center">Loading digital twin...</div>
        </div>
      </div>
    );
  }

  return (
    /*
      Responsive, ChatGPT/Claude-style layout (light theme):
      - Pinned to the LIVE visible viewport (see the visualViewport effect
        above) via position:fixed, so it always fills the exact area between the
        browser toolbars / above the on-screen keyboard -> no top clip, no
        bottom gap, no keyboard gap, on both Safari and Chrome. The inline
        100dvh is only the first-paint fallback before the effect runs.
      - Compact, refined sizing tuned for both phone and laptop.
      - Centered narrow reading column (max-w-3xl) for clean message flow.
    */
    <div
      ref={rootRef}
      style={{ position: "fixed", top: 0, left: 0, width: "100%" }}
      className="flex flex-col h-[100dvh] max-w-full overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-50 text-slate-700 antialiased"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-shrink-0 border-b border-slate-200/70 backdrop-blur-xl bg-white/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] z-40"
      >
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 h-8 w-8 p-0"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>

              {/* Agent Profile Picture */}
              <div className="relative flex-shrink-0">
                {getAgentProfilePicture() ? (
                  <img
                    src={getAgentProfilePicture()!}
                    alt={agent.identity.name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center">
                    <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-sm sm:text-[15px] font-semibold text-slate-900 tracking-tight truncate">
                    {agent.identity.name}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-emerald-600 font-medium">Live</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                  {agent.identity.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Links Button */}
              {(agent.links?.linkedin || agent.links?.website || agent.links?.portfolio || agent.links?.socials) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLinksModal(true)}
                  className="rounded-full gap-1.5 border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-8 px-3"
                  aria-label="View all links"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Share</span>
                </Button>
              )}

              {/* Live badge (mobile) */}
              <div className="sm:hidden flex items-center gap-1.5 bg-slate-100 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-slate-600 font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-5 py-4 sm:py-6">
          <div className="space-y-4 sm:space-y-5">
            <AnimatePresence>
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex items-start gap-2 sm:gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-0.5">
                      {!isUser ? (
                        getAgentProfilePicture() ? (
                          <img
                            src={getAgentProfilePicture()!}
                            alt={agent.identity.name}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                            <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
                          </div>
                        )
                      ) : (
                        getUserProfilePicture() ? (
                          <img
                            src={getUserProfilePicture()}
                            alt={userProfile?.name || "User"}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                          </div>
                        )
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-[13.5px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
                          isUser
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20 rounded-tr-md"
                            : "bg-white border border-slate-200 text-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.06)] rounded-tl-md"
                        }`}
                      >
                        {message.content}
                      </div>
                      <span className="text-[10px] text-slate-400 px-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2.5 text-slate-400 ml-9 sm:ml-[42px]"
              >
                <div className="flex items-center gap-1 bg-white border border-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.06)] rounded-2xl rounded-tl-md px-3.5 py-2.5">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-xs italic text-slate-500 ml-1.5">Thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Footer: Quick Templates + Input */}
      <div className="flex-shrink-0 border-t border-slate-200/80 backdrop-blur-xl bg-white/90 z-30 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-5">
          {/* Quick Templates */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2.5 sm:pt-3"
          >
            <div className="flex gap-1.5 sm:gap-2 justify-start sm:justify-center overflow-x-auto pb-0.5 scrollbar-hide">
              {templates.map((template, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={template.onClick}
                  className="flex items-center gap-2 rounded-full text-[12px] sm:text-[13px] font-medium border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-9 px-4 whitespace-nowrap flex-shrink-0"
                  aria-label={template.label}
                >
                  {template.icon}
                  <span className="font-medium">{template.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Input Area */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="pt-2.5 pb-3 sm:pb-4"
          >
            {quotaExceeded && (
              <div className="mb-2 rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2 text-[12px] sm:text-[13px] text-amber-700 text-center">
                This digital twin is currently not available — its owner has reached their monthly chat limit.
              </div>
            )}
            <div className="flex items-center gap-2 p-1.5 rounded-full bg-white border border-slate-200 shadow-[0_2px_14px_rgba(15,23,42,0.07)] focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  quotaExceeded
                    ? "Chat unavailable — owner's monthly limit reached"
                    : `Message ${agent.identity.name}...`
                }
                className="flex-1 min-w-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9 text-[14px] sm:text-[15px] px-3 sm:px-4 text-slate-900 placeholder:text-slate-400"
                disabled={loading || quotaExceeded}
                aria-label="Type your message"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading || quotaExceeded}
                variant="default"
                size="sm"
                className="h-9 w-9 p-0 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 disabled:opacity-40 shadow-md shadow-blue-600/25 transition-all duration-200 flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-1.5 hidden sm:block">
              Enter to send · Shift + Enter for new line
            </p>
          </motion.div>
        </div>
      </div>

      {/* Links Modal */}
      <Dialog open={showLinksModal} onOpenChange={setShowLinksModal}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-sm rounded-2xl bg-white border border-slate-200 p-0 flex flex-col max-h-[85dvh] overflow-hidden shadow-xl [&>button]:right-3.5 [&>button]:top-3.5 [&>button]:z-10 [&>button]:flex [&>button]:h-7 [&>button]:w-7 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-slate-100 [&>button]:text-slate-500 [&>button]:opacity-100 [&>button]:ring-0 [&>button]:ring-offset-0 [&>button]:hover:bg-slate-200 [&>button]:hover:text-slate-700 [&>button]:transition-colors">
          <DialogHeader className="pl-5 pr-14 pt-5 pb-3 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-slate-900 text-base sm:text-lg">
              <Share2 className="w-4.5 h-4.5 text-blue-600 flex-shrink-0" />
              Connect & Explore
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5 space-y-2.5">
            {/* LinkedIn */}
            {agent.links?.linkedin && (
              <Button
                onClick={() => {
                  navigateToLink(agent.links!.linkedin!);
                  setShowLinksModal(false);
                }}
                className="w-full justify-start gap-3 h-13 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-slate-800 transition-all duration-200 text-left rounded-xl"
              >
                <Linkedin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">LinkedIn</div>
                  <div className="text-[11px] text-blue-600/70 truncate">Professional Profile</div>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-40" />
              </Button>
            )}

            {/* Website */}
            {agent.links?.website && (
              <Button
                onClick={() => {
                  navigateToLink(agent.links!.website!);
                  setShowLinksModal(false);
                }}
                className="w-full justify-start gap-3 h-13 py-3 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-slate-800 transition-all duration-200 text-left rounded-xl"
              >
                <Globe className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">Website</div>
                  <div className="text-[11px] text-cyan-600/70 truncate">{getDomainFromUrl(agent.links!.website!)}</div>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-40" />
              </Button>
            )}

            {/* Portfolio */}
            {agent.links?.portfolio && (
              <Button
                onClick={() => {
                  navigateToLink(agent.links!.portfolio!);
                  setShowLinksModal(false);
                }}
                className="w-full justify-start gap-3 h-13 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-slate-800 transition-all duration-200 text-left rounded-xl"
              >
                <Briefcase className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">Portfolio</div>
                  <div className="text-[11px] text-purple-600/70 truncate">Teeny Tech Trek</div>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-40" />
              </Button>
            )}

            {/* Social Links */}
            {agent.links?.socials && agent.links.socials.map((social, index) => (
              <Button
                key={index}
                onClick={() => {
                  navigateToLink(social);
                  setShowLinksModal(false);
                }}
                className="w-full justify-start gap-3 h-12 py-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-slate-800 transition-all duration-200 text-left rounded-xl"
              >
                {getLinkIcon(social)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{getDomainFromUrl(social)}</div>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-40" />
              </Button>
            ))}

            {/* Additional Info */}
            <div className="text-center pt-3 mt-1 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Feel free to explore my work and connect!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Business Profile Modal — populated from stored twin profile only */}
      <Dialog open={showBusinessModal} onOpenChange={setShowBusinessModal}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-md rounded-2xl bg-white border border-slate-200 p-0 flex flex-col max-h-[88dvh] overflow-hidden shadow-xl [&>button]:right-3.5 [&>button]:top-3.5 [&>button]:z-10 [&>button]:flex [&>button]:h-7 [&>button]:w-7 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-slate-100 [&>button]:text-slate-500 [&>button]:opacity-100 [&>button]:ring-0 [&>button]:ring-offset-0 [&>button]:hover:bg-slate-200 [&>button]:hover:text-slate-700 [&>button]:transition-colors">
          <DialogHeader className="pl-5 pr-14 pt-5 pb-3 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-slate-900 text-base sm:text-lg">
              <Building className="w-4.5 h-4.5 text-blue-600 flex-shrink-0" />
              Business
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5 space-y-4 text-sm text-slate-700">
            {agent.businesses && agent.businesses.length > 0 ? (
              agent.businesses.map((b, idx) => (
                <div key={`${b.name}-${idx}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-slate-900 font-semibold leading-tight">{b.name}</div>
                      {b.role && <div className="text-blue-600 text-xs mt-0.5">{b.role}</div>}
                    </div>
                    {b.duration && (
                      <div className="text-[11px] text-slate-400 whitespace-nowrap pt-0.5">{b.duration}</div>
                    )}
                  </div>
                  {b.description && (
                    <p className="text-slate-600 leading-relaxed">{b.description}</p>
                  )}
                  {b.products && b.products.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {b.products.map((p) => (
                        <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {b.link && (
                    <a
                      href={b.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-3.5 h-3.5" /> {getDomainFromUrl(b.link)}
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No business details have been shared yet.</p>
            )}

            {agent.story?.mission && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Mission</div>
                <p className="text-slate-700 leading-relaxed">{agent.story.mission}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Expertise Profile Modal */}
      <Dialog open={showExpertiseModal} onOpenChange={setShowExpertiseModal}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-md rounded-2xl bg-white border border-slate-200 p-0 flex flex-col max-h-[88dvh] overflow-hidden shadow-xl [&>button]:right-3.5 [&>button]:top-3.5 [&>button]:z-10 [&>button]:flex [&>button]:h-7 [&>button]:w-7 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-slate-100 [&>button]:text-slate-500 [&>button]:opacity-100 [&>button]:ring-0 [&>button]:ring-offset-0 [&>button]:hover:bg-slate-200 [&>button]:hover:text-slate-700 [&>button]:transition-colors">
          <DialogHeader className="pl-5 pr-14 pt-5 pb-3 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-slate-900 text-base sm:text-lg">
              <Star className="w-4.5 h-4.5 text-blue-600 flex-shrink-0" />
              Expertise
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5 space-y-4 text-sm text-slate-700">
            {agent.skills?.list && agent.skills.list.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.skills.list.map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {agent.skills?.coreDomains && (
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Core domains</div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{agent.skills.coreDomains}</p>
              </div>
            )}
            {agent.skills?.signatureStrengths && (
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Signature strengths</div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{agent.skills.signatureStrengths}</p>
              </div>
            )}
            {agent.experience && agent.experience.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Experience</div>
                <div className="space-y-2">
                  {agent.experience.map((e, idx) => (
                    <div key={`${e.company}-${idx}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-slate-900 font-medium leading-tight">{e.role}</div>
                      <div className="text-blue-600 text-xs mt-0.5">
                        {e.company}{e.duration ? ` · ${e.duration}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {agent.education && agent.education.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Education</div>
                <div className="space-y-2">
                  {agent.education.map((ed, idx) => (
                    <div key={`${ed.institution}-${idx}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-slate-900 font-medium leading-tight">{ed.degree}</div>
                      <div className="text-blue-600 text-xs mt-0.5">
                        {ed.institution}{ed.year ? ` · ${ed.year}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!agent.skills?.list?.length &&
              !agent.skills?.coreDomains &&
              !agent.skills?.signatureStrengths &&
              !agent.experience?.length &&
              !agent.education?.length && (
                <p className="text-slate-400 text-sm">No expertise details have been shared yet.</p>
              )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Capture Modal */}
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-sm rounded-2xl bg-white border border-slate-200 p-0 flex flex-col max-h-[88dvh] overflow-hidden shadow-xl [&>button]:right-3.5 [&>button]:top-3.5 [&>button]:z-10 [&>button]:flex [&>button]:h-7 [&>button]:w-7 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-slate-100 [&>button]:text-slate-500 [&>button]:opacity-100 [&>button]:ring-0 [&>button]:ring-offset-0 [&>button]:hover:bg-slate-200 [&>button]:hover:text-slate-700 [&>button]:transition-colors">
          <DialogHeader className="pl-5 pr-14 pt-5 pb-3 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-slate-900 text-base sm:text-lg">
              <Building className="w-4.5 h-4.5 text-blue-600 flex-shrink-0" />
              Let's Connect for Business
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLeadSubmit} className="flex flex-col min-h-0 flex-1">
            {/* Scrollable fields */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-600 text-xs">Full Name *</Label>
                <Input
                  id="name"
                  value={leadData.name}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/30 focus:border-blue-500/50 h-10 text-sm rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-600 text-xs">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={leadData.email}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/30 focus:border-blue-500/50 h-10 text-sm rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-slate-600 text-xs">Phone</Label>
                <Input
                  id="phone"
                  value={leadData.phone}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/30 focus:border-blue-500/50 h-10 text-sm rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-slate-600 text-xs">Company *</Label>
                <Input
                  id="company"
                  value={leadData.company}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, company: e.target.value }))}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/30 focus:border-blue-500/50 h-10 text-sm rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="interest" className="text-slate-600 text-xs">Area of Interest</Label>
                <Textarea
                  id="interest"
                  value={leadData.interest}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, interest: e.target.value }))}
                  placeholder="What specifically are you interested in?"
                  rows={2}
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/30 focus:border-blue-500/50 resize-none text-sm rounded-lg"
                />
              </div>
            </div>
            {/* Pinned submit button (always visible) */}
            <div className="flex-shrink-0 px-5 pt-3 pb-5 mt-2 border-t border-slate-100">
              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 text-white font-semibold h-11 shadow-md shadow-blue-600/20 transition-all duration-200 text-sm"
              >
                Submit & Continue Chat
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chatbot;
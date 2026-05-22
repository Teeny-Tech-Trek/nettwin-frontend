// // frontend/src/components/Chatbot.tsx
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Bot, Send, User, ArrowLeft, Mail, Building, Star, ExternalLink, Linkedin, Sparkles, Globe, Briefcase, Users, Share2 } from "lucide-react";
// import { useState, useRef, useEffect } from "react";
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
//   businesses: { name: string; description: string }[];
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
//   const [leadData, setLeadData] = useState<LeadFormData>({ name: "", email: "", phone: "", company: "", interest: "" });
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [isMobile, setIsMobile] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Check mobile viewport
//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 768);
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

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
//       });
      
//       const aiMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         role: "assistant",
//         content: data.reply || "I'm processing that strategically—let's refine your query for deeper insights.",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (err) {
//       console.error("Chat API error:", err);
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
//   const templates = [
//     { 
//       label: "Expertise", 
//       icon: <Star className="w-4 h-4" />, 
//       onClick: () => handleTemplateClick("Tell me about your expertise and background.") 
//     },
//     { 
//       label: "Business", 
//       icon: <Building className="w-4 h-4" />, 
//       onClick: () => handleTemplateClick("What business opportunities do you see for collaboration?") 
//     },
//     { 
//       label: "Projects", 
//       icon: <Briefcase className="w-4 h-4" />, 
//       onClick: () => handleTemplateClick("Tell me about your recent projects and work.") 
//     },
//     { 
//       label: "Connect", 
//       icon: <Mail className="w-4 h-4" />, 
//       onClick: () => { 
//         setLeadData((prev) => ({ ...prev, interest: "Partnership inquiry" })); 
//         setShowLeadModal(true); 
//       } 
//     },
//   ];

//   // Loading or Error States
//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] p-4">
//         <div className="text-center max-w-md">
//           <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
//             <Sparkles className="w-8 h-8 text-red-400" />
//           </div>
//           <p className="text-lg font-semibold mb-4 text-red-400">⚠️ {error}</p>
//           <Link to="/dashboard">
//             <Button variant="outline" className="border-cyan-500/30 text-white hover:bg-white/5">
//               Go Back
//             </Button>
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (!agent) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929]">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
//           <div className="text-lg text-slate-300 font-medium">Loading digital twin...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] flex flex-col safe-area-inset">
//       {/* Header */}
//       <motion.div
//         initial={{ y: -20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         className="border-b border-cyan-500/10 backdrop-blur-[24px] bg-[#0A1929]/80 sticky top-0 z-40"
//       >
//         <div className="container mx-auto px-4 py-3 lg:px-8 lg:py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Link to="/dashboard">
//                 <Button 
//                   variant="ghost" 
//                   size={isMobile ? "sm" : "default"}
//                   className="rounded-full text-slate-300 hover:text-cyan-400 hover:bg-white/5"
//                   aria-label="Go back"
//                 >
//                   <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
//                   {!isMobile && <span className="ml-2">Back</span>}
//                 </Button>
//               </Link>

//               {/* Agent Profile Picture */}
//               {getAgentProfilePicture() ? (
//                 <motion.img
//                   whileHover={{ scale: 1.05 }}
//                   src={getAgentProfilePicture()!}
//                   alt={agent.identity.name}
//                   className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl object-cover shadow-lg border border-cyan-500/30"
//                 />
//               ) : (
//                 <motion.div
//                   whileHover={{ scale: 1.05, rotate: 5 }}
//                   className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/30"
//                 >
//                   <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
//                 </motion.div>
//               )}

//               <div className="min-w-0 flex-1">
//                 <h1 className="text-base lg:text-lg font-bold text-white tracking-tight truncate">
//                   {agent.identity.name}
//                 </h1>
//                 <p className="text-xs lg:text-sm text-cyan-300 font-medium truncate">
//                   {agent.identity.role} • Digital Twin
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               {/* Links Button */}
//               {(agent.links?.linkedin || agent.links?.website || agent.links?.portfolio || agent.links?.socials) && (
//                 <Button
//                   variant="ghost"
//                   size={isMobile ? "sm" : "default"}
//                   onClick={() => setShowLinksModal(true)}
//                   className="rounded-full text-slate-300 hover:text-cyan-400 hover:bg-white/5"
//                   aria-label="View all links"
//                 >
//                   <Share2 className="w-4 h-4 lg:w-5 lg:h-5" />
//                 </Button>
//               )}
              
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
//                 <span className="text-xs lg:text-sm text-slate-300 font-medium hidden sm:block">
//                   Live
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* Chat Area */}
//       <ScrollArea className="flex-1">
//         <div className="container mx-auto px-3 py-4 lg:px-8 lg:py-8">
//           <div className="max-w-3xl mx-auto space-y-4 lg:space-y-6">
//             <AnimatePresence>
//               {messages.map((message) => (
//                 <motion.div
//                   key={message.id}
//                   initial={{ opacity: 0, y: 20, scale: 0.98 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   transition={{ duration: 0.4, ease: "easeOut" }}
//                   className={`flex items-start gap-3 lg:gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
//                 >
//                   {/* Message Avatar */}
//                   <div className="flex-shrink-0">
//                     {message.role === "assistant" ? (
//                       getAgentProfilePicture() ? (
//                         <img
//                           src={getAgentProfilePicture()!}
//                           alt={agent.identity.name}
//                           className="w-8 h-8 lg:w-12 lg:h-12 rounded-2xl object-cover shadow-lg border border-cyan-500/30"
//                         />
//                       ) : (
//                         <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
//                           <Bot className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
//                         </div>
//                       )
//                     ) : (
//                       getUserProfilePicture() ? (
//                         <img
//                           src={getUserProfilePicture()}
//                           alt={userProfile?.name || "User"}
//                           className="w-8 h-8 lg:w-12 lg:h-12 rounded-2xl object-cover shadow-lg border border-slate-400/20"
//                         />
//                       ) : (
//                         <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center shadow-lg shadow-slate-500/20">
//                           <User className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
//                         </div>
//                       )
//                     )}
//                   </div>

//                   {/* Message Content */}
//                   <Card
//                     className={`p-4 lg:p-6 max-w-[85%] lg:max-w-[80%] rounded-2xl border-0 shadow-sm ${
//                       message.role === "assistant" 
//                         ? "bg-white/10 backdrop-blur-sm shadow-cyan-500/10 border border-cyan-500/10" 
//                         : "bg-cyan-500/20 shadow-cyan-500/5 border border-cyan-500/20"
//                     }`}
//                   >
//                     <p className="text-white leading-relaxed text-sm lg:text-base whitespace-pre-wrap font-medium">
//                       {message.content}
//                     </p>
//                     <p className="text-xs text-slate-400 mt-2 lg:mt-3 flex items-center gap-1">
//                       <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
//                       {message.role === "user" && <User className="w-3 h-3" />}
//                     </p>
//                   </Card>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
            
//             {loading && (
//               <motion.div 
//                 initial={{ opacity: 0 }} 
//                 animate={{ opacity: 1 }} 
//                 className="flex items-center gap-3 text-slate-300 ml-11 lg:ml-16"
//               >
//                 <div className="flex gap-1">
//                   <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
//                   <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
//                   <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
//                 </div>
//                 <span className="text-sm italic">Strategizing response...</span>
//               </motion.div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>
//         </div>
//       </ScrollArea>

//       {/* Quick Templates */}
//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="border-t border-cyan-500/10 backdrop-blur-sm bg-[#0A1929]/50 py-3 lg:py-4 sticky bottom-20 z-30"
//       >
//         <div className="container mx-auto px-3 lg:px-4">
//           <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
//             {templates.map((template, idx) => (
//               <Button
//                 key={idx}
//                 variant="outline"
//                 size={isMobile ? "sm" : "default"}
//                 onClick={template.onClick}
//                 className="flex items-center gap-1 rounded-full text-xs border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/50 transition-all duration-200"
//                 aria-label={template.label}
//               >
//                 {template.icon}
//                 <span className="hidden xs:inline">{template.label}</span>
//               </Button>
//             ))}
//           </div>
//         </div>
//       </motion.div>

//       {/* Input Area */}
//       <motion.div
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 0.3 }}
//         className="border-t border-cyan-500/10 backdrop-blur-[24px] bg-[#0A1929]/80 sticky bottom-0 shadow-xl safe-area-inset-bottom"
//       >
//         <div className="container mx-auto px-3 lg:px-8 py-3 lg:py-6">
//           <div className="max-w-3xl mx-auto">
//             <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-2xl bg-white/5 border border-cyan-500/20 focus-within:border-cyan-500/40 transition-all duration-300 shadow-md">
//               <Input
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 placeholder={`Chat with ${agent.identity.name}...`}
//                 className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 lg:h-12 text-sm lg:text-base px-3 lg:px-4 text-white placeholder:text-slate-500"
//                 disabled={loading}
//                 aria-label="Type your message"
//               />
//               <Button
//                 onClick={() => handleSend()}
//                 disabled={!input.trim() || loading}
//                 variant="default"
//                 size={isMobile ? "sm" : "default"}
//                 className="h-10 w-10 lg:h-12 lg:w-12 p-0 rounded-xl shadow-md hover:shadow-lg bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 border-0 transition-all duration-200"
//                 aria-label="Send message"
//               >
//                 <Send className="w-4 h-4 lg:w-5 lg:h-5" />
//               </Button>
//             </div>
//             <p className="text-xs text-slate-400 text-center mt-2 hidden sm:block">
//               Enter to send • Shift + Enter for new line
//             </p>
//           </div>
//         </div>
//       </motion.div>

//       {/* Links Modal */}
//       <Dialog open={showLinksModal} onOpenChange={setShowLinksModal}>
//         <DialogContent className="sm:max-w-md rounded-2xl bg-[#132F4C] border border-cyan-500/20 mx-4">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-white text-lg lg:text-xl">
//               <Share2 className="w-5 h-5 text-cyan-400" />
//               Connect & Explore
//             </DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             {/* LinkedIn */}
//             {agent.links?.linkedin && (
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.1 }}
//               >
//                 <Button
//                   onClick={() => navigateToLink(agent.links!.linkedin!)}
//                   className="w-full justify-start gap-3 h-14 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-white transition-all duration-200"
//                 >
//                   <Linkedin className="w-5 h-5 text-blue-400" />
//                   <div className="flex-1 text-left">
//                     <div className="font-semibold">LinkedIn</div>
//                     <div className="text-xs text-blue-300/80">Professional Profile</div>
//                   </div>
//                   <ExternalLink className="w-4 h-4" />
//                 </Button>
//               </motion.div>
//             )}

//             {/* Website */}
//             {agent.links?.website && (
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2 }}
//               >
//                 <Button
//                   onClick={() => navigateToLink(agent.links!.website!)}
//                   className="w-full justify-start gap-3 h-14 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-white transition-all duration-200"
//                 >
//                   <Globe className="w-5 h-5 text-cyan-400" />
//                   <div className="flex-1 text-left">
//                     <div className="font-semibold">Website</div>
//                     <div className="text-xs text-cyan-300/80">{getDomainFromUrl(agent.links!.website!)}</div>
//                   </div>
//                   <ExternalLink className="w-4 h-4" />
//                 </Button>
//               </motion.div>
//             )}

//             {/* Portfolio */}
//             {agent.links?.portfolio && (
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//               >
//                 <Button
//                   onClick={() => navigateToLink(agent.links!.portfolio!)}
//                   className="w-full justify-start gap-3 h-14 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-white transition-all duration-200"
//                 >
//                   <Briefcase className="w-5 h-5 text-purple-400" />
//                   <div className="flex-1 text-left">
//                     <div className="font-semibold">Portfolio</div>
//                     <div className="text-xs text-purple-300/80">Teeny Tech Trek</div>
//                   </div>
//                   <ExternalLink className="w-4 h-4" />
//                 </Button>
//               </motion.div>
//             )}

//             {/* Social Links */}
//             {agent.links?.socials && agent.links.socials.map((social, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.4 + index * 0.1 }}
//               >
//                 <Button
//                   onClick={() => navigateToLink(social)}
//                   className="w-full justify-start gap-3 h-12 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 text-white transition-all duration-200"
//                 >
//                   {getLinkIcon(social)}
//                   <div className="flex-1 text-left">
//                     <div className="font-medium text-sm">{getDomainFromUrl(social)}</div>
//                   </div>
//                   <ExternalLink className="w-4 h-4" />
//                 </Button>
//               </motion.div>
//             ))}

//             {/* Additional Info */}
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6 }}
//               className="text-center pt-4 border-t border-cyan-500/10"
//             >
//               <p className="text-sm text-slate-400">
//                 Feel free to explore my work and connect!
//               </p>
//             </motion.div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Lead Capture Modal */}
//       <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
//         <DialogContent className="sm:max-w-md rounded-2xl bg-[#132F4C] border border-cyan-500/20 mx-4">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-white text-lg lg:text-xl">
//               <Building className="w-5 h-5 text-cyan-400" />
//               Let's Connect for Business
//             </DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleLeadSubmit} className="space-y-4">
//             <div className="space-y-3">
//               <Label htmlFor="name" className="text-slate-300">Full Name *</Label>
//               <Input
//                 id="name"
//                 value={leadData.name}
//                 onChange={(e) => setLeadData((prev) => ({ ...prev, name: e.target.value }))}
//                 required
//                 className="bg-white/5 border-cyan-500/30 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50"
//               />
//             </div>
//             <div className="space-y-3">
//               <Label htmlFor="email" className="text-slate-300">Email *</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={leadData.email}
//                 onChange={(e) => setLeadData((prev) => ({ ...prev, email: e.target.value }))}
//                 required
//                 className="bg-white/5 border-cyan-500/30 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50"
//               />
//             </div>
//             <div className="space-y-3">
//               <Label htmlFor="phone" className="text-slate-300">Phone</Label>
//               <Input
//                 id="phone"
//                 value={leadData.phone}
//                 onChange={(e) => setLeadData((prev) => ({ ...prev, phone: e.target.value }))}
//                 className="bg-white/5 border-cyan-500/30 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50"
//               />
//             </div>
//             <div className="space-y-3">
//               <Label htmlFor="company" className="text-slate-300">Company *</Label>
//               <Input
//                 id="company"
//                 value={leadData.company}
//                 onChange={(e) => setLeadData((prev) => ({ ...prev, company: e.target.value }))}
//                 required
//                 className="bg-white/5 border-cyan-500/30 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50"
//               />
//             </div>
//             <div className="space-y-3">
//               <Label htmlFor="interest" className="text-slate-300">Area of Interest</Label>
//               <Textarea
//                 id="interest"
//                 value={leadData.interest}
//                 onChange={(e) => setLeadData((prev) => ({ ...prev, interest: e.target.value }))}
//                 placeholder="What specifically are you interested in?"
//                 rows={3}
//                 className="bg-white/5 border-cyan-500/30 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
//               />
//             </div>
//             <Button 
//               type="submit" 
//               className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 border-0 text-white font-semibold py-3 transition-all duration-200"
//             >
//               Submit & Continue Chat
//             </Button>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default Chatbot;









// frontend/src/components/Chatbot.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, ArrowLeft, Mail, Building, Star, ExternalLink, Linkedin, Sparkles, Globe, Briefcase, Users, Share2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  businesses: { name: string; description: string }[];
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
        el.style.height = `${vv.height}px`;
        el.style.top = `${vv.offsetTop}px`;
      } else {
        el.style.height = `${window.innerHeight}px`;
        el.style.top = "0px";
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
    // ... your existing code
  };
  fetchAgent();
}, [id]);

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
  const templates = [
    { 
      label: "Expertise", 
      icon: <Star className="w-3.5 h-3.5" />, 
      onClick: () => handleTemplateClick("Tell me about your expertise and background.") 
    },
    { 
      label: "Business", 
      icon: <Building className="w-3.5 h-3.5" />, 
      onClick: () => handleTemplateClick("What business opportunities do you see for collaboration?") 
    },
    { 
      label: "Projects", 
      icon: <Briefcase className="w-3.5 h-3.5" />, 
      onClick: () => handleTemplateClick("Tell me about your recent projects and work.") 
    },
    { 
      label: "Connect", 
      icon: <Mail className="w-3.5 h-3.5" />, 
      onClick: () => { 
        setLeadData((prev) => ({ ...prev, interest: "Partnership inquiry" })); 
        setShowLeadModal(true); 
      } 
    },
  ];

  // Loading or Error States
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] p-4">
        <div className="text-center max-w-md px-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" />
          </div>
          <p className="text-base sm:text-lg font-semibold mb-4 text-red-400">⚠️ {error}</p>
          <Link to="/dashboard">
            <Button variant="outline" className="border-cyan-500/30 text-white hover:bg-white/5 text-sm">
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 border-[3px] border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <div className="text-sm sm:text-base text-slate-400 font-medium text-center">Loading digital twin...</div>
        </div>
      </div>
    );
  }

  return (
    /*
      Responsive, ChatGPT/Claude-style layout:
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
      style={{ position: "fixed", left: 0, right: 0 }}
      className="flex flex-col h-[100dvh] overflow-hidden bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] text-slate-200 antialiased"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-shrink-0 border-b border-white/[0.06] backdrop-blur-xl bg-[#0A1929]/80 z-40"
      >
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 h-8 w-8 p-0"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>

              {/* Agent Profile Picture */}
              {getAgentProfilePicture() ? (
                <img
                  src={getAgentProfilePicture()!}
                  alt={agent.identity.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-cyan-500/30 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center flex-shrink-0">
                  <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
                </div>
              )}

              <div className="min-w-0 flex-1 leading-tight">
                <h1 className="text-sm sm:text-[15px] font-semibold text-white tracking-tight truncate">
                  {agent.identity.name}
                </h1>
                <p className="text-[11px] sm:text-xs text-cyan-300/80 font-medium truncate">
                  {agent.identity.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Links Button */}
              {(agent.links?.linkedin || agent.links?.website || agent.links?.portfolio || agent.links?.socials) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLinksModal(true)}
                  className="rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 h-8 w-8 p-0"
                  aria-label="View all links"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              )}

              <div className="flex items-center gap-1.5 bg-white/[0.06] rounded-full px-2 sm:px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs text-slate-300 font-medium">Live</span>
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
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-cyan-500/30"
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
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-200" />
                          </div>
                        )
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-[13.5px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
                          isUser
                            ? "bg-cyan-500/15 border border-cyan-400/20 text-white rounded-tr-md"
                            : "bg-white/[0.06] border border-white/[0.06] text-slate-100 rounded-tl-md"
                        }`}
                      >
                        {message.content}
                      </div>
                      <span className="text-[10px] text-slate-500 px-1">
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
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs italic">Thinking...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Footer: Quick Templates + Input */}
      <div className="flex-shrink-0 border-t border-white/[0.06] backdrop-blur-xl bg-[#0A1929]/85 z-30 pb-[env(safe-area-inset-bottom)]">
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
                  className="flex items-center gap-1.5 rounded-full text-[12px] sm:text-xs border-white/10 bg-white/[0.03] text-slate-300 hover:bg-cyan-500/15 hover:text-white hover:border-cyan-400/30 transition-all duration-200 h-8 px-3 whitespace-nowrap flex-shrink-0"
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
              <div className="mb-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[12px] sm:text-[13px] text-amber-200 text-center">
                This digital twin is currently not available — its owner has reached their monthly chat limit.
              </div>
            )}
            <div className="flex items-center gap-2 p-1.5 rounded-full bg-white/[0.05] border border-white/10 focus-within:border-cyan-400/40 focus-within:bg-white/[0.07] transition-all duration-200">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  quotaExceeded
                    ? "Chat unavailable — owner's monthly limit reached"
                    : `Message ${agent.identity.name}...`
                }
                className="flex-1 min-w-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9 text-[14px] sm:text-[15px] px-3 sm:px-4 text-white placeholder:text-slate-500"
                disabled={loading || quotaExceeded}
                aria-label="Type your message"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading || quotaExceeded}
                variant="default"
                size="sm"
                className="h-9 w-9 p-0 rounded-full bg-gradient-to-br from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 border-0 disabled:opacity-40 transition-all duration-200 flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-1.5 hidden sm:block">
              Enter to send · Shift + Enter for new line
            </p>
          </motion.div>
        </div>
      </div>

      {/* Links Modal */}
      <Dialog open={showLinksModal} onOpenChange={setShowLinksModal}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-sm rounded-2xl bg-[#102A43] border border-white/10 p-0 flex flex-col max-h-[85dvh] overflow-hidden [&>button]:right-3.5 [&>button]:top-3.5 [&>button]:z-10 [&>button]:flex [&>button]:h-7 [&>button]:w-7 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-white/5 [&>button]:text-slate-300 [&>button]:opacity-100 [&>button]:ring-0 [&>button]:ring-offset-0 [&>button]:hover:bg-white/15 [&>button]:hover:text-white [&>button]:transition-colors">
          <DialogHeader className="pl-5 pr-14 pt-5 pb-3 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
              <Share2 className="w-4.5 h-4.5 text-cyan-400 flex-shrink-0" />
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
                className="w-full justify-start gap-3 h-13 py-3 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/25 text-white transition-all duration-200 text-left rounded-xl"
              >
                <Linkedin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">LinkedIn</div>
                  <div className="text-[11px] text-blue-300/70 truncate">Professional Profile</div>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50" />
              </Button>
            )}

            {/* Website */}
            {agent.links?.website && (
              <Button
                onClick={() => {
                  navigateToLink(agent.links!.website!);
                  setShowLinksModal(false);
                }}
                className="w-full justify-start gap-3 h-13 py-3 bg-cyan-600/15 hover:bg-cyan-600/25 border border-cyan-500/25 text-white transition-all duration-200 text-left rounded-xl"
              >
                <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">Website</div>
                  <div className="text-[11px] text-cyan-300/70 truncate">{getDomainFromUrl(agent.links!.website!)}</div>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50" />
              </Button>
            )}

            {/* Portfolio */}
            {agent.links?.portfolio && (
              <Button
                onClick={() => {
                  navigateToLink(agent.links!.portfolio!);
                  setShowLinksModal(false);
                }}
                className="w-full justify-start gap-3 h-13 py-3 bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/25 text-white transition-all duration-200 text-left rounded-xl"
              >
                <Briefcase className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">Portfolio</div>
                  <div className="text-[11px] text-purple-300/70 truncate">Teeny Tech Trek</div>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50" />
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
                className="w-full justify-start gap-3 h-12 py-3 bg-teal-600/15 hover:bg-teal-600/25 border border-teal-500/25 text-white transition-all duration-200 text-left rounded-xl"
              >
                {getLinkIcon(social)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{getDomainFromUrl(social)}</div>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50" />
              </Button>
            ))}

            {/* Additional Info */}
            <div className="text-center pt-3 mt-1 border-t border-white/5">
              <p className="text-xs text-slate-400">
                Feel free to explore my work and connect!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Capture Modal */}
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-sm rounded-2xl bg-[#102A43] border border-white/10 p-0 flex flex-col max-h-[88dvh] overflow-hidden [&>button]:right-3.5 [&>button]:top-3.5 [&>button]:z-10 [&>button]:flex [&>button]:h-7 [&>button]:w-7 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-white/5 [&>button]:text-slate-300 [&>button]:opacity-100 [&>button]:ring-0 [&>button]:ring-offset-0 [&>button]:hover:bg-white/15 [&>button]:hover:text-white [&>button]:transition-colors">
          <DialogHeader className="pl-5 pr-14 pt-5 pb-3 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
              <Building className="w-4.5 h-4.5 text-cyan-400 flex-shrink-0" />
              Let's Connect for Business
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLeadSubmit} className="flex flex-col min-h-0 flex-1">
            {/* Scrollable fields */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-300 text-xs">Full Name *</Label>
                <Input
                  id="name"
                  value={leadData.name}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/40 focus:border-cyan-500/50 h-10 text-sm rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 text-xs">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={leadData.email}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/40 focus:border-cyan-500/50 h-10 text-sm rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-slate-300 text-xs">Phone</Label>
                <Input
                  id="phone"
                  value={leadData.phone}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/40 focus:border-cyan-500/50 h-10 text-sm rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-slate-300 text-xs">Company *</Label>
                <Input
                  id="company"
                  value={leadData.company}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, company: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/40 focus:border-cyan-500/50 h-10 text-sm rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="interest" className="text-slate-300 text-xs">Area of Interest</Label>
                <Textarea
                  id="interest"
                  value={leadData.interest}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, interest: e.target.value }))}
                  placeholder="What specifically are you interested in?"
                  rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/40 focus:border-cyan-500/50 resize-none text-sm rounded-lg"
                />
              </div>
            </div>
            {/* Pinned submit button (always visible) */}
            <div className="flex-shrink-0 px-5 pt-3 pb-5 mt-2 border-t border-white/5">
              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 border-0 text-white font-semibold h-11 transition-all duration-200 text-sm"
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

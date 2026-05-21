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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    } catch (err) {
      console.error("Chat API error:", err);
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
      icon: <Star className="w-4 h-4" />, 
      onClick: () => handleTemplateClick("Tell me about your expertise and background.") 
    },
    { 
      label: "Business", 
      icon: <Building className="w-4 h-4" />, 
      onClick: () => handleTemplateClick("What business opportunities do you see for collaboration?") 
    },
    { 
      label: "Projects", 
      icon: <Briefcase className="w-4 h-4" />, 
      onClick: () => handleTemplateClick("Tell me about your recent projects and work.") 
    },
    { 
      label: "Connect", 
      icon: <Mail className="w-4 h-4" />, 
      onClick: () => { 
        setLeadData((prev) => ({ ...prev, interest: "Partnership inquiry" })); 
        setShowLeadModal(true); 
      } 
    },
  ];

  // Loading or Error States
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] p-4">
        <div className="text-center max-w-md px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
          </div>
          <p className="text-base sm:text-lg font-semibold mb-4 text-red-400">⚠️ {error}</p>
          <Link to="/dashboard">
            <Button variant="outline" className="border-cyan-500/30 text-white hover:bg-white/5 text-sm sm:text-base">
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <div className="text-base sm:text-lg text-slate-300 font-medium text-center">Loading digital twin...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-cyan-500/10 backdrop-blur-xl bg-[#0A1929]/90 sticky top-0 z-40 shadow-lg"
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 lg:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="rounded-full text-slate-300 hover:text-cyan-400 hover:bg-white/5 h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="ml-2 hidden sm:inline text-sm">Back</span>
                </Button>
              </Link>

              {/* Agent Profile Picture */}
              {getAgentProfilePicture() ? (
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={getAgentProfilePicture()!}
                  alt={agent.identity.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl object-cover shadow-lg border border-cyan-500/30 flex-shrink-0"
                />
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12  flex items-center justify-center  flex-shrink-0"
                >
                  <img src="/logo.png" alt="logo" className="w-full h-full object-contain p-1" />
                </motion.div>
              )}

              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white tracking-tight truncate">
                  {agent.identity.name}
                </h1>
                <p className="text-xs sm:text-sm text-cyan-300 font-medium truncate">
                  {agent.identity.role} • <span className="hidden xs:inline">Digital Twin</span><span className="xs:hidden">Twin</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Links Button */}
              {(agent.links?.linkedin || agent.links?.website || agent.links?.portfolio || agent.links?.socials) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLinksModal(true)}
                  className="rounded-full text-slate-300 hover:text-cyan-400 hover:bg-white/5 h-8 w-8 sm:h-9 sm:w-9 p-0"
                  aria-label="View all links"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              )}
              
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 rounded-full px-2 sm:px-3 py-1 sm:py-1.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-xs sm:text-sm text-slate-300 font-medium">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Area - with proper bottom padding for fixed elements */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-2 sm:px-3 lg:px-8 py-3 sm:py-4 lg:py-8 pb-[180px] sm:pb-[200px]">
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`flex items-start gap-2 sm:gap-3 lg:gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Message Avatar */}
                  <div className="flex-shrink-0">
                    {message.role === "assistant" ? (
                      getAgentProfilePicture() ? (
                        <img
                          src={getAgentProfilePicture()!}
                          alt={agent.identity.name}
                          className="w-7 h-7 sm:w-8 sm:h-8 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl object-cover shadow-lg border border-cyan-500/30"
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-12 lg:h-12 flex items-center justify-center ">
                          <img src="/logo.png" alt="logo" className="w-full h-full object-contain p-0.5 sm:p-1" />
                        </div>
                      )
                    ) : (
                      getUserProfilePicture() ? (
                        <img
                          src={getUserProfilePicture()}
                          alt={userProfile?.name || "User"}
                          className="w-7 h-7 sm:w-8 sm:h-8 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl object-cover shadow-lg border border-slate-400/20"
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center shadow-lg shadow-slate-500/20">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
                        </div>
                      )
                    )}
                  </div>

                  {/* Message Content */}
                  <Card
                    className={`p-3 sm:p-4 lg:p-6 pb-20 max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] rounded-xl sm:rounded-2xl border-0 shadow-sm ${
                      message.role === "assistant" 
                        ? "bg-white/10 backdrop-blur-sm shadow-cyan-500/10 border border-cyan-500/10" 
                        : "bg-cyan-500/20 shadow-cyan-500/5 border border-cyan-500/20"
                    }`}
                  >
                    <p className="text-white leading-relaxed text-xs sm:text-sm lg:text-base whitespace-pre-wrap font-medium break-words">
                      {message.content}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 lg:mt-3 flex items-center gap-1">
                      <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {message.role === "user" && <User className="w-3 h-3" />}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex items-center gap-2 sm:gap-3 text-slate-300 ml-9 sm:ml-11 lg:ml-16"
              >
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs sm:text-sm italic">Strategizing response...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Quick Templates - Fixed at bottom with proper spacing */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-cyan-500/10 backdrop-blur-xl bg-[#0A1929]/95 py-3 sm:py-4 fixed bottom-[102px] sm:bottom-[114px] left-0 right-0 z-30 shadow-lg "
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex gap-2 sm:gap-3 justify-center max-w-4xl mx-auto overflow-x-auto pb-1 scrollbar-hide">
            {templates.map((template, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={template.onClick}
                className="flex items-center gap-2 rounded-full text-sm border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/50 transition-all duration-200 h-10 px-4 sm:px-5 whitespace-nowrap flex-shrink-0 shadow-sm"
                aria-label={template.label}
              >
                {template.icon}
                <span className="font-medium">{template.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Input Area - Fixed at bottom */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border-t border-cyan-500/10 backdrop-blur-xl bg-[#0A1929]/95 fixed bottom-0 left-0 right-0 shadow-2xl z-40"
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-2xl bg-white/5 border border-cyan-500/20 focus-within:border-cyan-500/40 transition-all duration-300 shadow-lg">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Chat with ${agent.identity.name}...`}
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 sm:h-11 text-sm sm:text-base px-3 sm:px-4 text-white placeholder:text-slate-500"
                disabled={loading}
                aria-label="Type your message"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                variant="default"
                size="sm"
                className="h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-xl shadow-lg hover:shadow-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 border-0 transition-all duration-200 flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2 hidden sm:block">
              Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      </motion.div>

      {/* Links Modal - Fixed for mobile */}
      <Dialog open={showLinksModal} onOpenChange={setShowLinksModal}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] max-w-md rounded-2xl bg-[#132F4C] border border-cyan-500/20 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-white text-lg sm:text-xl">
              <Share2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              Connect & Explore
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* LinkedIn */}
            {agent.links?.linkedin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  onClick={() => {
                    navigateToLink(agent.links!.linkedin!);
                    setShowLinksModal(false);
                  }}
                  className="w-full justify-start gap-3 h-14 sm:h-16 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-white transition-all duration-200 text-left"
                >
                  <Linkedin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate">LinkedIn</div>
                    <div className="text-xs text-blue-300/80 truncate">Professional Profile</div>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-60" />
                </Button>
              </motion.div>
            )}

            {/* Website */}
            {agent.links?.website && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={() => {
                    navigateToLink(agent.links!.website!);
                    setShowLinksModal(false);
                  }}
                  className="w-full justify-start gap-3 h-14 sm:h-16 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-white transition-all duration-200 text-left"
                >
                  <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate">Website</div>
                    <div className="text-xs text-cyan-300/80 truncate">{getDomainFromUrl(agent.links!.website!)}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-60" />
                </Button>
              </motion.div>
            )}

            {/* Portfolio */}
            {agent.links?.portfolio && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={() => {
                    navigateToLink(agent.links!.portfolio!);
                    setShowLinksModal(false);
                  }}
                  className="w-full justify-start gap-3 h-14 sm:h-16 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-white transition-all duration-200 text-left"
                >
                  <Briefcase className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate">Portfolio</div>
                    <div className="text-xs text-purple-300/80 truncate">Teeny Tech Trek</div>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-60" />
                </Button>
              </motion.div>
            )}

            {/* Social Links */}
            {agent.links?.socials && agent.links.socials.map((social, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Button
                  onClick={() => {
                    navigateToLink(social);
                    setShowLinksModal(false);
                  }}
                  className="w-full justify-start gap-3 h-12 sm:h-14 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 text-white transition-all duration-200 text-left"
                >
                  {getLinkIcon(social)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{getDomainFromUrl(social)}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-60" />
                </Button>
              </motion.div>
            ))}

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center pt-4 border-t border-cyan-500/10"
            >
              <p className="text-sm text-slate-400">
                Feel free to explore my work and connect!
              </p>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Capture Modal */}
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] max-w-md rounded-2xl bg-[#132F4C] border border-cyan-500/20 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-white text-lg sm:text-xl">
              <Building className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              Let's Connect for Business
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLeadSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300 text-sm">Full Name *</Label>
              <Input
                id="name"
                value={leadData.name}
                onChange={(e) => setLeadData((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="bg-white/5 border-cyan-500/30 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50 h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm">Email *</Label>
              <Input
                id="email"
                type="email"
                value={leadData.email}
                onChange={(e) => setLeadData((prev) => ({ ...prev, email: e.target.value }))}
                required
                className="bg-white/5 border-cyan-500/30 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50 h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300 text-sm">Phone</Label>
              <Input
                id="phone"
                value={leadData.phone}
                onChange={(e) => setLeadData((prev) => ({ ...prev, phone: e.target.value }))}
                className="bg-white/5 border-cyan-500/30 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50 h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-slate-300 text-sm">Company *</Label>
              <Input
                id="company"
                value={leadData.company}
                onChange={(e) => setLeadData((prev) => ({ ...prev, company: e.target.value }))}
                required
                className="bg-white/5 border-cyan-500/30 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50 h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest" className="text-slate-300 text-sm">Area of Interest</Label>
              <Textarea
                id="interest"
                value={leadData.interest}
                onChange={(e) => setLeadData((prev) => ({ ...prev, interest: e.target.value }))}
                placeholder="What specifically are you interested in?"
                rows={3}
                className="bg-white/5 border-cyan-500/30 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none text-base"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 border-0 text-white font-semibold py-3 h-12 transition-all duration-200 text-base shadow-lg"
            >
              Submit & Continue Chat
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chatbot;
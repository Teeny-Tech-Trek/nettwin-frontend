import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  QrCode,
  FileText,
  LayoutDashboard,
  Bot,
  Zap,
  Shield,
  ChevronRight,
  ChevronLeft,
  X,
  Star,
  CheckCircle2,
  ArrowRight,
  Globe,
  Settings,
  Users,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface OnboardingStep {
  id: string;
  icon: React.ReactNode;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  tag: string;
  title: string;
  description: string;
  bullets: { icon: React.ReactNode; text: string }[];
  visual: React.ReactNode;
}

// ─────────────────────────────────────────────
// Visual Sub-components
// ─────────────────────────────────────────────
const WelcomeVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <motion.div
      className="relative"
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      <div
        className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
          boxShadow: "0 0 60px 15px rgba(59,130,246,0.35)",
        }}
      >
        {/* Subtle grid pattern inside */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:16px_16px]" />
        <Bot size={56} className="text-white relative z-10" />
      </div>
      {[
        { style: { top: "-10px", left: "50%" }, delay: 0 },
        { style: { top: "25%", right: "-16px" }, delay: 0.6 },
        { style: { bottom: "8%", left: "-14px" }, delay: 1.2 },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={s.style as React.CSSProperties}
          animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, delay: s.delay }}
        >
          <Star size={16} className="text-cyan-300 fill-cyan-300" />
        </motion.div>
      ))}
    </motion.div>
    <motion.div
      className="absolute bottom-0 px-4 py-2 rounded-xl text-xs font-semibold text-white"
      style={{
        background: "rgba(59,130,246,0.2)",
        border: "1px solid rgba(59,130,246,0.35)",
        backdropFilter: "blur(4px)",
      }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, delay: 0.8 }}
    >
      ✨ Custom AI Avatar Clone
    </motion.div>
  </div>
);

const ChatVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <div className="space-y-3 w-full max-w-[210px]">
      {[
        { sender: "Visitor", text: "Can you tell me about your React experience?", isUser: true, color: "#22d3ee" },
        { sender: "AI Twin", text: "I have 5+ years building highly interactive SaaS dashboards...", isUser: false, color: "#a855f7" },
      ].map((msg, i) => (
        <motion.div
          key={i}
          className={`p-3 rounded-2xl max-w-[90%] text-xs relative ${
            msg.isUser ? "ml-auto" : "mr-auto"
          }`}
          style={{
            background: msg.isUser
              ? "rgba(34,211,238,0.12)"
              : "rgba(168,85,247,0.12)",
            border: `1px solid ${msg.isUser ? "rgba(34,211,238,0.22)" : "rgba(168,85,247,0.22)"}`,
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.4 }}
        >
          <span className="block text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: msg.color }}>
            {msg.sender}
          </span>
          <p className="text-white/80 leading-relaxed text-[11px]">{msg.text}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const QrVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <div className="relative p-4 rounded-3xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Visual QR grid container */}
      <div className="w-24 h-24 relative flex items-center justify-center">
        <QrCode size={80} className="text-cyan-400" />
        {/* Pulsing Scan Beam */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-cyan-400"
          style={{ boxShadow: "0 0 10px #22d3ee" }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  </div>
);

const ResumeVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <div className="w-full max-w-[200px] space-y-2">
      {[
        { label: "Lead Architect", place: "Tech Corp", active: true },
        { label: "Senior Engineer", place: "Startup Inc", active: false },
        { label: "Full Stack Developer", place: "Agency Ltd", active: false },
      ].map((item, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-3 p-2.5 rounded-xl text-left"
          style={{
            background: item.active ? "rgba(236,72,153,0.1)" : "rgba(255,255,255,0.03)",
            border: item.active ? "1px solid rgba(236,72,153,0.22)" : "1px solid rgba(255,255,255,0.06)",
          }}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.15 }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: item.active ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.05)",
              color: item.active ? "#ec4899" : "rgba(255,255,255,0.4)",
            }}
          >
            <FileText size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-white text-[11px] font-semibold truncate leading-none mb-1">{item.label}</p>
            <p className="text-white/40 text-[9px] truncate leading-none">{item.place}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const DashboardVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <div className="w-full max-w-[200px] space-y-2.5">
      <div className="flex gap-2">
        <div className="flex-1 p-2 rounded-xl text-center" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}>
          <p className="text-[#10b981] text-xs font-black">1.2K</p>
          <p className="text-white/40 text-[8px] uppercase">Twin Views</p>
        </div>
        <div className="flex-1 p-2 rounded-xl text-center" style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.18)" }}>
          <p className="text-[#22d3ee] text-xs font-black">98%</p>
          <p className="text-white/40 text-[8px] uppercase">Accuracy</p>
        </div>
      </div>
      {/* Simulated bar chart line */}
      <div className="h-10 w-full flex items-end gap-1.5 px-1">
        {[20, 60, 45, 90, 30, 75, 55, 40].map((val, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              background: "linear-gradient(to top, rgba(34,211,238,0.8), rgba(34,211,238,0.2))",
            }}
            initial={{ height: 0 }}
            animate={{ height: `${val}%` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Steps Definition
// ─────────────────────────────────────────────
const STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    icon: <Sparkles size={22} />,
    accentColor: "#3b82f6",
    gradientFrom: "rgba(59,130,246,0.15)",
    gradientTo: "rgba(59,130,246,0.03)",
    tag: "Welcome to",
    title: "Net Twin",
    description: "Your digital AI twin that works 24/7. Represent your expertise, share interactive showcases, and let clients query your AI clone dynamically.",
    bullets: [
      { icon: <Bot size={14} />, text: "Fully personalized AI representations" },
      { icon: <Zap size={14} />, text: "Ready to deploy in less than 2 minutes" },
      { icon: <Shield size={14} />, text: "Full ownership of your knowledge base" },
    ],
    visual: <WelcomeVisual />,
  },
  {
    id: "chat",
    icon: <MessageSquare size={22} />,
    accentColor: "#a855f7",
    gradientFrom: "rgba(168,85,247,0.15)",
    gradientTo: "rgba(168,85,247,0.03)",
    tag: "Feature 01",
    title: "AI Twin Chat",
    description: "Your clone learns your expertise, tone, and achievements, offering dynamic and intelligent conversations with potential clients or recruiters.",
    bullets: [
      { icon: <MessageSquare size={14} />, text: "Natural conversational replies" },
      { icon: <Sparkles size={14} />, text: "Learns directly from custom docs & files" },
      { icon: <Bot size={14} />, text: "Always online, engaging 24/7" },
    ],
    visual: <ChatVisual />,
  },
  {
    id: "qr",
    icon: <QrCode size={22} />,
    accentColor: "#22d3ee",
    gradientFrom: "rgba(34,211,238,0.15)",
    gradientTo: "rgba(34,211,238,0.03)",
    tag: "Feature 02",
    title: "Instant QR Access",
    description: "Generate customized QR codes for business cards, resumes, or presentations. Clients scan to connect with your AI Twin instantly.",
    bullets: [
      { icon: <QrCode size={14} />, text: "One-scan mobile accessibility" },
      { icon: <Zap size={14} />, text: "Zero configuration, instant loading" },
      { icon: <Globe size={14} />, text: "Embed on any personal webpage" },
    ],
    visual: <QrVisual />,
  },
  {
    id: "resume",
    icon: <FileText size={22} />,
    accentColor: "#ec4899",
    gradientFrom: "rgba(236,72,153,0.15)",
    gradientTo: "rgba(236,72,153,0.03)",
    tag: "Feature 03",
    title: "Resume & Showcases",
    description: "Host interactive portfolio timelines, work history, and custom showcases. Visitors can browse your career journey with rich media support.",
    bullets: [
      { icon: <FileText size={14} />, text: "Interactive career timeline" },
      { icon: <Globe size={14} />, text: "High fidelity project showcases" },
      { icon: <Star size={14} />, text: "Highlight top credentials & certificates" },
    ],
    visual: <ResumeVisual />,
  },
  {
    id: "dashboard",
    icon: <LayoutDashboard size={22} />,
    accentColor: "#10b981",
    gradientFrom: "rgba(16,185,129,0.15)",
    gradientTo: "rgba(16,185,129,0.03)",
    tag: "Feature 04",
    title: "Unified Dashboard",
    description: "Manage multiple digital twins, view comprehensive visitor interaction histories, configure custom styling, and update twin data in real-time.",
    bullets: [
      { icon: <LayoutDashboard size={14} />, text: "Visitor analytics & view counts" },
      { icon: <Settings size={14} />, text: "Customize styling & layout" },
      { icon: <Users size={14} />, text: "Direct message history review" },
    ],
    visual: <DashboardVisual />,
  },
];

// ─────────────────────────────────────────────
// Progress Dots
// ─────────────────────────────────────────────
const ProgressDots = ({ total, current, accentColor }: { total: number; current: number; accentColor: string }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }).map((_, i) => (
      <motion.div
        key={i}
        className="rounded-full"
        style={{ background: i === current ? accentColor : "rgba(255,255,255,0.15)" }}
        animate={{ width: i === current ? 24 : 6, height: 6 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const ONBOARDING_KEY_PERSISTENT = "nettwin_onboarding_v1";
const ONBOARDING_KEY_SESSION = "nettwin_onboarding_session_v1";

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const OnboardingFlow: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      // Logged-in user: show only once ever
      const seen = localStorage.getItem(ONBOARDING_KEY_PERSISTENT);
      if (!seen) {
        const t = setTimeout(() => setVisible(true), 700);
        return () => clearTimeout(t);
      }
    } else {
      // Guest: show once per browser session
      const seen = sessionStorage.getItem(ONBOARDING_KEY_SESSION);
      if (!seen) {
        const t = setTimeout(() => setVisible(true), 700);
        return () => clearTimeout(t);
      }
    }
  }, [user, isLoading]);

  const dismiss = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      if (user) {
        localStorage.setItem(ONBOARDING_KEY_PERSISTENT, "true");
      } else {
        sessionStorage.setItem(ONBOARDING_KEY_SESSION, "true");
      }
    }, 350);
  }, [user]);

  const goNext = useCallback(() => {
    if (currentStep >= STEPS.length - 1) { dismiss(); return; }
    setDirection(1);
    setCurrentStep((s) => s + 1);
  }, [currentStep, dismiss]);

  const goPrev = useCallback(() => {
    if (currentStep <= 0) return;
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  }, [currentStep]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, goNext, goPrev, dismiss]);

  if (!visible) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -50, opacity: 0 }),
  };

  return (
    <AnimatePresence>
      {!closing && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[999]"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-[760px] rounded-[2.5rem] overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #05050f 0%, #0d122b 100%)",
                border: `1px solid ${step.accentColor}28`,
                boxShadow: `0 50px 120px -20px rgba(0,0,0,0.85), 0 0 0 1px ${step.accentColor}12, inset 0 1px 0 rgba(255,255,255,0.04)`,
              }}
              initial={{ scale: 0.88, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 20, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.175, 0.885, 0.32, 1.1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated top accent gradient border */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-[2.5px]"
                style={{ background: "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)" }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />

              {/* Background radial glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 75% 10%, ${step.accentColor}12 0%, transparent 55%)` }}
              />

              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center group transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
                aria-label="Close"
              >
                <X size={16} className="text-white/50 group-hover:text-white/90 transition-colors" />
              </button>

              <div className="flex flex-col md:flex-row min-h-[480px]">
                {/* Left Text Column */}
                <div className="flex flex-col justify-between p-9 md:p-11 flex-1">
                  <div>
                    {/* Tag pill */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step.id + "-tag"}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6"
                        style={{ background: `${step.accentColor}18`, border: `1px solid ${step.accentColor}40`, color: step.accentColor }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span style={{ color: step.accentColor }}>{step.icon}</span>
                        {step.tag}
                      </motion.div>
                    </AnimatePresence>

                    {/* Title */}
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.h2
                        key={step.id + "-title"}
                        className="text-4xl md:text-[2.6rem] font-black text-white leading-tight mb-4 font-syne-bold"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                      >
                        {step.title}
                      </motion.h2>
                    </AnimatePresence>

                    {/* Description */}
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.p
                        key={step.id + "-desc"}
                        className="text-white/55 text-[15px] leading-relaxed mb-7"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.28, delay: 0.05, ease: "easeInOut" }}
                      >
                        {step.description}
                      </motion.p>
                    </AnimatePresence>

                    {/* Bullets */}
                    <AnimatePresence mode="wait">
                      <motion.ul
                        key={step.id + "-bullets"}
                        className="space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {step.bullets.map((b, i) => (
                          <motion.li
                            key={i}
                            className="flex items-center gap-3 text-sm"
                            initial={{ x: -16, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.08 + 0.1 }}
                          >
                            <span
                              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `${step.accentColor}18`, color: step.accentColor }}
                            >
                              {b.icon}
                            </span>
                            <span className="text-white/75 font-medium">{b.text}</span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </AnimatePresence>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between mt-9">
                    <ProgressDots total={STEPS.length} current={currentStep} accentColor={step.accentColor} />
                    <div className="flex items-center gap-2">
                      {currentStep > 0 && (
                        <button
                          onClick={goPrev}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                          aria-label="Previous"
                        >
                          <ChevronLeft size={18} className="text-white/60" />
                        </button>
                      )}
                      <motion.button
                        onClick={goNext}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${step.accentColor} 0%, ${step.accentColor}bb 100%)`,
                          boxShadow: `0 4px 24px ${step.accentColor}50`,
                        }}
                        whileHover={{ scale: 1.05, boxShadow: `0 6px 30px ${step.accentColor}70` }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {isLast ? (<>Get Started <ArrowRight size={15} /></>) : (<>Next <ChevronRight size={15} /></>)}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Right Visual Panel */}
                <div
                  className="relative md:w-[280px] h-[220px] md:h-auto flex items-center justify-center p-7 overflow-hidden shrink-0"
                  style={{
                    background: `linear-gradient(145deg, ${step.gradientFrom} 0%, ${step.gradientTo} 100%)`,
                    borderLeft: `1px solid ${step.accentColor}18`,
                  }}
                >
                  {/* Grid overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: `linear-gradient(${step.accentColor} 1px, transparent 1px), linear-gradient(90deg, ${step.accentColor} 1px, transparent 1px)`,
                      backgroundSize: "28px 28px",
                    }}
                  />
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step.id + "-visual"}
                      className="relative z-10 w-full h-full"
                      custom={direction}
                      variants={{
                        enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
                        center: { x: 0, opacity: 1 },
                        exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.32, ease: "easeInOut" }}
                    >
                      {step.visual}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom Skip Bar */}
              <div className="px-10 pb-6 pt-0 flex justify-center">
                <button
                  onClick={dismiss}
                  className="text-xs text-white/25 hover:text-white/55 transition-colors"
                >
                  Skip introduction · Press Esc to close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingFlow;

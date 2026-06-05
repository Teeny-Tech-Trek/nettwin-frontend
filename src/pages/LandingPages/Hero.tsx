import {
  ArrowRight,
  MessageCircle,
  Clock,
  Shield,
  Sparkles,
  Play,
  Check,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import React from "react";

// const HeroImg = "/HeroPage/HeroRightSideImage.png";

// ─────────────────────────────────────────────
// Ring component
// ─────────────────────────────────────────────
interface RingProps {
  sizePct: string; duration: string; reverse?: boolean;
  dashed?: boolean; dotColor?: string; showDot?: boolean; opacity?: number;
}
const Ring: React.FC<RingProps> = ({
  sizePct, duration, reverse = false, dashed = false,
  dotColor = "#a855f7", showDot = true, opacity = 0.22,
}) => (
  <div style={{
    position:"absolute", width:sizePct, aspectRatio:"1 / 1",
    top:"50%", left:"50%", transform:"translate(-50%, -50%)",
    borderRadius:"50%",
    border:`1px ${dashed ? "dashed" : "solid"} rgba(139,92,246,${opacity})`,
    animation:`nt-ring-${reverse ? "rev" : "fwd"} ${duration} linear infinite`,
    pointerEvents:"none",
  }}>
    {showDot && (
      <div style={{
        position:"absolute", top:0, left:"50%",
        transform:"translate(-50%, -50%)",
        width:"8px", height:"8px", borderRadius:"50%",
        background:dotColor, boxShadow:`0 0 8px ${dotColor}, 0 0 18px ${dotColor}`,
      }} />
    )}
  </div>
);

// ─────────────────────────────────────────────
// FloatingCard
// ─────────────────────────────────────────────
interface FloatingCardProps {
  children: React.ReactNode; style: React.CSSProperties;
  delay?: number; floatDir?: 1 | -1; width?: string;
}
const FloatingCard: React.FC<FloatingCardProps> = ({
  children, style, delay = 0, floatDir = 1, width = "auto",
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.82, y: -12 }}
    animate={{ opacity: 1, scale: 1,    y: 0   }}
    transition={{ delay, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    className="hidden lg:block absolute z-20"
    style={{ ...style, width }}
  >
    <motion.div
      animate={{ y: [0, -6 * floatDir, 0] }}
      transition={{ duration: 3.4 + delay * 0.6, repeat: Infinity, ease: "easeInOut" }}
      className="rounded-xl overflow-visible backdrop-blur-md"
      style={{
        background:"rgba(10, 6, 32, 0.88)",
        border:"1px solid rgba(196,181,253,0.72)",
        boxShadow:"0 0 24px rgba(124,58,237,0.30), 0 10px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {children}
    </motion.div>
  </motion.div>
);

// ─────────────────────────────────────────────
// WaveBars
// ─────────────────────────────────────────────
const WaveBars: React.FC = () => {
  const BARS = [0.45, 0.70, 1.0, 0.85, 0.55, 0.90, 0.65, 1.0, 0.45, 0.75, 0.55];
  return (
    <div className="flex items-center gap-[3px] h-[28px]">
      {BARS.map((h, i) => (
        <div key={i} className="rounded-full flex-shrink-0" style={{
          width:"3px",
          background:"linear-gradient(180deg, #c4b5fd 0%, #7c3aed 100%)",
          boxShadow:"0 0 5px rgba(196,181,253,0.45)",
          animation:`nt-wave ${0.9 + (i % 4) * 0.18}s ease-in-out infinite alternate`,
          animationDelay:`${(i * 0.09).toFixed(2)}s`,
          height:`${Math.round(28 * h)}px`,
        }} />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// useTypewriter — types text, holds, clears, loops
// ─────────────────────────────────────────────
const useTypewriter = (
  text: string,
  speed    = 42,   // ms per char (forward)
  holdMs   = 2800, // ms to hold after fully typed
  clearSpd = 16,   // ms per char (backward)
) => {
  const chars = useMemo(() => Array.from(text), [text]);
  const [len, setLen]     = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "clearing">("typing");

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (len < chars.length) t = setTimeout(() => setLen(l => l + 1), speed);
      else                    t = setTimeout(() => setPhase("holding"), holdMs);
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("clearing"), 300);
    } else {
      if (len > 0) t = setTimeout(() => setLen(l => l - 1), clearSpd);
      else         setPhase("typing");
    }
    return () => clearTimeout(t);
  }, [len, phase, chars, speed, holdMs, clearSpd]);

  return {
    displayed:  chars.slice(0, len).join(""),
    showCaret:  phase === "typing" || (phase === "holding" && len === chars.length),
  };
};

// ─────────────────────────────────────────────
// TypewriterText — inline span with blinking caret
// ─────────────────────────────────────────────
interface TypewriterTextProps {
  text: string; speed?: number; holdMs?: number; clearSpd?: number;
  className?: string; style?: React.CSSProperties;
}
const TypewriterText: React.FC<TypewriterTextProps> = ({
  text, speed, holdMs, clearSpd, className, style,
}) => {
  const { displayed, showCaret } = useTypewriter(text, speed, holdMs, clearSpd);
  return (
    <span className={className} style={style}>
      {displayed}
      {showCaret && <span className="nt-caret" />}
    </span>
  );
};

// ─────────────────────────────────────────────
// SequentialAttributes — types each attribute
// one by one, holds all visible, clears, loops
// ─────────────────────────────────────────────
const ATTR_LIST = ["Professional", "Responsive", "Intelligent"] as const;

const SequentialAttributes: React.FC = () => {
  const [done, setDone]   = useState(0);   // attrs fully typed
  const [cur, setCur]     = useState(0);   // current attr index
  const [chars, setChars] = useState(0);   // chars typed for current
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (holding) {
      t = setTimeout(() => {
        setHolding(false);
        setDone(0); setCur(0); setChars(0);
      }, 3200);
      return () => clearTimeout(t);
    }
    if (cur >= ATTR_LIST.length) { setHolding(true); return; }
    const word = ATTR_LIST[cur];
    if (chars < word.length) {
      t = setTimeout(() => setChars(c => c + 1), 55);
    } else {
      t = setTimeout(() => {
        setDone(d => d + 1);
        setCur(c => c + 1);
        setChars(0);
      }, 340);
    }
    return () => clearTimeout(t);
  }, [cur, chars, holding]);

  const CheckBadge = () => (
    <div className="w-[16px] h-[16px] rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        background:"linear-gradient(135deg,rgba(196,181,253,0.25),rgba(124,58,237,0.15))",
        border:"1px solid rgba(196,181,253,0.4)",
      }}>
      <Check size={9} style={{ color:"#c4b5fd" }} strokeWidth={3} />
    </div>
  );

  return (
    <>
      {/* Fully typed attrs */}
      {ATTR_LIST.slice(0, done).map(attr => (
        <div key={attr} className="flex items-center justify-between py-[5px]"
          style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-[10.5px]" style={{ color:"rgba(255,255,255,0.72)" }}>{attr}</span>
          <CheckBadge />
        </div>
      ))}
      {/* Currently typing attr */}
      {!holding && cur < ATTR_LIST.length && (
        <div className="flex items-center justify-between py-[5px]"
          style={{ borderTop: done > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
          <span className="text-[10.5px]" style={{ color:"rgba(255,255,255,0.72)" }}>
            {ATTR_LIST[cur].slice(0, chars)}
            <span className="nt-caret" />
          </span>
        </div>
      )}
    </>
  );
};

// ─────────────────────────────────────────────
// Main HeroSection
// ─────────────────────────────────────────────
const HeroSection = () => {
  const [imgLoaded, setImgLoaded] = useState(false);

  const particles = useMemo(
    () => Array.from({ length: 70 }).map(() => ({
      width:    Math.random() * 1.5 + 0.5,
      left:     Math.random() * 100,
      top:      Math.random() * 100,
      opacity:  Math.random() * 0.5 + 0.1,
      duration: 3 + Math.random() * 4,
      delay:    Math.random() * 5,
    })),
    []
  );

  useEffect(() => {
    const img = new Image();
    img.src = "https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/HeroRightSideImage.webp";
    img.onload = () => setImgLoaded(true);
    if (img.complete) setImgLoaded(true);
  }, []);

  const containerVariants: Variants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
  };
  const itemVariants: Variants = {
    hidden:  { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
  };
  const rightVariants: Variants = {
    hidden:  { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden body-font pt-24 sm:pt-28 md:pt-[120px] pb-12 sm:pb-16 md:pb-[120px]"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes hero-pulse    { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes glow-shift    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-10px) scale(1.05)} }
        @keyframes nt-ring-fwd   { to { transform: translate(-50%,-50%) rotate(360deg);  } }
        @keyframes nt-ring-rev   { to { transform: translate(-50%,-50%) rotate(-360deg); } }
        @keyframes nt-wave       { 0% { transform: scaleY(0.35); } 100% { transform: scaleY(1); } }
        @keyframes nt-glow-pulse { 0%,100%{opacity:0.6;transform:translateX(-50%) scale(1);} 50%{opacity:0.9;transform:translateX(-50%) scale(1.08);} }
        @keyframes nt-caret      { 0%,100%{opacity:1} 50%{opacity:0} }

        .nt-caret  {
          display:inline-block; width:1.5px; height:0.85em;
          background:rgba(196,181,253,0.9); margin-left:1px;
          vertical-align:middle;
          animation:nt-caret 0.75s steps(2) infinite;
        }
      `}</style>

      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{ top:"5%", right:"-10%", width:"70%", height:"90%",
          background:"radial-gradient(ellipse at center,rgba(59,130,246,0.22) 0%,rgba(99,102,241,0.12) 30%,rgba(139,92,246,0.08) 50%,transparent 70%)",
          animation:"glow-shift 12s ease-in-out infinite" }} />
        <div className="absolute" style={{ bottom:"-10%", right:"10%", width:"50%", height:"60%",
          background:"radial-gradient(ellipse at center,rgba(139,92,246,0.18) 0%,transparent 60%)" }} />
        <div className="absolute" style={{ top:"20%", left:"-10%", width:"50%", height:"60%",
          background:"radial-gradient(ellipse at center,rgba(59,130,246,0.08) 0%,transparent 60%)" }} />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            width:`${p.width}px`, height:`${p.width}px`,
            left:`${p.left}%`, top:`${p.top}%`,
            opacity:p.opacity,
            animation:`hero-pulse ${p.duration}s ease-in-out infinite`,
            animationDelay:`${p.delay}s`,
          }} />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-10 lg:gap-16 items-center">

          {/* ════════ LEFT — text ════════ */}
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={containerVariants}
            className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left gap-5 sm:gap-6"
          >
            <motion.div variants={itemVariants}
              className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full w-fit max-w-full flex-wrap justify-center"
              style={{ background:"rgba(15,23,42,0.5)", border:"1px solid rgba(96,165,250,0.22)", backdropFilter:"blur(10px)", boxShadow:"0 0 20px rgba(59,130,246,0.08)" }}>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color:"#60a5fa" }} fill="#60a5fa" strokeWidth={0} />
              <span className="text-xs sm:text-sm font-medium text-white/90">AI-Powered</span>
              <span className="text-white/30">•</span>
              <span className="text-xs sm:text-sm font-medium text-white/90">Always With You</span>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full">
              <h1 className="hero-font font-extrabold leading-[1.05] tracking-tight"
                style={{ fontSize:"clamp(2rem, 7vw, 4rem)" }}>
                <span className="block text-white font-syne-bold">Your AI-Powered</span>
                <span className="block font-syne-bold" style={{
                  background:"linear-gradient(90deg,#22d3ee 0%,#3b82f6 50%,#a855f7 100%)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  backgroundClip:"text", paddingBottom:"0.1em",
                }}>Digital Twin</span>
              </h1>
            </motion.div>

            <motion.p variants={itemVariants}
              className="text-sm sm:text-base md:text-[17px] leading-relaxed max-w-xl px-2 sm:px-0"
              style={{ color:"rgba(255,255,255,0.65)" }}>
              Create an intelligent persona that represents you professionally.
              Connect with clients through AI-powered conversations, available 24/7.
            </motion.p>

            <motion.div variants={itemVariants}
              className="flex w-full flex-col sm:w-auto sm:flex-row gap-3 sm:gap-4 mt-2">
              <a href="/login"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
                style={{ background:"linear-gradient(90deg,#22d3ee 0%,#3b82f6 50%,#a855f7 100%)", boxShadow:"0 0 35px rgba(59,130,246,0.4)" }}>
                Create Your Twin <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#demoVideo"
                onClick={(e) => { e.preventDefault(); document.getElementById("demoVideo")?.scrollIntoView({ behavior:"smooth", block:"start" }); }}
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-7 py-3 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
                style={{ border:"1px solid rgba(255,255,255,0.12)", background:"rgba(15,23,42,0.4)", backdropFilter:"blur(10px)" }}>
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background:"rgba(15,23,42,0.6)", border:"1px solid rgba(255,255,255,0.15)" }}>
                  <Play className="w-3 h-3 text-white" fill="white" strokeWidth={0} style={{ marginLeft:"1px" }} />
                </span>
                Watch Demo
              </a>
            </motion.div>

            <motion.div variants={itemVariants}
              className="hidden sm:grid w-full grid-cols-3 gap-4 sm:gap-6 mt-5 sm:mt-6 max-w-xl">
              <FeatureItem icon={<MessageCircle className="w-5 h-5" style={{ color:"#60a5fa" }} strokeWidth={2} />}
                title="AI Conversations" subtitle="Natural & Smart"
                bg="linear-gradient(135deg,rgba(59,130,246,0.18),rgba(96,165,250,0.04))"
                border="rgba(96,165,250,0.28)" />
              <FeatureItem icon={<Clock className="w-5 h-5" style={{ color:"#a78bfa" }} strokeWidth={2} />}
                title="24/7 Availability" subtitle="Always Online"
                bg="linear-gradient(135deg,rgba(139,92,246,0.18),rgba(167,139,250,0.04))"
                border="rgba(167,139,250,0.28)" />
              <FeatureItem icon={<Shield className="w-5 h-5" style={{ color:"#60a5fa" }} strokeWidth={2} />}
                title="Secure & Private" subtitle="Your Data, Protected"
                bg="linear-gradient(135deg,rgba(59,130,246,0.18),rgba(96,165,250,0.04))"
                border="rgba(96,165,250,0.28)" />
            </motion.div>
          </motion.div>

          {/* ════════ RIGHT — stage ════════ */}
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={rightVariants}
            className="w-full lg:w-1/2 relative"
          >
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ width:"min(520px, 90%)", aspectRatio:"1 / 1", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
                background:"radial-gradient(circle,rgba(108,63,197,0.32) 0%,transparent 70%)" }}
              animate={{ scale:[1,1.12,1], opacity:[0.55,0.85,0.55] }}
              transition={{ duration:4, repeat:Infinity }}
            />

            <div className="relative w-full max-w-[560px] mx-auto">

              {/* Rings */}
              <div className="absolute inset-0 pointer-events-none z-[1]">
                <Ring sizePct="80%" duration="30s" reverse={false} dotColor="#a855f7" opacity={0.22} />
                <Ring sizePct="60%" duration="20s" reverse={true}  dotColor="#60a5fa" opacity={0.28} showDot />
                <Ring sizePct="42%" duration="14s" reverse={false} dashed dotColor="#c4b5fd" opacity={0.20} showDot={false} />
                <Ring sizePct="92%" duration="45s" reverse={true}  showDot={false} opacity={0.10} />
              </div>

              {/* Platform glow */}
              <div className="absolute pointer-events-none z-[2]"
                style={{ bottom:"6%", left:"50%", width:"58%", height:"70px",
                  background:"radial-gradient(ellipse at center,rgba(139,92,246,0.65) 0%,rgba(99,102,241,0.35) 40%,transparent 75%)",
                  filter:"blur(18px)", animation:"nt-glow-pulse 3.5s ease-in-out infinite" }} />
              <div className="absolute pointer-events-none z-[3]"
                style={{ bottom:"9%", left:"20%", right:"20%", height:"1px",
                  background:"linear-gradient(90deg,transparent,rgba(139,92,246,0.5),rgba(196,181,253,0.6),rgba(139,92,246,0.5),transparent)" }} />

              {/* Hero image */}
              {imgLoaded && (
                <motion.img src="https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/HeroRightSideImage.webp" alt="AI Digital Twin"
                  loading="eager" decoding="sync" draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="relative z-[10] w-full h-auto select-none pointer-events-none"
                  style={{ filter:"drop-shadow(0 0 50px rgba(99,102,241,0.40)) drop-shadow(0 0 20px rgba(139,92,246,0.30))",
                    WebkitUserDrag:"none" } as React.CSSProperties} />
              )}

              {/* ══ FLOATING CARDS ══ */}

              {/* 1 — Chat bubble */}
              <FloatingCard delay={0.40} floatDir={1} width="68px"
                style={{ top:"3%", left:"7%", transform:"translateX(-50%)" }}>
                <div className="w-[68px] h-[68px] flex items-center justify-center rounded-xl">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background:"linear-gradient(135deg,rgba(196,181,253,0.25),rgba(124,58,237,0.12))",
                      border:"1px solid rgba(196,181,253,0.45)", boxShadow:"0 0 16px rgba(196,181,253,0.35)" }}>
                    <MessageCircle size={18} style={{ color:"#c4b5fd" }} strokeWidth={2.2} />
                  </div>
                </div>
              </FloatingCard>

              {/* 2 — Client Inquiry (TYPING message) */}
              <FloatingCard delay={0.55} floatDir={-1} width="190px"
                style={{ top:"26%", left:"-6%" }}>
                <div className="p-3.5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background:"linear-gradient(135deg,rgba(196,181,253,0.30),rgba(124,58,237,0.15))",
                        border:"1px solid rgba(196,181,253,0.4)", boxShadow:"0 0 8px rgba(196,181,253,0.30)" }}>
                      <MessageCircle size={12} style={{ color:"#d8b4fe" }} strokeWidth={2.4} />
                    </div>
                    <span className="text-[11.5px] font-bold text-white leading-none">Client Inquiry</span>
                  </div>

                  {/* ← TYPING ANIMATION */}
                  <div className="rounded-lg px-2.5 py-2 mb-2.5 min-h-[46px]"
                    style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <TypewriterText
                      text="Hello! Can you tell me more about your services?"
                      speed={44} holdMs={2600} clearSpd={15}
                      className="text-[10.5px] leading-[1.45]"
                      style={{ color:"rgba(255,255,255,0.78)" }}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ background:"linear-gradient(135deg,#60a5fa,#a855f7)", boxShadow:"0 0 6px rgba(168,85,247,0.5)" }} />
                    <span className="text-[9px] font-medium" style={{ color:"rgba(255,255,255,0.45)" }}>
                      Client · just now
                    </span>
                  </div>
                </div>
              </FloatingCard>

              {/* 3 — NetTwin Profile (SEQUENTIAL TYPING attributes) */}
              <FloatingCard delay={0.65} floatDir={1} width="172px"
                style={{ top:"4%", right:"-10%" }}>
                <div className="p-3">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-[12px]"
                      style={{ background:"linear-gradient(135deg,#3b82f6,#7c3aed)", boxShadow:"0 0 12px rgba(124,58,237,0.55)" }}>
                      NT
                    </div>
                    <div>
                      <div className="font-bold text-[12px] text-white leading-none mb-0.5">NetTwin</div>
                      <div className="flex items-center gap-1 text-[9.5px]" style={{ color:"#4ade80" }}>
                        <span className="w-[5px] h-[5px] rounded-full bg-green-400 flex-shrink-0"
                          style={{ boxShadow:"0 0 5px #4ade80" }} />
                        Online
                      </div>
                    </div>
                  </div>
                  {/* ← SEQUENTIAL TYPING ATTRIBUTES */}
                  <SequentialAttributes />
                </div>
              </FloatingCard>

              {/* 4 — AI Voice */}
              <FloatingCard delay={0.78} floatDir={-1} width="158px"
                style={{ top:"40%", right:"2%" }}>
                <div className="px-3.5 py-3">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-[22px] h-[22px] rounded-md flex-shrink-0 flex items-center justify-center"
                      style={{ background:"linear-gradient(135deg,rgba(196,181,253,0.28),rgba(124,58,237,0.14))",
                        border:"1px solid rgba(196,181,253,0.4)", boxShadow:"0 0 8px rgba(196,181,253,0.28)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d8b4fe" strokeWidth="2.4" strokeLinecap="round">
                        <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-white">AI Voice</span>
                  </div>
                  <WaveBars />
                  <div className="mt-1.5 text-[9px]" style={{ color:"rgba(255,255,255,0.40)" }}>
                    Speaking with client...
                  </div>
                </div>
              </FloatingCard>

              {/* 5 — Secure & Private (TYPING subtitle) */}
              <FloatingCard delay={0.90} floatDir={1} width="168px"
                style={{ bottom:"24%", left:"-4%" }}>
                <div className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:"linear-gradient(135deg,rgba(196,181,253,0.25),rgba(124,58,237,0.12))",
                      border:"1px solid rgba(196,181,253,0.42)", boxShadow:"0 0 12px rgba(196,181,253,0.30)" }}>
                    <Shield size={18} style={{ color:"#d8b4fe" }} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="font-bold text-[11.5px] text-white leading-none mb-0.5">Secure &amp; Private</div>
                    {/* ← TYPING ANIMATION */}
                    <TypewriterText
                      text="Your data is protected"
                      speed={50} holdMs={3000} clearSpd={18}
                      className="text-[9.5px]"
                      style={{ color:"rgba(255,255,255,0.50)" }}
                    />
                  </div>
                </div>
              </FloatingCard>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// FeatureItem (unchanged)
// ─────────────────────────────────────────────
interface FeatureItemProps {
  icon: React.ReactNode; title: string; subtitle: string; bg: string; border: string;
}
const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, subtitle, bg, border }) => (
  <div className="flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2.5">
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background:bg, border:`1px solid ${border}`, backdropFilter:"blur(10px)" }}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-white leading-tight">{title}</p>
      <p className="text-xs mt-0.5 sm:mt-1" style={{ color:"rgba(255,255,255,0.45)" }}>{subtitle}</p>
    </div>
  </div>
);

export default HeroSection;
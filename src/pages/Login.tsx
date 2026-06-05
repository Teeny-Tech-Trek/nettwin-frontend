const CityIllustration = "https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/LoginImage2.webp";

import {
  Mail, Lock, Eye, EyeOff, Loader2, Sparkles,
  Shield, BarChart2, Check, ArrowRight, MessageSquare,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

/* ============================================================
   Left-side feature cards data
============================================================ */
const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI Conversations",
    subtitle: "Natural & intelligent interactions 24/7",
    color: "#8b5cf6",
  },
  {
    icon: BarChart2,
    title: "Real-time Insights",
    subtitle: "Live data visualization & monitoring",
    color: "#3b82f6",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    subtitle: "Enterprise-grade security to protect your data",
    color: "#a855f7",
  },
];

/* ============================================================
   Main Login Component
============================================================ */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // New Google users still need the wizard; returning users go straight to dashboard.
  // Google renders its own button into `googleBtnRef`; we surround it with our themed wrapper.
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const {
    isLoading: isGoogleLoading,
    isReady: isGoogleReady,
    hasError: googleHasError,
    errorMessage: googleErrorMessage,
  } = useGoogleAuth({
    buttonContainerRef: googleBtnRef,
    text: "signin_with",
    onSuccess: ({ isNewUser }) => navigate(isNewUser ? "/wizard" : "/dashboard"),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes login-pulse {
          0%,100%{opacity:0.25} 50%{opacity:1}
        }
        @keyframes login-glow {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(20px,-15px) scale(1.05); }
        }
        @keyframes city-float {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-12px); }
        }
        @keyframes btn-shine {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes ring-spin {
          to { transform: translate(-50%,-50%) rotate(360deg); }
        }

        /* ── FIX: Browser autofill turning inputs white ── */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px rgba(12,8,38,0.95) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* ════════════ BACKGROUND ATMOSPHERE ════════════ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{
          top:"-10%", right:"-15%", width:"70%", height:"100%",
          background:"radial-gradient(ellipse at center,rgba(139,92,246,0.22) 0%,rgba(168,85,247,0.12) 35%,transparent 65%)",
          animation:"login-glow 14s ease-in-out infinite",
        }}/>
        <div className="absolute" style={{
          top:"10%", left:"-15%", width:"60%", height:"80%",
          background:"radial-gradient(ellipse at center,rgba(59,130,246,0.15) 0%,rgba(99,102,241,0.08) 35%,transparent 65%)",
        }}/>
        <div className="absolute" style={{
          bottom:"0", left:"35%", width:"45%", height:"50%",
          background:"radial-gradient(ellipse at center,rgba(124,58,237,0.12) 0%,transparent 70%)",
        }}/>
      </div>

      {/* ════════════ PARTICLES ════════════ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 70 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            width: `${Math.random()*1.5+0.5}px`, height: `${Math.random()*1.5+0.5}px`,
            left:  `${Math.random()*100}%`,       top:    `${Math.random()*100}%`,
            opacity: Math.random()*0.5+0.1,
            animation:`login-pulse ${3+Math.random()*4}s ease-in-out infinite`,
            animationDelay:`${Math.random()*5}s`,
          }}/>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════
          CONTENT WRAPPER
      ════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28 gap-6 xl:gap-10">

        {/* ════════════════════════════════════════════════════════
            LEFT PANEL — heading + image + feature cards
        ════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-col justify-center w-[55%] relative ">

          {/* Heading block */}
          <div className="relative z-20">
            <motion.p
              initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
              transition={{ duration:0.6, delay:0.1 }}
              className="hero-font text-xs font-bold mb-3 tracking-[0.18em] uppercase"
              style={{ color:"#a78bfa" }}
            >
              Welcome Back
            </motion.p>

            <motion.h2
              initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }}
              transition={{ duration:0.7, delay:0.2 }}
              className="hero-font font-extrabold leading-[1.1] tracking-tight text-white font-syne-bold"
              style={{ fontSize:"clamp(1.8rem,2.8vw,2.75rem)" }}
            >
              Sign in to your<br/>
              <span style={{
                background:"linear-gradient(90deg,#22d3ee 0%,#60a5fa 50%,#a78bfa 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                backgroundClip:"text",
              }}>
                NetTwin
              </span>{" "}
              <span className="text-white">Platform</span>
            </motion.h2>

            <motion.p
              initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
              transition={{ duration:0.6, delay:0.35 }}
              className="body-font text-sm leading-relaxed mt-4 max-w-md"
              style={{ color:"rgba(255,255,255,0.55)" }}
            >
              Access your net twin, visualize real-time data,
              and make smarter, data-driven decisions.
            </motion.p>
          </div>

          {/* Container: feature cards (left) + city image (right) */}
          <div className="relative mt-8 flex items-center gap-4">

            {/* Feature cards column */}
            <motion.div
              initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
              transition={{ duration:0.6, delay:0.45 }}
              className="flex flex-col gap-3 w-[260px] flex-shrink-0 relative z-20"
            >
              {FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.5, delay:0.5 + idx * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background:"rgba(18,14,45,0.55)",
                      backdropFilter:"blur(10px)",
                      border:"1px solid rgba(139,92,246,0.18)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background:`linear-gradient(135deg,${feature.color}33,${feature.color}11)`,
                        border:`1px solid ${feature.color}44`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: feature.color }} strokeWidth={2}/>
                    </div>
                    <div className="min-w-0">
                      <p className="hero-font text-[13px] font-semibold text-white leading-tight">
                        {feature.title}
                      </p>
                      <p className="body-font text-[11px] mt-0.5 leading-snug"
                        style={{ color:"rgba(255,255,255,0.5)" }}>
                        {feature.subtitle}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {/* "Your data is protected" badge */}
              <motion.div
                initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }}
                transition={{ duration:0.5, delay:0.85 }}
                className="flex items-center gap-3 p-3 rounded-xl mt-1"
                style={{
                  background:"linear-gradient(135deg,rgba(124,58,237,0.18),rgba(59,130,246,0.10))",
                  backdropFilter:"blur(10px)",
                  border:"1px solid rgba(168,85,247,0.30)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:"linear-gradient(135deg,rgba(168,85,247,0.30),rgba(124,58,237,0.20))",
                    border:"1px solid rgba(168,85,247,0.45)",
                  }}
                >
                  <Lock className="w-5 h-5 text-violet-300" strokeWidth={2}/>
                </div>
                <div className="min-w-0">
                  <p className="hero-font text-[13px] font-semibold text-white leading-tight">
                    Your data is protected
                  </p>
                  <p className="body-font text-[11px] mt-0.5 leading-snug"
                    style={{ color:"rgba(255,255,255,0.55)" }}>
                    We use enterprise-grade encryption to keep your information safe.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* City illustration */}
            <motion.div
              initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
              transition={{ duration:0.9, delay:0.3, ease:[0.22,1,0.36,1] }}
              className="flex-1 flex items-center justify-center relative"
              style={{ minHeight:"360px" }}
            >
              {/* Glow rings behind image */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div style={{
                  position:"absolute", width:"80%", aspectRatio:"1",
                  top:"50%", left:"50%",
                  transform:"translate(-50%,-50%)",
                  borderRadius:"50%",
                  border:"1px solid rgba(124,58,237,0.18)",
                  animation:"ring-spin 28s linear infinite",
                }}>
                  <div style={{
                    position:"absolute", top:0, left:"50%",
                    transform:"translate(-50%,-50%)",
                    width:"8px", height:"8px", borderRadius:"50%",
                    background:"#a855f7", boxShadow:"0 0 10px #a855f7, 0 0 22px #a855f7",
                  }}/>
                </div>
                <div style={{
                  position:"absolute", width:"55%", aspectRatio:"1",
                  top:"50%", left:"50%",
                  transform:"translate(-50%,-50%)",
                  borderRadius:"50%",
                  border:"1px dashed rgba(99,102,241,0.18)",
                  animation:"ring-spin 18s linear infinite reverse",
                }}/>
                <div style={{
                  position:"absolute", bottom:"10%", left:"50%",
                  transform:"translateX(-50%)",
                  width:"70%", height:"80px",
                  background:"radial-gradient(ellipse at center,rgba(124,58,237,0.55) 0%,rgba(59,130,246,0.25) 45%,transparent 75%)",
                  filter:"blur(22px)",
                }}/>
              </div>

              {/* The image - CONSTRAINED so it doesn't overflow */}
              <img
                src={CityIllustration}
                alt="net twin city illustration"
                className="relative z-10 w-full max-w-[380px] h-auto object-contain select-none pointer-events-none"
                draggable={false}
                style={{
                  maxHeight:"420px",
                  animation:"city-float 5s ease-in-out infinite",
                  filter:"drop-shadow(0 0 48px rgba(124,58,237,0.45)) drop-shadow(0 0 18px rgba(59,130,246,0.30))",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const fallback = document.getElementById("city-fallback");
                  if (fallback) fallback.style.display = "flex";
                }}
              />

              {/* SVG fallback */}
              <div id="city-fallback" className="relative z-10 hidden items-center justify-center"
                style={{ width:"360px", height:"280px" }}>
                <svg viewBox="0 0 360 280" width="360" height="280" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.7"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3"/>
                    </linearGradient>
                    <filter id="glow-filter">
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <rect x="160" y="30" width="40" height="220" fill="url(#bg-grad)" rx="3" filter="url(#glow-filter)" opacity="0.9"/>
                  <rect x="100" y="90" width="30" height="160" fill="url(#bg-grad)" rx="2" filter="url(#glow-filter)" opacity="0.7"/>
                  <rect x="230" y="80" width="30" height="170" fill="url(#bg-grad)" rx="2" filter="url(#glow-filter)" opacity="0.7"/>
                  <ellipse cx="180" cy="258" rx="130" ry="18" fill="rgba(139,92,246,0.45)" filter="url(#glow-filter)"/>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            RIGHT PANEL — form card
        ════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[45%] relative z-10 flex items-center justify-center">
          <motion.div
            initial={{ opacity:0, y:24, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}
            className="w-full max-w-[440px]"
          >
            <div
              className="rounded-2xl xl:rounded-3xl p-6 sm:p-7 relative"
              style={{
                background:    "linear-gradient(135deg,rgba(18,14,45,0.85) 0%,rgba(24,18,58,0.85) 50%,rgba(30,22,70,0.85) 100%)",
                backdropFilter:"blur(24px) saturate(140%)",
                WebkitBackdropFilter:"blur(24px) saturate(140%)",
                border:        "1px solid rgba(139,92,246,0.30)",
                boxShadow:     "0 0 60px rgba(124,58,237,0.20), 0 30px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(196,181,253,0.12)",
              }}
            >
              {/* Top inner highlight */}
              <div className="absolute top-0 left-8 right-8 h-[1px] pointer-events-none rounded-full"
                style={{ background:"linear-gradient(90deg,transparent,rgba(196,181,253,0.55),transparent)" }}/>

              {/* Logo */}
              <motion.div
                initial={{ opacity:0, scale:0.8, y:-10 }}
                animate={{ opacity:1, scale:1, y:0 }}
                transition={{ delay:0.15, duration:0.5 }}
                className="flex justify-center mb-4"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  
                >
                  <img src="https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/logoImg.webp" alt="logo"
                    className="w-full h-full object-contain p-2"
                    draggable={false}/>
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.25, duration:0.5 }}
                className="text-center mb-5"
              >
                <h1 className="hero-font font-extrabold leading-tight tracking-tight"
                  style={{ fontSize:"clamp(1.5rem,2.6vw,1.85rem)" }}>
                  <span className="text-white font-syne-bold">Welcome </span>
                  <span className="font-syne-bold" style={{
                    background:"linear-gradient(90deg,#22d3ee 0%,#60a5fa 100%)",
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                    backgroundClip:"text",
                  }}>Back</span>
                </h1>
                <p className="body-font text-[13px] mt-1.5" style={{ color:"rgba(255,255,255,0.55)" }}>
                  Please enter your details to sign in to your account
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-3.5">

                {/* Email */}
                <motion.div
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.35, duration:0.5 }}
                >
                  <label htmlFor="email" className="body-font block text-[13px] font-semibold text-white/90 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color:"rgba(255,255,255,0.45)" }} strokeWidth={2}/>
                    <input
                      id="email" type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="body-font w-full h-11 pl-10 pr-4 rounded-xl text-white text-sm placeholder:text-white/35 outline-none transition-all"
                      style={{
                        background:"rgba(12,8,38,0.60)",
                        border:"1px solid rgba(139,92,246,0.25)",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(196,181,253,0.55)")}
                      onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)")}
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.42, duration:0.5 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="body-font text-[13px] font-semibold text-white/90">
                      Password
                    </label>
                    <Link to="/forgot-password"
                      className="body-font text-[12px] font-medium transition-colors hover:text-violet-300"
                      style={{ color:"#a78bfa" }}>
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color:"rgba(255,255,255,0.45)" }} strokeWidth={2}/>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="body-font w-full h-11 pl-10 pr-10 rounded-xl text-white text-sm placeholder:text-white/35 outline-none transition-all"
                      style={{
                        background:"rgba(12,8,38,0.60)",
                        border:"1px solid rgba(139,92,246,0.25)",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(196,181,253,0.55)")}
                      onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-white/80 transition-colors"
                      style={{ color:"rgba(255,255,255,0.50)" }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4" strokeWidth={2}/>
                        : <Eye    className="w-4 h-4" strokeWidth={2}/>}
                    </button>
                  </div>
                </motion.div>

                {/* Remember me */}
                <motion.div
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.48, duration:0.5 }}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setRememberMe(r => !r)}
                      role="checkbox"
                      aria-checked={rememberMe}
                      className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: rememberMe
                          ? "linear-gradient(135deg,#7c3aed,#4f46e5)"
                          : "rgba(15,10,38,0.6)",
                        border: rememberMe
                          ? "1px solid rgba(168,85,247,0.6)"
                          : "1px solid rgba(139,92,246,0.30)",
                        boxShadow: rememberMe ? "0 0 8px rgba(139,92,246,0.45)" : "none",
                      }}
                    >
                      {rememberMe && <Check size={11} className="text-white" strokeWidth={3}/>}
                    </button>
                    <span className="body-font text-[13px]" style={{ color:"rgba(255,255,255,0.75)" }}>
                      Remember me
                    </span>
                  </label>
                  <span className="body-font text-[12px]" style={{ color:"rgba(255,255,255,0.40)" }}>
                    Keep me signed in
                  </span>
                </motion.div>

                {/* Sign In button */}
                <motion.div
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.54, duration:0.5 }}
                  className="pt-1"
                >
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={!isLoading ? { scale:1.02, boxShadow:"0 12px 36px rgba(59,130,246,0.55)" } : undefined}
                    whileTap={!isLoading  ? { scale:0.98 } : undefined}
                    className="body-font relative w-full h-11 rounded-xl overflow-hidden text-white font-bold text-[14px] disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background:"linear-gradient(90deg,#4f46e5 0%,#6d28d9 50%,#7c3aed 100%)",
                      boxShadow: "0 6px 24px rgba(99,102,241,0.40)",
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin"/> Signing In...</>
                      ) : (
                        <>Sign In <ArrowRight className="w-4 h-4" strokeWidth={2.5}/></>
                      )}
                    </span>
                    {!isLoading && (
                      <span className="pointer-events-none absolute top-0 bottom-0 w-1/3"
                        style={{
                          background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)",
                          animation:"btn-shine 2.5s ease-in-out infinite",
                        }}/>
                    )}
                  </motion.button>
                </motion.div>

                {/* OR divider */}
                <motion.div
                  initial={{ opacity:0 }} animate={{ opacity:1 }}
                  transition={{ delay:0.60, duration:0.4 }}
                  className="flex items-center gap-3 py-1"
                >
                  <div className="flex-1 h-px" style={{ background:"rgba(255,255,255,0.10)" }}/>
                  <span className="body-font text-[12px] font-medium tracking-widest"
                    style={{ color:"rgba(255,255,255,0.40)" }}>OR</span>
                  <div className="flex-1 h-px" style={{ background:"rgba(255,255,255,0.10)" }}/>
                </motion.div>

                {/* Google sign-in: GIS renders its official button into the
                    ref div. While GIS is still loading we show a thin
                    placeholder; the loading overlay only appears during an
                    actual sign-in round-trip; errors render BELOW the button
                    so they never cover it. */}
                <motion.div
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.65, duration:0.5 }}
                  className="space-y-2"
                >
                  <div className="relative w-full flex items-center justify-center min-h-[44px]">
                    {/* The actual Google button */}
                    <div ref={googleBtnRef} className="flex items-center justify-center" />

                    {/* Placeholder while GIS script loads */}
                    {!isGoogleReady && !googleHasError && (
                      <div className="absolute inset-0 flex items-center justify-center gap-2 text-[13px] text-white/40 rounded-full"
                        style={{
                          background:"rgba(12,8,38,0.40)",
                          border:"1px dashed rgba(139,92,246,0.25)",
                        }}>
                        <Loader2 className="w-4 h-4 animate-spin"/>
                        <span>Loading Google...</span>
                      </div>
                    )}

                    {/* Loading overlay during real sign-in */}
                    {isGoogleLoading && (
                      <div
                        className="absolute inset-0 flex items-center justify-center gap-2 text-[13px] text-white/85 rounded-full"
                        style={{ background:"rgba(12,8,38,0.92)" }}
                      >
                        <Loader2 className="w-4 h-4 animate-spin"/>
                        <span>Signing in...</span>
                      </div>
                    )}
                  </div>

                  {/* Error text — below the button, never on top */}
                  {googleHasError && googleErrorMessage && (
                    <p className="body-font text-[11px] leading-snug text-red-300/90 text-center px-2">
                      {googleErrorMessage}
                    </p>
                  )}
                </motion.div>

                {/* Sign up link */}
                <motion.p
                  initial={{ opacity:0 }} animate={{ opacity:1 }}
                  transition={{ delay:0.75, duration:0.4 }}
                  className="body-font text-center text-[13px] pt-2"
                  style={{ color:"rgba(255,255,255,0.55)" }}
                >
                  Don't have an account?{" "}
                  <Link to="/signup"
                    className="font-semibold transition-colors hover:underline"
                    style={{ color:"#a78bfa" }}>
                    Sign up
                  </Link>
                </motion.p>

              </form>

              {/* Bottom reflection */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-12 pointer-events-none"
                style={{
                  background:"radial-gradient(ellipse at center,rgba(124,58,237,0.35) 0%,transparent 70%)",
                  filter:"blur(20px)",
                }}/>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
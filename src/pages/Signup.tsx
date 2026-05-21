import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

// ════════════ FEATURES (same source as FeaturedSection) ════════════
const SIGNUP_FEATURES = [
  {
    title: "AI-Powered Intelligence",
    description: "Learns your unique style",
    image: "/FeaturePage/BrainImg.png",
  },
  {
    title: "Instant QR Access",
    description: "Unique QR per client",
    image: "/FeaturePage/QrImg.png",
  },
  {
    title: "24/7 Availability",
    description: "Always on, never offline",
    image: "/FeaturePage/ClockImg.png",
  },
  {
    title: "Secure & Private",
    description: "Enterprise-grade encrypted data",
    image: "/FeaturePage/ShieldImg.png",
  },
  {
      title: "Instant Responses",
      description:
        "Provide immediate, intelligent responses to inquiries.",
      image: "/FeaturePage/LightningImg.png",
    },
    {
      title: "Multi-Client Management",
      description:
        "Manage multiple digital twins.",
      image: "/FeaturePage/GroupImg.png",
    },

];

const Signup = () => {
  // ════════════ STATE & HOOKS ════════════
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();

  // New Google users go through the wizard like email signups; returning users
  // (Google account already linked) skip straight to the dashboard.
  // Google renders its own button into `googleBtnRef` (popup flow — no FedCM needed).
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const {
    isLoading: isGoogleLoading,
    isReady: isGoogleReady,
    hasError: googleHasError,
    errorMessage: googleErrorMessage,
  } = useGoogleAuth({
    buttonContainerRef: googleBtnRef,
    text: "signup_with",
    onSuccess: ({ isNewUser }) => navigate(isNewUser ? "/wizard" : "/dashboard"),
  });

  // ════════════ SIGNUP HANDLER — same logic + confirm password check ════════════
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Confirm password validation
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // ── ORIGINAL SIGNUP CALL — UNCHANGED ──
      await signup(name, email, password);
      navigate("/wizard");
    } catch (error) {
      // Error handling is done in the auth context
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12 pt-24 sm:pt-32"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes signup-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes signup-glow {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(20px,-15px) scale(1.05); }
        }
        @keyframes card-edge-glow {
          0%,100% { box-shadow: 0 0 60px rgba(139,92,246,0.35), 0 0 120px rgba(59,130,246,0.25), inset 0 0 0 1px rgba(168,85,247,0.45); }
          50%     { box-shadow: 0 0 80px rgba(139,92,246,0.55), 0 0 160px rgba(59,130,246,0.40), inset 0 0 0 1px rgba(168,85,247,0.65); }
        }
        @keyframes btn-shine {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes signup-feat-bounce {
          0%, 100% { transform: perspective(600px) translateY(0) rotateX(0deg) scale(1); }
          50%      { transform: perspective(600px) translateY(-6px) rotateX(5deg) scale(1.04); }
        }
        /* ── Chrome/Edge autofill override — preserve dark glassmorphic look ── */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px rgba(17,12,33,1) inset !important;
          box-shadow: 0 0 0 1000px rgba(17,12,33,1) inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff !important;
          border: 1px solid rgba(168,85,247,0.25) !important;
          transition: background-color 600000s 0s, color 600000s 0s !important;
        }
      `}</style>

      {/* ════════════ BACKGROUND (same as Login) ════════════ */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: "-10%",
            right: "-15%",
            width: "70%",
            height: "100%",
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.25) 0%, rgba(168,85,247,0.15) 35%, transparent 65%)",
            animation: "signup-glow 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "10%",
            left: "-15%",
            width: "60%",
            height: "80%",
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.10) 35%, transparent 65%)",
          }}
        />
      </div>

      {/* Wave dot pattern — right side only (left removed for cleaner look) */}
      <WaveDots side="right" />

      {/* Particles — confined to right half so left side stays clean */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 1.5 + 0.5}px`,
              height: `${Math.random() * 1.5 + 0.5}px`,
              left: `${50 + Math.random() * 50}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `signup-pulse ${
                3 + Math.random() * 4
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      {/* Particles on mobile (no left panel, so spread across full width) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
        {Array.from({ length: 70 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 1.5 + 0.5}px`,
              height: `${Math.random() * 1.5 + 0.5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `signup-pulse ${
                3 + Math.random() * 4
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* ════════════ 2-COLUMN WRAPPER: features (left) + form (right) ════════════ */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* ─────── LEFT: 4 FEATURES (hidden on mobile, shown on lg+) ─────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block"
        >
          <div className="mb-8">
            <h2
              className="hero-font font-extrabold leading-tight tracking-tight"
              style={{ fontSize: "clamp(2.4rem,3.6vw,3.4rem)" }}
            >
              <span className="text-white font-syne-bold">Why join </span>
              <span className="font-syne-bold"
                style={{
                  background:
                    "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                NetTwin
              </span>
              <span className="text-white">?</span>
            </h2>
            <p
              className="body-font text-lg mt-3 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Everything you need to build your AI-powered digital presence
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-20 gap-y-8">
            {SIGNUP_FEATURES.map((feat, idx) => (
              <SignupFeatureCard
                key={feat.title}
                title={feat.title}
                description={feat.description}
                image={feat.image}
                delay={0.15 + idx * 0.1}
                bounceDelay={idx * 0.25}
              />
            ))}
          </div>
        </motion.div>

        {/* ─────── RIGHT: SIGNUP FORM (unchanged) ─────── */}
        <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
      >
        <div
          className="relative rounded-3xl sm:rounded-[2rem] p-5 sm:p-9"
          style={{
            background:
              "linear-gradient(135deg, rgba(20,18,40,0.55) 0%, rgba(30,20,55,0.55) 50%, rgba(40,25,70,0.55) 100%)",
            backdropFilter: "blur(24px) saturate(140%)",
            WebkitBackdropFilter: "blur(24px) saturate(140%)",
            animation: "card-edge-glow 4s ease-in-out infinite",
          }}
        >
          {/* Top inner highlight */}
          <div
            className="absolute top-0 left-10 right-10 h-[1px] pointer-events-none rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(192,132,252,0.6), transparent)",
            }}
          />

          {/* ─────── LOGO ─────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex justify-center mb-5"
          >
            <motion.div
              whileHover={{ rotate: -5, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center"
              style={{
                // background:
                //   "linear-gradient(135deg, rgba(30,20,55,0.8) 0%, rgba(50,30,90,0.8) 100%)",
                // border: "1.5px solid rgba(168,85,247,0.5)",
                // boxShadow:
                //   "0 0 25px rgba(139,92,246,0.45), inset 0 0 12px rgba(168,85,247,0.2)",
              }}
            >
              <img
                src="/logo.png"
                alt="logo"
                className="w-full h-full object-contain p-2"
                draggable={false}
              />
            </motion.div>
          </motion.div>

          {/* ─────── TITLE ─────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1
              className="hero-font font-extrabold leading-tight tracking-tight"
              style={{ fontSize: "clamp(1.6rem,3vw,2.1rem)" }}
            >
              <span className="text-white font-syne-bold">Create Your </span>
              <span className="font-syne-bold"
                style={{
                  background:
                    "linear-gradient(90deg, #22d3ee 0%, #60a5fa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Account
              </span>
            </h1>
            <p
              className="body-font text-sm mt-2"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Join NetTwin and build your digital presence
            </p>
          </motion.div>

          {/* ─────── FORM ─────── */}
          <form onSubmit={handleSignup} className="space-y-3.5 sm:space-y-4">
            {/* Full Name */}
            <FormField
              label="Full Name"
              icon={
                <User
                  className="w-4 h-4"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  strokeWidth={2}
                />
              }
              delay={0.3}
            >
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="body-font w-full h-12 pl-11 pr-4 rounded-full text-white placeholder:text-white/35 focus:outline-none transition-all"
                style={inputStyle}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
              />
            </FormField>

            {/* Email */}
            <FormField
              label="Email Address"
              icon={
                <Mail
                  className="w-4 h-4"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  strokeWidth={2}
                />
              }
              delay={0.38}
            >
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="body-font w-full h-12 pl-11 pr-4 rounded-full text-white placeholder:text-white/35 focus:outline-none transition-all"
                style={inputStyle}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
              />
            </FormField>

            {/* Password + Confirm Password (one row) */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Password"
                icon={
                  <Lock
                    className="w-4 h-4"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                    strokeWidth={2}
                  />
                }
                delay={0.46}
              >
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="body-font w-full h-12 pl-11 pr-12 rounded-full text-white placeholder:text-white/35 focus:outline-none transition-all"
                  style={inputStyle}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                />
                <PasswordToggle
                  show={showPassword}
                  onToggle={() => setShowPassword((s) => !s)}
                />
              </FormField>

              <FormField
                label="Confirm Password"
                icon={
                  <Lock
                    className="w-4 h-4"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                    strokeWidth={2}
                  />
                }
                delay={0.54}
              >
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="body-font w-full h-12 pl-11 pr-12 rounded-full text-white placeholder:text-white/35 focus:outline-none transition-all"
                  style={inputStyle}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                />
                <PasswordToggle
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((s) => !s)}
                />
              </FormField>
            </div>

            {/* Create Account Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.5 }}
              className="pt-3"
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : undefined}
                whileTap={!isLoading ? { scale: 0.98 } : undefined}
                className="body-font relative w-full h-12 rounded-full overflow-hidden text-white font-bold text-base disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                  boxShadow:
                    "0 8px 30px rgba(59,130,246,0.45), 0 0 25px rgba(34,211,238,0.3)",
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Your Twin...
                    </>
                  ) : (
                    <>
                      <Sparkles
                        className="w-4 h-4"
                        fill="white"
                        strokeWidth={0}
                      />
                      Create Account
                    </>
                  )}
                </span>
                {!isLoading && (
                  <span
                    className="pointer-events-none absolute top-0 bottom-0 w-1/3"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                      animation: "btn-shine 2.5s ease-in-out infinite",
                    }}
                  />
                )}
              </motion.button>
            </motion.div>

            {/* "or" divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="relative flex items-center justify-center pt-4 pb-2"
            >
              <div
                className="absolute inset-x-0 top-1/2 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                }}
              />
              <span
                className="body-font relative px-4 text-sm bg-transparent"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                or
              </span>
            </motion.div>

            {/* Google sign-in: GIS renders its official button into the ref
                div. Placeholder shows only while GIS loads, overlay only
                during an active sign-in, errors render BELOW the button. */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78, duration: 0.4 }}
              className="space-y-2"
            >
              <div className="relative w-full flex items-center justify-center min-h-[44px]">
                <div ref={googleBtnRef} className="flex items-center justify-center" />

                {!isGoogleReady && !googleHasError && (
                  <div
                    className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white/40 rounded-full"
                    style={{
                      background: "rgba(15,10,30,0.40)",
                      border: "1px dashed rgba(168,85,247,0.28)",
                    }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading Google...</span>
                  </div>
                )}

                {isGoogleLoading && (
                  <div
                    className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white/85 rounded-full"
                    style={{ background: "rgba(15,10,30,0.92)" }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                )}
              </div>

              {googleHasError && googleErrorMessage && (
                <p className="body-font text-[11px] leading-snug text-red-300/90 text-center px-2">
                  {googleErrorMessage}
                </p>
              )}
            </motion.div>

            {/* Bottom link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.86, duration: 0.4 }}
              className="text-center pt-3 body-font"
            >
              <p
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold transition-colors hover:underline"
                  style={{
                    background:
                      "linear-gradient(90deg, #22d3ee 0%, #60a5fa 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Sign In
                </Link>
              </p>
            </motion.div>
          </form>

          {/* Bottom reflection glow */}
          <div
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-12 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(139,92,246,0.4) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
        </div>
        </motion.div>
      </div>
    </div>
  );
};

// ════════════ LEFT-SIDE FEATURE CARD (compact version of FeaturedSection card) ════════════
interface SignupFeatureCardProps {
  title: string;
  description: string;
  image: string;
  delay?: number;
  bounceDelay?: number;
}

const SignupFeatureCard: React.FC<SignupFeatureCardProps> = ({
  title,
  description,
  image,
  delay = 0,
  bounceDelay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-4"
  >
    <div
      className="flex-shrink-0 w-24 h-24 flex items-center justify-center"
      style={{
        animation: `signup-feat-bounce 3.2s ease-in-out ${bounceDelay}s infinite`,
        transformStyle: "preserve-3d",
      }}
    >
      <img
        src={image}
        alt={title}
        loading="eager"
        decoding="sync"
        draggable={false}
        className="w-full h-full scale-110 object-contain select-none"
        style={{
          filter: "drop-shadow(0 0 24px rgba(99,102,241,0.5))",
          pointerEvents: "none",
        }}
      />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="hero-font text-lg font-bold text-white leading-snug font-syne-bold">
        {title}
      </h3>
      <p
        className="body-font text-[15px] leading-relaxed mt-1.5"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        {description}
      </p>
    </div>
  </motion.div>
);

/* ============================================================
   Shared input styling helpers
============================================================ */
const inputStyle: React.CSSProperties = {
  background: "rgba(15,10,30,0.55)",
  border: "1px solid rgba(168,85,247,0.25)",
};

const onInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "rgba(192,132,252,0.55)";
};

const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "rgba(168,85,247,0.25)";
};

/* ============================================================
   Form Field wrapper
============================================================ */
interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  delay: number;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  icon,
  delay,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="space-y-1.5"
  >
    <label className="body-font block text-sm font-semibold text-white/90">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        {icon}
      </div>
      {children}
    </div>
  </motion.div>
);

/* ============================================================
   Password show/hide toggle button
============================================================ */
const PasswordToggle: React.FC<{ show: boolean; onToggle: () => void }> = ({
  show,
  onToggle,
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/5 transition-colors z-10"
    aria-label={show ? "Hide password" : "Show password"}
  >
    {show ? (
      <EyeOff
        className="w-4 h-4"
        style={{ color: "rgba(255,255,255,0.55)" }}
        strokeWidth={2}
      />
    ) : (
      <Eye
        className="w-4 h-4"
        style={{ color: "rgba(255,255,255,0.55)" }}
        strokeWidth={2}
      />
    )}
  </button>
);

/* ============================================================
   Wave Dots — flowing curves on left & right of background
============================================================ */
const WaveDots = ({ side }: { side: "left" | "right" }) => {
  const isLeft = side === "left";
  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        top: "20%",
        [isLeft ? "left" : "right"]: "0",
        width: "40%",
        height: "70%",
        opacity: 0.55,
        transform: isLeft ? "none" : "scaleX(-1)",
      }}
      viewBox="0 0 600 700"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`wave-grad-su-${side}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {Array.from({ length: 5 }).map((_, rowIdx) => {
        const baseY = 200 + rowIdx * 60;
        const dots = Array.from({ length: 50 }).map((_, i) => {
          const x = i * 12;
          const y =
            baseY +
            Math.sin((i / 50) * Math.PI * 2 + rowIdx * 0.5) * 70 +
            Math.cos((i / 50) * Math.PI * 1.5) * 30;
          const r = 1 + (rowIdx % 3) * 0.4;
          return (
            <circle
              key={`${rowIdx}-${i}`}
              cx={x}
              cy={y}
              r={r}
              fill={`url(#wave-grad-su-${side})`}
            />
          );
        });
        return <g key={rowIdx}>{dots}</g>;
      })}
    </svg>
  );
};

export default Signup;

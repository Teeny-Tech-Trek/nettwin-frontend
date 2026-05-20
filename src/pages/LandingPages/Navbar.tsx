
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

// ── apni logo image yahan import karo ──
// import logoImg from "@/Images/your-logo.png";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks: Array<{ name: string; href: string; active?: boolean }> = [
    { name: "Home", href: "#home", active: true },
    { name: "Features", href: "#features" },
    { name: "Preview", href: "#preview" },
    { name: "CTA", href: "#cta" },
  ];

  return (
    <>
      {/*
        ⚠️ IMPORTANT FIX:
        Centering wrapper (fixed + left-1/2 + -translate-x-1/2) is a PLAIN div.
        Framer-motion animation goes on the INNER element only — warna y-axis
        animation Tailwind ke -translate-x-1/2 ko override kar deta hai aur
        navbar middle-right shift ho jata hai.
      */}
      <div className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[1400px] px-3 sm:px-4">
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          {/* ════════════ FLOATING PILL CONTAINER ════════════ */}
          <div
            className="relative rounded-2xl sm:rounded-[28px] overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(8,12,28,0.82) 0%, rgba(12,18,40,0.78) 50%, rgba(10,14,32,0.82) 100%)",
              border: "1px solid rgba(96,165,250,0.18)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: scrolled
                ? "0 10px 50px rgba(0,0,0,0.4), 0 0 30px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
              transition: "box-shadow 0.4s ease",
            }}
          >
            {/* Subtle inner glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                bottom: "-50%",
                right: "10%",
                width: "300px",
                height: "200px",
                background:
                  "radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />

            {/* Top edge gradient line */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.4) 50%, transparent 100%)",
              }}
            />

            <div className="flex items-center justify-between gap-3 px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3 relative">
              {/* ════════════ LOGO ════════════ */}
              <motion.a
                href="/"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center gap-3 flex-shrink-0"
              >
                {/* Logo icon */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #0a1f3d 0%, #102a4e 50%, #0a1f3d 100%)",
                    border: "1.5px solid rgba(34,211,238,0.4)",
                    boxShadow:
                      "0 0 20px rgba(34,211,238,0.35), inset 0 0 12px rgba(34,211,238,0.15)",
                  }}
                >
                  {/* If using your own logo: */}
                      <img src="https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/logo.png" alt="NetTwin" className="w-full h-full object-cover rounded-full" />
                      {/* Otherwise the SVG below is a placeholder that matches the image. */}
                 
                  <TwinSilhouettes />
                  {/* Animated ring glow */}
                  <motion.div
                    animate={{
                      opacity: [0.4, 0.7, 0.4],
                      scale: [1, 1.15, 1],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 70%)",
                      filter: "blur(8px)",
                    }}
                  />
                </motion.div>

                {/* Brand text */}
                <div className="flex flex-col leading-none">
                  <h1
                    className="nav-font font-extrabold text-xl sm:text-2xl lg:text-[26px] tracking-tight"
                    style={{ lineHeight: 1 }}
                  >
                    <span className="text-white font-syne-bold">Net</span>
                    <span className="font-syne-bold"
                      style={{
                        background:
                          "linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Twin
                    </span>
                  </h1>
                  <p
                    className="nav-body text-[11px] lg:text-xs mt-1.5 hidden sm:block"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    Your AI-Powered Digital Twin
                  </p>
                </div>
              </motion.a>

              {/* ════════════ DESKTOP NAV LINKS ════════════ */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="hidden lg:flex items-center gap-2 nav-body"
              >
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.4 + index * 0.08,
                      duration: 0.4,
                    }}
                    whileHover={{ y: -1 }}
                    className="relative px-4 py-2 text-[15px] font-medium text-white/80 hover:text-white transition-colors group"
                  >
                    {link.name}

                    {/* Active dot */}
                    {link.active && (
                      <motion.span
                        layoutId="active-dot"
                        className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full"
                        style={{
                          background: "#22d3ee",
                          boxShadow: "0 0 8px rgba(34,211,238,0.9)",
                          marginLeft: "-3px",
                        }}
                      />
                    )}

                    {/* Hover underline */}
                    {!link.active && (
                      <span className="absolute bottom-0 left-1/2 w-0 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-1/2 group-hover:left-1/4 transition-all duration-300" />
                    )}
                  </motion.a>
                ))}
              </motion.div>

              {/* ════════════ DESKTOP CTA ════════════ */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="hidden lg:flex items-center gap-3 nav-body"
              >
                <motion.a
                  href="/signup"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-6 py-2.5 rounded-full text-[15px] font-medium text-white transition-all"
                  style={{
                    background: "rgba(15,23,42,0.6)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  Sign Up
                </motion.a>

                <motion.a
                  href="/login"
                  whileHover={{
                    scale: 1.04,
                    boxShadow: "0 0 30px rgba(59,130,246,0.55)",
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="px-7 py-2.5 rounded-full text-[15px] font-semibold text-white"
                  style={{
                    background:
                      "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                    boxShadow: "0 0 20px rgba(59,130,246,0.4)",
                  }}
                >
                  Login
                </motion.a>
              </motion.div>

              {/* ════════════ MOBILE MENU BUTTON ════════════ */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-white/90 hover:text-white transition-colors"
                style={{
                  background: "rgba(15,23,42,0.6)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>

          {/* ════════════ MOBILE MENU ════════════ */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden mt-2 rounded-2xl sm:rounded-3xl overflow-hidden max-h-[calc(100vh-6rem)] overflow-y-auto"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(8,12,28,0.95) 0%, rgba(12,18,40,0.95) 100%)",
                  border: "1px solid rgba(96,165,250,0.18)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}
              >
                <div className="p-5 flex flex-col gap-1 nav-body">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-base font-medium text-white/80 hover:text-white rounded-xl transition-all flex items-center justify-between"
                      style={{
                        background: link.active
                          ? "rgba(34,211,238,0.08)"
                          : "transparent",
                      }}
                    >
                      {link.name}
                      {link.active && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: "#22d3ee",
                            boxShadow: "0 0 8px rgba(34,211,238,0.9)",
                          }}
                        />
                      )}
                    </motion.a>
                  ))}

                  <div
                    className="my-3 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                    }}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-2"
                  >
                    <a
                      href="/signup"
                      className="w-full text-center py-3 rounded-xl text-[15px] font-medium text-white"
                      style={{
                        background: "rgba(15,23,42,0.6)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      Sign Up
                    </a>
                    <a
                      href="/login"
                      className="w-full text-center py-3 rounded-xl text-[15px] font-semibold text-white"
                      style={{
                        background:
                          "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                        boxShadow: "0 0 20px rgba(59,130,246,0.4)",
                      }}
                    >
                      Login
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
    </>
  );
};

/* ============================================================
   Twin Silhouettes Logo (placeholder SVG matching the image)
   — apni image use karne ke liye <img> se replace kar dena
============================================================ */
const TwinSilhouettes = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="relative z-10"
  >
    <defs>
      <linearGradient id="twin-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
    </defs>
    {/* Left silhouette (facing right) */}
    <path
      d="M11.5 8.5 a2.5 2.5 0 0 1 0 5 a2.5 2.5 0 0 1 0 -5 Z M7 22 c0 -3 2 -5.5 4.5 -5.5 c1 0 1.8 .4 2.5 1 v8 H7 v-3.5 Z"
      fill="url(#twin-grad)"
    />
    {/* Right silhouette (facing left) */}
    <path
      d="M20.5 8.5 a2.5 2.5 0 0 0 0 5 a2.5 2.5 0 0 0 0 -5 Z M25 22 c0 -3 -2 -5.5 -4.5 -5.5 c-1 0 -1.8 .4 -2.5 1 v8 H25 v-3.5 Z"
      fill="url(#twin-grad)"
    />
  </svg>
);

export default Navbar;

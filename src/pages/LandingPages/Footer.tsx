import { motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const footerLinks = [
  { name: "Home", hash: "home" },
  { name: "Features", hash: "features" },
  // { name: "Preview", hash: "preview" },
  { name: "CTA", hash: "cta" },
];

const AppFooter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Mirror Navbar.tsx's cross-page hash handling. Plain `<a href="#home">`
  // anchors only work when those section IDs exist on the current page — on
  // /login, /signup, etc. they resolve to `/login#home` and do nothing.
  // Already on `/` → smooth-scroll in place; elsewhere → navigate to `/`
  // with the hash so HomeAllPage's scroll effect picks it up after mount.
  const handleHashNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    hash: string,
  ) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.history.replaceState(null, "", `/#${hash}`);
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(`/#${hash}`);
    }
  };

  return (
    <footer
      className="relative overflow-hidden border-t border-white/10 body-font"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes footer-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes footer-glow {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-10px) scale(1.05); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: "-25%",
            right: "-10%",
            width: "70%",
            height: "90%",
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.22) 0%, rgba(99,102,241,0.12) 30%, rgba(139,92,246,0.08) 50%, transparent 70%)",
            animation: "footer-glow 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-35%",
            left: "-10%",
            width: "55%",
            height: "75%",
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.18) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.45) 50%, transparent 100%)",
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 45 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 1.5 + 0.5}px`,
              height: `${Math.random() * 1.5 + 0.5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `footer-pulse ${
                3 + Math.random() * 4
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr] gap-8 lg:gap-12 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-5"
          >
            <a
              href="/#home"
              onClick={(e) => handleHashNav(e, "home")}
              className="flex items-center gap-3 w-fit"
            >
              <span
                className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #0a1f3d 0%, #102a4e 50%, #0a1f3d 100%)",
                  // border: "1.5px solid rgba(34,211,238,0.4)",
                  boxShadow:
                    "0 0 20px rgba(34,211,238,0.35), inset 0 0 12px rgba(34,211,238,0.15)",
                }}
              >
                <img
                  src="https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/logoImg.webp"
                  alt="NetTwin"
                  className="w-full h-full object-cover"
                />
              </span>

              <span className="flex flex-col leading-none">
                <span className="hero-font font-extrabold text-2xl tracking-tight">
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
                </span>
                <span
                  className="text-xs mt-1.5"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Your AI-Powered Digital Twin
                </span>
              </span>
            </a>

            <p
              className="max-w-md text-sm sm:text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.58)" }}
            >
              Build a professional AI persona that talks like you, supports your
              clients, and keeps your digital presence active around the clock.
            </p>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="flex flex-col gap-4"
          >
            <p className="hero-font text-white font-bold">Explore</p>
            <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-col">
              {footerLinks.map((link) => (
                <a
                  key={link.name}
                  href={`/#${link.hash}`}
                  onClick={(e) => handleHashNav(e, link.hash)}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.58)" }}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="rounded-2xl p-5 md:col-span-2 lg:col-span-1"
            style={{
              background: "rgba(15,23,42,0.42)",
              border: "1px solid rgba(96,165,250,0.18)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 30px rgba(59,130,246,0.08)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles
                className="w-4 h-4"
                style={{ color: "#60a5fa" }}
                fill="#60a5fa"
                strokeWidth={0}
              />
              <p className="hero-font text-white font-bold">Ready to begin?</p>
            </div>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "rgba(255,255,255,0.58)" }}
            >
              Start building your net twin and make every connection easier.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <a
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                  boxShadow: "0 0 24px rgba(59,130,246,0.35)",
                }}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </a>
              {/* <a
                href="mailto:hello@nettwin.ai"
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
                style={{
                  background: "rgba(15,23,42,0.55)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <Mail className="w-4 h-4" />
                Contact
              </a> */}
            </div>
          </motion.div>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            (c) 2026 NetTwin. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Built for modern professionals.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;

import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ctaImg = "https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/ctaImg.webp";

const CTASection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = ctaImg;
    img.onload = () => setImgLoaded(true);
    if (img.complete) setImgLoaded(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !imgLoaded) return;

    const ctx = gsap.context(() => {
      const badge =
        sectionRef.current!.querySelector<HTMLElement>("[data-cta-badge]");
      const leftEls = sectionRef.current!.querySelectorAll<HTMLElement>(
        "[data-left-fade]"
      );
      const rightImg =
        sectionRef.current!.querySelector<HTMLElement>("[data-right-img]");

      if (badge) gsap.set(badge, { opacity: 0, y: -16, scale: 0.9 });
      gsap.set(leftEls, { opacity: 0, x: -40 });
      if (rightImg) gsap.set(rightImg, { opacity: 0, x: 50, scale: 0.95 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      if (badge) tl.to(badge, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 0);
      tl.to(
        leftEls,
        { opacity: 1, x: 0, duration: 0.7, stagger: 0.12 },
        0.15
      );
      if (rightImg)
        tl.to(
          rightImg,
          { opacity: 1, x: 0, scale: 1, duration: 0.95 },
          0.1
        );
    }, sectionRef);

    return () => ctx.revert();
  }, [imgLoaded]);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative pt-16 sm:pt-20 lg:pt-24 pb-12 lg:pb-0 overflow-hidden"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes cta-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes cta-glow {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(15px,-10px) scale(1.05); }
        }
        @keyframes badge-pulse {
          0%,100% { box-shadow: 0 0 22px rgba(34,211,238,0.22), 0 0 0 1px rgba(96,165,250,0.4); }
          50%     { box-shadow: 0 0 34px rgba(34,211,238,0.4),  0 0 0 1px rgba(96,165,250,0.6); }
        }
        @keyframes btn-shine {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes cta-img-glow {
          0%,100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.06); opacity: 0.8; }
        }
        @keyframes cta-bounce-3d {
          0%, 100% { transform: perspective(900px) translateY(0) rotateX(0deg) scale(1); }
          50%      { transform: perspective(900px) translateY(-14px) rotateX(4deg) scale(1.03); }
        }
        @keyframes arrow-bounce {
          0%,100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: "5%",
            right: "-15%",
            width: "65%",
            height: "85%",
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.22) 0%, rgba(99,102,241,0.12) 35%, transparent 65%)",
            animation: "cta-glow 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-10%",
            left: "-5%",
            width: "55%",
            height: "60%",
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.18) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 1.5 + 0.5}px`,
              height: `${Math.random() * 1.5 + 0.5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `cta-pulse ${
                3 + Math.random() * 4
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <WaveDots />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div data-cta-badge className="flex justify-center mb-10 lg:mb-16">
          <div
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full body-font"
            style={{
              background: "rgba(8,12,28,0.6)",
              animation: "badge-pulse 3s ease-in-out infinite",
            }}
          >
            <Sparkles
              className="w-4 h-4"
              style={{ color: "#22d3ee" }}
              fill="#22d3ee"
              strokeWidth={0}
            />
            <span
              className="text-[13px] font-bold tracking-[0.18em]"
              style={{
                background: "linear-gradient(90deg, #22d3ee 0%, #60a5fa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              GET STARTED TODAY
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center max-w-[1400px] mx-auto">
          {/* LEFT — text */}
          <div className="relative flex flex-col items-center text-center lg:items-start lg:text-left gap-6 sm:gap-7">
            <h2
              data-left-fade
              className="hero-font font-extrabold leading-[1.02] tracking-tight"
              style={{ fontSize: "clamp(2.35rem,6.5vw,4.5rem)" }}
            >
              <span className="block text-white font-syne-bold">Ready to</span>
              <span
                className="block font-syne-bold"
                style={{
                  background:
                    "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  paddingBottom: "0.1em",
                }}
              >
                Get Started?
              </span>
            </h2>

            <p
              data-left-fade
              className="body-font text-base sm:text-lg leading-relaxed max-w-md"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Join thousands of professionals using NetTwin to scale their
              presence and never miss an opportunity.
            </p>

            <div data-left-fade className="mt-2">
              <a
                href="/signup"
                className="group relative inline-flex w-full items-center gap-3 sm:gap-4 px-3 py-3 rounded-full overflow-hidden body-font transition-transform hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background:
                    "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                  boxShadow:
                    "0 10px 40px rgba(59,130,246,0.45), 0 0 30px rgba(34,211,238,0.3)",
                  paddingLeft: "0.75rem",
                  paddingRight: "1.75rem",
                  width: "100%",
                  maxWidth: "440px",
                }}
              >
                <span
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <Sparkles
                    className="w-4 h-4"
                    style={{ color: "#ffffff" }}
                    fill="#ffffff"
                    strokeWidth={0}
                  />
                </span>

                <span className="flex-1 text-center text-white font-bold text-sm sm:text-lg leading-snug">
                  Create Your Net Twin
                </span>

                <div
                  className="flex-shrink-0"
                  style={{ animation: "arrow-bounce 1.6s ease-in-out infinite" }}
                >
                  <ArrowRight
                    className="w-5 h-5 text-white"
                    strokeWidth={2.5}
                  />
                </div>

                <span
                  className="pointer-events-none absolute top-0 bottom-0 w-1/3"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    animation: "btn-shine 2.5s ease-in-out infinite",
                  }}
                />
              </a>
            </div>

            <div
              data-left-fade
              className="flex flex-col sm:flex-row flex-wrap items-center gap-x-6 gap-y-3 mt-3 body-font"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              <div className="flex items-center gap-2">
                <Shield
                  className="w-4 h-4"
                  style={{ color: "#60a5fa" }}
                  strokeWidth={2}
                />
                <span className="text-sm">No credit card required</span>
              </div>
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.3)" }}
              />
              <div className="flex items-center gap-2">
                <Zap
                  className="w-4 h-4"
                  style={{ color: "#60a5fa" }}
                  fill="#60a5fa"
                  strokeWidth={2}
                />
                <span className="text-sm">Get started in 2 minutes</span>
              </div>
            </div>
          </div>

          {/* RIGHT — image */}
          <div
            data-right-img
            className="relative flex items-end justify-center lg:justify-end self-end max-w-2xl mx-auto lg:max-w-none"
          >
            <div
              className="absolute pointer-events-none"
              style={{
                top: "10%",
                left: "5%",
                right: "5%",
                bottom: "10%",
                background:
                  "radial-gradient(ellipse at center, rgba(59,130,246,0.4) 0%, rgba(139,92,246,0.22) 40%, transparent 70%)",
                filter: "blur(70px)",
                animation: "cta-img-glow 4s ease-in-out infinite",
              }}
            />

            {imgLoaded && (
              <div
                className="relative w-[88%] sm:w-[78%] lg:w-[88%]"
                style={{ animation: "cta-bounce-3d 4s ease-in-out infinite" }}
              >
                <img
                  src={ctaImg}
                  alt="Create Your Net Twin"
                  loading="eager"
                  decoding="sync"
                  draggable={false}
                  className="w-full h-auto select-none"
                  style={{
                    pointerEvents: "none",
                    filter: "drop-shadow(0 20px 60px rgba(59,130,246,0.35))",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const WaveDots = () => {
  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        bottom: "0",
        left: "0",
        width: "55%",
        height: "200px",
        opacity: 0.55,
      }}
      viewBox="0 0 800 200"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wave-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {Array.from({ length: 6 }).map((_, rowIdx) => {
        const rowOffset = rowIdx * 12;
        const dots = Array.from({ length: 80 }).map((_, i) => {
          const x = i * 10;
          const y =
            150 -
            rowOffset +
            Math.sin((i / 80) * Math.PI * 2.5 + rowIdx * 0.4) * 20;
          const r = 1 + (rowIdx % 3) * 0.3;
          return (
            <circle
              key={`${rowIdx}-${i}`}
              cx={x}
              cy={y}
              r={r}
              fill="url(#wave-grad)"
            />
          );
        });
        return <g key={rowIdx}>{dots}</g>;
      })}
    </svg>
  );
};

export default CTASection;

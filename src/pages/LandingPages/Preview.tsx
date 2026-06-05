import {
  Sparkles,
  TrendingUp,
  QrCode,
  Users,
  MessageCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React from "react";

gsap.registerPlugin(ScrollTrigger);

// const dashboardImg = "/PreviewSectionPage/dashboardImg.png";

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div
      data-feature-item
      className="flex items-start gap-4 p-4 rounded-2xl group cursor-pointer transition-transform hover:translate-x-1"
      style={{
        background: "rgba(8,12,28,0.4)",
        border: "1px solid rgba(96,165,250,0.15)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center relative"
        style={{
          background:
            "linear-gradient(135deg, rgba(34,211,238,0.18) 0%, rgba(59,130,246,0.10) 100%)",
          border: "1px solid rgba(96,165,250,0.35)",
          boxShadow:
            "0 0 18px rgba(59,130,246,0.25), inset 0 0 10px rgba(34,211,238,0.08)",
        }}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="hero-font text-[15px] sm:text-base font-bold text-white leading-tight mb-1.5">
          {title}
        </h4>
        <p
          className="body-font text-[13px] sm:text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

const PreviewSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = "https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/dashboardImg.webp";
    img.onload = () => setImgLoaded(true);
    if (img.complete) setImgLoaded(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !imgLoaded) return;

    const ctx = gsap.context(() => {
      const headerEls = sectionRef.current!.querySelectorAll<HTMLElement>(
        "[data-header-fade]"
      );
      const leftImg =
        sectionRef.current!.querySelector<HTMLElement>("[data-left-img]");
      const rightTexts = sectionRef.current!.querySelectorAll<HTMLElement>(
        "[data-right-fade]"
      );
      const featureItems = sectionRef.current!.querySelectorAll<HTMLElement>(
        "[data-feature-item]"
      );

      gsap.set(headerEls, { opacity: 0, y: 28 });
      if (leftImg) gsap.set(leftImg, { opacity: 0, x: -50 });
      gsap.set(rightTexts, { opacity: 0, x: 40 });
      gsap.set(featureItems, { opacity: 0, x: 30 });

      gsap.to(headerEls, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      if (leftImg) {
        gsap.to(leftImg, {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: leftImg,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }

      gsap.to(rightTexts, {
        opacity: 1,
        x: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: rightTexts[0],
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.to(featureItems, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: featureItems[0],
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [imgLoaded]);

  const features = [
    {
      icon: (
        <TrendingUp
          className="w-5 h-5"
          style={{ color: "#60a5fa" }}
          strokeWidth={2.2}
        />
      ),
      title: "Real-time analytics and insights",
      description: "Get detailed insights and make data-driven decisions.",
    },
    {
      icon: (
        <QrCode
          className="w-5 h-5"
          style={{ color: "#60a5fa" }}
          strokeWidth={2.2}
        />
      ),
      title: "One-click QR code generation",
      description: "Generate unique QR codes instantly.",
    },
    {
      icon: (
        <Users
          className="w-5 h-5"
          style={{ color: "#60a5fa" }}
          strokeWidth={2.2}
        />
      ),
      title: "Seamless client management",
      description: "Organize and manage all your clients in one place.",
    },
    {
      icon: (
        <MessageCircle
          className="w-5 h-5"
          style={{ color: "#60a5fa" }}
          strokeWidth={2.2}
        />
      ),
      title: "Advanced conversation tracking",
      description: "Track every conversation and measure engagement.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="preview"
      className="relative py-16 sm:py-20 lg:py-28 overflow-hidden"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes prev-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes prev-glow {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-15px,10px) scale(1.05); }
        }
        @keyframes badge-glow {
          0%,100% { box-shadow: 0 0 25px rgba(34,211,238,0.25), 0 0 0 1px rgba(96,165,250,0.4); }
          50%     { box-shadow: 0 0 35px rgba(34,211,238,0.4),  0 0 0 1px rgba(96,165,250,0.55); }
        }
        @keyframes preview-img-glow {
          0%,100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.06); opacity: 0.8; }
        }
        @keyframes prev-bounce-3d {
          0%, 100% { transform: perspective(900px) translateY(0) rotateX(0deg) scale(1); }
          50%      { transform: perspective(900px) translateY(-12px) rotateX(3deg) scale(1.02); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: "10%",
            left: "-15%",
            width: "60%",
            height: "70%",
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.08) 35%, transparent 65%)",
            animation: "prev-glow 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-10%",
            right: "-5%",
            width: "55%",
            height: "60%",
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.13) 0%, transparent 60%)",
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
              animation: `prev-pulse ${
                3 + Math.random() * 4
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 sm:mb-14 lg:mb-20 max-w-4xl mx-auto">
          <div
            data-header-fade
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full body-font mb-6"
            style={{
              background: "rgba(8,12,28,0.6)",
              animation: "badge-glow 3s ease-in-out infinite",
            }}
          >
            <Sparkles
              className="w-3.5 h-3.5"
              style={{ color: "#22d3ee" }}
              fill="#22d3ee"
              strokeWidth={0}
            />
            <span
              className="text-[14px] font-semibold tracking-wide"
              style={{
                background: "linear-gradient(90deg, #22d3ee 0%, #60a5fa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Experience Seamless
            </span>
          </div>

          <h2
            data-header-fade
            className="hero-font font-extrabold leading-[1.02] tracking-tight"
            style={{ fontSize: "clamp(2.25rem,6.5vw,4.7rem)" }}
          >
            <span className="text-white font-syne-bold">See It In </span>
            <span className="font-syne-bold"
              style={{
                background:
                  "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                paddingBottom: "0.1em",
                display: "inline-block",
              }}
            >
              Action
            </span>
          </h2>

          <p
            data-header-fade
            className="body-font text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mt-4"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Experience the seamless interface designed for modern professionals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 max-w-[1300px] mx-auto items-center">
          {/* LEFT — Dashboard image */}
          <div
            data-left-img
            className="relative max-w-3xl mx-auto lg:max-w-none"
          >
            <div
              className="absolute pointer-events-none"
              style={{
                top: "10%",
                left: "5%",
                right: "5%",
                bottom: "10%",
                background:
                  "radial-gradient(ellipse at center, rgba(59,130,246,0.35) 0%, rgba(139,92,246,0.2) 40%, transparent 70%)",
                filter: "blur(60px)",
                animation: "preview-img-glow 4s ease-in-out infinite",
              }}
            />

            {imgLoaded && (
              <div
                className="relative"
                style={{ animation: "prev-bounce-3d 4s ease-in-out infinite" }}
              >
                <img
                  src="https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/dashboardImg.webp"
                  alt="Dashboard Preview"
                  loading="eager"
                  decoding="sync"
                  draggable={false}
                  className="w-full h-auto select-none"
                  style={{
                    pointerEvents: "none",
                    filter: "drop-shadow(0 20px 50px rgba(59,130,246,0.3))",
                  }}
                />
              </div>
            )}
          </div>

          {/* RIGHT — Heading + features */}
          <div className="relative flex flex-col max-w-2xl mx-auto lg:max-w-none">
            <div data-right-fade className="mb-5">
              <h3
                className="hero-font font-syne-bold font-extrabold text-white leading-tight tracking-tight mb-3"
                style={{ fontSize: "clamp(1.75rem,3.2vw,2.75rem)" }}
              >
                Intuitive Dashboard
              </h3>
              <div
                className="h-[3px] w-24 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #22d3ee, #3b82f6, #a855f7)",
                  boxShadow: "0 0 12px rgba(59,130,246,0.5)",
                }}
              />
            </div>

            <p
              data-right-fade
              className="body-font text-base leading-relaxed mb-7"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Manage all your net twins from one beautiful interface. Track
              conversations, generate QR codes, and monitor engagement with
              ease.
            </p>

            <div className="flex flex-col gap-3">
              {features.map((feature) => (
                <FeatureItem
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewSection;

import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React from "react";

gsap.registerPlugin(ScrollTrigger);

const HeaderCubeImg = "https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/FeaturePage/HeaderCubeImg.png";
const HeaderHeadImg = "https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/FeaturePage/HeaderHeadImg.png";
const BrainImg = "https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/FeaturePage/BrainImg.png";
const QrImg = "https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/FeaturePage/QrImg.png";
const ClockImg = "https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/FeaturePage/ClockImg.png";
const ShieldImg = "https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/FeaturePage/ShieldImg.png";
const LightningImg = "https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/FeaturePage/LightningImg.png";
const GroupImg = "https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/FeaturePage/GroupImg.png";


const ALL_IMAGES = [
  HeaderCubeImg,
  HeaderHeadImg,
  BrainImg,
  QrImg,
  ClockImg,
  ShieldImg,
  LightningImg,
  GroupImg,
];

/* preload all section images so they appear together (no piece-by-piece) */
const usePreloadImages = (urls: string[]) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    urls.forEach((u) => {
      const img = new Image();
      const done = () => {
        loaded += 1;
        if (loaded >= urls.length && !cancelled) setReady(true);
      };
      img.onload = done;
      img.onerror = done;
      img.src = u;
      if (img.complete) done();
    });
    return () => {
      cancelled = true;
    };
  }, [urls.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  return ready;
};

interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  image,
  delay = 0,
}) => {
  return (
    <div
      data-fade-card
      className="relative rounded-2xl group cursor-pointer h-full transition-transform hover:-translate-y-1"
      style={{
        background:
          "linear-gradient(135deg, rgba(15,20,40,0.55) 0%, rgba(10,14,28,0.55) 100%)",
        border: "1px solid rgba(96,165,250,0.18)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow:
          "0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          boxShadow:
            "0 0 25px rgba(59,130,246,0.18), 0 0 0 1px rgba(96,165,250,0.35) inset",
        }}
      />

      <div className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-5 px-5 py-6 sm:px-7 lg:px-8 sm:py-8 min-h-full">
        <div
          className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center"
          style={{
            animation: `feat-bounce-3d 3.2s ease-in-out ${delay}s infinite`,
            transformStyle: "preserve-3d",
          }}
        >
          <img
            src={image}
            alt={title}
            loading="eager"
            decoding="sync"
            draggable={false}
            className="w-full h-full scale-110 sm:scale-125 object-contain select-none"
            style={{
              filter: "drop-shadow(0 0 20px rgba(99,102,241,0.4))",
              pointerEvents: "none",
            }}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2.5 pt-1">
          <h3 className="hero-font text-lg sm:text-xl font-bold text-white leading-snug break-words font-syne-bold">
            {title}
          </h3>
          <p
            className="body-font text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imagesReady = usePreloadImages(ALL_IMAGES);

  const features = [
    {
      title: "AI-Powered Intelligence",
      description:
        "Your net twin learns your communication style, expertise, and personality to represent you authentically.",
      image: BrainImg,
    },
    {
      title: "Instant QR Access",
      description:
        "Generate unique QR codes for each client. They scan and connect with your AI twin instantly.",
      image: QrImg,
    },
    {
      title: "24/7 Availability",
      description:
        "Never miss an opportunity. Your net twin is always available to engage with potential clients.",
      image: ClockImg,
    },
    {
      title: "Secure & Private",
      description:
        "Enterprise-grade security ensures your data and conversations remain private and protected.",
      image: ShieldImg,
    },
    {
      title: "Instant Responses",
      description:
        "Provide immediate, intelligent responses to inquiries without any delay or waiting time.",
      image: LightningImg,
    },
    {
      title: "Multi-Client Management",
      description:
        "Manage multiple digital twins and client relationships from a single elegant dashboard.",
      image: GroupImg,
    },
  ];

  useEffect(() => {
    if (!sectionRef.current || !imagesReady) return;

    const ctx = gsap.context(() => {
      const headerEls = sectionRef.current!.querySelectorAll<HTMLElement>(
        "[data-header-fade]"
      );
      const cardEls = sectionRef.current!.querySelectorAll<HTMLElement>(
        "[data-fade-card]"
      );
      const leftImg =
        sectionRef.current!.querySelector<HTMLElement>("[data-left-img]");
      const rightImg =
        sectionRef.current!.querySelector<HTMLElement>("[data-right-img]");

      gsap.set(headerEls, { opacity: 0, y: 30 });
      gsap.set(cardEls, { opacity: 0, y: 40 });
      if (leftImg) gsap.set(leftImg, { opacity: 0, x: -40, scale: 0.85 });
      if (rightImg) gsap.set(rightImg, { opacity: 0, x: 40, scale: 0.85 });

      const headerTl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      if (leftImg) headerTl.to(leftImg, { opacity: 1, x: 0, scale: 1, duration: 0.9 }, 0);
      if (rightImg) headerTl.to(rightImg, { opacity: 1, x: 0, scale: 1, duration: 0.9 }, 0);
      headerTl.to(
        headerEls,
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 },
        0.15
      );

      gsap.to(cardEls, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardEls[0],
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [imagesReady]);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative py-16 sm:py-20 lg:py-28 overflow-hidden"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes feat-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes feat-glow {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-15px) scale(1.05); }
        }
        @keyframes feat-bounce-3d {
          0%, 100% { transform: perspective(600px) translateY(0) rotateX(0deg) scale(1); }
          50%      { transform: perspective(600px) translateY(-9px) rotateX(5deg) scale(1.04); }
        }
        @keyframes feat-bounce-3d-lg {
          0%, 100% { transform: perspective(800px) translateY(0) rotateX(0deg) scale(1); }
          50%      { transform: perspective(800px) translateY(-14px) rotateX(4deg) scale(1.03); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: "0%",
            right: "-10%",
            width: "60%",
            height: "70%",
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.10) 35%, transparent 65%)",
            animation: "feat-glow 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-10%",
            left: "5%",
            width: "55%",
            height: "60%",
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "30%",
            left: "30%",
            width: "40%",
            height: "40%",
            background:
              "radial-gradient(circle at center, rgba(34,211,238,0.05) 0%, transparent 70%)",
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
              animation: `feat-pulse ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative max-w-[1200px] mx-auto mb-12 sm:mb-16 lg:mb-20">
          <div className="flex items-center justify-center gap-4 lg:gap-10">
            {imagesReady && (
              <div
                data-left-img
                className="hidden md:block flex-shrink-0 w-40 lg:w-48 xl:w-56"
              >
                <div style={{ animation: "feat-bounce-3d-lg 3.6s ease-in-out infinite" }}>
                  <img
                    src={HeaderCubeImg}
                    alt=""
                    loading="eager"
                    decoding="sync"
                    draggable={false}
                    className="w-full h-auto select-none"
                    style={{
                      filter: "drop-shadow(0 0 40px rgba(139,92,246,0.4))",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="text-center flex-1 min-w-0 max-w-4xl">
              <div
                data-header-fade
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full body-font mb-5"
                style={{
                  background: "rgba(15,23,42,0.5)",
                  border: "1px solid rgba(96,165,250,0.22)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 0 20px rgba(59,130,246,0.08)",
                }}
              >
                <Sparkles
                  className="w-3.5 h-3.5"
                  style={{ color: "#60a5fa" }}
                  fill="#60a5fa"
                  strokeWidth={0}
                />
                <span className="text-[13px] font-medium text-white/90">
                  AI-Powered
                </span>
                <span className="text-white/30">•</span>
                <span className="text-[13px] font-medium text-white/90">
                  Built for You
                </span>
              </div>

              <h2
                data-header-fade
                className="hero-font font-extrabold leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
              >
                <span className="block text-white font-syne-bold">Powerful Features for</span>
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
                  Modern Professionals
                </span>
              </h2>

              <p
                data-header-fade
                className="body-font text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mt-5"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Everything you need to create and manage your professional
                digital presence with cutting-edge AI technology
              </p>
            </div>

            {imagesReady && (
              <div
                data-right-img
                className="hidden md:block flex-shrink-0 w-40 lg:w-48 xl:w-56"
              >
                <div style={{ animation: "feat-bounce-3d-lg 3.6s ease-in-out 0.8s infinite" }}>
                  <img
                    src={HeaderHeadImg}
                    alt=""
                    loading="eager"
                    decoding="sync"
                    draggable={false}
                    className="w-full h-auto select-none"
                    style={{
                      filter: "drop-shadow(0 0 40px rgba(59,130,246,0.4))",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 max-w-[1300px] mx-auto">
          {features.map((feature, idx) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              image={feature.image}
              delay={idx * 0.25}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

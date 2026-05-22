import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VideoDemo = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const p = (video.currentTime / video.duration) * 100;
      setProgress(p || 0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Autoplay on scroll into view
  useEffect(() => {
    const video = videoRef.current;
    const container = videoContainerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.muted = false;
            setIsMuted(false);
            video.play().catch((err) => {
              console.log("Autoplay prevented:", err);
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // GSAP scroll fade-in
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const heading =
        sectionRef.current!.querySelector<HTMLElement>("[data-video-heading]");
      const player =
        sectionRef.current!.querySelector<HTMLElement>("[data-video-player]");

      if (heading) gsap.set(heading, { opacity: 0, y: 30 });
      if (player) gsap.set(player, { opacity: 0, y: 50, scale: 0.96 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      if (heading) tl.to(heading, { opacity: 1, y: 0, duration: 0.7 }, 0);
      if (player)
        tl.to(player, { opacity: 1, y: 0, scale: 1, duration: 0.9 }, 0.2);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="demoVideo"
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:pt-20 sm:pb-24 body-font"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes hero-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes glow-shift {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-10px) scale(1.05); }
        }
        @keyframes live-pop {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: "5%",
            right: "-10%",
            width: "70%",
            height: "90%",
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.22) 0%, rgba(99,102,241,0.12) 30%, rgba(139,92,246,0.08) 50%, transparent 70%)",
            animation: "glow-shift 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-10%",
            right: "10%",
            width: "50%",
            height: "60%",
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.18) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "20%",
            left: "-10%",
            width: "50%",
            height: "60%",
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
              animation: `hero-pulse ${
                3 + Math.random() * 4
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="container px-4 sm:px-6 lg:px-8 mx-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          <div data-video-heading className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 sm:mb-6 text-white leading-tight font-syne-bold">
              Watch Our{" "}
              <span className="text-cyan-400">Net Twin Demo</span>
            </h2>

            <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-lg mx-auto">
              See how your AI-powered Net Twin interacts in real-time.
            </p>
          </div>

          <div
            data-video-player
            ref={videoContainerRef}
            className="relative group"
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))",
                padding: "3px",
              }}
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative aspect-video bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                    src="/NetTwinVideo.MP4"
                  >
                    Your browser does not support the video tag.
                  </video>

                  <div
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 px-3 sm:px-4 py-2 rounded-full backdrop-blur-md z-20"
                    style={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      animation: "live-pop 0.5s ease-out 0.5s both",
                    }}
                  >
                   
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="mb-3">
                      <div className="h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                        <div
                          className="h-full bg-blue-500 transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white" fill="white" />
                          ) : (
                            <Play
                              className="w-5 h-5 text-white ml-0.5"
                              fill="white"
                            />
                          )}
                        </button>

                        <button
                          onClick={toggleMute}
                          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110"
                        >
                          {isMuted ? (
                            <VolumeX className="w-5 h-5 text-white" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-white" />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={handleFullscreen}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110"
                      >
                        <Maximize className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(59, 130, 246, 0.4), transparent 70%)",
                filter: "blur(40px)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoDemo;

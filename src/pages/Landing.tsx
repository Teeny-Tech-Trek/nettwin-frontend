import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, Sparkles, Zap, Shield, QrCode, Users, ArrowRight, Check } from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import personImg from "../Images/ChatGPT Image Nov 7, 2025, 04_51_55 PM.png"

const Landing = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950">
      {/* Premium Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[24px] bg-slate-950/80 border-b border-slate-800/50"
      >
        <div className="container mx-auto px-8 py-5 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
            >
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-semibold tracking-tight text-white">
              Digital Twin
            </span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <Button variant="ghost" className="rounded-full font-medium text-slate-300 hover:text-white hover:bg-slate-800">
              Sign In
            </Button>
            <Button className="rounded-full font-medium bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/30">
              Get Started
            </Button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px]"
          />
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"
          />
          
          {/* Grid Pattern */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"
          />
        </div>

        <div className="container mx-auto px-8 relative z-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-left"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-[1.05] tracking-tight text-white"
              >
                Your AI-Powered
                <br />
                <span className="text-white">
                  Net Twin
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl"
              >
                Create an intelligent persona that represents you professionally. 
                Connect with clients through AI-powered conversations, available 24/7.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row items-start gap-4"
              >
                <Button 
                  size="lg" 
                  className="rounded-full text-base px-10 h-14 font-medium bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/30"
                >
                  Create Your Twin
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full text-base px-10 h-14 font-medium border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - Portrait */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex justify-center lg:justify-end"
            >
              {/* Circular Tech Rings */}
              <div className="relative">
                {/* Outer Ring */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.3, rotate: 360 }}
                  transition={{ 
                    scale: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 },
                    opacity: { duration: 0.8, delay: 0.5 },
                    rotate: { duration: 20, repeat: Infinity, ease: "linear", delay: 1.5 }
                  }}
                  className="absolute inset-0 -m-12"
                >
                  <svg className="w-full h-full" viewBox="0 0 500 500">
                    <circle cx="250" cy="250" r="230" fill="none" stroke="url(#gradient1)" strokeWidth="1" strokeDasharray="5 5" />
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>

                {/* Middle Ring */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.4, rotate: -360 }}
                  transition={{ 
                    scale: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.6 },
                    opacity: { duration: 0.8, delay: 0.6 },
                    rotate: { duration: 15, repeat: Infinity, ease: "linear", delay: 1.6 }
                  }}
                  className="absolute inset-0 -m-8"
                >
                  <svg className="w-full h-full" viewBox="0 0 500 500">
                    <circle cx="250" cy="250" r="210" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="10 15" />
                  </svg>
                </motion.div>

                {/* Inner Ring */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.5, rotate: 360 }}
                  transition={{ 
                    scale: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.7 },
                    opacity: { duration: 0.8, delay: 0.7 },
                    rotate: { duration: 10, repeat: Infinity, ease: "linear", delay: 1.7 }
                  }}
                  className="absolute inset-0 -m-4"
                >
                  <svg className="w-full h-full" viewBox="0 0 500 500">
                    <circle cx="250" cy="250" r="190" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 7" />
                  </svg>
                </motion.div>

                {/* Portrait Container */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    duration: 1.2, 
                    delay: 0.8,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="relative w-[450px] h-[450px] rounded-full overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
                  
                  {/* Placeholder Image - Replace with your image */}
                  <motion.img 
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 1.5, 
                      delay: 1,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    src={personImg}
                    alt="AI Digital Twin"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Glowing Effect */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 mix-blend-overlay"
                  />
                </motion.div>

                {/* Floating Particles */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1,
                    opacity: [0.3, 0.6, 0.3],
                    y: [0, -20, 0]
                  }}
                  transition={{ 
                    scale: { duration: 0.5, delay: 1.5 },
                    opacity: { duration: 3, repeat: Infinity, delay: 1.5 },
                    y: { duration: 3, repeat: Infinity, delay: 1.5 }
                  }}
                  className="absolute top-10 right-10 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
                />
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1,
                    opacity: [0.3, 0.6, 0.3],
                    y: [0, -15, 0]
                  }}
                  transition={{ 
                    scale: { duration: 0.5, delay: 1.7 },
                    opacity: { duration: 2.5, repeat: Infinity, delay: 2 },
                    y: { duration: 2.5, repeat: Infinity, delay: 2 }
                  }}
                  className="absolute bottom-20 left-10 w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"
                />
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1,
                    opacity: [0.3, 0.6, 0.3],
                    y: [0, -25, 0]
                  }}
                  transition={{ 
                    scale: { duration: 0.5, delay: 1.9 },
                    opacity: { duration: 3.5, repeat: Infinity, delay: 2.4 },
                    y: { duration: 3.5, repeat: Infinity, delay: 2.4 }
                  }}
                  className="absolute top-1/3 left-5 w-2 h-2 bg-cyan-300 rounded-full shadow-lg shadow-cyan-300/50"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Preview Section */}
      <PreviewSection />

      {/* Stats Section */}
      <StatsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12 backdrop-blur-sm bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Digital Twin</span>
            </div>
            <p className="text-slate-400">
              © 2024 Digital Twin. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Intelligence",
      description: "Your net twin learns your communication style, expertise, and personality to represent you authentically."
    },
    {
      icon: QrCode,
      title: "Instant QR Access",
      description: "Generate unique QR codes for each client. They scan and connect with your AI twin instantly."
    },
    {
      icon: Sparkles,
      title: "24/7 Availability",
      description: "Never miss an opportunity. Your net twin is always available to engage with potential clients."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security ensures your data and conversations remain private and protected."
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Provide immediate, intelligent responses to inquiries without any delay or waiting time."
    },
    {
      icon: Users,
      title: "Multi-Client Management",
      description: "Manage multiple digital twins and client relationships from a single elegant dashboard."
    }
  ];

  return (
    <section ref={ref} className="py-32 relative bg-slate-950">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Powerful Features
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Everything you need to create and manage your professional digital presence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description, index, isInView }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="relative p-10 rounded-3xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-500 hover:-translate-y-2 group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-7 h-7 text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3 tracking-tight text-white">{title}</h3>
          <p className="text-slate-400 leading-relaxed text-[15px]">{description}</p>
        </div>
      </Card>
    </motion.div>
  );
};

const PreviewSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-slate-900/50">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            See It In Action
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Experience the seamless interface designed for modern professionals
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -50 }}
            animate={isInView ? { opacity: 1, scale: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="rounded-[3rem] overflow-hidden shadow-2xl shadow-cyan-500/20 border border-cyan-500/20 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop" 
                alt="Dashboard Preview" 
                className="w-full"
              />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-4xl font-bold text-white">Intuitive Dashboard</h3>
            <p className="text-xl text-slate-400 leading-relaxed">
              Manage all your net twins from one beautiful interface. Track conversations, 
              generate QR codes, and monitor engagement with ease.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center mt-1">
                  <Check className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-slate-300">Real-time analytics and insights</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center mt-1">
                  <Check className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-slate-300">One-click QR code generation</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center mt-1">
                  <Check className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-slate-300">Seamless client management</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { value: "10+", label: "Active Digital Twins" },
    { value: "1K+", label: "Conversations" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9/5", label: "User Rating" }
  ];

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-cyan-500/5" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
                {stat.value}
              </div>
              <div className="text-lg text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="container mx-auto px-6"
      >
        <Card className="relative rounded-[3.5rem] overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-cyan-500/10 shadow-2xl shadow-cyan-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-950/50" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
          />
          
          <div className="relative z-10 py-24 px-8 text-center">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Join thousands of professionals using net Twin to scale their presence
            </p>
            <Button 
              size="lg" 
              className="rounded-full text-lg px-12 py-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:scale-105 transition-all duration-500 font-bold"
            >
              Create Your Net Twin
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </section>
  );
};

export default Landing;
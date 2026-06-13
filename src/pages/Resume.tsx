
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Clock, Bell, ArrowLeft, Layers, Zap, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Resume = () => {
  const [isNotified, setIsNotified] = React.useState(false);

  const handleNotifyClick = () => {
    setIsNotified(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] relative overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Animated Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Link to="/dashboard">
            <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group uppercase text-sm tracking-wider font-medium">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
          </Link>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-150px)]">
          <div className="max-w-5xl mx-auto text-center">
            
            {/* Status Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="mb-10 inline-block"
            >
              <AnimatePresence mode="wait">
                {!isNotified ? (
                  <motion.div
                    key="clock"
                    initial={{ opacity: 1 }}
                    exit={{ scale: 0, opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-md"
                  >
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-white/90 font-medium text-sm uppercase tracking-wider">
                      Under Development
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-400/30 rounded-full backdrop-blur-md"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-medium text-sm uppercase tracking-wider">
                      You're On The List!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-6"
            >
              <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-4 leading-none tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 bg-clip-text text-transparent">
                  Resume
                </span>
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide">
                Coming Soon
              </h2>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg md:text-xl text-white/60 mb-16 max-w-3xl mx-auto leading-relaxed"
            >
              We're building an exceptional space to showcase your work, projects, and achievements. Get ready for a stunning Resume experience.
            </motion.p>

            {/* Feature Grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto"
            >
              {[
                {
                  icon: Layers,
                  title: 'Project Showcase',
                  description: 'Display your best work vivially',
                  gradient: 'from-blue-500 to-blue-600',
                },
                {
                  icon: Zap,
                  title: 'Lightning Fast',
                  description: 'Optimized for seamless browsing',
                  gradient: 'from-blue-500 to-blue-600',
                },
                {
                  icon: Star,
                  title: 'Professional',
                  description: 'Templates that truly stand out',
                  gradient: 'from-blue-500 to-blue-600',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative"
                >
                  <div className="relative p-8 bg-gradient-to-br from-[#1a1f3a] to-[#0f1528] rounded-3xl border border-white/10 hover:border-cyan-500/30 transition-all">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30`}>
                      <feature.icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-3">{feature.title}</h3>
                    <p className="text-white/50 text-base leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <AnimatePresence mode="wait">
                {!isNotified ? (
                  <motion.button
                    key="notify"
                    onClick={handleNotifyClick}
                    initial={{ opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-cyan-500/40 transition-all duration-300 overflow-hidden uppercase tracking-wide"
                  >
                    {/* Animated shine */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    
                    <span className="relative z-10">Notify Me When Ready</span>
                  </motion.button>
                ) : (
                  <motion.button
                    key="notified"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    disabled
                    className="relative inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-500/40 cursor-default uppercase tracking-wide"
                  >
                    {/* Success particles */}
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, x: 0, y: 0 }}
                        animate={{
                          scale: [0, 1.5, 0],
                          x: Math.cos((i * Math.PI * 2) / 12) * 120,
                          y: Math.sin((i * Math.PI * 2) / 12) * 120,
                          opacity: [1, 1, 0],
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute w-3 h-3 bg-white rounded-full"
                        style={{ left: '50%', top: '50%' }}
                      />
                    ))}
                    
                    <Check className="w-6 h-6" />
                    <span>You'll Be Notified!</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="mt-16 text-white/40 text-sm"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
              <p className="uppercase tracking-wider">Currently in active development</p>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;
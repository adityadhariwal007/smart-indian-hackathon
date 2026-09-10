import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { Clock, Users, Ticket, RefreshCw, QrCode } from 'lucide-react';
import { ScrollReveal, AnimatedCounter, MagneticButton } from '../../components/animations/Animations';

export default function QueueToken() {
  const { addToast } = useNotifications();
  const [hasToken, setHasToken] = useState(true);
  const [currentToken, setCurrentToken] = useState(104);
  const myToken = 127;
  const prefix = 'A';

  // Simulate queue advancement
  useEffect(() => {
    if (!hasToken) return;
    const interval = setInterval(() => {
      setCurrentToken(prev => {
        const next = prev + 1;
        if (next === myToken - 3) addToast('Your token is approaching! Get ready.', 'warning');
        if (next >= myToken) {
          addToast('Your token has been called! Please proceed.', 'success');
          clearInterval(interval);
        }
        return Math.min(next, myToken);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [hasToken, addToast]);

  const ahead = Math.max(0, myToken - currentToken);
  const waitMin = ahead * 2;

  const stampVariants = {
    hidden: { scale: 3, opacity: 0, rotate: -20 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 15,
        mass: 1,
        delay: 0.2
      }
    }
  };

  return (
    <div className="animate-fade-in pb-12 overflow-hidden">
      <ScrollReveal className="page-header mb-8">
        <h1 className="text-3xl font-bold mb-2">Digital Queue</h1>
        <p className="text-gray-500">Your real-time queue position and estimated waiting time.</p>
      </ScrollReveal>

      <AnimatePresence mode="wait">
        {hasToken ? (
          <motion.div 
            key="token-active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            {/* Token Display */}
            <div className="card mb-8 text-center p-10 relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white border-0 shadow-xl shadow-primary/20">
              {/* Background watermark */}
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                <QrCode size={300} />
              </div>
              
              <div className="relative z-10">
                <div className="text-sm opacity-80 mb-2 uppercase tracking-[0.2em] font-semibold">Your Token</div>
                <motion.div 
                  variants={stampVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-7xl md:text-8xl font-black tracking-widest leading-none drop-shadow-md mb-6 inline-block"
                >
                  {prefix}-{myToken}
                </motion.div>
                <div className="text-sm opacity-90 mb-1">Department: General Medicine</div>
                <div className="text-lg font-semibold">Dr. Ananya Sharma</div>
              </div>
            </div>

            {/* Queue Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <ScrollReveal delay={0.1}>
                <div className="stat-card text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <Ticket size={24} />
                  </div>
                  <div className="stat-value text-4xl mb-1 text-primary">{prefix}-{currentToken}</div>
                  <div className="stat-label uppercase tracking-wider text-xs">Current Token</div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="stat-card text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-warning/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center mx-auto mb-3">
                    <Users size={24} />
                  </div>
                  <div className="stat-value text-4xl mb-1 text-warning">
                    <AnimatedCounter value={ahead} />
                  </div>
                  <div className="stat-label uppercase tracking-wider text-xs">Patients Ahead</div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div className="stat-card text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${ahead <= 5 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    <Clock size={24} />
                  </div>
                  <div className={`stat-value text-4xl mb-1 flex justify-center items-baseline gap-1 ${ahead <= 5 ? 'text-success' : 'text-warning'}`}>
                    <AnimatedCounter value={waitMin} /><span className="text-lg font-medium">min</span>
                  </div>
                  <div className="stat-label uppercase tracking-wider text-xs">Estimated Wait</div>
                </div>
              </ScrollReveal>
            </div>

            {/* Progress */}
            <ScrollReveal delay={0.4} className="card mb-8 shadow-sm">
              <h4 className="mb-4 text-lg font-semibold flex items-center gap-2">Queue Progress <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><RefreshCw size={16} className="text-gray-400" /></motion.div></h4>
              <div className="progress-bar h-4 bg-gray-100 rounded-full mb-3 overflow-hidden relative">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((myToken - 100) - ahead) / (myToken - 100) * 100)}%` }}
                  transition={{ duration: 1, type: "spring" }}
                />
                {/* Simulated pulse effect on the bar */}
                <motion.div 
                  className="absolute top-0 bottom-0 left-0 w-20 bg-white/30 skew-x-12"
                  animate={{ x: ['-100%', '800%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1 }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span>Started A-100</span>
                <span className="text-primary">Your Token A-{myToken}</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.5} className="card shadow-sm border border-gray-100 bg-gray-50/50">
              <h4 className="mb-4 text-lg font-semibold">Visit Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border border-gray-100"><span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Hospital</span> <span className="font-bold text-gray-800">CityCare Government</span></div>
                <div className="p-3 bg-white rounded-lg border border-gray-100"><span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Department</span> <span className="font-bold text-gray-800">General Medicine</span></div>
                <div className="p-3 bg-white rounded-lg border border-gray-100"><span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Doctor</span> <span className="font-bold text-gray-800">Dr. Ananya Sharma</span></div>
                <div className="p-3 bg-white rounded-lg border border-gray-100"><span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Room</span> <span className="font-bold text-gray-800">Consultation Room 204</span></div>
              </div>
            </ScrollReveal>
          </motion.div>
        ) : (
          <motion.div 
            key="no-token"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="card text-center p-16 shadow-sm flex flex-col items-center justify-center min-h-[400px]"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="text-6xl mb-6 drop-shadow-md"
            >
              🎫
            </motion.div>
            <h3 className="mb-2 text-2xl font-bold">No Active Queue Token</h3>
            <p className="text-gray-500 mb-8 max-w-sm">Get a digital queue token when you visit a hospital or book an appointment online.</p>
            <MagneticButton className="btn btn-primary btn-xl shadow-lg shadow-primary/20" onClick={() => setHasToken(true)}>
              Get Demo Token
            </MagneticButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

export function ScrollReveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        ease: [0.25, 0.1, 0.25, 1],
        delay: delay
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCounter({ value, duration = 0.8, className = "" }) {
  // A simple counting animation effect under 800ms with ease-out
  const [count, setCount] = React.useState(value);
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  React.useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(value);
      return;
    }
    
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) {
      setCount(value);
      return;
    }

    const totalFrames = Math.round((duration * 1000) / 16);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const current = Math.round(end * (1 - Math.pow(1 - progress, 3))); // easeOutCubic
      
      setCount(current);

      if (frame >= totalFrames) {
        clearInterval(counter);
        setCount(end);
      }
    }, 16);

    return () => clearInterval(counter);
  }, [value, duration, inView]);

  return (
    <span ref={ref} className={className} aria-label={`${value}`}>
      {count}
    </span>
  );
}

export function MagneticButton({ children, className = "", onClick, ...props }) {
  const ref = React.useRef(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.1 }}
      className={`magnetic ${className}`}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * 1.1 Verified Credential Reveal
 * Settle into place with soft 200ms fade + 8px slide, ending with checkmark draw-in (~300ms)
 */
export function VerifiedCredentialBadge({ label, issuer = "NABH Accredited", className = "" }) {
  const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      initial={isReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: '#ECFDF5',
        color: '#065F46',
        border: '1px solid #A7F3D0'
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" className="checkmark-draw" />
      </svg>
      <span>{label || issuer}</span>
    </motion.div>
  );
}

/**
 * 3.3 Color-Coded Status Pulse
 * Live freshness dot with paired text label
 */
export function StatusPulse({ status = "available", label = "Live Freshness" }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
      <span className={`status-pulse-dot ${status}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

/**
 * 3.5 Comparative Bar Fill Animation
 * Animate width from 0 to target on scroll-into-view (~600ms ease-out)
 */
export function ComparativeBar({ value = 50, max = 100, label = "", suffix = "%", color = "var(--primary)" }) {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div style={{ width: '100%', margin: '4px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600 }}>{value}{suffix}</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'var(--border-light)', borderRadius: '9999px', overflow: 'hidden' }}>
        <motion.div
          initial={isReduced ? { width: `${percentage}%` } : { width: '0%' }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: '100%', background: color, borderRadius: '9999px' }}
        />
      </div>
    </div>
  );
}


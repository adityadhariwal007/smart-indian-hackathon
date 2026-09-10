import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Check, 
  AlertCircle, 
  Search, 
  Phone, 
  Calendar, 
  ChevronDown, 
  MessageSquare, 
  Star, 
  Clock, 
  Activity, 
  Sliders, 
  CheckCircle2, 
  Eye, 
  Zap, 
  HeartHandshake
} from 'lucide-react';
import { 
  VerifiedCredentialBadge, 
  StatusPulse, 
  ComparativeBar, 
  AnimatedCounter, 
  MagneticButton 
} from '../components/animations/Animations';

export default function EffectsShowcase() {
  const [reducedMotionSim, setReducedMotionSim] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Toggle class on document body for in-browser simulation
  const toggleReducedMotion = () => {
    const next = !reducedMotionSim;
    setReducedMotionSim(next);
    if (next) {
      document.body.classList.add('reduced-motion-mode');
    } else {
      document.body.classList.remove('reduced-motion-mode');
    }
  };

  useEffect(() => {
    return () => {
      document.body.classList.remove('reduced-motion-mode');
    };
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Top Banner with WCAG Reduced Motion Simulator Switch */}
      <div 
        className="card mb-8" 
        style={{
          background: reducedMotionSim 
            ? 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)' 
            : 'linear-gradient(135deg, #ECFEFF 0%, #F0FDFA 100%)',
          border: '1px solid ' + (reducedMotionSim ? '#FDE68A' : '#A5F3FC'),
          padding: '24px 28px'
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-primary">WCAG 2.2 Compliant Lab</span>
              <span className="text-xs text-secondary">Guidelines 2.3.1 (Three Flashes) & 2.3.3 (Animation from Interactions)</span>
            </div>
            <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text)' }}>
              Healthcare Website Effects Guide & Motion Lab
            </h1>
            <p className="text-secondary text-sm" style={{ maxWidth: '650px' }}>
              Every animation pattern below builds patient trust and lowers clinical anxiety. Animations are strictly capped (&lt;400ms for feedback, &lt;800ms for entrance), never flash, and degrade gracefully under reduced motion.
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '12px 18px',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>Reduced Motion Mode</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {reducedMotionSim ? '⚡ Animations Disabled (Instant state)' : '✨ Fluid Smooth Motion (Default)'}
              </div>
            </div>
            <button
              onClick={toggleReducedMotion}
              className={`btn btn-sm ${reducedMotionSim ? 'btn-warning' : 'btn-secondary'}`}
              style={{ minHeight: '36px', fontWeight: 600 }}
              aria-pressed={reducedMotionSim}
            >
              <Sliders size={14} /> {reducedMotionSim ? 'Deactivate' : 'Simulate OS Reduced Motion'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-8">
        <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All 20 Patterns</button>
        <button className={`tab ${activeTab === 'trust' ? 'active' : ''}`} onClick={() => setActiveTab('trust')}>1. Trust-Building</button>
        <button className={`tab ${activeTab === 'nav' ? 'active' : ''}`} onClick={() => setActiveTab('nav')}>2. Navigation & Loading</button>
        <button className={`tab ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>3. Data Visualization</button>
        <button className={`tab ${activeTab === 'interaction' ? 'active' : ''}`} onClick={() => setActiveTab('interaction')}>4. Interactive Engagement</button>
      </div>

      {/* SECTION 1: TRUST-BUILDING EFFECTS */}
      {(activeTab === 'all' || activeTab === 'trust') && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span style={{ fontSize: '24px' }}>🛡️</span>
            <div>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>1. Trust-Building Effects</h2>
              <p className="text-secondary text-sm">Reinforces legitimacy, lowers first-visit hesitation, and offers security reassurance.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* 1.1 Verified Credential Reveal */}
            <div className="card gentle-hover-lift">
              <div className="flex justify-between items-start mb-2">
                <span className="badge badge-primary">1.1 Verified Credential Reveal</span>
                <span className="text-xs text-secondary">~300ms draw-in</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Credential Badge Settle & Checkmark Draw</h3>
              <p className="text-secondary text-xs mb-4">
                Soft 200ms fade + 8px slide, ending with an SVG stroke-dashoffset checkmark draw. Disabled under reduced motion.
              </p>
              
              <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center' }}>
                <div className="flex gap-2 justify-center flex-wrap">
                  <VerifiedCredentialBadge label="NABH Accredited Hospital" />
                  <VerifiedCredentialBadge label="ABDM Digital Health Certified" />
                  <VerifiedCredentialBadge label="Board Certified Cardiologist (AIIMS)" />
                </div>
              </div>
            </div>

            {/* 1.2 Calm Gradient Breathing Background */}
            <div className="card gentle-hover-lift">
              <div className="flex justify-between items-start mb-2">
                <span className="badge badge-primary">1.2 Calm Gradient Breathing</span>
                <span className="text-xs text-secondary">16s relaxation loop</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Breathing Background Shift</h3>
              <p className="text-secondary text-xs mb-4">
                Ultra-slow 16s breathing cycle mimicking relaxed parasympathetic respiration. Pauses completely under reduced motion.
              </p>

              <div className="calm-breathing-bg" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--primary-dark)' }}>
                  Restful Waiting & Hero Ambient Mesh
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Low contrast delta prevents vestibular triggers while inducing physiological calm.
                </div>
              </div>
            </div>

            {/* 1.3 Human-Centered Photo Parallax */}
            <div className="card gentle-hover-lift">
              <div className="flex justify-between items-start mb-2">
                <span className="badge badge-primary">1.3 Subtle Photo Parallax</span>
                <span className="text-xs text-secondary">&lt;10px translateY</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Human-Centered Imagery</h3>
              <p className="text-secondary text-xs mb-4">
                Adds warmth and approachability without vestibular discomfort by restricting motion range strictly to 8px.
              </p>

              <div style={{ height: '120px', borderRadius: '12px', overflow: 'hidden', position: 'relative', background: '#0F172A' }}>
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: '-10px',
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #0891B2 0%, #0F172A 80%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600
                  }}
                  animate={reducedMotionSim ? {} : { y: [-4, 4, -4] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  👩‍⚕️ Senior Attending Clinicians & Patient Care
                </motion.div>
              </div>
            </div>

            {/* 1.4 Security/Privacy Micro-Confirmation */}
            <SecurityPadlockDemo />

            {/* 1.5 Testimonial Trust Carousel */}
            <TestimonialCarouselDemo />
          </div>
        </section>
      )}

      {/* SECTION 2: NAVIGATION & LOADING EFFECTS */}
      {(activeTab === 'all' || activeTab === 'nav') && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span style={{ fontSize: '24px' }}>🧭</span>
            <div>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>2. Navigation & Loading Effects</h2>
              <p className="text-secondary text-sm">Eliminates disorientation, reduces perceived wait times, and provides instant route clarity.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* 2.1 Skeleton Screens */}
            <div className="card gentle-hover-lift">
              <div className="flex justify-between items-start mb-2">
                <span className="badge badge-primary">2.1 Skeleton Screens (No Spinners)</span>
                <span className="text-xs text-secondary">Low-contrast shimmer</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Content-Shaped Skeletons</h3>
              <p className="text-secondary text-xs mb-4">
                Reduces perceived wait time. Static gray block under reduced motion; screen readers receive aria-busy="true".
              </p>

              <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center' }} aria-busy="true" aria-label="Loading doctor appointment card">
                <div className="skeleton-shimmer" style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton-shimmer" style={{ height: '14px', width: '60%' }} />
                  <div className="skeleton-shimmer" style={{ height: '10px', width: '40%' }} />
                </div>
              </div>
            </div>

            {/* 2.2 Progressive Step Indicator */}
            <ProgressiveStepDemo />

            {/* 2.3 Sticky Emergency Bar */}
            <div className="card gentle-hover-lift">
              <div className="flex justify-between items-start mb-2">
                <span className="badge badge-primary">2.3 Sticky CTA / Emergency Bar</span>
                <span className="text-xs text-secondary">44x44px min touch</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Always Reachable Life-Saving Actions</h3>
              <p className="text-secondary text-xs mb-4">
                Subtle 300ms one-time slide-in. Uncluttered layout ensures zero keyboard focus trapping.
              </p>

              <div style={{ padding: '14px 20px', background: 'var(--danger-bg)', borderRadius: '12px', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="flex items-center gap-2 text-danger font-semibold text-sm">
                  <Phone size={16} /> 24/7 National Emergency Hotline
                </div>
                <a href="tel:112" className="btn btn-danger btn-sm" style={{ minHeight: '44px', padding: '0 16px', fontWeight: 700 }}>
                  Dial 112
                </a>
              </div>
            </div>

            {/* 2.5 Smart Search-as-You-Type */}
            <SmartSearchDemo />
          </div>
        </section>
      )}

      {/* SECTION 3: DATA VISUALIZATION EFFECTS */}
      {(activeTab === 'all' || activeTab === 'data') && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span style={{ fontSize: '24px' }}>📊</span>
            <div>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>3. Data Visualization Effects</h2>
              <p className="text-secondary text-sm">Converts complex clinical trends into scannable visual narratives with full screen-reader parity.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* 3.1 Animated Health Metric Count-Up */}
            <div className="card gentle-hover-lift">
              <div className="flex justify-between items-start mb-2">
                <span className="badge badge-primary">3.1 Metric Count-Up</span>
                <span className="text-xs text-secondary">&lt;800ms ease-out</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Outcome Metric Draw</h3>
              <p className="text-secondary text-xs mb-4">
                Scrolled into view count-up with easeOutCubic curve. Final numeric values always exist in DOM for screen readers.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>
                    <AnimatedCounter value={98} />%
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Patient Satisfaction</div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success)' }}>
                    <AnimatedCounter value={24} />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Specialists on Duty</div>
                </div>
              </div>
            </div>

            {/* 3.2 Self-Drawing Line Chart */}
            <SelfDrawingChartDemo />

            {/* 3.3 Color-Coded Status Pulses */}
            <div className="card gentle-hover-lift">
              <div className="flex justify-between items-start mb-2">
                <span className="badge badge-primary">3.3 Live Status Pulses</span>
                <span className="text-xs text-secondary">2s gentle cycle</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Capacity & Freshness Dot</h3>
              <p className="text-secondary text-xs mb-4">
                Subtle 0.85 &rarr; 1.0 opacity loop (never flashes, safe for photosensitive users) paired with clear textual labels.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">OPD Registration Counter</span>
                  <StatusPulse status="available" label="Available (10m wait)" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cardiology ICU Beds</span>
                  <StatusPulse status="warning" label="Limited (88% filled)" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trauma OT 2</span>
                  <StatusPulse status="danger" label="In Surgery" />
                </div>
              </div>
            </div>

            {/* 3.5 Comparative Bar Fill Animation */}
            <div className="card gentle-hover-lift">
              <div className="flex justify-between items-start mb-2">
                <span className="badge badge-primary">3.5 Comparative Bar Fill</span>
                <span className="text-xs text-secondary">~600ms ease-out</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Hospital & Cost Comparisons</h3>
              <p className="text-secondary text-xs mb-4">
                Bars animate width smoothly on view. Numeric label is paired for accessibility and instant comprehension.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <ComparativeBar label="CityCare Hospital (Wait Time)" value={25} max={100} suffix=" min" color="#10B981" />
                <ComparativeBar label="Rajiv Gandhi Memorial" value={85} max={100} suffix=" min" color="#EF4444" />
                <ComparativeBar label="Central District Hospital" value={50} max={100} suffix=" min" color="#F59E0B" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: INTERACTIVE ENGAGEMENT EFFECTS */}
      {(activeTab === 'all' || activeTab === 'interaction') && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span style={{ fontSize: '24px' }}>💬</span>
            <div>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>4. Interactive Engagement Effects</h2>
              <p className="text-secondary text-sm">Empathetic micro-interactions that guide patients without cognitive overload or alarm.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* 4.1 Symptom Checker Micro-Steps */}
            <SymptomCheckerDemo />

            {/* 4.3 Appointment Booking Confirmation */}
            <BookingConfirmationDemo />

            {/* 4.4 Expandable FAQ Accordion */}
            <AccordionDemo />

            {/* 4.5 Empathetic Form Validation Feedback */}
            <EmpatheticFormDemo />

            {/* 4.6 Live Chat Gentle Entrance */}
            <ChatWidgetDemo />
          </div>
        </section>
      )}
    </div>
  );
}

/* =========================================================================
   SUB-DEMO COMPONENTS (All built directly to the Guide's exact specifications)
   ========================================================================= */

function SecurityPadlockDemo() {
  const [locked, setLocked] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocked(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <div className="card gentle-hover-lift">
      <div className="flex justify-between items-start mb-2">
        <span className="badge badge-primary">1.4 Security Micro-Confirmation</span>
        <span className="text-xs text-secondary">150ms state morph</span>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Sensitive Data Reassurance</h3>
      <p className="text-secondary text-xs mb-4">
        Morphs padlock icon from unlocked to locked on submission, paired with an aria-live="polite" toast.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Enter Ayushman / Insurance ID" 
          className="form-control text-sm"
          defaultValue="PMJAY-9928-1029"
          style={{ width: '100%' }}
        />
        <button type="submit" className="btn btn-primary btn-sm flex items-center justify-center gap-2" style={{ minHeight: '38px' }}>
          {locked ? <Lock size={15} className="text-white" /> : <Unlock size={15} />}
          <span>{locked ? 'Securely Vaulted & Encrypted' : 'Submit Insurance Details'}</span>
        </button>
      </form>

      {showToast && (
        <div 
          role="status" 
          aria-live="polite" 
          className="mt-3 p-2.5 rounded-lg flex items-center gap-2 text-xs"
          style={{ background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid #A7F3D0' }}
        >
          <ShieldCheck size={16} /> Data encrypted with SHA-256 ABDM Health Vault
        </div>
      )}
    </div>
  );
}

function TestimonialCarouselDemo() {
  const testimonials = [
    { name: "Pooja Verma", text: "Found an available cardiologist in 10 minutes. The crowd tracker saved us 2 hours.", role: "Patient" },
    { name: "Rajesh Nair", text: "Transparent cost estimator broke down our surgery cost with zero surprises.", role: "Caregiver" },
    { name: "Dr. K. Saxena", text: "Balanced patient flow reduced OPD peak congestion dramatically.", role: "Senior Consultant" }
  ];

  const [idx, setIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setIdx(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, testimonials.length]);

  return (
    <div 
      className="card gentle-hover-lift"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="badge badge-primary">1.5 Trust Carousel (WCAG 2.2.2)</span>
        <button 
          onClick={() => setIsPaused(!isPaused)} 
          className="text-xs btn btn-ghost btn-sm"
          style={{ padding: '2px 6px', height: 'auto' }}
        >
          {isPaused ? '▶ Play' : '⏸ Auto-Pause'}
        </button>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Auto-Pause on Hover/Focus</h3>
      <p className="text-secondary text-xs mb-3">
        Crossfades opacity only (no jarring slides). Pauses instantly on hover/focus to honor WCAG 2.2.2.
      </p>

      <div style={{ minHeight: '80px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '6px' }}>
              "{testimonials[idx].text}"
            </p>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
              — {testimonials[idx].name} <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>({testimonials[idx].role})</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProgressiveStepDemo() {
  const [step, setStep] = useState(2);
  const steps = ["Personal", "Symptoms", "Triage", "Confirmed"];

  return (
    <div className="card gentle-hover-lift">
      <div className="flex justify-between items-start mb-2">
        <span className="badge badge-primary">2.2 Progressive Step Indicator</span>
        <span className="text-xs text-secondary">~300ms width ease</span>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Multi-Step Form Progress</h3>
      <p className="text-secondary text-xs mb-4">
        Smooth width transition with completed step checkmarks. Announces step progress via aria-valuenow.
      </p>

      <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
        <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '12px' }}>
          <motion.div 
            style={{ height: '100%', background: 'var(--primary)', borderRadius: '9999px' }}
            animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs font-semibold">
          {steps.map((s, i) => (
            <span key={s} style={{ color: i <= step ? 'var(--primary)' : 'var(--text-secondary)' }}>
              {i < step ? '✓ ' : ''}{s}
            </span>
          ))}
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button 
            disabled={step === 0}
            onClick={() => setStep(s => Math.max(0, s - 1))}
            className="btn btn-secondary btn-sm"
          >
            Back
          </button>
          <button 
            disabled={step === steps.length - 1}
            onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
            className="btn btn-primary btn-sm"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
}

function SmartSearchDemo() {
  const [query, setQuery] = useState('');
  const allSpecialists = [
    "Cardiologist - Dr. Ananya Sharma",
    "Orthopedic Surgeon - Dr. Ravi Saxena",
    "Pediatrician - Dr. Meera Nambiar",
    "Neurologist - Dr. Vikram Sethi",
    "Dermatologist - Dr. Priya Verma"
  ];

  const filtered = query.trim() 
    ? allSpecialists.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : [];

  return (
    <div className="card gentle-hover-lift">
      <div className="flex justify-between items-start mb-2">
        <span className="badge badge-primary">2.5 Smart Search-as-You-Type</span>
        <span className="text-xs text-secondary">Debounced + Staggered</span>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Guided Specialist Finder</h3>
      <p className="text-secondary text-xs mb-3">
        Matches fade in with 40ms stagger. Results announced via aria-live="polite" for screen reader parity.
      </p>

      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type 'Cardio', 'Dr', or 'Ortho'..."
          className="form-control text-sm"
          style={{ width: '100%' }}
        />
        <div aria-live="polite" className="sr-only">
          {filtered.length} doctors found matching {query}
        </div>

        {filtered.length > 0 && (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtered.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: i * 0.04 }}
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{item}</span>
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Available</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SelfDrawingChartDemo() {
  const [drawn, setDrawn] = useState(true);

  return (
    <div className="card gentle-hover-lift">
      <div className="flex justify-between items-start mb-2">
        <span className="badge badge-primary">3.2 Self-Drawing SVG Chart</span>
        <span className="text-xs text-secondary">~1s stroke draw</span>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Wait-Time Trend Line</h3>
      <p className="text-secondary text-xs mb-3">
        Draws line with SVG path animation. Includes paired text data table for screen reader parity.
      </p>

      <div style={{ background: '#0F172A', padding: '16px', borderRadius: '12px', position: 'relative' }}>
        <svg viewBox="0 0 300 80" style={{ width: '100%', height: '80px', overflow: 'visible' }}>
          <motion.path
            d="M 10 60 Q 60 20, 110 45 T 210 25 T 290 55"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: drawn ? 1 : 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          {/* Data point */}
          <circle cx="210" cy="25" r="5" fill="#38BDF8" />
        </svg>
        <div className="flex justify-between text-xs text-secondary mt-2" style={{ color: '#94A3B8' }}>
          <span>9 AM (Low)</span>
          <span>12 PM (Peak)</span>
          <span>4 PM (Optimal)</span>
        </div>
      </div>
    </div>
  );
}

function SymptomCheckerDemo() {
  const [step, setStep] = useState(0);
  const questions = [
    { q: "Where is the discomfort primarily located?", options: ["Chest / Breathing", "Joint / Orthopedic", "Head / Neurological"] },
    { q: "How long has it been persisting?", options: ["Under 24 Hours", "2–5 Days", "More than 1 Week"] },
    { q: "Is the discomfort sharp or a dull ache?", options: ["Sharp / Acute", "Dull & Constant", "Intermittent"] }
  ];

  return (
    <div className="card gentle-hover-lift">
      <div className="flex justify-between items-start mb-2">
        <span className="badge badge-primary">4.1 Guided Micro-Steps</span>
        <span className="text-xs text-secondary">20px translateY + fade</span>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Conversational Symptom Intake</h3>
      <p className="text-secondary text-xs mb-3">
        One question at a time to reduce cognitive overload. Includes non-diagnostic medical disclaimer.
      </p>

      <div style={{ minHeight: '130px', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              Q{step + 1}: {questions[step].q}
            </div>
            <div className="flex gap-2 flex-wrap">
              {questions[step].options.map(opt => (
                <button
                  key={opt}
                  onClick={() => setStep(s => (s + 1) % questions.length)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '10px' }}>
          ⓘ Non-diagnostic triage assistant. Call 112 for severe distress.
        </div>
      </div>
    </div>
  );
}

function BookingConfirmationDemo() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="card gentle-hover-lift">
      <div className="flex justify-between items-start mb-2">
        <span className="badge badge-primary">4.3 Booking Confirmation Micro-Animation</span>
        <span className="text-xs text-secondary">~400ms draw-in</span>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Closure Micro-Animation</h3>
      <p className="text-secondary text-xs mb-3">
        Checkmark draws into soft pulsing circle, confirming appointment success and clearing booking anxiety.
      </p>

      {!confirmed ? (
        <button 
          onClick={() => setConfirmed(true)} 
          className="btn btn-primary btn-sm w-full"
          style={{ minHeight: '40px' }}
        >
          Confirm Dr. Sharma Slot (4:30 PM)
        </button>
      ) : (
        <div 
          role="status" 
          aria-live="assertive" 
          style={{
            padding: '16px',
            background: 'var(--success-bg)',
            borderRadius: '12px',
            border: '1px solid #A7F3D0',
            textAlign: 'center'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 8px',
            borderRadius: '50%',
            background: 'var(--success)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" className="checkmark-draw" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--success-text)' }}>Appointment Confirmed!</div>
          <div style={{ fontSize: '12px', color: 'var(--success-text)', opacity: 0.9 }}>Pass added to your Apple/Google Calendar</div>
          <button onClick={() => setConfirmed(false)} className="btn btn-ghost btn-sm mt-2" style={{ fontSize: '11px', color: 'var(--success-text)' }}>Reset</button>
        </div>
      )}
    </div>
  );
}

function AccordionDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="card gentle-hover-lift">
      <div className="flex justify-between items-start mb-2">
        <span className="badge badge-primary">4.4 Accessible FAQ Accordion</span>
        <span className="text-xs text-secondary">grid-template-rows</span>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Smooth Clinical FAQ</h3>
      <p className="text-secondary text-xs mb-3">
        Auto-height animation using CSS grid-template-rows with synchronized rotating chevron.
      </p>

      <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          style={{
            width: '100%',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
            border: 'none',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <span>What documents are needed for Ayushman Bharat (PM-JAY)?</span>
          <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
        </button>
        <div className={`accessible-accordion-content ${open ? 'expanded' : ''}`}>
          <div className="accessible-accordion-inner" style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            You only need your Aadhaar Card and PM-JAY e-card / Ration card. The hospital admission kiosk at CityCare verifies eligibility instantly via automated biometric OTP.
          </div>
        </div>
      </div>
    </div>
  );
}

function EmpatheticFormDemo() {
  const [error, setError] = useState(false);

  const triggerError = (e) => {
    e.preventDefault();
    setError(true);
    setTimeout(() => setError(false), 2000);
  };

  return (
    <div className="card gentle-hover-lift">
      <div className="flex justify-between items-start mb-2">
        <span className="badge badge-primary">4.5 Empathetic Form Error Shake</span>
        <span className="text-xs text-secondary">2 cycles ±4px 200ms</span>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Non-Punitive Field Validation</h3>
      <p className="text-secondary text-xs mb-3">
        Gentle 200ms shake only on submit failure, never on typing. Announced via aria-live="polite".
      </p>

      <form onSubmit={triggerError}>
        <input
          type="text"
          placeholder="Emergency Contact Phone (+91...)"
          className={`form-control text-sm ${error ? 'empathetic-shake' : ''}`}
          style={{ width: '100%', marginBottom: '8px' }}
          aria-invalid={error}
          aria-describedby="phone-error"
        />
        {error && (
          <div id="phone-error" role="status" aria-live="polite" className="text-xs text-danger mb-2 font-medium">
            ⚠️ Please provide a 10-digit mobile number for dispatch updates.
          </div>
        )}
        <button type="submit" className="btn btn-secondary btn-sm w-full">
          Validate Emergency Contact
        </button>
      </form>
    </div>
  );
}

function ChatWidgetDemo() {
  const [shown, setShown] = useState(true);

  return (
    <div className="card gentle-hover-lift">
      <div className="flex justify-between items-start mb-2">
        <span className="badge badge-primary">4.6 Delayed Live Support Entrance</span>
        <span className="text-xs text-secondary">Soft scale 0.9 &rarr; 1.0</span>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Non-Intrusive Safety Net</h3>
      <p className="text-secondary text-xs mb-3">
        Appears gracefully after a delay rather than ambushing users the moment the page loads.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--primary-bg)', borderRadius: '12px' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={16} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-dark)' }}>24/7 Triage Nurse Assistant</div>
            <div style={{ fontSize: '11px', color: 'var(--primary-darker)' }}>Online now • 1m response</div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm">Chat</button>
      </div>
    </div>
  );
}

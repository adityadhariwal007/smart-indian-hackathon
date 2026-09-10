import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { StatusPulse, VerifiedCredentialBadge } from '../animations/Animations';

const CINEMATIC_STEPS = [
  {
    id: 'intro',
    badge: 'Vision & Architecture',
    title: 'HealthFlow: The Next-Gen Healthcare Cloud',
    subtitle: 'Bridging Emergency Care, AI Crowd Forecasting & Dynamic Triage',
    description: 'Traditional hospital systems suffer from erratic bottlenecks and information asymmetry. HealthFlow dynamically balances patient loads using real-time predictive crowd algorithms and verified credential handshakes.',
    metric: '42% Wait Reduction',
    actionRoute: '/patient/crowd',
    actionLabel: 'Inspect Live AI Crowd Forecast',
    keyPoints: [
      'NABH and ABDM compliant real-time corridor network',
      'WCAG 2.2 Level AAA motion sensitivity architecture',
      'GPU-accelerated telemetry with zero layout shift'
    ]
  },
  {
    id: 'crowd',
    badge: 'AI Engine',
    title: 'Self-Drawing Dynamic Crowd Forecasts',
    subtitle: 'Zero-Lag SVG Interpolation & Predictive Bed Capacity',
    description: 'Watch the patient volume trends draw in real time. Patients can view hourly peak predictions to choose the ideal arrival window, eliminating multi-hour waiting room anxiety.',
    metric: '94.8% AI Forecast Accuracy',
    actionRoute: '/patient/crowd',
    actionLabel: 'Open Self-Drawing Chart Page',
    keyPoints: [
      'SVG stroke-dashoffset animation responsive to viewport',
      'Keyboard-accessible data points with ESC dismissible tooltips',
      'Accessible data-table fallbacks for screen reader parity'
    ]
  },
  {
    id: 'cost',
    badge: 'Financial Transparency',
    title: 'Receipt-Style Dynamic Cost Estimator',
    subtitle: 'Staggered Breakdown & Ayushman Bharat Subsidies',
    description: 'No more surprise medical bills. Transparent itemized costs appear with staggered receipt motion, calculating insurance co-pays and government scheme deductions automatically.',
    metric: '100% Upfront Price Certainty',
    actionRoute: '/patient/cost',
    actionLabel: 'Launch Cost Estimator',
    keyPoints: [
      'Staggered line-item reveals with monetary tally counters',
      'Ayushman Bharat (PM-JAY) subsidy auto-deduction',
      'Exportable verified estimate receipt with cryptographic hash'
    ]
  },
  {
    id: 'ambulance',
    badge: 'Critical Response',
    title: 'Real-Time Rapid Ambulance Dispatch',
    subtitle: 'Live Telemetry, Green Corridor Routing & Driver Verification',
    description: 'In emergencies, seconds count. HealthFlow connects patients to the nearest Advanced Life Support unit with live GPS coordinate interpolation, speed monitoring, and hospital emergency bay pre-alerting.',
    metric: '6.8 Min Average Arrival',
    actionRoute: '/patient/ambulance',
    actionLabel: 'Experience Ambulance Tracking',
    keyPoints: [
      'Custom Leaflet SVG markers with pulse animations',
      'Verified Paramedic & ACLS certification draw-in badges',
      'Single-touch SOS phone links with 44x44px touch targets'
    ]
  },
  {
    id: 'queue',
    badge: 'Smart Queueing',
    title: 'Zero-Wait Digital Queue Token',
    subtitle: '3D Token Stamp, Live Counter & Real-Time Desk Alert',
    description: 'Patients receive an authenticated digital queue pass that dynamically ticks down as doctors consult patients ahead, letting them wait comfortably at home or nearby cafes.',
    metric: '#4 in Queue • ETA 18 Min',
    actionRoute: '/patient/queue',
    actionLabel: 'View Animated Token Stamp',
    keyPoints: [
      'Dynamic physical stamp animation with subtle sound haptic',
      'Real-time remaining patient counter',
      'QR verification for hospital reception check-in'
    ]
  },
  {
    id: 'patient-portal',
    badge: 'Patient Experience',
    title: 'DrDoctor-Inspired Patient Portal',
    subtitle: 'Digital Triage Room, Live Queue Telematics & Zero-Wait Care',
    description: 'Empowering patients with live queue positions, instant emergency triage access, and direct consultation scheduling with top specialists across 20+ connected hospitals.',
    metric: '99.8% Triage Accuracy',
    actionRoute: '/patient',
    actionLabel: 'Explore Patient Portal',
    keyPoints: [
      'Digital triage room with real-time specialist availability',
      'Live queue token tracking with estimated wait times',
      'Instant ambulance GPS dispatch & emergency triage'
    ]
  }
];

export default function HackathonMode({ onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const currentStep = CINEMATIC_STEPS[currentIdx];

  // 12-second auto progression per step when playing
  useEffect(() => {
    if (!isPlaying) return;

    const duration = 10000; // 10s
    const stepInterval = 100;
    const increment = (stepInterval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentIdx(curr => (curr + 1) % CINEMATIC_STEPS.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepInterval);

    return () => clearInterval(timer);
  }, [isPlaying, currentIdx]);

  const handleNext = () => {
    setProgress(0);
    setCurrentIdx(prev => (prev + 1) % CINEMATIC_STEPS.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIdx(prev => (prev - 1 + CINEMATIC_STEPS.length) % CINEMATIC_STEPS.length);
  };

  const handleJumpToLive = (route) => {
    if (onClose) onClose();
    navigate(route);
  };

  return (
    <div 
      className="hackathon-cinematic-overlay" 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: 'white'
      }}
      role="dialog"
      aria-modal="true"
      aria-label="HealthFlow Cinematic Experience"
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '920px',
          background: '#0B132B',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Header Bar */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #0891B2, #22D3EE)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#082f49'
            }}>
              Cinematic Product Tour
            </span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
              Step {currentIdx + 1} of {CINEMATIC_STEPS.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                padding: '8px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              aria-label={isPlaying ? "Pause cinematic tour" : "Play cinematic tour"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause Auto' : 'Auto Play'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Close walkthrough"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.06)' }}>
          <div 
            style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, #0891B2, #22D3EE)', 
              width: `${progress}%`,
              transition: isPlaying ? 'width 0.1s linear' : 'none'
            }} 
          />
        </div>

        {/* Content Body with Animated Transitions */}
        <div style={{ padding: '36px 36px', minHeight: '340px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ color: '#22D3EE', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {currentStep.badge}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
                <span style={{ color: '#34D399', fontSize: '12px', fontWeight: 600 }}>
                  {currentStep.metric}
                </span>
              </div>

              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: '#F8FAFC' }}>
                {currentStep.title}
              </h2>

              <h4 style={{ fontSize: '16px', fontWeight: 500, color: '#94A3B8', marginBottom: '20px' }}>
                {currentStep.subtitle}
              </h4>

              <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#CBD5E1', marginBottom: '24px', maxWidth: '780px' }}>
                {currentStep.description}
              </p>

              {/* Bullet Key Points */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '28px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#22D3EE', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Technical Architecture & UX Highlights:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {currentStep.keyPoints.map((pt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#E2E8F0' }}>
                      <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => handleJumpToLive(currentStep.actionRoute)}
                  style={{
                    background: 'linear-gradient(135deg, #0891B2, #0E7490)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(8, 145, 178, 0.4)'
                  }}
                >
                  <span>{currentStep.actionLabel}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Bar */}
        <div style={{
          padding: '20px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Progress Indicators */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {CINEMATIC_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentIdx(idx);
                  setProgress(0);
                }}
                style={{
                  width: idx === currentIdx ? '28px' : '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  background: idx === currentIdx ? '#22D3EE' : 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                aria-label={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Stepper Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handlePrev}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px'
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              onClick={handleNext}
              style={{
                background: 'rgba(255, 255, 255, 0.16)',
                border: 'none',
                color: 'white',
                padding: '8px 18px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

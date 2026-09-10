import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  HeartPulse, Search, TrendingUp, Stethoscope, Ambulance,
  ArrowRight, MapPin, Users, Clock, Shield, ChevronRight,
  Activity, Zap, BarChart3, Phone, User, ShieldCheck, AlertTriangle,
  Syringe, Cross
} from 'lucide-react';
import { ScrollReveal, AnimatedCounter, MagneticButton } from '../../components/animations/Animations';
import MaskedHeading from '../../components/common/MaskedHeading';
import MagicBento from './MagicBento';
import HealthcareLogoBanner from '../../components/common/HealthcareLogoBanner';
import { useAuth } from '../../context/AuthContext';
import './LandingPage.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { login, switchRole } = useAuth();
  const { scrollY } = useScroll();

  const handleRoleLogin = (role) => {
    login(role);
    navigate(`/${role}`);
  };
  
  // Parallax effects
  const bgY = useTransform(scrollY, [0, 1000], [0, 300]);
  const fgY = useTransform(scrollY, [0, 1000], [0, -100]);

  const benefits = [
    {
      icon: Search,
      title: 'Smart Hospital Discovery',
      description: 'Find hospitals based on distance, crowd, specialization and availability.',
      color: '#0891B2',
    },
    {
      icon: TrendingUp,
      title: 'AI Crowd Prediction',
      description: 'Predict hospital and department congestion before you arrive.',
      color: '#8B5CF6',
    },
    {
      icon: Stethoscope,
      title: 'Doctor Expertise',
      description: 'Find specialists based on their actual area of expertise.',
      color: '#10B981',
    },
    {
      icon: Ambulance,
      title: 'Emergency Coordination',
      description: 'Locate and coordinate the nearest suitable ambulance.',
      color: '#EF4444',
    },
  ];

  const stats = [
    { value: '20', suffix: '+', label: 'Hospitals', icon: MapPin },
    { value: '200', suffix: '+', label: 'Doctors', icon: Users },
    { value: '50', suffix: '', label: 'Ambulances', icon: Ambulance },
    { value: '24', suffix: '/7', label: 'Emergency', icon: Clock },
  ];

  // Title character animation
  const titleText = "Smarter Healthcare. Less Waiting.";
  const titleChars = titleText.split("");

  return (
    <div className="landing overflow-hidden relative">
      {/* Dynamic Background Mesh */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
        style={{ y: bgY }}
      >
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-200 blur-[100px] mix-blend-multiply" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-200 blur-[80px] mix-blend-multiply" />
      </motion.div>

      {/* DrDoctor Reference Top Navigation */}
      <nav className="landing-nav-drdoctor">
        <div 
          className="landing-logo-drdoctor" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <HeartPulse size={26} className="text-emerald-400" />
          <span>HealthFlow</span>
        </div>
        <div className="landing-pill-menu">
          {/* Quick Role Login Buttons - Patient, Doctor and Admin Portal */}
          <div className="landing-role-nav-group" role="group" aria-label="Portal shortcuts">
            <button
              className="nav-role-btn nav-role-patient"
              onClick={() => handleRoleLogin('patient')}
              title="Open Patient Portal (Aryan Verma)"
            >
              <User size={13} />
              <span>Patient</span>
            </button>

            <button
              className="nav-role-btn nav-role-doctor"
              onClick={() => handleRoleLogin('doctor')}
              title="Open Doctor Portal (Dr. Ananya Sharma)"
            >
              <Stethoscope size={13} />
              <span>Doctor</span>
            </button>

            <button
              className="nav-role-btn nav-role-admin"
              onClick={() => handleRoleLogin('admin')}
              title="Open Hospital Admin Portal (Rajesh Mehta)"
            >
              <Shield size={13} />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </nav>

      {/* DrDoctor Reference Hero Section */}
      <section className="hero-drdoctor">
        <div className="drdoctor-hero-body">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="hero-badge-drdoctor"
          >
            HEALTHFLOW
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-headline-drdoctor"
          >
            Behind every great patient experience lies HealthFlow
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-subheadline-drdoctor"
          >
            Real-time triage intelligence, zero-wait outpatient queues, and instant emergency response — coordinating patients, doctors, and hospitals into one seamless care network.
          </motion.p>
          
          {/* Live Healthcare Telemetry & Trust Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hero-trust-row"
          >
            <span className="trust-badge-pill">
              <ShieldCheck size={14} className="text-emerald-400" />
              ABHA & ABDM Verified Network
            </span>
            <span className="trust-badge-pill">
              <span className="live-status-dot" />
              20+ Connected Hospitals
            </span>
            <span className="trust-badge-pill">
              <Clock size={14} className="text-emerald-400" />
              &lt; 38 min Avg. Outpatient Wait
            </span>
          </motion.div>

          {/* Hero CTAs: Book an Appointment & Emergency */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="hero-cta-group"
          >
            <button 
              className="hero-book-btn"
              onClick={() => {
                switchRole('patient');
                navigate('/patient');
              }}
            >
              Book an Appointment
            </button>

            <button 
              className="hero-emergency-btn"
              onClick={() => navigate('/patient/emergency')}
              title="Immediate Emergency Ambulance & Triage"
            >
              <AlertTriangle size={18} />
              <span>Emergency</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Informative Public Health & Service Cards */}
      <section className="emerging-cards-wrapper" id="directory">
        <div className="emerging-cards-grid">
          {/* Card 1: Public Hospital Directory */}
          <motion.div 
            className="emerging-card-box"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <div className="emerging-tag">PATIALA HEALTHCARE DIRECTORY</div>
              <h2 className="emerging-title">Verified Hospital Listings & Facilities</h2>
              <p className="text-secondary text-sm mb-6 leading-relaxed">
                Access verified hospital information across Patiala district, including bed capacities, specialized departments, consultation fees (₹200–₹500), and live crowd status.
              </p>
            </div>
            
            {/* Professional Hospital Preview */}
            <div 
              onClick={() => { switchRole('patient'); navigate('/patient/hospitals'); }}
              className="cursor-pointer group"
              style={{
                background: '#F8FAFC',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div className="flex justify-between items-center text-xs text-secondary font-semibold pb-2 border-b border-slate-200">
                <span>Patiala District Hospitals</span>
                <span className="text-primary font-bold">20 Verified Centers</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-800">GMC & Rajindra Hospital</div>
                    <div className="text-[11px] text-slate-500">Sangrur Road • 1,100 Beds • Level-1 Trauma</div>
                  </div>
                  <span className="badge badge-success text-[11px]">Govt • ₹200</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-800">Mata Kaushalya Hospital</div>
                    <div className="text-[11px] text-slate-500">Lahori Gate • 420 Beds • Maternity & General</div>
                  </div>
                  <span className="badge badge-success text-[11px]">Govt • ₹200</span>
                </div>
              </div>

              <div className="text-xs text-primary font-bold flex items-center justify-between pt-1 group-hover:translate-x-1 transition">
                <span>Explore All 20 Patiala Hospitals</span>
                <span>→</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Patient Services & Emergency Support */}
          <motion.div 
            className="emerging-card-box"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div>
              <div className="emerging-tag">PATIENT SERVICES & TRIAGE</div>
              <h2 className="emerging-title">Outpatient Queues & Emergency Support</h2>
              <p className="text-secondary text-sm mb-6 leading-relaxed">
                Check queue status remotely to plan your hospital visit efficiently, and access direct 24/7 emergency response contacts for immediate medical assistance.
              </p>
            </div>

            {/* Professional Outpatient & Emergency Preview */}
            <div 
              onClick={() => { switchRole('patient'); navigate('/patient'); }}
              className="cursor-pointer group"
              style={{
                background: '#0F172A',
                borderRadius: '16px',
                padding: '20px',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                  <span className="text-slate-400 font-medium">Digital Queue Status</span>
                </div>
                <span className="text-emerald-400 font-semibold text-[11px]">Active OPD Hours</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-white text-sm">Token #A-128</div>
                  <div className="text-slate-400 text-[11px]">General Medicine • Est. Wait ~20 min</div>
                </div>
                <span className="badge badge-primary text-[11px]">In Queue</span>
              </div>

              <div 
                className="p-2.5 bg-red-950/60 rounded-xl border border-red-900/60 flex justify-between items-center text-xs text-red-200"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/patient/emergency');
                }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-400 shrink-0" />
                  <span>24/7 Emergency Helplines: <strong>112</strong> / <strong>108</strong></span>
                </div>
                <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                  SOS <ArrowRight size={13} />
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar relative z-10 bg-white py-12 border-y border-gray-100" id="stats">
        <ScrollReveal className="stats-bar-inner max-w-5xl mx-auto flex justify-between px-6">
          {stats.map((stat, i) => (
            <div key={i} className="stats-bar-item flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-xl text-primary">
                <stat.icon size={28} />
              </div>
              <div>
                <div className="stats-bar-value text-3xl font-bold flex">
                  <AnimatedCounter value={stat.value} />{stat.suffix}
                </div>
                <div className="stats-bar-label text-gray-500 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </section>

      {/* Benefits - Interactive MagicBento */}
      <section className="benefits py-24 bg-gray-50/60" id="features">
        <div className="benefits-inner max-w-7xl mx-auto px-6">
          <ScrollReveal className="section-header text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600 mb-2 block">
              PLATFORM CAPABILITIES
            </span>
            <h2 className="text-4xl font-extrabold mb-4 text-slate-900">Why HealthFlow?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              One platform to solve healthcare accessibility, queue management, and emergency coordination.
            </p>
          </ScrollReveal>
          
          <MagicBento 
            cards={[
              {
                icon: Search,
                title: 'Smart Hospital Discovery',
                description: 'Find hospitals based on distance, crowd, specialization and availability.',
                color: '#0891B2',
                glowColor: '8, 145, 178',
                label: 'Hospitals',
                linkText: 'Learn more',
                bgColor: '#0e1726',
                onClick: () => navigate('/patient/hospitals')
              },
              {
                icon: TrendingUp,
                title: 'AI Crowd Prediction',
                description: 'Predict hospital and department congestion before you arrive.',
                color: '#A855F7',
                glowColor: '168, 85, 247',
                label: 'Live AI',
                linkText: 'Learn more',
                bgColor: '#171129',
                onClick: () => navigate('/patient/crowd')
              },
              {
                icon: Stethoscope,
                title: 'Doctor Expertise',
                description: 'Find specialists based on their actual area of expertise.',
                color: '#10B981',
                glowColor: '16, 185, 129',
                label: 'Specialists',
                linkText: 'Learn more',
                bgColor: '#0d1e1c',
                onClick: () => navigate('/patient/doctors')
              },
              {
                icon: Ambulance,
                title: 'Emergency Coordination',
                description: 'Locate and coordinate the nearest suitable ambulance.',
                color: '#EF4444',
                glowColor: '239, 68, 68',
                label: 'Rapid SOS',
                linkText: 'Learn more',
                bgColor: '#211016',
                onClick: () => navigate('/patient/emergency')
              },
            ]}
            textAutoHide={false}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="132, 0, 255"
          />
        </div>
      </section>

      {/* Monochrome Healthcare Icons Loop Banner on Black Background */}
      <HealthcareLogoBanner />

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner max-w-5xl mx-auto px-6 flex flex-col items-center">
          <div 
            className="footer-brand"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <HeartPulse size={24} className="text-emerald-400" />
            <span>HealthFlow</span>
          </div>

          <div className="footer-links">
            <a href="#directory">Hospital Directory</a>
            <a href="#stats">Network Stats</a>
            <a href="#features">Platform Features</a>
            <button onClick={() => navigate('/patient/emergency')} className="footer-link-emergency">
              Emergency SOS
            </button>
            <button onClick={() => handleRoleLogin('patient')} className="footer-link-btn">
              Patient Portal
            </button>
            <button onClick={() => handleRoleLogin('doctor')} className="footer-link-btn">
              Doctor Portal
            </button>
            <button onClick={() => handleRoleLogin('admin')} className="footer-link-btn">
              Admin Portal
            </button>
          </div>

          <div className="footer-disclaimer">
            <span className="footer-disclaimer-tag">Demo Platform Notice</span>
            <p>
              HealthFlow is a demonstration platform with synthetic and fictional clinical data.
              It does not provide official medical advice, diagnosis, or treatment.
              In a medical emergency, immediately call <strong>112</strong> or <strong>108</strong>.
            </p>
          </div>

          <p className="footer-copy">© 2026 HealthFlow Healthcare Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

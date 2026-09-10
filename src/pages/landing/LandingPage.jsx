import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  HeartPulse, Search, TrendingUp, Stethoscope, Ambulance,
  ArrowRight, MapPin, Users, Clock, Shield, ChevronRight,
  Activity, Zap, BarChart3, Phone, User, ShieldCheck, AlertTriangle,
  Syringe, Cross, CheckCircle2, LogIn
} from 'lucide-react';
import { ScrollReveal, AnimatedCounter, MagneticButton } from '../../components/animations/Animations';
import MaskedHeading from '../../components/common/MaskedHeading';
import MagicBento from './MagicBento';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageToggle from '../../components/common/LanguageToggle';
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
  const { t } = useLanguage();
  const { scrollY } = useScroll();

  const handleRoleLogin = (role) => {
    login(role);
    navigate(`/${role}`);
  };
  
  // Parallax effects
  const bgY = useTransform(scrollY, [0, 1000], [0, 300]);
  const fgY = useTransform(scrollY, [0, 1000], [0, -100]);

  const stats = [
    { value: '20', suffix: '+', label: t('statHospitals'), icon: MapPin },
    { value: '150', suffix: '+', label: t('statSpecialists'), icon: Users },
    { value: '28', suffix: ' min', label: t('statWait'), icon: Clock },
    { value: '99', suffix: '%', label: t('statAccuracy'), icon: Shield },
  ];

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
          <span>{t('brandName')}</span>
        </div>
        <div className="landing-pill-menu">
          <LanguageToggle />

          <button
            className="nav-role-btn"
            style={{ background: 'transparent', color: '#1E293B', fontWeight: 600, border: '1px solid #CBD5E1' }}
            onClick={() => {
              const el = document.getElementById('directory');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Hospitals
          </button>

          <button
            className="nav-role-btn"
            style={{ background: '#059669', color: '#FFFFFF', fontWeight: 700, borderColor: '#059669', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)' }}
            onClick={() => navigate('/login')}
            title="Sign in with Google or Mobile OTP"
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
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
            <span className="hero-badge-dot" />
            <span>{t('badge')}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-headline-drdoctor"
          >
            {t('heroHeadlinePrefix')} <br className="hidden sm:inline" />
            {t('heroHeadlineLies')} <span className="hero-headline-highlight">{t('brandName')}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-subheadline-drdoctor"
          >
            {t('heroSubheadline')}
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
              {t('trustAbha')}
            </span>
            <span className="trust-badge-pill">
              <span className="live-status-dot" />
              {t('trustHospitals')}
            </span>
            <span className="trust-badge-pill">
              <Clock size={14} className="text-emerald-400" />
              {t('trustWait')}
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
              {t('bookAppointment')}
            </button>

            <button 
              className="hero-emergency-btn"
              onClick={() => navigate('/patient/emergency')}
              title="Immediate Emergency Ambulance & Triage"
            >
              <AlertTriangle size={18} />
              <span>{t('emergencyBtn')}</span>
            </button>
          </motion.div>

          {/* Grounded Live Product Telemetry Snapshot Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="hero-live-telemetry-box"
          >
            <div className="hero-telemetry-header">
              <div className="flex items-center gap-2">
                <span className="live-status-dot" />
                <span className="text-xs font-semibold text-emerald-300">Live Hospital & Ambulance Telemetry • Patiala District</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Updated just now</span>
            </div>

            <div className="telemetry-grid">
              <div className="telemetry-item">
                <div className="telemetry-item-title">
                  <HeartPulse size={14} className="text-emerald-400" />
                  <span>GMC Rajindra Hospital</span>
                </div>
                <div className="telemetry-item-meta">
                  1,100 Total Beds • <strong className="text-emerald-300">142 Available</strong> (ICU: 18)
                </div>
              </div>

              <div className="telemetry-item">
                <div className="telemetry-item-title">
                  <Activity size={14} className="text-blue-400" />
                  <span>Civil Hospital Mata Kaushalya</span>
                </div>
                <div className="telemetry-item-meta">
                  320 Total Beds • <strong className="text-blue-300">46 Available</strong> (ICU: 6)
                </div>
              </div>

              <div className="telemetry-item">
                <div className="telemetry-item-title">
                  <Clock size={14} className="text-amber-400" />
                  <span>OPD Queue Telemetry</span>
                </div>
                <div className="telemetry-item-meta">
                  Token <strong className="text-white font-mono">#A-118</strong> Called • Avg Wait &lt; 28 min
                </div>
              </div>

              <div className="telemetry-item">
                <div className="telemetry-item-title">
                  <Ambulance size={14} className="text-red-400" />
                  <span>108 Emergency Standby</span>
                </div>
                <div className="telemetry-item-meta">
                  Unit ALS-04 at Fountain Chowk • <strong className="text-emerald-300">ETA 8 min</strong>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4-Step Patient Care Journey Grid */}
      <section className="care-journey-wrapper" id="directory">
        <div className="care-journey-grid">
          {/* Step 1: Real-Time Bed & Facility Capacity */}
          <motion.div
            className="care-journey-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="care-journey-step-num">1</div>
            <h3 className="care-journey-title">Live Hospital Capacity</h3>
            <p className="care-journey-desc">
              Inspect real-time general and ICU bed occupancy across 20 verified Patiala hospitals before leaving home.
            </p>
            <button
              className="care-journey-action-btn"
              onClick={() => {
                switchRole('patient');
                navigate('/patient/hospitals');
              }}
            >
              <span>Explore Facilities</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>

          {/* Step 2: Digital OPD Queue Token */}
          <motion.div
            className="care-journey-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="care-journey-step-num">2</div>
            <h3 className="care-journey-title">Digital Queue Token</h3>
            <p className="care-journey-desc">
              Get an instant digital token for government and empanelled OPDs. Monitor your position live and arrive right on time.
            </p>
            <button
              className="care-journey-action-btn"
              onClick={() => {
                switchRole('patient');
                navigate('/patient/queue');
              }}
            >
              <span>Check Live Queue</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>

          {/* Step 3: Clinical Consultation & ABDM Records */}
          <motion.div
            className="care-journey-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="care-journey-step-num">3</div>
            <h3 className="care-journey-title">ABDM Health Records</h3>
            <p className="care-journey-desc">
              Access digital prescriptions, diagnostic lab reports, and doctor notes safely linked to your 14-digit ABHA address.
            </p>
            <button
              className="care-journey-action-btn"
              onClick={() => {
                switchRole('patient');
                navigate('/patient/portal');
              }}
            >
              <span>Open Health Portal</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>

          {/* Step 4: Rapid 108 Emergency Dispatch */}
          <motion.div
            className="care-journey-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="care-journey-step-num" style={{ background: '#FEE2E2', color: '#DC2626' }}>4</div>
            <h3 className="care-journey-title">108 Emergency Dispatch</h3>
            <p className="care-journey-desc">
              One-tap dispatch for GPS-tracked Advanced Life Support (ALS) ambulances directly to your Patiala neighborhood.
            </p>
            <button
              className="care-journey-action-btn"
              style={{ color: '#DC2626' }}
              onClick={() => {
                switchRole('patient');
                navigate('/patient/emergency');
              }}
            >
              <span>Emergency Services</span>
              <ArrowRight size={14} />
            </button>
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
            <span className="quiet-category text-emerald-700 mb-2 block">
              {t('capabilitiesTag')}
            </span>
            <h2 className="text-4xl font-extrabold mb-4 text-slate-900">{t('whyHealthFlow')}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('capabilitiesSub')}
            </p>
          </ScrollReveal>
          
          <MagicBento 
            cards={[
              {
                icon: Search,
                title: t('bentoHospitalTitle'),
                description: t('bentoHospitalDesc'),
                color: '#0891B2',
                glowColor: '8, 145, 178',
                label: 'Hospitals',
                linkText: t('learnMore'),
                bgColor: '#0e1726',
                onClick: () => navigate('/patient/hospitals')
              },
              {
                icon: TrendingUp,
                title: t('bentoCrowdTitle'),
                description: t('bentoCrowdDesc'),
                color: '#A855F7',
                glowColor: '168, 85, 247',
                label: 'Live AI',
                linkText: t('learnMore'),
                bgColor: '#171129',
                onClick: () => navigate('/patient/crowd')
              },
              {
                icon: Stethoscope,
                title: t('bentoDocTitle'),
                description: t('bentoDocDesc'),
                color: '#10B981',
                glowColor: '16, 185, 129',
                label: 'Specialists',
                linkText: t('learnMore'),
                bgColor: '#0d1e1c',
                onClick: () => navigate('/patient/doctors')
              },
              {
                icon: Ambulance,
                title: t('bentoEmergencyTitle'),
                description: t('bentoEmergencyDesc'),
                color: '#EF4444',
                glowColor: '239, 68, 68',
                label: 'Rapid SOS',
                linkText: t('learnMore'),
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
            <span>{t('brandName')}</span>
          </div>

          <div className="footer-links">
            <a href="#directory">{t('footerDirectory')}</a>
            <a href="#stats">{t('footerNetwork')}</a>
            <a href="#features">{t('footerFeatures')}</a>
            <button onClick={() => navigate('/patient/complaints')} className="footer-link-btn" style={{ color: '#34d399', fontWeight: 700 }}>
              Complaint Portal
            </button>
            <button onClick={() => navigate('/patient/emergency')} className="footer-link-emergency">
              {t('emergencySos')}
            </button>
            <button onClick={() => handleRoleLogin('patient')} className="footer-link-btn">
              {t('patientPortal')}
            </button>
            <button onClick={() => handleRoleLogin('doctor')} className="footer-link-btn">
              {t('doctorPortal')}
            </button>
            <button onClick={() => handleRoleLogin('admin')} className="footer-link-btn">
              {t('adminPortal')}
            </button>
            <button onClick={() => navigate('/privacy')} className="footer-link-btn">
              Privacy Policy
            </button>
            <button onClick={() => navigate('/terms')} className="footer-link-btn">
              Terms & Conditions
            </button>
          </div>

          <div className="footer-disclaimer">
            <span className="footer-disclaimer-tag">{t('footerDemoNoticeTag')}</span>
            <p>
              {t('footerDemoNoticeText')}
            </p>
          </div>

          <p className="footer-copy">{t('footerCopy')}</p>
        </div>
      </footer>
    </div>
  );
}

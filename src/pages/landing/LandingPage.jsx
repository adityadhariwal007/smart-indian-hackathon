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
    { value: '38', suffix: ' min', label: t('statWait'), icon: Clock },
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

          {/* Quick Role Login Buttons - Patient, Doctor and Admin Portal */}
          <div className="landing-role-nav-group" role="group" aria-label="Portal shortcuts">
            <button
              className="nav-role-btn nav-role-patient"
              onClick={() => handleRoleLogin('patient')}
              title="Open Patient Portal"
            >
              <User size={13} />
              <span>{t('patient')}</span>
            </button>

            <button
              className="nav-role-btn nav-role-doctor"
              onClick={() => handleRoleLogin('doctor')}
              title="Open Doctor Portal"
            >
              <Stethoscope size={13} />
              <span>{t('doctor')}</span>
            </button>

            <button
              className="nav-role-btn nav-role-admin"
              onClick={() => handleRoleLogin('admin')}
              title="Open Hospital Admin Portal"
            >
              <Shield size={13} />
              <span>{t('admin')}</span>
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
              <div className="emerging-tag">{t('card1Tag')}</div>
              <h2 className="emerging-title">{t('card1Title')}</h2>
              <p className="text-secondary text-sm mb-6 leading-relaxed">
                {t('card1Desc')}
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
                <span>{t('card1District')}</span>
                <span className="text-primary font-bold">{t('card1Badge')}</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{t('card1Hosp1Name')}</div>
                    <div className="text-[11px] text-slate-500">{t('card1Hosp1Desc')}</div>
                  </div>
                  <span className="badge badge-success text-[11px]">{t('card1GovtFee')}</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{t('card1Hosp2Name')}</div>
                    <div className="text-[11px] text-slate-500">{t('card1Hosp2Desc')}</div>
                  </div>
                  <span className="badge badge-success text-[11px]">{t('card1GovtFee')}</span>
                </div>
              </div>

              <div className="text-xs text-primary font-bold flex items-center justify-between pt-1 group-hover:translate-x-1 transition">
                <span>{t('card1Explore')}</span>
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
              <div className="emerging-tag">{t('card2Tag')}</div>
              <h2 className="emerging-title">{t('card2Title')}</h2>
              <p className="text-secondary text-sm mb-6 leading-relaxed">
                {t('card2Desc')}
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
                  <span className="text-slate-400 font-medium">{t('card2QueueStatus')}</span>
                </div>
                <span className="text-emerald-400 font-semibold text-[11px]">{t('card2ActiveHours')}</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-white text-sm">{t('card2TokenNumber')}</div>
                  <div className="text-slate-400 text-[11px]">{t('card2TokenWait')}</div>
                </div>
                <span className="badge badge-primary text-[11px]">{t('card2InQueue')}</span>
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
                  <span>{t('card2Helpline')}</span>
                </div>
                <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                  {t('card2Sos')} <ArrowRight size={13} />
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
            <span>{t('brandName')}</span>
          </div>

          <div className="footer-links">
            <a href="#directory">{t('footerDirectory')}</a>
            <a href="#stats">{t('footerNetwork')}</a>
            <a href="#features">{t('footerFeatures')}</a>
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

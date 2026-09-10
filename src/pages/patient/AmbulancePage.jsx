import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  ShieldCheck, 
  Activity, 
  Navigation, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock,
  ArrowRight,
  HeartPulse
} from 'lucide-react';
import { VerifiedCredentialBadge, StatusPulse } from '../../components/animations/Animations';
import 'leaflet/dist/leaflet.css';

// Custom Leaflet Icons to guarantee zero missing asset issues and sleek healthcare styling
const createCustomIcon = (emoji, color, pulse = false) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        background: ${color};
        color: white;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        border: 2px solid white;
        font-size: 18px;
      ">
        ${pulse ? '<span style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid ' + color + '; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></span>' : ''}
        ${emoji}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
};

const ambulanceIcon = createCustomIcon('🚑', '#EF4444', true);
const patientIcon = createCustomIcon('📍', '#0891B2');
const hospitalIcon = createCustomIcon('🏥', '#10B981');

const STEPS = [
  { id: 1, label: 'Dispatch', time: '10:02 AM', status: 'completed' },
  { id: 2, label: 'En Route', time: '10:04 AM', status: 'current' },
  { id: 3, label: 'On Scene', time: '~10:11 AM', status: 'upcoming' },
  { id: 4, label: 'Triage to Hospital', time: '~10:25 AM', status: 'upcoming' }
];

export default function AmbulancePage() {
  const [requested, setRequested] = useState(false);
  const [eta, setEta] = useState(7);
  const [stepIndex, setStepIndex] = useState(1);
  const [lockedAnim, setLockedAnim] = useState(false);
  
  // Real coordinates in Delhi area
  const [ambPos, setAmbPos] = useState([28.632, 77.222]);
  const patientPos = [28.6139, 77.2090];
  const hospitalPos = [28.6448, 77.2167];

  const handleRequest = () => {
    setLockedAnim(true);
    setTimeout(() => {
      setRequested(true);
      setLockedAnim(false);
    }, 400);
  };

  useEffect(() => {
    if (!requested) return;
    const interval = setInterval(() => {
      setEta(prev => {
        const next = Math.max(0, prev - 1);
        if (next === 0) setStepIndex(2);
        return next;
      });
      setAmbPos(prev => [
        prev[0] + (patientPos[0] - prev[0]) * 0.2,
        prev[1] + (patientPos[1] - prev[1]) * 0.2,
      ]);
    }, 3500);
    return () => clearInterval(interval);
  }, [requested]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 2.3 Sticky Quick Action Bar */}
      <div className="sticky-emergency-bar mb-6 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="flex items-center gap-3">
          <StatusPulse status="danger" label="EMERGENCY DISPATCH LINK" />
          <span className="text-xs text-secondary hidden md:inline">| GPS Priority Corridor Active</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/patient/ambulance/track/EMS-DEMO-108"
            className="btn btn-primary btn-sm flex items-center gap-2"
            style={{ minHeight: '44px', padding: '0 16px', fontWeight: 600 }}
          >
            <Radio size={16} className="animate-pulse" /> Live Map (WebSocket)
          </Link>
          <a 
            href="tel:112" 
            className="btn btn-danger btn-sm flex items-center gap-2"
            style={{ minHeight: '44px', padding: '0 16px', fontWeight: 600 }}
          >
            <Phone size={16} /> Direct SOS: 112
          </a>
        </div>
      </div>

      <div className="page-header mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800 }}>Rapid Ambulance Dispatch</h1>
            <p className="text-secondary">Track real-time GPS telemetry, EMT credentials, and hospital pre-admission handoff.</p>
          </div>
          <VerifiedCredentialBadge label="Government Cat-A EMS Fleet" issuer="Ministry of Health" />
        </div>
      </div>

      {!requested ? (
        <div className="card calm-breathing-bg" style={{ textAlign: 'center', padding: '64px 24px', border: '1px solid var(--border)' }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ fontSize: '64px', marginBottom: '20px' }}
          >
            🚑
          </motion.div>
          <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, marginBottom: '12px' }}>
            Request Immediate Emergency Response
          </h2>
          <p className="text-secondary mb-6" style={{ maxWidth: '480px', margin: '0 auto 28px', fontSize: 'var(--font-md)' }}>
            HealthFlow connects your precise location directly to the nearest Advanced Life Support (ALS) vehicle with automated traffic corridor pre-emption.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-danger btn-xl flex items-center gap-2"
              onClick={handleRequest}
              style={{ minHeight: '48px', padding: '12px 32px', fontSize: '16px', fontWeight: 700 }}
              aria-label="Request Nearest Ambulance Now"
            >
              {lockedAnim ? (
                <>
                  <Lock size={18} className="animate-spin" /> Verifying Triaged Corridor...
                </>
              ) : (
                <>
                  <span>🚨 Request Nearest Ambulance</span>
                </>
              )}
            </motion.button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-secondary flex-wrap" role="note">
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-success" /> HIPAA & ABDM Compliant</span>
            <span className="flex items-center gap-1.5"><Clock size={16} className="text-primary" /> Average Response: 6.8 Mins</span>
            <span className="flex items-center gap-1.5"><HeartPulse size={16} className="text-danger" /> Full Defibrillator/ICU Equipped</span>
          </div>
        </div>
      ) : (
        <>
          {/* 1.4 Security & Status Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6" 
            style={{ 
              background: eta > 0 ? 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)' : 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%)', 
              border: '1px solid ' + (eta > 0 ? '#FDE68A' : '#A7F3D0'),
              padding: '24px'
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: eta > 0 ? '#F59E0B' : '#10B981',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Radio size={24} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 style={{ color: eta > 0 ? 'var(--warning-text)' : 'var(--success-text)', fontWeight: 800 }}>
                      {eta > 0 ? 'Ambulance Unit A-108 En Route' : 'Ambulance Arrived at Scene'}
                    </h3>
                    <StatusPulse status={eta > 0 ? 'warning' : 'available'} label="Telemetry Active" />
                  </div>
                  <p style={{ color: eta > 0 ? 'var(--warning-text)' : 'var(--success-text)', opacity: 0.85, fontSize: '13px' }}>
                    Central Hospital EMS Corridor • Advanced Cardiac Life Support (ACLS Tier 1)
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '36px', fontWeight: 900, color: eta > 0 ? 'var(--warning-text)' : 'var(--success-text)', lineHeight: 1 }}>
                  {eta > 0 ? `${eta} min` : 'ARRIVED'}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: eta > 0 ? 'var(--warning-text)' : 'var(--success-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Estimated Arrival
                </div>
              </div>
            </div>

            {/* 2.2 Progressive Step Indicator */}
            <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <div 
                className="flex items-center justify-between relative" 
                role="progressbar" 
                aria-valuenow={stepIndex} 
                aria-valuemin={0} 
                aria-valuemax={3}
              >
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '14px', 
                    left: '20px', 
                    right: '20px', 
                    height: '3px', 
                    background: 'rgba(0,0,0,0.1)',
                    zIndex: 1 
                  }}
                >
                  <motion.div 
                    style={{ 
                      height: '100%', 
                      background: eta > 0 ? 'var(--warning)' : 'var(--success)', 
                      borderRadius: '9999px' 
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>

                {STEPS.map((s, idx) => {
                  const isDone = idx < stepIndex;
                  const isCurrent = idx === stepIndex;
                  return (
                    <div key={s.id} style={{ position: 'relative', zIndex: 2, textAlign: 'center', minWidth: '70px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        margin: '0 auto 6px',
                        background: isDone ? 'var(--success)' : isCurrent ? (eta > 0 ? 'var(--warning)' : 'var(--success)') : 'white',
                        color: isDone || isCurrent ? 'white' : 'var(--text-tertiary)',
                        border: '2px solid ' + (isDone ? 'var(--success)' : isCurrent ? (eta > 0 ? 'var(--warning)' : 'var(--success)') : 'var(--border)'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: isCurrent ? 'var(--text)' : 'var(--text-secondary)' }}>
                        {s.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <div className="grid-2 mb-6" style={{ gap: '24px' }}>
            {/* Left Column: Vehicle & Crew Details with Trust Patterns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card gentle-hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <h4 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>Dispatch & Medical Crew</h4>
                  <VerifiedCredentialBadge label="ACLS Certified" />
                </div>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-light)' }}>
                    <span className="text-secondary text-sm">Vehicle Unit</span>
                    <span className="font-semibold text-sm">A-108 (Force Traveller ICU)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-light)' }}>
                    <span className="text-secondary text-sm">Paramedic Lead</span>
                    <span className="font-semibold text-sm flex items-center gap-1.5">
                      Ramesh Kumar <ShieldCheck size={14} className="text-success" />
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-light)' }}>
                    <span className="text-secondary text-sm">Driver Contact</span>
                    <a 
                      href="tel:+919876510008" 
                      className="btn btn-secondary btn-sm flex items-center gap-1"
                      style={{ minHeight: '36px' }}
                    >
                      <Phone size={13} /> +91-98765-10008
                    </a>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-secondary text-sm">Destination Facility</span>
                    <span className="font-semibold text-sm text-primary">CityCare Super-Specialty</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="text-xs text-secondary font-medium mb-2">On-board Life Support Equipment:</div>
                  <div className="flex gap-2 flex-wrap">
                    {['Defibrillator / AED', 'Ventilator (Hamilton-T1)', '12-Lead ECG Monitor', 'Syringe Infusion Pumps', 'Trauma Kit'].map(eq => (
                      <span key={eq} className="tag" style={{ background: 'var(--primary-bg)', color: 'var(--primary-dark)', fontSize: '11px', fontWeight: 600 }}>
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-time Telemetry Card */}
              <div className="card gentle-hover-lift">
                <h4 className="mb-3 text-sm font-semibold flex items-center gap-2">
                  <Activity size={16} className="text-danger" /> Live Route Telemetry
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-xs text-secondary">Transit Speed</div>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>46 km/h</div>
                    <div className="text-xs text-success flex items-center gap-1">🟢 Green Corridor Active</div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-xs text-secondary">Distance Remaining</div>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>{(eta * 0.35).toFixed(1)} km</div>
                    <div className="text-xs text-secondary">Traffic Clearance: High</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Map Container */}
            <div style={{ 
              borderRadius: 'var(--radius-xl)', 
              overflow: 'hidden', 
              minHeight: '440px', 
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span className="status-pulse-dot available" />
                Live GPS Sync (3s rate)
              </div>

              <MapContainer 
                center={patientPos} 
                zoom={14} 
                style={{ height: '100%', minHeight: '440px', width: '100%' }} 
                scrollWheelZoom={false}
              >
                <TileLayer 
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                  attribution='&copy; OpenStreetMap' 
                />
                <Marker position={patientPos} icon={patientIcon}>
                  <Popup>
                    <strong>📍 Patient Pickup Spot</strong><br />
                    Triage request verified
                  </Popup>
                </Marker>
                <Marker position={ambPos} icon={ambulanceIcon}>
                  <Popup>
                    <strong>🚑 Ambulance A-108</strong><br />
                    Speed: 46 km/h • ETA: {eta} min
                  </Popup>
                </Marker>
                <Marker position={hospitalPos} icon={hospitalIcon}>
                  <Popup>
                    <strong>🏥 CityCare Hospital</strong><br />
                    Emergency Bay Alerted
                  </Popup>
                </Marker>
                
                {/* Dynamic animated routing corridor */}
                <Polyline 
                  positions={[ambPos, patientPos]} 
                  color="#EF4444" 
                  weight={4} 
                  dashArray="6, 8" 
                />
                <Polyline 
                  positions={[patientPos, hospitalPos]} 
                  color="#0891B2" 
                  weight={3} 
                  dashArray="4, 6" 
                  opacity={0.6}
                />
              </MapContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Phone, Ambulance, MapPin, ArrowRight,
  ShieldAlert, Radio, CheckCircle2, HeartPulse,
  Share2, Copy, Check, Navigation, X,
  Activity, ShieldCheck, PhoneCall
} from 'lucide-react';
import hospitals from '../../data/hospitals';
import { useLocationContext } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { analytics } from '../../services/analytics';

export default function EmergencyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userLocation, calculateHospitalDistance } = useLocationContext();

  const [sosActive, setSosActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Cardiac');
  const [countdown, setCountdown] = useState(null);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [activeGuide, setActiveGuide] = useState('cpr');

  // Filter Patiala hospitals with 24/7 Emergency
  const emergencyHospitals = hospitals
    .filter(h => h.emergency_available)
    .map(h => {
      const dist = calculateHospitalDistance(h);
      const distNum = dist ? parseFloat(dist) : 3.0;
      return {
        ...h,
        distanceNum: distNum,
        distanceStr: dist ? `${dist} km` : '3.0 km',
        estDriveMin: Math.max(3, Math.round(distNum * 2.2)),
      };
    })
    .sort((a, b) => a.distanceNum - b.distanceNum);

  // Trigger SOS dispatch with a 3-second safety window
  const handleInitiateSOS = () => {
    if (sosActive) {
      setSosActive(false);
      setCountdown(null);
      return;
    }
    setCountdown(3);
  };

  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      setSosActive(true);
      setCountdown(null);
      analytics.trackEmergencyTrigger({
        source: 'emergency_page_red_button',
        hasLocation: Boolean(userLocation),
        hospital: emergencyHospitals[0]?.name || 'Rajindra Trauma Center'
      });
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const cancelCountdown = () => {
    setCountdown(null);
  };

  const handleCopyCoords = () => {
    const coords = `${userLocation?.lat?.toFixed(5) || '30.34400'}, ${userLocation?.lng?.toFixed(5) || '76.36850'}`;
    const text = `EMERGENCY SOS: Medical aid needed at Patiala (${coords})`;
    navigator.clipboard?.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const coords = `${userLocation?.lat?.toFixed(5) || '30.34400'}, ${userLocation?.lng?.toFixed(5) || '76.36850'}`;
    const mapLink = `https://maps.google.com/?q=${coords}`;
    const message = encodeURIComponent(
      `🚨 *EMERGENCY SOS*\nLocation: ${userLocation?.name || 'Patiala'}\nGPS: ${mapLink}\nCondition: ${selectedCategory}\nPlease send help.`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const emergencyCategories = [
    { id: 'Cardiac', label: 'Chest Pain / Cardiac' },
    { id: 'Trauma', label: 'Severe Injury / Trauma' },
    { id: 'Breathing', label: 'Breathing Difficulty' },
    { id: 'Stroke', label: 'Unconscious / Stroke' },
    { id: 'Maternity', label: 'Maternity / Labor' },
  ];

  const firstAidGuides = {
    cpr: {
      title: 'Adult Hands-Only CPR',
      icon: '🫀',
      steps: [
        'Place hands interlocked in the center of the chest.',
        'Push hard and fast: 2 inches deep, 100–120 beats/min.',
        'Do not stop until paramedics or an AED arrive.'
      ]
    },
    bleeding: {
      title: 'Severe Bleeding Control',
      icon: '🩸',
      steps: [
        'Apply firm, continuous pressure directly on the wound.',
        'Layer fresh cloth over soaked dressings; do not remove.',
        'Elevate the injured limb above heart level.'
      ]
    },
    stroke: {
      title: 'F.A.S.T. Stroke Check',
      icon: '⚡',
      steps: [
        'Face: Check if one side of the smile droops.',
        'Arms: Check if one raised arm drifts downward.',
        'Speech: Check if words are slurred or abnormal.',
        'Time: Call 112 / 108 immediately if any sign is present.'
      ]
    },
    choking: {
      title: 'Heimlich Maneuver',
      icon: '🫁',
      steps: [
        'Stand behind the person and wrap arms around their waist.',
        'Place fist thumb-side just above the navel.',
        'Perform quick, forceful upward and inward thrusts.'
      ]
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Top Clinical SOS Command Card */}
      <div
        className="card p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5"
        style={{ borderTop: '4px solid #dc2626' }}
      >
        {/* Status Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Patiala Emergency Network • 24/7 Active</span>
          </div>

          <div className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-medium">
            <MapPin size={14} className="text-slate-500" />
            <span>{userLocation?.name || 'Patiala, Punjab'}</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldAlert size={24} style={{ color: 'var(--color-emergency-crimson, #DC2626)' }} />
            Emergency Assistance & 108 Ambulance
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Immediate dispatch connection to Patiala ALS ambulance fleet and GMC Rajindra Level-1 Trauma Bay.
          </p>
        </div>

        {/* Category Selection - Fixed with high-contrast 44px touch targets */}
        <div>
          <div className="quiet-category" style={{ marginBottom: '8px' }}>
            Reported Medical Condition
          </div>
          <div className="flex flex-wrap gap-2.5" role="group" aria-label="Select condition">
            {emergencyCategories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`emergency-condition-pill ${isSelected ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button Area */}
        <div>
          {countdown !== null ? (
            <div className="p-5 rounded-2xl border-2 text-center space-y-3" style={{ background: '#FEF2F2', borderColor: '#DC2626' }}>
              <div className="text-lg font-bold" style={{ color: '#991B1B' }}>
                Requesting 108 Ambulance in {countdown} seconds...
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Triage notification and GPS coordinates are being transmitted to nearest available ambulance unit.
              </p>
              <button
                onClick={cancelCountdown}
                className="btn btn-sm"
                style={{ background: '#FFFFFF', border: '1px solid #DC2626', color: '#DC2626', fontWeight: 700, borderRadius: '8px' }}
              >
                <X size={14} /> Cancel Request
              </button>
            </div>
          ) : sosActive ? (
            <div className="p-5 rounded-2xl border space-y-3" style={{ background: '#ECFDF5', borderColor: '#059669' }}>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#065F46' }}>
                  <CheckCircle2 size={18} style={{ color: '#059669' }} />
                  Ambulance Dispatched • Unit ALS-04 En Route (~6 min ETA)
                </div>
                <button
                  onClick={() => setSosActive(false)}
                  className="btn btn-xs"
                  style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', borderRadius: '6px' }}
                >
                  Cancel Request
                </button>
              </div>
              <div className="flex gap-2.5 flex-wrap pt-1">
                <button
                  className="btn btn-sm"
                  style={{ background: '#059669', color: '#FFFFFF', fontWeight: 700, borderRadius: '8px' }}
                  onClick={() => navigate('/patient/ambulance')}
                >
                  <Radio size={14} /> Track Ambulance GPS
                </button>
                <a
                  href="tel:108"
                  className="btn btn-sm"
                  style={{ background: '#FFFFFF', color: '#1E293B', border: '1px solid #CBD5E1', fontWeight: 600, borderRadius: '8px' }}
                >
                  <Phone size={13} /> Speak to Paramedic Crew
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleInitiateSOS}
                style={{
                  background: 'var(--color-emergency-crimson, #DC2626)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)'
                }}
              >
                <AlertTriangle size={18} />
                <span>Request Immediate Ambulance (108)</span>
              </button>

              <button
                onClick={handleCopyCoords}
                className="btn btn-sm"
                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#1E293B', borderRadius: '12px', padding: '10px 16px' }}
              >
                {copiedCoords ? <Check size={14} style={{ color: '#059669' }} /> : <Copy size={14} />}
                <span>{copiedCoords ? 'GPS Copied' : 'Copy GPS'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="btn btn-sm"
                style={{ background: '#059669', color: '#FFFFFF', borderRadius: '12px', padding: '10px 16px', fontWeight: 600 }}
              >
                <Share2 size={14} />
                <span>Share via WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4 Direct Hotlines */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <PhoneCall size={16} className="text-red-600" />
          Direct Emergency Hotlines
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <a
            href="tel:112"
            className="card p-4 bg-white border border-slate-200 hover:border-red-400 rounded-xl shadow-xs transition group flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold text-red-700 uppercase bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                National
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">112</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Police, Fire, Medical</p>
            </div>
            <div className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1">
              Call 112 <ArrowRight size={12} />
            </div>
          </a>

          <a
            href="tel:108"
            className="card p-4 bg-white border border-slate-200 hover:border-amber-400 rounded-xl shadow-xs transition group flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Ambulance
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">108</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Free 24/7 State Fleet</p>
            </div>
            <div className="mt-2 text-xs font-bold text-amber-700 flex items-center gap-1">
              Dispatch 108 <ArrowRight size={12} />
            </div>
          </a>

          <a
            href="tel:01752212018"
            className="card p-4 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl shadow-xs transition group flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Trauma Bay
              </span>
              <div className="text-lg font-black text-slate-900 mt-1">0175-2212018</div>
              <p className="text-[11px] text-slate-500 mt-0.5">GMC Rajindra Desk</p>
            </div>
            <div className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
              Call Rajindra <ArrowRight size={12} />
            </div>
          </a>

          <a
            href="tel:102"
            className="card p-4 bg-white border border-slate-200 hover:border-blue-400 rounded-xl shadow-xs transition group flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                Maternity
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">102</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Mother & Infant</p>
            </div>
            <div className="mt-2 text-xs font-bold text-blue-700 flex items-center gap-1">
              Call 102 <ArrowRight size={12} />
            </div>
          </a>
        </div>
      </div>

      {/* Nearest 24/7 Patiala Emergency Departments */}
      <div className="card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin size={16} className="text-red-600" />
            Nearest Emergency Departments
          </h2>
          <span className="text-xs text-slate-500 font-medium">Nearest First</span>
        </div>

        <div className="space-y-2">
          {emergencyHospitals.slice(0, 5).map((er) => (
            <div
              key={er.id}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition flex flex-wrap justify-between items-center gap-3"
            >
              <div className="min-w-[200px] flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{er.name}</h3>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    er.type === 'Government' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {er.type}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-emerald-700">📍 {er.distanceStr}</span>
                  <span>•</span>
                  <span>~{er.estDriveMin} min drive</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${er.phone}`}
                  className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Phone size={13} /> Call
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${er.latitude},${er.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium"
                >
                  <Navigation size={13} /> Map
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Life-Saving First-Aid Steps */}
      <div className="card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Activity size={16} className="text-emerald-600" />
          First-Aid While Waiting
        </h2>

        <div className="flex flex-wrap gap-1.5">
          {Object.keys(firstAidGuides).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveGuide(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeGuide === key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{firstAidGuides[key].icon}</span>
              <span>{firstAidGuides[key].title}</span>
            </button>
          ))}
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="font-bold text-xs text-slate-800">
            {firstAidGuides[activeGuide].title}
          </div>
          <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
            {firstAidGuides[activeGuide].steps.map((step, idx) => (
              <li key={idx} className="leading-normal">
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Patient Emergency Info Bar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-wrap justify-between items-center gap-2 text-xs">
        <div className="text-slate-700">
          <strong className="text-slate-900">{user?.name || 'Patient'}</strong> • Blood Group: <span className="font-bold text-red-600">O+</span> • Emergency Contact: <span className="font-semibold text-slate-900">+91-98111-22334</span>
        </div>
        <button
          className="text-primary hover:underline font-semibold text-xs cursor-pointer"
          onClick={() => navigate('/patient/profile')}
        >
          Edit Info →
        </button>
      </div>
    </div>
  );
}

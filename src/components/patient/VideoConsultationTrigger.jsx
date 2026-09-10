import { useState, useEffect } from 'react';
import { Video, Stethoscope, Clock, ShieldCheck, ChevronDown } from 'lucide-react';
import consultationSocketService from '../../services/consultationSocketService';
import PatientCallingModal from './PatientCallingModal';
import { useAuth } from '../../context/AuthContext';

const AVAILABLE_DOCTORS = [
  {
    doctorId: 'aditya',
    name: 'Dr. Aditya Dhariwal',
    specialty: 'Emergency Medicine & Trauma Surgery',
    hospital: 'GMC Rajindra Hospital, Patiala',
  },
  {
    doctorId: 'palakshi',
    name: 'Dr. Palakshi Sharma',
    specialty: 'Cardiology & Critical Care',
    hospital: 'GMC Rajindra Hospital, Patiala',
  },
  {
    doctorId: 'arnav',
    name: 'Dr. Arnav Gupta',
    specialty: 'Internal Medicine & Critical Triage',
    hospital: 'GMC Rajindra Hospital, Patiala',
  },
];

export default function VideoConsultationTrigger({ compact = false }) {
  const { user } = useAuth();
  const [selectedDoctorId, setSelectedDoctorId] = useState('aditya');
  const [isCallingModalOpen, setIsCallingModalOpen] = useState(false);
  const [presenceMap, setPresenceMap] = useState({});

  useEffect(() => {
    // Initial fetch of doctors presence
    consultationSocketService.getDoctorsPresence().then((doctors) => {
      const map = {};
      doctors.forEach((d) => {
        map[d.doctorId] = d.status || (d.isOnline ? 'available' : 'offline');
      });
      setPresenceMap(map);
    });

    // Subscribe to live status updates
    const unsubscribe = consultationSocketService.onPresenceUpdate(({ doctorId, status }) => {
      setPresenceMap((prev) => ({
        ...prev,
        [doctorId]: status,
      }));
    });

    return () => unsubscribe();
  }, []);

  const selectedDoctor = AVAILABLE_DOCTORS.find((d) => d.doctorId === selectedDoctorId) || AVAILABLE_DOCTORS[0];
  const doctorStatus = presenceMap[selectedDoctorId] || 'available';

  const getStatusBadge = (status) => {
    if (status === 'busy' || status === 'ringing' || status === 'in_call') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#d97706', fontWeight: 700 }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          Busy (In Call)
        </span>
      );
    }
    if (status === 'offline') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
          Offline
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#059669', fontWeight: 700 }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
        Available Now
      </span>
    );
  };

  const handleStartCall = () => {
    setIsCallingModalOpen(true);
  };

  if (compact) {
    return (
      <>
        <button
          onClick={handleStartCall}
          className="btn"
          style={{
            borderRadius: '9999px',
            padding: '12px 24px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.45)',
            cursor: 'pointer',
          }}
          title={`Start live video consultation with ${selectedDoctor.name}`}
        >
          <Video size={16} />
          <span>Consult {selectedDoctor.name.split(' ')[1] || 'Doctor'}</span>
        </button>

        <PatientCallingModal
          isOpen={isCallingModalOpen}
          onClose={() => setIsCallingModalOpen(false)}
          doctorId={selectedDoctor.doctorId}
          doctorName={selectedDoctor.name}
          doctorSpecialty={selectedDoctor.specialty}
          patientName={user?.name || 'Karan Mehra'}
          patientId={user?.id || 'guest-patient'}
          reason="Online OPD Video Consultation"
        />
      </>
    );
  }

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid #a7f3d0',
        padding: '22px 24px',
        boxShadow: '0 10px 30px -10px rgba(5, 150, 105, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          padding: '4px 16px',
          borderBottomLeftRadius: '14px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#047857',
        }}
      >
        LIVE TELECONSULTATION
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Video size={24} />
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              Online Doctor Video Consultation
            </h3>
            {getStatusBadge(doctorStatus)}
          </div>

          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
            Connect immediately via secure WebRTC peer-to-peer video with on-duty specialists at Rajindra Hospital.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Doctor Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Doctor:</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  style={{
                    appearance: 'none',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '6px 32px 6px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0f172a',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {AVAILABLE_DOCTORS.map((doc) => (
                    <option key={doc.doctorId} value={doc.doctorId}>
                      {doc.name} ({doc.specialty.split('&')[0].trim()})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#64748b',
                  }}
                />
              </div>
            </div>

            {/* Start Call Button */}
            <button
              onClick={handleStartCall}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(5, 150, 105, 0.35)',
                transition: 'all 0.15s ease',
              }}
            >
              <Video size={16} />
              <span>Start Video Consultation</span>
            </button>
          </div>
        </div>
      </div>

      <PatientCallingModal
        isOpen={isCallingModalOpen}
        onClose={() => setIsCallingModalOpen(false)}
        doctorId={selectedDoctor.doctorId}
        doctorName={selectedDoctor.name}
        doctorSpecialty={selectedDoctor.specialty}
        patientName={user?.name || 'Karan Mehra'}
        patientId={user?.id || 'guest-patient'}
        reason="Online OPD Video Consultation"
      />
    </div>
  );
}

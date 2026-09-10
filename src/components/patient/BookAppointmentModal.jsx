import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  X, Building2, Calendar, Stethoscope, Clock, User, Phone,
  ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Zap,
  Laptop, Video, Check
} from 'lucide-react';
import hospitals, { getCrowdLabel, getCrowdColor } from '../../data/hospitals';
import { useLocationContext } from '../../context/LocationContext';
import { analytics } from '../../services/analytics';

export default function BookAppointmentModal({ hospital: initialHospital, preselectedDoctor = null, onClose }) {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { addToast } = useNotifications();
  const { calculateHospitalDistance } = useLocationContext();

  const [selectedHospital, setSelectedHospital] = useState(() => initialHospital || hospitals[0]);
  const hospital = selectedHospital || hospitals[0];

  const distance = calculateHospitalDistance(hospital);

  // Step 1: Department & Slot | Step 2: Patient Sign-Up (Asked at the LAST after deciding hospital)
  const [modalStep, setModalStep] = useState(1);

  const [bookingData, setBookingData] = useState({
    consultationMode: 'offline', // 'online' | 'offline'
    specialty: preselectedDoctor 
      ? `${preselectedDoctor.name} (${preselectedDoctor.specialization})` 
      : 'Cardiology Consultation',
    timeSlot: 'Today - 4:30 PM (Immediate Triage)',
    consultationType: 'Offline Appointment (In-Person OPD)',
  });

  const [patientData, setPatientData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    agreed: true,
  });

  const [submitting, setSubmitting] = useState(false);

  if (!hospital) return null;

  const handleSelectMode = (mode) => {
    if (mode === 'online') {
      setBookingData({
        ...bookingData,
        consultationMode: 'online',
        consultationType: 'Online Tele-Consult',
        timeSlot: 'Today - 4:30 PM (HD Video Call)'
      });
    } else {
      setBookingData({
        ...bookingData,
        consultationMode: 'offline',
        consultationType: 'In-Person OPD',
        timeSlot: 'Today - 4:30 PM (Immediate Triage)'
      });
    }
  };

  const handleNextToSignUp = (e) => {
    e.preventDefault();
    setModalStep(2);
  };

  const handleAutofill = () => {
    setPatientData({
      name: 'Aditya Kumar',
      phone: '+91 98765 43210',
      agreed: true,
    });
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const tokenNum = Math.floor(115 + Math.random() * 20);
    const assignedToken = `A-${tokenNum}`;

    setTimeout(() => {
      // Save patient registration/details
      login('patient', {
        name: patientData.name || 'Aditya Kumar',
        phone: patientData.phone || '+91 98765 43210',
        preferredHospital: hospital.name,
        hospitalId: hospital.id,
        preferredSpecialty: bookingData.specialty,
        bookedSlot: bookingData.timeSlot,
        consultationType: bookingData.consultationType,
        token: assignedToken,
      });

      analytics.trackAppointmentBooking({
        doctor: bookingData.specialty,
        department: bookingData.specialty,
        hospital: hospital.name,
        type: bookingData.consultationMode,
        time: bookingData.timeSlot
      });

      addToast(`Appointment confirmed at ${hospital.name}! Token: ${assignedToken}`, 'success');
      setSubmitting(false);
      onClose();
      navigate('/patient/queue');
    }, 400);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div 
        className="card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px', width: '100%', maxHeight: '92vh', overflowY: 'auto',
          background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px', padding: '28px', color: '#fff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '20px', right: '20px',
            background: 'rgba(255, 255, 255, 0.1)', border: 'none',
            borderRadius: '50%', width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {/* Step Indicator Header */}
        <div style={{ marginBottom: '18px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#c084fc'
          }}>
            {modalStep === 1 ? 'STEP 1 OF 2 • CONSULTATION DETAILS' : 'STEP 2 OF 2 • PATIENT SIGN-UP'}
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 2px', color: '#fff' }}>
            {modalStep === 1 ? 'Select Consultation Slot' : 'Patient Sign-Up'}
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            {modalStep === 1 
              ? `Booking for ${hospital.name}`
              : `Create your patient details to confirm your appointment at ${hospital.name}`}
          </p>
        </div>

        {/* Decided Hospital Highlight Card */}
        <div style={{
          background: 'rgba(5, 150, 105, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '14px', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '18px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: '#059669', color: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Building2 size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Decided Hospital • Patiala</span>
              <span className="badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '10px', padding: '2px 8px' }}>
                Consultation: ₹{hospital.consultation_fee || 200}
              </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
              {hospital.name}
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              {hospital.address} • {distance != null && <strong style={{ color: '#34d399' }}>{distance} km away • </strong>}<span style={{ color: '#6ee7b7' }}>~{hospital.waitTime}m wait</span>
            </div>
            <div style={{ marginTop: '6px' }}>
              <select
                value={hospital.id}
                onChange={(e) => {
                  const h = hospitals.find(x => x.id === Number(e.target.value));
                  if (h) setSelectedHospital(h);
                }}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '11px',
                  padding: '3px 8px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id} style={{ background: '#1e293b', color: '#fff' }}>
                    Change Hospital: {h.name} ({h.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* STEP 1: Department & Slot */}
        {modalStep === 1 && (
          <form onSubmit={handleNextToSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Consultation Mode Selection (Online vs Offline) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#38bdf8' }}>
                    Consultation Mode
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                    How would you like to book?
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Choose one option</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {/* Online Appointment Card */}
                <div
                  onClick={() => handleSelectMode('online')}
                  role="button"
                  tabIndex={0}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '16px',
                    padding: '14px',
                    background: bookingData.consultationMode === 'online'
                      ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.22) 0%, rgba(15, 23, 42, 0.8) 100%)'
                      : 'rgba(15, 23, 42, 0.45)',
                    border: bookingData.consultationMode === 'online'
                      ? '2px solid #0284c7'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: bookingData.consultationMode === 'online'
                      ? '0 0 16px rgba(2, 132, 199, 0.3)'
                      : 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        background: 'rgba(2, 132, 199, 0.2)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Video size={11} /> TELE-CONSULTATION
                      </span>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: bookingData.consultationMode === 'online' ? '2px solid #0284c7' : '2px solid rgba(255,255,255,0.25)',
                        background: bookingData.consultationMode === 'online' ? '#0284c7' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                      }}>
                        {bookingData.consultationMode === 'online' && <Check size={11} strokeWidth={3} />}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0
                      }}>
                        <Laptop size={18} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                        Online Appointment
                      </h4>
                    </div>

                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px', lineHeight: 1.35 }}>
                      Book your appointment digitally from anywhere.
                    </p>
                  </div>

                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: bookingData.consultationMode === 'online' ? '#38bdf8' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <span>Book Online</span>
                    <ArrowRight size={12} />
                  </div>
                </div>

                {/* Offline Appointment Card */}
                <div
                  onClick={() => handleSelectMode('offline')}
                  role="button"
                  tabIndex={0}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '16px',
                    padding: '14px',
                    background: bookingData.consultationMode === 'offline'
                      ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.22) 0%, rgba(15, 23, 42, 0.8) 100%)'
                      : 'rgba(15, 23, 42, 0.45)',
                    border: bookingData.consultationMode === 'offline'
                      ? '2px solid #059669'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: bookingData.consultationMode === 'offline'
                      ? '0 0 16px rgba(5, 150, 105, 0.3)'
                      : 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        background: 'rgba(5, 150, 105, 0.2)',
                        color: '#34d399',
                        border: '1px solid rgba(52, 211, 153, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Building2 size={11} /> IN-PERSON VISIT
                      </span>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: bookingData.consultationMode === 'offline' ? '2px solid #059669' : '2px solid rgba(255,255,255,0.25)',
                        background: bookingData.consultationMode === 'offline' ? '#059669' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                      }}>
                        {bookingData.consultationMode === 'offline' && <Check size={11} strokeWidth={3} />}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0
                      }}>
                        <Building2 size={18} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                        Offline Appointment
                      </h4>
                    </div>

                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px', lineHeight: 1.35 }}>
                      Choose a nearby centre and book your visit.
                    </p>
                  </div>

                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: bookingData.consultationMode === 'offline' ? '#34d399' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <span>Book Offline</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Stethoscope size={14} /> Department / Specialty
              </label>
              <select
                className="select"
                style={{ width: '100%', background: '#0f172a', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff' }}
                value={bookingData.specialty}
                onChange={(e) => setBookingData({ ...bookingData, specialty: e.target.value })}
              >
                <option value="Cardiology Consultation">Cardiology (Heart & Blood Pressure)</option>
                <option value="General Medicine & Triage">General Medicine (Fever, Cough, Routine OPD)</option>
                <option value="Pediatrics & Child Care">Pediatrics (Children & Infant Care)</option>
                <option value="Orthopedics & Joint Health">Orthopedics (Bones & Joints)</option>
                <option value="Dermatology & Skin Care">Dermatology (Skin & Allergies)</option>
                <option value="Emergency & Urgent Care">Emergency & Urgent Care</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Calendar size={14} /> Preferred Visit Slot
              </label>
              <select
                className="select"
                style={{ width: '100%', background: '#0f172a', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff' }}
                value={bookingData.timeSlot}
                onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
              >
                {bookingData.consultationMode === 'online' ? (
                  <>
                    <option value="Today - 4:30 PM (HD Video Call)">Today - 4:30 PM (HD Video Call)</option>
                    <option value="Today - 6:00 PM (Audio / Video Consult)">Today - 6:00 PM (Audio / Video Consult)</option>
                    <option value="Tomorrow - 10:00 AM (Virtual Room)">Tomorrow - 10:00 AM (Virtual Room)</option>
                    <option value="Tomorrow - 2:30 PM (Online Slot)">Tomorrow - 2:30 PM (Online Slot)</option>
                  </>
                ) : (
                  <>
                    <option value="Today - 4:30 PM (Immediate Triage)">Today - 4:30 PM (Immediate Triage)</option>
                    <option value="Today - 6:00 PM (Evening OPD)">Today - 6:00 PM (Evening OPD)</option>
                    <option value="Tomorrow - 10:00 AM (Morning Slot)">Tomorrow - 10:00 AM (Morning Slot)</option>
                    <option value="Tomorrow - 2:30 PM (Afternoon Slot)">Tomorrow - 2:30 PM (Afternoon Slot)</option>
                  </>
                )}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%', padding: '14px', borderRadius: '9999px',
                background: bookingData.consultationMode === 'online' ? '#0284c7' : '#059669',
                fontWeight: 700, fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '6px'
              }}
            >
              <span>Next: Patient Sign-Up</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: Patient Sign-Up (Asked at the last!) */}
        {modalStep === 2 && (
          <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              background: bookingData.consultationMode === 'online' ? 'rgba(2, 132, 199, 0.12)' : 'rgba(5, 150, 105, 0.12)',
              borderRadius: '12px',
              border: bookingData.consultationMode === 'online' ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
              padding: '10px 14px', fontSize: '12px',
              color: bookingData.consultationMode === 'online' ? '#e0f2fe' : '#ecfdf5',
              display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px'
            }}>
              <span><strong>Mode:</strong> {bookingData.consultationType}</span>
              <span><strong>Slot:</strong> {bookingData.timeSlot.split('(')[0]}</span>
              <span><strong>Specialty:</strong> {bookingData.specialty.split('(')[0]}</span>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Aditya Kumar"
                className="input"
                style={{ width: '100%', background: '#0f172a', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff' }}
                value={patientData.name}
                onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Phone size={14} /> Mobile / ABHA ID
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                className="input"
                style={{ width: '100%', background: '#0f172a', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#fff' }}
                value={patientData.phone}
                onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
              <input
                type="checkbox"
                required
                checked={patientData.agreed}
                onChange={(e) => setPatientData({ ...patientData, agreed: e.target.checked })}
                style={{ marginTop: '2px', accentColor: '#059669' }}
              />
              <span>I consent to patient sign-up under ABDM protocols to receive SMS queue notifications.</span>
            </label>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ borderRadius: '9999px', padding: '12px 16px', fontSize: '13px', background: '#ffffff', color: '#059669', borderColor: '#059669' }}
                onClick={() => setModalStep(1)}
              >
                <ArrowLeft size={15} /> Back
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{
                  flex: 1, padding: '12px 20px', borderRadius: '9999px',
                  background: '#059669', fontWeight: 700, fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {submitting ? 'Confirming...' : (
                  <>
                    <span>Confirm & Get Token</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleAutofill}
                style={{
                  background: 'none', border: 'none', color: '#34d399',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '4px'
                }}
              >
                <Zap size={12} /> Autofill Sample Patient
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

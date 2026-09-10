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
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div 
        className="card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px', width: '100%', maxHeight: '92vh', overflowY: 'auto',
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: '24px', padding: '28px', color: '#0f172a',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '20px', right: '20px',
            background: '#f1f5f9', border: '1px solid #e2e8f0',
            borderRadius: '50%', width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748b', cursor: 'pointer', transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
        >
          <X size={16} />
        </button>

        {/* Step Indicator Header */}
        <div style={{ marginBottom: '18px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: '#059669'
          }}>
            {modalStep === 1 ? 'STEP 1 OF 2 • CONSULTATION DETAILS' : 'STEP 2 OF 2 • PATIENT SIGN-UP'}
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 2px', color: '#0f172a' }}>
            {modalStep === 1 ? 'Select Consultation Slot' : 'Patient Sign-Up'}
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            {modalStep === 1 
              ? `Booking for ${hospital.name}`
              : `Create your patient details to confirm your appointment at ${hospital.name}`}
          </p>
        </div>

        {/* Decided Hospital Highlight Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
          border: '1px solid #a7f3d0',
          borderRadius: '16px', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: '14px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <Building2 size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Decided Hospital • Patiala</span>
              <span className="badge" style={{ background: '#ffffff', color: '#059669', border: '1px solid #a7f3d0', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                Consultation: ₹{hospital.consultation_fee || 200}
              </span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
              {hospital.name}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '1px' }}>
              {hospital.address} • {distance != null && <strong style={{ color: '#059669' }}>{distance} km away • </strong>}<span style={{ color: '#047857', fontWeight: 600 }}>~{hospital.waitTime}m wait</span>
            </div>
            <div style={{ marginTop: '8px' }}>
              <select
                value={hospital.id}
                onChange={(e) => {
                  const h = hospitals.find(x => x.id === Number(e.target.value));
                  if (h) setSelectedHospital(h);
                }}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  color: '#0f172a',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  width: '100%',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id} style={{ background: '#ffffff', color: '#0f172a' }}>
                    Change Hospital: {h.name} ({h.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* STEP 1: Department & Slot */}
        {modalStep === 1 && (
          <form onSubmit={handleNextToSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Consultation Mode Selection (Online vs Offline) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#059669' }}>
                    Consultation Mode
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    How would you like to book?
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Choose one option</span>
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
                      ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                      : '#f8fafc',
                    border: bookingData.consultationMode === 'online'
                      ? '2px solid #0284c7'
                      : '1.5px solid #e2e8f0',
                    boxShadow: bookingData.consultationMode === 'online'
                      ? '0 8px 20px -6px rgba(2, 132, 199, 0.25)'
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
                        background: bookingData.consultationMode === 'online' ? '#bae6fd' : '#f1f5f9',
                        color: bookingData.consultationMode === 'online' ? '#0369a1' : '#64748b',
                        border: bookingData.consultationMode === 'online' ? '1px solid #7dd3fc' : '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Video size={11} /> TELE-CONSULTATION
                      </span>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: bookingData.consultationMode === 'online' ? '2px solid #0284c7' : '2px solid #cbd5e1',
                        background: bookingData.consultationMode === 'online' ? '#0284c7' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                      }}>
                        {bookingData.consultationMode === 'online' && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: bookingData.consultationMode === 'online' ? '#0284c7' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: bookingData.consultationMode === 'online' ? '#fff' : '#64748b',
                        flexShrink: 0
                      }}>
                        <Laptop size={18} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        Online Appointment
                      </h4>
                    </div>

                    <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 10px', lineHeight: 1.4 }}>
                      Book your appointment digitally from anywhere.
                    </p>
                  </div>

                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: bookingData.consultationMode === 'online' ? '#0284c7' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    paddingTop: '8px',
                    borderTop: bookingData.consultationMode === 'online' ? '1px solid #bae6fd' : '1px solid #e2e8f0'
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
                      ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
                      : '#f8fafc',
                    border: bookingData.consultationMode === 'offline'
                      ? '2px solid #059669'
                      : '1.5px solid #e2e8f0',
                    boxShadow: bookingData.consultationMode === 'offline'
                      ? '0 8px 20px -6px rgba(5, 150, 105, 0.25)'
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
                        background: bookingData.consultationMode === 'offline' ? '#a7f3d0' : '#f1f5f9',
                        color: bookingData.consultationMode === 'offline' ? '#065f46' : '#64748b',
                        border: bookingData.consultationMode === 'offline' ? '1px solid #6ee7b7' : '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Building2 size={11} /> IN-PERSON VISIT
                      </span>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: bookingData.consultationMode === 'offline' ? '2px solid #059669' : '2px solid #cbd5e1',
                        background: bookingData.consultationMode === 'offline' ? '#059669' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                      }}>
                        {bookingData.consultationMode === 'offline' && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: bookingData.consultationMode === 'offline' ? '#059669' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: bookingData.consultationMode === 'offline' ? '#fff' : '#64748b',
                        flexShrink: 0
                      }}>
                        <Building2 size={18} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        Offline Appointment
                      </h4>
                    </div>

                    <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 10px', lineHeight: 1.4 }}>
                      Choose a nearby centre and book your visit.
                    </p>
                  </div>

                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: bookingData.consultationMode === 'offline' ? '#059669' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    paddingTop: '8px',
                    borderTop: bookingData.consultationMode === 'offline' ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
                  }}>
                    <span>Book Offline</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Stethoscope size={15} style={{ color: '#059669' }} /> Department / Specialty
              </label>
              <select
                className="select"
                style={{
                  width: '100%', background: '#ffffff', border: '1.5px solid #cbd5e1',
                  color: '#0f172a', padding: '12px 14px', borderRadius: '12px',
                  fontSize: '14px', fontWeight: 600, outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
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
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Calendar size={15} style={{ color: '#059669' }} /> Preferred Visit Slot
              </label>
              <select
                className="select"
                style={{
                  width: '100%', background: '#ffffff', border: '1.5px solid #cbd5e1',
                  color: '#0f172a', padding: '12px 14px', borderRadius: '12px',
                  fontSize: '14px', fontWeight: 600, outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
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
                width: '100%', padding: '14px', borderRadius: '14px',
                background: bookingData.consultationMode === 'online'
                  ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)'
                  : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff', fontWeight: 800, fontSize: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '8px', border: 'none', cursor: 'pointer',
                boxShadow: bookingData.consultationMode === 'online'
                  ? '0 8px 20px -4px rgba(2, 132, 199, 0.4)'
                  : '0 8px 20px -4px rgba(16, 185, 129, 0.4)'
              }}
            >
              <span>Next: Patient Sign-Up</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: Patient Sign-Up (Asked at the last!) */}
        {modalStep === 2 && (
          <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: bookingData.consultationMode === 'online' ? '#f0f9ff' : '#ecfdf5',
              borderRadius: '14px',
              border: bookingData.consultationMode === 'online' ? '1px solid #bae6fd' : '1px solid #a7f3d0',
              padding: '12px 16px', fontSize: '12px',
              color: bookingData.consultationMode === 'online' ? '#0369a1' : '#065f46',
              display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px'
            }}>
              <span><strong>Mode:</strong> {bookingData.consultationType}</span>
              <span><strong>Slot:</strong> {bookingData.timeSlot.split('(')[0]}</span>
              <span><strong>Specialty:</strong> {bookingData.specialty.split('(')[0]}</span>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <User size={15} style={{ color: '#059669' }} /> Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aditya Dhariwal"
                className="input"
                style={{
                  width: '100%', background: '#ffffff', border: '1.5px solid #cbd5e1',
                  color: '#0f172a', padding: '12px 14px', borderRadius: '12px',
                  fontSize: '14px', outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
                value={patientData.name}
                onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Phone size={15} style={{ color: '#059669' }} /> Mobile / ABHA ID
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98765 43210"
                className="input"
                style={{
                  width: '100%', background: '#ffffff', border: '1.5px solid #cbd5e1',
                  color: '#0f172a', padding: '12px 14px', borderRadius: '12px',
                  fontSize: '14px', outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
                value={patientData.phone}
                onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#475569', lineHeight: 1.45, cursor: 'pointer' }}>
              <input
                type="checkbox"
                required
                checked={patientData.agreed}
                onChange={(e) => setPatientData({ ...patientData, agreed: e.target.checked })}
                style={{ marginTop: '3px', accentColor: '#059669', width: '16px', height: '16px' }}
              />
              <span>I consent to patient sign-up under ABDM protocols to receive real-time OPD queue status and SMS notifications.</span>
            </label>

            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  borderRadius: '12px', padding: '12px 18px', fontSize: '14px', fontWeight: 700,
                  background: '#ffffff', color: '#475569', border: '1.5px solid #cbd5e1',
                  cursor: 'pointer'
                }}
                onClick={() => setModalStep(1)}
              >
                <ArrowLeft size={15} /> Back
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{
                  flex: 1, padding: '12px 20px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#ffffff', fontWeight: 800, fontSize: '14px', border: 'none',
                  boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer'
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

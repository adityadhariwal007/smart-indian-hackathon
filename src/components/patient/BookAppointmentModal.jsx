import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  X, Building2, Calendar, Stethoscope, Clock, User, Phone,
  ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Zap
} from 'lucide-react';
import { getCrowdLabel, getCrowdColor } from '../../data/hospitals';
import { useLocationContext } from '../../context/LocationContext';

export default function BookAppointmentModal({ hospital, onClose }) {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { addToast } = useNotifications();
  const { calculateHospitalDistance } = useLocationContext();

  const distance = calculateHospitalDistance(hospital);

  // Step 1: Department & Slot | Step 2: Patient Sign-Up (Asked at the LAST after deciding hospital)
  const [modalStep, setModalStep] = useState(1);

  const [bookingData, setBookingData] = useState({
    specialty: 'Cardiology Consultation',
    timeSlot: 'Today - 4:30 PM (Immediate Triage)',
    consultationType: 'In-Person OPD',
  });

  const [patientData, setPatientData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    agreed: true,
  });

  const [submitting, setSubmitting] = useState(false);

  if (!hospital) return null;

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
        token: assignedToken,
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
          maxWidth: '520px', width: '100%',
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
        <div style={{ marginBottom: '20px' }}>
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
          marginBottom: '20px'
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
          </div>
        </div>

        {/* STEP 1: Department & Slot */}
        {modalStep === 1 && (
          <form onSubmit={handleNextToSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <option value="Today - 4:30 PM (Immediate Triage)">Today - 4:30 PM (Immediate Triage)</option>
                <option value="Today - 6:00 PM (Evening OPD)">Today - 6:00 PM (Evening OPD)</option>
                <option value="Tomorrow - 10:00 AM (Morning Slot)">Tomorrow - 10:00 AM (Morning Slot)</option>
                <option value="Tomorrow - 2:30 PM (Afternoon Slot)">Tomorrow - 2:30 PM (Afternoon Slot)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%', padding: '14px', borderRadius: '9999px',
                background: '#059669', fontWeight: 700, fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '10px'
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
              background: 'rgba(5, 150, 105, 0.12)', borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '10px 14px', fontSize: '12px', color: '#ecfdf5',
              display: 'flex', justifyContent: 'space-between'
            }}>
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

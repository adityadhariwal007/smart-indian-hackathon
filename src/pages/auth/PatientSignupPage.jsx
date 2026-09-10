import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartPulse, ArrowLeft, ArrowRight, User, Phone, Mail,
  Building2, Stethoscope, Calendar, ShieldCheck, Sparkles,
  CheckCircle2, Clock, Zap, MapPin, Search, Star, Filter,
  Check, ChevronRight, Video, UserCheck
} from 'lucide-react';
import hospitals, { getCrowdLabel, getCrowdColor } from '../../data/hospitals';
import departments from '../../data/departments';
import './PatientSignupPage.css';

export default function PatientSignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If a hospital was passed from hospital search / detail page
  const preselectedHospitalId = location.state?.hospitalId;
  const initialHospital = preselectedHospitalId 
    ? hospitals.find(h => h.id === preselectedHospitalId) 
    : null;

  // Step state: 1 = Choose Hospital, 2 = Department & Slot, 3 = Patient Sign-Up (Last Step), 4 = Confirmed Ticket
  const [step, setStep] = useState(initialHospital ? 2 : 1);
  const [selectedHospital, setSelectedHospital] = useState(initialHospital);

  // Search & filter for Step 1
  const [hospitalQuery, setHospitalQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Booking details (Step 2)
  const [bookingDetails, setBookingDetails] = useState({
    specialty: 'Cardiology Consultation',
    consultationType: 'In-Person OPD',
    timeSlot: 'Today - 4:30 PM (Immediate Triage)',
    reason: '',
  });

  // Patient Sign-Up details (Step 3 - asked at the LAST)
  const [patientData, setPatientData] = useState({
    name: '',
    phone: '',
    agreed: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [confirmedToken, setConfirmedToken] = useState(null);

  // Filtered hospitals for Step 1
  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => {
      const matchQuery = !hospitalQuery ||
        h.name.toLowerCase().includes(hospitalQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(hospitalQuery.toLowerCase());
      const matchType = typeFilter === 'all' || h.type === typeFilter;
      return matchQuery && matchType;
    }).sort((a, b) => a.crowdLevel - b.crowdLevel);
  }, [hospitalQuery, typeFilter]);

  // Step 1: Select hospital
  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Continue to patient signup
  const handleProceedToSignUp = (e) => {
    e.preventDefault();
    if (!selectedHospital) {
      setStep(1);
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3: Handle patient sign up & booking submission
  const handlePatientSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const assignedToken = `A-${Math.floor(115 + Math.random() * 20)}`;

    setTimeout(() => {
      // Register patient account with booking details attached
      register('patient', {
        name: patientData.name || 'Aditya Kumar',
        phone: patientData.phone || '+91 98765 43210',
        preferredSpecialty: bookingDetails.specialty,
        preferredHospital: selectedHospital ? selectedHospital.name : 'CityCare Government Hospital',
        hospitalId: selectedHospital ? selectedHospital.id : 1,
        bookedSlot: bookingDetails.timeSlot,
        consultationType: bookingDetails.consultationType,
        token: assignedToken,
      });

      setConfirmedToken(assignedToken);
      setSubmitting(false);
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  };

  const handleAutofill = () => {
    setPatientData({
      name: 'Aditya Kumar',
      phone: '+91 98765 43210',
      agreed: true
    });
  };

  return (
    <div className="patient-signup-page">
      <div className="signup-bg-glow" />

      <div className="signup-shell animate-fade-in">
        {/* Left Trust Panel */}
        <div className="signup-brand-panel">
          <div>
            <div className="signup-nav-top">
              <button className="signup-back-btn" onClick={() => navigate('/')}>
                <ArrowLeft size={14} /> Home
              </button>
              <div className="signup-brand-logo">
                <HeartPulse size={22} />
                <span>HealthFlow</span>
              </div>
            </div>

            <div style={{ marginTop: '36px' }}>
              <h2 className="signup-trust-headline">
                Seamless hospital booking in 3 simple steps.
              </h2>
              <p className="signup-trust-subtext">
                Decide your hospital, choose your consultation slot, and create your patient profile at the end to secure your zero-wait digital token.
              </p>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="booking-stepper-progress">
              <div className={`stepper-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="stepper-circle">
                  {step > 1 ? <Check size={14} /> : '1'}
                </div>
                <div className="stepper-text">
                  <div className="stepper-title">Decide Hospital</div>
                  <div className="stepper-subtitle">
                    {selectedHospital ? selectedHospital.name.slice(0, 22) + '...' : 'Choose hospital first'}
                  </div>
                </div>
              </div>

              <div className="stepper-connector" />

              <div className={`stepper-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="stepper-circle">
                  {step > 2 ? <Check size={14} /> : '2'}
                </div>
                <div className="stepper-text">
                  <div className="stepper-title">Department & Slot</div>
                  <div className="stepper-subtitle">
                    {step > 2 ? bookingDetails.specialty.split(' ')[0] : 'Consultation details'}
                  </div>
                </div>
              </div>

              <div className="stepper-connector" />

              <div className={`stepper-item ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                <div className="stepper-circle">
                  {step >= 4 ? <Check size={14} /> : '3'}
                </div>
                <div className="stepper-text">
                  <div className="stepper-title">Patient Sign-Up</div>
                  <div className="stepper-subtitle">Final step to confirm</div>
                </div>
              </div>
            </div>

            <div className="signup-benefits-list">
              <div className="signup-benefit-item">
                <div className="benefit-icon-badge">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="benefit-text-title">ABHA & ABDM Verified</div>
                  <div className="benefit-text-desc">Encrypted health record exchange under National Health Authority.</div>
                </div>
              </div>

              <div className="signup-benefit-item">
                <div className="benefit-icon-badge">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="benefit-text-title">Live Queue Telematics</div>
                  <div className="benefit-text-desc">Know exact patient count ahead and bypass physical OPD queues.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="signup-social-proof">
            <div className="proof-avatars">
              <div className="proof-avatar">AK</div>
              <div className="proof-avatar" style={{ background: '#059669' }}>RS</div>
              <div className="proof-avatar" style={{ background: '#0891b2' }}>NP</div>
            </div>
            <div className="proof-text">
              <strong>12,400+ patients</strong> connected to top hospitals across Delhi NCR this month.
            </div>
          </div>
        </div>

        {/* Right Dynamic Stepper Panel */}
        <div className="signup-form-panel">
          {/* ========================================================== */}
          {/* STEP 1: DECIDE THE SPECIFIC HOSPITAL (NO SIGNUP ASKED YET) */}
          {/* ========================================================== */}
          {step === 1 && (
            <div className="step-container animate-fade-in">
              <div className="form-header-area">
                <span className="form-eyebrow">STEP 1 OF 3 • HOSPITAL DISCOVERY</span>
                <h1 className="form-h1">Decide Your Hospital</h1>
                <p className="form-subhead">
                  Browse real-time hospital telematics and choose the facility where you want to consult.
                </p>
              </div>

              {/* Search & Filter Header */}
              <div className="hospital-search-box">
                <div className="form-input-wrap">
                  <Search size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Search by hospital name or area..."
                    value={hospitalQuery}
                    onChange={(e) => setHospitalQuery(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>

                <div className="hospital-filter-pills">
                  <button
                    type="button"
                    className={`filter-pill ${typeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('all')}
                  >
                    All Facilities ({hospitals.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${typeFilter === 'Government' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('Government')}
                  >
                    Government
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${typeFilter === 'Private' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('Private')}
                  >
                    Private
                  </button>
                </div>
              </div>

              {/* Scrollable Hospital List */}
              <div className="hospital-selection-list">
                {filteredHospitals.map((hospital) => {
                  const crowdColor = getCrowdColor(hospital.crowdLevel);
                  return (
                    <div 
                      key={hospital.id} 
                      className={`hospital-select-card ${selectedHospital?.id === hospital.id ? 'selected' : ''}`}
                      onClick={() => handleSelectHospital(hospital)}
                    >
                      <div className="hospital-select-main">
                        <div className="hospital-select-header">
                          <h3 className="hospital-name">{hospital.name}</h3>
                          <span className={`hospital-type-badge ${hospital.type.toLowerCase()}`}>
                            {hospital.type}
                          </span>
                        </div>

                        <div className="hospital-address">
                          <MapPin size={13} /> {hospital.address}
                        </div>

                        <div className="hospital-telemetry-row">
                          <span className="telemetry-item">
                            <span className={`crowd-dot ${crowdColor}`} />
                            {getCrowdLabel(hospital.crowdLevel)} ({hospital.crowdLevel}%)
                          </span>
                          <span className="telemetry-item">
                            <Clock size={13} /> ~{hospital.waitTime}m wait
                          </span>
                          <span className="telemetry-item">
                            <Star size={13} className="text-amber-400" /> {hospital.rating}
                          </span>
                          <span className="telemetry-item">
                            {hospital.beds} Beds
                          </span>
                        </div>
                      </div>

                      <button 
                        type="button" 
                        className="btn-select-hospital"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectHospital(hospital);
                        }}
                      >
                        <span>Select</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* STEP 2: CHOOSE DEPARTMENT & CONSULTATION SLOT              */}
          {/* ========================================================== */}
          {step === 2 && selectedHospital && (
            <form className="step-container animate-fade-in" onSubmit={handleProceedToSignUp}>
              <div className="form-header-area">
                <span className="form-eyebrow">STEP 2 OF 3 • CONSULTATION DETAILS</span>
                <h1 className="form-h1">Appointment Slot</h1>
                <p className="form-subhead">
                  Select your clinical specialty and preferred consultation time.
                </p>
              </div>

              {/* Selected Hospital Highlight Card */}
              <div className="selected-hospital-banner">
                <div className="hospital-badge-icon">
                  <Building2 size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Selected Hospital • Patiala</span>
                    <span className="badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '10px', padding: '2px 8px' }}>
                      Fee: ₹{selectedHospital.consultation_fee || 200}
                    </span>
                  </div>
                  <div className="font-bold text-white text-base">
                    {selectedHospital.name}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{selectedHospital.address}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">~{selectedHospital.waitTime} min avg wait</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="change-hospital-btn"
                  onClick={() => setStep(1)}
                  title="Choose another hospital"
                >
                  Change
                </button>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">
                  <Stethoscope size={14} /> Clinical Concern / Department
                </label>
                <div className="form-input-wrap">
                  <select
                    className="form-select"
                    value={bookingDetails.specialty}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, specialty: e.target.value })}
                  >
                    <option value="Cardiology Consultation">Cardiology (Heart & Circulation)</option>
                    <option value="General Medicine & Triage">General Medicine & Routine OPD</option>
                    <option value="Pediatrics & Child Care">Pediatrics (Child & Infant Care)</option>
                    <option value="Orthopedics & Joint Health">Orthopedics (Bones & Joints)</option>
                    <option value="Dermatology & Skin Care">Dermatology (Skin & Allergies)</option>
                    <option value="Emergency & Trauma Care">Emergency & Urgent Care</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Video size={14} /> Consultation Format
                </label>
                <div className="consultation-type-toggle">
                  <button
                    type="button"
                    className={`toggle-option ${bookingDetails.consultationType === 'In-Person OPD' ? 'active' : ''}`}
                    onClick={() => setBookingDetails({ ...bookingDetails, consultationType: 'In-Person OPD' })}
                  >
                    🏥 In-Person Hospital Visit (OPD)
                  </button>
                  <button
                    type="button"
                    className={`toggle-option ${bookingDetails.consultationType === 'Video Tele-consult' ? 'active' : ''}`}
                    onClick={() => setBookingDetails({ ...bookingDetails, consultationType: 'Video Tele-consult' })}
                  >
                    📹 Video / Tele-Consultation
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} /> Preferred Visit / Call Slot
                </label>
                <div className="form-input-wrap">
                  <select
                    className="form-select"
                    value={bookingDetails.timeSlot}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, timeSlot: e.target.value })}
                  >
                    <option value="Today - 4:30 PM (Immediate Triage)">Today - 4:30 PM (Immediate Triage)</option>
                    <option value="Today - 6:00 PM (Evening OPD)">Today - 6:00 PM (Evening OPD)</option>
                    <option value="Tomorrow - 10:00 AM (Morning Slot)">Tomorrow - 10:00 AM (Morning Slot)</option>
                    <option value="Tomorrow - 2:30 PM (Afternoon Slot)">Tomorrow - 2:30 PM (Afternoon Slot)</option>
                    <option value="Day After Tomorrow - 11:30 AM">Day After Tomorrow - 11:30 AM</option>
                  </select>
                </div>
              </div>

              <div className="step-actions-row">
                <button
                  type="button"
                  className="step-secondary-btn"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={16} /> Back to Hospitals
                </button>

                <button
                  type="submit"
                  className="step-primary-btn"
                >
                  <span>Continue to Patient Sign-Up</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================== */}
          {/* STEP 3: PATIENT SIGN-UP (ASKED AT LAST AFTER DECIDING)     */}
          {/* ========================================================== */}
          {step === 3 && (
            <form className="step-container animate-fade-in" onSubmit={handlePatientSubmit}>
              <div className="form-header-area">
                <span className="form-eyebrow">STEP 3 OF 3 • FINAL STEP</span>
                <h1 className="form-h1">Patient Sign-Up</h1>
                <p className="form-subhead">
                  Enter your details to create your patient account and confirm your booking.
                </p>
              </div>

              {/* Booking Summary Box */}
              <div className="booking-summary-pill">
                <div className="summary-item">
                  <span className="summary-label">Hospital</span>
                  <span className="summary-value">{selectedHospital?.name || 'CityCare Government Hospital'}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-item">
                  <span className="summary-label">Specialty</span>
                  <span className="summary-value">{bookingDetails.specialty.split('(')[0]}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-item">
                  <span className="summary-label">Slot</span>
                  <span className="summary-value">{bookingDetails.timeSlot.split('(')[0]}</span>
                </div>
              </div>

              <div className="form-row-2" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    <User size={14} /> Full Name
                  </label>
                  <div className="form-input-wrap">
                    <input
                      type="text"
                      required
                      placeholder="Aditya Kumar"
                      className="form-input"
                      value={patientData.name}
                      onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Phone size={14} /> Mobile / ABHA Number
                  </label>
                  <div className="form-input-wrap">
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      className="form-input"
                      value={patientData.phone}
                      onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <label className="form-checkbox-row">
                <input
                  type="checkbox"
                  checked={patientData.agreed}
                  onChange={(e) => setPatientData({ ...patientData, agreed: e.target.checked })}
                  required
                />
                <span>I consent to patient account creation under Ayushman Bharat Digital Mission (ABDM) protocols to receive queue tokens & digital reports.</span>
              </label>

              <div className="step-actions-row">
                <button
                  type="button"
                  className="step-secondary-btn"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <button
                  type="submit"
                  className="signup-submit-btn"
                  style={{ margin: 0 }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span>Confirming Booking...</span>
                  ) : (
                    <>
                      <span>Complete Sign-Up & Confirm Booking</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>

              <div className="signup-quick-actions">
                <button
                  type="button"
                  className="btn-autofill-demo"
                  onClick={handleAutofill}
                  title="Autofill sample patient data for one-click testing"
                >
                  <Zap size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                  Autofill Demo Patient
                </button>

                <div>
                  <span>Already registered? </span>
                  <span className="signup-login-link" onClick={() => navigate('/login')}>
                    Sign In
                  </span>
                </div>
              </div>
            </form>
          )}

          {/* ========================================================== */}
          {/* STEP 4: CONFIRMED TICKET & DIRECT PORTAL ACCESS            */}
          {/* ========================================================== */}
          {step === 4 && (
            <div className="step-container animate-fade-in" style={{ textAlign: 'center', padding: '16px 0' }}>
              <div className="success-badge-pulse">
                <CheckCircle2 size={44} className="text-emerald-400" />
              </div>

              <span className="form-eyebrow" style={{ color: '#34d399', marginTop: '12px' }}>
                BOOKING CONFIRMED & ACCOUNT CREATED
              </span>
              <h1 className="form-h1" style={{ fontSize: '26px' }}>
                Your Consultation is Scheduled!
              </h1>
              <p className="form-subhead" style={{ maxWidth: '420px', margin: '0 auto 20px' }}>
                Your patient account has been registered with HealthFlow. Your appointment has been secured at {selectedHospital?.name}.
              </p>

              {/* Digital Token Ticket */}
              <div className="confirmation-ticket">
                <div className="ticket-header">
                  <span className="ticket-tag">DIGITAL QUEUE TOKEN</span>
                  <span className="ticket-token-number">{confirmedToken || 'A-127'}</span>
                </div>

                <div className="ticket-details-grid">
                  <div className="ticket-field">
                    <span className="field-label">Patient</span>
                    <span className="field-value">{patientData.name || 'Aditya Kumar'}</span>
                  </div>
                  <div className="ticket-field">
                    <span className="field-label">Hospital</span>
                    <span className="field-value">{selectedHospital?.name}</span>
                  </div>
                  <div className="ticket-field">
                    <span className="field-label">Specialty</span>
                    <span className="field-value">{bookingDetails.specialty}</span>
                  </div>
                  <div className="ticket-field">
                    <span className="field-label">Slot</span>
                    <span className="field-value">{bookingDetails.timeSlot}</span>
                  </div>
                </div>

                <div className="ticket-footer">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>ABDM Verified • Live Queue Active</span>
                </div>
              </div>

              <div className="confirmation-actions">
                <button
                  type="button"
                  className="signup-submit-btn"
                  onClick={() => navigate('/patient')}
                >
                  <span>Enter Patient Portal Dashboard</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  className="step-secondary-btn"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate('/patient/queue')}
                >
                  <span>Track Digital Queue Position</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

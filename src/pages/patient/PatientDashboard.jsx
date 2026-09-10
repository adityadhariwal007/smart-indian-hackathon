import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, Calendar, Clock, Ticket, ArrowRight, MapPin,
  Star, ShieldCheck, AlertTriangle, Search, CheckCircle2,
  ChevronRight, Phone
} from 'lucide-react';
import hospitals, { getCrowdLabel, getCrowdColor } from '../../data/hospitals';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal';
import PatialaLocationBar from '../../components/common/PatialaLocationBar';
import { useLocationContext } from '../../context/LocationContext';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userLocation, calculateHospitalDistance } = useLocationContext();
  const [bookingHospital, setBookingHospital] = useState(null);

  // Top 4 hospitals sorted by nearest distance to patient in Patiala
  const featuredHospitals = hospitals
    .map(h => ({
      ...h,
      distance: calculateHospitalDistance(h)
    }))
    .sort((a, b) => {
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    })
    .slice(0, 4);

  // Check if patient has completed a booking
  const hasActiveBooking = !user?.isGuest && user?.bookedSlot;

  return (
    <div className="patient-dashboard animate-fade-in">
      {/* Clean Contained Hero Section */}
      <section className="dashboard-hero-card">
        <div className="hero-painterly-backdrop" />
        <div className="hero-content" style={{ gridTemplateColumns: hasActiveBooking ? '1fr 360px' : '1fr' }}>
          <div className="hero-copy">
            <span className="hero-eyebrow">
              <span className="eyebrow-dot" />
              HEALTHFLOW PATIENT PORTAL • CARE HUB
            </span>

            <h1 className="hero-title">
              {hasActiveBooking ? `Welcome back, ${user.name.split(' ')[0]}` : 'Find Care & Book an Appointment'}
            </h1>

            <p className="hero-subtext">
              {hasActiveBooking
                ? `You have a confirmed consultation at ${user.preferredHospital}. Your live queue token is active.`
                : 'Browse partner hospitals, check real-time outpatient wait times, and choose your hospital. You will only be asked to sign up at the end to confirm.'}
            </p>

            <div className="hero-pill-row">
              <span className="hero-pill">
                <ShieldCheck size={14} className="text-emerald-400" />
                ABHA & ABDM Verified Network
              </span>
              <span className="hero-pill">
                <Clock size={14} className="text-emerald-400" />
                Zero-Wait Digital Queue
              </span>
            </div>

            {!hasActiveBooking && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  style={{ borderRadius: '9999px', padding: '12px 24px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => navigate('/patient/hospitals')}
                >
                  <Search size={16} />
                  <span>Browse All Hospitals</span>
                </button>

                <button
                  className="btn btn-danger"
                  style={{
                    borderRadius: '9999px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.45)',
                    border: '1px solid rgba(255, 255, 255, 0.25)'
                  }}
                  onClick={() => navigate('/patient/emergency')}
                >
                  <span className="emergency-live-pulse" />
                  <AlertTriangle size={16} />
                  <span>Emergency SOS</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Booking Ticket (Only shown if patient actually booked an appointment!) */}
          {hasActiveBooking && (
            <div className="hero-triage-card">
              <div className="triage-card-header">
                <div className="triage-status-badge">
                  <span className="status-pulsing-dot" />
                  Confirmed Booking
                </div>
                <span className="triage-token-chip">{user.token || 'A-128'}</span>
              </div>

              <div className="triage-doctor-info">
                <div className="triage-avatar">
                  {user.preferredSpecialty ? user.preferredSpecialty.slice(0, 2).toUpperCase() : 'HF'}
                </div>
                <div>
                  <h3 className="triage-doctor-name">{user.preferredSpecialty || 'General Consultation'}</h3>
                  <p className="triage-specialty">{user.name}</p>
                </div>
              </div>

              <div className="triage-details-box">
                <div className="triage-detail-row">
                  <Clock size={14} className="text-emerald-400" />
                  <span>{user.bookedSlot}</span>
                </div>
                <div className="triage-detail-row">
                  <Building2 size={14} className="text-emerald-400" />
                  <span>{user.preferredHospital}</span>
                </div>
              </div>

              <button
                className="triage-cta-btn"
                onClick={() => navigate('/patient/appointments')}
              >
                <CheckCircle2 size={16} />
                <span>View Appointment Ticket</span>
                <ChevronRight size={16} className="ml-auto" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Patiala Patient Location Request & Bar */}
      <PatialaLocationBar />

      {/* Featured Hospitals Section (Decide Hospital First!) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#059669' }}>
              STEP 1: SELECT HOSPITAL • PATIALA, PUNJAB
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-primary)' }}>
              Nearest Hospitals to You
            </h2>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/patient/hospitals')}
            style={{ borderRadius: '9999px' }}
          >
            <span>View All ({hospitals.length})</span>
            <ArrowRight size={14} className="ml-1" />
          </button>
        </div>

        {/* 4 Clean Hospital Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {featuredHospitals.map(hospital => {
            const crowdColor = getCrowdColor(hospital.crowdLevel);
            return (
              <div
                key={hospital.id}
                className="card card-hover"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '18px',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className={`badge badge-${hospital.type === 'Government' ? 'info' : 'neutral'}`} style={{ fontSize: '11px' }}>
                      {hospital.type}
                    </span>
                    <span style={{ fontSize: '12px', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <Star size={13} fill="#F59E0B" /> {hospital.rating}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    {hospital.name}
                  </h3>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                    <MapPin size={13} /> {hospital.address}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {hospital.distance != null && (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                        <MapPin size={11} /> {hospital.distance} km away
                      </span>
                    )}
                    <span className="badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontWeight: 700, fontSize: '11px' }}>
                      Fee: ₹{hospital.consultation_fee || 200}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span className={`crowd-dot ${crowdColor}`} style={{ width: '8px', height: '8px', borderRadius: '50%' }} />
                      {getCrowdLabel(hospital.crowdLevel)}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600, fontSize: '12px' }}>
                      <Clock size={13} /> ~{hospital.waitTime}m wait
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, borderRadius: '9999px', fontWeight: 700 }}
                    onClick={() => setBookingHospital(hospital)}
                  >
                    Book Appointment
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: '9999px' }}
                    onClick={() => navigate(`/patient/hospitals/${hospital.id}`)}
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Modal (Asks patient signup at the last step) */}
      {bookingHospital && (
        <BookAppointmentModal
          hospital={bookingHospital}
          onClose={() => setBookingHospital(null)}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Search, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal';
import hospitals from '../../data/hospitals';

const demoAppointments = [
  { id: 1, doctor: 'Dr. Ananya Sharma', specialization: 'Cardiology', hospital: 'GMC & Rajindra Hospital, Patiala', date: 'Today', time: '10:30 AM', status: 'confirmed', type: 'Online Teleconsultation', isOnline: true },
  { id: 2, doctor: 'Dr. Ravi Saxena', specialization: 'Orthopedics', hospital: 'Mata Kaushalya Hospital, Patiala', date: 'Tomorrow', time: '10:00 AM', status: 'confirmed', type: 'In-Clinic Follow-up', isOnline: false },
  { id: 3, doctor: 'Dr. Priya Verma', specialization: 'Dermatology', hospital: 'Amar Hospital, Patiala', date: 'Sep 12', time: '2:00 PM', status: 'pending', type: 'In-Clinic Consultation', isOnline: false },
];

export default function AppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('upcoming');
  const [bookingHospital, setBookingHospital] = useState(null);

  // If patient has an active booking created via modal
  const activeUserAppointments = user?.bookedSlot ? [
    {
      id: 'active-1',
      doctor: `${user.preferredSpecialty || 'Clinical Consultation'}`,
      specialization: user.preferredSpecialty || 'General Care',
      hospital: user.preferredHospital || 'CityCare Government Hospital',
      date: 'Today',
      time: user.bookedSlot,
      status: 'confirmed',
      type: 'Triage Consultation'
    }
  ] : (user?.isGuest ? [] : demoAppointments);

  const filtered = tab === 'upcoming'
    ? activeUserAppointments.filter(a => a.status !== 'completed')
    : activeUserAppointments.filter(a => a.status === 'completed');

  const statusBadge = (status) => {
    if (status === 'confirmed') return <span className="badge badge-success">Confirmed</span>;
    if (status === 'pending') return <span className="badge badge-warning">Pending</span>;
    return <span className="badge badge-neutral">Completed</span>;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Appointments</h1>
          <p>View and manage your appointments.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setBookingHospital(hospitals[0])}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)' }}
        >
          <Search size={16} />
          <span>Book New Appointment</span>
        </button>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button className={`tab ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>Past</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div className="card text-center" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Calendar size={44} style={{ margin: '0 auto 12px', opacity: 0.35, color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>No Appointments Yet</h3>
            <p className="text-secondary text-sm" style={{ maxWidth: '380px', margin: '0 auto 16px' }}>
              You haven't booked any hospital consultations yet. Choose your preferred hospital to schedule an appointment.
            </p>
            <button 
              className="btn btn-primary btn-sm" 
              style={{ borderRadius: '9999px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setBookingHospital(hospitals[0])}
            >
              <Search size={14} />
              <span>Find Hospital & Book</span>
            </button>
          </div>
        ) : (
          filtered.map(apt => (
            <div key={apt.id} className="card card-hover" style={{ padding: '16px 20px' }}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 style={{ fontSize: 'var(--font-md)' }}>{apt.doctor}</h4>
                    {statusBadge(apt.status)}
                  </div>
                  <div className="text-sm text-secondary mb-2">{apt.specialization} — {apt.type}</div>
                  <div className="flex gap-4 text-sm text-secondary">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {apt.date}</span>
                    <span className="flex items-center gap-1"><Clock size={13} /> {apt.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} /> {apt.hospital}</span>
                  </div>
                </div>
                {apt.status !== 'completed' && (
                  <div className="flex gap-2 flex-wrap items-center">
                    {apt.isOnline && (
                      <button
                        className="btn btn-primary btn-sm flex items-center gap-1.5"
                        onClick={() => navigate('/patient/consultation')}
                      >
                        <Video size={14} /> Join Video Call
                      </button>
                    )}
                    <button className="btn btn-secondary btn-sm">Reschedule</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {bookingHospital && (
        <BookAppointmentModal
          hospital={bookingHospital}
          onClose={() => setBookingHospital(null)}
        />
      )}
    </div>
  );
}

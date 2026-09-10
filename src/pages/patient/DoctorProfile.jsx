import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, Award, Calendar } from 'lucide-react';
import doctors from '../../data/doctors';
import hospitals from '../../data/hospitals';
import departments from '../../data/departments';
import { useNotifications } from '../../context/NotificationContext';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [showBookModal, setShowBookModal] = useState(false);
  const doc = doctors.find(d => d.id === parseInt(id));

  if (!doc) return <div><h2>Doctor not found</h2></div>;

  const hospital = hospitals.find(h => h.id === doc.hospital_id);
  const dept = departments.find(d => d.id === doc.department_id);

  const handleBook = () => {
    setShowBookModal(true);
  };

  return (
    <div className="animate-fade-in">
      <button className="btn btn-ghost mb-4" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>

      <div className="card mb-6" style={{ padding: '28px' }}>
        <div className="flex items-start gap-5 flex-wrap">
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `linear-gradient(135deg, ${dept?.color || '#0891B2'}, ${dept?.color || '#0891B2'}bb)`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '24px', flexShrink: 0 }}>
            {doc.name.split(' ').slice(1, 3).map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            <h2>{doc.name}</h2>
            <div className="text-secondary mb-2">{doc.specialization}</div>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-info">{doc.qualifications.join(', ')}</span>
              {doc.available_today && <span className="badge badge-success">Available Today</span>}
            </div>
            <div className="flex gap-4 text-sm text-secondary flex-wrap">
              <span className="flex items-center gap-1"><Award size={14} /> {doc.experience} years experience</span>
              <span className="flex items-center gap-1"><Star size={14} style={{ color: '#F59E0B', fill: '#F59E0B' }} /> {doc.rating} rating</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {hospital?.name}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {doc.availability}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-right">
              <div className="text-sm text-secondary">Consultation Fee</div>
              <div className="font-bold text-xl">₹{doc.consultation_fee}</div>
            </div>
            <button className="btn btn-primary" onClick={handleBook}><Calendar size={16} /> Book Appointment</button>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <h4 className="mb-4">Areas of Expertise</h4>
          <div className="flex gap-2 flex-wrap">
            {doc.expertise.map(e => <span key={e} className="tag tag-primary">{e}</span>)}
          </div>
        </div>
        <div className="card">
          <h4 className="mb-4">Hospital Information</h4>
          <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><strong>Hospital:</strong> {hospital?.name}</div>
            <div><strong>Department:</strong> {dept?.icon} {dept?.name}</div>
            <div><strong>Address:</strong> {hospital?.address}</div>
            <div><strong>Phone:</strong> {hospital?.phone}</div>
          </div>
          <button className="btn btn-secondary btn-sm mt-4" onClick={() => navigate(`/patient/hospitals/${hospital?.id}`)}>View Hospital</button>
        </div>
      </div>

      <div className="card mb-6">
        <h4 className="mb-4">Today's Schedule</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {doc.availability.split('–').length === 2 && (
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Available Slot</div>
              <div className="font-semibold">{doc.availability}</div>
            </div>
          )}
          <div className="stat-card" style={{ flex: 1 }}>
            <div className="stat-label">Patients Today</div>
            <div className="stat-value">{doc.patients_today}</div>
          </div>
        </div>
      </div>

      {showBookModal && (
        <BookAppointmentModal
          hospital={hospital}
          preselectedDoctor={doc}
          onClose={() => setShowBookModal(false)}
        />
      )}
    </div>
  );
}

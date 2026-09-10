import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Phone, ArrowLeft, AlertTriangle } from 'lucide-react';
import hospitals, { getCrowdLabel, getCrowdColor } from '../../data/hospitals';
import { getDoctorsByHospital } from '../../data/doctors';
import departments from '../../data/departments';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal';
import { useLocationContext } from '../../context/LocationContext';

export default function HospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userLocation, calculateHospitalDistance } = useLocationContext();
  const hospital = hospitals.find(h => h.id === parseInt(id));
  const doctors = getDoctorsByHospital(parseInt(id));
  const crowdData = getDepartmentCrowdData();
  const [showBookModal, setShowBookModal] = useState(false);

  if (!hospital) return <div className="page-content"><h2>Hospital not found</h2></div>;

  const distance = calculateHospitalDistance(hospital);

  const crowdColor = getCrowdColor(hospital.crowdLevel);
  const availableDocs = doctors.filter(d => d.available_today);

  return (
    <div className="animate-fade-in">
      <button className="btn btn-ghost mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="card mb-6" style={{ padding: '28px' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2>{hospital.name}</h2>
              <span className={`badge badge-${hospital.type === 'Government' ? 'info' : 'neutral'}`}>{hospital.type}</span>
            </div>
            <div className="flex items-center gap-1 text-secondary mb-4">
              <MapPin size={16} /> {hospital.address}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => setShowBookModal(true)}>
              Book Appointment
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/patient/queue')}>Get Queue Token</button>
            {hospital.emergency_available && (
              <button className="btn btn-danger" onClick={() => navigate('/patient/emergency')}>
                <AlertTriangle size={16} /> Emergency
              </button>
            )}
          </div>
        </div>

        <div className="stat-grid">
          {distance != null && (
            <div className="stat-card" style={{ border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
              <div className="stat-label">Distance from You</div>
              <div className="flex items-center gap-1 font-bold" style={{ color: '#059669' }}>
                <MapPin size={18} />
                <span className="stat-value">{distance} km</span>
              </div>
              <div className="text-xs text-secondary">{userLocation ? userLocation.name : 'Your Location'}</div>
            </div>
          )}
          <div className="stat-card" style={{ border: '1px solid #a7f3d0', background: '#ecfdf5' }}>
            <div className="stat-label" style={{ color: '#047857' }}>Consultation Fee</div>
            <div className="stat-value" style={{ color: '#059669' }}>₹{hospital.consultation_fee || 200}</div>
            <div className="text-xs text-secondary">Patiala Range: ₹200–₹500</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Crowd Level</div>
            <div className="flex items-center gap-2">
              <span className={`crowd-dot ${crowdColor}`}></span>
              <span className="stat-value">{hospital.crowdLevel}%</span>
            </div>
            <div className="text-sm text-secondary">{getCrowdLabel(hospital.crowdLevel)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Wait Time</div>
            <div className="stat-value">{hospital.waitTime} min</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Doctors Available</div>
            <div className="stat-value">{availableDocs.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rating</div>
            <div className="flex items-center gap-1">
              <Star size={18} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
              <span className="stat-value">{hospital.rating}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Beds</div>
            <div className="stat-value">{hospital.beds}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Phone</div>
            <div className="text-sm font-semibold">{hospital.phone}</div>
          </div>
        </div>
      </div>

      {/* Departments */}
      <h3 className="mb-4">Departments & Crowd</h3>
      <div className="card mb-6">
        {hospital.departments.map(dId => {
          const dept = departments.find(d => d.id === dId);
          const cd = crowdData.find(c => c.id === dId);
          if (!dept) return null;
          return (
            <div key={dId} className="flex items-center gap-3" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '18px', width: '32px', textAlign: 'center' }}>{dept.icon}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{dept.name}</span>
              <div className="progress-bar" style={{ width: '120px' }}>
                <div className={`progress-bar-fill ${getCrowdColor(cd?.crowd || 50)}`} style={{ width: `${cd?.crowd || 50}%` }}></div>
              </div>
              <span className="text-sm font-semibold" style={{ width: '40px', textAlign: 'right' }}>{cd?.crowd || 50}%</span>
              <span className="text-sm text-secondary" style={{ width: '60px' }}>~{cd?.waitTime || 20} min</span>
            </div>
          );
        })}
      </div>

      {/* Doctors */}
      <div className="flex items-center justify-between mb-4">
        <h3>Available Doctors ({availableDocs.length})</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/patient/doctors')}>View All Doctors</button>
      </div>
      <div className="grid-3 mb-6">
        {availableDocs.slice(0, 6).map(doc => (
          <div key={doc.id} className="card card-hover card-compact" style={{ cursor: 'pointer' }} onClick={() => navigate(`/patient/doctors/${doc.id}`)}>
            <div className="flex items-center gap-3 mb-2">
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${departments.find(d => d.id === doc.department_id)?.color || '#0891B2'}, ${departments.find(d => d.id === doc.department_id)?.color || '#0891B2'}dd)`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px' }}>
                {doc.name.split(' ').slice(1).map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-semibold text-sm">{doc.name}</div>
                <div className="text-sm text-secondary">{doc.specialization}</div>
              </div>
            </div>
            <div className="flex gap-2 text-sm text-secondary">
              <span>{doc.experience} yrs</span>
              <span>•</span>
              <span>₹{doc.consultation_fee}</span>
              <span>•</span>
              <span>⭐ {doc.rating}</span>
            </div>
          </div>
        ))}
      </div>

      {showBookModal && (
        <BookAppointmentModal 
          hospital={hospital} 
          onClose={() => setShowBookModal(false)} 
        />
      )}
    </div>
  );
}

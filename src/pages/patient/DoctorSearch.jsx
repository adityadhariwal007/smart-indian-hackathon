import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Clock, MapPin } from 'lucide-react';
import doctors from '../../data/doctors';
import hospitals from '../../data/hospitals';
import departments from '../../data/departments';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal';

export default function DoctorSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [specFilter, setSpecFilter] = useState('all');
  const [availFilter, setAvailFilter] = useState('all');
  const [bookingTarget, setBookingTarget] = useState(null);

  const filtered = useMemo(() => {
    return doctors.filter(d => {
      const q = query.toLowerCase();
      const matchQuery = !query || d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.expertise.some(e => e.toLowerCase().includes(q));
      const matchSpec = specFilter === 'all' || d.department_id === parseInt(specFilter);
      const matchAvail = availFilter === 'all' || (availFilter === 'available' && d.available_today);
      return matchQuery && matchSpec && matchAvail;
    }).sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  }, [query, specFilter, availFilter]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Find Doctor</h1>
        <p>Search by name, specialization, or area of expertise.</p>
      </div>

      <div className="search-header">
        <div className="search-bar-large">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Search doctor name, specialty or expertise..." value={query} onChange={e => setQuery(e.target.value)} className="input" style={{ paddingLeft: '48px' }} />
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          <select className="select" style={{ width: 'auto' }} value={specFilter} onChange={e => setSpecFilter(e.target.value)}>
            <option value="all">All Specializations</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
          </select>
          <select className="select" style={{ width: 'auto' }} value={availFilter} onChange={e => setAvailFilter(e.target.value)}>
            <option value="all">All Doctors</option>
            <option value="available">Available Today</option>
          </select>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/patient/expertise')}>
            🔍 Search by Symptom
          </button>
        </div>
      </div>

      <div className="text-sm text-secondary mb-4">{filtered.length} doctors found</div>

      <div className="grid-2">
        {filtered.slice(0, 20).map(doc => {
          const hospital = hospitals.find(h => h.id === doc.hospital_id);
          const dept = departments.find(d => d.id === doc.department_id);
          return (
            <div key={doc.id} className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate(`/patient/doctors/${doc.id}`)}>
              <div className="flex items-start gap-3">
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `linear-gradient(135deg, ${dept?.color || '#0891B2'}, ${dept?.color || '#0891B2'}bb)`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>
                  {doc.name.split(' ').slice(1, 3).map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 style={{ fontSize: 'var(--font-md)' }}>{doc.name}</h4>
                    {doc.available_today && <span className="badge badge-success">Available</span>}
                  </div>
                  <div className="text-sm text-secondary mb-2">{doc.specialization}</div>
                  <div className="flex gap-1 flex-wrap mb-3">
                    {doc.expertise.map(e => <span key={e} className="tag tag-primary" style={{ fontSize: '11px' }}>{e}</span>)}
                  </div>
                  <div className="flex gap-3 text-sm text-secondary flex-wrap">
                    <span>{doc.experience} yrs exp</span>
                    <span className="flex items-center gap-1"><Star size={13} style={{ color: '#F59E0B', fill: '#F59E0B' }} /> {doc.rating}</span>
                    <span>₹{doc.consultation_fee}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-secondary mt-2">
                    <MapPin size={13} /> {hospital?.name || 'Hospital'}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-secondary mt-1">
                    <Clock size={13} /> {doc.availability}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/patient/doctors/${doc.id}`); }}>View Profile</button>
                <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setBookingTarget({ hospital, doctor: doc }); }}>Book Appointment</button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length > 20 && (
        <div className="text-center mt-6 text-secondary">
          Showing first 20 of {filtered.length} results. Refine your search for more specific results.
        </div>
      )}

      {bookingTarget && (
        <BookAppointmentModal
          hospital={bookingTarget.hospital}
          preselectedDoctor={bookingTarget.doctor}
          onClose={() => setBookingTarget(null)}
        />
      )}
    </div>
  );
}

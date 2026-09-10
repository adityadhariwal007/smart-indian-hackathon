import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Clock, Users, Star, AlertTriangle, ChevronDown, ArrowUpDown } from 'lucide-react';
import hospitals, { getCrowdLabel, getCrowdColor, getCostLabel, getHospitalReview } from '../../data/hospitals';
import departments from '../../data/departments';
import { getDoctorsByHospital } from '../../data/doctors';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal';
import PatialaLocationBar from '../../components/common/PatialaLocationBar';
import { useLocationContext } from '../../context/LocationContext';

export default function HospitalSearch() {
  const navigate = useNavigate();
  const { userLocation, calculateHospitalDistance, requestGpsLocation } = useLocationContext();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [crowdFilter, setCrowdFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'crowd', 'waitTime', 'rating'
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [bookingHospital, setBookingHospital] = useState(null);

  // Automatically request GPS location on first visit if not set
  useEffect(() => {
    if (!userLocation) {
      requestGpsLocation();
    }
  }, []);

  const filtered = useMemo(() => {
    return hospitals
      .map(h => ({
        ...h,
        distance: calculateHospitalDistance(h)
      }))
      .filter(h => {
        const matchQuery = !query || 
          h.name.toLowerCase().includes(query.toLowerCase()) || 
          h.address.toLowerCase().includes(query.toLowerCase());
        const matchType = typeFilter === 'all' || h.type === typeFilter;
        const matchDept = deptFilter === 'all' || h.departments.includes(parseInt(deptFilter));
        const matchCrowd = crowdFilter === 'all' ||
          (crowdFilter === 'low' && h.crowdLevel <= 40) ||
          (crowdFilter === 'medium' && h.crowdLevel > 40 && h.crowdLevel <= 70) ||
          (crowdFilter === 'high' && h.crowdLevel > 70);
        return matchQuery && matchType && matchDept && matchCrowd;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          if (a.distance == null) return 1;
          if (b.distance == null) return -1;
          return a.distance - b.distance;
        }
        if (sortBy === 'waitTime') return a.waitTime - b.waitTime;
        if (sortBy === 'rating') return b.rating - a.rating;
        return a.crowdLevel - b.crowdLevel;
      });
  }, [query, typeFilter, deptFilter, crowdFilter, sortBy, userLocation, calculateHospitalDistance]);

  const toggleCompare = (id) => {
    setCompareList(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>Hospitals in Patiala</h1>
          <span className="badge badge-primary">Patiala, Punjab</span>
        </div>
        <p>Browse verified government and private hospitals in Patiala with real-time distance calculations from your location.</p>
      </div>

      {/* Patiala Patient Location Request & Selector */}
      <PatialaLocationBar />

      {/* Search & Sort */}
      <div className="search-header">
        <div className="search-bar-large">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search Patiala hospital, department or treatment..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: '48px' }}
          />
        </div>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={16} /> Filters <ChevronDown size={14} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpDown size={14} style={{ color: '#059669' }} /> Sort:
              </span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#f8fafc',
                border: '1.5px solid #d1fae5',
                padding: '3px',
                borderRadius: '9999px',
                flexWrap: 'wrap'
              }}>
                {[
                  { id: 'distance', label: 'Nearest First', icon: '📍' },
                  { id: 'crowd', label: 'Lowest Crowd', icon: '🟢' },
                  { id: 'waitTime', label: 'Shortest Wait', icon: '⏱️' },
                  { id: 'rating', label: 'Highest Rating', icon: '⭐' }
                ].map(opt => {
                  const active = sortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortBy(opt.id)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: active ? 700 : 600,
                        background: active ? '#059669' : 'transparent',
                        color: active ? '#ffffff' : '#334155',
                        boxShadow: active ? '0 2px 8px rgba(5, 150, 105, 0.3)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {compareList.length >= 2 && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/patient/hospitals/compare', { state: { ids: compareList } })}>
              Compare ({compareList.length})
            </button>
          )}
        </div>

        {showFilters && (
          <div className="filters-row mt-4" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select className="select" style={{ width: 'auto' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
            </select>
            <select className="select" style={{ width: 'auto' }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="all">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select className="select" style={{ width: 'auto' }} value={crowdFilter} onChange={e => setCrowdFilter(e.target.value)}>
              <option value="all">Any Crowd</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
        )}
      </div>

      {/* Results Count & Location indicator */}
      <div className="flex items-center justify-between text-sm text-secondary mb-4 flex-wrap gap-2">
        <span>{filtered.length} hospitals in Patiala</span>
        {userLocation && (
          <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
            Distances measured from {userLocation.name}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map(hospital => {
          const crowdColor = getCrowdColor(hospital.crowdLevel);
          const doctors = getDoctorsByHospital(hospital.id);
          const availableDocs = doctors.filter(d => d.available_today).length;
          const review = getHospitalReview(hospital.id);

          return (
            <div key={hospital.id} className="card card-hover" style={{ padding: '20px' }}>
              <div className="flex items-start justify-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4>{hospital.name}</h4>
                    <span className={`badge badge-${hospital.type === 'Government' ? 'info' : 'neutral'}`}>
                      {hospital.type}
                    </span>
                    {hospital.distance != null && (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                        <MapPin size={11} /> {hospital.distance} km away
                      </span>
                    )}
                    <span className="badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontWeight: 700 }}>
                      OPD Fee: ₹{hospital.consultation_fee || 200}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-secondary mb-3">
                    <MapPin size={14} /> {hospital.address}
                  </div>

                  <div className="flex gap-4 flex-wrap text-sm" style={{ marginBottom: '12px' }}>
                    {hospital.distance != null && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600" style={{ background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                        <MapPin size={13} /> {hospital.distance} km from {userLocation ? userLocation.name.split(',')[0] : 'you'}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className={`crowd-dot ${crowdColor}`}></span>
                      {getCrowdLabel(hospital.crowdLevel)} ({hospital.crowdLevel}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> ~{hospital.waitTime} min wait
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {availableDocs} doctors available
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} /> {hospital.rating}
                    </span>
                    {hospital.emergency_available && (
                      <span className="badge badge-danger">Emergency</span>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {hospital.departments.slice(0, 5).map(dId => {
                      const dept = departments.find(d => d.id === dId);
                      return dept ? (
                        <span key={dId} className="tag">{dept.icon} {dept.name}</span>
                      ) : null;
                    })}
                    {hospital.departments.length > 5 && (
                      <span className="tag">+{hospital.departments.length - 5} more</span>
                    )}
                  </div>

                  {/* Verified Patient Review Snippet */}
                  {review && (
                    <div style={{
                      marginTop: '14px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      maxWidth: '780px'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#059669',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                      }}>
                        {review.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                            {review.author}
                          </span>
                          <span style={{
                            fontSize: '9px',
                            padding: '1px 6px',
                            fontWeight: 700,
                            background: '#dcfce7',
                            color: '#166534',
                            borderRadius: '4px'
                          }}>
                            ✓ Verified Patient
                          </span>
                          <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>
                            {'★'.repeat(review.rating)}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            • {review.date}
                          </span>
                        </div>

                        <p style={{
                          margin: '3px 0 0',
                          fontSize: '12px',
                          color: '#475569',
                          fontStyle: 'italic',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          "{review.text}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2" style={{ alignItems: 'flex-end' }}>
                  <div className="text-right mb-2">
                    <div className="text-xs text-secondary">Consultation Fee</div>
                    <div className="font-bold text-lg" style={{ color: '#059669' }}>
                      ₹{hospital.consultation_fee || 200}
                    </div>
                    <div className="text-xs text-secondary" style={{ fontSize: '10px' }}>
                      Range: ₹200–₹500
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => setBookingHospital(hospital)}
                    style={{ boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)', fontWeight: 600 }}
                  >
                    Book Appointment
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/patient/hospitals/${hospital.id}`)}>
                    View Hospital
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patient/queue')}>
                    Get Queue Token
                  </button>
                  <label className="checkbox-group" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={compareList.includes(hospital.id)} onChange={() => toggleCompare(hospital.id)} />
                    Compare
                  </label>
                </div>
              </div>
            </div>
          );
        })}
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

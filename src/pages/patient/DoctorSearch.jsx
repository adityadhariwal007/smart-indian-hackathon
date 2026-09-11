import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, MapPin, Clock, Star, Award, ShieldCheck,
  ChevronDown, ArrowUpDown, Video, Calendar, UserCheck, Check,
  X, Stethoscope, Sparkles, ExternalLink, Info
} from 'lucide-react';
import doctors from '../../data/doctors';
import hospitals from '../../data/hospitals';
import departments from '../../data/departments';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal';
import PatialaLocationBar from '../../components/common/PatialaLocationBar';
import { useLocationContext } from '../../context/LocationContext';
import { useNotifications } from '../../context/NotificationContext';

export default function DoctorSearch() {
  const navigate = useNavigate();
  const { userLocation, calculateHospitalDistance, requestGpsLocation } = useLocationContext();
  const { addToast } = useNotifications();

  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [expFilter, setExpFilter] = useState('all');
  const [availFilter, setAvailFilter] = useState('all');
  const [feeFilter, setFeeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'distance', 'experience', 'fee', 'available'
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [bookingTarget, setBookingTarget] = useState(null);

  // Request GPS if not yet set
  useEffect(() => {
    if (!userLocation) {
      requestGpsLocation();
    }
  }, []);

  // Map each doctor with their hospital & calculate distance
  const doctorsWithDistance = useMemo(() => {
    return doctors.map(doc => {
      const hospital = hospitals.find(h => h.id === doc.hospital_id);
      const distance = hospital ? calculateHospitalDistance(hospital) : null;
      return {
        ...doc,
        hospital,
        distance
      };
    });
  }, [userLocation, calculateHospitalDistance]);

  // Filter & sort doctors
  const filtered = useMemo(() => {
    return doctorsWithDistance
      .filter(doc => {
        const q = query.toLowerCase().trim();
        const matchQuery = !q ||
          doc.name.toLowerCase().includes(q) ||
          doc.specialization.toLowerCase().includes(q) ||
          (doc.hospital_name && doc.hospital_name.toLowerCase().includes(q)) ||
          (doc.city && doc.city.toLowerCase().includes(q)) ||
          doc.expertise.some(e => e.toLowerCase().includes(q)) ||
          doc.qualifications.some(qual => qual.toLowerCase().includes(q));

        const matchDept = deptFilter === 'all' || doc.department_id === parseInt(deptFilter);
        const matchCity = cityFilter === 'all' || (doc.city && doc.city.toLowerCase() === cityFilter.toLowerCase());
        const matchHospital = hospitalFilter === 'all' || doc.hospital_id === parseInt(hospitalFilter);
        
        const matchExp = expFilter === 'all' ||
          (expFilter === '25' && doc.experience >= 25) ||
          (expFilter === '20' && doc.experience >= 20) ||
          (expFilter === '15' && doc.experience >= 15);

        const matchAvail = availFilter === 'all' ||
          (availFilter === 'today' && doc.available_today) ||
          (availFilter === 'video' && doc.video_consult_available);

        const matchFee = feeFilter === 'all' ||
          (feeFilter === 'govt' && doc.consultation_fee <= 250) ||
          (feeFilter === 'under400' && doc.consultation_fee <= 400);

        return matchQuery && matchDept && matchCity && matchHospital && matchExp && matchAvail && matchFee;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          if (a.distance == null) return 1;
          if (b.distance == null) return -1;
          return a.distance - b.distance;
        }
        if (sortBy === 'experience') return b.experience - a.experience;
        if (sortBy === 'fee') return a.consultation_fee - b.consultation_fee;
        if (sortBy === 'available') {
          if (a.available_today === b.available_today) return parseFloat(b.rating) - parseFloat(a.rating);
          return a.available_today ? -1 : 1;
        }
        return parseFloat(b.rating) - parseFloat(a.rating);
      });
  }, [doctorsWithDistance, query, deptFilter, cityFilter, hospitalFilter, expFilter, availFilter, feeFilter, sortBy]);

  const toggleCompare = (id) => {
    setCompareList(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) {
        if (addToast) addToast('You can compare a maximum of 3 doctors side by side.', 'info');
        return prev;
      }
      return [...prev, id];
    });
  };

  const comparedDoctors = useMemo(() => {
    return doctorsWithDistance.filter(d => compareList.includes(d.id));
  }, [doctorsWithDistance, compareList]);

  const handleStartVideoConsult = (doc) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('healthflow_opted_online', 'true');
    }
    setBookingTarget({
      hospital: doc.hospital || hospitals[0],
      doctor: doc,
      initialMode: 'online'
    });
  };

  const clearAllFilters = () => {
    setQuery('');
    setDeptFilter('all');
    setCityFilter('all');
    setHospitalFilter('all');
    setExpFilter('all');
    setAvailFilter('all');
    setFeeFilter('all');
    setSortBy('rating');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Page Header with Verified Badges */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
            Best Doctors in Punjab
          </h1>
          <span className="badge badge-primary" style={{ background: '#0284c7', color: '#ffffff', fontWeight: 700 }}>
            Punjab Specialists
          </span>
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <ShieldCheck size={12} /> PMC Verified Only
          </span>
          <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
            Zero Fictional Data
          </span>
        </div>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0, maxWidth: '850px' }}>
          Consult verified professors, department heads, and renowned specialists across Punjab with authentic credentials, live OPD hours, and real-time distance from your location.
        </p>
      </div>

      {/* Punjab / Patiala Patient Location Bar */}
      <PatialaLocationBar />

      {/* Search Header & Sort Controls */}
      <div className="search-header" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
        <div className="search-bar-large" style={{ position: 'relative' }}>
          <Search size={20} className="search-icon" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#059669' }} />
          <input
            type="text"
            placeholder="Search doctor name, medical specialty, disease/condition, hospital, or city in Punjab..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input"
            style={{
              paddingLeft: '48px',
              height: '50px',
              fontSize: '15px',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              width: '100%'
            }}
          />
        </div>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, borderRadius: '9999px', padding: '7px 14px' }}
            >
              <Filter size={15} />
              <span>Filters</span>
              {(deptFilter !== 'all' || cityFilter !== 'all' || hospitalFilter !== 'all' || expFilter !== 'all' || availFilter !== 'all' || feeFilter !== 'all') && (
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              )}
              <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Sort Pill Buttons */}
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
                  { id: 'rating', label: 'Highest Rated', icon: '⭐' },
                  { id: 'distance', label: 'Nearest First', icon: '📍' },
                  { id: 'experience', label: 'Most Experienced', icon: '🏅' },
                  { id: 'fee', label: 'Lowest Fee', icon: '💰' },
                  { id: 'available', label: 'Available Today', icon: '⚡' }
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
                        padding: '6px 13px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: active ? 700 : 600,
                        background: active ? '#059669' : 'transparent',
                        color: active ? '#ffffff' : '#334155',
                        boxShadow: active ? '0 2px 8px rgba(5, 150, 105, 0.3)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {compareList.length >= 2 && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCompareModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                  fontWeight: 700,
                  borderRadius: '9999px',
                  padding: '7px 16px'
                }}
              >
                Compare ({compareList.length}) Doctors
              </button>
            )}

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/patient/expertise')}
              style={{ borderRadius: '9999px', padding: '7px 14px', fontSize: '12px' }}
            >
              🔍 Search by Symptom
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filter Row */}
        {showFilters && (
          <div
            className="filters-row mt-4"
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9'
            }}
          >
            {/* Specialty */}
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                SPECIALTY / DEPARTMENT
              </label>
              <select
                className="select"
                style={{ width: '100%', fontSize: '13px' }}
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
              >
                <option value="all">All Departments ({departments.length})</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                PUNJAB CITY
              </label>
              <select
                className="select"
                style={{ width: '100%', fontSize: '13px' }}
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
              >
                <option value="all">All Punjab</option>
                <option value="patiala">Patiala</option>
                <option value="ludhiana">Ludhiana</option>
                <option value="mohali">Mohali / Chandigarh</option>
                <option value="jalandhar">Jalandhar</option>
                <option value="amritsar">Amritsar</option>
              </select>
            </div>

            {/* Hospital Affiliation */}
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                HOSPITAL AFFILIATION
              </label>
              <select
                className="select"
                style={{ width: '100%', fontSize: '13px' }}
                value={hospitalFilter}
                onChange={e => setHospitalFilter(e.target.value)}
              >
                <option value="all">All Hospitals</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name.split('(')[0]}</option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                EXPERIENCE LEVEL
              </label>
              <select
                className="select"
                style={{ width: '100%', fontSize: '13px' }}
                value={expFilter}
                onChange={e => setExpFilter(e.target.value)}
              >
                <option value="all">Any Experience</option>
                <option value="25">25+ Years (Pioneers)</option>
                <option value="20">20+ Years (Senior)</option>
                <option value="15">15+ Years</option>
              </select>
            </div>

            {/* Availability */}
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                OPD STATUS
              </label>
              <select
                className="select"
                style={{ width: '100%', fontSize: '13px' }}
                value={availFilter}
                onChange={e => setAvailFilter(e.target.value)}
              >
                <option value="all">All Doctors</option>
                <option value="today">⚡ Available Today</option>
                <option value="video">📹 Video Consult Ready</option>
              </select>
            </div>

            {/* Fee */}
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                CONSULTATION FEE
              </label>
              <select
                className="select"
                style={{ width: '100%', fontSize: '13px' }}
                value={feeFilter}
                onChange={e => setFeeFilter(e.target.value)}
              >
                <option value="all">Any Fee (₹200–₹500)</option>
                <option value="govt">Govt Subsidized (₹200)</option>
                <option value="under400">Under ₹400</option>
              </select>
            </div>

            <div style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={clearAllFilters}
                style={{ fontSize: '12px', color: '#dc2626' }}
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count & Location indicator */}
      <div className="flex items-center justify-between text-sm text-secondary mb-4 flex-wrap gap-2">
        <span style={{ fontWeight: 600, color: '#1e293b' }}>
          Found {filtered.length} verified top specialists across Punjab
        </span>
        {userLocation && (
          <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} /> Distances measured from {userLocation.name}
          </span>
        )}
      </div>

      {/* Doctor Cards Grid */}
      {filtered.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 20px', background: '#ffffff' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👨‍⚕️</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>No doctors found matching your criteria</h3>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '8px auto 20px' }}>
            Try adjusting your search keywords, clearing specific specialty filters, or resetting the Punjab city filter.
          </p>
          <button className="btn btn-primary" onClick={clearAllFilters} style={{ margin: '0 auto' }}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filtered.map(doc => {
            const dept = departments.find(d => d.id === doc.department_id);
            const deptColor = dept?.color || '#0891B2';
            const isCompared = compareList.includes(doc.id);

            return (
              <div
                key={doc.id}
                className="card card-hover"
                style={{
                  padding: '24px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: isCompared ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  boxShadow: isCompared
                    ? '0 6px 20px -2px rgba(2, 132, 199, 0.15)'
                    : '0 4px 14px -2px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="flex items-start justify-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
                  {/* Left Column: Doctor Profile Details */}
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      {/* Avatar with department color & badge */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: `linear-gradient(135deg, ${deptColor} 0%, ${deptColor}dd 100%)`,
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '20px',
                            boxShadow: `0 4px 12px ${deptColor}40`
                          }}
                        >
                          {doc.name.replace('Prof. ', '').replace('(Dr.) ', '').replace('Dr. ', '').split(' ').slice(0, 2).map(n => n[0]).join('')}
                        </div>
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                        >
                          {dept?.icon || '🩺'}
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '18px',
                              fontWeight: 800,
                              color: '#0f172a',
                              cursor: 'pointer'
                            }}
                            onClick={() => navigate(`/patient/doctors/${doc.id}`)}
                          >
                            {doc.name}
                          </h3>
                          <span
                            className="badge badge-success"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px'
                            }}
                          >
                            <ShieldCheck size={12} /> {doc.pmc_reg} Verified
                          </span>
                          {doc.available_today ? (
                            <span className="badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '11px', fontWeight: 700 }}>
                              🟢 Available Today
                            </span>
                          ) : (
                            <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '11px', fontWeight: 600 }}>
                              Next Slot Tomorrow
                            </span>
                          )}
                        </div>

                        {/* Title & Department */}
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          {doc.title} • <span style={{ color: deptColor, fontWeight: 700 }}>{doc.specialization}</span>
                        </div>

                        {/* Hospital & Distance */}
                        <div className="flex items-center gap-2 text-sm text-secondary mb-3 flex-wrap">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#475569', fontWeight: 600 }}>
                            <MapPin size={14} style={{ color: '#059669' }} />
                            {doc.hospital_name}
                          </span>
                          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                            {doc.city}, Punjab
                          </span>
                          {doc.distance != null && (
                            <span
                              className="badge badge-success"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 700,
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0'
                              }}
                            >
                              📍 {doc.distance} km away
                            </span>
                          )}
                        </div>

                        {/* Stats & Credential Tags */}
                        <div className="flex gap-4 flex-wrap text-sm" style={{ marginBottom: '12px' }}>
                          <span className="flex items-center gap-1 font-semibold" style={{ color: '#475569' }}>
                            <Award size={14} style={{ color: '#f59e0b' }} /> {doc.experience} Years Exp.
                          </span>
                          <span className="flex items-center gap-1 font-semibold" style={{ color: '#b45309' }}>
                            <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} /> {doc.rating} ({doc.review_count} verified reviews)
                          </span>
                          <span className="flex items-center gap-1" style={{ color: '#475569' }}>
                            <Clock size={14} style={{ color: '#0284c7' }} /> {doc.availability}
                          </span>
                          {doc.video_consult_available && (
                            <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Video size={11} /> Video Consult Ready
                            </span>
                          )}
                        </div>

                        {/* Qualifications */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          {doc.qualifications.map((q, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                background: '#f1f5f9',
                                color: '#334155',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              {q}
                            </span>
                          ))}
                        </div>

                        {/* Clinical Expertise Pills */}
                        <div className="flex gap-1 flex-wrap" style={{ marginBottom: '12px' }}>
                          {doc.expertise.map(e => (
                            <span key={e} className="tag tag-primary" style={{ fontSize: '11px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                              {e}
                            </span>
                          ))}
                        </div>

                        {/* Verified Patient Review Snippet */}
                        {doc.patient_review && (
                          <div
                            style={{
                              marginTop: '10px',
                              padding: '10px 14px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              maxWidth: '750px'
                            }}
                          >
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#059669',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 700,
                                flexShrink: 0
                              }}
                            >
                              {doc.patient_review.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                                  {doc.patient_review.author}
                                </span>
                                <span
                                  style={{
                                    fontSize: '9px',
                                    padding: '1px 6px',
                                    fontWeight: 700,
                                    background: '#dcfce7',
                                    color: '#166534',
                                    borderRadius: '4px'
                                  }}
                                >
                                  ✓ Verified Patient
                                </span>
                                <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>
                                  {'★'.repeat(doc.patient_review.rating)}
                                </span>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                  • {doc.patient_review.date}
                                </span>
                              </div>
                              <p
                                style={{
                                  margin: '3px 0 0',
                                  fontSize: '12px',
                                  color: '#475569',
                                  fontStyle: 'italic',
                                  lineHeight: 1.4,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                "{doc.patient_review.text}"
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Fee & Actions */}
                  <div
                    className="flex flex-col gap-2"
                    style={{
                      alignItems: 'flex-end',
                      borderLeft: '1px solid #f1f5f9',
                      paddingLeft: '20px',
                      minWidth: '200px'
                    }}
                  >
                    <div className="text-right mb-2" style={{ width: '100%' }}>
                      <div className="text-xs text-secondary" style={{ fontWeight: 600 }}>
                        OPD Consultation Fee
                      </div>
                      <div className="font-bold text-2xl" style={{ color: '#059669', lineHeight: 1.2 }}>
                        ₹{doc.consultation_fee}
                      </div>
                      <div className="text-xs text-secondary" style={{ fontSize: '10px' }}>
                        {doc.consultation_fee <= 250 ? 'Govt Subsidized OPD' : 'Private Super-Specialist'}
                      </div>
                    </div>

                    {/* Book Appointment CTA */}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setBookingTarget({ hospital: doc.hospital || hospitals[0], doctor: doc })}
                      style={{
                        width: '100%',
                        fontWeight: 700,
                        padding: '9px 16px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Calendar size={15} /> Book OPD Visit
                    </button>

                    {/* Instant Video Call CTA */}
                    <button
                      className="btn btn-sm"
                      onClick={() => handleStartVideoConsult(doc)}
                      style={{
                        width: '100%',
                        fontWeight: 700,
                        padding: '9px 16px',
                        borderRadius: '10px',
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1.5px solid #a7f3d0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Video size={15} /> Instant Video Call
                    </button>

                    {/* View Profile */}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/patient/doctors/${doc.id}`)}
                      style={{
                        width: '100%',
                        borderRadius: '10px',
                        fontSize: '12px'
                      }}
                    >
                      View Full Profile
                    </button>

                    {/* Compare Checkbox */}
                    <label
                      className="checkbox-group"
                      style={{
                        fontSize: '12px',
                        color: isCompared ? '#0284c7' : '#64748b',
                        fontWeight: isCompared ? 700 : 500,
                        marginTop: '4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isCompared}
                        onChange={() => toggleCompare(doc.id)}
                      />
                      Compare Doctor
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Compare Tray (When 1+ doctors are selected for comparison) */}
      {compareList.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '9999px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 100,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              {compareList.length} of 3 doctors selected for comparison
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {compareList.length >= 2 && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCompareModal(true)}
                style={{
                  borderRadius: '9999px',
                  fontWeight: 700,
                  padding: '6px 18px',
                  background: '#0284c7'
                }}
              >
                Compare Side-by-Side
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setCompareList([])}
              style={{
                color: '#94a3b8',
                borderRadius: '9999px',
                fontSize: '12px'
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Doctor Comparison Modal */}
      {showCompareModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowCompareModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '1050px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                  Doctor Comparison
                </h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                  Comparing {comparedDoctors.length} verified Punjab specialists side-by-side
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${comparedDoctors.length}, 1fr)`, gap: '16px', overflowX: 'auto' }}>
              {/* Header Row */}
              <div style={{ fontWeight: 700, color: '#64748b', alignSelf: 'center' }}>Doctor</div>
              {comparedDoctors.map(doc => (
                <div key={doc.id} style={{ textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{doc.name}</h4>
                  <span className="badge badge-success" style={{ fontSize: '10px', fontWeight: 700 }}>
                    {doc.pmc_reg}
                  </span>
                </div>
              ))}

              {/* Specialization */}
              <div style={{ fontWeight: 700, color: '#64748b' }}>Specialty</div>
              {comparedDoctors.map(doc => (
                <div key={doc.id} style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7' }}>
                  {doc.specialization}
                </div>
              ))}

              {/* Experience */}
              <div style={{ fontWeight: 700, color: '#64748b' }}>Experience</div>
              {comparedDoctors.map(doc => (
                <div key={doc.id} style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                  {doc.experience} Years
                </div>
              ))}

              {/* Qualifications */}
              <div style={{ fontWeight: 700, color: '#64748b' }}>Degrees</div>
              {comparedDoctors.map(doc => (
                <div key={doc.id} style={{ fontSize: '12px', color: '#475569' }}>
                  {doc.qualifications.join(', ')}
                </div>
              ))}

              {/* Hospital & Distance */}
              <div style={{ fontWeight: 700, color: '#64748b' }}>Hospital & Distance</div>
              {comparedDoctors.map(doc => (
                <div key={doc.id} style={{ fontSize: '12px', color: '#334155' }}>
                  <div style={{ fontWeight: 600 }}>{doc.hospital_name}</div>
                  {doc.distance != null && (
                    <span style={{ color: '#059669', fontWeight: 700 }}>📍 {doc.distance} km away</span>
                  )}
                </div>
              ))}

              {/* Fee */}
              <div style={{ fontWeight: 700, color: '#64748b' }}>OPD Fee</div>
              {comparedDoctors.map(doc => (
                <div key={doc.id} style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                  ₹{doc.consultation_fee}
                </div>
              ))}

              {/* Timing */}
              <div style={{ fontWeight: 700, color: '#64748b' }}>OPD Schedule</div>
              {comparedDoctors.map(doc => (
                <div key={doc.id} style={{ fontSize: '12px', color: '#475569' }}>
                  {doc.availability}
                </div>
              ))}

              {/* Rating */}
              <div style={{ fontWeight: 700, color: '#64748b' }}>Patient Rating</div>
              {comparedDoctors.map(doc => (
                <div key={doc.id} style={{ fontSize: '13px', fontWeight: 700, color: '#b45309' }}>
                  ⭐ {doc.rating} / 5.0 ({doc.review_count} reviews)
                </div>
              ))}

              {/* Top Expertise */}
              <div style={{ fontWeight: 700, color: '#64748b' }}>Key Expertise</div>
              {comparedDoctors.map(doc => (
                <div key={doc.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {doc.expertise.slice(0, 3).map(e => (
                    <span key={e} className="tag tag-primary" style={{ fontSize: '10px' }}>{e}</span>
                  ))}
                </div>
              ))}

              {/* Action */}
              <div style={{ fontWeight: 700, color: '#64748b' }}>Book</div>
              {comparedDoctors.map(doc => (
                <div key={doc.id}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', fontWeight: 700, fontSize: '12px' }}
                    onClick={() => {
                      setShowCompareModal(false);
                      setBookingTarget({ hospital: doc.hospital || hospitals[0], doctor: doc });
                    }}
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
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

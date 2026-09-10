import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, AlertCircle } from 'lucide-react';
import { findDepartmentBySymptom } from '../../data/expertiseMap';
import { getDoctorsByDepartment } from '../../data/doctors';
import hospitals from '../../data/hospitals';
import departments from '../../data/departments';

export default function ExpertiseSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    const matches = findDepartmentBySymptom(query);
    const topMatch = matches[0];
    const doctors = getDoctorsByDepartment(topMatch.departmentId).filter(d => d.available_today).slice(0, 6);
    setResults({ matches, doctors, query });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Find by Expertise</h1>
        <p>Describe your concern and we'll help you find the right department and specialist.</p>
      </div>

      <div className="card mb-6" style={{ padding: '28px' }}>
        <div className="search-bar-large">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder='Describe your concern... e.g. "knee pain", "chest pain", "headache"' value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="input" style={{ paddingLeft: '48px' }} />
        </div>
        <button className="btn btn-primary mt-4" onClick={handleSearch}>
          <Search size={16} /> Find Specialists
        </button>

        <div className="flex gap-2 mt-4 flex-wrap">
          {['Knee pain', 'Chest pain', 'Headache', 'Skin rash', 'Fever', 'Eye problem', 'Back pain'].map(s => (
            <button key={s} className="tag" style={{ cursor: 'pointer' }} onClick={() => { setQuery(s); }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer mb-6">
        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          This tool helps you find relevant healthcare services based on the information you provide.
          It does not diagnose medical conditions. Consult a qualified healthcare professional for medical advice.
        </span>
      </div>

      {results && (
        <div className="animate-slide-up">
          <div className="card mb-6" style={{ background: 'var(--primary-bg)', border: '1px solid var(--primary-200)' }}>
            <h4 className="mb-2" style={{ color: 'var(--primary-dark)' }}>Recommended Department</h4>
            <p className="mb-3">Based on "<strong>{results.query}</strong>", we recommend:</p>
            <div className="flex gap-3 flex-wrap">
              {results.matches.slice(0, 3).map((m, i) => {
                const dept = departments.find(d => d.id === m.departmentId);
                return (
                  <div key={i} className="card card-compact" style={{ background: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{dept?.icon}</span>
                    <span className="font-semibold">{m.department}</span>
                    {i === 0 && <span className="badge badge-success">Best Match</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <h3 className="mb-4">Available Specialists</h3>
          <div className="grid-3">
            {results.doctors.map(doc => {
              const hospital = hospitals.find(h => h.id === doc.hospital_id);
              return (
                <div key={doc.id} className="card card-hover card-compact" style={{ cursor: 'pointer' }} onClick={() => navigate(`/patient/doctors/${doc.id}`)}>
                  <div className="font-semibold mb-1">{doc.name}</div>
                  <div className="text-sm text-secondary mb-2">{doc.specialization}</div>
                  <div className="flex gap-1 flex-wrap mb-2">
                    {doc.expertise.slice(0, 3).map(e => <span key={e} className="tag" style={{ fontSize: '10px' }}>{e}</span>)}
                  </div>
                  <div className="text-sm text-secondary">{doc.experience} yrs • ₹{doc.consultation_fee}</div>
                  <div className="text-sm text-secondary">{hospital?.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

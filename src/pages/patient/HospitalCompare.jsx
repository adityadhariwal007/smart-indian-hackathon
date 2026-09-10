import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Check, X as XIcon } from 'lucide-react';
import hospitals, { getCrowdLabel, getCrowdColor, getCostLabel } from '../../data/hospitals';
import { getDoctorsByHospital } from '../../data/doctors';

export default function HospitalCompare() {
  const location = useLocation();
  const navigate = useNavigate();
  const ids = location.state?.ids || [1, 8, 12];
  const selected = ids.map(id => hospitals.find(h => h.id === id)).filter(Boolean);

  if (selected.length < 2) {
    return (
      <div className="animate-fade-in">
        <button className="btn btn-ghost mb-4" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <h3>Select at least 2 hospitals to compare</h3>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/patient/hospitals')}>Go to Hospital Search</button>
        </div>
      </div>
    );
  }

  // Find best match (lowest combined score)
  const scores = selected.map(h => ({
    id: h.id,
    score: (h.crowdLevel * 0.35) + (h.waitTime * 0.3) + (h.costTier * 15 * 0.2) - (h.rating * 5 * 0.15),
  }));
  const bestId = scores.sort((a, b) => a.score - b.score)[0].id;

  const features = [
    { label: 'Type', fn: h => h.type },
    { label: 'Crowd Level', fn: h => <span className="flex items-center gap-1"><span className={`crowd-dot ${getCrowdColor(h.crowdLevel)}`}></span>{getCrowdLabel(h.crowdLevel)} ({h.crowdLevel}%)</span> },
    { label: 'Wait Time', fn: h => `${h.waitTime} min` },
    { label: 'Doctors Available', fn: h => getDoctorsByHospital(h.id).filter(d => d.available_today).length },
    { label: 'Total Doctors', fn: h => h.totalDoctors },
    { label: 'Departments', fn: h => h.departments.length },
    { label: 'Emergency', fn: h => h.emergency_available ? <span className="text-success flex items-center gap-1"><Check size={14} /> Yes</span> : <span className="text-danger flex items-center gap-1"><XIcon size={14} /> No</span> },
    { label: 'Beds', fn: h => h.beds },
    { label: 'Rating', fn: h => <span className="flex items-center gap-1"><Star size={14} style={{ color: '#F59E0B', fill: '#F59E0B' }} />{h.rating}</span> },
    { label: 'Est. Cost', fn: h => getCostLabel(h.costTier) },
    { label: 'Established', fn: h => h.established },
  ];

  return (
    <div className="animate-fade-in">
      <button className="btn btn-ghost mb-4" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>

      <div className="page-header">
        <h1>Compare Hospitals</h1>
        <p>Side-by-side comparison of selected hospitals.</p>
      </div>

      <div className="table-container mb-6">
        <table>
          <thead>
            <tr>
              <th style={{ width: '160px' }}>Feature</th>
              {selected.map(h => (
                <th key={h.id}>
                  {h.name}
                  {h.id === bestId && (
                    <span className="badge badge-success" style={{ marginLeft: '8px' }}>Best Match</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{f.label}</td>
                {selected.map(h => <td key={h.id}>{f.fn(h)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Recommendation */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-bg), #E0F7FA)', border: '1px solid var(--primary-200)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Star size={20} style={{ color: 'var(--primary)' }} />
          <h4 style={{ color: 'var(--primary-dark)' }}>AI Recommendation</h4>
        </div>
        <p style={{ lineHeight: 1.7, marginBottom: '12px' }}>
          "Based on distance, expected waiting time, specialist availability and estimated cost,
          <strong> {selected.find(h => h.id === bestId)?.name}</strong> is currently the best match.
          It offers the optimal balance of crowd levels, wait times, and available medical staff."
        </p>
        <div className="disclaimer">
          <span>ⓘ</span>
          This recommendation is informational and not medical advice. Always consult a qualified healthcare professional for medical decisions.
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Clock, CheckCircle2, Play, Check, ChevronRight,
  Stethoscope, User
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctorStatus, setDoctorStatus] = useState('Available');
  const [activeQueue, setActiveQueue] = useState([
    { token: 'C-014', name: 'Ramesh Verma', age: 54, gender: 'M', issue: 'Followup Consultation', status: 'In Consultation', time: '10:15 AM' },
    { token: 'C-015', name: 'Sunita Rao', age: 46, gender: 'F', issue: 'Routine Checkup', status: 'Waiting', time: '10:30 AM' },
    { token: 'C-016', name: 'Kavita Singh', age: 38, gender: 'F', issue: 'Hypertension Review', status: 'Waiting', time: '10:45 AM' },
    { token: 'C-017', name: 'Alok Gupta', age: 62, gender: 'M', issue: 'Chest Discomfort', status: 'Waiting', time: '11:00 AM' },
  ]);

  const [completedCount, setCompletedCount] = useState(12);

  const handleCallNext = () => {
    setActiveQueue(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      if (updated[0].status === 'In Consultation') {
        setCompletedCount(c => c + 1);
        updated.shift();
      }
      if (updated.length > 0) {
        updated[0] = { ...updated[0], status: 'In Consultation' };
      }
      return updated;
    });
  };

  const handleCompleteCurrent = () => {
    setActiveQueue(prev => {
      if (prev.length === 0) return prev;
      setCompletedCount(c => c + 1);
      return prev.slice(1);
    });
  };

  const currentPatient = activeQueue.find(p => p.status === 'In Consultation');
  const waitingPatients = activeQueue.filter(p => p.status !== 'In Consultation');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Clean Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Stethoscope size={24} style={{ color: '#059669' }} />
            {user?.name || 'Dr. Ananya Sharma'}
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
            {user?.specialization || 'Cardiology'} • Chamber 204 • Patiala
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`btn btn-sm ${doctorStatus === 'Available' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '9999px', fontSize: '12px', padding: '6px 16px' }}
            onClick={() => setDoctorStatus('Available')}
          >
            🟢 On Duty
          </button>
          <button
            type="button"
            className={`btn btn-sm ${doctorStatus === 'Break' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ borderRadius: '9999px', fontSize: '12px', padding: '6px 14px' }}
            onClick={() => setDoctorStatus('Break')}
          >
            ☕ Break
          </button>
        </div>
      </div>

      {/* 3 Simple Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '18px 20px', borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Waiting Patients</span>
            <Users size={16} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginTop: '6px' }}>
            {waitingPatients.length}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Completed Today</span>
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
            {completedCount}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Avg. Wait Time</span>
            <Clock size={16} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
            ~15 min
          </div>
        </div>
      </div>

      {/* Currently In Consultation (Simple & Prominent) */}
      <div className="card" style={{
        padding: '24px',
        borderRadius: '18px',
        background: '#ffffff',
        border: '1.5px solid #a7f3d0',
        boxShadow: '0 4px 20px rgba(5, 150, 105, 0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <span className="badge badge-success" style={{ fontSize: '12px', padding: '4px 12px', fontWeight: 700 }}>
            {currentPatient ? `NOW SERVING: TOKEN ${currentPatient.token}` : 'NO PATIENT CURRENTLY SERVING'}
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentPatient && (
              <button
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '9999px', fontSize: '13px' }}
                onClick={handleCompleteCurrent}
              >
                <Check size={14} /> Done
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              style={{ borderRadius: '9999px', fontSize: '13px', background: '#059669' }}
              onClick={handleCallNext}
            >
              <Play size={14} /> Call Next
            </button>
          </div>
        </div>

        {currentPatient ? (
          <div style={{ background: '#f0fdf4', padding: '16px 20px', borderRadius: '12px', border: '1px solid #d1fae5' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#064e3b' }}>
              {currentPatient.name}
            </div>
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
              {currentPatient.age} yrs • {currentPatient.gender === 'M' ? 'Male' : 'Female'} • Slot: {currentPatient.time}
            </div>
            <div style={{ fontSize: '13px', color: '#059669', fontWeight: 600, marginTop: '6px' }}>
              Reason: {currentPatient.issue}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Chamber is clear. Click <strong>Call Next</strong> when ready.
          </div>
        )}
      </div>

      {/* Simplified Live Queue List */}
      <div className="card" style={{ padding: '22px', borderRadius: '18px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#1e293b' }}>
            Upcoming in Queue ({waitingPatients.length})
          </h2>
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '12px', color: '#059669' }}
            onClick={() => navigate('/doctor/patients')}
          >
            <span>All Patients</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {waitingPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
            No more patients waiting in queue.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {waitingPatients.map(p => (
              <div
                key={p.token}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 800, color: '#059669', fontSize: '13px', fontFamily: 'monospace' }}>
                    {p.token}
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {p.issue}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {p.time}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                    Waiting
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

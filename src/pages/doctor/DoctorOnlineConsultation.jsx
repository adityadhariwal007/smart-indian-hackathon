import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText, Activity, ShieldCheck, Clock, Send, Plus, Trash2,
  CheckCircle2, AlertCircle, Stethoscope, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LiveWebRtcVideoRoom from '../../components/consultation/LiveWebRtcVideoRoom';

export default function DoctorOnlineConsultation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const callId = searchParams.get('callId') || 'CALL-ROOM-LIVE';
  const patientName = searchParams.get('patientName') || 'Ramesh Verma';
  const patientId = searchParams.get('patientId') || 'PAT-402';

  const [activeTab, setActiveTab] = useState('rx'); // 'rx' | 'vitals'
  const [prescriptionSent, setPrescriptionSent] = useState(false);

  // Prescription state
  const [diagnosis, setDiagnosis] = useState('Acute Consultation Evaluation (Active Encounter)');
  const [clinicalNotes, setClinicalNotes] = useState('Patient attended online teleconsultation. Reviewing symptoms and adjusting medication.');
  const [medications, setMedications] = useState([
    { name: 'Tab. Paracetamol', dosage: '650mg SOS', time: 'After Meals', duration: '5 Days' },
    { name: 'Tab. Pantoprazole', dosage: '40mg OD', time: 'Morning (Empty Stomach)', duration: '5 Days' },
  ]);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', time: 'Morning', duration: '5 Days' });

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!newMed.name.trim()) return;
    setMedications((prev) => [...prev, newMed]);
    setNewMed({ name: '', dosage: '', time: 'Morning', duration: '5 Days' });
  };

  const handleRemoveMedication = (idx) => {
    setMedications((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSendPrescription = () => {
    setPrescriptionSent(true);
    setTimeout(() => setPrescriptionSent(false), 3500);
  };

  const handleEndCall = () => {
    navigate('/doctor/appointments');
  };

  const sidePanelContent = (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(62vh + 60px)',
        minHeight: '540px',
        boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Patient Summary Card */}
      <div
        style={{
          padding: '12px 14px',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
          borderRadius: '14px',
          border: '1px solid #a7f3d0',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
              Patient Encounter
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#065f46' }}>
              {patientName}
            </div>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              background: '#ffffff',
              color: '#059669',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #a7f3d0',
            }}
          >
            {patientId}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '12px',
        }}
      >
        <button
          onClick={() => setActiveTab('rx')}
          style={{
            border: 'none',
            borderRadius: '9px',
            padding: '7px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'rx' ? '#ffffff' : 'transparent',
            color: activeTab === 'rx' ? '#0f172a' : '#64748b',
            boxShadow: activeTab === 'rx' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <FileText size={14} />
          <span>E-Prescription</span>
        </button>

        <button
          onClick={() => setActiveTab('vitals')}
          style={{
            border: 'none',
            borderRadius: '9px',
            padding: '7px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'vitals' ? '#ffffff' : 'transparent',
            color: activeTab === 'vitals' ? '#0f172a' : '#64748b',
            boxShadow: activeTab === 'vitals' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Activity size={14} />
          <span>Clinical Vitals</span>
        </button>
      </div>

      {/* Tab 1: Prescription */}
      {activeTab === 'rx' ? (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
              Clinical Diagnosis
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
              Prescribed Medications ({medications.length})
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
              {medications.map((med, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <strong style={{ color: '#0f172a' }}>{med.name}</strong> • {med.dosage} ({med.time})
                  </div>
                  <button
                    onClick={() => handleRemoveMedication(idx)}
                    style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '2px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Med Inline Form */}
          <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
              <input
                type="text"
                placeholder="Medicine Name"
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }}
              />
              <input
                type="text"
                placeholder="Dosage (e.g. 500mg)"
                value={newMed.dosage}
                onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }}
              />
            </div>
            <button
              onClick={handleAddMedication}
              style={{
                width: '100%',
                padding: '6px',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Plus size={13} />
              <span>Add Medication</span>
            </button>
          </div>

          <button
            onClick={handleSendPrescription}
            style={{
              marginTop: 'auto',
              padding: '10px',
              background: prescriptionSent ? '#059669' : '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <CheckCircle2 size={14} />
            <span>{prescriptionSent ? '✓ E-Prescription Issued' : 'Issue E-Prescription'}</span>
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Blood Pressure</div>
              <strong style={{ fontSize: '15px', color: '#0f172a' }}>124/82 mmHg</strong>
            </div>
            <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Pulse Rate</div>
              <strong style={{ fontSize: '15px', color: '#059669' }}>74 bpm</strong>
            </div>
            <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>SpO2 Oxygen</div>
              <strong style={{ fontSize: '15px', color: '#0284c7' }}>98%</strong>
            </div>
            <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Temperature</div>
              <strong style={{ fontSize: '15px', color: '#0f172a' }}>98.6 °F</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <LiveWebRtcVideoRoom
      callId={callId}
      role="doctor"
      peerName={patientName}
      peerRoleTitle={`Outpatient Token • Patient ID: ${patientId}`}
      onEndCall={handleEndCall}
      sidePanel={sidePanelContent}
    />
  );
}

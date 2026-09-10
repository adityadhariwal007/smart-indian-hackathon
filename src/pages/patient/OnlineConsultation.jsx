import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MessageSquare, FileText, Download, Send, CheckCircle2,
  Stethoscope, Clock, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LiveWebRtcVideoRoom from '../../components/consultation/LiveWebRtcVideoRoom';

export default function OnlineConsultation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const callId = searchParams.get('callId') || 'CALL-ROOM-LIVE';
  const doctorId = searchParams.get('doctorId') || 'aditya';
  const doctorName = searchParams.get('doctorName') || 'Dr. Aditya Dhariwal';

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'rx'
  const [messages, setMessages] = useState([
    {
      sender: 'doctor',
      time: 'Just now',
      text: `Hello ${user?.name || 'Patient'}. I am ${doctorName}. I have your digital health record open on screen. Please let me know your symptoms.`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const [doctorPrescription] = useState({
    diagnosis: 'Acute Consultation Evaluation (Active Encounter)',
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    doctor: `${doctorName} (Consultant Physician)`,
    hospital: 'Government Medical College & Rajindra Hospital, Patiala',
    medications: [
      { name: 'Tab. Paracetamol 650mg', dosage: '1 Tablet SOS (After Meals)', duration: '5 Days' },
      { name: 'Tab. Pantoprazole 40mg', dosage: '1 Tablet OD (Before Breakfast)', duration: '5 Days' },
    ],
    notes: 'Hydrate well (> 2.5L water/day). Avoid heavy exertion. Review if fever persists over 48 hours.',
    rxNumber: `PAT-RX-${Date.now().toString().slice(-6)}`,
  });

  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      sender: 'patient',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputMessage.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
  };

  const handleEndCall = () => {
    navigate('/patient/appointments');
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
      {/* Tab Switcher */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '14px',
        }}
      >
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            border: 'none',
            borderRadius: '9px',
            padding: '7px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'chat' ? '#ffffff' : 'transparent',
            color: activeTab === 'chat' ? '#0f172a' : '#64748b',
            boxShadow: activeTab === 'chat' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <MessageSquare size={14} />
          <span>Consultation Chat</span>
        </button>

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
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, idx) => {
              const isDoctor = msg.sender === 'doctor';
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isDoctor ? 'flex-start' : 'flex-end',
                    maxWidth: '86%',
                    background: isDoctor ? '#f1f5f9' : '#059669',
                    color: isDoctor ? '#0f172a' : '#ffffff',
                    padding: '10px 14px',
                    borderRadius: isDoctor ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                    fontSize: '13px',
                    lineHeight: 1.4,
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 700, opacity: 0.7, marginBottom: '2px' }}>
                    {isDoctor ? doctorName : 'You'} • {msg.time}
                  </div>
                  <div>{msg.text}</div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          <form onSubmit={handleSendMessage} style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type message to doctor..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
              Digital Rx Reference
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>
              {doctorPrescription.rxNumber}
            </div>
            <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
              Issued by {doctorPrescription.doctor}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              Prescribed Medications
            </div>
            {doctorPrescription.medications.map((m, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '6px',
                  fontSize: '12px',
                }}
              >
                <strong style={{ color: '#0f172a' }}>{m.name}</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {m.dosage} • {m.duration}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => alert(`Prescription ${doctorPrescription.rxNumber} downloaded to your records.`)}
            style={{
              marginTop: 'auto',
              padding: '10px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Download size={14} />
            <span>Download Digital Prescription</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <LiveWebRtcVideoRoom
      callId={callId}
      role="patient"
      peerName={doctorName}
      peerRoleTitle="Attending Consultant Physician • GMC Rajindra Hospital"
      onEndCall={handleEndCall}
      sidePanel={sidePanelContent}
    />
  );
}

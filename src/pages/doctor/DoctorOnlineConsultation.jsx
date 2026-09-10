import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp,
  FileText, Activity, ShieldCheck, Clock, Send, Plus, Trash2,
  CheckCircle2, AlertCircle, Stethoscope, User, RefreshCw
} from 'lucide-react';
import { useMediaStream } from '../../hooks/useMediaStream';
import { useAuth } from '../../context/AuthContext';

export default function DoctorOnlineConsultation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Media stream hook for live camera & microphone
  const {
    stream,
    localVideoRef,
    isVideoOff,
    isAudioMuted,
    isScreenSharing,
    permissionError,
    startMedia,
    stopMedia,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
  } = useMediaStream(true);

  // Call timer
  const [callDuration, setCallDuration] = useState(250);
  const [activeTab, setActiveTab] = useState('rx'); // 'rx' | 'vitals' | 'chat'
  const [prescriptionSent, setPrescriptionSent] = useState(false);

  // Patient data
  const patient = {
    name: 'Ramesh Verma',
    age: 54,
    gender: 'Male',
    abhaId: '91-4521-8890-1201',
    phone: '+91-98110-34561',
    token: 'TELE-402',
    history: 'Hypertension (3 yrs), Post-stent evaluation',
    vitals: {
      bp: '138/88 mmHg',
      hr: '76 bpm',
      spo2: '98%',
      weight: '76 kg',
      temp: '98.4 °F'
    }
  };

  // Prescription state
  const [diagnosis, setDiagnosis] = useState('Essential Hypertension (Controlled)');
  const [clinicalNotes, setClinicalNotes] = useState('Patient reports mild exertion fatigue. ECG shows normal sinus rhythm. Adjusted statin dose.');
  const [medications, setMedications] = useState([
    { name: 'Tab. Telmisartan', dosage: '40mg OD', time: 'Morning', duration: '30 Days' },
    { name: 'Tab. Rosuvastatin', dosage: '10mg HS', time: 'Bedtime', duration: '30 Days' },
    { name: 'Tab. Aspirin', dosage: '75mg OD', time: 'After Lunch', duration: '30 Days' }
  ]);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', time: 'Morning', duration: '30 Days' });

  // In-call chat
  const [messages, setMessages] = useState([
    { sender: 'doctor', time: '10:30 AM', text: 'Hello Mr. Ramesh Verma. I am reviewing your recent ECG and vitals.' },
    { sender: 'patient', time: '10:31 AM', text: 'Doctor, the morning dizziness has reduced after the new salt diet.' },
    { sender: 'doctor', time: '10:32 AM', text: 'Excellent. Your blood pressure has improved to 138/88.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!newMed.name.trim()) return;
    setMedications(prev => [...prev, newMed]);
    setNewMed({ name: '', dosage: '', time: 'Morning', duration: '30 Days' });
  };

  const handleRemoveMedication = (idx) => {
    setMedications(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSendPrescription = () => {
    setPrescriptionSent(true);
    setMessages(prev => [
      ...prev,
      {
        sender: 'doctor',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `✓ Digital E-Prescription issued with ${medications.length} medications. Available for instant download.`
      }
    ]);
    setTimeout(() => setPrescriptionSent(false), 4000);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        sender: 'doctor',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: chatInput.trim()
      }
    ]);
    setChatInput('');
  };

  const handleEndCall = () => {
    stopMedia();
    alert(`Consultation with ${patient.name} completed successfully and logged to clinical registry.`);
    navigate('/doctor/appointments');
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* Top Clinical Header */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-primary flex items-center justify-center font-bold">
            <Stethoscope size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-text-primary">Doctor Clinical Teleconsultation</h1>
              <span className="badge badge-success text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Encounter
              </span>
            </div>
            <p className="text-xs text-secondary">
              Dr. Ananya Sharma • Patient: <strong>{patient.name}</strong> ({patient.age}y, {patient.gender}) • Token #{patient.token}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-bg-secondary px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-text-primary">
            <Clock size={14} className="text-primary" />
            <span>{formatTimer(callDuration)}</span>
          </div>

          <button
            onClick={handleEndCall}
            className="btn btn-sm btn-secondary text-xs rounded-xl flex items-center gap-1.5"
          >
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Complete Encounter</span>
          </button>
        </div>
      </div>

      {/* Permission alert if blocked */}
      {permissionError && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-wrap justify-between items-center gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
            <div>
              <strong>Doctor Hardware Notice:</strong> {permissionError}
            </div>
          </div>
          <button
            onClick={startMedia}
            className="btn btn-xs bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1 rounded-lg px-3"
          >
            <RefreshCw size={12} /> Retry Camera Access
          </button>
        </div>
      )}

      {/* Main Grid: Video Stream Room & Side Clinical Pad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Video Room (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="consultation-video-stage">
            {/* Remote Patient Video Feed */}
            <div className="consultation-center-view">
              <div className="text-center space-y-3 z-10">
                <div className="relative inline-block">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
                    alt={patient.name}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-blue-500/80 shadow-2xl mx-auto"
                    style={{ width: '120px', height: '120px', borderRadius: '50%' }}
                  />
                  <span className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-blue-500 border-2 border-slate-900" title="Connected" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{patient.name}</h3>
                  <p className="text-xs text-slate-400">Patiala, Punjab • ABHA: {patient.abhaId}</p>
                </div>

                <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-[11px] text-blue-400 font-medium">
                  <span>Patient audio/video stream online</span>
                </div>
              </div>

              {/* Local Doctor Live WebRTC Feed (Picture-in-Picture) */}
              <div className="consultation-pip-card">
                {/* Live Real Video Feed from Doctor's Hardware Webcam */}
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    display: isVideoOff || !stream ? 'none' : 'block'
                  }}
                />

                {/* Placeholder if camera turned off */}
                {(isVideoOff || !stream) && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 text-center p-2" style={{ height: '100%' }}>
                    <User size={24} className="mb-1 text-slate-500" />
                    <span className="text-[10px] font-semibold">
                      {isVideoOff ? 'Doctor Cam Off' : 'Doctor Stream'}
                    </span>
                  </div>
                )}

                <div className="consultation-pip-badge">
                  Dr. Camera ({isAudioMuted ? 'Muted' : 'Live'})
                </div>
              </div>
            </div>

            {/* Bottom In-Call Doctor Control Bar */}
            <div className="consultation-action-bar">
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={toggleAudio}
                className={`consultation-btn ${isAudioMuted ? 'danger' : ''}`}
                title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isAudioMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Video Camera Toggle */}
              <button
                type="button"
                onClick={toggleVideo}
                className={`consultation-btn ${isVideoOff ? 'danger' : ''}`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
              </button>

              {/* Screen Share Toggle */}
              <button
                type="button"
                onClick={toggleScreenShare}
                className={`consultation-btn ${isScreenSharing ? 'active-tab' : ''}`}
                title={isScreenSharing ? 'Stop Screen Sharing' : 'Share ECG / Medical Chart Screen'}
              >
                <MonitorUp size={18} />
              </button>

              {/* End Encounter Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="consultation-btn danger"
                title="End Video Consultation"
                style={{ marginLeft: '4px' }}
              >
                <PhoneOff size={18} />
              </button>
            </div>
          </div>

          {/* Patient Vitals Quick Strip */}
          <div className="grid grid-cols-4 gap-2">
            <div className="card p-3 bg-white border border-border rounded-xl text-center">
              <span className="text-[11px] text-secondary block font-medium">BP</span>
              <span className="font-bold text-amber-600 text-sm">{patient.vitals.bp}</span>
            </div>
            <div className="card p-3 bg-white border border-border rounded-xl text-center">
              <span className="text-[11px] text-secondary block font-medium">Heart Rate</span>
              <span className="font-bold text-text-primary text-sm">{patient.vitals.hr}</span>
            </div>
            <div className="card p-3 bg-white border border-border rounded-xl text-center">
              <span className="text-[11px] text-secondary block font-medium">SpO2</span>
              <span className="font-bold text-emerald-600 text-sm">{patient.vitals.spo2}</span>
            </div>
            <div className="card p-3 bg-white border border-border rounded-xl text-center">
              <span className="text-[11px] text-secondary block font-medium">Weight</span>
              <span className="font-bold text-text-primary text-sm">{patient.vitals.weight}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Doctor Clinical Chart & E-Prescription Pad (5 cols) */}
        <div className="lg:col-span-5 card bg-white border border-border rounded-3xl shadow-xs flex flex-col h-[560px] overflow-hidden">
          {/* Segmented Tab Bar */}
          <div className="flex border-b border-border bg-bg-secondary p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('rx')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'rx' ? 'bg-white text-primary shadow-xs' : 'text-secondary hover:text-text-primary'
              }`}
            >
              <FileText size={14} /> E-Prescription Pad
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'vitals' ? 'bg-white text-primary shadow-xs' : 'text-secondary hover:text-text-primary'
              }`}
            >
              <Activity size={14} /> Clinical Chart
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'chat' ? 'bg-white text-primary shadow-xs' : 'text-secondary hover:text-text-primary'
              }`}
            >
              <Send size={14} /> Chat
            </button>
          </div>

          {/* Success Banner when prescription sent */}
          {prescriptionSent && (
            <div className="m-3 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>E-Prescription signed & sent to patient device and ABHA registry.</span>
            </div>
          )}

          {/* Tab 1: Interactive E-Prescription Pad */}
          {activeTab === 'rx' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-secondary uppercase block mb-1">
                  Primary Clinical Diagnosis
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="input text-xs w-full py-1.5 font-medium"
                  placeholder="Enter diagnosis..."
                />
              </div>

              {/* Medication List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-secondary uppercase text-[11px]">Prescribed Medicines</span>
                  <span className="text-secondary font-mono">{medications.length} items</span>
                </div>

                <div className="space-y-2">
                  {medications.map((m, idx) => (
                    <div key={idx} className="p-2.5 bg-bg-secondary rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-text-primary">{m.name} {m.dosage}</div>
                        <div className="text-[11px] text-secondary">{m.time} • {m.duration}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveMedication(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove medication"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new medication line */}
                <form onSubmit={handleAddMedication} className="p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Med Name (e.g. Tab Amlodipine)"
                      value={newMed.name}
                      onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                      className="input text-xs py-1"
                    />
                    <input
                      type="text"
                      placeholder="Dose (e.g. 5mg OD)"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      className="input text-xs py-1"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <select
                      value={newMed.time}
                      onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                      className="input text-xs py-1 bg-white"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Bedtime">Bedtime</option>
                      <option value="Twice Daily">Twice Daily</option>
                    </select>

                    <button
                      type="submit"
                      className="btn btn-xs btn-primary flex items-center gap-1 rounded-lg px-2.5 py-1"
                    >
                      <Plus size={12} /> Add Med
                    </button>
                  </div>
                </form>
              </div>

              {/* Clinical Advice */}
              <div>
                <label className="text-[11px] font-semibold text-secondary uppercase block mb-1">
                  Physician Advice & Diet Instructions
                </label>
                <textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  rows={3}
                  className="input text-xs w-full py-2"
                  placeholder="Enter clinical advice..."
                />
              </div>

              {/* Sign & Send Button */}
              <button
                onClick={handleSendPrescription}
                className="btn btn-primary w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShieldCheck size={16} /> Sign & Send E-Prescription to Patient
              </button>
            </div>
          )}

          {/* Tab 2: Clinical History & Records */}
          {activeTab === 'vitals' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-sm text-text-primary mb-1">Medical Background</h4>
                <p className="p-3 bg-bg-secondary rounded-xl text-secondary leading-relaxed">
                  {patient.history}. Patient has been on antihypertensive therapy since 2023. Compliance is regular.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-text-primary">Attached Diagnostic Reports</h4>
                <div className="p-3 bg-bg-secondary rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-bold">12-Lead Resting ECG</div>
                    <div className="text-[11px] text-secondary">Normal Sinus Rhythm • GMC Rajindra Lab</div>
                  </div>
                  <span className="badge badge-success text-[10px]">Normal</span>
                </div>
                <div className="p-3 bg-bg-secondary rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-bold">Lipid Profile & HbA1c</div>
                    <div className="text-[11px] text-secondary">Total Chol: 184 mg/dL • HbA1c: 5.8%</div>
                  </div>
                  <span className="badge badge-primary text-[10px]">Target Achieved</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Chat with Patient */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
              <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'doctor' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'doctor'
                          ? 'bg-primary text-white rounded-br-xs'
                          : 'bg-bg-secondary text-text-primary rounded-bl-xs border border-border'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-secondary mt-1 px-1">{m.time}</span>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              <form onSubmit={handleSendChat} className="pt-3 border-t border-border flex gap-2">
                <input
                  type="text"
                  placeholder="Type message to patient..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="input text-xs flex-1 py-2"
                />
                <button type="submit" className="btn btn-primary btn-sm px-3 rounded-xl">
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

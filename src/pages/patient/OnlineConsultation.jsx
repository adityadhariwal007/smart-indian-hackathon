import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare,
  FileText, ShieldCheck, Clock, Send, Download, AlertCircle,
  Stethoscope, User, RefreshCw, Paperclip, CheckCircle2,
  Maximize2, Minimize2, ChevronRight, Volume2
} from 'lucide-react';
import { useMediaStream } from '../../hooks/useMediaStream';
import { useAuth } from '../../context/AuthContext';

export default function OnlineConsultation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Media stream hook for live camera & microphone
  const {
    stream,
    localVideoRef,
    isVideoOff,
    isAudioMuted,
    isLoading,
    permissionError,
    startMedia,
    stopMedia,
    toggleVideo,
    toggleAudio,
  } = useMediaStream(true);

  // Call timer
  const [callDuration, setCallDuration] = useState(128); // Starts at 2m 8s
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'rx' | 'vitals'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'doctor', time: '10:30 AM', text: 'Hello! I am Dr. Ananya Sharma from GMC Rajindra Hospital. I have your recent ECG on screen.' },
    { sender: 'patient', time: '10:31 AM', text: 'Good morning Doctor. I have had mild tightness in my chest after walking up stairs.' },
    { sender: 'doctor', time: '10:32 AM', text: 'Understood. Let us review your blood pressure and I will prescribe an updated regimen.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [doctorPrescription, setDoctorPrescription] = useState({
    diagnosis: 'Essential Hypertension (Stage 1) - Controlled',
    date: 'Today, 2026',
    doctor: 'Dr. Ananya Sharma (MD, DM Cardiology)',
    hospital: 'Government Medical College & Rajindra Hospital, Patiala',
    medications: [
      { name: 'Tab. Telmisartan 40mg', dosage: '1 Tablet Once Daily (Morning)', duration: '30 Days' },
      { name: 'Tab. Rosuvastatin 10mg', dosage: '1 Tablet at Bedtime', duration: '30 Days' },
      { name: 'Tab. Ecosprin 75mg', dosage: '1 Tablet after Lunch', duration: '30 Days' }
    ],
    notes: 'Reduce dietary sodium (< 2g/day). 30 mins brisk walking. Recheck blood pressure in 2 weeks.',
    rxNumber: 'PAT-RX-2026-8841'
  });

  const chatBottomRef = useRef(null);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      sender: 'patient',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputMessage.trim()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');

    // Simulated doctor response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'doctor',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Thank you for sharing that symptom detail. I have noted it in your digital health record.'
        }
      ]);
    }, 1400);
  };

  const handleEndCall = () => {
    stopMedia();
    alert('Online consultation concluded. Your digital prescription is saved to your patient records.');
    navigate('/patient/appointments');
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* Top Header Information */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-primary flex items-center justify-center font-bold">
            <Stethoscope size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-text-primary">Teleconsultation Room</h1>
              <span className="badge badge-success text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live HD
              </span>
            </div>
            <p className="text-xs text-secondary">
              Dr. Ananya Sharma • GMC & Rajindra Hospital, Patiala • Token #TELE-402
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-bg-secondary px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-text-primary">
            <Clock size={14} className="text-primary" />
            <span>{formatTimer(callDuration)}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
            <ShieldCheck size={14} />
            <span>ABHA Encrypted</span>
          </div>
        </div>
      </div>

      {/* Camera/Mic Permission Notification Alert (if blocked) */}
      {permissionError && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-wrap justify-between items-center gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
            <div>
              <strong>Hardware Access Notice:</strong> {permissionError}
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

      {/* Main Grid: Video Stream Room & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Video Room (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="consultation-video-stage">
            {/* Remote Doctor Stream Display (Simulated Clinical Doctor Stream) */}
            <div className="consultation-center-view">
              <div className="text-center space-y-3 z-10">
                <div className="relative inline-block">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
                    alt="Dr. Ananya Sharma - Consultant Cardiologist at GMC Rajindra Hospital"
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-emerald-500/80 shadow-2xl mx-auto"
                    style={{ width: '120px', height: '120px', borderRadius: '50%' }}
                  />
                  <span className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Connected" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Dr. Ananya Sharma</h3>
                  <p className="text-xs text-slate-400">Consultant Cardiologist • Rajindra Hospital</p>
                </div>

                <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-[11px] text-emerald-400 font-medium">
                  <Volume2 size={13} className="animate-pulse" />
                  <span>Doctor speaking • Audio connected</span>
                </div>
              </div>

              {/* Local Patient Live WebRTC Feed (Picture-in-Picture) */}
              <div className="consultation-pip-card">
                {/* Live Real Video Feed from client hardware */}
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

                {/* Placeholder if camera turned off or no permission */}
                {(isVideoOff || !stream) && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 text-center p-2" style={{ height: '100%' }}>
                    <User size={24} className="mb-1 text-slate-500" />
                    <span className="text-[10px] font-semibold">
                      {isVideoOff ? 'Camera Paused' : 'Patient Feed'}
                    </span>
                  </div>
                )}

                {/* Overlay tag */}
                <div className="consultation-pip-badge">
                  You ({isAudioMuted ? 'Muted' : 'Mic On'})
                </div>
              </div>
            </div>

            {/* Bottom In-Call Control Bar */}
            <div className="consultation-action-bar">
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={toggleAudio}
                className={`consultation-btn ${isAudioMuted ? 'danger' : ''}`}
                title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
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

              {/* Chat Toggle */}
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`consultation-btn ${activeTab === 'chat' ? 'active-tab' : ''}`}
                title="Open Chat"
              >
                <MessageSquare size={18} />
              </button>

              {/* Prescription Toggle */}
              <button
                type="button"
                onClick={() => setActiveTab('rx')}
                className={`consultation-btn ${activeTab === 'rx' ? 'active-tab' : ''}`}
                title="View Prescription"
              >
                <FileText size={18} />
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="consultation-btn danger"
                title="End Consultation"
                style={{ marginLeft: '4px' }}
              >
                <PhoneOff size={18} />
              </button>
            </div>
          </div>

          {/* Quick Action Clinical Strip below Video */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-3 bg-white border border-border rounded-xl text-center">
              <span className="text-[11px] text-secondary block font-medium">Patient Vitals</span>
              <span className="font-bold text-text-primary text-sm">BP 128/84 • HR 72</span>
            </div>
            <div className="card p-3 bg-white border border-border rounded-xl text-center">
              <span className="text-[11px] text-secondary block font-medium">Consultation Fee</span>
              <span className="font-bold text-primary text-sm">₹200 (Govt OPD)</span>
            </div>
            <div className="card p-3 bg-white border border-border rounded-xl text-center">
              <span className="text-[11px] text-secondary block font-medium">Digital Prescription</span>
              <span className="font-bold text-emerald-600 text-sm">3 Meds Issued</span>
            </div>
          </div>
        </div>

        {/* Right Column: In-Call Drawer (Chat / Prescription / Vitals) */}
        <div className="card bg-white border border-border rounded-3xl shadow-xs flex flex-col h-[560px] overflow-hidden">
          {/* Segmented Tab Bar */}
          <div className="flex border-b border-border bg-bg-secondary p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'chat' ? 'bg-white text-primary shadow-xs' : 'text-secondary hover:text-text-primary'
              }`}
            >
              <MessageSquare size={14} /> Chat
            </button>
            <button
              onClick={() => setActiveTab('rx')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'rx' ? 'bg-white text-primary shadow-xs' : 'text-secondary hover:text-text-primary'
              }`}
            >
              <FileText size={14} /> Prescription
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'vitals' ? 'bg-white text-primary shadow-xs' : 'text-secondary hover:text-text-primary'
              }`}
            >
              <User size={14} /> Medical Profile
            </button>
          </div>

          {/* Tab 1: Live Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
              <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'patient' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'patient'
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

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-border flex gap-2">
                <input
                  type="text"
                  placeholder="Type symptoms or question for doctor..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="input text-xs flex-1 py-2"
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-3 rounded-xl"
                  title="Send Message"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Live Digital Prescription */}
          {activeTab === 'rx' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-border">
                <div>
                  <h3 className="font-bold text-sm text-text-primary">E-Prescription (ABDM Valid)</h3>
                  <p className="text-[11px] text-secondary font-mono">Rx ID: {doctorPrescription.rxNumber}</p>
                </div>
                <button
                  onClick={() => alert('Digital Prescription downloaded in PDF format.')}
                  className="btn btn-xs btn-secondary flex items-center gap-1 rounded-lg"
                >
                  <Download size={12} /> Download PDF
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-secondary font-semibold uppercase">Clinical Diagnosis</span>
                <div className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900">
                  {doctorPrescription.diagnosis}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] text-secondary font-semibold uppercase">Prescribed Medications</span>
                <div className="space-y-2">
                  {doctorPrescription.medications.map((med, i) => (
                    <div key={i} className="p-2.5 rounded-xl border border-border bg-card text-xs space-y-0.5">
                      <div className="font-bold text-text-primary">{med.name}</div>
                      <div className="text-secondary text-[11px]">{med.dosage} • {med.duration}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-secondary font-semibold uppercase">Dietary & Lifestyle Advice</span>
                <p className="text-xs text-slate-700 bg-bg-secondary p-2.5 rounded-xl leading-relaxed">
                  {doctorPrescription.notes}
                </p>
              </div>

              <div className="text-[11px] text-secondary pt-2 border-t border-border flex items-center justify-between">
                <span>Signed Digitally by: {doctorPrescription.doctor}</span>
                <CheckCircle2 size={14} className="text-emerald-600" />
              </div>
            </div>
          )}

          {/* Tab 3: Patient Vitals & Clinical History */}
          {activeTab === 'vitals' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-text-primary">Recorded Clinical Vitals</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-bg-secondary rounded-xl">
                    <span className="text-secondary block text-[11px]">Blood Pressure</span>
                    <span className="font-bold text-primary text-sm">128 / 84 mmHg</span>
                  </div>
                  <div className="p-2.5 bg-bg-secondary rounded-xl">
                    <span className="text-secondary block text-[11px]">Pulse Heart Rate</span>
                    <span className="font-bold text-text-primary text-sm">72 bpm</span>
                  </div>
                  <div className="p-2.5 bg-bg-secondary rounded-xl">
                    <span className="text-secondary block text-[11px]">Blood Oxygen (SpO2)</span>
                    <span className="font-bold text-emerald-600 text-sm">99%</span>
                  </div>
                  <div className="p-2.5 bg-bg-secondary rounded-xl">
                    <span className="text-secondary block text-[11px]">Body Temperature</span>
                    <span className="font-bold text-text-primary text-sm">98.4 °F</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-secondary uppercase">Allergies & Pre-existing Conditions</h4>
                <div className="p-2.5 bg-bg-secondary rounded-xl text-xs space-y-1">
                  <div><strong>Allergies:</strong> No drug allergies recorded</div>
                  <div><strong>Pre-existing:</strong> Mild hypertension (diagnosed 2024)</div>
                  <div><strong>ABHA ID:</strong> 91-4521-8890-1201</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

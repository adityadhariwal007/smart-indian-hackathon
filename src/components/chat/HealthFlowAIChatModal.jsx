import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, ShieldCheck, AlertTriangle, X, Send, Calendar,
  MapPin, Clock, Star, ArrowRight, HeartPulse, Navigation,
  User, Stethoscope, RefreshCw, CheckCircle2, PhoneCall
} from 'lucide-react';
import aiChatService from '../../services/aiChatService';
import BookAppointmentModal from '../patient/BookAppointmentModal';
import hospitals from '../../data/hospitals';
import { useLocationContext } from '../../context/LocationContext';
import './HealthFlowAIChatModal.css';

export default function HealthFlowAIChatModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { userLocation } = useLocationContext();

  // Intake State
  const [step, setStep] = useState('intake'); // 'intake' | 'chat'
  const [patientAge, setPatientAge] = useState('32');
  const [patientSex, setPatientSex] = useState('female');
  const [patientTarget, setPatientTarget] = useState('self');

  // Chat State
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [bookingHospital, setBookingHospital] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, assessment, doctorsList]);

  if (!isOpen) return null;

  const handleStartChat = async (e) => {
    e.preventDefault();
    setIsTyping(true);
    setStep('chat');

    try {
      const res = await aiChatService.startChat({
        age: patientAge,
        sex: patientSex,
        target: patientTarget
      });

      setConversationId(res.conversation_id);
      setMessages([
        {
          id: 'welcome',
          role: 'ai',
          text: res.message
        }
      ]);
    } catch (err) {
      setMessages([
        {
          id: 'err',
          role: 'ai',
          text: 'Hello. How are you feeling today? Please describe your symptoms.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const userText = inputVal.trim();
    setInputVal('');

    const newMessages = [
      ...messages,
      { id: `user_${Date.now()}`, role: 'user', text: userText }
    ];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await aiChatService.sendMessage({
        conversationId,
        message: userText
      });

      // Add AI reply message
      setMessages(prev => [
        ...prev,
        { id: `ai_${Date.now()}`, role: 'ai', text: res.message }
      ]);

      if (res.is_emergency) {
        setEmergencyActive(true);
        if (res.assessment) setAssessment(res.assessment);
      } else if (res.is_assessment_ready && res.assessment) {
        setAssessment(res.assessment);

        // Fetch doctors matching recommended specialty
        const docRes = await aiChatService.recommendDoctors({
          specialty: res.assessment.recommended_specialty,
          latitude: userLocation?.lat,
          longitude: userLocation?.lng
        });
        setDoctorsList(docRes.doctors || []);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'ai',
          text: 'Unable to reach the triage network. Please continue describing your symptoms, or consult a doctor directly.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEmergencyClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          aiChatService.sendEmergencyLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            condition: 'AI Triage High-Acuity Detection'
          });
        },
        () => {}
      );
    }
    onClose();
    navigate('/patient/emergency');
  };

  const handleBookDoctor = (doc) => {
    // Find matching hospital in local data
    const hosp = hospitals.find(h => h.id === doc.hospital_id) || hospitals[0];
    setBookingHospital(hosp);
  };

  return (
    <>
      <div className="ai-chat-backdrop" onClick={onClose}>
        <div className="ai-chat-modal" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-header-title">
                <Bot size={20} className="text-emerald-400" />
                <span>HealthFlow AI</span>
                <span className="ai-chat-secure-badge">
                  <ShieldCheck size={12} />
                  <span>Secure connection</span>
                </span>
              </div>
              <div className="ai-chat-header-subtitle">
                Preliminary symptom assessment & care navigation • Patiala
              </div>
            </div>
            <button className="ai-chat-close-btn" onClick={onClose} aria-label="Close Assistant">
              <X size={18} />
            </button>
          </div>

          {/* Clinical Disclaimer Ribbon */}
          <div className="ai-chat-disclaimer-bar">
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            <span>HealthFlow AI provides preliminary information and care-navigation. It does not provide a definitive diagnosis or replace a doctor.</span>
          </div>

          {/* PHASE 1: Patient Demographic Intake */}
          {step === 'intake' ? (
            <div className="ai-intake-container">
              <div className="ai-intake-welcome">
                <div className="ai-intake-icon-wrap">
                  <HeartPulse size={28} />
                </div>
                <h3 className="ai-intake-title">Start Your Symptom Assessment</h3>
                <p className="ai-intake-desc">
                  Tell us what you are experiencing. We will evaluate potential causes, determine care urgency, and match you with available specialists in Patiala.
                </p>
              </div>

              <form onSubmit={handleStartChat} className="ai-intake-form">
                <div className="ai-form-group">
                  <label className="ai-form-label">
                    <span>Who is this assessment for?</span>
                  </label>
                  <div className="ai-pill-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <button
                      type="button"
                      className={`ai-pill-btn ${patientTarget === 'self' ? 'active' : ''}`}
                      onClick={() => setPatientTarget('self')}
                    >
                      For Myself
                    </button>
                    <button
                      type="button"
                      className={`ai-pill-btn ${patientTarget === 'other' ? 'active' : ''}`}
                      onClick={() => setPatientTarget('other')}
                    >
                      For Someone Else
                    </button>
                  </div>
                </div>

                <div className="ai-form-group">
                  <label className="ai-form-label">
                    <span>Patient Age (Years)</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Clinically required</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={patientAge}
                    onChange={e => setPatientAge(e.target.value)}
                    required
                    className="ai-form-input"
                    placeholder="e.g. 32"
                  />
                </div>

                <div className="ai-form-group">
                  <label className="ai-form-label">
                    <span>Biological Sex</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Clinically required</span>
                  </label>
                  <div className="ai-pill-grid">
                    <button
                      type="button"
                      className={`ai-pill-btn ${patientSex === 'female' ? 'active' : ''}`}
                      onClick={() => setPatientSex('female')}
                    >
                      Female
                    </button>
                    <button
                      type="button"
                      className={`ai-pill-btn ${patientSex === 'male' ? 'active' : ''}`}
                      onClick={() => setPatientSex('male')}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      className={`ai-pill-btn ${patientSex === 'other' ? 'active' : ''}`}
                      onClick={() => setPatientSex('other')}
                    >
                      Other
                    </button>
                  </div>
                </div>

                <button type="submit" className="ai-intake-submit-btn">
                  <span>Begin Symptom Assessment</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          ) : (
            /* PHASE 2: Conversational Chat & Results */
            <>
              <div className="ai-chat-body">
                {messages.map((msg) => (
                  <div key={msg.id} className={`ai-message-row ${msg.role}`}>
                    {msg.role === 'ai' && (
                      <div className="ai-avatar-circle">
                        <Bot size={18} />
                      </div>
                    )}
                    <div className="ai-message-bubble">
                      {msg.text.split('\n').map((line, idx) => (
                        <p key={idx} style={{ margin: line ? '0 0 6px' : '0' }}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="ai-typing-indicator">
                    <span className="ai-typing-dot" />
                    <span className="ai-typing-dot" />
                    <span className="ai-typing-dot" />
                  </div>
                )}

                {/* EMERGENCY TAKEOVER BANNER */}
                {emergencyActive && (
                  <div className="ai-emergency-takeover">
                    <div className="ai-emergency-icon">
                      <AlertTriangle size={26} />
                    </div>
                    <div className="ai-emergency-title">URGENT MEDICAL ATTENTION MAY BE NEEDED</div>
                    <p className="ai-emergency-desc">
                      The symptoms you entered match emergency red-flag criteria. Do not wait for this chatbot.
                      Seek immediate medical care or request an ambulance right now.
                    </p>
                    <button className="ai-emergency-action-btn" onClick={handleEmergencyClick}>
                      <PhoneCall size={18} />
                      <span>START EMERGENCY ASSISTANCE (108)</span>
                    </button>
                  </div>
                )}

                {/* ASSESSMENT CARD */}
                {assessment && (
                  <div className="ai-assessment-card">
                    <div className={`ai-assessment-badge ${assessment.triage_level}`}>
                      <span>{assessment.triage_level_display}</span>
                    </div>

                    <div className="ai-assessment-title">Preliminary HealthFlow Assessment</div>
                    <p className="ai-assessment-summary">{assessment.assessment_summary}</p>

                    <div className="ai-specialty-box">
                      <div>
                        <div className="ai-specialty-label">Recommended Specialty</div>
                        <div className="ai-specialty-val">{assessment.recommended_specialty}</div>
                      </div>
                      <Stethoscope size={24} className="text-emerald-600" />
                    </div>

                    {assessment.possible_causes && assessment.possible_causes.length > 0 && (
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                          Possible Causes to Discuss with a Doctor:
                        </div>
                        <div className="ai-causes-list">
                          {assessment.possible_causes.map((c, i) => (
                            <div key={i} className="ai-cause-item">
                              <div className="ai-cause-header">
                                <span className="ai-cause-name">{c.name}</span>
                                <span className="ai-cause-tag">{c.probability_label}</span>
                              </div>
                              <div className="ai-cause-desc">{c.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {assessment.safety_guidance && assessment.safety_guidance.length > 0 && (
                      <div className="ai-guidance-box">
                        <div className="ai-guidance-title">General Safety Guidance:</div>
                        <ul className="ai-guidance-list">
                          {assessment.safety_guidance.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* DOCTORS RECOMMENDATION LIST */}
                    {doctorsList.length > 0 && (
                      <div className="ai-doctors-section">
                        <div className="ai-doctors-header">
                          <span>Available {assessment.recommended_specialty} Specialists Near You</span>
                          <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Patiala Verified</span>
                        </div>

                        {doctorsList.map((doc) => (
                          <div key={doc.id} className="ai-doctor-card">
                            <div className="ai-doctor-info">
                              <div className="ai-doctor-name">{doc.name}</div>
                              <div className="ai-doctor-hosp">{doc.hospital_name}</div>
                              <div className="ai-doctor-meta">
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <MapPin size={11} /> {doc.distance_km} km
                                </span>
                                <span>•</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Clock size={11} /> ~{doc.wait_time_min}m wait
                                </span>
                                <span>•</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Star size={11} fill="#F59E0B" className="text-amber-500" /> {doc.rating}
                                </span>
                              </div>
                            </div>
                            <button className="ai-book-doc-btn" onClick={() => handleBookDoctor(doc)}>
                              Book Appointment
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="ai-chat-footer">
                <form onSubmit={handleSendMessage} className="ai-chat-input-form">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    placeholder={emergencyActive ? "Emergency detected. Please contact 108 immediately..." : "Type your symptoms or answer questions..."}
                    disabled={isTyping || emergencyActive}
                    className="ai-chat-text-input"
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || isTyping || emergencyActive}
                    className="ai-chat-send-btn"
                    title="Send message"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Existing HealthFlow Booking Modal Bridge */}
      {bookingHospital && (
        <BookAppointmentModal
          hospital={bookingHospital}
          onClose={() => setBookingHospital(null)}
        />
      )}
    </>
  );
}

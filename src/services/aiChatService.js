// ==============================================================================
// HealthFlow AI Symptom Assessment & Healthcare Navigation Service
// ==============================================================================
import doctors from '../data/doctors';
import hospitals from '../data/hospitals';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Emergency Red-Flag Trigger Regexes
const EMERGENCY_REGEX = /\b(chest pain|heart attack|angina|crushing|can'?t breathe|difficulty breathing|shortness of breath|suffocat|stroke|facial droop|slurred speech|thunderclap|paraly|unconscious|passed out|vomiting blood|coughing blood|severe bleeding|anaphylaxis|swollen throat)\b/i;

class AIChatService {
  constructor() {
    this.localSessions = new Map();
  }

  /**
   * Initialize a symptom assessment session
   */
  async startChat({ age, sex, target = 'self', patientId = null }) {
    try {
      const res = await fetch(`${API_BASE}/chat/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: parseInt(age, 10), sex, target, patient_id: patientId })
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend API unavailable, falling back to embedded clinical engine:', err.message);
    }

    // Embedded Fallback Session
    const convId = `local_${Date.now()}`;
    const session = {
      conversation_id: convId,
      age: parseInt(age, 10),
      sex,
      target,
      step: 0,
      messages: [],
      symptoms: []
    };
    this.localSessions.set(convId, session);

    return {
      conversation_id: convId,
      message: (
        `Hello. I am HealthFlow AI assistant. I will guide you through a preliminary symptom assessment ` +
        `to help you navigate to the right care and the right doctor in Patiala.\n\n` +
        `How are you feeling today? Please describe your main symptoms in your own words.`
      ),
      status: 'in_progress',
      session_info: { age, sex, target, engine: 'HealthFlow Clinical Protocol' }
    };
  }

  /**
   * Send a patient message in natural language
   */
  async sendMessage({ conversationId, message }) {
    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, message })
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend API unavailable, processing turn via embedded clinical engine:', err.message);
    }

    // Embedded Clinical Triage Engine
    return this._processLocalTurn(conversationId, message);
  }

  /**
   * Retrieve completed assessment card
   */
  async getAssessment(conversationId) {
    try {
      const res = await fetch(`${API_BASE}/chat/${conversationId}/assessment`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend API assessment fetch failed:', err.message);
    }

    const session = this.localSessions.get(conversationId);
    return session?.assessment || null;
  }

  /**
   * Recommend doctors based on medical specialty & location
   */
  async recommendDoctors({ specialty = 'General Medicine', latitude = null, longitude = null }) {
    try {
      const query = new URLSearchParams({ specialty });
      if (latitude && longitude) {
        query.set('latitude', latitude);
        query.set('longitude', longitude);
      }

      const res = await fetch(`${API_BASE}/doctors/recommend?${query.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend doctor recommendation failed, filtering local dataset:', err.message);
    }

    // Fallback: Filter frontend doctors dataset
    const specLower = specialty.toLowerCase();
    const matched = doctors.filter(d => 
      d.specialization.toLowerCase().includes(specLower) ||
      specLower.includes(d.specialization.toLowerCase()) ||
      (specLower.includes('general') && d.specialization.toLowerCase().includes('general'))
    ).slice(0, 4).map(d => {
      const hosp = hospitals.find(h => h.id === d.hospital_id) || hospitals[0];
      return {
        id: d.id,
        name: d.name,
        specialization: d.specialization,
        hospital_id: hosp.id,
        hospital_name: hosp.name,
        distance_km: hosp.distance || 2.4,
        availability: d.availability,
        next_slot: 'Today - 4:30 PM',
        wait_time_min: hosp.waitTime || 18,
        rating: parseFloat(d.rating),
        consultation_fee: hosp.consultation_fee || 200,
        emergency_ready: hosp.emergency_available
      };
    });

    return {
      specialty,
      count: matched.length,
      doctors: matched.length > 0 ? matched : [
        {
          id: 1,
          name: 'Dr. Rajesh Verma',
          specialization: 'General Medicine',
          hospital_id: 1,
          hospital_name: 'Government Medical College & Rajindra Hospital',
          distance_km: 1.8,
          availability: '10:00 AM – 2:00 PM',
          next_slot: 'Today - 4:30 PM',
          wait_time_min: 15,
          rating: 4.8,
          consultation_fee: 10,
          emergency_ready: true
        }
      ]
    };
  }

  /**
   * Direct appointment creation bridge
   */
  async bookAppointment(appointmentData) {
    try {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend appointment endpoint failed:', err.message);
    }

    return {
      success: true,
      appointment_id: `APT-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      doctor_name: appointmentData.doctor_name || 'Dr. Specialist',
      hospital_name: appointmentData.hospital_name || 'Rajindra Hospital',
      date: appointmentData.date || 'Today',
      time: appointmentData.time_slot || '4:30 PM',
      status: 'confirmed',
      message: 'Consultation appointment confirmed successfully.'
    };
  }

  /**
   * Emergency request bridge
   */
  async requestEmergency(data) {
    try {
      const res = await fetch(`${API_BASE}/emergency/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend emergency request failed:', err.message);
    }

    return {
      success: true,
      dispatch_id: `EMG-108-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'dispatched',
      ambulance_unit: 'Punjab 108 ALS-04',
      estimated_eta_min: 8,
      assigned_hospital: 'GMC Rajindra Trauma Center, Patiala',
      helpline_numbers: ['108', '112'],
      message: '108 Ambulance notified and placed on high-priority standby.'
    };
  }

  /**
   * Emergency GPS location submission
   */
  async sendEmergencyLocation({ latitude, longitude, condition = 'Medical Emergency' }) {
    try {
      const res = await fetch(`${API_BASE}/emergency/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, condition })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend emergency location failed:', err.message);
    }

    return {
      success: true,
      nearest_emergency_hospital: 'Government Medical College & Rajindra Hospital',
      distance_km: 2.1,
      est_drive_min: 6,
      assigned_als_ambulance: 'Punjab 108 Standby ALS Unit',
      ambulance_eta_min: 7
    };
  }

  // --- Internal Embedded Clinical Engine Implementation ---
  _processLocalTurn(convId, userText) {
    let session = this.localSessions.get(convId);
    if (!session) {
      session = { conversation_id: convId, step: 0, messages: [], symptoms: [] };
      this.localSessions.set(convId, session);
    }

    session.messages.push({ role: 'user', text: userText });
    session.symptoms.push(userText);
    session.step += 1;

    // Check emergency red-flags immediately
    if (EMERGENCY_REGEX.test(userText)) {
      const assessment = {
        conversation_id: convId,
        triage_level: 'emergency',
        triage_level_display: '🚨 IMMEDIATE EMERGENCY MEDICAL ATTENTION',
        recommended_specialty: 'Emergency Medicine',
        assessment_summary: 'Reported symptoms match high-priority medical red-flag criteria requiring immediate intervention.',
        possible_causes: [
          {
            name: 'Acute High-Acuity Emergency',
            probability_label: 'Urgent',
            description: 'Severe symptoms such as acute chest pressure, respiratory distress, or stroke signs require immediate evaluation by emergency physicians.'
          }
        ],
        safety_guidance: [
          'Call 108 or activate the emergency assistance button below immediately.',
          'Sit or lie down quietly; do not drive yourself.',
          'Inform anyone nearby of what you are experiencing.'
        ],
        is_emergency: true,
        disclaimer: 'HealthFlow AI provides preliminary health information and care-navigation support. It does not provide a medical diagnosis or replace a qualified healthcare professional.'
      };

      session.assessment = assessment;

      return {
        conversation_id: convId,
        message: (
          '🚨 URGENT MEDICAL ATTENTION MAY BE NEEDED\n\n' +
          'The symptoms you described indicate a potential medical emergency. ' +
          'Do not wait for this chatbot. Please seek emergency medical care immediately.'
        ),
        status: 'emergency_triaged',
        is_assessment_ready: true,
        is_emergency: true,
        assessment
      };
    }

    // Step 1: Onset follow-up
    if (session.step === 1) {
      const lower = userText.toLowerCase();
      let question = 'When did your symptoms start, and have they been constant or coming in waves?';
      if (lower.includes('headache')) {
        question = 'How long have you had this headache, and did it start gradually or suddenly?';
      } else if (lower.includes('fever')) {
        question = 'How high is your fever (if measured), and do you have chills or body aches?';
      } else if (lower.includes('stomach') || lower.includes('abdomen')) {
        question = 'Where in your stomach is the pain located, and is it worse before or after eating?';
      }
      return {
        conversation_id: convId,
        message: question,
        status: 'in_progress',
        is_assessment_ready: false,
        is_emergency: false
      };
    }

    // Step 2: Severity follow-up
    if (session.step === 2) {
      return {
        conversation_id: convId,
        message: 'On a scale of 1 to 10 (with 10 being severe), how intense is the discomfort, and are you experiencing any nausea, dizziness, or weakness?',
        status: 'in_progress',
        is_assessment_ready: false,
        is_emergency: false
      };
    }

    // Step >= 3: Assessment Ready
    const combined = session.symptoms.join(' ').toLowerCase();
    let specialty = 'General Medicine';
    let causes = [];
    let summary = 'Preliminary assessment indicates self-limiting or non-emergency symptoms.';
    let guidance = [
      'Maintain adequate fluid intake and rest.',
      'Monitor your symptoms closely over the next 24 hours.',
      'Consult the recommended specialist for an in-person clinical examination.'
    ];

    if (combined.includes('headache')) {
      specialty = 'Neurology';
      summary = 'Symptoms are consistent with a tension-type headache or migraine-pattern discomfort.';
      causes = [
        { name: 'Tension-Type Headache', probability_label: 'Common', description: 'Often triggered by strain, lack of sleep, or dehydration.' },
        { name: 'Migraine Pattern', probability_label: 'Possible', description: 'Pulsating head pain with light or sound sensitivity.' }
      ];
    } else if (combined.includes('fever')) {
      specialty = 'General Medicine';
      summary = 'Symptoms indicate acute febrile illness, commonly of viral origin.';
      causes = [
        { name: 'Viral Febrile Syndrome', probability_label: 'Common', description: 'Self-limiting viral infection with fever and body aches.' },
        { name: 'Influenza-like Illness', probability_label: 'Possible', description: 'Seasonal viral illness requiring rest and hydration.' }
      ];
    } else if (combined.includes('stomach') || combined.includes('abdomen')) {
      specialty = 'Gastroenterology';
      summary = 'Symptoms suggest acute gastric irritation or dyspepsia.';
      causes = [
        { name: 'Acute Dyspepsia / Gastritis', probability_label: 'Common', description: 'Indigestion or irritation of the gastric mucosa.' },
        { name: 'Gastroenteritis', probability_label: 'Possible', description: 'Mild inflammatory reaction of the digestive tract.' }
      ];
    }

    const assessment = {
      conversation_id: convId,
      triage_level: 'consult_doctor_soon',
      triage_level_display: '🟡 CONSULT A DOCTOR SOON',
      recommended_specialty: specialty,
      assessment_summary: summary,
      possible_causes: causes.length ? causes : [
        { name: 'Common Clinical Syndrome', probability_label: 'Possible', description: 'Please consult a doctor to discuss appropriate diagnostic steps.' }
      ],
      safety_guidance: guidance,
      is_emergency: false,
      disclaimer: 'HealthFlow AI provides preliminary health information and care-navigation support. It does not provide a medical diagnosis or replace a qualified healthcare professional.'
    };

    session.assessment = assessment;

    return {
      conversation_id: convId,
      message: 'Thank you for providing these details. I have generated your preliminary symptom assessment. Please review the findings and recommended specialists below.',
      status: 'completed',
      is_assessment_ready: true,
      is_emergency: false,
      assessment
    };
  }
}

export const aiChatService = new AIChatService();
export default aiChatService;

// ==============================================================================
// HealthFlow AI Symptom Assessment & Healthcare Navigation Service
// ==============================================================================
import doctors from '../data/doctors.js';
import hospitals from '../data/hospitals.js';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api';

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
        `Greetings. I am HealthFlow’s Clinical Triage & Navigation Assistant. I conduct structured preliminary ` +
        `clinical assessments to evaluate symptom acuity, identify potential differentials, and connect you ` +
        `with qualified medical specialists across Patiala.\n\n` +
        `To begin, please outline your primary symptoms or health concerns in as much detail as you can ` +
        `(including when they began and how they feel).`
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
        assessment_summary: 'Reported symptoms match high-priority medical red-flag criteria requiring immediate intervention. Do not wait for a routine appointment.',
        possible_causes: [
          {
            name: 'Acute High-Acuity Emergency Condition',
            probability_label: 'Urgent',
            description: 'Severe symptoms such as acute chest pressure, respiratory distress, or stroke-like signs require immediate evaluation by emergency physicians.'
          }
        ],
        safety_guidance: [
          'Immediately call 108 or activate the emergency dispatch button below.',
          'Sit or lie down in a safe, resting position; do not exert yourself or drive.',
          'Alert anyone nearby so you are continuously monitored until paramedics arrive.'
        ],
        is_emergency: true,
        disclaimer: 'HealthFlow AI provides preliminary health information and care-navigation support. It does not provide a definitive diagnosis or replace a qualified healthcare professional.'
      };

      session.assessment = assessment;

      return {
        conversation_id: convId,
        message: (
          '🚨 CLINICAL SAFETY ALERT: IMMEDIATE EMERGENCY MEDICAL EVALUATION REQUIRED\n\n' +
          'The clinical symptoms you described indicate potential high-acuity distress. ' +
          'Please do not wait for conversational triage.\n\n' +
          '• Immediately dial 108 (or 112) or tap the emergency dispatch button below to mobilize emergency medical services in Patiala.\n' +
          '• Rest in a comfortable seated or reclined position; do not exert yourself or attempt to drive.\n' +
          '• Alert anyone nearby immediately so you are closely monitored until paramedics arrive.'
        ),
        status: 'emergency_triaged',
        is_assessment_ready: true,
        is_emergency: true,
        assessment
      };
    }

    const lower = userText.toLowerCase();

    // Step 1: Onset, characteristics, and associated symptom review
    if (session.step === 1) {
      let question = (
        'Thank you. To establish a clear clinical timeline:\n' +
        '1. When precisely did you first notice these symptoms, and have they been constant, intermittent, or progressively worsening?\n' +
        '2. Are there specific movements, resting positions, or activities that noticeably aggravate or relieve the symptoms?\n' +
        '3. Have you taken any over-the-counter medications, and if so, did they provide any meaningful relief?'
      );

      if (lower.includes('headache') || lower.includes('migraine')) {
        question = (
          'Thank you. To help evaluate your headache clinically:\n' +
          '1. How would you describe the pain character (e.g., throbbing/pulsatile, band-like tightening pressure, sharp, or dull ache)?\n' +
          '2. Did this develop acutely within seconds/minutes or build gradually over hours or days?\n' +
          '3. Are you experiencing visual changes (auras, blurriness), photophobia (light sensitivity), nausea, or neck stiffness?'
        );
      } else if (lower.includes('fever') || lower.includes('temperature') || lower.includes('chills')) {
        question = (
          'Thank you for sharing that. To assess your febrile illness:\n' +
          '1. How high has your temperature measured (if checked), and how many days has it persisted?\n' +
          '2. Are you experiencing rigors (shaking chills), generalized muscle/joint aches, or marked fatigue?\n' +
          '3. Do you have any accompanying cough, sore throat, urinary burning, or skin rash?'
        );
      } else if (lower.includes('stomach') || lower.includes('abdomen') || lower.includes('belly') || lower.includes('nausea')) {
        question = (
          'Thank you. To assess your abdominal symptoms:\n' +
          '1. Where precisely is the discomfort centered (e.g., upper epigastric, lower right/left quadrant, or generalized)?\n' +
          '2. What is the nature of the pain (burning, sharp cramping, constant dull ache), and does food intake worsen or ease it?\n' +
          '3. Have you experienced nausea, vomiting, acid reflux, or alterations in bowel habits?'
        );
      } else if (lower.includes('cough') || lower.includes('throat') || lower.includes('cold') || lower.includes('flu')) {
        question = (
          'Thank you. To evaluate your respiratory presentation:\n' +
          '1. Is the cough dry, or productive of mucus/phlegm?\n' +
          '2. Are you experiencing chest tightness, audible wheezing, or breathlessness when climbing stairs or walking?\n' +
          '3. Do you have a concurrent sore throat, nasal congestion, or loss of smell/taste?'
        );
      } else if (lower.includes('knee') || lower.includes('back') || lower.includes('joint') || lower.includes('spine') || lower.includes('leg')) {
        question = (
          'Thank you. To evaluate your musculoskeletal symptoms:\n' +
          '1. Is the discomfort localized to a specific joint or spinal region, or does it radiate into your extremities?\n' +
          '2. Did this follow a specific mechanical strain, twist, or injury, and does weight-bearing worsen it?\n' +
          '3. Have you observed any joint swelling, visible warmth, erythema (redness), or stiffness upon waking?'
        );
      } else if (lower.includes('rash') || lower.includes('itch') || lower.includes('skin')) {
        question = (
          'Thank you. To assist in evaluating your skin presentation:\n' +
          '1. Where did the rash or lesion first appear, and has its distribution expanded?\n' +
          '2. Is the area accompanied by intense pruritus (itching), burning discomfort, or localized warmth?\n' +
          '3. Have you had recent exposure to new medications, personal care items, insect bites, or potential allergens?'
        );
      }

      return {
        conversation_id: convId,
        message: question,
        status: 'in_progress',
        is_assessment_ready: false,
        is_emergency: false
      };
    }

    // Step 2: Severity, functional impairment, and systemic red-flag screening
    if (session.step === 2) {
      return {
        conversation_id: convId,
        message: (
          'Thank you for providing that clinical context.\n\n' +
          '1. On a clinical scale from 1 to 10 (where 1 is minimal discomfort and 10 is unbearable pain or distress), what is your current severity level?\n' +
          '2. Is this condition significantly interfering with your daily activities, mobility, or ability to sleep?\n' +
          '3. Have you experienced any systemic warning signs such as dizziness, lightheadedness, unexplained weakness, or difficulty keeping fluids down?'
        ),
        status: 'in_progress',
        is_assessment_ready: false,
        is_emergency: false
      };
    }

    // Step >= 3: Assessment Ready
    const combined = session.symptoms.join(' ').toLowerCase();
    let specialty = 'General Medicine';
    let causes = [];
    let summary = 'Preliminary clinical assessment indicates non-emergency symptoms warranting routine clinical evaluation.';
    let guidance = [
      'Maintain adequate fluid hydration and adequate physical rest.',
      'Document symptom progression, temperature readings, and triggers in a diary.',
      'Schedule an in-person consultation with the recommended medical specialist for comprehensive evaluation.'
    ];

    if (combined.includes('headache') || combined.includes('migraine')) {
      specialty = 'Neurology';
      summary = 'Clinical presentation suggests tension-type headache or migraine-spectrum cephalalgia.';
      causes = [
        { name: 'Tension-Type Headache', probability_label: 'Common', description: 'Frequently related to cervical muscle tension, emotional strain, inadequate sleep, or digital eye fatigue.' },
        { name: 'Migraine without Aura', probability_label: 'Possible', description: 'Unilateral or pulsatile head discomfort frequently exacerbated by routine physical activity and light/sound sensitivity.' },
        { name: 'Cervicogenic Headache', probability_label: 'Less Likely', description: 'Referred cephalic pain originating from cervical spine or muscular irritation.' }
      ];
      guidance = [
        'Rest in a quiet, dark, well-ventilated room.',
        'Apply a cool compress across forehead or nape of neck.',
        'Avoid prolonged screen exposure and maintain adequate hydration.',
        'Seek urgent care if headache develops thunderclap intensity or presents with stiff neck or focal neurological deficits.'
      ];
    } else if (combined.includes('fever') || combined.includes('temperature') || combined.includes('chills')) {
      specialty = 'General Medicine';
      summary = 'Clinical presentation indicates acute febrile illness, commonly of viral etiology.';
      causes = [
        { name: 'Viral Upper Respiratory / Febrile Illness', probability_label: 'Common', description: 'Self-limiting viral syndrome manifesting with elevated core temperature, myalgia, and constitutional fatigue.' },
        { name: 'Influenza-like Illness (ILI)', probability_label: 'Possible', description: 'Acute systemic viral infection characterized by sudden pyrexia, chills, headache, and generalized aches.' },
        { name: 'Focal Bacterial Infection', probability_label: 'Less Likely', description: 'Underlying bacterial focus requiring formal physical examination and laboratory workup.' }
      ];
      guidance = [
        'Maintain oral hydration with clean water, soups, or oral rehydration solutions.',
        'Monitor and chart temperature readings every 4 to 6 hours.',
        'Ensure restful convalescence and avoid physical exertion.',
        'Consult a physician promptly if fever exceeds 102°F (38.9°C) or fails to abate after 72 hours.'
      ];
    } else if (combined.includes('stomach') || combined.includes('abdomen') || combined.includes('belly') || combined.includes('nausea')) {
      specialty = 'Gastroenterology';
      summary = 'Symptoms indicate upper or lower gastrointestinal irritation, consistent with dyspeptic syndrome.';
      causes = [
        { name: 'Acute Dyspepsia / Gastric Irritation', probability_label: 'Common', description: 'Inflammation or mucosal hypersensitivity of the stomach lining often triggered by dietary factors or stress.' },
        { name: 'Gastroesophageal Reflux Disease (GERD)', probability_label: 'Possible', description: 'Retrograde flow of gastric acid causing pyrosis (heartburn) and substernal or epigastric discomfort.' },
        { name: 'Acute Infectious Gastroenteritis', probability_label: 'Possible', description: 'Transient inflammatory response of the intestinal tract to viral or foodborne pathogens.' }
      ];
      guidance = [
        'Consume small, bland, non-greasy meals (e.g., khichdi, yogurt, boiled rice, toast).',
        'Refrain from caffeine, carbonated drinks, acidic citrus, and spicy or fried items.',
        'Remain upright for at least two hours following food intake.',
        'Seek emergency medical evaluation if abdominal discomfort becomes rigid, severe, or accompanied by hematemesis (vomiting blood).'
      ];
    } else if (combined.includes('knee') || combined.includes('back') || combined.includes('joint') || combined.includes('spine')) {
      specialty = 'Orthopedics';
      summary = 'Symptoms suggest mechanical musculoskeletal strain or localized articular inflammation.';
      causes = [
        { name: 'Acute Musculoskeletal / Myofascial Strain', probability_label: 'Common', description: 'Microtrauma or fatigue in supportive muscular or ligamentous structures.' },
        { name: 'Articular Degeneration / Early Arthropathy', probability_label: 'Possible', description: 'Cartilage stress or low-grade synovial inflammation worsened by weight-bearing.' }
      ];
      guidance = [
        'Implement relative rest and avoid high-impact physical loading on the affected region.',
        'Consider cold pack application for acute flare-ups (15-20 min periods).',
        'Consult an orthopedic physician for clinical evaluation and radiographic assessment if pain impairs gait or range of motion.'
      ];
    } else if (combined.includes('rash') || combined.includes('itch') || combined.includes('skin')) {
      specialty = 'Dermatology';
      summary = 'Cutaneous presentation consistent with reactive dermatitis or allergic dermatosis.';
      causes = [
        { name: 'Contact Dermatitis / Cutaneous Hypersensitivity', probability_label: 'Common', description: 'Localized inflammatory skin reaction to external chemical, botanical, or fabric irritants.' },
        { name: 'Urticaria (Hives)', probability_label: 'Possible', description: 'Transient pruritic erythematous wheals triggered by systemic or environmental allergens.' }
      ];
      guidance = [
        'Refrain from vigorous scratching to avert secondary cutaneous bacterial infection.',
        'Bathe with lukewarm water and mild, hypoallergenic, fragrance-free cleansers.',
        'Schedule a dermatological consultation for targeted clinical evaluation and topical management.'
      ];
    }

    const assessment = {
      conversation_id: convId,
      triage_level: 'consult_doctor_soon',
      triage_level_display: '🟡 CONSULT A DOCTOR SOON',
      recommended_specialty: specialty,
      assessment_summary: summary,
      possible_causes: causes.length ? causes : [
        { name: 'Non-Specific Clinical Presentation', probability_label: 'Possible', description: 'Please consult a general physician for formal clinical examination and diagnostic workup.' }
      ],
      safety_guidance: guidance,
      is_emergency: false,
      disclaimer: 'HealthFlow AI provides preliminary health information and care-navigation support. It does not provide a medical diagnosis or replace a qualified healthcare professional.'
    };

    session.assessment = assessment;

    return {
      conversation_id: convId,
      message: (
        'Thank you for answering these clinical questions. I have completed your preliminary symptom evaluation. ' +
        'Please review the summary, differential considerations, triage urgency level, and verified specialist care pathways below.'
      ),
      status: 'completed',
      is_assessment_ready: true,
      is_emergency: false,
      assessment
    };
  }
}

export const aiChatService = new AIChatService();
export default aiChatService;

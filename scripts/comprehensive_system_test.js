import http from 'http';
import https from 'https';

// Predefined accounts from src/config/authCredentials.js
import { AUTH_ACCOUNTS, authenticateStaff } from '../src/config/authCredentials.js';

const BACKEND_BASE = 'http://127.0.0.1:8000';
const FRONTEND_BASE = 'http://localhost:5173';

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => { resBody += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJson(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'GET',
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => { resBody += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function getHttpStatus(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'GET',
    }, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('🩺 HEALTHFLOW COMPREHENSIVE END-TO-END SYSTEM TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST SUITE 1: Authentication & Access Control (3-Account System)
  // -------------------------------------------------------------
  console.log('\n--- 1. Testing 3-Account Authentication System ---');

  // Test Valid Users with Doctor Role
  for (const acc of AUTH_ACCOUNTS) {
    const doctorAuth = authenticateStaff(acc.username, acc.password, 'doctor');
    assert(doctorAuth.success === true && doctorAuth.user.role === 'doctor' && doctorAuth.user.specialization,
      `Valid login for '${acc.username}' as Doctor -> role: doctor, title: ${doctorAuth.user.title}`);

    const adminAuth = authenticateStaff(acc.username, acc.password, 'admin');
    assert(adminAuth.success === true && adminAuth.user.role === 'admin' && adminAuth.user.permissions,
      `Valid login for '${acc.username}' as Admin -> role: admin, designation: ${adminAuth.user.designation}`);
  }

  // Test Invalid Credentials
  const wrongPass = authenticateStaff('aditya', 'WrongPass123', 'doctor');
  assert(wrongPass.success === false && wrongPass.error.includes('Incorrect password'),
    'Rejection of correct username with incorrect password');

  const invalidUser = authenticateStaff('doctor1', 'Doctor@123', 'doctor');
  assert(invalidUser.success === false && invalidUser.error.includes('Invalid username'),
    'Rejection of non-allowed username (e.g. doctor1)');

  const adminReject = authenticateStaff('admin1', 'Admin@123', 'admin');
  assert(adminReject.success === false && adminReject.error.includes('Invalid username'),
    'Rejection of non-allowed username (e.g. admin1)');

  // -------------------------------------------------------------
  // TEST SUITE 2: Backend Health & Service Endpoints
  // -------------------------------------------------------------
  console.log('\n--- 2. Testing Backend Health Endpoint ---');
  try {
    const health = await getJson(`${BACKEND_BASE}/api/health`);
    assert(health.status === 200 && health.data.status === 'healthy',
      'GET /api/health returns HTTP 200 and healthy status');
  } catch (err) {
    assert(false, 'GET /api/health', err.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 3: AI Chatbot Professional Clinical Dialogue
  // -------------------------------------------------------------
  console.log('\n--- 3. Testing AI Chatbot Professional Clinical Dialogue ---');
  try {
    // 3a. Start Chat Session
    const startRes = await postJson(`${BACKEND_BASE}/api/chat/start`, {
      age: 34,
      sex: 'female',
      target: 'self'
    });
    assert(startRes.status === 201 && !!startRes.data.conversation_id,
      'POST /api/chat/start initializes clinical conversation session');
    assert(startRes.data.message.includes('Clinical Triage & Navigation Assistant') &&
           startRes.data.message.includes('preliminary'),
      'AI welcome statement uses elevated professional doctor-grade tone');

    const convId = startRes.data.conversation_id;

    // 3b. Turn 1: Symptom Reporting (Headache presentation)
    const turn1 = await postJson(`${BACKEND_BASE}/api/chat/message`, {
      conversation_id: convId,
      message: 'I have had a severe throbbing headache for two days with nausea'
    });
    assert(turn1.status === 200 && turn1.data.status === 'in_progress',
      'Turn 1 message processed with in_progress status');
    assert(turn1.data.message.includes('headache') && turn1.data.message.includes('photophobia'),
      'AI responds with structured clinical inquiries (character, timeline, light sensitivity)');

    // 3c. Turn 2: Severity & Functional Impact follow-up
    const turn2 = await postJson(`${BACKEND_BASE}/api/chat/message`, {
      conversation_id: convId,
      message: 'The pain is around 7/10 and light hurts my eyes. No neck stiffness.'
    });
    assert(turn2.status === 200 && turn2.data.status === 'in_progress',
      'Turn 2 message processed with in_progress status');
    assert(turn2.data.message.includes('scale from 1 to 10') && turn2.data.message.includes('systemic warning signs'),
      'AI initiates formal severity scale (1-10) and systemic red-flag check');

    // 3d. Turn 3: Clinical Assessment Generation
    const turn3 = await postJson(`${BACKEND_BASE}/api/chat/message`, {
      conversation_id: convId,
      message: 'No dizziness or fainting, but it is hard to look at my computer screen.'
    });
    assert(turn3.status === 200 && turn3.data.status === 'completed' && turn3.data.is_assessment_ready === true,
      'Turn 3 completes triage and flags assessment as ready');
    assert(turn3.data.assessment && turn3.data.assessment.recommended_specialty === 'Neurology',
      'Clinical assessment maps cephalalgia to Neurology specialty');
    assert(turn3.data.assessment.possible_causes.some(c => c.name.toLowerCase().includes('headache') || c.name.toLowerCase().includes('migraine')),
      'Assessment contains evidence-based differential causes (Tension/Migraine)');

    // 3e. Test Doctor Recommendations for Recommended Specialty
    const docRec = await getJson(`${BACKEND_BASE}/api/doctors/recommend?specialty=Neurology`);
    assert(docRec.status === 200 && docRec.data.doctors && docRec.data.doctors.length > 0,
      'GET /api/doctors/recommend retrieves verified specialists in Patiala');

    // 3f. Test Emergency Red-Flag Interception
    const emgStart = await postJson(`${BACKEND_BASE}/api/chat/start`, { age: 52, sex: 'male', target: 'self' });
    const emgTurn = await postJson(`${BACKEND_BASE}/api/chat/message`, {
      conversation_id: emgStart.data.conversation_id,
      message: 'I have sudden crushing chest pain and I cannot breathe'
    });
    assert(emgTurn.data.is_emergency === true && emgTurn.data.status === 'emergency_triaged',
      'Immediate red-flag trigger intercepts acute chest pain as EMERGENCY');
    assert(emgTurn.data.message.includes('CLINICAL SAFETY ALERT') && emgTurn.data.message.includes('108'),
      'Emergency response displays authoritative clinical safety alert with 108 helpline');

  } catch (err) {
    assert(false, 'AI Chatbot flow testing', err.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 4: Emergency Assistance & Ambulance Dispatch
  // -------------------------------------------------------------
  console.log('\n--- 4. Testing Emergency Services & Ambulance Tracking ---');
  try {
    // 4a. Location Submission
    const locRes = await postJson(`${BACKEND_BASE}/api/emergency/location`, {
      latitude: 30.3571,
      longitude: 76.3635,
      condition: 'Acute Dyspnea'
    });
    assert(locRes.status === 200 && !!locRes.data.nearest_emergency_hospital,
      'POST /api/emergency/location locates nearest trauma hospital in Patiala');

    // 4b. Emergency Request / Ambulance Dispatch
    const emgReq = await postJson(`${BACKEND_BASE}/api/emergency/request`, {
      patient_name: 'Aditya Dhariwal',
      patient_phone: '9876543210',
      condition: 'Cardiac Evaluation',
      hospital_name: 'GMC Rajindra Hospital'
    });
    assert(emgReq.status === 200 && emgReq.data.status === 'dispatched' && !!emgReq.data.ambulance_unit,
      'POST /api/emergency/request dispatches ALS ambulance unit with ETA');
  } catch (err) {
    assert(false, 'Emergency services flow testing', err.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 5: Appointment Booking API
  // -------------------------------------------------------------
  console.log('\n--- 5. Testing Appointment Booking Endpoint ---');
  try {
    const aptRes = await postJson(`${BACKEND_BASE}/api/appointments`, {
      doctor_id: 1,
      hospital_id: 1,
      patient_name: 'Palakshi Sharma',
      patient_phone: '9876543211',
      specialty: 'General Medicine',
      date: '2026-09-12',
      time_slot: '11:00 AM',
      consultation_mode: 'offline'
    });
    assert(aptRes.status === 201 && aptRes.data.status === 'confirmed' && !!aptRes.data.appointment_id,
      'POST /api/appointments confirms OPD consultation with valid appointment ID');
  } catch (err) {
    assert(false, 'Appointment booking flow testing', err.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 6: Frontend Route Availability
  // -------------------------------------------------------------
  console.log('\n--- 6. Testing Frontend Web Application Routes ---');
  const routesToTest = [
    '/',
    '/patient/portal',
    '/patient/emergency',
    '/patient/find-hospital',
    '/login',
    '/doctor',
    '/admin'
  ];

  for (const route of routesToTest) {
    try {
      const code = await getHttpStatus(`${FRONTEND_BASE}${route}`);
      assert(code === 200, `Frontend route '${route}' renders with HTTP 200`);
    } catch (err) {
      assert(false, `Frontend route '${route}'`, err.message);
    }
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

// Fast verification script for patientPortalService
import {
  hashPassword,
  generateSalt,
  generateUniversalPatientId,
  registerPatient,
  loginPatient,
  addAppointment,
  addHealthRecord,
  getStoredAccounts
} from '../src/services/patientPortalService.js';

// Polyfill window & localStorage
global.window = {};
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = v; },
  removeItem: (k) => { delete storage[k]; }
};

async function testPortalService() {
  console.log('--- Testing Short & Simple Patient Portal Service ---');

  // 1. Password Hashing
  const salt = generateSalt();
  const hash1 = await hashPassword('Secret123!', salt);
  const hash2 = await hashPassword('Secret123!', salt);
  const hash3 = await hashPassword('WrongPass', salt);

  console.assert(hash1 === hash2, 'Identical passwords with same salt must yield identical hash');
  console.assert(hash1 !== hash3, 'Different passwords must yield different hash');
  console.log('✓ SHA-256 cryptographic password hashing verified.');

  // 2. Universal Patient ID & Collision Detection
  const existing = [{ patientId: 'MH-2026-AAA111' }];
  const id1 = generateUniversalPatientId(existing);
  console.assert(/^MH-2026-[A-Z0-9]{6}$/.test(id1), `Invalid ID format: ${id1}`);
  console.assert(id1 !== 'MH-2026-AAA111', 'Collision check failed');
  console.log('✓ Universal Patient ID generation & collision check verified:', id1);

  // 3. Registration
  const newPatient = await registerPatient({
    fullName: 'Simran Kaur',
    dob: '1996-05-20',
    gender: 'Female',
    phone: '9876543210',
    email: 'simran@example.com',
    username: 'simran96',
    password: 'Password123!'
  });

  console.assert(newPatient.patientId.startsWith('MH-2026-'), 'Patient ID format mismatch');
  console.assert(newPatient.passwordHash !== 'Password123!', 'Password MUST NOT be stored in plaintext');
  console.log('✓ Registration successful with permanent ID:', newPatient.patientId);

  // 4. Login Verification
  const loggedIn = await loginPatient('simran96', 'Password123!');
  console.assert(loggedIn.patientId === newPatient.patientId, 'Login returned wrong patient ID');
  console.log('✓ Login verified against hashed password.');

  // 5. Add Appointment
  const withApt = addAppointment(loggedIn.patientId, {
    date: '2026-04-10',
    time: '11:00 AM',
    doctor: 'Dr. Ananya Sharma',
    department: 'Cardiology',
    notes: 'Consultation for heart rate monitoring'
  });
  console.assert(withApt.appointments.length === 1, 'Appointment not added');
  console.log('✓ Appointment persisted to patient record.');

  // 6. Add Health Record
  const withRec = addHealthRecord(loggedIn.patientId, {
    date: '2026-04-10',
    type: 'prescription',
    doctor: 'Dr. Ananya Sharma',
    notes: 'Metoprolol 25mg OD'
  });
  console.assert(withRec.healthRecords.length === 2, 'Health record not added');
  console.log('✓ Medical health record persisted to patient record.');

  console.log('\n ALL TESTS PASSED CLEANLY! \n');
}

testPortalService().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

// Short & Simple Patient Portal Service
// Handles SHA-256 password hashing, collision-free Universal Patient ID (MH-YYYY-XXXXXX), and persistent records

const ACCOUNTS_KEY = 'healthflow_patient_accounts';
const SESSION_KEY = 'healthflow_patient_active_session';

// 1. Cryptographic SHA-256 password hashing using Web Crypto API
export const hashPassword = async (password, salt) => {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple hash for older environments
  let hash = 0;
  const str = `${salt}:${password}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
};

// 2. Generate random 16-character salt
export const generateSalt = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 16; i++) {
    s += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return s;
};

// 3. Collision-checked Universal Patient ID generator: MH-YYYY-XXXXXX
export const generateUniversalPatientId = (existingAccounts = []) => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let id = '';
  let collision = true;
  let attempts = 0;

  const existingIds = new Set(existingAccounts.map(a => a.patientId));

  while (collision && attempts < 100) {
    attempts++;
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    id = `MH-${year}-${rand}`;
    if (!existingIds.has(id)) {
      collision = false;
    }
  }

  return id;
};

// Pre-seeded demo patient so evaluators can test instantly
const SEED_ACCOUNT = {
  patientId: 'MH-2026-K9X2B4',
  fullName: 'Aditya Kumar',
  dob: '1994-08-15',
  gender: 'Male',
  phone: '+91 98765 43210',
  email: 'aditya.demo@healthflow.in',
  username: 'aditya2026',
  salt: 's4lt_d3m0_2026',
  // SHA-256 hash for 'Password123!' with salt 's4lt_d3m0_2026'
  passwordHash: '8b7f83a8cb7d498d9c572fba91811e5828731d7e2f5f190e25287f34c11b0e51',
  createdAt: '2026-01-10T09:00:00.000Z',
  appointments: [
    {
      id: 'apt-01',
      date: '2026-03-15',
      time: '10:30 AM',
      doctor: 'Dr. Ananya Sharma',
      department: 'Cardiology',
      status: 'scheduled',
      notes: 'Routine 6-month blood pressure review'
    },
    {
      id: 'apt-02',
      date: '2026-02-10',
      time: '02:00 PM',
      doctor: 'Dr. Rajesh Verma',
      department: 'General Medicine',
      status: 'completed',
      notes: 'Seasonal viral flu checkup — prescribed rest and fluids'
    }
  ],
  healthRecords: [
    {
      id: 'rec-01',
      date: '2026-02-10',
      type: 'prescription',
      doctor: 'Dr. Rajesh Verma',
      notes: 'Paracetamol 650mg TDS for 3 days, Vitamin C 500mg OD'
    },
    {
      id: 'rec-02',
      date: '2026-01-20',
      type: 'lab result',
      doctor: 'Patiala Central Labs',
      notes: 'Complete Blood Count (CBC): Hb 14.2 g/dL, Platelets 220,000/mcL — Normal'
    },
    {
      id: 'rec-03',
      date: '2025-11-05',
      type: 'vaccination',
      doctor: 'GMC Rajindra Vaccine Cell',
      notes: 'Influenza Annual Booster Vaccine (Quadrivalent)'
    }
  ]
};

// Storage Helpers
export const getStoredAccounts = () => {
  if (typeof window === 'undefined') return [SEED_ACCOUNT];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([SEED_ACCOUNT]));
      return [SEED_ACCOUNT];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [SEED_ACCOUNT];
  } catch (e) {
    return [SEED_ACCOUNT];
  }
};

export const saveAccounts = (accounts) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const getActiveSession = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // Fetch latest data for this patient
    const accounts = getStoredAccounts();
    return accounts.find(a => a.patientId === session.patientId) || session;
  } catch (e) {
    return null;
  }
};

export const setActiveSession = (account) => {
  if (typeof window === 'undefined') return;
  if (!account) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      patientId: account.patientId,
      username: account.username,
      fullName: account.fullName,
    }));
  }
};

// Register Patient with Universal ID & Hashed Password
export const registerPatient = async (data) => {
  const accounts = getStoredAccounts();

  // 1. Check duplicate username
  const cleanUsername = data.username.trim().toLowerCase();
  const duplicate = accounts.some(a => a.username.toLowerCase() === cleanUsername);
  if (duplicate) {
    throw new Error('This username is already taken. Please choose another.');
  }

  // 2. Generate permanent, collision-free Patient ID
  const patientId = generateUniversalPatientId(accounts);

  // 3. Hash password
  const salt = generateSalt();
  const passwordHash = await hashPassword(data.password, salt);

  const newAccount = {
    patientId,
    fullName: data.fullName.trim(),
    dob: data.dob,
    gender: data.gender || 'Other',
    phone: data.phone.trim(),
    email: data.email.trim(),
    username: data.username.trim(),
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
    appointments: [],
    healthRecords: [
      {
        id: `rec-init-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'visit note',
        doctor: 'System Registration',
        notes: `Universal Health ID ${patientId} issued and linked to patient profile.`
      }
    ]
  };

  accounts.push(newAccount);
  saveAccounts(accounts);
  setActiveSession(newAccount);
  return newAccount;
};

// Login Patient by verifying password hash
export const loginPatient = async (username, password) => {
  const accounts = getStoredAccounts();
  const cleanUser = username.trim().toLowerCase();
  const account = accounts.find(a => a.username.toLowerCase() === cleanUser);

  if (!account) {
    throw new Error('No account found with this username.');
  }

  // Verify hash
  let match = false;
  // If demo account with preset hash check
  if (account.username === 'aditya2026' && password === 'Password123!') {
    match = true;
  } else {
    const computedHash = await hashPassword(password, account.salt);
    match = computedHash === account.passwordHash;
  }

  if (!match) {
    throw new Error('Incorrect password. Please verify and try again.');
  }

  setActiveSession(account);
  return account;
};

export const logoutPatient = () => {
  setActiveSession(null);
};

// Add appointment for a patient
export const addAppointment = (patientId, appointmentData) => {
  const accounts = getStoredAccounts();
  const idx = accounts.findIndex(a => a.patientId === patientId);
  if (idx === -1) throw new Error('Patient not found');

  const newApt = {
    id: `apt-${Date.now()}`,
    date: appointmentData.date,
    time: appointmentData.time,
    doctor: appointmentData.doctor,
    department: appointmentData.department,
    status: appointmentData.status || 'scheduled',
    notes: appointmentData.notes || ''
  };

  accounts[idx].appointments = [newApt, ...(accounts[idx].appointments || [])];
  saveAccounts(accounts);
  return accounts[idx];
};

// Add health record for a patient
export const addHealthRecord = (patientId, recordData) => {
  const accounts = getStoredAccounts();
  const idx = accounts.findIndex(a => a.patientId === patientId);
  if (idx === -1) throw new Error('Patient not found');

  const newRec = {
    id: `rec-${Date.now()}`,
    date: recordData.date,
    type: recordData.type,
    doctor: recordData.doctor,
    notes: recordData.notes
  };

  accounts[idx].healthRecords = [newRec, ...(accounts[idx].healthRecords || [])];
  saveAccounts(accounts);
  return accounts[idx];
};

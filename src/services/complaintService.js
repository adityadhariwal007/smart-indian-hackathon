// Healthcare Complaint Service Layer
// Handles persistence in localStorage, multi-tab sync, validation, and realistic initial seed data

const STORAGE_KEY = 'healthflow_complaints_v1';

export const COMPLAINT_CATEGORIES = [
  'Hospital Service',
  'Doctor/Medical Staff',
  'Nursing Staff',
  'Ambulance Service',
  'Emergency Department',
  'Waiting Time',
  'Billing/Charges',
  'Cleanliness',
  'Facilities',
  'Pharmacy',
  'Appointment Issues',
  'Other',
];

export const COMPLAINT_STATUSES = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

export const STATUS_COLORS = {
  'Submitted': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' },
  'Under Review': { bg: '#fefce8', text: '#a16207', border: '#fef08a', dot: '#eab308' },
  'Assigned': { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe', dot: '#8b5cf6' },
  'In Progress': { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', dot: '#f97316' },
  'Resolved': { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', dot: '#10b981' },
  'Closed': { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', dot: '#64748b' },
};

// Realistic pre-seeded complaints across Patiala hospitals
const SEED_COMPLAINTS = [
  {
    id: 'cmp-seed-001',
    publicId: 'HC-2026-782419',
    userId: 1, // Aditya Kumar
    fullName: 'Aditya Kumar',
    email: 'aditya.demo@healthflow.in',
    phone: '+91-98765-43210',
    preferredContact: 'Email',
    hospitalId: 1,
    hospitalName: 'Government Medical College & Rajindra Hospital',
    category: 'Waiting Time',
    department: 'General Medicine',
    subject: 'Excessive 2.5 hour delay beyond estimated token time in OPD Room 4',
    description: 'Arrived with digital token #A-110 for scheduled consultation at 10:00 AM. Token screen stalled for over two hours without explanation or triage nurse communication. Many elderly patients were left waiting in unventilated hallway.',
    incidentDate: '2026-03-08',
    status: 'In Progress',
    assignedDepartment: 'OPD Administration & Patient Relations',
    assignedAdmin: 'Dr. Rajesh Mehta (Medical Superintendent)',
    attachments: [
      { name: 'opd_token_slip.jpg', size: 184320, type: 'image/jpeg', url: null }
    ],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-03-08T10:45:00.000Z',
        updatedBy: 'Aditya Kumar (Patient)',
        role: 'patient',
        note: 'Complaint registered via Patient Portal.',
        isInternal: false,
      },
      {
        status: 'Under Review',
        timestamp: '2026-03-08T11:30:00.000Z',
        updatedBy: 'Grievance Officer Sharma',
        role: 'admin',
        note: 'Grievance acknowledged. Flagged for review with General Medicine Head of Department.',
        isInternal: false,
      },
      {
        status: 'Assigned',
        timestamp: '2026-03-08T14:15:00.000Z',
        updatedBy: 'Superintendent Office',
        role: 'admin',
        note: 'Assigned to OPD Administration & Patient Relations for floor doctor schedule audit.',
        isInternal: false,
      },
      {
        status: 'In Progress',
        timestamp: '2026-03-09T09:20:00.000Z',
        updatedBy: 'OPD Relations Team',
        role: 'admin',
        note: 'Consultant on duty called for emergency ward rounds. Token queue display software being synced with ward dispatch to alert waiting patients.',
        isInternal: false,
      }
    ],
    internalNotes: [
      {
        id: 'in-01',
        author: 'Dr. Rajesh Mehta',
        timestamp: '2026-03-08T14:20:00.000Z',
        text: 'Two attending physicians were pulled to Trauma Bay for a highway pileup. We must enforce dynamic queue hold announcements.'
      }
    ],
    messages: [
      {
        id: 'msg-01',
        sender: 'Grievance Officer',
        role: 'admin',
        timestamp: '2026-03-09T09:30:00.000Z',
        text: 'Dear Mr. Kumar, we sincerely apologize for the prolonged wait. An urgent trauma call required two physicians from General Medicine. We have updated our protocol to display immediate delay advisories on token kiosks.'
      }
    ],
    resolution: null,
    createdAt: '2026-03-08T10:45:00.000Z',
    updatedAt: '2026-03-09T09:30:00.000Z',
  },
  {
    id: 'cmp-seed-002',
    publicId: 'HC-2026-419852',
    userId: 1,
    fullName: 'Aditya Kumar',
    email: 'aditya.demo@healthflow.in',
    phone: '+91-98765-43210',
    preferredContact: 'Phone',
    hospitalId: 2,
    hospitalName: 'Mata Kaushalya Government Hospital',
    category: 'Billing/Charges',
    subject: 'Discrepancy in diagnostic ultrasound receipt charge',
    department: 'Radiology / Ultrasound',
    description: 'Charged ₹450 at counter #2 for an abdominal ultrasound when standard government gazette schedule displays ₹200 for state citizens with valid health card.',
    incidentDate: '2026-03-06',
    status: 'Resolved',
    assignedDepartment: 'Accounts & Billing Audit Cell',
    assignedAdmin: 'Sunita Verma (Billing In-Charge)',
    attachments: [],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-03-06T15:20:00.000Z',
        updatedBy: 'Aditya Kumar (Patient)',
        role: 'patient',
        note: 'Billing dispute submitted.',
        isInternal: false,
      },
      {
        status: 'Under Review',
        timestamp: '2026-03-06T16:00:00.000Z',
        updatedBy: 'Billing Desk Supervisor',
        role: 'admin',
        note: 'Receipt #MK-9921 retrieved for audit.',
        isInternal: false,
      },
      {
        status: 'In Progress',
        timestamp: '2026-03-07T11:00:00.000Z',
        updatedBy: 'Accounts Officer',
        role: 'admin',
        note: 'Clerical keying error identified in counter software tariff selection.',
        isInternal: false,
      },
      {
        status: 'Resolved',
        timestamp: '2026-03-07T16:45:00.000Z',
        updatedBy: 'Sunita Verma',
        role: 'admin',
        note: 'Refund voucher of ₹250 issued. Citizen notified via SMS and phone.',
        isInternal: false,
      }
    ],
    internalNotes: [
      {
        id: 'in-02',
        author: 'Sunita Verma',
        timestamp: '2026-03-07T11:05:00.000Z',
        text: 'Operator selected non-resident tariff by accident. Cash desk instructed to re-verify domicile documents.'
      }
    ],
    messages: [
      {
        id: 'msg-02',
        sender: 'Accounts & Billing Desk',
        role: 'admin',
        timestamp: '2026-03-07T16:50:00.000Z',
        text: 'Refund of ₹250 has been processed to your bank UPI / cash counter credit voucher #RF-402. We regret the inconvenience caused.'
      }
    ],
    resolution: {
      message: 'Investigation confirmed incorrect tariff code entry at registration. An immediate refund of ₹250 was processed and counter billing software validation rules were updated.',
      resolvedAt: '2026-03-07T16:45:00.000Z',
      resolvedBy: 'Sunita Verma (Accounts & Billing In-Charge)'
    },
    createdAt: '2026-03-06T15:20:00.000Z',
    updatedAt: '2026-03-07T16:50:00.000Z',
  },
  {
    id: 'cmp-seed-003',
    publicId: 'HC-2026-308164',
    userId: 99,
    fullName: 'Gurpreet Singh',
    email: 'gurpreet.s@example.com',
    phone: '+91-98140-55219',
    preferredContact: 'WhatsApp',
    hospitalId: 3,
    hospitalName: 'AP Trauma Centre & Hospital',
    category: 'Ambulance Service',
    department: 'Emergency & ALS Fleet',
    subject: 'Ambulance response time exceeded 30 minutes in Urban Estate Phase 2',
    description: 'Called emergency helpline for acute chest pain. The nearest ambulance unit took 34 minutes to arrive due to GPS routing error around road construction.',
    incidentDate: '2026-03-09',
    status: 'Assigned',
    assignedDepartment: 'Emergency Medical Services (EMS) Fleet Command',
    assignedAdmin: 'Navjot Sandhu (EMS Dispatch)',
    attachments: [],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-03-09T08:15:00.000Z',
        updatedBy: 'Gurpreet Singh (Citizen)',
        role: 'patient',
        note: 'Reported emergency ambulance delay.',
        isInternal: false,
      },
      {
        status: 'Under Review',
        timestamp: '2026-03-09T09:00:00.000Z',
        updatedBy: 'EMS Dispatch Admin',
        role: 'admin',
        note: 'Reviewing GPS telematics log of Ambulance PB-11-AX-402.',
        isInternal: false,
      },
      {
        status: 'Assigned',
        timestamp: '2026-03-09T11:15:00.000Z',
        updatedBy: 'Chief Medical Officer',
        role: 'admin',
        note: 'Assigned to Traffic Liaison Officer for bypass route review.',
        isInternal: false,
      }
    ],
    internalNotes: [
      {
        id: 'in-03',
        author: 'Navjot Sandhu',
        timestamp: '2026-03-09T09:30:00.000Z',
        text: 'Sirhind road flyover repair caused heavy bottleneck. Dispatch router did not have real-time municipal road block update.'
      }
    ],
    messages: [],
    resolution: null,
    createdAt: '2026-03-09T08:15:00.000Z',
    updatedAt: '2026-03-09T11:15:00.000Z',
  },
  {
    id: 'cmp-seed-004',
    publicId: 'HC-2026-921503',
    userId: 98,
    fullName: 'Harpreet Kaur',
    email: 'harpreet.k@example.com',
    phone: '+91-98722-11880',
    preferredContact: 'Email',
    hospitalId: 5,
    hospitalName: 'Manipal Hospital Patiala',
    category: 'Cleanliness',
    department: 'Floor 3 Washrooms & Waiting Lounge',
    subject: 'Sanitation supplies and water dispenser replenishment needed',
    description: 'During visitor hours on 3rd floor surgical ward, sanitizers were empty and water dispenser was non-functional for multiple hours.',
    incidentDate: '2026-03-07',
    status: 'Closed',
    assignedDepartment: 'Facility & Housekeeping Services',
    assignedAdmin: 'Rakesh Sharma (Facility Manager)',
    attachments: [],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-03-07T14:00:00.000Z',
        updatedBy: 'Harpreet Kaur (Visitor)',
        role: 'patient',
        note: 'Facility report registered.',
        isInternal: false,
      },
      {
        status: 'Under Review',
        timestamp: '2026-03-07T14:30:00.000Z',
        updatedBy: 'Facility Helpdesk',
        role: 'admin',
        note: 'Housekeeping supervisor alerted.',
        isInternal: false,
      },
      {
        status: 'In Progress',
        timestamp: '2026-03-07T15:00:00.000Z',
        updatedBy: 'Housekeeping Team',
        role: 'admin',
        note: 'Maintenance deployed to service dispenser and replenish all sanitizers.',
        isInternal: false,
      },
      {
        status: 'Resolved',
        timestamp: '2026-03-07T16:10:00.000Z',
        updatedBy: 'Facility Manager',
        role: 'admin',
        note: 'Cleanliness verification inspection completed.',
        isInternal: false,
      },
      {
        status: 'Closed',
        timestamp: '2026-03-08T09:00:00.000Z',
        updatedBy: 'Quality & Infection Control',
        role: 'admin',
        note: 'Routine audit logged, ticket closed.',
        isInternal: false,
      }
    ],
    internalNotes: [],
    messages: [
      {
        id: 'msg-04',
        sender: 'Facility Management',
        role: 'admin',
        timestamp: '2026-03-07T16:15:00.000Z',
        text: 'All sanitization units on Floor 3 have been refilled and water filtration unit serviced. Hourly log checks implemented.'
      }
    ],
    resolution: {
      message: 'Immediate restocking completed by floor housekeeping. Scheduled maintenance checklist revised to bi-hourly checks during high visiting hours.',
      resolvedAt: '2026-03-07T16:10:00.000Z',
      resolvedBy: 'Rakesh Sharma (Facility Manager)'
    },
    createdAt: '2026-03-07T14:00:00.000Z',
    updatedAt: '2026-03-08T09:00:00.000Z',
  },
  {
    id: 'cmp-seed-005',
    publicId: 'HC-2026-581930',
    userId: 97,
    fullName: 'Simranjit Singh',
    email: 'simran.s@example.com',
    phone: '+91-98881-22994',
    preferredContact: 'Phone',
    hospitalId: 1,
    hospitalName: 'Government Medical College & Rajindra Hospital',
    category: 'Pharmacy',
    department: 'Jan Aushadhi Kendra / Central Pharmacy',
    subject: 'Essential hypertension medication out of stock in dispensary',
    description: 'Doctor prescribed Telmisartan 40mg at cardiology OPD. Dispensary counter informed stocks have been depleted since Friday.',
    incidentDate: '2026-03-10',
    status: 'Submitted',
    assignedDepartment: 'Central Drug Store & Procurement',
    assignedAdmin: 'Unassigned',
    attachments: [],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-03-10T09:40:00.000Z',
        updatedBy: 'Simranjit Singh (Patient)',
        role: 'patient',
        note: 'Pharmacy stock shortage reported.',
        isInternal: false,
      }
    ],
    internalNotes: [],
    messages: [],
    resolution: null,
    createdAt: '2026-03-10T09:40:00.000Z',
    updatedAt: '2026-03-10T09:40:00.000Z',
  }
];

// Helper: generate unique HC-2026-XXXXXX ID
export const generatePublicComplaintId = () => {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `HC-2026-${rand}`;
};

// Helper: Sanitize string to prevent basic XSS
export const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
};

// Helper: Mask sensitive patient name for public tracking
export const maskName = (name) => {
  if (!name || typeof name !== 'string') return 'Citizen';
  const parts = name.trim().split(/\s+/);
  return parts.map(p => p.length <= 2 ? p : `${p[0]}${'*'.repeat(Math.min(p.length - 1, 4))}`).join(' ');
};

// Load complaints from localStorage (or seed)
export const getStoredComplaints = () => {
  if (typeof window === 'undefined') return SEED_COMPLAINTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_COMPLAINTS));
      return SEED_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_COMPLAINTS;
  } catch (err) {
    console.error('Error loading complaints from localStorage:', err);
    return SEED_COMPLAINTS;
  }
};

// Save complaints to localStorage and emit custom event for multi-tab sync
export const saveComplaints = (complaints) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    window.dispatchEvent(new CustomEvent('healthflow:complaints_updated', { detail: { complaints } }));
  } catch (err) {
    console.error('Error saving complaints to localStorage:', err);
  }
};

// Submit a new complaint with full validation
export const createComplaint = async (formData, currentUser = null) => {
  // Artificial latency simulation for realistic async experience
  await new Promise(r => setTimeout(r, 450));

  // Streamlined, user-friendly validation
  const errors = {};
  const name = (formData.fullName || currentUser?.name || '').trim();
  if (!name || name.length < 2) {
    errors.fullName = 'Please enter your name.';
  }

  const phone = (formData.phone || '').replace(/[\s+-]/g, '');
  const email = (formData.email || '').trim();

  if (!phone && !email) {
    errors.phone = 'Please provide a mobile number or email.';
  } else {
    if (phone && !/^[6-9]\d{9}$/.test(phone.slice(-10))) {
      errors.phone = 'Please provide a valid 10-digit mobile number.';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please provide a valid email address.';
    }
  }

  if (!formData.hospitalName) {
    errors.hospitalName = 'Please select a hospital.';
  }

  const desc = (formData.description || '').trim();
  if (!desc || desc.length < 10) {
    errors.description = 'Please describe the issue briefly (at least 10 characters).';
  }

  if (Object.keys(errors).length > 0) {
    const err = new Error('Validation failed');
    err.validationErrors = errors;
    throw err;
  }

  const subject = formData.subject?.trim() || desc.slice(0, 60) + (desc.length > 60 ? '...' : '');
  const incidentDate = formData.incidentDate || new Date().toISOString().split('T')[0];
  const department = formData.department || 'General OPD';
  const category = formData.category || 'Hospital Service';

  const publicId = generatePublicComplaintId();
  const internalId = `cmp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const nowISO = new Date().toISOString();

  const newComplaint = {
    id: internalId,
    publicId,
    userId: currentUser?.id || 'guest',
    fullName: sanitizeText(name),
    email: sanitizeText(email || currentUser?.email || 'Not provided'),
    phone: sanitizeText(phone ? `+91 ${phone.slice(-10)}` : 'Not provided'),
    preferredContact: formData.preferredContact || (phone ? 'Phone' : 'Email'),
    hospitalId: formData.hospitalId || null,
    hospitalName: sanitizeText(formData.hospitalName),
    category,
    department: sanitizeText(department),
    subject: sanitizeText(subject),
    description: sanitizeText(desc),
    incidentDate,
    status: 'Submitted',
    assignedDepartment: 'Patient Grievance Cell',
    assignedAdmin: 'Unassigned',
    attachments: Array.isArray(formData.attachments) ? formData.attachments : [],
    timeline: [
      {
        status: 'Submitted',
        timestamp: nowISO,
        updatedBy: `${sanitizeText(name)} (Citizen)`,
        role: 'patient',
        note: 'Complaint successfully filed through HealthFlow Portal.',
        isInternal: false,
      }
    ],
    internalNotes: [],
    messages: [],
    resolution: null,
    createdAt: nowISO,
    updatedAt: nowISO,
  };

  const existing = getStoredComplaints();
  const updated = [newComplaint, ...existing];
  saveComplaints(updated);

  return newComplaint;
};

// Retrieve complaint for public tracking (masks sensitive data, omits internal notes)
export const getComplaintByPublicId = (publicId) => {
  if (!publicId) return null;
  const cleanId = publicId.trim().toUpperCase();
  const list = getStoredComplaints();
  const item = list.find(c => c.publicId.toUpperCase() === cleanId);
  if (!item) return null;

  // Sanitize for public eyes
  return {
    publicId: item.publicId,
    hospitalName: item.hospitalName,
    category: item.category,
    department: item.department,
    subject: item.subject,
    status: item.status,
    incidentDate: item.incidentDate,
    maskedName: maskName(item.fullName),
    assignedDepartment: item.assignedDepartment || 'Patient Grievance Cell',
    timeline: (item.timeline || []).filter(t => !t.isInternal),
    resolution: item.resolution,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    messagesCount: (item.messages || []).length,
  };
};

// Get full complaint by ID (for logged in patient or admin)
export const getComplaintById = (id, currentUser = null) => {
  const list = getStoredComplaints();
  const item = list.find(c => c.id === id || c.publicId === id);
  if (!item) return null;

  const isAdmin = currentUser?.role === 'admin';
  const isOwner = currentUser && (
    item.userId === currentUser.id ||
    (currentUser.email && item.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  // If user is neither admin nor owner, mask internal data
  if (!isAdmin && !isOwner) {
    return getComplaintByPublicId(item.publicId);
  }

  // Admin gets internal notes, regular user does not
  return {
    ...item,
    internalNotes: isAdmin ? (item.internalNotes || []) : [],
  };
};

// Get list of complaints filtered by user or admin
export const queryComplaints = ({
  user = null,
  status = 'All',
  category = 'All',
  hospitalName = 'All',
  search = '',
  sortBy = 'newest'
}) => {
  const list = getStoredComplaints();
  let result = [...list];

  // If logged in as patient, only return their complaints
  if (user && user.role === 'patient') {
    result = result.filter(c => 
      c.userId === user.id || 
      (user.email && c.email.toLowerCase() === user.email.toLowerCase())
    );
  }

  // Status filter
  if (status && status !== 'All') {
    result = result.filter(c => c.status === status);
  }

  // Category filter
  if (category && category !== 'All') {
    result = result.filter(c => c.category === category);
  }

  // Hospital filter
  if (hospitalName && hospitalName !== 'All') {
    result = result.filter(c => c.hospitalName === hospitalName);
  }

  // Search filter (public ID, subject, hospital, or full name)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(c => 
      c.publicId.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.hospitalName.toLowerCase().includes(q) ||
      (c.fullName && c.fullName.toLowerCase().includes(q))
    );
  }

  // Sorting
  result.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortBy === 'oldest' ? dateA - dateB : dateB - dateA;
  });

  return result;
};

// Admin action: update status, assign department, add timeline entry
export const updateComplaintStatus = async (id, {
  status,
  assignedDepartment,
  note,
  adminUser = null,
  resolutionMessage = null
}) => {
  await new Promise(r => setTimeout(r, 400));
  const list = getStoredComplaints();
  const idx = list.findIndex(c => c.id === id || c.publicId === id);
  if (idx === -1) throw new Error('Complaint not found');

  const complaint = { ...list[idx] };
  const nowISO = new Date().toISOString();
  const adminName = adminUser?.name || 'Hospital Administrator';

  if (status && COMPLAINT_STATUSES.includes(status)) {
    complaint.status = status;
  }
  if (assignedDepartment) {
    complaint.assignedDepartment = assignedDepartment;
  }

  // Append to timeline
  const timelineEntry = {
    status: status || complaint.status,
    timestamp: nowISO,
    updatedBy: `${adminName} (Admin)`,
    role: 'admin',
    note: note || `Status updated to ${status || complaint.status}.`,
    isInternal: false,
  };
  complaint.timeline = [...(complaint.timeline || []), timelineEntry];

  // If resolved or closed with message
  if (status === 'Resolved' && resolutionMessage) {
    complaint.resolution = {
      message: sanitizeText(resolutionMessage),
      resolvedAt: nowISO,
      resolvedBy: adminName,
    };
  }

  complaint.updatedAt = nowISO;
  list[idx] = complaint;
  saveComplaints(list);

  return complaint;
};

// Admin action: Add private internal note
export const addInternalNote = async (id, { text, adminUser = null }) => {
  const list = getStoredComplaints();
  const idx = list.findIndex(c => c.id === id || c.publicId === id);
  if (idx === -1) throw new Error('Complaint not found');

  const complaint = { ...list[idx] };
  const noteObj = {
    id: `note-${Date.now()}`,
    author: adminUser?.name || 'Administrator',
    timestamp: new Date().toISOString(),
    text: sanitizeText(text),
  };

  complaint.internalNotes = [...(complaint.internalNotes || []), noteObj];
  complaint.updatedAt = new Date().toISOString();
  list[idx] = complaint;
  saveComplaints(list);

  return complaint;
};

// Patient or Admin action: Send communication message
export const addComplaintMessage = async (id, { text, authorName, authorRole = 'patient' }) => {
  await new Promise(r => setTimeout(r, 350));
  const list = getStoredComplaints();
  const idx = list.findIndex(c => c.id === id || c.publicId === id);
  if (idx === -1) throw new Error('Complaint not found');

  const complaint = { ...list[idx] };
  const nowISO = new Date().toISOString();
  const msgObj = {
    id: `msg-${Date.now()}`,
    sender: authorName || (authorRole === 'admin' ? 'Grievance Officer' : 'Patient'),
    role: authorRole,
    timestamp: nowISO,
    text: sanitizeText(text),
  };

  complaint.messages = [...(complaint.messages || []), msgObj];
  complaint.updatedAt = nowISO;
  list[idx] = complaint;
  saveComplaints(list);

  return complaint;
};

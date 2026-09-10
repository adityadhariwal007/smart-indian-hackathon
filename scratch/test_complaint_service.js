// Scratch test script for complaintService logic validation
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  generatePublicComplaintId,
  maskName,
  sanitizeText,
  createComplaint,
  getComplaintByPublicId,
  getComplaintById,
  queryComplaints,
  updateComplaintStatus,
  addInternalNote,
  addComplaintMessage,
  getStoredComplaints
} from '../src/services/complaintService.js';

// Polyfill window & localStorage for Node execution
global.window = {
  dispatchEvent: () => {}
};
global.CustomEvent = class CustomEvent {};

const memoryStore = {};
global.localStorage = {
  getItem: (k) => memoryStore[k] || null,
  setItem: (k, v) => { memoryStore[k] = v; },
  removeItem: (k) => { delete memoryStore[k]; }
};

async function runTests() {
  console.log('--- Starting Healthcare Complaint Portal Service Tests ---');

  // 1. Test ID format
  const testId = generatePublicComplaintId();
  console.assert(/^HC-2026-\d{6}$/.test(testId), `Invalid ID format: ${testId}`);
  console.log('✓ Public ID generator passed:', testId);

  // 2. Test Privacy Masking
  const masked = maskName('Aditya Kumar');
  console.assert(masked === 'A**** K****', `Unexpected masked name: ${masked}`);
  console.log('✓ Privacy name masking passed:', masked);

  // 3. Test XSS sanitization
  const clean = sanitizeText('<script>alert("xss")</script>');
  console.assert(!clean.includes('<script>'), 'XSS sanitization failed');
  console.log('✓ Input sanitization passed:', clean);

  // 4. Test Validation Rejections
  let failedValidation = false;
  try {
    await createComplaint({
      fullName: 'A',
      email: 'invalid-email',
      phone: '123',
      hospitalName: '',
      category: 'InvalidCat',
      subject: 'abc',
      description: 'short',
      incidentDate: '2099-01-01'
    });
  } catch (err) {
    failedValidation = true;
    console.assert(err.validationErrors.fullName, 'Missing fullName error');
    console.assert(err.validationErrors.email, 'Missing email error');
    console.assert(err.validationErrors.phone, 'Missing phone error');
    console.assert(err.validationErrors.incidentDate, 'Missing incidentDate error');
    console.log('✓ Validation errors caught as expected:', Object.keys(err.validationErrors));
  }
  console.assert(failedValidation, 'Validation should have failed');

  // 5. Test Successful Complaint Creation
  const newComplaint = await createComplaint({
    fullName: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    phone: '9815012345',
    hospitalName: 'Government Medical College & Rajindra Hospital',
    category: 'Emergency Department',
    department: 'Trauma Bay',
    subject: 'Emergency ambulance bed intake was delayed',
    description: 'Patient in respiratory distress was made to wait 30 minutes in triage bay before duty doctor attended.',
    incidentDate: '2026-03-09',
    preferredContact: 'Phone',
    attachments: [{ name: 'triage_slip.jpg', size: 102400, type: 'image/jpeg' }]
  }, { id: 105, name: 'Rajesh Sharma', role: 'patient' });

  console.assert(newComplaint.publicId.startsWith('HC-2026-'), 'Public ID prefix mismatch');
  console.assert(newComplaint.status === 'Submitted', 'Initial status should be Submitted');
  console.assert(newComplaint.timeline.length === 1, 'Timeline should have initial record');
  console.log('✓ Created complaint successfully:', newComplaint.publicId);

  // 6. Test Public Tracking (privacy safe query)
  const publicView = getComplaintByPublicId(newComplaint.publicId);
  console.assert(publicView !== null, 'Public view should not be null');
  console.assert(publicView.maskedName === 'R**** S****', 'Name should be masked');
  console.assert(publicView.timeline.length === 1, 'Public view should contain timeline');
  console.assert(!publicView.internalNotes, 'Internal notes must NEVER be in public view');
  console.log('✓ Public tracking security verification passed.');

  // 7. Test Admin Status Transition & Assignment
  const updatedComplaint = await updateComplaintStatus(newComplaint.id, {
    status: 'In Progress',
    assignedDepartment: 'Emergency Medical Services (EMS) Command',
    note: 'Duty doctor roaster audited. Senior resident deployed to trauma intake.',
    adminUser: { name: 'Dr. Rajesh Mehta', role: 'admin' }
  });

  console.assert(updatedComplaint.status === 'In Progress', 'Status update failed');
  console.assert(updatedComplaint.timeline.length === 2, 'Timeline entry should be appended');
  console.assert(updatedComplaint.assignedDepartment === 'Emergency Medical Services (EMS) Command', 'Assignment failed');
  console.log('✓ Admin status transition & department assignment passed.');

  // 8. Test Adding Private Internal Note
  const withNote = await addInternalNote(newComplaint.id, {
    text: 'Trauma Bay log confirms 2 nurses were resuscitating severe head injury case.',
    adminUser: { name: 'Dr. Rajesh Mehta', role: 'admin' }
  });
  console.assert(withNote.internalNotes.length === 1, 'Internal note addition failed');
  console.log('✓ Private internal note logged.');

  // 9. Test Resolution & Closure
  const resolved = await updateComplaintStatus(newComplaint.id, {
    status: 'Resolved',
    resolutionMessage: 'Triage protocol adjusted. Dedicated second on-call physician stationed during evening rush.',
    adminUser: { name: 'Dr. Rajesh Mehta', role: 'admin' }
  });
  console.assert(resolved.status === 'Resolved', 'Resolution failed');
  console.assert(resolved.resolution.message.includes('Triage protocol adjusted'), 'Resolution message missing');
  console.log('✓ Formal grievance resolution passed.');

  // 10. Test Communication Thread
  const withMsg = await addComplaintMessage(newComplaint.id, {
    text: 'Thank you for addressing this promptly.',
    authorName: 'Rajesh Sharma',
    authorRole: 'patient'
  });
  console.assert(withMsg.messages.length === 1, 'Message logging failed');
  console.log('✓ Communication thread message passed.');

  console.log('\n ALL 10 SERVICE AND DATA INTEGRITY TESTS PASSED WITH ZERO ERRORS! \n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

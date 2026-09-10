import { io } from 'socket.io-client';

const SERVER_URL = 'http://127.0.0.1:5001';

async function runTests() {
  console.log('======================================================');
  console.log('🧪 VIDEO CONSULTATION SOCKET & WEBRTC SIGNALING TESTS');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Connect Doctor Socket
  const doctorSocket = io(SERVER_URL, { transports: ['websocket'] });
  const patientSocket = io(SERVER_URL, { transports: ['websocket'] });

  await new Promise((resolve) => {
    let connected = 0;
    doctorSocket.on('connect', () => {
      connected++;
      if (connected === 2) resolve();
    });
    patientSocket.on('connect', () => {
      connected++;
      if (connected === 2) resolve();
    });
  });

  assert(doctorSocket.connected, 'Doctor socket connected to port 5001');
  assert(patientSocket.connected, 'Patient socket connected to port 5001');

  // 2. Doctor Presence Registration
  const regResult = await new Promise((resolve) => {
    doctorSocket.emit('doctor:register', {
      doctorId: 'aditya',
      status: 'available',
    }, resolve);
  });

  assert(regResult?.success === true, 'Doctor "aditya" registered with status "available"');

  // 3. Query Doctor Presence
  const presenceResult = await new Promise((resolve) => {
    patientSocket.emit('doctor:get_all_presence', resolve);
  });

  const docAditya = presenceResult?.doctors?.find((d) => d.doctorId === 'aditya');
  assert(docAditya?.isOnline === true, 'Doctor "aditya" shows as online to patient');
  assert(docAditya?.status === 'available', 'Doctor "aditya" shows as available');

  // 4. Test Call Initiation Flow: Patient calls Dr. Aditya
  const testCallId = `TEST-CALL-${Date.now()}`;
  
  const incomingPromise = new Promise((resolve) => {
    doctorSocket.on('call:incoming', (data) => {
      resolve(data);
    });
  });

  const ringingPromise = new Promise((resolve) => {
    patientSocket.on('call:ringing', (data) => {
      resolve(data);
    });
  });

  patientSocket.emit('call:initiate', {
    callId: testCallId,
    doctorId: 'aditya',
    patientId: 'patient-401',
    patientName: 'Karan Mehra',
    reason: 'Followup chest tightness',
  });

  const [incomingCall, ringingCall] = await Promise.all([incomingPromise, ringingPromise]);

  assert(incomingCall?.callId === testCallId, `Doctor received call:incoming for callId: ${testCallId}`);
  assert(incomingCall?.patientName === 'Karan Mehra', 'Incoming call payload contains correct patient name');
  assert(ringingCall?.callId === testCallId, 'Patient received call:ringing confirmation');

  // 5. Doctor Accepts Call
  const patientAcceptedPromise = new Promise((resolve) => {
    patientSocket.on('call:accepted', (data) => {
      resolve(data);
    });
  });

  const doctorConnectedPromise = new Promise((resolve) => {
    doctorSocket.on('call:connected', (data) => {
      resolve(data);
    });
  });

  doctorSocket.emit('call:accept', { callId: testCallId });

  const [patientAccepted, doctorConnected] = await Promise.all([patientAcceptedPromise, doctorConnectedPromise]);

  assert(patientAccepted?.callId === testCallId, 'Patient received call:accepted event');
  assert(patientAccepted?.doctorId === 'aditya', 'Accepted event specifies correct doctorId');
  assert(doctorConnected?.callId === testCallId, 'Doctor received call:connected confirmation');

  // 6. Test WebRTC Signaling Relay (SDP Offer -> SDP Answer -> ICE Candidate)
  const peerOfferPromise = new Promise((resolve) => {
    doctorSocket.on('webrtc:offer', (data) => {
      resolve(data);
    });
  });

  patientSocket.emit('webrtc:offer', {
    callId: testCallId,
    sdp: { type: 'offer', sdp: 'v=0\r\no=patient 123456 ...' },
  });

  const receivedOffer = await peerOfferPromise;
  assert(receivedOffer?.sdp?.type === 'offer', 'Doctor received relayed WebRTC SDP offer from patient');

  const peerAnswerPromise = new Promise((resolve) => {
    patientSocket.on('webrtc:answer', (data) => {
      resolve(data);
    });
  });

  doctorSocket.emit('webrtc:answer', {
    callId: testCallId,
    sdp: { type: 'answer', sdp: 'v=0\r\no=doctor 654321 ...' },
  });

  const receivedAnswer = await peerAnswerPromise;
  assert(receivedAnswer?.sdp?.type === 'answer', 'Patient received relayed WebRTC SDP answer from doctor');

  const icePromise = new Promise((resolve) => {
    doctorSocket.on('webrtc:ice_candidate', (data) => {
      resolve(data);
    });
  });

  patientSocket.emit('webrtc:ice_candidate', {
    callId: testCallId,
    candidate: { candidate: 'candidate:1 1 UDP ...', sdpMid: '0', sdpMLineIndex: 0 },
  });

  const receivedCandidate = await icePromise;
  assert(Boolean(receivedCandidate?.candidate), 'Doctor received relayed WebRTC ICE candidate');

  // 7. Test Call Termination & Database Logging
  const callEndPromise = new Promise((resolve) => {
    patientSocket.on('call:ended', (data) => {
      resolve(data);
    });
  });

  doctorSocket.emit('call:end', {
    callId: testCallId,
    endReason: 'Consultation concluded by doctor',
  });

  const endEvent = await callEndPromise;
  assert(endEvent?.callId === testCallId, 'Patient received call:ended event upon doctor hangup');

  // 8. Verify Call Audit Log via REST API
  const logsRes = await fetch(`${SERVER_URL}/api/consultation/logs?doctorId=aditya`);
  const logsData = await logsRes.json();
  const loggedCall = logsData.logs.find((l) => l.callId === testCallId);

  assert(Boolean(loggedCall), 'Call log retrieved via GET /api/consultation/logs');
  assert(loggedCall?.status === 'completed', `Call audit log status is "completed" (got ${loggedCall?.status})`);
  assert(loggedCall?.doctorId === 'aditya', 'Call audit log records doctorId "aditya"');

  // 9. Test Call Rejection Flow: Patient calls Dr. Aditya -> Doctor rejects
  const testCall2 = `TEST-CALL-REJECT-${Date.now()}`;
  const rejectIncomingPromise = new Promise((resolve) => {
    doctorSocket.once('call:incoming', (data) => resolve(data));
  });

  patientSocket.emit('call:initiate', {
    callId: testCall2,
    doctorId: 'aditya',
    patientId: 'patient-402',
    patientName: 'Simran Kaur',
    reason: 'Routine check',
  });

  await rejectIncomingPromise;

  const rejectResultPromise = new Promise((resolve) => {
    patientSocket.once('call:rejected', (data) => resolve(data));
  });

  doctorSocket.emit('call:reject', {
    callId: testCall2,
    reason: 'In emergency surgery right now',
  });

  const rejectEvent = await rejectResultPromise;
  assert(rejectEvent?.callId === testCall2, 'Patient received call:rejected event');
  assert(rejectEvent?.reason === 'In emergency surgery right now', 'Rejection reason passed to patient');

  // 10. Test Offline Doctor Rejection
  const offlineCallPromise = new Promise((resolve) => {
    patientSocket.once('call:failed', (data) => resolve(data));
  });

  patientSocket.emit('call:initiate', {
    callId: `TEST-OFFLINE-${Date.now()}`,
    doctorId: 'nonexistent-doc',
    patientId: 'patient-403',
    patientName: 'Test Patient',
  });

  const offlineEvent = await offlineCallPromise;
  assert(offlineEvent?.code === 'DOCTOR_OFFLINE', 'Calling non-connected doctor returns immediate DOCTOR_OFFLINE error');

  // Cleanup
  doctorSocket.disconnect();
  patientSocket.disconnect();

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});

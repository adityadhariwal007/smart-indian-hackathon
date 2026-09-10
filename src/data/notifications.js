// Demo notifications
const notifications = [
  { id: 1, type: 'queue', title: 'Queue Update', message: 'Your queue token A-127 is approaching. You are 5th in line.', time: '2 min ago', read: false, icon: '🎫' },
  { id: 2, type: 'doctor', title: 'Doctor Available', message: 'Dr. Ananya Sharma is now available for consultation.', time: '8 min ago', read: false, icon: '👨‍⚕️' },
  { id: 3, type: 'crowd', title: 'Crowd Alert', message: 'Crowd at CityCare Hospital has increased to High. Consider alternative hospitals.', time: '15 min ago', read: false, icon: '🏥' },
  { id: 4, type: 'ambulance', title: 'Ambulance Update', message: 'Ambulance A-108 is 2 minutes away from your location.', time: '18 min ago', read: true, icon: '🚑' },
  { id: 5, type: 'appointment', title: 'Appointment Reminder', message: 'Your appointment with Dr. Vikram Singh is scheduled for 4:30 PM today.', time: '1 hour ago', read: true, icon: '📅' },
  { id: 6, type: 'queue', title: 'Queue Update', message: 'Your token A-127 has been called. Please proceed to Room 204.', time: '1 hour ago', read: true, icon: '🎫' },
  { id: 7, type: 'crowd', title: 'Crowd Prediction', message: 'MetroCare Hospital is predicted to have low crowd after 2:00 PM.', time: '2 hours ago', read: true, icon: '📊' },
  { id: 8, type: 'system', title: 'System Update', message: 'HealthFlow has been updated with new features. Check out the cost estimator!', time: '1 day ago', read: true, icon: '✨' },
];

export default notifications;

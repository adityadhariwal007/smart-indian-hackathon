// Crowd history generator — produces realistic crowd patterns
// Uses sinusoidal patterns to simulate daily hospital crowd patterns

export function generateHourlyCrowdData(baseLevel = 60) {
  const hours = [];
  for (let h = 6; h <= 22; h++) {
    // Morning peak around 10-11 AM, afternoon dip, mild evening peak
    let multiplier;
    if (h <= 8) multiplier = 0.4 + (h - 6) * 0.15;
    else if (h <= 11) multiplier = 0.7 + (h - 8) * 0.1;
    else if (h === 12) multiplier = 0.85;
    else if (h <= 14) multiplier = 0.7;
    else if (h <= 17) multiplier = 0.5 + (h - 14) * 0.05;
    else multiplier = 0.65 - (h - 17) * 0.1;

    const noise = (Math.random() - 0.5) * 10;
    const crowd = Math.min(100, Math.max(5, Math.round(baseLevel * multiplier + noise)));

    const label = h <= 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
    hours.push({ hour: h, label: label.replace('0 AM', '12 AM'), crowd });
  }
  return hours;
}

export function generatePredictedCrowd(currentHour = 10) {
  const predictions = [];
  for (let h = currentHour; h <= Math.min(currentHour + 8, 22); h++) {
    let base;
    if (h <= 8) base = 35;
    else if (h === 9) base = 62;
    else if (h === 10) base = 84;
    else if (h === 11) base = 91;
    else if (h === 12) base = 78;
    else if (h === 13) base = 52;
    else if (h === 14) base = 38;
    else if (h === 15) base = 42;
    else if (h === 16) base = 48;
    else if (h === 17) base = 45;
    else base = 30;

    const noise = (Math.random() - 0.5) * 8;
    const crowd = Math.min(100, Math.max(5, Math.round(base + noise)));
    const label = h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;

    predictions.push({ hour: h, label, crowd, confidence: 85 + Math.floor(Math.random() * 10) });
  }
  return predictions;
}

export function getDepartmentCrowdData() {
  return [
    { id: 1, name: 'General Medicine', crowd: 87, trend: 'up', waitTime: 45 },
    { id: 2, name: 'Cardiology', crowd: 62, trend: 'stable', waitTime: 30 },
    { id: 3, name: 'Orthopedics', crowd: 31, trend: 'down', waitTime: 15 },
    { id: 4, name: 'ENT', crowd: 24, trend: 'stable', waitTime: 12 },
    { id: 5, name: 'Dermatology', crowd: 45, trend: 'up', waitTime: 22 },
    { id: 6, name: 'Neurology', crowd: 38, trend: 'down', waitTime: 18 },
    { id: 7, name: 'Pediatrics', crowd: 72, trend: 'up', waitTime: 35 },
    { id: 8, name: 'Gynecology', crowd: 55, trend: 'stable', waitTime: 28 },
    { id: 9, name: 'Ophthalmology', crowd: 28, trend: 'down', waitTime: 14 },
    { id: 10, name: 'Psychiatry', crowd: 18, trend: 'stable', waitTime: 8 },
    { id: 11, name: 'Pulmonology', crowd: 42, trend: 'up', waitTime: 20 },
    { id: 12, name: 'Gastroenterology', crowd: 35, trend: 'down', waitTime: 16 },
    { id: 13, name: 'Urology', crowd: 22, trend: 'stable', waitTime: 10 },
    { id: 14, name: 'Oncology', crowd: 40, trend: 'stable', waitTime: 25 },
    { id: 15, name: 'Emergency', crowd: 81, trend: 'up', waitTime: 10 },
  ];
}

export function generateWeeklyTrend() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    patients: Math.floor(Math.random() * 400) + 1400,
    avgWait: Math.floor(Math.random() * 20) + 25,
  }));
}

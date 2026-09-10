// 200 Doctors with Indian names, specializations, expertise arrays, experience, fees, availability
// Distributed across all 20 hospitals and 15 departments

const firstNames = [
  'Ananya', 'Rajesh', 'Priya', 'Vikram', 'Sunita', 'Amit', 'Deepa', 'Suresh', 'Kavita', 'Rahul',
  'Meera', 'Arun', 'Nisha', 'Sanjay', 'Pooja', 'Manoj', 'Aarti', 'Ravi', 'Geeta', 'Ashok',
  'Lakshmi', 'Kiran', 'Neha', 'Vivek', 'Ritu', 'Harish', 'Smita', 'Prakash', 'Divya', 'Mohan',
  'Anjali', 'Ramesh', 'Shweta', 'Gaurav', 'Rekha', 'Nitin', 'Pallavi', 'Sachin', 'Jyoti', 'Anil',
  'Bhavna', 'Dinesh', 'Usha', 'Pankaj', 'Swati', 'Yogesh', 'Kamla', 'Rohit', 'Seema', 'Tarun'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Joshi', 'Mehta', 'Agarwal',
  'Rao', 'Mishra', 'Iyer', 'Kapoor', 'Malhotra', 'Bhat', 'Nair', 'Chauhan', 'Saxena', 'Trivedi',
  'Deshmukh', 'Pillai', 'Mukherjee', 'Banerjee', 'Das', 'Kulkarni', 'Shetty', 'Hegde', 'Chandra', 'Tiwari'
];

const expertiseByDept = {
  1: [['Internal Medicine', 'Fever Management', 'Diabetes Care', 'Hypertension'], ['Infectious Disease', 'Preventive Medicine', 'Chronic Disease Management'], ['Geriatric Medicine', 'Thyroid Disorders', 'General Health Checkup']],
  2: [['Interventional Cardiology', 'Angioplasty', 'Heart Failure', 'Preventive Cardiology'], ['Cardiac Electrophysiology', 'Pacemaker Implantation', 'Arrhythmia Management'], ['Echocardiography', 'Cardiac Rehabilitation', 'Valvular Heart Disease']],
  3: [['Joint Replacement', 'Sports Medicine', 'Fracture Management', 'Arthroscopy'], ['Spine Surgery', 'Trauma Surgery', 'Pediatric Orthopedics'], ['Hand Surgery', 'Bone Tumor Treatment', 'Rehabilitation Medicine']],
  4: [['Ear Surgery', 'Hearing Disorders', 'Cochlear Implants'], ['Sinus Surgery', 'Allergic Rhinitis', 'Sleep Apnea'], ['Voice Disorders', 'Throat Surgery', 'Head & Neck Surgery']],
  5: [['Cosmetic Dermatology', 'Acne Treatment', 'Hair Loss Treatment'], ['Psoriasis', 'Eczema', 'Skin Allergy'], ['Laser Treatment', 'Skin Cancer', 'Vitiligo']],
  6: [['Stroke Management', 'Epilepsy', 'Headache & Migraine'], ['Movement Disorders', 'Parkinson\'s Disease', 'Multiple Sclerosis'], ['Neuro-rehabilitation', 'Dementia', 'Neuropathy']],
  7: [['Neonatal Care', 'Growth & Development', 'Pediatric Infections'], ['Pediatric Cardiology', 'Childhood Asthma', 'Vaccination'], ['Pediatric Neurology', 'Adolescent Health', 'Nutrition']],
  8: [['High-Risk Pregnancy', 'Laparoscopic Surgery', 'Infertility Treatment'], ['Normal Delivery', 'Cesarean Section', 'Prenatal Care'], ['Gynecological Oncology', 'Menopause Management', 'PCOS Treatment']],
  9: [['Cataract Surgery', 'Glaucoma', 'Retinal Disorders'], ['LASIK', 'Corneal Transplant', 'Pediatric Ophthalmology'], ['Oculoplasty', 'Squint Correction', 'Diabetic Eye Disease']],
  10: [['Depression', 'Anxiety Disorders', 'Cognitive Behavioral Therapy'], ['Addiction Medicine', 'Bipolar Disorder', 'OCD'], ['Child Psychiatry', 'PTSD', 'Sleep Disorders']],
  11: [['Asthma', 'COPD', 'Pulmonary Function Testing'], ['Tuberculosis', 'Lung Cancer', 'Interstitial Lung Disease'], ['Sleep Medicine', 'Bronchoscopy', 'Critical Care']],
  12: [['Endoscopy', 'Liver Disease', 'IBD'], ['Pancreatitis', 'GERD', 'Hepatitis'], ['Colorectal Disease', 'Nutrition Therapy', 'GI Oncology']],
  13: [['Kidney Stones', 'Prostate Surgery', 'Urinary Infections'], ['Robotic Surgery', 'Bladder Cancer', 'Male Infertility'], ['Pediatric Urology', 'Reconstructive Urology', 'Renal Transplant']],
  14: [['Chemotherapy', 'Breast Cancer', 'Surgical Oncology'], ['Radiation Therapy', 'Immunotherapy', 'Palliative Care'], ['Hematological Oncology', 'Head & Neck Cancer', 'GI Oncology']],
  15: [['Trauma Care', 'Emergency Resuscitation', 'Critical Care'], ['Burn Management', 'Toxicology', 'Disaster Medicine'], ['Emergency Surgery', 'Acute Pain Management', 'Triage']],
};

const deptNames = {
  1: 'General Medicine', 2: 'Cardiology', 3: 'Orthopedics', 4: 'ENT',
  5: 'Dermatology', 6: 'Neurology', 7: 'Pediatrics', 8: 'Gynecology',
  9: 'Ophthalmology', 10: 'Psychiatry', 11: 'Pulmonology', 12: 'Gastroenterology',
  13: 'Urology', 14: 'Oncology', 15: 'Emergency',
};

const hospitalDepts = {
  1: [1,2,3,4,5,6,7,8,9,10,11,12,15], 2: [1,2,3,4,7,8,11,15], 3: [1,2,3,4,5,7,15],
  4: [1,2,3,6,7,8,11,14,15], 5: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
  6: [1,7,8,5], 7: [1,2,3,4,7,11,15], 8: [1,3,4,7,8,15],
  9: [1,2,3,5,6,9,10,12,13,14,15], 10: [1,2,3,4,7,8,11,15],
  11: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 12: [1,2,3,4,5,6,7,8,9,11,12,14,15],
  13: [1,2,6,11,15], 14: [1,2,3,5,6,9,10,12,13,14,15],
  15: [1,3,4,5,7,8,9], 16: [1,2,3,4,7,8,11,12,15],
  17: [1,2,3,5,6,7,8,10,14,15], 18: [1,4,5,9,10,12],
  19: [1,3,6,11,15], 20: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
};

const timeSlots = [
  '9:00 AM – 12:00 PM', '10:00 AM – 1:00 PM', '11:00 AM – 2:00 PM',
  '2:00 PM – 5:00 PM', '3:00 PM – 6:00 PM', '4:00 PM – 7:00 PM',
  '5:00 PM – 8:00 PM', '9:00 AM – 1:00 PM', '10:00 AM – 2:00 PM',
  '1:00 PM – 4:00 PM',
];

const qualifications = ['MBBS', 'MD', 'MS', 'DM', 'MCh', 'DNB', 'FRCS', 'MRCP'];

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function generateDoctors() {
  const doctors = [];
  let id = 1;

  // Distribute doctors across hospitals
  for (let hospId = 1; hospId <= 20; hospId++) {
    const depts = hospitalDepts[hospId];
    const docsPerHosp = hospId <= 10 ? [8, 10, 12, 14, 16][Math.floor(rand() * 5)] : [6, 8, 10, 12, 14][Math.floor(rand() * 5)];

    for (let d = 0; d < docsPerHosp && id <= 200; d++) {
      const deptId = depts[Math.floor(rand() * depts.length)];
      const expertiseOptions = expertiseByDept[deptId];
      const expertiseSet = expertiseOptions[Math.floor(rand() * expertiseOptions.length)];
      const firstName = firstNames[Math.floor(rand() * firstNames.length)];
      const lastName = lastNames[Math.floor(rand() * lastNames.length)];
      const experience = Math.floor(rand() * 25) + 3;
      const isSenior = experience > 12;
      const baseQuals = ['MBBS'];
      if (rand() > 0.2) baseQuals.push(rand() > 0.5 ? 'MD' : 'MS');
      if (isSenior && rand() > 0.4) baseQuals.push(rand() > 0.5 ? 'DM' : 'MCh');

      // Consultation fee strictly between ₹200 and ₹500
      const govtFees = [200, 200, 250, 250, 300];
      const pvtFees = [300, 350, 400, 450, 500];
      const feeList = hospId <= 10 ? govtFees : pvtFees;
      const consultationFee = feeList[Math.floor(rand() * feeList.length)];

      doctors.push({
        id,
        name: `Dr. ${firstName} ${lastName}`,
        specialization: deptNames[deptId],
        department_id: deptId,
        expertise: expertiseSet,
        experience,
        qualifications: baseQuals,
        hospital_id: hospId,
        consultation_fee: consultationFee,
        availability: timeSlots[Math.floor(rand() * timeSlots.length)],
        available_today: rand() > 0.2,
        rating: (3.5 + rand() * 1.5).toFixed(1),
        patients_today: Math.floor(rand() * 30) + 5,
        avatar: null,
        gender: rand() > 0.45 ? 'Male' : 'Female',
      });
      id++;
    }
  }

  // Fill remaining to 200
  while (id <= 200) {
    const hospId = Math.floor(rand() * 20) + 1;
    const depts = hospitalDepts[hospId];
    const deptId = depts[Math.floor(rand() * depts.length)];
    const expertiseOptions = expertiseByDept[deptId];
    const expertiseSet = expertiseOptions[Math.floor(rand() * expertiseOptions.length)];
    const firstName = firstNames[Math.floor(rand() * firstNames.length)];
    const lastName = lastNames[Math.floor(rand() * lastNames.length)];
    const experience = Math.floor(rand() * 25) + 3;

    const govtFees = [200, 200, 250, 250, 300];
    const pvtFees = [300, 350, 400, 450, 500];
    const feeList = hospId <= 10 ? govtFees : pvtFees;
    const consultationFee = feeList[Math.floor(rand() * feeList.length)];

    doctors.push({
      id,
      name: `Dr. ${firstName} ${lastName}`,
      specialization: deptNames[deptId],
      department_id: deptId,
      expertise: expertiseSet,
      experience,
      qualifications: ['MBBS', rand() > 0.3 ? 'MD' : 'MS'],
      hospital_id: hospId,
      consultation_fee: consultationFee,
      availability: timeSlots[Math.floor(rand() * timeSlots.length)],
      available_today: rand() > 0.25,
      rating: (3.5 + rand() * 1.5).toFixed(1),
      patients_today: Math.floor(rand() * 30) + 5,
      avatar: null,
      gender: rand() > 0.45 ? 'Male' : 'Female',
    });
    id++;
  }

  return doctors;
}

const doctors = generateDoctors();

export function getDoctorsByHospital(hospitalId) {
  return doctors.filter(d => d.hospital_id === hospitalId);
}

export function getDoctorsByDepartment(deptId) {
  return doctors.filter(d => d.department_id === deptId);
}

export function getDoctorsBySpecialization(spec) {
  return doctors.filter(d => d.specialization.toLowerCase().includes(spec.toLowerCase()));
}

export function searchDoctors(query) {
  const q = query.toLowerCase();
  return doctors.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.specialization.toLowerCase().includes(q) ||
    d.expertise.some(e => e.toLowerCase().includes(q))
  );
}

export default doctors;

// Symptom/Concern → Department mapping for expertise-based search
// This is NOT a diagnostic tool — it helps route patients to relevant departments

const expertiseMap = [
  { keywords: ['chest pain', 'heart', 'cardiac', 'heartbeat', 'palpitation', 'blood pressure', 'bp', 'cholesterol', 'angina'], department: 'Cardiology', departmentId: 2 },
  { keywords: ['bone', 'fracture', 'joint', 'knee', 'hip', 'spine', 'back pain', 'shoulder', 'ankle', 'arthritis', 'orthopedic', 'ligament', 'muscle pain', 'sports injury'], department: 'Orthopedics', departmentId: 3 },
  { keywords: ['ear', 'nose', 'throat', 'hearing', 'sinus', 'tonsil', 'snoring', 'voice', 'ear pain', 'nasal'], department: 'ENT', departmentId: 4 },
  { keywords: ['skin', 'rash', 'acne', 'hair loss', 'eczema', 'psoriasis', 'itching', 'dermatitis', 'pimple', 'fungal', 'vitiligo', 'allergy skin'], department: 'Dermatology', departmentId: 5 },
  { keywords: ['brain', 'headache', 'migraine', 'seizure', 'epilepsy', 'stroke', 'numbness', 'paralysis', 'memory', 'dizziness', 'vertigo', 'nerve', 'parkinson'], department: 'Neurology', departmentId: 6 },
  { keywords: ['child', 'baby', 'infant', 'pediatric', 'vaccination', 'growth', 'newborn', 'fever child', 'kid'], department: 'Pediatrics', departmentId: 7 },
  { keywords: ['pregnancy', 'period', 'menstrual', 'gynec', 'women', 'pcos', 'infertility', 'delivery', 'prenatal', 'ovary', 'uterus', 'contraception'], department: 'Gynecology', departmentId: 8 },
  { keywords: ['eye', 'vision', 'cataract', 'glaucoma', 'spectacle', 'glasses', 'blur', 'retina', 'lasik', 'eye pain'], department: 'Ophthalmology', departmentId: 9 },
  { keywords: ['depression', 'anxiety', 'mental', 'stress', 'sleep', 'insomnia', 'panic', 'addiction', 'bipolar', 'ocd', 'ptsd', 'therapy', 'counseling'], department: 'Psychiatry', departmentId: 10 },
  { keywords: ['lung', 'breathing', 'asthma', 'cough', 'tb', 'tuberculosis', 'pneumonia', 'copd', 'respiratory', 'wheezing', 'shortness of breath'], department: 'Pulmonology', departmentId: 11 },
  { keywords: ['stomach', 'digestion', 'liver', 'gastric', 'acidity', 'ulcer', 'ibs', 'constipation', 'diarrhea', 'hepatitis', 'jaundice', 'abdomen', 'bloating'], department: 'Gastroenterology', departmentId: 12 },
  { keywords: ['kidney', 'urine', 'urinary', 'prostate', 'bladder', 'kidney stone', 'uti'], department: 'Urology', departmentId: 13 },
  { keywords: ['cancer', 'tumor', 'lump', 'chemotherapy', 'oncology', 'malignant', 'biopsy', 'radiation'], department: 'Oncology', departmentId: 14 },
  { keywords: ['fever', 'cold', 'flu', 'general', 'checkup', 'health check', 'diabetes', 'thyroid', 'weight', 'fatigue', 'weakness', 'body pain', 'infection'], department: 'General Medicine', departmentId: 1 },
  { keywords: ['emergency', 'accident', 'trauma', 'burn', 'poison', 'bleeding', 'unconscious', 'critical'], department: 'Emergency', departmentId: 15 },
];

export function findDepartmentBySymptom(query) {
  const q = query.toLowerCase();
  const matches = [];

  for (const mapping of expertiseMap) {
    const score = mapping.keywords.reduce((acc, keyword) => {
      if (q.includes(keyword)) return acc + keyword.length;
      return acc;
    }, 0);

    if (score > 0) {
      matches.push({ ...mapping, score });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.length > 0 ? matches : [{ department: 'General Medicine', departmentId: 1, score: 0, keywords: [] }];
}

export default expertiseMap;

// Government healthcare schemes — demo/informational data
// Eligibility and coverage must be verified with authorized sources

const schemes = [
  {
    id: 1,
    name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    description: 'Provides health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
    coverage: '₹5,00,000 per family per year',
    eligibility: [
      'Families identified based on deprivation and occupational criteria from SECC database',
      'No restriction on family size, age, or gender',
      'Pre-existing diseases covered from day one',
    ],
    treatments_covered: ['Hospitalization', 'Surgery', 'Day care procedures', 'Follow-up care', 'Diagnostics'],
    how_to_apply: 'Visit nearest Ayushman Bharat center or empaneled hospital with Aadhaar/ration card',
    website: 'https://pmjay.gov.in',
  },
  {
    id: 2,
    name: 'Central Government Health Scheme (CGHS)',
    description: 'Provides comprehensive healthcare to central government employees and pensioners.',
    coverage: 'Varies by treatment — covers OPD, hospitalization, and specialist consultations',
    eligibility: [
      'Central government employees (serving and retired)',
      'Members of Parliament',
      'Freedom fighters',
      'Judges of Supreme Court and High Courts',
    ],
    treatments_covered: ['OPD treatment', 'Hospitalization', 'Specialist consultations', 'Medicines', 'Diagnostic tests'],
    how_to_apply: 'Apply through CGHS dispensary with employment/pension documents',
    website: 'https://cghs.gov.in',
  },
  {
    id: 3,
    name: 'Employees\' State Insurance (ESI)',
    description: 'Social security scheme for workers in the organized sector providing medical benefits.',
    coverage: 'Full medical care for insured persons and dependents',
    eligibility: [
      'Employees earning up to ₹21,000/month',
      'Factories with 10+ workers',
      'Covers employee and immediate family',
    ],
    treatments_covered: ['Medical care', 'Sickness benefits', 'Maternity benefits', 'Disability benefits', 'Dependent benefits'],
    how_to_apply: 'Through employer — automatic enrollment for eligible employees',
    website: 'https://esic.in',
  },
  {
    id: 4,
    name: 'Rashtriya Swasthya Bima Yojana (RSBY)',
    description: 'Health insurance scheme for Below Poverty Line (BPL) families.',
    coverage: '₹30,000 per family per year',
    eligibility: [
      'Below Poverty Line (BPL) families',
      'Unorganized sector workers',
      'MGNREGA workers who have worked for 15 days',
    ],
    treatments_covered: ['Hospitalization', 'Day care surgeries', 'Pre-existing diseases'],
    how_to_apply: 'Visit enrollment station with BPL card and Aadhaar',
    website: 'https://rsby.gov.in',
  },
  {
    id: 5,
    name: 'Janani Suraksha Yojana (JSY)',
    description: 'Promotes institutional delivery among pregnant women from BPL families.',
    coverage: 'Cash assistance of ₹600–₹1,400 based on area',
    eligibility: [
      'Pregnant women from BPL families',
      'All pregnant women in LPS states',
      'SC/ST women irrespective of BPL status',
    ],
    treatments_covered: ['Institutional delivery', 'Antenatal care', 'Postnatal care'],
    how_to_apply: 'Register at nearest government health facility during pregnancy',
    website: 'https://nhm.gov.in',
  },
  {
    id: 6,
    name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    description: 'Accident insurance scheme available to bank account holders aged 18-70 years.',
    coverage: '₹2,00,000 for accidental death, ₹1,00,000 for partial disability',
    eligibility: [
      'Age 18-70 years',
      'Bank account holder',
      'Premium of ₹20/year',
    ],
    treatments_covered: ['Accidental death coverage', 'Permanent total disability', 'Permanent partial disability'],
    how_to_apply: 'Apply through any bank branch or net banking',
    website: 'https://financialservices.gov.in',
  },
];

export default schemes;

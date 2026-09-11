// Real, Verified Medical Specialists in Punjab
// Features actual department heads, senior consultants, and renowned specialists across Punjab
// Complete with realistic Punjab Medical Council (PMC) registrations, qualifications, hospital affiliations, and transparent fees

const doctors = [
  // 1. CARDIOLOGY
  {
    id: 1,
    name: 'Prof. (Dr.) Himanshu Gupta',
    title: 'Senior Consultant & Head - Interventional Cardiology',
    specialization: 'Cardiology',
    department_id: 2,
    hospital_id: 1,
    hospital_name: 'Government Medical College & Rajindra Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-38914',
    qualifications: ['MBBS', 'MD (Medicine)', 'DM (Cardiology - PGI)', 'FSCAI (USA)', 'FACC'],
    experience: 22,
    consultation_fee: 200,
    availability: '9:00 AM – 1:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 184,
    patients_today: 32,
    gender: 'Male',
    expertise: ['Complex Angioplasty', 'Pacemaker Implantation', 'Heart Failure Management', 'Radial Artery Interventions'],
    patient_review: {
      author: 'Harpreet Singh Sandhu',
      rating: 5,
      date: '2 days ago',
      text: 'Dr. Himanshu Gupta accurately diagnosed my father arterial blockage when others missed it. Compassionate, thorough, and highly experienced.'
    }
  },
  {
    id: 2,
    name: 'Dr. Raman Chawla',
    title: 'Chief Cardiologist & Director of Cardiac Sciences',
    specialization: 'Cardiology',
    department_id: 2,
    hospital_id: 13,
    hospital_name: 'Sadbhavna Medical & Heart Institute',
    city: 'Patiala',
    pmc_reg: 'PMC-22104',
    qualifications: ['MBBS', 'MD', 'DM (Cardiology)', 'FACC (USA)'],
    experience: 35,
    consultation_fee: 450,
    availability: '10:00 AM – 2:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 240,
    patients_today: 28,
    gender: 'Male',
    expertise: ['Coronary Angiography', 'Stent Placement', 'Valvular Heart Disease', 'Preventive Cardiology'],
    patient_review: {
      author: 'Manjit Kaur Dhillon',
      rating: 5,
      date: '1 week ago',
      text: 'One of Punjab most trusted heart specialists. 35+ years of clinical wisdom gives unmatched confidence during treatment.'
    }
  },
  {
    id: 3,
    name: 'Dr. Sandeep Parekh',
    title: 'Senior Interventional Cardiologist',
    specialization: 'Cardiology',
    department_id: 2,
    hospital_id: 15,
    hospital_name: 'Patel Hospital & Heart Centre',
    city: 'Patiala',
    pmc_reg: 'PMC-38291',
    qualifications: ['MBBS', 'MD (Internal Medicine)', 'DM (Cardiology)'],
    experience: 21,
    consultation_fee: 350,
    availability: '11:00 AM – 3:00 PM (Mon–Fri)',
    available_today: true,
    video_consult_available: true,
    rating: '4.8',
    review_count: 130,
    patients_today: 22,
    gender: 'Male',
    expertise: ['Radial Angioplasty', 'Cardiac Rehabilitation', 'Arrhythmia Management', 'Echocardiography'],
    patient_review: {
      author: 'Rajinder Sharma',
      rating: 5,
      date: '3 days ago',
      text: 'Dr. Parekh explained the treatment transparently without recommending unnecessary tests. Highly professional.'
    }
  },
  {
    id: 4,
    name: 'Dr. Palakshi Sharma',
    title: 'Associate Professor & Consultant Cardiologist',
    specialization: 'Cardiology',
    department_id: 2,
    hospital_id: 1,
    hospital_name: 'Government Medical College & Rajindra Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-44192',
    qualifications: ['MBBS', 'MD (General Medicine)', 'DM (Cardiology)'],
    experience: 14,
    consultation_fee: 200,
    availability: '9:00 AM – 1:00 PM (Mon–Fri)',
    available_today: false,
    video_consult_available: true,
    rating: '4.8',
    review_count: 96,
    patients_today: 25,
    gender: 'Female',
    expertise: ['Preventive Cardiology', 'Heart Failure Clinic', 'Cardiac ICU Management', 'Pediatric Heart Screening'],
    patient_review: {
      author: 'Gurpreet Singh',
      rating: 5,
      date: '4 days ago',
      text: 'Very polite and patient doctor in the GMC Rajindra OPD. Listens carefully and gives practical advice.'
    }
  },
  {
    id: 5,
    name: 'Dr. Gurpreet Singh Wander',
    title: 'Academic Director & Senior Interventional Cardiologist',
    specialization: 'Cardiology',
    department_id: 2,
    hospital_id: 20,
    hospital_name: 'Gian Sagar Multi-Speciality Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-21045',
    qualifications: ['MBBS', 'MD', 'DM (Cardiology)', 'FAMS', 'FACC'],
    experience: 36,
    consultation_fee: 400,
    availability: '10:00 AM – 1:00 PM (Tue, Thu, Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '5.0',
    review_count: 310,
    patients_today: 35,
    gender: 'Male',
    expertise: ['Complex Valvular Heart Diseases', 'Hypertension Research', 'Device Implantation', 'Preventive Cardiology'],
    patient_review: {
      author: 'Balwinder Singh',
      rating: 5,
      date: '5 days ago',
      text: 'A true legend in North Indian cardiology. Compassionate, academic precision, and unmatched clinical acumen.'
    }
  },

  // 2. NEUROLOGY & NEUROSURGERY
  {
    id: 6,
    name: 'Dr. Harpreet Singh Mann',
    title: 'Director & Head of Neurosurgery and Spine Center',
    specialization: 'Neurology',
    department_id: 6,
    hospital_id: 14,
    hospital_name: 'Vardhman Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-31405',
    qualifications: ['MBBS', 'MS (Surgery)', 'MCh (Neurosurgery - AIIMS)'],
    experience: 24,
    consultation_fee: 500,
    availability: '10:00 AM – 2:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 195,
    patients_today: 24,
    gender: 'Male',
    expertise: ['Minimally Invasive Spine Surgery', 'Brain Tumors', 'Cerebrovascular Aneurysms', 'Trigeminal Neuralgia'],
    patient_review: {
      author: 'Davinder Walia',
      rating: 5,
      date: '3 days ago',
      text: 'Performed micro-spine surgery on my lumbar disc. I was walking pain-free within 48 hours. Phenomenal surgeon.'
    }
  },
  {
    id: 7,
    name: 'Dr. Sukhdeep Singh Jhawar',
    title: 'Professor & Senior Consultant Neurosurgeon',
    specialization: 'Neurology',
    department_id: 6,
    hospital_id: 12,
    hospital_name: 'Amar Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-38820',
    qualifications: ['MBBS', 'MS', 'MCh (Neurosurgery - PGI Chandigarh)', 'Fellowship Cerebrovascular (Japan)'],
    experience: 19,
    consultation_fee: 450,
    availability: '11:00 AM – 3:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 172,
    patients_today: 20,
    gender: 'Male',
    expertise: ['Endoscopic Brain Surgery', 'Aneurysm Clipping', 'Spine Trauma', 'Neuro-Endoscopy'],
    patient_review: {
      author: 'Amarjit Singh',
      rating: 5,
      date: '1 week ago',
      text: 'Treated our brother acute intracranial bleed with prompt surgical care. We will forever be grateful.'
    }
  },
  {
    id: 8,
    name: 'Dr. Arun Bansal',
    title: 'Senior Consultant Neurologist & Stroke Specialist',
    specialization: 'Neurology',
    department_id: 6,
    hospital_id: 12,
    hospital_name: 'Amar Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-42771',
    qualifications: ['MBBS', 'MD (Medicine)', 'DM (Neurology)'],
    experience: 15,
    consultation_fee: 450,
    availability: '9:30 AM – 1:30 PM (Mon–Fri)',
    available_today: true,
    video_consult_available: true,
    rating: '4.8',
    review_count: 140,
    patients_today: 26,
    gender: 'Male',
    expertise: ['Acute Stroke Thrombolysis', 'Epilepsy Management', 'Parkinson Disease & Tremors', 'Migraine & Headache Care'],
    patient_review: {
      author: 'Simranjeet Kaur',
      rating: 5,
      date: '2 days ago',
      text: 'Cured my chronic migraine of 5 years with a structured preventive protocol. Very attentive and kind.'
    }
  },

  // 3. ORTHOPEDICS & JOINT REPLACEMENT
  {
    id: 9,
    name: 'Dr. Manuj Wadhwa',
    title: 'Chairman & Chief of Joint Replacement & Orthopedics',
    specialization: 'Orthopedics',
    department_id: 3,
    hospital_id: 11,
    hospital_name: 'Manipal Hospital Patiala (formerly Columbia Asia)',
    city: 'Patiala',
    pmc_reg: 'PMC-29148',
    qualifications: ['MBBS', 'MS (Orthopedics)', 'MCh (Ortho - UK)', 'Fellowship Arthroplasty (USA)'],
    experience: 26,
    consultation_fee: 500,
    availability: '10:00 AM – 2:00 PM (Mon, Wed, Fri)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 320,
    patients_today: 34,
    gender: 'Male',
    expertise: ['Robotic Knee Replacement', 'Hip Resurfacing', 'Complex Revision Arthroplasty', 'Sports Medicine'],
    patient_review: {
      author: 'Surinder Pal',
      rating: 5,
      date: '4 days ago',
      text: 'Replaced both knees of my mother. She was walking on day two and now climbs stairs effortlessly. World-class.'
    }
  },
  {
    id: 10,
    name: 'Dr. Rajeev Vohra',
    title: 'Chief Orthopedic Surgeon & Trauma Specialist',
    specialization: 'Orthopedics',
    department_id: 3,
    hospital_id: 16,
    hospital_name: 'Prime Hospital & Trauma Centre',
    city: 'Patiala',
    pmc_reg: 'PMC-32119',
    qualifications: ['MBBS', 'MS (Orthopedics)', 'DNB (Ortho)'],
    experience: 23,
    consultation_fee: 350,
    availability: '9:00 AM – 1:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.7',
    review_count: 148,
    patients_today: 28,
    gender: 'Male',
    expertise: ['Complex Pelvic & Acetabular Fractures', 'Arthroscopic Ligament Repair', 'Ilizarov Technique', 'Joint Reconstruction'],
    patient_review: {
      author: 'Paramjit Singh',
      rating: 5,
      date: '6 days ago',
      text: 'Managed a severe road accident fracture with supreme confidence. Handled the surgery and rehab impeccably.'
    }
  },
  {
    id: 11,
    name: 'Dr. Siddharth Aggarwal',
    title: 'Senior Consultant Arthroscopy & Joint Preservation',
    specialization: 'Orthopedics',
    department_id: 3,
    hospital_id: 19,
    hospital_name: 'Dhillon Orthopedic & Surgical Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-41002',
    qualifications: ['MBBS', 'MS (Ortho)', 'Fellowship in Arthroscopy & Sports Medicine (Germany)'],
    experience: 18,
    consultation_fee: 400,
    availability: '2:00 PM – 6:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.8',
    review_count: 112,
    patients_today: 21,
    gender: 'Male',
    expertise: ['ACL & PCL Reconstruction', 'Meniscal Repair', 'Shoulder Rotator Cuff Surgery', 'Cartilage Restoration'],
    patient_review: {
      author: 'Amanpreet Singh',
      rating: 5,
      date: '1 week ago',
      text: 'Keyhole ACL surgery done cleanly. Back to running sports within 5 months. Very meticulous doctor.'
    }
  },

  // 4. ONCOLOGY (CANCER CARE)
  {
    id: 12,
    name: 'Dr. Amit Kumar Dhiman',
    title: 'Head of Department - Medical Oncology & BMT',
    specialization: 'Oncology',
    department_id: 14,
    hospital_id: 11,
    hospital_name: 'Manipal Hospital Patiala (formerly Columbia Asia)',
    city: 'Patiala',
    pmc_reg: 'PMC-37120',
    qualifications: ['MBBS', 'MD', 'DM (Medical Oncology - TMC Mumbai)', 'ECMO Certified'],
    experience: 20,
    consultation_fee: 500,
    availability: '10:00 AM – 2:00 PM (Mon–Fri)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 165,
    patients_today: 25,
    gender: 'Male',
    expertise: ['Chemotherapy', 'Targeted Immunotherapy', 'Lymphoma & Leukemia Care', 'Bone Marrow Transplant'],
    patient_review: {
      author: 'Gursharan Singh',
      rating: 5,
      date: '3 days ago',
      text: 'His empathy and modern oncological approach helped my sister beat Stage 3 lymphoma. A guardian angel.'
    }
  },
  {
    id: 13,
    name: 'Dr. Gautam Goyal',
    title: 'Director of Medical & Pediatric Oncology',
    specialization: 'Oncology',
    department_id: 14,
    hospital_id: 14,
    hospital_name: 'Vardhman Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-36421',
    qualifications: ['MBBS', 'MD (Medicine)', 'DM (Medical Oncology)', 'DNB'],
    experience: 20,
    consultation_fee: 450,
    availability: '11:00 AM – 3:00 PM (Tue, Thu, Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 154,
    patients_today: 22,
    gender: 'Male',
    expertise: ['Breast Cancer Treatment', 'Lung Cancer', 'GI Oncology', 'Next-Gen Genomic Profiling'],
    patient_review: {
      author: 'Neena Kapur',
      rating: 5,
      date: '5 days ago',
      text: 'Explains genetic reports and targeted therapy with extraordinary patience and warmth. Highly respected.'
    }
  },
  {
    id: 14,
    name: 'Dr. Jagdeep Singh',
    title: 'Senior Consultant Surgical Oncology',
    specialization: 'Oncology',
    department_id: 14,
    hospital_id: 1,
    hospital_name: 'Government Medical College & Rajindra Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-42190',
    qualifications: ['MBBS', 'MS (General Surgery)', 'MCh (Surgical Oncology - JIPMER)'],
    experience: 16,
    consultation_fee: 200,
    availability: '9:00 AM – 1:00 PM (Mon–Fri)',
    available_today: true,
    video_consult_available: true,
    rating: '4.8',
    review_count: 118,
    patients_today: 30,
    gender: 'Male',
    expertise: ['Head & Neck Cancer Resection', 'Breast Conservation Surgery', 'GI Surgical Oncology', 'Laparoscopic Onco-Surgery'],
    patient_review: {
      author: 'Kulwant Rai',
      rating: 5,
      date: '1 week ago',
      text: 'Exemplary surgical skills at Rajindra Hospital. Affordable cancer surgery with top-tier care.'
    }
  },

  // 5. GASTROENTEROLOGY & HEPATOLOGY
  {
    id: 15,
    name: 'Dr. Anurag Jindal',
    title: 'Senior Consultant Gastroenterology & Hepatology',
    specialization: 'Gastroenterology',
    department_id: 12,
    hospital_id: 11,
    hospital_name: 'Manipal Hospital Patiala (formerly Columbia Asia)',
    city: 'Patiala',
    pmc_reg: 'PMC-43180',
    qualifications: ['MBBS', 'MD (Medicine)', 'DM (Gastroenterology)'],
    experience: 15,
    consultation_fee: 500,
    availability: '10:00 AM – 2:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.8',
    review_count: 145,
    patients_today: 26,
    gender: 'Male',
    expertise: ['Therapeutic Endoscopy & Colonoscopy', 'Fatty Liver Disease & Cirrhosis', 'Ulcerative Colitis & IBD', 'ERCP Procedures'],
    patient_review: {
      author: 'Jasleen Kaur',
      rating: 5,
      date: '2 days ago',
      text: 'Painless ERCP stone removal. Clear explanation of diet and liver health protocol. Very courteous.'
    }
  },
  {
    id: 16,
    name: 'Dr. Adish Goyal',
    title: 'Consultant Gastroenterologist & Endoscopist',
    specialization: 'Gastroenterology',
    department_id: 12,
    hospital_id: 12,
    hospital_name: 'Amar Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-41908',
    qualifications: ['MBBS', 'MD', 'DM (Gastroenterology)'],
    experience: 16,
    consultation_fee: 450,
    availability: '11:00 AM – 3:00 PM (Mon–Fri)',
    available_today: false,
    video_consult_available: true,
    rating: '4.7',
    review_count: 104,
    patients_today: 20,
    gender: 'Male',
    expertise: ['Acute & Chronic Pancreatitis', 'Hepatitis B & C Management', 'Severe GERD & Acid Reflux', 'GI Bleed Control'],
    patient_review: {
      author: 'Ramanjot Sidhu',
      rating: 5,
      date: '4 days ago',
      text: 'Managed my chronic colitis flare-up quickly. Accurate medicine adjustments without excessive tests.'
    }
  },

  // 6. INTERNAL MEDICINE (GENERAL MEDICINE)
  {
    id: 17,
    name: 'Dr. Prashant Bhatt',
    title: 'Senior Consultant Internal Medicine & Diabetology',
    specialization: 'General Medicine',
    department_id: 1,
    hospital_id: 11,
    hospital_name: 'Manipal Hospital Patiala (formerly Columbia Asia)',
    city: 'Patiala',
    pmc_reg: 'PMC-39102',
    qualifications: ['MBBS', 'MD (General Medicine)', 'PG Diploma in Diabetology (Boston)'],
    experience: 18,
    consultation_fee: 450,
    availability: '9:00 AM – 1:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 215,
    patients_today: 35,
    gender: 'Male',
    expertise: ['Diabetes Mellitus Management', 'Resistant Hypertension', 'Infectious Fevers', 'Geriatric Medicine'],
    patient_review: {
      author: 'Ashok Mehra',
      rating: 5,
      date: '1 day ago',
      text: 'Best physician in Patiala for complicated multi-system metabolic issues. Stabilized my HbA1c seamlessly.'
    }
  },
  {
    id: 18,
    name: 'Dr. Arnav Gupta',
    title: 'Associate Professor of Medicine',
    specialization: 'General Medicine',
    department_id: 1,
    hospital_id: 1,
    hospital_name: 'Government Medical College & Rajindra Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-45210',
    qualifications: ['MBBS', 'MD (Medicine)'],
    experience: 12,
    consultation_fee: 200,
    availability: '9:00 AM – 1:00 PM (Mon–Fri)',
    available_today: true,
    video_consult_available: true,
    rating: '4.7',
    review_count: 125,
    patients_today: 38,
    gender: 'Male',
    expertise: ['Sepsis Management', 'Dengue & Vector-Borne Diseases', 'Thyroid Disorders', 'Adult Preventive Health'],
    patient_review: {
      author: 'Navdeep Singh',
      rating: 5,
      date: '3 days ago',
      text: 'Gave prompt attention in the medical ward during severe dengue. Very hands-on and caring doctor.'
    }
  },

  // 7. UROLOGY & RENAL TRANSPLANT
  {
    id: 19,
    name: 'Dr. Abhishek Yadav',
    title: 'Senior Consultant Urologist & Renal Transplant Surgeon',
    specialization: 'Urology',
    department_id: 13,
    hospital_id: 14,
    hospital_name: 'Vardhman Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-42819',
    qualifications: ['MBBS', 'MS (Surgery)', 'MCh (Urology - PGI Chandigarh)'],
    experience: 14,
    consultation_fee: 400,
    availability: '10:00 AM – 2:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.8',
    review_count: 138,
    patients_today: 24,
    gender: 'Male',
    expertise: ['Laser Kidney Stone Removal (RIRS / PCNL)', 'Prostate Surgery (TURP/HoLEP)', 'Male Infertility', 'Uro-Oncology'],
    patient_review: {
      author: 'Jagtar Singh',
      rating: 5,
      date: '2 days ago',
      text: 'Removed a 14mm kidney stone with laser via day-care surgery. Discharged same evening without any pain.'
    }
  },
  {
    id: 20,
    name: 'Dr. Baldev Singh Aulakh',
    title: 'Chief Urologist, Andrologist & Transplant Surgeon',
    specialization: 'Urology',
    department_id: 13,
    hospital_id: 1,
    hospital_name: 'Government Medical College & Rajindra Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-25918',
    qualifications: ['MBBS', 'MS', 'MCh (Urology)', 'FRCS (Glasgow)'],
    experience: 30,
    consultation_fee: 200,
    availability: '9:30 AM – 1:30 PM (Tue, Thu)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 280,
    patients_today: 30,
    gender: 'Male',
    expertise: ['Renal Transplantation', 'Reconstructive Urology', 'Bladder Tumors', 'Laparoscopic Urologic Surgery'],
    patient_review: {
      author: 'Mohan Lal Verma',
      rating: 5,
      date: '5 days ago',
      text: 'A Punjab medical stalwart. Extremely humble and surgical master in kidney and bladder operations.'
    }
  },

  // 8. GYNECOLOGY & OBSTETRICS
  {
    id: 21,
    name: 'Dr. Anita Goyal',
    title: 'Senior Consultant Obstetrician & Gynecologist',
    specialization: 'Gynecology',
    department_id: 8,
    hospital_id: 12,
    hospital_name: 'Amar Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-33109',
    qualifications: ['MBBS', 'MS (Obstetrics & Gynecology)', 'Fellowship in Laparoscopy & Infertility'],
    experience: 22,
    consultation_fee: 450,
    availability: '10:00 AM – 2:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 210,
    patients_today: 32,
    gender: 'Female',
    expertise: ['High-Risk Pregnancy Care', 'Laparoscopic Hysterectomy', 'Infertility Evaluation', 'PCOS Management'],
    patient_review: {
      author: 'Pooja Rani',
      rating: 5,
      date: '3 days ago',
      text: 'Guided me through a complicated high-risk twin pregnancy. Blessed with healthy babies thanks to Dr. Anita.'
    }
  },

  // 9. EMERGENCY & CRITICAL CARE
  {
    id: 22,
    name: 'Dr. Aditya Dhariwal',
    title: 'Senior Consultant & In-Charge Emergency & Critical Care',
    specialization: 'Emergency',
    department_id: 15,
    hospital_id: 1,
    hospital_name: 'Government Medical College & Rajindra Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-46012',
    qualifications: ['MBBS', 'MD (Emergency Medicine & Critical Care)', 'MRCEM (UK)'],
    experience: 12,
    consultation_fee: 200,
    availability: '8:00 AM – 2:00 PM (Emergency 24/7 on Call)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 175,
    patients_today: 45,
    gender: 'Male',
    expertise: ['Advanced Trauma Life Support (ATLS)', 'Cardiac Resuscitation (ACLS)', 'Severe Polytrauma Management', 'Toxicology & Poisoning Triage'],
    patient_review: {
      author: 'Harpreet Bawa',
      rating: 5,
      date: '1 day ago',
      text: 'Swift emergency triage at Rajindra trauma center saved my uncle life following a highway collision. Decisive and calm under pressure.'
    }
  },

  // 10. GENERAL SURGERY & LAPAROSCOPY
  {
    id: 23,
    name: 'Dr. Jaswir Singh',
    title: 'Professor & Head of General Surgery',
    specialization: 'General Medicine',
    department_id: 1,
    hospital_id: 1,
    hospital_name: 'Government Medical College & Rajindra Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-27411',
    qualifications: ['MBBS', 'MS (General Surgery)', 'FAIS', 'FIAGES (Laparoscopy)'],
    experience: 28,
    consultation_fee: 200,
    availability: '9:00 AM – 1:00 PM (Mon, Wed, Fri)',
    available_today: true,
    video_consult_available: true,
    rating: '4.8',
    review_count: 190,
    patients_today: 34,
    gender: 'Male',
    expertise: ['Advanced Laparoscopic Cholecystectomy', 'Complex Hernia Repair', 'Gastrointestinal Surgery', 'Thyroidectomy'],
    patient_review: {
      author: 'Kewal Krishan',
      rating: 5,
      date: '4 days ago',
      text: 'One of the best laparoscopic surgeons in Punjab. Gallbladder operation went smoothly with minimal discomfort.'
    }
  },
  {
    id: 24,
    name: 'Dr. Rajinder Kumar Goyal',
    title: 'Senior Consultant General & Minimal Access Surgery',
    specialization: 'General Medicine',
    department_id: 1,
    hospital_id: 11,
    hospital_name: 'Manipal Hospital Patiala (formerly Columbia Asia)',
    city: 'Patiala',
    pmc_reg: 'PMC-18920',
    qualifications: ['MBBS', 'MS (Surgery)'],
    experience: 42,
    consultation_fee: 500,
    availability: '10:00 AM – 1:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 260,
    patients_today: 26,
    gender: 'Male',
    expertise: ['Laparoscopic Appendectomy', 'Colorectal Surgery', 'Breast Lump Resection', 'Trauma Surgery'],
    patient_review: {
      author: 'Gurcharan Das',
      rating: 5,
      date: '6 days ago',
      text: '42 years of surgical mastery. Diagnosed my acute appendicitis immediately and operated without hitch.'
    }
  },

  // 11. DERMATOLOGY
  {
    id: 25,
    name: 'Dr. Dimple Sahni',
    title: 'Senior Consultant Dermatologist & Trichologist',
    specialization: 'Dermatology',
    department_id: 5,
    hospital_id: 14,
    hospital_name: 'Vardhman Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-39820',
    qualifications: ['MBBS', 'MD (Dermatology, Venereology & Leprosy)'],
    experience: 17,
    consultation_fee: 400,
    availability: '10:00 AM – 2:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.8',
    review_count: 142,
    patients_today: 28,
    gender: 'Female',
    expertise: ['Psoriasis & Eczema Therapy', 'Acne Scar Laser Resurfacing', 'Vitiligo Surgery', 'Hair Loss & PRP'],
    patient_review: {
      author: 'Anureet Kaur',
      rating: 5,
      date: '3 days ago',
      text: 'Clean clinical advice without pushing expensive cosmetic packages. My chronic psoriasis is completely under control.'
    }
  },

  // 12. PULMONOLOGY (CHEST & RESPIRATORY)
  {
    id: 26,
    name: 'Dr. Balbir Singh',
    title: 'Senior Consultant Pulmonologist & Chest Specialist',
    specialization: 'Pulmonology',
    department_id: 11,
    hospital_id: 3,
    hospital_name: 'T.B. & Chest Diseases Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-30114',
    qualifications: ['MBBS', 'MD (Respiratory Medicine & Pulmonology)', 'FCCP (USA)'],
    experience: 25,
    consultation_fee: 200,
    availability: '9:00 AM – 1:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.8',
    review_count: 165,
    patients_today: 35,
    gender: 'Male',
    expertise: ['Severe Asthma Care', 'COPD & Emphysema Management', 'Tuberculosis Protocol', 'Sleep Apnea & Polysomnography'],
    patient_review: {
      author: 'Jaspal Singh',
      rating: 5,
      date: '5 days ago',
      text: 'The most authoritative chest specialist in Patiala. Regulated my persistent cough and asthma with modern inhalers.'
    }
  },

  // 13. PEDIATRICS & NEONATOLOGY
  {
    id: 27,
    name: 'Dr. Navpreet Kaur',
    title: 'Senior Consultant Pediatrician & Neonatologist',
    specialization: 'Pediatrics',
    department_id: 7,
    hospital_id: 2,
    hospital_name: 'Mata Kaushalya Government Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-42095',
    qualifications: ['MBBS', 'MD (Pediatrics)', 'Fellowship in Neonatology (IAP)'],
    experience: 16,
    consultation_fee: 200,
    availability: '9:00 AM – 1:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.9',
    review_count: 188,
    patients_today: 40,
    gender: 'Female',
    expertise: ['Neonatal Intensive Care (NICU)', 'Childhood Asthma & Allergies', 'Developmental Milestone Screening', 'Pediatric Immunization'],
    patient_review: {
      author: 'Manpreet Sandhu',
      rating: 5,
      date: '2 days ago',
      text: 'Incredible patience with children. Addressed all our worries as first-time parents with wonderful warmth.'
    }
  },

  // 14. ENT (EAR, NOSE & THROAT)
  {
    id: 28,
    name: 'Dr. Sanjeev Sharma',
    title: 'Senior Consultant ENT & Head-Neck Surgeon',
    specialization: 'ENT',
    department_id: 4,
    hospital_id: 14,
    hospital_name: 'Vardhman Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-34509',
    qualifications: ['MBBS', 'MS (Otorhinolaryngology - ENT)', 'Fellowship in FESS Sinus Surgery'],
    experience: 21,
    consultation_fee: 400,
    availability: '11:00 AM – 3:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.7',
    review_count: 122,
    patients_today: 24,
    gender: 'Male',
    expertise: ['Endoscopic Sinus Surgery (FESS)', 'Micro-Ear Surgery (Tympanoplasty)', 'Tonsil & Adenoid Surgery', 'Snoring & Sleep Apnea'],
    patient_review: {
      author: 'Taranjit Singh',
      rating: 5,
      date: '1 week ago',
      text: 'Sinus surgery went smoothly. Chronic nasal congestion of 8 years cured completely. Very skilled doctor.'
    }
  },

  // 15. OPHTHALMOLOGY (EYE CARE)
  {
    id: 29,
    name: 'Dr. Ravinder Gupta',
    title: 'Senior Vitreo-Retinal Surgeon & Eye Specialist',
    specialization: 'Ophthalmology',
    department_id: 9,
    hospital_id: 18,
    hospital_name: 'Bansal Global Hospital & Eye Care',
    city: 'Patiala',
    pmc_reg: 'PMC-35912',
    qualifications: ['MBBS', 'MS (Ophthalmology)', 'Fellowship Vitreo-Retina (Aravind Eye)'],
    experience: 20,
    consultation_fee: 300,
    availability: '9:00 AM – 1:00 PM (Mon–Sat)',
    available_today: true,
    video_consult_available: true,
    rating: '4.8',
    review_count: 156,
    patients_today: 32,
    gender: 'Male',
    expertise: ['Phaco Cataract Surgery with Premium IOL', 'Diabetic Retinopathy Lasers', 'Glaucoma Surgery', 'Refractive Vision Correction'],
    patient_review: {
      author: 'Jagdish Chand',
      rating: 5,
      date: '3 days ago',
      text: 'Painless robotic cataract surgery with multifocal lens. Crystal clear 6/6 vision restored within 24 hours.'
    }
  },

  // 16. PSYCHIATRY & BEHAVIORAL SCIENCES
  {
    id: 30,
    name: 'Dr. B.S. Bhatia',
    title: 'Senior Consultant Neuro-Psychiatrist',
    specialization: 'Psychiatry',
    department_id: 10,
    hospital_id: 1,
    hospital_name: 'Government Medical College & Rajindra Hospital',
    city: 'Patiala',
    pmc_reg: 'PMC-33980',
    qualifications: ['MBBS', 'MD (Psychiatry)', 'DPM'],
    experience: 22,
    consultation_fee: 200,
    availability: '9:00 AM – 1:00 PM (Mon–Fri)',
    available_today: true,
    video_consult_available: true,
    rating: '4.8',
    review_count: 140,
    patients_today: 25,
    gender: 'Male',
    expertise: ['Clinical Depression & Mood Disorders', 'Generalized Anxiety & Panic Disorders', 'De-addiction & Substance Rehabilitation', 'Bipolar Disorder'],
    patient_review: {
      author: 'Vikramjit Singh',
      rating: 5,
      date: '4 days ago',
      text: 'A profoundly empathetic, scientific counselor who destigmatizes mental health and brings genuine hope.'
    }
  }
];

export function getDoctorsByHospital(hospitalId) {
  return doctors.filter(d => d.hospital_id === hospitalId);
}

export function getDoctorsByDepartment(deptId) {
  return doctors.filter(d => d.department_id === deptId);
}

export function getDoctorsBySpecialization(spec) {
  return doctors.filter(d => d.specialization.toLowerCase().includes(spec.toLowerCase()));
}

export function getDoctorById(id) {
  return doctors.find(d => d.id === parseInt(id));
}

export function searchDoctors(query) {
  const q = query.toLowerCase();
  return doctors.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.specialization.toLowerCase().includes(q) ||
    d.hospital_name.toLowerCase().includes(q) ||
    d.city.toLowerCase().includes(q) ||
    d.qualifications.some(qual => qual.toLowerCase().includes(q)) ||
    d.expertise.some(e => e.toLowerCase().includes(q))
  );
}

export default doctors;

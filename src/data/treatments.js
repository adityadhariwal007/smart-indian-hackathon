// Treatment cost data — 100 treatments with government/private cost ranges
// All costs in INR, clearly marked as estimates/demo data

const treatments = [
  // General Medicine
  { id: 1, name: 'General Consultation', department: 'General Medicine', dept_id: 1, govt_min: 50, govt_max: 200, pvt_min: 400, pvt_max: 800 },
  { id: 2, name: 'Full Body Checkup', department: 'General Medicine', dept_id: 1, govt_min: 500, govt_max: 1500, pvt_min: 2000, pvt_max: 5000 },
  { id: 3, name: 'Diabetes Management', department: 'General Medicine', dept_id: 1, govt_min: 200, govt_max: 800, pvt_min: 800, pvt_max: 2000 },
  { id: 4, name: 'Thyroid Treatment', department: 'General Medicine', dept_id: 1, govt_min: 300, govt_max: 1000, pvt_min: 1000, pvt_max: 3000 },
  { id: 5, name: 'Hypertension Treatment', department: 'General Medicine', dept_id: 1, govt_min: 200, govt_max: 600, pvt_min: 600, pvt_max: 1500 },
  { id: 6, name: 'Fever/Infection Treatment', department: 'General Medicine', dept_id: 1, govt_min: 100, govt_max: 500, pvt_min: 500, pvt_max: 1500 },
  // Cardiology
  { id: 7, name: 'ECG', department: 'Cardiology', dept_id: 2, govt_min: 100, govt_max: 300, pvt_min: 500, pvt_max: 1000 },
  { id: 8, name: 'Echocardiography', department: 'Cardiology', dept_id: 2, govt_min: 500, govt_max: 1500, pvt_min: 2000, pvt_max: 4000 },
  { id: 9, name: 'Angioplasty', department: 'Cardiology', dept_id: 2, govt_min: 30000, govt_max: 80000, pvt_min: 150000, pvt_max: 350000 },
  { id: 10, name: 'Bypass Surgery (CABG)', department: 'Cardiology', dept_id: 2, govt_min: 100000, govt_max: 200000, pvt_min: 300000, pvt_max: 600000 },
  { id: 11, name: 'Pacemaker Implantation', department: 'Cardiology', dept_id: 2, govt_min: 50000, govt_max: 120000, pvt_min: 200000, pvt_max: 400000 },
  { id: 12, name: 'Cardiac Stress Test', department: 'Cardiology', dept_id: 2, govt_min: 500, govt_max: 1500, pvt_min: 2000, pvt_max: 5000 },
  // Orthopedics
  { id: 13, name: 'Knee Replacement', department: 'Orthopedics', dept_id: 3, govt_min: 50000, govt_max: 120000, pvt_min: 200000, pvt_max: 450000 },
  { id: 14, name: 'Hip Replacement', department: 'Orthopedics', dept_id: 3, govt_min: 60000, govt_max: 130000, pvt_min: 250000, pvt_max: 500000 },
  { id: 15, name: 'Fracture Treatment', department: 'Orthopedics', dept_id: 3, govt_min: 5000, govt_max: 20000, pvt_min: 15000, pvt_max: 50000 },
  { id: 16, name: 'Arthroscopy', department: 'Orthopedics', dept_id: 3, govt_min: 15000, govt_max: 40000, pvt_min: 50000, pvt_max: 120000 },
  { id: 17, name: 'Spine Surgery', department: 'Orthopedics', dept_id: 3, govt_min: 80000, govt_max: 200000, pvt_min: 300000, pvt_max: 700000 },
  { id: 18, name: 'Orthopedic Consultation', department: 'Orthopedics', dept_id: 3, govt_min: 100, govt_max: 300, pvt_min: 500, pvt_max: 1200 },
  { id: 19, name: 'Physiotherapy Session', department: 'Orthopedics', dept_id: 3, govt_min: 200, govt_max: 500, pvt_min: 800, pvt_max: 2000 },
  // ENT
  { id: 20, name: 'Tonsillectomy', department: 'ENT', dept_id: 4, govt_min: 8000, govt_max: 20000, pvt_min: 25000, pvt_max: 60000 },
  { id: 21, name: 'Sinus Surgery', department: 'ENT', dept_id: 4, govt_min: 15000, govt_max: 35000, pvt_min: 40000, pvt_max: 90000 },
  { id: 22, name: 'Hearing Aid Fitting', department: 'ENT', dept_id: 4, govt_min: 5000, govt_max: 15000, pvt_min: 15000, pvt_max: 50000 },
  { id: 23, name: 'Cochlear Implant', department: 'ENT', dept_id: 4, govt_min: 200000, govt_max: 400000, pvt_min: 500000, pvt_max: 900000 },
  // Dermatology
  { id: 24, name: 'Skin Allergy Treatment', department: 'Dermatology', dept_id: 5, govt_min: 200, govt_max: 800, pvt_min: 500, pvt_max: 2000 },
  { id: 25, name: 'Acne Treatment', department: 'Dermatology', dept_id: 5, govt_min: 300, govt_max: 1000, pvt_min: 1000, pvt_max: 3000 },
  { id: 26, name: 'Laser Skin Treatment', department: 'Dermatology', dept_id: 5, govt_min: 3000, govt_max: 8000, pvt_min: 8000, pvt_max: 25000 },
  { id: 27, name: 'Hair Loss Treatment', department: 'Dermatology', dept_id: 5, govt_min: 500, govt_max: 2000, pvt_min: 2000, pvt_max: 8000 },
  // Neurology
  { id: 28, name: 'MRI Brain', department: 'Neurology', dept_id: 6, govt_min: 2000, govt_max: 5000, pvt_min: 5000, pvt_max: 15000 },
  { id: 29, name: 'EEG', department: 'Neurology', dept_id: 6, govt_min: 500, govt_max: 1500, pvt_min: 2000, pvt_max: 5000 },
  { id: 30, name: 'Stroke Treatment', department: 'Neurology', dept_id: 6, govt_min: 50000, govt_max: 150000, pvt_min: 200000, pvt_max: 500000 },
  { id: 31, name: 'Epilepsy Treatment', department: 'Neurology', dept_id: 6, govt_min: 1000, govt_max: 5000, pvt_min: 3000, pvt_max: 10000 },
  // Pediatrics
  { id: 32, name: 'Pediatric Consultation', department: 'Pediatrics', dept_id: 7, govt_min: 50, govt_max: 200, pvt_min: 400, pvt_max: 1000 },
  { id: 33, name: 'Vaccination Package', department: 'Pediatrics', dept_id: 7, govt_min: 0, govt_max: 500, pvt_min: 1000, pvt_max: 5000 },
  { id: 34, name: 'Neonatal ICU (per day)', department: 'Pediatrics', dept_id: 7, govt_min: 2000, govt_max: 5000, pvt_min: 8000, pvt_max: 25000 },
  // Gynecology
  { id: 35, name: 'Normal Delivery', department: 'Gynecology', dept_id: 8, govt_min: 5000, govt_max: 15000, pvt_min: 25000, pvt_max: 60000 },
  { id: 36, name: 'Cesarean Section', department: 'Gynecology', dept_id: 8, govt_min: 10000, govt_max: 30000, pvt_min: 50000, pvt_max: 120000 },
  { id: 37, name: 'IVF Treatment', department: 'Gynecology', dept_id: 8, govt_min: 50000, govt_max: 100000, pvt_min: 100000, pvt_max: 300000 },
  { id: 38, name: 'Prenatal Package', department: 'Gynecology', dept_id: 8, govt_min: 2000, govt_max: 8000, pvt_min: 8000, pvt_max: 25000 },
  // Ophthalmology
  { id: 39, name: 'Cataract Surgery', department: 'Ophthalmology', dept_id: 9, govt_min: 5000, govt_max: 15000, pvt_min: 20000, pvt_max: 60000 },
  { id: 40, name: 'LASIK Surgery', department: 'Ophthalmology', dept_id: 9, govt_min: 15000, govt_max: 30000, pvt_min: 40000, pvt_max: 100000 },
  { id: 41, name: 'Glaucoma Treatment', department: 'Ophthalmology', dept_id: 9, govt_min: 3000, govt_max: 10000, pvt_min: 10000, pvt_max: 30000 },
  // Psychiatry
  { id: 42, name: 'Psychiatric Consultation', department: 'Psychiatry', dept_id: 10, govt_min: 100, govt_max: 500, pvt_min: 800, pvt_max: 2500 },
  { id: 43, name: 'Therapy Session', department: 'Psychiatry', dept_id: 10, govt_min: 200, govt_max: 800, pvt_min: 1000, pvt_max: 3000 },
  // Pulmonology
  { id: 44, name: 'Pulmonary Function Test', department: 'Pulmonology', dept_id: 11, govt_min: 500, govt_max: 1500, pvt_min: 1500, pvt_max: 4000 },
  { id: 45, name: 'Bronchoscopy', department: 'Pulmonology', dept_id: 11, govt_min: 5000, govt_max: 15000, pvt_min: 15000, pvt_max: 40000 },
  { id: 46, name: 'TB Treatment', department: 'Pulmonology', dept_id: 11, govt_min: 0, govt_max: 1000, pvt_min: 5000, pvt_max: 15000 },
  // Gastroenterology
  { id: 47, name: 'Endoscopy', department: 'Gastroenterology', dept_id: 12, govt_min: 1500, govt_max: 4000, pvt_min: 5000, pvt_max: 15000 },
  { id: 48, name: 'Colonoscopy', department: 'Gastroenterology', dept_id: 12, govt_min: 2000, govt_max: 6000, pvt_min: 8000, pvt_max: 20000 },
  { id: 49, name: 'Liver Biopsy', department: 'Gastroenterology', dept_id: 12, govt_min: 3000, govt_max: 8000, pvt_min: 10000, pvt_max: 25000 },
  // Urology
  { id: 50, name: 'Kidney Stone Removal', department: 'Urology', dept_id: 13, govt_min: 15000, govt_max: 40000, pvt_min: 40000, pvt_max: 100000 },
  { id: 51, name: 'Prostate Surgery', department: 'Urology', dept_id: 13, govt_min: 20000, govt_max: 60000, pvt_min: 60000, pvt_max: 150000 },
  // Oncology
  { id: 52, name: 'Chemotherapy (per cycle)', department: 'Oncology', dept_id: 14, govt_min: 5000, govt_max: 20000, pvt_min: 20000, pvt_max: 80000 },
  { id: 53, name: 'Radiation Therapy', department: 'Oncology', dept_id: 14, govt_min: 30000, govt_max: 80000, pvt_min: 100000, pvt_max: 300000 },
  { id: 54, name: 'Tumor Biopsy', department: 'Oncology', dept_id: 14, govt_min: 3000, govt_max: 10000, pvt_min: 10000, pvt_max: 30000 },
  // Emergency
  { id: 55, name: 'Emergency Room Visit', department: 'Emergency', dept_id: 15, govt_min: 500, govt_max: 2000, pvt_min: 2000, pvt_max: 8000 },
  { id: 56, name: 'ICU (per day)', department: 'Emergency', dept_id: 15, govt_min: 3000, govt_max: 8000, pvt_min: 15000, pvt_max: 50000 },
  { id: 57, name: 'Emergency Surgery', department: 'Emergency', dept_id: 15, govt_min: 20000, govt_max: 80000, pvt_min: 80000, pvt_max: 250000 },
  // Additional common procedures
  { id: 58, name: 'Blood Test Panel', department: 'General Medicine', dept_id: 1, govt_min: 200, govt_max: 800, pvt_min: 500, pvt_max: 2000 },
  { id: 59, name: 'X-Ray', department: 'General Medicine', dept_id: 1, govt_min: 100, govt_max: 400, pvt_min: 400, pvt_max: 1500 },
  { id: 60, name: 'CT Scan', department: 'General Medicine', dept_id: 1, govt_min: 1500, govt_max: 4000, pvt_min: 4000, pvt_max: 12000 },
  { id: 61, name: 'MRI Scan', department: 'General Medicine', dept_id: 1, govt_min: 3000, govt_max: 6000, pvt_min: 6000, pvt_max: 18000 },
  { id: 62, name: 'Ultrasound', department: 'General Medicine', dept_id: 1, govt_min: 500, govt_max: 1500, pvt_min: 1500, pvt_max: 4000 },
  { id: 63, name: 'Dental Consultation', department: 'General Medicine', dept_id: 1, govt_min: 100, govt_max: 300, pvt_min: 300, pvt_max: 1000 },
  { id: 64, name: 'Root Canal Treatment', department: 'General Medicine', dept_id: 1, govt_min: 1000, govt_max: 3000, pvt_min: 3000, pvt_max: 10000 },
  { id: 65, name: 'Dental Implant', department: 'General Medicine', dept_id: 1, govt_min: 10000, govt_max: 25000, pvt_min: 25000, pvt_max: 60000 },
  // More specialized
  { id: 66, name: 'Hernia Surgery', department: 'General Medicine', dept_id: 1, govt_min: 15000, govt_max: 35000, pvt_min: 40000, pvt_max: 100000 },
  { id: 67, name: 'Appendectomy', department: 'General Medicine', dept_id: 1, govt_min: 10000, govt_max: 25000, pvt_min: 30000, pvt_max: 80000 },
  { id: 68, name: 'Gallbladder Surgery', department: 'Gastroenterology', dept_id: 12, govt_min: 15000, govt_max: 40000, pvt_min: 50000, pvt_max: 120000 },
  { id: 69, name: 'Dialysis (per session)', department: 'Urology', dept_id: 13, govt_min: 1000, govt_max: 3000, pvt_min: 3000, pvt_max: 8000 },
  { id: 70, name: 'Kidney Transplant', department: 'Urology', dept_id: 13, govt_min: 200000, govt_max: 500000, pvt_min: 500000, pvt_max: 1500000 },
  // Fill to 100
  { id: 71, name: 'Allergy Testing', department: 'General Medicine', dept_id: 1, govt_min: 500, govt_max: 2000, pvt_min: 2000, pvt_max: 5000 },
  { id: 72, name: 'Sleep Study', department: 'Pulmonology', dept_id: 11, govt_min: 3000, govt_max: 8000, pvt_min: 8000, pvt_max: 20000 },
  { id: 73, name: 'Cardiac CT Angiography', department: 'Cardiology', dept_id: 2, govt_min: 3000, govt_max: 8000, pvt_min: 10000, pvt_max: 25000 },
  { id: 74, name: 'Bone Density Test', department: 'Orthopedics', dept_id: 3, govt_min: 500, govt_max: 1500, pvt_min: 1500, pvt_max: 4000 },
  { id: 75, name: 'EMG/NCV Test', department: 'Neurology', dept_id: 6, govt_min: 1000, govt_max: 3000, pvt_min: 3000, pvt_max: 8000 },
  { id: 76, name: 'Septoplasty', department: 'ENT', dept_id: 4, govt_min: 15000, govt_max: 35000, pvt_min: 40000, pvt_max: 80000 },
  { id: 77, name: 'Hysterectomy', department: 'Gynecology', dept_id: 8, govt_min: 20000, govt_max: 50000, pvt_min: 60000, pvt_max: 150000 },
  { id: 78, name: 'Retinal Surgery', department: 'Ophthalmology', dept_id: 9, govt_min: 15000, govt_max: 40000, pvt_min: 40000, pvt_max: 100000 },
  { id: 79, name: 'De-addiction Program', department: 'Psychiatry', dept_id: 10, govt_min: 5000, govt_max: 20000, pvt_min: 30000, pvt_max: 100000 },
  { id: 80, name: 'Mastectomy', department: 'Oncology', dept_id: 14, govt_min: 30000, govt_max: 80000, pvt_min: 80000, pvt_max: 200000 },
  { id: 81, name: 'Liver Transplant', department: 'Gastroenterology', dept_id: 12, govt_min: 500000, govt_max: 1000000, pvt_min: 1500000, pvt_max: 3000000 },
  { id: 82, name: 'Corneal Transplant', department: 'Ophthalmology', dept_id: 9, govt_min: 20000, govt_max: 50000, pvt_min: 50000, pvt_max: 120000 },
  { id: 83, name: 'Lithotripsy', department: 'Urology', dept_id: 13, govt_min: 10000, govt_max: 30000, pvt_min: 30000, pvt_max: 70000 },
  { id: 84, name: 'Varicose Vein Treatment', department: 'General Medicine', dept_id: 1, govt_min: 15000, govt_max: 40000, pvt_min: 40000, pvt_max: 100000 },
  { id: 85, name: 'PET Scan', department: 'Oncology', dept_id: 14, govt_min: 8000, govt_max: 20000, pvt_min: 20000, pvt_max: 50000 },
  { id: 86, name: 'Holter Monitoring', department: 'Cardiology', dept_id: 2, govt_min: 1000, govt_max: 3000, pvt_min: 3000, pvt_max: 8000 },
  { id: 87, name: 'Treadmill Test (TMT)', department: 'Cardiology', dept_id: 2, govt_min: 500, govt_max: 1500, pvt_min: 1500, pvt_max: 4000 },
  { id: 88, name: 'Ligament Reconstruction', department: 'Orthopedics', dept_id: 3, govt_min: 30000, govt_max: 80000, pvt_min: 80000, pvt_max: 200000 },
  { id: 89, name: 'Hearing Test (Audiometry)', department: 'ENT', dept_id: 4, govt_min: 300, govt_max: 1000, pvt_min: 1000, pvt_max: 3000 },
  { id: 90, name: 'Skin Biopsy', department: 'Dermatology', dept_id: 5, govt_min: 1000, govt_max: 3000, pvt_min: 3000, pvt_max: 8000 },
  { id: 91, name: 'Brain Surgery', department: 'Neurology', dept_id: 6, govt_min: 100000, govt_max: 300000, pvt_min: 300000, pvt_max: 800000 },
  { id: 92, name: 'Circumcision', department: 'Urology', dept_id: 13, govt_min: 3000, govt_max: 8000, pvt_min: 8000, pvt_max: 20000 },
  { id: 93, name: 'Breast Biopsy', department: 'Oncology', dept_id: 14, govt_min: 3000, govt_max: 8000, pvt_min: 8000, pvt_max: 20000 },
  { id: 94, name: 'Bone Marrow Biopsy', department: 'Oncology', dept_id: 14, govt_min: 5000, govt_max: 15000, pvt_min: 15000, pvt_max: 40000 },
  { id: 95, name: 'Tympanoplasty', department: 'ENT', dept_id: 4, govt_min: 10000, govt_max: 25000, pvt_min: 25000, pvt_max: 60000 },
  { id: 96, name: 'Chemical Peel', department: 'Dermatology', dept_id: 5, govt_min: 1000, govt_max: 3000, pvt_min: 3000, pvt_max: 10000 },
  { id: 97, name: 'Nebulization', department: 'Pulmonology', dept_id: 11, govt_min: 100, govt_max: 300, pvt_min: 300, pvt_max: 800 },
  { id: 98, name: 'ERCP', department: 'Gastroenterology', dept_id: 12, govt_min: 5000, govt_max: 15000, pvt_min: 15000, pvt_max: 40000 },
  { id: 99, name: 'Cystoscopy', department: 'Urology', dept_id: 13, govt_min: 3000, govt_max: 8000, pvt_min: 8000, pvt_max: 20000 },
  { id: 100, name: 'Immunotherapy (per cycle)', department: 'Oncology', dept_id: 14, govt_min: 30000, govt_max: 80000, pvt_min: 80000, pvt_max: 200000 },
];

export function getTreatmentsByDepartment(deptId) {
  return treatments.filter(t => t.dept_id === deptId);
}

export function formatCost(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}K`;
  return `₹${amount}`;
}

export default treatments;

-- ==============================================================================
-- HealthFlow Healthcare Coordination Platform - Initial Seed Data
-- Location: Patiala, Punjab
-- File: supabase/seed.sql
-- ==============================================================================

-- 1. Seed Network Hospitals in Patiala
INSERT INTO hospitals (id, name, address, lat, lng, phone, total_beds) VALUES
('11111111-1111-1111-1111-111111111101', 'Government Medical College & Rajindra Hospital', 'Sangrur Road, New Lal Bagh Colony, Patiala', 30.3256000, 76.3789000, '0175-2212018', 1100),
('11111111-1111-1111-1111-111111111102', 'Mata Kaushalya Hospital', 'Near Lahori Gate, Patiala', 30.3345000, 76.3989000, '0175-2300050', 300),
('11111111-1111-1111-1111-111111111103', 'Amar Hospital', 'Bank Colony, Patiala', 30.3421000, 76.3854000, '0175-5002222', 150),
('11111111-1111-1111-1111-111111111104', 'Columbia Asia / Manipal Hospital', 'Bhupindra Road, Patiala', 30.3489000, 76.3712000, '0175-3989898', 100),
('11111111-1111-1111-1111-111111111105', 'AP Trauma Centre & Super Speciality Hospital', 'Near Bus Stand, Patiala', 30.3398000, 76.4021000, '0175-2200108', 80)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Live Bed Occupancy by Ward Type
INSERT INTO bed_occupancy (hospital_id, ward_type, total_beds, occupied_beds) VALUES
-- Rajindra Hospital
('11111111-1111-1111-1111-111111111101', 'General', 700, 580),
('11111111-1111-1111-1111-111111111101', 'ICU', 120, 108),
('11111111-1111-1111-1111-111111111101', 'Emergency/Trauma', 100, 92),
('11111111-1111-1111-1111-111111111101', 'Oxygen Support', 180, 140),

-- Mata Kaushalya
('11111111-1111-1111-1111-111111111102', 'General', 200, 145),
('11111111-1111-1111-1111-111111111102', 'ICU', 30, 24),
('11111111-1111-1111-1111-111111111102', 'Emergency/Trauma', 30, 21),
('11111111-1111-1111-1111-111111111102', 'Pediatric', 40, 28),

-- Amar Hospital
('11111111-1111-1111-1111-111111111103', 'General', 100, 62),
('11111111-1111-1111-1111-111111111103', 'ICU', 25, 18),
('11111111-1111-1111-1111-111111111103', 'Emergency/Trauma', 25, 12)
ON CONFLICT (hospital_id, ward_type) DO UPDATE 
SET occupied_beds = EXCLUDED.occupied_beds, updated_at = NOW();

-- 3. Seed Specialist Doctors
INSERT INTO doctors (id, hospital_id, name, specialty, available_from, available_to) VALUES
('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Dr. Harpreet Singh', 'Cardiology', '09:00:00', '15:00:00'),
('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'Dr. Simran Kaur', 'Neurology', '10:00:00', '16:00:00'),
('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101', 'Dr. Rajesh Verma', 'Emergency Medicine', '00:00:00', '23:59:59'),
('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111102', 'Dr. Ananya Sharma', 'Obstetrics & Gynecology', '09:30:00', '14:30:00'),
('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111103', 'Dr. Ravi Saxena', 'Orthopedics', '10:00:00', '17:00:00')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed ABDM-Linked Patients (Minimal PII)
INSERT INTO patients (id, abdm_id, name, phone, dob) VALUES
('33333333-3333-3333-3333-333333333301', 'MH-2026-948123', 'Aditya Dhariwal', '+919876543210', '1998-05-14'),
('33333333-3333-3333-3333-333333333302', 'MH-2026-159402', 'Gurpreet Singh', '+919814012345', '1985-11-20'),
('33333333-3333-3333-3333-333333333303', 'MH-2026-783210', 'Manpreet Kaur', '+919780054321', '1992-03-08')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed OPD Queue Tokens
INSERT INTO queue_tokens (hospital_id, doctor_id, patient_id, token_number, status, priority, called_at) VALUES
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', 'A-118', 'in_progress', 1, NOW() - INTERVAL '5 minutes'),
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333302', 'A-119', 'waiting', 0, NULL),
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222204', '33333333-3333-3333-3333-333333333303', 'B-042', 'waiting', 0, NULL);

-- 6. Seed Active 108 Emergency Dispatch
INSERT INTO emergency_dispatches (patient_id, hospital_id, location_lat, location_lng, status, ambulance_id, requested_at) VALUES
('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111101', 30.3320000, 76.3880000, 'en_route', 'PB-11-AMB-1081', NOW() - INTERVAL '12 minutes');

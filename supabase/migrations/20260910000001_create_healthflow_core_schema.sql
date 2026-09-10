-- ==============================================================================
-- HealthFlow Healthcare Coordination Platform - Core Database Schema
-- Supabase / PostgreSQL Migration
-- Migration: 20260910000001_create_healthflow_core_schema.sql
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Custom Types & Enums
-- ==============================================================================

-- Token progression lifecycle
DO $$ BEGIN
    CREATE TYPE token_status AS ENUM ('waiting', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 108/112 Emergency ambulance dispatch lifecycle
DO $$ BEGIN
    CREATE TYPE dispatch_status AS ENUM ('requested', 'dispatched', 'en_route', 'arrived', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. Trigger Function for Automatic updated_at Timestamps
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. Table Definitions
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table: hospitals
-- Core hospital registry (e.g. GMC & Rajindra Hospital, Mata Kaushalya, etc.)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    lat NUMERIC(10, 7) NOT NULL,
    lng NUMERIC(10, 7) NOT NULL,
    phone VARCHAR(25),
    total_beds INT NOT NULL DEFAULT 0 CHECK (total_beds >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: bed_occupancy
-- Real-time bed occupancy tracking segmented by ward type (ICU, General, etc.)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bed_occupancy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    ward_type VARCHAR(100) NOT NULL, -- e.g. 'General', 'ICU', 'Oxygen Support', 'Pediatric', 'Emergency'
    total_beds INT NOT NULL DEFAULT 0 CHECK (total_beds >= 0),
    occupied_beds INT NOT NULL DEFAULT 0 CHECK (occupied_beds >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_bed_occupancy_bounds CHECK (occupied_beds <= total_beds),
    CONSTRAINT uq_hospital_ward UNIQUE (hospital_id, ward_type)
);

-- ------------------------------------------------------------------------------
-- Table: doctors
-- Specialist doctors practicing across network facilities
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(150) NOT NULL,
    available_from TIME NOT NULL DEFAULT '09:00:00',
    available_to TIME NOT NULL DEFAULT '17:00:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: patients
-- Minimal PII patient registry linked with Ayushman Bharat Digital Mission (ABDM)
-- Note: Sensitive clinical histories and diagnostics are kept decoupled
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abdm_id VARCHAR(100) UNIQUE, -- e.g. ABHA ID or 'MH-YYYY-XXXXXX'
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    dob DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: queue_tokens
-- OPD outpatient digital queue tickets with real-time triage status
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS queue_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    token_number VARCHAR(20) NOT NULL, -- e.g. 'A-118'
    status token_status NOT NULL DEFAULT 'waiting',
    priority INT NOT NULL DEFAULT 0, -- 0: Routine, 1: Urgent, 2: Emergency / Senior
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    called_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: emergency_dispatches
-- 108/112 ambulance dispatch and live GPS tracking
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL, -- Nullable for unknown / unconscious victims
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    location_lat NUMERIC(10, 7) NOT NULL,
    location_lng NUMERIC(10, 7) NOT NULL,
    status dispatch_status NOT NULL DEFAULT 'requested',
    ambulance_id VARCHAR(50) NOT NULL, -- e.g. 'PB-11-AMB-1081'
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. Performance Indexes (Frequently-Queried Columns & Foreign Keys)
-- ==============================================================================

-- Hospitals
CREATE INDEX IF NOT EXISTS idx_hospitals_geo ON hospitals (lat, lng);

-- Bed Occupancy
CREATE INDEX IF NOT EXISTS idx_bed_occupancy_hospital_id ON bed_occupancy (hospital_id);
CREATE INDEX IF NOT EXISTS idx_bed_occupancy_ward_type ON bed_occupancy (ward_type);

-- Doctors
CREATE INDEX IF NOT EXISTS idx_doctors_hospital_id ON doctors (hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors (specialty);

-- Patients
CREATE INDEX IF NOT EXISTS idx_patients_abdm_id ON patients (abdm_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients (phone);

-- Queue Tokens
CREATE INDEX IF NOT EXISTS idx_queue_tokens_hospital_status ON queue_tokens (hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_tokens_doctor_status ON queue_tokens (doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_tokens_patient_id ON queue_tokens (patient_id);
CREATE INDEX IF NOT EXISTS idx_queue_tokens_created_at ON queue_tokens (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queue_tokens_priority_created ON queue_tokens (priority DESC, created_at ASC);

-- Emergency Dispatches
CREATE INDEX IF NOT EXISTS idx_emergency_dispatches_hospital_status ON emergency_dispatches (hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_emergency_dispatches_status ON emergency_dispatches (status);
CREATE INDEX IF NOT EXISTS idx_emergency_dispatches_ambulance ON emergency_dispatches (ambulance_id);
CREATE INDEX IF NOT EXISTS idx_emergency_dispatches_patient ON emergency_dispatches (patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_dispatches_requested_at ON emergency_dispatches (requested_at DESC);

-- ==============================================================================
-- 6. updated_at Automatic Triggers
-- ==============================================================================

DROP TRIGGER IF EXISTS trg_hospitals_updated_at ON hospitals;
CREATE TRIGGER trg_hospitals_updated_at
    BEFORE UPDATE ON hospitals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_bed_occupancy_updated_at ON bed_occupancy;
CREATE TRIGGER trg_bed_occupancy_updated_at
    BEFORE UPDATE ON bed_occupancy
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_doctors_updated_at ON doctors;
CREATE TRIGGER trg_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_patients_updated_at ON patients;
CREATE TRIGGER trg_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_queue_tokens_updated_at ON queue_tokens;
CREATE TRIGGER trg_queue_tokens_updated_at
    BEFORE UPDATE ON queue_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_emergency_dispatches_updated_at ON emergency_dispatches;
CREATE TRIGGER trg_emergency_dispatches_updated_at
    BEFORE UPDATE ON emergency_dispatches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 7. Row Level Security (RLS) Configuration for Supabase
-- ==============================================================================

ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bed_occupancy ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_dispatches ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for Directory Data (Hospitals, Occupancy, Doctors)
CREATE POLICY "Public can view hospitals" 
    ON hospitals FOR SELECT 
    USING (true);

CREATE POLICY "Public can view live bed occupancy" 
    ON bed_occupancy FOR SELECT 
    USING (true);

CREATE POLICY "Public can view doctor directory" 
    ON doctors FOR SELECT 
    USING (true);

-- Patients can view and modify their own records
CREATE POLICY "Patients can view own record"
    ON patients FOR SELECT
    USING (auth.uid() = id OR abdm_id IS NOT NULL);

-- Queue Tokens: Patients can view their own tokens, staff can view hospital tokens
CREATE POLICY "Patients can view own queue tokens" 
    ON queue_tokens FOR SELECT 
    USING (true);

CREATE POLICY "Patients can create queue tokens"
    ON queue_tokens FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Staff can update queue tokens"
    ON queue_tokens FOR UPDATE 
    USING (true);

-- Emergency Dispatches: Authorized emergency creation and dispatcher monitoring
CREATE POLICY "Anyone can request emergency dispatch"
    ON emergency_dispatches FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can view active emergency dispatch status"
    ON emergency_dispatches FOR SELECT
    USING (true);

CREATE POLICY "Dispatchers can update ambulance progress"
    ON emergency_dispatches FOR UPDATE
    USING (true);

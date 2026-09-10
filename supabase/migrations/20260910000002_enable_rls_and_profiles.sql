-- ==============================================================================
-- HealthFlow Healthcare Coordination Platform - RLS & Role-Based Access Control
-- Supabase / PostgreSQL Migration
-- Migration: 20260910000002_enable_rls_and_profiles.sql
-- ==============================================================================

-- ==============================================================================
-- 1. Profiles Table & Role Enum Linked to auth.users
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'hospital_staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'patient',
    full_name VARCHAR(150),
    phone VARCHAR(20),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL, -- populated if hospital_staff
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-update updated_at on profiles
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Index on profiles role and hospital
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_hospital_id ON public.profiles (hospital_id);

-- ==============================================================================
-- 2. Auto-Create Profile Trigger on auth.users Signup
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role user_role;
    user_name VARCHAR(150);
    user_phone VARCHAR(20);
BEGIN
    -- Extract role from user_metadata if provided (e.g. from invite or signup form), default to 'patient'
    assigned_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        'patient'::user_role
    );

    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    user_phone := COALESCE(
        NEW.phone,
        NEW.raw_user_meta_data->>'phone'
    );

    -- 1. Create Profile Row
    INSERT INTO public.profiles (id, role, full_name, phone, hospital_id)
    VALUES (
        NEW.id,
        assigned_role,
        user_name,
        user_phone,
        (NEW.raw_user_meta_data->>'hospital_id')::UUID
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();

    -- 2. If user is a patient, also provision their minimal patients registry entry
    IF assigned_role = 'patient' THEN
        INSERT INTO public.patients (id, abdm_id, name, phone, dob)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'abdm_id', 'MH-' || to_char(NOW(), 'YYYY') || '-' || upper(substr(md5(NEW.id::text), 1, 6))),
            COALESCE(user_name, 'Registered Patient'),
            COALESCE(user_phone, 'Not Provided'),
            (NEW.raw_user_meta_data->>'dob')::DATE
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. Fast Helper Functions for Security & Role Checking
-- ==============================================================================

-- Check if current authenticated user has hospital_staff or admin role
CREATE OR REPLACE FUNCTION public.is_hospital_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND role IN ('hospital_staff', 'admin')
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 4. Enable Row Level Security (RLS) on All Tables
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bed_occupancy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_dispatches ENABLE ROW LEVEL SECURITY;

-- Clean up any existing placeholder policies from previous migrations
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'hospitals', 'bed_occupancy', 'doctors', 'patients', 'queue_tokens', 'emergency_dispatches')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ==============================================================================
-- 5. Strict RLS Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. PROFILES Table
-- ------------------------------------------------------------------------------
-- Users can view their own profile; staff & admin can view profiles
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_hospital_staff());

-- Users can update their own profile (name, phone)
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() 
        -- Prevent privilege escalation: only admin can alter roles
        AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
    );

-- ------------------------------------------------------------------------------
-- B. HOSPITALS Table
-- ------------------------------------------------------------------------------
-- Anyone (even unauthenticated) can READ hospitals
CREATE POLICY "Public read access for hospitals"
    ON public.hospitals FOR SELECT
    TO public
    USING (true);

-- Only admins can INSERT / UPDATE hospitals
CREATE POLICY "Admins can insert hospitals"
    ON public.hospitals FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Staff and Admins can update hospitals"
    ON public.hospitals FOR UPDATE
    TO authenticated
    USING (public.is_hospital_staff())
    WITH CHECK (public.is_hospital_staff());

-- ------------------------------------------------------------------------------
-- C. BED_OCCUPANCY Table
-- ------------------------------------------------------------------------------
-- Anyone (even unauthenticated) can READ live bed occupancy
CREATE POLICY "Public read access for bed occupancy"
    ON public.bed_occupancy FOR SELECT
    TO public
    USING (true);

-- Only hospital_staff or admin can UPDATE bed occupancy
CREATE POLICY "Hospital staff can update bed occupancy"
    ON public.bed_occupancy FOR UPDATE
    TO authenticated
    USING (public.is_hospital_staff())
    WITH CHECK (public.is_hospital_staff());

CREATE POLICY "Hospital staff can insert bed occupancy"
    ON public.bed_occupancy FOR INSERT
    TO authenticated
    WITH CHECK (public.is_hospital_staff());

-- ------------------------------------------------------------------------------
-- D. DOCTORS Table
-- ------------------------------------------------------------------------------
-- Anyone (even unauthenticated) can READ doctors directory
CREATE POLICY "Public read access for doctors"
    ON public.doctors FOR SELECT
    TO public
    USING (true);

-- Only hospital staff / admins can manage doctors
CREATE POLICY "Hospital staff can insert doctors"
    ON public.doctors FOR INSERT
    TO authenticated
    WITH CHECK (public.is_hospital_staff());

CREATE POLICY "Hospital staff can update doctors"
    ON public.doctors FOR UPDATE
    TO authenticated
    USING (public.is_hospital_staff())
    WITH CHECK (public.is_hospital_staff());

-- ------------------------------------------------------------------------------
-- E. PATIENTS Table
-- ------------------------------------------------------------------------------
-- Patients can read their own record; staff can read for care coordination
CREATE POLICY "Patients can view own record"
    ON public.patients FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_hospital_staff());

-- Patients can update their own contact details
CREATE POLICY "Patients can update own record"
    ON public.patients FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Authenticated users can create patient entry"
    ON public.patients FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid() OR public.is_hospital_staff());

-- ------------------------------------------------------------------------------
-- F. QUEUE_TOKENS Table
-- ------------------------------------------------------------------------------
-- Patients can only SELECT their own tokens; hospital_staff can view all tokens
CREATE POLICY "Patients can view own queue tokens"
    ON public.queue_tokens FOR SELECT
    TO authenticated
    USING (patient_id = auth.uid() OR public.is_hospital_staff());

-- Only authenticated users can INSERT into queue_tokens (patient booking own slot)
CREATE POLICY "Authenticated patients can insert queue tokens"
    ON public.queue_tokens FOR INSERT
    TO authenticated
    WITH CHECK (
        patient_id = auth.uid() OR public.is_hospital_staff()
    );

-- Only users with 'hospital_staff' or 'admin' role can UPDATE queue_tokens (call/complete tokens)
CREATE POLICY "Hospital staff can update queue token status"
    ON public.queue_tokens FOR UPDATE
    TO authenticated
    USING (public.is_hospital_staff())
    WITH CHECK (public.is_hospital_staff());

-- ------------------------------------------------------------------------------
-- G. EMERGENCY_DISPATCHES Table
-- ------------------------------------------------------------------------------
-- Patients can only SELECT their own dispatches; hospital_staff / dispatchers can view all
CREATE POLICY "Patients can view own emergency dispatches"
    ON public.emergency_dispatches FOR SELECT
    TO authenticated
    USING (patient_id = auth.uid() OR public.is_hospital_staff());

-- Only authenticated users can INSERT into emergency_dispatches
CREATE POLICY "Authenticated users can request emergency dispatch"
    ON public.emergency_dispatches FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.role() = 'authenticated'
        AND (patient_id IS NULL OR patient_id = auth.uid() OR public.is_hospital_staff())
    );

-- Only users with 'hospital_staff' or 'admin' role can UPDATE emergency_dispatches status
CREATE POLICY "Hospital staff can update emergency dispatch status"
    ON public.emergency_dispatches FOR UPDATE
    TO authenticated
    USING (public.is_hospital_staff())
    WITH CHECK (public.is_hospital_staff());

-- ==============================================================================
-- 6. Direct Client Deletions Prohibited (Defense in Depth)
-- ==============================================================================
-- NOTE ON DELETIONS:
-- In PostgreSQL with Row Level Security, operations are DENIED BY DEFAULT unless 
-- an explicit policy permits them. 
-- Because NO DELETE policies are created for 'anon' or 'authenticated' roles on any 
-- table (hospitals, bed_occupancy, doctors, patients, queue_tokens, emergency_dispatches, profiles),
-- any client-side DELETE attempt via the Supabase client will be immediately REJECTED by Postgres.
-- Only backend service-role keys (e.g. in Supabase Edge Functions or admin scripts) can delete.
-- ==============================================================================

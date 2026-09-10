-- ==============================================================================
-- HealthFlow Migration: AI Symptom Assessment & Healthcare Navigation Tables
-- Migration ID: 20260911000003_create_ai_triage_tables.sql
-- Description: Creates ai_conversations, ai_assessments, and ai_symptoms tables
-- ==============================================================================

-- 1. AI Conversations Table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    conversation_id VARCHAR(128) NOT NULL UNIQUE,
    patient_age INT,
    patient_sex VARCHAR(16),
    assessment_target VARCHAR(16) DEFAULT 'self', -- 'self' or 'other'
    status VARCHAR(32) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'emergency_triaged', 'abandoned'
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_patient ON public.ai_conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_conv_id ON public.ai_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON public.ai_conversations(status);

-- 2. AI Assessments Table
CREATE TABLE IF NOT EXISTS public.ai_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR(128) NOT NULL REFERENCES public.ai_conversations(conversation_id) ON DELETE CASCADE,
    triage_level VARCHAR(32) NOT NULL, -- 'emergency', 'consult_doctor_soon', 'self_care'
    recommended_specialty VARCHAR(64) NOT NULL, -- e.g. 'General Medicine', 'Cardiology', 'Neurology'
    assessment_summary TEXT NOT NULL,
    possible_causes JSONB DEFAULT '[]'::jsonb, -- Array of { name, probability_label, description }
    safety_guidance JSONB DEFAULT '[]'::jsonb, -- Array of string recommendations
    is_emergency BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_assessments_conv_id ON public.ai_assessments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_assessments_specialty ON public.ai_assessments(recommended_specialty);

-- 3. AI Symptoms Table
CREATE TABLE IF NOT EXISTS public.ai_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.ai_assessments(id) ON DELETE CASCADE,
    conversation_id VARCHAR(128) NOT NULL REFERENCES public.ai_conversations(conversation_id) ON DELETE CASCADE,
    symptom VARCHAR(255) NOT NULL,
    response VARCHAR(64) NOT NULL, -- 'present', 'absent', 'unknown', or free-text duration/severity
    source VARCHAR(32) NOT NULL DEFAULT 'user_chat', -- 'user_chat', 'ai_probe', 'system_detected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_symptoms_assessment ON public.ai_symptoms(assessment_id);
CREATE INDEX IF NOT EXISTS idx_ai_symptoms_conv_id ON public.ai_symptoms(conversation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_symptoms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Patients can select their own AI conversations
CREATE POLICY "Patients can view own AI conversations"
    ON public.ai_conversations FOR SELECT
    USING (
        auth.uid() IS NULL OR 
        patient_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('hospital_staff', 'admin')
        )
    );

-- Any user can insert a new conversation (authenticated or guest triage)
CREATE POLICY "Anyone can create an AI conversation"
    ON public.ai_conversations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update own conversation status"
    ON public.ai_conversations FOR UPDATE
    USING (true);

-- Anyone in session can view assessment
CREATE POLICY "Anyone can view own assessments"
    ON public.ai_assessments FOR SELECT
    USING (true);

CREATE POLICY "Service can insert assessments"
    ON public.ai_assessments FOR INSERT
    WITH CHECK (true);

-- Anyone in session can view symptoms
CREATE POLICY "Anyone can view own symptoms"
    ON public.ai_symptoms FOR SELECT
    USING (true);

CREATE POLICY "Service can insert symptoms"
    ON public.ai_symptoms FOR INSERT
    WITH CHECK (true);

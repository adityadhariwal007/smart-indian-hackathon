# Backend Authentication & Role-Based Access Control (RBAC) Specification

**Document Version:** 1.0.0  
**Target Platform:** HealthFlow Smart Healthcare Coordination Platform  
**Compliance Standards:** Ayushman Bharat Digital Mission (ABDM), DPDP Act 2023, HIPAA Security Rule, OWASP Top 10 API Security  

---

## 1. Executive Summary & Architecture Overview

Currently, HealthFlow operates as an offline-first Single Page Application (SPA) where authentication state, session persistence, and role enforcement are managed client-side via `localStorage`. 

This document defines the production technical specification to transition the application to a zero-trust, secure backend architecture with centralized session management, cryptographic token rotation, and fine-grained Role-Based Access Control (RBAC).

```
                      ┌──────────────────────────────────────┐
                      │    HealthFlow React 19 Frontend      │
                      └──────────────────┬───────────────────┘
                                         │ HTTPS / WSS
                                         ▼
                      ┌──────────────────────────────────────┐
                      │ Reverse Proxy / API Gateway (Nginx)  │
                      │ • TLS 1.3 / HSTS                     │
                      │ • Rate Limiting (Token Bucket)       │
                      │ • Web Application Firewall (WAF)     │
                      └──────────────────┬───────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌──────────────┐                 ┌──────────────┐                 ┌──────────────┐
│ Auth Service │                 │ Patient Care │                 │ Grievance &  │
│ (JWT / OTP)  │                 │ API Service  │                 │ EMS Dispatch │
└───────┬──────┘                 └──────┬───────┘                 └──────┬───────┘
        │                               │                                │
        └───────────────────────────────┼────────────────────────────────┘
                                        ▼
                      ┌───────────────────────────────────┐
                      │ PostgreSQL (with RLS) + Redis     │
                      │ • Encrypted at rest (AES-256)     │
                      │ • Redis session revocation list   │
                      └───────────────────────────────────┘
```

---

## 2. Authentication Architecture

### 2.1 Token Lifecycle Strategy (Dual-Token Pattern)

To eliminate the vulnerability of storing credentials or bearer tokens in `localStorage`, the system uses an ephemeral dual-token strategy:

1. **Short-Lived Access Token (JWT)**:
   - **Lifespan**: 15 minutes.
   - **Storage**: In-memory (React context state / memory closure). Never written to `localStorage` or `sessionStorage`.
   - **Transmission**: Sent via HTTP header: `Authorization: Bearer <access_token>`.
   - **Payload**: Contains minimal identity claims (`sub`, `role`, `patient_id`, `exp`).

2. **Long-Lived Refresh Token**:
   - **Lifespan**: 7 days (with rolling expiration on active use).
   - **Storage**: Stored in a browser cookie with flags:  
     `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh`
   - **Security**: Inaccessible to JavaScript (immune to XSS extraction).
   - **Revocation**: Hashed and stored in the database (`refresh_tokens` table) with family detection for replay attacks.

### 2.2 Password Security
- **Algorithm**: **Argon2id** (memory: 64MB, iterations: 3, parallelism: 1) or **bcrypt** (cost factor: 12).
- **Client-Side SHA-256**: Retained purely for pre-transmission zero-knowledge masking if desired, but the backend must salt and re-hash using Argon2id before database storage.

### 2.3 Multi-Method Authentication Workflows

#### A. Mobile Phone + 6-Digit SMS OTP
1. Client calls `POST /api/v1/auth/otp/send` with `{ phone: "+919876543210" }`.
2. Backend checks rate limit (max 3 per 5 minutes per IP/phone).
3. Backend generates cryptographically secure 6-digit number, hashes it with HMAC-SHA256, stores in Redis with a 5-minute TTL, and dispatches via licensed SMS gateway.
4. Client calls `POST /api/v1/auth/otp/verify` with `{ phone, otp }`.
5. Backend verifies HMAC, checks collision on Universal Patient ID, provisions user if new, and issues token pair.

#### B. Google OAuth2 (OpenID Connect)
1. Client performs Google Sign-In and obtains `id_token`.
2. Client calls `POST /api/v1/auth/google` with `{ idToken }`.
3. Backend validates signature using Google's public JWKS (`https://www.googleapis.com/oauth2/v3/certs`), verifies `aud` matches client ID, extracts verified email, and binds or creates the patient record.

---

## 3. Role-Based Access Control (RBAC) Matrix

### 3.1 Roles Definition
- **`patient`**: Standard citizen seeking consultations, viewing health records, and submitting grievances.
- **`doctor`**: Verified clinical specialist managing outpatient queues and telemedicine.
- **`nurse` / `triage_officer`**: Hospital staff managing front-desk queue check-ins and vital recording.
- **`hospital_admin`**: Institutional administrator monitoring bed occupancy, doctor rosters, and hospital grievances.
- **`dispatcher`**: 108/112 Emergency Medical Services response controller.
- **`super_admin`**: Platform administrator (audit logs, hospital network onboarding).

### 3.2 Permissions Matrix

| Resource & Operation | `patient` | `doctor` | `nurse` | `hospital_admin` | `dispatcher` |
|---|:---:|:---:|:---:|:---:|:---:|
| **Read Own Profile / Records** | ✅ Own | ✅ Own | ✅ Own | ✅ Own | ✅ Own |
| **Read Other Patient Records** | ❌ | ✅ Assigned | ✅ Clinic | ❌ | ✅ Triage |
| **Book OPD Appointment** | ✅ Own | ❌ | ✅ For Pt | ❌ | ❌ |
| **Call / Complete Queue Token** | ❌ | ✅ Own Dept | ✅ Own Dept | ❌ | ❌ |
| **Submit Grievance / Complaint** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Review & Resolve Grievances** | ❌ | ❌ | ❌ | ✅ Own Hosp | ❌ |
| **Dispatch 108/112 Ambulance** | ✅ Trigger | ❌ | ❌ | ❌ | ✅ Full Control |
| **Update Live Bed / Crowd Data** | ❌ | ❌ | ✅ Vitals | ✅ Full Control | ❌ |

---

## 4. PostgreSQL Relational Database Schema

```sql
-- Enums for Roles and Workflow States
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'nurse', 'hospital_admin', 'dispatcher', 'super_admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'in_consultation', 'completed', 'cancelled');
CREATE TYPE grievance_status AS ENUM ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed');

-- Core Identity Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'patient',
    phone VARCHAR(15) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient Profiles with Collision-Free Universal ID
CREATE TABLE patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id VARCHAR(20) NOT NULL UNIQUE, -- e.g. MH-2026-X8K9L2
    full_name VARCHAR(150) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_patient_id_format CHECK (patient_id ~ '^MH-[0-9]{4}-[A-Z0-9]{6}$')
);

-- Outpatient Queue Tokens & Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id),
    hospital_id INT NOT NULL,
    doctor_id INT,
    department_id INT NOT NULL,
    token_number VARCHAR(15) NOT NULL, -- e.g. A-118
    slot_time TIMESTAMPTZ NOT NULL,
    consultation_mode VARCHAR(10) NOT NULL DEFAULT 'offline', -- 'online' | 'offline'
    status appointment_status NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Healthcare Grievances
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(25) NOT NULL UNIQUE, -- e.g. HC-2026-782419
    patient_id UUID REFERENCES patient_profiles(id),
    hospital_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status grievance_status NOT NULL DEFAULT 'submitted',
    assigned_department VARCHAR(100),
    resolution_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Refresh Tokens (With Family Revocation)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    family_id UUID NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policy Example: Patients can only view their own records
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY patient_own_profile ON patient_profiles
    FOR ALL
    TO authenticated_role
    USING (user_id = current_user_id());
```

---

## 5. API Gateway & Middleware Pipeline

```typescript
// Express / NestJS Middleware Flow
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    patientId?: string;
  };
}

// 1. Verify Access Token
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired access token' });
  }
}

// 2. Role Guard
export function requireRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions' });
    }
    next();
  };
}

// 3. Ownership Guard (Protects patient data from cross-user IDOR)
export function requireOwnershipOrDoctor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const requestedPatientId = req.params.patientId;
  const isOwner = req.user?.patientId === requestedPatientId;
  const isDoctor = req.user?.role === 'doctor';

  if (!isOwner && !isDoctor) {
    return res.status(403).json({ error: 'Access forbidden: You cannot access records of another patient' });
  }
  next();
}
```

---

## 6. Phased Migration Plan from `localStorage`

### Phase 1: Dual-Write Bridge (No Downtime)
1. Deploy the API backend with PostgreSQL and Redis.
2. Update [`patientPortalService.js`](file:///Users/adityadhariwal/Desktop/retry/src/services/patientPortalService.js) and [`complaintService.js`](file:///Users/adityadhariwal/Desktop/retry/src/services/complaintService.js):
   - Check if the backend API is reachable.
   - If connected, call the backend REST endpoints and cache locally for offline access.
   - If offline or backend is unreachable, gracefully fall back to `localStorage`.

### Phase 2: Local Data Migration
1. On user login, check for existing `healthflow_patient_accounts` or `healthflow_complaints_db` in `localStorage`.
2. Sync historical offline appointments and complaints to the backend via `POST /api/v1/sync/migrate`.
3. Purge sensitive credentials and password hashes from `localStorage`.

### Phase 3: Full Cutover & Zero-Trust Enforcement
1. Enforce strict `HttpOnly` refresh cookies.
2. Store only UI preferences (theme, language, cookie preferences) in `localStorage`.
3. Protect all clinical routes behind backend token validation.

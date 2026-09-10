# HealthFlow AI Symptom Assessment & Healthcare Navigation Guide

> **Tagline:** "Right Hospital. Right Doctor. Right Time. Right Care."  
> **Mission:** Provide medically safe, preliminary symptom triage and seamlessly navigate patients to verified doctors, hospital appointment slots, and emergency 108 ambulance dispatch in Patiala, Punjab.

---

## 1. System Architecture

HealthFlow separates **Medical Symptom Assessment** from **Healthcare Navigation**:

```
                              PATIENT BROWSER
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
      [ Landing Page / Dashboard ]            [ "🤖 Talk to HealthFlow AI" ]
                                                         │
                                               [ Chatbot Interface ]
                                                         │
                 ┌───────────────────────────────────────┘
                 │ HTTP (JSON)
                 ▼
       FASTAPI BACKEND (Port 8000)
                 │
       ┌─────────┴───────────────────────────────┐
       ▼                                         ▼
[ MEDICAL ASSESSMENT LAYER ]          [ HEALTHCARE NAVIGATION LAYER ]
- Infermedica Conversational Triage   - Patiala Doctors & Hospitals Directory
- OAuth 2.0 Token Caching             - Proximity & Wait-Time Ranking
- Resilient Clinical Fallback Engine  - HealthFlow Appointment Booking Bridge
- Emergency Red-Flag Triage Engine    - 108 Emergency Ambulance Dispatch Bridge
       │                                         │
       ▼                                         ▼
Infermedica Cloud API                 HealthFlow Database / Supabase
(developer.infermedica.com)           (ai_conversations, ai_assessments, ai_symptoms)
```

---

## 2. Medical Safety & Clinical Guardrails

1. **No Definitive Diagnoses**: The chatbot never outputs "You have X condition". All potential diagnoses are categorized as `"Possible causes to discuss with your doctor"` with calibrated likelihood indicators (*Common*, *Possible*, *Less Likely*).
2. **No Pharmaceutical Prescriptions**: The chatbot will never suggest drug dosages, medications, or therapeutic regimes.
3. **Non-Autonomous Decision-Making**: Hospital bed allocations and admission decisions remain strictly under human clinical oversight.
4. **Immediate Emergency Takeover**: Symptoms matching clinical red flags (crushing retrosternal chest pain, acute dyspnea, stroke signs, thunderclap headache, anaphylaxis) immediately halt routine questioning, display a high-contrast emergency warning, and prompt the patient to activate **108 Emergency Ambulance Dispatch**.

---

## 3. Environment Variables Configuration

### Backend (`backend/.env`)

```env
# Server
ENVIRONMENT=development
PORT=8000
HOST=0.0.0.0
FRONTEND_ORIGIN=http://localhost:5173

# Infermedica Conversational Triage API Credentials
# (Obtain from https://developer.infermedica.com)
INFERMEDICA_CLIENT_ID=your_client_id_here
INFERMEDICA_CLIENT_SECRET=your_client_secret_here
INFERMEDICA_INSTANCE_ID=your_instance_id_here
INFERMEDICA_SCOPE=conversational_triage:write

# Database
DATABASE_URL=sqlite:///./healthflow_ai.db
```

> [!CAUTION]
> Never expose `INFERMEDICA_CLIENT_SECRET` or `INFERMEDICA_INSTANCE_ID` to the frontend or git repositories. All API calls to Infermedica must pass through the FastAPI backend.

### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 4. Local Development Instructions

### Running the FastAPI Backend

1. Navigate to the project root:
   ```bash
   cd /Users/adityadhariwal/Desktop/retry
   ```
2. Activate the virtual environment:
   ```bash
   source backend/venv/bin/activate
   ```
3. Start the server:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   Or simply execute:
   ```bash
   ./backend/run.sh
   ```
4. Access interactive API documentation:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Running the Frontend

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser. Click **"🤖 Talk to HealthFlow AI"** on the landing page or patient dashboard.

---

## 5. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/chat/start` | Initialize session with patient age, sex, and target |
| `POST` | `/api/chat/message` | Process user symptom turn; returns follow-up or assessment |
| `GET` | `/api/chat/{id}/assessment` | Retrieve stored clinical assessment card |
| `GET` | `/api/doctors/recommend` | Query and rank doctors by specialty and GPS distance |
| `POST` | `/api/appointments` | Book appointment directly into HealthFlow appointment flow |
| `POST` | `/api/emergency/request` | Request 108 ALS ambulance dispatch |
| `POST` | `/api/emergency/location` | Submit GPS coordinates for nearest 24/7 trauma triage |

---

## 6. Database Migration

The database schema is located at:
[`supabase/migrations/20260911000003_create_ai_triage_tables.sql`](file:///Users/adityadhariwal/Desktop/retry/supabase/migrations/20260911000003_create_ai_triage_tables.sql)

It establishes:
- `ai_conversations`: Tracks conversation lifecycle, demographic parameters, and completion status.
- `ai_assessments`: Stores triage levels (`emergency`, `consult_doctor_soon`, `self_care`), recommended specialties, calibrated possible causes, and safety advice.
- `ai_symptoms`: Logs reported symptoms, clinical probes, and patient confirmations.

---

## 7. Production Deployment Guide

### Frontend Deployment (Vercel)
1. Push repository to GitHub.
2. Link project in Vercel.
3. Configure Environment Variable:
   - `VITE_API_BASE_URL`: Your deployed FastAPI backend URL (e.g. `https://api-healthflow.onrender.com/api`).
4. Framework Preset: `Vite`. Build Command: `npm run build`. Output Directory: `dist`.

### Backend Deployment (Render / Railway / Fly.io)
1. Set Root Directory: `.`
2. Build Command: `pip install -r backend/requirements.txt`
3. Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Configure Environment Variables:
   - `INFERMEDICA_CLIENT_ID`
   - `INFERMEDICA_CLIENT_SECRET`
   - `INFERMEDICA_INSTANCE_ID`
   - `FRONTEND_ORIGIN`: Your frontend URL (e.g. `https://healthflow.vercel.app`)

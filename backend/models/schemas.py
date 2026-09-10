from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ChatStartRequest(BaseModel):
    age: int = Field(..., ge=1, le=125, description="Patient age in years")
    sex: str = Field(..., pattern="^(male|female|other)$", description="Biological sex clinically required for triage")
    target: str = Field("self", pattern="^(self|other)$", description="Whether the assessment is for user or someone else")
    patient_id: Optional[str] = None

class ChatStartResponse(BaseModel):
    conversation_id: str
    message: str
    status: str
    session_info: Dict[str, Any]

class ChatMessageRequest(BaseModel):
    conversation_id: str
    message: str = Field(..., min_length=1, max_length=2000)

class PossibleCause(BaseModel):
    name: str
    probability_label: str  # 'Common', 'Possible', 'Less Likely'
    description: str

class AssessmentResponse(BaseModel):
    conversation_id: str
    triage_level: str  # 'emergency', 'consult_doctor_soon', 'self_care'
    triage_level_display: str
    recommended_specialty: str
    assessment_summary: str
    possible_causes: List[PossibleCause]
    safety_guidance: List[str]
    is_emergency: bool = False
    disclaimer: str = (
        "HealthFlow AI provides preliminary health information and care-navigation support. "
        "It does not provide a medical diagnosis or replace a qualified healthcare professional."
    )

class ChatMessageResponse(BaseModel):
    conversation_id: str
    message: str
    status: str  # 'in_progress', 'completed', 'emergency_triaged'
    is_assessment_ready: bool = False
    is_emergency: bool = False
    assessment: Optional[AssessmentResponse] = None
    follow_up_choices: Optional[List[str]] = None

class DoctorRecommendation(BaseModel):
    id: int
    name: str
    specialization: str
    hospital_id: int
    hospital_name: str
    distance_km: float
    availability: str
    next_slot: str
    wait_time_min: int
    rating: float
    consultation_fee: int
    emergency_ready: bool

class DoctorRecommendResponse(BaseModel):
    specialty: str
    count: int
    doctors: List[DoctorRecommendation]

class AppointmentCreateRequest(BaseModel):
    doctor_id: int
    hospital_id: int
    patient_name: str
    patient_phone: str
    specialty: str
    date: str
    time_slot: str
    consultation_mode: str = "offline"

class AppointmentCreateResponse(BaseModel):
    success: bool
    appointment_id: str
    doctor_name: str
    hospital_name: str
    date: str
    time: str
    status: str
    message: str

class EmergencyRequest(BaseModel):
    patient_name: Optional[str] = "Emergency Patient"
    phone: Optional[str] = None
    condition: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = "Patiala, Punjab"

class EmergencyResponse(BaseModel):
    success: bool
    dispatch_id: str
    status: str
    ambulance_unit: str
    estimated_eta_min: int
    assigned_hospital: str
    helpline_numbers: List[str]
    message: str

class EmergencyLocationRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy_meters: Optional[float] = None
    condition: Optional[str] = "Medical Emergency"

class EmergencyLocationResponse(BaseModel):
    success: bool
    nearest_emergency_hospital: str
    distance_km: float
    est_drive_min: int
    assigned_als_ambulance: str
    ambulance_eta_min: int

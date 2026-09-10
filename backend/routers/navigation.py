from fastapi import APIRouter, Query, status
from typing import Optional
import logging

from backend.models.schemas import (
    DoctorRecommendResponse,
    AppointmentCreateRequest,
    AppointmentCreateResponse,
    EmergencyRequest,
    EmergencyResponse,
    EmergencyLocationRequest,
    EmergencyLocationResponse
)
from backend.services.healthflow_service import HealthFlowNavigationService

logger = logging.getLogger("healthflow.api.navigation")
router = APIRouter(prefix="/api", tags=["Healthcare Navigation & Emergency"])

@router.get("/health")
async def health_check():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "service": "HealthFlow AI Symptom Assessment & Navigation API",
        "tagline": "Right Hospital. Right Doctor. Right Time. Right Care.",
        "version": "1.0.0"
    }

@router.get("/doctors/recommend", response_model=DoctorRecommendResponse)
async def recommend_doctors(
    specialty: str = Query("General Medicine", description="Specialty recommended by AI assessment"),
    latitude: Optional[float] = Query(None, description="Patient latitude in Patiala"),
    longitude: Optional[float] = Query(None, description="Patient longitude in Patiala")
):
    """
    Find and rank available doctors in Patiala matching the AI-recommended medical specialty.
    """
    doctors = HealthFlowNavigationService.recommend_doctors(
        specialty=specialty,
        user_lat=latitude,
        user_lng=longitude
    )
    return DoctorRecommendResponse(
        specialty=specialty,
        count=len(doctors),
        doctors=doctors
    )

@router.post("/appointments", response_model=AppointmentCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(payload: AppointmentCreateRequest):
    """
    Directly book a consultation from the AI chatbot into HealthFlow's appointment system.
    """
    res = HealthFlowNavigationService.book_appointment(payload)
    return res

@router.post("/emergency/request", response_model=EmergencyResponse)
async def request_emergency(payload: EmergencyRequest):
    """
    Emergency assistance dispatch endpoint connecting to 108 ambulance coordination.
    """
    res = HealthFlowNavigationService.request_emergency(payload)
    return res

@router.post("/emergency/location", response_model=EmergencyLocationResponse)
async def submit_emergency_location(payload: EmergencyLocationRequest):
    """
    Ingest user-permitted browser GPS location to match closest 24/7 trauma emergency department.
    """
    res = HealthFlowNavigationService.match_emergency_location(payload)
    return res

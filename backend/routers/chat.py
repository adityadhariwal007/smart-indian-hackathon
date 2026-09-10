from fastapi import APIRouter, HTTPException, status
import logging

from backend.models.schemas import (
    ChatStartRequest,
    ChatStartResponse,
    ChatMessageRequest,
    ChatMessageResponse,
    AssessmentResponse
)
from backend.services.infermedica_service import InfermedicaService

logger = logging.getLogger("healthflow.api.chat")
router = APIRouter(prefix="/api/chat", tags=["AI Conversational Triage"])

@router.post("/start", response_model=ChatStartResponse, status_code=status.HTTP_201_CREATED)
async def start_chat(payload: ChatStartRequest):
    """
    Initialize an AI symptom assessment session.
    Collects preliminary demographic info (Age, Sex, Target) required for medical triage.
    """
    try:
        res = await InfermedicaService.start_conversation(
            age=payload.age,
            sex=payload.sex,
            target=payload.target,
            patient_id=payload.patient_id
        )
        return ChatStartResponse(**res)
    except Exception as e:
        logger.error(f"Error starting chat session: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to start AI triage session. Please try again."
        )

@router.post("/message", response_model=ChatMessageResponse)
async def send_message(payload: ChatMessageRequest):
    """
    Send patient message in natural language and receive medical AI follow-up questions
    or the final structured preliminary assessment.
    """
    try:
        res = await InfermedicaService.process_message(
            conversation_id=payload.conversation_id,
            user_text=payload.message
        )
        return res
    except Exception as e:
        logger.error(f"Error processing message: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing medical consultation turn. Please retry."
        )

@router.get("/{conversation_id}/assessment", response_model=AssessmentResponse)
async def get_assessment(conversation_id: str):
    """
    Retrieve the completed symptom assessment card for a conversation.
    """
    assessment = InfermedicaService.get_assessment(conversation_id)
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not yet completed or conversation expired."
        )
    return assessment

import time
import uuid
import re
import logging
from typing import Dict, Any, Optional, List
import httpx

from backend.config import settings
from backend.models.schemas import (
    PossibleCause,
    AssessmentResponse,
    ChatMessageResponse
)

logger = logging.getLogger("healthflow.infermedica")

# In-memory session store for conversations
_CONVERSATIONS: Dict[str, Dict[str, Any]] = {}

# In-memory OAuth token cache
_OAUTH_TOKEN_CACHE: Dict[str, Any] = {
    "token": None,
    "expires_at": 0
}

# Red-flag clinical emergency patterns
EMERGENCY_TRIGGERS = [
    r"\b(chest pain|crushing|heart attack|angina)\b",
    r"\b(can'?t breathe|difficulty breathing|shortness of breath|gasping|suffocat)\b",
    r"\b(stroke|facial droop|slurred speech|arm weak|paraly)\b",
    r"\b(thunderclap|worst headache of my life|sudden severe headache)\b",
    r"\b(stiff neck.*fever|fever.*stiff neck|meningitis)\b",
    r"\b(unconscious|passed out|fainted|loss of consciousness)\b",
    r"\b(vomiting blood|coughing blood|severe bleeding|hemorrhage)\b",
    r"\b(severe burn|deep cut|fracture|broken bone)\b",
    r"\b(anaphylaxis|swollen throat|swollen tongue|allergic reaction.*breath)\b"
]

class InfermedicaService:
    @staticmethod
    async def get_oauth_token() -> Optional[str]:
        """Fetch and cache Infermedica OAuth 2.0 Bearer Token."""
        if not (settings.INFERMEDICA_CLIENT_ID and settings.INFERMEDICA_CLIENT_SECRET):
            return None

        now = time.time()
        if _OAUTH_TOKEN_CACHE["token"] and _OAUTH_TOKEN_CACHE["expires_at"] > now + 60:
            return _OAUTH_TOKEN_CACHE["token"]

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.post(
                    settings.INFERMEDICA_OAUTH_URL,
                    data={
                        "grant_type": "client_credentials",
                        "client_id": settings.INFERMEDICA_CLIENT_ID,
                        "client_secret": settings.INFERMEDICA_CLIENT_SECRET,
                        "scope": settings.INFERMEDICA_SCOPE
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                if response.status_code == 200:
                    data = response.json()
                    token = data.get("access_token")
                    expires_in = data.get("expires_in", 3600)
                    _OAUTH_TOKEN_CACHE["token"] = token
                    _OAUTH_TOKEN_CACHE["expires_at"] = now + expires_in
                    logger.info("Successfully refreshed Infermedica OAuth token")
                    return token
                else:
                    logger.warning(f"Infermedica OAuth failed: {response.status_code} - {response.text}")
                    return None
        except Exception as e:
            logger.warning(f"Error fetching Infermedica token: {e}. Falling back to internal clinical engine.")
            return None

    @classmethod
    async def start_conversation(cls, age: int, sex: str, target: str, patient_id: Optional[str] = None) -> Dict[str, Any]:
        """Start an AI conversational triage session."""
        conv_id = f"conv_{uuid.uuid4().hex[:12]}"
        
        session_data = {
            "conversation_id": conv_id,
            "patient_id": patient_id,
            "age": age,
            "sex": sex,
            "target": target,
            "step": 0,
            "messages": [],
            "symptoms_reported": [],
            "status": "in_progress",
            "triage_level": None,
            "assessment": None,
            "created_at": time.time(),
            "use_live_infermedica": False
        }

        # Check if live Infermedica credentials exist
        token = await cls.get_oauth_token()
        if token and settings.INFERMEDICA_INSTANCE_ID:
            session_data["use_live_infermedica"] = True

        _CONVERSATIONS[conv_id] = session_data

        welcome_msg = (
            f"Hello. I am HealthFlow AI assistant. I will guide you through a preliminary symptom assessment "
            f"to help you navigate to the right care and the right doctor in Patiala.\n\n"
            f"How are you feeling today? Please describe your main symptoms in your own words."
        )

        return {
            "conversation_id": conv_id,
            "message": welcome_msg,
            "status": "in_progress",
            "session_info": {
                "age": age,
                "sex": sex,
                "target": target,
                "engine": "Infermedica Live API" if session_data["use_live_infermedica"] else "Clinical Triage Protocol"
            }
        }

    @classmethod
    async def process_message(cls, conversation_id: str, user_text: str) -> ChatMessageResponse:
        """Process a patient message and return follow-up or final assessment."""
        session = _CONVERSATIONS.get(conversation_id)
        if not session:
            # Recreate session if expired
            session = {
                "conversation_id": conversation_id,
                "age": 30,
                "sex": "male",
                "target": "self",
                "step": 0,
                "messages": [],
                "symptoms_reported": [],
                "status": "in_progress",
                "triage_level": None,
                "assessment": None,
                "created_at": time.time(),
                "use_live_infermedica": False
            }
            _CONVERSATIONS[conversation_id] = session

        session["messages"].append({"role": "user", "text": user_text, "timestamp": time.time()})
        session["step"] += 1

        # Check for immediate emergency red flags
        is_emergency = cls._check_emergency_red_flags(user_text)
        if is_emergency:
            session["status"] = "emergency_triaged"
            assessment = cls._build_emergency_assessment(conversation_id, user_text, session)
            session["assessment"] = assessment
            
            emergency_reply = (
                "🚨 URGENT MEDICAL ATTENTION MAY BE NEEDED\n\n"
                "The symptoms you described indicate a potential medical emergency. "
                "Do not wait for this chatbot. Please seek emergency medical care immediately."
            )
            return ChatMessageResponse(
                conversation_id=conversation_id,
                message=emergency_reply,
                status="emergency_triaged",
                is_assessment_ready=True,
                is_emergency=True,
                assessment=assessment
            )

        # Multi-turn Conversational Flow
        # If live Infermedica is enabled, attempt calling its conversational API
        if session.get("use_live_infermedica"):
            token = await cls.get_oauth_token()
            if token:
                try:
                    async with httpx.AsyncClient(timeout=8.0) as client:
                        resp = await client.post(
                            f"{settings.INFERMEDICA_API_BASE}/conversational_triage/message",
                            json={
                                "conversation_id": conversation_id,
                                "message": user_text,
                                "age": {"value": session["age"], "unit": "year"},
                                "sex": session["sex"]
                            },
                            headers={
                                "Authorization": f"Bearer {token}",
                                "App-Instance-Id": settings.INFERMEDICA_INSTANCE_ID
                            }
                        )
                        if resp.status_code == 200:
                            data = resp.json()
                            if data.get("should_stop") or data.get("triage_level"):
                                # Assessment is ready
                                assessment = cls._build_infermedica_assessment(conversation_id, data, session)
                                session["status"] = "completed"
                                session["assessment"] = assessment
                                return ChatMessageResponse(
                                    conversation_id=conversation_id,
                                    message="Thank you for providing these details. I have generated your preliminary care assessment below.",
                                    status="completed",
                                    is_assessment_ready=True,
                                    is_emergency=assessment.is_emergency,
                                    assessment=assessment
                                )
                            else:
                                next_q = data.get("question", {}).get("text", "Could you provide more details regarding your symptoms?")
                                choices = [c.get("label") for c in data.get("question", {}).get("items", [])]
                                return ChatMessageResponse(
                                    conversation_id=conversation_id,
                                    message=next_q,
                                    status="in_progress",
                                    follow_up_choices=choices if choices else None
                                )
                except Exception as e:
                    logger.warning(f"Infermedica live call failed: {e}. Falling back to clinical triage engine.")

        # Clinical Triage Engine (Structured conversational turns)
        step = session["step"]
        user_lower = user_text.lower()
        session["symptoms_reported"].append(user_text)

        if step == 1:
            # Turn 1: Onset and duration follow-up
            symptom_category = cls._categorize_symptom(user_lower)
            session["primary_category"] = symptom_category
            
            if symptom_category == "headache":
                question = "How long have you had this headache, and did it start gradually or very suddenly?"
            elif symptom_category == "fever":
                question = "How many days have you had the fever, and do you have chills, body pain, or a cough?"
            elif symptom_category == "abdominal":
                question = "Where in your abdomen is the pain located (e.g. upper, lower, left, right), and does it worsen after eating?"
            elif symptom_category == "chest":
                question = "Does the chest sensation radiate to your arm, neck, or jaw, and do you feel breathless?"
            else:
                question = "When did this start, and how has it progressed over the past 24 to 48 hours?"

            return ChatMessageResponse(
                conversation_id=conversation_id,
                message=question,
                status="in_progress"
            )

        elif step == 2:
            # Turn 2: Severity and character follow-up
            question = (
                "On a scale of 1 to 10 (with 10 being unbearable), how severe is the discomfort, "
                "and have you noticed any other symptoms such as nausea, dizziness, or weakness?"
            )
            return ChatMessageResponse(
                conversation_id=conversation_id,
                message=question,
                status="in_progress"
            )

        else:
            # Step >= 3: Finalize Assessment
            assessment = cls._build_clinical_assessment(conversation_id, session)
            session["status"] = "completed"
            session["assessment"] = assessment

            return ChatMessageResponse(
                conversation_id=conversation_id,
                message="Thank you for answering these questions. I have completed your preliminary symptom assessment. Please review the recommended care level and suggested specialist below.",
                status="completed",
                is_assessment_ready=True,
                is_emergency=assessment.is_emergency,
                assessment=assessment
            )

    @classmethod
    def get_assessment(cls, conversation_id: str) -> Optional[AssessmentResponse]:
        """Retrieve the stored assessment for a conversation."""
        session = _CONVERSATIONS.get(conversation_id)
        if session and session.get("assessment"):
            return session["assessment"]
        return None

    # Helper methods for clinical triage
    @staticmethod
    def _check_emergency_red_flags(text: str) -> bool:
        text_lower = text.lower()
        for pattern in EMERGENCY_TRIGGERS:
            if re.search(pattern, text_lower):
                return True
        return False

    @staticmethod
    def _categorize_symptom(text: str) -> str:
        if any(w in text for w in ["headache", "migraine", "head pain"]):
            return "headache"
        if any(w in text for w in ["fever", "temperature", "chills", "body pain"]):
            return "fever"
        if any(w in text for w in ["stomach", "abdomen", "belly", "nausea", "vomit", "cramp"]):
            return "abdominal"
        if any(w in text for w in ["chest", "heart", "palpitation"]):
            return "chest"
        if any(w in text for w in ["cough", "throat", "cold", "flu", "sneeze"]):
            return "respiratory"
        if any(w in text for w in ["knee", "back", "joint", "shoulder", "bone", "leg"]):
            return "orthopedic"
        if any(w in text for w in ["rash", "itch", "skin", "allergy"]):
            return "dermatology"
        return "general"

    @classmethod
    def _build_emergency_assessment(cls, conv_id: str, trigger_text: str, session: Dict[str, Any]) -> AssessmentResponse:
        return AssessmentResponse(
            conversation_id=conv_id,
            triage_level="emergency",
            triage_level_display="🚨 IMMEDIATE EMERGENCY MEDICAL ATTENTION",
            recommended_specialty="Emergency Medicine",
            assessment_summary=(
                "Your reported symptoms match clinical red-flag criteria that require immediate emergency evaluation. "
                "Do not wait for a routine appointment."
            ),
            possible_causes=[
                PossibleCause(
                    name="Acute High-Acuity Condition",
                    probability_label="Urgent",
                    description="Symptoms such as severe chest pressure, acute breathlessness, or acute neurological changes require rapid physical evaluation by emergency medical personnel."
                )
            ],
            safety_guidance=[
                "Immediately call 108 or activate the emergency button below.",
                "Sit or lie down in a comfortable position and do not exert yourself.",
                "If with someone, inform them immediately of what you are experiencing."
            ],
            is_emergency=True
        )

    @classmethod
    def _build_clinical_assessment(cls, conv_id: str, session: Dict[str, Any]) -> AssessmentResponse:
        combined_text = " ".join(session["symptoms_reported"]).lower()
        category = session.get("primary_category", cls._categorize_symptom(combined_text))
        
        # Clinical profiles mapping
        if category == "headache":
            specialty = "Neurology"
            summary = "Preliminary assessment indicates tension-type headache or migraine-like symptoms."
            causes = [
                PossibleCause(
                    name="Tension-Type Headache",
                    probability_label="Common",
                    description="Often linked to stress, eye strain, lack of sleep, or dehydration."
                ),
                PossibleCause(
                    name="Migraine without Aura",
                    probability_label="Possible",
                    description="Throbbing or pulsating head pain often accompanied by light sensitivity or nausea."
                ),
                PossibleCause(
                    name="Cervicogenic or Sinus Headache",
                    probability_label="Less Likely",
                    description="Headache referred from neck tension or sinus pressure."
                )
            ]
            guidance = [
                "Rest in a quiet, darkened room.",
                "Maintain adequate hydration with water or oral rehydration fluids.",
                "Avoid skipping meals and minimize prolonged screen time.",
                "Seek immediate emergency care if the headache becomes sudden, thunderclap, or accompanied by neck stiffness or vision loss."
            ]
            triage_level = "consult_doctor_soon"
            triage_display = "🟡 CONSULT A DOCTOR SOON"

        elif category == "fever":
            specialty = "General Medicine"
            summary = "Preliminary assessment suggests acute febrile illness, commonly viral in origin."
            causes = [
                PossibleCause(
                    name="Viral Upper Respiratory Infection",
                    probability_label="Common",
                    description="Self-limiting viral syndrome characterized by fever, body aches, and malaise."
                ),
                PossibleCause(
                    name="Influenza-like Illness (Flu)",
                    probability_label="Possible",
                    description="Acute viral infection causing high fever, chills, headache, and muscle soreness."
                ),
                PossibleCause(
                    name="Localized Bacterial Infection",
                    probability_label="Less Likely",
                    description="Infection requiring clinical examination and potential diagnostic workup."
                )
            ]
            guidance = [
                "Stay well hydrated with plenty of water, soups, and electrolyte solutions.",
                "Get plenty of bed rest and monitor temperature every 4 to 6 hours.",
                "Consult a general physician if fever persists past 3 days or exceeds 102°F (38.9°C)."
            ]
            triage_level = "consult_doctor_soon"
            triage_display = "🟡 CONSULT A DOCTOR SOON"

        elif category == "abdominal":
            specialty = "Gastroenterology"
            summary = "Symptoms suggest gastrointestinal discomfort or acute dyspepsia."
            causes = [
                PossibleCause(
                    name="Acute Gastroenteritis / Dyspepsia",
                    probability_label="Common",
                    description="Irritation of stomach or intestines, often post-prandial or infectious."
                ),
                PossibleCause(
                    name="Gastroesophageal Reflux (GERD)",
                    probability_label="Possible",
                    description="Acid regurgitation causing upper abdominal burning or fullness."
                ),
                PossibleCause(
                    name="Irritable Bowel Syndrome (IBS)",
                    probability_label="Less Likely",
                    description="Functional abdominal discomfort with altered bowel frequency."
                )
            ]
            guidance = [
                "Consume light, non-spicy, and bland foods (such as khichdi, curd, or toast).",
                "Avoid heavy, fried meals, caffeine, and smoking.",
                "Seek immediate medical care if abdominal pain becomes severe, rigid, or accompanied by persistent vomiting."
            ]
            triage_level = "consult_doctor_soon"
            triage_display = "🟡 CONSULT A DOCTOR SOON"

        elif category == "orthopedic":
            specialty = "Orthopedics"
            summary = "Symptoms suggest musculoskeletal strain or localized joint discomfort."
            causes = [
                PossibleCause(
                    name="Musculoskeletal Strain",
                    probability_label="Common",
                    description="Overuse or strain of tendons, ligaments, or muscles."
                ),
                PossibleCause(
                    name="Early Osteoarthritis or Joint Inflammation",
                    probability_label="Possible",
                    description="Gradual wear of joint cartilage or mild inflammatory flare-up."
                )
            ]
            guidance = [
                "Apply the RICE protocol (Rest, Ice, Compression, Elevation) where appropriate.",
                "Avoid strenuous physical lifting or high-impact stress on the affected joint.",
                "Schedule a clinical evaluation with an orthopedic specialist."
            ]
            triage_level = "self_care"
            triage_display = "🟢 ROUTINE CONSULTATION / SELF-CARE"

        elif category == "dermatology":
            specialty = "Dermatology"
            summary = "Symptoms suggest superficial cutaneous irritation or allergic dermatitis."
            causes = [
                PossibleCause(
                    name="Contact Dermatitis / Mild Allergic Rash",
                    probability_label="Common",
                    description="Skin reaction to topical irritants, soaps, plants, or fabrics."
                ),
                PossibleCause(
                    name="Urticaria (Hives)",
                    probability_label="Possible",
                    description="Transient itchy raised welts triggered by food, allergens, or viral infection."
                )
            ]
            guidance = [
                "Avoid scratching the affected skin area to prevent secondary bacterial infection.",
                "Use gentle, fragrance-free soap and moisturize skin.",
                "Consult a dermatologist for targeted topical evaluation."
            ]
            triage_level = "self_care"
            triage_display = "🟢 ROUTINE CONSULTATION / SELF-CARE"

        else:
            specialty = "General Medicine"
            summary = "Preliminary assessment indicates non-specific symptoms warranting a comprehensive clinical evaluation."
            causes = [
                PossibleCause(
                    name="Non-Specific Constitutional Symptoms",
                    probability_label="Possible",
                    description="General fatigue, malaise, or mild distress to be assessed by a physician."
                )
            ]
            guidance = [
                "Record the progression of your symptoms in a daily log.",
                "Consult a general physician for routine clinical triage and baseline investigations."
            ]
            triage_level = "consult_doctor_soon"
            triage_display = "🟡 CONSULT A DOCTOR SOON"

        return AssessmentResponse(
            conversation_id=conv_id,
            triage_level=triage_level,
            triage_level_display=triage_display,
            recommended_specialty=specialty,
            assessment_summary=summary,
            possible_causes=causes,
            safety_guidance=guidance,
            is_emergency=False
        )

    @classmethod
    def _build_infermedica_assessment(cls, conv_id: str, data: Dict[str, Any], session: Dict[str, Any]) -> AssessmentResponse:
        triage_level_raw = data.get("triage_level", "consult_doctor_soon")
        is_emerg = triage_level_raw in ["emergency", "emergency_ambulance"]
        
        display_map = {
            "emergency": "🚨 IMMEDIATE EMERGENCY CARE",
            "consult_doctor_soon": "🟡 CONSULT A DOCTOR SOON",
            "self_care": "🟢 SELF-CARE / MONITORING"
        }

        specialty = data.get("specialty", "General Medicine")

        causes = []
        for cond in data.get("conditions", [])[:3]:
            causes.append(
                PossibleCause(
                    name=cond.get("name", "Medical Condition"),
                    probability_label=cond.get("probability_label", "Possible"),
                    description=cond.get("description", "Condition to discuss with your doctor.")
                )
            )

        if not causes:
            causes.append(PossibleCause(
                name="Clinical Condition",
                probability_label="Possible",
                description="Please discuss your symptoms with a qualified physician."
            ))

        return AssessmentResponse(
            conversation_id=conv_id,
            triage_level="emergency" if is_emerg else triage_level_raw,
            triage_level_display=display_map.get(triage_level_raw, "🟡 CONSULT A DOCTOR SOON"),
            recommended_specialty=specialty,
            assessment_summary=data.get("summary", "Preliminary assessment completed via clinical triage."),
            possible_causes=causes,
            safety_guidance=data.get("guidance", [
                "Monitor symptoms closely.",
                "Seek medical attention if symptoms worsen."
            ]),
            is_emergency=is_emerg
        )

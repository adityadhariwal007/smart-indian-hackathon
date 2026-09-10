import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.routers import chat, navigation

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("healthflow.app")

app = FastAPI(
    title="HealthFlow AI Symptom Assessment & Healthcare Navigation API",
    description=(
        "Production backend for HealthFlow AI triage and care navigation. "
        "Separates dedicated medical assessment (Infermedica Conversational Triage) "
        "from healthcare coordination (doctors, hospitals, appointments, 108 emergency dispatch)."
    ),
    version="1.0.0"
)

# CORS Configuration
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://healthflow.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Request audit and timing middleware
@app.middleware("http")
async def audit_and_timing_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - Status: {response.status_code} - {duration:.3f}s")
    return response

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while coordinating healthcare triage."
        }
    )

# Mount Routers
app.include_router(chat.router)
app.include_router(navigation.router)

@app.get("/")
async def root():
    return {
        "service": "HealthFlow AI API",
        "tagline": "Right Hospital. Right Doctor. Right Time. Right Care.",
        "docs_url": "/docs",
        "endpoints": {
            "chat_start": "POST /api/chat/start",
            "chat_message": "POST /api/chat/message",
            "chat_assessment": "GET /api/chat/{conversation_id}/assessment",
            "doctor_recommend": "GET /api/doctors/recommend",
            "appointments": "POST /api/appointments",
            "emergency_request": "POST /api/emergency/request",
            "emergency_location": "POST /api/emergency/location",
            "health": "GET /api/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)

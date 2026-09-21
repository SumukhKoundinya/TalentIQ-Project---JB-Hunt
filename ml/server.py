"""TalentIQ ML FastAPI app — static SPA + face/resume/conversation APIs."""
from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from ml.enrollment.api import router as face_enroll_router
from ml.recognition.api import router as face_recognize_router
from ml.active_speaker.api import router as asd_router
from ml.transcription.api import router as transcribe_router
from ml.resume.api import router as resume_router
from ml.pipeline.api import router as conversation_router

ROOT = Path(__file__).resolve().parent.parent

app = FastAPI(title="TalentIQ ML", version="0.2.0")
app.include_router(face_enroll_router)
app.include_router(face_recognize_router)
app.include_router(asd_router)
app.include_router(transcribe_router)
app.include_router(resume_router)
app.include_router(conversation_router)

app.mount("/", StaticFiles(directory=str(ROOT), html=True), name="static")

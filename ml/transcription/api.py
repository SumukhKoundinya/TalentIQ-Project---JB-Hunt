"""Local transcription via faster-whisper tiny.en."""
from __future__ import annotations

import logging
import tempfile
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile

logger = logging.getLogger("talentiq.transcribe")
router = APIRouter(prefix="/api/transcribe", tags=["transcribe"])

_model = None


def _get_model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel("tiny.en", device="cpu", compute_type="int8")
    return _model


def transcribe_bytes(data: bytes, suffix: str = ".webm") -> list[dict[str, Any]]:
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(data)
        path = tmp.name
    try:
        model = _get_model()
        segments_iter, _info = model.transcribe(path, beam_size=1, vad_filter=True)
        segments = []
        for seg in segments_iter:
            text = (seg.text or "").strip()
            if not text:
                continue
            segments.append({
                "t0": round(float(seg.start), 2),
                "t1": round(float(seg.end), 2),
                "text": text,
            })
        return segments
    finally:
        Path(path).unlink(missing_ok=True)


@router.get("/health")
def transcribe_health() -> dict[str, Any]:
    return {"ok": True, "model": "tiny.en", "engine": "faster-whisper"}


@router.post("")
async def transcribe(file: UploadFile = File(...)) -> dict[str, Any]:
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    suffix = Path(file.filename or "audio.webm").suffix or ".webm"
    try:
        segments = transcribe_bytes(raw, suffix=suffix)
        return {"ok": True, "language": "en", "segments": segments}
    except Exception as exc:
        logger.exception("Transcription failed")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}") from exc

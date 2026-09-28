"""Local transcription via faster-whisper, tuned for noisy career-fair audio."""
from __future__ import annotations

import logging
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile

logger = logging.getLogger("talentiq.transcribe")
router = APIRouter(prefix="/api/transcribe", tags=["transcribe"])

_model = None

# Career-fair context reduces Whisper hallucinations in crowd noise.
_BOOTHS_PROMPT = (
    "Career fair conversation between a recruiter and a student. "
    "They discuss major, university, graduation date, GPA, skills, "
    "email, phone, and work authorization."
)


def _get_model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel("tiny.en", device="cpu", compute_type="int8")
    return _model


def _normalize_audio(src: Path) -> Path | None:
    """
    Extract a mono 16 kHz WAV with light high-pass + loud-norm.
    Helps Whisper ignore low rumble / distant booth chatter.
    Returns None if ffmpeg is unavailable (caller falls back to raw file).
    """
    out = src.with_suffix(".booth.wav")
    try:
        cmd = [
            "ffmpeg", "-y", "-i", str(src),
            "-vn", "-ac", "1", "-ar", "16000",
            "-af", "highpass=f=100,loudnorm=I=-16:TP=-1.5:LRA=11",
            "-loglevel", "error",
            str(out),
        ]
        subprocess.run(cmd, check=True, capture_output=True, timeout=120)
        if out.exists() and out.stat().st_size > 0:
            return out
    except (FileNotFoundError, subprocess.SubprocessError, OSError) as exc:
        logger.info("Audio normalize skipped (%s); using original media", exc)
    return None


def transcribe_bytes(data: bytes, suffix: str = ".webm") -> list[dict[str, Any]]:
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(data)
        path = Path(tmp.name)

    normalized: Path | None = None
    try:
        normalized = _normalize_audio(path)
        audio_path = normalized or path
        model = _get_model()
        # Aggressive VAD + no previous-text conditioning = better in booth noise.
        segments_iter, _info = model.transcribe(
            str(audio_path),
            beam_size=5,
            best_of=5,
            vad_filter=True,
            vad_parameters={
                "threshold": 0.55,
                "min_speech_duration_ms": 350,
                "min_silence_duration_ms": 450,
                "speech_pad_ms": 200,
            },
            condition_on_previous_text=False,
            no_speech_threshold=0.65,
            compression_ratio_threshold=2.4,
            log_prob_threshold=-0.85,
            temperature=0.0,
            initial_prompt=_BOOTHS_PROMPT,
            word_timestamps=False,
        )
        segments = []
        for seg in segments_iter:
            text = (seg.text or "").strip()
            if not text:
                continue
            # Drop very short / likely-noise fragments (crowd murmur).
            words = text.split()
            if len(words) < 2 and len(text) < 8:
                continue
            avg_logprob = float(getattr(seg, "avg_logprob", 0.0) or 0.0)
            no_speech = float(getattr(seg, "no_speech_prob", 0.0) or 0.0)
            if no_speech > 0.7 and avg_logprob < -0.9:
                continue
            segments.append({
                "t0": round(float(seg.start), 2),
                "t1": round(float(seg.end), 2),
                "text": text,
                "confidence": round(max(0.0, min(1.0, 1.0 + avg_logprob)), 3),
            })
        return segments
    finally:
        path.unlink(missing_ok=True)
        if normalized is not None:
            normalized.unlink(missing_ok=True)


@router.get("/health")
def transcribe_health() -> dict[str, Any]:
    return {
        "ok": True,
        "model": "tiny.en",
        "engine": "faster-whisper",
        "noiseHardened": True,
    }


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

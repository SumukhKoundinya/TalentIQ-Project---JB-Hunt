"""End-to-end conversation pipeline: recognize + ASD + whisper + extract."""
from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ml.active_speaker.api import build_speaker_turns
from ml.extraction.heuristics import extract_from_utterances
from ml.recognition.api import build_face_timeline as build_face_timeline
from ml.transcription.api import transcribe_bytes

logger = logging.getLogger("talentiq.pipeline")
router = APIRouter(prefix="/api/conversation", tags=["conversation"])


def _overlap(a0: float, a1: float, b0: float, b1: float) -> float:
    return max(0.0, min(a1, b1) - max(a0, b0))


def fuse_turns_segments(turns: list[dict[str, Any]], segments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    utterances: list[dict[str, Any]] = []
    for seg in segments:
        s0, s1 = float(seg["t0"]), float(seg["t1"])
        best_cid = "Unknown"
        best_ov = 0.0
        for turn in turns:
            ov = _overlap(s0, s1, float(turn["t0"]), float(turn["t1"]))
            if ov > best_ov:
                best_ov = ov
                best_cid = turn.get("candidateId") or "Unknown"
        utterances.append({
            "t0": s0,
            "t1": s1,
            "text": seg.get("text", ""),
            "candidateId": best_cid if best_ov > 0 else "Unknown",
        })
    return utterances


@router.post("/process")
async def process_conversation(
    video: UploadFile = File(...),
    gallery_json: str = Form("[]"),
    default_candidate_id: str = Form(""),
) -> dict[str, Any]:
    raw = await video.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty video")

    try:
        gallery = json.loads(gallery_json or "[]")
        if not isinstance(gallery, list):
            gallery = []
    except Exception:
        gallery = []

    try:
        timeline = await build_face_timeline(raw, gallery, fps=1.0)
        turns = build_speaker_turns(raw, timeline)
        if not turns and default_candidate_id:
            dur = 30.0
            if timeline:
                dur = max(float(r.get("t", 0)) for r in timeline) + 1.0
            turns = [{"t0": 0.0, "t1": dur, "candidateId": default_candidate_id}]

        segments = transcribe_bytes(raw, suffix=".webm")
        utterances = fuse_turns_segments(turns, segments)
        if default_candidate_id:
            for u in utterances:
                if not u.get("candidateId") or u["candidateId"] == "Unknown":
                    u["candidateId"] = default_candidate_id

        proposals = extract_from_utterances(utterances)
        return {
            "ok": True,
            "timeline": timeline,
            "turns": turns,
            "segments": segments,
            "utterances": utterances,
            "proposals": proposals,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Conversation pipeline failed")
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {exc}") from exc

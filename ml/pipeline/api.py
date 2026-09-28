"""End-to-end conversation pipeline: recognize + ASD + whisper + extract."""
from __future__ import annotations

import json
import logging
from pathlib import Path
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


def fuse_turns_segments(
    turns: list[dict[str, Any]],
    segments: list[dict[str, Any]],
    speaker_names: dict[str, str] | None = None,
) -> list[dict[str, Any]]:
    speaker_names = speaker_names or {}
    utterances: list[dict[str, Any]] = []
    for seg in segments:
        s0, s1 = float(seg["t0"]), float(seg["t1"])
        overlap_by_speaker: dict[str, dict[str, Any]] = {}
        for turn in turns:
            ov = _overlap(s0, s1, float(turn["t0"]), float(turn["t1"]))
            if ov <= 0:
                continue
            key = str(turn.get("speakerKey") or turn.get("candidateId") or "Unknown")
            row = overlap_by_speaker.setdefault(key, {
                "speakerKey": key,
                "candidateId": turn.get("candidateId"),
                "overlap": 0.0,
                "manual": False,
            })
            row["overlap"] += ov
            row["manual"] = bool(row["manual"] or turn.get("manual"))

        overlap_rows = list(overlap_by_speaker.values())
        if any(row.get("manual") for row in overlap_rows):
            overlap_rows = [row for row in overlap_rows if row.get("manual")]
        ranked = sorted(overlap_rows, key=lambda row: float(row["overlap"]), reverse=True)
        strongest = float(ranked[0]["overlap"]) if ranked else 0.0
        active = [row for row in ranked if float(row["overlap"]) >= max(0.2, strongest * 0.6)]
        candidate_ids = list(dict.fromkeys(
            str(row["candidateId"]) for row in active if row.get("candidateId")
        ))
        speaker_keys = [str(row["speakerKey"]) for row in active]
        speaker_labels = [
            speaker_names.get(str(row.get("candidateId")))
            or speaker_names.get(str(row["speakerKey"]))
            or ("Unrecognized speaker" if str(row["speakerKey"]).startswith("Unknown") else str(row["speakerKey"]))
            for row in active
        ]
        is_overlap = len(active) > 1
        # Always keep the strongest speaker as primary so extracted details
        # land on a real person card (not "Unknown") even during brief overlap.
        candidate_id = candidate_ids[0] if candidate_ids else "Unknown"
        utterances.append({
            "t0": s0,
            "t1": s1,
            "text": seg.get("text", ""),
            "candidateId": candidate_id,
            "candidateIds": candidate_ids,
            "speakerKey": speaker_keys[0] if len(speaker_keys) == 1 else (speaker_keys[0] if speaker_keys else "Multiple"),
            "speakerKeys": speaker_keys,
            "speakerName": speaker_labels[0] if len(speaker_labels) == 1 else " + ".join(speaker_labels),
            "overlappingSpeech": is_overlap,
            "confidence": seg.get("confidence"),
        })
    return utterances


def _assign_default_speaker(
    utterances: list[dict[str, Any]],
    default_candidate_id: str,
    speaker_names: dict[str, str],
    expected_count: int,
) -> None:
    """In a noisy booth with one focus candidate, attribute unclaimed speech to them."""
    if not default_candidate_id:
        return
    # Single expected person, or ASD failed to label anyone — use the card being recorded.
    aggressive = expected_count <= 1
    for u in utterances:
        has_id = u.get("candidateId") and u["candidateId"] != "Unknown"
        has_list = bool(u.get("candidateIds"))
        if has_id:
            continue
        if has_list and not aggressive:
            # Multi-person: if exactly one named id, use it; else leave for default fallback below.
            named = [str(x) for x in (u.get("candidateIds") or []) if x and x != "Unknown"]
            if len(named) == 1:
                u["candidateId"] = named[0]
                u["candidateIds"] = named
                u["speakerKey"] = named[0]
                u["speakerKeys"] = named
                u["speakerName"] = speaker_names.get(named[0], named[0])
                u["overlappingSpeech"] = False
            continue
        if aggressive or not has_list:
            u["candidateId"] = default_candidate_id
            u["candidateIds"] = [default_candidate_id]
            u["speakerKey"] = default_candidate_id
            u["speakerKeys"] = [default_candidate_id]
            u["speakerName"] = speaker_names.get(default_candidate_id, default_candidate_id)
            u["overlappingSpeech"] = False


@router.post("/process")
async def process_conversation(
    video: UploadFile = File(...),
    gallery_json: str = Form("[]"),
    default_candidate_id: str = Form(""),
    speaker_roster_json: str = Form("[]"),
    manual_turns_json: str = Form("[]"),
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
        roster = json.loads(speaker_roster_json or "[]")
        if not isinstance(roster, list):
            roster = []
    except Exception:
        roster = []

    try:
        manual_turns = json.loads(manual_turns_json or "[]")
        if not isinstance(manual_turns, list):
            manual_turns = []
    except Exception:
        manual_turns = []

    speaker_names: dict[str, str] = {}
    for person in roster:
        name = str(person.get("name") or "").strip()
        candidate_id = str(person.get("candidateId") or "").strip()
        speaker_key = str(person.get("speakerKey") or "").strip()
        if name and candidate_id:
            speaker_names[candidate_id] = name
        if name and speaker_key:
            speaker_names[speaker_key] = name

    try:
        timeline = await build_face_timeline(raw, gallery, fps=1.5)
        turns = build_speaker_turns(raw, timeline)
        for manual_turn in manual_turns:
            manual_turn["manual"] = True
            turns.append(manual_turn)
        turns.sort(key=lambda turn: (float(turn.get("t0", 0)), str(turn.get("speakerKey", ""))))
        for turn in turns:
            candidate_id = str(turn.get("candidateId") or "")
            speaker_key = str(turn.get("speakerKey") or candidate_id or "Unknown")
            turn["speakerKey"] = speaker_key
            turn["speakerName"] = (
                speaker_names.get(candidate_id)
                or speaker_names.get(speaker_key)
                or ("Unrecognized speaker" if speaker_key.startswith("Unknown") else speaker_key)
            )
        if not turns and default_candidate_id:
            dur = 30.0
            if timeline:
                dur = max(float(r.get("t", 0)) for r in timeline) + 1.0
            turns = [{
                "t0": 0.0, "t1": dur,
                "candidateId": default_candidate_id,
                "speakerKey": default_candidate_id,
                "speakerName": speaker_names.get(default_candidate_id, default_candidate_id),
            }]

        suffix = Path(video.filename or "conversation.webm").suffix or ".webm"
        segments = transcribe_bytes(raw, suffix=suffix)
        utterances = fuse_turns_segments(turns, segments, speaker_names)
        expected_people = [person for person in roster if person.get("expected", True) is not False]
        _assign_default_speaker(
            utterances,
            default_candidate_id,
            speaker_names,
            expected_count=len(expected_people) if expected_people else 1,
        )

        proposals = extract_from_utterances(utterances, default_candidate_id=default_candidate_id)
        speakers: dict[str, dict[str, Any]] = {}
        for turn in turns:
            key = str(turn.get("speakerKey") or turn.get("candidateId") or "Unknown")
            speakers[key] = {
                "speakerKey": key,
                "candidateId": turn.get("candidateId"),
                "name": turn.get("speakerName") or speaker_names.get(key) or key,
            }
        return {
            "ok": True,
            "timeline": timeline,
            "face_timeline": timeline,
            "turns": turns,
            "segments": segments,
            "utterances": utterances,
            "proposals": proposals,
            "speakers": list(speakers.values()),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Conversation pipeline failed")
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {exc}") from exc


@router.post("/process-audio")
async def process_audio_note(
    audio: UploadFile = File(...),
    candidate_id: str = Form(...),
    speaker_name: str = Form(""),
) -> dict[str, Any]:
    """Transcribe a voice note and extract Info Card proposals (no face/ASD)."""
    raw = await audio.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty audio")
    if not candidate_id.strip():
        raise HTTPException(status_code=400, detail="candidate_id required")

    suffix = Path(audio.filename or "note.webm").suffix or ".webm"
    try:
        segments = transcribe_bytes(raw, suffix=suffix)
        name = speaker_name.strip() or candidate_id
        utterances = [{
            "t0": float(seg["t0"]),
            "t1": float(seg["t1"]),
            "text": seg.get("text", ""),
            "candidateId": candidate_id,
            "candidateIds": [candidate_id],
            "speakerKey": candidate_id,
            "speakerKeys": [candidate_id],
            "speakerName": name,
            "overlappingSpeech": False,
            "confidence": seg.get("confidence"),
        } for seg in segments]
        proposals = extract_from_utterances(utterances, default_candidate_id=candidate_id)
        transcript = " ".join(u["text"] for u in utterances if u.get("text")).strip()
        return {
            "ok": True,
            "segments": segments,
            "utterances": utterances,
            "proposals": proposals,
            "transcript": transcript,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Audio note pipeline failed")
        raise HTTPException(status_code=500, detail=f"Audio processing failed: {exc}") from exc

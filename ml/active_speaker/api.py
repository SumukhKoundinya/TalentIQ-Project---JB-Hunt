"""Active speaker: mouth motion correlated with face timeline (TalkNet-swappable)."""
from __future__ import annotations

import json
import logging
import tempfile
from pathlib import Path
from typing import Any

import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

logger = logging.getLogger("talentiq.asd")
router = APIRouter(prefix="/api/active-speaker", tags=["active-speaker"])


def _mouth_openness(gray_face: np.ndarray) -> float:
    h, w = gray_face.shape[:2]
    if h < 16 or w < 16:
        return 0.0
    mouth = gray_face[int(h * 0.62): int(h * 0.88), int(w * 0.25): int(w * 0.75)]
    if mouth.size == 0:
        return 0.0
    return float(np.std(mouth) / 64.0)


def build_speaker_turns(video_bytes: bytes, face_timeline: list[dict[str, Any]]) -> list[dict[str, Any]]:
    import cv2

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp.write(video_bytes)
        path = tmp.name

    turns: list[dict[str, Any]] = []
    try:
        cap = cv2.VideoCapture(path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video")
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0

        cascade = None
        try:
            cascade_path = str(Path(cv2.__file__).parent / "data" / "haarcascade_frontalface_default.xml")
            if Path(cascade_path).exists():
                cascade = cv2.CascadeClassifier(cascade_path)
                if cascade.empty():
                    cascade = None
        except Exception:
            cascade = None

        scores: list[tuple[float, float, str | None]] = []
        frame_i = 0
        step = max(int(fps / 2), 1)
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            if frame_i % step != 0:
                frame_i += 1
                continue
            t = frame_i / fps
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            mouth = 0.0
            if cascade is not None:
                faces = cascade.detectMultiScale(gray, 1.1, 4, minSize=(60, 60))
                for (x, y, w, h) in list(faces)[:1]:
                    mouth = max(mouth, _mouth_openness(gray[y:y + h, x:x + w]))
            else:
                mouth = _mouth_openness(gray)

            cid = None
            if face_timeline:
                nearest = min(face_timeline, key=lambda r: abs(float(r.get("t", 0)) - t))
                if abs(float(nearest.get("t", 0)) - t) <= 1.0:
                    cid = nearest.get("candidateId")
            scores.append((t, mouth, cid))
            frame_i += 1
        cap.release()

        speaking = [(t, cid) for t, mouth, cid in scores if mouth >= 0.35]
        if not speaking:
            speaking = [
                (float(r.get("t", 0)), r.get("candidateId"))
                for r in face_timeline
                if r.get("candidateId")
            ]

        if speaking:
            t0, cur = speaking[0][0], speaking[0][1] or "Unknown"
            prev_t = t0
            for t, cid in speaking[1:]:
                cid = cid or "Unknown"
                if cid != cur or t - prev_t > 1.5:
                    turns.append({"t0": round(t0, 2), "t1": round(prev_t + 0.5, 2), "candidateId": cur})
                    t0, cur = t, cid
                prev_t = t
            turns.append({"t0": round(t0, 2), "t1": round(prev_t + 0.5, 2), "candidateId": cur})
    finally:
        Path(path).unlink(missing_ok=True)
    return turns


@router.post("/analyze")
async def analyze_active_speaker(
    video: UploadFile = File(...),
    face_timeline_json: str = Form("[]"),
) -> dict[str, Any]:
    try:
        face_timeline = json.loads(face_timeline_json or "[]")
    except Exception:
        face_timeline = []
    raw = await video.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty video")
    turns = build_speaker_turns(raw, face_timeline)
    return {"ok": True, "turns": turns, "method": "mouth_motion_v1"}

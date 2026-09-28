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

        scores: list[dict[str, Any]] = []
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
            faces: list[tuple[int, int, int, int]] = []
            if cascade is not None:
                detected = cascade.detectMultiScale(gray, 1.1, 4, minSize=(60, 60))
                faces = sorted(
                    [(int(x), int(y), int(w), int(h)) for x, y, w, h in detected],
                    key=lambda box: box[0],
                )
            else:
                h, w = gray.shape[:2]
                faces = [(0, 0, w, h)]

            nearest: dict[str, Any] | None = None
            if face_timeline:
                candidate = min(face_timeline, key=lambda r: abs(float(r.get("t", 0)) - t))
                if abs(float(candidate.get("t", 0)) - t) <= 1.0:
                    nearest = candidate

            nearest_detections = (nearest or {}).get("detections") or []
            for face_index, (x, y, w, h) in enumerate(faces):
                mouth = _mouth_openness(gray[y:y + h, x:x + w])
                match: dict[str, Any] | None = None
                if nearest_detections:
                    cx, cy = x + w / 2, y + h / 2

                    def distance(det: dict[str, Any]) -> float:
                        box = det.get("box") or {}
                        dx = float(box.get("x", 0)) + float(box.get("w", 0)) / 2 - cx
                        dy = float(box.get("y", 0)) + float(box.get("h", 0)) / 2 - cy
                        return dx * dx + dy * dy

                    match = min(nearest_detections, key=distance)
                cid = (match or {}).get("candidateId")
                speaker_key = (match or {}).get("speakerKey") or cid or f"Unknown-{face_index + 1}"
                scores.append({
                    "t": t,
                    "mouth": mouth,
                    "candidateId": cid,
                    "speakerKey": speaker_key,
                })
            frame_i += 1
        cap.release()

        # Higher mouth threshold filters background chatter when faces are still.
        # Soften when average mouth motion is low (quiet talker / noisy booth).
        mouth_vals = [float(row.get("mouth", 0)) for row in scores]
        mean_mouth = (sum(mouth_vals) / len(mouth_vals)) if mouth_vals else 0.0
        mouth_threshold = 0.42 if mean_mouth >= 0.25 else 0.28
        speaking = [row for row in scores if float(row.get("mouth", 0)) >= mouth_threshold]
        if not speaking:
            for row in face_timeline:
                for det in row.get("detections") or []:
                    speaking.append({
                        "t": float(row.get("t", 0)),
                        "candidateId": det.get("candidateId"),
                        "speakerKey": det.get("speakerKey") or det.get("candidateId"),
                    })
                if not row.get("detections") and row.get("candidateId"):
                    speaking.append({
                        "t": float(row.get("t", 0)),
                        "candidateId": row.get("candidateId"),
                        "speakerKey": row.get("candidateId"),
                    })

        # Build one timeline per visible speaker so overlapping talk is preserved.
        by_speaker: dict[str, list[dict[str, Any]]] = {}
        for row in speaking:
            key = str(row.get("speakerKey") or row.get("candidateId") or "Unknown")
            by_speaker.setdefault(key, []).append(row)

        for key, rows in by_speaker.items():
            rows.sort(key=lambda row: float(row.get("t", 0)))
            t0 = float(rows[0].get("t", 0))
            prev_t = t0
            cid = rows[0].get("candidateId")
            for row in rows[1:]:
                t = float(row.get("t", 0))
                if t - prev_t > 1.5:
                    turns.append({
                        "t0": round(t0, 2), "t1": round(prev_t + 0.5, 2),
                        "speakerKey": key, "candidateId": cid,
                    })
                    t0 = t
                    cid = row.get("candidateId")
                prev_t = t
            turns.append({
                "t0": round(t0, 2), "t1": round(prev_t + 0.5, 2),
                "speakerKey": key, "candidateId": cid,
            })
        turns.sort(key=lambda turn: (float(turn["t0"]), str(turn.get("speakerKey", ""))))
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
    return {"ok": True, "turns": turns, "method": "mouth_motion_multi_v2"}

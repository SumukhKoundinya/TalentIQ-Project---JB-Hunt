"""Face recognition from video frames against an uploaded embedding gallery."""
from __future__ import annotations

import json
import logging
import tempfile
from pathlib import Path
from typing import Any

import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ml.recognition.matching import FACE_MODEL, MATCH_THRESHOLD, match_embedding, mean_embeddings

logger = logging.getLogger("talentiq.recognition")
router = APIRouter(prefix="/api/face", tags=["face"])


async def build_face_timeline(video_bytes: bytes, gallery: list[dict[str, Any]], fps: float = 1.0) -> list[dict[str, Any]]:
    import cv2
    from deepface import DeepFace

    prototypes = mean_embeddings(gallery)
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp.write(video_bytes)
        tmp_path = tmp.name

    timeline: list[dict[str, Any]] = []
    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video")
        video_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        step = max(int(video_fps / max(fps, 0.1)), 1)
        frame_i = 0
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            if frame_i % step != 0:
                frame_i += 1
                continue
            t = frame_i / video_fps
            try:
                reps = DeepFace.represent(
                    img_path=frame,
                    model_name=FACE_MODEL,
                    enforce_detection=True,
                    detector_backend="mtcnn",
                )
            except Exception:
                timeline.append({"t": round(t, 2), "candidateId": None, "confidence": 0.0, "faces": 0})
                frame_i += 1
                continue

            best_id = None
            best_sim = 0.0
            for rep in reps or []:
                emb = np.asarray(rep.get("embedding") or [], dtype=np.float64)
                if emb.size == 0:
                    continue
                cid, sim = match_embedding(emb, prototypes)
                if sim > best_sim:
                    best_sim = sim
                    best_id = cid
            timeline.append({
                "t": round(t, 2),
                "candidateId": best_id,
                "confidence": round(float(best_sim), 4),
                "faces": len(reps or []),
            })
            frame_i += 1
        cap.release()
    finally:
        Path(tmp_path).unlink(missing_ok=True)
    return timeline


@router.post("/recognize-video")
async def recognize_video(
    video: UploadFile = File(...),
    gallery_json: str = Form(...),
    fps: float = Form(1.0),
) -> dict[str, Any]:
    try:
        gallery = json.loads(gallery_json)
        if not isinstance(gallery, list):
            raise ValueError("gallery_json must be a list")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid gallery_json: {exc}") from exc

    raw = await video.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty video")

    timeline = await build_face_timeline(raw, gallery, fps=fps)
    return {
        "ok": True,
        "model": FACE_MODEL,
        "threshold": MATCH_THRESHOLD,
        "timeline": timeline,
        "gallerySize": len(mean_embeddings(gallery)),
    }

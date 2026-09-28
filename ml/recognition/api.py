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
                timeline.append({"t": round(t, 2), "candidateId": None, "confidence": 0.0, "faces": 0, "detections": []})
                frame_i += 1
                continue

            best_id = None
            best_sim = 0.0
            detections: list[dict[str, Any]] = []
            ordered_reps = sorted(
                reps or [],
                key=lambda rep: float((rep.get("facial_area") or {}).get("x", 0)),
            )
            for face_index, rep in enumerate(ordered_reps):
                emb = np.asarray(rep.get("embedding") or [], dtype=np.float64)
                if emb.size == 0:
                    continue
                cid, sim = match_embedding(emb, prototypes)
                area = rep.get("facial_area") or {}
                speaker_key = cid or f"Unknown-{face_index + 1}"
                detections.append({
                    "speakerKey": speaker_key,
                    "candidateId": cid,
                    "confidence": round(float(sim), 4),
                    "box": {
                        "x": int(area.get("x", 0)),
                        "y": int(area.get("y", 0)),
                        "w": int(area.get("w", 0)),
                        "h": int(area.get("h", 0)),
                    },
                })
                if sim > best_sim:
                    best_sim = sim
                    best_id = cid
            timeline.append({
                "t": round(t, 2),
                "candidateId": best_id,
                "confidence": round(float(best_sim), 4),
                "faces": len(reps or []),
                "detections": detections,
            })
            frame_i += 1
        cap.release()
    finally:
        Path(tmp_path).unlink(missing_ok=True)
    return timeline


def _recognize_image_bgr(img_bgr: Any, gallery: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Match faces in a single BGR frame against the gallery (multi-person)."""
    from deepface import DeepFace

    prototypes = mean_embeddings(gallery)
    h, w = img_bgr.shape[:2]
    try:
        reps = DeepFace.represent(
            img_path=img_bgr,
            model_name=FACE_MODEL,
            enforce_detection=True,
            detector_backend="mtcnn",
        )
    except Exception:
        return []

    detections: list[dict[str, Any]] = []
    ordered_reps = sorted(
        reps or [],
        key=lambda rep: float((rep.get("facial_area") or {}).get("x", 0)),
    )
    for face_index, rep in enumerate(ordered_reps):
        emb = np.asarray(rep.get("embedding") or [], dtype=np.float64)
        if emb.size == 0:
            continue
        cid, sim = match_embedding(emb, prototypes) if prototypes else (None, 0.0)
        area = rep.get("facial_area") or {}
        x = int(area.get("x", 0))
        y = int(area.get("y", 0))
        bw = int(area.get("w", 0))
        bh = int(area.get("h", 0))
        if bw < 8 or bh < 8:
            continue
        speaker_key = cid or f"Unknown-{face_index + 1}"
        detections.append({
            "speakerKey": speaker_key,
            "candidateId": cid,
            "confidence": round(float(sim), 4),
            "box": {"x": x, "y": y, "w": bw, "h": bh},
            "normBox": {
                "x": round(x / max(w, 1), 4),
                "y": round(y / max(h, 1), 4),
                "w": round(bw / max(w, 1), 4),
                "h": round(bh / max(h, 1), 4),
            },
        })

    # Non-max suppression for near-duplicate boxes (same person counted twice)
    detections.sort(
        key=lambda d: float(d["normBox"]["w"]) * float(d["normBox"]["h"]),
        reverse=True,
    )
    kept: list[dict[str, Any]] = []
    for det in detections:
        box = det["normBox"]
        ax1, ay1 = box["x"], box["y"]
        ax2, ay2 = ax1 + box["w"], ay1 + box["h"]
        duplicate = False
        for other in kept:
            ob = other["normBox"]
            bx1, by1 = ob["x"], ob["y"]
            bx2, by2 = bx1 + ob["w"], by1 + ob["h"]
            ix1, iy1 = max(ax1, bx1), max(ay1, by1)
            ix2, iy2 = min(ax2, bx2), min(ay2, by2)
            inter = max(0.0, ix2 - ix1) * max(0.0, iy2 - iy1)
            union = box["w"] * box["h"] + ob["w"] * ob["h"] - inter
            if union > 0 and inter / union > 0.45:
                duplicate = True
                break
        if not duplicate:
            kept.append(det)
    kept.sort(key=lambda d: float(d["normBox"]["x"]))
    for i, det in enumerate(kept):
        det["personIndex"] = i + 1
    return kept


@router.post("/recognize-frame")
async def recognize_frame(
    image: UploadFile = File(...),
    gallery_json: str = Form(...),
) -> dict[str, Any]:
    """Live naming: detect + match faces in one camera frame."""
    try:
        gallery = json.loads(gallery_json)
        if not isinstance(gallery, list):
            raise ValueError("gallery_json must be a list")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid gallery_json: {exc}") from exc

    raw = await image.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty image")

    try:
        from PIL import Image as PILImage
        import cv2

        pil = PILImage.open(__import__("io").BytesIO(raw)).convert("RGB")
        img_bgr = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image: {exc}") from exc

    detections = _recognize_image_bgr(img_bgr, gallery)
    return {
        "ok": True,
        "model": FACE_MODEL,
        "threshold": MATCH_THRESHOLD,
        "detections": detections,
        "faces": len(detections),
        "gallerySize": len(mean_embeddings(gallery)),
        "imageWidth": int(img_bgr.shape[1]),
        "imageHeight": int(img_bgr.shape[0]),
    }


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

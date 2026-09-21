"""TalentIQ ML API — face enrollment (Milestone 1)."""
from __future__ import annotations

import io
import logging
from typing import Any

import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

logger = logging.getLogger("talentiq.face")

FACE_MODEL = "Facenet512"
ALLOWED_ANGLES = frozenset({"front", "left", "right", "slight_up", "slight_down"})

router = APIRouter(prefix="/api/face", tags=["face"])


def _load_image_bgr(data: bytes) -> np.ndarray:
    """Decode uploaded bytes to OpenCV BGR array."""
    try:
        from PIL import Image as PILImage
        import cv2

        img = PILImage.open(io.BytesIO(data)).convert("RGB")
        arr = np.array(img)
        return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image: {exc}") from exc


@router.get("/health")
def face_health() -> dict[str, Any]:
    return {
        "ok": True,
        "model": FACE_MODEL,
        "version": "m1-enrollment",
        "angles": sorted(ALLOWED_ANGLES),
    }


@router.post("/enroll")
async def face_enroll(
    candidate_id: str = Form(...),
    angle: str = Form(...),
    image: UploadFile = File(...),
) -> dict[str, Any]:
    """Generate a face embedding for one enrollment angle.

    Does NOT run age/gender/race attribute analysis.
    """
    candidate_id = (candidate_id or "").strip()
    angle = (angle or "").strip().lower()

    if not candidate_id:
        raise HTTPException(status_code=400, detail="candidate_id is required")
    if angle not in ALLOWED_ANGLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid angle. Allowed: {sorted(ALLOWED_ANGLES)}",
        )

    raw = await image.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty image upload")

    img_bgr = _load_image_bgr(raw)

    try:
        from deepface import DeepFace

        results = DeepFace.represent(
            img_path=img_bgr,
            model_name=FACE_MODEL,
            enforce_detection=True,
            detector_backend="mtcnn",
        )
    except ValueError as exc:
        # DeepFace raises ValueError when no face is detected
        logger.info("No face detected for %s/%s: %s", candidate_id, angle, exc)
        raise HTTPException(
            status_code=400,
            detail="No face detected. Adjust lighting or angle and try again.",
        ) from exc
    except Exception as exc:
        logger.exception("DeepFace.represent failed")
        raise HTTPException(
            status_code=500,
            detail=f"Face embedding failed: {exc}",
        ) from exc

    if not results or not isinstance(results, list):
        raise HTTPException(status_code=400, detail="No face detected")

    embedding = results[0].get("embedding")
    if not embedding:
        raise HTTPException(status_code=400, detail="No face detected")

    # Prefer the strongest face if multiple detected
    if len(results) > 1:
        results = sorted(
            results,
            key=lambda r: float(r.get("face_confidence") or 0),
            reverse=True,
        )
        embedding = results[0]["embedding"]

    vec = [float(x) for x in embedding]

    return {
        "ok": True,
        "candidate_id": candidate_id,
        "angle": angle,
        "embedding": vec,
        "embedding_dim": len(vec),
        "model": FACE_MODEL,
        "face_detected": True,
    }

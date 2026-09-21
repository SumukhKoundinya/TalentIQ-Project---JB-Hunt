"""Resume parse API — PDF/DOCX → heuristic fields."""
from __future__ import annotations

import io
import logging
from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile

from ml.resume.extract import extract_fields

logger = logging.getLogger("talentiq.resume")
router = APIRouter(prefix="/api/resume", tags=["resume"])


def _text_from_pdf(data: bytes) -> str:
    import pdfplumber

    parts: list[str] = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            t = page.extract_text() or ""
            if t.strip():
                parts.append(t)
    return "\n".join(parts)


def _text_from_docx(data: bytes) -> str:
    import docx

    document = docx.Document(io.BytesIO(data))
    return "\n".join(p.text for p in document.paragraphs if p.text.strip())


@router.get("/health")
def resume_health() -> dict[str, Any]:
    return {"ok": True, "formats": ["pdf", "docx"], "version": "m-resume"}


@router.post("/parse")
async def resume_parse(file: UploadFile = File(...)) -> dict[str, Any]:
    filename = (file.filename or "resume").lower()
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        if filename.endswith(".pdf"):
            text = _text_from_pdf(raw)
        elif filename.endswith(".docx"):
            text = _text_from_docx(raw)
        elif filename.endswith(".doc"):
            raise HTTPException(
                status_code=400,
                detail="Legacy .doc not supported. Please upload PDF or DOCX.",
            )
        else:
            # Try PDF then plain text
            try:
                text = _text_from_pdf(raw)
            except Exception:
                text = raw.decode("utf-8", errors="ignore")
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Resume parse failed")
        raise HTTPException(status_code=400, detail=f"Could not read resume: {exc}") from exc

    if not (text or "").strip():
        raise HTTPException(status_code=400, detail="No extractable text in resume")

    mapped = extract_fields(text)
    return {
        "ok": True,
        "filename": file.filename,
        "fields": mapped["fields"],
        "confidence": mapped["confidence"],
        "rawHints": mapped["rawHints"],
        "textChars": len(text),
    }

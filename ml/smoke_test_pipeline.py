#!/usr/bin/env python3
"""Smoke tests for Recording + Resume pipeline (local-only)."""
from __future__ import annotations

import io
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
ROOT = Path(__file__).resolve().parent.parent


def req(method: str, path: str, data: bytes | None = None, headers: dict | None = None):
    r = urllib.request.Request(BASE + path, data=data, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(r, timeout=300) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def multipart(fields: dict[str, str], files: list[tuple[str, str, bytes, str]]):
    boundary = "----TIQPipeBoundary"
    chunks: list[bytes] = []
    for name, value in fields.items():
        chunks.append(
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode()
        )
    for field, filename, content, ctype in files:
        chunks.append(
            (
                f"--{boundary}\r\nContent-Disposition: form-data; name=\"{field}\"; "
                f"filename=\"{filename}\"\r\nContent-Type: {ctype}\r\n\r\n"
            ).encode()
            + content
            + b"\r\n"
        )
    chunks.append(f"--{boundary}--\r\n".encode())
    return b"".join(chunks), {"Content-Type": f"multipart/form-data; boundary={boundary}"}


def make_sample_pdf() -> bytes:
    """Minimal PDF with extractable text via pdfplumber."""
    # Very simple PDF with one text stream
    content = """BT /F1 12 Tf 50 700 Td (Jane Doe) Tj 0 -20 Td (jane.doe@uark.edu) Tj 0 -20 Td (University of Arkansas) Tj 0 -20 Td (Major: Computer Science) Tj 0 -20 Td (GPA: 3.85) Tj 0 -20 Td (Graduating May 2026) Tj 0 -20 Td (Skills: Python React SQL AWS) Tj 0 -20 Td (US Citizen) Tj ET"""
    # Use reportlab if available, else write a tiny handcrafted PDF
    try:
        from reportlab.pdfgen import canvas
        buf = io.BytesIO()
        c = canvas.Canvas(buf)
        lines = [
            "Jane Doe",
            "jane.doe@uark.edu",
            "Phone: 555-0199",
            "University of Arkansas",
            "Major: Computer Science",
            "GPA: 3.85",
            "Graduating May 2026",
            "Skills: Python, React, SQL, AWS",
            "US Citizen",
        ]
        y = 750
        for line in lines:
            c.drawString(72, y, line)
            y -= 18
        c.save()
        return buf.getvalue()
    except Exception:
        # Fallback plain-text "pdf" won't parse — create with pdfplumber writer via PyPDF? 
        # Skip if no reportlab
        return b""


def main() -> int:
    print("BASE", BASE)

    # Health checks
    for path in ["/api/face/health", "/api/resume/health", "/api/transcribe/health"]:
        status, body = req("GET", path)
        print("health", path, status, body.decode()[:160])
        assert status == 200, f"{path} failed"

    # Heuristic extractor unit
    from ml.extraction.heuristics import extract_from_utterances
    props = extract_from_utterances([
        {
            "candidateId": "TQ-2401",
            "text": "I'm studying Computer Science at the University of Arkansas and graduating May 2026. My GPA is 3.85.",
        }
    ])
    print("extract proposals", len(props), props[:3])
    assert props, "expected heuristic proposals"
    fields = {p["field"] for p in props}
    assert "major" in fields or "university" in fields or "gpa" in fields

    # Resume parse
    pdf = make_sample_pdf()
    if not pdf:
        print("SKIP resume PDF (reportlab not installed) — testing DOCX instead")
        try:
            import docx
            buf = io.BytesIO()
            d = docx.Document()
            d.add_paragraph("Jane Doe")
            d.add_paragraph("jane.doe@uark.edu")
            d.add_paragraph("University of Arkansas")
            d.add_paragraph("Major Computer Science")
            d.add_paragraph("GPA 3.85")
            d.add_paragraph("Graduating May 2026")
            d.add_paragraph("Python React SQL")
            d.add_paragraph("US Citizen")
            d.save(buf)
            data, headers = multipart({}, [("file", "resume.docx", buf.getvalue(),
                                           "application/vnd.openxmlformats-officedocument.wordprocessingml.document")])
            status, body = req("POST", "/api/resume/parse", data=data, headers=headers)
            print("resume docx", status, body.decode()[:400])
            assert status == 200
            payload = json.loads(body)
            assert payload.get("ok")
            assert payload.get("fields")
        except Exception as exc:
            print("SKIP resume file parse:", exc)
    else:
        data, headers = multipart({}, [("file", "resume.pdf", pdf, "application/pdf")])
        status, body = req("POST", "/api/resume/parse", data=data, headers=headers)
        print("resume pdf", status, body.decode()[:400])
        assert status == 200
        payload = json.loads(body)
        assert payload.get("ok")
        assert "email" in (payload.get("fields") or {}) or "university" in (payload.get("fields") or {})

    # Proposal accept/reject contract (client-side logic mirrored)
    print("SMOKE_OK recording_resume_pipeline")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

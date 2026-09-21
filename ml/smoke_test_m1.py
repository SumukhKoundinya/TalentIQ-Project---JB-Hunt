#!/usr/bin/env python3
"""Milestone 1 smoke tests for face enrollment API (no browser/camera)."""
from __future__ import annotations

import io
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
ROOT = Path(__file__).resolve().parent.parent
FACE_PATH = ROOT / "ml" / "testdata" / "obama.jpg"
ANGLES = ["front", "left", "right", "slight_up", "slight_down"]


def req(method: str, path: str, data: bytes | None = None, headers: dict | None = None):
    r = urllib.request.Request(BASE + path, data=data, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(r, timeout=300) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def multipart(fields: dict[str, str], file_field: str, filename: str, content: bytes, content_type: str = "image/jpeg"):
    boundary = "----TIQBoundary"
    chunks: list[bytes] = []
    for name, value in fields.items():
        chunks.append(
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode()
        )
    chunks.append(
        (
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"{file_field}\"; "
            f"filename=\"{filename}\"\r\nContent-Type: {content_type}\r\n\r\n"
        ).encode()
        + content
        + b"\r\n"
    )
    chunks.append(f"--{boundary}--\r\n".encode())
    return b"".join(chunks), {"Content-Type": f"multipart/form-data; boundary={boundary}"}


def main() -> int:
    print("BASE", BASE)

    status, body = req("GET", "/api/face/health")
    print("health", status, body.decode()[:240])
    assert status == 200, "health failed"
    health = json.loads(body)
    assert health.get("ok") is True
    assert health.get("model") == "Facenet512"

    # No-face path
    try:
        from PIL import Image
    except ImportError:
        print("Pillow missing; skip image tests")
        return 0

    buf = io.BytesIO()
    Image.new("RGB", (200, 200), (128, 128, 128)).save(buf, format="JPEG")
    gray = buf.getvalue()
    data, headers = multipart(
        {"candidate_id": "TQ-TEST", "angle": "front"},
        "image",
        "gray.jpg",
        gray,
    )
    status, body = req("POST", "/api/face/enroll", data=data, headers=headers)
    print("no-face enroll", status, body.decode()[:300])
    assert status == 400, "expected 400 for no face"

    if not FACE_PATH.exists():
        print("missing sample face at", FACE_PATH)
        print("SMOKE_PARTIAL_OK")
        return 0

    face_bytes = FACE_PATH.read_bytes()
    for cid in ("TQ-2401", "TQ-2402"):
        for angle in ANGLES:
            data, headers = multipart(
                {"candidate_id": cid, "angle": angle},
                "image",
                "face.jpg",
                face_bytes,
            )
            status, body = req("POST", "/api/face/enroll", data=data, headers=headers)
            print("enroll", cid, angle, status)
            assert status == 200, body.decode()[:400]
            payload = json.loads(body)
            assert payload.get("ok") is True
            assert payload.get("face_detected") is True
            assert isinstance(payload.get("embedding"), list)
            assert len(payload["embedding"]) == 512

    print("SMOKE_OK two_candidates five_angles")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""Shared face-matching helpers."""
from __future__ import annotations

from typing import Any

import numpy as np

FACE_MODEL = "Facenet512"
MATCH_THRESHOLD = 0.40


def cosine(a: np.ndarray, b: np.ndarray) -> float:
    na = np.linalg.norm(a)
    nb = np.linalg.norm(b)
    if na < 1e-9 or nb < 1e-9:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


def mean_embeddings(gallery: list[dict[str, Any]]) -> dict[str, np.ndarray]:
    buckets: dict[str, list[np.ndarray]] = {}
    for row in gallery:
        cid = row.get("candidateId") or row.get("candidate_id")
        emb = row.get("embedding")
        if not cid or not emb:
            continue
        buckets.setdefault(str(cid), []).append(np.asarray(emb, dtype=np.float64))
    return {cid: np.mean(np.stack(vecs), axis=0) for cid, vecs in buckets.items() if vecs}


def match_embedding(emb: np.ndarray, prototypes: dict[str, np.ndarray]) -> tuple[str | None, float]:
    best_id = None
    best_sim = -1.0
    for cid, proto in prototypes.items():
        sim = cosine(emb, proto)
        if sim > best_sim:
            best_sim = sim
            best_id = cid
    if best_sim < MATCH_THRESHOLD:
        return None, float(max(best_sim, 0.0))
    return best_id, float(best_sim)

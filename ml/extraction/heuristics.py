"""Heuristic speech → profile field extraction (local-only)."""
from __future__ import annotations

import re
from typing import Any


FIELD_PATTERNS: list[tuple[str, str, re.Pattern[str]]] = [
    ("major", "Major", re.compile(
        r"(?:major(?:ing)? in|degree in)\s+([A-Za-z][A-Za-z ]{1,40}?)(?:\s+at\b|\s+and\b|[.,]|$)",
        re.I,
    )),
    ("university", "University", re.compile(
        r"(?:at|attend(?:ing)?|student at)\s+(?:the\s+)?(University of [A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+){0,3})",
        re.I,
    )),
    ("university", "University", re.compile(
        r"\b(University of [A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+){0,3}|[A-Z][A-Za-z]+ State University)\b"
    )),
    ("graduationDate", "Graduation Date", re.compile(
        r"(?:graduat(?:e|ing)|class of)\s+(?:in\s+)?((?:May|June|December|August|Spring|Fall)\s+20\d{2}|20\d{2})",
        re.I,
    )),
    ("gpa", "GPA", re.compile(r"\bGPA\s*(?:of\s*|is\s*|:?\s*)([0-4](?:\.\d{1,2})?)\b", re.I)),
    ("email", "Email", re.compile(r"\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b")),
    ("phone", "Phone", re.compile(r"\b(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b")),
    ("workAuthorization", "Work Authorization", re.compile(
        r"\b(US citizen|U\.S\. citizen|need(?:s)? sponsorship|require(?:s)? sponsorship|OPT|CPT)\b",
        re.I,
    )),
]

SKILL_WORDS = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "SQL", "AWS",
    "Docker", "Excel", "Power BI", "Tableau", "C++", "Linux", "Git",
]


def _norm_auth(val: str) -> str:
    v = val.lower()
    if "citizen" in v:
        return "US Citizen"
    if "sponsorship" in v:
        return "Require Sponsorship"
    if "opt" in v or "cpt" in v:
        return "OPT/CPT"
    return val


def extract_from_utterances(utterances: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return proposal dicts: {candidateId, field, label, value, quote, source}."""
    out: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()

    for u in utterances:
        cid = u.get("candidateId")
        if not cid or cid == "Unknown":
            continue
        text = (u.get("text") or "").strip()
        if not text:
            continue

        for field, label, pat in FIELD_PATTERNS:
            m = pat.search(text)
            if not m:
                continue
            value = m.group(m.lastindex or 1).strip(" .,;")
            # Drop leading 'the '
            if value.lower().startswith("the "):
                value = value[4:]
            # Drop trailing junk from greedy university matches
            value = re.split(r"\s+(?:and|graduat|with|where)\b", value, maxsplit=1, flags=re.I)[0].strip()
            if field == "workAuthorization":
                value = _norm_auth(value)
            if field == "graduationDate":
                value = value.title() if not value.startswith("20") else f"May {value}"
            key = (cid, field, value.lower())
            if key in seen or len(value) < 2:
                continue
            # Prefer cleaner university if we already have a longer dirty one
            if field == "university":
                dirty = [i for i, p in enumerate(out) if p["candidateId"] == cid and p["field"] == "university"]
                if dirty and len(value) < len(out[dirty[0]]["value"]):
                    out[dirty[0]]["value"] = value
                    continue
            seen.add(key)
            out.append({
                "candidateId": cid,
                "field": field,
                "label": label,
                "value": value,
                "quote": text[:240],
                "source": "conversation",
            })

        # studying <major> at …
        m_study = re.search(
            r"studying\s+([A-Za-z][A-Za-z ]{1,40}?)\s+at\b",
            text,
            re.I,
        )
        if m_study:
            value = m_study.group(1).strip()
            key = (cid, "major", value.lower())
            if key not in seen:
                seen.add(key)
                out.append({
                    "candidateId": cid,
                    "field": "major",
                    "label": "Major",
                    "value": value,
                    "quote": text[:240],
                    "source": "conversation",
                })

        found_skills = [s for s in SKILL_WORDS if re.search(rf"\b{re.escape(s)}\b", text, re.I)]
        if found_skills:
            value = ", ".join(found_skills)
            key = (cid, "skills", value.lower())
            if key not in seen:
                seen.add(key)
                out.append({
                    "candidateId": cid,
                    "field": "skills",
                    "label": "Skills",
                    "value": value,
                    "quote": text[:240],
                    "source": "conversation",
                })

    return out

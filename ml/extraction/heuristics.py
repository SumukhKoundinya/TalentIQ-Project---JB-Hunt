"""Heuristic speech → profile field extraction (local-only).

Tuned for natural career-fair phrasing and noisy ASR transcripts.
"""
from __future__ import annotations

import re
from typing import Any


FIELD_PATTERNS: list[tuple[str, str, re.Pattern[str]]] = [
    ("major", "Major", re.compile(
        r"(?:major(?:ing)?\s+in|degree in|studying|i(?:'m| am) (?:a |an )|"
        r"my major(?:\s+is)?)\s+([A-Za-z][A-Za-z &/+-]{1,45}?)(?:\s+at\b|\s+and\b|\s+with\b|[.,]|$)",
        re.I,
    )),
    ("major", "Major", re.compile(
        r"\b((?:computer|data|industrial|mechanical|electrical|civil|software|supply chain|"
        r"information|business|finance|accounting|marketing|logistics|operations)\s+"
        r"(?:science|engineering|systems|analytics|management|technology|administration)?)\b",
        re.I,
    )),
    ("university", "University", re.compile(
        r"(?:at|attend(?:ing)?|student at|go(?:ing)? to|from)\s+(?:the\s+)?"
        r"(University of [A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+){0,3}"
        r"|[A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+){0,2} (?:State )?University"
        r"|[A-Z][A-Za-z]+ (?:Tech|College|Institute))",
        re.I,
    )),
    ("university", "University", re.compile(
        r"\b(University of [A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+){0,3}"
        r"|[A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+){0,2} State University"
        r"|Arkansas|UARK|UA Fayetteville)\b"
    )),
    ("graduationDate", "Graduation Date", re.compile(
        r"(?:graduat(?:e|ing)|class of|finish(?:ing)?|wrap(?:ping)? up)\s+"
        r"(?:in\s+|this\s+|next\s+)?"
        r"((?:May|June|December|August|Spring|Fall)\s+20\d{2}|20\d{2})",
        re.I,
    )),
    ("gpa", "GPA", re.compile(
        r"\b(?:GPA|G\.P\.A\.|grade point)\s*(?:of\s*|is\s*|:?\s*)([0-4](?:\.\d{1,2})?)\b",
        re.I,
    )),
    ("email", "Email", re.compile(r"\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b")),
    ("phone", "Phone", re.compile(
        r"(?:phone|number|call me(?: at)?)?\s*"
        r"(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b",
        re.I,
    )),
    ("workAuthorization", "Work Authorization", re.compile(
        r"\b(US citizen|U\.S\. citizen|american citizen|"
        r"need(?:s)? sponsorship|require(?:s)? sponsorship|"
        r"authorized to work|work authorization|"
        r"OPT|CPT|green card)\b",
        re.I,
    )),
]

SKILL_WORDS = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "SQL", "AWS",
    "Docker", "Excel", "Power BI", "Tableau", "C++", "C#", "Linux", "Git",
    "Kubernetes", "Azure", "GCP", "Node", "Django", "Flask", "Spark",
    "R", "MATLAB", "SAP", "PowerPoint", "Agile", "Scrum",
]

_JUNK_MAJOR = re.compile(
    r"^(?:student|senior|junior|sophomore|freshman|looking|interested|here|also)$",
    re.I,
)


def _norm_auth(val: str) -> str:
    v = val.lower()
    if "citizen" in v:
        return "US Citizen"
    if "sponsorship" in v:
        return "Require Sponsorship"
    if "authorized" in v or "green card" in v:
        return "Authorized to Work"
    if "opt" in v or "cpt" in v:
        return "OPT/CPT"
    return val


def _norm_university(val: str) -> str:
    v = val.strip(" .,;")
    aliases = {
        "arkansas": "University of Arkansas",
        "uark": "University of Arkansas",
        "ua fayetteville": "University of Arkansas",
    }
    return aliases.get(v.lower(), v)


def _clean_value(field: str, value: str) -> str:
    value = value.strip(" .,;:\"'")
    if value.lower().startswith("the "):
        value = value[4:]
    value = re.split(r"\s+(?:and|graduat|with|where|because|but|so)\b", value, maxsplit=1, flags=re.I)[0].strip()
    if field == "workAuthorization":
        value = _norm_auth(value)
    elif field == "university":
        value = _norm_university(value)
    elif field == "graduationDate":
        value = value.title() if not value.startswith("20") else f"May {value}"
    elif field == "major":
        value = re.sub(r"\s+", " ", value).strip()
        value = re.sub(r"\s+(?:major|student|degree)s?\s*$", "", value, flags=re.I).strip()
        if _JUNK_MAJOR.match(value) or len(value) < 3:
            return ""
        value = value.title() if value.islower() else value
    return value


def _resolve_candidate_ids(u: dict[str, Any], default_candidate_id: str = "") -> list[str]:
    """Prefer the primary speaker id so facts attach to one person's swipe cards."""
    cid = u.get("candidateId")
    if cid and cid != "Unknown":
        return [str(cid)]
    ids: list[str] = []
    for other in u.get("candidateIds") or []:
        if other and other != "Unknown" and str(other) not in ids:
            ids.append(str(other))
    if not ids and default_candidate_id:
        ids.append(default_candidate_id)
    return ids


def _append_proposal(
    out: list[dict[str, Any]],
    seen: set[tuple[str, str, str]],
    *,
    cid: str,
    field: str,
    label: str,
    value: str,
    text: str,
    u: dict[str, Any],
) -> None:
    value = _clean_value(field, value)
    if not value or len(value) < 2:
        return
    key = (cid, field, value.lower())
    if key in seen:
        return
    if field == "university":
        dirty = [i for i, p in enumerate(out) if p["candidateId"] == cid and p["field"] == "university"]
        if dirty:
            if len(value) < len(out[dirty[0]]["value"]):
                out[dirty[0]]["value"] = value
                out[dirty[0]]["quote"] = text[:240]
            return
    seen.add(key)
    out.append({
        "candidateId": cid,
        "field": field,
        "label": label,
        "value": value,
        "quote": text[:240],
        "source": "conversation",
        "speakerName": u.get("speakerName", ""),
        "t0": u.get("t0"),
        "t1": u.get("t1"),
    })


def extract_from_utterances(
    utterances: list[dict[str, Any]],
    default_candidate_id: str = "",
) -> list[dict[str, Any]]:
    """Return proposal dicts: {candidateId, field, label, value, quote, source}."""
    out: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()

    for u in utterances:
        text = (u.get("text") or "").strip()
        if not text:
            continue
        # Skip pure noise / filler ASR junk
        if len(text) < 4:
            continue

        target_ids = _resolve_candidate_ids(u, default_candidate_id)
        if not target_ids:
            continue

        for field, label, pat in FIELD_PATTERNS:
            m = pat.search(text)
            if not m:
                continue
            value = m.group(m.lastindex or 1)
            for cid in target_ids:
                _append_proposal(
                    out, seen, cid=cid, field=field, label=label,
                    value=value, text=text, u=u,
                )

        m_study = re.search(
            r"(?:studying|i study|i'm in)\s+([A-Za-z][A-Za-z &/+-]{1,40}?)\s+(?:at|over at)\b",
            text,
            re.I,
        )
        if m_study:
            for cid in target_ids:
                _append_proposal(
                    out, seen, cid=cid, field="major", label="Major",
                    value=m_study.group(1), text=text, u=u,
                )

        found_skills = [s for s in SKILL_WORDS if re.search(rf"\b{re.escape(s)}\b", text, re.I)]
        if found_skills:
            value = ", ".join(dict.fromkeys(found_skills))
            for cid in target_ids:
                _append_proposal(
                    out, seen, cid=cid, field="skills", label="Skills",
                    value=value, text=text, u=u,
                )

    return out

"""Heuristic resume text → candidate field mapping (local-only, no LLM)."""
from __future__ import annotations

import re
from typing import Any


EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
PHONE_RE = re.compile(
    r"(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b"
)
GPA_RE = re.compile(r"\bGPA[:\s]*([0-4](?:\.\d{1,2})?)\b", re.I)
GRAD_RE = re.compile(
    r"(?:graduat(?:ing|ion)|expected|class of)[:\s]*(May|June|December|Aug(?:ust)?|Spring|Fall)?\s*((?:20)?\d{2})",
    re.I,
)
MAJOR_HINTS = [
    ("computer science", "Computer Science"),
    ("data science", "Data Science"),
    ("information systems", "Information Systems"),
    ("cybersecurity", "Cybersecurity"),
    ("software engineering", "Software Engineering"),
    ("industrial engineering", "Industrial Engineering"),
    ("supply chain", "Supply Chain Management"),
    ("mechanical engineering", "Mechanical Engineering"),
    ("electrical engineering", "Electrical Engineering"),
    ("business administration", "Business Administration"),
]
UNI_HINTS = [
    ("university of arkansas", "University of Arkansas"),
    ("university of memphis", "University of Memphis"),
    ("university of tennessee", "University of Tennessee"),
    ("university of alabama", "University of Alabama"),
    ("university of missouri", "University of Missouri"),
    ("vanderbilt", "Vanderbilt University"),
    ("nashville state", "Nashville State University"),
    ("mtsu", "MTSU"),
    ("middle tennessee", "MTSU"),
    ("fisk university", "Fisk University"),
    ("central arkansas", "University of Central Arkansas"),
]
SKILL_HINTS = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "Node", "SQL",
    "AWS", "Azure", "Docker", "Kubernetes", "Excel", "Power BI", "Tableau",
    "C++", "C#", "Go", "Rust", "MongoDB", "PostgreSQL", "Git", "Linux",
]
AUTH_HINTS = [
    (r"us\s*citizen|u\.s\.\s*citizen", "US Citizen"),
    (r"require[s]?\s+sponsorship|need[s]?\s+sponsorship", "Require Sponsorship"),
    (r"\bOPT\b|\bCPT\b|f-?1", "OPT/CPT"),
]


def _confidence(found: bool, strong: bool = False) -> float:
    if not found:
        return 0.0
    return 0.9 if strong else 0.65


def extract_fields(text: str) -> dict[str, Any]:
    raw = text or ""
    lower = raw.lower()
    fields: dict[str, Any] = {}
    confidence: dict[str, float] = {}
    hints: list[str] = []

    emails = EMAIL_RE.findall(raw)
    if emails:
        fields["email"] = emails[0]
        confidence["email"] = _confidence(True, True)
        hints.append(f"email:{emails[0]}")

    phones = PHONE_RE.findall(raw)
    if phones:
        fields["phone"] = phones[0].strip()
        confidence["phone"] = _confidence(True, True)

    gpa_m = GPA_RE.search(raw)
    if gpa_m:
        fields["gpa"] = gpa_m.group(1)
        confidence["gpa"] = _confidence(True, True)

    grad_m = GRAD_RE.search(raw)
    if grad_m:
        month = (grad_m.group(1) or "May").title()
        year = grad_m.group(2)
        if len(year) == 2:
            year = "20" + year
        # Normalize month tokens
        if month.lower() in ("spring",):
            month = "May"
        if month.lower() in ("fall",):
            month = "December"
        if month.lower().startswith("aug"):
            month = "August"
        fields["graduationDate"] = f"{month} {year}"
        confidence["graduationDate"] = _confidence(True, False)

    for needle, label in MAJOR_HINTS:
        if needle in lower:
            fields["major"] = label
            confidence["major"] = _confidence(True, True)
            break

    for needle, label in UNI_HINTS:
        if needle in lower:
            fields["university"] = label
            confidence["university"] = _confidence(True, True)
            break

    skills = [s for s in SKILL_HINTS if re.search(rf"\b{re.escape(s)}\b", raw, re.I)]
    if skills:
        fields["skills"] = ", ".join(skills[:12])
        confidence["skills"] = _confidence(True, False)

    for pat, label in AUTH_HINTS:
        if re.search(pat, lower):
            fields["workAuthorization"] = label
            confidence["workAuthorization"] = _confidence(True, False)
            break

    # Name heuristic: first non-empty line without @ that looks like 2–4 words
    for line in raw.splitlines()[:12]:
        line = line.strip()
        if not line or "@" in line or len(line) > 60:
            continue
        parts = re.findall(r"[A-Za-z][A-Za-z'-]+", line)
        if 2 <= len(parts) <= 4 and not any(w.lower() in ("resume", "curriculum", "vitae", "objective") for w in parts):
            fields["firstName"] = parts[0]
            fields["lastName"] = parts[-1]
            confidence["firstName"] = 0.55
            confidence["lastName"] = 0.55
            hints.append(f"name:{parts[0]} {parts[-1]}")
            break

    return {"fields": fields, "confidence": confidence, "rawHints": hints}

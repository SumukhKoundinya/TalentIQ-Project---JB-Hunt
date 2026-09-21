# TalentIQ — Project Context

> Living status doc for face + speaker recognition and resume pipeline work.

## Architecture findings

| Area | Current state |
|------|----------------|
| Profiles | Flat candidates; PK `id` (`TQ-####`) |
| Media | Audio notes + conversation video recorder (Capture) |
| Swipe | Capture: Reviewed / Follow-Up; **Info Cards**: accept / reject field proposals |
| Persistence | `localStorage` + IndexedDB for faces and recordings |
| Backend | FastAPI `ml.server` — face, resume, transcribe, conversation pipeline |

## Roadmap status

1. **M1 — Face enrollment** — complete
2. **Recording → match → speak → Whisper → extract → Info Cards** — complete (local-only)
3. **Resume parse → Intake autofill + Info Cards** — complete (local-only)
4. Future: TalkNet ASD swap-in, stronger Whisper model, richer extractors

## Recording + Resume pipeline (shipped)

**Mode:** Fully local (no cloud LLM / no API keys)

### Shared
- Proposal queue `TIQ.state.proposals` with accept/reject
- Reusable `TIQ.SwipeDeck` + **Info Cards** nav view
- Accept writes field + provenance; reject never verifies data

### Recording track
- Capture UI: conversation video record → `/api/conversation/process`
- Face match: Facenet512 vs enrolled gallery (Unknown below threshold)
- Active speaker: mouth-motion + face timeline (TalkNet-swappable)
- Transcription: `faster-whisper` `tiny.en`
- Heuristic field extraction → Info Cards

### Resume track
- Intake resume upload → `/api/resume/parse` (PDF via pdfplumber, DOCX via python-docx)
- Autofill intake inputs; queue proposals for swipe confirmation

### How to run
```bash
source .venv-ml/bin/activate
pip install -r requirements-ml.txt
uvicorn ml.server:app --host 127.0.0.1 --port 8000
# http://127.0.0.1:8000

PYTHONPATH=. python ml/smoke_test_pipeline.py http://127.0.0.1:8000
```

### Endpoints
- `GET /api/face/health`, `POST /api/face/enroll`, `POST /api/face/recognize-video`
- `GET /api/resume/health`, `POST /api/resume/parse`
- `GET /api/transcribe/health`, `POST /api/transcribe`
- `POST /api/active-speaker/analyze`
- `POST /api/conversation/process`

## Constraints (unchanged)
- No scoring / ranking / auto-reject of candidates
- No protected-trait inference (no DeepFace age/gender/race)
- Never auto-verify extracted profile fields (swipe accept = recruiter verified)
- Never force uncertain face matches

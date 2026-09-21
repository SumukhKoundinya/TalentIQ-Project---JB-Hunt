# Changelog

All notable changes to TalentIQ will be documented in this file.

## [0.4.0] - 2026-09-21

### Added
- **AI Resume Parser**: PDF.js-powered resume text extraction with regex-based skill, experience, project, education, GPA, and certification detection
- **AI Summary Generator**: Template-based candidate summary with source traceability citations and missing data flags
- **Inline-Editable Capture Card**: Tappable skill pills, editable field rows, AI summary box, actionable missing flags, edit toggle
- **Manual Candidate Creation**: "+ New Candidate" modal with full form fields and optional resume upload
- **Regenerate Summary Button**: AI Review detail panel button to re-run summary generation
- **Actionable Missing Flags**: Click any flag chip to get guidance on filling that field
- **AI Missing Data Flags**: Separate flag section showing data gaps from the AI summarizer with source attribution
- **Demo Data Generator**: One-click test candidate creation for demos (5 pre-built candidates)
- **PDF.js Integration**: Added CDN scripts for client-side PDF text extraction

### Changed
- **Capture Card Redesign**: Complete rewrite with editable fields, skill pills, AI summary, and flags
- **AI Review Detail Panel**: Auto-generates summary on first view, enhanced with regen button and actionable flags
- **Notes Auto-Regen**: Summary auto-regenerates when recruiter notes change in Capture or AI Review views
- **Missing Flags System**: Enhanced to check skills, notes, and areas discussed

## [0.3.0] - 2026-09-17

### Added
- **Proper Noun Correction**: Post-transcription fix uses candidate data (name, university, skills) to correct Vosk misheard words via Levenshtein distance fuzzy matching and tech term capitalization
- **TL;DR Summary**: Auto-generated one-liner from candidate card data (name, major, skills, GPA, graduation, work auth, locations, role interest, areas discussed, status)
- **Bullet Point Formatting**: Transcript split on conjunctions/commas for scannable recruiter notes
- **Number Word Conversion**: Converts Vosk number words to digits (e.g., "twenty five million" → "$25M", "three point seven eight" → "3.78"), with currency detection for revenue/salary contexts
- **Action Verb Starters**: Each bullet point starts with an action verb (strips leading pronouns like "She/He/They/I", prepends "Discussed" for noun-starting bullets)
- **Company Name Capitalization**: Auto-capitalize common company names (Walmart, Tyson, FedEx, Amazon, Google, J.B. Hunt, etc.)
- **Grammar Correction**: Fixes common speech errors — subject-verb agreement ("she don't" → "she doesn't"), "could of" → "could have", "I seen" → "I saw", double negatives, misspellings
- **Tone Normalization**: Reduces excessive repetition ("really really" → "very"), casual language ("super excited" → "very excited"), filler phrases
- **Soft Skill Detection**: Automatically identifies and tags Leadership, Teamwork, Communication, Problem Solving, Initiative, Adaptability, Attention to Detail, Creativity from transcript content
- **Follow-Up Item Detection**: Flags action items like "Schedule interview", "Send resume", "Follow up", "Schedule call"
- **Concern/Red Flag Detection**: Flags potential issues like visa/work auth needs, availability constraints, limited experience mentions

### Fixed
- **Capture View**: Overlay flash on keybind, button order, vertical padding alignment
- **Transcription Vosk BindingError**: Reverted grammar array that crashed KaldiRecognizer constructor

## [0.2.0] - 2026-09-16

### Added
- **Public Intake Form**: Candidate self-service form with QR code access
- **Resume Upload**: File upload with client-side text extraction
- **Scannable QR Codes**: Generate printable QR codes for career fair booths
- **Audio Transcription**: Local faster-whisper integration for recording transcription
- **Grounded Review Pipeline**: Transcription wired into review system
- **Claims Bar**: Grounded claims display with source citations
- **Audio Persistence**: Recordings stored in IndexedDB
- **FastAPI Backend**: Local Python backend with health endpoint
- **Pluggable Summary Endpoint**: Grounded-summary API (defaults to 503 without AI backend)

### Changed
- **Data Model**: Removed fake AI metrics — grounded model with missing flags replaces fit percentages
- **Routing**: Portal route group + public `/apply` shell

### Documentation
- Added end-to-end README with JSON import/reset instructions and optional-AI setup
- Added REDESIGN-PLAN-REACT.md

## [0.1.0] - 2026-09-15

### Added
- Full SPA implementation with Python backend
- 7 views: Overview, Candidate Intake, Recruiter Capture, AI Review, Candidate Review, QR Poster, Research Metrics
- Vanilla JS router with `data-view` attribute toggling
- Design system with J.B. Hunt branding (Yellow `#FEDB00`, Blue `#005DBA`)
- localStorage + IndexedDB persistence
- XSS prevention via `escapeHtml()` and `escapeAttr()`

## [0.0.1] - 2026-09-14

### Added
- Initial TalentIQ static prototype

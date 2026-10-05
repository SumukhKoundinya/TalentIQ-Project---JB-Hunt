# TalentIQ — Project Context

> Living status doc after merging Nirmay’s product SPA with Recruiter Capture recording.

## Navigation

### Workspace (Nirmay 4-section design + recording)
1. **Analytics** — live metrics from candidate state  
2. **Event Info** — booth QR / intake destination  
3. **Candidate Cards** — resume swipe cards, skill icons, bulk PDF import  
4. **Recruiter Capture** — full booth recording (camera, mic, face ID, voice notes → Info Cards)  
5. **AI Review** — end-of-day triage  

### Verify
- **Info Cards** — accept/reject extracted field proposals from recordings/resumes  
- **Research Metrics** — study dashboard  

## Recording features (Recruiter Capture)
- Full-screen recording UI (`recording-screen`)
- Camera + mic permission, flip camera, pause/resume
- Booth people identify / multi-speaker tagging
- Face overlay + live booth count
- Conversation video → `TIQ.pipeline.processConversationVideo` → Info Cards
- Voice notes → `TIQ.pipeline.processAudioNote` → Info Cards
- Navigation guard while recording is active

## Run
```bash
source .venv-ml/bin/activate
uvicorn ml.server:app --host 127.0.0.1 --port 8000
# http://127.0.0.1:8000
```

## Constraints (unchanged)
- No scoring / ranking / auto-reject of candidates  
- No protected-trait inference  
- Never auto-verify extracted profile fields (swipe accept = recruiter verified)  

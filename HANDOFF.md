# Handoff: Complete the TalentIQ MVP

## Status and authorization

The user approved this scope on 2026-10-07. This document replaces the previous Set Up-only handoff. It is the authoritative implementation handoff for the new work, not a claim that the features are already implemented or sponsor-approved.

Implement incrementally in the existing website. Preserve the completed Set Up presentation, Capture card formatting, parser, source interactions and all unrelated user changes. Do not restore the retired post-event screen designs. This approved replacement design resolves the screen-purpose discussion in `docs/superpowers/plans/2026-10-07-post-event-pages-replan.md`.

Approved directions:
- Review uses the existing records, emphasizing candidates already marked Reviewed or Follow-Up.
- Recruiter recap is the main information; the existing card becomes the Profile reference tab alongside Resume and Notes.
- Two-candidate factual comparison is the initial comparison experience.
- Invitations hand off to the recruiter's email application; TalentIQ does not send them.
- Automatic shared intake delivers phone submissions to the recruiter laptop.
- Offline-first operation supports local work and synchronizes when connected.
- Backend selection is part of the work and requires user approval before provider-specific implementation.
- Cloud LLM integration is not approved. Start with existing local parsing and rule-based recaps; sponsor acceptance against the AI deliverable remains an explicit gate.

## Goal and sponsor requirements

Complete candidate check-in through recruiter capture, evidence-based review/comparison, human follow-up decisions, invitation handoff and export. Demonstrate accessibility and conduct a controlled manual-versus-TalentIQ study.

Read the source requirements:
- `TalentIQ-Project---JB-Hunt/TalentIQ_Capstone.pdf`: workflow pages 2-3.
- `TalentIQ-Project---JB-Hunt/TalentIQ_Capstone_Proposal (1).pdf`: representative fields page 2; capabilities/AI page 3; accessibility, privacy and deliverables page 4; study page 5.
- `TalentIQ-Project---JB-Hunt/TalentIQ - Job Descriptions.pdf`: Software Engineering Intern reference pages 1-2 and Product Owner example pages 3-4. These are sample references, not actual job postings.

The structured field list is representative, not a mandate to make every field required. Optional GPA, phone and work authorization must not become prerequisites to approval or contact. Missing information is not evidence of poor suitability.

## Repository and safety

- Root: `/Users/nirmay/Desktop/jb hunt`. Serve from this root, not the PDF directory: `python3 -m http.server 8000`.
- Existing app is vanilla JavaScript, no build step; globals live under `window.TIQ`. Preserve this frontend architecture. New shared infrastructure is a separately approved addition.
- Read `AGENTS.md`, current `README.md`, `CHANGELOG.md`, this handoff, source files and tests. Locate code by content; old line numbers and orientation notes can be stale.
- Inspect `git status --short` and existing target-file diffs before edits. Numerous modified/untracked files are user work, including retained review/research modules and tests.
- Do not reset, checkout, stash, clean, broadly delete, stage everything, commit or push without authorization. Do not touch unrelated nested projects or generated media.
- Never clear existing records automatically. Existing one-time cleanup behavior must be audited before shared intake/offline migration so it cannot delete queued or migrated data.
- No candidate scoring, ranking, automatic rejection/advancement, protected-trait/personality/emotion inference or unsupported qualifications.
- Synthetic records by default; real candidate use requires sponsor approval and applicable privacy/security procedures. No external training with candidate data without explicit authorization.
- Load applicable skills. Work test-first, reuse proven modules, and do not delegate unless authorized by the user or applicable instructions.

## Existing foundations to reuse

| File | Responsibility / reuse |
| --- | --- |
| `candidate-form.html`, `candidate-intake.js` | Resume-first intake, confirmed fields, consent, manual fallback, retry protection |
| `data.js` | Candidate state, parser, provenance, summary generator, missing-data flags |
| `views.js` | Existing Capture card, resume viewer, source highlighting, Notes, triage |
| `workflow.js` | Portable intake bridge, five statuses, content-version verification, drafts/history |
| `review-workspace.js` | Retained search/filter/compare/export foundations; adapt rather than restoring old layout |
| `research-study.js`, `research-workspace.js` | Retained controlled study engine, observations and evidence UI |
| `app.js`, `config.js`, `index.html`, `styles.css` | Routing, navigation, script loading, shared design |

Review and research modules are currently retained but not loaded by the active website. Review currently includes Event Results overrides; separate/adapt reusable capabilities so adding Review does not inadvertently restore other screens. Prefer the versioned workflow helpers over legacy implementations that conflate status with summary approval.

## Approved recruiter experience

### Review layout

Retain the website's actual current shell, IBM Plex typography, colors, spacing, card styling and two-panel composition. Do not introduce a new global header or duplicate recruiter selector. A compact local Review title/toolbar is sufficient.

```text
Review                           [Find candidate] [More]
┌──────────────────────────┬──────────────────────────┐
│ Name and contact         │ Profile    Resume   Notes│
│                          │                          │
│ Recruiter recap          │ Existing candidate card │
│ Draft / Approved         │ or supporting evidence  │
│                          │                          │
│ Claim-level source links │                          │
│ [Edit] [Approve recap]    │                          │
│ Missing-information hint │                          │
│ ▸ Follow-up details      │                          │
└──────────────────────────┴──────────────────────────┘
‹ Previous       Next ›               [Prepare invitation]
```

- Profile is the initial reference tab; source clicks switch to and focus the relevant Resume or Notes passage.
- Keep candidate identity/contact visible regardless of reference tab. Reuse the existing card without rebuilding or duplicating its details into a second profile.
- Recap is readable by default, brief and factual. Edit reveals inline Save/Cancel. Verification history and draft rejection are secondary controls.
- Keep navigation/contact controls stable while content scrolls. Below the existing narrow-screen breakpoint, use stacked/panel navigation without clipping, hidden information or action bars covering content.
- No permanent third candidate-list column, dashboard metric tiles, status piles or rows of always-visible filters.
- Verification, recruiting status and contact progress are distinct. Approval does not select someone for an interview; the recruiter independently chooses that action.

### Candidate finder and comparison

- Default to the current event's Reviewed and Follow-Up records; label that scope clearly. Offer All statuses, including New, Interview Requested and Closed.
- Search and optional status/verification/role-interest filters live inside Find candidate. Preserve filter, selection and scroll state on return.
- Select two candidates and enter a temporary comparison mode. Show aligned recap/verification, interests, skills/evidence, projects/coursework/experience, recruiter observations, missing information and follow-up status.
- Label absent values Not captured; retain source links for both records and version-check them. No winner, score or machine recommendation.
- Small screens show equivalent comparison content accessibly, even if candidates must be viewed sequentially. Restore prior review state when leaving comparison.

### Invitation and follow-up

- Collapsed Follow-up details contains recruiting status and next-step notes plus contact progress.
- Prepare invitation opens a dialog: recipient, editable subject/body, optional recruiter-entered booking link, Open in email app, Copy invitation.
- Use known name/event/role only; do not invent interview times, real vacancies, guarantees or URLs. Missing/invalid email prompts correction.
- Correctly encode email handoff and provide clipboard/manual-copy fallback. Never expose other candidate addresses.
- Opening/copying a draft means prepared, not sent. Explicit recruiter confirmation records Invitation sent with recruiter/time/method; this is self-reported, not delivery verification.
- Track response and booking only when confirmed. Do not automatically advance status, approve recap or claim scheduled interviews.
- Approved exports use the certified recap snapshot; drafts are separately labelled diagnostic exports. Include contact/status/next steps/approval metadata, spreadsheet safety and no audio by default.

## Implementation milestones and acceptance

For each milestone: inspect the baseline, write focused failing tests, verify intended failure, implement minimally, run tests and browser checks, update relevant documentation, then report before widening scope. Existing tests encoding retired routes/designs may need intentional updates, not deletion or blind restoration of those designs.

### 1. Complete structured Capture

Modify existing Notes rendering/handlers and candidate normalization only as needed. Add compact role-specific prompts, neutral discussed-area tags, interests, location preferences, candidate questions, follow-up questions and next steps. Preserve optionality and provenance. Reuse existing schema fields where available and add fields only where genuinely absent.

Acceptance: short conversations remain fast; entered fields persist; resume rescans do not overwrite corrections; existing Reviewed/Follow-Up sorting and Undo are preserved; optional information does not become an artificial hiring gate. Examples must accept coursework, personal projects and leadership as evidence, not just prior employment.

### 2. Connect the simplified Review

Adapt `review-workspace.js`; change routing/navigation/loading and shared styles. Reuse the existing card and resume/notes components. Maintain one candidate identity across Capture and Review, and preserve candidate-specific drafts when switching/filtering/navigating.

Acceptance: Capture records/statuses appear without re-entry; current-event reviewed/follow-up search works; all statuses remain accessible; no matching record gives clear recovery; status changes do not silently approve recaps; filter-changing records remain open until deliberate navigation. No retired Event Results route is accidentally restored.

### 3. Finish grounded recap verification

Refine `data.js` generation and workflow attribution, including relevant resume/conversation information without repetitive profile listings, unsupported conclusions, incorrect student/graduate assumptions or omitted material qualifiers. Link each factual claim to a precise source and source version. Label unverified transcripts and recruiter-authored text honestly.

Acceptance: editable drafts, approve/reject/history, exact certified snapshot and approver/time; stale source links fail safely; content changes invalidate verification; inherited citations do not misrepresent edited claims; reject draft is not reject candidate. Define which factual content affects certification versus operational contact metadata, and test that contact updates alone do not unnecessarily revoke approval.

Sponsor gate: record current template/parser approach, grounding, failures and tests; ask whether it fulfills the AI implementation expectation. Do not advertise generative AI or claim that sponsor acceptance has occurred. If a model is required, bring that change back for approval rather than silently adding cloud inference.

### 4. Comparison, contact and export

Adapt existing comparison/export logic, add focused invitation/contact helpers if useful instead of inflating `views.js`. Implement the interactions above with accessible dialogs and persistent contact history.

Acceptance: two source-checkable records compare without ranking; email handoff/copy/missing-email paths work; explicit sent confirmation persists; exports distinguish approved snapshots from drafts; invitations and exports avoid cross-record data leakage.

### 5. Select shared service (decision gate)

Compare viable managed services against vanilla/static-site compatibility, hosting, authentication, event membership/access rules, private PDF storage, abuse protection, atomic writes/concurrency, backup/deletion, costs and operations. Present a concrete recommendation and obtain approval before provider-specific schemas, migrations, permissions, dependencies or deployment.

Specify a trust boundary: public event-bound submission endpoint versus authenticated recruiter reads/edits; the current demo chooser is not authentication. Do not expose privileged service credentials. Development/demo stays synthetic; authentication is needed for the chosen shared service, not full enterprise identity integration.

### 6. Shared intake and synchronized records

After service approval, implement shared events/memberships, submissions/candidates, private PDFs, source versions, verified recaps/history and contact history. Isolate transport/sync helpers from rendering. Use stable IDs, idempotent submission keys and optimistic version checks.

Student flow: event QR → editable intake/consent → upload/submit → server-confirmed receipt. Recruiter flow: authenticated event access → received record in Capture. Use updates or refresh with a visible freshness state.

Acceptance:
- Separate phone/laptop receive the same submission; page reload does not create duplicates.
- Pending/failed/accepted are explicit; submitted appears only after server acknowledgement.
- PDF upload/record commit failures recover without silently losing attachments or orphaning unrestricted files.
- Network interruption and retry return the same receipt; revoked/expired event links fail clearly.
- Students cannot list/read other records; recruiters cannot cross event permissions; signed file access expires.
- Conflicting edits cannot overwrite silently; stale versions cannot be approved.
- Existing local records have explicit previewed migration with duplicate handling; nothing is automatically wiped.

### 7. Offline-first implementation

Audit local/CDN dependencies (PDF.js, Vosk and any model assets), licensing and sizes. Host required assets locally; design versioned offline caching without forcing large speech models to download unnecessarily. Add a service worker/app-shell strategy appropriate to the selected hosting; explain that an initial connected installation is required and localhost service workers do not make phone-localhost a reachable deployment.

Use durable local drafts/outbox for permitted edits/submissions, server versions and explicit queued/saving/synced/failed states. Preserve the existing local parser and notes workflow. Reconcile changes on reconnect; do not auto-resolve conflicting source/approval edits. Distinguish local verification from authoritative shared acknowledgement.

Acceptance: after initial asset preparation, reload and local parsing/capture/review work without network; failed uploads remain recoverable; repeated reconnect does not duplicate records/contact actions; new submissions from other devices and actual email sending are honestly unavailable offline. Private cached data is scoped to authorized users, removed on logout/event revocation when possible, and subject to a documented offline-access policy. Service-worker caches must not accidentally cache unrestricted private PDFs/API responses.

### 8. Accessibility evidence and remediation

Apply WCAG 2.2 AA principles throughout. Test intake through invitation/export with keyboard only, visible logical focus, accessible tabs/dialogs, labels, clear errors/status announcements, screen-reader reading order, adequate text/non-text contrast, reduced motion, 200% zoom and 320 CSS-pixel reflow. Ensure global Capture shortcuts do not consume keys intended for buttons/tabs/audio/contenteditable. Test VoiceOver/Safari and another supported pairing where available; report unavailable checks.

Record date/build/browser/device, exact steps, expected/actual results, issue, remediation/retest and limitation. Use automated checks as support, not conformance proof. Acceptance: no critical-path blockers, documented repaired findings and disclosed remaining limitations. Do not hide accessibility controls in inaccessible drawers/menus.

### 9. Controlled study

Reuse retained study engine/forms but provide a separate researcher entry, not extra controls in recruiter Review. Freeze equivalent synthetic datasets, role, capture/review tasks, required fields, consistency/support rubrics, timing boundaries, edit categories, confidence question, usability questions and exclusion rules before trials.

Use representative users with counterbalanced Manual/TalentIQ order and equivalent dataset variants to limit memory effects. Task timing ends before feedback forms. Distinguish capture/review tasks, participants, dataset/pair IDs and methods.

Collect capture/review seconds, valid-field completeness, consistency-check ratio, supported/unsupported/unsure statements with passages, original/final draft and categorized correction counts, same 1–5 confidence question, completion/errors/feedback and separate accessibility evidence.

Audit/extend calculations: existing comparisons cover only some measures; statement support must be separated by method/task and account for denominators/uncertainty. Preserve missing values as null, explicit zeros as zero, raw outcomes, incomplete/abandoned trials and exclusion reasons. Pair only genuinely comparable trials. Existing synthetic/demo activity is not study evidence.

Acceptance: export protocol, raw data, method-level and paired descriptive results, sample sizes/exclusions and limitations. No claimed improvement before trials, no invented significance, and negative/inconclusive results reported honestly. Obtain institutional requirements/consent for study participants where applicable.

### 10. Responsible data and final delivery

Use synthetic test identities and addresses; avoid accidental real mail during tests. Validate/escape untrusted resume/form text and reject embedded instructions as authority. Preserve provenance. Apply least-privilege access, minimization, upload restrictions, abuse limits, private logging and explicit export warnings. Define consent, retention, deletion, backups and external-copy limits. Restore appropriate consent before candidate-conversation recording; distinguish recruiter-only memos without assuming microphone content is recruiter-only. Real data use requires a separate sponsor/security approval gate.

Deliver working prototype and setup/deployment/offline instructions; AI/grounding implementation evaluation; accessibility checklist/results/remediation/limits; comparative study report; final sponsor demo, lessons learned and roadmap. Update `README.md` and `[Unreleased]` in `CHANGELOG.md` per implemented milestone, not as if planned work already exists. Keep changed asset cache versions consistent across relevant HTML files; service-worker cache changes must not discard pending records.

## Test and verification strategy

- Add focused tests for reviewed/follow-up finder scope, recap/source approval, comparison, invitation encoding/copy/contact confirmation and approved exports.
- Reuse and extend `tests/review-*.test.js`, `tests/research-*.test.js`, `tests/bridge.test.js` and relevant parser/Capture/accessibility regressions after inspecting actual files.
- Add shared-service authorization/idempotency/concurrency/upload-failure tests and offline outbox/migration/reconnect tests using the approved service's suitable test facilities. Include negative access tests, not only successful requests.
- Run focused tests first, then every existing `tests/*.test.js` with individual exit statuses and `git diff --check`. Inventory/run relevant `.cjs` and Python checks separately where dependencies permit; do not claim they were included in the JavaScript suite.
- Compare existing failures to the untouched baseline. Do not broaden scope to fix unrelated failures or silently weaken assertions.
- Verify desktop 1440×900, short laptop, tablet, mobile 390×844 and 320 CSS-pixel reflow, including actual keyboard/source/tab/dialog use. Use separate browser/device contexts for shared intake and network-disabled checks for offline behavior.
- Report exact tests/checks performed, blocked dependencies and unverified claims. Do not claim sponsor approval, accessibility compliance, email delivery or study improvement without evidence.

## Release acceptance checklist

- [ ] Existing Set Up/Capture appearance and data are preserved.
- [ ] Structured conversation capture remains short and role-specific.
- [ ] Review defaults to current-event Reviewed/Follow-Up records and exposes all statuses.
- [ ] Recap main panel and Profile/Resume/Notes reference panel match existing formatting.
- [ ] Each factual recap claim has valid supporting evidence; drafts are visibly unverified.
- [ ] Edit/approve/reject/history and stale-version handling work independently of recruiting status.
- [ ] Two-candidate comparison is factual, aligned, accessible and source-checkable.
- [ ] Invitations hand off without sending; sent confirmation and contact progress are honest.
- [ ] Approved snapshot exports and labelled draft exports are safe and distinct.
- [ ] Shared service choice is approved before implementation.
- [ ] Separate-device acknowledged intake, private PDFs, permissions, retries and conflicts are verified.
- [ ] Offline reload/local work/outbox/reconnect and safe explicit migration are verified.
- [ ] Synthetic-data, consent, retention, deletion and access safeguards are documented/tested.
- [ ] Accessibility evidence records remediation, retests and limitations.
- [ ] Controlled study protocol, observed results and limitations are delivered.
- [ ] Sponsor acceptance of the rule-based recap/AI approach is recorded or remains an explicit blocker.
- [ ] Final demo covers phone intake → laptop receipt → Capture → filtered Review → comparison → verified recap → invitation handoff → confirmed contact → export.
- [ ] Setup instructions, tests, changelog, final presentation and future roadmap are delivered.

## Prompt for the new implementation session

Implement the approved TalentIQ MVP plan in `HANDOFF.md` in `/Users/nirmay/Desktop/jb hunt`. Read the handoff, `AGENTS.md`, current README, sponsor PDFs and relevant source/tests first; inspect `git status --short` and preserve all existing/unrelated edits and untracked files. Work incrementally and test-first; do not reset, stash, clean, stage everything, commit or push without permission. Preserve existing Set Up/Capture formatting and reuse the parser, card, resume source viewer, status/approval engine and retained comparison/export/study modules. Build structured Capture, then simplified Review with Recruiter recap as the main panel and Profile/Resume/Notes tabs as references; search already Reviewed/Follow-Up records, retain access to all statuses, provide two-candidate factual comparison, versioned recap verification, invitation handoff to the recruiter's email app with explicit sent confirmation, and approved-record export. Do not restore retired dashboard designs or add ranking/scoring/automatic hiring decisions. Implement offline-first local work and automatic shared intake, but first compare shared-service options and obtain my approval before provider-specific infrastructure, credentials or deployment. Do not add a cloud LLM; document the current rule-based approach and flag sponsor acceptance of the AI requirement as unresolved. Preserve records and pending work through migration, retries and sync conflicts. Complete accessibility testing/evidence, the separate controlled Manual/TalentIQ study, responsible synthetic-data/consent/access controls and final delivery documentation. Start with a baseline and milestone breakdown; proceed with unblocked local milestones while presenting infrastructure/sponsor decisions, rather than falsely claiming those decisions are resolved. Update changelog and relevant asset versions only for actual changes. Report exact tests, browser checks, files changed and blockers at each milestone. Do not claim email delivery, WCAG conformance, study improvement or sponsor acceptance without evidence.

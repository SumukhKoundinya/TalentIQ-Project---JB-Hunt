# TalentIQ MVP Implementation Plan

**Goal:** Implement the approved `HANDOFF.md` incrementally without replacing the existing Capture presentation or discarding records.

**Architecture:** Keep the vanilla `window.TIQ` frontend and its local state, parser, source viewer and workflow helpers. Adapt retained Review/research modules; keep contact and synchronization responsibilities separate from rendering.

**Tech stack:** Vanilla JavaScript, CSS, localStorage, IndexedDB, existing PDF.js/Vosk. Shared infrastructure requires a separate approval.

## Global constraints

- Follow `HANDOFF.md`, including synthetic data, optional fields, factual evidence, independent status/verification/contact, and no scoring or automated hiring decisions.
- Execute inline; no delegation, commits, pushes, resets, stashes, cleanup or automatic record deletion.
- Preserve all pre-existing changes. Baseline: 42/45 JavaScript test files pass; booth-setup, capture-summary and resume-card already fail. Baseline evidence is saved outside the repository in the approved OpenCode temporary directory, `talentiq-mvp-baseline/`.
- Test-first per behavior: write focused assertions, observe intended failure, implement, rerun focused/regression tests, browser-check, then update README/changelog and report before widening scope.
- Provider-specific implementation is blocked until user approval. Rule-based AI acceptance and real-data use require sponsor decisions; trials and unavailable assistive-technology checks must never be fabricated.

## Milestones and file boundaries

- [x] **1. Safe startup and structured Capture.** `data.js`: replace destructive startup cleanup with preservation; normalize optional conversation fields. `capture-workflow.js`: whitelist structured updates, recruiter provenance and role prompts. `views.js`: compact optional Notes disclosure and bindings, recording consent and shortcut protection. `styles.css`: disclosure only; preserve card/layout. `index.html`/`candidate-form.html`: matching changed asset versions. Tests: preserved records/metrics/audio, persisted fields, rescan corrections, status/Undo, optionality, escaping, keyboard and consent; isolated browser checks at desktop/laptop/tablet/mobile/320px. Completed evidence: `docs/mvp-milestone-1-evidence.md`; broader accessibility checks remain milestone 8.
- [x] **2. Simplified Review.** Adapted `review-workspace.js`, router/config/load order and scoped CSS into recap + Profile/Resume/Notes panels, not retired dashboards. Tested current-event Reviewed/Follow-Up finder, all-status recovery, retained filter/draft/selection/scroll state, and independent status changes. Reuses the actual Capture card and version-checked source navigation. Completed evidence: `docs/mvp-milestone-2-evidence.md`.
- [ ] **3. Grounded recap verification.** Refine `data.js` and `workflow.js` claim attribution/source versions, certified snapshots, edit/cancel/reject/history and factual versus operational fingerprints. Test stale sources, inherited citation removal, contact-only updates and unsupported/qualified claims. Document parser/template limitations and present sponsor AI acceptance gate.
- [ ] **4. Comparison, invitation and export.** Adapt retained comparison/export and add focused contact helpers. Test two factual records, source checks, restoration, encoded single-recipient email handoff, clipboard/manual fallback, explicit self-reported sent history and certified versus labelled diagnostic exports with spreadsheet safety. Browser-test dialogs/keyboard and small-screen equivalence.
- [ ] **5. Shared service decision.** Compare managed service options on static-site compatibility, auth/event permissions/private PDFs, public submission abuse limits, concurrency, costs/backups/deletion/operations. Present trust boundary and recommendation; ask for approval before schemas/dependencies/deployment.
- [ ] **6. Shared intake (after approval).** Isolated transport/sync, stable IDs/idempotent receipts, private attachments, optimistic versions and previewed local migration. Test separate-device acknowledgement/retries, upload failure recovery, expired links, negative event/file access and conflicts. Never automatically wipe local records.
- [ ] **7. Offline-first (hosting/service dependent).** Audit/localize required assets/licensing, optional speech download, versioned app-shell cache, durable scoped outbox and conflict-aware reconnect. Test network-disabled reload/parser/capture/review, repeated reconnect, pending uploads and revocation/logout; exclude private PDFs/API responses from service-worker caches. Document initial connected installation and actual deployment limits.
- [ ] **8. Accessibility evidence.** Intake through export: keyboard/focus/tabs/dialogs/announcements, contrast, reduced motion, 200% zoom, 320px reflow; Safari/VoiceOver and another available pairing. Record build/date/device/steps/results/remediation/retest and unavailable checks; automation is not conformance proof.
- [ ] **9. Controlled study.** Adapt `research-study.js`/`research-workspace.js` as a separate researcher entry. Freeze synthetic equivalent datasets, counterbalanced protocol, rubrics/timing/questions/exclusions. Test raw/null/zero/incomplete outcomes, support denominators and genuinely comparable pairs; export descriptive results without invented participants or improvement claims.
- [ ] **10. Responsible data and delivery.** Test escaping/upload limits/embedded-instruction treatment and synthetic-only safeguards. Document consent/retention/deletion/backups/export limits and security approval gates. Deliver verified setup/offline instructions, grounding evaluation, accessibility evidence, study protocol/results limitations and final demo/roadmap; leave unverified release criteria unchecked.

Each milestone ends with exact test statuses, browser evidence, files changed and remaining gates. `HANDOFF.md` remains the authoritative acceptance checklist.

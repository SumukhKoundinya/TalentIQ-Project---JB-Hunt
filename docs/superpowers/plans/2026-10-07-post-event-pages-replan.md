# Post-Event Pages Replanning Brief

> **Status:** The previous Review / Event Results / Research Metrics proposal is superseded. Do not implement that screen design without a new design discussion and approval.

**Goal:** Revisit whether and how post-event candidate review and research measurement should appear in TalentIQ, based on the J.B. Hunt MVP and recruiter needs.

**Current implementation decision:** Review, Event Results, and Research Metrics are removed from the active website navigation and router. Set Up and Capture remain available. Their source modules, tests, and locally stored candidate / study data are retained; removing these pages does not erase browser data.

**Architecture:** No replacement screens or workflows are specified yet. Keep the existing vanilla-JavaScript app and local-data constraints unless a future approved plan changes them. Treat the previous approved Plannotator proposal as historical context, not an active implementation specification.

## Decisions required before implementation

- Define the distinct purpose and audience for each post-event capability, and whether each warrants a separate screen.
- Map J.B. Hunt MVP requirements to current Set Up / Capture behavior and identify genuine gaps without duplicating existing work.
- Decide how recruiters move between candidate records and what information a post-event profile needs.
- Define human verification separately from recruiting status; do not conflate a status change with checking evidence.
- Define how all MVP recruiting statuses remain visible if the main workflow is simplified.
- Define research-study tasks, measures, evidence, accessibility checks, and limitations before presenting outcomes.
- Decide what existing local records and study data need an accessible export or migration path before any future data deletion.

## Constraints

- No candidate scoring, ranking, automated rejection/advancement, or protected-trait inference.
- Keep synthetic/demo activity distinct from measured study outcomes.
- Do not claim WCAG conformance without supporting evidence.
- No code for replacement pages until the new purpose, scope, and screen flow are agreed.

const assert = require('node:assert/strict');
const { loadApp } = require('./harness');

const TIQ = loadApp(['components.js', 'skill-icons.js', 'views.js']);

function candidate(raw, extra = {}) {
  return Object.assign(TIQ.intake.buildCandidate({ firstName: 'Morgan', lastName: 'Ellis' }), {
    id: 'candidate-evidence-1',
    resumeUpload: { name: 'candidate.pdf', parsedAt: '2026-10-05' },
    parsedResume: TIQ.ai.extractResumeData(raw),
    ...extra
  });
}

const raw = [
  'MORGAN ELLIS',
  'EXPERIENCE',
  'Operations Intern | Ozark Freight Services | May 2026 - August 2026',
  '• Managed appointment updates for 24 daily shipments with dispatch and warehouse teams.',
  '• Reduced missing delivery-status entries by 18% using an Excel exception tracker.'
].join('\n');

assert.equal(typeof TIQ.views._captureResumeEvidence, 'function', 'exposes the conservative résumé evidence resolver');

const c = candidate(raw);
const source = 'Managed appointment updates for 24 daily shipments with dispatch and warehouse teams.';
const evidence = TIQ.views._captureResumeEvidence(c, 'Managed appointment updates for 24 daily shipments.', source);
assert(evidence, 'maps a shortened claim to its complete supporting source passage');
assert.equal(evidence.candidateId, c.id, 'evidence is bound to its candidate');
assert.equal(evidence.text, source, 'stores the supporting passage rather than only the shortened claim');
assert(evidence.resumeVersion && evidence.passageId, 'evidence is bound to a résumé version and stable passage ID');
assert.equal(evidence.page, undefined, 'does not infer page numbers from flattened résumé text');
assert.equal('Managed appointment updates for 24 daily shipments.'.split(/\s+/).length, 7,
  'keeps the existing claim wording and ten-word cap intact');

const laterPassage = 'Built an inventory tracker covering 12 warehouse locations.';
const multiPage = candidate(raw + '\n' + laterPassage);
const laterEvidence = TIQ.views._captureResumeEvidence(multiPage, 'Built an inventory tracker covering 12 warehouse locations.', laterPassage);
assert(laterEvidence && laterEvidence.offset > evidence.offset, 'maps a passage after a page-like boundary in flattened text');
assert.equal(laterEvidence.page, undefined, 'retains no fabricated page number when parsing supplies none');

const missingSource = candidate('MORGAN ELLIS\nEXPERIENCE\nOperations Intern\n• Managed appointment updates.');
assert.equal(TIQ.views._captureResumeEvidence(missingSource, 'Managed appointment updates for 24 daily shipments.', source), null,
  'leaves a claim unlinked when its source details are missing');

const normalizedFact = candidate([
  'MORGAN ELLIS', 'EXPERIENCE', 'Operations Analyst | Acme Freight | 2024 - 2025',
  '• Managed 3-4 hours weekly of dispatch reporting.'
].join('\n'));
const normalizedEntry = TIQ.views._captureVisualEntries(normalizedFact).find(entry => entry.facts.some(fact => /per week/.test(fact)));
assert(normalizedEntry, 'keeps the existing display normalization for weekly hours');
const normalizedFactHtml = TIQ.views._captureHighlightItemHtml(normalizedEntry);
assert(normalizedFactHtml.includes('data-resume-source='),
  'wording-normalized claims retain the original source offset');

const linkedEntry = TIQ.views._captureVisualEntries(c).find(entry => entry.facts.some(fact => /18%/.test(fact)));
const linkedHtml = TIQ.views._captureHighlightItemHtml(linkedEntry);
assert.match(linkedHtml, /<button[^>]*class="resume-source-link"[^>]*>[\s\S]*?<strong class="capture-metric">18%<\/strong>[\s\S]*?<\/button>/,
  'keeps the full claim as one source button with its existing bold metric');
assert(!linkedHtml.includes('<u>'), 'does not add underline markup around the full claim');

const unboldedEvidence = TIQ.views._captureResumeEvidence(c, 'Managed appointment updates for 24 daily shipments.', source);
const unboldedEntry = { category: 'Certifications', facts: ['Microsoft Office Specialist'], factEvidence: [unboldedEvidence] };
assert(!TIQ.views._captureHighlightItemHtml(unboldedEntry).includes('data-resume-source='),
  'does not create a source affordance when the claim has no existing bold emphasis');

const repeated = candidate(raw + '\n' + source);
assert.equal(TIQ.views._captureResumeEvidence(repeated, 'Managed appointment updates for 24 daily shipments.', source), null,
  'does not link a claim when the same supporting passage is repeated ambiguously');

const replacement = candidate(raw.replace('24 daily shipments', '26 daily shipments'));
assert.equal(TIQ.views._captureResumeEvidence(replacement, 'Managed appointment updates for 24 daily shipments.', source), null,
  'does not map stale evidence after the résumé changes');

TIQ.state.candidates = [c];
TIQ.views._captureIndex = 0;
const html = TIQ.views.renderRecruiterCapture();
assert(html.includes('data-resume-passage-id'), 'rendered résumé passages expose stable IDs for navigation');
assert(html.includes('data-resume-source='), 'only claims with mapped evidence render source controls');
const claimId = html.match(/data-resume-source="([^"]+)" aria-label="View résumé source for [^"]*18%/);
assert(claimId && html.includes('data-resume-passage-id="' + claimId[1] + '"'),
  'card source link points at the matching rendered résumé passage');

TIQ.state.candidates = [repeated];
const repeatedHtml = TIQ.views.renderRecruiterCapture();
const ownedSource = TIQ.views._captureVisualEntries(repeated).flatMap(e=>TIQ.views._captureBriefFacts(e)).find(b=>b.text==='Managed appointment updates for 24 daily shipments.');
assert(ownedSource && ownedSource.evidence && repeatedHtml.includes('data-resume-passage-id="'+ownedSource.evidence.passageId+'"'),
  'explicit owner offsets resolve repeated passages without ambiguous text matching');

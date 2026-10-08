// Optional real-PDF regression: PDFJS_MODULE points to pdfjs-dist 3.11.174.
// Uses the application's page reconstruction, not an alternate PDF extractor.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadApp} = require('./harness');
const pdfjs = require(process.env.PDFJS_MODULE || 'pdfjs-dist/legacy/build/pdf.js');
const T = loadApp(['components.js','skill-icons.js','views.js']);
const directory = path.resolve(__dirname, '../resume_test_pack 2');
const expected = [[2,2],[2,2],[2,2],[2,2],[2,2],[2,2],[2,2],[2,2],[2,2],[3,3]];
(async () => {
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.pdf')).sort();
  assert.equal(files.length, 10);
  for (const [index, file] of files.entries()) {
    const pdf = await pdfjs.getDocument({data:new Uint8Array(fs.readFileSync(path.join(directory,file))),
      disableFontFace:true, verbosity:0}).promise;
    let raw = '';
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      raw += T.ai.pageTextFromContent(await page.getTextContent()) + '\n';
    }
    const c = T.intake.buildCandidate({firstName:'Fixture',lastName:String(index)});
    c.parsedResume = T.ai.extractResumeData(raw);
    c.resumeUpload = {name:file,parsedAt:'2026-10-06'};
    const parsed = c.parsedResume;
    assert.equal(parsed.experience.length, expected[index][0], file + ' role count');
    assert.equal(parsed.projects.length, expected[index][1], file + ' project count');
    const entries = T.views._captureVisualEntries(c);
    const document = T.views._capturePrintResumeHtml(c);
    for (const [category, owners] of [['Experience',parsed.experience],['Project',parsed.projects]]) {
      const displayed = entries.filter(e => e.category === category);
      assert.equal(displayed.length, owners.length, file + ' keeps all owners');
      for (const [i, owner] of owners.entries()) {
        const entry = displayed[i];
        assert(owner.bullets.length > 0, file + ' has contributions for ' + entry.name);
        assert.equal(entry.facts.length, owner.bullets.length, file + ' retains every full bullet');
        for (const [j, fact] of entry.facts.entries()) {
          const evidence = entry.factEvidence[j];
          assert(evidence, file + ' links ' + fact);
          assert(document.includes('data-resume-passage-id="' + evidence.passageId + '"'));
          assert(owner.bullets.some(p => p.offset === evidence.offset && p.text === evidence.text));
          assert(raw.slice(evidence.offset).startsWith('- ' + evidence.text.split(' ').slice(0,3).join(' ')));
        }
        const html = T.views._captureHighlightItemHtml(entry);
        const brief = T.views._captureBriefFacts(entry);
        assert(brief.length >= 2 && brief.length <= 3, file + ' has 2–3 short bullets for ' + entry.name);
        assert(brief.every(b => b.text.split(/\s+/).length <= 10), file + ' respects word limit');
        assert(brief.every(b => b.evidence && document.includes('data-resume-passage-id="' + b.evidence.passageId + '"')), file + ' keeps source links');
        assert(!html.includes('<details'));
        if (entry.dates) assert(/capture-item-heading[^]*capture-item-context__dates/.test(html), file + ' dates share title row');
        if (file.startsWith('03_') && entry.name === 'Cross-Dock Process Study') assert(/^Estimated 12% reduction.*stated assumptions/.test(brief[0].text), 'real Jordan PDF prioritizes qualified estimate');
        if (file.startsWith('10_') && entry.name === 'Senior Software Engineer') {
          assert(brief.some(b => /420→185 milliseconds/.test(b.text)), 'real Morgan PDF keeps latency result');
          assert(brief.some(b => /52→31 minutes/.test(b.text)), 'real Morgan PDF keeps diagnosis result');
        }
        assert.equal((html.match(/<li>/g) || []).length, brief.length);
        if (process.env.SHOW_BRIEFS) console.log(entry.name, brief.map(b => b.text));
      }
    }
    console.log('PASS', file);
    await pdf.destroy();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

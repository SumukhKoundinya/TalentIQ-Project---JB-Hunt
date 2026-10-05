const { loadApp, assert } = require('./harness');

function main() {
  const TIQ = loadApp();
  const c = { skills: ['Python'] };
  const result = TIQ.ai.hydrateTranscript(c, 'I really enjoy working with SQL and Tableau for analytics.');
  assert(result.skillsAdded.indexOf('SQL') !== -1, 'adds skills found in transcript');
  assert(result.skillsAdded.indexOf('Tableau') !== -1, 'adds all discovered skills');
  assert(c.skills.indexOf('Python') !== -1 && c.skills.length === 3, 'preserves existing skills, no dup');
  assert(result.notesUpdated === false, 'no generateTldr in harness — guard is safe');
  assert(TIQ.ai.hydrateTranscript(c, '').skillsAdded.length === 0, 'empty transcript is a no-op');
}
main();
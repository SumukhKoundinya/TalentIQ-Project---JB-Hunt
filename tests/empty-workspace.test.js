const { loadApp, assert } = require('./harness');

async function run() {
  const TIQ = loadApp();
  assert(TIQ.CONFIG.seedCandidates.length === 0, 'fresh workspaces do not load bundled sample candidates');

  TIQ.state.candidates = [{ id: 'JBH-DEMO-ops' }, { id: 'my-candidate', notes: 'Queued local work' }];
  TIQ.state.metrics = [{ type: 'sample' }];
  TIQ.state.activeRecruiterId = 'R1';
  TIQ.state.selectedId = 'my-candidate';
  TIQ.state.event = { name: 'Existing event' };
  TIQ.__testStorage.setItem(TIQ.STORAGE_KEY, JSON.stringify(TIQ.state));
  TIQ.__testStorage.setItem(TIQ.METRICS_KEY, JSON.stringify([{ type: 'sample' }]));
  TIQ.__testStorage.setItem('talentiq_candidate_dataset', 'existing study dataset');
  const before = JSON.stringify(TIQ.state);
  const storedBefore = JSON.stringify(TIQ.__testStorageStore);
  let audioDeletes = 0;
  TIQ.AudioDB.deleteAll = function() { audioDeletes++; return Promise.resolve(); };

  await TIQ.clearSampleDataOnce();
  assert(JSON.stringify(TIQ.state) === before, 'startup preserves all existing records, metrics, selection and event');
  assert(JSON.stringify(TIQ.__testStorageStore) === storedBefore, 'startup does not rewrite stored records or study data');
  assert(audioDeletes === 0, 'startup never deletes audio');

  await TIQ.clearSampleDataOnce();
  assert(JSON.stringify(TIQ.state) === before, 'repeated startup preserves existing local work');
}

run().catch(function(error) { console.error(error); process.exitCode = 1; });

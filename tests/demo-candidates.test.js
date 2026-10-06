const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
assert(fs.existsSync('demo-candidates.js'), 'fictional recruiting résumé dataset exists');
async function load(search, saved) {
  const store = saved || {talentiq_state_v1:JSON.stringify({candidates:[{id:'personal-record',firstName:'Personal',lastName:'Record',notes:'Old note',audioNotes:[{blobId:'old-audio'}]}]}),talentiq_eval_metrics_v1:'[{"old":true}]',talentiq_fictional_jbh_demo_v2:'old demo',unrelated:'keep'};
  const window = {TIQ:{},location:{search},addEventListener(){},removeEventListener(){}};
  const context = vm.createContext({window,console,get TIQ(){return window.TIQ;},localStorage:{get length(){return Object.keys(store).length;},key:i=>Object.keys(store)[i],getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]},navigator:{}});
  for (const file of ['config.js','demo-candidates.js','data.js','workflow.js','components.js','skill-icons.js','views.js']) vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  let audioClears=0;
  window.TIQ.AudioDB.deleteAll=()=>{audioClears++;return Promise.resolve();};
  if(window.TIQ.prepareFictionalDemo) await window.TIQ.prepareFictionalDemo();
  return {TIQ:window.TIQ,store,audioClears};
}
(async()=>{
const demo=await load('');
assert.equal(demo.TIQ.state.candidates.length,7);
assert.equal(demo.TIQ.STORAGE_KEY,'talentiq_state_v1', 'default website uses its normal storage');
assert(!JSON.parse(demo.store.talentiq_state_v1).candidates.some(c=>c.id==='personal-record'));
assert.equal(demo.store.talentiq_eval_metrics_v1,undefined);
assert.equal(demo.store.talentiq_fictional_jbh_demo_v2,undefined);
assert.equal(demo.store.unrelated,'keep');
assert.equal(demo.audioClears,1,'previous audio is cleared once');
for(const c of demo.TIQ.state.candidates){
  assert(c.isFictionalDemo && c.parsedResume.rawText.includes('FICTIONAL DEMO'));
  assert(c.parsedResume.rawText.includes(c.firstName+' '+c.lastName));
  assert(!/Nirmay|CropIntel|nirmay-sharma/.test(c.parsedResume.rawText));
  assert(c.parsedResume.experience.length && c.parsedResume.projects.length);
  const listed=c.parsedResume.rawText.split('SKILLS\n')[1].split('\n')[0].split(',').map(s=>s.trim());
  assert.deepEqual(Array.from(c.skills),listed, 'demo skills match the authored skills list, not incidental words');
  const certs=(c.parsedResume.rawText.match(/CERTIFICATIONS\n([\s\S]*?)\nSKILLS/)||[])[1];
  assert.deepEqual(Array.from(c.parsedResume.certifications),certs?certs.split('\n'):[], 'full authored credential names are preserved');
  assert(demo.TIQ.views._captureVisualEntries(c).length>=2);
  assert(demo.TIQ.views._capturePrintResumeHtml(c).includes(c.firstName+' '+c.lastName));
  assert(fs.existsSync(c.resumeUpload.sourceUrl));
}
demo.TIQ.state.candidates[0].notes='New note to preserve';demo.TIQ.saveState();
const reload=await load('',demo.store);
assert.equal(reload.TIQ.state.candidates[0].notes,'New note to preserve');
assert.equal(reload.audioClears,0,'reload must not delete new recordings');
assert(reload.TIQ.state.candidates[0].resumeUpload.sourceUrl.endsWith('.pdf'));
reload.TIQ.state.candidates[0].resumeUpload.name='replacement.pdf';reload.TIQ.saveState();
const replaced=await load('',reload.store);
assert(!replaced.TIQ.state.candidates[0].resumeUpload.sourceUrl,'a later upload must not reopen the original fictional PDF');
console.log('Main-site fictional recruiting cards, one-time cleanup, and reload preservation passed');
})().catch(e=>{console.error(e);process.exitCode=1;});

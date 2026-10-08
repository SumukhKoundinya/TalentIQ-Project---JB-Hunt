/* Controlled studies are independent of seeded audit entries and ordinary use. */
TIQ.study = (function() {
  var key = 'talentiq-study-v1', data = {version:1,studies:[]}, storageError = '';
  try { var saved = JSON.parse(localStorage.getItem(key) || 'null'); if (saved && saved.version === 1 && Array.isArray(saved.studies)) data = saved; }
  catch (_) { storageError = 'Saved study data could not be read. Export/inspect local storage before collecting new observations.'; }
  var fieldKeys = ['firstName','lastName','email','university','degreeProgram','major','graduationDate','skills','notes','areasDiscussed','nextStepNotes'];
  var editTypes = ['factual correction','unsupported statement removed','source clarification','structure / wording','missing information added'];
  function persist() { try { localStorage.setItem(key,JSON.stringify(data)); } catch (_) { throw new Error('Study could not be saved on this device. Export your observations before leaving.'); } }
  function copy(x) { return JSON.parse(JSON.stringify(x)); }
  function id(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,10); }
  function text(value, name) { if (typeof value !== 'string' || !value.trim() || value.length > 10000) throw new Error('Enter ' + name + '.'); return value.trim(); }
  function create(input) {
    if (storageError) throw new Error(storageError);
    if (!input.confirmed) throw new Error('Confirm the task, rubrics, questionnaire, and equivalent synthetic dataset before collecting trials.');
    var definitions = {};
    ['dataset','taskDefinition','consistencyRubric','supportRubric','question'].forEach(function(k) { definitions[k] = text(input[k],k); });
    if (!Array.isArray(input.requiredFields) || !input.requiredFields.length || input.requiredFields.some(function(k) { return fieldKeys.indexOf(k) === -1; })) throw new Error('Choose the required fields for this study.');
    definitions.requiredFields = Array.from(new Set(input.requiredFields));
    definitions.confirmedAt = TIQ.nowISO();
    var s = {id:id('study'),name:text(input.name,'study name'),definitions:definitions,trials:[],accessibility:[],createdAt:TIQ.nowISO()};
    data.studies.push(s); persist(); return s;
  }
  function start(study, input, now) {
    if (data.studies.some(function(s) { return s.trials.some(function(t) { return t.status === 'active'; }); })) throw new Error('Finish or abandon the active trial first.');
    if (input.synthetic !== true) throw new Error('Explicitly confirm assignment of synthetic study data. Ordinary activity is not a trial.');
    if (['Manual','TalentIQ'].indexOf(input.method) === -1 || ['capture','review'].indexOf(input.task) === -1) throw new Error('Choose method and task.');
    var trial = {id:id('trial'),participant:text(input.participant,'participant code'),pair:text(input.pair,'pair code'),method:input.method,task:input.task,dataset:study.definitions.dataset,definitions:copy(study.definitions),synthetic:true,candidateIds:input.candidateIds || [],startedAt:now === undefined ? Date.now() : now,status:'active'};
    study.trials.push(trial); persist(); return trial;
  }
  function active(study,id) { var t = study.trials.find(function(x) { return x.id === id; }); if (!t || t.status !== 'active') throw new Error('This trial is not active.'); return t; }
  function number(v, min, max, name) { if (v === '' || v === null || v === undefined) return null; v = Number(v); if (!Number.isInteger(v) || v < min || v > max) throw new Error('Enter a valid ' + name + '.'); return v; }
  function outcome(input) {
    if (typeof input.completed !== 'boolean') throw new Error('Record whether the task was completed.');
    var total = number(input.consistencyTotal,1,1000,'consistency denominator'), consistent = number(input.consistent,0,total || 1000,'consistency count');
    if ((total === null) !== (consistent === null)) throw new Error('Record both consistency checks passed and total checks.');
    var statements = (input.statements || []).map(function(s) {
      if (['Supported','Unsupported','Unsure'].indexOf(s.judgment) === -1) throw new Error('Choose a statement support judgment.');
      if (s.judgment === 'Supported' && !String(s.source || '').trim()) throw new Error('A supported statement needs its source passage.');
      return {statement:text(s.statement,'statement'),source:s.source || '',judgment:s.judgment};
    });
    var edits = (input.edits || []).map(function(e) { if (editTypes.indexOf(e.type) === -1) throw new Error('Choose an edit type.'); return {type:e.type,count:number(e.count,1,10000,'edit count')}; });
    return {completed:input.completed,fields:input.fields || {},consistent:consistent,consistencyTotal:total,confidence:number(input.confidence,1,5,'confidence (1–5)'),errors:number(input.errors,0,10000,'error count'),feedback:input.feedback || '',originalDraft:input.originalDraft || '',finalDraft:input.finalDraft || '',edits:edits,statements:statements};
  }
  function finish(study,id,input,now) {
    var t = active(study,id), result = outcome(input), ended = t.stoppedAt !== undefined ? t.stoppedAt : now === undefined ? Date.now() : now;
    if (ended < t.startedAt) throw new Error('Clock moved backwards. Abandon this trial and record the timing limitation.');
    t.finishedAt = ended; t.durationSeconds = (ended - t.startedAt) / 1000; t.outcome = result; t.status = result.completed ? 'completed' : 'incomplete'; persist(); return t;
  }
  function abandon(study,id,reason,now) { var t = active(study,id); t.reason = text(reason,'abandonment reason'); t.finishedAt = now === undefined ? Date.now() : now; t.durationSeconds = Math.max(0,(t.finishedAt - t.startedAt) / 1000); t.status = 'abandoned'; persist(); }
  function included(t) { return t.status === 'completed' && t.outcome && t.outcome.completed === true && Number.isFinite(t.durationSeconds) && t.durationSeconds >= 0; }
  function coverage(t) { if (!t.outcome) return null; var fields = t.definitions.requiredFields; return 100 * fields.filter(function(k) { var v = t.outcome.fields[k]; return k === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') : Array.isArray(v) ? v.length > 0 : !!String(v || '').trim(); }).length / fields.length; }
  function mean(values) { return values.length ? values.reduce(function(a,b) { return a+b; },0) / values.length : null; }
  function compare(study) {
    var measures = {capture:function(t) { return t.task === 'capture' ? t.durationSeconds : null; },review:function(t) { return t.task === 'review' ? t.durationSeconds : null; },coverage:coverage,consistency:function(t) { return t.outcome && t.outcome.consistencyTotal ? 100 * t.outcome.consistent / t.outcome.consistencyTotal : null; }}, result = {};
    Object.keys(measures).forEach(function(k) {
      var getter = measures[k], eligible = study.trials.filter(function(t) { return included(t) && getter(t) !== null; }), group = {};
      result[k] = {};
      ['Manual','TalentIQ'].forEach(function(method) { var values = eligible.filter(function(t) { return t.method === method; }).map(getter); result[k][method] = {n:values.length,mean:mean(values)}; });
      eligible.forEach(function(t) { var key = [t.participant,t.pair,t.dataset,t.task].join('\u0000'); var pair = group[key] || (group[key] = {Manual:[],TalentIQ:[]}); pair[t.method].push(t); });
      var deltas = Object.keys(group).filter(function(id) { return group[id].Manual.length === 1 && group[id].TalentIQ.length === 1; }).map(function(id) { return getter(group[id].TalentIQ[0]) - getter(group[id].Manual[0]); });
      result[k].paired = {n:deltas.length,mean:mean(deltas)};
    }); return result;
  }
  function support(study) { var out = {supported:0,unsupported:0,unsure:0,assessed:0}; study.trials.forEach(function(t) { if (t.outcome) t.outcome.statements.forEach(function(s) { out[s.judgment.toLowerCase()]++; out.assessed++; }); }); return out; }
  function addAccessibility(study,input) { var entry = {}; ['check','date','method','result'].forEach(function(k) { entry[k] = text(input[k],k); }); if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || isNaN(Date.parse(entry.date))) throw new Error('Enter a valid test date.'); entry.remediation = input.remediation || ''; entry.limitation = input.limitation || ''; study.accessibility.push(entry); persist(); }
  function exportStudy(study) { return {kind:'talentiq-study-export',version:1,exportedAt:TIQ.nowISO(),studyId:study.id,name:study.name,definitions:copy(study.definitions),trials:study.trials.map(function(t) { return Object.assign(copy(t),{includedInCompletedTime:!!included(t),requiredCoverage:coverage(t),exclusionReason:included(t) ? '' : t.reason || 'Trial not completed'}); }),comparison:compare(study),statementSupport:support(study),accessibility:copy(study.accessibility),limitations:'Local observations only. Equivalent synthetic tasks and counterbalanced method order need researcher oversight. Paired differences require one trial per method per participant/pair/dataset/task. Incomplete trials are excluded from completed measures. Small samples do not demonstrate statistical significance.'}; }
  return {data:data,storageError:storageError,fieldKeys:fieldKeys,editTypes:editTypes,create:create,start:start,finish:finish,abandon:abandon,compare:compare,support:support,addAccessibility:addAccessibility,export:exportStudy,
    stop:function(study,id,now) { var t = active(study,id), ended = now === undefined ? Date.now() : now; if (t.stoppedAt !== undefined) throw new Error('Task timing is already stopped.'); if (ended < t.startedAt) throw new Error('Clock moved backwards; abandon this trial.'); t.stoppedAt = ended; persist(); },
    saveOutcome:function(study,id,input) { var t = study.trials.find(function(t) { return t.id === id; }); if (!t || t.status === 'active' || t.status === 'abandoned') throw new Error('Finish the trial before adding feedback.'); var result = outcome(input); if (result.completed !== (t.status === 'completed')) throw new Error('Task completion is recorded when finishing; do not change it in feedback.'); t.outcome = result; persist(); }
  };
})();

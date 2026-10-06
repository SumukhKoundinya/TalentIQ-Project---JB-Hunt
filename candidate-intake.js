/* Resume-first intake: an unsaved draft uses the shared candidate/parser flow. */
(function() {
  var fields = ['firstName','lastName','email','phone','university','degreeProgram','major','graduationDate','gpa'];
  function uniqueId() {
    return 'intake-' + (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
  }
  TIQ.intake.createSubmissionFlow = function() {
    var candidate = TIQ.intake.buildCandidate({});
    candidate.id = uniqueId();
    var generation = 0, submitted = false;
    var flow = {
      candidate: candidate, status: 'empty', error: '',
      edit: function(field, value) {
        if (submitted || fields.indexOf(field) === -1) return;
        candidate[field] = String(value || '').trim();
        candidate.provenance[field] = 'intake';
      },
      scan: function(file) {
        if (submitted) throw new Error('This profile was already submitted.');
        if (!TIQ.intake.isParsableResume(file)) throw new Error('Choose a text-based PDF.');
        if (file.size > 5 * 1024 * 1024) throw new Error('Choose a PDF no larger than 5 MB.');
        var current = ++generation;
        flow.status = 'parsing'; flow.error = '';
        var promise;
        try { promise = TIQ.ai.parseAndStoreResume(candidate, file); }
        catch (err) { promise = Promise.resolve(null); flow.error = err.message; }
        return promise.then(function(parsed) {
          if (current !== generation) return null;
          flow.status = parsed ? 'ready' : 'failed';
          flow.error = parsed ? '' : (flow.error || TIQ.resumeInfo(candidate).error || 'This PDF could not be read. Try another PDF or enter your details manually.');
          return parsed;
        });
      },
      enterManually: function() {
        if (submitted) return;
        ++generation;
        TIQ.ai.clearResumeDerivedData(candidate);
        var info = TIQ.resumeInfo(candidate);
        if (info.sourceUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) URL.revokeObjectURL(info.sourceUrl);
        candidate.resumeUpload = '';
        flow.status = 'manual'; flow.error = '';
      },
      submit: function(consent) {
        if (submitted) throw new Error('This profile was already submitted.');
        if (flow.status === 'parsing') throw new Error('Wait for parsing to finish or choose manual entry.');
        if (!candidate.firstName || !candidate.lastName) throw new Error('Confirm your first and last name.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) throw new Error('Enter a valid email address.');
        if (!consent || !consent.profile) throw new Error('Profile-sharing consent is required.');
        /* Submission confirms the visible values, including extracted ones, so
           the existing portable handoff can transfer them as candidate entries. */
        fields.forEach(function(k) { if (candidate[k] || candidate.provenance[k] === 'intake') candidate.provenance[k] = 'intake'; });
        candidate.consent = {profile:true,audio:consent.audio === true,at:TIQ.nowISO()};
        var result = TIQ.ai.generateSummary(candidate);
        candidate.summary = result.summary; candidate.traceability = result.traceability;
        candidate.accomplishments = TIQ.generateAccomplishments(candidate);
        TIQ.state.candidates.push(candidate);
        TIQ.saveState();
        submitted = true; flow.status = 'submitted';
        return candidate;
      }
    };
    return flow;
  };

  if (typeof document === 'undefined') return;
  var form = document.getElementById('candidateForm');
  if (!form) return;
  var flow, fileInput = document.getElementById('resumeInput');
  var upload = document.getElementById('fileUpload'), review = document.getElementById('reviewDetails');
  var progress = document.getElementById('parseProgress'), error = document.getElementById('fileError');
  var button = document.getElementById('submitBtn'), submitted;

  function render() {
    var c = flow.candidate, info = TIQ.resumeInfo(c);
    review.hidden = flow.status === 'empty';
    document.getElementById('consentDetails').hidden = review.hidden;
    review.setAttribute('aria-busy', flow.status === 'parsing' ? 'true' : 'false');
    fields.forEach(function(k) { form.elements[k].value = c[k] || ''; });
    document.getElementById('fileName').textContent = info.name || '';
    upload.classList.toggle('has-file', !!info.name);
    progress.textContent = flow.status === 'parsing' ? 'Reading your resume… You can edit details while we scan.' : flow.status === 'ready' ? 'Resume read. Review and confirm below to create your recruiter card.' : flow.status === 'failed' ? 'Could not read this resume. Retry or enter your details below.' : flow.status === 'manual' ? 'Enter your details below. A resume is optional.' : '';
    error.textContent = flow.error;
    button.disabled = flow.status === 'parsing';
    var conflict = document.getElementById('resumeConflicts');
    conflict.replaceChildren();
    (c.resumeConflicts || []).forEach(function(item) {
      var li = document.createElement('li');
      li.textContent = (form.elements[item.field] ? form.elements[item.field].labels[0].textContent.replace('*','').trim() : item.field) + ': your entry “' + (item.entered || '(blank)') + '” was kept; resume says “' + item.resume + '”.';
      conflict.appendChild(li);
    });
    document.getElementById('conflictReview').hidden = !conflict.children.length;
  }
  function reset() {
    flow = TIQ.intake.createSubmissionFlow();
    form.reset(); submitted = null;
    document.getElementById('formPage').hidden = false;
    document.getElementById('successScreen').classList.remove('visible');
    button.disabled = false;
    document.getElementById('submitError').textContent = '';
    render();
  }
  function acceptFile(file) {
    var promise;
    try { promise = flow.scan(file); }
    catch (err) { error.textContent = err.message; fileInput.value = ''; return; }
    render();
    promise.then(render);
    fileInput.value = ''; // Selecting the same PDF again must trigger a retry.
    /* Stop a stalled read without allowing its eventual result to overwrite
       manual/retried details. No successful parse is silently submitted. */
    var ref = flow.candidate.resumeUpload, active = flow;
    setTimeout(function() {
      if (flow !== active || active.status !== 'parsing' || active.candidate.resumeUpload !== ref) return;
      active.enterManually();
      active.error = 'Parsing took too long. Try the PDF again or enter your details manually.';
      render();
    }, 20000);
  }
  fileInput.addEventListener('change', function() { if (fileInput.files[0]) acceptFile(fileInput.files[0]); });
  upload.addEventListener('dragover', function(e) { e.preventDefault(); upload.classList.add('dragging'); });
  upload.addEventListener('dragleave', function() { upload.classList.remove('dragging'); });
  upload.addEventListener('drop', function(e) { e.preventDefault(); upload.classList.remove('dragging'); if (e.dataTransfer.files[0]) acceptFile(e.dataTransfer.files[0]); });
  document.getElementById('manualEntry').addEventListener('click', function() {
    flow.enterManually(); fileInput.value = ''; render(); form.elements.firstName.focus();
  });
  fields.forEach(function(k) {
    form.elements[k].addEventListener('input', function() {
      flow.edit(k, this.value);
      this.classList.remove('error');
      var fieldError = form.querySelector('[data-for="' + k + '"]');
      if (fieldError) fieldError.textContent = '';
      document.getElementById('submitError').textContent = '';
    });
  });
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    try {
      /* Autofill can change DOM values without input events. Preserve only
          actual differences; untouched extracted values keep resume provenance
         through retries until the final confirmation. */
      fields.forEach(function(k) { if (form.elements[k].value.trim() !== String(flow.candidate[k] || '')) flow.edit(k, form.elements[k].value); });
      submitted = flow.submit({profile:form.elements.profileConsent.checked,audio:form.elements.audioConsent.checked});
    } catch (err) {
      document.getElementById('submitError').textContent = err.message;
      ['firstName','lastName','email'].forEach(function(k) {
        var invalid = !flow.candidate[k] || (k === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(flow.candidate[k]));
        form.elements[k].classList.toggle('error', invalid);
      });
      return;
    }
    button.disabled = true;
    document.getElementById('submittedId').textContent = submitted.id;
    document.getElementById('viewRecruiterCard').href = 'index.html?candidate=' + encodeURIComponent(submitted.id);
    document.getElementById('viewRecruiterCard').hidden = false;
    document.getElementById('scanStatus').textContent = submitted.parsedResume ? 'Resume details and highlights saved with your profile.' : submitted.resumeUpload ? 'Profile saved. Give the original PDF to the recruiter to retry parsing.' : 'Manual profile saved.';
    document.getElementById('formPage').hidden = true;
    document.getElementById('successScreen').classList.add('visible');
    document.getElementById('handoffStatus').textContent = 'The JSON file contains personal information and is not encrypted. Downloading it does not send it.';
    document.getElementById('downloadSubmission').disabled = false;
    document.getElementById('deleteLocalSubmission').disabled = false;
  });
  document.getElementById('downloadSubmission').addEventListener('click', function() {
    try { TIQ.downloadText('talentiq-' + submitted.id + '.json', TIQ.bridge.serialize(submitted)); }
    catch (err) { document.getElementById('handoffStatus').textContent = err.message; }
  });
  document.getElementById('deleteLocalSubmission').addEventListener('click', function() {
    if (!submitted || !confirm('Delete this profile from this browser? Shared or downloaded copies are not deleted.')) return;
    TIQ.state.candidates = TIQ.state.candidates.filter(function(c) { return c.id !== submitted.id; }); TIQ.saveState();
    document.getElementById('downloadSubmission').disabled = true;
    document.getElementById('viewRecruiterCard').hidden = true;
    this.disabled = true;
    document.getElementById('handoffStatus').textContent = 'Local profile deleted. Delete downloaded copies separately.';
  });
  document.getElementById('anotherSubmission').addEventListener('click', reset);
  if (TIQ.prepareFictionalDemo) {
    form.inert=true;
    TIQ.prepareFictionalDemo().then(function() { reset();form.inert=false; }).catch(function() {
      error.textContent='Previous data cleanup could not finish. Close other TalentIQ tabs and reload to retry.';
    });
  } else reset();
})();

/* ============================================
   TalentIQ — Reusable Components
   ============================================ */
window.TIQ = window.TIQ || {};

TIQ.showToast = function(message) {
  var toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("toast--show");
  clearTimeout(toast._t);
  toast._t = setTimeout(function() { toast.classList.remove("toast--show"); }, TIQ.CONFIG.toastDuration);
};

TIQ.showUndoToast = function(message, onUndo) {
  var toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = '<span>' + TIQ.escapeHtml(message) + '</span> <button class="toast-undo" id="toastUndoBtn">Undo</button>';
  toast.classList.add("toast--show");
  clearTimeout(toast._t);
  document.getElementById("toastUndoBtn").addEventListener("click", function() {
    onUndo();
    toast.classList.remove("toast--show");
  });
  toast._t = setTimeout(function() { toast.classList.remove("toast--show"); }, TIQ.CONFIG.toastUndoDuration);
};

TIQ.formatCandidateCard = function(candidate, opts) {
  opts = opts || {};
  var statusClass = TIQ.statusClassMap[candidate.recordStatus] || "status-new";
  var flags = TIQ.getMissingFlags(candidate);
  var checked = (opts.compareSelection || []).indexOf(candidate.id) >= 0;
  var isSelected = candidate.id === opts.selectedId;

  var flagsHtml = flags.length
    ? flags.slice(0, 2).map(TIQ.formatFlagChip).join("")
    : '<span class="flag-chip flag-clear">[No Critical Missing Info]</span>';
  if (flags.length > 2) flagsHtml += '<span class="flag-more">+' + (flags.length - 2) + ' more</span>';

  var audioIndicator = "";
  if (candidate.audioNotes && candidate.audioNotes.length > 0) {
    audioIndicator = '<span class="card-audio-badge">' + candidate.audioNotes.length + ' audio</span>';
  }

  return '<article class="candidate-card' + (isSelected ? " selected" : "") + '" data-id="' + candidate.id + '" tabindex="0">' +
    '<div class="candidate-avatar" aria-label="' + TIQ.escapeAttr(candidate.firstName) + ' ' + TIQ.escapeAttr(candidate.lastName) + '">' + TIQ.initialsFor(candidate) + '</div>' +
    '<div class="candidate-main">' +
      '<div class="candidate-header">' +
        '<span class="candidate-name">' + TIQ.escapeHtml(candidate.firstName) + ' ' + TIQ.escapeHtml(candidate.lastName) + '</span>' +
        '<span class="candidate-id">' + TIQ.escapeHtml(candidate.id) + '</span>' +
        audioIndicator +
      '</div>' +
      '<div class="candidate-university">' + TIQ.escapeHtml(candidate.university) + ' &bull; ' + TIQ.escapeHtml(candidate.major) + '</div>' +
      '<div class="candidate-tags">' +
        candidate.skills.slice(0, 3).map(function(s) { return '<span>' + TIQ.escapeHtml(s) + '</span>'; }).join("") +
      '</div>' +
    '</div>' +
    '<div class="candidate-card__right">' +
      '<span class="status-chip ' + statusClass + '">' + TIQ.escapeHtml(candidate.recordStatus) + '</span>' +
      flagsHtml +
      (opts.showCompare !== false ? '<label class="compare-check" title="Add to comparison"><input type="checkbox" aria-label="Compare ' + TIQ.escapeAttr(candidate.firstName) + '" ' + (checked ? "checked" : "") + ' /> Compare</label>' : '') +
    '</div>' +
  '</article>';
};

TIQ.renderAttributePills = function(selected, opts) {
  opts = opts || {};
  var options = opts.options || TIQ.CONFIG.attributeOptions || [];
  var isInteractive = opts.interactive !== false;
  var selectedIds = Array.isArray(selected) ? selected : [];
  var cls = opts.className || "attribute-picker";

  return '<div class="' + cls + '" data-attribute-picker>' + options.map(function(option) {
    var active = selectedIds.indexOf(option.id) >= 0;
    var label = (option.icon ? '<span class="attribute-pill__icon" aria-hidden="true">' + TIQ.escapeHtml(option.icon) + '</span>' : '') +
      '<span class="attribute-pill__label">' + TIQ.escapeHtml(option.label) + '</span>';
    if (isInteractive) {
      return '<button type="button" class="attribute-pill' + (active ? ' attribute-pill--active' : '') + '" data-attribute-id="' + TIQ.escapeAttr(option.id) + '" aria-pressed="' + (active ? 'true' : 'false') + '">' + label + '</button>';
    }
    return '<span class="attribute-pill attribute-pill--static' + (active ? ' attribute-pill--active' : '') + '">' + label + '</span>';
  }).join('') + '</div>';
};

TIQ.renderDropZone = function(fileName, opts) {
  opts = opts || {};
  var inputId = opts.inputId || "resumeUpload";
  return '<label class="dropzone' + (fileName ? ' dropzone--filled' : '') + '" data-dropzone>' +
    '<input class="dropzone__input" id="' + TIQ.escapeAttr(inputId) + '" name="resumeUpload" type="file" accept=".pdf,application/pdf" />' +
    '<span class="dropzone__icon" aria-hidden="true">⇪</span>' +
    '<span class="dropzone__title">Drag and drop resume here</span>' +
    '<span class="dropzone__meta">or click to browse &mdash; text-based PDF only</span>' +
    '<span class="dropzone__file" data-dropzone-file>' + TIQ.escapeHtml(fileName || 'No file selected') + '</span>' +
  '</label>';
};

TIQ.renderTranscriptBlock = function(candidate) {
  var notes = candidate.audioNotes || [];
  if (!notes.length) {
    return '<div class="transcript-empty">No transcript captured yet.</div>';
  }

  return '<div class="transcript-list">' + notes.map(function(note, index) {
    var transcript = note.transcript || note.text || note.summary || "";
    var statusClass, statusLabel;
    if (transcript) {
      statusClass = "voice-note-status--complete";
      statusLabel = "Transcribed";
    } else {
      statusClass = "voice-note-status--pending";
      statusLabel = "Pending review";
    }
    return '<article class="transcript-card">' +
      '<div class="transcript-card__head">' +
        '<span class="transcript-card__label">Recording ' + (index + 1) + '</span>' +
        '<span class="voice-note-status ' + statusClass + '">' + statusLabel + '</span>' +
        '<span class="transcript-card__meta">' + TIQ.escapeHtml(String(note.duration || 0)) + 's</span>' +
      '</div>' +
      (transcript
        ? '<p class="transcript-card__body">' + TIQ.escapeHtml(transcript) + '</p>'
        : '<p class="transcript-card__body transcript-card__body--pending">No transcript captured. Will process on next visit.</p>') +
    '</article>';
  }).join('') + '</div>';
};

TIQ.renderAuditTrailList = function(auditLog) {
  var items = auditLog || [];
  if (!items.length) {
    return '<div class="audit-empty">No audit trail available.</div>';
  }

  return '<div class="audit-list">' + items.map(function(item) {
    var source = 'System';
    if (item.action === 'CREATED') source = 'Student Kiosk';
    else if (item.action === 'NOTES_UPDATED') source = 'Recruiter Notes';
    else if (item.action === 'AUDIO_ADDED') source = 'Voice Note';
    else if (item.action === 'AUDIO_DELETED') source = 'Voice Note';
    else if (item.action === 'STATUS_UPDATED') source = 'Recruiter Action';

    return '<article class="audit-row">' +
      '<div class="audit-row__head"><span class="audit-row__action">' + TIQ.escapeHtml(item.action || 'UPDATE') + '</span><span class="audit-row__time">' + TIQ.escapeHtml(item.timestamp || '') + '</span></div>' +
      '<div class="audit-row__meta">Source: ' + TIQ.escapeHtml(source) + '</div>' +
      '<div class="audit-row__detail">' + TIQ.escapeHtml(item.detail || '') + '</div>' +
    '</article>';
  }).join('') + '</div>';
};

TIQ.renderCitationList = function(traceability) {
  var items = traceability || [];
  if (!items.length) {
    return '<div class="citation-empty">No source citations available.</div>';
  }

  return '<div class="citation-list">' + items.map(function(item) {
    return '<span class="citation-chip">' + TIQ.escapeHtml(item) + '</span>';
  }).join('') + '</div>';
};

TIQ.renderMetricsCards = function(metrics) {
  metrics = metrics || [];
  return '<div class="metrics-grid">' + metrics.map(function(metric) {
    return '<article class="metric-card' + (metric.modifier ? ' metric-card--' + TIQ.escapeAttr(metric.modifier) : '') + '">' +
      '<span class="metric-card__label">' + TIQ.escapeHtml(metric.label) + '</span>' +
      '<span class="metric-card__value">' + TIQ.escapeHtml(metric.value) + '</span>' +
      (metric.sub ? '<span class="metric-card__sub">' + TIQ.escapeHtml(metric.sub) + '</span>' : '') +
    '</article>';
  }).join('') + '</div>';
};

TIQ.exportCsv = function(data, activeRecruiterId) {
  if (!data.length) { TIQ.showToast("No candidates to export."); return; }
  var header = ["ID", "Name", "University", "Major", "Status", "Missing Flags", "Recruiter ID", "Timestamp"];
  var rows = data.map(function(c) {
    return [c.id, c.firstName + " " + c.lastName, c.university, c.major, c.recordStatus,
      TIQ.getMissingFlags(c).map(function(f) { return f.label; }).join("; "),
      c.approverId || activeRecruiterId || "", c.approvalTimestamp || c.lastUpdated || ""];
  });
  var csv = [header].concat(rows).map(function(r) { return r.map(TIQ.escapeCsvCell).join(","); }).join("\n");
  TIQ.downloadCsv(TIQ.CONFIG.exportCsvFilename, csv);
  TIQ.showToast("Exported " + rows.length + " candidate records to CSV.");
};

TIQ.exportJson = function(data) {
  if (!data.length) { TIQ.showToast("No candidates to export."); return; }
  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.href = url; link.download = TIQ.CONFIG.exportJsonFilename;
  document.body.appendChild(link); link.click();
  document.body.removeChild(link); URL.revokeObjectURL(url);
  TIQ.showToast("Exported " + data.length + " candidate records as JSON.");
};

/* ---- Loading Skeletons ---- */
TIQ.skeleton = {
  card: function() {
    return '<div class="skeleton skeleton-card"></div>';
  },
  statRow: function(count) {
    count = count || 4;
    var html = '<div class="overview-stats" style="animation:none">';
    for (var i = 0; i < count; i++) {
      html += '<div class="stat-card" style="animation:none;border-top-color:var(--line-soft)">' +
        '<div class="skeleton skeleton-text--lg" style="width:40%;margin-bottom:8px"></div>' +
        '<div class="skeleton skeleton-text" style="width:60%"></div>' +
        '<div class="skeleton skeleton-text--sm" style="width:50%"></div></div>';
    }
    return html + '</div>';
  },
  list: function(rows) {
    rows = rows || 5;
    var html = '';
    for (var i = 0; i < rows; i++) {
      html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line-soft)">' +
        '<div class="skeleton skeleton-circle" style="width:36px;height:36px;flex-shrink:0"></div>' +
        '<div style="flex:1"><div class="skeleton skeleton-text" style="width:50%"></div>' +
        '<div class="skeleton skeleton-text--sm" style="width:70%"></div></div></div>';
    }
    return html;
  },
  bars: function(rows) {
    rows = rows || 4;
    var html = '';
    for (var i = 0; i < rows; i++) {
      var w = 30 + Math.floor(Math.random() * 50);
      html += '<div class="hbar-row"><span class="hbar-label"><div class="skeleton skeleton-text" style="width:80px"></div></span>' +
        '<div class="hbar-track"><div class="skeleton" style="width:' + w + '%;height:10px;border-radius:999px"></div></div>' +
        '<span class="hbar-val"><div class="skeleton skeleton-text--sm" style="width:24px"></div></span></div>';
    }
    return html;
  },
  overlay: function(type) {
    if (type === "overview") {
      return '<div style="padding:24px">' +
        TIQ.skeleton.statRow(4) +
        '<div class="overview-grid" style="margin-top:20px">' +
          '<div class="overview-card"><div class="overview-card__head"><div class="skeleton skeleton-text" style="width:140px;margin-bottom:16px"></div></div>' + TIQ.skeleton.bars(4) + '</div>' +
          '<div class="overview-card"><div class="overview-card__head"><div class="skeleton skeleton-text" style="width:120px;margin-bottom:16px"></div></div>' + TIQ.skeleton.list(5) + '</div>' +
          '<div class="overview-card"><div class="overview-card__head"><div class="skeleton skeleton-text" style="width:130px;margin-bottom:16px"></div></div>' + TIQ.skeleton.list(4) + '</div>' +
        '</div></div>';
    }
    if (type === "capture") {
      return '<div style="padding:24px;display:flex;flex-direction:column;align-items:center">' +
        '<div class="skeleton skeleton-text--lg" style="width:200px;margin-bottom:20px"></div>' +
        '<div class="skeleton" style="width:420px;max-width:100%;height:380px;border-radius:12px"></div></div>';
    }
    return '<div style="padding:24px">' + TIQ.skeleton.list(6) + '</div>';
  }
};

/* ---- Debounce Utility ---- */
TIQ.debounce = function(fn, delay) {
  var timer = null;
  return function() {
    var ctx = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
  };
};

/* ---- Export with Loading State ---- */
TIQ.exportCsvLoading = function(btn, data, activeRecruiterId) {
  if (!data.length) { TIQ.showToast("No candidates to export."); return; }
  var originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Exporting...";
  setTimeout(function() {
    TIQ.exportCsv(data, activeRecruiterId);
    btn.disabled = false;
    btn.textContent = originalText;
  }, 400);
};

TIQ.exportJsonLoading = function(btn, data) {
  if (!data.length) { TIQ.showToast("No candidates to export."); return; }
  var originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Exporting...";
  setTimeout(function() {
    TIQ.exportJson(data);
    btn.disabled = false;
    btn.textContent = originalText;
  }, 400);
};

/* ---- Grammar Correction ---- */
TIQ.fixGrammar = function(text) {
  var t = text;
  // Subject-verb agreement
  t = t.replace(/\b(she|he|it)\s+don't\b/gi, function(m, s) { return s + " doesn't"; });
  t = t.replace(/\b(she|he|it)\s+wasn't\s+able\b/gi, function(m, s) { return s + " wasn't able"; });
  t = t.replace(/\bwe\s+was\b/gi, "we were");
  t = t.replace(/\bthey\s+was\b/gi, "they were");
  t = t.replace(/\bI\s+was\s+able\s+to\s+have\b/gi, "I was able to");
  t = t.replace(/\b(is|are|was|were)\s+(a|an)\s+(going|having|being)\b/gi, function(m, v, a, g) { return v + " " + g; });
  // "could of" / "would of" / "should of"
  t = t.replace(/\bcould of\b/gi, "could have");
  t = t.replace(/\bwould of\b/gi, "would have");
  t = t.replace(/\bshould of\b/gi, "should have");
  t = t.replace(/\bmight of\b/gi, "might have");
  t = t.replace(/\bmust of\b/gi, "must have");
  // "me and her" / "me and him"
  t = t.replace(/\bme\s+and\s+(her|him|them)\b/gi, function(m, p) {
    var subj = p === "her" ? "she" : p === "him" ? "he" : "they";
    var obj = p === "them" ? "they" : p;
    return subj + " and " + obj;
  });
  // "I seen" → "I saw"
  t = t.replace(/\bI\s+seen\b/gi, "I saw");
  // Double negatives
  t = t.replace(/\bdon't\s+have\s+no\b/gi, "don't have any");
  t = t.replace(/\bcan't\s+find\s+no\b/gi, "can't find any");
  // "real good" / "real well"
  t = t.replace(/\breal\s+good\b/gi, "very good");
  t = t.replace(/\breal\s+well\b/gi, "very well");
  // "alot" → "a lot"
  t = t.replace(/\balot\b/gi, "a lot");
  // "definately" / "definatly" → "definitely"
  t = t.replace(/\bdefin[ai]tly\b/gi, "definitely");
  // "seperate" / "seperately" → "separate" / "separately"
  t = t.replace(/\bseperately\b/gi, "separately");
  t = t.replace(/\bseperate\b/gi, "separate");
  return t;
};

/* ---- Tone Normalization ---- */
TIQ.normalizeTone = function(text) {
  var t = text;
  // Reduce excessive repetition ("really really" → "very")
  t = t.replace(/\b(really\s+really|very\s+very|really\s+super)\b/gi, "very");
  // "super excited" → "excited", "super good" → "very good"
  t = t.replace(/\bsuper\s+(\w+)/gi, "very $1");
  // "totally awesome" → "impressive"
  t = t.replace(/\btotally\s+awesome\b/gi, "impressive");
  t = t.replace(/\btotally\s+amazing\b/gi, "impressive");
  // "like a lot" → "significantly"
  t = t.replace(/\blike\s+a\s+lot\b/gi, "significantly");
  // "pretty much" → remove
  t = t.replace(/\bpretty\s+much\b/gi, "");
  return t.replace(/\s{2,}/g, " ").trim();
};

/* ---- Recruiter Intelligence ---- */
TIQ.detectSoftSkills = function(text) {
  var skills = [];
  var t = text.toLowerCase();
  if (/\b(lead|led|leadership|managed|managed a team|mentored|supervised|directed)\b/.test(t)) skills.push("Leadership");
  if (/\b(team\s*work|team\s*player|collaborat|partnered|worked with)\b/.test(t)) skills.push("Teamwork");
  if (/\b(communicat|presented|public speaking|explained|articulat)\b/.test(t)) skills.push("Communication");
  if (/\b(problem\s*solv|resolv|debugg|troubleshoot|fix)\b/.test(t)) skills.push("Problem Solving");
  if (/\b(initiat|proactive|self[\s-]start|took ownership|volunteered)\b/.test(t)) skills.push("Initiative");
  if (/\b(adapt|flexib|pivot|learned quickly|wore many hats)\b/.test(t)) skills.push("Adaptability");
  if (/\b(detail[\s-]oriented|meticulous|thorough|careful)\b/.test(t)) skills.push("Attention to Detail");
  if (/\b(creative|innovat|design|brainstorm|novel)\b/.test(t)) skills.push("Creativity");
  return skills;
};

TIQ.detectFollowUp = function(text) {
  var items = [];
  var t = text.toLowerCase();
  if (/\b(schedule|set up|arrange)\s+(an?\s+)?interview\b/.test(t)) items.push("Schedule interview");
  if (/\bsend\s+(resume|cv|portfolio|information)\b/.test(t)) items.push("Send resume/portfolio");
  if (/\bfollow\s*up\b/.test(t)) items.push("Follow up");
  if (/\b(set up|schedule|connect)\s+(a\s+)?call\b/.test(t)) items.push("Schedule call");
  if (/\brefer(ral)?\b/.test(t)) items.push("Provide referral");
  if (/\b(send|share|email|forward)\b/.test(t) && /\b(info|details|link|contact)\b/.test(t)) items.push("Share information");
  if (/\b(next\s+step|move\s+forward|proceed)\b/.test(t)) items.push("Discuss next steps");
  return items;
};

TIQ.detectConcerns = function(text) {
  var concerns = [];
  var t = text.toLowerCase();
  if (/\b(visa|sponsorship|work\s+auth|opt|cpt|h1b|authorization)\b/.test(t)) concerns.push("Work authorization may need verification");
  if (/\b(relocat|move|location|willing\s+to\s+travel)\b/.test(t)) concerns.push("Location preferences noted");
  if (/\b(part[\s-]time|limited\s+availability|only\s+(summer|weekends))\b/.test(t)) concerns.push("Availability constraints");
  if (/\b(no\s+experience|limited\s+experience|never\s+used|first\s+time)\b/.test(t)) concerns.push("Limited experience in discussed area");
  if (/\b(gpa|grade|transcript|academic)\b/.test(t) && /\b(below|low|struggl|challeng)\b/.test(t)) concerns.push("Academic concerns mentioned");
  return concerns;
};

/* ---- Number Word Converter ---- */
TIQ.convertNumberWords = function(text) {
  var wordMap = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
    "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50,
    "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90
  };
  var currencyWords = ["revenue", "dollars", "budget", "salary", "cost", "worth", "valuation", "funding", "investment", "profit", "income", "sales", "spend", "price", "fee", "bonus", "raise"];
  var tokens = text.split(/\s+/);
  var result = [];
  var currentNum = 0;
  var hasNum = false;

  function flushNum(multiplier) {
    if (!hasNum) return;
    if (multiplier) currentNum *= multiplier;
    // Detect currency context
    var isCurrency = false;
    for (var r = result.length - 1; r >= Math.max(0, result.length - 5); r--) {
      var w = result[r].toLowerCase().replace(/[.,!?;:'"$]/g, "");
      if (currencyWords.indexOf(w) >= 0) { isCurrency = true; break; }
    }
    if (isCurrency) {
      if (currentNum >= 1000000000) result.push("$" + (currentNum / 1000000000) + "B");
      else if (currentNum >= 1000000) result.push("$" + (currentNum / 1000000) + "M");
      else if (currentNum >= 1000) result.push("$" + (currentNum / 1000) + "K");
      else result.push("$" + currentNum);
    } else {
      if (currentNum >= 1000000000) result.push((currentNum / 1000000000) + " billion");
      else if (currentNum >= 1000000) result.push((currentNum / 1000000) + " million");
      else if (currentNum >= 10000) result.push((currentNum / 1000) + "K");
      else result.push(String(currentNum));
    }
    currentNum = 0;
    hasNum = false;
  }

  for (var i = 0; i < tokens.length; i++) {
    var clean = tokens[i].toLowerCase().replace(/[.,!?;:'"$]/g, "");

    if (wordMap.hasOwnProperty(clean)) {
      currentNum += wordMap[clean];
      hasNum = true;

      // Check next for multiplier or continuation
      var nextClean = (i + 1 < tokens.length) ? tokens[i + 1].toLowerCase().replace(/[.,!?;:'"$]/g, "") : "";

      if (nextClean === "hundred") { currentNum *= 100; i++; }
      else if (nextClean === "thousand" || nextClean === "k") { flushNum(1000); i++; continue; }
      else if (nextClean === "million" || nextClean === "m") { flushNum(1000000); i++; continue; }
      else if (nextClean === "billion" || nextClean === "b") { flushNum(1000000000); i++; continue; }
      // Check if next word is also a number word (compound)
      else if (wordMap.hasOwnProperty(nextClean)) { continue; }
      // End of number — check for decimal
      else if (i + 1 < tokens.length && tokens[i + 1].toLowerCase().replace(/[.,!?;:'"$]/g, "") === "point") {
        var decimal = "";
        i += 2;
        while (i < tokens.length) {
          var dc = tokens[i].toLowerCase().replace(/[.,!?;:'"$]/g, "");
          if (wordMap.hasOwnProperty(dc)) { decimal += String(wordMap[dc]); i++; }
          else { i--; break; }
        }
        result.push(String(currentNum) + "." + decimal);
        currentNum = 0;
        hasNum = false;
      }
      else { flushNum(); }
    }
    else if (clean === "point" && hasNum) {
      var decimal = "";
      i++;
      while (i < tokens.length) {
        var dc = tokens[i].toLowerCase().replace(/[.,!?;:'"$]/g, "");
        if (wordMap.hasOwnProperty(dc)) { decimal += String(wordMap[dc]); i++; }
        else { i--; break; }
      }
      result.push(String(currentNum) + "." + decimal);
      currentNum = 0;
      hasNum = false;
    }
    else {
      flushNum();
      result.push(tokens[i]);
    }
  }
  flushNum();
  return result.join(" ");
};

/* ---- Action Verb Starter ---- */
TIQ.prependActionVerbs = function(lines) {
  var actionVerbs = ["discussed", "explored", "covered", "talked", "demonstrated", "showed",
    "presented", "led", "managed", "directed", "coordinated", "built", "developed",
    "created", "designed", "implemented", "completed", "achieved", "delivered",
    "improved", "optimized", "enhanced", "streamlined", "analyzed", "evaluated",
    "assessed", "researched", "collaborated", "partnered", "learned", "studied",
    "highlighted", "noted", "mentioned", "expressed", "shared", "articulated",
    "graduated", "pursued", "volunteered", "participated", "enrolled", "focused",
    "specialized", "utilized", "operated", "maintained", "supervised", "mentored",
    "trained", "facilitated", "organized", "planned", "executed", "initiated",
    "proposed", "recommended", "resolved", "addressed", "contributed", "assisted",
    "supported", "provided", "produced", "generated", "launched", "established",
    "founded", "pioneered", "spearheaded", "used", "had", "did", "got", "went",
    "said", "made", "found", "started", "worked", "took", "ran", "set", "met",
    "tried", "needed", "wanted", "liked", "gave", "told", "put", "asked"];
  var adverbs = ["also", "additionally", "furthermore", "moreover", "however",
    "then", "just", "really", "very", "previously", "recently", "currently"];
  var pronounPattern = /^(she|he|they|we|i)\s+/i;
  var adverbPattern = /^(\w+)\s+(she|he|they|we|i)\s+/i;

  return lines.map(function(line) {
    var firstWord = line.split(/\s+/)[0].toLowerCase().replace(/[.,!?]/g, "");
    // Already starts with action verb
    if (actionVerbs.indexOf(firstWord) >= 0) return line;
    // Starts with adverb + action verb (e.g. "Also used SQL")
    if (adverbs.indexOf(firstWord) >= 0) {
      var secondWord = (line.split(/\s+/)[1] || "").toLowerCase().replace(/[.,!?]/g, "");
      if (actionVerbs.indexOf(secondWord) >= 0) {
        return line.charAt(0).toUpperCase() + line.slice(1);
      }
    }
    // Strip leading pronoun and keep verb
    var match = line.match(pronounPattern);
    if (match) {
      var rest = line.slice(match[0].length);
      var capRest = rest.charAt(0).toUpperCase() + rest.slice(1);
      return capRest;
    }
    // No pronoun — prepend "Discussed"
    return "Discussed " + line.charAt(0).toLowerCase() + line.slice(1);
  });
};

/* ---- Transcript Cleanup ---- */
TIQ.cleanTranscript = function(text) {
  if (!text || !text.trim()) return text;
  var t = text.trim();

  // Remove filler words and speech noise aggressively
  var fillers = [
    /\b(um+|uh+|erm+)\b\.?\s*/gi,
    /\b(like|you know|i mean|basically|actually|right|okay|ok|yeah|yep|yup|nah|uh-huh|mhm|hmm+)\b\.?\s*/gi,
    /\b(so)\b\s+/gi,
    /\b(well)\b\s+(?=i|she|he|they|we|the|a|an|it|that|this|there)\b/gi,
    /\b(kind of|sort of|pretty much)\b\s*/gi,
    /\b(a bunch of|bunch of)\b/gi,
    /\b(stuff|things|things like that)\b\s*/gi,
    /\b(and so|and then|then so|and like)\b\s*/gi,
    /\b(y'know|d'you|lemme|gonna|wanna|gotta)\b/gi,
  ];
  fillers.forEach(function(re) { t = t.replace(re, " "); });

  // Collapse multiple spaces
  t = t.replace(/\s{2,}/g, " ").trim();

  // Fix grammar
  t = TIQ.fixGrammar(t);

  // Normalize tone
  t = TIQ.normalizeTone(t);

  // Convert number words to digits ($25M, 3.78, 2027, etc.)
  t = TIQ.convertNumberWords(t);

  // Post-number cleanup: handle "plus" after abbreviated numbers
  t = t.replace(/(\d+[MBK])\s*plus\b/gi, "$1+");
  t = t.replace(/\s{2,}/g, " ").trim();

  // Capitalize "i" as standalone word
  t = t.replace(/\bi\b/g, "I");

  // Capitalize first letter
  t = t.charAt(0).toUpperCase() + t.slice(1);

  // Check for sentence punctuation BEFORE adding trailing period
  // Vosk output has zero punctuation; Google/speech APIs add periods
  var hasPunctuation = /[.!?]/.test(t);

  // Ensure ends with punctuation
  if (!/[.!?]\s*$/.test(t)) t += ".";

  // Split into bullet points
  var lines;

  if (hasPunctuation) {
    // Text has periods — split on them
    lines = t
      .replace(/\.\s+/g, ".\n")
      .replace(/(?:^|\.\s+)(she|he|they)\b/gi, function(m, p, off) {
        return (off === 0 ? "" : ".\n") + p.charAt(0).toUpperCase() + p.slice(1) + " ";
      })
      .replace(/\boverall\b/gi, "\nOverall")
      .split("\n")
      .map(function(l) { return l.trim(); })
      .filter(function(l) { return l.length > 2; });
  } else {
    // No punctuation (Vosk raw output) — split by word count at natural breaks
    var words = t.split(/\s+/);
    lines = [];
    var current = [];

    // Conjunctions and discourse markers that signal a new clause
    var breakWords = /^(and|but|so|also|then|however|moreover|additionally|furthermore|additionally|unfortunately|fortunately|meanwhile|afterwards|before|during|since|while|although|though|because|therefore|otherwise|instead|anyway|besides|indeed|actually|basically|honestly|overall)$/i;
    // Pronouns that likely start new sentences after a clause
    var pronounBreak = /^(he|she|they|we|i|you)$/i;
    var MAX_WORDS = 18;

    for (var i = 0; i < words.length; i++) {
      current.push(words[i]);
      var wc = current.length;

      // Check if we should break here
      var shouldBreak = false;
      var nextWord = (i + 1 < words.length) ? words[i + 1] : "";

      if (wc >= MAX_WORDS) {
        shouldBreak = true;
      } else if (wc >= 8 && breakWords.test(nextWord)) {
        shouldBreak = true;
      } else if (wc >= 6 && pronounBreak.test(nextWord) && i + 2 < words.length) {
        shouldBreak = true;
      }

      if (shouldBreak && i + 1 < words.length) {
        lines.push(current.join(" "));
        current = [];
      }
    }
    if (current.length > 0) lines.push(current.join(" "));
  }

  // Merge short fragments (under 4 words) back into previous line
  var merged = [];
  for (var i = 0; i < lines.length; i++) {
    var wc = lines[i].split(/\s+/).length;
    if (merged.length > 0 && wc <= 3) {
      merged[merged.length - 1] += " " + lines[i];
    } else {
      merged.push(lines[i]);
    }
  }
  lines = merged;

  // Final pass: ensure each line ends with punctuation and is capitalized
  lines = lines.map(function(line) {
    line = line.charAt(0).toUpperCase() + line.slice(1);
    line = line.replace(/\bi\b/g, "I");
    if (!/[.!?]\s*$/.test(line)) line += ".";
    return line;
  });

  // Deduplicate near-identical lines
  var seen = [];
  lines = lines.filter(function(line) {
    var lower = line.toLowerCase().replace(/[.!?]/g, "").replace(/[,]/g, "").trim();
    for (var i = 0; i < seen.length; i++) {
      if (seen[i] === lower) return false;
    }
    seen.push(lower);
    return true;
  });

  // Ensure each bullet starts with an action verb
  lines = TIQ.prependActionVerbs(lines);

  // Detect soft skills from transcript and add as tagged notes
  var rawText = lines.join(" ");
  var softSkills = TIQ.detectSoftSkills(rawText);
  var followUps = TIQ.detectFollowUp(rawText);
  var concerns = TIQ.detectConcerns(rawText);

  // Append recruiter intelligence tags
  var tags = [];
  if (softSkills.length > 0) tags.push("Strengths: " + softSkills.join(", "));
  if (followUps.length > 0) tags.push("Action Items: " + followUps.join(", "));
  if (concerns.length > 0) tags.push("Flag: " + concerns.join("; "));

  var bullets = lines.map(function(l) { return "• " + l; });
  if (tags.length > 0) bullets.push("");
  tags.forEach(function(tag) { bullets.push("→ " + tag); });

  var finalText = bullets.join("\n");
  console.log("[TalentIQ] cleanTranscript:", { inputLen: text.length, hasPunctuation: hasPunctuation, lineCount: lines.length, linesPreview: lines.map(function(l) { return l.substring(0, 60); }) });
  return finalText;
};

/* ---- TL;DR Generator ---- */
TIQ.generateTldr = function(candidate) {
  if (!candidate) return "";
  var parts = [];
  var fn = (candidate.firstName || "").trim();
  var ln = (candidate.lastName || "").trim();
  var fullName = [fn, ln].filter(Boolean).join(" ");
  var uni = (candidate.university || "").trim();
  var major = (candidate.major || "").trim();
  var grad = (candidate.graduationDate || "").trim();
  var gpa = (candidate.gpa || "").trim();
  var skills = candidate.skills || [];
  var role = (candidate.function || "").trim();

  // Line 1: Name + role interest
  if (fullName && role) parts.push(fullName + ", interested in " + role + " roles.");
  else if (fullName) parts.push("Met " + fullName + ".");

  // Line 2: Major + school + grad
  var edu = [];
  if (major) edu.push(major);
  if (uni) edu.push("at " + uni);
  if (grad) edu.push("(" + grad + ")");
  if (edu.length > 0) parts.push(edu.join(" ") + ".");

  // Line 3: Skills
  if (skills.length > 0) {
    parts.push("Skilled in " + skills.slice(0, 4).join(", ") + ".");
  }

  // Line 4: GPA if notable
  if (gpa && parseFloat(gpa) >= 3.5) parts.push("GPA: " + gpa + ".");

  return parts.join(" ");
};

/* ---- Proper Noun Correction ---- */
TIQ.correctProperNouns = function(text, candidate) {
  if (!text || !candidate) return text;
  var result = text;
  var fn = (candidate.firstName || "").trim();
  var ln = (candidate.lastName || "").trim();
  var uni = (candidate.university || "").trim();
  var major = (candidate.major || "").trim();
  var skills = candidate.skills || [];

  function lev(a, b) {
    var m = a.length, n = b.length, dp = [];
    for (var i = 0; i <= m; i++) dp[i] = [i];
    for (var j = 0; j <= n; j++) dp[0][j] = j;
    for (var i = 1; i <= m; i++)
      for (var j = 1; j <= n; j++)
        dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[m][n];
  }

  function multiWordReplace(phrases) {
    phrases.forEach(function(p) {
      var words = result.split(/\s+/);
      for (var i = 0; i < words.length - p.from.length + 1; i++) {
        var window = [];
        for (var j = 0; j < p.from.length && i + j < words.length; j++) {
          window.push(words[i + j].replace(/[.,!?;:'"]/g, "").toLowerCase());
        }
        if (window.join(" ") === p.from.toLowerCase()) {
          words.splice(i, p.from.length, p.to);
          result = words.join(" ");
          return;
        }
      }
    });
  }

  // 0) Multi-word phrase corrections FIRST (before word-level fixes)
  var majorPhrase = major ? [{ from: "computer science", to: "Computer Science" }] : [];
  multiWordReplace([
    // Company/industry
    { from: "fortune 500", to: "Fortune 500" },
    { from: "fortune five hundred", to: "Fortune 500" },
    { from: "fortune five", to: "Fortune 500" },
    { from: "five fortune 500", to: "Fortune 500" },
    { from: "five fortune five hundred", to: "Fortune 500" },
    { from: "five hundred companies", to: "500 companies" },
    { from: "five fortune", to: "Fortune 500" },
    // Acronyms
    { from: "a p eyes", to: "APIs" },
    { from: "a p i", to: "API" },
    { from: "a p is", to: "APIs" },
    // Tech fields
    { from: "machine learning", to: "Machine Learning" },
    { from: "data science", to: "Data Science" },
    { from: "computer engineering", to: "Computer Engineering" },
    { from: "information technology", to: "Information Technology" },
    { from: "software engineer", to: "Software Engineer" },
    { from: "full stack", to: "Full Stack" },
    { from: "full-stack", to: "Full Stack" },
    { from: "front end", to: "Front End" },
    { from: "front-end", to: "Front End" },
    { from: "back end", to: "Back End" },
    { from: "back-end", to: "Back End" },
    { from: "cloud native", to: "Cloud Native" },
    { from: "cloud-native", to: "Cloud Native" },
    { from: "data base", to: "Database" },
    { from: "web site", to: "Website" },
    { from: "micro services", to: "Microservices" },
    // Logistics / J.B. Hunt specific
    { from: "supply chain", to: "Supply Chain" },
    { from: "logistics technology", to: "Logistics Technology" },
    { from: "logistics tech", to: "Logistics Tech" },
    { from: "data systems", to: "Data Systems" },
    { from: "warehousing", to: "Warehousing" },
    // Conversational / recruiter phrasing
    { from: "capstone project", to: "Capstone Project" },
    { from: "senior project", to: "Senior Project" },
    { from: "side project", to: "Side Project" },
    { from: "team player", to: "Team Player" },
    { from: "problem solver", to: "Problem Solver" },
    { from: "good communicator", to: "Good Communicator" },
    { from: "strong communicator", to: "Strong Communicator" },
    { from: "good fit", to: "Good Fit" },
    { from: "really good fit", to: "Really Good Fit" },
    { from: "passionate about", to: "passionate about" },
    { from: "interested in", to: "interested in" },
    { from: "looking for", to: "looking for" },
    { from: "great attitude", to: "Great Attitude" },
    { from: "strong handshake", to: "Strong Handshake" },
    // Work status
    { from: "work authorization", to: "Work Authorization" },
    { from: "visa sponsorship", to: "Visa Sponsorship" },
    { from: "no sponsorship", to: "No Sponsorship Needed" },
    { from: "requires sponsorship", to: "Requires Sponsorship" },
    { from: "part time", to: "Part-Time" },
    { from: "full time", to: "Full-Time" },
    { from: "willing to relocate", to: "Willing to Relocate" },
    { from: "immediately available", to: "Immediately Available" },
    // Vosk phonetic manglings
    { from: "ware house", to: "Warehouse" },
    { from: "data bass", to: "Database" },
    { from: "jb hundred", to: "JB Hunt" },
    { from: "jb hunts", to: "JB Hunt" },
    { from: "j b hunt", to: "JB Hunt" },
    { from: "j b hundred", to: "JB Hunt" },
    { from: "jay bee hunt", to: "JB Hunt" },
    { from: "je bay hunt", to: "JB Hunt" },
    { from: "jb hun", to: "JB Hunt" },
    { from: "day plot", to: "Data" },
    { from: "day ta", to: "Data" },
    { from: "higher to", to: "hire for" },
    { from: "powerpoint stall", to: "PowerPoint, skilled" },
    { from: "power point", to: "PowerPoint" },
    { from: "you see a in", to: "UCA" },
    { from: "you you see a", to: "UCA" },
    { from: "goes to you you see a", to: "attends UCA" },
    { from: "features a really good", to: "features. Very good" },
    { from: "day plot and analysis", to: "data analysis" },
    { from: "forecasting data in day plot and analysis", to: "forecasting and data analysis" },
    { from: "process improvement", to: "Process Improvement" },
    { from: "return offer", to: "return offer" },
    { from: "freshman did not", to: "freshman. Did not" },
    { from: "in the meantime", to: "in the meantime" },
    { from: "really good higher", to: "really good hire" },
    { from: "stall at microsoft", to: "skilled in Microsoft" },
    { from: "in majoring", to: "majoring" }
  ].concat(majorPhrase));

  var words = result.split(/\s+/);

  // 1) Single-word fuzzy match for first/last name
  for (var i = 0; i < words.length; i++) {
    var clean = words[i].replace(/[.,!?;:'"]/g, "").toLowerCase();
    if (fn && clean.length >= 2 && fn.length >= 2) {
      var thresh = fn.length <= 3 ? 1 : Math.floor(fn.length * 0.35);
      if (lev(clean, fn.toLowerCase()) <= thresh) words[i] = fn;
    }
    if (ln && clean.length >= 2 && ln.length >= 2) {
      var thresh2 = ln.length <= 3 ? 1 : Math.floor(ln.length * 0.35);
      if (lev(clean, ln.toLowerCase()) <= thresh2) words[i] = ln;
    }
  }

  // 2) Two-word window: catch split names (e.g. "me a" for "Mia")
  if (fn && fn.length >= 3) {
    var combined = fn.toLowerCase();
    for (var i = 0; i < words.length - 1; i++) {
      var c1 = words[i].replace(/[.,!?;:'"]/g, "").toLowerCase();
      var c2 = words[i+1].replace(/[.,!?;:'"]/g, "").toLowerCase();
      if (lev(c1 + c2, combined) <= Math.max(1, Math.floor(combined.length * 0.3))) {
        words[i] = fn;
        words.splice(i + 1, 1);
        break;
      }
    }
  }
  if (ln && ln.length >= 3) {
    var combinedLn = ln.toLowerCase();
    for (var i = 0; i < words.length - 1; i++) {
      var c1 = words[i].replace(/[.,!?;:'"]/g, "").toLowerCase();
      var c2 = words[i+1].replace(/[.,!?;:'"]/g, "").toLowerCase();
      if (lev(c1 + c2, combinedLn) <= Math.max(1, Math.floor(combinedLn.length * 0.3))) {
        words[i] = ln;
        words.splice(i + 1, 1);
        break;
      }
    }
  }

  result = words.join(" ");

  // 3) Capitalize university name
  if (uni) {
    var uniRegex = new RegExp(uni.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"), "gi");
    if (uniRegex.test(result)) result = result.replace(uniRegex, uni);
  }

  // 4) Single-word tech/skill capitalization
  var techMap = {
    "python": "Python", "react": "React", "javascript": "JavaScript",
    "java": "Java", "node": "Node", "angular": "Angular", "vue": "Vue",
    "typescript": "TypeScript", "html": "HTML", "css": "CSS",
    "sql": "SQL", "api": "API", "apis": "APIs", "aws": "AWS",
    "azure": "Azure", "gcp": "GCP", "docker": "Docker",
    "kubernetes": "Kubernetes", "c++": "C++", "c#": "C#",
    "ai": "AI", "git": "Git", "graphql": "GraphQL", "rest": "REST",
    "linux": "Linux", "swift": "Swift", "kotlin": "Kotlin",
    "rust": "Rust", "ruby": "Ruby", "php": "PHP",
    "sass": "SASS", "figma": "Figma", "mongodb": "MongoDB",
    "postgresql": "PostgreSQL", "mysql": "MySQL", "redis": "Redis",
    "flask": "Flask", "django": "Django", "spring": "Spring",
    "tailwind": "Tailwind", "nextjs": "Next.js", "next": "Next.js",
    "nodejs": "Node.js", "express": "Express",
    "postgresql": "PostgreSQL", "postgres": "PostgreSQL",
    "figma": "Figma", "sketch": "Sketch", "adobe": "Adobe",
    // Company names
    "walmart": "Walmart", "tyson": "Tyson", "fedex": "FedEx",
    "amazon": "Amazon", "google": "Google", "microsoft": "Microsoft",
    "apple": "Apple", "meta": "Meta", "tesla": "Tesla",
    "nvidia": "NVIDIA", "salesforce": "Salesforce", "oracle": "Oracle",
    "ibm": "IBM", "intel": "Intel", "cisco": "Cisco",
    "deloitte": "Deloitte", "accenture": "Accenture", "pwc": "PwC",
    "kpmg": "KPMG", "ey": "EY", "jpmorgan": "JPMorgan",
    "goldmansachs": "Goldman Sachs", "boeing": "Boeing",
    "lockheed": "Lockheed Martin", "raytheon": "Raytheon",
    "ge": "GE", "siemens": "Siemens", "honeywell": "Honeywell",
    "jbhunt": "J.B. Hunt", "jb hunt": "J.B. Hunt", "j.b. hunt": "J.B. Hunt"
  };
  words = result.split(/\s+/);
  for (var i = 0; i < words.length; i++) {
    var cw = words[i].replace(/[.,!?;:'"]/g, "").toLowerCase();
    if (techMap[cw]) words[i] = words[i].replace(new RegExp("^" + cw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), techMap[cw]);
  }
  result = words.join(" ");

  // 5) Common Vosk mishearings (single words)
  var mishearMap = {
    "profession": "proficient",
    "professian": "proficient",
    "majored": "majored",
    "capstone": "Capstone",
    "logistics": "Logistics",
    "transportation": "Transportation",
    "analytics": "Analytics",
    "forecasting": "Forecasting",
    "optimization": "Optimization",
    "infrastructure": "Infrastructure",
    "scalable": "Scalable",
    "pipeline": "Pipeline",
    "algorithm": "Algorithm",
    "deployed": "deployed",
    "deployment": "Deployment",
    "containers": "Containers",
    "microservices": "Microservices",
    "collaboration": "Collaboration",
    "stakeholders": "Stakeholders",
    "initiative": "Initiative",
    "proficient": "proficient",
    "profesion": "proficient",
    "passionate": "passionate",
    "commited": "committed",
    "leadership": "Leadership",
    "mentorship": "Mentorship",
    "certification": "Certification",
    "certified": "Certified",
    "internship": "Internship",
    "intern": "intern"
  };
  words = result.split(/\s+/);
  for (var i = 0; i < words.length; i++) {
    var cw = words[i].replace(/[.,!?;:'"]/g, "").toLowerCase();
    if (mishearMap[cw]) words[i] = words[i].replace(new RegExp("^" + cw, "i"), mishearMap[cw]);
  }
  result = words.join(" ");

  return result;
};

/* ---- Audio Recorder ---- */
TIQ.AudioRecorder = (function() {
  function AudioRecorder() {
    this.mediaRecorder = null;
    this.chunks = [];
    this.stream = null;
    this.state = "idle";
    this.startTime = 0;
    this.timerInterval = null;
    this.onStateChange = null;
    this.audioContext = null;
    this.pcmChunks = [];
    this.scriptNode = null;
    this.onAudioChunk = null;
    this.analyser = null;
  }

  AudioRecorder.prototype.start = function() {
    var self = this;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      TIQ.showToast("Audio recording not supported in this browser.");
      return Promise.reject(new Error("Not supported"));
    }
    return navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 16000
      }
    }).then(function(stream) {
      self.stream = stream;
      self.chunks = [];
      self.pcmChunks = [];
      self.mediaRecorder = new MediaRecorder(stream);
      self.mediaRecorder.ondataavailable = function(e) { if (e.data.size > 0) self.chunks.push(e.data); };
      self.mediaRecorder.start();

      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      try {
        self.audioContext = new AudioCtx({ sampleRate: 16000 });
      } catch (e) {
        self.audioContext = new AudioCtx();
      }
      var source = self.audioContext.createMediaStreamSource(stream);
      self.analyser = self.audioContext.createAnalyser();
      self.analyser.fftSize = 128;
      self.analyser.smoothingTimeConstant = 0.75;
      source.connect(self.analyser);
      self.scriptNode = self.audioContext.createScriptProcessor(4096, 1, 1);
      self.scriptNode.onaudioprocess = function(e) {
        var float32 = e.inputBuffer.getChannelData(0);
        var int16 = new Int16Array(float32.length);
        for (var i = 0; i < float32.length; i++) {
          var s = Math.max(-1, Math.min(1, float32[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        self.pcmChunks.push(int16);
        if (self.onAudioChunk) self.onAudioChunk(int16);
      };
      source.connect(self.scriptNode);
      self.scriptNode.connect(self.audioContext.destination);

      self.state = "recording";
      self.startTime = Date.now();
      if (self.onStateChange) self.onStateChange("recording");
    }).catch(function(err) {
      var msg = err && err.name === "NotAllowedError"
        ? "Microphone permission denied — allow mic access and try again."
        : "Microphone access denied.";
      TIQ.showToast(msg);
      return Promise.reject(err);
    });
  };

  AudioRecorder.prototype.stop = function() {
    var self = this;
    return new Promise(function(resolve) {
      if (!self.mediaRecorder || self.mediaRecorder.state === "inactive") {
        resolve(null);
        return;
      }
      self.mediaRecorder.onstop = function() {
        var blob = new Blob(self.chunks, { type: "audio/webm" });
        var duration = Math.round((Date.now() - self.startTime) / 1000);
        self.state = "idle";
        if (self.scriptNode) { self.scriptNode.disconnect(); self.scriptNode = null; }
        if (self.analyser) { try { self.analyser.disconnect(); } catch (e) {} self.analyser = null; }
        if (self.audioContext) { self.audioContext.close().catch(function(){}); self.audioContext = null; }
        if (self.stream) { self.stream.getTracks().forEach(function(t) { t.stop(); }); }
        if (self.onStateChange) self.onStateChange("idle");
        resolve({ blob: blob, duration: duration });
      };
      self.mediaRecorder.stop();
    });
  };

  AudioRecorder.prototype.cancel = function() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
      this.chunks = [];
    }
    if (this.scriptNode) { this.scriptNode.disconnect(); this.scriptNode = null; }
    if (this.analyser) { try { this.analyser.disconnect(); } catch (e) {} this.analyser = null; }
    if (this.audioContext) { this.audioContext.close().catch(function(){}); this.audioContext = null; }
    if (this.stream) { this.stream.getTracks().forEach(function(t) { t.stop(); }); }
    this.pcmChunks = [];
    this.state = "idle";
    if (this.onStateChange) this.onStateChange("idle");
  };

  AudioRecorder.prototype.getState = function() { return this.state; };
  AudioRecorder.prototype.getAnalyser = function() { return this.analyser; };
  AudioRecorder.prototype.getSampleRate = function() {
    return this.audioContext ? this.audioContext.sampleRate : 16000;
  };

  return AudioRecorder;
})();

/* ---- Live Transcription (Web Speech API) ---- */
TIQ.LiveTranscriber = (function() {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var _supported = !!SpeechRecognition;
  console.log("[TalentIQ] SpeechRecognition API:", _supported ? "available" : "NOT available (window.SpeechRecognition=" + !!window.SpeechRecognition + ", window.webkitSpeechRecognition=" + !!window.webkitSpeechRecognition + ")");

  function LiveTranscriber() {
    this.recognition = null;
    this.state = "idle";
    this.interimText = "";
    this.finalText = "";
    this.onInterim = null;
    this.onFinal = null;
    this.onError = null;
    this.onEnd = null;
  }

  LiveTranscriber.prototype.start = function() {
    if (!_supported) {
      console.warn("[TalentIQ] LiveTranscriber: speech recognition not supported in this browser");
      if (this.onError) this.onError("not_supported");
      return;
    }
    var self = this;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";

    this.recognition.onresult = function(e) {
      console.log("[TalentIQ] Speech result event, resultIndex:", e.resultIndex, "results.length:", e.results.length);
      var interim = "";
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          self.finalText += transcript + " ";
          console.log("[TalentIQ] Final transcript chunk:", transcript);
          if (self.onFinal) self.onFinal(self.finalText.trim());
        } else {
          interim += transcript;
        }
      }
      self.interimText = interim;
      if (self.onInterim) self.onInterim(interim);
    };

    this.recognition.onerror = function(e) {
      console.warn("[TalentIQ] Speech recognition error:", e.error, "(state:", self.state + ")");
      if (self.onError) self.onError(e.error);
    };

    this.recognition.onend = function() {
      console.log("[TalentIQ] Speech recognition ended. Final text:", JSON.stringify(self.finalText.trim()));
      self.state = "idle";
      if (self.onEnd) self.onEnd(self.finalText.trim());
    };

    this.state = "listening";
    this.interimText = "";
    this.finalText = "";
    try {
      console.log("[TalentIQ] Starting SpeechRecognition...");
      this.recognition.start();
    } catch (err) {
      console.error("[TalentIQ] Failed to start SpeechRecognition:", err);
      this.state = "idle";
      if (this.onError) this.onError("start_failed");
    }
  };

  LiveTranscriber.prototype.stop = function() {
    if (this.recognition && this.state === "listening") {
      this.recognition.stop();
    }
    var result = this.finalText.trim();
    console.log("[TalentIQ] LiveTranscriber.stop() returning:", JSON.stringify(result));
    return result;
  };

  LiveTranscriber.prototype.getState = function() { return this.state; };
  LiveTranscriber.isSupported = function() { return _supported; };

  return LiveTranscriber;
})();

/* ---- Vosk Live Streaming Transcriber ---- */
TIQ.VoskLiveTranscriber = (function() {
  function VoskLiveTranscriber() {
    this.recognizer = null;
    this.state = "idle";
    this.finalText = "";
    this.lastPartial = "";
    this.sampleRate = 16000;
    this.onInterim = null;
    this.onFinal = null;
    this.onError = null;
    this.onEnd = null;
  }

  VoskLiveTranscriber.prototype.start = function(sampleRate) {
    var self = this;
    if (!TIQ.OfflineTranscriber.isReady()) {
      console.warn("[TalentIQ] VoskLiveTranscriber: Vosk model not ready");
      if (this.onError) this.onError("model_not_ready");
      return;
    }

    var model = TIQ.OfflineTranscriber.getModel();
    if (!model) {
      if (this.onError) this.onError("no_model");
      return;
    }

    try {
      this.sampleRate = sampleRate || 16000;
      this.recognizer = new model.KaldiRecognizer(this.sampleRate);
      this.state = "listening";
      this.finalText = "";
      this.lastPartial = "";

      this.recognizer.on("result", function(msg) {
        var text = msg.result && msg.result.text ? msg.result.text : "";
        if (text) {
          self.finalText += (self.finalText ? " " : "") + text;
          self.lastPartial = "";
          console.log("[TalentIQ] VoskLive final chunk:", text);
          if (self.onFinal) self.onFinal(self.finalText);
        }
      });

      this.recognizer.on("partialresult", function(msg) {
        if (msg.result && msg.result.partial) {
          self.lastPartial = msg.result.partial;
          if (self.onInterim) self.onInterim(self.finalText + (self.finalText ? " " : "") + msg.result.partial);
        }
      });

      console.log("[TalentIQ] VoskLiveTranscriber started, sampleRate:", sampleRate || 16000);
    } catch (err) {
      console.error("[TalentIQ] Failed to create VoskLive recognizer:", err);
      this.state = "idle";
      if (this.onError) this.onError("create_failed");
    }
  };

  VoskLiveTranscriber.prototype.feedChunk = function(pcmInt16, sampleRate) {
    if (this.state !== "listening" || !this.recognizer) return;
    try {
      this.recognizer.acceptWaveform(pcmInt16, sampleRate || this.sampleRate || 16000);
    } catch (err) {
      console.warn("[TalentIQ] VoskLive feedChunk error:", err);
    }
  };

  VoskLiveTranscriber.prototype.stop = function() {
    var self = this;
    if (this.recognizer && (this.state === "listening" || this.state === "flushing")) {
      if (this.state === "listening") {
        this.state = "flushing";
        try { this.recognizer.finish(); } catch (e) {}
      }
      return new Promise(function(resolve) {
        var settled = false;
        var finishNow = function() {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          try { self.recognizer && self.recognizer.remove(); } catch (e) {}
          self.recognizer = null;
          self.state = "idle";
          var text = self.finalText || self.lastPartial || "";
          if (self.onEnd) self.onEnd(text);
          resolve(text);
        };
        var timer = setTimeout(finishNow, 800);
        var onResult = function() { setTimeout(finishNow, 80); };
        self.recognizer.on("result", onResult);
      });
    }
    this.state = "idle";
    var syncText = this.finalText || this.lastPartial || "";
    if (this.onEnd) this.onEnd(syncText);
    return Promise.resolve(syncText);
  };

  VoskLiveTranscriber.prototype.getState = function() { return this.state; };

  return VoskLiveTranscriber;
})();

/* ---- Offline Transcription (Vosk WASM) ---- */
TIQ.OfflineTranscriber = (function() {
  var _model = null;
  var _ready = false;
  var _loading = false;
  var _loadPromise = null;
  var _error = null;
  var MODEL_PATH = "vosk-model-small-en-us-0.15.tar.gz";

  function init() {
    if (_ready) return Promise.resolve(_model);
    if (_loadPromise) return _loadPromise;
    if (!window.Vosk) {
      _error = "vosk-browser not loaded — check CDN script";
      console.warn("[TalentIQ] Vosk library not available on window.Vosk");
      return Promise.reject(new Error(_error));
    }
    _loading = true;
    console.log("[TalentIQ] Initializing Vosk offline transcriber...");

    _loadPromise = Vosk.createModel(MODEL_PATH).then(function(model) {
      _model = model;
      _ready = true;
      _loading = false;
      _loadPromise = null;
      console.log("[TalentIQ] Vosk model loaded successfully");

      try {
        if (model && typeof model.on === "function") {
          model.on("load", function(msg) {
            console.log("[TalentIQ] Vosk model load event:", msg);
          });
          model.on("error", function(msg) {
            console.error("[TalentIQ] Vosk model error event:", msg);
          });
        }
      } catch (e) {
        console.warn("[TalentIQ] Vosk model event binding skipped:", e);
      }

      return model;
    }).catch(function(err) {
      _loading = false;
      _loadPromise = null;
      _error = err.message || String(err);
      console.error("[TalentIQ] Failed to load Vosk model:", err);
      return Promise.reject(err);
    });

    return _loadPromise;
  }

  function transcribe(blob) {
    if (!_ready || !_model) {
      return Promise.reject(new Error("Vosk model not loaded"));
    }
    console.log("[TalentIQ] Starting offline transcription, blob size:", blob.size);

    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtx.decodeAudioData(reader.result).then(function(audioBuffer) {
          console.log("[TalentIQ] Audio decoded, sampleRate:", audioBuffer.sampleRate, "channels:", audioBuffer.numberOfChannels, "duration:", audioBuffer.duration.toFixed(1) + "s");

          var recognizer = new _model.KaldiRecognizer(audioBuffer.sampleRate);
          var finalText = "";
          var lastPartial = "";

          recognizer.on("result", function(msg) {
            var text = msg.result && msg.result.text ? msg.result.text : "";
            if (text) {
              finalText += (finalText ? " " : "") + text;
              lastPartial = "";
              console.log("[TalentIQ] Vosk result:", text);
            }
          });

          recognizer.on("partialresult", function(msg) {
            if (msg.result && msg.result.partial) {
              lastPartial = msg.result.partial;
              console.log("[TalentIQ] Vosk partial:", msg.result.partial);
            }
          });

          recognizer.acceptWaveform(audioBuffer);

          var waitTime = Math.max(Math.ceil(audioBuffer.duration * 2000), 5000);
          console.log("[TalentIQ] Waiting", waitTime + "ms for Vosk results...");
          setTimeout(function() {
            try { recognizer.finish(); } catch(e) {}
            setTimeout(function() {
              var transcript = finalText || lastPartial || "";
              recognizer.remove();
              console.log("[TalentIQ] Offline transcription complete:", JSON.stringify(transcript));
              resolve(transcript);
            }, 500);
          }, waitTime);

        }).catch(function(err) {
          console.error("[TalentIQ] Audio decode error:", err);
          reject(err);
        });
      };
      reader.onerror = function() { reject(new Error("Failed to read audio blob")); };
      reader.readAsArrayBuffer(blob);
    });
  }

  return {
    init: init,
    transcribe: transcribe,
    isReady: function() { return _ready; },
    isLoading: function() { return _loading; },
    getError: function() { return _error; },
    getModel: function() { return _model; }
  };
})();

/* ============================================
   TalentIQ - Local Browser Engine
   ============================================ */
window.TIQ = window.TIQ || {};

TIQ.localEngine = (function() {
  var DB_NAME = "talentiq_local_engine";
  var STORE = "outbox";
  var dbPromise = null;

  function openDb() {
    if (dbPromise) return dbPromise;
    if (!window.indexedDB) return Promise.reject(new Error("IndexedDB unavailable"));
    dbPromise = new Promise(function(resolve, reject) {
      var request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = function(e) {
        if (!e.target.result.objectStoreNames.contains(STORE)) {
          e.target.result.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = function(e) { resolve(e.target.result); };
      request.onerror = function() { reject(request.error || new Error("Local database unavailable")); };
    });
    return dbPromise;
  }

  function tokens(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9@.+#/-]+/g, " ").trim().split(/\s+/).filter(Boolean);
  }

  function unique(values) {
    var seen = {};
    return values.filter(function(value) {
      var key = String(value).toLowerCase();
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function addField(result, field, value, source) {
    if (value == null || String(value).trim() === "") return;
    result.fields[field] = String(value).trim();
    result.sources.push({ field: field, source: source || "voice note" });
  }

  function parseText(text) {
    var source = String(text || "").replace(/\s+/g, " ").trim();
    var result = { fields: {}, sources: [], text: source };
    var email = source.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    var phone = source.match(/(?:\+?1[ .-]?)?(?:\(?\d{3}\)?[ .-]?)\d{3}[ .-]?\d{4}/);
    var gpa = source.match(/\b(?:gpa|grade point average)\s*(?:is|of|:)??\s*([0-4](?:\.\d{1,2})?)/i);
    var location = source.match(/(?:prefers?|preference is|wants to work in|open to)\s+([^.;]+)/i);
    var skills = [];
    var skillMatch = source.match(/(?:skills?|experienced in|experience with|knows?)\s+([^.;]+)/i);
    if (skillMatch) skills = unique(skillMatch[1].split(/,|\band\b|\//i).map(function(s) { return s.trim(); }));

    addField(result, "email", email && email[0], "voice note");
    addField(result, "phone", phone && phone[0], "voice note");
    addField(result, "gpa", gpa && gpa[1], "voice note");
    addField(result, "workLocations", location && location[1], "voice note");
    if (skills.length) addField(result, "skills", skills.join(", "), "voice note");
    return result;
  }

  function similarity(a, b) {
    var left = unique(tokens([a.firstName, a.lastName, a.email, a.phone, a.university, a.major, (a.skills || []).join(" ")].join(" ")));
    var right = unique(tokens([b.firstName, b.lastName, b.email, b.phone, b.university, b.major, (b.skills || []).join(" ")].join(" ")));
    if (!left.length || !right.length) return 0;
    var rightSet = {};
    right.forEach(function(token) { rightSet[token] = true; });
    var overlap = left.filter(function(token) { return rightSet[token]; }).length;
    return overlap / Math.max(left.length, right.length);
  }

  function queue(entry) {
    var record = Object.assign({ id: "local-" + Date.now() + "-" + Math.random().toString(36).slice(2), createdAt: TIQ.nowISO(), status: "pending" }, entry);
    return openDb().then(function(db) {
      return new Promise(function(resolve, reject) {
        var request = db.transaction(STORE, "readwrite").objectStore(STORE).put(record);
        request.onsuccess = function() { resolve(record); };
        request.onerror = function() { reject(request.error); };
      });
    }).catch(function() {
      var fallback = JSON.parse(localStorage.getItem("talentiq_local_outbox") || "[]");
      fallback.push(record);
      localStorage.setItem("talentiq_local_outbox", JSON.stringify(fallback));
      return record;
    });
  }

  function countPending() {
    return openDb().then(function(db) {
      return new Promise(function(resolve) {
        var request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
        request.onsuccess = function() { resolve((request.result || []).filter(function(x) { return x.status === "pending"; }).length); };
        request.onerror = function() { resolve(0); };
      });
    }).catch(function() { return JSON.parse(localStorage.getItem("talentiq_local_outbox") || "[]").length; });
  }

  function capabilities() {
    var speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    return {
      indexedDb: !!window.indexedDB,
      speechRecognition: !!speech,
      webAssembly: typeof WebAssembly !== "undefined",
      localModelAdapter: !!(window.ort || window.transformers || window.OpenVINO),
      online: navigator.onLine !== false
    };
  }

  function applyFields(candidate, parsed) {
    var fields = parsed && parsed.fields || {};
    Object.keys(fields).forEach(function(field) {
      if (field === "workLocations") candidate.workLocations = unique((candidate.workLocations || []).concat(fields[field].split(/,|;|\band\b/i).map(function(x) { return x.trim(); })));
      else if (field === "skills") candidate.skills = unique((candidate.skills || []).concat(fields[field].split(/,|;|\band\b/i).map(function(x) { return x.trim(); })));
      else if (!candidate[field]) candidate[field] = fields[field];
    });
    if (parsed.text && String(candidate.notes || "").indexOf(parsed.text) === -1) candidate.notes = [candidate.notes, parsed.text].filter(Boolean).join(" ");
    candidate.localExtraction = { fields: fields, sources: parsed.sources || [], extractedAt: TIQ.nowISO() };
    TIQ.addAuditEntry(candidate, "LOCAL_FIELDS_EXTRACTED", "Structured fields extracted in browser");
    TIQ.saveState();
  }

  function startVoice(onUpdate) {
    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return Promise.reject(new Error("This browser has no speech recognition. Type the note instead."));
    return new Promise(function(resolve, reject) {
      var recognition = new Recognition();
      var finalText = "";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = function(event) {
        var interim = "";
        for (var i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalText += event.results[i][0].transcript + " ";
          else interim += event.results[i][0].transcript;
        }
        if (onUpdate) onUpdate(finalText + interim, !interim);
      };
      recognition.onerror = function(event) { reject(new Error(event.error || "Speech recognition failed")); };
      recognition.onend = function() { resolve({ text: finalText.trim(), stop: function() {} }); };
      recognition.start();
    });
  }

  window.addEventListener("online", function() { countPending().then(function(count) { document.dispatchEvent(new CustomEvent("tiq:offline-count", { detail: count })); }); });
  window.addEventListener("offline", function() { document.dispatchEvent(new CustomEvent("tiq:offline-count", { detail: null })); });

  return {
    parseText: parseText,
    applyFields: applyFields,
    queue: queue,
    countPending: countPending,
    capabilities: capabilities,
    similarity: similarity,
    findDuplicates: function(candidate, candidates) { return (candidates || []).filter(function(other) { return other.id !== candidate.id && similarity(candidate, other) >= 0.55; }).map(function(other) { return { candidate: other, score: similarity(candidate, other) }; }); },
    startVoice: startVoice
  };
})();
/* TalentIQ — Voice isolation + speaker-attributed booth transcript → card AI. */
window.TIQ = window.TIQ || {};
TIQ.voiceIsolation = (function() {
  function clean(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function splitTurns(transcript) {
    var text = String(transcript || '').trim();
    if (!text) return [];
    var labeled = [];
    var re = /(?:^|\n)\s*(?:\[)?([A-Z][A-Za-z.'\-]+(?:\s+[A-Z][A-Za-z.'\-]+){0,2})(?:\])?\s*:\s*/g;
    var parts = text.split(re);
    if (parts.length >= 3) {
      for (var i = 1; i + 1 < parts.length; i += 2) {
        labeled.push({ speaker: clean(parts[i]), text: clean(parts[i + 1]) });
      }
      if (labeled.length) return labeled.filter(function(t) { return t.text; });
    }
    return text.split(/(?<=[.!?])\s+/).map(function(line) {
      return { speaker: '', text: clean(line) };
    }).filter(function(t) { return t.text.length > 12; });
  }

  function resolveSpeaker(name, people, candidate) {
    var want = clean(name).toLowerCase();
    if (!want) return null;
    var pool = (people || []).slice();
    if (candidate) {
      pool = pool.concat([{
        name: [candidate.firstName, candidate.lastName].filter(Boolean).join(' '),
        role: 'candidate',
        refId: candidate.id
      }]);
    }
    (TIQ.RECRUITERS || []).forEach(function(r) {
      pool.push({ name: r.name, role: 'recruiter', refId: r.id });
    });
    for (var i = 0; i < pool.length; i++) {
      var p = pool[i];
      var n = clean(p && p.name).toLowerCase();
      if (!n) continue;
      if (n === want || n.indexOf(want) === 0 || want.indexOf(n) === 0) return p;
    }
    return { name: clean(name), role: 'custom', refId: '' };
  }

  function isolate(candidate, transcript, people) {
    var turns = splitTurns(transcript);
    var named = people && people.length ? people : (candidate && candidate.scenePeople) || [];
    var isolated = turns.map(function(turn, idx) {
      var who = turn.speaker
        ? resolveSpeaker(turn.speaker, named, candidate)
        : (named[idx % Math.max(named.length, 1)] || null);
      return {
        speaker: (who && who.name) || turn.speaker || 'Unidentified speaker',
        role: (who && who.role) || 'unknown',
        refId: (who && who.refId) || '',
        text: turn.text
      };
    }).filter(function(t) { return t.text; });
    return isolated;
  }

  function applyToCandidate(candidate, transcript, options) {
    options = options || {};
    if (!candidate) return { turns: [], points: [] };
    var people = options.people || candidate.scenePeople || [];
    var voiceOnly = !!options.voiceOnly;
    var turns = isolate(candidate, transcript, people);
    candidate.voiceIsolation = {
      voiceOnly: voiceOnly,
      updatedAt: TIQ.nowISO ? TIQ.nowISO() : new Date().toISOString(),
      turns: turns
    };

    var points = turns.filter(function(t) {
      return t.text.length >= 18;
    }).slice(0, 6).map(function(t) {
      return {
        text: t.text.slice(0, 180),
        evidenceText: t.text,
        source: 'conversation',
        facet: voiceOnly ? 'Voice-only booth note' : 'Isolated speaker turn',
        contextLabel: t.speaker,
        contextDetail: t.role === 'recruiter' ? 'Recruiter' : t.role === 'candidate' ? 'Candidate' : 'Participant',
        verification: 'Unverified transcript · speaker tagged in booth',
        speaker: t.speaker,
        role: t.role
      };
    });

    candidate.accomplishments = (candidate.accomplishments || []).filter(function(a) {
      return !(a && a.source === 'conversation' && a.facet && /Isolated speaker|Voice-only booth/i.test(a.facet));
    }).concat(points);

    if (turns.length) {
      var labeled = turns.map(function(t) { return t.speaker + ': ' + t.text; }).join('\n');
      var stamp = voiceOnly
        ? 'Voice-only transcript (camera off; speakers tagged):'
        : 'Isolated booth transcript (speakers tagged):';
      candidate.notes = (candidate.notes ? candidate.notes + '\n\n' : '') + stamp + '\n' + labeled;
    }

    if (TIQ.ai && TIQ.ai.hydrateTranscript) TIQ.ai.hydrateTranscript(candidate, transcript);
    if (TIQ.ai && TIQ.ai.updateCandidateSummary) TIQ.ai.updateCandidateSummary(candidate);
    if (TIQ.saveState) TIQ.saveState();
    return { turns: turns, points: points, voiceOnly: voiceOnly };
  }

  return {
    splitTurns: splitTurns,
    isolate: isolate,
    applyToCandidate: applyToCandidate,
    isVoiceOnly: function(candidate) {
      return !!(candidate && candidate.voiceIsolation && candidate.voiceIsolation.voiceOnly);
    }
  };
})();

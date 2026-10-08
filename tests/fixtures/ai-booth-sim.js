/**
 * AI booth simulation: avatars, scripted multi-speaker voices, and expected card points.
 * Used by automated E2E tests — no real microphone required.
 */
(function(root) {
  var avatars = [
    {
      id: 'avatar-candidate',
      name: 'Avery Chen',
      role: 'candidate',
      color: '#FEDB00',
      initials: 'AC',
      voice: 'candidate-alto',
      lines: [
        'I built a logistics routing dashboard with Python and React for a campus operations project.',
        'We reduced average dispatch delay by about twenty percent across three warehouses.'
      ]
    },
    {
      id: 'avatar-recruiter',
      name: 'Taylor Morgan',
      role: 'recruiter',
      color: '#005DBA',
      initials: 'TM',
      voice: 'recruiter-baritone',
      lines: [
        'Tell me about a technical project you owned end to end.',
        'What would you want to learn on a transportation technology team?'
      ]
    },
    {
      id: 'avatar-guest',
      name: 'Jordan Patel',
      role: 'candidate',
      color: '#64748B',
      initials: 'JP',
      voice: 'guest-tenor',
      lines: [
        'I also led a Tableau forecasting notebook that tracked weekly freight volume.'
      ]
    }
  ];

  function buildTranscript(cast) {
    return cast.map(function(person) {
      return person.lines.map(function(line) {
        return person.name + ': ' + line;
      }).join('\n');
    }).join('\n');
  }

  function scenePeople(cast) {
    return cast.map(function(person, idx) {
      return {
        id: person.id,
        name: person.name,
        role: person.role,
        refId: person.role === 'recruiter' ? 'R1' : 'SIM-' + idx,
        xPct: 20 + idx * 28,
        yPct: 45,
        namedAt: '2026-10-08T12:00:00.000Z'
      };
    });
  }

  function expectedCardNeedles() {
    return [
      'logistics routing dashboard',
      'Python',
      'React',
      'dispatch delay',
      'Tableau forecasting'
    ];
  }

  root.TIQ_AI_BOOTH_SIM = {
    avatars: avatars,
    cast: avatars,
    buildTranscript: buildTranscript,
    scenePeople: scenePeople,
    expectedCardNeedles: expectedCardNeedles,
    voiceOnlyTranscript: function() {
      return buildTranscript([avatars[0], avatars[1]]);
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

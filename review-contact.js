/* Local, recruiter-reviewed outreach. No provider API or automatic sending. */
(function() {
  var C = TIQ.reviewContact = {};
  function parts(date,zone) {
    var out = {};
    new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date).forEach(function(p) { out[p.type]=p.value; });
    return out;
  }
  C.suggest = function(now,zone) {
    zone = zone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    var p=parts(now || new Date(),zone), day=new Date(Date.UTC(+p.year,+p.month-1,+p.day+1));
    while (day.getUTCDay() === 0 || day.getUTCDay() === 6) day.setUTCDate(day.getUTCDate()+1);
    return {date:day.toISOString().slice(0,10),time:'12:00',timezone:zone,duration:30};
  };
  C.prepare = function(c,now,zone) {
    if (c.outreachDraft) return c.outreachDraft;
    var recruiter=TIQ.CONFIG.recruiters.find(function(r) { return r.id === TIQ.state.activeRecruiterId; });
    var event=TIQ.eventInfo().name, name=[c.firstName,c.lastName].filter(Boolean).join(' ');
    c.outreachDraft=Object.assign(C.suggest(now,zone),{to:c.email || '',subject:'Interview invitation',title:'Interview' + (name ? ' with '+name : ''),body:'Hi' + (c.firstName ? ' '+c.firstName : '') + ',\n\nI am reaching out' + (event ? ' about recruiting for '+event : '') + '. I would like to invite you to an interview. Would the proposed time below work for you? Please let me know if another time would be better.\n\n' + (recruiter ? recruiter.name : ''),location:''});
    TIQ.saveState(); return c.outreachDraft;
  };
  C.safeLink = function(value) {
    var text=String(value || '').trim();
    return /^https?:\/\/[^\s/@]+(?:[/:?#][^\s]*)?$/i.test(text) && !/^https?:\/\/[^/?#]*@/i.test(text) && !/[<>"\u0000-\u001f]/.test(text) ? text : '';
  };
  function instant(d) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date || '')) throw new Error('Enter a valid date.');
    var day=new Date(d.date+'T00:00:00Z');
    if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0,10)!==d.date) throw new Error('Enter a valid date.');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.time || '')) throw new Error('Enter a valid time.');
    var naive=Date.parse(d.date+'T'+d.time+':00Z'), matches=[], offsets={};
    // Sample offsets on both sides of transitions, then verify wall-clock matches.
    [-48,-24,-12,0,12,24,48].forEach(function(hours) {
      var t=naive+hours*3600000, p;
      try { p=parts(new Date(t),d.timezone); } catch (_) { throw new Error('Enter a valid IANA timezone, such as America/Chicago.'); }
      offsets[Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute)-t]=true;
    });
    Object.keys(offsets).forEach(function(offset) { var t=naive-Number(offset), p=parts(new Date(t),d.timezone); if ([p.year,p.month,p.day].join('-')===d.date && p.hour+':'+p.minute===d.time) matches.push(t); });
    if (!matches.length) throw new Error('This time does not exist in that timezone. Choose another time.');
    if (matches.length>1) throw new Error('This time is ambiguous during a clock change. Choose another time.');
    return matches[0];
  }
  function validEmail(email) { if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email || '') || /[\r\n,;]/.test(email)) throw new Error('Enter one valid candidate email before preparing outreach.'); }
  C.calendar = function(c,d,now) {
    validEmail(d.to === undefined ? c.email : d.to);
    var start=instant(d), duration=Number(d.duration);
    if (!Number.isFinite(duration) || duration<5 || duration>480) throw new Error('Choose a duration between 5 and 480 minutes.');
    if (start <= (now || new Date()).getTime()) throw new Error('Choose a future interview time.');
    function stamp(t) { return new Date(t).toISOString().replace(/[-:]/g,'').replace('.000',''); }
    var values={action:'TEMPLATE',text:d.title || 'Interview',dates:stamp(start)+'/'+stamp(start+duration*60000),ctz:d.timezone,details:d.body || '',location:d.location || '',add:d.to === undefined ? c.email : d.to};
    return 'https://calendar.google.com/calendar/render?' + Object.keys(values).map(function(k) { return k+'='+encodeURIComponent(values[k]); }).join('&');
  };
  C.message = function(d) { return d.body + '\n\nProposed time: '+d.date+' at '+d.time+' ('+d.timezone+'), '+d.duration+' minutes. Availability not checked.' + (d.location ? '\nLocation: '+d.location : ''); };
  C.email = function(c,d) { C.calendar(c,d); if (/[\r\n]/.test(d.subject)) throw new Error('Use a single-line subject.'); return 'mailto:'+encodeURIComponent(d.to)+'?subject='+encodeURIComponent(d.subject)+'&body='+encodeURIComponent(C.message(d)); };
  C.record = function(c,kind,method) {
    if (kind !== 'prepared' && kind !== 'sent') throw new Error('Unknown contact action.');
    c.contactHistory=c.contactHistory || [];
    c.contactHistory.push({kind:kind,method:method,timestamp:TIQ.nowISO(),recruiterId:TIQ.state.activeRecruiterId,selfReported:kind==='sent',recipient:c.outreachDraft && c.outreachDraft.to || c.email || ''});
    TIQ.addAuditEntry(c,'CONTACT_'+kind.toUpperCase(),kind==='sent' ? 'Recruiter reports invitation sent; delivery and booking unverified' : 'Outreach prepared; sending unverified');
    TIQ.saveState();
  };
})();

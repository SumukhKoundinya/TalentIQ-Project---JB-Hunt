const { loadApp, assert } = require('./harness');

const parsed = {
  contact: { name: 'Sofia Rodriguez', firstName: 'Sofia', lastName: 'Rodriguez', email: 'sofia@u.edu', phone: '(555) 123-4567', graduationDate: 'May 2027' },
  education: [{ school: 'University of Tennessee', degree: 'BS', major: 'Data Science', year: '2027' }],
  gpa: '3.78',
  skills: ['Python', 'SQL'],
  experience: [], projects: [], certifications: [], rawText: ''
};

function main() {
  const TIQ = loadApp();

  const c = {};
  TIQ.ai.applyParsedData(c, parsed);

  assert(c.firstName === 'Sofia' && c.lastName === 'Rodriguez', 'backfills names');
  assert(c.email === 'sofia@u.edu', 'backfills email');
  assert(c.phone === '(555) 123-4567', 'backfills phone');
  assert(c.graduationDate === 'May 2027', 'backfills graduationDate');
  assert(c.university === 'University of Tennessee', 'backfills university');
  assert(c.major === 'Data Science', 'backfills major');
  assert(c.gpa === '3.78', 'backfills gpa');
  assert(Array.isArray(c.skills) && c.skills.length === 2, 'backfills skills');

  const existing = { firstName: 'Mia', gpa: '3.5' };
  TIQ.ai.applyParsedData(existing, parsed);
  assert(existing.firstName === 'Mia' && existing.gpa === '3.5', 'never overwrites set values');
  assert(existing.email === 'sofia@u.edu' && existing.university === 'University of Tennessee', 'backfills remaining empty fields');
}

main();
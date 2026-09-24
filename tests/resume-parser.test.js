const { loadApp, assert } = require('./harness');

const RESUME = `
Sofia Rodriguez
123 College Ave, Nashville, TN 37206
sofia.rodriguez@university.edu | (555) 123-4567

EDUCATION
University of Tennessee — BS Data Science
Expected graduation: May 2027
GPA: 3.78

SKILLS
Python, SQL, TensorFlow, Tableau, Pandas, R, Git

EXPERIENCE
Data Analyst Intern — Nashville Public Library, May 2025 – Aug 2025
Built Tableau dashboards tracking 4,000+ monthly visits.

PROJECTS
Supply Chain Dashboard — Led a team of 3 student analysts.
`;

function main() {
  const TIQ = loadApp();
  const parsed = TIQ.ai.extractResumeData(RESUME);
  const c = parsed.contact;

  assert(c.email === 'sofia.rodriguez@university.edu', 'extracts email');
  assert(c.phone === '(555) 123-4567', 'extracts phone');
  assert(c.name === 'Sofia Rodriguez', 'extracts full name');
  assert(c.firstName === 'Sofia' && c.lastName === 'Rodriguez', 'splits name');
  assert(c.graduationDate === 'May 2027', 'extracts expected graduation');
  assert(parsed.education[0] && parsed.education[0].school === 'University of Tennessee', 'extracts school');
  assert(parsed.gpa === '3.78', 'extracts gpa');
  assert(parsed.skills.includes('Python') && parsed.skills.includes('SQL'), 'extracts skills');
  assert(parsed.experience[0] && parsed.experience[0].title === 'Data Analyst Intern', 'extracts experience');

  const none = TIQ.ai._extractContact('No contact info in this document at all.');
  assert(none.email === '' && none.phone === '' && none.name === '' && none.graduationDate === '', 'empty strings when nothing found');
}

main();
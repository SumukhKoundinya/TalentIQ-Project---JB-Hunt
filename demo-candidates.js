/* Main-site fictional recruiting dataset. The approved replacement runs once. */
(function() {
  var samples = [
    {id:'ops',name:'Morgan Ellis',role:'Transportation Operations',school:'University of Arkansas',major:'Supply Chain Management',gpa:'3.62',locations:['Lowell, AR'],authorization:'Authorized to work in the U.S.',resume:`Morgan Ellis
morgan.ellis@example.com | (202) 555-0101 | Fayetteville, AR
EDUCATION
University of Arkansas
Bachelor of Science in Supply Chain Management
Expected Graduation: May 2027
GPA: 3.62
EXPERIENCE
Operations Intern | Ozark Freight Services
May 2026 - August 2026
• Managed appointment updates for 24 daily shipments with dispatch and warehouse teams.
• Reduced missing delivery-status entries by 18% using an Excel exception tracker.
PROJECTS
Dock Appointment Planner | Excel, Power BI
• Built an Excel and Power BI dock appointment planner covering 8 loading docks.
• Reduced scheduling conflicts by 15% in a classroom simulation.
LEADERSHIP
Logistics Club President
University of Arkansas
• Organized 4 employer panels attended by 90 students.
CERTIFICATIONS
Microsoft Office Specialist
SKILLS
Excel, Power BI, Logistics, Load Planning, Process Improvement
FICTIONAL DEMO: all people, employers, accomplishments, and metrics in this resume are invented.`},
    {id:'analytics',name:'Taylor Bennett',role:'Transportation Analytics',school:'University of Memphis',major:'Data Science',gpa:'3.78',locations:['Memphis, TN','Lowell, AR'],authorization:'',resume:`Taylor Bennett
taylor.bennett@example.com | (202) 555-0102 | Memphis, TN
EDUCATION
University of Memphis
Bachelor of Science in Data Science
Expected Graduation: May 2027
GPA: 3.78
EXPERIENCE
Data Analyst Intern | Delta Distribution Group
May 2026 - August 2026
• Developed a SQL and Python report covering 120 delivery routes.
• Reduced weekly reporting time by 6 hours through automated data validation.
PROJECTS
Delivery Reliability Dashboard | Python, SQL, Power BI
• Built a delivery reliability dashboard tracking on-time delivery and dwell time across 12 facilities.
• Won the Campus Applied Analytics Showcase (2026) for the dashboard presentation.
LEADERSHIP
Analytics Club Treasurer
University of Memphis
• Managed a $4,800 student organization budget and published monthly expense reports.
CERTIFICATIONS
Microsoft Certified: Power BI Data Analyst Associate
SKILLS
Python, SQL, Power BI, Excel, Statistics, Forecasting, Data Visualization
FICTIONAL DEMO: all people, employers, accomplishments, and metrics in this resume are invented.`},
    {id:'engineering',name:'Avery Lawson',role:'Industrial Engineering',school:'Missouri University of Science and Technology',major:'Industrial Engineering',gpa:'3.54',locations:['St. Louis, MO'],authorization:'Authorized to work in the U.S.',resume:`Avery Lawson
avery.lawson@example.com | (202) 555-0103 | Rolla, MO
EDUCATION
Missouri University of Science and Technology
Bachelor of Science in Industrial Engineering
Expected Graduation: December 2027
GPA: 3.54
EXPERIENCE
Industrial Engineering Intern | Gateway Warehouse Systems
May 2026 - August 2026
• Conducted time studies of 6 packing stations and documented 3 process bottlenecks.
• Reduced average walking distance by 11% in a pilot warehouse layout.
PROJECTS
Warehouse Capacity Model | Excel, Python
• Developed an Excel and Python warehouse capacity model covering 3 zones.
• Compared staffing scenarios against 4 weeks of simulated order-volume data.
LEADERSHIP
Engineering Project Team Lead
Missouri University of Science and Technology
• Led 5 students through prototype testing and a final design review.
CERTIFICATIONS
Six Sigma Green Belt
SKILLS
Excel, Python, Process Mapping, Lean, Six Sigma, Process Improvement
FICTIONAL DEMO: all people, employers, accomplishments, and metrics in this resume are invented.`},
    {id:'software',name:'Casey Reed',role:'Logistics Software Engineering',school:'Middle Tennessee State University',major:'Computer Science',gpa:'3.71',locations:['Nashville, TN','Lowell, AR'],authorization:'Authorized to work in the U.S.',resume:`Casey Reed
casey.reed@example.com | (202) 555-0104 | Murfreesboro, TN
EDUCATION
Middle Tennessee State University
Bachelor of Science in Computer Science
Expected Graduation: May 2027
GPA: 3.71
EXPERIENCE
Software Engineer Intern | Cumberland Logistics Software
May 2026 - August 2026
• Implemented REST APIs for a shipment-status service using Java and SQL.
• Added 42 automated tests covering status updates and invalid shipment identifiers.
PROJECTS
Shipment Exception Console | React, Java, SQL
• Developed a React shipment exception console tracking 250 simulated shipments.
• Reduced duplicate alerts by 30% in integration testing.
LEADERSHIP
Programming Club President
Middle Tennessee State University
• Supported 12 students during weekly programming labs.
CERTIFICATIONS
AWS Certified Cloud Practitioner
SKILLS
Java, SQL, React, JavaScript, APIs, Git, AWS, Testing
FICTIONAL DEMO: all people, employers, accomplishments, and metrics in this resume are invented.`},
    {id:'fleet',name:'Riley Carter',role:'Fleet Maintenance Engineering',school:'Arkansas State University',major:'Mechanical Engineering',gpa:'3.43',locations:['Jonesboro, AR'],authorization:'Authorized to work in the U.S.',resume:`Riley Carter
riley.carter@example.com | (202) 555-0105 | Jonesboro, AR
EDUCATION
Arkansas State University
Bachelor of Science in Mechanical Engineering
Expected Graduation: December 2027
GPA: 3.43
EXPERIENCE
Mechanical Engineering Intern | Ridgeway Fleet Workshop
May 2026 - August 2026
• Analyzed preventive-maintenance records for 45 fleet vehicles using Excel.
• Created inspection checklists covering 9 recurring maintenance issues.
PROJECTS
Fleet Service Interval Study | Excel, Python
• Built a Python model comparing service intervals across 3 vehicle-use scenarios.
• Identified 7 potential maintenance conflicts in a simulated scheduling dataset.
LEADERSHIP
Vehicle Design Team Captain
Arkansas State University
• Coordinated prototype assembly and testing with 6 student team members.
CERTIFICATIONS
Six Sigma Yellow Belt
SKILLS
Excel, Python, CAD, Data Analysis, Preventive Maintenance, Process Improvement
FICTIONAL DEMO: all people, employers, accomplishments, and metrics in this resume are invented.`},
    {id:'accounts',name:'Alex Monroe',role:'Customer Account Management',school:'University of Central Arkansas',major:'Business Administration',gpa:'3.58',locations:['Little Rock, AR'],authorization:'',resume:`Alex Monroe
alex.monroe@example.com | (202) 555-0106 | Conway, AR
EDUCATION
University of Central Arkansas
Bachelor of Business Administration in Business Administration
Expected Graduation: May 2027
GPA: 3.58
EXPERIENCE
Customer Operations Intern | River Valley Shipping Partners
May 2026 - August 2026
• Maintained shipment updates for 18 business accounts and documented customer requests.
• Reduced unresolved request backlog by 20% using an Excel follow-up tracker.
PROJECTS
Customer Service Handoff Guide | Excel
• Created a handoff guide covering 10 common shipping inquiries and escalation steps.
• Tested the guide with 5 classmates in a customer-service simulation.
LEADERSHIP
Business Club President
University of Central Arkansas
• Organized 3 networking events for 75 student attendees.
CERTIFICATIONS
Microsoft Office Specialist
SKILLS
Excel, Customer Service, Communication, Logistics, Process Mapping
FICTIONAL DEMO: all people, employers, accomplishments, and metrics in this resume are invented.`},
    {id:'early-career',name:'Jamie Parker',role:'Operations Internship',school:'Tennessee State University',major:'Business Administration',gpa:'',locations:[],authorization:'',resume:`Jamie Parker
jamie.parker@example.com | (202) 555-0107 | Nashville, TN
EDUCATION
Tennessee State University
Bachelor of Business Administration in Business Administration
Expected Graduation: May 2028
EXPERIENCE
Library Assistant | Campus Library
September 2025 - Present
• Organized incoming materials and maintained an Excel inventory of 300 reference items.
PROJECTS
Inventory Reorder Worksheet | Excel
• Built an Excel worksheet calculating reorder points for a simulated campus bookstore.
SKILLS
Excel, Communication, Inventory Management
FICTIONAL DEMO: all people, employers, accomplishments, and metrics in this resume are invented.`}
  ];
  var resetKey='talentiq_candidate_dataset';
  var datasetVersion='jbh-fictional-main-1';
  var needsReset=localStorage.getItem(resetKey)!==datasetVersion;
  if (needsReset) {
    /* User explicitly authorized removal of all previous TalentIQ app data.
       Never clear unrelated website storage or downloaded files. */
    [localStorage, typeof sessionStorage==='undefined' ? null : sessionStorage].forEach(function(store) {
      if (!store) return;
      var keys=[];
      for (var i=0;i<store.length;i++) if (/^talentiq/i.test(store.key(i) || '')) keys.push(store.key(i));
      keys.forEach(function(key) { store.removeItem(key); });
    });
  }
  TIQ.CONFIG.seedCandidates = [];
  var preparation;
  TIQ.prepareFictionalDemo = function() {
    if (preparation) return preparation;
    preparation=(needsReset ? TIQ.AudioDB.deleteAll() : Promise.resolve()).then(function() {
    if (needsReset) {
      TIQ.state.candidates = samples.map(function(s) {
        var names = s.name.split(' ');
        var c = TIQ.intake.buildCandidate({firstName:names[0],lastName:names.slice(1).join(' '),university:s.school,major:s.major,function:s.role});
        c.id='JBH-DEMO-'+s.id; c.isFictionalDemo=true;
        c.parsedResume=TIQ.ai.extractResumeData(s.resume);
        /* These are authored fixtures, not user uploads. Preserve their explicit
           lists and role headings when the general parser returns broad matches. */
        c.parsedResume.skills=s.resume.split('SKILLS\n')[1].split('\n')[0].split(',').map(function(v) { return v.trim(); });
        var credentials=(s.resume.match(/CERTIFICATIONS\n([\s\S]*?)\nSKILLS/) || [])[1];
        c.parsedResume.certifications=credentials ? credentials.split('\n') : [];
        var roleLine=s.resume.split('EXPERIENCE\n')[1].split('\n')[0].split('|');
        if (c.parsedResume.experience[0]) {
          c.parsedResume.experience[0].title=roleLine[0].trim();
          c.parsedResume.experience[0].company=(roleLine[1] || '').trim();
        }
        TIQ.ai.applyParsedData(c,c.parsedResume,{refresh:true});
        c.workLocations=s.locations.slice();c.workAuthorization=s.authorization;
        c.notes='FICTIONAL DEMO — not a real applicant. Interested in '+s.role+'.';
        c.areasDiscussed=[s.role];c.resumeUpload={name:s.id+'.pdf',parsedAt:new Date().toISOString(),sourceUrl:'demo-resumes/'+s.id+'.pdf'};
        c.summary=TIQ.ai.generateSummary(c).summary;c.traceability=TIQ.ai.generateSummary(c).traceability;
        c.accomplishments=TIQ.generateAccomplishments(c);
        return c;
      });
    }
    TIQ.state.candidates.forEach(function(c) {
      var fixtureName=String(c.id || '').replace('JBH-DEMO-','')+'.pdf';
      if (c.isFictionalDemo && c.resumeUpload && typeof c.resumeUpload==='object' && c.resumeUpload.name===fixtureName) c.resumeUpload.sourceUrl='demo-resumes/'+fixtureName;
    });
    TIQ.state.event.name='Fictional J.B. Hunt recruiting demo';
    if (needsReset) {
      TIQ.saveState();
      localStorage.setItem(resetKey,datasetVersion);
    }
    });
    return preparation;
  };
})();

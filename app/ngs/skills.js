/* NGS Skills & Training Finder - listings data
   Researched and checked: 16 Nov 2026 (SMR Digital).
   Every listing is a real course, programme or job-with-training. No directory or
   "sign up and we'll send you courses" sites are listed; where a directory was found,
   its real listings were pulled out and checked at the provider's own site.

   Field guide
   - cost: "free" | "funded" (free if you meet the rules) | "paid" | "earn" (you are paid while you train)
   - outcome: "job" (job on completion / you're hired first) | "interview" (guaranteed interview)
              | "support" (job-search support) | "demand" (no promise, but strong demand) | "business"
   - mode: "in-person" | "online" | "blended"
   - reach: "luton" | "nearby" (Beds/Herts, under ~45 min) | "online" | "uk" (far; only shown when no
            decent local option exists in the same sector, or when the user asks for far options)
   - live: "running" (dates in 2026/27 seen) | "rolling" (recruits all year) | "intake" (regular intake,
           next date to confirm) | "ask" (provider confirmed active in 2026, dates on request)
   - residency: who can apply by where they live ("luton", "cbeds", "bedford", "england", "uk")
*/
window.NGS_SKILLS = {
  checked: "16 November 2026",
  listings: [

  /* ---------------- LUTON: council and adult learning ---------------- */
  {
    id: "lal-passport",
    title: "Passport to Employment workshops",
    provider: "Luton Adult Learning (Luton Council)",
    sector: "starting-out",
    summary: "Free weekly workshops to work out your next step, build a strong CV, prepare for interviews and get your confidence back. Some longer courses such as ICT run alongside.",
    cost: "free", price: "Free",
    qual: "Passport to Employment certificate",
    accreditation: "Council adult learning service, graded Good by Ofsted (April 2023)",
    mode: "blended", reach: "luton",
    place: "Arndale House, Luton Point, LU1 2LJ (some online)", lat: 51.8790, lng: -0.4170,
    ageMin: 19, residency: ["luton"],
    eligibility: ["Luton residents aged 19+", "Proof of UK residency needed"],
    outcome: "support", outcomeText: "Leads on to Luton Adult Learning courses, job fairs and employer days.",
    duration: "Short workshops, most run every week",
    live: "running",
    apply: "Email passport@lutonacl.ac.uk or call 01582 490033 to register your interest.",
    link: "https://www.lutonacl.ac.uk/find-a-course/passport-to-employment.html",
    tags: ["any", "office", "confidence"],
    checks: ["Council-run service", "Ofsted Good", "Running in autumn 2026 (newsletter and course pages)"]
  },
  {
    id: "lal-nhs",
    title: "Passport to NHS Careers",
    provider: "Luton Adult Learning with the Bedfordshire, Luton and Milton Keynes Health and Care Partnership",
    sector: "health",
    summary: "A short pre-employment course for people who want to work in the NHS, run with the local NHS partnership. Learners celebrated finishing in August 2026, and some have gone on to university.",
    cost: "free", price: "Free",
    qual: "Course certificate; route into NHS support roles",
    accreditation: "Council adult learning service with the local NHS partnership",
    mode: "in-person", reach: "luton",
    place: "Arndale House, Luton Point, LU1 2LJ", lat: 51.8790, lng: -0.4170,
    ageMin: 19, residency: ["luton"],
    eligibility: ["Luton residents aged 19+"],
    outcome: "support", outcomeText: "Run with the NHS so you learn what local NHS employers look for.",
    duration: "Short course",
    live: "intake",
    apply: "Ask Luton Adult Learning about the next group: 01582 490033 or info@lutonacl.ac.uk.",
    link: "https://www.lutonacl.ac.uk/news-events/passport-to-nhs-careers-celebration-event.html",
    tags: ["health", "care", "helping"],
    checks: ["Council and NHS partnership", "Group completed August 2026"]
  },
  {
    id: "lal-childcare",
    title: "Childcare and Early Years courses (Level 2 and 3)",
    provider: "Luton Adult Learning",
    sector: "childcare",
    summary: "Short free starter courses (for example Developing Children's Numeracy Skills, 13 Nov to 11 Dec 2026) and full early years qualifications. The Level 2 and 3 qualifications are 'full and relevant', so nurseries can count you in their staff numbers.",
    cost: "funded", price: "Free if you're eligible",
    qual: "Level 2 and Level 3 Early Years (full and relevant)",
    accreditation: "Ofsted-graded provider; DfE-approved early years qualifications",
    mode: "blended", reach: "luton",
    place: "Arndale House, LU1 2LJ, plus live Zoom classes for longer courses", lat: 51.8790, lng: -0.4170,
    ageMin: 19, residency: ["luton"],
    eligibility: ["Luton residents aged 19+", "Longer courses need an assessment and interview", "Level 3 may be free through Free Courses for Jobs"],
    outcome: "demand", outcomeText: "Nurseries need staff who count towards ratios, and these qualifications do.",
    demand: "Early years is one of the areas local Skills Bootcamps are built around, because employers are short of staff.",
    duration: "5–12 week starters; full qualifications 18–21 months part time",
    live: "running",
    apply: "Call 01582 490033 to book an assessment.",
    link: "https://www.lutonacl.ac.uk/find-a-course/childcare.html",
    tags: ["children", "helping", "education"],
    checks: ["Course dates for Nov–Dec 2026 seen", "Qualifications described as full and relevant"]
  },
  {
    id: "lal-schools",
    title: "Supporting in Schools (teaching assistant route)",
    provider: "Luton Adult Learning",
    sector: "education",
    summary: "Free starter courses for people who want to work in schools (12 weeks, 17 Sep to 10 Dec 2026; or 5 weeks, 4 Nov to 2 Dec 2026), then a longer qualification online through Free Courses for Jobs.",
    cost: "funded", price: "Free if you're eligible",
    qual: "Supporting Teaching and Learning (longer course, 18 months)",
    accreditation: "Ofsted-graded provider",
    mode: "blended", reach: "luton",
    place: "Arndale House, LU1 2LJ; longer course on live Zoom", lat: 51.8790, lng: -0.4170,
    ageMin: 19, residency: ["luton"],
    eligibility: ["Luton residents aged 19+", "Assessment and interview for the longer course"],
    outcome: "demand", outcomeText: "A recognised route into teaching assistant and school support jobs.",
    duration: "5 or 12 week starters; 18 month qualification",
    live: "running",
    apply: "Call 01582 490033.",
    link: "https://www.lutonacl.ac.uk/find-a-course/supporting-in-schools.html",
    tags: ["children", "education", "helping"],
    checks: ["2026 dates seen"]
  },
  {
    id: "lal-basics",
    title: "English, maths, ICT and ESOL",
    provider: "Luton Adult Learning",
    sector: "starting-out",
    summary: "Free courses in English, maths and computer skills, plus English for speakers of other languages. Many employers and courses ask for these first.",
    cost: "funded", price: "Free for most Luton residents",
    qual: "Functional Skills, ESOL awards and ICT qualifications",
    accreditation: "Ofsted Good; DfE funded",
    mode: "blended", reach: "luton",
    place: "Arndale House (LU1 2LJ) and Morton House, Kimpton Road", lat: 51.8790, lng: -0.4170,
    ageMin: 19, residency: ["luton"],
    eligibility: ["Luton residents aged 19+", "Proof of address and UK residency"],
    outcome: "support", outcomeText: "Unlocks most other courses and jobs on this list.",
    duration: "From 5 weeks",
    live: "running",
    apply: "Call 01582 490033 or use the contact page.",
    link: "https://www.lutonacl.ac.uk/find-a-course",
    tags: ["any", "office", "language"],
    checks: ["Council provider", "2026 ESOL dates seen"]
  },
  {
    id: "connect-to-work",
    title: "Connect to Work (supported employment)",
    provider: "Luton Council Connect to Work team",
    sector: "starting-out",
    summary: "A government-funded service for Luton residents with a health condition, disability or other barrier to work. You get a personal plan, links to local employers, help with CVs, interviews and training, and an adviser who stays with you.",
    cost: "free", price: "Free",
    qual: "No qualification; one-to-one support",
    accreditation: "UK Government funded, run by Luton Council (£4.4m, five-year programme)",
    mode: "in-person", reach: "luton",
    place: "Luton (appointments arranged after you register)",
    ageMin: 18, residency: ["luton"],
    eligibility: ["Aged 18+ and living in Luton", "Out of work 6+ months, or employed but at risk of losing your job", "Not on another DWP employment programme", "You don't need to be claiming benefits"],
    outcome: "support", outcomeText: "Mentoring continues after you start work.",
    duration: "Ongoing",
    live: "rolling",
    apply: "Fill in the expression of interest form on the council page, or email connecttowork@luton.gov.uk.",
    link: "https://www.luton.gov.uk/jobs-careers/connect-work",
    tags: ["any", "confidence"],
    checks: ["Council page checked Nov 2026", "Launched Dec 2025, five-year funding"]
  },
  {
    id: "youth-advice",
    title: "Youth Advice Service (16 to 18)",
    provider: "Luton Council",
    sector: "starting-out",
    summary: "For 16 to 18 year olds not in education, employment or training. Qualified careers advisers help you choose and apply for college, apprenticeships, training or work.",
    cost: "free", price: "Free",
    qual: "Careers guidance (Level 6/7 qualified advisers)",
    accreditation: "Statutory council service",
    mode: "in-person", reach: "luton",
    place: "Luton",
    ageMin: 16, ageMax: 18, residency: ["luton"],
    eligibility: ["Luton residents aged 16–18 not in education, employment or training"],
    outcome: "support", outcomeText: "Advisers help with applications and follow up after interviews.",
    duration: "Ongoing",
    live: "rolling",
    apply: "Contact through the council page.",
    link: "https://www.luton.gov.uk/schools-education/post-16-educational-career-pathways/youth-advice-service",
    tags: ["any", "young"],
    checks: ["Council page checked"]
  },
  {
    id: "link-bootcamp",
    title: "A Better Future in the UK (free career bootcamp)",
    provider: "Link Community Centre CIC, funded by the Luton Rising New Horizons Fund",
    sector: "starting-out",
    summary: "Four free face-to-face sessions over two weeks to work out your skills, write a stronger CV and set a clear career direction. Groups ran in July and September 2026.",
    cost: "free", price: "Free (up to 12 people per group)",
    qual: "No formal qualification",
    accreditation: "Funded by Luton Rising, managed by Bedfordshire and Luton Community Foundation",
    mode: "in-person", reach: "luton",
    place: "Link Community Centre, 2nd Floor, Hat Works, 47 Guildford Street, LU1 2NQ", lat: 51.8806, lng: -0.4196,
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england"],
    eligibility: ["Adults looking for work or better work"],
    outcome: "support", outcomeText: "CV and job-search support.",
    duration: "4 sessions over 2 weeks",
    live: "intake",
    apply: "Book on the centre's booking page; contact the centre to ask about the next group.",
    link: "https://book.plinth.org.uk/e/5rlMouRQcjG9BoJ7FOdL",
    tags: ["any", "confidence"],
    checks: ["Funder named", "2026 groups seen"]
  },

  /* ---------------- LUTON: colleges and youth programmes ---------------- */
  {
    id: "barnfield-16",
    title: "Full-time college courses for school leavers",
    provider: "Barnfield College",
    sector: "education",
    summary: "BTECs, T Levels, A Levels and apprenticeships for 16 to 18 year olds, free at this age. Open days for Year 11s run each spring and summer.",
    cost: "free", price: "Free for 16–18 year olds",
    qual: "BTEC, T Level, A Level",
    accreditation: "Further education college (Pearson, City & Guilds, DfE T Levels)",
    mode: "in-person", reach: "luton",
    place: "Barnfield College, New Bedford Road, LU2 7BF", lat: 51.8986, lng: -0.4236,
    ageMin: 16, ageMax: 18, residency: ["luton", "cbeds", "bedford", "england"],
    eligibility: ["School leavers aged 16–18"],
    outcome: "demand", outcomeText: "Leads to university, apprenticeships or work. Barnfield is the 2026 Luton Youth Awards headline sponsor.",
    duration: "1–2 years",
    live: "intake",
    apply: "Apply online for 2027 entry.",
    link: "https://www.barnfield.ac.uk/how-to-apply/",
    tags: ["young", "any"],
    checks: ["2026 open days held", "2027 applications open"]
  },
  {
    id: "barnfield-app",
    title: "Apprenticeships with Barnfield College",
    provider: "Barnfield College",
    sector: "trades",
    summary: "Get paid while you train in areas such as plumbing, motor vehicle and early years. Barnfield's apprentices won awards at the Luton Apprenticeship Awards in February 2026.",
    cost: "earn", price: "You're paid a wage",
    qual: "Apprenticeship standards (Level 2 upwards)",
    accreditation: "Government-registered apprenticeship provider",
    mode: "blended", reach: "luton",
    place: "Barnfield College, LU2 7BF, plus your workplace", lat: 51.8986, lng: -0.4236,
    ageMin: 16, residency: ["luton", "cbeds", "bedford", "england"],
    eligibility: ["Aged 16+", "Entry requirements vary by apprenticeship"],
    outcome: "job", outcomeText: "You're employed from day one.",
    duration: "1–4 years",
    live: "rolling",
    apply: "See current vacancies on the apprenticeships page.",
    link: "https://www.barnfield.ac.uk/courses/apprenticeships",
    tags: ["trades", "hands-on", "young"],
    checks: ["Active 2026 (awards, information evenings)"]
  },
  {
    id: "kings-team",
    title: "The King's Trust Team Programme (Luton)",
    provider: "The Bedford College Group with The King's Trust",
    sector: "starting-out",
    summary: "A 12-week full-time personal development course. You work in a team, take on a community project and a work placement, and earn a Level 1 qualification. It's free.",
    cost: "free", price: "Free",
    qual: "Level 1 qualification",
    accreditation: "The King's Trust, delivered by a further education college group",
    mode: "in-person", reach: "luton",
    place: "Luton (venue confirmed on enquiry)",
    ageMin: 16, ageMax: 25, residency: ["luton", "cbeds", "bedford", "england"],
    eligibility: ["Aged 16–25", "Not in full-time work or education"],
    outcome: "support", outcomeText: "Designed to move you into a job, education or training.",
    duration: "12 weeks full time",
    live: "intake",
    apply: "Apply on the course page.",
    link: "https://bedfordcollegegroup.ac.uk/courses/luton-the-kings-trust-team-programme-level-1-p152/",
    tags: ["young", "confidence", "any"],
    checks: ["Luton course page live", "College group expanded the programme in 2026"]
  },
  {
    id: "kings-enterprise",
    title: "The King's Trust Enterprise programme",
    provider: "The King's Trust",
    sector: "business",
    summary: "Free support to test a business idea, write a business plan and start trading, with mentoring. Runs face to face and online.",
    cost: "free", price: "Free",
    qual: "No formal qualification; business plan and mentor",
    accreditation: "National charity (formerly The Prince's Trust)",
    mode: "blended", reach: "online",
    place: "Online, plus regional sessions",
    ageMin: 18, ageMax: 30, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Aged 18–30", "Unemployed or working under 16 hours a week"],
    outcome: "business", outcomeText: "Can lead to start-up funding and a mentor.",
    duration: "4-day workshop, then ongoing support",
    live: "rolling",
    apply: "Start on The King's Trust website and book an information session.",
    link: "https://www.kingstrust.org.uk/",
    tags: ["business", "creative"],
    checks: ["National charity", "Programme running in 2026"]
  },
  {
    id: "ltfc-trust",
    title: "Luton Town FC Community Trust: education and employability",
    provider: "Luton Town FC Community Trust (charity 1123078)",
    sector: "sport",
    summary: "Employability and youth work sessions for 13 to 18 year olds who are out of education, employment or training, plus BTEC Sport study with football training for 16+ (with the Shared Learning Trust, North and South Luton centres).",
    cost: "free", price: "Free",
    qual: "BTEC Sport (16+ programme)",
    accreditation: "Registered charity; BTEC via partner schools",
    mode: "in-person", reach: "luton",
    place: "Kenilworth Road and partner centres, Luton", lat: 51.8842, lng: -0.4316,
    ageMin: 13, residency: ["luton", "cbeds", "bedford", "england"],
    eligibility: ["13–18 for employability sessions", "16+ for BTEC Sport"],
    outcome: "support", outcomeText: "The Trust also hosts community job fairs with the council and DWP.",
    duration: "Weekly sessions; BTEC is 2 years",
    live: "rolling",
    apply: "Contact the Community Trust through the club website.",
    link: "https://www.lutontown.co.uk/club/luton-town-community-trust/",
    tags: ["sport", "young"],
    checks: ["Registered charity", "Job fair and programmes in 2026"]
  },
  {
    id: "fcfj",
    title: "Free Courses for Jobs (free Level 3 for adults)",
    provider: "Government offer, delivered by local colleges and Luton Adult Learning",
    sector: "starting-out",
    summary: "The government pays for a first full Level 3 qualification (about A-level standard) from an approved list in areas employers need. If you're unemployed or earn under the threshold, you can qualify even if you already hold a Level 3.",
    cost: "funded", price: "Free if you're eligible",
    qual: "Level 3 qualifications on the approved list (plus some Level 2 construction and engineering)",
    accreditation: "Department for Education funding scheme",
    mode: "blended", reach: "luton",
    place: "Luton Adult Learning, Barnfield College and other approved providers", lat: 51.8790, lng: -0.4170,
    ageMin: 19, residency: ["luton", "cbeds", "bedford", "england"],
    eligibility: ["Aged 19+ in England", "No full Level 3 yet, or unemployed, or earning under the threshold"],
    outcome: "demand", outcomeText: "Courses are picked for sectors where employers need staff.",
    duration: "Varies by course",
    live: "running",
    apply: "Ask the provider which of their courses are on the Free Courses for Jobs list.",
    link: "https://www.gov.uk/guidance/qualification-funding-approval/free-courses-for-jobs",
    tags: ["any", "office", "care", "trades"],
    checks: ["GOV.UK guidance (2026 to 2027 list expanded)"]
  },

  /* ---------------- AVIATION (London Luton Airport) ---------------- */
  {
    id: "lla-apprentice",
    title: "London Luton Airport Apprenticeship Programme",
    provider: "London Luton Airport Operations Ltd",
    sector: "aviation",
    summary: "Paid apprenticeships at the airport for local people, for example Level 3 Business Administrator (rotating across departments), IT Support, HR and Mechanical Engineering (Level 3 Mechatronics). Half of the people the airport hired last year lived in LU1 to LU4.",
    cost: "earn", price: "You're paid a wage (airport is a Real Living Wage employer)",
    qual: "Level 3 apprenticeships (Business Administrator, HR Support, Mechatronics and more)",
    accreditation: "Government apprenticeship standards; airport is a Real Living Wage employer",
    mode: "in-person", reach: "luton",
    place: "Percival House, 134 Percival Way, LU2 9NU", lat: 51.8775, lng: -0.3725,
    ageMin: 18, residency: ["luton"],
    eligibility: ["Living in LU1, LU2, LU3 or LU4", "Aged 18+", "Not on another course"],
    outcome: "job", outcomeText: "You're employed by the airport from the start.",
    duration: "12–36 months",
    live: "intake",
    apply: "Watch the airport careers page; new roles go up through the year.",
    link: "https://www.london-luton.co.uk/aviation-security-officer",
    tags: ["aviation", "office", "tech", "trades"],
    checks: ["New cohort started Dec 2025", "Roles listed on the airport's own careers page in Nov 2026"]
  },
  {
    id: "avsec",
    title: "Aviation Security Officer (paid training at the airport)",
    provider: "London Luton Airport and contractors (for example Staffline with G4S)",
    sector: "security",
    summary: "Airport security officers are trained on the job. The airport runs a six-week paid training period (classroom and live operation), so you don't need to buy a course first. Contractor roles were advertised at £13.45 an hour for 42 hours a week in 2026.",
    cost: "earn", price: "Paid while you train",
    qual: "Aviation security training given by the employer",
    accreditation: "Required by aviation security rules; the employer delivers it",
    mode: "in-person", reach: "luton",
    place: "London Luton Airport, LU2 9LY", lat: 51.8747, lng: -0.3683,
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Fluent English", "Physically fit", "Must pass background and security checks"],
    outcome: "job", outcomeText: "You're hired first, then trained.",
    demand: "Recruited many times a year, with extra drives before summer.",
    duration: "About 6 weeks of training",
    live: "rolling",
    apply: "Apply through the airport careers page or the contractor's job adverts. Never pay anyone for an interview or checks.",
    link: "https://www.london-luton.co.uk/aviation-security-officer",
    tags: ["security", "aviation", "customer"],
    checks: ["Council-hosted adverts and contractor adverts in 2026", "Airport warns it never charges applicants"]
  },
  {
    id: "easyjet-crew",
    title: "Cabin crew at Luton (easyJet)",
    provider: "easyJet (head office and base at Luton Airport)",
    sector: "aviation",
    summary: "easyJet trains new cabin crew in about four weeks (safety, first aid, security, customer service). It planned to recruit nearly 1,000 cabin crew for 2026, has more than doubled its crew aged over 50, and runs 'Flight Paths' taster sessions for 18 to 24 year olds not in work or education.",
    cost: "earn", price: "Training provided; starting pay around £22,000 plus sector pay",
    qual: "Cabin crew attestation (required by the UK CAA)",
    accreditation: "UK CAA-regulated airline training",
    mode: "in-person", reach: "luton",
    place: "easyJet, Hangar 89, London Luton Airport, LU2 9PF", lat: 51.8776, lng: -0.3770,
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Aged 18+, no upper limit", "Height 157.5–190 cm", "Pass a UK CAA cabin crew medical", "Customer service experience helps"],
    outcome: "job", outcomeText: "Hired first, then trained.",
    duration: "About 4 weeks of training",
    live: "intake",
    apply: "Watch easyJet careers; recruitment for the 2027 season was expected to open soon after Nov 2026.",
    link: "https://careers.easyjet.com/",
    tags: ["aviation", "customer", "travel"],
    checks: ["2026 adverts with Luton training dates", "2027 recruitment drive reported"]
  },
  {
    id: "wizz-crew",
    title: "Cabin crew recruitment days at Luton (Wizz Air)",
    provider: "Wizz Air",
    sector: "aviation",
    summary: "Wizz Air holds walk-in recruitment days at the LLA Excellence Academy. Training is free and you're contracted and paid from day one of training.",
    cost: "earn", price: "Free training, paid from day 1",
    qual: "Cabin crew attestation",
    accreditation: "UK CAA-regulated airline training",
    mode: "in-person", reach: "luton",
    place: "LLA Excellence Academy, Percival House, 134 Percival Way, LU2 9NU", lat: 51.8775, lng: -0.3725,
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Aged 18+", "Check requirements on the event page"],
    outcome: "job", outcomeText: "Hired first, then trained.",
    duration: "Several weeks of training",
    live: "rolling",
    apply: "Register for a recruitment day on Wizz Air careers (they say they're always recruiting).",
    link: "https://careers.wizzair.com/",
    tags: ["aviation", "customer", "travel"],
    checks: ["Luton recruitment day March 2026", "Airline states it is always recruiting"]
  },
  {
    id: "jet2-crew",
    title: "Cabin crew at Luton (Jet2)",
    provider: "Jet2.com",
    sector: "aviation",
    summary: "Seasonal cabin crew at Luton Airport with no upfront fees for the training course. Pay including commission was advertised at about £32,000 pro rata for summer 2026.",
    cost: "earn", price: "No upfront training fees",
    qual: "Cabin crew attestation",
    accreditation: "UK CAA-regulated airline training",
    mode: "in-person", reach: "luton",
    place: "London Luton Airport, LU2 9LY", lat: 51.8747, lng: -0.3683,
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Aged 18+", "Seasonal contract"],
    outcome: "job", outcomeText: "Hired first, then trained.",
    duration: "Seasonal (summer)",
    live: "intake",
    apply: "Jet2 careers site, usually from autumn for the next summer.",
    link: "https://www.jet2careers.com/",
    tags: ["aviation", "customer", "travel"],
    checks: ["Summer 2026 Luton adverts seen"]
  },

  /* ---------------- SECURITY (SIA) ---------------- */
  {
    id: "sia-swap",
    title: "Free SIA security training through the Jobcentre (SWAP)",
    provider: "Jobcentre Plus Sector-based Work Academy Programme",
    sector: "security",
    summary: "If you're claiming benefits, a SWAP can pay for your SIA training, add a short work placement and end with a guaranteed interview for a real vacancy. SWAPs also run in care, logistics, hospitality and aviation. It's the cheapest way into security.",
    cost: "funded", price: "Free if you're on benefits",
    qual: "Depends on the SWAP (for example SIA Door Supervisor or Security Officer qualification)",
    accreditation: "DWP programme with approved training providers",
    mode: "in-person", reach: "luton",
    place: "Arranged through Luton Jobcentre",
    ageMin: 16, residency: ["luton", "cbeds", "bedford", "england"],
    eligibility: ["Aged 16+ and claiming benefits (most SWAPs are 18+)", "Ask your work coach which SWAPs are open"],
    outcome: "interview", outcomeText: "Guaranteed interview for a real job or apprenticeship.",
    duration: "Up to 6 weeks",
    live: "rolling",
    apply: "Ask your Jobcentre work coach for the SWAPs running in Luton now.",
    link: "https://www.gov.uk/government/publications/sector-based-work-academy-programme-employer-guide/sector-based-work-academies-employer-guide",
    tags: ["security", "care", "warehouse", "aviation", "customer"],
    checks: ["GOV.UK guidance", "Programme in use in 2026"]
  },
  {
    id: "sia-ds-paid",
    title: "SIA Door Supervisor course (paying yourself)",
    provider: "SIA-approved training centres in Luton town centre",
    sector: "security",
    summary: "The 6-day Level 2 Door Supervisor course is what you need to apply for an SIA licence. It covers door work, events, retail and static security. Courses run in central Luton, for example at 85–87 George Street. Budget for the course, an Emergency First Aid at Work certificate and the £204 SIA licence fee.",
    cost: "paid", price: "Course from about £199–£450, plus £204 SIA licence fee",
    priceFrom: 199,
    discounts: ["Free through a Jobcentre SWAP if you're on benefits", "Some centres bundle first aid in, which saves money", "Second licence at 50% off if eligible"],
    qual: "Level 2 Award for Door Supervisors in the Private Security Industry",
    accreditation: "Ofqual-regulated; must be from an SIA-approved awarding body (for example Highfield, Pearson, Qualsafe)",
    mode: "in-person", reach: "luton",
    place: "Luton town centre (for example 85–87 George Street, LU1 2AT)", lat: 51.8790, lng: -0.4180,
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Aged 18+", "Right to work in the UK", "Pass a criminal record check for the licence"],
    outcome: "demand", outcomeText: "The licence opens up door, event, retail and patrol work, often through security agencies.",
    demand: "Security agencies in and around Luton advertise all year.",
    duration: "6 days (54+ hours by law)",
    live: "running",
    apply: "Book with the training centre. Before you pay, check the qualification is from an SIA-approved awarding body and the course is at least 6 days.",
    link: "https://www.gov.uk/guidance/get-training-for-your-sia-licence",
    tags: ["security", "nightlife", "events"],
    checks: ["SIA fee £204 confirmed on GOV.UK (from 1 April 2026)", "Luton course dates in 2026 seen"]
  },

  /* ---------------- CARE AND NHS ---------------- */
  {
    id: "care-paid-training",
    title: "Care assistant jobs with paid training and free DBS",
    provider: "Registered care providers in Luton (for example Cera Care and Total Community Care)",
    sector: "care",
    summary: "Home care providers in Luton hire people with no experience and train them in paid time (Care Certificate), cover the DBS check and pay mileage. Adverts in 2026 showed £13.25 to £14 an hour.",
    cost: "earn", price: "Paid training, free DBS",
    qual: "Care Certificate (15 national standards), then Level 2/3 Adult Care",
    accreditation: "Employers registered with the Care Quality Commission (CQC)",
    mode: "in-person", reach: "luton",
    place: "Luton (home visits)",
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Aged 18+", "Driving licence helps for home care"],
    outcome: "job", outcomeText: "Hired first, then trained.",
    demand: "Adult social care is a national priority sector, with demand expected to keep growing.",
    duration: "Induction of 1–2 weeks",
    live: "rolling",
    apply: "Apply directly to the care provider. Check the provider on the CQC website before you start.",
    link: "https://www.cqc.org.uk/search/services",
    tags: ["care", "helping", "health"],
    checks: ["2026 Luton adverts", "Advice to check the CQC rating"]
  },
  {
    id: "nhs-csw",
    title: "Clinical Support Worker at Luton & Dunstable Hospital",
    provider: "Bedfordshire Hospitals NHS Foundation Trust",
    sector: "health",
    summary: "Band 3 support worker roles across wards. You get a two-week supernumerary period (shadowing, not counted as staff), a local induction, competency training, one-to-one support and then a structured development programme.",
    cost: "earn", price: "£24,937–£26,598 a year (Band 3)",
    qual: "On-the-job NHS training; route to Nursing Associate and nursing apprenticeships",
    accreditation: "NHS employer",
    mode: "in-person", reach: "luton",
    place: "Luton & Dunstable Hospital, Lewsey Road, LU4 0DZ", lat: 51.8987, lng: -0.4733,
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Communication with people from different backgrounds", "Basic digital skills", "Care experience (including caring for family) helps", "The trust says it can't sponsor visas for these roles"],
    outcome: "job", outcomeText: "In-person assessment centre at the hospital, then you're employed and trained.",
    duration: "2-week supernumerary start",
    live: "rolling",
    apply: "Search 'Clinical Support Worker Bedfordshire Hospitals' on NHS Jobs; adverts open several times a year.",
    link: "https://www.jobs.nhs.uk/",
    tags: ["health", "care", "helping"],
    checks: ["Repeated adverts 2024–2026 with the same training package"]
  },

  /* ---------------- CONSTRUCTION ---------------- */
  {
    id: "cscs-funded",
    title: "CSCS Green Labourer Card course (government funded)",
    provider: "Learning Curve Group",
    sector: "construction",
    summary: "A one-day construction pathway that includes the Level 1 Award in Health and Safety in a Construction Environment and a voucher for the CITB test. You need both to apply for a CSCS Green Card, which most building sites ask for.",
    cost: "funded", price: "Free if you're eligible",
    qual: "Level 1 Award in Health and Safety in a Construction Environment, plus CITB HS&E test voucher",
    accreditation: "Ofqual-regulated award; CITB test; Ofsted-inspected provider",
    mode: "in-person", reach: "nearby",
    place: "Venues across England (check for the nearest)",
    ageMin: 19, residency: ["luton", "cbeds", "bedford", "england"],
    eligibility: ["Government-funding rules (usually 19+, living in England, low income or unemployed)"],
    outcome: "demand", outcomeText: "The Green Card is the basic ticket for labouring work on site.",
    demand: "Skills England expects the 30 priority construction jobs to grow by 493,000 (26%) by 2035.",
    duration: "1 day",
    live: "running",
    apply: "Check eligibility and the nearest date on the course page.",
    link: "https://www.learningcurvegroup.co.uk/courses/construction-cscs",
    tags: ["construction", "hands-on", "outdoors"],
    checks: ["Provider page live 2026", "CITB test included"]
  },
  {
    id: "cscs-paid",
    title: "CSCS Green Labourer Card course (paying yourself)",
    provider: "Get Licensed (Luton venue)",
    sector: "construction",
    summary: "A one-day course in Luton for the Level 1 health and safety award, if you don't qualify for a funded place. You'll also need to book and pass the CITB Health, Safety and Environment test.",
    cost: "paid", price: "£125 (CITB test is booked separately)",
    priceFrom: 125,
    discounts: ["Free through a funded provider or a construction SWAP if you're eligible"],
    qual: "Level 1 Award in Health and Safety in a Construction Environment",
    accreditation: "Ofqual-regulated award",
    mode: "in-person", reach: "luton",
    place: "Luton",
    ageMin: 16, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Aged 16+", "Right to work in the UK"],
    outcome: "demand", outcomeText: "Labouring work through site contractors and agencies.",
    duration: "1 day",
    live: "running",
    apply: "Book on the provider's Luton page.",
    link: "https://www.get-licensed.co.uk/green-cscs-labourer-card-course-licence/luton-quakers",
    tags: ["construction", "hands-on", "outdoors"],
    checks: ["Price and Luton venue listed 2026"]
  },
  {
    id: "wihb",
    title: "Women into Home Building (site management placements)",
    provider: "Home Builders Federation, delivered by Pathways CTM",
    sector: "construction",
    summary: "A fully funded week of training and a work placement with a house builder, for women who want to become site managers. No construction experience needed. Over 50 women have had job offers after their placement. It won a 2026 career development award.",
    cost: "free", price: "Free (fully funded)",
    qual: "Training week and placement (health and safety included)",
    accreditation: "Industry body (HBF) programme",
    mode: "in-person", reach: "nearby",
    place: "Placements with house builders across England",
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england"],
    forWho: "women",
    eligibility: ["Women; no construction experience needed"],
    outcome: "support", outcomeText: "A placement with a house builder; over 50 women have had job offers afterwards.",
    demand: "Women are about 16% of the construction workforce and 4% of site managers, so builders are actively recruiting women.",
    duration: "Training week plus placement",
    live: "intake",
    apply: "Applications open twice a year (the last window closed 20 Sep 2026). Check the HBF page for the next window.",
    link: "https://www.hbf.co.uk/industry-attraction-and-skills/wihb",
    tags: ["construction", "management", "outdoors"],
    checks: ["HBF page updated Sep 2026", "Ninth group in 2026"]
  },

  /* ---------------- WAREHOUSE AND DRIVING ---------------- */
  {
    id: "forklift-free",
    title: "Free forklift training (Luton and Bedfordshire)",
    provider: "Think Employment (funded by the DfE Adult Skills Fund)",
    sector: "logistics",
    summary: "Funded forklift training for eligible residents of Luton, Bedford, Central Bedfordshire and Hertfordshire. The M1 corridor has steady demand for forklift operators.",
    cost: "funded", price: "Free if you're eligible",
    qual: "Forklift (counterbalance) operator certificate",
    accreditation: "Adult Skills Fund provider. Ask which accrediting body (RTITB, AITT, NPORS or ITSSAR) issues the certificate before you start; employers expect one of these.",
    mode: "in-person", reach: "nearby",
    place: "Luton and Bedfordshire training sites",
    ageMin: 19, residency: ["luton", "cbeds", "bedford", "england"],
    eligibility: ["Aged 19+", "Living in Luton, Bedfordshire or Hertfordshire", "Funding rules apply"],
    outcome: "demand", outcomeText: "Warehouses along the M1 (Dunstable, Houghton Regis, Milton Keynes) hire licensed operators, often through agencies.",
    duration: "A few days",
    live: "running",
    apply: "Enquire on the provider's Luton forklift page.",
    link: "https://www.thinkemployment.com/courses/free-forklift-training-luton/",
    tags: ["warehouse", "hands-on", "driving"],
    checks: ["Provider page for Luton published 2026", "Accreditation body to confirm on enquiry"]
  },
  {
    id: "hgv-bootcamp-cbeds",
    title: "HGV Class 2 Skills Bootcamp (Central Bedfordshire residents)",
    provider: "Think Employment with Central Bedfordshire Council",
    sector: "logistics",
    summary: "12 weeks to get a Category C (Class 2) lorry licence, your Driver CPC and an NCFE Level 2 in Warehousing. Every fee is covered if you're eligible, and you get a guaranteed job interview at the end. Theory is online; driving is in Dunstable, Houghton Regis or Leighton Buzzard.",
    cost: "funded", price: "Free if you're eligible (worth about £2,500–£3,000)",
    qual: "Category C licence, Driver CPC, NCFE Level 2 Principles of Warehousing and Storage",
    accreditation: "Government Skills Bootcamp; DVSA-approved test centres; NCFE (Ofqual-regulated)",
    mode: "blended", reach: "nearby",
    place: "Dunstable / Houghton Regis area", lat: 51.8850, lng: -0.5210,
    ageMin: 19, residency: ["cbeds"],
    eligibility: ["Must live in Central Bedfordshire (not Luton or Bedford Borough)", "Aged 19+", "Full car licence with no more than 6 points", "Not in full-time education"],
    outcome: "interview", outcomeText: "Guaranteed job interview when you pass.",
    demand: "Local Class 2 driver jobs advertised at £16–£19.50 an hour in 2026.",
    duration: "12 weeks",
    live: "running",
    apply: "Apply on the course page; you'll get a guidance session, D4 medical and help with the provisional licence.",
    link: "https://www.thinkemployment.com/courses/skills-bootcamp-hgv-driving-bedfordshire/",
    tags: ["driving", "warehouse"],
    checks: ["Page updated Oct 2026", "Residency rule checked (Luton excluded)"]
  },
  {
    id: "hgv-paid",
    title: "HGV Class 2 licence (paying yourself)",
    provider: "DVSA-approved driving schools around Luton and Dunstable",
    sector: "logistics",
    summary: "If you can't get a funded place, a Category C licence usually costs £1,200 to £3,000 all in (medical, theory tests, training and the DVSA test). Class 2 driver jobs near Luton and Bedford were advertised at £16 to £19.50 an hour in 2026, so the cost can pay back quickly.",
    cost: "paid", price: "About £1,200–£3,000 all in",
    priceFrom: 1200,
    discounts: ["Free through a Skills Bootcamp if you live in a funded area", "Some employers pay for training (driving apprenticeships)"],
    qual: "Category C (Class 2) licence plus Driver CPC",
    accreditation: "DVSA test; choose a school with a published first-time pass rate",
    mode: "in-person", reach: "nearby",
    place: "Dunstable and Luton driving schools", lat: 51.8850, lng: -0.5210,
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Full car licence", "Pass the D4 medical"],
    outcome: "demand", outcomeText: "Driver agencies around Bedford and Luton offer immediate starts to licensed drivers.",
    duration: "About 1–3 months including tests",
    live: "running",
    apply: "Get at least three quotes and ask for the first-time pass rate and what a retest costs.",
    link: "https://www.gov.uk/become-lorry-bus-driver",
    tags: ["driving"],
    checks: ["2026 price guides and Bedfordshire job adverts compared"]
  },

  /* ---------------- FIRST AID ---------------- */
  {
    id: "firstaid-activeluton",
    title: "First aid courses at Lewsey Sports Park",
    provider: "Active Luton (Luton's leisure trust)",
    sector: "first-aid",
    summary: "Ofqual-accredited first aid courses in Luton: Emergency First Aid at Work (1 day, next 7 Dec 2026), First Aid at Work (3 days, 18–20 Nov 2026) and Paediatric First Aid (16–17 Dec 2026). Many jobs ask for these, such as security, childcare, sport coaching and events.",
    cost: "paid", price: "Ask Active Luton for prices",
    qual: "RLSS UK Level 3 EFAW, FAW and Paediatric First Aid (valid 3 years)",
    accreditation: "RLSS UK Qualifications, Ofqual-regulated",
    mode: "in-person", reach: "luton",
    place: "Lewsey Sports Park, Luton", lat: 51.9020, lng: -0.4890,
    ageMin: 16, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Open to anyone"],
    outcome: "demand", outcomeText: "Needed for SIA licences, childcare (paediatric), coaching and many workplaces.",
    duration: "1–3 days",
    live: "running",
    apply: "Email training@activeluton.co.uk or call 01582 400272.",
    link: "https://activeluton.co.uk/first-aid",
    tags: ["first-aid", "security", "children", "sport"],
    checks: ["Course dates through Dec 2026 listed", "Ofqual awarding body named"]
  },
  {
    id: "firstaid-sja",
    title: "Emergency First Aid at Work (St John Ambulance)",
    provider: "St John Ambulance",
    sector: "first-aid",
    summary: "One-day course with a three-year St John Ambulance certificate. Courses run across the country; check the nearest venue to Luton.",
    cost: "paid", price: "From about £120–£170",
    priceFrom: 120,
    qual: "Emergency First Aid at Work certificate (3 years)",
    accreditation: "St John Ambulance (national first aid charity); meets HSE first aid rules",
    mode: "in-person", reach: "nearby",
    place: "Venues near Luton (check at booking)",
    ageMin: 16, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Open to anyone"],
    outcome: "demand", outcomeText: "Accepted by employers and for SIA licence applications.",
    duration: "1 day",
    live: "running",
    apply: "Book on the St John Ambulance shop.",
    link: "https://shop.sja.org.uk/products/emergency-first-aid-at-work-course",
    tags: ["first-aid", "security"],
    checks: ["National charity", "2026 dates and prices listed"]
  },

  /* ---------------- DIGITAL AND TECH (mostly online) ---------------- */
  {
    id: "leep-bootcamps",
    title: "IT, Data and Cyber Security Skills Bootcamps (online)",
    provider: "Leep Talent (Leep Group)",
    sector: "digital",
    summary: "Fully funded remote bootcamps: Level 3 IT Technician, Data Technician and Cyber Security Technician (8–12 weeks), plus a 5-week Entry to HR. Each ends with a guaranteed job interview or progression (for example an apprenticeship). Leep was a sponsor of the 2026 Luton Apprenticeship Awards.",
    cost: "funded", price: "Free if you're eligible",
    qual: "Level 3 bootcamp with industry-recognised certificates (CompTIA, Microsoft and CIPD are used across Leep's courses)",
    accreditation: "Government Skills Bootcamp provider (Bedfordshire is a listed partner area)",
    mode: "online", reach: "online",
    place: "Online, live classes",
    ageMin: 19, residency: ["luton", "cbeds", "bedford"],
    eligibility: ["Aged 19+", "Right to work in the UK", "Living in a funded area (Bedfordshire is listed; confirm Luton at enquiry)", "Not in full-time education or another bootcamp"],
    outcome: "interview", outcomeText: "Guaranteed job interview or offer of progression.",
    demand: "Skills England names digital as one of the areas with the biggest growth in demand.",
    duration: "8–12 weeks",
    live: "running",
    apply: "Apply on the bootcamps page; the enrolment team confirms the next start date and checks you're eligible.",
    link: "https://leepgroup.com/training/skills-bootcamps",
    tags: ["tech", "office"],
    checks: ["'Funded 2026' on provider page", "Luton award sponsor 2026"]
  },
  {
    id: "leep-cyber-l2",
    title: "Level 2 Cyber and Network Support (3-week online course)",
    provider: "Leep Talent",
    sector: "digital",
    summary: "A short starter course for complete beginners, fully funded through the Adult Skills Fund. It leads into the longer bootcamps or entry-level IT jobs.",
    cost: "funded", price: "Free if you're eligible",
    qual: "Two recognised Level 2 qualifications",
    accreditation: "Adult Skills Fund (DfE) funded",
    mode: "online", reach: "online",
    place: "Online",
    ageMin: 19, residency: ["luton", "cbeds", "bedford", "england"],
    eligibility: ["Aged 19+ in England, funding rules apply"],
    outcome: "support", outcomeText: "Progression support into a bootcamp or job.",
    duration: "3 weeks",
    live: "running",
    apply: "Apply on the course page.",
    link: "https://leepgroup.com/networking-cybersecurity-short-course-leep",
    tags: ["tech"],
    checks: ["Provider page live 2026"]
  },
  {
    id: "cyf",
    title: "CodeYourFuture (free coding school with job support)",
    provider: "CodeYourFuture (non-profit)",
    sector: "digital",
    summary: "Start with the free online Intro to Digital course, then the 8-month part-time Software Development Course. It's completely free, with help for travel, lunch, childcare and laptops. Around 70% of Software Development graduates find tech jobs.",
    cost: "free", price: "Free",
    qual: "No formal certificate; you leave with real software built in a team",
    accreditation: "Established non-profit (since 2016), backed by tech employers",
    mode: "blended", reach: "online",
    place: "Online start; classes on one weekend day",
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Aged 18+", "On a low income (checked against household size)", "Intermediate English (free Duolingo English Test, B2)", "Access to a computer"],
    outcome: "support", outcomeText: "Job-search support and introductions to hiring companies until you find work.",
    demand: "Software and IT support are in-demand jobs.",
    duration: "Intro 20–40 hours; full course 8 months part time",
    live: "running",
    apply: "Start the Intro to Digital course on the CodeYourFuture site.",
    link: "https://codeyourfuture.io/become-a-student/",
    tags: ["tech"],
    checks: ["2026 courses running", "Shortlisted for 2026 awards"]
  },
  {
    id: "cfg",
    title: "Code First Girls (free coding courses for women)",
    provider: "Code First Girls Ltd",
    sector: "digital",
    summary: "Free remote courses for women and non-binary people, from beginner sprints to longer programmes linked to jobs at partner companies.",
    cost: "free", price: "Free",
    qual: "Course certificates; longer programmes link to partner employers",
    accreditation: "UK company (13792640); the UK's largest free provider of coding courses for women",
    mode: "online", reach: "online",
    place: "Online",
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    forWho: "women",
    eligibility: ["Women and non-binary people", "Some courses are for students and recent graduates"],
    outcome: "support", outcomeText: "Longer programmes put graduates forward to partner employers.",
    duration: "From 4 weeks",
    live: "running",
    apply: "Become a free member and choose a course.",
    link: "https://codefirstgirls.com/",
    tags: ["tech"],
    checks: ["Terms updated Jan 2026", "Courses running"]
  },
  {
    id: "skillsnetwork",
    title: "Free online Level 2 certificates (distance learning)",
    provider: "The Skills Network",
    sector: "starting-out",
    summary: "Fully funded online Level 2 certificates you can study from home, such as Preparing to Work in Adult Social Care, Principles of Warehousing, Customer Service, Mental Health Awareness, Understanding Autism and Team Leading. Good for your CV and for moving into care, warehousing or support roles.",
    cost: "funded", price: "Free if you're eligible",
    qual: "Level 2 certificates from NCFE, CACHE and TQUK",
    accreditation: "Ofqual-regulated awarding bodies (NCFE, CACHE, TQUK)",
    mode: "online", reach: "online",
    place: "Online (study at your own pace)",
    ageMin: 19, residency: ["luton", "cbeds", "bedford", "england"],
    eligibility: ["Aged 19+ in England, funding rules apply"],
    outcome: "support", outcomeText: "Adds a recognised qualification to your CV. It isn't a job ticket on its own, so pair it with one of the job routes above.",
    duration: "About 8–12 weeks each",
    live: "running",
    apply: "Choose a course on The Skills Network site.",
    link: "https://www.theskillsnetwork.com/",
    tags: ["care", "warehouse", "office", "any"],
    checks: ["Awarding bodies named", "Funded courses listed 2026"]
  },

  /* ---------------- BUSINESS ---------------- */
  {
    id: "startup-loans",
    title: "Start Up Loans with 12 months of free mentoring",
    provider: "Start Up Loans Company (British Business Bank, government-owned)",
    sector: "business",
    summary: "Borrow £500 to £25,000 per founder at a fixed 7.5% a year (since April 2026), repaid over 1 to 5 years, with 12 months of free mentoring. Businesses trading for up to 5 years can apply. A Sharia-compliant option is available.",
    cost: "paid", price: "It's a loan at 7.5% fixed (no application fee)",
    qual: "No qualification; business plan reviewed by a delivery partner",
    accreditation: "Government-owned British Business Bank",
    mode: "online", reach: "online",
    place: "Online application with a local delivery partner",
    ageMin: 18, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["UK resident aged 18+", "New business or trading under 5 years", "Credit and affordability check"],
    outcome: "business", outcomeText: "Funding plus a mentor for your first year.",
    duration: "Application takes a few weeks",
    live: "rolling",
    apply: "Apply on the official Start Up Loans site. It's a personal loan, so you must pay it back.",
    link: "https://www.startuploans.co.uk/",
    tags: ["business"],
    checks: ["Rate change on official site (April 2026)", "Sharia-compliant option confirmed"]
  },
  {
    id: "bipc",
    title: "Business & IP Centre (free start-up workshops and advice)",
    provider: "The British Library",
    sector: "business",
    summary: "Free start-up workshops, webinars, market research databases and one-to-one advice. Over 90% of businesses that start with its help are still trading after three years. The London centre is about 30 minutes by Thameslink from Luton.",
    cost: "free", price: "Free",
    qual: "No qualification",
    accreditation: "The British Library (national institution)",
    mode: "blended", reach: "online",
    place: "Online, plus the British Library at King's Cross", lat: 51.5300, lng: -0.1276,
    ageMin: 16, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Open to everyone"],
    outcome: "business", outcomeText: "Help to plan, protect and fund your idea.",
    duration: "Workshops and drop-ins all year",
    live: "rolling",
    apply: "Join for free and book workshops on the British Library site.",
    link: "https://www.bl.uk/bipc",
    tags: ["business", "creative"],
    checks: ["20th anniversary year 2026", "Start-up Day 2026 held"]
  },

  /* ---------------- FURTHER AFIELD (shown only when it beats local) ---------------- */
  {
    id: "gtr-eng",
    title: "Train fleet engineering apprenticeship (4 years)",
    provider: "Govia Thameslink Railway",
    sector: "engineering",
    summary: "A paid four-year engineering apprenticeship maintaining Southern, Great Northern and Gatwick Express trains, with free rail travel and a recognised trade qualification. No engineering experience needed. College is at East Surrey College and depots are across the network, so it means travelling or moving.",
    cost: "earn", price: "Paid apprenticeship plus free rail travel",
    qual: "Level 3 engineering apprenticeship (recognised trade qualification)",
    accreditation: "Government apprenticeship standard; UK's largest train operator",
    mode: "in-person", reach: "uk", worthTrip: true,
    place: "East Surrey College (Redhill) and GTR depots", lat: 51.2400, lng: -0.1700,
    travel: "Thameslink trains from Luton run direct to Gatwick Airport and Three Bridges; for Redhill you may need to change.",
    ageMin: 16, residency: ["luton", "cbeds", "bedford", "england", "uk"],
    eligibility: ["Aged 16+", "GCSE grade 4+ in English, maths and science"],
    outcome: "job", outcomeText: "Employed from day one.",
    duration: "4 years",
    live: "intake",
    apply: "Applications usually open in November and close at the end of December, on GTR's recruitment portal.",
    link: "https://www.mynewsdesk.com/uk/gtr/pressreleases/uks-biggest-rail-operator-on-the-search-for-budding-engineers-as-it-launches-recruitment-drive-3413729",
    tags: ["engineering", "trades", "hands-on"],
    checks: ["Yearly intake confirmed 2025 and 2026", "Direct train from Luton"]
  }
  ],

  /* Notes shown as "Before you pay" cards */
  warnings: [
    { id: "electrician", sector: "trades", title: "Thinking of a fast-track electrician course?",
      text: "Adverts promising you'll be 'qualified in weeks' are common. To be a fully qualified electrician you need an NVQ Level 3 plus the AM2 assessment for the ECS Gold Card, and that takes real site experience. Short 'domestic installer' courses only cover limited home work. The safest routes are an apprenticeship or a college course with an NVQ, so check this before paying thousands.",
      link: "https://www.gov.uk/become-apprentice" },
    { id: "never-pay", sector: "any", title: "Never pay for a job",
      text: "Real employers never charge you for an interview, a job offer or background checks; London Luton Airport says this on its own careers page. Pay for training only when you can check the qualification on the Ofqual register or with the awarding body.",
      link: "https://register.ofqual.gov.uk/" },
    { id: "sia-check", sector: "security", title: "Check an SIA course before you pay",
      text: "The Door Supervisor course must be at least 6 days (54 hours by law) and come from an SIA-approved awarding body. The licence fee (£204 since April 2026) is paid to the SIA, not the training centre.",
      link: "https://www.gov.uk/guidance/get-training-for-your-sia-licence" }
  ],

  /* Sector names and demand notes */
  sectors: {
    "starting-out": { name: "Getting started", demand: "" },
    "aviation":     { name: "Airport and aviation", demand: "London Luton Airport, easyJet, Wizz Air and Jet2 recruit locally every year." },
    "security":     { name: "Security", demand: "Security roles at the airport and in retail, events and nightlife are advertised all year." },
    "care":         { name: "Care", demand: "Adult social care is one of Skills England's priority areas, with demand set to grow." },
    "health":       { name: "NHS and health", demand: "Health has 26 priority occupations in Skills England's 2026 report." },
    "construction": { name: "Construction", demand: "Construction's 30 priority jobs are projected to grow by 26% (493,000 workers) by 2035." },
    "logistics":    { name: "Driving and warehouse", demand: "The M1 corridor around Luton is one of England's busiest logistics areas." },
    "digital":      { name: "Digital and tech", demand: "Digital is one of the areas with the biggest expected growth in demand." },
    "childcare":    { name: "Childcare and early years", demand: "" },
    "education":    { name: "Schools and college", demand: "" },
    "first-aid":    { name: "First aid", demand: "Needed for security licences, childcare, coaching and many workplaces." },
    "business":     { name: "Start a business", demand: "" },
    "sport":        { name: "Sport", demand: "" },
    "trades":       { name: "Trades and apprenticeships", demand: "" },
    "engineering":  { name: "Engineering", demand: "Engineering roles face demand from several industries at once." }
  },

  /* Approximate postcode district centres for distance (offline) */
  postcodes: {
    LU1:[51.874,-0.425], LU2:[51.893,-0.395], LU3:[51.906,-0.444], LU4:[51.900,-0.477],
    LU5:[51.912,-0.520], LU6:[51.884,-0.528], LU7:[51.916,-0.660],
    AL5:[51.815,-0.354], SG4:[51.946,-0.281], SG5:[51.993,-0.300], MK45:[51.990,-0.495],
    MK40:[52.136,-0.467], MK41:[52.155,-0.455], MK42:[52.122,-0.470], HP2:[51.765,-0.462]
  }
};

/* Extra listings, researched 16 Nov 2026. Loaded after skills-data.js, before skills.js.
   Items with an existing id replace the older version. */
(function(D){
var add=[
{
"id": "arriva-bus",
"title": "Trainee bus driver at the Luton depot",
"provider": "Arriva",
"sector": "logistics",
"summary": "Arriva trains people with no bus licence to become bus drivers at its Luton depot. You're paid during training and get your PCV licence through Arriva's training school (about 4 weeks at the depot, then time with a mentor). Free bus travel for you and your family.",
"cost": "earn",
"price": "Paid while training (adverts showed £12.21 an hour in training, rising to £17 after 7 months)",
"qual": "PCV (bus) licence and Driver CPC, paid for by Arriva",
"accreditation": "DVSA licence; employer-run training school",
"mode": "in-person",
"reach": "luton",
"place": "Arriva Luton bus depot",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Aged 18+",
"Full car licence with no more than 6 points",
"Pass a drug and alcohol test"
],
"outcome": "job",
"outcomeText": "Hired first, then trained.",
"duration": "About 4–6 weeks of training",
"live": "rolling",
"apply": "Apply for 'Trainee Bus Driver' Luton on Arriva's careers site.",
"link": "https://www.arrivabus.co.uk/careers",
"tags": [
"driving",
"customer"
],
"checks": [
"Luton depot adverts 2025–2026 with paid PCV training"
]
},
{
"id": "eeast-aca",
"title": "Ambulance Care Assistant (Dunstable / Bedford)",
"provider": "East of England Ambulance Service NHS Trust",
"sector": "health",
"summary": "Drive and care for patients going to and from hospital appointments. Starts with a 3-week paid training course (First Person on Scene clinical training and patient transport driving), with uniform provided. Band 3 NHS pay.",
"cost": "earn",
"price": "£25,760–£27,476 a year (Band 3), paid during training",
"qual": "First Person on Scene clinical training; NHS patient transport driver training",
"accreditation": "NHS employer",
"mode": "in-person",
"reach": "nearby",
"place": "Dunstable ambulance station, London Road (also Bedford)",
"lat": 51.8835,
"lng": -0.515,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Full UK manual car licence, held 1 year+, max 6 points",
"Able to attend 3 weeks full-time training (Welwyn Garden City)",
"DBS check"
],
"outcome": "job",
"outcomeText": "Employed by the NHS from the start.",
"duration": "3 weeks paid training",
"live": "rolling",
"apply": "Search 'Ambulance Care Assistant Dunstable' on NHS Jobs.",
"link": "https://www.jobs.nhs.uk/",
"tags": [
"health",
"driving",
"helping"
],
"checks": [
"Dunstable and Bedford adverts in 2026"
]
},
{
"id": "eeast-eca",
"title": "Apprentice Emergency Care Assistant (Luton and Kempston)",
"provider": "East of England Ambulance Service NHS Trust",
"sector": "health",
"summary": "A 12-month paid apprenticeship working on emergency ambulances alongside paramedics. When you finish you move onto a qualified Emergency Care Assistant role (Band 3). Bedfordshire roles were advertised for Luton and Kempston.",
"cost": "earn",
"price": "Training salary from £19,255, then Band 3",
"qual": "Emergency Care Assistant apprenticeship",
"accreditation": "NHS apprenticeship",
"mode": "in-person",
"reach": "luton",
"place": "Luton ambulance station",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Customer service or care experience",
"Full driving licence (check advert for categories)"
],
"outcome": "job",
"outcomeText": "Qualified Emergency Care Assistant job on completion.",
"duration": "About 12 months",
"live": "intake",
"apply": "Search 'Apprentice Emergency Care Assistant Bedfordshire' on NHS Jobs.",
"link": "https://www.jobs.nhs.uk/",
"tags": [
"health",
"helping",
"driving"
],
"checks": [
"Luton/Kempston advert, training from April 2026"
]
},
{
"id": "beds-pcda",
"title": "Police Constable Degree Apprenticeship",
"provider": "Bedfordshire Police",
"sector": "public",
"summary": "Become a police officer from day one and earn a fully funded BSc (Hons) in Professional Policing with Anglia Ruskin University over three years. Bedfordshire Police welcomed new PCDA officers in March 2026.",
"cost": "earn",
"price": "£31,164 plus £1,500 allowance (2026 advert)",
"qual": "BSc (Hons) Professional Policing (fully funded)",
"accreditation": "College of Policing entry route; Anglia Ruskin University degree",
"mode": "in-person",
"reach": "luton",
"place": "Bedfordshire (force-wide)",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Level 3 qualification (e.g. A levels), or 2 years as a PCSO",
"GCSE English and maths",
"Aptitude test and fitness test"
],
"outcome": "job",
"outcomeText": "You're a police officer from day one.",
"duration": "3 years",
"live": "intake",
"apply": "Watch the Bedfordshire Police careers page for the next window.",
"link": "https://www.beds.police.uk/police-forces/bedfordshire-police/areas/careers/careers2/police-officers/police-constable-degree-apprenticeship/",
"tags": [
"public",
"security",
"helping"
],
"checks": [
"2026 recruitment window and passing-out reported"
]
},
{
"id": "beds-pcso",
"title": "Police Community Support Officer (PCSO)",
"provider": "Bedfordshire Police",
"sector": "public",
"summary": "Paid uniformed role in local neighbourhoods. If you don't have the qualifications for the degree apprenticeship, two years as a PCSO counts as the Level 3 needed to become a constable.",
"cost": "earn",
"price": "Paid role with training",
"qual": "Force training; counts toward PCDA entry",
"accreditation": "Police force",
"mode": "in-person",
"reach": "luton",
"place": "Bedfordshire",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Full UK manual driving licence"
],
"outcome": "job",
"outcomeText": "Employed and trained by the force.",
"duration": "Initial training then on the job",
"live": "intake",
"apply": "Bedfordshire Police careers page.",
"link": "https://www.beds.police.uk/",
"tags": [
"public",
"security",
"helping"
],
"checks": [
"PCSO campaign advert seen"
]
},
{
"id": "easyjet-eng",
"title": "Aircraft engineering apprenticeship (Luton campus)",
"provider": "easyJet",
"sector": "aviation",
"summary": "A 2-year Level 3 aircraft maintenance apprenticeship. The first 9 months are classroom training at easyJet's new Luton hangar and training campus, which takes up to 40 apprentices a year. It works toward the UK CAA Part-66 Category A1 licence, with a bonus and staff travel.",
"cost": "earn",
"price": "Apprentice wage plus £200 a month allowance in year 1, bonus and pension",
"qual": "Level 3 Aircraft Maintenance Technician; working toward UK CAA Part-66 Cat A1",
"accreditation": "Government apprenticeship standard; UK CAA licensing",
"mode": "in-person",
"reach": "luton",
"place": "easyJet Hangar 89, London Luton Airport, LU2 9PF",
"lat": 51.8776,
"lng": -0.377,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Check GCSE requirements on the advert"
],
"outcome": "job",
"outcomeText": "Employed by easyJet throughout.",
"demand": "easyJet says 27% of UK aircraft engineers are close to retirement.",
"duration": "2 years",
"live": "intake",
"apply": "Intakes in April and October; applications open in the autumn on easyJet careers.",
"link": "https://careers.easyjet.com/career-areas/engineering-and-maintenance",
"tags": [
"aviation",
"engineering",
"trades"
],
"checks": [
"2026 intakes (April and October) confirmed by easyJet"
]
},
{
"id": "tui-eng",
"title": "Aircraft engineering apprenticeship (TUI, Luton)",
"provider": "TUI UK",
"sector": "aviation",
"summary": "A Level 3 Engineering Technician apprenticeship (Aircraft Maintenance Fitter) at TUI's base maintenance hangar at Luton Airport, plus a Level 3 Diploma in Aircraft Maintenance.",
"cost": "earn",
"price": "Apprentice wage",
"qual": "Level 3 Engineering Technician plus Level 3 Diploma in Aircraft Maintenance",
"accreditation": "Government apprenticeship standard",
"mode": "in-person",
"reach": "luton",
"place": "TUI base maintenance, Luton Airport, LU2 9PA",
"lat": 51.877,
"lng": -0.375,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Ideally live within 30 miles of Luton Airport",
"Not already qualified at Level 4+ in engineering"
],
"outcome": "job",
"outcomeText": "Employed by TUI; leads to Aircraft Mechanic role.",
"duration": "About 3 years",
"live": "intake",
"apply": "Search 'TUI Aircraft Engineering Apprenticeship' on Find an apprenticeship (advert closed March 2026; watch for the next).",
"link": "https://www.findapprenticeship.service.gov.uk/apprenticeship/reference/2000012996",
"tags": [
"aviation",
"engineering",
"trades"
],
"checks": [
"Advert Feb–Mar 2026"
]
},
{
"id": "swissport-ramp",
"title": "Ramp agent / baggage handler at Luton Airport",
"provider": "Swissport, Menzies and agencies (e.g. Optime)",
"sector": "aviation",
"summary": "Ground handling jobs loading aircraft and handling baggage. Full training is given (about 7 days of classroom and shadowing), with PPE provided. Swissport ramp roles were around £13.17 an hour, rising to £16.53 for team leaders.",
"cost": "earn",
"price": "About £13–£13.50 an hour, training paid",
"qual": "Airside training and airside pass",
"accreditation": "Airport-regulated employer training",
"mode": "in-person",
"reach": "luton",
"place": "London Luton Airport",
"lat": 51.8747,
"lng": -0.3683,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Aged 18+",
"Pass 5-year background checks for an airside pass",
"Shift work"
],
"outcome": "job",
"outcomeText": "Hired first, then trained. Clear routes to team leader.",
"duration": "About 1 week of training",
"live": "rolling",
"apply": "Swissport careers (Luton Airport) or the Menzies page on the airport's careers site.",
"link": "https://www.london-luton.co.uk/Corporate/Careers/Vacancies/menzies-aviation",
"tags": [
"aviation",
"warehouse",
"hands-on"
],
"checks": [
"Swissport Luton adverts Aug 2026",
"Optime Luton advert Oct 2026"
]
},
{
"id": "prm-agent",
"title": "Passenger Service Agent (assisting passengers) at Luton Airport",
"provider": "Optime Group for an airport ground handler",
"sector": "aviation",
"summary": "Help passengers who need assistance through the airport. No security experience needed; all training is paid, including help getting background checks. Advertised at £25,792–£27,000 pro rata.",
"cost": "earn",
"price": "Paid training; £25,792–£27,000 pro rata",
"qual": "Employer training",
"accreditation": "Airport employer",
"mode": "in-person",
"reach": "luton",
"place": "London Luton Airport",
"lat": 51.8747,
"lng": -0.3683,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Interest in aviation and customer service",
"Pass background checks"
],
"outcome": "job",
"outcomeText": "Hired first, then trained.",
"duration": "Paid training at start",
"live": "rolling",
"apply": "Optime Group vacancies (Luton Airport).",
"link": "https://apply.workable.com/optimegroup/",
"tags": [
"aviation",
"customer",
"helping"
],
"checks": [
"Advert June 2026"
]
},
{
"id": "signature-lst",
"title": "Line Service Technician / Airside roles (private jets)",
"provider": "Signature Aviation, Luton FBO",
"sector": "aviation",
"summary": "Work airside with private and business jets: towing, refuelling support and ground equipment. Full training is given on all equipment. Airside roles were advertised from about £30k full time.",
"cost": "earn",
"price": "From about £27k–£30k full-time equivalent",
"qual": "Employer training on ground equipment",
"accreditation": "Airport employer",
"mode": "in-person",
"reach": "luton",
"place": "Signature Aviation, Luton Airport",
"lat": 51.879,
"lng": -0.38,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Aged 18+",
"Shift pattern 4 on, 2 off"
],
"outcome": "job",
"outcomeText": "Hired first, then trained.",
"duration": "On the job",
"live": "rolling",
"apply": "Signature Aviation careers.",
"link": "https://signatureaviation.breezy.hr/",
"tags": [
"aviation",
"hands-on",
"outdoors"
],
"checks": [
"Luton adverts 2026"
]
},
{
"id": "mitie-dco",
"title": "Detainee Custody Officer (Luton Airport)",
"provider": "Mitie",
"sector": "security",
"summary": "Escort and look after people in Home Office detention at Luton Airport, with full training. Advertised at £32,635 for 42 hours.",
"cost": "earn",
"price": "£32,635 a year (42 hours)",
"qual": "Home Office DCO certification through employer training",
"accreditation": "Home Office contract employer",
"mode": "in-person",
"reach": "luton",
"place": "Luton Airport, LU2 9NW",
"lat": 51.877,
"lng": -0.37,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Aged 18+",
"Enhanced security vetting"
],
"outcome": "job",
"outcomeText": "Hired first, then trained.",
"duration": "Initial training course",
"live": "rolling",
"apply": "Mitie careers; search 'DCO Luton'.",
"link": "https://findajob.dwp.gov.uk/details/18067125",
"tags": [
"security",
"helping"
],
"checks": [
"Advert March 2026"
]
},
{
"id": "prison-woodhill",
"title": "Prison Officer (HMP Woodhill, Milton Keynes)",
"provider": "HM Prison and Probation Service",
"sector": "public",
"summary": "Paid initial training, then a career with clear promotion. Starting pay £39,375 for a 39-hour week (including unsocial hours). HMP Bedford also recruits through national campaigns.",
"cost": "earn",
"price": "£37,246–£41,503 depending on hours",
"qual": "Prison Officer Entry Level Training (paid)",
"accreditation": "Ministry of Justice",
"mode": "in-person",
"reach": "nearby",
"place": "HMP Woodhill, Milton Keynes MK4 4DA",
"lat": 52.013,
"lng": -0.786,
"travel": "About 40 minutes by car from Luton; by train via Bletchley.",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Pass online tests and assessment centre",
"Enhanced and counter-terrorism vetting",
"Hearing and fitness standards"
],
"outcome": "job",
"outcomeText": "Employed from the start of training.",
"duration": "Initial training course",
"live": "rolling",
"apply": "Apply on the Ministry of Justice jobs site (campaigns open most months).",
"link": "https://jobs.justice.gov.uk/",
"tags": [
"public",
"security",
"helping"
],
"checks": [
"Woodhill adverts April–Aug 2026"
]
},
{
"id": "openreach",
"title": "Openreach trainee engineer",
"provider": "Openreach (BT Group)",
"sector": "engineering",
"summary": "Build and fix the UK's broadband network. Openreach pays for all training (NVQ Level 2) and a salary, with a guaranteed engineer job when you complete. They actively recruit women into trainee engineer roles.",
"cost": "earn",
"price": "Paid apprenticeship; Openreach covers training",
"qual": "Telecoms Field Operative apprenticeship (NVQ Level 2)",
"accreditation": "Government apprenticeship standard",
"mode": "in-person",
"reach": "nearby",
"place": "Patches across Bedfordshire and Hertfordshire",
"ageMin": 17,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Good maths and English",
"Full manual driving licence, max 6 points",
"Head for heights, happy outdoors"
],
"outcome": "job",
"outcomeText": "Guaranteed job as a qualified engineer on completion.",
"duration": "About 12 months",
"live": "intake",
"apply": "Search trainee engineer roles near Luton on Openreach careers.",
"link": "https://www.openreach.com/careers/career-programmes/trainee-engineer-roles",
"tags": [
"engineering",
"hands-on",
"outdoors",
"tech"
],
"checks": [
"Openreach careers page live 2026"
]
},
{
"id": "octopus-lowcarbon",
"title": "Low Carbon Apprentice (heat pump engineer)",
"provider": "Octopus Energy",
"sector": "engineering",
"summary": "A paid Level 3 Low Carbon Heating Technician apprenticeship installing heat pumps, trained at Octopus facilities. Advertised starting pay £20,381 for 21+, rising to £40,000+ after 5 years. Locations vary each intake (London, Midlands, Reading and more).",
"cost": "earn",
"price": "From £17,652 (16–20) or £20,381 (21+)",
"qual": "Level 3 Low Carbon Heating Technician",
"accreditation": "Government apprenticeship standard",
"mode": "in-person",
"reach": "uk",
"worthTrip": true,
"place": "Octopus hubs (check nearest at application)",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"GCSE English grade 4+"
],
"outcome": "job",
"outcomeText": "Employed from day one; strong long-term pay.",
"demand": "Clean energy is one of Skills England's priority growth areas.",
"duration": "About 3 years",
"live": "intake",
"apply": "Octopus Energy careers (search 'Low Carbon Apprentice').",
"link": "https://jobs.lever.co/octoenergy",
"tags": [
"engineering",
"trades",
"hands-on"
],
"checks": [
"Apprentice adverts 2024–2026"
],
"travel": "Octopus training hubs are spread across the UK, so ask for the nearest one when you apply. Training is in blocks, so you only travel for the training weeks."
},
{
"id": "amazon-rme",
"title": "Amazon mechatronics and automation apprenticeships (Dunstable)",
"provider": "Amazon UK",
"sector": "engineering",
"summary": "Paid apprenticeships maintaining robotics and conveyor systems at Amazon's Dunstable sites, from Level 3 Mechatronics (36 months) up to a degree-level Automation Engineering route with a residential first year.",
"cost": "earn",
"price": "Paid apprenticeship",
"qual": "Level 3 Mechatronics or Level 6 Control Systems Engineer (degree)",
"accreditation": "Government apprenticeship standards (training with The MTC / Siemens)",
"mode": "in-person",
"reach": "nearby",
"place": "Amazon, Prologis Park / Baytree Park, Dunstable LU5",
"lat": 51.906,
"lng": -0.508,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Aged 18+ by start",
"Shift work"
],
"outcome": "job",
"outcomeText": "Employed during the apprenticeship.",
"duration": "36–48 months",
"live": "running",
"apply": "Search 'RME Mechatronics Apprentice East' on Find an apprenticeship (open until 1 Feb 2027).",
"link": "https://www.findapprenticeship.service.gov.uk/apprenticeship/VAC2000063382",
"tags": [
"engineering",
"tech",
"hands-on"
],
"checks": [
"Advert posted 10 Nov 2026, closes Feb 2027"
]
},
{
"id": "empire-hire",
"title": "Operative Engineer Apprentice (plant hire)",
"provider": "Empire Hire Group, Dunstable (with Bedford College)",
"sector": "engineering",
"summary": "Two-year apprenticeship servicing hire equipment, leading to Service Engineer and specialisms such as hydraulics and diagnostics.",
"cost": "earn",
"price": "£16,640–£26,437 a year",
"qual": "Engineering apprenticeship",
"accreditation": "Delivered with Bedford College",
"mode": "in-person",
"reach": "nearby",
"place": "Icknield Way, Dunstable LU6 2JX",
"lat": 51.89,
"lng": -0.53,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See advert"
],
"outcome": "job",
"outcomeText": "Progression to qualified Service Engineer.",
"duration": "2 years",
"live": "intake",
"apply": "Search 'Empire Hire' on Find an apprenticeship.",
"link": "https://www.findapprenticeship.service.gov.uk/apprenticeship/reference/2000043645",
"tags": [
"engineering",
"trades",
"hands-on"
],
"checks": [
"2026 adverts"
]
},
{
"id": "jtl-electric",
"title": "Electrician apprenticeship (JTL)",
"provider": "JTL with local electrical employers",
"sector": "trades",
"summary": "The proper route to becoming a qualified electrician: a 4-year paid apprenticeship ending with the Level 3 qualification and the JIB Gold Card. JTL places apprentices with employers across England, including Bedfordshire.",
"cost": "earn",
"price": "Apprentice wage rising each year",
"qual": "Level 3 Installation and Maintenance Electrician; JIB Gold Card",
"accreditation": "Government apprenticeship standard; JTL is a national electrical training charity",
"mode": "in-person",
"reach": "nearby",
"place": "Employers around Bedfordshire and Hertfordshire",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Usually GCSE grade 4 in English, maths and science"
],
"outcome": "job",
"outcomeText": "You finish as a fully qualified electrician.",
"demand": "Construction and building services are in high demand.",
"duration": "4 years",
"live": "rolling",
"apply": "Apply to JTL (admissions@jtltraining.com, 0800 085 2308) or search JTL vacancies.",
"link": "https://www.jtltraining.com/",
"tags": [
"trades",
"hands-on",
"construction"
],
"checks": [
"Many 2026 JTL vacancies"
]
},
{
"id": "bedford-electric",
"title": "Electrical apprenticeship (Bedfordshire employers via Bedford College)",
"provider": "The Bedford College Group apprenticeship team",
"sector": "trades",
"summary": "Bedford College recruits electrical apprentices for local firms (for example Arcade UK, Bedfordshire area, July 2026 start).",
"cost": "earn",
"price": "Apprentice wage",
"qual": "Level 3 electrical apprenticeship",
"accreditation": "FE college apprenticeship provider",
"mode": "in-person",
"reach": "nearby",
"place": "Bedfordshire",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"3 GCSEs at grade 4+ incl. English, maths and science (the team can advise if not)"
],
"outcome": "job",
"outcomeText": "Full qualification and continued employment.",
"duration": "About 4 years",
"live": "rolling",
"apply": "Email apprenticeships@bedford.ac.uk.",
"link": "https://bedfordcollegegroup.ac.uk/",
"tags": [
"trades",
"hands-on"
],
"checks": [
"2026 advert"
]
},
{
"id": "aws-restart",
"title": "AWS re/Start cloud support bootcamp",
"provider": "Generation UK with Amazon Web Services",
"sector": "digital",
"summary": "A free 12-week full-time bootcamp (Monday to Friday, 9 to 5) training you as a Cloud Support Practitioner, including the AWS Cloud Practitioner exam. Graduates get CV and interview coaching and are matched with employers. Generation says 70% of its bootcamp graduates are placed in jobs within six months.",
"cost": "free",
"price": "Free; you can stay on Universal Credit",
"qual": "AWS Certified Cloud Practitioner exam (paid for)",
"accreditation": "Amazon Web Services certification; Generation is a registered charity with DWP-published outcome data",
"mode": "blended",
"reach": "uk",
"worthTrip": true,
"place": "London cohorts (about 25 minutes from Luton by Thameslink), some online",
"lat": 51.5074,
"lng": -0.1278,
"travel": "Thameslink from Luton to London St Pancras or Farringdon, about 25–35 minutes.",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 18+ (19+ for some)",
"Unemployed or on a zero-hours contract",
"Right to work in the UK",
"Available full time and ready to start a job straight after",
"Some cohorts are for local residents only, so check the location"
],
"outcome": "interview",
"outcomeText": "Matched interviews with employer partners.",
"duration": "12 weeks full time",
"live": "intake",
"apply": "Register interest on Generation UK's AWS re/Start page.",
"link": "https://uk.generation.org/london/aws-restart/",
"tags": [
"tech"
],
"checks": [
"Generation programme pages 2026",
"AWS: 30,000+ graduates into jobs worldwide"
]
},
{
"id": "generation-data",
"title": "Free Data Analytics bootcamp (online, for women)",
"provider": "Generation UK",
"sector": "digital",
"summary": "A free 11-week online Skills Bootcamp to start a career as a data analyst, for women and non-binary people who are unemployed or on zero-hours contracts. Laptops and wifi are provided if you need them.",
"cost": "free",
"price": "Free",
"qual": "Bootcamp certificate and portfolio",
"accreditation": "Government Skills Bootcamp delivered by a registered charity",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"forWho": "women",
"eligibility": [
"Women and non-binary people aged 18+",
"Unemployed or zero-hours contract"
],
"outcome": "interview",
"outcomeText": "Generation works with employers to place graduates.",
"duration": "11 weeks",
"live": "intake",
"apply": "Apply on Generation UK when a cohort opens.",
"link": "https://uk.generation.org/",
"tags": [
"tech",
"office"
],
"checks": [
"Advert June 2026"
]
},
{
"id": "google-certs",
"title": "Google Career Certificates (free scholarships)",
"provider": "Google, via scholarship partners (DWP, The King's Trust and others)",
"sector": "digital",
"summary": "Online certificates in IT Support, Data Analytics, Project Management, UX Design and Digital Marketing. They normally cost a monthly Coursera fee, but Google gives free scholarships through partners. Ask your Jobcentre work coach about the DWP scholarship.",
"cost": "funded",
"price": "Free with a scholarship (otherwise a monthly Coursera fee)",
"qual": "Google Career Certificate",
"accreditation": "Industry certificate (Google); not Ofqual-regulated",
"mode": "online",
"reach": "online",
"place": "Online, self-paced",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"UK-based",
"Scholarship partner rules apply (e.g. claiming benefits for the DWP route)"
],
"outcome": "support",
"outcomeText": "Good for entry-level IT, data and project roles alongside experience.",
"duration": "3–6 months part time",
"live": "running",
"apply": "Ask your work coach about the DWP Google scholarship, or check Google's UK certificates page.",
"link": "https://grow.google/intl/uk/google-career-certificates/",
"tags": [
"tech",
"office"
],
"checks": [
"Scholarships active through Dec 2026"
]
},
{
"id": "google-garage",
"title": "Google Digital Garage: Fundamentals of Digital Marketing",
"provider": "Google (Grow with Google)",
"sector": "digital",
"summary": "A free online course with a free certificate covering websites, search, social media and online advertising. Useful if you're starting a business or applying for marketing roles. Google also runs free live digital skills sessions online.",
"cost": "free",
"price": "Free, including the certificate",
"qual": "Google certificate (industry, not Ofqual)",
"accreditation": "Google",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Anyone"
],
"outcome": "support",
"outcomeText": "CV booster for marketing and small business.",
"duration": "About 40 hours",
"live": "running",
"apply": "Sign up free on Grow with Google.",
"link": "https://www.grow.google/intl/uk/courses-and-tools/",
"tags": [
"tech",
"business",
"creative"
],
"checks": [
"Live sessions scheduled through 2026"
]
},
{
"id": "lcg-preparingtoworkinadultso",
"title": "Level 2 Certificate in Preparing to Work in Adult Social Care (free online)",
"provider": "Learning Curve Group",
"sector": "care",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Preparing to Work in Adult Social Care",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"care",
"helping"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-principlesofdementiacare",
"title": "Level 2 Certificate in Principles of Dementia Care (free online)",
"provider": "Learning Curve Group",
"sector": "care",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Principles of Dementia Care",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"care",
"helping"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-principlesofendoflifecar",
"title": "Level 2 Certificate in Principles of End of Life Care (free online)",
"provider": "Learning Curve Group",
"sector": "care",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Principles of End of Life Care",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"care",
"helping"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-awarenessofmentalhealthp",
"title": "Level 2 Certificate in Awareness of Mental Health Problems (free online)",
"provider": "Learning Curve Group",
"sector": "health",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Awareness of Mental Health Problems",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"care",
"health",
"helping"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-counsellingskills",
"title": "Level 2 Certificate in Counselling Skills (free online)",
"provider": "Learning Curve Group",
"sector": "health",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Counselling Skills",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"helping",
"care"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-understandingautism",
"title": "Level 2 Certificate in Understanding Autism (free online)",
"provider": "Learning Curve Group",
"sector": "childcare",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Understanding Autism",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"children",
"care",
"helping"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-introducingcaringforchil",
"title": "Level 2 Certificate in Introducing Caring for Children and Young People (free online)",
"provider": "Learning Curve Group",
"sector": "childcare",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Introducing Caring for Children and Young People",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"children",
"helping"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-understandingchildrenand",
"title": "Level 2 Certificate in Understanding Children and Young People's Mental Health (free online)",
"provider": "Learning Curve Group",
"sector": "childcare",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Understanding Children and Young People's Mental Health",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"children",
"helping"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-principlesofbusinessadmi",
"title": "Level 2 Certificate in Principles of Business Administration (free online)",
"provider": "Learning Curve Group",
"sector": "office",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Principles of Business Administration",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"office"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-creatingabusinessstartup",
"title": "Level 2 Certificate in Creating a Business Start-Up (free online)",
"provider": "Learning Curve Group",
"sector": "business",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Creating a Business Start-Up",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"business"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-digitalpromotionforbusin",
"title": "Level 2 Certificate in Digital Promotion for Business (free online)",
"provider": "Learning Curve Group",
"sector": "digital",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Digital Promotion for Business",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"business",
"tech",
"creative"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-principlesofcybersecurit",
"title": "Level 2 Certificate in Principles of Cyber Security (free online)",
"provider": "Learning Curve Group",
"sector": "digital",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Principles of Cyber Security",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"tech"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-principlesofteamleading",
"title": "Level 2 Certificate in Principles of Team Leading (free online)",
"provider": "Learning Curve Group",
"sector": "office",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Principles of Team Leading",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"office",
"management"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-understandingretailopera",
"title": "Level 2 Certificate in Understanding Retail Operations (free online)",
"provider": "Learning Curve Group",
"sector": "customer",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Understanding Retail Operations",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"customer"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "lcg-informationadviceorguida",
"title": "Level 2 Certificate in Information, Advice or Guidance (free online)",
"provider": "Learning Curve Group",
"sector": "office",
"summary": "A government-funded online Level 2 qualification you study from home with tutor support, usually in 6–8 weeks at a couple of hours a week. Adds a nationally recognised qualification to your CV. Note: if you enrol and then withdraw, Learning Curve can charge a £125 cancellation fee.",
"cost": "funded",
"price": "Free if eligible (paid version about £245–£350)",
"qual": "Level 2 Certificate in Information, Advice or Guidance",
"accreditation": "NCFE / NCFE CACHE (Ofqual-regulated); Adult Skills Fund",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England",
"Funding rules apply (checked when you enrol)",
"Not on an apprenticeship"
],
"outcome": "support",
"outcomeText": "CV booster; pair it with a job route for best results.",
"duration": "6–8 weeks part time",
"live": "running",
"apply": "Enrol online; eligibility is checked in about 10 minutes.",
"link": "https://www.learningcurvegroup.co.uk/flexible-learning",
"tags": [
"helping",
"office"
],
"checks": [
"Course list on provider pages 2026",
"Awarding body NCFE"
]
},
{
"id": "tsn-principlesofwarehousinga",
"title": "Principles of Warehousing and Storage (Level 2, free online)",
"provider": "The Skills Network",
"sector": "logistics",
"summary": "A fully funded distance-learning qualification you study online at your own pace with tutor support. Recognised by employers as evidence of knowledge in this area.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Level 2 certificate",
"accreditation": "NCFE / CACHE / TQUK (Ofqual-regulated)",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England, funding rules apply"
],
"outcome": "support",
"outcomeText": "CV booster; pair with a job route.",
"duration": "About 8–12 weeks",
"live": "running",
"apply": "Choose the course on The Skills Network site.",
"link": "https://www.theskillsnetwork.com/",
"tags": [
"warehouse"
],
"checks": [
"Funded course lists 2026"
]
},
{
"id": "tsn-principlesofcustomerserv",
"title": "Principles of Customer Service (Level 2, free online)",
"provider": "The Skills Network",
"sector": "customer",
"summary": "A fully funded distance-learning qualification you study online at your own pace with tutor support. Recognised by employers as evidence of knowledge in this area.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Level 2 certificate",
"accreditation": "NCFE / CACHE / TQUK (Ofqual-regulated)",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England, funding rules apply"
],
"outcome": "support",
"outcomeText": "CV booster; pair with a job route.",
"duration": "About 8–12 weeks",
"live": "running",
"apply": "Choose the course on The Skills Network site.",
"link": "https://www.theskillsnetwork.com/",
"tags": [
"customer",
"office"
],
"checks": [
"Funded course lists 2026"
]
},
{
"id": "tsn-preventionandcontrolofin",
"title": "Prevention and Control of Infection in Health Care Settings (Level 2, free online)",
"provider": "The Skills Network",
"sector": "health",
"summary": "A fully funded distance-learning qualification you study online at your own pace with tutor support. Recognised by employers as evidence of knowledge in this area.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Level 2 certificate",
"accreditation": "NCFE / CACHE / TQUK (Ofqual-regulated)",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England, funding rules apply"
],
"outcome": "support",
"outcomeText": "CV booster; pair with a job route.",
"duration": "About 8–12 weeks",
"live": "running",
"apply": "Choose the course on The Skills Network site.",
"link": "https://www.theskillsnetwork.com/",
"tags": [
"health",
"care"
],
"checks": [
"Funded course lists 2026"
]
},
{
"id": "tsn-understandingenvironment",
"title": "Understanding Environmental Sustainability (Level 2, free online)",
"provider": "The Skills Network",
"sector": "starting-out",
"summary": "A fully funded distance-learning qualification you study online at your own pace with tutor support. Recognised by employers as evidence of knowledge in this area.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Level 2 certificate",
"accreditation": "NCFE / CACHE / TQUK (Ofqual-regulated)",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England, funding rules apply"
],
"outcome": "support",
"outcomeText": "CV booster; pair with a job route.",
"duration": "About 8–12 weeks",
"live": "running",
"apply": "Choose the course on The Skills Network site.",
"link": "https://www.theskillsnetwork.com/",
"tags": [
"any"
],
"checks": [
"Funded course lists 2026"
]
},
{
"id": "tsn-safeguardingpreventandbr",
"title": "Safeguarding, Prevent and British Values (Level 2, free online)",
"provider": "The Skills Network",
"sector": "education",
"summary": "A fully funded distance-learning qualification you study online at your own pace with tutor support. Recognised by employers as evidence of knowledge in this area.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Level 2 certificate",
"accreditation": "NCFE / CACHE / TQUK (Ofqual-regulated)",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England, funding rules apply"
],
"outcome": "support",
"outcomeText": "CV booster; pair with a job route.",
"duration": "About 8–12 weeks",
"live": "running",
"apply": "Choose the course on The Skills Network site.",
"link": "https://www.theskillsnetwork.com/",
"tags": [
"children",
"helping"
],
"checks": [
"Funded course lists 2026"
]
},
{
"id": "tsn-understandingcoding",
"title": "Understanding Coding (Level 2, free online)",
"provider": "The Skills Network",
"sector": "digital",
"summary": "A fully funded distance-learning qualification you study online at your own pace with tutor support. Recognised by employers as evidence of knowledge in this area.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Level 2 certificate",
"accreditation": "NCFE / CACHE / TQUK (Ofqual-regulated)",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England, funding rules apply"
],
"outcome": "support",
"outcomeText": "CV booster; pair with a job route.",
"duration": "About 8–12 weeks",
"live": "running",
"apply": "Choose the course on The Skills Network site.",
"link": "https://www.theskillsnetwork.com/",
"tags": [
"tech"
],
"checks": [
"Funded course lists 2026"
]
},
{
"id": "tsn-equalityanddiversity",
"title": "Equality and Diversity (Level 2, free online)",
"provider": "The Skills Network",
"sector": "office",
"summary": "A fully funded distance-learning qualification you study online at your own pace with tutor support. Recognised by employers as evidence of knowledge in this area.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Level 2 certificate",
"accreditation": "NCFE / CACHE / TQUK (Ofqual-regulated)",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England, funding rules apply"
],
"outcome": "support",
"outcomeText": "CV booster; pair with a job route.",
"duration": "About 8–12 weeks",
"live": "running",
"apply": "Choose the course on The Skills Network site.",
"link": "https://www.theskillsnetwork.com/",
"tags": [
"office",
"any"
],
"checks": [
"Funded course lists 2026"
]
},
{
"id": "tsn-awardineducationandtrain",
"title": "Award in Education and Training (Level 3, free online)",
"provider": "The Skills Network",
"sector": "education",
"summary": "A fully funded distance-learning qualification you study online at your own pace with tutor support. Recognised by employers as evidence of knowledge in this area.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Level 3 certificate",
"accreditation": "NCFE / CACHE / TQUK (Ofqual-regulated)",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+ in England, funding rules apply"
],
"outcome": "support",
"outcomeText": "CV booster; pair with a job route.",
"duration": "About 8–12 weeks",
"live": "running",
"apply": "Choose the course on The Skills Network site.",
"link": "https://www.theskillsnetwork.com/",
"tags": [
"education",
"helping"
],
"checks": [
"Funded course lists 2026"
]
},
{
"id": "noah-academy",
"title": "NOAH Academy training and employment support",
"provider": "NOAH Enterprise (Luton charity 1059672)",
"sector": "starting-out",
"summary": "Luton's homelessness and poverty charity runs NOAH Academy: courses in basic life skills and employable crafts, wellbeing workshops and help preparing for work. It's known across Bedfordshire for helping people who find mainstream training hard to get back their confidence and into jobs.",
"cost": "free",
"price": "Free",
"qual": "Course certificates; employability support",
"accreditation": "Registered charity; Living Wage employer",
"mode": "in-person",
"reach": "luton",
"place": "NOAH, Luton (also a Bedford base)",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Adults facing homelessness, poverty or other disadvantage (referrals and self-referrals)"
],
"outcome": "support",
"outcomeText": "Training plus help into work, volunteering or further learning.",
"duration": "Courses run through the year",
"live": "rolling",
"apply": "Contact NOAH Enterprise in Luton to ask about the current course timetable.",
"link": "https://lutonrising.org.uk/our-community/noah-enterprise/",
"tags": [
"any",
"confidence"
],
"checks": [
"Charity Commission record",
"Course Coordinator post advertised to plan Luton courses"
]
},
{
"id": "recovery-college",
"title": "Recovery College courses (mental wellbeing and moving towards work)",
"provider": "ELFT Recovery College, Bedfordshire and Luton (NHS)",
"sector": "starting-out",
"summary": "Free courses and workshops on mental health, wellbeing and recovery, written and delivered by people with lived and professional experience. Open to anyone who lives, works or studies in Bedfordshire or Luton. Classroom venues include The Hat Factory and Leagrave in Luton, with online options too.",
"cost": "free",
"price": "Free",
"qual": "No formal qualification",
"accreditation": "NHS (East London NHS Foundation Trust)",
"mode": "blended",
"reach": "luton",
"place": "Venues in Luton (e.g. The Hat Factory, Bute Street) and online",
"lat": 51.8812,
"lng": -0.416,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford"
],
"eligibility": [
"Aged 18+",
"Live, work or study in Bedfordshire or Luton"
],
"outcome": "support",
"outcomeText": "Builds confidence before work or training.",
"duration": "Single workshops to multi-week courses",
"live": "rolling",
"apply": "Register with the Recovery College: 01582 708 917 or elft.recoverycollege@nhs.net.",
"link": "https://www.elft.nhs.uk/",
"tags": [
"confidence",
"any",
"helping"
],
"checks": [
"Listed on Luton Adult Learning's guidance page",
"Termly prospectus"
]
},
{
"id": "lal-childminder",
"title": "Becoming a Childminder (free starter course)",
"provider": "Luton Adult Learning",
"sector": "childcare",
"summary": "A free face-to-face introductory course for anyone thinking of setting up as a registered childminder from home, alongside Becoming a Childcare Practitioner and Step into Early Years (equivalent to Level 1).",
"cost": "funded",
"price": "Free if eligible",
"qual": "Introductory course (around Level 1)",
"accreditation": "Ofsted-graded council provider",
"mode": "in-person",
"reach": "luton",
"place": "Arndale House, LU1 2LJ",
"lat": 51.879,
"lng": -0.417,
"ageMin": 19,
"residency": [
"luton"
],
"eligibility": [
"Luton residents aged 19+"
],
"outcome": "business",
"outcomeText": "First step to running your own childminding business. Note: the national £600–£1,200 start-up grant closed in March 2025.",
"duration": "Short course",
"live": "intake",
"apply": "Call 01582 490033.",
"link": "https://www.lutonacl.ac.uk/find-a-course/childcare-66730.html",
"tags": [
"children",
"business"
],
"checks": [
"Course listed 2026",
"Grant closure checked on GOV.UK"
]
},
{
"id": "lal-customer",
"title": "Introduction to Customer Service (free short course)",
"provider": "Luton Adult Learning",
"sector": "customer",
"summary": "A free short course at Arndale House covering the skills shops, airports, call centres and hospitality employers look for. It can lead on to a Customer Service Practitioner apprenticeship.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Course certificate",
"accreditation": "Ofsted-graded council provider",
"mode": "in-person",
"reach": "luton",
"place": "Arndale House, LU1 2LJ",
"lat": 51.879,
"lng": -0.417,
"ageMin": 19,
"residency": [
"luton"
],
"eligibility": [
"Luton residents aged 19+"
],
"outcome": "support",
"outcomeText": "Leads to retail, aviation and hospitality jobs or an apprenticeship.",
"duration": "Short course",
"live": "intake",
"apply": "Call 01582 490033.",
"link": "https://www.lutonacl.ac.uk/find-a-course/customer-service.html",
"tags": [
"customer",
"office",
"aviation"
],
"checks": [
"Course page 2026"
]
},
{
"id": "lal-mhfa",
"title": "Mental Health First Aid course",
"provider": "Luton Adult Learning",
"sector": "first-aid",
"summary": "Luton Adult Learning runs Mental Health First Aid courses, which teach you how to spot and support someone with a mental health problem. Useful for care, youth work, HR and team leader roles.",
"cost": "funded",
"price": "Ask (often free for eligible residents)",
"qual": "Mental Health First Aid certificate",
"accreditation": "Ofsted-graded council provider",
"mode": "in-person",
"reach": "luton",
"place": "Arndale House, LU1 2LJ",
"lat": 51.879,
"lng": -0.417,
"ageMin": 19,
"residency": [
"luton"
],
"eligibility": [
"Luton residents aged 19+"
],
"outcome": "support",
"outcomeText": "CV booster for people-facing jobs.",
"duration": "1–2 days",
"live": "intake",
"apply": "Call 01582 490033.",
"link": "https://www.lutonacl.ac.uk/find-a-course",
"tags": [
"helping",
"care",
"first-aid"
],
"checks": [
"Listed in LAL course menu 2026"
]
},
{
"id": "lal-volunteering",
"title": "Volunteering courses and placements",
"provider": "Luton Adult Learning",
"sector": "starting-out",
"summary": "Courses that prepare you to volunteer and help you find a volunteering placement, which is a recognised way to get experience and references for your CV.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Course certificate",
"accreditation": "Ofsted-graded council provider",
"mode": "in-person",
"reach": "luton",
"place": "Arndale House, LU1 2LJ",
"lat": 51.879,
"lng": -0.417,
"ageMin": 19,
"residency": [
"luton"
],
"eligibility": [
"Luton residents aged 19+"
],
"outcome": "support",
"outcomeText": "Experience and references for job applications.",
"duration": "Short course",
"live": "intake",
"apply": "Call 01582 490033.",
"link": "https://www.lutonacl.ac.uk/find-a-course",
"tags": [
"any",
"confidence",
"helping"
],
"checks": [
"Listed in LAL course menu 2026"
]
},
{
"id": "lal-family",
"title": "Family Learning courses",
"provider": "Luton Adult Learning",
"sector": "starting-out",
"summary": "Free courses and workshops for parents and carers, mostly run in Luton schools and nurseries, with some at Arndale House in the holidays. A gentle first step back into learning.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Course certificates",
"accreditation": "Ofsted-graded council provider",
"mode": "in-person",
"reach": "luton",
"place": "Luton schools and nurseries; Arndale House",
"lat": 51.879,
"lng": -0.417,
"ageMin": 19,
"residency": [
"luton"
],
"eligibility": [
"Luton residents aged 19+ who care for children"
],
"outcome": "support",
"outcomeText": "Builds confidence; links to other courses.",
"duration": "Workshops and short courses",
"live": "rolling",
"apply": "Email familylearning@lutonacl.ac.uk.",
"link": "https://www.lutonacl.ac.uk/find-a-course/family-learning.html",
"tags": [
"children",
"confidence"
],
"checks": [
"Course page 2026"
]
},
{
"id": "active-nplq",
"title": "Pool lifeguard qualification (NPLQ) with guaranteed interview",
"provider": "Active Luton",
"sector": "sport",
"summary": "A 6-day National Pool Lifeguard Qualification course at Inspire: Luton Sports Village. If you pass with Active Luton, they guarantee you a job interview as a lifeguard at one of their pools. Lifeguard roles in Luton pay around £12–£15 an hour.",
"cost": "paid",
"price": "Ask Active Luton for current price",
"priceFrom": 0,
"qual": "RLSS UK National Pool Lifeguard Qualification (Level 3)",
"accreditation": "RLSS UK Qualifications (Ofqual-regulated)",
"mode": "in-person",
"reach": "luton",
"place": "Inspire: Luton Sports Village, Hitchin Road",
"lat": 51.896,
"lng": -0.398,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Aged 16+",
"Competent swimmer",
"Good spoken and written English"
],
"outcome": "interview",
"outcomeText": "Guaranteed lifeguard interview with Active Luton.",
"duration": "6 days",
"live": "running",
"apply": "Book through Active Luton training (training@activeluton.co.uk, 01582 400272).",
"link": "https://activeluton.co.uk/lifeguard-courses",
"tags": [
"sport",
"helping",
"first-aid"
],
"checks": [
"2026 course dates",
"Guaranteed interview stated by Active Luton"
]
},
{
"id": "active-swimteach",
"title": "Swimming teacher training (Level 1 and 2)",
"provider": "Active Luton",
"sector": "sport",
"summary": "Train as a swimming teacher with Active Luton. Assistant swim teachers there are paid around £15 an hour, with a route to qualified Level 2 swim teacher.",
"cost": "paid",
"price": "Ask Active Luton",
"qual": "Swim England / aquatics teaching qualification",
"accreditation": "Awarding body for aquatics (Swim England / RLSS UK)",
"mode": "in-person",
"reach": "luton",
"place": "Active Luton pools",
"lat": 51.896,
"lng": -0.398,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Confident swimmer"
],
"outcome": "demand",
"outcomeText": "Pool operators recruit swim teachers regularly.",
"duration": "Several days to weeks",
"live": "intake",
"apply": "Contact Active Luton training.",
"link": "https://activeluton.co.uk/news/enhance-your-skills-with-lutons-trusted-training-provider",
"tags": [
"sport",
"children",
"helping"
],
"checks": [
"Active Luton training page",
"Assistant swim teacher advert"
]
},
{
"id": "barnfield-access",
"title": "Access to Higher Education Diploma (route to university)",
"provider": "Barnfield College",
"sector": "education",
"summary": "A one-year course for adults without A levels who want to go to university, for example in nursing, social work, teaching or business. If you're 19 to 23 without a full Level 3 it's usually free; older learners can use an Advanced Learner Loan, which is written off if you finish a degree.",
"cost": "funded",
"price": "Free for most 19–23s; loan available for 24+",
"qual": "Access to HE Diploma (Level 3)",
"accreditation": "QAA-regulated Access to HE Diploma",
"mode": "in-person",
"reach": "luton",
"place": "Barnfield College, Luton",
"lat": 51.8986,
"lng": -0.4236,
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+",
"Interview and screening tests"
],
"outcome": "demand",
"outcomeText": "Leads to university and professions such as nursing and teaching.",
"duration": "1 year",
"live": "intake",
"apply": "Apply through Barnfield's part-time / adult courses.",
"link": "https://www.barnfield.ac.uk/adult-learning",
"tags": [
"education",
"health",
"helping"
],
"checks": [
"Barnfield adult learning page lists Access to HE"
]
},
{
"id": "lbc-apprentice",
"title": "Luton Council apprenticeships",
"provider": "Luton Borough Council",
"sector": "office",
"summary": "The council is one of Luton's biggest employers and takes apprentices across departments, for example Customer Services Advisor (revenues and benefits), Event Assistant (advertised at £25,185) and warehouse/materials roles.",
"cost": "earn",
"price": "Apprentice wage; some roles advertised at £25,185",
"qual": "Level 2–3 apprenticeships (e.g. Customer Service, Business Admin, Events)",
"accreditation": "Government apprenticeship standards; council's in-house provider is Luton Adult Learning (Ofsted Good)",
"mode": "in-person",
"reach": "luton",
"place": "Luton Town Hall and council sites",
"lat": 51.8787,
"lng": -0.42,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See each advert"
],
"outcome": "job",
"outcomeText": "Employed by the council; may move into permanent roles.",
"duration": "12–24 months",
"live": "rolling",
"apply": "Watch the council jobs site, or email lbcapprenticeships@luton.gov.uk.",
"link": "https://www.luton.gov.uk/jobs-careers/training-apprenticeships",
"tags": [
"office",
"customer",
"public"
],
"checks": [
"Council apprentice adverts 2025–2026"
]
},
{
"id": "nhs-nursing-assoc",
"title": "Clinical Support Worker to Nursing Associate apprenticeship",
"provider": "Bedfordshire Hospitals NHS Foundation Trust",
"sector": "health",
"summary": "Start as a paid Clinical Support Worker, then move onto a fully funded Nursing Associate apprenticeship with the University of Bedfordshire (Luton campus). You finish with a Foundation Degree and NMC registration as a Nursing Associate (Band 4, about £27,485–£30,162).",
"cost": "earn",
"price": "£24,937–£26,598 while training; tuition fully funded",
"qual": "Level 5 Foundation Degree; NMC-registered Nursing Associate",
"accreditation": "NHS; Nursing and Midwifery Council; University of Bedfordshire",
"mode": "in-person",
"reach": "luton",
"place": "Luton & Dunstable Hospital / Bedford Hospital",
"lat": 51.8987,
"lng": -0.4733,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"GCSE English and maths (grade 4/C) or equivalent",
"Care or customer-facing experience helps"
],
"outcome": "job",
"outcomeText": "Route to a registered Nursing Associate post and on to nursing.",
"demand": "Health has 26 priority occupations in Skills England's 2026 report.",
"duration": "About 27 months plus assessment",
"live": "intake",
"apply": "Search 'Nursing Associate Apprenticeship' on NHS Jobs (yearly intake for September).",
"link": "https://www.jobs.nhs.uk/",
"tags": [
"health",
"care",
"helping"
],
"checks": [
"Feb 2026 advert for Sept 2026 start"
]
},
{
"id": "active-library-apprentice",
"title": "Team Leader apprenticeship (libraries)",
"provider": "Active Luton",
"sector": "customer",
"summary": "A Level 3 Customer Services Specialist apprenticeship leading a team in Luton's libraries, run by Active Luton.",
"cost": "earn",
"price": "Apprentice wage",
"qual": "Level 3 Customer Service Specialist",
"accreditation": "Government apprenticeship standard",
"mode": "in-person",
"reach": "luton",
"place": "Luton libraries (LU3 2NL)",
"lat": 51.911,
"lng": -0.446,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See advert"
],
"outcome": "job",
"outcomeText": "Employed during the apprenticeship.",
"duration": "15 months",
"live": "intake",
"apply": "Active Luton careers / Find an apprenticeship.",
"link": "https://www.findapprenticeship.service.gov.uk/apprenticeship/VAC2000048433",
"tags": [
"customer",
"office",
"management"
],
"checks": [
"Advert Aug 2026"
]
},
{
"id": "early-years-apprentice",
"title": "Early Years Practitioner apprenticeship (Luton nurseries)",
"provider": "Luton nurseries, e.g. Mini Scholars (LU2 7SR)",
"sector": "childcare",
"summary": "Nurseries in Luton take apprentices all year. You work with children while studying for an early years qualification that counts in staff ratios.",
"cost": "earn",
"price": "Apprentice wage",
"qual": "Level 2 or 3 Early Years apprenticeship",
"accreditation": "Government apprenticeship standard; Ofsted-registered nurseries",
"mode": "in-person",
"reach": "luton",
"place": "Luton nurseries",
"lat": 51.893,
"lng": -0.405,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"DBS check",
"GCSE requirements vary"
],
"outcome": "job",
"outcomeText": "Employed from day one.",
"duration": "12–18 months",
"live": "running",
"apply": "Search 'Early Years apprentice Luton' on Find an apprenticeship (Mini Scholars advert closes 27 Nov 2026).",
"link": "https://www.findapprenticeship.service.gov.uk/apprenticeship/VAC2000061133",
"tags": [
"children",
"helping"
],
"checks": [
"Advert posted Oct 2026"
]
},
{
"id": "qs-apprentice",
"title": "Quantity Surveying Technician apprenticeship (Luton)",
"provider": "Training and Apprenticeships in Construction (Luton, LU1 2NQ)",
"sector": "construction",
"summary": "An office-based construction apprenticeship working out costs and materials for building projects, based in central Luton. A good construction route if you prefer numbers to site work.",
"cost": "earn",
"price": "Apprentice wage",
"qual": "Level 3 Construction Quantity Surveying Technician",
"accreditation": "Government apprenticeship standard",
"mode": "in-person",
"reach": "luton",
"place": "Luton LU1 2NQ",
"lat": 51.8806,
"lng": -0.4196,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See advert"
],
"outcome": "job",
"outcomeText": "Employed during the apprenticeship.",
"duration": "About 2 years",
"live": "intake",
"apply": "Find an apprenticeship (ref WIL-0010-26; watch for the next one).",
"link": "https://www.findapprenticeship.service.gov.uk/apprenticeship/VAC2000032845",
"tags": [
"construction",
"office"
],
"checks": [
"Advert July 2026"
]
},
{
"id": "anglian-water",
"title": "Anglian Water apprenticeships (largest-ever intake)",
"provider": "Anglian Water and its alliances",
"sector": "engineering",
"summary": "Anglian Water's biggest apprenticeship drive, across the East of England including Bedfordshire: water treatment technicians, maintenance, tanker drivers, data and quantity surveying. It starts from £18,000, rising to £23,500 in year two, and 87% of apprentices are still there after 10 years.",
"cost": "earn",
"price": "From £18,000, rising to £23,500",
"qual": "Level 3 technician apprenticeships up to degree level",
"accreditation": "Government apprenticeship standards",
"mode": "in-person",
"reach": "nearby",
"place": "Sites across the East of England (some in Bedfordshire)",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Right to work in the UK (no sponsorship)"
],
"outcome": "job",
"outcomeText": "Full-time job at the end, subject to reviews.",
"duration": "2–5 years",
"live": "intake",
"apply": "Anglian Water careers (operational apprenticeships), usually advertised from February.",
"link": "https://www.anglianwater.co.uk/news/apprentices-2026",
"tags": [
"engineering",
"trades",
"outdoors",
"driving"
],
"checks": [
"2026 drive announced Feb 2026"
]
},
{
"id": "ukpn-apprentice",
"title": "UK Power Networks craft apprenticeship (cable jointer, linesperson, fitter)",
"provider": "UK Power Networks",
"sector": "engineering",
"summary": "A 2–3 year Level 3 Power Industry Craftsperson apprenticeship keeping the electricity network running in the East and South East. Training is at UKPN training centres, with accommodation provided when needed.",
"cost": "earn",
"price": "Paid apprenticeship",
"qual": "Level 3 Power Industry Craftsperson",
"accreditation": "Government apprenticeship standard",
"mode": "in-person",
"reach": "nearby",
"place": "Depots across the East of England",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See expression of interest page"
],
"outcome": "job",
"outcomeText": "Employed throughout; skilled craft job at the end.",
"duration": "2–3 years",
"live": "intake",
"apply": "Register your interest on UK Power Networks careers.",
"link": "https://careers.ukpowernetworks.co.uk/job/Apprentice-Vari/1423855600/",
"tags": [
"engineering",
"trades",
"outdoors"
],
"checks": [
"Expression of interest open Aug 2026"
]
},
{
"id": "whitbread-hq",
"title": "Whitbread head office apprenticeships (Dunstable)",
"provider": "Whitbread (Premier Inn), Whitbread Court, Dunstable",
"sector": "office",
"summary": "Entry-level apprenticeships at Whitbread's head office on the Luton/Dunstable border, for local people. A 2025 HR apprenticeship paid £25,000, with bonus, BUPA and up to 60% off Premier Inn.",
"cost": "earn",
"price": "Advertised at £25,000 (not an apprentice-rate wage)",
"qual": "Level 3+ apprenticeships (e.g. People/HR)",
"accreditation": "Government apprenticeship standards",
"mode": "in-person",
"reach": "nearby",
"place": "Whitbread Court, Houghton Regis LU5 5XE",
"lat": 51.91,
"lng": -0.505,
"ageMin": 18,
"residency": [
"luton",
"cbeds"
],
"eligibility": [
"Aged 18+ by start",
"Living locally in Dunstable or Luton",
"5 GCSEs grade 4+ and a Level 3"
],
"outcome": "job",
"outcomeText": "Employed by a FTSE 100 company.",
"duration": "About 18–24 months",
"live": "intake",
"apply": "Whitbread careers, usually advertised in spring for a September start.",
"link": "https://www.whitbreadcareers.com/",
"tags": [
"office",
"business"
],
"checks": [
"2025 adverts; graduate scheme 2026"
]
},
{
"id": "premierinn-apprentice",
"title": "Premier Inn and Beefeater jobs with apprenticeships (no experience needed)",
"provider": "Whitbread (Premier Inn, Beefeater, Brewers Fayre)",
"sector": "hospitality",
"summary": "Housekeeping, kitchen and restaurant jobs in Luton and Dunstable hotels and restaurants with no experience needed and no zero-hours contracts. Whitbread offers apprenticeships (Level 2 to 5) for every hourly-paid hotel role and every kitchen role, paid at the normal wage, not the apprentice rate.",
"cost": "earn",
"price": "Up to about £12.56 an hour; apprenticeships paid at normal rate",
"qual": "Level 2 Production Chef, Hospitality Team Member, up to Level 5 management",
"accreditation": "Government apprenticeship standards (delivered with Lifetime Training)",
"mode": "in-person",
"reach": "luton",
"place": "Premier Inns and Beefeaters in Luton and Dunstable",
"lat": 51.884,
"lng": -0.447,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"No experience needed"
],
"outcome": "job",
"outcomeText": "Hired first; apprenticeship available once you're in.",
"duration": "Ongoing",
"live": "rolling",
"apply": "Whitbread careers; search Luton or Dunstable.",
"link": "https://www.whitbreadcareers.com/",
"tags": [
"hospitality",
"customer",
"hands-on"
],
"checks": [
"2025–2026 Luton/Dunstable adverts"
]
},
{
"id": "train-driver",
"title": "Trainee train driver (now open from age 18)",
"provider": "Train operators, e.g. Govia Thameslink Railway",
"sector": "logistics",
"summary": "Since a 2026 law change, 18-year-olds can apply to train as train drivers straight from school or college. GTR's trainee programme lasts about 18 months on a Level 3 Train Driver apprenticeship and was advertised with a £31,000 starting salary. Recruitment opens in waves, often as talent pools.",
"cost": "earn",
"price": "Paid from the start (GTR advertised £31,000)",
"qual": "Level 3 Train Driver apprenticeship and licence",
"accreditation": "Office of Rail and Road licence; apprenticeship standard",
"mode": "in-person",
"reach": "nearby",
"place": "Depots on the Thameslink route (e.g. Luton, Cricklewood, Bedford)",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Aged 18+",
"Pass psychometric and medical assessments"
],
"outcome": "job",
"outcomeText": "Employed throughout training.",
"duration": "About 18 months",
"live": "ask",
"apply": "Watch GTR careers for trainee driver talent pools; competition is high.",
"link": "https://www.gov.uk/government/news/just-got-your-gcse-results-your-next-stop-could-be-the-train-drivers-seat",
"tags": [
"driving",
"travel"
],
"checks": [
"GOV.UK law change 2026",
"GTR programme details from press releases"
]
},
{
"id": "bfi-academy",
"title": "BFI Film Academy (free filmmaking courses, 16 to 19)",
"provider": "British Film Institute (BFI Film Academy hubs)",
"sector": "creative",
"summary": "Free hands-on filmmaking courses for 16 to 19 year olds (up to 25 with an EHC plan), run by regional hubs across the UK, plus specialist residentials in editing, production management and programming. If there's no course in your town, BFI offers travel bursaries so you can join the nearest one. Alumni get industry opportunities until age 25.",
"cost": "free",
"price": "Free; travel bursaries available",
"qual": "BFI Film Academy certificate and a finished short film",
"accreditation": "National programme funded by the Department for Education and the National Lottery",
"mode": "in-person",
"reach": "uk",
"worthTrip": true,
"place": "Regional hubs (South East hub led by Screen South; London residentials)",
"ageMin": 16,
"ageMax": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Aged 16–19 on the first day (up to 25 with an EHC plan)",
"UK resident",
"Passion for film; no experience needed"
],
"outcome": "support",
"outcomeText": "Industry contacts, mentoring and a route into screen careers.",
"duration": "Short courses (weeks) or week-long residentials",
"live": "intake",
"apply": "Applications for introductory courses usually open around September to November; check the BFI Film Academy page.",
"link": "https://www.bfi.org.uk/bfi-film-academy-opportunities-young-creatives/bfi-film-academy-short-courses",
"tags": [
"creative",
"young"
],
"checks": [
"2026–27 courses running across hubs",
"Applications open Nov 2026 for some hubs"
],
"travel": "Short residential and online sessions. London residentials are about 30–40 minutes from Luton by Thameslink, and travel help is often available."
},
{
"id": "beds-fire-wholetime",
"title": "Wholetime firefighter",
"provider": "Bedfordshire Fire and Rescue Service",
"sector": "public",
"summary": "Full-time firefighter with full training. Pay starts at £30,384 while in development, rising to £38,881 when competent. Bedfordshire runs a 24-hours-on, 72-hours-off shift pattern.",
"cost": "earn",
"price": "£30,384 in development, rising to £38,881",
"qual": "Firefighter development programme",
"accreditation": "Fire and rescue authority",
"mode": "in-person",
"reach": "luton",
"place": "Stations across Bedfordshire",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Live in Bedfordshire or within 10 miles of the county boundary when you apply",
"Fitness, written and practical tests"
],
"outcome": "job",
"outcomeText": "Employed from the start of training.",
"duration": "Initial training, then about 2–3 years in development",
"live": "intake",
"apply": "Watch the Bedfordshire Fire careers page; the last wholetime window closed Feb 2026.",
"link": "https://www.bedsfire.gov.uk/careers",
"tags": [
"public",
"helping",
"hands-on"
],
"checks": [
"Wholetime campaign Jan–Feb 2026"
]
},
{
"id": "beds-fire-oncall",
"title": "On-call firefighter (part time, alongside your job)",
"provider": "Bedfordshire Fire and Rescue Service",
"sector": "public",
"summary": "Paid, part-time firefighter role you do alongside your main job, responding from your local station. Full training is given. Recent campaigns ran recruitment through the year, with training starting in January 2027.",
"cost": "earn",
"price": "Paid retainer plus pay for call-outs",
"qual": "Firefighter training",
"accreditation": "Fire and rescue authority",
"mode": "in-person",
"reach": "nearby",
"place": "Your nearest on-call station in Bedfordshire",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford"
],
"eligibility": [
"Live or work within about 6 minutes of an on-call station"
],
"outcome": "job",
"outcomeText": "Paid role with full training.",
"duration": "Initial training course",
"live": "rolling",
"apply": "Register your interest on the on-call page.",
"link": "https://www.bedsfire.gov.uk/careers/oncall",
"tags": [
"public",
"helping"
],
"checks": [
"2026 campaign with Jan 2027 training start"
]
},
{
"id": "sse-programmes",
"title": "School for Social Entrepreneurs: free programmes and grants",
"provider": "School for Social Entrepreneurs (national charity)",
"sector": "business",
"summary": "Free learning programmes for people starting or running a business that does good in the community, often with a grant. In 2026 these included Trading for Good (community business), the Social Investment Gateway (12 months with up to £24,000), a Women's Enterprise Growth Programme, and Grow! for young people (grants up to £15,000).",
"cost": "free",
"price": "Free; many come with grants",
"qual": "No qualification; learning programme",
"accreditation": "National charity",
"mode": "blended",
"reach": "online",
"place": "Online and in person",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Varies by programme (individuals, charities, social enterprises)"
],
"outcome": "business",
"outcomeText": "Funding and support to start or grow a social venture.",
"duration": "Usually 6–12 months",
"live": "intake",
"apply": "Register interest on the SSE site; deadlines in 2026 included April, July and November.",
"link": "https://www.the-sse.org/",
"tags": [
"business",
"helping"
],
"checks": [
"Multiple 2026 deadlines"
]
},
{
"id": "unltd",
"title": "UnLtd Awards for social entrepreneurs",
"provider": "UnLtd (foundation for social entrepreneurs)",
"sector": "business",
"summary": "Funding plus a support manager, free legal advice and peer sessions for people starting a social venture. UnLtd backed 122 new social entrepreneurs in one 2026 quarter, and opens application rounds several times a year.",
"cost": "free",
"price": "Free; award funding",
"qual": "No qualification",
"accreditation": "National foundation",
"mode": "online",
"reach": "online",
"place": "Online, UK-wide",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Starting or developing a social venture"
],
"outcome": "business",
"outcomeText": "Funding and one-to-one coaching.",
"duration": "Award period with ongoing support",
"live": "intake",
"apply": "Apply when an award round opens (rounds closed June and August 2026).",
"link": "https://unltd.org.uk/",
"tags": [
"business",
"helping"
],
"checks": [
"2026 rounds"
]
},
{
"id": "sia-aegis",
"title": "SIA Door Supervisor course at Aegis Training Luton",
"provider": "Aegis Training Luton Ltd (booked via Hurak)",
"sector": "security",
"summary": "A 6-day SIA Door Supervisor course at Surety House on the Kingsway Industrial Estate. Aegis Support Services is a security employer that sponsored the 2026 Luton Apprenticeship Awards, so training here puts you in front of a local security company.",
"cost": "paid",
"price": "From £269.99 all inclusive, plus £204 SIA licence fee",
"priceFrom": 270,
"discounts": [
"Free through a Jobcentre SWAP if you're on benefits",
"Emergency First Aid can be bundled"
],
"qual": "Level 2 Award for Door Supervisors (SIA licence-linked)",
"accreditation": "SIA-approved course (check the awarding body named on your certificate)",
"mode": "in-person",
"reach": "luton",
"place": "Surety House, Kingsway, Luton LU1 1LP",
"lat": 51.884,
"lng": -0.438,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Aged 18+",
"Emergency First Aid at Work certificate before starting (or bundled)"
],
"outcome": "demand",
"outcomeText": "Security employers in Luton recruit licensed staff.",
"duration": "6 days, 10am–6:30pm",
"live": "running",
"apply": "Book through the course page and ask Aegis about work after you qualify.",
"link": "https://hurak.com/course-locations/door-supervisor-course-in-luton",
"tags": [
"security",
"events"
],
"checks": [
"Dates from Aug 2026 listed",
"Aegis named as 2026 Luton Apprenticeship Awards sponsor"
]
},
{
"id": "sia-george-st",
"title": "SIA Door Supervisor course, George Street, Luton",
"provider": "Security Training Solutions Ltd (booked via Hurak)",
"sector": "security",
"summary": "A 6-day Door Supervisor course in Luton town centre, a 2-minute walk from The Mall. Dates ran from July through December 2026.",
"cost": "paid",
"price": "From about £199–£250 all inclusive, plus £204 SIA licence fee",
"priceFrom": 199,
"discounts": [
"Free through a Jobcentre SWAP if you're on benefits"
],
"qual": "Level 2 Award for Door Supervisors",
"accreditation": "SIA-approved course (check the awarding body on your certificate)",
"mode": "in-person",
"reach": "luton",
"place": "85–87 George Street, Luton LU1 2AT",
"lat": 51.879,
"lng": -0.418,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Aged 18+",
"Emergency First Aid at Work certificate"
],
"outcome": "demand",
"outcomeText": "Door, event and retail security work.",
"duration": "6 days, 8:30am–5:30pm",
"live": "running",
"apply": "Book on the course page.",
"link": "https://hurak.com/course-locations/door-supervisor-course-in-luton",
"tags": [
"security",
"events",
"nightlife"
],
"checks": [
"Dates Jul–Dec 2026"
]
},
{
"id": "efaw-farley",
"title": "Emergency First Aid at Work (Level 3), Luton venue",
"provider": "ProTrainings (TQUK-accredited course)",
"sector": "first-aid",
"summary": "A blended Level 3 Emergency First Aid at Work course: online theory, then a practical session in Luton (2026 sessions were held at Farley Junior Academy). This is the certificate SIA door supervisors and many employers need.",
"cost": "paid",
"price": "Ask at booking",
"qual": "TQUK Level 3 Award in Emergency First Aid at Work (RQF)",
"accreditation": "TQUK (Ofqual-regulated)",
"mode": "blended",
"reach": "luton",
"place": "Farley Junior Academy, Northdrift Way, Luton LU1 5JF",
"lat": 51.867,
"lng": -0.442,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Open to anyone"
],
"outcome": "demand",
"outcomeText": "Needed for SIA licences and workplace first aider roles.",
"duration": "Online part plus a 3-hour practical",
"live": "running",
"apply": "Book a classroom session on the ProTrainings site.",
"link": "https://www.protrainings.uk/",
"tags": [
"first-aid",
"security"
],
"checks": [
"Luton session July 2026 listed with RQF code"
]
},
{
"id": "armed-forces-gap",
"title": "Armed Forces Foundation (paid 'gap year' in the forces, under 25s)",
"provider": "Ministry of Defence (Army, Royal Navy, RAF)",
"sector": "public",
"summary": "A new government scheme giving under-25s a paid year of training and work experience in the forces, with no commitment to stay afterwards. Around 150 places in the first intake from 2026; for example, work with Army supply chain specialists or Royal Navy engineers.",
"cost": "earn",
"price": "Paid placement",
"qual": "Military training and work experience",
"accreditation": "Ministry of Defence (GOV.UK announcement)",
"mode": "in-person",
"reach": "uk",
"worthTrip": true,
"place": "Forces bases across the UK",
"ageMin": 16,
"ageMax": 24,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Under 25",
"Forces medical and fitness standards"
],
"outcome": "job",
"outcomeText": "Paid year with training; option to join full time.",
"duration": "About a year (Army model includes 13 weeks basic training)",
"live": "intake",
"apply": "Check the Armed Forces careers sites for the Foundation scheme.",
"link": "https://www.gov.uk/government/news/armed-forces-to-launch-gap-year-scheme-for-young-people-to-bolster-skills-and-leadership",
"tags": [
"public",
"young",
"hands-on"
],
"checks": [
"GOV.UK announcement; pilot from March 2026"
],
"travel": "Basic training happens at a forces base (for example Pirbright or Catterick). Travel to training is arranged and paid for by the forces."
},
{
"id": "army-apprentice",
"title": "Army, Royal Navy and RAF apprenticeships",
"provider": "UK Armed Forces",
"sector": "public",
"summary": "The armed forces are the UK's biggest apprenticeship provider, with more than 100 programmes from GCSE to Masters level and over 13,000 people starting qualifications each year. Some Army roles don't need formal qualifications, and you're paid from day one.",
"cost": "earn",
"price": "Paid from day one",
"qual": "Apprenticeships Level 2 to degree (e.g. logistics, engineering, IT)",
"accreditation": "Government apprenticeship standards",
"mode": "in-person",
"reach": "uk",
"worthTrip": true,
"place": "Training establishments across the UK",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Varies by role; some need no formal qualifications",
"Medical and fitness standards"
],
"outcome": "job",
"outcomeText": "Employed from day one.",
"duration": "Basic training then 1–4 year apprenticeship",
"live": "rolling",
"apply": "Apply on the Army, Royal Navy or RAF careers sites, or ask your work coach.",
"link": "https://www.gov.uk/government/news/armed-forces-careers-unlocked-for-tens-of-thousands-through-new-recruitment-drive",
"tags": [
"public",
"hands-on",
"engineering",
"young"
],
"checks": [
"GOV.UK press release; live apprenticeship adverts 2026"
],
"travel": "Training is at Army training establishments (for example Harrogate or Pirbright). The Army arranges and pays for travel to training."
},
{
"id": "cisco-netacad",
"title": "Cisco Networking Academy free courses (networking, cyber, Python)",
"provider": "Cisco",
"sector": "digital",
"summary": "Free self-paced online courses with Cisco certificates and digital badges, such as Introduction to Cybersecurity (about 15 hours), Networking Basics, Python and Data Analytics Essentials. A good free starting point before an IT bootcamp or apprenticeship.",
"cost": "free",
"price": "Free (industry exams cost extra)",
"qual": "Cisco certificate of completion / digital badge",
"accreditation": "Industry provider (not Ofqual)",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 13,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Anyone; create a free account"
],
"outcome": "support",
"outcomeText": "Builds a foundation for IT and cyber routes.",
"duration": "15–70 hours per course",
"live": "running",
"apply": "Sign up free on Cisco Networking Academy (Skills for All).",
"link": "https://www.netacad.com/",
"tags": [
"tech"
],
"checks": [
"Free courses listed in 2026"
]
},
{
"id": "ibm-skillsbuild",
"title": "IBM SkillsBuild (free AI, data, cyber and cloud courses)",
"provider": "IBM",
"sector": "digital",
"summary": "Hundreds of free online courses in AI, cybersecurity, data analysis and cloud, many ending in an IBM digital badge you can add to your CV or LinkedIn.",
"cost": "free",
"price": "Free",
"qual": "IBM digital badges",
"accreditation": "Industry provider (not Ofqual)",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 13,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Anyone"
],
"outcome": "support",
"outcomeText": "CV booster for tech roles.",
"duration": "Self-paced",
"live": "running",
"apply": "Sign up free on IBM SkillsBuild.",
"link": "https://skillsbuild.org/",
"tags": [
"tech"
],
"checks": [
"Free courses listed in 2026"
]
},
{
"id": "openlearn",
"title": "OpenLearn free courses (The Open University)",
"provider": "The Open University",
"sector": "starting-out",
"summary": "Hundreds of free short courses from the Open University on almost any subject, with a free Statement of Participation when you finish. A gentle way to try a subject before paying for a qualification.",
"cost": "free",
"price": "Free",
"qual": "Statement of Participation / digital badge (not a formal qualification)",
"accreditation": "The Open University",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 13,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Anyone"
],
"outcome": "support",
"outcomeText": "Try a subject; useful for personal statements and CVs.",
"duration": "1–24 hours per course",
"live": "running",
"apply": "Pick a course on OpenLearn.",
"link": "https://www.open.edu/openlearn/",
"tags": [
"any",
"education"
],
"checks": [
"Long-running free platform"
]
},
{
"id": "taxi-licence",
"title": "Private hire / taxi driver licence (Luton)",
"provider": "Luton Council Licensing Service",
"sector": "logistics",
"summary": "To drive a private hire car or hackney carriage in Luton you need a council driver licence. You pass a knowledge test at the Town Hall (places, journeys, conditions, numeracy and the Highway Code), get a Group 2 medical and enhanced DBS, and complete safeguarding and disability training. It's a self-employed route; budget for fees, and a licensed vehicle if you use your own (a private hire vehicle licence was £382.90).",
"cost": "paid",
"price": "Council fees listed in the 2026/27 driver application pack",
"priceFrom": 300,
"qual": "Luton Council private hire / hackney carriage driver licence",
"accreditation": "Local authority licence",
"mode": "in-person",
"reach": "luton",
"place": "Luton Town Hall, George Street LU1 2BQ",
"lat": 51.8787,
"lng": -0.418,
"ageMin": 21,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Full driving licence (check the council policy for how long)",
"Right to work in the UK",
"Pass the knowledge test, DVLA Group 2 medical and enhanced DBS"
],
"outcome": "business",
"outcomeText": "Work for yourself through a licensed operator.",
"duration": "Weeks, depending on tests and checks",
"live": "rolling",
"apply": "Read the council's licensing policy, then book the knowledge test online. Contact licensing@luton.gov.uk or 01582 546040.",
"link": "https://www.luton.gov.uk/business-licences-permits/licences-permits/taxi-private-hire-licences/drivers-licence",
"tags": [
"driving",
"business"
],
"checks": [
"2026/27 application packs published"
]
},
{
"id": "teacher-training",
"title": "Train to teach (bursaries or a salaried route)",
"provider": "Department for Education (Get Into Teaching) with universities and schools",
"sector": "education",
"summary": "If you have a degree you can train as a teacher with a tax-free bursary or scholarship (up to £29,000 in 2026/27 for chemistry, computing, maths and physics), or take a salaried route such as the postgraduate teaching apprenticeship, where the school pays you and covers the training.",
"cost": "funded",
"price": "Bursaries up to £29,000; salaried routes pay you",
"qual": "Qualified Teacher Status (QTS), often with a PGCE",
"accreditation": "Department for Education",
"mode": "in-person",
"reach": "nearby",
"place": "Universities and schools near Luton (e.g. University of Bedfordshire)",
"ageMin": 21,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Undergraduate degree",
"GCSE English and maths (science for primary)"
],
"outcome": "job",
"outcomeText": "Teachers are in demand, especially in shortage subjects.",
"duration": "About 1 year",
"live": "intake",
"apply": "Start on the Get Into Teaching site; applications open each autumn.",
"link": "https://www.gov.uk/government/publications/funding-initial-teacher-training-itt/funding-initial-teacher-training-itt-academic-year-2026-to-2027",
"tags": [
"education",
"children",
"helping"
],
"checks": [
"GOV.UK 2026/27 funding guidance"
]
},
{
"id": "gen-itsupport",
"title": "IT Support bootcamp (free, online, 10–12 weeks)",
"sector": "digital",
"summary": "A free full-time online bootcamp training you for IT support roles, with cyber security basics. Generation provides laptops and wifi if you need them, and graduates have had guaranteed interviews with employers. Some cohorts are local or women-only, so check eligibility.",
"qual": "Bootcamp certificate (industry-aligned)",
"mode": "online",
"reach": "online",
"place": "Online, 9am–5pm with cameras on",
"eligibility": [
"Aged 18+",
"Unemployed or on a zero-hours contract",
"Right to work in the UK",
"Some cohorts restricted by area or to women"
],
"duration": "10–12 weeks full time",
"apply": "See open IT Support cohorts on Generation's 'find a career' page.",
"link": "https://uk.generation.org/find-a-career",
"checks": [
"Cohorts starting Sept 2026"
],
"provider": "Generation UK (registered charity)",
"cost": "free",
"price": "Free; you can stay on Universal Credit",
"accreditation": "Registered charity; outcomes published in a DWP Employment Data Lab report",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"outcome": "interview",
"outcomeText": "Matched interviews with Generation's employer partners after the bootcamp.",
"live": "intake",
"tags": [
"tech"
]
},
{
"id": "gen-hca",
"title": "Trainee Healthcare Assistant bootcamp (free)",
"sector": "health",
"summary": "A free 4–5 week online programme preparing you to work as a healthcare assistant or healthcare support worker, then supporting you into job interviews with care and NHS employers.",
"qual": "Bootcamp certificate",
"mode": "online",
"reach": "online",
"place": "Online",
"eligibility": [
"Aged 18+",
"Unemployed or zero-hours",
"Right to work in the UK"
],
"duration": "4–5 weeks",
"apply": "Generation 'find a career' page.",
"link": "https://uk.generation.org/find-a-career",
"checks": [
"Healthcare programme listed 2026"
],
"provider": "Generation UK (registered charity)",
"cost": "free",
"price": "Free; you can stay on Universal Credit",
"accreditation": "Registered charity; outcomes published in a DWP Employment Data Lab report",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"outcome": "interview",
"outcomeText": "Matched interviews with Generation's employer partners after the bootcamp.",
"live": "intake",
"tags": [
"health",
"care",
"helping"
]
},
{
"id": "gen-solar",
"title": "Solar Installer bootcamp (free, hybrid)",
"sector": "engineering",
"summary": "A free 6-week hybrid programme to start a career installing solar panels, with in-person learning in Tottenham, North London, and the rest online.",
"qual": "Bootcamp certificate",
"mode": "blended",
"reach": "uk",
"worthTrip": true,
"place": "Tottenham, North London plus online",
"lat": 51.588,
"lng": -0.072,
"travel": "Train from Luton to London, then Victoria line to Tottenham Hale (about an hour).",
"eligibility": [
"Aged 18+",
"Unemployed or zero-hours",
"Some cohorts are for London residents, so check"
],
"duration": "6 weeks",
"apply": "Generation 'find a career' page.",
"link": "https://uk.generation.org/find-a-career",
"checks": [
"Programme listed 2026"
],
"provider": "Generation UK (registered charity)",
"cost": "free",
"price": "Free; you can stay on Universal Credit",
"accreditation": "Registered charity; outcomes published in a DWP Employment Data Lab report",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"outcome": "interview",
"outcomeText": "Matched interviews with Generation's employer partners after the bootcamp.",
"live": "intake",
"tags": [
"engineering",
"trades",
"outdoors"
]
},
{
"id": "gen-retrofit",
"title": "Retrofit Advisor bootcamp (green jobs)",
"sector": "engineering",
"summary": "A free programme to qualify as a Retrofit Advisor, assessing homes for energy improvements, with interviews with Generation's employer partners. Generation quotes starting salaries of around £24,000.",
"qual": "Retrofit Advisor certification",
"mode": "online",
"reach": "online",
"place": "Online",
"eligibility": [
"Aged 18+",
"Unemployed or zero-hours"
],
"duration": "Several weeks",
"apply": "Email retrofitprogramme@generation.org or check open cohorts.",
"link": "https://uk.generation.org/faqs/",
"checks": [
"Programme contact listed on FAQs"
],
"provider": "Generation UK (registered charity)",
"cost": "free",
"price": "Free; you can stay on Universal Credit",
"accreditation": "Registered charity; outcomes published in a DWP Employment Data Lab report",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"outcome": "interview",
"outcomeText": "Matched interviews with Generation's employer partners after the bootcamp.",
"live": "intake",
"tags": [
"engineering",
"office",
"outdoors"
]
},
{
"id": "aldi-apprentice",
"title": "Aldi store and warehouse apprenticeships",
"provider": "Aldi UK",
"sector": "customer",
"summary": "Aldi opened 500 paid apprenticeships in 2026 across stores and warehouses, paying £12.02 an hour outside the M25 from day one with paid breaks. There are Store Management Apprentice roles in Luton (LU2) and Dunstable.",
"cost": "earn",
"price": "£12.02 an hour for store apprentices (outside M25)",
"qual": "Retail apprenticeships (Career Starter 1 year; Store Management 3 years)",
"accreditation": "Government apprenticeship standards",
"mode": "in-person",
"reach": "luton",
"place": "Aldi stores in Luton and Dunstable",
"lat": 51.894,
"lng": -0.405,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See advert"
],
"outcome": "job",
"outcomeText": "Employed from day one.",
"duration": "1–3 years",
"live": "intake",
"apply": "Aldi careers (apprenticeships).",
"link": "https://www.aldirecruitment.co.uk/",
"tags": [
"customer",
"management",
"warehouse"
],
"checks": [
"500 apprenticeships announced 2026"
]
},
{
"id": "lidl-degree",
"title": "Lidl Retail Leadership Degree Apprenticeship (Luton region)",
"provider": "Lidl GB with Kingston University",
"sector": "customer",
"summary": "A 4-year paid degree apprenticeship ending with a BSc (Hons) and the skills to run your own Lidl store. Advertised at £27,040–£37,333 for the Luton region. The 2026 window has closed; the next opens in January 2027.",
"cost": "earn",
"price": "£27,040–£37,333; degree fully paid",
"qual": "BSc (Hons) Retail Leadership degree apprenticeship",
"accreditation": "Kingston University degree; government apprenticeship standard",
"mode": "in-person",
"reach": "luton",
"place": "Lidl stores in the Luton region",
"ageMin": 17,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"GCSE maths and English (Level 2)"
],
"outcome": "job",
"outcomeText": "Route to store manager.",
"duration": "4 years",
"live": "intake",
"apply": "Apply on Lidl's apprenticeships page when it reopens in January 2027.",
"link": "https://careers.lidl.co.uk/early-careers/apprenticeships",
"tags": [
"customer",
"management",
"business"
],
"checks": [
"Lidl page: reopens Jan 2027"
]
},
{
"id": "tesco-stronger",
"title": "Tesco Stronger Starts retail apprenticeship (with The King's Trust)",
"provider": "Tesco with The King's Trust",
"sector": "customer",
"summary": "A retail apprenticeship for people new to work, with one-to-one pastoral support from The King's Trust and a dedicated apprenticeship coach. East of England roles were advertised in 2026.",
"cost": "earn",
"price": "Paid apprenticeship",
"qual": "Retail apprenticeship",
"accreditation": "Government apprenticeship standard; delivered with Lifetime Training",
"mode": "in-person",
"reach": "nearby",
"place": "Tesco stores in the East of England",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Above school leaving age by September",
"Not already qualified in retail at NVQ/diploma level",
"Not previously employed by Tesco"
],
"outcome": "job",
"outcomeText": "Employed throughout, with mentoring.",
"duration": "About 12 months",
"live": "intake",
"apply": "Tesco careers (Stronger Starts).",
"link": "https://careers.tesco.com/",
"tags": [
"customer",
"young",
"confidence"
],
"checks": [
"East of England advert, closing Jun 2026"
]
},
{
"id": "farmfoods-manager",
"title": "Apprentice Store Manager (Luton)",
"provider": "Farmfoods",
"sector": "customer",
"summary": "Learn to run a shop: after 3–6 months of training you take responsibility for the Luton store with support from your area manager. Advertised at £31,392 a year for 45 hours.",
"cost": "earn",
"price": "Advertised at £31,392 a year",
"qual": "Retail management apprenticeship",
"accreditation": "Government apprenticeship standard",
"mode": "in-person",
"reach": "luton",
"place": "Farmfoods, Luton LU1 2TE",
"lat": 51.88,
"lng": -0.424,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Shift work including weekends"
],
"outcome": "job",
"outcomeText": "You run the store once trained.",
"duration": "About 12–18 months",
"live": "intake",
"apply": "Search 'Farmfoods Apprentice Store Manager Luton' on Find an apprenticeship.",
"link": "https://www.findapprenticeship.service.gov.uk/apprenticeship/reference/2000049509",
"tags": [
"customer",
"management"
],
"checks": [
"Adverts April and Aug 2026"
]
},
{
"id": "lal-functional-english",
"title": "Functional Skills English (free for adults)",
"provider": "Luton Adult Learning",
"sector": "starting-out",
"summary": "Improve your reading, writing and speaking for work, at Entry level up to Level 2. Many jobs, apprenticeships and courses ask for Level 2 English.",
"cost": "funded",
"price": "Free for most Luton residents",
"qual": "Functional Skills English (Entry–Level 2)",
"accreditation": "Ofsted Good council provider; DfE funded; Ofqual-regulated qualifications",
"mode": "in-person",
"reach": "luton",
"place": "Arndale House, Luton Point, LU1 2LJ",
"lat": 51.879,
"lng": -0.417,
"ageMin": 19,
"residency": [
"luton"
],
"eligibility": [
"Luton residents aged 19+",
"Proof of address and UK residency"
],
"outcome": "support",
"outcomeText": "Unlocks jobs and further courses.",
"duration": "Termly courses",
"live": "running",
"apply": "Call 01582 490033 or email info@lutonacl.ac.uk.",
"link": "https://www.lutonacl.ac.uk/find-a-course",
"tags": [
"any",
"office"
],
"checks": [
"Subject listed on LAL site 2026"
]
},
{
"id": "lal-functional-maths",
"title": "Functional Skills maths and numeracy (free for adults)",
"provider": "Luton Adult Learning",
"sector": "starting-out",
"summary": "Build everyday and work maths, from improving numeracy up to Level 2, which many employers and apprenticeships ask for.",
"cost": "funded",
"price": "Free for most Luton residents",
"qual": "Functional Skills Maths (Entry–Level 2)",
"accreditation": "Ofsted Good council provider; DfE funded; Ofqual-regulated qualifications",
"mode": "in-person",
"reach": "luton",
"place": "Arndale House, Luton Point, LU1 2LJ",
"lat": 51.879,
"lng": -0.417,
"ageMin": 19,
"residency": [
"luton"
],
"eligibility": [
"Luton residents aged 19+",
"Proof of address and UK residency"
],
"outcome": "support",
"outcomeText": "Unlocks jobs and further courses.",
"duration": "Termly courses",
"live": "running",
"apply": "Call 01582 490033 or email info@lutonacl.ac.uk.",
"link": "https://www.lutonacl.ac.uk/find-a-course",
"tags": [
"any",
"office"
],
"checks": [
"Subject listed on LAL site 2026"
]
},
{
"id": "lal-digital",
"title": "Essential Digital Skills and ICT courses",
"provider": "Luton Adult Learning",
"sector": "digital",
"summary": "Learn to use computers, email, online forms and office software confidently, from complete beginner upwards.",
"cost": "funded",
"price": "Free for most Luton residents",
"qual": "Essential Digital Skills / ICT qualifications",
"accreditation": "Ofsted Good council provider; DfE funded; Ofqual-regulated qualifications",
"mode": "in-person",
"reach": "luton",
"place": "Arndale House, Luton Point, LU1 2LJ",
"lat": 51.879,
"lng": -0.417,
"ageMin": 19,
"residency": [
"luton"
],
"eligibility": [
"Luton residents aged 19+",
"Proof of address and UK residency"
],
"outcome": "support",
"outcomeText": "Unlocks jobs and further courses.",
"duration": "Termly courses",
"live": "running",
"apply": "Call 01582 490033 or email info@lutonacl.ac.uk.",
"link": "https://www.lutonacl.ac.uk/find-a-course",
"tags": [
"tech",
"office",
"any"
],
"checks": [
"Subject listed on LAL site 2026"
]
},
{
"id": "lal-esol",
"title": "ESOL (English for speakers of other languages)",
"provider": "Luton Adult Learning",
"sector": "language",
"summary": "English classes from beginner to advanced, including ESOL Skills for Work, at Arndale House. Courses run termly (e.g. 15 weeks, Tuesdays).",
"cost": "funded",
"price": "Free for most Luton residents",
"qual": "ESOL awards and certificates",
"accreditation": "Ofsted Good council provider; DfE funded; Ofqual-regulated qualifications",
"mode": "in-person",
"reach": "luton",
"place": "Arndale House, Luton Point, LU1 2LJ",
"lat": 51.879,
"lng": -0.417,
"ageMin": 19,
"residency": [
"luton"
],
"eligibility": [
"Luton residents aged 19+",
"Proof of address and UK residency"
],
"outcome": "support",
"outcomeText": "Unlocks jobs and further courses.",
"duration": "Termly courses",
"live": "running",
"apply": "Call 01582 490033 or email info@lutonacl.ac.uk.",
"link": "https://www.lutonacl.ac.uk/find-a-course",
"tags": [
"language",
"any"
],
"checks": [
"Subject listed on LAL site 2026"
]
},
{
"id": "lal-step-early-years",
"title": "Step into Early Years and Becoming a Childcare Practitioner",
"provider": "Luton Adult Learning",
"sector": "childcare",
"summary": "Free introductory childcare courses (about Level 1) at Arndale House. They're the first step towards a Level 2 or 3 early years qualification and nursery work.",
"cost": "funded",
"price": "Free for most Luton residents",
"qual": "Introductory childcare course (around Level 1)",
"accreditation": "Ofsted Good council provider; DfE funded; Ofqual-regulated qualifications",
"mode": "in-person",
"reach": "luton",
"place": "Arndale House, Luton Point, LU1 2LJ",
"lat": 51.879,
"lng": -0.417,
"ageMin": 19,
"residency": [
"luton"
],
"eligibility": [
"Luton residents aged 19+",
"Proof of address and UK residency"
],
"outcome": "support",
"outcomeText": "Unlocks jobs and further courses.",
"duration": "Termly courses",
"live": "running",
"apply": "Call 01582 490033 or email info@lutonacl.ac.uk.",
"link": "https://www.lutonacl.ac.uk/find-a-course",
"tags": [
"children",
"helping"
],
"checks": [
"Subject listed on LAL site 2026"
]
},
{
"id": "fa-playmaker",
"title": "England Football Playmaker (free) and Introduction to Coaching Football",
"provider": "The FA / England Football",
"sector": "sport",
"summary": "Playmaker is a free online starter course for anyone 14+ who wants to help run grassroots football. It leads to Introduction to Coaching Football (online, 4 weeks, about £100–£160), and the FA gives 20% of those places free through its Fully Funded Places Programme.",
"cost": "free",
"price": "Playmaker free; Intro to Coaching about £100–£160 (20% of places fully funded)",
"priceFrom": 0,
"discounts": [
"Apply for a fully funded place on Introduction to Coaching Football"
],
"qual": "Introduction to Coaching Football (replaces FA Level 1); leads to UEFA C",
"accreditation": "The Football Association",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 14,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Playmaker: 14+",
"Intro to Coaching: 16+, Playmaker done first"
],
"outcome": "support",
"outcomeText": "Route into paid coaching at clubs, schools and community trusts.",
"duration": "Playmaker a few hours; Intro 4 weeks",
"live": "running",
"apply": "Start Playmaker on England Football Learning.",
"link": "https://thebootroom.thefa.com/learning/qualifications/fa-level-1-in-coaching-football",
"tags": [
"sport",
"children",
"young"
],
"checks": [
"FA course page 2026"
]
},
{
"id": "network-rail",
"title": "Rail Engineering Technician apprenticeship (Luton is a location)",
"provider": "Network Rail",
"sector": "engineering",
"summary": "A 3-year Level 3 apprenticeship maintaining track, signals and overhead lines, with Luton listed as one of the locations in 2026. It pays £21,477, and Network Rail was ranked 4th in the government's Top 100 Apprenticeship Employers 2026.",
"cost": "earn",
"price": "£21,477 a year",
"qual": "Level 3 Engineering Technician (rail)",
"accreditation": "Government apprenticeship standard",
"mode": "in-person",
"reach": "luton",
"place": "Network Rail depot, Luton (also Bedford and London)",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See advert (usually GCSE maths, English and science)"
],
"outcome": "job",
"outcomeText": "Many apprentices progress to senior engineering roles.",
"duration": "3 years",
"live": "intake",
"apply": "Applications usually open January to April on Network Rail early careers.",
"link": "https://www.findapprenticeship.service.gov.uk/apprenticeship/VAC2000011528",
"tags": [
"engineering",
"trades",
"outdoors"
],
"checks": [
"2026 advert listing Luton; DfE Top 100 2026"
]
},
{
"id": "dwp-workcoach",
"title": "Jobcentre Work Coach (paid training, Bedfordshire)",
"provider": "Department for Work and Pensions",
"sector": "public",
"summary": "Help people into work as a Jobcentre Work Coach. You're trained on the job. Bedfordshire and Hertfordshire campaigns have included Luton, with salaries around £29,500–£32,137 and a strong civil service pension.",
"cost": "earn",
"price": "About £29,500–£32,137",
"qual": "Civil service training",
"accreditation": "Civil Service",
"mode": "in-person",
"reach": "luton",
"place": "Luton Jobcentre",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Customer service experience helps",
"Civil service checks"
],
"outcome": "job",
"outcomeText": "Permanent civil service job.",
"duration": "Induction then on the job",
"live": "intake",
"apply": "Search 'Work Coach Luton' on Civil Service Jobs.",
"link": "https://www.civilservicejobs.service.gov.uk/",
"tags": [
"public",
"helping",
"office"
],
"checks": [
"Bedfordshire campaigns 2024–2026"
]
},
{
"id": "dwp-sma",
"title": "DWP Social Mobility Apprenticeship",
"provider": "Department for Work and Pensions",
"sector": "public",
"summary": "Civil service apprenticeships for people who are registered unemployed and have limited experience or low qualifications, for example Public Sector Compliance Officer (Level 3). DWP has offered over 3,000 of these over 13 years, and many lead to permanent roles.",
"cost": "earn",
"price": "Civil service apprentice salary",
"qual": "Level 3 apprenticeships (e.g. Public Sector Compliance Officer)",
"accreditation": "Government apprenticeship standard",
"mode": "in-person",
"reach": "nearby",
"place": "DWP sites (ask your work coach for local intakes)",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Registered unemployed",
"Limited work experience, low qualifications or other barriers"
],
"outcome": "job",
"outcomeText": "Many move into permanent Civil Service roles.",
"duration": "12–18 months",
"live": "intake",
"apply": "Ask your Jobcentre work coach about the next Social Mobility Apprenticeship intake.",
"link": "https://gfie.blog.gov.uk/2026/02/09/opening-doors-with-the-dwp-social-mobility-apprenticeship",
"tags": [
"public",
"office",
"confidence"
],
"checks": [
"GOV.UK blog Feb 2026"
]
},
{
"id": "working-chance",
"title": "Working Chance (job support for women with convictions)",
"provider": "Working Chance (national charity)",
"sector": "starting-out",
"summary": "The UK's only employment charity just for women with convictions. You get your own support worker for your CV, interviews, and how to talk to employers about a conviction, plus help into education and training.",
"cost": "free",
"price": "Free",
"qual": "No qualification; one-to-one support",
"accreditation": "Registered charity; Howard League Organisation of the Year 2022",
"mode": "online",
"reach": "online",
"place": "Remote support (England and Wales)",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"forWho": "women",
"eligibility": [
"Women with a criminal conviction in England or Wales"
],
"outcome": "support",
"outcomeText": "Help into jobs, training or education.",
"duration": "Ongoing",
"live": "rolling",
"apply": "Self-refer on the Working Chance 'Get support' page.",
"link": "https://workingchance.org/get-support",
"tags": [
"confidence",
"any"
],
"checks": [
"Charity recruiting coaches in 2026"
]
},
{
"id": "access-to-work",
"title": "Access to Work grant (disability or health condition)",
"provider": "Department for Work and Pensions",
"sector": "starting-out",
"summary": "A government grant that pays for practical support so you can start, stay in or move into work, including self-employment, if you have a disability, health condition or mental health condition. It can cover equipment, travel to work, a support worker or communication support at interview.",
"cost": "free",
"price": "Grant (does not need paying back)",
"qual": "Not a course; funding for support",
"accreditation": "UK Government (GOV.UK)",
"mode": "online",
"reach": "online",
"place": "Apply online",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Disability or health condition, including mental health",
"Have a job, job offer, interview or self-employment"
],
"outcome": "support",
"outcomeText": "Removes practical barriers at work.",
"duration": "Ongoing",
"live": "rolling",
"apply": "Apply on GOV.UK (Access to Work).",
"link": "https://www.gov.uk/access-to-work",
"tags": [
"any",
"confidence"
],
"checks": [
"DWP research report June 2026"
]
},
{
"id": "bg-gas-apprentice",
"title": "British Gas apprentice gas engineer, metering and electrician roles",
"provider": "British Gas (Centrica)",
"sector": "trades",
"summary": "Paid apprenticeships training you at British Gas's academies as a gas service and repair engineer, smart meter engineer or electrician, including roles advertised around Dunstable. A legitimate way to Gas Safe registration without paying for a course.",
"cost": "earn",
"price": "Paid apprenticeship",
"qual": "Gas engineering / metering / electrical apprenticeship; Gas Safe registration",
"accreditation": "Government apprenticeship standards",
"mode": "in-person",
"reach": "nearby",
"place": "British Gas academies and patches near Dunstable",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See advert; full driving licence often needed"
],
"outcome": "job",
"outcomeText": "Qualified engineer role at the end.",
"duration": "1–3 years",
"live": "intake",
"apply": "Search apprenticeships on Life at Centrica.",
"link": "https://www.lifeatcentrica.com/",
"tags": [
"trades",
"hands-on"
],
"checks": [
"2026 apprentice adverts (gas, metering, electrician)"
]
},
{
"id": "in2-gas",
"title": "Gas and heating apprenticeship (Bedford)",
"provider": "IN2 Plumbing Ltd",
"sector": "trades",
"summary": "Train as a plumbing and heating engineer working on boilers and heating systems across Bedfordshire, becoming Gas Safe registered by the end. Advertised at £18,720 a year.",
"cost": "earn",
"price": "£18,720 a year",
"qual": "Gas and heating apprenticeship; Gas Safe registration",
"accreditation": "Government apprenticeship standard (via Bedford College)",
"mode": "in-person",
"reach": "nearby",
"place": "Biddenham, Bedford MK40 4WS",
"lat": 52.136,
"lng": -0.513,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See advert"
],
"outcome": "job",
"outcomeText": "Qualified engineer with the company.",
"duration": "About 3–4 years",
"live": "intake",
"apply": "Search 'IN2 Plumbing' on Find an apprenticeship.",
"link": "https://www.findapprenticeship.service.gov.uk/apprenticeship/VAC2000027462",
"tags": [
"trades",
"hands-on"
],
"checks": [
"Advert April 2026"
]
},
{
"id": "aden-groundworker",
"title": "Groundworker apprenticeship (Bedfordshire)",
"provider": "Aden Contracting Ltd",
"sector": "construction",
"summary": "An apprenticeship in groundworks (foundations, drainage and site preparation) with a Bedfordshire contractor.",
"cost": "earn",
"price": "Apprentice wage",
"qual": "Groundworker apprenticeship",
"accreditation": "Government apprenticeship standard",
"mode": "in-person",
"reach": "nearby",
"place": "Bedfordshire (MK42)",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See advert"
],
"outcome": "job",
"outcomeText": "Employed during the apprenticeship.",
"duration": "About 2 years",
"live": "intake",
"apply": "Find an apprenticeship.",
"link": "https://www.findapprenticeship.service.gov.uk/apprenticeship/reference/2000042985",
"tags": [
"construction",
"outdoors",
"hands-on"
],
"checks": [
"Advert July 2026"
]
},
{
"id": "royal-mail",
"title": "Postperson (no experience needed, training given)",
"provider": "Royal Mail",
"sector": "logistics",
"summary": "Delivery roles with training, often with a van, plus routes into trainee manager roles and Royal Mail apprenticeship schemes. Advertised regularly around Bedford and Luton.",
"cost": "earn",
"price": "Paid from day one",
"qual": "Employer training",
"accreditation": "Employer",
"mode": "in-person",
"reach": "nearby",
"place": "Delivery offices around Luton and Bedford",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Driving licence for driving roles"
],
"outcome": "job",
"outcomeText": "Hired first, then trained.",
"duration": "Induction",
"live": "rolling",
"apply": "Royal Mail careers.",
"link": "https://www.royalmailgroup.com/en/careers/",
"tags": [
"driving",
"outdoors",
"warehouse"
],
"checks": [
"Bedford adverts 2026"
]
},
{
"id": "nhs-estates-apprentice",
"title": "Hospital estates apprenticeships (electrician and maintenance)",
"provider": "Bedfordshire Hospitals NHS Foundation Trust",
"sector": "trades",
"summary": "Apprenticeships keeping the hospitals running, for example a 4-year apprentice electrician on Band 3 apprenticeship pay (about £22,000 in year 1, rising after).",
"cost": "earn",
"price": "Band 3 apprenticeship pay (about £22k year 1)",
"qual": "Level 3 electrical / maintenance apprenticeship",
"accreditation": "NHS; government apprenticeship standard",
"mode": "in-person",
"reach": "nearby",
"place": "Bedford Hospital (and Luton & Dunstable)",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See advert"
],
"outcome": "job",
"outcomeText": "NHS employment throughout.",
"duration": "4 years",
"live": "intake",
"apply": "Search 'Apprentice' at Bedfordshire Hospitals on NHS Jobs.",
"link": "https://www.jobs.nhs.uk/",
"tags": [
"trades",
"hands-on",
"health"
],
"checks": [
"2025 estates apprentice adverts"
]
},
{
"id": "barnfield-plumbing",
"title": "Level 2 Diploma in Plumbing Studies (evening, part time)",
"provider": "Barnfield College",
"sector": "trades",
"summary": "An evening plumbing course for adults (Wednesdays and Thursdays, 6–9pm, 33 weeks), starting September 2026. A recognised first step toward plumbing work, best combined with site experience or an apprenticeship.",
"cost": "paid",
"price": "£1,359 (may be free or loan-funded depending on age, income and prior qualifications)",
"priceFrom": 1359,
"discounts": [
"Ask about Free Courses for Jobs or Advanced Learner Loan",
"Admissions: 01582 569 569"
],
"qual": "City & Guilds Level 2 Diploma in Plumbing Studies",
"accreditation": "Ofqual-regulated awarding body; FE college",
"mode": "in-person",
"reach": "luton",
"place": "Barnfield College, Luton",
"lat": 51.8986,
"lng": -0.4236,
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Adults 19+"
],
"outcome": "demand",
"outcomeText": "Plumbers and heating engineers are in demand; site experience is needed to qualify fully.",
"duration": "33 weeks, 2 evenings a week",
"live": "running",
"apply": "Apply on Barnfield's part-time course page.",
"link": "https://www.barnfield.ac.uk/courses/part-time/plumbing/level-2-diploma-plumbing-studies",
"tags": [
"trades",
"hands-on",
"construction"
],
"checks": [
"Sept 2026 start listed with fee"
]
},
{
"id": "barnfield-electrical",
"title": "Level 2 Diploma in Electrical Installation (adults)",
"provider": "Barnfield College",
"sector": "trades",
"summary": "The college route into electrical work: Level 2 Diploma in Electrical Installation for adults, with Level 3 Inspection and Testing (2391-52) for those already working. This is a proper qualification, not a fast-track course, but you still need site experience and the NVQ/AM2 to become fully qualified.",
"cost": "paid",
"price": "Ask admissions (funding may apply)",
"qual": "Level 2 Diploma in Electrical Installation: Buildings & Structures",
"accreditation": "City & Guilds (Ofqual-regulated); FE college",
"mode": "in-person",
"reach": "luton",
"place": "Barnfield College, Luton",
"lat": 51.8986,
"lng": -0.4236,
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Adults 19+"
],
"outcome": "demand",
"outcomeText": "First step; combine with an electrical mate job or apprenticeship.",
"duration": "1 year part time",
"live": "intake",
"apply": "Barnfield adult professional qualifications 2026/27; admissions 01582 569 569.",
"link": "https://www.barnfield.ac.uk/whats-on/news/adult-professional-qualifications-26-27-applications-now-open",
"tags": [
"trades",
"hands-on"
],
"checks": [
"2026/27 adult professional list"
]
},
{
"id": "barnfield-barbering",
"title": "Level 2 Award in Cutting Men's Hair (barbering starter)",
"provider": "Barnfield College",
"sector": "creative",
"summary": "An 18-week part-time barbering starter course at Barnfield's salon, for people who want to start cutting hair professionally.",
"cost": "paid",
"price": "£159",
"priceFrom": 159,
"qual": "Level 2 Award in Cutting Men's Hair",
"accreditation": "Ofqual-regulated awarding body; FE college salon",
"mode": "in-person",
"reach": "luton",
"place": "Barnfield College, Luton",
"lat": 51.8986,
"lng": -0.4236,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Check entry criteria on the course page"
],
"outcome": "business",
"outcomeText": "Route to barbershop work or self-employment.",
"duration": "18 weeks",
"live": "intake",
"apply": "Register your interest for the next intake on the course page.",
"link": "https://www.barnfield.ac.uk/courses/part-time/hairdressing/level-2-award-in-cutting-mens-hair",
"tags": [
"creative",
"business",
"hands-on"
],
"checks": [
"Course page with fee; next dates to be announced"
]
},
{
"id": "cbc-luton",
"title": "Free English, maths and employability courses at Dallow Road, Luton",
"provider": "Central Bedfordshire College (The Bedford College Group)",
"sector": "starting-out",
"summary": "The Bedford College Group runs adult Functional Skills English and maths at its Luton centre (Dallow Road Community Centre) as well as in Dunstable. Essential skills are free if you don't already have Level 2, and employability courses are free if you're unemployed, on Universal Credit or earning under £25,000.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Functional Skills English/maths; GCSEs for adults",
"accreditation": "FE college group (Ofsted-inspected)",
"mode": "in-person",
"reach": "luton",
"place": "Dallow Road Community Centre, 234 Dallow Rd, Luton LU1 1TB",
"lat": 51.886,
"lng": -0.438,
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Aged 19+",
"No Level 2 in the subject, or unemployed / on UC / earning under £25k for employability courses"
],
"outcome": "support",
"outcomeText": "Unlocks jobs and further training.",
"duration": "Various starts",
"live": "running",
"apply": "Apply on the Bedford College Group adult courses pages.",
"link": "https://bedfordcollegegroup.ac.uk/study/adult-students/employability-at-tbcg/",
"tags": [
"any",
"office"
],
"checks": [
"Course pages list Dallow (Luton) delivery"
]
},
{
"id": "cbc-engage",
"title": "Level 1 Engage programme (full time, free)",
"provider": "Central Bedfordshire College",
"sector": "starting-out",
"summary": "A free full-time Level 1 programme at the Houghton Learning Hub, starting September 2026, for people who need a supported step back into learning. All full-time Level 1 and 2 courses at the college are free whatever your age.",
"cost": "free",
"price": "Free",
"qual": "Level 1 study programme",
"accreditation": "FE college group",
"mode": "in-person",
"reach": "nearby",
"place": "Houghton Learning Hub, Houghton Regis",
"lat": 51.905,
"lng": -0.518,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Anyone needing a Level 1 start"
],
"outcome": "support",
"outcomeText": "Progression onto Level 2 courses or work.",
"duration": "1 year",
"live": "intake",
"apply": "Apply on the course page.",
"link": "https://bedfordcollegegroup.ac.uk/courses/level-1-engage-programme-full-time-gj018h11p1/",
"tags": [
"any",
"young",
"confidence"
],
"checks": [
"Sept 2026 start listed"
]
},
{
"id": "elft-hcsw",
"title": "Mental health Health Care Support Worker (Luton)",
"provider": "East London NHS Foundation Trust",
"sector": "health",
"summary": "Band 3 support worker roles on mental health wards across Luton and Bedford, with training and supervision. ELFT describes it as an ideal first job in mental health for people with life experience. Advertised at £24,937–£27,476.",
"cost": "earn",
"price": "About £24,937–£27,476 a year",
"qual": "NHS training on the job",
"accreditation": "NHS employer",
"mode": "in-person",
"reach": "luton",
"place": "ELFT sites in Luton (LU1 2PJ and others)",
"lat": 51.878,
"lng": -0.423,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Experience in a care setting",
"Good communication skills"
],
"outcome": "job",
"outcomeText": "Employed by the NHS; routes into nursing and therapy roles.",
"duration": "Induction then on the job",
"live": "rolling",
"apply": "Search 'Health Care Support Worker ELFT Luton' on NHS Jobs.",
"link": "https://www.jobs.nhs.uk/",
"tags": [
"health",
"care",
"helping"
],
"checks": [
"Adverts Dec 2025 to Aug 2026"
]
},
{
"id": "elft-ota",
"title": "Occupational Therapy Assistant (Luton, mental health)",
"provider": "East London NHS Foundation Trust",
"sector": "health",
"summary": "Band 3 assistant role supporting occupational therapists in Bedfordshire mental health services, on wards and in the community. It's a good stepping stone toward an Occupational Therapy degree apprenticeship.",
"cost": "earn",
"price": "£25,760–£27,476 a year",
"qual": "On-the-job NHS training",
"accreditation": "NHS employer",
"mode": "in-person",
"reach": "luton",
"place": "ELFT Luton sites (e.g. Oakley Court, LU4)",
"lat": 51.9,
"lng": -0.46,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See advert"
],
"outcome": "job",
"outcomeText": "Employed by the NHS.",
"duration": "Ongoing",
"live": "rolling",
"apply": "NHS Jobs.",
"link": "https://www.jobs.nhs.uk/",
"tags": [
"health",
"helping",
"care"
],
"checks": [
"Adverts March–Aug 2026"
]
},
{
"id": "breaking-barriers",
"title": "Breaking Barriers (employment support for refugees)",
"provider": "Breaking Barriers (charity)",
"sector": "starting-out",
"summary": "Free one-to-one employment support, skills workshops and employer links for refugees, including a partnership with the CareTech Foundation to help refugees into care and health jobs. Supports over 1,300 refugee clients a year from London, Manchester and Birmingham, with remote support.",
"cost": "free",
"price": "Free",
"qual": "No qualification; employability support",
"accreditation": "Registered charity",
"mode": "blended",
"reach": "uk",
"worthTrip": true,
"place": "London office (about 30 min by train) and remote",
"lat": 51.5074,
"lng": -0.1278,
"travel": "Thameslink from Luton to London, about 25–35 minutes.",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Refugees with the right to work"
],
"outcome": "support",
"outcomeText": "Help into jobs, especially care and health.",
"duration": "Ongoing",
"live": "rolling",
"apply": "Contact Breaking Barriers through their website.",
"link": "https://breaking-barriers.co.uk/",
"tags": [
"any",
"care",
"language"
],
"checks": [
"2026 funding and partnerships"
]
},
{
"id": "food-hygiene",
"title": "Level 2 Food Safety / Food Hygiene certificate (online)",
"provider": "Highfield e-learning (and council-run courses)",
"sector": "hospitality",
"summary": "The certificate most kitchens, takeaways and food businesses expect. Highfield's online Level 2 Food Safety costs about £15–£25, and its Food Hygiene Essentials course is free. Some councils run the same Highfield course for about £34.",
"cost": "paid",
"price": "About £15–£25 (free Essentials version)",
"priceFrom": 15,
"discounts": [
"Free Food Hygiene Essentials course from Highfield",
"Free Food Standards Agency allergy training"
],
"qual": "Level 2 Food Safety completion certificate (Highfield)",
"accreditation": "Highfield (the awarding body behind most UK food safety qualifications)",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 14,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Anyone"
],
"outcome": "demand",
"outcomeText": "Needed for kitchen, café, takeaway and catering jobs.",
"duration": "About 4–6 hours",
"live": "running",
"apply": "Buy online from Highfield e-learning.",
"link": "https://www.highfieldelearning.com/products/food-safety-level-2",
"tags": [
"hospitality",
"customer",
"business"
],
"checks": [
"Prices on provider pages 2026"
]
},
{
"id": "mitie-dco-luton",
"title": "Detention Custody Officer at Luton Airport (4 weeks paid training)",
"provider": "Mitie",
"sector": "security",
"summary": "No experience or qualifications needed. Training starts with a fully paid 4-week course that includes control and restraint. Based at Luton Airport on £32,635 for 42 hours a week, with free parking and uniform.",
"cost": "earn",
"price": "£32,635 a year (42 hrs)",
"qual": "Employer training incl. control and restraint",
"accreditation": "Home Office contractor",
"mode": "in-person",
"reach": "luton",
"place": "London Luton Airport, LU2 9NW",
"lat": 51.8763,
"lng": -0.3717,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Strict security vetting",
"Right to work"
],
"outcome": "job",
"outcomeText": "Permanent job from day one.",
"duration": "4-week paid course",
"live": "intake",
"apply": "Search 'Detention Custody Officer Luton' on Mitie careers or Find a Job.",
"link": "https://findajob.dwp.gov.uk/details/18067125",
"tags": [
"security",
"public"
],
"checks": [
"Advert March 2026"
]
},
{
"id": "g4s-luton",
"title": "G4S security officer (SIA licence training provided)",
"provider": "G4S via Staffline",
"sector": "security",
"summary": "G4S has recruited security officers in Luton without an existing licence, providing full SIA licence training. Some G4S roles also give financial support for SIA licence renewals.",
"cost": "earn",
"price": "About £12–£13.50 an hour",
"qual": "SIA Security Guarding licence (paid for by employer)",
"accreditation": "SIA licence; employer",
"mode": "in-person",
"reach": "luton",
"place": "Luton sites",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"18+",
"Background check (usually 5 years)"
],
"outcome": "job",
"outcomeText": "Hired first, then licensed.",
"duration": "Licence course about 1 week",
"live": "ask",
"apply": "Check G4S careers and Staffline for current Luton roles; not every advert includes licence training, so read it carefully.",
"link": "https://careers.g4s.com/",
"tags": [
"security"
],
"checks": [
"Luton advert with licence training (past); 2026 adverts mostly need a licence"
]
},
{
"id": "startup-loans",
"title": "Start Up Loans (government-backed) with 12 months free mentoring",
"provider": "British Business Bank",
"sector": "business",
"summary": "Borrow £500–£25,000 per person at a fixed rate to start or grow a business, with free help writing your business plan and 12 months of free mentoring. Since April 2026 it covers businesses trading up to 5 years. It is a loan, so you must repay it.",
"cost": "free",
"price": "Free support; loan at a fixed rate (check current rate)",
"qual": "Not a course; finance and mentoring",
"accreditation": "UK Government (British Business Bank)",
"mode": "online",
"reach": "online",
"place": "Online, with local delivery partners",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"18+, UK resident",
"Business trading under 5 years",
"Passes affordability checks; no active bankruptcy or IVA"
],
"outcome": "business",
"outcomeText": "Start or grow your own business.",
"duration": "1–5 year loan",
"live": "rolling",
"apply": "Apply at startuploans.co.uk.",
"link": "https://www.startuploans.co.uk/",
"tags": [
"business"
],
"checks": [
"2026 press releases"
]
},
{
"id": "bcg-cisco-cyber",
"title": "Cisco Digital Awareness and Cyber Security (short course)",
"provider": "The Bedford College Group",
"sector": "digital",
"summary": "A 2-week part-time course in digital awareness and cyber security, aimed at office, reception and customer service work. Starts November 2026.",
"cost": "paid",
"price": "£100 enrolment fee",
"priceFrom": 100,
"qual": "Cisco Networking Academy certificate",
"accreditation": "Cisco; FE college",
"mode": "in-person",
"reach": "nearby",
"place": "Bedford College, Bedford",
"lat": 52.13,
"lng": -0.466,
"travel": "Thameslink Luton to Bedford, about 20–25 minutes.",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Adults 19+"
],
"outcome": "support",
"outcomeText": "Basic digital confidence for office jobs.",
"duration": "2 weeks",
"live": "intake",
"apply": "Apply on the course page.",
"link": "https://bedfordcollegegroup.ac.uk/courses/cisco-digital-awareness-and-cyber-security-fb1351/",
"tags": [
"digital",
"office"
],
"checks": [
"Nov 2026 start listed"
]
},
{
"id": "wenta-luton-startup",
"title": "Luton Business Start-Up Programme (free advice, workshops, small grant)",
"provider": "Wenta with Bedfordshire Chamber of Commerce (funded by Luton Council)",
"sector": "business",
"summary": "A free 12-month programme for anyone in Luton who wants to explore self-employment or start a business, including after redundancy. It includes one-to-one advice, CPD-accredited workshops (business plan, branding, websites, bookkeeping, marketing), mentoring after launch, a start-up grant of up to £250 while funds last, and free sole-trader Chamber membership once you launch.",
"cost": "free",
"price": "Free; grant up to £250 (limited)",
"qual": "CPD-accredited workshops",
"accreditation": "Council-funded; Wenta is a not-for-profit since 1983",
"mode": "blended",
"reach": "luton",
"place": "Hart House Business Centre, Luton (adviser weekly) and online",
"lat": 51.883,
"lng": -0.417,
"ageMin": 18,
"residency": [
"luton"
],
"eligibility": [
"Live in Luton"
],
"needs": [
"none"
],
"when": "Workshops and webinars through the year; adviser at Hart House once a week",
"outcome": "business",
"outcomeText": "Help to launch and register your business.",
"duration": "12-month programme",
"live": "running",
"apply": "Register on the Wenta programme page.",
"link": "https://wenta.co.uk/business-advice/business-support-programmes/stellantis-business-start-up-support-for-former-stellantis-employees",
"tags": [
"business"
],
"checks": [
"Programme page and Luton Council listing 2026"
]
},
{
"id": "wenta-central-start",
"title": "Central Start (free start-up support and grants, Central Bedfordshire)",
"provider": "Wenta (Central Bedfordshire Council)",
"sector": "business",
"summary": "Free one-to-one business advice, CPD-accredited training (business plans, cashflow, websites) and access to start-up grants for people in Central Bedfordshire (Dunstable, Houghton Regis, Leighton Buzzard and more) who are starting or have just started a business, including those starting with no money.",
"cost": "free",
"price": "Free; grants subject to eligibility",
"qual": "CPD-accredited training",
"accreditation": "Council-funded; Wenta",
"mode": "blended",
"reach": "nearby",
"place": "Central Bedfordshire and online",
"ageMin": 18,
"residency": [
"cbeds"
],
"eligibility": [
"Live or trade in Central Bedfordshire"
],
"needs": [
"none"
],
"when": "Rolling one-to-ones; workshops through the year",
"outcome": "business",
"outcomeText": "Start-up support and grants.",
"duration": "Ongoing",
"live": "rolling",
"apply": "Contact Wenta (Central Start).",
"link": "https://www.wenta.co.uk/",
"tags": [
"business"
],
"checks": [
"Wenta programme; CBC UKSPF page"
]
},
{
"id": "wenta-online",
"title": "Wenta free online business webinars (open nationally)",
"provider": "Wenta",
"sector": "business",
"summary": "Wenta's online webinars and workshops on starting and running a business are free to anyone in the UK. Its in-person services, including free desk space for start-ups, are free for Bedfordshire, Hertfordshire and Enfield businesses.",
"cost": "free",
"price": "Free",
"qual": "CPD-accredited webinars",
"accreditation": "Not-for-profit social enterprise",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Anyone"
],
"needs": [
"none"
],
"when": "Regular daytime and evening webinars",
"outcome": "business",
"outcomeText": "Skills to run your own business.",
"duration": "1–3 hour sessions",
"live": "running",
"apply": "Book webinars on wenta.co.uk.",
"link": "https://www.wenta.co.uk/",
"tags": [
"business"
],
"checks": [
"Luton Council listing 2026"
]
},
{
"id": "bipc",
"title": "British Library Business & IP Centre (free workshops, one-to-ones, Start-up Day)",
"provider": "British Library",
"sector": "business",
"summary": "Free workshops, webinars and one-to-ones on business planning, market research, finance, trade marks, social media and pitching confidence. Start-up Day runs in London, online and at libraries across the UK. Its market research databases (normally very expensive) are free to use in person.",
"cost": "free",
"price": "Free",
"qual": "No qualification",
"accreditation": "National library",
"mode": "blended",
"reach": "uk",
"worthTrip": true,
"place": "British Library, St Pancras, London NW1 2DB (and online)",
"lat": 51.5299,
"lng": -0.127,
"travel": "Thameslink from Luton to St Pancras International (about 30–35 minutes); the library is next door.",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Anyone"
],
"needs": [
"none"
],
"when": "Daytime and evening workshops most weeks; many also online",
"outcome": "business",
"outcomeText": "Free expert help to plan and research your business.",
"duration": "1–3 hour sessions",
"live": "running",
"apply": "Book free events on events.bl.uk.",
"link": "https://events.bl.uk/whats-on/business-and-ip-centre",
"tags": [
"business"
],
"checks": [
"2026 events listings"
]
},
{
"id": "luton-enterprise-week",
"title": "Luton Enterprise Week (free business events)",
"provider": "Luton Council with partners",
"sector": "business",
"summary": "A week of free business events running 16–20 November 2026, including Meet the Buyer, access to finance, sales, AI and social enterprise workshops. It's delivered with Bedfordshire Chamber, the University of Bedfordshire, Wenta and The Culture Trust.",
"cost": "free",
"price": "Free",
"qual": "No qualification",
"accreditation": "Luton Council",
"mode": "in-person",
"reach": "luton",
"place": "Venues across Luton",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Anyone starting or running a business"
],
"needs": [
"none"
],
"when": "Monday 16 to Friday 20 November 2026",
"outcome": "business",
"outcomeText": "Contacts, buyers and funding advice.",
"duration": "1 week",
"live": "running",
"apply": "See the Luton Council news page for bookings.",
"link": "https://www.luton.gov.uk/news/2026/luton-enterprise-week-returns-champion-enterprise-innovation-opportunity",
"tags": [
"business"
],
"checks": [
"Council news Sept 2026"
]
},
{
"id": "ldb-luton",
"title": "Free business workshops for Luton businesses (Let's Do Business)",
"provider": "Let's Do Business Group (Luton Council contract)",
"sector": "business",
"summary": "Free workshops for Luton-based businesses and entrepreneurs, in person at The Hat Factory and online. Topics include websites, marketing and access to finance (Start Up Loans, growth loans, asset and invoice finance). Luton Council also contracts them to run scale-up support.",
"cost": "free",
"price": "Free",
"qual": "No qualification",
"accreditation": "Council-contracted provider",
"mode": "blended",
"reach": "luton",
"place": "The Hat Factory, Luton and Zoom",
"lat": 51.881,
"lng": -0.415,
"ageMin": 18,
"residency": [
"luton"
],
"eligibility": [
"Business or entrepreneur based in Luton"
],
"needs": [
"none"
],
"when": "Weekday mornings and some Saturday afternoons",
"outcome": "business",
"outcomeText": "Practical skills and finance options.",
"duration": "2–3 hour workshops",
"live": "running",
"apply": "Book on the Let's Do Business Luton workshop pages.",
"link": "https://lets-do-business-group.cademy.io/access-to-finance-luton",
"tags": [
"business"
],
"checks": [
"Jan–Feb 2026 workshops; council contract 2026"
]
},
{
"id": "beds-uni-ukspf",
"title": "University of Bedfordshire free business growth and AI support",
"provider": "University of Bedfordshire (UKSPF)",
"sector": "business",
"summary": "Free support from the university's business school for Bedfordshire and Luton businesses, covering growth, innovation and using AI, plus free workshops such as grant-writing and marketing. Best suited to people who are already trading.",
"cost": "free",
"price": "Free",
"qual": "No qualification",
"accreditation": "University",
"mode": "blended",
"reach": "luton",
"place": "University Square, Luton and online",
"lat": 51.8784,
"lng": -0.4141,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford"
],
"eligibility": [
"Trading business in Luton, Central Beds or Bedford"
],
"needs": [
"none"
],
"when": "Programmes and workshops through the year",
"outcome": "business",
"outcomeText": "Grow an existing business.",
"duration": "Varies",
"live": "ask",
"apply": "Register interest on the UKSPF business support page; check what is currently open.",
"link": "https://www.beds.ac.uk/ris/working-with-us",
"tags": [
"business",
"digital"
],
"checks": [
"Uni page 2026; one programme closed"
]
},
{
"id": "help-to-grow",
"title": "Help to Grow: Management (90% government-funded)",
"provider": "Small Business Charter business schools",
"sector": "business",
"summary": "A 12-week management course with online and in-person sessions, one-to-one mentoring and peer networking. The government covers most of the cost and you pay about £750. It's only for business owners or leaders whose firm has 5–249 staff, so it's not for brand new start-ups.",
"cost": "paid",
"price": "About £750 (90% government-funded)",
"priceFrom": 750,
"qual": "Help to Grow: Management certificate",
"accreditation": "Government scheme; Small Business Charter accredited schools",
"mode": "blended",
"reach": "nearby",
"place": "University of Bedfordshire Business School and others",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"SME with 5–249 employees",
"Senior leader with direct reports"
],
"needs": [
"experience"
],
"when": "12 weeks, mix of half-day sessions",
"outcome": "business",
"outcomeText": "Grow an established small business.",
"duration": "12 weeks",
"live": "intake",
"apply": "Find a course on the Help to Grow website.",
"link": "https://www.smallbusinesscharter.org/help-to-grow-management/",
"tags": [
"business"
],
"checks": [
"2026 cohorts announced (Beds, Surrey)"
]
},
{
"id": "iuk-women-innovation",
"title": "Women in Innovation Awards (Innovate UK)",
"provider": "Innovate UK",
"sector": "business",
"summary": "A competition for women founders of UK start-ups with a genuinely new product or service. Winners get grant funding plus coaching. It's competitive, and the latest round targets late-stage start-ups aiming to raise investment, so it's for founders who already have a business.",
"cost": "free",
"price": "Grant funding (competitive)",
"qual": "Not a course",
"accreditation": "UK Government (UKRI)",
"mode": "online",
"reach": "online",
"place": "Online application",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"forWho": "women",
"eligibility": [
"Woman founder or co-founder of a UK SME",
"Innovative product in a priority sector"
],
"needs": [
"experience"
],
"when": "Annual competition",
"outcome": "business",
"outcomeText": "Funding and coaching to scale.",
"duration": "Award period about a year",
"live": "intake",
"apply": "Watch Find a Grant (GOV.UK) for the next round.",
"link": "https://find-government-grants.service.gov.uk/grants/women-in-innovation-awards-202526-1",
"tags": [
"business"
],
"checks": [
"2025/26 competition on Find a Grant"
]
},
{
"id": "find-a-grant",
"title": "Find a Grant (official government grant search)",
"provider": "GOV.UK",
"sector": "business",
"summary": "The government's own search for open grants, including business, innovation and community grants. It's the safe place to check a grant is real before applying anywhere that asks you for money.",
"cost": "free",
"price": "Free to search",
"qual": "Not a course",
"accreditation": "UK Government",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Varies by grant"
],
"needs": [
"none"
],
"when": "Anytime",
"outcome": "business",
"outcomeText": "Real grants, no fees.",
"duration": "Anytime",
"live": "running",
"apply": "Search on find-government-grants.service.gov.uk.",
"link": "https://find-government-grants.service.gov.uk/",
"tags": [
"business"
],
"checks": [
"Live service 2026"
]
},
{
"id": "hgv-bootcamp",
"title": "Free HGV driving Skills Bootcamp (Cat C / C+E) with guaranteed interview",
"provider": "LearningPlus (PeoplePlus) and other DfE bootcamp providers",
"sector": "logistics",
"summary": "Government-funded HGV licence training, normally worth about £5,000 or more, with a guaranteed job interview at the end. HGV drivers can earn around £30,000–£38,000. You need a full car licence and must pass a medical first.",
"cost": "funded",
"price": "Free if eligible (normally about £5,000+)",
"qual": "Category C or C+E licence",
"accreditation": "DVSA licence; DfE Skills Bootcamp",
"mode": "in-person",
"reach": "nearby",
"place": "Training centres around Bedfordshire, Herts and Milton Keynes",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"19+",
"Full UK car licence",
"Pass HGV medical"
],
"needs": [
"licence"
],
"when": "Up to 16 weeks, mostly weekday daytime",
"outcome": "interview",
"outcomeText": "Guaranteed interview with a haulage employer.",
"demand": "HGV drivers are on the government's shortage list.",
"duration": "Up to 16 weeks",
"live": "intake",
"apply": "Apply with LearningPlus, or check your council's Skills Bootcamp list.",
"link": "https://peopleplus.co.uk/hgv-driver-bootcamps",
"tags": [
"driving",
"logistics"
],
"checks": [
"Provider page 2026"
]
},
{
"id": "afi-hgv",
"title": "Trainee HGV Class 1 driver (free training from the employer)",
"provider": "AFI group of companies",
"sector": "logistics",
"summary": "An employer that trains you to drive HGVs for free and then employs you. Advertised in Milton Keynes, about 30 minutes from Luton.",
"cost": "earn",
"price": "Free training, then paid work",
"qual": "Class 1 (C+E) licence",
"accreditation": "DVSA licence",
"mode": "in-person",
"reach": "nearby",
"place": "Milton Keynes",
"lat": 52.0406,
"lng": -0.7594,
"travel": "About 30–40 minutes by car via the M1; trains run from Luton to MK via Bedford/Leighton Buzzard routes.",
"ageMin": 21,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Car licence",
"Check advert for age and record"
],
"needs": [
"licence"
],
"when": "32–40 hours a week",
"outcome": "job",
"outcomeText": "Driving job with the company.",
"duration": "Varies",
"live": "ask",
"apply": "Apply on the employer's website via the advert.",
"link": "https://www.jobbird.com/uk/job/24634954-free-hgv-training-trainee-hgv-class-1-driver",
"tags": [
"driving",
"logistics"
],
"checks": [
"Advert 2026"
]
},
{
"id": "thames-water",
"title": "Thames Water apprenticeships (Hertfordshire sites)",
"provider": "Thames Water",
"sector": "engineering",
"summary": "Paid apprenticeships at Hertfordshire sites such as Maple Lodge (Rickmansworth) and Hatfield, including mechanical and electrical (Level 3), construction assurance (Level 4) and project management, starting at about £22,500–£23,500. Applications for September starts open each January.",
"cost": "earn",
"price": "About £22,500–£23,500 a year",
"qual": "Level 3 to degree apprenticeships",
"accreditation": "Government apprenticeship standards",
"mode": "in-person",
"reach": "nearby",
"place": "Rickmansworth (WD3) and Hatfield (AL9)",
"travel": "Hatfield is about 25 minutes by car; some roles need a driving licence to travel between sites.",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See each advert; some need a full driving licence"
],
"needs": [
"gcse",
"licence"
],
"when": "4 work days plus 1 training day a week",
"outcome": "job",
"outcomeText": "Permanent contract from day one.",
"duration": "2–5 years",
"live": "intake",
"apply": "Applications open January for September starts on the Thames Water careers site.",
"link": "https://www.findapprenticeship.service.gov.uk/",
"tags": [
"engineering",
"construction",
"outdoors"
],
"checks": [
"2026 adverts; Water Magazine Sept 2025"
]
},
{
"id": "nhc-women-construction",
"title": "Construction and electrical courses for women (adults)",
"provider": "North Hertfordshire College",
"sector": "construction",
"summary": "Women-focused adult courses in construction and electrical skills at the Stevenage campus, usually fully funded. A good confidence-building first step before a trade course or a CSCS card.",
"cost": "funded",
"price": "Free for most people (Tailored Learning funding)",
"qual": "College certificate",
"accreditation": "FE college",
"mode": "in-person",
"reach": "nearby",
"place": "Stevenage Campus",
"lat": 51.9017,
"lng": -0.2019,
"travel": "About 25 minutes by car; or train via Hitchin.",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"forWho": "women",
"eligibility": [
"Adults 19+"
],
"needs": [
"none"
],
"when": "Short part-time courses",
"outcome": "support",
"outcomeText": "Leads onto trade courses.",
"duration": "Short course",
"live": "intake",
"apply": "Email admissions@nhc.ac.uk quoting 'Tailored Learning funding'.",
"link": "https://www.nhc.ac.uk/",
"tags": [
"construction",
"trades",
"hands-on"
],
"checks": [
"College pages 2026"
]
},
{
"id": "nhc-adult",
"title": "Free and funded adult courses in Hitchin and Stevenage",
"provider": "North Hertfordshire College",
"sector": "starting-out",
"summary": "Adult GCSE and Functional Skills English and maths, everyday English for beginners (from September 2026), care and nursing taster courses, cooking and hospitality, and upskilling courses. Many are free depending on eligibility. Hitchin is about 20 minutes from Luton.",
"cost": "funded",
"price": "Free if eligible",
"qual": "GCSEs, Functional Skills, college certificates",
"accreditation": "FE college (Ofsted-inspected)",
"mode": "in-person",
"reach": "nearby",
"place": "Hitchin and Stevenage campuses",
"lat": 51.948,
"lng": -0.283,
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Adults 19+",
"Free tuition depends on circumstances"
],
"needs": [
"none"
],
"when": "Daytime and evening; September and January starts",
"outcome": "support",
"outcomeText": "Qualifications that unlock jobs.",
"duration": "Short courses to 1 year",
"live": "intake",
"apply": "Email admissions@nhc.ac.uk.",
"link": "https://www.nhc.ac.uk/",
"tags": [
"any",
"care",
"hospitality"
],
"checks": [
"2026 course pages"
]
},
{
"id": "bbc-apprentice",
"title": "BBC apprenticeships (production, journalism, tech, business)",
"provider": "BBC",
"sector": "creative",
"summary": "Paid apprenticeships in London and Salford for anyone 18+. Many need no media experience or qualifications. Production roles pay about £22,950 plus £5,441 London weighting. The 2026 round opened on 3 November 2026 and closes about 24 November, and BBC Extend roles are ring-fenced for disabled applicants.",
"cost": "earn",
"price": "About £22,950 + £5,441 London weighting",
"qual": "Level 3–4 apprenticeships (production, coordination, post-production)",
"accreditation": "Government apprenticeship standards",
"mode": "in-person",
"reach": "uk",
"worthTrip": true,
"place": "London (Television Centre, Broadcasting House) and Salford",
"lat": 51.5186,
"lng": -0.1439,
"travel": "Thameslink from Luton to central London is about 30–40 minutes. Salford needs a move or a long commute.",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"18+ by the September start",
"Lived in UK for the last 3 years"
],
"needs": [
"none"
],
"when": "Full time for 13–17 months",
"outcome": "job",
"outcomeText": "Paid role with a top broadcaster; strong CV for media jobs.",
"duration": "13–17 months",
"live": "intake",
"apply": "BBC Careers apprenticeships; check closing dates on each role.",
"link": "https://www.findapprenticeship.service.gov.uk/apprenticeship/reference/2000062227",
"tags": [
"creative",
"media",
"film"
],
"checks": [
"Round opened 3 Nov 2026"
]
},
{
"id": "itv-academy",
"title": "ITV Academy Production Assistant traineeships (fully funded)",
"provider": "ITV Academy",
"sector": "creative",
"summary": "Fully funded nine-month paid placements across ITV Studios labels (Twofour, ITV Sport, The Garden, Multistory, Bright Entertainment). You learn cameras, lighting, studio work and edit prep on real productions.",
"cost": "earn",
"price": "Fully funded paid placement",
"qual": "On-the-job training",
"accreditation": "ITV",
"mode": "in-person",
"reach": "uk",
"worthTrip": true,
"place": "ITV Studios labels (London and other UK bases)",
"travel": "Most London bases are 30–60 minutes from Luton by Thameslink and the Tube.",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See ITV Academy for criteria"
],
"needs": [
"none"
],
"when": "Full time, 9 months",
"outcome": "job",
"outcomeText": "Industry entry and contacts.",
"duration": "9 months",
"live": "intake",
"apply": "Watch ITV Academy (Next Generation Programme) for openings.",
"link": "https://www.itv.com/presscentre/node/59461",
"tags": [
"creative",
"media",
"film"
],
"checks": [
"Launched July 2026"
]
},
{
"id": "lcg-sia-free",
"title": "Free SIA Door Supervisor course with licence included (unemployed 19+)",
"provider": "Learning Curve Group",
"sector": "security",
"summary": "A fully funded Level 2 Door Supervisor course for unemployed adults. It includes the SIA licence fee (worth £190), so you pay nothing to get badged. Ask for the nearest delivery centre to Luton.",
"cost": "funded",
"price": "Free if eligible (licence included)",
"qual": "Level 2 Award for Door Supervisors (SIA)",
"accreditation": "Ofqual-regulated; SIA-approved",
"mode": "in-person",
"reach": "nearby",
"place": "Learning Curve Group centres (ask for nearest)",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"19+",
"Unemployed"
],
"needs": [
"english"
],
"when": "About 6 days classroom",
"outcome": "demand",
"outcomeText": "Door supervisors are needed in pubs, clubs, events and retail.",
"duration": "About 6 days",
"live": "intake",
"apply": "Apply on the course page.",
"link": "https://learningcurvegroup.co.uk/courses/level-2-award-for-door-supervisors-in-the-private-security-industry-sia",
"tags": [
"security"
],
"checks": [
"Course page 2026"
]
},
{
"id": "getlicensed-luton",
"title": "SIA Door Supervisor / Security Guard training in Luton (paid)",
"provider": "Get Licensed",
"sector": "security",
"summary": "A large UK SIA training provider running weekend and weekday courses in Luton. Door Supervisor (6 days) starts at about £249.99 and Security Guard at about £149.99. Use this if you don't qualify for a free course. Add the SIA licence fee (about £190–£220) on top.",
"cost": "paid",
"price": "From about £149.99 (guard) / £249.99 (door supervisor)",
"priceFrom": 150,
"qual": "Level 2 Door Supervisor / Security Officer (SIA)",
"accreditation": "Ofqual-regulated; SIA-approved centre",
"mode": "in-person",
"reach": "luton",
"place": "Luton venues",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"18+",
"Pass SIA criminality check for the licence"
],
"needs": [
"english"
],
"when": "Weekend (Sat–Sun 8am–6pm) and weekday options",
"outcome": "demand",
"outcomeText": "Licensed security work.",
"duration": "4–6 days",
"live": "running",
"apply": "Book on the Get Licensed Luton page.",
"link": "https://www.get-licensed.co.uk/sia-training/luton",
"tags": [
"security"
],
"checks": [
"July 2026 Luton dates"
]
},
{
"id": "sja-free-online",
"title": "Free online first aid learning (add-on)",
"provider": "St John Ambulance",
"sector": "health",
"addon": true,
"summary": "Free online first aid lessons from St John Ambulance with a completion certificate. It's not a regulated workplace qualification, but it's a useful extra on a CV for childcare, sport, care or retail. For a recognised certificate, take Emergency First Aid at Work.",
"cost": "free",
"price": "Free",
"qual": "Certificate of completion (not regulated)",
"accreditation": "St John Ambulance (national charity)",
"mode": "online",
"reach": "online",
"place": "Online",
"ageMin": 12,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Anyone"
],
"needs": [
"none"
],
"when": "Start anytime, at your own pace",
"outcome": "support",
"outcomeText": "CV add-on.",
"duration": "A few hours",
"live": "running",
"apply": "Start on the St John Ambulance website.",
"link": "https://www.sja.org.uk/courses/individuals-community-groups",
"tags": [
"health",
"care",
"sport",
"children"
],
"checks": [
"SJA site 2026"
]
},
{
"id": "sja-volunteer",
"title": "St John Ambulance volunteering (free first aid training)",
"provider": "St John Ambulance",
"sector": "health",
"addon": true,
"summary": "Volunteer as a community first aider and St John trains you for free. It's good experience for nursing, paramedic and care careers. Young people can join from age 10 (Badgers/Cadets), and adults can apply for community roles.",
"cost": "free",
"price": "Free",
"qual": "St John first aid training",
"accreditation": "National charity",
"mode": "in-person",
"reach": "nearby",
"place": "Local St John Ambulance units",
"ageMin": 10,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Volunteer commitment"
],
"needs": [
"none"
],
"when": "Evenings and events, flexible",
"outcome": "support",
"outcomeText": "Experience for health careers.",
"duration": "Ongoing",
"live": "rolling",
"apply": "Apply through the St John Ambulance volunteering pages.",
"link": "https://www.sja.org.uk/",
"tags": [
"health",
"helping",
"young"
],
"checks": [
"Volunteer adverts 2026"
]
},
{
"id": "besa-bootcamps",
"title": "BESA Skills Bootcamps (Central Beds and Bedford residents)",
"provider": "Bedfordshire Employment and Skills Academy (Central Bedfordshire Council)",
"sector": "starting-out",
"summary": "Free intensive courses of up to 16 weeks in digital, construction and green skills, transport and logistics, and early years, backed by £1.5m of 2026 funding. Every bootcamp ends with a guaranteed interview with an employer in that sector, and they're built to fit around family.",
"cost": "funded",
"price": "Free if eligible",
"qual": "Sector qualifications (varies by bootcamp)",
"accreditation": "DfE Skills Bootcamps; council-run",
"mode": "blended",
"reach": "nearby",
"place": "Central Bedfordshire, Bedford and online",
"ageMin": 19,
"residency": [
"cbeds",
"bedford"
],
"eligibility": [
"19+",
"Live in Central Bedfordshire or Bedford Borough"
],
"needs": [
"none"
],
"when": "Flexible, up to 16 weeks",
"outcome": "interview",
"outcomeText": "Guaranteed interview in the same sector.",
"duration": "Up to 16 weeks",
"live": "running",
"apply": "Browse the BESA course directory.",
"link": "https://www.centralbedfordshire.gov.uk/info/203/bedfordshire_employment_and_skills_academy/2138/skills_bootcamps",
"tags": [
"any",
"tech",
"construction",
"driving",
"children"
],
"checks": [
"Council news Jan 2026"
]
},
{
"id": "besa-earlyyears",
"title": "Free early years, teaching assistant and adult care qualifications (Bedford Training Centre)",
"provider": "BESA (Central Bedfordshire Council)",
"sector": "childcare",
"summary": "Free Level 2–3 qualifications for early years, supporting teaching in schools, preparing to work in home-based childcare (childminding) and adult social care, aimed at local jobs. School support courses can otherwise cost up to £150.",
"cost": "funded",
"price": "Free if eligible (otherwise up to £150 for some)",
"qual": "Level 2–3 Certificates/Diplomas",
"accreditation": "Ofqual-regulated awarding bodies; council adult learning",
"mode": "in-person",
"reach": "nearby",
"place": "Bedford Training and Assessment Centre and local schools",
"ageMin": 19,
"residency": [
"cbeds",
"bedford",
"england"
],
"eligibility": [
"19+",
"Funding rules apply"
],
"needs": [
"english"
],
"when": "Fortnightly daytime sessions (e.g. Wednesdays)",
"outcome": "demand",
"outcomeText": "Nursery, school and care jobs.",
"duration": "Several months",
"live": "intake",
"apply": "See BESA adult learning pages.",
"link": "https://www.bedford.gov.uk/schools-education-and-childcare/early-years-and-childcare/bedford-training-and-assessment-centre-2",
"tags": [
"children",
"care"
],
"checks": [
"2025/26 course dates"
]
},
{
"id": "harlow-sia",
"title": "Free SIA security course for jobseekers (Harlow)",
"provider": "Harlow College Bright Futures Training Centre",
"sector": "security",
"summary": "Fully funded SIA security training under the Adult Skills Fund if you're 19+ and unemployed or earning under £25,000. Only worth travelling for if you can't get onto a free course nearer Luton.",
"cost": "funded",
"price": "Free if eligible",
"qual": "SIA Level 2 Award",
"accreditation": "FE college; SIA-approved awarding body",
"mode": "in-person",
"reach": "uk",
"place": "Harlow, Essex",
"lat": 51.77,
"lng": 0.087,
"travel": "About 1 hour by car via the A414.",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"19+",
"Unemployed or earning under £25k"
],
"needs": [
"english"
],
"when": "About 6 days",
"outcome": "demand",
"outcomeText": "Security work.",
"duration": "About 6 days",
"live": "intake",
"apply": "Use the college funding checker on the course page.",
"link": "https://www.harlow-college.ac.uk/study-options/bright-futures-training-centre/item/sia-security",
"tags": [
"security"
],
"checks": [
"Course page 2026"
]
},
{
"id": "wnc-women-construction",
"title": "Women in Construction, free with CSCS card (12 weeks)",
"provider": "West Northamptonshire College",
"sector": "construction",
"summary": "A free 12-week Level 1 course just for women, covering brickwork, joinery, plastering and health and safety. The college pays for the CSCS test and card. Two days a week (Thursdays and Fridays, 9am–4pm), with the next start April 2027.",
"cost": "free",
"price": "Free (incl. CSCS card)",
"qual": "Level 1 Diploma in Construction Skills; Level 1 Health & Safety; CSCS Green Card",
"accreditation": "Ofqual-regulated; FE college",
"mode": "in-person",
"reach": "uk",
"worthTrip": true,
"place": "Northampton",
"lat": 52.2405,
"lng": -0.9027,
"travel": "About 50 minutes by car via the M1 (J15/16); trains via Milton Keynes take about 1 hour 15 minutes.",
"ageMin": 19,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"forWho": "women",
"eligibility": [
"Women 19+",
"New learners only"
],
"needs": [
"none"
],
"when": "Thursdays and Fridays 9am–4pm for 12 weeks",
"outcome": "support",
"outcomeText": "Progress onto a Level 2 trade course or site work.",
"duration": "12 weeks",
"live": "intake",
"apply": "Apply on the course page.",
"link": "https://www.wnc.ac.uk/courses/construction-crafts-and-building-services/women-in-construction-free-level-1",
"tags": [
"construction",
"trades"
],
"checks": [
"April 2027 start listed"
]
},
{
"id": "apex-cscs",
"title": "Free CSCS training and Green Card (London)",
"provider": "The Apex Project",
"sector": "construction",
"summary": "Free 4–5 day courses in London covering Health and Safety in a Construction Environment and CITB test prep, with the CSCS Green Card paid for if you pass. Courses run regularly. Check eligibility, because some are ring-fenced for local or probation referrals.",
"cost": "funded",
"price": "Free if eligible (incl. card)",
"qual": "Level 1 Health & Safety in a Construction Environment; CSCS Green Card",
"accreditation": "CSCS / CITB test",
"mode": "in-person",
"reach": "uk",
"place": "London venues (e.g. NW8, N17)",
"travel": "Thameslink to London, then Tube; about 1 hour.",
"ageMin": 18,
"residency": [
"england"
],
"eligibility": [
"Varies by course; some London-only"
],
"needs": [
"english"
],
"when": "Weekdays for 4–5 days, about monthly",
"outcome": "support",
"outcomeText": "Site-ready for labouring jobs.",
"duration": "4–5 days",
"live": "running",
"apply": "Register interest on their course listings, then they confirm eligibility.",
"link": "https://book.plinth.org.uk/e/0wjQYg1XFP7oUcO5q4eN",
"tags": [
"construction"
],
"checks": [
"Courses Jan–July 2026"
]
},
{
"id": "cera-care",
"title": "Home care assistant (no experience, full training incl. Care Certificate)",
"provider": "Cera Care",
"sector": "care",
"summary": "Paid home care roles across Luton, Central Beds and North Herts at about £13–£13.50 an hour, with no experience needed. You get the Care Certificate and NVQs, plus a free DBS, phone and uniform and paid mileage. Cera says half its salaried roles are filled from inside.",
"cost": "earn",
"price": "About £13–£13.50 an hour",
"qual": "Care Certificate; NVQs",
"accreditation": "CQC-registered care provider",
"mode": "in-person",
"reach": "luton",
"place": "Clients' homes around Luton",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Driving licence and car",
"Right to work"
],
"needs": [
"licence"
],
"when": "Shifts 7am–3pm or 3pm–11pm; every other weekend; part or full time",
"outcome": "job",
"outcomeText": "Hired first, then trained.",
"duration": "Induction then on the job",
"live": "rolling",
"apply": "Apply on Cera's Luton jobs page.",
"link": "https://ceracare.co.uk/jobs/care-assistant-luton-lu1-1fs/8146",
"tags": [
"care",
"helping"
],
"checks": [
"2026 Luton adverts"
]
},
{
"id": "caremark-cbeds",
"title": "Care assistant with free paid training (Dunstable and Leighton Buzzard)",
"provider": "Caremark Central Bedfordshire",
"sector": "care",
"summary": "Home care jobs with full induction and paid-for training, and flexible hours that suit people with families. Advertised pay ranges from about £10.50 to £16.85 an hour depending on role and shift.",
"cost": "earn",
"price": "About £10.50–£16.85 an hour",
"qual": "Induction and ongoing care training",
"accreditation": "CQC-registered franchise",
"mode": "in-person",
"reach": "nearby",
"place": "Dunstable, Leighton Buzzard and Central Beds",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Usually a driver"
],
"needs": [
"licence"
],
"when": "Flexible part-time hours",
"outcome": "job",
"outcomeText": "Paid job with training.",
"duration": "Ongoing",
"live": "rolling",
"apply": "Caremark Central Bedfordshire jobs page.",
"link": "https://www.caremark.co.uk/central-bedfordshire/jobs/",
"tags": [
"care",
"helping"
],
"checks": [
"Vacancies page 2026"
]
},
{
"id": "cch-luton",
"title": "Complex care assistant, nurse-led training (Luton)",
"provider": "CCH group (Advantage Healthcare, Total Community Care)",
"sector": "care",
"summary": "Care roles in Luton at about £13.50–£14 an hour with full nurse-led training and paid induction, a free DBS and clear progression into senior roles. No experience needed for many posts.",
"cost": "earn",
"price": "About £13.50–£14 an hour",
"qual": "Nurse-led clinical care training",
"accreditation": "CQC-registered providers",
"mode": "in-person",
"reach": "luton",
"place": "Luton",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Right to work (no sponsorship)"
],
"needs": [
"none"
],
"when": "Shift patterns vary",
"outcome": "job",
"outcomeText": "Paid role with progression.",
"duration": "Ongoing",
"live": "rolling",
"apply": "Search Luton on cch.careers.",
"link": "https://cch.careers/job-description-sr/REF14259C",
"tags": [
"care",
"health",
"helping"
],
"checks": [
"Adverts July–Sept 2026"
]
},
{
"id": "greene-king-chef",
"title": "Chef and hospitality apprenticeships (Greene King pubs)",
"provider": "Greene King",
"sector": "hospitality",
"summary": "Paid 15-month Production Chef (Level 2), Kitchen Team Leader (Level 3) and Bar and Waiting apprenticeships at pubs near Luton, including Hitchin, Linslade and Bedford. They come with Chef Academy masterclasses and Functional Skills English and maths if you need them. No qualifications are required.",
"cost": "earn",
"price": "Apprenticeship wage (about £253–£381 a week)",
"qual": "Production Chef L2 / Senior Production Chef L3 / Hospitality Team Member L2",
"accreditation": "Government apprenticeship standards (Lifetime Training)",
"mode": "in-person",
"reach": "nearby",
"place": "Pubs in Hitchin (SG5), Linslade (LU7), Bedford (MK41)",
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"None required"
],
"needs": [
"none"
],
"when": "Shift work incl. evenings and weekends, 30 hrs a week",
"outcome": "job",
"outcomeText": "Employed while you train.",
"duration": "15 months",
"live": "rolling",
"apply": "Search 'Greene King' on Find an apprenticeship.",
"link": "https://www.findapprenticeship.service.gov.uk/apprenticeship/VAC2000056232",
"tags": [
"hospitality",
"customer"
],
"checks": [
"Adverts April–Oct 2026"
]
},
{
"id": "whitbread-people",
"title": "Whitbread HR apprenticeship (Dunstable head office)",
"provider": "Whitbread (Premier Inn)",
"sector": "office",
"summary": "An entry-level People team (HR) apprenticeship at Whitbread Court, Dunstable, on £25,000 a year with a fully funded Level 5 HR apprenticeship and CIPD Associate Diploma. It's hybrid, with at least 3 days in the office.",
"cost": "earn",
"price": "£25,000 a year",
"qual": "Level 5 HR apprenticeship + CIPD Associate Diploma",
"accreditation": "CIPD; government apprenticeship standard",
"mode": "blended",
"reach": "nearby",
"place": "Whitbread Court, Dunstable LU5 5XE",
"lat": 51.889,
"lng": -0.505,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"See advert (usually GCSEs)"
],
"needs": [
"gcse"
],
"when": "Hybrid, 3+ days in office",
"outcome": "job",
"outcomeText": "Permanent position.",
"duration": "About 2 years",
"live": "intake",
"apply": "Whitbread careers early careers section (September intakes).",
"link": "https://www.whitbreadcareers.com/",
"tags": [
"office",
"business"
],
"checks": [
"2025 intake; recurring programme"
]
},
{
"id": "barnfield-esol",
"title": "ESOL and English for vocational study (Entry 1–Level 1)",
"provider": "Barnfield College",
"sector": "language",
"summary": "City & Guilds ESOL and English courses from Entry 1 up to Level 1, plus GCSE English, over about 30 weeks. It's a path to college vocational courses.",
"cost": "funded",
"price": "Usually free for eligible adults",
"qual": "City & Guilds ESOL / English Entry 1–Level 1; GCSE English",
"accreditation": "City & Guilds (Ofqual-regulated)",
"mode": "in-person",
"reach": "luton",
"place": "Barnfield College, Luton",
"lat": 51.8986,
"lng": -0.4236,
"ageMin": 16,
"residency": [
"luton",
"cbeds",
"bedford",
"england"
],
"eligibility": [
"Assessment of your level first"
],
"needs": [
"none"
],
"when": "College year, about 30 weeks",
"outcome": "support",
"outcomeText": "Progress to vocational courses.",
"duration": "About 30 weeks",
"live": "intake",
"apply": "Barnfield admissions 01582 569 569.",
"link": "https://www.barnfield.ac.uk/",
"tags": [
"language"
],
"checks": [
"Course list 2026"
]
},
{
"id": "stagecoach-bedford-bus",
"title": "Trainee bus driver with paid PCV training and apprenticeship (Bedford)",
"provider": "Stagecoach",
"sector": "logistics",
"summary": "Stagecoach pays you while it trains you for your bus licence (PCV) over about 6–8 weeks, and you also get a Level 2 Bus Driver Apprenticeship. Bedford adverts quote typical earnings of about £33,000 a year once qualified, with higher overtime rates at weekends.",
"cost": "earn",
"price": "Paid from day one (about £33k typical once qualified)",
"qual": "PCV (Category D) licence; Level 2 Bus Driver apprenticeship",
"accreditation": "DVSA licence; government apprenticeship standard",
"mode": "in-person",
"reach": "nearby",
"place": "Stagecoach Bedford depot",
"lat": 52.136,
"lng": -0.466,
"travel": "Thameslink Luton to Bedford, about 20–25 minutes.",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Full car licence",
"Pass a medical and drug and alcohol test"
],
"needs": [
"licence"
],
"when": "6–8 weeks of paid training, then shifts of 5 days over 7. Recruits all year.",
"outcome": "job",
"outcomeText": "Bus driver job at the end of training.",
"duration": "6–8 weeks of training",
"live": "rolling",
"apply": "Search 'Trainee Bus Driver Bedford' on Stagecoach careers.",
"link": "https://www.stagecoachbus.com/careers",
"tags": [
"driving"
],
"checks": [
"Bedford advert July 2026"
]
},
{
"id": "lnr-driver",
"title": "Trainee train driver (Bletchley, London Northwestern Railway)",
"provider": "London Northwestern Railway (West Midlands Trains)",
"sector": "logistics",
"summary": "A paid trainee driver role on the Level 3 Train Driver apprenticeship, based at Bletchley (Milton Keynes). No railway experience needed. Fully qualified train drivers earn well over £60,000. The company recruits each year for the following year's intake.",
"cost": "earn",
"price": "Paid salary throughout training",
"qual": "Level 3 Train Driver apprenticeship; train driving licence",
"accreditation": "ORR train driving licence; government apprenticeship",
"mode": "in-person",
"reach": "nearby",
"place": "Bletchley depot, Milton Keynes",
"lat": 51.996,
"lng": -0.736,
"travel": "About 30–40 minutes by car; or by train via Leighton Buzzard.",
"ageMin": 20,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Aged 20+",
"Live within commuting distance of the depot",
"Pass medical, colour vision and drug tests"
],
"needs": [
"none"
],
"when": "Applications open in waves (for example, closing 24 October). Training is full-time weekdays for about 12–18 months.",
"outcome": "job",
"outcomeText": "Qualified train driver job.",
"demand": "Train drivers are among the best-paid jobs with no degree needed.",
"duration": "About 12–18 months",
"live": "intake",
"apply": "Check West Midlands Trains / London Northwestern careers for the next wave.",
"link": "https://westmidlandstrains.mynewsdesk.com/tag/recruitment",
"tags": [
"driving",
"public"
],
"checks": [
"Recruitment for 2027 intake seen May 2026"
]
},
{
"id": "emr-driver",
"title": "Trainee mainline train driver (London St Pancras)",
"provider": "East Midlands Railway",
"sector": "logistics",
"summary": "Trainee driver roles based at London St Pancras, about 30 minutes from Luton on Thameslink, run as rolling recruitment waves.",
"cost": "earn",
"price": "Paid salary throughout training",
"qual": "Train driving licence (mainline)",
"accreditation": "ORR train driving licence",
"mode": "in-person",
"reach": "nearby",
"place": "London St Pancras",
"lat": 51.532,
"lng": -0.126,
"travel": "Thameslink Luton to St Pancras, about 30 minutes.",
"ageMin": 20,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Pass medical and psychometric tests"
],
"needs": [
"none"
],
"when": "Waves open for a few weeks (one closed 9 August 2026). Full-time training.",
"outcome": "job",
"outcomeText": "Mainline driver job.",
"duration": "About 12–18 months",
"live": "intake",
"apply": "East Midlands Railway careers.",
"link": "https://www.eastmidlandsrailway.co.uk/careers",
"tags": [
"driving"
],
"checks": [
"Advert Aug 2026"
]
},
{
"id": "royal-mail-lgv",
"title": "Royal Mail LGV driver apprenticeship (licence paid for)",
"provider": "Royal Mail",
"sector": "logistics",
"summary": "An 8-month paid apprenticeship that gets you your LGV (lorry) licence with no licence needed to start. You train on full pay from day one. You can't apply if you already hold an LGV licence.",
"cost": "earn",
"price": "Paid from day one",
"qual": "LGV Driver Level 2 apprenticeship; Category C licence",
"accreditation": "DVSA; government apprenticeship standard",
"mode": "in-person",
"reach": "nearby",
"place": "Royal Mail mail centres (check adverts near Luton/Bedford)",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Full car licence",
"No LGV licence already"
],
"needs": [
"licence"
],
"when": "8 months, shift work including weekends and bank holidays (24/7 operation).",
"outcome": "job",
"outcomeText": "LGV driver at Royal Mail.",
"demand": "HGV drivers are in short supply nationally.",
"duration": "8 months",
"live": "intake",
"apply": "Royal Mail careers: search 'LGV apprentice'.",
"link": "https://www.royalmailgroup.com/en/careers/",
"tags": [
"driving",
"logistics"
],
"checks": [
"2026 adverts"
]
},
{
"id": "wolseley-hgv",
"title": "Apprentice HGV driver C+E, nights (Marston Gate)",
"provider": "Wolseley UK",
"sector": "logistics",
"summary": "An apprenticeship to get your Class 1 (articulated) licence at Wolseley's Marston Gate distribution centre near Brogborough, about 25 minutes from Luton. It pays £22,000 during the apprenticeship, rising when you qualify.",
"cost": "earn",
"price": "£22,000 a year, rising after",
"qual": "C+E (Class 1) licence; LGV apprenticeship",
"accreditation": "DVSA; government apprenticeship standard",
"mode": "in-person",
"reach": "nearby",
"place": "Marston Gate DC, Brogborough (M1 J13)",
"lat": 52.045,
"lng": -0.605,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Full car licence"
],
"needs": [
"licence"
],
"when": "Nights, 45 hours a week Sunday to Thursday, starting between 10pm and 4am.",
"outcome": "job",
"outcomeText": "HGV driver role at the end.",
"duration": "About 12 months",
"live": "intake",
"apply": "Wolseley careers: search 'Apprentice HGV Driver'.",
"link": "https://www.jobs24.co.uk/job/apprentice-hgv-driver-127155743",
"tags": [
"driving",
"logistics"
],
"checks": [
"Advert Aug 2026"
]
},
{
"id": "john-lewis-lgv",
"title": "Apprentice LGV driver (Magna Park, Milton Keynes)",
"provider": "John Lewis Partnership",
"sector": "logistics",
"summary": "An LGV apprenticeship at John Lewis's Magna Park distribution centre. You train alongside a driver mentor, get your licence and move into a permanent driving role. It's for people without a Category C licence.",
"cost": "earn",
"price": "Paid apprenticeship",
"qual": "LGV licence; Level 2 apprenticeship",
"accreditation": "DVSA; government apprenticeship standard",
"mode": "in-person",
"reach": "nearby",
"place": "Magna Park, Milton Keynes MK17 8EW",
"lat": 51.993,
"lng": -0.687,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Clean car (or C1) licence",
"No Category C licence already"
],
"needs": [
"licence"
],
"when": "Set intakes (for example August and October), with assessment days a few months before.",
"outcome": "job",
"outcomeText": "Permanent driving role.",
"duration": "About 12 months",
"live": "intake",
"apply": "jlpjobs.com: search 'Apprentice LGV Driver'.",
"link": "https://jlpjobs.com/job/apprentice-lgv-driver-179159",
"tags": [
"driving",
"logistics"
],
"checks": [
"2025 intakes; recurring"
]
},
{
"id": "wincanton-drivers",
"title": "Wincanton Future Drivers apprenticeship",
"provider": "Wincanton",
"sector": "logistics",
"summary": "A 12-month Level 2 LGV apprenticeship that takes you through your licence while you're paid. Wincanton has depots across the country, including along the M1.",
"cost": "earn",
"price": "Paid apprenticeship",
"qual": "Level 2 LGV Driver apprenticeship",
"accreditation": "DVSA; government apprenticeship standard",
"mode": "in-person",
"reach": "nearby",
"place": "Wincanton depots (check nearest)",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Car licence"
],
"needs": [
"licence"
],
"when": "12 months, earning while you learn.",
"outcome": "job",
"outcomeText": "Driver job with Wincanton.",
"duration": "12 months",
"live": "rolling",
"apply": "Wincanton careers: Future Drivers.",
"link": "https://www.wincanton.co.uk/careers/wincanton-future-drivers-programme",
"tags": [
"driving",
"logistics"
],
"checks": [
"Programme page 2026"
]
},
{
"id": "whistl-hgv",
"title": "HGV apprenticeship (Bedford)",
"provider": "Whistl",
"sector": "logistics",
"summary": "An apprenticeship at Whistl's Bedford depot. You do Class 2 training first, then Class 1, with a permanent HGV job at the end if you pass. Pay rises at each stage.",
"cost": "earn",
"price": "Paid; rises after each licence",
"qual": "LGV C then C+E licence",
"accreditation": "DVSA; government apprenticeship standard (TRS Training)",
"mode": "in-person",
"reach": "nearby",
"place": "Bedford MK42 0PE",
"lat": 52.118,
"lng": -0.45,
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Driving licence with fewer than 6 points"
],
"needs": [
"licence"
],
"when": "Adverts appear in spring and summer; full-time shifts.",
"outcome": "job",
"outcomeText": "Permanent HGV driver.",
"duration": "About 12 months",
"live": "intake",
"apply": "Search 'Whistl HGV' on Find an apprenticeship.",
"link": "https://findapprenticeship.service.gov.uk/apprenticeship/VAC1000309523",
"tags": [
"driving",
"logistics"
],
"checks": [
"Bedford advert 2025; South West 2026"
]
},
{
"id": "civil-service-sip",
"title": "Civil Service Summer Internship (paid, Fast Stream fast pass)",
"provider": "Civil Service Fast Stream",
"sector": "public",
"summary": "A two-month paid summer internship in a government department for undergraduates from lower socio-economic backgrounds, at £452 a week. A good appraisal gives you a Fast Pass that skips the first stages of the Fast Stream graduate scheme. About 200 places.",
"cost": "earn",
"price": "£452 a week",
"qual": "Work experience; Fast Pass to Fast Stream",
"accreditation": "UK Civil Service",
"mode": "in-person",
"reach": "uk",
"worthTrip": true,
"place": "Government offices across the UK (many in London)",
"travel": "Thameslink to London for Whitehall placements, about 30–40 minutes.",
"ageMin": 18,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"University undergraduate",
"From a lower socio-economic background",
"Right to work"
],
"needs": [
"alevel"
],
"when": "July to August. Applications open in the autumn (October) the year before.",
"outcome": "support",
"outcomeText": "Fast-track into the Civil Service graduate scheme.",
"duration": "2 months",
"live": "intake",
"apply": "Civil Service careers: Fast Stream Summer Internship.",
"link": "https://www.civil-service-careers.gov.uk/fast-stream/fs-summer-internship-programme",
"tags": [
"public",
"office"
],
"checks": [
"2026 programme; 2027 round listed"
]
},
{
"id": "pwc-entry",
"title": "PwC school and college leaver programmes",
"provider": "PwC",
"sector": "office",
"summary": "Full-time paid jobs for school and college leavers in audit, tax, technology and consulting, working towards a professional qualification. There's no university. PwC also runs Flying Start degree programmes with paid placements, with bursaries of up to £10,000 for lower-income students.",
"cost": "earn",
"price": "Salaried",
"qual": "Professional qualifications (e.g. ACA, AAT) or a degree via Flying Start",
"accreditation": "ICAEW/AAT; universities",
"mode": "in-person",
"reach": "uk",
"worthTrip": true,
"place": "PwC offices incl. London, Reading, Birmingham",
"travel": "London is about 30–40 minutes by Thameslink; Reading is about 1 hour 15 minutes.",
"ageMin": 17,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"Year 13 or college leaver"
],
"needs": [
"alevel"
],
"when": "Applications usually open in autumn and close around late November for a September start.",
"outcome": "job",
"outcomeText": "Paid professional career from 18.",
"demand": "Accountancy and audit firms keep hiring school leavers each year.",
"duration": "3–5 years to qualify",
"live": "intake",
"apply": "PwC early careers (Flying Start goes through UCAS).",
"link": "https://www.pwc.co.uk/careers/early-careers/entry-level/entry-level-programmes.html",
"tags": [
"office",
"business"
],
"checks": [
"2026/27 programme pages"
]
},
{
"id": "ey-schools",
"title": "EY school and college leaver apprenticeships",
"provider": "EY",
"sector": "office",
"summary": "Paid apprenticeships in audit, tax, technology and consulting for school leavers. Recruitment uses EY Experience Days, with a final interview usually 2–3 weeks later.",
"cost": "earn",
"price": "Salaried",
"qual": "Professional and degree apprenticeships",
"accreditation": "Government apprenticeship standards; professional bodies",
"mode": "in-person",
"reach": "uk",
"worthTrip": true,
"place": "EY offices incl. London, Birmingham, Reading",
"travel": "London is about 30–40 minutes by Thameslink.",
"ageMin": 17,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"School or college leaver"
],
"needs": [
"alevel"
],
"when": "EY Experience Days run November 2026 to April 2027.",
"outcome": "job",
"outcomeText": "Paid professional career.",
"duration": "3–6 years",
"live": "running",
"apply": "EY UK careers: Students – Schools.",
"link": "https://www.ey.com/en_uk/careers/students/schools",
"tags": [
"office",
"business",
"tech"
],
"checks": [
"EY page Nov 2026"
]
},
{
"id": "bdo-school-leaver",
"title": "BDO school leaver apprenticeships (audit, tax, advisory)",
"provider": "BDO",
"sector": "office",
"summary": "Paid school-leaver apprenticeships at about £26,615–£28,275 a year in London, Birmingham and Reading. The 2027 Advisory round closed on 15 November 2026, but tax and audit-technology rounds may close later.",
"cost": "earn",
"price": "About £26,615–£28,275 a year",
"qual": "Professional apprenticeships",
"accreditation": "Government apprenticeship standards",
"mode": "in-person",
"reach": "uk",
"worthTrip": true,
"place": "London, Birmingham, Reading",
"travel": "London is about 30–40 minutes by Thameslink.",
"ageMin": 17,
"residency": [
"luton",
"cbeds",
"bedford",
"england",
"uk"
],
"eligibility": [
"School or college leaver"
],
"needs": [
"alevel"
],
"when": "Applications open late summer for the next September start; deadlines vary by programme.",
"outcome": "job",
"outcomeText": "Paid professional career.",
"duration": "3–5 years",
"live": "intake",
"apply": "BDO early careers.",
"link": "https://higherin.com/jobs/45003/bdo/2027-advisory-school-leaver-apprenticeship-programme",
"tags": [
"office",
"business"
],
"checks": [
"2027 programme adverts"
]
}
];
var sec={"public": {"name": "Police, fire and public service", "demand": ""}, "office": {"name": "Office and admin", "demand": ""}, "customer": {"name": "Retail and customer service", "demand": ""}, "hospitality": {"name": "Hospitality and food", "demand": ""}, "creative": {"name": "Film, media and creative", "demand": ""}, "language": {"name": "English and languages", "demand": ""}};
Object.keys(sec).forEach(function(k){if(!D.sectors[k])D.sectors[k]=sec[k];});
add.forEach(function(l){var i=D.listings.findIndex(function(x){return x.id===l.id;});if(i>=0)D.listings[i]=l;else D.listings.push(l);});
var when={"lal-passport": "Weekly face-to-face workshops at Arndale House, Luton. Call 01582 490033 for this term's days.", "lal-nhs": "Runs in cohorts with Bedfordshire Hospitals. Ask Luton Adult Learning (01582 490033) for the next start.", "lal-childcare": "Autumn 2026: Becoming a Childminder, Thu 17 Sep–22 Oct, 9:30–11:30. Becoming an Early Years Practitioner, Fri 18 Sep–16 Oct, 9:30–11:30. Step into Early Years, Mondays from 2 Nov 2026 (24 weeks), 9:30–12:00. Level 2 Diploma online, Thursdays from 1 Oct, 9:15–11:45.", "lal-schools": "Becoming a Teaching Assistant, Wed 4 Nov–2 Dec 2026, 9:30–11:30 at Arndale House. Level 2 courses online, fortnightly Tuesdays from 6 Oct 2026, 9:15–11:45. Level 3 online, fortnightly evenings 7–9pm.", "lal-basics": "New courses start each term (September, January, April) at Arndale House, Morton House or online. Call 01582 490033.", "connect-to-work": "Rolling referrals, with one-to-one appointments at times that suit you.", "youth-advice": "Weekday appointments. Contact the service to book.", "link-bootcamp": "Last run Mon 21–Tue 22 Sep 2026, 10:30–12:00 and 12:30–14:00. Ask Link Community Centre (01582 550014 or WhatsApp) about the next one.", "barnfield-16": "Courses start in September. Apply from the autumn before.", "barnfield-app": "Starts through the year, usually with 1 day a week at college.", "kings-team": "12 weeks, Mon–Fri 9am–4:30pm at Dunstable. Starts 21 Sep 2026, 25 Jan 2027 and 4 May 2027.", "kings-enterprise": "4-day workshop (online or in person), then mentoring at your pace.", "ltfc-trust": "Weekly community sessions. The BTEC starts each September.", "fcfj": "Varies by college; most start in September or January.", "lla-apprentice": "Airport apprenticeships are usually advertised Aug–Oct for autumn starts, with extra roles during the year.", "avsec": "Recruits all year, busiest in late winter and spring before the summer season.", "easyjet-crew": "Annual recruitment drive (about 1,000 crew for 2026). Luton training started in February 2026. Fixed-term summer and permanent contracts.", "wizz-crew": "Recruitment days are held through the year. Check the careers site.", "jet2-crew": "Summer-season roles are advertised in autumn and winter. A 4-week CAA-approved course near the base before the season, which Jet2 states is unpaid.", "sia-swap": "Runs when local employers are recruiting, usually 2–6 weeks. Ask your Jobcentre work coach.", "sia-ds-paid": "Weekend and weekday courses most weeks in Luton.", "care-paid-training": "Rolling recruitment. Induction of 1–2 weeks, then shifts.", "nhs-csw": "Adverts most months on NHS Jobs. A 6-day induction, then 2 weeks extra to the team. Day, night and weekend shifts.", "cscs-funded": "1-day courses run regularly. Ask for the next date.", "cscs-paid": "1-day course, several dates a month in Luton.", "wihb": "Cohorts run through the year: a training week, then a placement.", "forklift-free": "Short courses run when funded places are available. Call Think Employment on 01472 493000.", "hgv-bootcamp-cbeds": "12 weeks. Theory online at home (Zoom/Moodle), driving at a local DVSA test centre. Rolling intakes: call 01472 493000.", "hgv-paid": "Book any time. Test dates depend on DVSA availability.", "firstaid-activeluton": "Lewsey Sports Park, 9:30–4:30. First Aid at Work (3 days): 18–20 Nov 2026. Emergency Paediatric: 23 Nov 2026. Emergency First Aid at Work: 7 Dec 2026. Paediatric (2 days): 16–17 Dec 2026. Repeats about every 2 months.", "firstaid-sja": "1-day courses most weeks at St John venues.", "leep-bootcamps": "Remote, mostly part-time or flexible (some evening sessions). Next start date confirmed when you apply.", "leep-cyber-l2": "3 weeks. Next start confirmed when you apply.", "cyf": "Part time, evenings and weekends. New cohorts open a few times a year.", "cfg": "Evening courses. New cohorts several times a year.", "skillsnetwork": "Online at your own pace; enrol any time.", "gtr-eng": "Recruitment opens about once a year for a 4-year programme.", "arriva-bus": "About 4–6 weeks of paid training at Arriva's Luton training school, then rotating shifts. Recruits all year.", "train-driver": "Train companies recruit in waves, often a few weeks a year. 18-month paid trainee programme; must be 21+ at GTR.", "easyjet-eng": "20 places start in April and 20 in October each year. Training at easyJet's Luton hangar."};
D.listings.forEach(function(l){if(when[l.id]&&!l.when)l.when=when[l.id];});
})(window.NGS_SKILLS);

/* NGS Skills & Training Finder (SMR Digital)
   Usage: <div id="skills-finder"></div> then NGSSkills.mount(document.getElementById('skills-finder'))
   Needs skills-data.js loaded first. No emojis; drawn SVG icons only. */
(function () {
  "use strict";
  var D = window.NGS_SKILLS;
  var NEVER = /krav\s*maga/i; // owner rule: never listed anywhere
  var L = D.listings.filter(function (l) { return !NEVER.test(l.title + " " + l.provider + " " + l.summary); });

  var ICON = {
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    screen: '<rect x="3" y="4" width="18" height="12"/><path d="M8 20h8M12 16v4"/>',
    pound: '<path d="M16 6.5A4 4 0 0 0 9 9v9M6 13h7M6 18h12"/>',
    brief: '<rect x="3" y="7" width="18" height="13"/><path d="M8 7V4h8v3M3 12h18"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
    warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
    spark: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
    close: '<path d="M5 5l14 14M19 5L5 19"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>'
  };
  var SIC = {
    "starting-out": '<path d="M5 21V4h11l-2 4 2 4H5"/>',
    aviation: '<path d="M2 13l20-8-6 16-4-6z"/><path d="M12 15l4-10"/>',
    security: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    care: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    health: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
    construction: '<path d="M3 17h18M5 17a7 7 0 0 1 14 0M10 10V6h4v4"/>',
    logistics: '<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    digital: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12"/>',
    childcare: '<rect x="3" y="12" width="8" height="8"/><rect x="13" y="12" width="8" height="8"/><rect x="8" y="4" width="8" height="8"/>',
    education: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    "first-aid": '<rect x="3" y="7" width="18" height="13"/><path d="M9 7V4h6v3M12 10v7M8.5 13.5h7"/>',
    business: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    sport: '<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 5h-5L8 10z"/>',
    trades: '<path d="M14.5 5.5a4 4 0 0 0 4 4.5L9 19.5 4.5 15 14 5.5z"/><path d="M14.5 5.5l2-2 4 4-2 2"/>',
    engineering: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/>',
    public: '<path d="M3 9l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    office: '<rect x="3" y="7" width="18" height="13"/><path d="M8 7V4h8v3M3 12h18"/>',
    customer: '<path d="M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0"/>',
    hospitality: '<path d="M4 10h13v4a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6zM17 11h2a2.5 2.5 0 0 1 0 5h-2.5M8 3v4M12 3v4"/>',
    creative: '<rect x="3" y="7" width="18" height="13"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l2-3h4l2 3"/>',
    language: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'
  };
  var SHORT = { "starting-out": "Getting started", aviation: "Airport", security: "Security", care: "Care", health: "NHS and health", construction: "Building", logistics: "Driving", digital: "Tech", childcare: "Childcare", education: "Schools", "first-aid": "First aid", business: "Business", sport: "Sport", trades: "Trades", engineering: "Engineering", public: "Public service", office: "Office", customer: "Retail", hospitality: "Food and hotels", creative: "Media", language: "English" };
  function ic(n, cls) { return '<svg class="sk-ic ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICON[n] || SIC[n] || "") + "</svg>"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var COST = { free: "Free", funded: "Free if eligible", paid: "You pay", earn: "Paid training" };
  var OUT = { job: "Job lined up", interview: "Guaranteed interview", demand: "High-demand skill", support: "Job-search support", business: "Start a business" };
  var LIVE = { running: "Running now", rolling: "Recruits all year", intake: "Regular intake", ask: "Ask for dates" };
  var MODE = { "in-person": "In person", online: "Online", blended: "Online + in person" };
  var NEEDS = { none: "No qualifications needed", gcse: "GCSEs", licence: "Driving licence", alevel: "A levels or diploma", english: "Good English", degree: "Degree", experience: "Some experience" };
  var WHENFB = { running: "Running now. Check the provider for this term's days and times.", rolling: "Recruits all year. You start when you're hired, and the employer sets your hours.", intake: "Set intakes during the year. Check the provider for the next start date.", ask: "Dates on request. Contact the provider." };
  var WHERE = { local: "Local (Luton area)", hybrid: "Hybrid", online: "Online", nation: "Nationwide" };

  /* Sector colour (card gradient) and the jobs each field leads to */
  var SEC = {
    "starting-out": ["#6b707c", "Any entry-level job; next steps into training"],
    aviation: ["#4e6b83", "Cabin crew, ramp agent, airport security, aircraft engineer"],
    security: ["#414951", "Security officer, door supervisor, CCTV operator, custody officer"],
    care: ["#9e7885", "Care assistant, support worker, senior carer"],
    health: ["#366361", "Healthcare assistant, support worker, nursing associate, NHS admin"],
    construction: ["#927354", "Site labourer, groundworker, trades apprentice, plant operator"],
    logistics: ["#595242", "HGV, bus or van driver, forklift operator, warehouse operative"],
    digital: ["#7c78a6", "IT support, data, cloud, cyber, developer"],
    childcare: ["#ac8d70", "Nursery practitioner, childminder, teaching assistant"],
    education: ["#516651", "Teaching assistant, tutor, teacher"],
    "first-aid": ["#8c6060", "Workplace first aider (add-on for many jobs)"],
    business: ["#665c3e", "Self-employed, sole trader, business owner"],
    sport: ["#4c6d5b", "Sports coach, lifeguard, swim teacher, fitness instructor"],
    trades: ["#7c6251", "Electrician, plumber, gas engineer, maintenance technician"],
    engineering: ["#4c5d6d", "Engineering technician, rail, water and energy engineer"],
    public: ["#364152", "Police officer, PCSO, firefighter, prison officer, civil servant"],
    office: ["#62686e", "Administrator, HR assistant, accounts assistant"],
    customer: ["#766782", "Retail assistant, store manager, customer service advisor"],
    hospitality: ["#8a685a", "Chef, kitchen team, front of house, hotel staff"],
    creative: ["#805c72", "Production assistant, runner, barber, creative freelancer"],
    language: ["#59727c", "Better English for work, training and daily life"]
  };
  var ADDON = { "firstaid-activeluton": 1, "firstaid-sja": 1, "lal-mhfa": 1, "efaw-farley": 1, "food-hygiene": 1, "sja-free-online": 1, "sja-volunteer": 1, "tsn-safeguardingpreventandbr": 1 };
  function isAddon(l) { return !!(l.addon || ADDON[l.id] || l.sector === "first-aid"); }
  function kind(l) { return isAddon(l) ? "addon" : l.outcome === "business" ? "business" : "route"; }
  function whereOf(l) {
    if (l.reach === "uk") return "nation";
    if (l.mode === "online") return "online";
    if (l.mode === "blended") return "hybrid";
    return "local";
  }
  /* What you need to get in: listed on the listing, or read from its eligibility text */
  function needsOf(l) {
    if (l.needs) return l.needs;
    var t = (l.eligibility || []).join(" ").toLowerCase(), n = [];
    if (/gcse|grade 4|grade c/.test(t)) n.push("gcse");
    if (/driving licen|car licen|full uk licen|own vehicle|own car/.test(t)) n.push("licence");
    if (/a level|a-level|level 3 qual|diploma/.test(t)) n.push("alevel");
    if (/english|esol/.test(t)) n.push("english");
    if (/degree/.test(t)) n.push("degree");
    if (/experience/.test(t) && !/no (previous |prior )?experience/.test(t)) n.push("experience");
    l.needs = n.length ? n : ["none"];
    return l.needs;
  }

  var state = {
    sectors: [], cost: [], outcome: [], kind: [], where: [], needs: [], mode: "any", far: false, women: false,
    age: null, home: "", postcode: "", budget: null, q: "", quiz: null
  };

  /* ---------- distance ---------- */
  function pcLatLng(pc) {
    if (!pc) return null;
    var m = pc.toUpperCase().replace(/\s+/g, "").match(/^([A-Z]{1,2}\d{1,2})/);
    if (!m) return null;
    var k = m[1];
    if (D.postcodes[k]) return D.postcodes[k];
    if (D.postcodes[k.replace(/\d$/, "")]) return D.postcodes[k.replace(/\d$/, "")];
    return null;
  }
  function miles(a, b) {
    var R = 3959, t = Math.PI / 180, dLat = (b[0] - a[0]) * t, dLng = (b[1] - a[1]) * t;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
  function distText(l) {
    if (l.mode === "online") return "Online";
    var me = pcLatLng(state.postcode) || D.postcodes.LU1;
    if (l.lat == null) return "";
    var m = miles(me, [l.lat, l.lng]);
    return (m < 0.5 ? "Under half a mile" : m.toFixed(m < 10 ? 1 : 0) + " miles") + (state.postcode ? " away" : " from Luton centre");
  }
  function dirLink(l) {
    if (l.lat == null) return "";
    var o = state.postcode ? "&origin=" + encodeURIComponent(state.postcode) : "";
    return "https://www.google.com/maps/dir/?api=1" + o + "&destination=" + l.lat + "," + l.lng + "&travelmode=transit";
  }

  /* ---------- eligibility + scoring ---------- */
  function eligible(l) {
    if (state.age != null) {
      if (l.ageMin && state.age < l.ageMin) return false;
      if (l.ageMax && state.age > l.ageMax) return false;
    }
    if (state.home && l.residency && l.residency.indexOf(state.home) < 0) {
      // "england" covers Luton/Beds; "uk" covers everyone
      var ok = l.residency.indexOf("uk") >= 0 || (l.residency.indexOf("england") >= 0 && state.home !== "uk");
      if (!ok) return false;
    }
    return true;
  }
  function passesFilters(l) {
    if (state.sectors.length && state.sectors.indexOf(l.sector) < 0) return false;
    if (state.cost.length && state.cost.indexOf(l.cost) < 0) return false;
    if (state.outcome.length && state.outcome.indexOf(l.outcome) < 0) return false;
    if (state.kind.length && state.kind.indexOf(kind(l)) < 0) return false;
    if (state.where.length && state.where.indexOf(whereOf(l)) < 0) return false;
    if (state.needs.length && !needsOf(l).some(function (n) { return state.needs.indexOf(n) >= 0; })) return false;
    if (state.women && l.forWho !== "women") return false;
    if (state.budget != null && l.cost === "paid" && (l.priceFrom || 0) > state.budget) return false;
    if (state.q) {
      var hay = (l.title + " " + l.provider + " " + l.summary + " " + l.qual + " " + (l.tags || []).join(" ")).toLowerCase();
      if (hay.indexOf(state.q.toLowerCase()) < 0) return false;
    }
    return eligible(l);
  }
  function score(l) {
    var s = 0, why = [], q = state.quiz;
    if (l.outcome === "job") s += 30; else if (l.outcome === "interview") s += 24; else if (l.outcome === "demand") s += 12;
    if (l.cost === "earn") s += 14; else if (l.cost === "free") s += 12; else if (l.cost === "funded") s += 10;
    if (l.live === "running" || l.live === "rolling") s += 6;
    if (l.forWho === "women" && !state.women) s -= 15;
    if (l.reach === "luton") s += 8; else if (l.reach === "online" || l.reach === "nearby") s += 4;
    if (q) {
      var tagHit = (l.tags || []).some(function (t) { return q.interests.indexOf(t) >= 0; });
      if (tagHit) { s += 40; why.push("Matches what you're interested in"); }
      else if (q.interests.indexOf("unsure") >= 0 && (l.tags || []).indexOf("any") >= 0) { s += 20; why.push("A good first step if you're not sure yet"); }
      if (q.goal === "job" && (l.outcome === "job" || l.outcome === "interview")) { s += 25; why.push(l.outcome === "job" ? "You're hired first, then trained" : "Ends with a guaranteed interview"); }
      if (q.goal === "free" && (l.cost === "free" || l.cost === "funded" || l.cost === "earn")) { s += 20; why.push(l.cost === "earn" ? "You're paid while you learn" : "No cost to you if eligible"); }
      if (q.goal === "business" && l.outcome === "business") { s += 35; why.push("Built for starting a business"); }
      if (q.goal === "confidence" && (l.tags || []).indexOf("confidence") >= 0) { s += 30; why.push("Builds confidence and next steps"); }
      if (q.benefits && l.id === "sia-swap") { s += 25; why.push("You can get this free because you're claiming benefits"); }
      if (q.mode === "online" && l.mode !== "in-person") s += 10;
      if (q.mode === "in-person" && l.mode !== "online") s += 6;
      if (q.time === "part" && /part time|online|weekend|workshops/i.test(l.duration + " " + l.mode)) s += 6;
    }
    if (l.demand && why.length < 3) why.push("High demand: " + l.demand);
    return { s: s, why: why.slice(0, 3) };
  }

  /* Far-away rule: a "uk" listing only shows when the user asks for further afield,
     or when there is no decent nearer option left in that sector after filtering. */
  function results() {
    var base = L.filter(passesFilters);
    var near = base.filter(function (l) { return l.reach !== "uk"; });
    var nearSectors = {};
    near.forEach(function (l) { nearSectors[l.sector] = true; });
    var far = base.filter(function (l) {
      return l.reach === "uk" && (state.far || state.where.indexOf("nation") >= 0 || (!nearSectors[l.sector] && l.worthTrip));
    });
    var out = near.concat(far).map(function (l) { var r = score(l); return { l: l, s: r.s, why: r.why, hit: r.why.indexOf("Matches what you're interested in") >= 0 }; });
    out.sort(function (a, b) { return b.s - a.s; });
    return out;
  }

  /* ---------- rendering ---------- */
  var root, listEl, countEl;

  function chipRow(name, opts, multi, grid) {
    var h = '<div class="sk-chiprow ' + (grid || "") + '" data-group="' + name + '">';
    opts.forEach(function (o) {
      var on = multi ? state[name].indexOf(o[0]) >= 0 : state[name] === o[0];
      h += '<button type="button" class="sk-chip sk-c-' + o[0] + (on ? " on" : "") + '" data-v="' + o[0] + '" aria-pressed="' + on + '">' + esc(o[1]) + "</button>";
    });
    return h + "</div>";
  }

  function sectorOpts() {
    var used = {};
    L.forEach(function (l) { used[l.sector] = true; });
    return Object.keys(D.sectors).filter(function (k) { return used[k]; }).map(function (k) { return [k, D.sectors[k].name]; });
  }

  var OUTSHORT = { job: "Job at the end", interview: "Guaranteed interview", demand: "High-demand skill", support: "Job-search help", business: "Business support" };
  function shortDur(d) { d = String(d || "").split(/[;(]/)[0].trim(); return d.length > 26 ? d.slice(0, 24).replace(/[ ,.]+\S*$/, "") + "…" : d; }
  function shortWhen(w) { w = String(w || "").split(/(?<=\.)\s/)[0]; return w.length > 70 ? w.slice(0, 68).replace(/[ ,.]+\S*$/, "") + "…" : w; }
  function card(r, i) {
    var l = r.l, meta = SEC[l.sector] || ["#40454f", ""], sec = D.sectors[l.sector] || {};
    var needs = needsOf(l), nd = needs[0] === "none" ? "No qualifications needed" : "Needs " + NEEDS[needs[0]].replace(/^Some /, "").toLowerCase().replace("gcses", "GCSEs").replace("english", "English") + (needs.length > 1 ? " +" + (needs.length - 1) : "");
    var dist = distText(l), dl = l.mode !== "online" ? dirLink(l) : "";
    var whenTxt = l.when || WHENFB[l.live] || "";
    var h = '<article class="sk-card" id="sk-' + esc(l.id) + '" style="--i:' + Math.min(i, 12) + ';--sc:' + meta[0] + '">';
    h += '<div class="sk-card-top"><p class="sk-field">' + ic(l.sector, "sk-field-ic") + esc(sec.name || "") + (isAddon(l) ? '<span class="sk-addon">Add-on</span>' : "") + "</p><h3>" + esc(l.title) + "</h3>" +
      '<p class="sk-prov">' + esc(l.provider) + "</p></div>";
    if (l.reach === "uk") h += '<div class="sk-trip">' + ic("route") + (l.worthTrip ? "Worth the trip: no closer option like this right now" : "Further afield") + "</div>";
    h += '<div class="sk-keys">' +
      '<span class="sk-k sk-b-' + l.cost + '">' + ic("pound") + esc(COST[l.cost]) + (l.duration ? " · " + esc(shortDur(l.duration)) : "") + "</span>" +
      '<span class="sk-k sk-k-o sk-o-' + l.outcome + '">' + ic(l.outcome === "demand" ? "trend" : "brief") + esc(OUTSHORT[l.outcome]) + "</span>" +
      '<span class="sk-k">' + ic("check") + esc(nd) + "</span>" +
      '<span class="sk-k">' + ic(l.mode === "online" ? "screen" : "pin") + esc(l.mode === "online" ? "Online" : l.mode === "blended" ? "Hybrid" : (dist || "In person")) + "</span>" +
      "</div>";
    if (whenTxt) h += '<p class="sk-when">' + ic("clock") + "<span><b>When</b> " + esc(shortWhen(whenTxt)) + "</span></p>";
    if (r.why.length) h += '<p class="sk-why1">' + ic("spark") + esc(r.why[0]) + "</p>";
    h += '<div class="sk-full" hidden>';
    var lead = l.leadsTo || meta[1];
    if (lead) h += '<p class="sk-leads">' + ic("brief") + "<span><b>Leads to</b> " + esc(lead) + "</span></p>";
    h += '<p class="sk-sum">' + esc(l.summary) + "</p>";
    if (r.why.length > 1) h += '<ul class="sk-why">' + r.why.slice(1).map(function (w) { return "<li>" + ic("check") + esc(w) + "</li>"; }).join("") + "</ul>";
    h += '<dl class="sk-facts">' +
      "<div><dt>Cost</dt><dd>" + esc(l.price) + "</dd></div>" +
      "<div><dt>You get</dt><dd>" + esc(l.qual) + "</dd></div>" +
      "<div><dt>How long</dt><dd>" + esc(l.duration) + "</dd></div>" +
      "<div><dt>When</dt><dd>" + esc(whenTxt || "Ask the provider") + "</dd></div>" +
      "<div><dt>To get in</dt><dd>" + esc(needs.map(function (n) { return NEEDS[n]; }).join(", ")) + "</dd></div>" +
      "<div><dt>Where</dt><dd>" + esc(l.place) + (dist && l.mode !== "online" ? ' <span class="sk-dist">' + esc(dist) + "</span>" : "") + "</dd></div>" +
      "</dl>";
    if (l.travel) h += '<p class="sk-travel">' + ic("route") + esc(l.travel) + "</p>";
    if (l.forWho === "women") h += '<p class="sk-note">This programme is run for women.</p>';
    h += '<div class="sk-more-in">' +
      "<h4>Who can apply</h4><ul>" + l.eligibility.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>" +
      (l.discounts ? "<h4>Ways to pay less</h4><ul>" + l.discounts.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>" : "") +
      "<h4>What happens after</h4><p>" + esc(l.outcomeText) + "</p>" +
      ((l.demand || sec.demand) ? "<h4>Demand</h4><p>" + esc(l.demand || sec.demand) + "</p>" : "") +
      "<h4>How to apply</h4><p>" + esc(l.apply) + "</p>" +
      '<h4>How we checked it</h4><ul class="sk-checks">' + [l.accreditation].concat(l.checks || []).map(function (e) { return "<li>" + ic("shield") + esc(e) + "</li>"; }).join("") + "</ul>" +
      '<p class="sk-checked">Last checked ' + esc(D.checked) + ". " + esc(LIVE[l.live]) + ".</p></div>" +
      '<div class="sk-actions"><a class="sk-btn" href="' + esc(l.link) + '" target="_blank" rel="noopener">Go to ' + esc(shortHost(l.link)) + ic("arrow") + "</a>" +
      (dl ? '<a class="sk-btn ghost" href="' + esc(dl) + '" target="_blank" rel="noopener">' + ic("route") + "Directions</a>" : "") + "</div>" +
      "</div>";
    h += '<div class="sk-cardbar"><button type="button" class="sk-btn ghost sk-open" data-act="open" aria-expanded="false"><span>More details</span>' + ic("arrow", "sk-chev") + '</button>' +
      '<button type="button" class="sk-btn ghost sk-share" data-act="share" data-id="' + esc(l.id) + '">' + ic("share") + 'Share</button></div>';
    return h + "</article>";
  }
  function shortHost(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return "site"; } }

  function warnCards(res, asList) {
    var secs = {};
    res.forEach(function (r) { secs[r.l.sector] = true; });
    var out = D.warnings.filter(function (w) { return w.sector === "any" || secs[w.sector] || (w.sector === "trades" && (secs.construction || secs.trades)); })
      .map(function (w) {
        return '<aside class="sk-warn">' + ic("warn") + "<div><h4>" + esc(w.title) + "</h4><p>" + esc(w.text) + '</p><a href="' + esc(w.link) + '" target="_blank" rel="noopener">Check the official guidance</a></div></aside>';
      });
    return asList ? out : out.join("");
  }

  function draw() {
    var res = results();
    countEl.textContent = res.length === 1 ? "1 route" : res.length + " routes";
    var sn = root.querySelector(".sk-see-n"); if (sn) sn.textContent = "See " + countEl.textContent;
    var tn = root.querySelector(".sk-tray-n"); if (tn) tn.textContent = "Show " + countEl.textContent;
    var af = root.querySelector(".sk-active"); if (af) { af.innerHTML = activeChips(); af.hidden = !af.innerHTML; }
    var hidden = L.filter(function (l) { return l.reach === "uk"; }).length - res.filter(function (r) { return r.l.reach === "uk"; }).length;
    var h = "";
    if (state.quiz) {
      h += '<div class="sk-plan"><div><h3>Your matches</h3><p>Sorted by what you told us: ' + esc(quizSummary()) + '.</p></div><button type="button" class="sk-link" data-act="quiz">Change answers</button></div>';
    }
    if (!res.length) {
      h += '<div class="sk-empty"><h3>Nothing matches all of that</h3><p>Try removing a filter, or add "Nationwide" under Where.</p><button type="button" class="sk-btn" data-act="reset">Clear filters</button></div>';
    }
    var demandShown = {};
    res.forEach(function (r, i) {
      var sec = D.sectors[r.l.sector];
      if (state.sectors.length === 1 && sec && sec.demand && !demandShown[r.l.sector]) {
        h += '<div class="sk-demand">' + ic("trend") + esc(sec.demand) + "</div>"; demandShown[r.l.sector] = true;
      }
      if (state.quiz && i === 0 && r.why.length && r.why[0] === "Matches what you're interested in") h += '<h3 class="sk-group">Best matches for you</h3>';
      if (state.quiz && i > 0 && res[i - 1].hit && !r.hit) h += '<h3 class="sk-group">Other routes worth a look</h3>';
      h += card(r, i);
      if (i === 3 || i === 11) {
        var all = warnCards(res, true), part = i === 3 ? all.slice(0, 2) : all.slice(2);
        if (part.length) h += '<div class="sk-tips"><p class="sk-tips-h">' + ic("warn") + 'Good to know</p>' + part.join("") + (res.length > i + 1 ? '<p class="sk-below">' + ic("arrow", "sk-down") + (res.length - i - 1) + ' more routes below. Keep scrolling</p>' : "") + "</div>";
      }
    });
    if (res.length && res.length <= 3) { var wl = warnCards(res); if (wl) h += '<div class="sk-tips"><p class="sk-tips-h">' + ic("warn") + "Good to know</p>" + wl + "</div>"; }
    var nat = state.far || state.where.indexOf("nation") >= 0;
    if (hidden > 0 && !nat) h += '<p class="sk-farhint">' + hidden + ' nationwide option' + (hidden > 1 ? "s are" : " is") + ' hidden because there are good options closer to Luton. <button type="button" class="sk-link" data-act="far">Show them anyway</button></p>';
    h += '<aside class="sk-suggest"><div><h4>Know a course or scheme we\'ve missed?</h4><p>Tell us about it. We check every suggestion before it goes on here.</p></div><button type="button" class="sk-btn ghost" data-act="suggest">Suggest an opportunity</button></aside>';
    listEl.innerHTML = h;
  }

  function quizSummary() {
    var q = state.quiz, bits = [];
    if (q.age) bits.push("age " + q.age);
    var homes = { luton: "living in Luton", cbeds: "living in Central Bedfordshire", bedford: "living in Bedford", england: "living elsewhere in England", uk: "living outside England" };
    if (q.home) bits.push(homes[q.home]);
    var goals = { job: "a job as soon as possible", free: "a free qualification", business: "starting a business", confidence: "building confidence first" };
    bits.push(goals[q.goal]);
    return bits.join(", ");
  }

  /* ---------- questionnaire ---------- */
  var QZ = [
    { k: "age", t: "How old are you?", type: "num", req: true },
    { k: "home", t: "Where do you live?", req: true, opts: [["luton", "Luton"], ["cbeds", "Central Bedfordshire (Dunstable, Houghton Regis, Leighton Buzzard)"], ["bedford", "Bedford"], ["england", "Somewhere else in England"], ["uk", "Outside England"]] },
    { k: "postcode", t: "Your postcode (optional, for distances and directions)", type: "text" },
    { k: "status", t: "What are you doing right now?", req: true, opts: [["benefits", "Out of work and claiming benefits"], ["out", "Out of work, not claiming"], ["working", "Working, but want something better"], ["school", "At school or college, or just left"]] },
    { k: "interests", t: "What sounds interesting? Pick as many as you like.", req: true, multi: true, opts: [["aviation", "Airport and travel"], ["security", "Security"], ["care", "Care and helping people"], ["health", "NHS and health"], ["construction", "Building and construction"], ["trades", "Trades (plumbing, engineering)"], ["driving", "Driving"], ["warehouse", "Warehouse"], ["tech", "Computers and tech"], ["children", "Working with children"], ["business", "My own business"], ["sport", "Sport"], ["unsure", "Not sure yet"]] },
    { k: "goal", t: "What matters most?", req: true, opts: [["job", "Getting a job as soon as possible"], ["free", "A free qualification"], ["business", "Starting my own business"], ["confidence", "Building my confidence first"]] },
    { k: "budget", t: "If a course costs money, how much could you spend?", req: true, opts: [["0", "Nothing, free only"], ["300", "Up to £300"], ["1500", "Up to £1,500"], ["99999", "More, if it leads to a good job"]] },
    { k: "mode", t: "How would you like to learn?", req: true, opts: [["in-person", "In person"], ["online", "Online"], ["any", "Either"]] },
    { k: "time", t: "How much time do you have?", req: true, opts: [["full", "Full time"], ["part", "Part time, around other things"]] }
  ];
  var qi = 0, qa = {};
  function openQuiz() { qi = 0; qa = state.quiz ? JSON.parse(JSON.stringify(state.quiz.raw)) : {}; renderQuiz(); root.querySelector(".sk-modal").hidden = false; document.body.classList.add("sk-lock"); }
  function closeQuiz() { root.querySelector(".sk-modal").hidden = true; document.body.classList.remove("sk-lock"); }
  function renderQuiz() {
    var q = QZ[qi], box = root.querySelector(".sk-modal-body");
    var h = '<div class="sk-prog"><span style="width:' + Math.round((qi + 1) / QZ.length * 100) + '%"></span></div>' +
      '<p class="sk-step">Question ' + (qi + 1) + " of " + QZ.length + "</p>" +
      '<h3 class="sk-q">' + esc(q.t) + (q.req ? ' <span class="sk-req">*</span>' : "") + "</h3>";
    if (q.type === "num") h += '<input class="sk-in" type="number" inputmode="numeric" min="13" max="99" value="' + esc(qa.age || "") + '" data-k="age" aria-label="Age">';
    else if (q.type === "text") h += '<input class="sk-in" type="text" autocomplete="postal-code" placeholder="e.g. LU1 5JF" value="' + esc(qa.postcode || "") + '" data-k="postcode" aria-label="Postcode">';
    else {
      h += '<div class="sk-opts' + (q.multi ? " multi" : "") + '">';
      q.opts.forEach(function (o) {
        var on = q.multi ? (qa[q.k] || []).indexOf(o[0]) >= 0 : qa[q.k] === o[0];
        h += '<button type="button" class="sk-opt' + (on ? " on" : "") + '" data-v="' + o[0] + '">' + esc(o[1]) + "</button>";
      });
      h += "</div>";
    }
    h += '<p class="sk-reqnote">' + (q.req ? '<span class="sk-req">*</span> Required' : "Optional") + "</p>";
    h += '<div class="sk-qnav">' + (qi ? '<button type="button" class="sk-btn ghost" data-q="back">Back</button>' : "<span></span>") +
      '<button type="button" class="sk-btn" data-q="next">' + (qi === QZ.length - 1 ? "Show my matches" : "Next") + ic("arrow") + "</button></div>";
    box.innerHTML = h;
  }
  function quizValid() {
    var q = QZ[qi];
    if (!q.req) return true;
    if (q.type === "num") { var a = parseInt(qa.age, 10); return a >= 13 && a <= 99; }
    if (q.multi) return (qa[q.k] || []).length > 0;
    return !!qa[q.k];
  }
  function finishQuiz() {
    var q = {
      raw: qa, age: parseInt(qa.age, 10), home: qa.home, goal: qa.goal, mode: qa.mode, time: qa.time,
      interests: qa.interests || [], benefits: qa.status === "benefits"
    };
    state.quiz = q;
    state.age = q.age; state.home = q.home; state.postcode = (qa.postcode || "").trim();
    state.budget = parseInt(qa.budget, 10); state.mode = q.mode === "any" ? "any" : q.mode;
    state.sectors = []; state.cost = []; state.outcome = []; state.kind = []; state.needs = [];
    state.where = q.mode === "online" ? ["online", "hybrid"] : q.mode === "in-person" ? ["local", "hybrid"] : [];
    if (q.goal === "free") state.cost = ["free", "funded", "earn"];
    syncControls(); closeQuiz(); draw();
    root.querySelector(".sk-results").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function syncControls() {
    root.querySelectorAll(".sk-chiprow").forEach(function (row) {
      var g = row.getAttribute("data-group");
      row.querySelectorAll(".sk-chip").forEach(function (c) {
        var v = c.getAttribute("data-v"), on = Array.isArray(state[g]) ? state[g].indexOf(v) >= 0 : state[g] === v;
        c.classList.toggle("on", on); c.setAttribute("aria-pressed", on);
      });
    });
    root.querySelectorAll("[data-tile]").forEach(function (t) { var on = state.sectors.indexOf(t.getAttribute("data-tile")) >= 0; t.classList.toggle("on", on); t.setAttribute("aria-pressed", on); });
    root.querySelector(".sk-tiles-n").textContent = state.sectors.length ? state.sectors.length + " picked" : "Tap as many as you like";
    var per = { kind: state.kind.length, cost: state.cost.length, outcome: state.outcome.length, where: state.where.length, needs: state.needs.length, you: (state.age ? 1 : 0) + (state.postcode ? 1 : 0) + (state.women ? 1 : 0) };
    root.querySelectorAll("[data-tab]").forEach(function (t) { var n = per[t.getAttribute("data-tab")] || 0; t.querySelector("em").textContent = n || ""; t.classList.toggle("has", n > 0); });
    if (root.querySelector(".sk-active")) { var af = root.querySelector(".sk-active"); af.innerHTML = activeChips(); af.hidden = !af.innerHTML; }
    root.querySelector("[data-f=age]").value = state.age || "";
    root.querySelector("[data-f=postcode]").value = state.postcode || "";
    root.querySelector("[data-f=women]").checked = state.women;
  }

  function secCounts() {
    var c = {};
    L.forEach(function (l) { c[l.sector] = (c[l.sector] || 0) + 1; });
    root.querySelectorAll("[data-cnt]").forEach(function (e) { e.textContent = c[e.getAttribute("data-cnt")] || 0; });
  }
  function scrollBars() {
    root.querySelectorAll(".sk-scroll").forEach(function (w) {
      var row = w.querySelector(".sk-chiprow"), bar = w.querySelector(".sk-bar span");
      function upd() { var m = row.scrollWidth - row.clientWidth; bar.style.width = m > 0 ? (20 + 80 * row.scrollLeft / m) + "%" : "100%"; w.classList.toggle("noscroll", m <= 0); }
      row.addEventListener("scroll", upd, { passive: true }); upd(); window.addEventListener("resize", upd);
    });
  }

  function fld(n, label, req, type) {
    return '<label class="sk-fl"><span>' + esc(label) + (req ? ' <i class="sk-req">*</i>' : "") + '</span><input name="' + n + '" type="' + (type || "text") + '"' + (req ? " required" : "") + "></label>";
  }
  function openPop(n) { root.querySelector('[data-pop="' + n + '"]').hidden = false; document.body.classList.add("sk-lock"); }
  function closePops() { root.querySelectorAll(".sk-pop").forEach(function (p) { p.hidden = true; }); document.body.classList.remove("sk-lock"); }
  function seenNation() { try { return localStorage.getItem("skNationSeen") === "1"; } catch (e) { return false; } }
  function markNation() { try { localStorage.setItem("skNationSeen", "1"); } catch (e) {} }
  /* Suggestions go to the same review queue as the refresh checker (status "pending").
     Set window.NGS_SKILLS.submitUrl to the back-end endpoint, e.g. /api/skills_suggest.php */
  function sendSuggestion(form) {
    var data = {}, ok = true, msg = form.querySelector(".sk-formmsg");
    form.querySelectorAll("input,select,textarea").forEach(function (f) { data[f.name] = f.value.trim(); if (f.required && !data[f.name]) { ok = false; f.classList.add("bad"); } else f.classList.remove("bad"); });
    if (data.link && !/^https?:\/\//i.test(data.link)) { ok = false; form.querySelector("[name=link]").classList.add("bad"); }
    if (!ok) { msg.textContent = "Please fill in the required fields (the link must start with http)."; return; }
    data.source = "public-suggestion"; data.sent = new Date().toISOString();
    function done() { msg.textContent = "Thank you. We'll check it, and if it's genuine it will appear here."; form.reset(); }
    if (data.website) { done(); return; }
    if (D.submitUrl && window.fetch) {
      fetch(D.submitUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(D.submitWrap ? D.submitWrap(data) : data) })
        .then(function (r) { if (!r.ok) throw 0; done(); }).catch(function () { msg.textContent = "Sorry, that didn't send. Please try again later."; });
    } else {
      try { var q = JSON.parse(localStorage.getItem("skSuggestQueue") || "[]"); q.push(data); localStorage.setItem("skSuggestQueue", JSON.stringify(q)); } catch (e) {}
      done();
    }
  }

  var TRAYSUB = { kind: "What kind of help are you after?", cost: "Pick one or more.", outcome: "What should be waiting for you at the end?", where: "Local, online or worth the trip.", needs: "Show routes that ask for:", you: "Used for age rules and distances." };
  var trayKey = null;
  function openTray(k, title) {
    trayKey = k;
    root.querySelectorAll("[data-panel]").forEach(function (pn) { pn.hidden = pn.getAttribute("data-panel") !== k; });
    root.querySelector("#sk-tray-t").textContent = title;
    root.querySelector(".sk-tray-sub").textContent = TRAYSUB[k] || "";
    var t = root.querySelector(".sk-tray"); t.hidden = false; requestAnimationFrame(function () { t.classList.add("open"); });
    document.body.classList.add("sk-lock");
  }
  function closeTray() {
    var t = root && root.querySelector(".sk-tray"); if (!t || t.hidden) return;
    t.classList.remove("open"); document.body.classList.remove("sk-lock");
    setTimeout(function () { t.hidden = true; }, 220);
  }
  function clearGroup(k) {
    if (k === "you") { state.age = null; state.postcode = ""; state.women = false; }
    else if (k) state[k] = [];
  }
  function removeFilter(g, v) {
    if (g === "age") state.age = null;
    else if (g === "postcode") state.postcode = "";
    else if (g === "women") state.women = false;
    else if (g === "q") { state.q = ""; root.querySelector("[data-f=q]").value = ""; }
    else if (g === "far") state.far = false;
    else { var i = state[g].indexOf(v); if (i >= 0) state[g].splice(i, 1); }
  }
  var LABELS = {
    kind: { route: "Route into work", addon: "Add-on qualification", business: "Business support" },
    cost: COST, outcome: OUT, where: WHERE,
    needs: { none: "Needs nothing", gcse: "Needs GCSEs", licence: "Needs a driving licence", alevel: "Needs A levels / diploma", english: "Needs good English", degree: "Needs a degree" }
  };
  function activeChips() {
    var h = [];
    function chip(g, v, text, color) { h.push('<button type="button" class="sk-af" data-act="rm" data-g="' + g + '" data-v="' + esc(v) + '"' + (color ? ' style="--sc:' + color + '"' : "") + '>' + esc(text) + ic("close") + "</button>"); }
    state.sectors.forEach(function (k) { chip("sectors", k, SHORT[k] || k, (SEC[k] || [])[0]); });
    ["kind", "cost", "outcome", "where", "needs"].forEach(function (g) { state[g].forEach(function (v) { chip(g, v, LABELS[g][v] || v); }); });
    if (state.far) chip("far", "1", "Nationwide shown");
    if (state.age) chip("age", "", "Age " + state.age);
    if (state.postcode) chip("postcode", "", state.postcode.toUpperCase());
    if (state.women) chip("women", "", "Run for women");
    if (state.q) chip("q", "", '"' + state.q + '"');
    return h.length ? '<span class="sk-af-l">Your filters</span>' + h.join("") : "";
  }

  function shareListing(id, btn) {
    var l = L.filter(function (x) { return x.id === id; })[0]; if (!l) return;
    var url = location.href.split("#")[0] + "#sk-" + id;
    var text = l.title + " – " + l.provider + " (" + COST[l.cost] + ", " + OUTSHORT[l.outcome].toLowerCase() + ")";
    function copied(ok) { var o = btn.innerHTML; btn.innerHTML = ic("check") + (ok ? "Link copied" : "Copy failed"); setTimeout(function () { btn.innerHTML = o; }, 1800); }
    if (navigator.share) { navigator.share({ title: l.title, text: text, url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(text + " " + url).then(function () { copied(true); }, function () { copied(false); });
    else copied(false);
  }
  function openFromHash() {
    var m = location.hash.match(/^#sk-([a-z0-9-]+)$/); if (!m) return;
    var l = L.filter(function (x) { return x.id === m[1]; })[0]; if (!l) return;
    if (l.reach === "uk") state.far = true;
    draw();
    var cd = document.getElementById("sk-" + m[1]); if (!cd) return;
    var b = cd.querySelector("[data-act=open]"); if (b) b.click();
    cd.classList.add("hl"); setTimeout(function () { cd.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
  }

  function mount(el) {
    root = el; root.classList.add("sk");
    var secOpts = sectorOpts();
    root.innerHTML =
      '<header class="sk-head"><h2>Skills, training and job routes</h2>' +
      "<p>Free courses, funded qualifications and training that leads to work, in Luton, online and further afield. Every listing has been checked for accreditation and recent activity.</p></header>" +
      '<button type="button" class="sk-start" data-act="quiz"><span class="sk-start-ic">' + ic("spark") + '</span><span><strong>Don\'t know where to start?</strong><span>Answer 9 quick questions and we\'ll sort the best routes for you.</span></span>' + ic("arrow", "sk-start-go") + "</button>" +
      '<section class="sk-filters" aria-label="Filters">' +
      '<label class="sk-search">' + ic("filter") + '<input type="search" data-f="q" placeholder="Search: forklift, care, cabin crew, first aid..." aria-label="Search"></label>' +
      '<div class="sk-board"><div class="sk-board-h"><h3>What are you into?</h3><span class="sk-tiles-n"></span></div><div class="sk-tiles">' +
        secOpts.map(function (o) { var m = SEC[o[0]] || ["#40454f"]; return '<button type="button" class="sk-tile" data-tile="' + o[0] + '" style="--sc:' + m[0] + '" aria-pressed="false">' + ic(o[0]) + '<span>' + esc(SHORT[o[0]] || o[1]) + '</span><em data-cnt="' + o[0] + '"></em></button>'; }).join("") +
      '</div></div>' +
      '<div class="sk-board sk-narrow"><div class="sk-board-h"><h3>Narrow it down</h3><span>Pick a topic</span></div><div class="sk-tabs" role="tablist">' +
        [["kind", "Looking for"], ["cost", "Cost"], ["outcome", "What happens after"], ["where", "Where"], ["needs", "Entry needs"], ["you", "About you"]].map(function (t, i) { return '<button type="button" class="sk-tab" data-tab="' + t[0] + '" data-title="' + esc(t[1]) + '" aria-haspopup="dialog">' + esc(t[1]) + '<em></em>' + ic("arrow", "sk-tab-go") + '</button>'; }).join("") +
      '</div></div>' +
      '<div class="sk-tray" hidden><div class="sk-tray-card" role="dialog" aria-modal="true" aria-labelledby="sk-tray-t"><span class="sk-tray-grip"></span>' +
      '<div class="sk-tray-h"><h3 id="sk-tray-t"></h3><button type="button" class="sk-x" data-act="tray-close" aria-label="Close">' + ic("close") + '</button></div><p class="sk-tray-sub"></p>' +
      '<div class="sk-panel" data-panel="kind" hidden>' + chipRow("kind", [["route", "Route into work"], ["addon", "Add-on qualification"], ["business", "Business support"]], true, "g3") + '</div>' +
      '<div class="sk-panel" data-panel="cost" hidden>' + chipRow("cost", [["free", "Free"], ["funded", "Free if eligible"], ["earn", "Paid training"], ["paid", "You pay"]], true, "g2") + '</div>' +
      '<div class="sk-panel" data-panel="outcome" hidden>' + chipRow("outcome", [["job", "Job lined up"], ["interview", "Guaranteed interview"], ["demand", "High-demand skill"], ["support", "Job-search help"], ["business", "Start a business"]], true, "g3") + '</div>' +
      '<div class="sk-panel" data-panel="where" hidden>' + chipRow("where", [["local", "Local (Luton area)"], ["hybrid", "Hybrid"], ["online", "Online"], ["nation", "Nationwide"]], true, "g2") + '</div>' +
      '<div class="sk-panel" data-panel="needs" hidden>' + chipRow("needs", [["none", "Nothing"], ["gcse", "GCSEs"], ["licence", "Driving licence"], ["alevel", "A levels / diploma"], ["english", "Good English"], ["degree", "Degree"]], true, "g3") + '</div>' +
      '<div class="sk-panel" data-panel="you" hidden><div class="sk-two">' +
      '<label class="sk-mini"><span>Age</span><input type="number" inputmode="numeric" min="13" max="99" data-f="age" placeholder="e.g. 19"></label>' +
      '<label class="sk-mini"><span>Postcode</span><input type="text" data-f="postcode" placeholder="e.g. LU1 5JF" autocomplete="postal-code"></label></div>' +
      '<div class="sk-toggles"><label><input type="checkbox" data-f="women"> Only programmes run for women</label></div></div>' +
      '<div class="sk-tray-foot"><button type="button" class="sk-link" data-act="tray-clear">Clear these</button><button type="button" class="sk-btn" data-act="tray-close"><span class="sk-tray-n"></span>' + ic("check") + '</button></div>' +
      '</div></div>' +
      "</section>" +
      '<div class="sk-results"><div class="sk-active" aria-label="Your filters"></div><div class="sk-resbar"><strong class="sk-count"></strong><button type="button" class="sk-link" data-act="reset">Clear all</button></div><div class="sk-list"></div></div>' +
      '<div class="sk-sticky"><button type="button" class="sk-btn" data-act="see"><span class="sk-see-n"></span>' + ic("arrow") + '</button><button type="button" class="sk-link" data-act="reset">Clear</button></div>' +
      '<p class="sk-foot">Information checked ' + esc(D.checked) + ". Always confirm dates and eligibility with the provider. Powered by SMR Digital.</p>" +
      '<div class="sk-modal" hidden><div class="sk-modal-card" role="dialog" aria-modal="true" aria-label="Find my route"><button type="button" class="sk-x" data-act="close" aria-label="Close">' + ic("close") + '</button><div class="sk-modal-body"></div></div></div>' +
      '<div class="sk-pop" data-pop="nation" hidden><div class="sk-modal-card" role="dialog" aria-modal="true" aria-label="About nationwide options"><button type="button" class="sk-x" data-act="pop-close" aria-label="Close">' + ic("close") + '</button>' +
      '<h3 class="sk-q">Don\'t be put off by distance</h3><p>Some of the best training is only run in certain places, or costs far less somewhere else. Travelling for a few days, or even a few weeks, can be worth it when it gets you a qualification you can\'t get or afford locally.</p><p>The skills and certificates you earn there come back with you. You can use them to get hired in Luton, work for yourself or run a business here.</p><p>Every nationwide listing tells you why it\'s worth the trip and how to get there.</p><div class="sk-qnav"><span></span><button type="button" class="sk-btn" data-act="pop-close">Show nationwide options' + ic("arrow") + '</button></div></div></div>' +
      '<div class="sk-pop" data-pop="suggest" hidden><div class="sk-modal-card" role="dialog" aria-modal="true" aria-label="Suggest an opportunity"><button type="button" class="sk-x" data-act="pop-close" aria-label="Close">' + ic("close") + '</button><form class="sk-form" novalidate>' +
      '<h3 class="sk-q">Suggest an opportunity</h3><p>Courses, funded training, job schemes, grants or business support. We check every suggestion before it goes live.</p>' +
      fld("title", "Name of the course or scheme", true) + fld("provider", "Who runs it", true) + fld("link", "Link to its page", true, "url") +
      '<label class="sk-fl"><span>What does it cost? <i class="sk-req">*</i></span><select name="cost" required><option value="">Choose one</option><option value="free">Free</option><option value="funded">Free if eligible</option><option value="earn">Paid training</option><option value="paid">You pay</option><option value="unsure">Not sure</option></select></label>' +
      fld("place", "Where is it? (town, online or hybrid)", false) + '<label class="sk-fl"><span>Anything else we should know?</span><textarea name="notes" rows="3"></textarea></label>' +
      fld("name", "Your name", false) + fld("email", "Your email, if you want a reply", false, "email") +
      '<input name="website" tabindex="-1" autocomplete="off" hidden aria-hidden="true">' +
      '<p class="sk-reqnote"><span class="sk-req">*</span> Required</p><p class="sk-formmsg" role="status"></p>' +
      '<div class="sk-qnav"><span></span><button type="submit" class="sk-btn">Send suggestion' + ic("arrow") + '</button></div></form></div></div>';
    listEl = root.querySelector(".sk-list"); countEl = root.querySelector(".sk-count");

    root.addEventListener("click", function (e) {
      var chip = e.target.closest(".sk-chip");
      if (chip) {
        var g = chip.parentNode.getAttribute("data-group"), v = chip.getAttribute("data-v");
        if (Array.isArray(state[g])) { var i = state[g].indexOf(v); if (i >= 0) state[g].splice(i, 1); else state[g].push(v); }
        else state[g] = v;
        if (g === "where" && v === "nation" && state.where.indexOf("nation") >= 0 && !seenNation()) { markNation(); openPop("nation"); }
        syncControls(); draw(); return;
      }
      var tile = e.target.closest("[data-tile]");
      if (tile) { var k = tile.getAttribute("data-tile"), ti = state.sectors.indexOf(k); if (ti >= 0) state.sectors.splice(ti, 1); else state.sectors.push(k); syncControls(); draw(); return; }
      var tab = e.target.closest("[data-tab]");
      if (tab) {
        openTray(tab.getAttribute("data-tab"), tab.getAttribute("data-title"));
        return;
      }
      var act = e.target.closest("[data-act]");
      if (act) {
        var a = act.getAttribute("data-act");
        if (a === "dd" && root.querySelector(".sk-dd-panel")) { var pnl = root.querySelector(".sk-dd-panel"), btn = root.querySelector(".sk-dd-btn"); pnl.hidden = !pnl.hidden; btn.setAttribute("aria-expanded", !pnl.hidden); root.querySelector(".sk-dd").classList.toggle("open", !pnl.hidden); }
        if (a === "dd-clear") { state.sectors = []; syncControls(); draw(); }
        if (a === "quiz") openQuiz();
        if (a === "close") closeQuiz();
        if (a === "far") { state.far = true; if (state.where.length && state.where.indexOf("nation") < 0) state.where.push("nation"); syncControls(); draw(); if (!seenNation()) { markNation(); openPop("nation"); } }
        if (a === "suggest") openPop("suggest");
        if (a === "open") {
          var cd = act.closest(".sk-card"), full = cd.querySelector(".sk-full"), opn = full.hidden;
          full.hidden = !opn; cd.classList.toggle("open", opn); act.setAttribute("aria-expanded", opn); act.querySelector("span").textContent = opn ? "Less details" : "More details";
        }
        if (a === "share") shareListing(act.getAttribute("data-id"), act);
        if (a === "tray-close") closeTray();
        if (a === "tray-clear") { clearGroup(trayKey); syncControls(); draw(); }
        if (a === "rm") { removeFilter(act.getAttribute("data-g"), act.getAttribute("data-v")); syncControls(); draw(); }
        if (a === "see") root.querySelector(".sk-results").scrollIntoView({ behavior: "smooth", block: "start" });
        if (a === "pop-close") closePops();
        if (a === "reset") { state.sectors = []; state.cost = []; state.outcome = []; state.kind = []; state.where = []; state.needs = []; state.mode = "any"; state.far = false; state.women = false; state.age = null; state.postcode = ""; state.home = ""; state.budget = null; state.q = ""; state.quiz = null; root.querySelector("[data-f=q]").value = ""; syncControls(); draw(); }
        return;
      }
      var opt = e.target.closest(".sk-opt");
      if (opt) {
        var q = QZ[qi], v2 = opt.getAttribute("data-v");
        if (q.multi) { var arr = qa[q.k] = qa[q.k] || []; var j = arr.indexOf(v2); if (j >= 0) arr.splice(j, 1); else arr.push(v2); renderQuiz(); }
        else { qa[q.k] = v2; renderQuiz(); setTimeout(function () { if (qi < QZ.length - 1) { qi++; renderQuiz(); } }, 180); }
        return;
      }
      var nav = e.target.closest("[data-q]");
      if (nav) {
        if (nav.getAttribute("data-q") === "back") { qi--; renderQuiz(); return; }
        if (!quizValid()) { var b = root.querySelector(".sk-modal-body"); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); return; }
        if (qi < QZ.length - 1) { qi++; renderQuiz(); } else finishQuiz();
      }
      if (e.target.classList.contains("sk-modal")) closeQuiz();
      if (e.target.classList.contains("sk-pop")) closePops();
      if (e.target.classList.contains("sk-tray")) closeTray();
    });
    root.addEventListener("input", function (e) {
      var k = e.target.getAttribute("data-k");
      if (k) { qa[k] = e.target.value; return; }
      var f = e.target.getAttribute("data-f");
      if (f === "q") state.q = e.target.value.trim();
      if (f === "age") { var a = parseInt(e.target.value, 10); state.age = a >= 13 ? a : null; }
      if (f === "postcode") state.postcode = e.target.value.trim();
      if (f) draw();
    });
    root.addEventListener("change", function (e) {
      var f = e.target.getAttribute("data-f");
      if (f === "women") { state.women = e.target.checked; draw(); }
      var sc = e.target.getAttribute("data-sec");
      if (sc) { var k = state.sectors.indexOf(sc); if (e.target.checked && k < 0) state.sectors.push(sc); if (!e.target.checked && k >= 0) state.sectors.splice(k, 1); syncControls(); draw(); }
    });
    root.addEventListener("submit", function (e) { if (e.target.classList.contains("sk-form")) { e.preventDefault(); sendSuggestion(e.target); } });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeQuiz(); closePops(); closeTray(); } });
    secCounts(); syncControls(); draw(); openFromHash();
    window.addEventListener("hashchange", openFromHash);
    var sticky = root.querySelector(".sk-sticky"), filt = root.querySelector(".sk-filters");
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { sticky.classList.toggle("show", en[0].isIntersecting); }).observe(filt);
  }

  window.NGSSkills = { mount: mount, _results: results, _state: state };
})();

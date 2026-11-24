/* Policy & document library: requirements (with official sources) and editable templates.
   General guidance, not legal advice. Sources checked 24 November 2026. */
window.POLICY = (() => {
const REVIEWED = '24 November 2026';
/* questionnaire */
const ORGT = [['charity', 'Registered charity'], ['cio', 'CIO (charitable incorporated organisation)'], ['cic', 'CIC (community interest company)'], ['group', 'Unincorporated group or association'], ['school', 'School or academy'], ['pta', 'PTA / parents’ association'], ['mosque', 'Mosque or place of worship'], ['youth', 'Youth club'], ['food', 'Food bank or community kitchen']];
const QS = [['kids', 'Do you work with children (under 18)?'], ['adults', 'Do you work with adults who may be at risk (e.g. older, disabled or vulnerable people)?'], ['vols', 'Do you have volunteers?'], ['staff', 'Do you employ paid staff?'], ['staff5', 'Do you employ five or more people?'], ['food', 'Do you prepare, store or hand out food?'], ['events', 'Do you run events or activities?'], ['data', 'Do you keep personal details (names, phone numbers, emails, photos)?'], ['fund', 'Do you fundraise or collect cash or donations?'], ['giftaid', 'Do you claim Gift Aid?'], ['premises', 'Do you own or rent premises?'], ['lone', 'Do people ever work or volunteer alone (e.g. home visits, locking up)?'], ['social', 'Do you post on social media?']];
const isCharity = a => ['charity', 'cio', 'mosque', 'food', 'pta'].includes(a.type) || a.charity;
/* requirements: [id, title, test(answers), level, basis, who, risk, sources[], templates[]] level: 'law' | 'reg' (regulator expects) | 'good' */
const REQ = [
  ['safeguarding', 'Safeguarding policy and procedures', a => a.kids || a.adults || a.type === 'school' || a.type === 'youth', 'reg', 'Charity trustees must take reasonable steps to protect people who come into contact with their charity, and the Charity Commission expects a safeguarding policy that is reviewed regularly. Schools and colleges must follow Keeping children safe in education (2026 edition, in force from 1 September 2026).', 'Any organisation working with children or adults at risk. Required for schools; expected of charities.', 'People can be harmed. For charities, the Charity Commission can treat poor safeguarding as a governance failure and open a regulatory case; schools can be judged inadequate on inspection.', ['https://www.gov.uk/guidance/safeguarding-and-protecting-people-for-charities-and-trustees', 'https://www.gov.uk/government/publications/keeping-children-safe-in-education--2'], ['safeguarding', 'codeconduct']],
  ['dbs', 'DBS checks for eligible roles', a => a.kids || a.adults, 'law', 'Some roles working with children or adults at risk are eligible for (and in “regulated activity” must have) an enhanced DBS check. It is an offence to knowingly let a barred person do regulated activity.', 'Organisations with staff or volunteers in eligible roles.', 'A barred person could work with children or adults at risk. Organisations can commit an offence if they knowingly allow it.', ['https://www.gov.uk/find-out-dbs-check'], ['volagreement']],
  ['dataprotection', 'Data protection policy, privacy notice and breach log', a => a.data || a.vols || a.staff, 'law', 'Under UK GDPR and the Data Protection Act 2018 you must tell people how you use their data (a privacy notice), keep it secure, and keep a record of any personal data breaches. Serious breaches must be reported to the ICO within 72 hours.', 'Anyone keeping personal details, including small groups with a WhatsApp list or a spreadsheet of members.', 'The ICO can take action, including fines, and people can complain or claim compensation. Loss of trust is the bigger risk for most small groups.', ['https://www.gov.uk/data-protection', 'https://ico.org.uk/for-organisations/data-protection-fee/data-protection-fee'], ['privacy', 'dataprotection', 'breachlog', 'photoconsent']],
  ['icofee', 'Check whether you must pay the ICO data protection fee', a => a.data || a.staff, 'law', 'Organisations that process personal data must pay the ICO a data protection fee unless they are exempt. Some not-for-profit organisations are exempt; use the ICO’s self-assessment to check.', 'Most organisations that keep personal data electronically.', 'The ICO can issue a penalty for not paying a fee that is due.', ['https://www.gov.uk/data-protection-register-notify-ico-personal-data', 'https://ico.org.uk/for-organisations/data-protection-fee/data-protection-fee'], []],
  ['photo', 'Photo and video consent', a => a.social || a.events || a.kids, 'law', 'Photos and videos of identifiable people are personal data. You need a lawful basis (often consent) to take and share them, and extra care for children.', 'Anyone posting photos of people, especially children, online or in print.', 'Complaints, requests to remove images, ICO action, and real safeguarding risks if a child’s image and location are shared.', ['https://www.gov.uk/data-protection'], ['photoconsent', 'socialmedia']],
  ['riskassess', 'Risk assessments (general and events)', a => a.staff || a.events || a.vols || a.premises, 'law', 'Employers must assess risks to employees and others affected by their work (Management of Health and Safety at Work Regulations 1999, regulation 3). With five or more employees, the significant findings must be written down. For volunteer-only groups it is good practice, and venues and insurers often ask for one.', 'Employers by law; strongly recommended for anyone running activities or events.', 'Injuries, insurance claims being refused, and HSE or council enforcement for employers.', ['https://www.legislation.gov.uk/uksi/1999/3242/regulation/3', 'https://www.hse.gov.uk/simple-health-safety/risk/steps-needed-to-manage-risk.htm'], ['riskgeneral', 'riskevent']],
  ['hspolicy', 'Health and safety policy', a => a.staff || a.premises, 'law', 'Every employer needs a policy for managing health and safety; it must be written down once you have five or more employees.', 'Employers (written if 5+ employees). Good practice for anyone with premises or volunteers.', 'Enforcement action and weaker defence if someone is injured.', ['https://www.hse.gov.uk/simple-health-safety/policy/index.htm'], ['hspolicy']],
  ['elinsurance', 'Employers’ liability insurance', a => a.staff, 'law', 'Under the Employers’ Liability (Compulsory Insurance) Act 1969 most employers must have employers’ liability insurance and display the certificate. Volunteers may not be “employees” under the Act, but many insurers and the NCVO advise making sure volunteers are covered too.', 'Employers. Check volunteer cover with your insurer.', 'Fines for each day without cover, and personal cost if a claim is made.', ['https://www.hse.gov.uk/pubns/hse40.htm', 'https://www.ncvo.org.uk/help-and-guidance/involving-volunteers/volunteers-and-the-law/insurance-and-volunteers/'], []],
  ['foodreg', 'Register as a food business', a => a.food || a.type === 'food', 'law', 'Food businesses, including many charities and community groups that provide food regularly, must register with their local council at least 28 days before starting. Occasional, small-scale events may not need to; the FSA explains how to decide.', 'Food banks, community kitchens and groups handing out or cooking food regularly.', 'Council enforcement, and food safety problems going unnoticed.', ['https://www.gov.uk/food-business-registration', 'https://www.food.gov.uk/business-guidance/food-banks-and-charities/registering-as-a-food-business-charity'], ['foodsafety']],
  ['foodsafety', 'Food safety procedures and allergen information', a => a.food || a.type === 'food', 'law', 'Food businesses must have food safety management procedures based on HACCP principles (the FSA’s Safer Food, Better Business pack is one way) and give accurate allergen information.', 'Anyone registered as a food business; good practice for anyone serving food.', 'People can become ill or have allergic reactions; councils can take enforcement action.', ['https://www.gov.uk/government/publications/food-safety-for-community-cooking-and-food-banks/food-safety-for-community-cooking-and-food-banks', 'https://allergytraining.food.gov.uk/'], ['foodsafety']],
  ['volagreement', 'Volunteer agreement and role descriptions', a => a.vols, 'good', 'Not a legal requirement, but a clear role description and volunteer agreement help volunteers know what to expect. Avoid wording that makes it look like an employment contract.', 'Anyone with volunteers.', 'Confusion, volunteers leaving, and in rare cases volunteers being treated as workers with employment rights.', ['https://www.ncvo.org.uk/help-and-guidance/involving-volunteers/volunteers-and-the-law/insurance-and-volunteers/'], ['volagreement', 'volrole', 'volexpenses']],
  ['complaints', 'Complaints procedure', a => true, 'good', 'Good practice for everyone. If you fundraise, the Code of Fundraising Practice sets standards that apply to all charitable institutions, including how you handle complaints.', 'Everyone; especially organisations that fundraise or provide services.', 'Small problems turn into big ones, and complaints may go to regulators instead.', ['https://www.fundraisingregulator.org.uk/code'], ['complaints']],
  ['equality', 'Equality and diversity', a => a.staff || a.vols || a.premises || true, 'law', 'The Equality Act 2010 protects people from discrimination by employers and by service providers, including voluntary and community organisations. A written policy is not strictly required for every organisation, but it helps show how you meet the law.', 'Employers and anyone providing services to the public.', 'Discrimination claims and complaints.', ['https://www.gov.uk/guidance/equality-act-2010-guidance'], ['equality']],
  ['lone', 'Lone working arrangements', a => a.lone, 'law', 'Employers must address health and safety risks before staff are allowed to work alone. Good practice for volunteers too.', 'Anyone with staff or volunteers working alone.', 'Someone hurt or unwell with no one knowing.', ['https://www.hse.gov.uk/lone-working/'], ['lone']],
  ['coi', 'Conflict of interest policy', a => isCharity(a) || a.type === 'cic', 'reg', 'Charity trustees must identify and manage conflicts of interest (Charity Commission guidance CC29). CIC directors have similar duties under company law.', 'Charities, CIOs, CICs and their boards.', 'Decisions can be challenged, money may have to be repaid, and the Charity Commission may get involved.', ['https://www.gov.uk/government/publications/conflicts-of-interest-a-guide-for-charity-trustees-cc29'], ['coi']],
  ['reserves', 'Reserves policy', a => isCharity(a), 'reg', 'The Charity Commission expects trustees to have a reserves policy that explains how much money is kept back and why, and charities preparing accruals accounts must explain it in their annual report.', 'Charities and CIOs.', 'Running out of money unexpectedly, or holding too much without a reason.', ['https://www.gov.uk/government/publications/charity-reserves-building-resilience-cc19'], ['reserves']],
  ['fincontrols', 'Financial controls and cash handling', a => isCharity(a) || a.fund || a.type === 'group', 'reg', 'Charity trustees must protect the charity’s money. The Charity Commission’s guidance CC8 sets out internal financial controls, including two people counting cash and dual authorisation of payments.', 'Charities, and anyone collecting cash or donations.', 'Fraud, mistakes and loss of trust from donors.', ['https://www.gov.uk/government/publications/internal-financial-controls-for-charities-cc8'], ['fincontrols']],
  ['giftaid', 'Gift Aid records', a => a.giftaid, 'law', 'To claim Gift Aid you must hold a valid declaration for each donor and keep records that show the donations and declarations, so HMRC can check your claims.', 'Charities and CASCs claiming Gift Aid.', 'HMRC can recover Gift Aid you can’t evidence, plus penalties.', ['https://www.gov.uk/claim-gift-aid'], ['fincontrols']],
  ['trustees', 'Trustee or committee roles and responsibilities', a => isCharity(a) || a.type === 'group' || a.type === 'pta', 'reg', 'Charity trustees have legal duties set out in the Charity Commission’s The essential trustee (CC3). Committees of unincorporated groups should follow their constitution.', 'Charity trustees and committee members.', 'Poor decisions, disputes and, for charities, regulatory action.', ['https://www.gov.uk/government/publications/the-essential-trustee-what-you-need-to-know-what-you-need-to-do-cc3'], ['trustees']],
  ['socialmedia', 'Social media policy', a => a.social, 'good', 'The Charity Commission has guidance on charities and social media, including keeping posts in line with your purposes and protecting people.', 'Anyone posting on behalf of the organisation.', 'Reputational harm, safeguarding issues and data protection breaches.', ['https://www.gov.uk/government/publications/charities-and-social-media'], ['socialmedia', 'photoconsent']],
  ['whistle', 'Whistleblowing policy', a => a.staff, 'good', 'Workers who report certain wrongdoing are protected by law (Public Interest Disclosure Act 1998). A policy tells people how to raise concerns safely.', 'Employers; good practice with volunteers.', 'Concerns go unreported, and employment claims if whistleblowers are treated badly.', ['https://www.gov.uk/whistleblowing'], ['whistle']],
  ['employment', 'Written statement of employment terms', a => a.staff, 'law', 'Employers must give employees and workers a written statement of the main terms of employment from their first day.', 'Employers.', 'Employment tribunal awards.', ['https://www.gov.uk/employment-contracts-and-conditions'], []],
  ['codeconduct', 'Code of conduct', a => a.kids || a.adults || a.vols || a.staff, 'good', 'A short code of conduct supports your safeguarding policy by setting out expected behaviour for staff and volunteers.', 'Anyone with staff or volunteers, especially working with children or adults at risk.', 'Unclear boundaries and harder safeguarding decisions.', ['https://www.gov.uk/guidance/safeguarding-and-protecting-people-for-charities-and-trustees'], ['codeconduct']],
];
const requiredFor = a => REQ.filter(r => r[2](a));

/* ---------- templates (markdown, edit the [square brackets]) ---------- */
const H = (t, tags, body) => ({ t, tags, body: `# ${t}\n\n**[Organisation name]**\nAdopted: [date]   Last reviewed: [date]   Next review: [date, usually within 12 months]\nApproved by: [trustees / committee / headteacher]\n\n${body.trim()}\n\n---\nTemplate from Luton Community Hub by SMR Digital, last updated ${REVIEWED}. General guidance, not legal advice. Adapt it to your organisation and check anything you’re unsure about with the Charity Commission, ICO or a qualified adviser.\n` });
const ALLT = ['charity', 'cio', 'cic', 'group', 'school', 'pta', 'mosque', 'youth', 'food'];
const TPL = {
  safeguarding: H('Safeguarding policy and procedures', ALLT, `
## 1. Why we have this policy
[Organisation name] believes everyone has the right to be safe. This policy explains how we protect children (anyone under 18) and adults at risk who take part in our activities, and what to do if there is a concern.

## 2. Who it applies to
All trustees/committee members, staff, volunteers, contractors and anyone working on our behalf.

## 3. Our commitments
- We put the welfare of children and adults at risk first.
- We recruit safely, including references and DBS checks where a role is eligible.
- Everyone gets safeguarding induction and refresher training appropriate to their role.
- We keep a code of conduct and make sure people follow it.
- We record and act on concerns, and share information with the right agencies when needed.
- We review this policy at least every year and after any serious incident.

## 4. Designated Safeguarding Lead (DSL)
Name: [name]   Phone: [number]   Email: [email]
Deputy: [name]   Phone: [number]
Safeguarding trustee: [name]

## 5. Recognising abuse
Abuse can be physical, emotional, sexual, neglect, financial, discriminatory, domestic abuse, exploitation (including criminal exploitation and county lines), radicalisation, modern slavery or online abuse. Signs include unexplained injuries, changes in behaviour, fear of a particular person, or someone telling you something worrying.

## 6. What to do if you are worried
1. **If someone is in immediate danger, call 999.**
2. Listen calmly. Don’t promise to keep a secret. Don’t ask leading questions.
3. Write down what you saw or heard, in their words, with the date and time, and sign it.
4. Tell the DSL the same day. If the concern is about the DSL, tell the safeguarding trustee.
5. The DSL decides on next steps, including referral to:
   - Luton Council children’s services (Multi-Agency Safeguarding Hub) for children
   - Luton Council adult social care for adults at risk
   - The police
6. Keep the information confidential and only share on a need-to-know basis.

## 7. Allegations against staff or volunteers
Report to the DSL (or safeguarding trustee if it involves the DSL). Concerns about anyone working with children must be referred to the Local Authority Designated Officer (LADO). The person may be suspended while it is looked into; this is a neutral act.

## 8. Safer recruitment
Role descriptions, application form, at least two references, interview, ID checks, DBS check at the right level for eligible roles, and a probation period.

## 9. Online safety
We follow our social media policy and photo consent process. No private one-to-one messaging between adults and children; use group channels with two adults.

## 10. Records
Safeguarding records are stored securely, separate from other records, and kept for as long as required.

## 11. Serious incidents (charities)
Trustees will report serious safeguarding incidents to the Charity Commission.

Key contacts: Luton Council children’s and adults’ services: [add current numbers from luton.gov.uk]. NSPCC helpline: [number]. Police: 999 (emergency) or 101.`),
  photoconsent: H('Photo and video consent form', ALLT, `
We’d like to take photos and videos at [event / activity] to show what we do and to encourage others to take part.

**How we will use them** (tick all you agree to)
- [ ] Our website
- [ ] Our social media ([list platforms])
- [ ] Printed materials (posters, leaflets, reports)
- [ ] Reports to funders
- [ ] Local press

**What we promise**
- We will not use full names alongside photos of children.
- We will not share your image for any other purpose without asking.
- We keep images for [2 years] and then delete them, unless you agree otherwise.
- You can withdraw consent at any time by contacting [email/phone]. We’ll stop using the images in new materials and remove them from our website and social media where we can. Printed materials already given out can’t be recalled.

Name of person in photo: ____________________
If under 18 (or unable to consent), name of parent/carer: ____________________
Signature: ____________________   Date: __________

Tell people at the start of events where photos are being taken, and offer a lanyard or sticker for anyone who doesn’t want to be photographed.`),
  privacy: H('Privacy notice', ALLT, `
## Who we are
[Organisation name], [address]. Contact: [email/phone]. [Charity number / company number if any.]

## What we collect
[e.g. names, contact details, emergency contacts, attendance, photos (with consent), donations and Gift Aid declarations, volunteer applications.]

## Why we use it, and our lawful basis
| Purpose | Lawful basis |
|---|---|
| Running activities and keeping people safe | Legitimate interests / vital interests |
| Sending updates you asked for | Consent |
| Gift Aid claims and accounts | Legal obligation |
| Volunteer and staff records | Contract / legitimate interests |
| Photos and videos | Consent |
[Edit this table to match what you actually do. If you use special category data, such as health information, add the extra condition you rely on.]

## Who we share it with
Only where needed: [e.g. HMRC for Gift Aid, our insurer, funders (anonymised), the council or police for safeguarding]. We never sell your data.

## How long we keep it
[e.g. attendance records 3 years; Gift Aid records 6 years after the end of the accounting period; safeguarding records as required.]

## Your rights
You can ask to see, correct or delete your data, object to how we use it, or withdraw consent. Contact [email]. If you’re unhappy, you can complain to the Information Commissioner’s Office (ico.org.uk).

## Keeping it safe
[e.g. password-protected devices, two-step verification on email, locked cabinet for paper records.]`),
  dataprotection: H('Data protection policy', ALLT, `
## Purpose
To make sure [Organisation name] handles personal data lawfully, fairly and securely under UK GDPR and the Data Protection Act 2018.

## Responsibilities
Data protection lead: [name]. Trustees/committee are responsible overall. Everyone who handles personal data must follow this policy.

## Principles we follow
Personal data is: used lawfully, fairly and transparently; collected for clear purposes; limited to what we need; accurate; kept no longer than needed; and kept secure.

## In practice
- Collect only what we need, and tell people why (see our privacy notice).
- Use organisation accounts, not personal ones, where possible. Turn on two-step verification.
- Don’t share personal data in group chats unless needed. Use BCC for group emails.
- Lock paper records away; password-protect devices; don’t leave laptops unattended.
- Delete data on schedule (see retention list below).
- Get consent for photos and for marketing messages.

## Subject access and other requests
Pass any request to the data protection lead straight away. We must reply within one month.

## Breaches
Report any loss, theft or misuse of personal data to the data protection lead immediately. Record it in the breach log. If it is likely to put people’s rights at risk, the lead reports it to the ICO within 72 hours and decides whether to tell the people affected.

## Retention list
| Record | Keep for |
|---|---|
| [Members/attendees] | [x years] |
| [Volunteer files] | [x years after leaving] |
| [Gift Aid] | [6 years after the accounting period] |

## ICO fee
We have checked whether we must pay the ICO data protection fee: [paid / exempt, date checked].`),
  breachlog: H('Data breach log', ALLT, `
Use one row per incident, even small ones you decide not to report.

| Date found | What happened | Data and people affected | How found | Risk to people (low/medium/high) | Reported to ICO? (date, reference) | People told? | Action taken to stop it happening again | Logged by |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

**Remember:** if a breach is likely to put people’s rights and freedoms at risk, report it to the ICO within 72 hours of finding it. If it is likely to be high risk, tell the people affected without undue delay.`),
  riskgeneral: H('General risk assessment', ALLT, `
Activity/area: [e.g. weekly youth session in main hall]   Assessed by: [name]   Date: [date]

| Hazard | Who might be harmed and how | What we already do | What else we’ll do | Who | By when | Done |
|---|---|---|---|---|---|---|
| Slips and trips (wet floors, cables) | Visitors, volunteers: falls | Mop spills, tape cables | Wet floor signs | [name] | [date] | |
| Fire | Everyone | Clear exits, extinguishers checked | Fire drill each term | | | |
| Manual handling (tables, boxes) | Volunteers: back injury | Two-person lifts | Trolley for heavy items | | | |
| Lone working | Staff/volunteers | Buddy system | Check-in by text | | | |
| Food allergies | Attendees | Allergen labels | Ask about allergies at sign-up | | | |
| Safeguarding | Children / adults at risk | DBS-checked leaders, 2 adults present | Refresher training | | | |

First aid kit location: [ ]   First aider: [ ]   Nearest A&E: Luton and Dunstable University Hospital
Review this assessment when something changes, after any incident, and at least every year.`),
  riskevent: H('Event risk assessment', ALLT, `
Event: [name]   Date: [ ]   Venue: [ ]   Expected numbers: [ ]   Event lead: [name, phone]

## Before the event
- [ ] Venue booked and its own risk assessment/fire procedures seen
- [ ] Insurance checked (public liability)
- [ ] Food: registered/allergen info ready (if serving food)
- [ ] First aider and first aid kit
- [ ] Stewards briefed; lost child / vulnerable adult procedure
- [ ] Photo consent signs and opt-out lanyards
- [ ] Accessibility: step-free access, seating, toilets

## Hazards
| Hazard | Risk | Controls | Responsible |
|---|---|---|---|
| Crowding at entrances | Crushing, falls | Separate in/out, stewards | |
| Weather (outdoor) | Cold, heat, wind on gazebos | Weighted gazebos, shelter, water | |
| Electrical equipment | Shock, fire | PAT-tested, covered cables | |
| Cash handling | Theft | Two people, locked box, bank next day | |
| Lost child | Distress, harm | Meeting point, procedure briefed | |
| Medical emergency | Harm | First aider, clear access for ambulance | |

Emergency: call 999. Meeting point: [ ]. Event lead has the final say on stopping the event if unsafe.`),
  hspolicy: H('Health and safety policy', ALLT, `
## Part 1: Statement of intent
[Organisation name] will, as far as reasonably practicable, protect the health, safety and welfare of staff, volunteers, visitors and everyone affected by our activities.
Signed: ______________ (Chair/Director)   Date: ______

## Part 2: Responsibilities
- Overall responsibility: [trustees/board, named lead]
- Day-to-day responsibility: [name]
- Everyone: follow instructions and training, and report hazards, accidents and near misses.

## Part 3: Arrangements
- Risk assessments: done by [name], reviewed yearly or after changes.
- First aid: kit at [location], first aider [name]. Accidents recorded in the accident book.
- Fire: extinguishers checked [annually], fire drill [termly], escape routes kept clear.
- Equipment: electrical items checked; faulty equipment taken out of use and labelled.
- Training: induction for all new staff and volunteers.
- Lone working: see lone working policy.
- RIDDOR: certain injuries to workers, and some to members of the public, must be reported to HSE. [Name] is responsible.
- Insurance: employers’ liability certificate displayed at [location] (if you have employees).`),
  foodsafety: H('Food safety basics', ['food', 'mosque', 'charity', 'cio', 'school', 'youth', 'group', 'pta'], `
**Registration:** registered with Luton Council on [date] (or: not required because [reason], checked [date]).

## The 4 Cs
- **Cleaning:** wash hands before handling food; clean and sanitise surfaces; clean as you go.
- **Cooking:** cook food thoroughly until steaming hot all the way through; reheat once only.
- **Chilling:** fridge at 5°C or below; record temperatures daily; cool hot food within 90 minutes before chilling.
- **Cross-contamination:** separate raw and ready-to-eat food; different boards/utensils; store raw meat at the bottom of the fridge.

## Allergens
Know which of the 14 allergens are in every dish. Label pre-packed food correctly. If anyone asks, check the recipe and labels; never guess. Keep a record of ingredients.

## Donated food (food banks)
Check use-by dates (never give out food past use-by), packaging intact, chilled items kept cold. Record where food came from.

## Records
Fridge temperature log, cleaning schedule, allergen matrix, training records (e.g. FSA allergen training), supplier list.

## Training
Everyone handling food gets food hygiene training appropriate to their role. Allergy training: Food Standards Agency online course.`),
  volagreement: H('Volunteer agreement', ['charity', 'cio', 'cic', 'group', 'school', 'pta', 'mosque', 'youth', 'food'], `
This agreement describes what you can expect from us and what we hope from you. It is binding in honour only. It is not a contract of employment and is not intended to create a legal relationship.

## We will
- Give you a clear role description and an induction.
- Provide training, supervision and support, with a named contact: [name].
- Repay agreed out-of-pocket expenses (see volunteer expenses policy).
- Provide a safe place to volunteer and appropriate insurance cover.
- Treat you fairly and listen to your ideas and concerns.
- Respect your time: you can stop volunteering at any time.

## We hope you will
- Follow our policies, especially safeguarding, code of conduct, data protection and health and safety.
- Let us know if you can’t make a session, as early as you can.
- Keep personal information you see confidential.
- Raise any concerns with [name].

Volunteer name: ______________   Role: ______________   Start date: ______
Signed (volunteer): ______________   Signed (for [Organisation]): ______________`),
  volrole: H('Volunteer role description', ['charity', 'cio', 'cic', 'group', 'school', 'pta', 'mosque', 'youth', 'food'], `
**Role title:** [e.g. Food bank welcome volunteer]
**Where:** [address]   **When:** [e.g. Saturdays 10am–1pm]   **Time:** [e.g. 3 hours a week, minimum 3 months]
**Supported by:** [name, role]

## What you’ll do
- [Task 1]
- [Task 2]
- [Task 3]

## What you’ll gain
[e.g. experience for your CV, training in food hygiene, a reference after 3 months, meeting people.]

## Who we’re looking for
[e.g. friendly and patient; able to stand for periods; no experience needed.]

## Checks and training
[e.g. 2 references; DBS check if working with children; induction session.]

## Expenses
[e.g. travel within Luton repaid with receipts.]`),
  volexpenses: H('Volunteer expenses policy', ['charity', 'cio', 'cic', 'group', 'school', 'pta', 'mosque', 'youth', 'food'], `
We don’t want volunteering to cost anyone money. We repay genuine out-of-pocket expenses, agreed in advance.

## What we repay
- Travel: public transport (tickets/receipts), or mileage at [rate] per mile for agreed journeys.
- Meals when volunteering for more than [x] hours: up to £[amount] with receipt.
- Other agreed costs (e.g. phone calls, materials) with receipts.

## How to claim
Complete a claim form within [one month], attach receipts, and give it to [name]. Payments are made by [bank transfer] within [x days].

## Important
We only repay actual costs. Flat-rate payments or “thank you” payments can make volunteers look like workers in law and can affect benefits, so we don’t make them. If you receive benefits, ask us if you’re unsure.`),
  complaints: H('Complaints procedure', ALLT, `
We want to know when we get things wrong so we can put them right.

## How to complain
Talk to [name/role], or write to [email/address]. Please tell us what happened, when, and what you’d like us to do.

## What happens next
1. We acknowledge your complaint within [5 working days].
2. [Name/role] looks into it and replies within [20 working days], or tells you if it will take longer and why.
3. If you’re not happy with the reply, you can ask for it to be reviewed by [Chair of trustees / board] within [x] weeks. Their decision is final within our organisation.

## Other routes
- Fundraising complaints you’re not happy with can go to the Fundraising Regulator.
- Serious concerns about a charity can be raised with the Charity Commission.
- Data protection complaints can go to the ICO.

We keep a log of complaints and review it at least yearly to learn from them. Complaints about safeguarding are dealt with under our safeguarding policy.`),
  equality: H('Equality, diversity and inclusion policy', ALLT, `
[Organisation name] welcomes everyone. We will not discriminate against anyone because of age, disability, gender reassignment, marriage or civil partnership, pregnancy or maternity, race, religion or belief, sex or sexual orientation (the protected characteristics in the Equality Act 2010).

## In practice we will
- Make reasonable adjustments so disabled people can take part.
- Make our activities, buildings and information as accessible as we can (large print, plain English, translation where possible).
- Recruit staff and volunteers fairly, on the basis of the role’s needs.
- Challenge discriminatory language and behaviour.
- Collect equality information only where it helps us improve, with consent, and keep it confidential.

## If something goes wrong
Raise it under our complaints procedure, or with [name]. Staff can use our grievance procedure.

Where we run activities for a particular group (for example women-only sessions), we will make sure this is allowed under the Equality Act exceptions and explain why.`),
  lone: H('Lone working policy', ALLT, `
Lone working means working or volunteering without other people from the organisation nearby, e.g. home visits, opening or closing a building, or driving alone.

## Before lone working
- The activity is risk assessed. Some activities must never be done alone (e.g. [list]).
- The lone worker has a charged phone, emergency contacts, and knows the check-in procedure.

## Check-in procedure
1. Tell [buddy/coordinator] where you’re going, who you’re seeing and when you expect to finish.
2. Text or call when you arrive and when you leave.
3. If you haven’t checked in within [30 minutes] of the expected time, the buddy calls you. If no answer after [2 attempts], they call [manager] and, if needed, the police.

## Personal safety
Trust your instincts and leave if you feel unsafe. No one should enter a situation they believe is dangerous. Report incidents and near misses.`),
  coi: H('Conflict of interest policy', ['charity', 'cio', 'cic', 'mosque', 'food', 'pta', 'school'], `
A conflict of interest is any situation where a trustee’s, director’s or committee member’s personal interests, or loyalty to someone else, could (or could appear to) affect their decisions for [Organisation name].

## What we do
1. **Declare:** everyone completes a register of interests when they join and updates it yearly or when things change (e.g. family members employed, businesses they’re connected to, other charities).
2. **Ask at every meeting:** “Does anyone have a conflict of interest with any item on this agenda?”
3. **Manage:** a conflicted person leaves the discussion and doesn’t vote. The decision and how the conflict was handled are minuted.
4. **Benefits:** trustees can only receive payment or benefit if allowed by the governing document, the law or the Charity Commission.

Register of interests: Name | Interest | Date declared | Action taken`),
  reserves: H('Reserves policy', ['charity', 'cio', 'mosque', 'food', 'pta'], `
## Why we keep reserves
To protect our services if income falls, to cover unexpected costs, and to wind down responsibly if we had to close.

## How much
Our target is [e.g. 3–6 months] of essential running costs, currently £[amount] based on [the last year’s accounts]. This covers [rent, salaries/notice pay, insurance, utilities, essential services].

## What counts
Unrestricted funds that are freely available, excluding fixed assets and designated funds.

## If we’re above or below target
- Below: trustees will [e.g. review spending and fundraising plans] and aim to rebuild within [x years].
- Above: trustees will [e.g. invest the surplus in our charitable purposes].

## Review
Trustees review this policy each year when approving the annual accounts, and the annual report explains our reserves.`),
  fincontrols: H('Financial controls and cash handling', ['charity', 'cio', 'cic', 'group', 'mosque', 'food', 'pta', 'school', 'youth'], `
## Banking
- Accounts in the organisation’s name, never personal accounts.
- At least two unrelated authorised signatories; online payments need dual authorisation over £[amount].
- Bank statements reconciled monthly by someone who doesn’t make payments.

## Spending
- Budget approved by trustees/committee each year.
- Purchases over £[amount] need [two quotes / approval].
- Every payment has an invoice or receipt.

## Cash and collections
- Cash counted by two unrelated people, recorded and signed by both.
- Cash kept in a locked box and banked within [x days].
- Collection tins sealed and numbered.

## Gift Aid
- Keep a valid declaration for every donor and a record linking each donation to it.
- Claims prepared by [name] and checked by [name].

## Reporting
Finance report to every [trustee/committee] meeting. Annual accounts prepared and, where required, independently examined or audited, and filed on time.`),
  socialmedia: H('Social media policy', ALLT, `
## Who can post
Only named people can post for [Organisation name]: [names]. Accounts use organisation email addresses and two-step verification. Passwords are changed when someone leaves.

## What we post
Content that supports our purposes: news, events, appeals, thank-yous and useful information. We don’t post party-political content.

## People and photos
Only with consent (see photo consent form). No full names of children with their image. No location details that could put someone at risk.

## Personal accounts
Staff and volunteers shouldn’t speak for the organisation on personal accounts or connect privately with children or service users.

## Comments and problems
Reply politely; take complaints to private messages and our complaints procedure. Hide or report abusive comments. Safeguarding concerns go to the DSL straight away.`),
  codeconduct: H('Code of conduct for staff and volunteers', ALLT, `
Everyone who works or volunteers with [Organisation name] will:
- Treat everyone with respect, kindness and fairness.
- Put the safety and wellbeing of children and adults at risk first.
- Keep professional boundaries: no private messaging with children, no gifts beyond token amounts, no relationships with service users.
- Avoid being alone with a child where possible; if it happens, make sure you can be seen and tell a colleague.
- Never use physical punishment, humiliating language or threats.
- Not be under the influence of alcohol or drugs while working or volunteering.
- Keep personal information confidential, unless sharing is needed to keep someone safe.
- Report any concern, about anyone, to the DSL.
- Follow our policies, including health and safety and social media.

Breaking this code may lead to the end of a volunteer role or disciplinary action, and in serious cases referral to the police or other agencies.

I have read and agree to follow this code. Name: __________ Signed: __________ Date: ______`),
  whistle: H('Whistleblowing policy', ['charity', 'cio', 'cic', 'school', 'mosque', 'food', 'youth'], `
If you’re worried that something wrong is happening at [Organisation name], such as fraud, danger to health and safety, safeguarding failures, breaking the law, or a cover-up, please speak up. We will take it seriously and you will not be treated badly for raising a genuine concern.

## How to raise a concern
1. Talk to your manager or [named person].
2. If that’s not appropriate, contact [Chair of trustees / safeguarding trustee].
3. You can also go to a prescribed body, such as the Charity Commission or HSE, depending on the issue.

## What happens
We acknowledge your concern within [5 working days], look into it, and tell you the outcome as far as we can. We keep your identity confidential where possible.

Workers who make a protected disclosure have legal protection. Safeguarding concerns should always also follow the safeguarding policy.`),
  trustees: H('Trustee or committee roles and responsibilities', ['charity', 'cio', 'group', 'pta', 'mosque', 'food', 'youth'], `
## All trustees/committee members
- Act in the organisation’s best interests and within its purposes and governing document.
- Manage resources responsibly and avoid conflicts of interest.
- Act with reasonable care and skill; take advice where needed.
- Make sure the organisation complies with the law and is accountable (e.g. annual return and accounts for charities).

## Chair
Leads meetings, makes sure decisions are made and recorded, supports the lead staff member or volunteer coordinator, and speaks for the organisation when agreed.

## Treasurer
Oversees finances, presents finance reports, makes sure controls are followed and accounts are prepared on time.

## Secretary
Arranges meetings, keeps minutes and the register of interests, and handles official correspondence.

## Safeguarding lead trustee
Makes sure the safeguarding policy is in place, followed and reviewed, and that serious incidents are reported.

## Meetings
At least [4] times a year. Quorum: [number]. Minutes approved at the next meeting.`),
};
return { REVIEWED, ORGT, QS, REQ, requiredFor, TPL };
})();

/**
 * data.js — Configuration / data layer
 *
 * This file owns the catalog definitions and reference metadata.
 * Benchmark rates live here so they can be swapped out or loaded
 * from an API in a future version without touching any UI component.
 *
 * Nothing in this file should reference the DOM.
 */

"use strict";

// -----------------------------------------------------------------
// VOLUNTEER ROLES
// Each role has an id, display label, category, and benchmark hourly rate.
// The rate source is documented in VOLUNTEER_RATE_SOURCE below.
// -----------------------------------------------------------------
// Every catalog item uses a stable id for saved state, a displayName for the
// UI, and an active flag so an item can be retired without deleting old data.
// Every catalog item has a stable id for saved answers, a display name for the
// screen, and an active flag so an item can be retired without deleting history.
const VOLUNTEER_ROLES = [
  { id: "physician",        displayName: "Physician (MD/DO)",        category: "medicalProfessional", benchmarkRateUSD: 120.00, active: true },
  { id: "np-pa",            displayName: "Nurse Practitioner / PA",  category: "medicalProfessional", benchmarkRateUSD: 75.00,  active: true },
  { id: "rn",               displayName: "Registered Nurse (RN)",    category: "medicalProfessional", benchmarkRateUSD: 45.00,  active: true },
  { id: "pharmacist",       displayName: "Pharmacist",               category: "medicalProfessional", benchmarkRateUSD: 65.00,  active: true },
  { id: "medical-student",  displayName: "Medical Student",          category: "medicalProfessional", benchmarkRateUSD: 20.00,  active: true },
  { id: "nursing-student",  displayName: "Nursing Student",          category: "medicalProfessional", benchmarkRateUSD: 18.00,  active: true },
  { id: "pharmacy-student", displayName: "Pharmacy Student",         category: "medicalProfessional", benchmarkRateUSD: 18.00,  active: true },
  { id: "admin",            displayName: "Administrative Volunteer", category: "nonMedical",          benchmarkRateUSD: 16.00,  active: true },
  { id: "other",            displayName: "Other Volunteer",          category: "nonMedical",          benchmarkRateUSD: 14.00,  active: true },
];

// -----------------------------------------------------------------
// CLINICAL SERVICES
// Benchmark rates are temporary randomized placeholders, not reimbursement
// estimates. Codes are CPT/HCPCS.
// -----------------------------------------------------------------
// Clinical services additionally carry their CPT/HCPCS code and benchmark rate.
// UI components read these fields instead of maintaining a second service list.
// Services also store their CPT/HCPCS code and benchmark rate. Screens read
// these fields instead of keeping a second, easily outdated service list.
const CLINICAL_SERVICES = [
  { id: "371198137", description: "Contraceptive implant insertion", displayName: "Contraceptive implant insertion (Insertion drug dlvr implant, 11981)", code: "11981", codeSystem: "CPT", referenceRateUSD: 107.55, active: true },
  { id: "371198237", description: "Contraceptive implant removal", displayName: "Contraceptive implant removal (Remove drug implant device, 11982)", code: "11982", codeSystem: "CPT", referenceRateUSD: 114.57, active: true },
  { id: "371198337", description: "Contraceptive implant removal and reinsertion", displayName: "Contraceptive implant removal and reinsertion (Remove/insert drug implant, 11983)", code: "11983", codeSystem: "CPT", referenceRateUSD: 144.63, active: true },
  { id: "375830137", description: "Intrauterine device (IUD) removal", displayName: "Intrauterine device (IUD) removal (Remove intrauterine device, 58301)", code: "58301", codeSystem: "CPT", referenceRateUSD: 111.56, active: true },
  { id: "377664137", description: "Complete breast ultrasound", displayName: "Complete breast ultrasound (Ultrasound breast complete, 76641)", code: "76641", codeSystem: "CPT", referenceRateUSD: 100.2, active: true },
  { id: "377664237", description: "Limited breast ultrasound", displayName: "Limited breast ultrasound (Ultrasound breast limited, 76642)", code: "76642", codeSystem: "CPT", referenceRateUSD: 83.5, active: true },
  { id: "377706537", description: "Diagnostic mammogram — one breast", displayName: "Diagnostic mammogram — one breast (Dx mammo incl cad uni, 77065)", code: "77065", codeSystem: "CPT", referenceRateUSD: 123.92, active: true },
  { id: "377706637", description: "Diagnostic mammogram — both breasts", displayName: "Diagnostic mammogram — both breasts (Dx mammo incl cad bi, 77066)", code: "77066", codeSystem: "CPT", referenceRateUSD: 156.98, active: true },
  { id: "377706737", description: "Screening mammogram — both breasts", displayName: "Screening mammogram — both breasts (Scr mammo bi incl cad, 77067)", code: "77067", codeSystem: "CPT", referenceRateUSD: 126.26, active: true },
  { id: "379046037", description: "Vaccine administration with counseling — first component", displayName: "Vaccine administration with counseling — first component (Im admin 1st/only component, 90460)", code: "90460", codeSystem: "CPT", referenceRateUSD: 23.38, active: true },
  { id: "379046137", description: "Vaccine administration with counseling — each additional component", displayName: "Vaccine administration with counseling — each additional component (Im admin each addl component, 90461)", code: "90461", codeSystem: "CPT", referenceRateUSD: 8.68, active: true },
  { id: "379047137", description: "Vaccine administration by injection — first vaccine", displayName: "Vaccine administration by injection — first vaccine (Immunization admin, 90471)", code: "90471", codeSystem: "CPT", referenceRateUSD: 22.04, active: true },
  { id: "379047237", description: "Vaccine administration by injection — each additional vaccine", displayName: "Vaccine administration by injection — each additional vaccine (Immunization admin each add, 90472)", code: "90472", codeSystem: "CPT", referenceRateUSD: 16.03, active: true },
  { id: "379047337", description: "Vaccine administration by mouth or nose — first vaccine", displayName: "Vaccine administration by mouth or nose — first vaccine (Immune admin oral/nasal, 90473)", code: "90473", codeSystem: "CPT", referenceRateUSD: 17.37, active: true },
  { id: "379047437", description: "Vaccine administration by mouth or nose — each additional vaccine", displayName: "Vaccine administration by mouth or nose — each additional vaccine (Immune admin oral/nasal addl, 90474)", code: "90474", codeSystem: "CPT", referenceRateUSD: 12.36, active: true },
  { id: "379079137", description: "Mental health diagnostic evaluation", displayName: "Mental health diagnostic evaluation (Psych diagnostic evaluation, 90791)", code: "90791", codeSystem: "CPT", referenceRateUSD: 173.35, active: true },
  { id: "379079237", description: "Mental health diagnostic evaluation with medical services", displayName: "Mental health diagnostic evaluation with medical services (Psych diag eval w/med srvcs, 90792)", code: "90792", codeSystem: "CPT", referenceRateUSD: 202.08, active: true },
  { id: "379083237", description: "Individual psychotherapy — 30 minutes", displayName: "Individual psychotherapy — 30 minutes (Psytx w pt 30 minutes, 90832)", code: "90832", codeSystem: "CPT", referenceRateUSD: 85.84, active: true },
  { id: "379083737", description: "Individual psychotherapy — 60 minutes", displayName: "Individual psychotherapy — 60 minutes (Psytx w pt 60 minutes, 90837)", code: "90837", codeSystem: "CPT", referenceRateUSD: 167.0, active: true },
  { id: "379083937", description: "Crisis psychotherapy — first 60 minutes", displayName: "Crisis psychotherapy — first 60 minutes (Psytx crisis initial 60 min, 90839)", code: "90839", codeSystem: "CPT", referenceRateUSD: 160.32, active: true },
  { id: "379084037", description: "Crisis psychotherapy — each additional 30 minutes", displayName: "Crisis psychotherapy — each additional 30 minutes (Psytx crisis ea addl 30 min, 90840)", code: "90840", codeSystem: "CPT", referenceRateUSD: 77.16, active: true },
  { id: "379084637", description: "Family psychotherapy without the patient — 50 minutes", displayName: "Family psychotherapy without the patient — 50 minutes (Family psytx w/o pt 50 min, 90846)", code: "90846", codeSystem: "CPT", referenceRateUSD: 105.88, active: true },
  { id: "379084737", description: "Family psychotherapy with the patient — 50 minutes", displayName: "Family psychotherapy with the patient — 50 minutes (Family psytx w/pt 50 min, 90847)", code: "90847", codeSystem: "CPT", referenceRateUSD: 109.55, active: true },
  { id: "379084937", description: "Multiple-family group psychotherapy", displayName: "Multiple-family group psychotherapy (Multiple family group psytx, 90849)", code: "90849", codeSystem: "CPT", referenceRateUSD: 40.42, active: true },
  { id: "379085337", description: "Group psychotherapy", displayName: "Group psychotherapy (Group psychotherapy, 90853)", code: "90853", codeSystem: "CPT", referenceRateUSD: 30.39, active: true },
  { id: "379611237", description: "Developmental test — first hour", displayName: "Developmental test — first hour (Devel tst phys/qhp 1st hr, 96112)", code: "96112", codeSystem: "CPT", referenceRateUSD: 125.25, active: true },
  { id: "379611337", description: "Developmental test — each additional hour", displayName: "Developmental test — each additional hour (Devel tst phys/qhp ea addl, 96113)", code: "96113", codeSystem: "CPT", referenceRateUSD: 56.11, active: true },
  { id: "379612737", description: "Brief emotional or behavioral assessment", displayName: "Brief emotional or behavioral assessment (Brief emotional/behav assmt, 96127)", code: "96127", codeSystem: "CPT", referenceRateUSD: 5.01, active: true },
  { id: "379780337", description: "Individual medical nutrition therapy — follow-up", displayName: "Individual medical nutrition therapy — follow-up (Med nutrition indiv subseq, 97803)", code: "97803", codeSystem: "CPT", referenceRateUSD: 31.73, active: true },
  { id: "379780437", description: "Group medical nutrition therapy", displayName: "Group medical nutrition therapy (Medical nutrition group, 97804)", code: "97804", codeSystem: "CPT", referenceRateUSD: 17.03, active: true },
  { id: "379896837", description: "Telephone assessment and management — 21–30 minutes", displayName: "Telephone assessment and management — 21–30 minutes (Ph1 assmt&mgmt nqhp 21-30, 98968)", code: "98968", codeSystem: "CPT", referenceRateUSD: 34.74, active: true },
  { id: "379920337", description: "New-patient office visit — low complexity / 30 minutes", displayName: "New-patient office visit — low complexity / 30 minutes (Office o/p new low 30 min, 99203)", code: "99203", codeSystem: "CPT", referenceRateUSD: 117.57, active: true },
  { id: "379920537", description: "New-patient office visit — high complexity / 60 minutes", displayName: "New-patient office visit — high complexity / 60 minutes (Office o/p new hi 60 min, 99205)", code: "99205", codeSystem: "CPT", referenceRateUSD: 236.81, active: true },
  { id: "379921137", description: "Established-patient office visit — minimal service", displayName: "Established-patient office visit — minimal service (Off/op est may x req phy/qhp, 99211)", code: "99211", codeSystem: "CPT", referenceRateUSD: 24.38, active: true },
  { id: "379921237", description: "Established-patient office visit — straightforward / 10 minutes", displayName: "Established-patient office visit — straightforward / 10 minutes (Office o/p est sf 10 min, 99212)", code: "99212", codeSystem: "CPT", referenceRateUSD: 59.45, active: true },
  { id: "379921337", description: "Established-patient office visit — low complexity / 20 minutes", displayName: "Established-patient office visit — low complexity / 20 minutes (Office o/p est low 20 min, 99213)", code: "99213", codeSystem: "CPT", referenceRateUSD: 95.19, active: true },
  { id: "379921437", description: "Established-patient office visit — moderate complexity / 30 minutes", displayName: "Established-patient office visit — moderate complexity / 30 minutes (Office o/p est mod 30 min, 99214)", code: "99214", codeSystem: "CPT", referenceRateUSD: 135.61, active: true },
  { id: "379921537", description: "Established-patient office visit — high complexity / 40 minutes", displayName: "Established-patient office visit — high complexity / 40 minutes (Office o/p est hi 40 min, 99215)", code: "99215", codeSystem: "CPT", referenceRateUSD: 192.39, active: true },
  { id: "379940637", description: "Tobacco cessation counseling — 3–10 minutes", displayName: "Tobacco cessation counseling — 3–10 minutes (Behav chng smoking 3-10 min, 99406)", code: "99406", codeSystem: "CPT", referenceRateUSD: 13.91, active: true },
  { id: "379940737", description: "Tobacco cessation counseling — more than 10 minutes", displayName: "Tobacco cessation counseling — more than 10 minutes (Behav chng smoking > 10 min, 99407)", code: "99407", codeSystem: "CPT", referenceRateUSD: 26.52, active: true },
  { id: "379942237", description: "Online digital evaluation and management — 11–20 minutes", displayName: "Online digital evaluation and management — 11–20 minutes (Ol dig e/m svc 11-20 min, 99422)", code: "99422", codeSystem: "CPT", referenceRateUSD: 28.46, active: true },
  { id: "379943737", description: "Chronic care management by physician/QHP — additional time", displayName: "Chronic care management by physician/QHP — additional time (Chrnc care mgmt phys ea addl, 99437)", code: "99437", codeSystem: "CPT", referenceRateUSD: 57.58, active: true },
  { id: "379943937", description: "Chronic care management by clinical staff — additional time", displayName: "Chronic care management by clinical staff — additional time (Chrnc care mgmt staf ea addl, 99439)", code: "99439", codeSystem: "CPT", referenceRateUSD: 45.93, active: true },
  { id: "379948437", description: "Behavioral health care management", displayName: "Behavioral health care management (Care mgmt svc bhvl hlth cond, 99484)", code: "99484", codeSystem: "CPT", referenceRateUSD: 53.05, active: true },
  { id: "379948737", description: "Complex chronic care management — first 60 minutes", displayName: "Complex chronic care management — first 60 minutes (Cplx chrnc care 1st 60 min, 99487)", code: "99487", codeSystem: "CPT", referenceRateUSD: 131.65, active: true },
  { id: "379948937", description: "Complex chronic care management — each additional 30 minutes", displayName: "Complex chronic care management — each additional 30 minutes (Cplx chrnc care ea addl 30, 99489)", code: "99489", codeSystem: "CPT", referenceRateUSD: 70.52, active: true },
  { id: "379949037", description: "Chronic care management by clinical staff — first 20 minutes", displayName: "Chronic care management by clinical staff — first 20 minutes (Chrnc care mgmt staff 1st 20, 99490)", code: "99490", codeSystem: "CPT", referenceRateUSD: 60.49, active: true },
  { id: "379949137", description: "Chronic care management by physician/QHP — first 30 minutes", displayName: "Chronic care management by physician/QHP — first 30 minutes (Chrnc care mgmt phys 1st 30, 99491)", code: "99491", codeSystem: "CPT", referenceRateUSD: 82.16, active: true },
  { id: "379949237", description: "Psychiatric collaborative care management — initial month", displayName: "Psychiatric collaborative care management — initial month (1st psyc collab care mgmt, 99492)", code: "99492", codeSystem: "CPT", referenceRateUSD: 145.24, active: true },
  { id: "379949337", description: "Psychiatric collaborative care management — follow-up month", displayName: "Psychiatric collaborative care management — follow-up month (Sbsq psyc collab care mgmt, 99493)", code: "99493", codeSystem: "CPT", referenceRateUSD: 133.59, active: true },
  { id: "379949437", description: "Psychiatric collaborative care management — additional time", displayName: "Psychiatric collaborative care management — additional time (1st/sbsq psyc collab care, 99494)", code: "99494", codeSystem: "CPT", referenceRateUSD: 55.96, active: true },
  { id: "379949537", description: "Transitional care management — moderate complexity", displayName: "Transitional care management — moderate complexity (Transj care mgmt mod f2f 14d, 99495)", code: "99495", codeSystem: "CPT", referenceRateUSD: 201.2, active: true },
  { id: "379949637", description: "Transitional care management — high complexity", displayName: "Transitional care management — high complexity (Transj care mgmt high f2f 7d, 99496)", code: "99496", codeSystem: "CPT", referenceRateUSD: 272.68, active: true },
  { id: "37G001937", description: "Community health integration services — first 60 minutes", displayName: "Community health integration services — first 60 minutes (Comm hlth intg svs sdoh 60mn, G0019)", code: "G0019", codeSystem: "HCPCS", referenceRateUSD: 77.96, active: true },
  { id: "37G002237", description: "Community health integration services — additional 30 minutes", displayName: "Community health integration services — additional 30 minutes (Comm hlth intg svs add 30 m, G0022)", code: "G0022", codeSystem: "HCPCS", referenceRateUSD: 48.52, active: true },
  { id: "37G010137", description: "Screening pelvic and breast examination", displayName: "Screening pelvic and breast examination (Ca screen;pelvic/breast exam, G0101)", code: "G0101", codeSystem: "HCPCS", referenceRateUSD: 37.85, active: true },
  { id: "37G010837", description: "Individual diabetes self-management training", displayName: "Individual diabetes self-management training (Diab manage trnper indiv, G0108)", code: "G0108", codeSystem: "HCPCS", referenceRateUSD: 53.05, active: true },
  { id: "37G010937", description: "Group diabetes self-management training", displayName: "Group diabetes self-management training (Diab manage trn ind/group, G0109)", code: "G0109", codeSystem: "HCPCS", referenceRateUSD: 15.2, active: true },
  { id: "37G013637", description: "Social determinants of health risk assessment", displayName: "Social determinants of health risk assessment (Adm of soc dtr assess 5-15 m, G0136)", code: "G0136", codeSystem: "HCPCS", referenceRateUSD: 18.44, active: true },
  { id: "37G039637", description: "Alcohol or substance-use intervention — 15–30 minutes", displayName: "Alcohol or substance-use intervention — 15–30 minutes (Alcohol/subs interv 15-30mn, G0396)", code: "G0396", codeSystem: "HCPCS", referenceRateUSD: 33.64, active: true },
  { id: "37G039737", description: "Alcohol or substance-use intervention — more than 30 minutes", displayName: "Alcohol or substance-use intervention — more than 30 minutes (Alcohol/subs interv >30 min, G0397)", code: "G0397", codeSystem: "HCPCS", referenceRateUSD: 62.75, active: true },
  { id: "37G040237", description: "Initial preventive physical examination", displayName: "Initial preventive physical examination (Initial preventive exam, G0402)", code: "G0402", codeSystem: "HCPCS", referenceRateUSD: 160.76, active: true },
  { id: "37G043837", description: "Initial annual wellness visit", displayName: "Initial annual wellness visit (Ppps,initial visit, G0438)", code: "G0438", codeSystem: "HCPCS", referenceRateUSD: 160.44, active: true },
  { id: "37G043937", description: "Subsequent annual wellness visit", displayName: "Subsequent annual wellness visit (Ppps,subseq visit, G0439)", code: "G0439", codeSystem: "HCPCS", referenceRateUSD: 126.47, active: true },
  { id: "37G044237", description: "Annual alcohol misuse screening — 15 minutes", displayName: "Annual alcohol misuse screening — 15 minutes (Annual alcohol screen 15 min, G0442)", code: "G0442", codeSystem: "HCPCS", referenceRateUSD: 17.14, active: true },
  { id: "37G044337", description: "Alcohol misuse counseling", displayName: "Alcohol misuse counseling (Brief alcohol misuse counsel, G0443)", code: "G0443", codeSystem: "HCPCS", referenceRateUSD: 31.7, active: true },
  { id: "37G044437", description: "Annual depression screening", displayName: "Annual depression screening (Depression screen annual, G0444)", code: "G0444", codeSystem: "HCPCS", referenceRateUSD: 17.14, active: true },
  { id: "37G044537", description: "High-intensity behavioral counseling for STI prevention — 30 minutes", displayName: "High-intensity behavioral counseling for STI prevention — 30 minutes (High inten beh couns std 30m, G0445)", code: "G0445", codeSystem: "HCPCS", referenceRateUSD: 31.38, active: true },
  { id: "37G300237", description: "Chronic pain management — first 30 minutes", displayName: "Chronic pain management — first 30 minutes (Chronic pain mgmt 30 mins, G3002)", code: "G3002", codeSystem: "HCPCS", referenceRateUSD: 80.22, active: true },
  { id: "37G300337", description: "Chronic pain management — additional 15 minutes", displayName: "Chronic pain management — additional 15 minutes (Chronic pain mgmt addl 15m, G3003)", code: "G3003", codeSystem: "HCPCS", referenceRateUSD: 29.44, active: true },
  { id: "37Q009137", description: "Screening Pap smear specimen collection", displayName: "Screening Pap smear specimen collection (Obtaining screen pap smear, Q0091)", code: "Q0091", codeSystem: "HCPCS", referenceRateUSD: 43.34, active: true },
];

// -----------------------------------------------------------------
// VOLUNTEER RATE SOURCE
// Describes where the volunteer benchmark hourly values come from.
// -----------------------------------------------------------------
const VOLUNTEER_RATE_SOURCE = {
  name: "Independent Sector / Do Good Institute",
  publicationYear: 2025,
  description:
    "Volunteer contributions are assigned benchmark hourly values based on published volunteer " +
    "labor valuation sources. The national average value of volunteer time ($36.14/hr for 2025 " +
    "data) is published by Independent Sector and the Do Good Institute, derived from Bureau of " +
    "Labor Statistics wage data plus fringe benefits. Skilled clinical volunteer roles are valued " +
    "at higher replacement-cost rates consistent with guidance for grant applications and " +
    "nonprofit accounting. These values represent an estimated economic value of donated time " +
    "and are not wages paid by the clinic.",
  url: "https://independentsector.org/research/value-of-volunteer-time/",
};

// -----------------------------------------------------------------
// REFERENCES
// Data-driven list; never hard-code these into UI components.
// -----------------------------------------------------------------
const REFERENCES = [
  {
    id: "cms-pfs",
    title: "CMS Physician Fee Schedule Look-Up Tool",
    organization: "Centers for Medicare & Medicaid Services (CMS)",
    description: "Provides national and locality-specific Medicare payment rates for CPT/HCPCS codes.",
    url: "https://www.cms.gov/medicare/physician-fee-schedule/search",
    year: null,
  },
  {
    id: "independent-sector-2026",
    title: "New Value of Volunteer Time of $36.14 Per Hour (2025 data)",
    organization: "Independent Sector & Do Good Institute",
    description: "Annual update to the national value-of-volunteer-time estimate.",
    url: "https://independentsector.org/blog/2026-value-of-volunteer-time-release/",
    year: 2026,
  },
  {
    id: "independent-sector-methodology",
    title: "Value of Volunteer Time — National and State Rates",
    organization: "Independent Sector",
    description: "National and state-level volunteer valuation rates and methodology.",
    url: "https://independentsector.org/research/value-of-volunteer-time/",
    year: null,
  },
  {
    id: "serve-love",
    title: "How to Calculate Volunteer Value for Grant Applications",
    organization: "Serve.Love",
    description:
      "Recommends using higher hourly values for skilled volunteers such as medical professionals.",
    url: "https://www.serve.love/blog/calculate-volunteer-value-grant-applications/",
    year: null,
  },
];

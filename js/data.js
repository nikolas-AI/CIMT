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
  { id: "contraceptive-implant-insertion-11981", description: "Insertion drug dlvr implant", displayName: "Contraceptive implant insertion (Insertion drug dlvr implant, 11981)", code: "11981", codeSystem: "CPT", benchmarkRateUSD: 143.00, active: true },
  { id: "contraceptive-implant-removal-11982", description: "Remove drug implant device", displayName: "Contraceptive implant removal (Remove drug implant device, 11982)", code: "11982", codeSystem: "CPT", benchmarkRateUSD: 128.00, active: true },
  { id: "contraceptive-implant-removal-and-reinsertion-11983", description: "Remove/insert drug implant", displayName: "Contraceptive implant removal and reinsertion (Remove/insert drug implant, 11983)", code: "11983", codeSystem: "CPT", benchmarkRateUSD: 186.00, active: true },
  { id: "intrauterine-device-iud-insertion-58300", description: "Insert intrauterine device", displayName: "Intrauterine device (IUD) insertion (Insert intrauterine device, 58300)", code: "58300", codeSystem: "CPT", benchmarkRateUSD: 211.00, active: true },
  { id: "intrauterine-device-iud-removal-58301", description: "Remove intrauterine device", displayName: "Intrauterine device (IUD) removal (Remove intrauterine device, 58301)", code: "58301", codeSystem: "CPT", benchmarkRateUSD: 81.00, active: true },
  { id: "complete-breast-ultrasound-76641", description: "Ultrasound breast complete", displayName: "Complete breast ultrasound (Ultrasound breast complete, 76641)", code: "76641", codeSystem: "CPT", benchmarkRateUSD: 197.00, active: true },
  { id: "limited-breast-ultrasound-76642", description: "Ultrasound breast limited", displayName: "Limited breast ultrasound (Ultrasound breast limited, 76642)", code: "76642", codeSystem: "CPT", benchmarkRateUSD: 103.00, active: true },
  { id: "diagnostic-mammogram-one-breast-77065", description: "Dx mammo incl cad uni", displayName: "Diagnostic mammogram — one breast (Dx mammo incl cad uni, 77065)", code: "77065", codeSystem: "CPT", benchmarkRateUSD: 188.00, active: true },
  { id: "diagnostic-mammogram-both-breasts-77066", description: "Dx mammo incl cad bi", displayName: "Diagnostic mammogram — both breasts (Dx mammo incl cad bi, 77066)", code: "77066", codeSystem: "CPT", benchmarkRateUSD: 153.00, active: true },
  { id: "screening-mammogram-both-breasts-77067", description: "Scr mammo bi incl cad", displayName: "Screening mammogram — both breasts (Scr mammo bi incl cad, 77067)", code: "77067", codeSystem: "CPT", benchmarkRateUSD: 207.00, active: true },
  { id: "urine-pregnancy-test-81025", description: "Urine pregnancy test", displayName: "Urine pregnancy test (Urine pregnancy test, 81025)", code: "81025", codeSystem: "CPT", benchmarkRateUSD: 209.00, active: true },
  { id: "vaccine-administration-with-counseling-first-component-90460", description: "Im admin 1st/only component", displayName: "Vaccine administration with counseling — first component (Im admin 1st/only component, 90460)", code: "90460", codeSystem: "CPT", benchmarkRateUSD: 189.00, active: true },
  { id: "vaccine-administration-with-counseling-each-additional-component-90461", description: "Im admin each addl component", displayName: "Vaccine administration with counseling — each additional component (Im admin each addl component, 90461)", code: "90461", codeSystem: "CPT", benchmarkRateUSD: 132.00, active: true },
  { id: "vaccine-administration-by-injection-first-vaccine-90471", description: "Immunization admin", displayName: "Vaccine administration by injection — first vaccine (Immunization admin, 90471)", code: "90471", codeSystem: "CPT", benchmarkRateUSD: 235.00, active: true },
  { id: "vaccine-administration-by-injection-each-additional-vaccine-90472", description: "Immunization admin each add", displayName: "Vaccine administration by injection — each additional vaccine (Immunization admin each add, 90472)", code: "90472", codeSystem: "CPT", benchmarkRateUSD: 30.00, active: true },
  { id: "vaccine-administration-by-mouth-or-nose-first-vaccine-90473", description: "Immune admin oral/nasal", displayName: "Vaccine administration by mouth or nose — first vaccine (Immune admin oral/nasal, 90473)", code: "90473", codeSystem: "CPT", benchmarkRateUSD: 37.00, active: true },
  { id: "vaccine-administration-by-mouth-or-nose-each-additional-vaccine-90474", description: "Immune admin oral/nasal addl", displayName: "Vaccine administration by mouth or nose — each additional vaccine (Immune admin oral/nasal addl, 90474)", code: "90474", codeSystem: "CPT", benchmarkRateUSD: 170.00, active: true },
  { id: "mental-health-diagnostic-evaluation-90791", description: "Psych diagnostic evaluation", displayName: "Mental health diagnostic evaluation (Psych diagnostic evaluation, 90791)", code: "90791", codeSystem: "CPT", benchmarkRateUSD: 206.00, active: true },
  { id: "mental-health-diagnostic-evaluation-with-medical-services-90792", description: "Psych diag eval w/med srvcs", displayName: "Mental health diagnostic evaluation with medical services (Psych diag eval w/med srvcs, 90792)", code: "90792", codeSystem: "CPT", benchmarkRateUSD: 217.00, active: true },
  { id: "individual-psychotherapy-30-minutes-90832", description: "Psytx w pt 30 minutes", displayName: "Individual psychotherapy — 30 minutes (Psytx w pt 30 minutes, 90832)", code: "90832", codeSystem: "CPT", benchmarkRateUSD: 95.00, active: true },
  { id: "individual-psychotherapy-60-minutes-90837", description: "Psytx w pt 60 minutes", displayName: "Individual psychotherapy — 60 minutes (Psytx w pt 60 minutes, 90837)", code: "90837", codeSystem: "CPT", benchmarkRateUSD: 144.00, active: true },
  { id: "crisis-psychotherapy-first-60-minutes-90839", description: "Psytx crisis initial 60 min", displayName: "Crisis psychotherapy — first 60 minutes (Psytx crisis initial 60 min, 90839)", code: "90839", codeSystem: "CPT", benchmarkRateUSD: 247.00, active: true },
  { id: "crisis-psychotherapy-each-additional-30-minutes-90840", description: "Psytx crisis ea addl 30 min", displayName: "Crisis psychotherapy — each additional 30 minutes (Psytx crisis ea addl 30 min, 90840)", code: "90840", codeSystem: "CPT", benchmarkRateUSD: 218.00, active: true },
  { id: "family-psychotherapy-without-the-patient-50-minutes-90846", description: "Family psytx w/o pt 50 min", displayName: "Family psychotherapy without the patient — 50 minutes (Family psytx w/o pt 50 min, 90846)", code: "90846", codeSystem: "CPT", benchmarkRateUSD: 174.00, active: true },
  { id: "family-psychotherapy-with-the-patient-50-minutes-90847", description: "Family psytx w/pt 50 min", displayName: "Family psychotherapy with the patient — 50 minutes (Family psytx w/pt 50 min, 90847)", code: "90847", codeSystem: "CPT", benchmarkRateUSD: 135.00, active: true },
  { id: "multiple-family-group-psychotherapy-90849", description: "Multiple family group psytx", displayName: "Multiple-family group psychotherapy (Multiple family group psytx, 90849)", code: "90849", codeSystem: "CPT", benchmarkRateUSD: 31.00, active: true },
  { id: "group-psychotherapy-90853", description: "Group psychotherapy", displayName: "Group psychotherapy (Group psychotherapy, 90853)", code: "90853", codeSystem: "CPT", benchmarkRateUSD: 233.00, active: true },
  { id: "developmental-screening-with-scoring-96110", description: "Developmental screen w/score", displayName: "Developmental screening with scoring (Developmental screen w/score, 96110)", code: "96110", codeSystem: "CPT", benchmarkRateUSD: 35.00, active: true },
  { id: "developmental-test-first-hour-96112", description: "Devel tst phys/qhp 1st hr", displayName: "Developmental test — first hour (Devel tst phys/qhp 1st hr, 96112)", code: "96112", codeSystem: "CPT", benchmarkRateUSD: 152.00, active: true },
  { id: "developmental-test-each-additional-hour-96113", description: "Devel tst phys/qhp ea addl", displayName: "Developmental test — each additional hour (Devel tst phys/qhp ea addl, 96113)", code: "96113", codeSystem: "CPT", benchmarkRateUSD: 246.00, active: true },
  { id: "brief-emotional-or-behavioral-assessment-96127", description: "Brief emotional/behav assmt", displayName: "Brief emotional or behavioral assessment (Brief emotional/behav assmt, 96127)", code: "96127", codeSystem: "CPT", benchmarkRateUSD: 46.00, active: true },
  { id: "individual-medical-nutrition-therapy-follow-up-97803", description: "Med nutrition indiv subseq", displayName: "Individual medical nutrition therapy — follow-up (Med nutrition indiv subseq, 97803)", code: "97803", codeSystem: "CPT", benchmarkRateUSD: 70.00, active: true },
  { id: "group-medical-nutrition-therapy-97804", description: "Medical nutrition group", displayName: "Group medical nutrition therapy (Medical nutrition group, 97804)", code: "97804", codeSystem: "CPT", benchmarkRateUSD: 182.00, active: true },
  { id: "individual-self-management-education-98960", description: "Edu&trn pt self-mgmt nqhp 1", displayName: "Individual self-management education (Edu&trn pt self-mgmt nqhp 1, 98960)", code: "98960", codeSystem: "CPT", benchmarkRateUSD: 161.00, active: true },
  { id: "group-self-management-education-2-4-patients-98961", description: "Edu&trn pt slf-mgmt nqhp 2-4", displayName: "Group self-management education — 2–4 patients (Edu&trn pt slf-mgmt nqhp 2-4, 98961)", code: "98961", codeSystem: "CPT", benchmarkRateUSD: 114.00, active: true },
  { id: "telephone-assessment-and-management-21-30-minutes-98968", description: "Ph1 assmt&mgmt nqhp 21-30", displayName: "Telephone assessment and management — 21–30 minutes (Ph1 assmt&mgmt nqhp 21-30, 98968)", code: "98968", codeSystem: "CPT", benchmarkRateUSD: 44.00, active: true },
  { id: "new-patient-office-visit-low-complexity-30-minutes-99203", description: "Office o/p new low 30 min", displayName: "New-patient office visit — low complexity / 30 minutes (Office o/p new low 30 min, 99203)", code: "99203", codeSystem: "CPT", benchmarkRateUSD: 121.00, active: true },
  { id: "new-patient-office-visit-high-complexity-60-minutes-99205", description: "Office o/p new hi 60 min", displayName: "New-patient office visit — high complexity / 60 minutes (Office o/p new hi 60 min, 99205)", code: "99205", codeSystem: "CPT", benchmarkRateUSD: 197.00, active: true },
  { id: "established-patient-office-visit-minimal-service-99211", description: "Off/op est may x req phy/qhp", displayName: "Established-patient office visit — minimal service (Off/op est may x req phy/qhp, 99211)", code: "99211", codeSystem: "CPT", benchmarkRateUSD: 107.00, active: true },
  { id: "established-patient-office-visit-straightforward-10-minutes-99212", description: "Office o/p est sf 10 min", displayName: "Established-patient office visit — straightforward / 10 minutes (Office o/p est sf 10 min, 99212)", code: "99212", codeSystem: "CPT", benchmarkRateUSD: 227.00, active: true },
  { id: "established-patient-office-visit-low-complexity-20-minutes-99213", description: "Office o/p est low 20 min", displayName: "Established-patient office visit — low complexity / 20 minutes (Office o/p est low 20 min, 99213)", code: "99213", codeSystem: "CPT", benchmarkRateUSD: 240.00, active: true },
  { id: "established-patient-office-visit-moderate-complexity-30-minutes-99214", description: "Office o/p est mod 30 min", displayName: "Established-patient office visit — moderate complexity / 30 minutes (Office o/p est mod 30 min, 99214)", code: "99214", codeSystem: "CPT", benchmarkRateUSD: 41.00, active: true },
  { id: "established-patient-office-visit-high-complexity-40-minutes-99215", description: "Office o/p est hi 40 min", displayName: "Established-patient office visit — high complexity / 40 minutes (Office o/p est hi 40 min, 99215)", code: "99215", codeSystem: "CPT", benchmarkRateUSD: 225.00, active: true },
  { id: "new-pediatric-preventive-visit-infant-99381", description: "Init pm e/m new pat infant", displayName: "New pediatric preventive visit — infant (Init pm e/m new pat infant, 99381)", code: "99381", codeSystem: "CPT", benchmarkRateUSD: 250.00, active: true },
  { id: "new-pediatric-preventive-visit-ages-1-4-99382", description: "Init pm e/m new pat 1-4 yrs", displayName: "New pediatric preventive visit — ages 1–4 (Init pm e/m new pat 1-4 yrs, 99382)", code: "99382", codeSystem: "CPT", benchmarkRateUSD: 128.00, active: true },
  { id: "new-pediatric-preventive-visit-ages-5-11-99383", description: "Prev visit new age 5-11", displayName: "New pediatric preventive visit — ages 5–11 (Prev visit new age 5-11, 99383)", code: "99383", codeSystem: "CPT", benchmarkRateUSD: 36.00, active: true },
  { id: "new-adolescent-preventive-visit-ages-12-17-99384", description: "Prev visit new age 12-17", displayName: "New adolescent preventive visit — ages 12–17 (Prev visit new age 12-17, 99384)", code: "99384", codeSystem: "CPT", benchmarkRateUSD: 87.00, active: true },
  { id: "new-adult-preventive-visit-ages-18-39-99385", description: "Prev visit new age 18-39", displayName: "New adult preventive visit — ages 18–39 (Prev visit new age 18-39, 99385)", code: "99385", codeSystem: "CPT", benchmarkRateUSD: 26.00, active: true },
  { id: "new-adult-preventive-visit-ages-40-64-99386", description: "Prev visit new age 40-64", displayName: "New adult preventive visit — ages 40–64 (Prev visit new age 40-64, 99386)", code: "99386", codeSystem: "CPT", benchmarkRateUSD: 154.00, active: true },
  { id: "new-adult-preventive-visit-age-65-99387", description: "Init pm e/m new pat 65+ yrs", displayName: "New adult preventive visit — age 65+ (Init pm e/m new pat 65+ yrs, 99387)", code: "99387", codeSystem: "CPT", benchmarkRateUSD: 96.00, active: true },
  { id: "established-pediatric-preventive-visit-infant-99391", description: "Per pm reeval est pat infant", displayName: "Established pediatric preventive visit — infant (Per pm reeval est pat infant, 99391)", code: "99391", codeSystem: "CPT", benchmarkRateUSD: 138.00, active: true },
  { id: "established-pediatric-preventive-visit-ages-1-4-99392", description: "Prev visit est age 1-4", displayName: "Established pediatric preventive visit — ages 1–4 (Prev visit est age 1-4, 99392)", code: "99392", codeSystem: "CPT", benchmarkRateUSD: 247.00, active: true },
  { id: "established-pediatric-preventive-visit-ages-5-11-99393", description: "Prev visit est age 5-11", displayName: "Established pediatric preventive visit — ages 5–11 (Prev visit est age 5-11, 99393)", code: "99393", codeSystem: "CPT", benchmarkRateUSD: 156.00, active: true },
  { id: "established-adolescent-preventive-visit-ages-12-17-99394", description: "Prev visit est age 12-17", displayName: "Established adolescent preventive visit — ages 12–17 (Prev visit est age 12-17, 99394)", code: "99394", codeSystem: "CPT", benchmarkRateUSD: 228.00, active: true },
  { id: "established-adult-preventive-visit-ages-18-39-99395", description: "Prev visit est age 18-39", displayName: "Established adult preventive visit — ages 18–39 (Prev visit est age 18-39, 99395)", code: "99395", codeSystem: "CPT", benchmarkRateUSD: 164.00, active: true },
  { id: "established-adult-preventive-visit-ages-40-64-99396", description: "Prev visit est age 40-64", displayName: "Established adult preventive visit — ages 40–64 (Prev visit est age 40-64, 99396)", code: "99396", codeSystem: "CPT", benchmarkRateUSD: 50.00, active: true },
  { id: "established-adult-preventive-visit-age-65-99397", description: "Per pm reeval est pat 65+ yr", displayName: "Established adult preventive visit — age 65+ (Per pm reeval est pat 65+ yr, 99397)", code: "99397", codeSystem: "CPT", benchmarkRateUSD: 76.00, active: true },
  { id: "individual-preventive-counseling-about-15-minutes-99401", description: "Prev med cnsl indiv apprx 15", displayName: "Individual preventive counseling — about 15 minutes (Prev med cnsl indiv apprx 15, 99401)", code: "99401", codeSystem: "CPT", benchmarkRateUSD: 215.00, active: true },
  { id: "individual-preventive-counseling-about-30-minutes-99402", description: "Prev med cnsl indiv apprx 30", displayName: "Individual preventive counseling — about 30 minutes (Prev med cnsl indiv apprx 30, 99402)", code: "99402", codeSystem: "CPT", benchmarkRateUSD: 222.00, active: true },
  { id: "individual-preventive-counseling-about-45-minutes-99403", description: "Prev med cnsl indiv apprx 45", displayName: "Individual preventive counseling — about 45 minutes (Prev med cnsl indiv apprx 45, 99403)", code: "99403", codeSystem: "CPT", benchmarkRateUSD: 183.00, active: true },
  { id: "individual-preventive-counseling-about-60-minutes-99404", description: "Prev med cnsl indiv apprx 60", displayName: "Individual preventive counseling — about 60 minutes (Prev med cnsl indiv apprx 60, 99404)", code: "99404", codeSystem: "CPT", benchmarkRateUSD: 161.00, active: true },
  { id: "tobacco-cessation-counseling-3-10-minutes-99406", description: "Behav chng smoking 3-10 min", displayName: "Tobacco cessation counseling — 3–10 minutes (Behav chng smoking 3-10 min, 99406)", code: "99406", codeSystem: "CPT", benchmarkRateUSD: 215.00, active: true },
  { id: "tobacco-cessation-counseling-more-than-10-minutes-99407", description: "Behav chng smoking > 10 min", displayName: "Tobacco cessation counseling — more than 10 minutes (Behav chng smoking > 10 min, 99407)", code: "99407", codeSystem: "CPT", benchmarkRateUSD: 67.00, active: true },
  { id: "substance-use-screening-and-intervention-15-30-minutes-99408", description: "Audit/dast 15-30 min", displayName: "Substance-use screening and intervention — 15–30 minutes (Audit/dast 15-30 min, 99408)", code: "99408", codeSystem: "CPT", benchmarkRateUSD: 93.00, active: true },
  { id: "substance-use-screening-and-intervention-more-than-30-minutes-99409", description: "Audit/dast over 30 min", displayName: "Substance-use screening and intervention — more than 30 minutes (Audit/dast over 30 min, 99409)", code: "99409", codeSystem: "CPT", benchmarkRateUSD: 217.00, active: true },
  { id: "online-digital-evaluation-and-management-11-20-minutes-99422", description: "Ol dig e/m svc 11-20 min", displayName: "Online digital evaluation and management — 11–20 minutes (Ol dig e/m svc 11-20 min, 99422)", code: "99422", codeSystem: "CPT", benchmarkRateUSD: 114.00, active: true },
  { id: "chronic-care-management-by-physician-qhp-additional-time-99437", description: "Chrnc care mgmt phys ea addl", displayName: "Chronic care management by physician/QHP — additional time (Chrnc care mgmt phys ea addl, 99437)", code: "99437", codeSystem: "CPT", benchmarkRateUSD: 222.00, active: true },
  { id: "chronic-care-management-by-clinical-staff-additional-time-99439", description: "Chrnc care mgmt staf ea addl", displayName: "Chronic care management by clinical staff — additional time (Chrnc care mgmt staf ea addl, 99439)", code: "99439", codeSystem: "CPT", benchmarkRateUSD: 167.00, active: true },
  { id: "behavioral-health-care-management-99484", description: "Care mgmt svc bhvl hlth cond", displayName: "Behavioral health care management (Care mgmt svc bhvl hlth cond, 99484)", code: "99484", codeSystem: "CPT", benchmarkRateUSD: 131.00, active: true },
  { id: "complex-chronic-care-management-first-60-minutes-99487", description: "Cplx chrnc care 1st 60 min", displayName: "Complex chronic care management — first 60 minutes (Cplx chrnc care 1st 60 min, 99487)", code: "99487", codeSystem: "CPT", benchmarkRateUSD: 160.00, active: true },
  { id: "complex-chronic-care-management-each-additional-30-minutes-99489", description: "Cplx chrnc care ea addl 30", displayName: "Complex chronic care management — each additional 30 minutes (Cplx chrnc care ea addl 30, 99489)", code: "99489", codeSystem: "CPT", benchmarkRateUSD: 95.00, active: true },
  { id: "chronic-care-management-by-clinical-staff-first-20-minutes-99490", description: "Chrnc care mgmt staff 1st 20", displayName: "Chronic care management by clinical staff — first 20 minutes (Chrnc care mgmt staff 1st 20, 99490)", code: "99490", codeSystem: "CPT", benchmarkRateUSD: 62.00, active: true },
  { id: "chronic-care-management-by-physician-qhp-first-30-minutes-99491", description: "Chrnc care mgmt phys 1st 30", displayName: "Chronic care management by physician/QHP — first 30 minutes (Chrnc care mgmt phys 1st 30, 99491)", code: "99491", codeSystem: "CPT", benchmarkRateUSD: 215.00, active: true },
  { id: "psychiatric-collaborative-care-management-initial-month-99492", description: "1st psyc collab care mgmt", displayName: "Psychiatric collaborative care management — initial month (1st psyc collab care mgmt, 99492)", code: "99492", codeSystem: "CPT", benchmarkRateUSD: 71.00, active: true },
  { id: "psychiatric-collaborative-care-management-follow-up-month-99493", description: "Sbsq psyc collab care mgmt", displayName: "Psychiatric collaborative care management — follow-up month (Sbsq psyc collab care mgmt, 99493)", code: "99493", codeSystem: "CPT", benchmarkRateUSD: 33.00, active: true },
  { id: "psychiatric-collaborative-care-management-additional-time-99494", description: "1st/sbsq psyc collab care", displayName: "Psychiatric collaborative care management — additional time (1st/sbsq psyc collab care, 99494)", code: "99494", codeSystem: "CPT", benchmarkRateUSD: 245.00, active: true },
  { id: "transitional-care-management-moderate-complexity-99495", description: "Transj care mgmt mod f2f 14d", displayName: "Transitional care management — moderate complexity (Transj care mgmt mod f2f 14d, 99495)", code: "99495", codeSystem: "CPT", benchmarkRateUSD: 125.00, active: true },
  { id: "transitional-care-management-high-complexity-99496", description: "Transj care mgmt high f2f 7d", displayName: "Transitional care management — high complexity (Transj care mgmt high f2f 7d, 99496)", code: "99496", codeSystem: "CPT", benchmarkRateUSD: 35.00, active: true },
  { id: "community-health-integration-services-first-60-minutes-g0019", description: "Comm hlth intg svs sdoh 60mn", displayName: "Community health integration services — first 60 minutes (Comm hlth intg svs sdoh 60mn, G0019)", code: "G0019", codeSystem: "HCPCS", benchmarkRateUSD: 151.00, active: true },
  { id: "community-health-integration-services-additional-30-minutes-g0022", description: "Comm hlth intg svs add 30 m", displayName: "Community health integration services — additional 30 minutes (Comm hlth intg svs add 30 m, G0022)", code: "G0022", codeSystem: "HCPCS", benchmarkRateUSD: 193.00, active: true },
  { id: "screening-pelvic-and-breast-examination-g0101", description: "Ca screen;pelvic/breast exam", displayName: "Screening pelvic and breast examination (Ca screen;pelvic/breast exam, G0101)", code: "G0101", codeSystem: "HCPCS", benchmarkRateUSD: 190.00, active: true },
  { id: "individual-diabetes-self-management-training-g0108", description: "Diab manage trn  per indiv", displayName: "Individual diabetes self-management training (Diab manage trn  per indiv, G0108)", code: "G0108", codeSystem: "HCPCS", benchmarkRateUSD: 171.00, active: true },
  { id: "group-diabetes-self-management-training-g0109", description: "Diab manage trn ind/group", displayName: "Group diabetes self-management training (Diab manage trn ind/group, G0109)", code: "G0109", codeSystem: "HCPCS", benchmarkRateUSD: 161.00, active: true },
  { id: "social-determinants-of-health-risk-assessment-g0136", description: "Adm of pa/n assess 5-15 m", displayName: "Social determinants of health risk assessment (Adm of pa/n assess 5-15 m, G0136)", code: "G0136", codeSystem: "HCPCS", benchmarkRateUSD: 92.00, active: true },
  { id: "alcohol-or-substance-use-intervention-15-30-minutes-g0396", description: "Alcohol/subs interv 15-30mn", displayName: "Alcohol or substance-use intervention — 15–30 minutes (Alcohol/subs interv 15-30mn, G0396)", code: "G0396", codeSystem: "HCPCS", benchmarkRateUSD: 92.00, active: true },
  { id: "alcohol-or-substance-use-intervention-more-than-30-minutes-g0397", description: "Alcohol/subs interv >30 min", displayName: "Alcohol or substance-use intervention — more than 30 minutes (Alcohol/subs interv >30 min, G0397)", code: "G0397", codeSystem: "HCPCS", benchmarkRateUSD: 204.00, active: true },
  { id: "initial-preventive-physical-examination-g0402", description: "Initial preventive exam", displayName: "Initial preventive physical examination (Initial preventive exam, G0402)", code: "G0402", codeSystem: "HCPCS", benchmarkRateUSD: 28.00, active: true },
  { id: "initial-annual-wellness-visit-g0438", description: "Ppps, initial visit", displayName: "Initial annual wellness visit (Ppps, initial visit, G0438)", code: "G0438", codeSystem: "HCPCS", benchmarkRateUSD: 160.00, active: true },
  { id: "subsequent-annual-wellness-visit-g0439", description: "Ppps, subseq visit", displayName: "Subsequent annual wellness visit (Ppps, subseq visit, G0439)", code: "G0439", codeSystem: "HCPCS", benchmarkRateUSD: 108.00, active: true },
  { id: "annual-alcohol-misuse-screening-15-minutes-g0442", description: "Annual alcohol screen 15 min", displayName: "Annual alcohol misuse screening — 15 minutes (Annual alcohol screen 15 min, G0442)", code: "G0442", codeSystem: "HCPCS", benchmarkRateUSD: 249.00, active: true },
  { id: "alcohol-misuse-counseling-g0443", description: "Brief alcohol misuse counsel", displayName: "Alcohol misuse counseling (Brief alcohol misuse counsel, G0443)", code: "G0443", codeSystem: "HCPCS", benchmarkRateUSD: 212.00, active: true },
  { id: "annual-depression-screening-g0444", description: "Depression screen annual", displayName: "Annual depression screening (Depression screen annual, G0444)", code: "G0444", codeSystem: "HCPCS", benchmarkRateUSD: 73.00, active: true },
  { id: "high-intensity-behavioral-counseling-for-sti-prevention-30-minutes-g0445", description: "High inten beh couns std 30m", displayName: "High-intensity behavioral counseling for STI prevention — 30 minutes (High inten beh couns std 30m, G0445)", code: "G0445", codeSystem: "HCPCS", benchmarkRateUSD: 112.00, active: true },
  { id: "chronic-pain-management-first-30-minutes-g3002", description: "Chronic pain mgmt 30 mins", displayName: "Chronic pain management — first 30 minutes (Chronic pain mgmt 30 mins, G3002)", code: "G3002", codeSystem: "HCPCS", benchmarkRateUSD: 191.00, active: true },
  { id: "chronic-pain-management-additional-15-minutes-g3003", description: "Chronic pain mgmt addl 15m", displayName: "Chronic pain management — additional 15 minutes (Chronic pain mgmt addl 15m, G3003)", code: "G3003", codeSystem: "HCPCS", benchmarkRateUSD: 92.00, active: true },
  { id: "screening-pap-smear-specimen-collection-q0091", description: "Obtaining screen pap smear", displayName: "Screening Pap smear specimen collection (Obtaining screen pap smear, Q0091)", code: "Q0091", codeSystem: "HCPCS", benchmarkRateUSD: 112.00, active: true },
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

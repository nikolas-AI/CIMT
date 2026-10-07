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
// Each role has an id, display label, category, benchmark hourly rate, and BLS
// occupation metadata. Roles without a direct rate use the national volunteer
// hour value described in VOLUNTEER_RATE_SOURCE below.
// -----------------------------------------------------------------
// The active flag controls whether a role is offered in the tool.
const VOLUNTEER_ROLES = [
  { id: "medical-director", displayName: "Medical Director", category: "medical professional", benchmarkRateUSD: 67.77, occupationCode: "11-9111", blsOccupationName: "Medical and Health Services Managers", active: true },
  { id: "family-medicine-physician", displayName: "Family Medicine Physician", category: "medical professional", benchmarkRateUSD: 122.99, occupationCode: "29-1215", blsOccupationName: "Family Medicine Physicians", active: true },
  { id: "general-internal-medicine-physician", displayName: "General Internal Medicine Physician", category: "medical professional", benchmarkRateUSD: 128.46, occupationCode: "29-1216", blsOccupationName: "General Internal Medicine Physicians", active: true },
  { id: "pediatrician", displayName: "Pediatrician", category: "medical professional", benchmarkRateUSD: 101.98, occupationCode: "29-1221", blsOccupationName: "Pediatricians, General", active: true },
  { id: "obstetrician-gynecologist", displayName: "Obstetrician-Gynecologist", category: "medical professional", benchmarkRateUSD: 134.16, occupationCode: "29-1218", blsOccupationName: "Obstetricians and Gynecologists", active: true },
  { id: "psychiatrist", displayName: "Psychiatrist", category: "medical professional", benchmarkRateUSD: 129.78, occupationCode: "29-1223", blsOccupationName: "Psychiatrists", active: true },
  { id: "emergency-medicine-physician", displayName: "Emergency Medicine Physician", category: "medical professional", benchmarkRateUSD: 152.64, occupationCode: "29-1214", blsOccupationName: "Emergency Medicine Physicians", active: true },
  { id: "cardiologist", displayName: "Cardiologist", category: "medical professional", benchmarkRateUSD: 218.72, occupationCode: "29-1212", blsOccupationName: "Cardiologists", active: true },
  { id: "dermatologist", displayName: "Dermatologist", category: "medical professional", benchmarkRateUSD: 155.55, occupationCode: "29-1213", blsOccupationName: "Dermatologists", active: true },
  { id: "endocrinologist", displayName: "Endocrinologist", category: "medical professional", benchmarkRateUSD: 125.98, occupationCode: "29-1229", blsOccupationName: "Physicians, All Other", active: true },
  { id: "gastroenterologist", displayName: "Gastroenterologist", category: "medical professional", benchmarkRateUSD: 125.98, occupationCode: "29-1229", blsOccupationName: "Physicians, All Other", active: true },
  { id: "neurologist", displayName: "Neurologist", category: "medical professional", benchmarkRateUSD: 128.67, occupationCode: "29-1217", blsOccupationName: "Neurologists", active: true },
  { id: "ophthalmologist", displayName: "Ophthalmologist", category: "medical professional", benchmarkRateUSD: 146.47, occupationCode: "29-1241", blsOccupationName: "Ophthalmologists, Except Pediatric", active: true },
  { id: "orthopedic-surgeon", displayName: "Orthopedic Surgeon", category: "medical professional", benchmarkRateUSD: 179.60, occupationCode: "29-1242", blsOccupationName: "Orthopedic Surgeons, Except Pediatric", active: true },
  { id: "pulmonologist", displayName: "Pulmonologist", category: "medical professional", benchmarkRateUSD: 125.98, occupationCode: "29-1229", blsOccupationName: "Physicians, All Other", active: true },
  { id: "rheumatologist", displayName: "Rheumatologist", category: "medical professional", benchmarkRateUSD: 125.98, occupationCode: "29-1229", blsOccupationName: "Physicians, All Other", active: true },
  { id: "general-surgeon", displayName: "General Surgeon", category: "medical professional", benchmarkRateUSD: 179.78, occupationCode: "29-1249", blsOccupationName: "Surgeons, All Other", active: true },
  { id: "other-physician-specialist", displayName: "Other Physician Specialist", category: "medical professional", benchmarkRateUSD: 125.98, occupationCode: "29-1229", blsOccupationName: "Physicians, All Other", active: true },
  { id: "nurse-practitioner", displayName: "Nurse Practitioner", category: "medical professional", benchmarkRateUSD: 66.01, occupationCode: "29-1171", blsOccupationName: "Nurse Practitioners", active: true },
  { id: "physician-assistant", displayName: "Physician Assistant", category: "medical professional", benchmarkRateUSD: 67.92, occupationCode: "29-1071", blsOccupationName: "Physician Assistants", active: true },
  { id: "registered-nurse", displayName: "Registered Nurse", category: "medical professional", benchmarkRateUSD: 48.76, occupationCode: "29-1141", blsOccupationName: "Registered Nurses", active: true },
  { id: "triage-nurse", displayName: "Triage Nurse", category: "medical professional", benchmarkRateUSD: 48.76, occupationCode: "29-1141", blsOccupationName: "Registered Nurses", active: true },
  { id: "nurse-case-manager", displayName: "Nurse Case Manager", category: "medical professional", benchmarkRateUSD: 48.76, occupationCode: "29-1141", blsOccupationName: "Registered Nurses", active: true },
  { id: "licensed-vocational-nurse", displayName: "Licensed Vocational Nurse", category: "medical professional", benchmarkRateUSD: 32.24, occupationCode: "29-2061", blsOccupationName: "Licensed Practical and Licensed Vocational Nurses", active: true },
  { id: "licensed-practical-nurse", displayName: "Licensed Practical Nurse", category: "medical professional", benchmarkRateUSD: 32.24, occupationCode: "29-2061", blsOccupationName: "Licensed Practical and Licensed Vocational Nurses", active: true },
  { id: "certified-nurse-midwife", displayName: "Certified Nurse Midwife", category: "medical professional", benchmarkRateUSD: 65.86, occupationCode: "29-1161", blsOccupationName: "Nurse Midwives", active: true },
  { id: "nurse-anesthetist", displayName: "Nurse Anesthetist", category: "medical professional", benchmarkRateUSD: 119.38, occupationCode: "29-1151", blsOccupationName: "Nurse Anesthetists", active: true },
  { id: "nurse-educator", displayName: "Nurse Educator", category: "medical professional", benchmarkRateUSD: 36.14, occupationCode: "25-1072", blsOccupationName: "Nursing Instructors and Teachers, Postsecondary", active: true },
  { id: "clinical-psychologist", displayName: "Clinical Psychologist", category: "medical professional", benchmarkRateUSD: 54.21, occupationCode: "19-3033", blsOccupationName: "Clinical and Counseling Psychologists", active: true },
  { id: "licensed-professional-counselor", displayName: "Licensed Professional Counselor", category: "medical professional", benchmarkRateUSD: 30.98, occupationCode: "21-1018", blsOccupationName: "Substance Abuse, Behavioral Disorder, and Mental Health Counselors", active: true },
  { id: "licensed-clinical-social-worker", displayName: "Licensed Clinical Social Worker", category: "medical professional", benchmarkRateUSD: 34.51, occupationCode: "21-1022", blsOccupationName: "Healthcare Social Workers", active: true },
  { id: "marriage-and-family-therapist", displayName: "Marriage and Family Therapist", category: "medical professional", benchmarkRateUSD: 37.00, occupationCode: "21-1013", blsOccupationName: "Marriage and Family Therapists", active: true },
  { id: "substance-use-counselor", displayName: "Substance Use Counselor", category: "medical professional", benchmarkRateUSD: 30.98, occupationCode: "21-1018", blsOccupationName: "Substance Abuse, Behavioral Disorder, and Mental Health Counselors", active: true },
  { id: "healthcare-social-worker", displayName: "Healthcare Social Worker", category: "medical professional", benchmarkRateUSD: 34.51, occupationCode: "21-1022", blsOccupationName: "Healthcare Social Workers", active: true },
  { id: "case-manager", displayName: "Case Manager", category: "medical professional", benchmarkRateUSD: 34.51, occupationCode: "21-1022", blsOccupationName: "Healthcare Social Workers", active: true },
  { id: "peer-support-specialist", displayName: "Peer Support Specialist", category: "medical professional", benchmarkRateUSD: 27.01, occupationCode: "21-1094", blsOccupationName: "Community Health Workers", active: true },
  { id: "pharmacist", displayName: "Pharmacist", category: "medical professional", benchmarkRateUSD: 67.75, occupationCode: "29-1051", blsOccupationName: "Pharmacists", active: true },
  { id: "pharmacy-technician", displayName: "Pharmacy Technician", category: "medical professional", benchmarkRateUSD: 22.41, occupationCode: "29-2052", blsOccupationName: "Pharmacy Technicians", active: true },
  { id: "medication-assistance-program-coordinator", displayName: "Medication Assistance Program Coordinator", category: "medical professional", benchmarkRateUSD: 27.01, occupationCode: "21-1094", blsOccupationName: "Community Health Workers", active: true },
  { id: "dentist", displayName: "Dentist", category: "medical professional", benchmarkRateUSD: 91.99, occupationCode: "29-1021", blsOccupationName: "Dentists, General", active: true },
  { id: "dental-hygienist", displayName: "Dental Hygienist", category: "medical professional", benchmarkRateUSD: 47.59, occupationCode: "29-1292", blsOccupationName: "Dental Hygienists", active: true },
  { id: "dental-assistant", displayName: "Dental Assistant", category: "medical professional", benchmarkRateUSD: 24.13, occupationCode: "31-9091", blsOccupationName: "Dental Assistants", active: true },
  { id: "optometrist", displayName: "Optometrist", category: "medical professional", benchmarkRateUSD: 68.05, occupationCode: "29-1041", blsOccupationName: "Optometrists", active: true },
  { id: "optician", displayName: "Optician", category: "medical professional", benchmarkRateUSD: 24.89, occupationCode: "29-2081", blsOccupationName: "Opticians, Dispensing", active: true },
  { id: "vision-screening-volunteer", displayName: "Vision Screening Volunteer", category: "medical professional", benchmarkRateUSD: 27.01, occupationCode: "21-1094", blsOccupationName: "Community Health Workers", active: true },
  { id: "physical-therapist", displayName: "Physical Therapist", category: "medical professional", benchmarkRateUSD: 50.62, occupationCode: "29-1123", blsOccupationName: "Physical Therapists", active: true },
  { id: "physical-therapist-assistant", displayName: "Physical Therapist Assistant", category: "medical professional", benchmarkRateUSD: 33.04, occupationCode: "31-2021", blsOccupationName: "Physical Therapist Assistants", active: true },
  { id: "occupational-therapist", displayName: "Occupational Therapist", category: "medical professional", benchmarkRateUSD: 48.69, occupationCode: "29-1122", blsOccupationName: "Occupational Therapists", active: true },
  { id: "occupational-therapy-assistant", displayName: "Occupational Therapy Assistant", category: "medical professional", benchmarkRateUSD: 33.99, occupationCode: "31-2011", blsOccupationName: "Occupational Therapy Assistants", active: true },
  { id: "speech-language-pathologist", displayName: "Speech-Language Pathologist", category: "medical professional", benchmarkRateUSD: 47.20, occupationCode: "29-1127", blsOccupationName: "Speech-Language Pathologists", active: true },
  { id: "audiologist", displayName: "Audiologist", category: "medical professional", benchmarkRateUSD: 46.99, occupationCode: "29-1181", blsOccupationName: "Audiologists", active: true },
  { id: "respiratory-therapist", displayName: "Respiratory Therapist", category: "medical professional", benchmarkRateUSD: 41.97, occupationCode: "29-1126", blsOccupationName: "Respiratory Therapists", active: true },
  { id: "dietitian", displayName: "Dietitian", category: "medical professional", benchmarkRateUSD: 37.08, occupationCode: "29-1031", blsOccupationName: "Dietitians and Nutritionists", active: true },
  { id: "nutritionist", displayName: "Nutritionist", category: "medical professional", benchmarkRateUSD: 37.08, occupationCode: "29-1031", blsOccupationName: "Dietitians and Nutritionists", active: true },
  { id: "chiropractor", displayName: "Chiropractor", category: "medical professional", benchmarkRateUSD: 43.52, occupationCode: "29-1011", blsOccupationName: "Chiropractors", active: true },
  { id: "podiatrist", displayName: "Podiatrist", category: "medical professional", benchmarkRateUSD: 84.37, occupationCode: "29-1081", blsOccupationName: "Podiatrists", active: true },
  { id: "health-education-specialist", displayName: "Health Education Specialist", category: "medical professional", benchmarkRateUSD: 35.23, occupationCode: "21-1091", blsOccupationName: "Health Education Specialists", active: true },
  { id: "community-health-worker", displayName: "Community Health Worker", category: "medical professional", benchmarkRateUSD: 27.01, occupationCode: "21-1094", blsOccupationName: "Community Health Workers", active: true },
  { id: "medical-assistant", displayName: "Medical Assistant", category: "medical professional", benchmarkRateUSD: 22.17, occupationCode: "31-9092", blsOccupationName: "Medical Assistants", active: true },
  { id: "phlebotomist", displayName: "Phlebotomist", category: "medical professional", benchmarkRateUSD: 21.88, occupationCode: "31-9097", blsOccupationName: "Phlebotomists", active: true },
  { id: "clinical-laboratory-technologist", displayName: "Clinical Laboratory Technologist", category: "medical professional", benchmarkRateUSD: 32.38, occupationCode: "29-2010", blsOccupationName: "Clinical Laboratory Technologists and Technicians", active: true },
  { id: "clinical-laboratory-technician", displayName: "Clinical Laboratory Technician", category: "medical professional", benchmarkRateUSD: 32.38, occupationCode: "29-2010", blsOccupationName: "Clinical Laboratory Technologists and Technicians", active: true },
  { id: "radiologic-technologist", displayName: "Radiologic Technologist", category: "medical professional", benchmarkRateUSD: 40.31, occupationCode: "29-2034", blsOccupationName: "Radiologic Technologists and Technicians", active: true },
  { id: "diagnostic-medical-sonographer", displayName: "Diagnostic Medical Sonographer", category: "medical professional", benchmarkRateUSD: 46.75, occupationCode: "29-2032", blsOccupationName: "Diagnostic Medical Sonographers", active: true },
  { id: "cardiovascular-technologist", displayName: "Cardiovascular Technologist", category: "medical professional", benchmarkRateUSD: 36.99, occupationCode: "29-2031", blsOccupationName: "Cardiovascular Technologists and Technicians", active: true },
  { id: "emergency-medical-technician", displayName: "Emergency Medical Technician", category: "medical professional", benchmarkRateUSD: 22.52, occupationCode: "29-2042", blsOccupationName: "Emergency Medical Technicians", active: true },
  { id: "paramedic", displayName: "Paramedic", category: "medical professional", benchmarkRateUSD: 30.46, occupationCode: "29-2043", blsOccupationName: "Paramedics", active: true },
  { id: "medical-records-specialist", displayName: "Medical Records Specialist", category: "medical professional", benchmarkRateUSD: 27.30, occupationCode: "29-2072", blsOccupationName: "Medical Records Specialists", active: true },
  { id: "health-information-technologist", displayName: "Health Information Technologist", category: "medical professional", benchmarkRateUSD: 36.04, occupationCode: "29-9021", blsOccupationName: "Health Information Technologists and Medical Registrars", active: true },
  { id: "medical-scribe", displayName: "Medical Scribe", category: "medical professional", benchmarkRateUSD: 22.50, occupationCode: "43-6013", blsOccupationName: "Medical Secretaries and Administrative Assistants", active: true },
  { id: "medical-interpreter", displayName: "Medical Interpreter", category: "medical professional", benchmarkRateUSD: 31.90, occupationCode: "27-3091", blsOccupationName: "Interpreters and Translators", active: true },
  { id: "american-sign-language-interpreter", displayName: "American Sign Language Interpreter", category: "non medical", benchmarkRateUSD: 31.90, occupationCode: "27-3091", blsOccupationName: "Interpreters and Translators", active: true },
  { id: "patient-navigator", displayName: "Patient Navigator", category: "medical professional", benchmarkRateUSD: 27.01, occupationCode: "21-1094", blsOccupationName: "Community Health Workers", active: true },
  { id: "patient-advocate", displayName: "Patient Advocate", category: "medical professional", benchmarkRateUSD: 27.01, occupationCode: "21-1094", blsOccupationName: "Community Health Workers", active: true },
  { id: "benefits-enrollment-counselor", displayName: "Benefits Enrollment Counselor", category: "medical professional", benchmarkRateUSD: 27.01, occupationCode: "21-1094", blsOccupationName: "Community Health Workers", active: true },
  { id: "eligibility-screener", displayName: "Eligibility Screener", category: "medical professional", benchmarkRateUSD: 22.71, occupationCode: "43-4111", blsOccupationName: "Interviewers, Except Eligibility and Loan", active: true },
  { id: "referral-coordinator", displayName: "Referral Coordinator", category: "medical professional", benchmarkRateUSD: 22.50, occupationCode: "43-6013", blsOccupationName: "Medical Secretaries and Administrative Assistants", active: true },
  { id: "care-coordinator", displayName: "Care Coordinator", category: "medical professional", benchmarkRateUSD: 34.51, occupationCode: "21-1022", blsOccupationName: "Healthcare Social Workers", active: true },
  { id: "community-outreach-volunteer", displayName: "Community Outreach Volunteer", category: "medical professional", benchmarkRateUSD: 27.01, occupationCode: "21-1094", blsOccupationName: "Community Health Workers", active: true },
  { id: "volunteer-coordinator", displayName: "Volunteer Coordinator", category: "non medical", benchmarkRateUSD: 42.73, occupationCode: "11-9151", blsOccupationName: "Social and Community Service Managers", active: true },
  { id: "clinic-manager", displayName: "Clinic Manager", category: "medical professional", benchmarkRateUSD: 67.77, occupationCode: "11-9111", blsOccupationName: "Medical and Health Services Managers", active: true },
  { id: "front-desk-receptionist", displayName: "Front Desk Receptionist", category: "non medical", benchmarkRateUSD: 18.97, occupationCode: "43-4171", blsOccupationName: "Receptionists and Information Clerks", active: true },
  { id: "patient-registration-volunteer", displayName: "Patient Registration Volunteer", category: "non medical", benchmarkRateUSD: 18.97, occupationCode: "43-4171", blsOccupationName: "Receptionists and Information Clerks", active: true },
  { id: "appointment-scheduler", displayName: "Appointment Scheduler", category: "non medical", benchmarkRateUSD: 22.50, occupationCode: "43-6013", blsOccupationName: "Medical Secretaries and Administrative Assistants", active: true },
  { id: "administrative-assistant", displayName: "Administrative Assistant", category: "non medical", benchmarkRateUSD: 23.73, occupationCode: "43-6014", blsOccupationName: "Secretaries and Administrative Assistants, Except Legal, Medical, and Executive", active: true },
  { id: "data-entry-volunteer", displayName: "Data Entry Volunteer", category: "non medical", benchmarkRateUSD: 20.82, occupationCode: "43-9021", blsOccupationName: "Data Entry Keyers", active: true },
  { id: "medical-billing-and-coding-volunteer", displayName: "Medical Billing and Coding Volunteer", category: "medical professional", benchmarkRateUSD: 27.30, occupationCode: "29-2072", blsOccupationName: "Medical Records Specialists", active: true },
  { id: "finance-bookkeeping-volunteer", displayName: "Finance / Bookkeeping Volunteer", category: "non medical", benchmarkRateUSD: 25.75, occupationCode: "43-3031", blsOccupationName: "Bookkeeping, Accounting, and Auditing Clerks", active: true },
  { id: "grant-writer", displayName: "Grant Writer", category: "non medical", benchmarkRateUSD: 41.39, occupationCode: "27-3043", blsOccupationName: "Writers and Authors", active: true },
  { id: "fundraising-volunteer", displayName: "Fundraising Volunteer", category: "non medical", benchmarkRateUSD: 37.12, occupationCode: "13-1131", blsOccupationName: "Fundraisers", active: true },
  { id: "communications-marketing-volunteer", displayName: "Communications / Marketing Volunteer", category: "non medical", benchmarkRateUSD: 40.44, occupationCode: "27-3031", blsOccupationName: "Public Relations Specialists", active: true },
  { id: "human-resources-volunteer", displayName: "Human Resources Volunteer", category: "non medical", benchmarkRateUSD: 39.42, occupationCode: "13-1071", blsOccupationName: "Human Resources Specialists", active: true },
  { id: "legal-counsel", displayName: "Legal Counsel", category: "non medical", benchmarkRateUSD: 89.35, occupationCode: "23-1011", blsOccupationName: "Lawyers", active: true },
  { id: "information-technology-volunteer", displayName: "Information Technology Volunteer", category: "non medical", benchmarkRateUSD: 32.37, occupationCode: "15-1232", blsOccupationName: "Computer User Support Specialists", active: true },
  { id: "ehr-support-volunteer", displayName: "EHR Support Volunteer", category: "non medical", benchmarkRateUSD: 32.37, occupationCode: "15-1232", blsOccupationName: "Computer User Support Specialists", active: true },
  { id: "facilities-maintenance-volunteer", displayName: "Facilities Maintenance Volunteer", category: "non medical", benchmarkRateUSD: 25.86, occupationCode: "49-9071", blsOccupationName: "Maintenance and Repair Workers, General", active: true },
  { id: "custodial-environmental-services-volunteer", displayName: "Custodial / Environmental Services Volunteer", category: "non medical", benchmarkRateUSD: 18.64, occupationCode: "37-2011", blsOccupationName: "Janitors and Cleaners, Except Maids and Housekeeping Cleaners", active: true },
  { id: "supply-and-inventory-volunteer", displayName: "Supply and Inventory Volunteer", category: "non medical", benchmarkRateUSD: 19.01, occupationCode: "53-7065", blsOccupationName: "Stockers and Order Fillers", active: true },
  { id: "donation-intake-and-sorting-volunteer", displayName: "Donation Intake and Sorting Volunteer", category: "non medical", benchmarkRateUSD: 19.01, occupationCode: "53-7065", blsOccupationName: "Stockers and Order Fillers", active: true },
  { id: "food-pantry-volunteer", displayName: "Food Pantry Volunteer", category: "non medical", benchmarkRateUSD: 16.96, occupationCode: "35-2021", blsOccupationName: "Food Preparation Workers", active: true },
  { id: "driver", displayName: "Driver", category: "non medical", benchmarkRateUSD: 19.58, occupationCode: "53-3031", blsOccupationName: "Driver/Sales Workers", active: true },
  { id: "security-volunteer", displayName: "Security Volunteer", category: "non medical", benchmarkRateUSD: 20.42, occupationCode: "33-9032", blsOccupationName: "Security Guards", active: true },
  { id: "greeter", displayName: "Greeter", category: "non medical", benchmarkRateUSD: 18.97, occupationCode: "43-4171", blsOccupationName: "Receptionists and Information Clerks", active: true },
  { id: "childcare-volunteer", displayName: "Childcare Volunteer", category: "non medical", benchmarkRateUSD: 16.84, occupationCode: "39-9011", blsOccupationName: "Childcare Workers", active: true },
  { id: "event-volunteer", displayName: "Event Volunteer", category: "non medical", benchmarkRateUSD: 64.87, occupationCode: "11-1021", blsOccupationName: "General and Operations Managers", active: true },
  { id: "board-member-advisor", displayName: "Board Member / Advisor", category: "non medical", benchmarkRateUSD: 64.87, occupationCode: "11-1021", blsOccupationName: "General and Operations Managers", active: true },
  { id: "medical-student", displayName: "Medical Student", category: "medical professional", benchmarkRateUSD: 36.14, occupationCode: null, blsOccupationName: "General Volunteer / no direct BLS professional match", active: true },
  { id: "resident-physician", displayName: "Resident Physician", category: "medical professional", benchmarkRateUSD: 125.98, occupationCode: "29-1229", blsOccupationName: "Physicians, All Other", active: true },
  { id: "nursing-student", displayName: "Nursing Student", category: "medical professional", benchmarkRateUSD: 36.14, occupationCode: null, blsOccupationName: "General Volunteer / no direct BLS professional match", active: true },
  { id: "physician-assistant-student", displayName: "Physician Assistant Student", category: "medical professional", benchmarkRateUSD: 36.14, occupationCode: null, blsOccupationName: "General Volunteer / no direct BLS professional match", active: true },
  { id: "pharmacy-student", displayName: "Pharmacy Student", category: "medical professional", benchmarkRateUSD: 36.14, occupationCode: null, blsOccupationName: "General Volunteer / no direct BLS professional match", active: true },
  { id: "dental-student", displayName: "Dental Student", category: "medical professional", benchmarkRateUSD: 36.14, occupationCode: null, blsOccupationName: "General Volunteer / no direct BLS professional match", active: true },
  { id: "public-health-student", displayName: "Public Health Student", category: "medical professional", benchmarkRateUSD: 36.14, occupationCode: null, blsOccupationName: "General Volunteer / no direct BLS professional match", active: true },
  { id: "social-work-student", displayName: "Social Work Student", category: "medical professional", benchmarkRateUSD: 36.14, occupationCode: null, blsOccupationName: "General Volunteer / no direct BLS professional match", active: true },
  { id: "clinical-intern", displayName: "Clinical Intern", category: "medical professional", benchmarkRateUSD: 36.14, occupationCode: null, blsOccupationName: "General Volunteer / no direct BLS professional match", active: true },
  { id: "general-volunteer", displayName: "General Volunteer", category: "non medical", benchmarkRateUSD: 36.14, occupationCode: null, blsOccupationName: "General Volunteer / no direct BLS professional match", active: true },
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
  { id: "1119811", description: "Contraceptive implant insertion", displayName: "Contraceptive implant insertion (Insertion drug dlvr implant, 11981)", code: "11981", codeSystem: "CPT", referenceRateUSD: 107.55, active: true },
  { id: "1119822", description: "Contraceptive implant removal", displayName: "Contraceptive implant removal (Remove drug implant device, 11982)", code: "11982", codeSystem: "CPT", referenceRateUSD: 114.57, active: true },
  { id: "1119833", description: "Contraceptive implant removal and reinsertion", displayName: "Contraceptive implant removal and reinsertion (Remove/insert drug implant, 11983)", code: "11983", codeSystem: "CPT", referenceRateUSD: 144.63, active: true },
  { id: "5583011", description: "Intrauterine device (IUD) removal", displayName: "Intrauterine device (IUD) removal (Remove intrauterine device, 58301)", code: "58301", codeSystem: "CPT", referenceRateUSD: 111.56, active: true },
  { id: "7766411", description: "Complete breast ultrasound", displayName: "Complete breast ultrasound (Ultrasound breast complete, 76641)", code: "76641", codeSystem: "CPT", referenceRateUSD: 100.2, active: true },
  { id: "7766422", description: "Limited breast ultrasound", displayName: "Limited breast ultrasound (Ultrasound breast limited, 76642)", code: "76642", codeSystem: "CPT", referenceRateUSD: 83.5, active: true },
  { id: "7770655", description: "Diagnostic mammogram — one breast", displayName: "Diagnostic mammogram — one breast (Dx mammo incl cad uni, 77065)", code: "77065", codeSystem: "CPT", referenceRateUSD: 123.92, active: true },
  { id: "7770666", description: "Diagnostic mammogram — both breasts", displayName: "Diagnostic mammogram — both breasts (Dx mammo incl cad bi, 77066)", code: "77066", codeSystem: "CPT", referenceRateUSD: 156.98, active: true },
  { id: "7770677", description: "Screening mammogram — both breasts", displayName: "Screening mammogram — both breasts (Scr mammo bi incl cad, 77067)", code: "77067", codeSystem: "CPT", referenceRateUSD: 126.26, active: true },
  { id: "9904600", description: "Vaccine administration with counseling — first component", displayName: "Vaccine administration with counseling — first component (Im admin 1st/only component, 90460)", code: "90460", codeSystem: "CPT", referenceRateUSD: 23.38, active: true },
  { id: "9904611", description: "Vaccine administration with counseling — each additional component", displayName: "Vaccine administration with counseling — each additional component (Im admin each addl component, 90461)", code: "90461", codeSystem: "CPT", referenceRateUSD: 8.68, active: true },
  { id: "9904711", description: "Vaccine administration by injection — first vaccine", displayName: "Vaccine administration by injection — first vaccine (Immunization admin, 90471)", code: "90471", codeSystem: "CPT", referenceRateUSD: 22.04, active: true },
  { id: "9904722", description: "Vaccine administration by injection — each additional vaccine", displayName: "Vaccine administration by injection — each additional vaccine (Immunization admin each add, 90472)", code: "90472", codeSystem: "CPT", referenceRateUSD: 16.03, active: true },
  { id: "9904733", description: "Vaccine administration by mouth or nose — first vaccine", displayName: "Vaccine administration by mouth or nose — first vaccine (Immune admin oral/nasal, 90473)", code: "90473", codeSystem: "CPT", referenceRateUSD: 17.37, active: true },
  { id: "9904744", description: "Vaccine administration by mouth or nose — each additional vaccine", displayName: "Vaccine administration by mouth or nose — each additional vaccine (Immune admin oral/nasal addl, 90474)", code: "90474", codeSystem: "CPT", referenceRateUSD: 12.36, active: true },
  { id: "9907911", description: "Mental health diagnostic evaluation", displayName: "Mental health diagnostic evaluation (Psych diagnostic evaluation, 90791)", code: "90791", codeSystem: "CPT", referenceRateUSD: 173.35, active: true },
  { id: "9907922", description: "Mental health diagnostic evaluation with medical services", displayName: "Mental health diagnostic evaluation with medical services (Psych diag eval w/med srvcs, 90792)", code: "90792", codeSystem: "CPT", referenceRateUSD: 202.08, active: true },
  { id: "9908322", description: "Individual psychotherapy — 30 minutes", displayName: "Individual psychotherapy — 30 minutes (Psytx w pt 30 minutes, 90832)", code: "90832", codeSystem: "CPT", referenceRateUSD: 85.84, active: true },
  { id: "9908377", description: "Individual psychotherapy — 60 minutes", displayName: "Individual psychotherapy — 60 minutes (Psytx w pt 60 minutes, 90837)", code: "90837", codeSystem: "CPT", referenceRateUSD: 167.0, active: true },
  { id: "9908399", description: "Crisis psychotherapy — first 60 minutes", displayName: "Crisis psychotherapy — first 60 minutes (Psytx crisis initial 60 min, 90839)", code: "90839", codeSystem: "CPT", referenceRateUSD: 160.32, active: true },
  { id: "9908400", description: "Crisis psychotherapy — each additional 30 minutes", displayName: "Crisis psychotherapy — each additional 30 minutes (Psytx crisis ea addl 30 min, 90840)", code: "90840", codeSystem: "CPT", referenceRateUSD: 77.16, active: true },
  { id: "9908466", description: "Family psychotherapy without the patient — 50 minutes", displayName: "Family psychotherapy without the patient — 50 minutes (Family psytx w/o pt 50 min, 90846)", code: "90846", codeSystem: "CPT", referenceRateUSD: 105.88, active: true },
  { id: "9908477", description: "Family psychotherapy with the patient — 50 minutes", displayName: "Family psychotherapy with the patient — 50 minutes (Family psytx w/pt 50 min, 90847)", code: "90847", codeSystem: "CPT", referenceRateUSD: 109.55, active: true },
  { id: "9908499", description: "Multiple-family group psychotherapy", displayName: "Multiple-family group psychotherapy (Multiple family group psytx, 90849)", code: "90849", codeSystem: "CPT", referenceRateUSD: 40.42, active: true },
  { id: "9908533", description: "Group psychotherapy", displayName: "Group psychotherapy (Group psychotherapy, 90853)", code: "90853", codeSystem: "CPT", referenceRateUSD: 30.39, active: true },
  { id: "9961122", description: "Developmental test — first hour", displayName: "Developmental test — first hour (Devel tst phys/qhp 1st hr, 96112)", code: "96112", codeSystem: "CPT", referenceRateUSD: 125.25, active: true },
  { id: "9961133", description: "Developmental test — each additional hour", displayName: "Developmental test — each additional hour (Devel tst phys/qhp ea addl, 96113)", code: "96113", codeSystem: "CPT", referenceRateUSD: 56.11, active: true },
  { id: "9961277", description: "Brief emotional or behavioral assessment", displayName: "Brief emotional or behavioral assessment (Brief emotional/behav assmt, 96127)", code: "96127", codeSystem: "CPT", referenceRateUSD: 5.01, active: true },
  { id: "9978033", description: "Individual medical nutrition therapy — follow-up", displayName: "Individual medical nutrition therapy — follow-up (Med nutrition indiv subseq, 97803)", code: "97803", codeSystem: "CPT", referenceRateUSD: 31.73, active: true },
  { id: "9978044", description: "Group medical nutrition therapy", displayName: "Group medical nutrition therapy (Medical nutrition group, 97804)", code: "97804", codeSystem: "CPT", referenceRateUSD: 17.03, active: true },
  { id: "9989688", description: "Telephone assessment and management — 21–30 minutes", displayName: "Telephone assessment and management — 21–30 minutes (Ph1 assmt&mgmt nqhp 21-30, 98968)", code: "98968", codeSystem: "CPT", referenceRateUSD: 34.74, active: true },
  { id: "9992033", description: "New-patient office visit — low complexity / 30 minutes", displayName: "New-patient office visit — low complexity / 30 minutes (Office o/p new low 30 min, 99203)", code: "99203", codeSystem: "CPT", referenceRateUSD: 117.57, active: true },
  { id: "9992055", description: "New-patient office visit — high complexity / 60 minutes", displayName: "New-patient office visit — high complexity / 60 minutes (Office o/p new hi 60 min, 99205)", code: "99205", codeSystem: "CPT", referenceRateUSD: 236.81, active: true },
  { id: "9992111", description: "Established-patient office visit — minimal service", displayName: "Established-patient office visit — minimal service (Off/op est may x req phy/qhp, 99211)", code: "99211", codeSystem: "CPT", referenceRateUSD: 24.38, active: true },
  { id: "9992122", description: "Established-patient office visit — straightforward / 10 minutes", displayName: "Established-patient office visit — straightforward / 10 minutes (Office o/p est sf 10 min, 99212)", code: "99212", codeSystem: "CPT", referenceRateUSD: 59.45, active: true },
  { id: "9992133", description: "Established-patient office visit — low complexity / 20 minutes", displayName: "Established-patient office visit — low complexity / 20 minutes (Office o/p est low 20 min, 99213)", code: "99213", codeSystem: "CPT", referenceRateUSD: 95.19, active: true },
  { id: "9992144", description: "Established-patient office visit — moderate complexity / 30 minutes", displayName: "Established-patient office visit — moderate complexity / 30 minutes (Office o/p est mod 30 min, 99214)", code: "99214", codeSystem: "CPT", referenceRateUSD: 135.61, active: true },
  { id: "9992155", description: "Established-patient office visit — high complexity / 40 minutes", displayName: "Established-patient office visit — high complexity / 40 minutes (Office o/p est hi 40 min, 99215)", code: "99215", codeSystem: "CPT", referenceRateUSD: 192.39, active: true },
  { id: "9994066", description: "Tobacco cessation counseling — 3–10 minutes", displayName: "Tobacco cessation counseling — 3–10 minutes (Behav chng smoking 3-10 min, 99406)", code: "99406", codeSystem: "CPT", referenceRateUSD: 13.91, active: true },
  { id: "9994077", description: "Tobacco cessation counseling — more than 10 minutes", displayName: "Tobacco cessation counseling — more than 10 minutes (Behav chng smoking > 10 min, 99407)", code: "99407", codeSystem: "CPT", referenceRateUSD: 26.52, active: true },
  { id: "9994222", description: "Online digital evaluation and management — 11–20 minutes", displayName: "Online digital evaluation and management — 11–20 minutes (Ol dig e/m svc 11-20 min, 99422)", code: "99422", codeSystem: "CPT", referenceRateUSD: 28.46, active: true },
  { id: "9994377", description: "Chronic care management by physician/QHP — additional time", displayName: "Chronic care management by physician/QHP — additional time (Chrnc care mgmt phys ea addl, 99437)", code: "99437", codeSystem: "CPT", referenceRateUSD: 57.58, active: true },
  { id: "9994399", description: "Chronic care management by clinical staff — additional time", displayName: "Chronic care management by clinical staff — additional time (Chrnc care mgmt staf ea addl, 99439)", code: "99439", codeSystem: "CPT", referenceRateUSD: 45.93, active: true },
  { id: "9994844", description: "Behavioral health care management", displayName: "Behavioral health care management (Care mgmt svc bhvl hlth cond, 99484)", code: "99484", codeSystem: "CPT", referenceRateUSD: 53.05, active: true },
  { id: "9994877", description: "Complex chronic care management — first 60 minutes", displayName: "Complex chronic care management — first 60 minutes (Cplx chrnc care 1st 60 min, 99487)", code: "99487", codeSystem: "CPT", referenceRateUSD: 131.65, active: true },
  { id: "9994899", description: "Complex chronic care management — each additional 30 minutes", displayName: "Complex chronic care management — each additional 30 minutes (Cplx chrnc care ea addl 30, 99489)", code: "99489", codeSystem: "CPT", referenceRateUSD: 70.52, active: true },
  { id: "9994900", description: "Chronic care management by clinical staff — first 20 minutes", displayName: "Chronic care management by clinical staff — first 20 minutes (Chrnc care mgmt staff 1st 20, 99490)", code: "99490", codeSystem: "CPT", referenceRateUSD: 60.49, active: true },
  { id: "9994911", description: "Chronic care management by physician/QHP — first 30 minutes", displayName: "Chronic care management by physician/QHP — first 30 minutes (Chrnc care mgmt phys 1st 30, 99491)", code: "99491", codeSystem: "CPT", referenceRateUSD: 82.16, active: true },
  { id: "9994922", description: "Psychiatric collaborative care management — initial month", displayName: "Psychiatric collaborative care management — initial month (1st psyc collab care mgmt, 99492)", code: "99492", codeSystem: "CPT", referenceRateUSD: 145.24, active: true },
  { id: "9994933", description: "Psychiatric collaborative care management — follow-up month", displayName: "Psychiatric collaborative care management — follow-up month (Sbsq psyc collab care mgmt, 99493)", code: "99493", codeSystem: "CPT", referenceRateUSD: 133.59, active: true },
  { id: "9994944", description: "Psychiatric collaborative care management — additional time", displayName: "Psychiatric collaborative care management — additional time (1st/sbsq psyc collab care, 99494)", code: "99494", codeSystem: "CPT", referenceRateUSD: 55.96, active: true },
  { id: "9994955", description: "Transitional care management — moderate complexity", displayName: "Transitional care management — moderate complexity (Transj care mgmt mod f2f 14d, 99495)", code: "99495", codeSystem: "CPT", referenceRateUSD: 201.2, active: true },
  { id: "9994966", description: "Transitional care management — high complexity", displayName: "Transitional care management — high complexity (Transj care mgmt high f2f 7d, 99496)", code: "99496", codeSystem: "CPT", referenceRateUSD: 272.68, active: true },
  { id: "GG00199", description: "Community health integration services — first 60 minutes", displayName: "Community health integration services — first 60 minutes (Comm hlth intg svs sdoh 60mn, G0019)", code: "G0019", codeSystem: "HCPCS", referenceRateUSD: 77.96, active: true },
  { id: "GG00222", description: "Community health integration services — additional 30 minutes", displayName: "Community health integration services — additional 30 minutes (Comm hlth intg svs add 30 m, G0022)", code: "G0022", codeSystem: "HCPCS", referenceRateUSD: 48.52, active: true },
  { id: "GG01011", description: "Screening pelvic and breast examination", displayName: "Screening pelvic and breast examination (Ca screen;pelvic/breast exam, G0101)", code: "G0101", codeSystem: "HCPCS", referenceRateUSD: 37.85, active: true },
  { id: "GG01088", description: "Individual diabetes self-management training", displayName: "Individual diabetes self-management training (Diab manage trnper indiv, G0108)", code: "G0108", codeSystem: "HCPCS", referenceRateUSD: 53.05, active: true },
  { id: "GG01099", description: "Group diabetes self-management training", displayName: "Group diabetes self-management training (Diab manage trn ind/group, G0109)", code: "G0109", codeSystem: "HCPCS", referenceRateUSD: 15.2, active: true },
  { id: "GG01366", description: "Social determinants of health risk assessment", displayName: "Social determinants of health risk assessment (Adm of soc dtr assess 5-15 m, G0136)", code: "G0136", codeSystem: "HCPCS", referenceRateUSD: 18.44, active: true },
  { id: "GG03966", description: "Alcohol or substance-use intervention — 15–30 minutes", displayName: "Alcohol or substance-use intervention — 15–30 minutes (Alcohol/subs interv 15-30mn, G0396)", code: "G0396", codeSystem: "HCPCS", referenceRateUSD: 33.64, active: true },
  { id: "GG03977", description: "Alcohol or substance-use intervention — more than 30 minutes", displayName: "Alcohol or substance-use intervention — more than 30 minutes (Alcohol/subs interv >30 min, G0397)", code: "G0397", codeSystem: "HCPCS", referenceRateUSD: 62.75, active: true },
  { id: "GG04022", description: "Initial preventive physical examination", displayName: "Initial preventive physical examination (Initial preventive exam, G0402)", code: "G0402", codeSystem: "HCPCS", referenceRateUSD: 160.76, active: true },
  { id: "GG04388", description: "Initial annual wellness visit", displayName: "Initial annual wellness visit (Ppps,initial visit, G0438)", code: "G0438", codeSystem: "HCPCS", referenceRateUSD: 160.44, active: true },
  { id: "GG04399", description: "Subsequent annual wellness visit", displayName: "Subsequent annual wellness visit (Ppps,subseq visit, G0439)", code: "G0439", codeSystem: "HCPCS", referenceRateUSD: 126.47, active: true },
  { id: "GG04422", description: "Annual alcohol misuse screening — 15 minutes", displayName: "Annual alcohol misuse screening — 15 minutes (Annual alcohol screen 15 min, G0442)", code: "G0442", codeSystem: "HCPCS", referenceRateUSD: 17.14, active: true },
  { id: "GG04433", description: "Alcohol misuse counseling", displayName: "Alcohol misuse counseling (Brief alcohol misuse counsel, G0443)", code: "G0443", codeSystem: "HCPCS", referenceRateUSD: 31.7, active: true },
  { id: "GG04444", description: "Annual depression screening", displayName: "Annual depression screening (Depression screen annual, G0444)", code: "G0444", codeSystem: "HCPCS", referenceRateUSD: 17.14, active: true },
  { id: "GG04455", description: "High-intensity behavioral counseling for STI prevention — 30 minutes", displayName: "High-intensity behavioral counseling for STI prevention — 30 minutes (High inten beh couns std 30m, G0445)", code: "G0445", codeSystem: "HCPCS", referenceRateUSD: 31.38, active: true },
  { id: "GG30022", description: "Chronic pain management — first 30 minutes", displayName: "Chronic pain management — first 30 minutes (Chronic pain mgmt 30 mins, G3002)", code: "G3002", codeSystem: "HCPCS", referenceRateUSD: 80.22, active: true },
  { id: "GG30033", description: "Chronic pain management — additional 15 minutes", displayName: "Chronic pain management — additional 15 minutes (Chronic pain mgmt addl 15m, G3003)", code: "G3003", codeSystem: "HCPCS", referenceRateUSD: 29.44, active: true },
  { id: "QQ00911", description: "Screening Pap smear specimen collection", displayName: "Screening Pap smear specimen collection (Obtaining screen pap smear, Q0091)", code: "Q0091", codeSystem: "HCPCS", referenceRateUSD: 43.34, active: true },
];

// -----------------------------------------------------------------
// VOLUNTEER RATE SOURCE
// Describes where the volunteer benchmark hourly values come from.
// -----------------------------------------------------------------
const VOLUNTEER_RATE_SOURCE = {
  name: "U.S. Bureau of Labor Statistics; Independent Sector / Do Good Institute",
  publicationYear: null,
  description:
    "Occupation-specific rates are hourly mean wages from U.S. Bureau of Labor Statistics " +
    "occupational employment and wage data. Roles without an available occupation rate use the " +
    "Current Estimated National Value of Each Volunteer Hour ($36.14). These values estimate " +
    "the economic value of donated time and are not wages paid by the clinic.",
  url: "https://www.bls.gov/oes/",
};

// -----------------------------------------------------------------
// REFERENCES
// Data-driven list; never hard-code these into UI components.
// -----------------------------------------------------------------
const REFERENCES = [
  {
    id: "bls-oes",
    title: "Occupational Employment and Wage Statistics",
    organization: "U.S. Bureau of Labor Statistics",
    description: "National occupational employment and hourly mean wage estimates.",
    url: "https://www.bls.gov/oes/",
    year: null,
  },
  {
    id: "cms-pfs",
    title: "CMS Physician Fee Schedule Look-Up Tool",
    organization: "Centers for Medicare & Medicaid Services (CMS)",
    description: "Provides national and locality-specific Medicare payment rates for CPT/HCPCS codes.",
    url: "https://www.cms.gov/medicare/physician-fee-schedule/search",
    year: null,
  },
  // {
  //   id: "independent-sector-2026",
  //   title: "New Value of Volunteer Time of $36.14 Per Hour (2025 data)",
  //   organization: "Independent Sector & Do Good Institute",
  //   description: "Annual update to the national value-of-volunteer-time estimate.",
  //   url: "https://independentsector.org/blog/2026-value-of-volunteer-time-release/",
  //   year: 2026,
  // },
  // {
  //   id: "independent-sector-methodology",
  //   title: "Value of Volunteer Time — National and State Rates",
  //   organization: "Independent Sector",
  //   description: "National and state-level volunteer valuation rates and methodology.",
  //   url: "https://independentsector.org/research/value-of-volunteer-time/",
  //   year: null,
  // },
  // {
  //   id: "serve-love",
  //   title: "How to Calculate Volunteer Value for Grant Applications",
  //   organization: "Serve.Love",
  //   description:
  //     "Recommends using higher hourly values for skilled volunteers such as medical professionals.",
  //   url: "https://www.serve.love/blog/calculate-volunteer-value-grant-applications/",
  //   year: null,
  // },
];

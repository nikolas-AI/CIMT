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
// Each role has an id, display label, and benchmark hourly rate.
// The rate source is documented in VOLUNTEER_RATE_SOURCE below.
// -----------------------------------------------------------------
const VOLUNTEER_ROLES = [
  { id: "physician",        displayName: "Physician (MD/DO)",        benchmarkRateUSD: 120.00, active: true },
  { id: "np-pa",            displayName: "Nurse Practitioner / PA",  benchmarkRateUSD: 75.00,  active: true },
  { id: "rn",               displayName: "Registered Nurse (RN)",    benchmarkRateUSD: 45.00,  active: true },
  { id: "pharmacist",       displayName: "Pharmacist",               benchmarkRateUSD: 65.00,  active: true },
  { id: "medical-student",  displayName: "Medical Student",          benchmarkRateUSD: 20.00,  active: true },
  { id: "nursing-student",  displayName: "Nursing Student",          benchmarkRateUSD: 18.00,  active: true },
  { id: "pharmacy-student", displayName: "Pharmacy Student",         benchmarkRateUSD: 18.00,  active: true },
  { id: "admin",            displayName: "Administrative Volunteer", benchmarkRateUSD: 16.00,  active: true },
  { id: "other",            displayName: "Other Volunteer",          benchmarkRateUSD: 14.00,  active: true },
];

// -----------------------------------------------------------------
// CLINICAL SERVICES
// Benchmark rates are approximate Medicare Physician Fee Schedule
// (non-facility, national) amounts. Codes are CPT/HCPCS.
// -----------------------------------------------------------------
const CLINICAL_SERVICES = [
  { id: "primary-care-brief",    displayName: "Primary Care Visit (brief)",     code: "99213", codeSystem: "CPT", benchmarkRateUSD: 92.00,  active: true },
  { id: "primary-care-moderate", displayName: "Primary Care Visit (moderate)",  code: "99214", codeSystem: "CPT", benchmarkRateUSD: 134.00, active: true },
  { id: "primary-care-complex",  displayName: "Primary Care Visit (complex)",   code: "99215", codeSystem: "CPT", benchmarkRateUSD: 185.00, active: true },
  { id: "preventive-adult",      displayName: "Preventive Visit (adult)",       code: "99395", codeSystem: "CPT", benchmarkRateUSD: 143.00, active: true },
  { id: "diabetes-screening",    displayName: "Diabetes Screening",             code: "G0008", codeSystem: "HCPCS", benchmarkRateUSD: 24.00, active: true },
  { id: "bp-screening",          displayName: "Blood Pressure Screening",       code: "G0008", codeSystem: "HCPCS", benchmarkRateUSD: 22.00, active: true },
  { id: "vaccination",           displayName: "Vaccination Administration",     code: "90471", codeSystem: "CPT", benchmarkRateUSD: 30.00,  active: true },
  { id: "cancer-screening",      displayName: "Cancer Screening Consult",       code: "99213", codeSystem: "CPT", benchmarkRateUSD: 92.00,  active: true },
  { id: "tobacco-counseling",    displayName: "Tobacco Cessation Counseling",   code: "99407", codeSystem: "CPT", benchmarkRateUSD: 46.00,  active: true },
  { id: "mental-health-eval",    displayName: "Mental Health Evaluation",       code: "90791", codeSystem: "CPT", benchmarkRateUSD: 165.00, active: true },
  { id: "other-service",         displayName: "Other Service",                  code: "—",     codeSystem: "—",   benchmarkRateUSD: 75.00,  active: true },
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

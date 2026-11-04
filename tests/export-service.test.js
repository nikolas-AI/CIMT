"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
let reportHTML = "";
const copyGroup = new Proxy({}, {
  get: (_target, property) => String(property),
});
const context = vm.createContext({
  AppCopy: {
    exportCopy: { pdfTitle: "Impact report" },
    summary: {
      shortDisclaimer: () => "Disclaimer",
      funderReadyVolunteerStatement: () => "Volunteer impact statement",
      funderReadyTitle: "Funder-ready summary",
    },
    summaryDashboard: copyGroup,
    summaryView: {
      methodologyBullets: () => [],
      methodologySectionTitle: "Methodology",
    },
    metric: copyGroup,
  },
  CompositionPieChart: { render: () => "" },
  VOLUNTEER_RATE_SOURCE: null,
  getRelevantReferences: () => [],
  getRateDataSummary: () => "",
  window: {
    open: () => ({
      addEventListener: () => {},
      document: {
        write: html => { reportHTML = html; },
        close: () => {},
      },
      focus: () => {},
      closed: true,
    }),
    focus: () => {},
  },
  setTimeout: () => {},
});
vm.runInContext(
  fs.readFileSync(path.join(root, "js/services/exportService.js"), "utf8"),
  context
);

test("the volunteer final report omits roles with zero hours", () => {
  const summary = {
    impactMethod: "volunteerHours",
    serviceBreakdown: [],
    volunteerBreakdown: [
      {
        roleName: "Active Role",
        category: "medical professional",
        hours: 2,
        benchmarkRate: 50,
        estimatedValue: 100,
      },
      {
        roleName: "Unused Role",
        category: "non medical",
        hours: 0,
        benchmarkRate: 25,
        estimatedValue: 0,
      },
    ],
    reportingPeriodFrom: "2026-01-01",
    reportingPeriodTo: "2026-01-31",
    clinicName: "Test Clinic",
    totalEstimatedValue: 100,
    volunteerValue: 100,
    reportingPeriodClinicCost: null,
  };

  context.summary = summary;
  vm.runInContext("ExportService.downloadPDF(summary)", context, {
    timeout: 1000,
  });

  assert.match(reportHTML, /<h2>Volunteer Time<\/h2>/);
  assert.match(reportHTML, /Active Role/);
  assert.doesNotMatch(reportHTML, /Unused Role/);
});

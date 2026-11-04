"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
let reportHTML = "";
let exportedSheet;
const copyGroup = new Proxy({}, {
  get: (_target, property) => String(property),
});
const context = vm.createContext({
  AppCopy: {
    exportCopy: { pdfTitle: "Impact report", workbookSummary: "Impact Summary" },
    summary: {
      shortDisclaimer: () => "Estimated value is based on reference rates and reported service counts. This is a planning and communication estimate, not revenue, reimbursement, savings, financial ROI, or a measure of care quality.",
      funderReadyVolunteerStatement: () => "Volunteer impact statement",
      funderReadyTitle: "Funder-ready summary",
      costComparisonNote: "Compares reported clinic costs for this period with the estimated value of the activity entered; it is not actual financial ROI, revenue, reimbursement, profit, or confirmed healthcare savings.",
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
  getRelevantReferences: () => [{
    organization: "Reference Organization",
    ratePeriod: "2025",
    title: "Reference rates",
    url: "https://example.test/rates",
  }],
  getRateDataSummary: () => "",
  XLSX: {
    utils: {
      aoa_to_sheet: rows => {
        const sheet = {};
        rows.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
          if (value !== null && value !== undefined) {
            sheet[String.fromCharCode(65 + columnIndex) + (rowIndex + 1)] = { v: value };
          }
        }));
        exportedSheet = sheet;
        return sheet;
      },
      encode_cell: ({ r, c }) => `${String.fromCharCode(65 + c)}${r + 1}`,
      book_new: () => ({}),
      book_append_sheet: (_workbook, sheet) => { exportedSheet = sheet; },
    },
    write: () => new Uint8Array(),
  },
  Blob: class {},
  URL: {
    createObjectURL: () => "blob:test",
    revokeObjectURL: () => {},
  },
  document: {
    createElement: () => ({ click: () => {} }),
    body: { appendChild: () => {}, removeChild: () => {} },
  },
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

test("clinical services Excel export follows the requested order and has sortable service data", () => {
  context.summary = {
    impactMethod: "clinicalServices",
    clinicName: "Test Clinic",
    streetAddress: "1 Main Street",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    reportingPeriodFrom: "2026-01-01",
    reportingPeriodTo: "2026-01-31",
    reportingPeriodClinicCost: 1000,
    valueToCostRatio: 0.3,
    clinicalServiceValue: 300,
    totalEstimatedValue: 300,
    serviceBreakdown: [
      { serviceName: "Lower Value", code: "B", count: 10, benchmarkRate: 10, estimatedValue: 100 },
      { serviceName: "Higher Value", code: "A", count: 5, benchmarkRate: 40, estimatedValue: 200 },
    ],
  };

  vm.runInContext("ExportService.downloadExcel(summary)", context, { timeout: 1000 });

  const rows = Array.from(Object.entries(exportedSheet)
    .filter(([cell]) => /^[A-F]\d+$/.test(cell))
    .reduce((allRows, [cell, value]) => {
      const [, column, row] = cell.match(/^([A-F])(\d+)$/);
      (allRows[Number(row) - 1] ||= [])[column.charCodeAt(0) - 65] = value.v;
      return allRows;
    }, []), row => row || []);
  const sectionTitles = rows
    .map(row => row[0])
    .filter(title => [
      "Clinic Details",
      "Method Selected",
      "Total Service Counts",
      "Total Estimated Value Provided",
      "Cost and Value Comparison",
      "Services",
      "Sources and References",
    ].includes(title));

  assert.deepEqual(sectionTitles, [
    "Clinic Details",
    "Method Selected",
    "Total Service Counts",
    "Total Estimated Value Provided",
    "Cost and Value Comparison",
    "Services",
    "Sources and References",
  ]);
  sectionTitles.slice(1).forEach(title => {
    const sectionIndex = rows.findIndex(row => row && row[0] === title);
    assert.ok((rows[sectionIndex - 1] || []).every(value => value === undefined));
  });
  const serviceHeaderIndex = rows.findIndex(row => row[0] === "Service");
  assert.deepEqual(rows[serviceHeaderIndex], [
    "Service", "Code", "Units", "Rate", "Value", "Value Share",
  ]);
  assert.deepEqual(rows.slice(serviceHeaderIndex + 1, serviceHeaderIndex + 3).map(row => row[0]), [
    "Higher Value",
    "Lower Value",
  ]);
  assert.equal(exportedSheet["!autofilter"].ref, `A${serviceHeaderIndex + 1}:F${serviceHeaderIndex + 3}`);
  const serviceCountTitleIndex = rows.findIndex(row => row[0] === "Total Service Counts");
  const estimatedValueTitleIndex = rows.findIndex(row => row[0] === "Total Estimated Value Provided");
  const methodTitleIndex = rows.findIndex(row => row[0] === "Method Selected");
  assert.equal(rows[methodTitleIndex][1], "Clinical services");
  assert.equal(rows[serviceCountTitleIndex][1], 15);
  assert.equal(rows[estimatedValueTitleIndex][1], 300);
  assert.equal(exportedSheet[`D${serviceHeaderIndex + 2}`].s.numFmt, "$#,##0.00");
  assert.equal(exportedSheet[`F${serviceHeaderIndex + 2}`].s.numFmt, "0.0%");
  assert.ok(rows.some(row => row[0] === "Reported Clinic Cost" && row[1] === 1000));
  assert.ok(rows.some(row => row[0] === context.AppCopy.summary.costComparisonNote));
  assert.ok(rows.some(row => row[0] === "Reference Organization"));
  assert.equal(rows.at(-1)[0], context.AppCopy.summary.shortDisclaimer());
});

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const exportServiceSource = fs.readFileSync(
  path.join(__dirname, "../js/services/exportService.js"),
  "utf8"
);

function makeSummary(serviceCount) {
  const serviceBreakdown = Array.from({ length: serviceCount }, (_, index) => ({
    serviceName: `Test service ${index + 1}`,
    code: `T${index + 1}`,
    count: 1,
    benchmarkRate: index + 1,
    estimatedValue: index + 1,
  }));
  const clinicalServiceValue = serviceBreakdown.reduce(
    (total, row) => total + row.estimatedValue,
    0
  );

  return {
    clinicName: "Test clinic",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    reportingPeriodFrom: "2026-01-01",
    reportingPeriodTo: "2026-12-31",
    impactMethod: "clinicalServices",
    serviceBreakdown,
    volunteerBreakdown: [],
    totalEstimatedValue: clinicalServiceValue,
    clinicalServiceValue,
    volunteerValue: 0,
    reportingPeriodClinicCost: null,
    mostImpactfulService: null,
    serviceImpactRanking: { byValue: serviceBreakdown },
  };
}

function makeVolunteerSummary(rowCount) {
  const summary = makeSummary(0);
  summary.impactMethod = "volunteerHours";
  summary.volunteerBreakdown = Array.from({ length: rowCount }, (_, index) => ({
    roleName: `Volunteer role ${index + 1}`,
    category: "medical professional",
    hours: 1,
    benchmarkRate: index + 1,
    estimatedValue: index + 1,
  }));
  summary.totalEstimatedValue = summary.volunteerBreakdown.reduce(
    (total, row) => total + row.estimatedValue,
    0
  );
  summary.volunteerValue = summary.totalEstimatedValue;
  return summary;
}

function buildPrintHTML(summary) {
  let html = "";
  const popup = {
    closed: false,
    addEventListener() {},
    document: {
      write(value) {
        html = value;
      },
      close() {},
    },
    focus() {},
    print() {},
  };
  const context = {
    window: {
      open: () => popup,
      focus() {},
    },
    AppCopy: {
      exportCopy: { pdfTitle: "Impact report" },
      summary: {
        emptyState: "No activity.",
        shortDisclaimer: () => "Estimate disclaimer.",
        funderReadyTitle: "Impact statement",
        funderReadyServicesStatement: () => "Service impact statement.",
        funderReadyVolunteerStatement: () => "Volunteer impact statement.",
        costComparisonNote: "Cost comparison qualification.",
      },
      summaryDashboard: {
        reportComplete: "Complete report",
        eyebrow: "Impact summary",
        clinicalServicesKpi: "Services reported",
        volunteerHoursKpi: "Volunteer hours reported",
        reportedActivityNote: "Reported activity",
        donatedTimeNote: "Donated time",
        estimatedServiceValue: "Estimated service value",
        estimatedVolunteerValue: "Estimated volunteer value",
        estimatedCommunityValueKpi: "Estimated value",
        estimatedCommunityValueNote: "Based on reported activity",
        valuePerDollarKpi: "Value per dollar",
      },
      summaryView: {
        methodologyBullets: () => ["First method bullet.", "Second method bullet."],
        methodologySectionTitle: "Methodology",
      },
    },
    getRelevantReferences: () => [],
    VOLUNTEER_RATE_SOURCE: {
      name: "Volunteer rate source",
      description: "Reference rate description.",
    },
    alert() {},
    setTimeout(callback) {
      callback();
    },
  };

  vm.runInNewContext(exportServiceSource, context, {
    filename: "exportService.js",
  });
  context.__summary = summary;
  vm.runInContext("ExportService.downloadPDF(__summary)", context);
  return html;
}

test("chart heading and description are protected with the chart, and table pagination is enabled", () => {
  const html = buildPrintHTML(makeSummary(5));
  const chartSection = html.match(
    /<section class="report-section chart-section">([\s\S]*?)<\/section>/
  );

  assert.ok(chartSection);
  assert.match(chartSection[1], /<h2>Services by estimated value<\/h2>/);
  assert.match(chartSection[1], /<p class="section-intro">/);
  assert.match(chartSection[1], /<div class="chart">/);
  assert.match(html, /\.chart-section,\s*\.source-box, \.callout,[\s\S]*?break-inside: avoid;/);
  assert.match(html, /thead \{ display: table-header-group; \}/);
  assert.doesNotMatch(html, /thead \{ display: table-row-group; \}/);
  assert.match(html, /\.service-breakdown \{ break-before: page; page-break-before: always; \}/);
});

for (const serviceCount of [0, 1, 2, 5, 10, 30]) {
  test(`service table keeps its opening and ending rows together for ${serviceCount} services`, () => {
    const html = buildPrintHTML(makeSummary(serviceCount));
    const table = html.match(
      /<section class="report-section service-breakdown">([\s\S]*?)<\/table>/
    );

    assert.ok(table);
    assert.equal((table[1].match(/Clinical services total/g) || []).length, 1);
    assert.match(table[1], /<tbody class="table-opening/);
    assert.match(table[1], /<tbody class="[^"]*table-ending/);
    const endingGroup = table[1].match(/<tbody class="[^"]*table-ending">([\s\S]*?)<\/tbody>/);
    assert.ok(endingGroup);
    assert.ok(endingGroup[1].indexOf("Clinical services total") >= 0);

    if (serviceCount > 2) {
      assert.match(table[1], /<tbody class="table-opening">[\s\S]*Test service 1[\s\S]*Test service 2[\s\S]*<\/tbody>/);
      assert.ok(endingGroup[1].indexOf(`Test service ${serviceCount}`) < endingGroup[1].indexOf("Clinical services total"));
    } else if (serviceCount > 0) {
      assert.ok(endingGroup[1].indexOf(`Test service ${serviceCount}`) < endingGroup[1].indexOf("Clinical services total"));
    }
  });
}

test("volunteer table keeps the final row with its single total", () => {
  const html = buildPrintHTML(makeVolunteerSummary(5));
  const table = html.match(
    /<section class="report-section">\s*<h2>Volunteer Time<\/h2>([\s\S]*?)<\/table>/
  );

  assert.ok(table);
  assert.match(table[1], /<thead><tr><th scope="col">Role<\/th>/);
  assert.equal((table[1].match(/Total volunteer time value/g) || []).length, 1);
  const endingGroup = table[1].match(/<tbody class="table-ending">([\s\S]*?)<\/tbody>/);
  assert.ok(endingGroup);
  assert.ok(endingGroup[1].indexOf("Volunteer role 5") < endingGroup[1].indexOf("Total volunteer time value"));
});

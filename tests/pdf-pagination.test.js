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
const impactSummaryViewSource = fs.readFileSync(
  path.join(__dirname, "../js/views/ImpactSummaryView.js"),
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
  assert.match(html, /\.chart-section, \.callout,[\s\S]*?break-inside: avoid;/);
  assert.match(html, /thead \{ display: table-header-group; break-after: avoid; page-break-after: avoid; \}/);
  assert.doesNotMatch(html, /thead \{ display: table-row-group; \}/);
  assert.doesNotMatch(html, /\.service-breakdown \{ break-before: page; page-break-before: always; \}/);
});

for (const serviceCount of [0, 1, 2, 5, 10, 30]) {
  test(`service table keeps its opening and ending rows together for ${serviceCount} services`, () => {
    const html = buildPrintHTML(makeSummary(serviceCount));
    const table = html.match(
      /<section class="report-section service-breakdown">([\s\S]*?)<\/table>/
    );

    assert.ok(table);
    assert.ok(table[1].indexOf("<h2>Clinical Services Breakdown</h2>") < table[1].indexOf("<thead>"));
    assert.equal((table[1].match(/Clinical services total/g) || []).length, 1);
    assert.match(table[1], /<tbody class="table-opening/);
    assert.match(table[1], /<tbody class="[^"]*table-ending/);
    const endingGroup = table[1].match(/<tbody class="[^"]*table-ending">([\s\S]*?)<\/tbody>/);
    assert.ok(endingGroup);
    assert.ok(endingGroup[1].indexOf("Clinical services total") >= 0);

    if (serviceCount > 1) {
      const openingGroup = table[1].match(/<tbody class="table-opening">([\s\S]*?)<\/tbody>/);
      assert.ok(openingGroup);
      assert.match(openingGroup[1], /Test service 1/);
      assert.doesNotMatch(openingGroup[1], /Test service 2/);
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

test("volunteer rate source uses normal, unhighlighted report text", () => {
  const html = buildPrintHTML(makeVolunteerSummary(1));
  const sourceSection = html.match(
    /<h2>Volunteer Rate Source<\/h2>([\s\S]*?)<\/section>/
  );

  assert.ok(sourceSection);
  assert.match(sourceSection[1], /<p class="source-attribution">/);
  assert.match(html, /\.source-attribution \{ color: var\(--slate\); \}/);
  assert.match(html, /\.source-attribution strong \{ color: inherit; font-weight: inherit; \}/);
  assert.doesNotMatch(sourceSection[1], /class="source-box"/);
});

test("on-screen volunteer role ranking omits the total row while PDF retains it", () => {
  assert.doesNotMatch(impactSummaryViewSource, /Total volunteer time value/);
  assert.match(exportServiceSource, /Total volunteer time value/);
});

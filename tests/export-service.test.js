"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
let reportHTML = "";
let exportedSheet;
let appendedSheets;
let lastZipFiles;
const zip = {
  loadAsync: async workbook => {
    const lastRow = Math.max(...Object.keys(workbook.chartRows)
      .filter(cell => /^[AB]\d+$/.test(cell)).map(cell =>
      Number(cell.match(/\d+$/)[0])
      ));
    const files = {
      "xl/worksheets/sheet2.xml": `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${Array.from(
        { length: lastRow },
        (_value, index) => `<row r="${index + 1}"/>`
      ).join("")}</sheetData></worksheet>`,
      "[Content_Types].xml": '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>',
    };
    return {
      file: (filePath, content) => {
        if (content !== undefined) {
          files[filePath] = content;
          return this;
        }
        return files[filePath] === undefined
          ? null
          : { async: async () => files[filePath] };
      },
      generateAsync: async () => {
        lastZipFiles = files;
        return new Uint8Array();
      },
    };
  },
};
const copyGroup = new Proxy({}, {
  get: (_target, property) => String(property),
});
const context = vm.createContext({
  AppCopy: {
    exportCopy: { pdfTitle: "Impact report", workbookSummary: "Impact Summary" },
    summary: {
      shortDisclaimer: method => method === "volunteerHours"
        ? "Estimated value is based on reference rates and reported volunteer hours; it represents the replacement value of donated time. This is a planning and communication estimate, not revenue, reimbursement, savings, financial ROI, or a measure of care quality."
        : "Estimated value is based on reference rates and reported service counts. This is a planning and communication estimate, not revenue, reimbursement, savings, financial ROI, or a measure of care quality.",
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
        return sheet;
      },
      encode_cell: ({ r, c }) => `${String.fromCharCode(65 + c)}${r + 1}`,
      book_new: () => {
        appendedSheets = {};
        return { sheets: [] };
      },
      book_append_sheet: (workbook, sheet, name) => {
        workbook.sheets.push({ name, sheet });
        appendedSheets[name] = sheet;
        if (name === "Impact Summary") exportedSheet = sheet;
      },
    },
    write: workbook => {
      const chartSheet = workbook.sheets.find(({ name }) => name === "Activity Chart");
      return chartSheet ? { chartRows: chartSheet.sheet } : new Uint8Array();
    },
  },
  JSZip: zip,
  console,
  alert: message => { throw new Error(message); },
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

test("the volunteer roles table is ranked by reported hours", () => {
  context.summary = {
    impactMethod: "volunteerHours",
    serviceBreakdown: [],
    volunteerBreakdown: [
      { roleName: "Few Hours", category: "non medical", hours: 2, benchmarkRate: 100, estimatedValue: 200 },
      { roleName: "Most Hours", category: "medical professional", hours: 8, benchmarkRate: 10, estimatedValue: 80 },
      { roleName: "Middle Hours", category: "non medical", hours: 5, benchmarkRate: 20, estimatedValue: 100 },
    ],
    reportingPeriodFrom: "2026-01-01",
    reportingPeriodTo: "2026-01-31",
    clinicName: "Test Clinic",
    totalEstimatedValue: 380,
    volunteerValue: 380,
    reportingPeriodClinicCost: null,
  };

  vm.runInContext("ExportService.downloadPDF(summary)", context, { timeout: 1000 });

  const table = reportHTML.match(/<h2>Volunteer Roles \(Ranked By Hours\)<\/h2>[\s\S]*?<table>([\s\S]*?)<\/table>/);
  assert.ok(table);
  const roleNames = Array.from(table[1].matchAll(/<td>([^<]+)<\/td>/g), match => match[1]);
  assert.deepEqual(roleNames, ["Most Hours", "Middle Hours", "Few Hours"]);
});

test("the clinical services breakdown table is ranked by reported counts", () => {
  context.summary = {
    impactMethod: "clinicalServices",
    clinicName: "Test Clinic",
    reportingPeriodFrom: "2026-01-01",
    reportingPeriodTo: "2026-01-31",
    totalEstimatedValue: 360,
    clinicalServiceValue: 360,
    reportingPeriodClinicCost: null,
    serviceBreakdown: [
      { serviceName: "Few Counts", code: "A", count: 4, benchmarkRate: 10, estimatedValue: 40 },
      { serviceName: "Most Counts", code: "B", count: 12, benchmarkRate: 10, estimatedValue: 120 },
      { serviceName: "Middle Counts", code: "C", count: 8, benchmarkRate: 25, estimatedValue: 200 },
    ],
    volunteerBreakdown: [],
  };

  vm.runInContext("ExportService.downloadPDF(summary)", context, { timeout: 1000 });

  const table = reportHTML.match(/<h2>Clinical Services Breakdown \(Ranked by counts\)<\/h2>[\s\S]*?<table>([\s\S]*?)<\/table>/);
  assert.ok(table);
  const serviceNames = Array.from(table[1].matchAll(/<td>([^<]+)<\/td>/g), match => match[1]);
  assert.deepEqual(serviceNames, ["Most Counts", "Middle Counts", "Few Counts"]);
});

test("the volunteer final report shows up to ten roles in its horizontal bars", () => {
  const volunteerBreakdown = Array.from({ length: 12 }, (_value, index) => ({
    roleName: `Role ${index + 1}`,
    category: "non medical",
    hours: index + 1,
    benchmarkRate: 10,
    estimatedValue: (index + 1) * 10,
  }));
  const totalEstimatedValue = volunteerBreakdown.reduce((sum, role) => sum + role.estimatedValue, 0);
  context.summary = {
    impactMethod: "volunteerHours",
    serviceBreakdown: [],
    volunteerBreakdown,
    reportingPeriodFrom: "2026-01-01",
    reportingPeriodTo: "2026-01-31",
    clinicName: "Test Clinic",
    totalEstimatedValue,
    volunteerValue: totalEstimatedValue,
    reportingPeriodClinicCost: null,
  };

  vm.runInContext("ExportService.downloadPDF(summary)", context, { timeout: 1000 });

  assert.match(reportHTML, /Top ten volunteer roles by estimated value/);
  assert.equal((reportHTML.match(/<div class="chart-row">/g) || []).length, 10);
  assert.match(reportHTML, /Role 10/);
  assert.doesNotMatch(reportHTML, /Role 11|Role 12/);
});

test("clinical services Excel export includes an editable activity pie chart", async () => {
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
      { serviceName: "Lower Value", serviceDescription: "Lower value description", code: "B", count: 8, benchmarkRate: 6.25, estimatedValue: 50 },
      { serviceName: "Higher Value", serviceDescription: "Higher value description", code: "A", count: 100, benchmarkRate: 2, estimatedValue: 200 },
      { serviceName: "Minor Two", serviceDescription: "Minor two description", code: "C", count: 7, benchmarkRate: 3.57, estimatedValue: 25 },
      { serviceName: "Minor One", serviceDescription: "Minor one description", code: "D", count: 5, benchmarkRate: 5, estimatedValue: 25 },
    ],
  };

  await vm.runInContext("ExportService.downloadExcel(summary)", context, { timeout: 1000 });

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
  assert.deepEqual(rows.slice(serviceHeaderIndex + 1, serviceHeaderIndex + 5).map(row => row[0]), [
    "Higher Value",
    "Lower Value",
    "Minor Two",
    "Minor One",
  ]);
  assert.equal(exportedSheet["!autofilter"].ref, `A${serviceHeaderIndex + 1}:F${serviceHeaderIndex + 5}`);
  const serviceCountTitleIndex = rows.findIndex(row => row[0] === "Total Service Counts");
  const estimatedValueTitleIndex = rows.findIndex(row => row[0] === "Total Estimated Value Provided");
  const methodTitleIndex = rows.findIndex(row => row[0] === "Method Selected");
  assert.equal(rows[methodTitleIndex][1], "Clinical services");
  assert.equal(rows[serviceCountTitleIndex][1], 120);
  assert.equal(rows[estimatedValueTitleIndex][1], 300);
  assert.equal(exportedSheet[`D${serviceHeaderIndex + 2}`].s.numFmt, "$#,##0.00");
  assert.equal(exportedSheet[`F${serviceHeaderIndex + 2}`].s.numFmt, "0.0%");
  assert.equal(exportedSheet[`A${serviceHeaderIndex + 2}`].v, "Higher Value");
  assert.ok(rows.some(row => row[0] === "Reported Clinic Cost" && row[1] === 1000));
  assert.ok(rows.some(row => row[0] === context.AppCopy.summary.costComparisonNote));
  assert.ok(rows.some(row => row[0] === "Reference Organization"));
  assert.equal(rows.at(-1)[0], context.AppCopy.summary.shortDisclaimer());
  assert.match(lastZipFiles["xl/charts/chart1.xml"], /CLINICAL SERVICES BY COUNT/);
  assert.match(lastZipFiles["xl/charts/chart1.xml"], /'Activity Chart'!\$A\$2:\$A\$4/);
  assert.match(lastZipFiles["xl/charts/chart1.xml"], /'Activity Chart'!\$B\$2:\$B\$4/);
  assert.match(lastZipFiles["xl/charts/chart1.xml"], /<c:showLeaderLines val="1"\/><c:dLblPos val="outEnd"\/>/);
  assert.match(lastZipFiles["xl/charts/chart1.xml"], /<c:showSerName val="0"\/>/);
  assert.match(lastZipFiles["xl/charts/chart1.xml"], /<c:showPercent val="1"\/>/);
  assert.doesNotMatch(lastZipFiles["xl/charts/chart1.xml"], /<c:legend>/);
  assert.match(lastZipFiles["xl/worksheets/sheet2.xml"], /<drawing r:id="rId1"\/>/);
  assert.equal(appendedSheets["Activity Chart"].A2.v, "Higher value description");
  assert.equal(appendedSheets["Activity Chart"].B2.v, 100);
  assert.equal(appendedSheets["Activity Chart"].A3.v, "Lower value description");
  assert.equal(appendedSheets["Activity Chart"].B3.v, 8);
  assert.equal(appendedSheets["Activity Chart"].A4.v, "Other");
  assert.equal(appendedSheets["Activity Chart"].B4.v, 12);
  assert.match(lastZipFiles["xl/charts/chart1.xml"], /<c:dPt><c:idx val="2"\/><c:spPr><a:solidFill><a:srgbClr val="B8B8B8"\/><\/a:solidFill>/);
});

test("volunteer Excel export includes hours by role in its activity pie chart", async () => {
  context.summary = {
    impactMethod: "volunteerHours",
    clinicName: "Test Clinic",
    streetAddress: "1 Main Street",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    reportingPeriodFrom: "2026-01-01",
    reportingPeriodTo: "2026-01-31",
    reportingPeriodClinicCost: null,
    valueToCostRatio: null,
    volunteerValue: 100,
    medicalProfessionalVolunteerValue: 0,
    nonMedicalVolunteerValue: 100,
    volunteerBreakdown: [
      { roleName: "Unused Medical Role", category: "medical professional", hours: 0, benchmarkRate: 50, estimatedValue: 0 },
      { roleName: "Active Non-Medical Role", category: "non medical", hours: 4, benchmarkRate: 25, estimatedValue: 100 },
    ],
  };

  await vm.runInContext("ExportService.downloadExcel(summary)", context, { timeout: 1000 });

  const rows = Array.from(Object.entries(exportedSheet)
    .filter(([cell]) => /^[A-F]\d+$/.test(cell))
    .reduce((allRows, [cell, value]) => {
      const [, column, row] = cell.match(/^([A-F])(\d+)$/);
      (allRows[Number(row) - 1] ||= [])[column.charCodeAt(0) - 65] = value.v;
      return allRows;
    }, []), row => row || []);
  const expectedSections = [
    "Clinic Details",
    "Method Selected",
    "Volunteer Hours Breakdown",
    "Total Estimated Value Provided",
    "Cost and Value Comparison",
    "Volunteer Roles",
    "Sources and References",
  ];
  assert.deepEqual(rows.map(row => row[0]).filter(title => expectedSections.includes(title)), expectedSections);
  expectedSections.slice(1).forEach(title => {
    const sectionIndex = rows.findIndex(row => row[0] === title);
    assert.ok(rows[sectionIndex - 1].every(value => value === undefined));
  });
  const methodRow = rows.find(row => row[0] === "Method Selected");
  assert.equal(methodRow[1], "Volunteer hours");

  const medicalHoursRow = rows.find(row => row[0] === "Medical Professional Volunteer Hours");
  const nonMedicalHoursRow = rows.find(row => row[0] === "Non-Medical Volunteer Hours");
  const medicalValueRow = rows.find(row => row[0] === "Medical Professional Volunteer Value");
  const nonMedicalValueRow = rows.find(row => row[0] === "Non-Medical Volunteer Value");
  assert.equal(medicalHoursRow[1], "-");
  assert.equal(nonMedicalHoursRow[1], 4);
  assert.equal(medicalValueRow[1], "-");
  assert.equal(nonMedicalValueRow[1], 100);
  assert.ok(rows.some(row => row[0] === "Total Volunteer Hours" && row[1] === 4));
  assert.ok(rows.some(row => row[0] === "Total Estimated Value" && row[1] === 100));

  const rolesHeaderIndex = rows.findIndex(row => row[0] === "Role");
  assert.deepEqual(rows[rolesHeaderIndex], [
    "Role", "Type", "Hours", "Rate", "Value", "Value Share",
  ]);
  assert.deepEqual(rows.slice(rolesHeaderIndex + 1, rolesHeaderIndex + 2).map(row => row[0]), [
    "Active Non-Medical Role",
  ]);
  assert.equal(exportedSheet["!autofilter"].ref, `A${rolesHeaderIndex + 1}:F${rolesHeaderIndex + 2}`);
  assert.ok(rows.some(row => row[0] === context.AppCopy.summary.costComparisonNote));
  assert.ok(rows.some(row => row[0] === "Reference Organization"));
  assert.equal(rows.at(-1)[0], context.AppCopy.summary.shortDisclaimer("volunteerHours"));
  assert.match(lastZipFiles["xl/charts/chart1.xml"], /VOLUNTEER HOURS BY ROLE/);
  assert.equal(lastZipFiles["xl/worksheets/sheet2.xml"].match(/<drawing\b/g)?.length, 1);
  assert.equal(appendedSheets["Activity Chart"].A2.v, "Active Non-Medical Role");
  assert.equal(appendedSheets["Activity Chart"].B2.v, 4);
  assert.equal(appendedSheets["Activity Chart"].A3, undefined);
});

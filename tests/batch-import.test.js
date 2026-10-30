"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, "js/data.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(root, "js/calculator.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(root, "js/services/batchImportService.js"), "utf8"), context);
const service = vm.runInContext("BatchImportService", context);
const calculator = vm.runInContext("Calculator", context);

test("parses BOM, blank lines, CRLF, quoted CSV fields, and combines duplicate volunteer IDs", () => {
  const result = service.parse(
    "\uFEFFROLE_ID, HOURS\r\n\r\n\"general-volunteer\",1\r\n\"general-volunteer\",1.5\r\n",
    "hours.CSV",
    "volunteerHours"
  );
  assert.equal(result.valid, true);
  assert.equal(result.sourceRowCount, 2);
  assert.equal(result.entries.length, 1);
  assert.equal(result.entries[0].id, "general-volunteer");
  assert.equal(result.entries[0].quantity, 2.5);
  assert.equal(result.duplicateRowsCombined, 1);
  assert.equal(result.totalQuantity, 2.5);

  const importedState = service.toCalculatorState({
    name: "Clinic",
    streetAddress: "1 Main St",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    reportingPeriodFrom: "2026-01-01",
    reportingPeriodTo: "2026-12-31",
    reportingPeriodClinicCost: "",
  }, "volunteerHours", result.entries);
  const manualState = {
    ...importedState,
    volunteers: [{ roleId: "general-volunteer", hours: 2.5 }],
  };
  assert.equal(
    calculator.computeImpact(importedState).totalEstimatedValue,
    calculator.computeImpact(manualState).totalEstimatedValue
  );
});

test("parses tab-separated service TXT and adapts imported entries to calculator state", () => {
  const result = service.parse(
    "service_id\tcount\n1119811\t25\n1119822\t5\n",
    "services.txt",
    "clinicalServices"
  );
  assert.equal(result.valid, true);
  const clinic = {
    name: "Clinic",
    streetAddress: "1 Main St",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    reportingPeriodFrom: "2026-01-01",
    reportingPeriodTo: "2026-12-31",
    reportingPeriodClinicCost: "",
  };
  const importedState = service.toCalculatorState(clinic, "clinicalServices", result.entries);
  const manualState = {
    ...importedState,
    services: [
      { serviceId: "1119811", count: 25 },
      { serviceId: "1119822", count: 5 },
    ],
  };
  const importedSummary = calculator.computeImpact(importedState);
  const manualSummary = calculator.computeImpact(manualState);
  assert.equal(importedSummary.totalEstimatedValue, manualSummary.totalEstimatedValue);
  assert.deepEqual(
    Array.from(importedSummary.serviceBreakdown, row => [row.serviceId, row.count, row.estimatedValue]),
    Array.from(manualSummary.serviceBreakdown, row => [row.serviceId, row.count, row.estimatedValue])
  );
});

test("parses the first worksheet of an XLSX workbook through the same validations", () => {
  const firstSheet = { A1: { v: "role_id" }, B1: { v: "hours" } };
  const secondSheet = { A1: { v: "not-used" } };
  const workbook = {
    SheetNames: ["Activity", "Other"],
    Sheets: { Activity: firstSheet, Other: secondSheet },
  };
  let readOptions;
  context.XLSX = {
    read: (contents, options) => {
      assert.equal(contents.byteLength, 4);
      readOptions = options;
      return workbook;
    },
    utils: {
      sheet_to_json: (sheet, options) => {
        assert.equal(sheet, firstSheet);
        assert.equal(options.header, 1);
        assert.equal(options.raw, true);
        return [
          ["ROLE_ID", "hours"],
          ["general-volunteer", 2.5],
          ["general-volunteer", 1],
        ];
      },
    },
  };

  const result = service.parseXlsx(new ArrayBuffer(4), "clinic.xlsx", "volunteerHours");
  assert.equal(readOptions.type, "array");
  assert.equal(result.fileName, "clinic.xlsx");
  assert.equal(result.valid, true);
  assert.equal(result.sourceRowCount, 2);
  assert.equal(result.entries[0].quantity, 3.5);
  assert.equal(result.duplicateRowsCombined, 1);
});

test("rejects formulas and reports unavailable spreadsheet support clearly", () => {
  context.XLSX = {
    read: () => ({
      SheetNames: ["Activity"],
      Sheets: { Activity: { A1: { v: "role_id" }, B1: { v: "hours" }, B2: { f: "1+2", v: 3 } } },
    }),
    utils: { sheet_to_json: () => assert.fail("Formula workbook must not be converted") },
  };
  const formulaResult = service.parseXlsx(new ArrayBuffer(1), "formula.xlsx", "volunteerHours");
  assert.equal(formulaResult.valid, false);
  assert.match(formulaResult.errors[0], /cell B2.*Replace formulas/i);

  context.XLSX = undefined;
  const unavailable = service.parseXlsx(new ArrayBuffer(1), "clinic.xlsx", "clinicalServices");
  assert.equal(unavailable.valid, false);
  assert.match(unavailable.errors[0], /spreadsheet library did not load/i);
});

test("generates templates from the active live catalogs", () => {
  for (const [method, header, sampleId] of [
    ["volunteerHours", "role_id", "general-volunteer"],
    ["clinicalServices", "service_id", "1119811"],
  ]) {
    const template = service.createTemplate(method);
    const lines = template.trim().split(/\r?\n/);
    assert.equal(lines[0].split(",")[0].replaceAll('"', ""), header);
    const catalogIds = Array.from(service.getCatalog(method), item => item.id);
    const templateIds = lines.slice(1).map(line => line.split(",")[0].replaceAll('"', ""));
    assert.deepEqual(templateIds, catalogIds);
    assert.ok(template.includes(sampleId));
    assert.ok(service.createReferenceCSV(method).includes("display_name"));
  }
});

test("rejects malformed headers, unknown IDs, invalid numbers, and all-zero data", () => {
  const cases = [
    ["role_id,other\n", "unsupported column"],
    ["role_id,role_id\n", "duplicate column"],
    ["role_id,hours\nunknown-role,1\n", "unknown role_id"],
    ["role_id,hours\ngeneral-volunteer,\n", "blank values"],
    ["role_id,hours\ngeneral-volunteer,1x\n", "complete numeric"],
    ["role_id,hours\ngeneral-volunteer,Infinity\n", "finite number"],
    ["role_id,hours\ngeneral-volunteer,NaN\n", "finite number"],
    ["role_id,hours\ngeneral-volunteer,-1\n", "cannot be negative"],
    ["role_id,hours\ngeneral-volunteer,1.25\n", "half-hour increments"],
    ["role_id,hours\ngeneral-volunteer,0\n", "greater than zero"],
  ];
  for (const [contents, expected] of cases) {
    const result = service.parse(contents, "bad.csv", "volunteerHours");
    assert.equal(result.valid, false, contents);
    assert.ok(result.errors.some(message => message.toLowerCase().includes(expected.toLowerCase())), result.errors.join("\n"));
  }
});

test("rejects fractional counts, broken quoting, unsupported formats, and extra fields", () => {
  const cases = [
    ["service_id,count\n1119811,1.5\n", "whole numbers"],
    ["service_id,count\n1119811,1e2\n", "complete numeric"],
    ["service_id,count\n1119811,\"2\n", "not closed"],
    ["service_id,count\n1119811,2,extra\n", "exactly 2 columns"],
  ];
  for (const [contents, expected] of cases) {
    const result = service.parse(contents, "services.csv", "clinicalServices");
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(message => message.toLowerCase().includes(expected.toLowerCase())), result.errors.join("\n"));
  }
  assert.match(service.parse("role_id\thours\n", "wrong.json", "volunteerHours").errors[0], /\.csv or tab-separated \.txt/);
  const escapedQuote = service.parse('role_id,hours\n"general""-volunteer",1\n', "escaped.csv", "volunteerHours");
  assert.ok(escapedQuote.errors.some(message => /unknown role_id/.test(message)));
});

test("enforces file row limits and numeric aggregation range", () => {
  const limits = service.getLimits();
  assert.equal(limits.maxFileBytes, 5 * 1024 * 1024);
  assert.equal(limits.maxDataRows, 10000);
  const tooManyRows = `role_id,hours\n${"general-volunteer,0\n".repeat(limits.maxDataRows + 1)}`;
  const limited = service.parse(tooManyRows, "many.csv", "volunteerHours");
  assert.equal(limited.valid, false);
  assert.match(limited.errors[0], /limit is 10,000 rows/);

  const overflow = service.parse(
    `service_id,count\n1119811,${"9".repeat(308)}\n1119811,${"9".repeat(308)}\n`,
    "overflow.csv",
    "clinicalServices"
  );
  assert.equal(overflow.valid, false);
  assert.ok(overflow.errors.some(message => /supported numeric range/.test(message)));
});

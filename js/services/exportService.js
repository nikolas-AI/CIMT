/**
 * exportService.js — Export service
 *
 * Provides PDF and Excel download interfaces.
 * The Excel export uses xlsx-js-style to generate a real XLSX workbook with
 * basic formatting such as bold titles, headers, and section labels.
 *
 * The PDF path uses the browser print dialog, while the Excel path creates
 * XLSX bytes directly in the browser.
 */

"use strict";

const ExportService = (() => {

  /**
   * Download a PDF summary of the impact report.
   * @param {ImpactSummary} summary
   */
  function downloadPDF(summary) {
    // The browser's print dialog creates the PDF. The generated page contains
    // the same report details, references, and links the user sees in the app.
    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow pop-up windows to download the PDF summary.");
      return;
    }
    win.addEventListener("pagehide", () => window.focus(), { once: true });
    win.document.write(_buildPrintHTML(summary));
    win.document.close();
    win.focus();
    setTimeout(() => {
      if (!win.closed) win.print();
    }, 500);
  }

  /**
  * Download an Excel-formatted breakdown of the impact data.
   * @param {ImpactSummary} summary
   */
  function downloadExcel(summary) {
    if (typeof XLSX === "undefined") {
      alert("The Excel download could not be prepared. Check your internet connection and try again.");
      return;
    }
    if (summary.impactMethod === "clinicalServices") {
      return _downloadClinicalServicesExcel(summary);
    }
    if (summary.impactMethod === "volunteerHours") {
      return _downloadVolunteerExcel(summary);
    }

    const rows = [
      [AppCopy.exportCopy.pdfTitle],
      ["Clinic", summary.clinicName],
      ["Street Address", summary.streetAddress],
      ["City", summary.city],
      ["State", summary.state],
      ["ZIP Code", summary.zipCode],
      ["Reporting Period From", summary.reportingPeriodFrom],
      ["Reporting Period To", summary.reportingPeriodTo],
      ["Calculation Option", _methodLabel(summary.impactMethod)],
    ];
    const totalEstimatedValueRow = rows.length;
    rows.push([AppCopy.exportCopy.labels.total, summary.totalEstimatedValue]);
    const disclaimerRow = rows.length;
    rows.push([AppCopy.summary.shortDisclaimer(summary.impactMethod)]);
    rows.push([summary.impactMethod === "volunteerHours" ? "Reported Volunteer Hours" : "Reported Clinical Services",
      summary.impactMethod === "volunteerHours"
        ? summary.volunteerBreakdown.reduce((sum, row) => sum + row.hours, 0)
        : summary.serviceBreakdown.reduce((sum, row) => sum + row.count, 0)]);
    rows.push(["Estimate Basis", summary.impactMethod === "volunteerHours"
      ? "Reported volunteer hours multiplied by role-specific hourly benchmarks"
      : "Reported clinical service units multiplied by public clinical reference rates"]);
    const rateDataSectionRow = rows.length;
    rows.push(["Rate Data Sources"]);
    getRelevantReferences(summary.impactMethod).forEach(ref => {
      rows.push([ref.organization, ref.ratePeriod, ref.title, ref.url]);
    });
    if (summary.impactMethod === "volunteerHours") {
      rows.push(["Medical Professional Volunteer Value", summary.medicalProfessionalVolunteerValue]);
      rows.push(["Non-Medical Volunteer Value", summary.nonMedicalVolunteerValue]);
    }
    rows.push([]);
    let budgetSectionRow = null;
    let budgetRows = [];
    if (summary.reportingPeriodClinicCost !== null) {
      budgetSectionRow = rows.length;
      rows.push(["Clinic Cost and Estimated Value"]);
      budgetRows = [
        ["Reported Clinic Cost", summary.reportingPeriodClinicCost],
        ["Reporting Period Days", summary.reportingPeriodDays],
        [AppCopy.exportCopy.labels.total, summary.totalEstimatedValue],
        ["Estimated Value per $1 of Reported Clinic Cost", summary.valueToCostRatio],
        ["Estimated Value as a Share of Reported Clinic Cost (%)", summary.reportingPeriodClinicCost > 0
          ? summary.totalEstimatedValue / summary.reportingPeriodClinicCost * 100
          : null],
      ];
      rows.push(...budgetRows);
      rows.push(["Cost Note", AppCopy.summary.costComparisonNote]);
      rows.push([]);
    }
    let valueRankingSectionRow = null;
    let valueRankingHeaderRow = null;
    let valueRankingEndRow = null;
    let visitRankingSectionRow = null;
    let visitRankingHeaderRow = null;
    let visitRankingEndRow = null;
    if (summary.impactMethod === "clinicalServices") {
      rows.push([]);
      valueRankingSectionRow = rows.length;
      rows.push(["Services by Estimated Value"]);
      valueRankingHeaderRow = rows.length;
      rows.push(["Rank", "Service", "Number Reported", "Estimated Value", "Share of Total Estimated Service Value"]);
      rows.push(...(summary.serviceImpactRanking?.byValue || []).map((row, index) => [
        index + 1, row.serviceName, row.count, row.estimatedValue, row.clinicalValueShare / 100,
      ]));
      valueRankingEndRow = rows.length;
      rows.push([]);
      visitRankingSectionRow = rows.length;
      rows.push(["Services by Number Reported"]);
      visitRankingHeaderRow = rows.length;
      rows.push(["Rank", "Service", "Number Reported", "Estimated Value", "Share of Total Estimated Service Value"]);
      rows.push(...(summary.serviceImpactRanking?.byVisits || []).map((row, index) => [
        index + 1, row.serviceName, row.count, row.estimatedValue, row.clinicalValueShare / 100,
      ]));
      visitRankingEndRow = rows.length;
    }
    rows.push([]);
    let clinicalSectionRow = null;
    let clinicalHeaderRow = null;
    let clinicalTotalRow = null;
    if (summary.impactMethod === "clinicalServices") {
      clinicalSectionRow = rows.length;
      rows.push(["Clinical Services"]);
      clinicalHeaderRow = rows.length;
      rows.push(["Service", "Service Code", "Number Reported", "Reference Rate", "Estimated Value"]);
      rows.push(...summary.serviceBreakdown.filter(row => row.count > 0).map(row => [
          row.serviceName, row.code, row.count, row.benchmarkRate, row.estimatedValue,
        ]));
      clinicalTotalRow = rows.length;
      rows.push(["", "", "", "Clinical Services Total", summary.clinicalServiceValue]);
    }
    rows.push([]);
    let volunteerSectionRow = null;
    let volunteerHeaderRow = null;
    let volunteerTotalRow = null;
    if (summary.impactMethod === "volunteerHours") {
      volunteerSectionRow = rows.length;
      rows.push(["Volunteer Time"]);
      volunteerHeaderRow = rows.length;
      rows.push(["Role", "Type", "Volunteer Hours", "Reference Rate / Hour", "Estimated Value of Volunteer Time"]);
      rows.push(...summary.volunteerBreakdown.map(row => [
          row.roleName, row.category, row.hours, row.benchmarkRate, row.estimatedValue,
        ]));
      volunteerTotalRow = rows.length;
      rows.push(["", "", "", "Total Volunteer Time Value", summary.volunteerValue]);
    }
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!rows"] = rows.map((_, index) => ({ hpx: index === 0 ? 28 : 18 }));
    sheet["!autofilter"] = { ref: `A1:E${rows.length}` };
    sheet["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft", frozen: true };

    const serviceImpactSectionRow = summary.impactMethod === "clinicalServices"
      ? rows.findIndex(row => row[0] === "Service with the Highest Estimated Value")
      : null;

    const mergeRows = [
      0,
      ...(budgetSectionRow === null ? [] : [budgetSectionRow]),
      rateDataSectionRow,
      ...(serviceImpactSectionRow !== null && serviceImpactSectionRow >= 0 ? [serviceImpactSectionRow] : []),
      ...(valueRankingSectionRow === null ? [] : [valueRankingSectionRow]),
      ...(visitRankingSectionRow === null ? [] : [visitRankingSectionRow]),
      ...(clinicalSectionRow === null ? [] : [clinicalSectionRow]),
      ...(volunteerSectionRow === null ? [] : [volunteerSectionRow]),
      disclaimerRow,
    ].filter((row) => Number.isInteger(row) && row >= 0);
    sheet["!merges"] = mergeRows.map(row => ({ s: { r: row, c: 0 }, e: { r: row, c: 4 } }));

    const mergedRowSet = new Set(mergeRows);
    sheet["!cols"] = [0, 1, 2, 3, 4].map(columnIndex => {
      const maxLength = rows.reduce((max, row, rowIndex) => {
        if (mergedRowSet.has(rowIndex)) return max;
        const value = row[columnIndex];
        return value === null || value === undefined
          ? max
          : Math.max(max, String(value).length);
      }, 0);
      return { wch: Math.min(Math.max(maxLength + 2, 12), 48) };
    });

    const disclaimerText = String(rows[disclaimerRow][0] || "");
    const disclaimerWidth = sheet["!cols"].reduce((width, column) => width + column.wch, 0);
    const disclaimerLineCount = Math.max(2, Math.ceil(disclaimerText.length / disclaimerWidth));
    sheet["!rows"][disclaimerRow] = { hpx: disclaimerLineCount * 18 };

    const boldRows = [
      0,
      rateDataSectionRow,
      ...(serviceImpactSectionRow !== null && serviceImpactSectionRow >= 0 ? [serviceImpactSectionRow] : []),
      ...(valueRankingSectionRow === null ? [] : [valueRankingSectionRow, valueRankingHeaderRow]),
      ...(visitRankingSectionRow === null ? [] : [visitRankingSectionRow, visitRankingHeaderRow]),
      ...(clinicalSectionRow === null ? [] : [clinicalSectionRow]),
      ...(clinicalHeaderRow === null ? [] : [clinicalHeaderRow, clinicalTotalRow]),
      ...(volunteerSectionRow === null ? [] : [volunteerSectionRow, volunteerHeaderRow, volunteerTotalRow]),
    ].filter((row) => Number.isInteger(row) && row >= 0);
    if (budgetSectionRow !== null) boldRows.push(budgetSectionRow);

    const styleRow = (rowIndex, style) => {
      for (let columnIndex = 0; columnIndex < 5; columnIndex += 1) {
        const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })];
        if (cell) cell.s = { ...(cell.s || {}), ...style };
      }
    };

    const sectionStyle = { font: { bold: true }, fill: { fgColor: { rgb: "D9EAF7" } }, alignment: { vertical: "center", wrapText: false, horizontal: "left" } };
    const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "EAF2F8" } }, border: { top: { style: "thin", color: { rgb: "D0D7DE" } }, bottom: { style: "thin", color: { rgb: "D0D7DE" } }, left: { style: "thin", color: { rgb: "D0D7DE" } }, right: { style: "thin", color: { rgb: "D0D7DE" } } }, alignment: { vertical: "center", wrapText: false, horizontal: "left" } };

    boldRows.forEach(rowIndex => styleRow(rowIndex, sectionStyle));

    const headerRows = [
      ...(valueRankingHeaderRow === null ? [] : [valueRankingHeaderRow]),
      ...(visitRankingHeaderRow === null ? [] : [visitRankingHeaderRow]),
      ...(clinicalHeaderRow === null ? [] : [clinicalHeaderRow]),
      ...(volunteerHeaderRow === null ? [] : [volunteerHeaderRow]),
    ].filter((row) => Number.isInteger(row) && row >= 0);
    headerRows.forEach(rowIndex => styleRow(rowIndex, headerStyle));

    [volunteerHeaderRow, volunteerTotalRow].filter((row) => Number.isInteger(row) && row >= 0).forEach(rowIndex => {
      if (!sheet["!rows"]) sheet["!rows"] = [];
      sheet["!rows"][rowIndex] = { hpx: 24 };
      for (let columnIndex = 0; columnIndex < 5; columnIndex += 1) {
        const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })];
        if (!cell) continue;
        cell.s = {
          ...(cell.s || {}),
          alignment: {
            ...(cell.s && cell.s.alignment ? cell.s.alignment : {}),
            wrapText: false,
            vertical: "center",
            horizontal: columnIndex === 0 ? "left" : "right",
          },
        };
      }
    });

    [1, 2, 3, 4].forEach(rowIndex => {
      const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })];
      if (cell) cell.s = { ...(cell.s || {}), font: { bold: true } };
    });
    if (sheet["A1"]) {
      sheet["A1"].s = { font: { bold: true, sz: 16 }, fill: { fgColor: { rgb: "EAF2F8" } }, alignment: { horizontal: "left", vertical: "center" } };
    }
    if (sheet[XLSX.utils.encode_cell({ r: disclaimerRow, c: 0 })]) {
      sheet[XLSX.utils.encode_cell({ r: disclaimerRow, c: 0 })].s = {
        font: { italic: true, color: { rgb: "475C8A" } },
        alignment: { wrapText: true },
      };
    }

    // Keep monetary cells numeric for Excel calculations while displaying them
    // with a dollar sign and two decimal places in the downloaded workbook.
    const currencyFormat = "$#,##0.00";
    const formatCurrency = (rowIndex, columnIndex) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })];
      if (cell) {
        cell.s = { ...(cell.s || {}), numFmt: currencyFormat };
      }
    };
    formatCurrency(totalEstimatedValueRow, 1);
    if (budgetSectionRow !== null) {
      formatCurrency(budgetSectionRow + 1, 1);
      formatCurrency(budgetSectionRow + 3, 1);
    }
    for (const [headerRow, endRow] of [
      ...(valueRankingHeaderRow === null ? [] : [[valueRankingHeaderRow, valueRankingEndRow]]),
      ...(visitRankingHeaderRow === null ? [] : [[visitRankingHeaderRow, visitRankingEndRow]]),
    ]) {
      for (let rowIndex = headerRow + 1; rowIndex < endRow; rowIndex += 1) {
        formatCurrency(rowIndex, 3);
      }
    }
    if (clinicalHeaderRow !== null) {
      for (let rowIndex = clinicalHeaderRow + 1; rowIndex < clinicalTotalRow; rowIndex += 1) {
        formatCurrency(rowIndex, 3);
        formatCurrency(rowIndex, 4);
      }
      formatCurrency(clinicalTotalRow, 4);
    }
    if (volunteerHeaderRow !== null) {
      for (let rowIndex = volunteerHeaderRow + 1; rowIndex < volunteerTotalRow; rowIndex += 1) {
        formatCurrency(rowIndex, 2);
        formatCurrency(rowIndex, 3);
        formatCurrency(rowIndex, 4);
      }
      formatCurrency(volunteerTotalRow, 4);
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, AppCopy.exportCopy.workbookSummary);
    return _downloadWorkbook(workbook, summary, false);
  }

  function _downloadVolunteerExcel(summary) {
    const volunteerHours = summary.volunteerBreakdown.reduce((sum, row) => sum + row.hours, 0);
    const medicalHours = summary.volunteerBreakdown
      .filter(row => row.category === "medical professional")
      .reduce((sum, row) => sum + row.hours, 0);
    const nonMedicalHours = summary.volunteerBreakdown
      .filter(row => row.category === "non medical")
      .reduce((sum, row) => sum + row.hours, 0);
    const roles = summary.volunteerBreakdown
      .filter(row => row.hours > 0)
      .slice()
      .sort((a, b) =>
        b.estimatedValue - a.estimatedValue ||
        b.hours - a.hours ||
        a.roleName.localeCompare(b.roleName)
      );
    const rows = [];
    const sectionRows = [];
    const summaryLabelRows = [];
    const boldRows = [];
    const currencyCells = [];
    const percentageCells = [];
    const addSection = title => {
      if (rows.length > 0) rows.push([]);
      const row = rows.length;
      rows.push([title]);
      sectionRows.push(row);
      return row;
    };
    const addSummaryRow = (label, value) => {
      if (rows.length > 0) rows.push([]);
      const row = rows.length;
      rows.push([label, value]);
      summaryLabelRows.push(row);
    };
    const nonzeroOrDash = value => value > 0 ? value : "-";

    const clinicDetailsRow = addSection("Clinic Details");
    rows.push(["Clinic Name", summary.clinicName]);
    rows.push(["Street Address", summary.streetAddress]);
    rows.push(["City", summary.city]);
    rows.push(["State", summary.state]);
    rows.push(["ZIP Code", summary.zipCode]);
    rows.push(["Reporting Period From", summary.reportingPeriodFrom]);
    rows.push(["Reporting Period To", summary.reportingPeriodTo]);

    addSummaryRow("Method Selected", "Volunteer hours");

    const hoursSectionRow = addSection("Volunteer Hours Breakdown");
    const hoursDataStartRow = rows.length;
    rows.push(["Medical Professional Volunteer Hours", nonzeroOrDash(medicalHours)]);
    rows.push(["Non-Medical Volunteer Hours", nonzeroOrDash(nonMedicalHours)]);
    rows.push(["Total Volunteer Hours", volunteerHours]);
    const hoursTotalRow = rows.length - 1;

    const valueSectionRow = addSection("Total Estimated Value Provided");
    const valueDataStartRow = rows.length;
    rows.push(["Medical Professional Volunteer Value", nonzeroOrDash(summary.medicalProfessionalVolunteerValue)]);
    rows.push(["Non-Medical Volunteer Value", nonzeroOrDash(summary.nonMedicalVolunteerValue)]);
    rows.push(["Total Estimated Value", summary.volunteerValue]);
    const valueTotalRow = rows.length - 1;
    currencyCells.push([valueDataStartRow, 1], [valueDataStartRow + 1, 1], [valueTotalRow, 1]);

    const costSectionRow = addSection("Cost and Value Comparison");
    const costRow = rows.length;
    rows.push([
      "Reported Clinic Cost",
      summary.reportingPeriodClinicCost === null ? "Not reported" : summary.reportingPeriodClinicCost,
    ]);
    rows.push(["Estimated Value of Volunteer Time", summary.volunteerValue]);
    currencyCells.push([costRow, 1], [costRow + 1, 1]);
    rows.push([
      "Estimated Value per $1 of Reported Clinic Cost",
      summary.valueToCostRatio === null ? "Not available" : summary.valueToCostRatio,
    ]);
    currencyCells.push([costRow + 2, 1]);
    rows.push([
      "Estimated Value as a Share of Reported Clinic Cost",
      summary.reportingPeriodClinicCost > 0
        ? summary.volunteerValue / summary.reportingPeriodClinicCost
        : "Not available",
    ]);
    percentageCells.push([costRow + 3, 1]);
    const costNoteRow = rows.length;
    rows.push([AppCopy.summary.costComparisonNote]);

    const rolesSectionRow = addSection("Volunteer Roles");
    const rolesHeaderRow = rows.length;
    rows.push(["Role", "Type", "Hours", "Rate", "Value", "Value Share"]);
    const rolesDataStartRow = rows.length;
    rows.push(...roles.map(row => [
      row.roleName,
      row.category,
      row.hours,
      row.benchmarkRate,
      row.estimatedValue,
      summary.volunteerValue > 0 ? row.estimatedValue / summary.volunteerValue : 0,
    ]));
    const rolesTotalRow = rows.length;
    rows.push([
      "Total",
      "",
      volunteerHours,
      "",
      summary.volunteerValue,
      summary.volunteerValue > 0 ? 1 : 0,
    ]);

    addSection("Sources and References");
    const referencesHeaderRow = rows.length;
    rows.push(["Organization", "Period", "Reference", "URL"]);
    const referenceRows = getRelevantReferences("volunteerHours").map(reference => [
      reference.organization,
      reference.ratePeriod || "",
      reference.title,
      reference.url,
    ]);
    rows.push(...referenceRows);
    rows.push([]);
    const disclaimerRow = rows.length;
    rows.push([AppCopy.summary.shortDisclaimer("volunteerHours")]);

    boldRows.push(hoursSectionRow, hoursTotalRow, valueSectionRow, valueTotalRow, costSectionRow, rolesTotalRow);
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!rows"] = rows.map((_, index) => ({
      hpx: index === costNoteRow || index === disclaimerRow ? 36 : 20,
    }));
    sheet["!autofilter"] = {
      ref: `A${rolesHeaderRow + 1}:F${Math.max(rolesHeaderRow + 1, rolesDataStartRow + roles.length)}`,
    };
    sheet["!merges"] = [...sectionRows, costNoteRow, disclaimerRow].map(row => ({
      s: { r: row, c: 0 },
      e: { r: row, c: 5 },
    }));

    const mergedRows = new Set([...sectionRows, costNoteRow, disclaimerRow]);
    sheet["!cols"] = Array.from({ length: 6 }, (_, columnIndex) => {
      const maxLength = rows.reduce((max, row, rowIndex) => {
        if (mergedRows.has(rowIndex)) return max;
        const value = row[columnIndex];
        return value === null || value === undefined
          ? max
          : Math.max(max, String(value).length);
      }, 0);
      return { wch: Math.min(Math.max(maxLength + 2, 12), columnIndex === 3 ? 18 : 48) };
    });

    const sectionStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "D9EAF7" } },
      alignment: { vertical: "center", horizontal: "left" },
    };
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "EAF2F8" } },
      border: {
        top: { style: "thin", color: { rgb: "D0D7DE" } },
        bottom: { style: "thin", color: { rgb: "D0D7DE" } },
        left: { style: "thin", color: { rgb: "D0D7DE" } },
        right: { style: "thin", color: { rgb: "D0D7DE" } },
      },
    };
    const styleRow = (rowIndex, style, columnCount = 6) => {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
        const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })];
        if (cell) cell.s = { ...(cell.s || {}), ...style };
      }
    };
    sectionRows.forEach(row => styleRow(row, sectionStyle));
    summaryLabelRows.forEach(row => styleRow(row, { font: { bold: true } }, 1));
    boldRows.forEach(row => styleRow(row, { font: { bold: true } }));
    styleRow(rolesHeaderRow, headerStyle);
    styleRow(referencesHeaderRow, headerStyle, 4);
    styleRow(rolesTotalRow, {
      font: { bold: true },
      border: { top: { style: "thin", color: { rgb: "808080" } } },
    });
    const labelStyle = { font: { bold: true } };
    [clinicDetailsRow + 1, clinicDetailsRow + 2, clinicDetailsRow + 3,
      clinicDetailsRow + 4, clinicDetailsRow + 5, clinicDetailsRow + 6,
      hoursDataStartRow, hoursDataStartRow + 1, valueDataStartRow, valueDataStartRow + 1,
      costRow, costRow + 1, costRow + 2, costRow + 3]
      .forEach(row => styleRow(row, labelStyle, 1));

    const currencyFormat = "$#,##0.00";
    currencyCells.forEach(([row, column]) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
      if (cell && typeof cell.v === "number") {
        cell.s = { ...(cell.s || {}), numFmt: currencyFormat };
      }
    });
    percentageCells.forEach(([row, column]) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
      if (cell) cell.s = { ...(cell.s || {}), numFmt: "0.0%" };
    });
    for (let row = rolesDataStartRow; row <= rolesTotalRow; row += 1) {
      [3, 4].forEach(column => {
        const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
        if (cell) cell.s = { ...(cell.s || {}), numFmt: currencyFormat };
      });
      const shareCell = sheet[XLSX.utils.encode_cell({ r: row, c: 5 })];
      if (shareCell) shareCell.s = { ...(shareCell.s || {}), numFmt: "0.0%" };
    }
    [costNoteRow, disclaimerRow].forEach(row => {
      sheet["A" + (row + 1)].s = {
        font: { italic: true, color: { rgb: "475C8A" } },
        alignment: { wrapText: true, vertical: "center" },
      };
    });
    referenceRows.forEach((reference, index) => {
      if (!reference[3]) return;
      const cell = sheet[XLSX.utils.encode_cell({ r: referencesHeaderRow + 1 + index, c: 3 })];
      if (cell) cell.l = { Target: reference[3] };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, AppCopy.exportCopy.workbookSummary);
    const pieCharts = _appendActivityChartSheet(workbook, {
      impactMethod: "volunteerHours",
      quantityLabel: "Hours",
      activityItems: roles.map(role => ({ label: role.roleName, value: role.hours })),
      valueItems: roles.map(role => ({ label: role.roleName, value: role.estimatedValue })),
    });
    return _downloadWorkbook(workbook, summary, pieCharts);
  }

  function _downloadClinicalServicesExcel(summary) {
    const serviceCount = summary.serviceBreakdown.reduce((sum, row) => sum + row.count, 0);
    const services = summary.serviceBreakdown
      .filter(row => row.count > 0)
      .slice()
      .sort((a, b) =>
        b.estimatedValue - a.estimatedValue ||
        b.count - a.count ||
        a.serviceName.localeCompare(b.serviceName)
      );
    const rows = [];
    const sectionRows = [];
    const summaryLabelRows = [];
    const boldRows = [];
    const currencyCells = [];
    const percentageCells = [];

    const addSection = title => {
      if (rows.length > 0) rows.push([]);
      const row = rows.length;
      rows.push([title]);
      sectionRows.push(row);
      return row;
    };
    const addSummaryRow = (label, value) => {
      if (rows.length > 0) rows.push([]);
      const row = rows.length;
      rows.push([label, value]);
      summaryLabelRows.push(row);
      return row;
    };

    const clinicDetailsRow = addSection("Clinic Details");
    rows.push(["Clinic Name", summary.clinicName]);
    rows.push(["Street Address", summary.streetAddress]);
    rows.push(["City", summary.city]);
    rows.push(["State", summary.state]);
    rows.push(["ZIP Code", summary.zipCode]);
    rows.push(["Reporting Period From", summary.reportingPeriodFrom]);
    rows.push(["Reporting Period To", summary.reportingPeriodTo]);

    addSummaryRow("Method Selected", "Clinical services");
    addSummaryRow("Total Service Counts", serviceCount);
    const estimatedValueRow = addSummaryRow("Total Estimated Value Provided", summary.clinicalServiceValue);
    currencyCells.push([estimatedValueRow, 1]);

    const costSectionRow = addSection("Cost and Value Comparison");
    const costRow = rows.length;
    rows.push([
      "Reported Clinic Cost",
      summary.reportingPeriodClinicCost === null ? "Not reported" : summary.reportingPeriodClinicCost,
    ]);
    rows.push(["Estimated Value of Services", summary.clinicalServiceValue]);
    currencyCells.push([costRow, 1], [costRow + 1, 1]);
    rows.push([
      "Estimated Value per $1 of Reported Clinic Cost",
      summary.valueToCostRatio === null ? "Not available" : summary.valueToCostRatio,
    ]);
    currencyCells.push([costRow + 2, 1]);
    rows.push([
      "Estimated Value as a Share of Reported Clinic Cost",
      summary.reportingPeriodClinicCost > 0
        ? summary.clinicalServiceValue / summary.reportingPeriodClinicCost
        : "Not available",
    ]);
    percentageCells.push([costRow + 3, 1]);
    const costNoteRow = rows.length;
    rows.push([AppCopy.summary.costComparisonNote]);

    const servicesSectionRow = addSection("Services");
    const servicesHeaderRow = rows.length;
    rows.push(["Service", "Code", "Units", "Rate", "Value", "Value Share"]);
    const serviceDataStartRow = rows.length;
    rows.push(...services.map(row => [
      row.serviceName,
      row.code,
      row.count,
      row.benchmarkRate,
      row.estimatedValue,
      summary.clinicalServiceValue > 0
        ? row.estimatedValue / summary.clinicalServiceValue
        : 0,
    ]));
    const serviceTotalRow = rows.length;
    rows.push([
      "Total",
      "",
      serviceCount,
      "",
      summary.clinicalServiceValue,
      summary.clinicalServiceValue > 0 ? 1 : 0,
    ]);

    const referencesSectionRow = addSection("Sources and References");
    rows.push(["Organization", "Period", "Reference", "URL"]);
    const referencesHeaderRow = rows.length - 1;
    const referenceRows = getRelevantReferences("clinicalServices").map(reference => [
      reference.organization,
      reference.ratePeriod || "",
      reference.title,
      reference.url,
    ]);
    rows.push(...referenceRows);
    rows.push([]);
    const disclaimerRow = rows.length;
    rows.push([AppCopy.summary.shortDisclaimer("clinicalServices")]);

    boldRows.push(costSectionRow, serviceTotalRow);
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!rows"] = rows.map((_, index) => ({
      hpx: index === costNoteRow || index === disclaimerRow ? 36 : 20,
    }));
    sheet["!autofilter"] = {
      ref: `A${servicesHeaderRow + 1}:F${Math.max(servicesHeaderRow + 1, serviceDataStartRow + services.length)}`,
    };
    sheet["!merges"] = [...sectionRows, costNoteRow, disclaimerRow].map(row => ({
      s: { r: row, c: 0 },
      e: { r: row, c: 5 },
    }));

    const mergedRows = new Set([...sectionRows, costNoteRow, disclaimerRow]);
    sheet["!cols"] = Array.from({ length: 6 }, (_, columnIndex) => {
      const maxLength = rows.reduce((max, row, rowIndex) => {
        if (mergedRows.has(rowIndex)) return max;
        const value = row[columnIndex];
        return value === null || value === undefined
          ? max
          : Math.max(max, String(value).length);
      }, 0);
      return { wch: Math.min(Math.max(maxLength + 2, 12), columnIndex === 3 ? 18 : 48) };
    });

    const sectionStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "D9EAF7" } },
      alignment: { vertical: "center", horizontal: "left" },
    };
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "EAF2F8" } },
      border: {
        top: { style: "thin", color: { rgb: "D0D7DE" } },
        bottom: { style: "thin", color: { rgb: "D0D7DE" } },
        left: { style: "thin", color: { rgb: "D0D7DE" } },
        right: { style: "thin", color: { rgb: "D0D7DE" } },
      },
    };
    const styleRow = (rowIndex, style, columnCount = 6) => {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
        const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })];
        if (cell) cell.s = { ...(cell.s || {}), ...style };
      }
    };
    sectionRows.forEach(row => styleRow(row, sectionStyle));
    summaryLabelRows.forEach(row => styleRow(row, { font: { bold: true } }, 1));
    boldRows.forEach(row => styleRow(row, { font: { bold: true } }));
    styleRow(servicesHeaderRow, headerStyle);
    styleRow(referencesHeaderRow, headerStyle, 4);
    styleRow(serviceTotalRow, {
      font: { bold: true },
      border: { top: { style: "thin", color: { rgb: "808080" } } },
    });
    const labelStyle = { font: { bold: true } };
    [clinicDetailsRow + 1, clinicDetailsRow + 2, clinicDetailsRow + 3,
      clinicDetailsRow + 4, clinicDetailsRow + 5, clinicDetailsRow + 6,
      costRow, costRow + 1, costRow + 2, costRow + 3]
      .forEach(row => styleRow(row, labelStyle, 1));

    const currencyFormat = "$#,##0.00";
    currencyCells.forEach(([row, column]) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
      if (cell) cell.s = { ...(cell.s || {}), numFmt: currencyFormat };
    });
    percentageCells.forEach(([row, column]) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
      if (cell) cell.s = { ...(cell.s || {}), numFmt: "0.0%" };
    });
    for (let row = serviceDataStartRow; row <= serviceTotalRow; row += 1) {
      [3, 4].forEach(column => {
        const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
        if (cell) cell.s = { ...(cell.s || {}), numFmt: currencyFormat };
      });
      const shareCell = sheet[XLSX.utils.encode_cell({ r: row, c: 5 })];
      if (shareCell) shareCell.s = { ...(shareCell.s || {}), numFmt: "0.0%" };
    }
    [costNoteRow, disclaimerRow].forEach(row => {
      sheet["A" + (row + 1)].s = {
        font: { italic: true, color: { rgb: "475C8A" } },
        alignment: { wrapText: true, vertical: "center" },
      };
    });
    referenceRows.forEach((reference, index) => {
      if (!reference[3]) return;
      const cell = sheet[XLSX.utils.encode_cell({ r: referencesHeaderRow + 1 + index, c: 3 })];
      if (cell) cell.l = { Target: reference[3] };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, AppCopy.exportCopy.workbookSummary);
    const pieCharts = _appendActivityChartSheet(workbook, {
      impactMethod: "clinicalServices",
      quantityLabel: "Service count",
      activityItems: services.map(service => ({
        label: service.serviceDescription,
        value: service.count,
      })),
      valueItems: services.map(service => ({
        label: service.serviceDescription,
        value: service.estimatedValue,
      })),
    });
    return _downloadWorkbook(workbook, summary, pieCharts);
  }

  // ---------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------

  function _appendActivityChartSheet(workbook, { impactMethod, quantityLabel, activityItems, valueItems }) {
    if (activityItems.length === 0) return false;
    const activityChartItems = _groupChartItems(activityItems);
    const valueChartItems = _groupChartItems(valueItems);
    const rowCount = Math.max(activityChartItems.length, valueChartItems.length);
    const rows = [
      ["Activity", quantityLabel, undefined, "Activity", "Estimated value (USD)"],
      ...Array.from({ length: rowCount }, (_, index) => [
        activityChartItems[index]?.label,
        activityChartItems[index]?.value,
        undefined,
        valueChartItems[index]?.label,
        valueChartItems[index]?.value,
      ]),
    ];
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!cols"] = [{ wch: 36 }, { wch: 18 }, { wch: 3 }, { wch: 36 }, { wch: 22 }];
    valueChartItems.forEach((_item, index) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: index + 1, c: 4 })];
      if (cell) cell.s = { ...(cell.s || {}), numFmt: "$#,##0.00" };
    });
    XLSX.utils.book_append_sheet(workbook, sheet, "Activity Chart");
    const chartPrefix = impactMethod === "volunteerHours"
      ? "VOLUNTEER ROLES"
      : "CLINICAL SERVICES";
    const charts = [
      {
        title: impactMethod === "volunteerHours"
          ? "VOLUNTEER ROLES BY HOURS"
          : "CLINICAL SERVICES BY COUNT",
        categoryColumn: "A",
        valueColumn: "B",
        lastDataRow: activityChartItems.length + 1,
        otherSliceIndex: activityChartItems.some(item => item.isOther)
          ? activityChartItems.length - 1
          : null,
        anchorColumn: 0,
        anchorRow: rows.length + 2,
      },
    ];
    if (valueChartItems.length > 0) {
      charts.push(
        {
          title: `${impactMethod === "volunteerHours" ? "VOLUNTEER ROLES BY VALUE" : "CLINICAL SERVICES BY VALUE"}`,
          categoryColumn: "D",
          valueColumn: "E",
          lastDataRow: valueChartItems.length + 1,
          otherSliceIndex: valueChartItems.some(item => item.isOther)
            ? valueChartItems.length - 1
            : null,
          anchorColumn: 0,
          anchorRow: rows.length + 36,
        }
      );
    }
    return charts.map((chart, index) => ({
      ...chart,
      name: `${chartPrefix} pie chart ${index + 1}`,
    }));
  }

  function _groupChartItems(items) {
    const rankedItems = items
      .filter(item => Number.isFinite(item.value) && item.value > 0)
      .slice()
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
    const total = rankedItems.reduce((sum, item) => sum + item.value, 0);
    const groupedItems = [];
    let groupedValue = 0;
    let firstGroupedIndex = rankedItems.length;

    while (firstGroupedIndex > 1 && groupedValue < total * 0.1) {
      const item = rankedItems[--firstGroupedIndex];
      groupedItems.unshift(item);
      groupedValue += item.value;
    }

    if (groupedItems.length === 0) return rankedItems;
    return [
      ...rankedItems.slice(0, firstGroupedIndex),
      { label: "Other", value: groupedValue, isOther: true },
    ];
  }

  async function _downloadWorkbook(workbook, summary, pieCharts) {
    try {
      let xlsxData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      if (pieCharts) {
        if (typeof JSZip === "undefined") {
          throw new Error("The Excel chart library could not be loaded.");
        }
        xlsxData = await _addNativePieCharts(xlsxData, pieCharts);
      }
      _triggerDownload(
        xlsxData,
        `${_safeFilename(summary.clinicName)}-impact-breakdown.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    } catch (error) {
      console.error("Failed to prepare the Excel report:", error);
      alert("The Excel report could not be prepared. Check your internet connection and try again.");
    }
  }

  async function _addNativePieCharts(xlsxData, charts) {
    const zip = await JSZip.loadAsync(xlsxData);
    const worksheetPath = "xl/worksheets/sheet2.xml";
    const contentTypesPath = "[Content_Types].xml";
    const worksheetFile = zip.file(worksheetPath);
    const contentTypesFile = zip.file(contentTypesPath);
    if (!worksheetFile || !contentTypesFile) {
      throw new Error("The Excel workbook is missing chart worksheet metadata.");
    }
    const [worksheetXml, contentTypesXml] = await Promise.all([
      worksheetFile.async("string"),
      contentTypesFile.async("string"),
    ]);
    const drawingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
${charts.map((chart, index) => `  <xdr:oneCellAnchor>
    <xdr:from><xdr:col>${chart.anchorColumn}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${chart.anchorRow}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:ext cx="9144000" cy="5943600"/>
    <xdr:graphicFrame macro="">
      <xdr:nvGraphicFramePr><xdr:cNvPr id="${index + 2}" name="${_escapeXML(chart.name)}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr>
      <xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>
      <a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId${index + 1}"/></a:graphicData></a:graphic>
    </xdr:graphicFrame>
    <xdr:clientData/>
  </xdr:oneCellAnchor>`).join("\n")}
</xdr:wsDr>`;
    const drawingRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${charts.map((_chart, index) => `  <Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${index + 1}.xml"/>`).join("\n")}
</Relationships>`;
    const sheetName = "Activity Chart";
    const chartRelationshipXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`;
    const updatedWorksheetXml = worksheetXml.replace(
      /<worksheet\b([^>]*)>/,
      (match, attributes) => {
        const withRelationshipNamespace = attributes.includes("xmlns:r=")
          ? attributes
          : `${attributes} xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"`;
        return `<worksheet${withRelationshipNamespace}>`;
      }
    ).replace("</worksheet>", '<drawing r:id="rId1"/></worksheet>');
    const chartContentTypes = [
      '  <Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>',
      ...charts.map((_chart, index) =>
        `  <Override PartName="/xl/charts/chart${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`
      ),
    ].join("\n");
    zip.file(worksheetPath, updatedWorksheetXml);
    zip.file("xl/worksheets/_rels/sheet2.xml.rels", chartRelationshipXml);
    zip.file("xl/drawings/drawing1.xml", drawingXml);
    zip.file("xl/drawings/_rels/drawing1.xml.rels", drawingRelsXml);
    charts.forEach((chart, index) => {
      zip.file(
        `xl/charts/chart${index + 1}.xml`,
        _buildPieChartXml(
          chart.title,
          sheetName,
          chart.lastDataRow,
          chart.otherSliceIndex,
          chart.categoryColumn,
          chart.valueColumn
        )
      );
    });
    zip.file(contentTypesPath, contentTypesXml.replace("</Types>", `${chartContentTypes}\n</Types>`));
    return zip.generateAsync({ type: "uint8array" });
  }

  function _buildPieChartXml(title, sheetName, lastDataRow, otherSliceIndex, categoryColumn, valueColumn) {
    const escapedTitle = _escapeXML(title);
    const escapedSheetName = _escapeXML(sheetName);
    const otherSliceStyle = otherSliceIndex === null
      ? ""
      : `<c:dPt><c:idx val="${otherSliceIndex}"/><c:spPr><a:solidFill><a:srgbClr val="B8B8B8"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr></c:dPt>`;
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:lang val="en-US"/>
  <c:chart>
    <c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr/></a:pPr><a:r><a:rPr lang="en-US"/><a:t>${escapedTitle}</a:t></a:r><a:endParaRPr lang="en-US"/></a:p></c:rich></c:tx><c:layout/><c:overlay val="0"/></c:title>
    <c:plotArea><c:layout/><c:pieChart><c:varyColors val="1"/><c:ser>
      <c:idx val="0"/><c:order val="0"/>
      ${otherSliceStyle}
      <c:cat><c:strRef><c:f>'${escapedSheetName}'!$${categoryColumn}$2:$${categoryColumn}$${lastDataRow}</c:f></c:strRef></c:cat>
      <c:val><c:numRef><c:f>'${escapedSheetName}'!$${valueColumn}$2:$${valueColumn}$${lastDataRow}</c:f></c:numRef></c:val>
    </c:ser><c:dLbls><c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="1"/><c:showSerName val="0"/><c:showPercent val="1"/><c:showLeaderLines val="1"/><c:dLblPos val="outEnd"/></c:dLbls><c:firstSliceAng val="0"/></c:pieChart></c:plotArea>
    <c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/>
  </c:chart>
</c:chartSpace>`;
  }

  function _escapeXML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function _fmt(value) {
    // The PDF keeps two decimal places for rates and totals, unlike the UI's
    // abbreviated whole-dollar formatting.
    return typeof value === "number"
      ? value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })
      : value;
  }

  function _sharePercent(value) {
    return value > 0 && value < 0.1 ? "<0.1" : value.toFixed(1);
  }

  function _methodLabel(method) {
    return method === "volunteerHours"
      ? "Volunteer hours"
      : "Clinical services";
  }

  function _triggerDownload(content, filename, mimeType) {
    // A temporary object URL lets the browser download generated content
    // without sending report data to a server.
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function _safeFilename(name) {
    // Keep the downloaded filename readable while removing unsafe characters.
    return (name || "clinic").replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);
  }

  function _buildPrintHTML(summary) {
    const isVolunteerReport = summary.impactMethod === "volunteerHours";
    const serviceCount = summary.serviceBreakdown.reduce((sum, row) => sum + row.count, 0);
    const volunteerHours = summary.volunteerBreakdown.reduce((sum, row) => sum + row.hours, 0);
    const activityCount = isVolunteerReport
      ? volunteerHours.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      : serviceCount.toLocaleString("en-US");
    const totalLabel = isVolunteerReport
      ? AppCopy.summaryDashboard.estimatedVolunteerValue
      : AppCopy.summaryDashboard.estimatedServiceValue;
    const period = `${_formatDate(summary.reportingPeriodFrom)}–${_formatDate(summary.reportingPeriodTo)}`;
    const address = [summary.streetAddress, summary.city, summary.state, summary.zipCode]
      .filter(Boolean)
      .map(_escapeHTML)
      .join(", ");
    const clinicName = summary.clinicName || "Your clinic";
    const impactNarrative = isVolunteerReport
      ? `During this reporting period, ${clinicName} reported ${activityCount} volunteer hours. Using reference hourly rates, the estimated value of that time is ${_fmt(summary.totalEstimatedValue)}.`
      : serviceCount > 0
        ? `During this reporting period, ${clinicName} reported ${activityCount} clinical services. Using national reference rates, the estimated value of those services is ${_fmt(summary.totalEstimatedValue)}.`
        : AppCopy.summary.emptyState;
    const metricCard = (label, value, note = "") => `
      <div class="metric-card">
        <p class="metric-card__label">${_escapeHTML(label)}</p>
        <p class="metric-card__value">${_escapeHTML(value)}</p>
        ${note ? `<p class="metric-card__note">${_escapeHTML(note)}</p>` : ""}
      </div>
    `;

    const serviceLabel = row => row.serviceDescription || row.serviceName;
    const svcRows = summary.serviceBreakdown
      .filter(row => row.count > 0)
      .slice()
      .sort((a, b) => b.estimatedValue - a.estimatedValue || b.count - a.count || a.serviceName.localeCompare(b.serviceName))
      .map((row, index) => `
      <tr class="table-row--${index % 2 === 0 ? "odd" : "even"}">
        <td class="table-serial">${index + 1}</td>
        <td>${_escapeHTML(row.serviceName || row.serviceDescription)}</td>
        <td class="service-code">${_escapeHTML(row.code)}</td>
        <td class="numeric">${row.count.toLocaleString("en-US")}</td>
        <td class="numeric">${_fmt(row.benchmarkRate)}</td>
        <td class="numeric">${_fmt(row.estimatedValue)}</td>
        <td class="numeric">${_escapeHTML(_sharePercent(summary.clinicalServiceValue > 0
          ? row.estimatedValue / summary.clinicalServiceValue * 100
          : 0))}%</td>
      </tr>
    `);

    const volRows = summary.volunteerBreakdown
      .filter(row => row.hours > 0)
      .slice()
      .sort((a, b) => b.hours - a.hours || a.roleName.localeCompare(b.roleName))
      .map((row, index) => `
      <tr class="table-row--${index % 2 === 0 ? "odd" : "even"}">
        <td class="table-serial">${index + 1}</td>
        <td>${_escapeHTML(row.roleName)}</td>
        <td>${_escapeHTML(row.category)}</td>
        <td class="numeric">${row.hours.toFixed(1)}</td>
        <td class="numeric">${_fmt(row.benchmarkRate)}</td>
        <td class="numeric">${_fmt(row.estimatedValue)}</td>
      </tr>
    `);

    const tableBodyHTML = (rows, totalRow) => {
      if (rows.length > 2) {
        return `<tbody class="table-opening">${rows[0]}</tbody>
          ${rows.length > 3 ? `<tbody>${rows.slice(1, -2).join("")}</tbody>` : ""}
          <tbody class="table-ending">${rows.slice(-2).join("")}${totalRow}</tbody>`;
      }
      return `<tbody class="table-opening table-ending">${rows.join("")}${totalRow}</tbody>`;
    };

    const referenceItems = getRelevantReferences(summary.impactMethod).map(ref => `
      <li>
        <a href="${_escapeHTML(ref.url)}">${_escapeHTML(ref.title)}</a>
        — ${_escapeHTML(ref.organization)} (${_escapeHTML(ref.ratePeriod)}).
        ${ref.description ? `<br><span>${_escapeHTML(ref.description)}</span>` : ""}
      </li>
    `).join("");
    const rateDataNote = `Reference rate data: ${getRateDataSummary(summary.impactMethod)}.`;
    const rateDataNoteHTML = `<p class="section-note rate-data-note">${_escapeHTML(rateDataNote)}</p>`;

    const costReported = Number.isFinite(summary.reportingPeriodClinicCost) && summary.reportingPeriodClinicCost >= 0;
    const hasCostRatio = costReported && summary.reportingPeriodClinicCost > 0 && Number.isFinite(summary.valueToCostRatio);
    const budgetHTML = costReported ? `
      <section class="report-section cost-comparison">
        <h2>${_escapeHTML(AppCopy.summaryView.costHeading)}</h2>
        <div class="metric-grid metric-grid--two">
          ${metricCard("Reported clinic cost", _fmt(summary.reportingPeriodClinicCost), "Total clinic cost reported for this period.")}
          ${metricCard("Estimated total value", _fmt(summary.totalEstimatedValue), "Estimated value of the activity entered.")}
          ${metricCard(AppCopy.summaryView.valuePerDollarLabel, !hasCostRatio ? "Not available" : `$${summary.valueToCostRatio.toFixed(2)}`)}
          ${metricCard(AppCopy.summaryView.benchmarkComparisonLabel, summary.reportingPeriodClinicCost > 0 && Number.isFinite(summary.benchmarkValueROI) ? `${Math.abs(summary.benchmarkValueROI).toFixed(1)}% ${summary.benchmarkValueROI > 0 ? "higher" : summary.benchmarkValueROI < 0 ? "lower" : "equal"}` : "Not available", "Estimated value compared with reported clinic cost.")}
        </div>
        <p class="callout callout--note">${_escapeHTML(AppCopy.summary.costComparisonNote)}</p>
      </section>
    ` : "";

    const rankedVolunteerRoles = isVolunteerReport
      ? summary.volunteerBreakdown
        .filter(role => role.hours > 0)
        .slice()
        .sort((a, b) =>
          b.estimatedValue - a.estimatedValue ||
          b.hours - a.hours ||
          a.roleName.localeCompare(b.roleName)
        )
      : [];
    const rankedServices = isVolunteerReport ? [] : (summary.serviceImpactRanking?.byValue || summary.serviceBreakdown)
      .filter(row => row.count > 0).slice().sort((a, b) =>
        b.estimatedValue - a.estimatedValue || b.count - a.count || a.serviceName.localeCompare(b.serviceName));
    const printComposition = options => {
      const html = CompositionPieChart.render({ ...options, reportStyle: true });
      const legendCount = (html.match(/class="composition-pie__item/g) || []).length;
      return legendCount > 12 ? html.replace('summary-section composition-pie', 'summary-section composition-pie composition-pie--dense') : html;
    };
    const volunteerHoursPieHTML = isVolunteerReport
      ? printComposition({
        id: "volunteer-hours-composition",
        title: "Volunteer roles by hours",
        description: "Each slice shows a role's share of total reported volunteer hours. Small shares are combined into Other.",
        otherLabel: "Other roles",
        unitLabel: "hours",
        formatValue: value => value.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        totalInHeading: true,
        items: summary.volunteerBreakdown.map(row => ({
          label: row.roleName,
          value: row.hours,
          valueLabel: `${row.hours.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} hours`,
        })),
      }).replace('class="summary-section composition-pie', 'class="summary-section composition-pie composition-pie--volunteer-hours')
      : "";
    const clinicalCountsPieHTML = !isVolunteerReport
      ? printComposition({
        id: "clinical-services-composition",
        title: "Clinical services by count",
        description: "Each slice shows a service type's share of total reported counts. Small shares are combined into Other.",
        otherLabel: "Other services",
        unitLabel: "services",
        formatValue: value => value.toLocaleString("en-US"),
        totalInHeading: true,
        items: summary.serviceBreakdown.map(row => ({
          label: serviceLabel(row),
          value: row.count,
          valueLabel: `${row.count.toLocaleString("en-US")} services`,
        })),
      })
      : "";

    const hasMedicalVolunteerHours = summary.volunteerBreakdown.some(
      row => row.category === "medical professional" && row.hours > 0
    );
    const hasNonMedicalVolunteerHours = summary.volunteerBreakdown.some(
      row => row.category === "non medical" && row.hours > 0
    );
    const volunteerGlanceCard = (label, value, note, share) => `
      <article class="glance-card">
        <p class="glance-card__label">${_escapeHTML(label)}</p>
        <p class="glance-card__value">${_escapeHTML(_fmt(value))}</p>
        <p class="glance-card__note">${_escapeHTML(note)}</p>
        <div class="glance-card__share" aria-hidden="true">
          <span style="width:${Math.min(100, Math.max(0, share))}%"></span>
        </div>
      </article>
    `;
    const volunteerBreakdownHTML = isVolunteerReport && hasMedicalVolunteerHours && hasNonMedicalVolunteerHours
      ? `<section class="report-section volunteer-value-glance">
          <h2 class="glance-heading">Estimated value at a glance</h2>
          <div class="glance-grid">
            ${volunteerGlanceCard(
              "Estimated value of medical volunteer time",
              summary.medicalProfessionalVolunteerValue,
              AppCopy.metric.estimatedMedicalProfessionalVolunteerValueNote,
              summary.totalEstimatedValue > 0
                ? summary.medicalProfessionalVolunteerValue / summary.totalEstimatedValue * 100
                : 0
            )}
            ${volunteerGlanceCard(
              "Estimated value of non-medical volunteer time",
              summary.nonMedicalVolunteerValue,
              AppCopy.metric.estimatedNonMedicalVolunteerValueNote,
              summary.totalEstimatedValue > 0
                ? summary.nonMedicalVolunteerValue / summary.totalEstimatedValue * 100
                : 0
            )}
            ${volunteerGlanceCard(
              "Estimated value of total volunteer time",
              summary.totalEstimatedValue,
              "Estimated value of the total reported donated time. Includes both medical and non-medical volunteer time.",
              100
            )}
          </div>
        </section>`
      : "";

    const highlights = (isVolunteerReport ? rankedVolunteerRoles : rankedServices).slice(0, 5);
    const leader = highlights[0];
    const leaderName = leader ? (isVolunteerReport ? leader.roleName : serviceLabel(leader)) : "No activity reported";
    const leaderShare = leader && summary.totalEstimatedValue > 0 ? leader.estimatedValue / summary.totalEstimatedValue * 100 : 0;
    const comparisonMax = Math.max(summary.totalEstimatedValue, summary.reportingPeriodClinicCost || 0, 1);
    const costComparison = costReported ? `<section class="brief-section">
      <h2>Reported cost compared with estimated value</h2>
      <div class="brief-bar-label"><span>Reported clinic cost</span><strong>${_fmt(summary.reportingPeriodClinicCost)}</strong></div>
      <div class="brief-track brief-track--cost"><span style="width:${Math.max(0, summary.reportingPeriodClinicCost / comparisonMax * 100)}%"></span></div>
      <div class="brief-bar-label"><span>Estimated activity value</span><strong>${_fmt(summary.totalEstimatedValue)}</strong></div>
      <div class="brief-track"><span style="width:${Math.max(0, summary.totalEstimatedValue / comparisonMax * 100)}%"></span></div>
      <p class="brief-ratio">${hasCostRatio ? `<strong>$${summary.valueToCostRatio.toFixed(2)}</strong> estimated value per $1 of reported cost` : "Value-to-cost comparison is not available."}</p>
      <p class="brief-note">Informational comparison only - not financial ROI or confirmed savings.</p>
    </section>` : `<section class="brief-section"><h2>Basis of the estimate</h2><p class="brief-note">${isVolunteerReport ? "Reported volunteer hours multiplied by role-specific hourly reference rates." : "Reported clinical service units multiplied by public clinical reference rates."} Clinic cost was not reported; a cost comparison is not included.</p></section>`;
    const highlightHTML = highlights.map((row, index) => `<div class="brief-ranking-row">
      <span class="brief-rank">${String(index + 1).padStart(2, "0")}</span>
      <div><div class="brief-ranking-name">${_escapeHTML(isVolunteerReport ? row.roleName : serviceLabel(row))}</div><div class="brief-track"><span style="width:${leader.estimatedValue > 0 ? Math.max(0, row.estimatedValue / leader.estimatedValue * 100) : 0}%"></span></div></div>
      <strong>${_fmt(row.estimatedValue)}</strong>
    </div>`).join("");
    const methodologyItems = AppCopy.summaryView.methodologyBullets(summary.impactMethod)
      .map(item => `<li>${_escapeHTML(item)}</li>`)
      .join("");
    const volunteerSourceHTML = isVolunteerReport && VOLUNTEER_RATE_SOURCE
      ? `<section class="report-section">
          <h2>Volunteer Rate Source</h2>
          <p class="source-attribution"><strong>${_escapeHTML(VOLUNTEER_RATE_SOURCE.name)}${VOLUNTEER_RATE_SOURCE.publicationYear ? ` (${VOLUNTEER_RATE_SOURCE.publicationYear})` : ""}</strong><br>${_escapeHTML(VOLUNTEER_RATE_SOURCE.description)}</p>
        </section>`
      : "";

    const hasActivity = isVolunteerReport ? volunteerHours > 0 : serviceCount > 0;
    let chapterNumber = 1;
    const chapterMasthead = () => `<div class="brief-masthead"><strong>CARE IN ACTION / CLINIC IMPACT ESTIMATOR</strong><span>${String(++chapterNumber).padStart(2, "0")} / ${_escapeHTML(_methodLabel(summary.impactMethod)).toUpperCase()}</span></div>`;
    const chapterHeader = (title, showMasthead = true) => `<header class="chapter-header">
      ${showMasthead ? chapterMasthead() : ""}
      <h2>${title}</h2><div class="chapter-context"><span>${_escapeHTML(clinicName)}</span><span>${_escapeHTML(period)}</span></div>
    </header>`;
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${_escapeHTML(AppCopy.exportCopy.pdfTitle)} — ${_escapeHTML(clinicName)}</title>
<style>
  :root { color-scheme: light; --navy: #203432; --teal: #24635d; --slate: #627470; --border: #cad8d3; --oxblood: #763c51; }
  @page { size: letter portrait; margin: .6in;
    @top-left { content: "CARE IN ACTION / CLINIC IMPACT ESTIMATOR"; font: 7pt "Segoe UI", Arial, sans-serif; color: #627470; }
    @bottom-right { content: counter(page); font: 8pt "Segoe UI", Arial, sans-serif; color: #627470; }
  }
  @page:first { @top-left { content: none; } }
  * { box-sizing: border-box; }
  body { max-width: 900px; margin: 32px auto; padding: 0 24px; color: var(--navy); background: #fff; font: 10pt/1.5 "Segoe UI", Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  p { margin: 0 0 9px; }
  h1, h2, h3 { overflow-wrap: anywhere; }
  h2 { margin: 0 0 9px; padding: 0; color: var(--teal); font: 600 8pt/1.4 "Segoe UI", Arial, sans-serif; letter-spacing: .09em; text-transform: uppercase; break-after: avoid; }
  a { color: var(--teal); text-underline-offset: 2px; overflow-wrap: anywhere; }
  .report-chapter { margin-top: 34px; }
  .chapter-header { margin-bottom: 18px; break-inside: avoid; break-after: avoid; }
  .chapter-header .brief-masthead { margin-bottom: 16px; }
  .chapter-header h2 { margin: 0 0 5px; color: var(--navy); font-size: 16pt; line-height: 1.2; font-weight: 600; letter-spacing: -.025em; text-transform: none; }
  .chapter-context { display: flex; justify-content: space-between; gap: 16px; color: var(--slate); font-size: 8pt; }
  .chapter-context span { overflow-wrap: anywhere; }
  .chapter-context span:last-child { text-align: right; }
  .report-section { margin: 0 0 17px; }
  .section-intro, .section-note, .source-attribution, .feature__meta { font-size: 8pt; color: var(--slate); }
  .section-intro { margin-bottom: 10px; break-after: avoid; }
  .section-note { margin-top: 8px; }
  .rate-data-note { margin: 8px 0 18px; }
  .narrative { font-size: 10pt; margin-bottom: 16px; }
  .metric-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid var(--border); margin: 10px 0; }
  .metric-card { padding: 9px 14px 9px 0; border-bottom: 1px solid var(--border); min-width: 0; }
  .metric-card:nth-child(even) { padding-left: 14px; border-left: 1px solid var(--border); }
  .metric-card__label { font-size: 7.5pt; color: var(--slate); margin: 0 0 4px; }
  .metric-card__value { font-size: 18pt; line-height: 1.25; font-weight: 600; margin: 0 0 4px; overflow-wrap: anywhere; }
  .metric-card__note { font-size: 7.5pt; color: var(--slate); margin: 0; }
  .callout { font-size: 8pt; color: var(--slate); border-left: 2px solid var(--oxblood); padding-left: 10px; margin: 10px 0; }
  .cost-comparison .metric-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .cost-comparison .metric-card { padding: 8px 10px; border-left: 1px solid var(--border); }
  .cost-comparison .metric-card:first-child { border-left: 0; padding-left: 0; }
  .cost-comparison .metric-card__value { font-size: 16pt; }
  .cost-comparison { padding-top: 12px; border-top: 1px solid var(--border); }
  .glance-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .glance-card { min-width: 0; padding: 10px 12px; border-right: 1px solid var(--border); }
  .glance-card:first-child { padding-left: 0; }
  .glance-card:last-child { border-right: 0; }
  .glance-card__label { color: var(--slate); font-size: 7.5pt; margin: 0 0 6px; }
  .glance-card__value { font-size: 18pt; line-height: 1.2; font-weight: 600; margin: 0 0 6px; overflow-wrap: anywhere; }
  .glance-card__note { color: var(--slate); font-size: 7.5pt; margin: 0; }
  .glance-card__share { height: 3px; background: #e8f1ee; margin-top: 9px; }
  .glance-card__share span { display: block; height: 100%; background: var(--teal); }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; font: 8.5pt/1.45 "Segoe UI", Arial, sans-serif; }
  thead { display: table-header-group; }
  th { padding: 7px 5px; color: var(--teal); background: #eaf1ee; font-size: 8pt; font-weight: 600; border-top: 1px solid var(--teal); border-bottom: 1px solid var(--border); text-align: left; }
  td { padding: 6px 6px; border-bottom: 1px solid #e2e9e6; overflow-wrap: anywhere; vertical-align: top; }
  .table-row--even td { background: #f5f8f6; }
  .numeric { text-align: right; font-variant-numeric: tabular-nums; }
  .table-serial { width: 3em; color: var(--slate); text-align: center; font-variant-numeric: tabular-nums; }
  .service-code { width: 5.5em; white-space: nowrap; }
  .table-total th { color: var(--navy); border-top: 1.5px solid var(--teal); background: #eaf1ee; }
  .composition-pie { margin: 20px 0; padding-top: 13px; border-top: 1px solid var(--border); break-inside: auto; }
  .composition-pie .summary-section__intro { font-size: 8pt; color: var(--slate); margin-bottom: 10px; }
  .composition-pie__heading-total { display: block; margin-top: 4px; color: var(--navy); font-size: 12pt; font-weight: 600; letter-spacing: normal; text-transform: none; }
  .composition-pie__content { display: block; }
  .composition-pie__chart { display: block; width: 60%; max-width: none; height: auto; overflow: visible; margin: 0 auto 18px; break-inside: avoid; }
  .composition-pie__shape { stroke: #fff; stroke-width: .6px; stroke-linejoin: round; }
  .composition-pie__depth-shape { filter: brightness(.68); stroke: #fff; stroke-width: .6px; stroke-linejoin: round; }
  .composition-pie__depth-separator { stroke: #fff; stroke-width: .6px; pointer-events: none; }
  .composition-pie__slice-number-bg { fill: #fff; stroke: var(--navy); stroke-width: .8px; }
  .composition-pie__leader { fill: none; stroke: #9aaea7; stroke-width: .65px; }
  .composition-pie__slice-number { fill: var(--navy); font: 600 6px "Segoe UI", Arial, sans-serif; font-variant-numeric: tabular-nums; }
  .composition-pie__slice-percentage { fill: var(--navy); stroke: #fff; stroke-width: 1.5px; paint-order: stroke; font: 600 5px "Segoe UI", Arial, sans-serif; }
  .composition-pie__total { fill: var(--navy); font-size: 12px; font-weight: 700; }
  .composition-pie__total-label { fill: var(--slate); font-size: 6px; }
  .composition-pie__legend { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px 20px; margin: 0; padding: 0; list-style: none; }
  .composition-pie__item { display: grid; grid-template-columns: 20px 8px minmax(0, 1fr); align-items: baseline; gap: 5px; font-size: 8pt; break-inside: avoid; }
  .composition-pie__number { color: var(--slate); font-size: 8pt; font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1.5; }
  .composition-pie__swatch { width: 8px; height: 8px; border-radius: 50%; background: var(--pie-color); }
  .composition-pie__details { min-width: 0; }
  .composition-pie__label { display: block; overflow-wrap: anywhere; }
  .composition-pie--volunteer-hours .composition-pie__label { display: inline; }
  .composition-pie__value { color: var(--slate); margin-right: 6px; }
  .composition-pie__share { color: var(--navy); white-space: nowrap; }
  .methodology-list, .sources { padding-left: 18px; margin: 0 0 20px; }
  .methodology-list li, .sources li { padding-left: 4px; margin-bottom: 10px; font-size: 9pt; }
  .sources span { color: var(--slate); }
  .source-attribution { padding: 10px 0; border-top: 1px solid var(--border); }
  .report-footer { display: flex; justify-content: space-between; gap: 18px; padding-top: 10px; margin-top: 24px; border-top: 1px solid var(--border); font-size: 7pt; color: var(--slate); }
  .report-footer span { text-align: right; overflow-wrap: anywhere; }
  .appendix-page-footer { margin-top: auto; break-inside: avoid; }
  .appendix-page-footer__about { margin: 0; padding-top: 8px; border-top: 1px solid var(--border); font-size: 7pt; line-height: 1.4; color: var(--slate); }
  .appendix-page-footer .report-footer { margin-top: 10px; }
  @media print {
    body { max-width: none; margin: 0; padding: 0; }
    .report-chapter { break-before: page; margin-top: 0; }
    .report-chapter.appendix-page { break-before: page; page-break-before: always; margin-top: 0; }
    .appendix-page { display: flex; flex-direction: column; min-height: 9.8in; }
    .appendix-intro { break-inside: avoid; page-break-inside: avoid; }
    .appendix-masthead { margin-bottom: 24px; }
    .volunteer-value-glance { break-inside: avoid; page-break-inside: avoid; }
    .metric-grid, .cost-comparison { break-inside: avoid; }
    .report-section h2, .report-section .section-intro { break-after: avoid; }
    tr, tbody.table-opening, tbody.table-ending, .sources li { break-inside: avoid; }
    .table-wrap { overflow: visible; }
    p { orphans: 2; widows: 2; }
  }
  @media screen and (max-width: 620px) {
    body { margin: 16px auto; padding: 0 14px; }
    .metric-grid, .cost-comparison .metric-grid, .glance-grid, .composition-pie__content, .composition-pie--dense .composition-pie__legend { grid-template-columns: 1fr; }
    .metric-card:nth-child(even), .glance-card { border-left: 0; border-right: 0; padding-left: 0; }
    .table-wrap { overflow-x: auto; }
    table { min-width: 620px; }
  }
  /* Template-inspired executive brief; all detailed charts follow this page. */
  .executive-page { color: #203432; font: 10pt/1.4 "Segoe UI", Arial, sans-serif; }
  .brief-masthead { display: flex; justify-content: space-between; gap: 12px; border-top: 2px solid #24635d; padding-top: 10px; font-size: 7pt; color: #24635d; }
  .brief-masthead strong { letter-spacing: .13em; }
  .brief-masthead span { color: #627470; white-space: nowrap; }
  .brief-header { padding: 18px 0 13px; border-bottom: 1px solid #cad8d3; }
  .brief-header h1 { font: 700 25pt/1.15 "Segoe UI", Arial, sans-serif; letter-spacing: -.025em; margin: 0 0 5px; color: #203432; }
  .brief-subtitle { font-size: 14pt; margin: 0 0 10px; }
  .brief-meta { display: flex; justify-content: space-between; gap: 18px; color: #627470; font-size: 8pt; }
  .brief-meta > span { max-width: 52%; overflow-wrap: anywhere; }
  .brief-meta > span:last-child { text-align: right; }
  .brief-overview { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 20px; padding: 20px 0 16px; align-items: center; }
  .executive-page h2 { margin: 0 0 9px; border: 0; padding: 0; color: #24635d; font: 600 8pt/1.4 "Segoe UI", Arial, sans-serif; letter-spacing: .09em; text-transform: uppercase; }
  .brief-total { font-size: 33pt; font-weight: 700; letter-spacing: -.025em; line-height: 1.2; margin: 0 0 4px; overflow-wrap: anywhere; }
  .brief-note { color: #627470; font-size: 8pt; margin: 0; line-height: 1.5; }
  .brief-stats { border-left: 1px solid #cad8d3; padding-left: 17px; }
  .brief-stats p { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; margin: 0 0 10px; }
  .brief-stats p:last-child { margin: 0; }
  .brief-stats strong { font-size: 16pt; overflow-wrap: anywhere; }
  .brief-stats p:first-child strong { font-size: 23pt; }
  .brief-stats span { color: #627470; font-size: 8pt; }
  .brief-disclaimer { color: #627470; font-size: 8pt; line-height: 1.5; margin: 0 0 14px; }
  .brief-section { border-top: 1px solid #cad8d3; padding: 12px 0; break-inside: avoid; }
  .brief-leader { display: flex; justify-content: space-between; align-items: baseline; gap: 15px; margin-bottom: 5px; }
  .brief-leader > strong { font-size: 10pt; overflow-wrap: anywhere; }
  .brief-leader > span { color: #763c51; font-size: 9pt; font-weight: 600; flex-shrink: 0; }
  .brief-bar-label { display: flex; justify-content: space-between; gap: 14px; font-size: 8.5pt; margin-bottom: 4px; }
  .brief-track { height: 5px; background: #e8f1ee; border-radius: 2px; margin-bottom: 7px; }
  .brief-track span { display: block; height: 100%; background: #24635d; border-radius: inherit; }
  .brief-track--cost span, .brief-ranking-row:first-of-type .brief-track span { background: #763c51; }
  .brief-ratio { font-size: 8.5pt; margin: 10px 0 4px; }
  .brief-ranking > .brief-note { margin-bottom: 10px; }
  .brief-ranking-row { display: grid; grid-template-columns: 18px minmax(0, 1fr) 88px; gap: 7px; margin: 0 0 8px; align-items: start; font-size: 8.5pt; }
  .brief-ranking-row > strong { text-align: right; font-size: 8.5pt; }
  .brief-ranking-row .brief-track { height: 3px; margin: 4px 0 0; }
  .brief-rank { color: #627470; font-size: 7.5pt; padding-top: 1px; }
  .brief-ranking-name { overflow-wrap: anywhere; }
  .brief-footer { display: flex; justify-content: space-between; gap: 15px; margin-top: 18px; padding-top: 9px; border-top: 1px solid #cad8d3; color: #627470; font-size: 7pt; }
  @media print {
    .executive-page { min-height: 9.65in; display: flex; flex-direction: column; }
    .brief-footer { margin-top: auto; }
    .brief-header, .brief-overview { break-inside: avoid; }
  }
  @media screen and (max-width: 620px) {
    .brief-overview { grid-template-columns: 1fr; }
    .brief-stats { border-left: 0; padding-left: 0; }
    .brief-leader { flex-wrap: wrap; }
    .brief-meta { flex-direction: column; gap: 4px; }
    .brief-meta > span { max-width: 100%; text-align: left !important; }
  }
</style></head><body>
<section class="executive-page" aria-label="Executive summary">
<div class="brief-masthead"><strong>CARE IN ACTION / CLINIC IMPACT ESTIMATOR</strong><span>EXECUTIVE SUMMARY</span></div>
<header class="brief-header">
  <h1>${_escapeHTML(clinicName)}</h1>
  <p class="brief-subtitle">Estimated clinic impact report</p>
  <div class="brief-meta"><span>${address}</span><span>${_escapeHTML(period)}</span></div>
</header>
<div class="brief-overview">
  <div><h2>${_escapeHTML(totalLabel)}</h2><p class="brief-total">${_fmt(summary.totalEstimatedValue)}</p><p class="brief-note">Based on ${activityCount} reported ${isVolunteerReport ? "volunteer hours" : "clinical service units"} and reference rates</p></div>
  <div class="brief-stats"><p><strong>${activityCount}</strong><span>${isVolunteerReport ? "volunteer hours" : "reported units"}</span></p>${costReported ? `<p><strong>${_fmt(summary.reportingPeriodClinicCost)}</strong><span>reported clinic cost</span></p>` : ""}</div>
</div>
<p class="brief-disclaimer">${_escapeHTML(AppCopy.summary.shortDisclaimer(summary.impactMethod))}</p>
<section class="brief-section brief-contributor"><h2>Largest estimated contributor</h2>
  <div class="brief-leader"><strong>${_escapeHTML(leaderName)}</strong>${leader ? `<span>${_fmt(leader.estimatedValue)} / ${_sharePercent(leaderShare)}% of total</span>` : ""}</div>
  ${leader ? `<p class="brief-note">${isVolunteerReport ? `${leader.hours.toLocaleString("en-US")} volunteer hours` : `${leader.count.toLocaleString("en-US")} reported units${leader.code ? ` / Code ${_escapeHTML(leader.code)}` : ""}`}</p>` : ""}
</section>
${costComparison}
<section class="brief-section brief-ranking"><h2>${highlights.length > 0 ? `Leading ${isVolunteerReport ? "volunteer roles" : "services"} by estimated value` : "Activity overview"}</h2>
<p class="brief-note">${highlights.length > 0 ? "Highest estimated values among reported activities. The complete activity statement and composition chart follow." : "No activity was reported for this period."}</p>
${highlightHTML}
</section>
<div class="brief-footer"><span>${_escapeHTML(clinicName)}</span><span>SUMMARY / ${_escapeHTML(_methodLabel(summary.impactMethod))}</span></div>
</section>
${hasActivity || costReported ? `<section class="report-chapter" aria-label="Detailed activity statement">
${chapterHeader("Detailed activity statement")}
${volunteerBreakdownHTML}
${budgetHTML}
${hasActivity && !isVolunteerReport ? `<section class="report-section service-breakdown">
  <h2>Clinical Services Breakdown (Ranked by estimated value)</h2>
  <div class="table-wrap"><table>
    <colgroup><col style="width:4%"><col style="width:36%"><col style="width:9%"><col style="width:10%"><col style="width:13%"><col style="width:16%"><col style="width:12%"></colgroup>
    <thead><tr><th scope="col" class="table-serial">S/N</th><th scope="col">Service</th><th class="service-code" scope="col">Code</th><th class="numeric" scope="col">Reported units</th><th class="numeric" scope="col">Reference rate</th><th class="numeric" scope="col">Estimated value</th><th class="numeric" scope="col">Value share</th></tr></thead>
    ${tableBodyHTML(svcRows, `<tr class="table-total"><th colspan="5" class="numeric" scope="row">Clinical services total</th><th class="numeric">${_fmt(summary.clinicalServiceValue)}</th><th class="numeric">${summary.clinicalServiceValue > 0 ? "100.0%" : "0.0%"}</th></tr>`)}
  </table></div>
</section>` : ""}
${!isVolunteerReport ? rateDataNoteHTML : ""}
${clinicalCountsPieHTML}
${hasActivity && isVolunteerReport ? `<section class="report-section">
  <h2>Volunteer Roles (Ranked By Hours)</h2>
  <div class="table-wrap"><table>
    <colgroup><col style="width:4%"><col style="width:30%"><col style="width:18%"><col style="width:12%"><col style="width:17%"><col style="width:19%"></colgroup>
    <thead><tr><th scope="col" class="table-serial">S/N</th><th scope="col">Role</th><th scope="col">Type</th><th class="numeric" scope="col">Volunteer hours</th><th class="numeric" scope="col">Reference rate / hour</th><th class="numeric" scope="col">Estimated value</th></tr></thead>
    ${tableBodyHTML(volRows, `<tr class="table-total"><th colspan="5" class="numeric" scope="row">Total volunteer time value</th><th class="numeric">${_fmt(summary.volunteerValue)}</th></tr>`)}
  </table></div>
</section>` : ""}
${isVolunteerReport ? rateDataNoteHTML : ""}
${volunteerHoursPieHTML}
</section>` : ""}
<section class="report-chapter appendix-page" aria-label="Methodology and sources">
  <div class="appendix-content">
  <div class="appendix-intro">
  <div class="appendix-masthead">${chapterMasthead()}</div>
  ${chapterHeader("Methodology &amp; sources", false)}
  <p class="narrative">${_escapeHTML(impactNarrative)}</p>
  </div>
  <h2>HOW THESE ESTIMATES ARE CALCULATED</h2>
  <ul class="methodology-list">${methodologyItems}</ul>
  ${volunteerSourceHTML}
  <h2>SOURCES AND REFERENCES</h2>
  <ol class="sources">${referenceItems}</ol>
  </div>
  <footer class="appendix-page-footer">
    <p class="appendix-page-footer__about"><strong>About this report:</strong> This report was generated with the Care in Action tool using the activity information entered for the reporting period and the reference rates cited above. Care in Action was developed by the Translational Health Research Center at Texas State University (THRC) in partnership with the Texas Association of Charitable Clinics (TXACC).</p>
    <div class="report-footer"><strong>Care in Action</strong><span>${_escapeHTML(clinicName)} | ${_escapeHTML(_methodLabel(summary.impactMethod))}</span></div>
  </footer>
</section>
</body></html>`;
  }

  function _escapeHTML(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function _formatDate(value) {
    if (!value) return "Not specified";
    const date = new Date(`${value}T00:00:00`);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  return { downloadPDF, downloadExcel };
})();

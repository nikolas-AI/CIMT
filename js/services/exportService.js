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
    const activityLabel = isVolunteerReport
      ? AppCopy.summaryDashboard.volunteerHoursKpi
      : AppCopy.summaryDashboard.clinicalServicesKpi;
    const activityNote = isVolunteerReport
      ? AppCopy.summaryDashboard.donatedTimeNote
      : AppCopy.summaryDashboard.reportedActivityNote;
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

    const svcRows = summary.serviceBreakdown
      .filter(row => row.count > 0)
      .slice()
      .sort((a, b) => b.count - a.count || a.serviceName.localeCompare(b.serviceName))
      .map((row, index) => `
      <tr class="table-row--${index % 2 === 0 ? "odd" : "even"}">
        <td class="table-serial">${index + 1}</td>
        <td>${_escapeHTML(row.serviceName)}</td>
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
      if (rows.length > 1) {
        return `<tbody class="table-opening">${rows[0]}</tbody>
          ${rows.length > 2 ? `<tbody>${rows.slice(1, -1).join("")}</tbody>` : ""}
          <tbody class="table-ending">${rows[rows.length - 1]}${totalRow}</tbody>`;
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

    const budgetHTML = summary.reportingPeriodClinicCost !== null ? `
      <section class="report-section cost-comparison">
        <h2>${_escapeHTML(AppCopy.summaryView.costHeading)}</h2>
        <p class="section-intro">${_escapeHTML(AppCopy.summaryView.costIntro(summary.reportingPeriodClinicCost))}</p>
        <div class="metric-grid metric-grid--two">
          ${metricCard("Reported clinic cost", _fmt(summary.reportingPeriodClinicCost), "Total clinic cost reported for this period.")}
          ${metricCard("Estimated total value", _fmt(summary.totalEstimatedValue), "Estimated value of the activity entered.")}
          ${metricCard(AppCopy.summaryView.valuePerDollarLabel, summary.valueToCostRatio === null ? "—" : `$${summary.valueToCostRatio.toFixed(2)}`, "Informational comparison, not ROI.")}
          ${metricCard(AppCopy.summaryView.benchmarkComparisonLabel, `${Math.abs(summary.benchmarkValueROI || 0).toFixed(1)}% ${summary.benchmarkValueROI > 0 ? "higher" : summary.benchmarkValueROI < 0 ? "lower" : "equal"}`, "Estimated value compared with reported clinic cost.")}
        </div>
        <p class="callout callout--note">${_escapeHTML(AppCopy.summary.costComparisonNote)}</p>
      </section>
    ` : "";

    const serviceImpactHTML = !isVolunteerReport && summary.mostImpactfulService
      ? `<section class="report-section feature">
          <h2>${_escapeHTML(AppCopy.metric.mostImpactful)}</h2>
          <p class="feature__statement"><strong>${_escapeHTML(summary.mostImpactfulService.serviceName)}</strong> had the highest estimated value, with <strong>${summary.mostImpactfulService.count.toLocaleString("en-US")} reported units</strong> and an estimated value of <strong>${_fmt(summary.mostImpactfulService.estimatedValue)}</strong>.</p>
          <p class="feature__meta">${_escapeHTML(AppCopy.summaryDashboard.topContributorStats(
            summary.mostImpactfulService.count.toLocaleString("en-US"),
            _fmt(summary.mostImpactfulService.estimatedValue),
            _sharePercent(summary.mostImpactfulService.clinicalValueShare)
          ))}</p>
          <div class="value-track" role="img" aria-label="${_escapeHTML(summary.mostImpactfulService.serviceName)} contributed ${_escapeHTML(_sharePercent(summary.mostImpactfulService.clinicalValueShare))} percent of estimated service value">
            <span style="width:${Math.min(100, Math.max(0, summary.mostImpactfulService.clinicalValueShare))}%"></span>
          </div>
        </section>`
      : "";

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
    const mostImpactfulVolunteerRole = rankedVolunteerRoles[0] || null;
    const volunteerRoleShare = mostImpactfulVolunteerRole && summary.volunteerValue > 0
      ? mostImpactfulVolunteerRole.estimatedValue / summary.volunteerValue * 100
      : 0;
    const volunteerImpactHTML = mostImpactfulVolunteerRole
      ? `<section class="report-section feature">
          <h2>Most impactful volunteer role</h2>
          <p class="feature__statement"><strong>${_escapeHTML(mostImpactfulVolunteerRole.roleName)}</strong> contributed the largest share of the estimated volunteer value, with <strong>${mostImpactfulVolunteerRole.hours.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} volunteer hours</strong> and an estimated value of <strong>${_fmt(mostImpactfulVolunteerRole.estimatedValue)}</strong>.</p>
          <p class="feature__meta">${_escapeHTML(_sharePercent(volunteerRoleShare))}% of total estimated volunteer value</p>
          <div class="value-track" role="img" aria-label="${_escapeHTML(mostImpactfulVolunteerRole.roleName)} contributed ${_escapeHTML(_sharePercent(volunteerRoleShare))} percent of estimated volunteer value">
            <span style="width:${Math.min(100, Math.max(0, volunteerRoleShare))}%"></span>
          </div>
        </section>`
      : "";

    const topVolunteerRoles = rankedVolunteerRoles.slice(0, 10);
    const volunteerChartHeading = rankedVolunteerRoles.length > 10
      ? "Top ten volunteer roles by estimated value"
      : "Volunteer roles by estimated value";
    const volunteerChartIntro = rankedVolunteerRoles.length > 10
      ? "Showing the ten highest-value reported volunteer roles."
      : "Reported volunteer roles ranked by estimated value.";
    const maximumVolunteerValue = Math.max(
      ...topVolunteerRoles.map(role => role.estimatedValue),
      1
    );
    const volunteerChartHTML = topVolunteerRoles.length > 0
      ? `<section class="report-section chart-section">
          <h2>${volunteerChartHeading}</h2>
          <p class="section-intro">${volunteerChartIntro}</p>
          <div class="chart">
            ${topVolunteerRoles.map(role => {
              const width = Math.min(100, Math.max(0, role.estimatedValue / maximumVolunteerValue * 100));
              const hours = role.hours.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
              return `<div class="chart-row">
                <div class="chart-row__label"><span>${_escapeHTML(role.roleName)} (${hours} volunteer hours)</span><strong>${_fmt(role.estimatedValue)}</strong></div>
                <div class="value-track" role="img" aria-label="${_escapeHTML(role.roleName)}: ${_fmt(role.estimatedValue)} estimated value from ${hours} volunteer hours">
                  <span style="width:${width}%"></span>
                </div>
              </div>`;
            }).join("")}
          </div>
        </section>`
      : "";

    const rankedServices = summary.serviceImpactRanking?.byValue || [];
    const topServices = rankedServices.slice(0, 10);
    const serviceChartHeading = rankedServices.length > 10
      ? "Top ten services by estimated value"
      : "Services by estimated value";
    const serviceChartIntro = rankedServices.length > 10
      ? "Showing the ten highest-value reported services."
      : "Reported services ranked by estimated value.";
    const maximumServiceValue = Math.max(
      ...topServices.map(service => service.estimatedValue),
      1
    );
    const serviceChartHTML = !isVolunteerReport && topServices.length > 0
      ? `<section class="report-section chart-section">
          <h2>${serviceChartHeading}</h2>
          <p class="section-intro">${serviceChartIntro}</p>
          <div class="chart">
            ${topServices.map(row => {
              const width = Math.min(100, Math.max(0, row.estimatedValue / maximumServiceValue * 100));
              return `<div class="chart-row">
                <div class="chart-row__label"><span>${_escapeHTML(row.serviceName)} (${row.count.toLocaleString("en-US")} counts)</span><strong>${_fmt(row.estimatedValue)}</strong></div>
                <div class="value-track" aria-hidden="true"><span style="width:${width}%"></span></div>
              </div>`;
            }).join("")}
          </div>
        </section>`
      : "";

    const volunteerHoursPieHTML = isVolunteerReport
      ? CompositionPieChart.render({
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
      })
      : "";
    const clinicalCountsPieHTML = !isVolunteerReport
      ? CompositionPieChart.render({
        id: "clinical-services-composition",
        title: "Clinical services by count",
        description: "Each slice shows a service type's share of total reported counts. Small shares are combined into Other.",
        otherLabel: "Other services",
        unitLabel: "services",
        formatValue: value => value.toLocaleString("en-US"),
        totalInHeading: true,
        items: summary.serviceBreakdown.map(row => ({
          label: row.serviceDescription,
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

    const methodologyItems = AppCopy.summaryView.methodologyBullets(summary.impactMethod)
      .map(item => `<li>${_escapeHTML(item)}</li>`)
      .join("");
    const volunteerSourceHTML = isVolunteerReport && VOLUNTEER_RATE_SOURCE
      ? `<section class="report-section">
          <h2>Volunteer Rate Source</h2>
          <p class="source-attribution"><strong>${_escapeHTML(VOLUNTEER_RATE_SOURCE.name)}${VOLUNTEER_RATE_SOURCE.publicationYear ? ` (${VOLUNTEER_RATE_SOURCE.publicationYear})` : ""}</strong><br>${_escapeHTML(VOLUNTEER_RATE_SOURCE.description)}</p>
        </section>`
      : "";

    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${_escapeHTML(AppCopy.exportCopy.pdfTitle)} — ${_escapeHTML(clinicName)}</title>
<style>
  :root {
    color-scheme: light;
    --paper: #F8F5EF;
    --surface: #FFFFFF;
    --border: #DFE7E3;
    --navy: #142E2C;
    --slate: #627470;
    --muted: #8C9A96;
    --teal: #295E58;
    --oxblood: #5B2638;
    --impact-bg: #EAF0ED;
    --soft-teal: #EDF1EF;
    --soft-rose: #EEE7E8;
  }
  @page { size: letter portrait; margin: 0.55in; }
  * { box-sizing: border-box; }
  body {
    max-width: 900px;
    margin: 32px auto;
    padding: 0 24px;
    color: var(--navy);
    background: var(--paper);
    font: 13px/1.6 Inter, "Segoe UI", Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  p { margin: 0 0 10px; }
  .hero {
    margin-bottom: 20px;
    padding: 30px 28px;
    text-align: center;
    background: var(--impact-bg);
    border: 1px solid #B9D4CF;
    border-top: 4px solid var(--teal);
    border-radius: 8px;
    box-shadow: 0 4px 14px rgba(20,46,44,.08);
  }
  .status {
    display: inline-block;
    margin: 0 0 14px;
    padding: 5px 12px;
    color: var(--teal);
    background: rgba(255,255,255,.72);
    border: 1px solid #B9D4CF;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
  }
  .eyebrow {
    margin: 0 0 8px;
    color: var(--slate);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  h1 {
    margin: 0 auto 8px;
    color: var(--oxblood);
    font: 700 25px/1.2 "DM Serif Display", Georgia, serif;
    overflow-wrap: anywhere;
  }
  .address, .period { color: var(--slate); font-size: 11px; }
  .period { margin-bottom: 20px; }
  .total {
    margin: 0 0 5px;
    color: var(--navy);
    font: 48px/1.05 "DM Serif Display", Georgia, serif;
  }
  .total-label { margin: 0; color: var(--slate); font-size: 14px; }
  .metric-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 0 0 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 3px 12px rgba(20,46,44,.07);
  }
  .metric-grid--two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .metric-card { min-width: 0; padding: 14px 16px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .metric-card:nth-child(3n) { border-right: 0; }
  .metric-grid--two .metric-card:nth-child(3n) { border-right: 1px solid var(--border); }
  .metric-grid--two .metric-card:nth-child(2n) { border-right: 0; }
  .metric-card__label { min-height: 2.5em; margin: 0 0 5px; color: var(--slate); font-size: 9px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; }
  .metric-card__value { margin: 0 0 4px; color: var(--navy); font: 24px/1.1 "DM Serif Display", Georgia, serif; overflow-wrap: anywhere; }
  .metric-card__note { margin: 0; color: var(--muted); font-size: 10px; }
  .glance-heading {
    margin: 0;
    padding: 14px 18px;
    color: var(--navy);
    background: var(--surface);
    border: 1px solid var(--border);
    border-bottom: 0;
    border-radius: 8px 8px 0 0;
    font-size: 15px;
    letter-spacing: normal;
    text-transform: none;
  }
  .glance-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 0 0 8px 8px;
    overflow: hidden;
    box-shadow: 0 3px 12px rgba(20,46,44,.07);
  }
  .glance-card {
    min-width: 0;
    padding: 18px 20px;
    border-top: 3px solid var(--teal);
    border-right: 1px solid var(--border);
  }
  .glance-card:last-child { border-right: 0; }
  .glance-card__label {
    min-height: 2.5em;
    margin: 0 0 8px;
    color: var(--muted);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .07em;
    text-transform: uppercase;
  }
  .glance-card__value {
    margin: 0 0 8px;
    color: var(--navy);
    font: 29px/1.05 "DM Serif Display", Georgia, serif;
    overflow-wrap: anywhere;
  }
  .glance-card__note {
    min-height: 3em;
    margin: 0;
    color: var(--slate);
    font-size: 10px;
    line-height: 1.5;
  }
  .glance-card__share {
    height: 5px;
    margin-top: 14px;
    background: #DFE7E3;
  }
  .glance-card__share span { display: block; height: 100%; background: var(--teal); }
  .callout {
    margin: 0 0 18px;
    padding: 14px 16px;
    color: var(--slate);
    background: #F0E9DF;
    border: 1px solid #E1D6C9;
    border-left: 5px solid var(--oxblood);
    border-radius: 8px;
    box-shadow: 0 3px 12px rgba(20,46,44,.07);
  }
  .callout strong { color: var(--navy); }
  .callout--note { margin-top: 12px; font-size: 10px; }
  .narrative { margin: 0 0 20px; color: var(--slate); font-size: 13px; line-height: 1.7; }
  .report-section { margin: 0 0 22px; break-inside: auto; page-break-inside: auto; }
  .appendix-page {
    page-break-before: always;
    padding: 18px 20px;
  }
  .appendix-page h2 {
    margin-bottom: 12px;
    padding-bottom: 6px;
    color: var(--oxblood);
    border-bottom-color: rgba(164,84,104,.35);
    text-transform: uppercase;
    letter-spacing: .08em;
  }
  .appendix-page p {
    margin: 0 0 8px;
    color: var(--slate);
    font-size: 12px;
    line-height: 1.6;
  }
  .appendix-page ul {
    margin: 0 0 14px 18px;
    padding-left: 18px;
    color: var(--slate);
  }
  .appendix-page li {
    margin: 0 0 8px;
    font-size: 12px;
    line-height: 1.6;
  }
  h2 {
    margin: 0 0 10px;
    padding-bottom: 7px;
    color: var(--teal);
    border-bottom: 1px solid #C9D8D2;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    break-after: avoid;
  }
  .section-intro, .section-note { color: var(--slate); font-size: 11px; }
  .section-note { margin: 8px 0 0; font-size: 10px; }
  .rate-data-note { margin-bottom: 28px; }
  .feature {
    padding: 18px;
    background: #ECEFED;
    border: 1px solid #D2DAD6;
    border-left: 5px solid var(--teal);
    border-radius: 8px;
    box-shadow: 0 3px 12px rgba(20,46,44,.07);
  }
  .feature h2 { color: var(--navy); border-bottom-color: #C8D2CD; }
  .feature__statement { margin: 0; font: 16px/1.6 Inter, "Segoe UI", Arial, sans-serif; }
  .feature__statement strong { color: var(--navy); }
  .feature__meta { margin: 10px 0 0; color: var(--slate); font-size: 10px; font-weight: 700; }
  .feature .value-track { height: 14px; margin-top: 6px; }
  .feature .value-track span { background: var(--oxblood); }
  .chart { padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 3px 12px rgba(20,46,44,.07); }
  .chart-row { margin-bottom: 12px; }
  .chart-row:last-child { margin-bottom: 0; }
  .chart-row__label { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 5px; color: var(--slate); font-size: 11px; }
  .chart-row__label strong { flex-shrink: 0; color: var(--navy); }
  .value-track { height: 7px; overflow: hidden; background: #DFE7E3; border-radius: 999px; }
  .chart .value-track { height: 14px; }
  .value-track span { display: block; height: 100%; background: var(--teal); border-radius: inherit; }
  .composition-pie { margin-bottom: 36px; padding: 18px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 3px 12px rgba(20,46,44,.07); break-inside: avoid; page-break-inside: avoid; }
  .composition-pie .summary-section__intro { margin-bottom: 14px; }
  .composition-pie h2 { color: var(--oxblood); font: 700 16px/1.3 "DM Serif Display", Georgia, serif; letter-spacing: normal; text-transform: none; border-bottom: 2px solid var(--oxblood); }
  .composition-pie__content { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; min-width: 0; }
  .composition-pie__chart { display: block; width: min(100%, 440px); height: auto; margin: 0 auto; overflow: visible; }
  .composition-pie__shape { stroke: #fff; stroke-width: .6px; stroke-linejoin: round; }
  .composition-pie__depth-shape { filter: brightness(.68); stroke: #fff; stroke-width: .6px; stroke-linejoin: round; }
  .composition-pie__slice-number-bg { fill: #fff; stroke: var(--navy); stroke-width: .8px; pointer-events: none; }
  .composition-pie__leader { stroke: var(--slate); stroke-width: .8px; pointer-events: none; }
  .composition-pie__slice-number { fill: var(--navy); font-size: 5px; font-weight: 700; pointer-events: none; }
  .composition-pie__slice-percentage { fill: var(--navy); stroke: #fff; stroke-width: 1.5px; paint-order: stroke; font-size: 4px; font-weight: 700; pointer-events: none; }
  .composition-pie__total { fill: var(--navy); font-size: 12px; font-weight: 700; }
  .composition-pie__total-label { fill: var(--slate); font-size: 6px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; }
  .composition-pie__heading-total { display: block; margin-top: 4px; color: var(--navy); font: 700 12px/1.4 Inter, "Segoe UI", Arial, sans-serif; letter-spacing: normal; text-transform: none; }
  .composition-pie__legend { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 14px; min-width: 0; margin: 0; padding: 0; list-style: none; }
  .composition-pie__item { display: grid; grid-template-columns: 13px 7px minmax(0, 1fr); align-items: center; gap: 3px; min-width: 0; padding: 2px 0; background: transparent; font-size: 7px; }
  .composition-pie__item--percentage-only { grid-template-columns: 13px 7px minmax(0, 1fr); }
  .composition-pie__details { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 3px; min-width: 0; }
  .composition-pie__number { display: inline-grid; width: 13px; height: 13px; place-items: center; border: 1px solid var(--border); border-radius: 50%; background: #fff; color: var(--navy); font-size: 8px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; }
  .composition-pie__swatch { width: 7px; height: 7px; border-radius: 50%; background: var(--pie-color); }
  .composition-pie__label { min-width: 0; overflow-wrap: anywhere; }
  .composition-pie__value, .composition-pie__share { color: var(--navy); white-space: nowrap; }
  .composition-pie__value { color: var(--slate); }
  .composition-pie__share { min-width: 20px; text-align: right; font-size: 6px; font-weight: 700; }
  .table-wrap { margin-top: 8px; border-radius: 8px; }
  table { width: 100%; margin: 0; border: 1px solid var(--border); border-collapse: separate; border-spacing: 0; border-radius: 8px; box-shadow: 0 3px 12px rgba(20,46,44,.07); font-size: 10px; }
  thead { display: table-header-group; break-after: avoid; page-break-after: avoid; }
  tbody.table-opening, tbody.table-ending { break-inside: avoid; page-break-inside: avoid; }
  th { padding: 8px; color: #FFFFFF; background: var(--teal); font-size: 9px; font-weight: 700; text-align: left; }
  td { padding: 7px 8px; color: var(--slate); border-bottom: 1px solid var(--border); overflow-wrap: anywhere; }
  .table-row--even td { background: #F3F6F4; }
  .table-row--odd td { background: var(--surface); }
  .table-serial { width: 3.5em; text-align: center; font-variant-numeric: tabular-nums; }
  thead th:first-child { border-top-left-radius: 7px; }
  thead th:last-child { border-top-right-radius: 7px; }
  tbody.table-ending tr:last-child > :first-child { border-bottom-left-radius: 7px; }
  tbody.table-ending tr:last-child > :last-child { border-bottom-right-radius: 7px; }
  .service-code { width: 6em; min-width: 6em; white-space: nowrap; }
  .numeric { text-align: right; font-variant-numeric: tabular-nums; }
  .table-total th { color: var(--navy); background: #F0E9DF; }
  .sources { padding-left: 18px; }
  .sources li { margin: 0 0 9px; color: var(--slate); font-size: 10px; }
  .sources a { color: var(--teal); overflow-wrap: anywhere; }
  .sources span { color: var(--muted); }
  .source-attribution { color: var(--slate); font-size: 10px; }
  .source-attribution strong { color: inherit; font-weight: 700; }
  @media screen and (max-width: 620px) {
    body { margin: 12px auto; padding: 0 12px; }
    .hero { padding: 24px 16px; }
    .metric-grid, .metric-grid--two { grid-template-columns: 1fr; }
    .metric-card, .metric-card:nth-child(3n), .metric-grid--two .metric-card:nth-child(3n) { border-right: 0; }
    .total { font-size: 40px; }
    .table-wrap { overflow-x: auto; }
    table { min-width: 620px; }
    .composition-pie__chart { width: min(100%, 360px); }
  }
  @media print {
    body { max-width: none; margin: 0; padding: 0; background: #fff; font-size: 10pt; }
    .hero {
      margin-bottom: 14px;
      padding: 19px 22px;
    }
    .status { margin-bottom: 8px; padding: 4px 10px; }
    .eyebrow { margin-bottom: 6px; }
    h1 { margin-bottom: 6px; font-size: 23px; }
    .period { margin-bottom: 11px; }
    .total { margin-bottom: 4px; font-size: 42px; }
    .total-label { font-size: 13px; }
    .callout { margin-bottom: 14px; padding: 11px 14px; }
    .metric-grid { margin-bottom: 14px; }
    .metric-card { padding: 10px 14px; }
    .metric-card__label { min-height: 0; margin-bottom: 4px; }
    .metric-card__value { font-size: 22px; }
    .metric-card__note { font-size: 9.5px; }
    .narrative { margin-bottom: 14px; font-size: 12px; }
    .feature, .volunteer-value-glance { margin-bottom: 14px; }
    .feature { padding: 14px; }
    .volunteer-value-glance { break-inside: avoid; page-break-inside: avoid; }
    .glance-heading { padding: 10px 12px; }
    .glance-grid { margin-bottom: 14px; }
    .glance-card { padding: 11px 12px; }
    .glance-card__label { min-height: 0; margin-bottom: 5px; font-size: 8px; }
    .glance-card__value { margin-bottom: 5px; font-size: 24px; }
    .glance-card__note { min-height: 0; font-size: 9px; }
    .glance-card__share { height: 4px; margin-top: 9px; }
    .hero, .metric-grid, .feature, .chart-section, .callout,
    .cost-comparison { break-inside: avoid; page-break-inside: avoid; }
    .report-section h2, .report-section .section-intro { break-after: avoid; page-break-after: avoid; }
    table { break-inside: auto; page-break-inside: auto; }
    tbody.table-opening, tbody.table-ending { break-inside: avoid; page-break-inside: avoid; }
    tr, .sources li { break-inside: avoid; page-break-inside: avoid; }
    .table-wrap { overflow: visible; }
    p { orphans: 2; widows: 2; }
    a { color: inherit; text-decoration: none; }
  }
</style></head><body>
<header class="hero">
  <p class="status">&#10003; ${_escapeHTML(AppCopy.summaryDashboard.reportComplete)}</p>
  <p class="eyebrow">${_escapeHTML(AppCopy.summaryDashboard.eyebrow)}</p>
  <h1>${_escapeHTML(clinicName)}’s estimated community impact</h1>
  <p class="address">${address}</p>
  <p class="period">Reporting period: ${_escapeHTML(period)}</p>
  <p class="total">${_fmt(summary.totalEstimatedValue)}</p>
  <p class="total-label">${_escapeHTML(totalLabel)}</p>
</header>
<p class="callout">${_escapeHTML(AppCopy.summary.shortDisclaimer(summary.impactMethod))}</p>
<section class="metric-grid" aria-label="${_escapeHTML(AppCopy.summaryDashboard.kpiHeading)}">
  ${metricCard(activityLabel, activityCount, activityNote)}
  ${metricCard(AppCopy.summaryDashboard.estimatedCommunityValueKpi, _fmt(summary.totalEstimatedValue), AppCopy.summaryDashboard.estimatedCommunityValueNote)}
  ${summary.reportingPeriodClinicCost !== null
    ? metricCard(AppCopy.summaryDashboard.valuePerDollarKpi, summary.valueToCostRatio === null ? "—" : `$${summary.valueToCostRatio.toFixed(2)}`, AppCopy.summaryDashboard.valuePerDollarNote)
    : ""}
</section>
<p class="narrative">${_escapeHTML(impactNarrative)}</p>
${serviceImpactHTML}
${serviceChartHTML}
${volunteerImpactHTML}
${volunteerBreakdownHTML}
${volunteerChartHTML}
${budgetHTML}
${!isVolunteerReport ? `<section class="report-section service-breakdown">
  <h2>Clinical Services Breakdown (Ranked by counts)</h2>
  <div class="table-wrap"><table>
    <thead><tr><th scope="col" class="table-serial">S/N</th><th scope="col">Service</th><th class="service-code" scope="col">Code</th><th class="numeric" scope="col">Reported units</th><th class="numeric" scope="col">Reference rate</th><th class="numeric" scope="col">Estimated value</th><th class="numeric" scope="col">Value share</th></tr></thead>
    ${tableBodyHTML(svcRows, `<tr class="table-total"><th colspan="5" class="numeric" scope="row">Clinical services total</th><th class="numeric">${_fmt(summary.clinicalServiceValue)}</th><th class="numeric">${summary.clinicalServiceValue > 0 ? "100.0%" : "0.0%"}</th></tr>`)}
  </table></div>
</section>` : ""}
${!isVolunteerReport ? rateDataNoteHTML : ""}
${clinicalCountsPieHTML}
${isVolunteerReport ? `<section class="report-section">
  <h2>Volunteer Roles (Ranked By Hours)</h2>
  <div class="table-wrap"><table>
    <thead><tr><th scope="col" class="table-serial">S/N</th><th scope="col">Role</th><th scope="col">Type</th><th class="numeric" scope="col">Volunteer hours</th><th class="numeric" scope="col">Reference rate / hour</th><th class="numeric" scope="col">Estimated value</th></tr></thead>
    ${tableBodyHTML(volRows, `<tr class="table-total"><th colspan="5" class="numeric" scope="row">Total volunteer time value</th><th class="numeric">${_fmt(summary.volunteerValue)}</th></tr>`)}
  </table></div>
</section>` : ""}
${isVolunteerReport ? rateDataNoteHTML : ""}
${volunteerHoursPieHTML}
<section class="report-section appendix-page">
  <h2>HOW THESE ESTIMATES ARE CALCULATED</h2>
  <ul>${methodologyItems}</ul>
  <h2>SOURCES AND REFERENCES</h2>
  <ul>${referenceItems}</ul>
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

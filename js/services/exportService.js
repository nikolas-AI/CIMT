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
    win.document.write(_buildPrintHTML(summary));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  /**
  * Download an Excel-formatted breakdown of the impact data.
   * @param {ImpactSummary} summary
   */
  function downloadExcel(summary) {
    if (typeof XLSX === "undefined") {
      alert("The Excel export library could not be loaded. Please check your internet connection and try again.");
      return;
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
      ["Impact Method", _methodLabel(summary.impactMethod)],
    ];
    const totalEstimatedValueRow = rows.length;
    rows.push(["Total Estimated Value", summary.totalEstimatedValue]);
    if (summary.impactMethod === "volunteerHours") {
      rows.push(["Medical Professional Volunteer Value", summary.medicalProfessionalVolunteerValue]);
      rows.push(["Non-Medical Volunteer Value", summary.nonMedicalVolunteerValue]);
    }
    rows.push([]);
    let budgetSectionRow = null;
    let budgetRows = [];
    if (summary.reportingPeriodClinicCost !== null) {
      budgetSectionRow = rows.length;
      rows.push(["Reported Investment and Estimated Benchmark Value"]);
      budgetRows = [
        ["Reported Clinic Cost", summary.reportingPeriodClinicCost],
        ["Reporting Period Days", summary.reportingPeriodDays],
        ["Estimated Total Value", summary.totalEstimatedValue],
        ["Estimated Benchmark Value per $1 of Reported Clinic Cost", summary.valueToCostRatio],
        ["Benchmark-Value Comparison (%)", summary.benchmarkValueROI],
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
      rows.push(["Most Impactful Reported Service"]);
      rows.push(summary.mostImpactfulService
        ? ["Service", summary.mostImpactfulService.serviceName, "Reported Count", summary.mostImpactfulService.count, summary.mostImpactfulService.estimatedValue]
        : ["No clinical services were reported for this period."]);
      rows.push(["Ranking Note", AppCopy.summary.rankingNote]);
      rows.push([]);
      valueRankingSectionRow = rows.length;
      rows.push(["Service Ranking by Estimated Benchmark Value"]);
      valueRankingHeaderRow = rows.length;
      rows.push(["Rank", "Service", "Reported Count", "Estimated Benchmark Value", "Share of Total Estimated Clinical Value"]);
      rows.push(...(summary.serviceImpactRanking?.byValue || []).map((row, index) => [
        index + 1, row.serviceName, row.count, row.estimatedValue, row.clinicalValueShare / 100,
      ]));
      valueRankingEndRow = rows.length;
      rows.push([]);
      visitRankingSectionRow = rows.length;
      rows.push(["Service Ranking by Reported Count"]);
      visitRankingHeaderRow = rows.length;
      rows.push(["Rank", "Service", "Reported Count", "Estimated Benchmark Value", "Share of Total Estimated Clinical Value"]);
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
      rows.push(["Service", "CPT/HCPCS Code", "Reported Service Count", "Benchmark Rate", "Estimated Benchmark Value"]);
      rows.push(...summary.serviceBreakdown.map(row => [
          row.serviceName, row.code, row.count, row.benchmarkRate, row.estimatedValue,
        ]));
      clinicalTotalRow = rows.length;
      rows.push(["", "", "", "Clinical Total", summary.clinicalServiceValue]);
    }
    rows.push([]);
    let volunteerSectionRow = null;
    let volunteerHeaderRow = null;
    let volunteerTotalRow = null;
    let nonMedicalVolunteerTotalRow = null;
    if (summary.impactMethod === "volunteerHours") {
      volunteerSectionRow = rows.length;
      rows.push(["Volunteer Contributions"]);
      volunteerHeaderRow = rows.length;
      rows.push(["Role", "Category", "Volunteer Hours", "Benchmark Rate / Hour", "Estimated Volunteer Contribution Value"]);
      rows.push(...summary.volunteerBreakdown.map(row => [
          row.roleName, row.category, row.hours, row.benchmarkRate, row.estimatedValue,
        ]));
      volunteerTotalRow = rows.length;
      rows.push(["", "", "", "Estimated Volunteer Impact", summary.volunteerValue]);
      nonMedicalVolunteerTotalRow = rows.length;
      rows.push(["", "", "", "Non-Medical Volunteer Value", summary.nonMedicalVolunteerValue]);
    }
    rows.push([]);
    const disclaimerSectionRow = rows.length;
    rows.push(["Disclaimer"]);
    const disclaimerRow = rows.length;
    rows.push([AppCopy.summary.shortDisclaimer]);

    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!cols"] = [
      { wch: 34 }, { wch: 22 }, { wch: 14 }, { wch: 20 }, { wch: 20 },
    ];
    const serviceImpactSectionRow = summary.impactMethod === "clinicalServices"
      ? rows.findIndex(row => row[0] === "Most Impactful Reported Service")
      : null;
    sheet["!merges"] = [
      ...[0, ...(budgetSectionRow === null ? [] : [budgetSectionRow]), ...(serviceImpactSectionRow === null ? [] : [serviceImpactSectionRow]),
        ...(valueRankingSectionRow === null ? [] : [valueRankingSectionRow]), ...(visitRankingSectionRow === null ? [] : [visitRankingSectionRow]), ...(clinicalSectionRow === null ? [] : [clinicalSectionRow]), ...(volunteerSectionRow === null ? [] : [volunteerSectionRow]),
        disclaimerSectionRow, disclaimerRow]
        .map(row => ({ s: { r: row, c: 0 }, e: { r: row, c: 4 } })),
    ];

    const boldRows = [0, ...(serviceImpactSectionRow === null ? [] : [serviceImpactSectionRow]), ...(valueRankingSectionRow === null ? [] : [valueRankingSectionRow, valueRankingHeaderRow]),
      ...(visitRankingSectionRow === null ? [] : [visitRankingSectionRow, visitRankingHeaderRow]), ...(clinicalSectionRow === null ? [] : [clinicalSectionRow]), ...(clinicalHeaderRow === null ? [] : [clinicalHeaderRow, clinicalTotalRow]),
      ...(volunteerSectionRow === null ? [] : [volunteerSectionRow, volunteerHeaderRow, volunteerTotalRow, nonMedicalVolunteerTotalRow]), disclaimerSectionRow];
    if (budgetSectionRow !== null) boldRows.push(budgetSectionRow);
    const styleRow = (rowIndex, style) => {
      for (let columnIndex = 0; columnIndex < 5; columnIndex += 1) {
        const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })];
        if (cell) cell.s = style;
      }
    };
    boldRows.forEach(rowIndex => styleRow(rowIndex, { font: { bold: true } }));
    [1, 2, 3, 4].forEach(rowIndex => {
      const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })];
      if (cell) cell.s = { font: { bold: true } };
    });
    sheet["A1"].s = { font: { bold: true, sz: 16 }, alignment: { horizontal: "left" } };
    sheet[XLSX.utils.encode_cell({ r: disclaimerRow, c: 0 })].s = {
      font: { italic: true, color: { rgb: "475C8A" } },
      alignment: { wrapText: true },
    };

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
      formatCurrency(nonMedicalVolunteerTotalRow, 4);
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, AppCopy.exportCopy.workbookSummary);
    const xlsxData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    _triggerDownload(
      xlsxData,
      `${_safeFilename(summary.clinicName)}-impact-breakdown.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  }

  // ---------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------

  function _fmt(value) {
    // Exports keep two decimal places so downloaded data retains full rate detail.
    // Exported rates and totals use two decimal places so the data file keeps
    // more precision than the abbreviated whole-dollar UI formatting.
    return typeof value === "number"
      ? value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })
      : value;
  }

  function _methodLabel(method) {
    return method === "volunteerHours"
      ? "Impact by Volunteer Hours"
      : "Impact by Clinical Services";
  }

  function _triggerDownload(content, filename, mimeType) {
    // A temporary browser URL downloads generated content without sending it to a server.
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
    // Keep the filename readable while removing characters that are unsafe in filenames.
    // Keep the downloaded filename readable while removing unsafe characters.
    return (name || "clinic").replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);
  }

  function _buildPrintHTML(summary) {
    // Build the printable page as HTML so browsers can preserve reference links
    // when the user chooses "Save as PDF".
    // Build the printable document as HTML so browsers can preserve clickable
    // reference links when the user chooses "Save as PDF".
    const svcRows = summary.serviceBreakdown.map(r => `
      <tr>
        <td>${r.serviceName}</td><td>${r.code}</td>
        <td style="text-align:right">${r.count}</td>
        <td style="text-align:right">${_fmt(r.benchmarkRate)}</td>
        <td style="text-align:right">${_fmt(r.estimatedValue)}</td>
      </tr>
    `).join("");

    const volRows = summary.volunteerBreakdown.map(r => `
      <tr>
        <td>${r.roleName}</td>
        <td>${r.category}</td>
        <td style="text-align:right">${r.hours.toFixed(1)}</td>
        <td style="text-align:right">${_fmt(r.benchmarkRate)}</td>
        <td style="text-align:right">${_fmt(r.estimatedValue)}</td>
      </tr>
    `).join("");

    const referenceItems = REFERENCES.map(ref => `
      <li>
        <a href="${_escapeHTML(ref.url)}">${_escapeHTML(ref.title)}</a>
        — ${_escapeHTML(ref.organization)}${ref.year ? ` (${ref.year})` : ""}.
        ${ref.description ? `<br><span>${_escapeHTML(ref.description)}</span>` : ""}
      </li>
    `).join("");

    const budgetHTML = summary.reportingPeriodClinicCost !== null ? `
      <h2>${AppCopy.summaryView.costHeading}</h2>
      <table>
        <tbody>
          <tr><th>Reported clinic cost</th><td style="text-align:right">${_fmt(summary.reportingPeriodClinicCost)}</td></tr>
          <tr><th>Estimated total value</th><td style="text-align:right">${_fmt(summary.totalEstimatedValue)}</td></tr>
          <tr><th>${AppCopy.summaryView.valuePerDollarLabel}</th><td style="text-align:right">$${summary.valueToCostRatio.toFixed(2)}</td></tr>
          <tr><th>${AppCopy.summaryView.benchmarkComparisonLabel}</th><td style="text-align:right">${Math.abs(summary.benchmarkValueROI || 0).toFixed(1)}% ${summary.benchmarkValueROI > 0 ? "higher" : summary.benchmarkValueROI < 0 ? "lower" : "equal"}</td></tr>
        </tbody>
      </table>
      <p class="disclaimer">${AppCopy.summary.costComparisonNote}</p>
    ` : "";

    const serviceImpactHTML = summary.impactMethod === "clinicalServices" && summary.mostImpactfulService
      ? `<h2>${AppCopy.metric.mostImpactful}</h2><p><strong>${_escapeHTML(summary.mostImpactfulService.serviceName)}</strong> represented the largest share of reported clinical service value, with <strong>${summary.mostImpactfulService.count.toLocaleString("en-US")} services</strong> and an estimated benchmark value of <strong>${_fmt(summary.mostImpactfulService.estimatedValue)}</strong>.</p><p class="disclaimer">This service accounted for ${summary.mostImpactfulService.clinicalValueShare.toFixed(1)}% of the estimated clinical service value reported for this period.</p>`
      : summary.impactMethod === "clinicalServices"
        ? `<h2>${AppCopy.metric.mostImpactful}</h2><p>${AppCopy.summary.emptyState}</p>`
        : "";

    const serviceRankingHTML = summary.impactMethod === "clinicalServices" && summary.serviceImpactRanking?.byValue.length > 0
      ? [
        ["Service ranking by estimated benchmark value", summary.serviceImpactRanking.byValue],
        ["Service ranking by reported count", summary.serviceImpactRanking.byVisits],
      ].map(([heading, rows]) => `
        <h2>${heading}</h2>
        <table><thead><tr><th>Rank</th><th>Service</th><th style="text-align:right">Reported count</th><th style="text-align:right">Estimated benchmark value</th><th style="text-align:right">Share of total estimated clinical value</th></tr></thead>
        <tbody>${rows.map((row, index) => `<tr><td>${index + 1}</td><td>${_escapeHTML(row.serviceName)}</td><td style="text-align:right">${row.count.toLocaleString("en-US")}</td><td style="text-align:right">${_fmt(row.estimatedValue)}</td><td style="text-align:right">${row.clinicalValueShare.toFixed(1)}%</td></tr>`).join("")}</tbody></table>
      `).join("")
      : "";

    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Impact Summary — ${summary.clinicName}</title>
<style>
  @page { margin: 0; }
  body { font-family: Arial, sans-serif; max-width: 720px; margin: 40px auto; color: #1A2340; font-size: 13px; }
  h1 { font-size: 1.6em; margin-bottom: 4px; }
  h2 { font-size: 1em; text-transform: uppercase; letter-spacing: 0.06em; color: #8492B0; margin: 24px 0 8px; border-bottom: 1px solid #DDE2EE; padding-bottom: 4px; }
  .total { font-size: 2.5em; font-weight: bold; color: #1A2340; margin: 8px 0 4px; }
  .label { color: #475C8A; margin-bottom: 4px; }
  .clinic-name { color: #C27A2B; font-size: 1.25em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 6px; }
  .disclaimer { font-size: 0.85em; color: #8492B0; border: 1px solid #DDE2EE; padding: 10px 14px; border-radius: 6px; margin: 12px 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { text-align: left; padding: 6px 8px; background: #F8F9FC; font-size: 0.8em; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #DDE2EE; }
  td { padding: 6px 8px; border-bottom: 1px solid #F0F2F7; }
  @media print { body { margin: 20px; } }
</style></head><body>
<p class="clinic-name">${_escapeHTML(summary.clinicName)}</p>
<p style="color:#475C8A;margin:0 0 4px">${_escapeHTML(summary.streetAddress)}, ${_escapeHTML(summary.city)}, ${_escapeHTML(summary.state)} ${_escapeHTML(summary.zipCode)}</p>
<p style="color:#475C8A;margin:0 0 12px">Reporting period: ${_formatDate(summary.reportingPeriodFrom)} - ${_formatDate(summary.reportingPeriodTo)}</p>
<h1 style="font-family:Georgia,serif">${AppCopy.exportCopy.pdfTitle}</h1>
<p class="total">${_fmt(summary.totalEstimatedValue)}</p>
<p class="label">${summary.impactMethod === "volunteerHours" ? "Estimated volunteer impact" : "Estimated clinical impact"}</p>
<p class="label">Impact method: ${_methodLabel(summary.impactMethod)}</p>
<p class="disclaimer">${AppCopy.summary.shortDisclaimer}</p>
${budgetHTML}
${serviceImpactHTML}
${serviceRankingHTML}
${summary.impactMethod === "clinicalServices" ? `<h2>Clinical Services</h2>
<table><thead><tr><th>Service</th><th>Code</th><th style="text-align:right">Reported count</th><th style="text-align:right">Benchmark rate</th><th style="text-align:right">Estimated benchmark value</th></tr></thead>
<tbody>${svcRows}</tbody><tfoot><tr><th colspan="4" style="text-align:right">Clinical total</th><th style="text-align:right">${_fmt(summary.clinicalServiceValue)}</th></tr></tfoot></table>` : ""}
${summary.impactMethod === "volunteerHours" ? `<h2>Volunteer Contributions</h2>
<table><thead><tr><th>Role</th><th>Category</th><th style="text-align:right">Volunteer hours</th><th style="text-align:right">Benchmark rate / hour</th><th style="text-align:right">Estimated contribution value</th></tr></thead>
<tbody>${volRows}</tbody><tfoot><tr><th colspan="4" style="text-align:right">Estimated volunteer impact</th><th style="text-align:right">${_fmt(summary.volunteerValue)}</th></tr></tfoot></table>` : ""}
<h2>Sources and references</h2>
<ul style="font-size:0.85em;color:#475C8A;padding-left:20px">
  ${referenceItems}
</ul>
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

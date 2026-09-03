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
      alert("Please allow pop-ups to download the PDF summary.");
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
      ["Clinic Impact Estimator"],
      ["Clinic", summary.clinicName],
      ["Reporting Period From", summary.reportingPeriodFrom],
      ["Reporting Period To", summary.reportingPeriodTo],
      ["Total Estimated Value", summary.totalEstimatedValue],
      [],
    ];
    const clinicalSectionRow = rows.length;
    rows.push(["Clinical Services"]);
    const clinicalHeaderRow = rows.length;
    rows.push(["Service", "CPT/HCPCS Code", "Visits", "Benchmark Rate", "Estimated Value"]);
    rows.push(...summary.serviceBreakdown.map(row => [
        row.serviceName, row.code, row.count, row.benchmarkRate, row.estimatedValue,
      ]));
    const clinicalTotalRow = rows.length;
    rows.push(["", "", "", "Clinical Total", summary.clinicalServiceValue]);
    rows.push([]);
    const volunteerSectionRow = rows.length;
    rows.push(["Volunteer Hours"]);
    const volunteerHeaderRow = rows.length;
    rows.push(["Role", "Hours", "Benchmark Rate / Hour", "Estimated Value"]);
    rows.push(...summary.volunteerBreakdown.map(row => [
        row.roleName, row.hours, row.benchmarkRate, row.estimatedValue,
      ]));
    const volunteerTotalRow = rows.length;
    rows.push(["", "", "Volunteer Total", summary.volunteerValue]);
    rows.push([]);
    const disclaimerSectionRow = rows.length;
    rows.push(["Disclaimer"]);
    const disclaimerRow = rows.length;
    rows.push(["These figures are benchmark-based estimates of the value of services and volunteer contributions. They do not represent actual revenue, Medicare reimbursement, or guaranteed healthcare savings."]);

    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!cols"] = [
      { wch: 34 }, { wch: 22 }, { wch: 14 }, { wch: 20 }, { wch: 20 },
    ];
    sheet["!merges"] = [
      ...[0, clinicalSectionRow, volunteerSectionRow, disclaimerSectionRow, disclaimerRow]
        .map(row => ({ s: { r: row, c: 0 }, e: { r: row, c: 4 } })),
    ];

    const boldRows = [0, clinicalSectionRow, clinicalHeaderRow, clinicalTotalRow,
      volunteerSectionRow, volunteerHeaderRow, volunteerTotalRow, disclaimerSectionRow];
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
    formatCurrency(4, 1);
    for (let rowIndex = clinicalHeaderRow + 1; rowIndex < clinicalTotalRow; rowIndex += 1) {
      formatCurrency(rowIndex, 3);
      formatCurrency(rowIndex, 4);
    }
    formatCurrency(clinicalTotalRow, 4);
    for (let rowIndex = volunteerHeaderRow + 1; rowIndex < volunteerTotalRow; rowIndex += 1) {
      formatCurrency(rowIndex, 2);
      formatCurrency(rowIndex, 3);
    }
    formatCurrency(volunteerTotalRow, 3);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Impact Breakdown");
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
<p style="color:#475C8A;margin:0 0 12px">Reporting period: ${_formatDate(summary.reportingPeriodFrom)} - ${_formatDate(summary.reportingPeriodTo)}</p>
<h1 style="font-family:Georgia,serif">Clinic Impact Estimator</h1>
<p class="total">${_fmt(summary.totalEstimatedValue)}</p>
<p class="label">Estimated Value of Care and Volunteer Contributions</p>
<p class="disclaimer">This is a benchmark-based estimate of the value of services and volunteer contributions.
It does not represent actual revenue, Medicare reimbursement, or guaranteed healthcare savings.</p>
<h2>Clinical Services</h2>
<table><thead><tr><th>Service</th><th>Code</th><th style="text-align:right">Visits</th><th style="text-align:right">Rate</th><th style="text-align:right">Est. Value</th></tr></thead>
<tbody>${svcRows}</tbody><tfoot><tr><th colspan="4" style="text-align:right">Clinical Total</th><th style="text-align:right">${_fmt(summary.clinicalServiceValue)}</th></tr></tfoot></table>
<h2>Volunteer Hours</h2>
<table><thead><tr><th>Role</th><th style="text-align:right">Hours</th><th style="text-align:right">Rate/Hr</th><th style="text-align:right">Est. Value</th></tr></thead>
<tbody>${volRows}</tbody><tfoot><tr><th colspan="3" style="text-align:right">Volunteer Total</th><th style="text-align:right">${_fmt(summary.volunteerValue)}</th></tr></tfoot></table>
<h2>References</h2>
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

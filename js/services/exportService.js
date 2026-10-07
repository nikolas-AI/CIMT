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
      alert("The Excel download could not be prepared. Check your internet connection and try again.");
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
      ["Calculation Option", _methodLabel(summary.impactMethod)],
    ];
    const totalEstimatedValueRow = rows.length;
    rows.push([AppCopy.exportCopy.labels.total, summary.totalEstimatedValue]);
    rows.push([summary.impactMethod === "volunteerHours" ? "Reported Volunteer Hours" : "Reported Clinical Services",
      summary.impactMethod === "volunteerHours"
        ? summary.volunteerBreakdown.reduce((sum, row) => sum + row.hours, 0)
        : summary.serviceBreakdown.reduce((sum, row) => sum + row.count, 0)]);
    rows.push(["Estimate Basis", summary.impactMethod === "volunteerHours"
      ? "Reported volunteer hours multiplied by public reference hourly rates"
      : "Reported service counts multiplied by public reference rates"]);
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
      rows.push(...summary.serviceBreakdown.map(row => [
          row.serviceName, row.code, row.count, row.benchmarkRate, row.estimatedValue,
        ]));
      clinicalTotalRow = rows.length;
      rows.push(["", "", "", "Clinical Services Total", summary.clinicalServiceValue]);
    }
    rows.push([]);
    let volunteerSectionRow = null;
    let volunteerHeaderRow = null;
    let volunteerTotalRow = null;
    let nonMedicalVolunteerTotalRow = null;
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
      nonMedicalVolunteerTotalRow = rows.length;
      rows.push(["", "", "", "Other Volunteer Time Value", summary.nonMedicalVolunteerValue]);
    }
    rows.push([]);
    const disclaimerSectionRow = rows.length;
    rows.push(["Disclaimer"]);
    const disclaimerRow = rows.length;
    rows.push([AppCopy.summary.shortDisclaimer]);

    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!cols"] = [
      { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 32 },
    ];
    sheet["!rows"] = rows.map((_, index) => ({ hpx: index === 0 ? 28 : 18 }));
    sheet["!autofilter"] = { ref: `A1:E${rows.length}` };
    sheet["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft", frozen: true };

    const serviceImpactSectionRow = summary.impactMethod === "clinicalServices"
      ? rows.findIndex(row => row[0] === "Service with the Highest Estimated Value")
      : null;

    const mergeRows = [
      0,
      ...(budgetSectionRow === null ? [] : [budgetSectionRow]),
      ...(serviceImpactSectionRow !== null && serviceImpactSectionRow >= 0 ? [serviceImpactSectionRow] : []),
      ...(valueRankingSectionRow === null ? [] : [valueRankingSectionRow]),
      ...(visitRankingSectionRow === null ? [] : [visitRankingSectionRow]),
      ...(clinicalSectionRow === null ? [] : [clinicalSectionRow]),
      ...(volunteerSectionRow === null ? [] : [volunteerSectionRow]),
      disclaimerSectionRow,
      disclaimerRow,
    ].filter((row) => Number.isInteger(row) && row >= 0);
    sheet["!merges"] = mergeRows.map(row => ({ s: { r: row, c: 0 }, e: { r: row, c: 4 } }));

    const boldRows = [
      0,
      ...(serviceImpactSectionRow !== null && serviceImpactSectionRow >= 0 ? [serviceImpactSectionRow] : []),
      ...(valueRankingSectionRow === null ? [] : [valueRankingSectionRow, valueRankingHeaderRow]),
      ...(visitRankingSectionRow === null ? [] : [visitRankingSectionRow, visitRankingHeaderRow]),
      ...(clinicalSectionRow === null ? [] : [clinicalSectionRow]),
      ...(clinicalHeaderRow === null ? [] : [clinicalHeaderRow, clinicalTotalRow]),
      ...(volunteerSectionRow === null ? [] : [volunteerSectionRow, volunteerHeaderRow, volunteerTotalRow, nonMedicalVolunteerTotalRow]),
      disclaimerSectionRow,
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

    [volunteerHeaderRow, volunteerTotalRow, nonMedicalVolunteerTotalRow].filter((row) => Number.isInteger(row) && row >= 0).forEach(rowIndex => {
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
      ? "Volunteer hours"
      : "Clinical services";
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
    const estimateDetails = AppCopy.summaryDashboard.estimateDetails(summary.impactMethod);
    const clinicName = summary.clinicName || "Your clinic";
    const impactNarrative = isVolunteerReport
      ? `During this reporting period, ${clinicName} reported ${activityCount} volunteer hours. Using reference hourly rates, the estimated value of that time is ${_fmt(summary.totalEstimatedValue)}.`
      : serviceCount > 0
        ? `During this reporting period, ${clinicName} reported ${activityCount} clinical services. Using national reference rates, the estimated value of those services is ${_fmt(summary.totalEstimatedValue)}.`
        : AppCopy.summary.emptyState;
    const topServiceSentence = summary.mostImpactfulService &&
      Number(summary.mostImpactfulService.clinicalValueShare || 0) > 0
      ? ` ${summary.mostImpactfulService.serviceName} represented ${summary.mostImpactfulService.clinicalValueShare.toFixed(1)}% of the estimated service value.`
      : "";
    const funderReadyStatement = isVolunteerReport
      ? AppCopy.summary.funderReadyVolunteerStatement(
        clinicName,
        activityCount,
        period.replace("–", " to "),
        _fmt(summary.totalEstimatedValue)
      )
      : AppCopy.summary.funderReadyServicesStatement(
        clinicName,
        serviceCount > 0 ? `${activityCount} clinical services` : "clinical activity",
        period.replace("–", " to "),
        _fmt(summary.totalEstimatedValue),
        topServiceSentence
      );

    const metricCard = (label, value, note = "") => `
      <div class="metric-card">
        <p class="metric-card__label">${_escapeHTML(label)}</p>
        <p class="metric-card__value">${_escapeHTML(value)}</p>
        ${note ? `<p class="metric-card__note">${_escapeHTML(note)}</p>` : ""}
      </div>
    `;

    const svcRows = summary.serviceBreakdown.map(row => `
      <tr>
        <td>${_escapeHTML(row.serviceName)}</td>
        <td>${_escapeHTML(row.code)}</td>
        <td class="numeric">${row.count.toLocaleString("en-US")}</td>
        <td class="numeric">${_fmt(row.benchmarkRate)}</td>
        <td class="numeric">${_fmt(row.estimatedValue)}</td>
      </tr>
    `).join("");

    const volRows = summary.volunteerBreakdown.map(row => `
      <tr>
        <td>${_escapeHTML(row.roleName)}</td>
        <td>${_escapeHTML(row.category)}</td>
        <td class="numeric">${row.hours.toFixed(1)}</td>
        <td class="numeric">${_fmt(row.benchmarkRate)}</td>
        <td class="numeric">${_fmt(row.estimatedValue)}</td>
      </tr>
    `).join("");

    const referenceItems = REFERENCES.map(ref => `
      <li>
        <a href="${_escapeHTML(ref.url)}">${_escapeHTML(ref.title)}</a>
        — ${_escapeHTML(ref.organization)}${ref.year ? ` (${_escapeHTML(ref.year)})` : ""}.
        ${ref.description ? `<br><span>${_escapeHTML(ref.description)}</span>` : ""}
      </li>
    `).join("");

    const budgetHTML = summary.reportingPeriodClinicCost !== null ? `
      <section class="report-section">
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
          <p class="feature__statement"><strong>${_escapeHTML(summary.mostImpactfulService.serviceName)}</strong> had the largest share of the estimated service value, with <strong>${summary.mostImpactfulService.count.toLocaleString("en-US")} services</strong> and an estimated value of <strong>${_fmt(summary.mostImpactfulService.estimatedValue)}</strong>.</p>
          <p class="feature__meta">${_escapeHTML(AppCopy.summaryDashboard.topContributorStats(
            summary.mostImpactfulService.count.toLocaleString("en-US"),
            _fmt(summary.mostImpactfulService.estimatedValue),
            summary.mostImpactfulService.clinicalValueShare.toFixed(1)
          ))}</p>
          <div class="value-track" role="img" aria-label="${_escapeHTML(summary.mostImpactfulService.serviceName)} contributed ${summary.mostImpactfulService.clinicalValueShare.toFixed(1)} percent of estimated service value">
            <span style="width:${Math.min(100, Math.max(0, summary.mostImpactfulService.clinicalValueShare))}%"></span>
          </div>
        </section>`
      : "";

    const serviceChartHTML = !isVolunteerReport && summary.serviceImpactRanking?.byValue.length > 0
      ? `<section class="report-section">
          <h2>${_escapeHTML(AppCopy.summaryDashboard.valueChartHeading)}</h2>
          <p class="section-intro">${_escapeHTML(AppCopy.summaryDashboard.valueChartIntro)}</p>
          <div class="chart">
            ${summary.serviceImpactRanking.byValue.map(row => {
              const maximum = Math.max(...summary.serviceImpactRanking.byValue.map(item => item.estimatedValue), 1);
              const width = Math.min(100, Math.max(0, row.estimatedValue / maximum * 100));
              return `<div class="chart-row">
                <div class="chart-row__label"><span>${_escapeHTML(row.serviceName)}</span><strong>${_fmt(row.estimatedValue)}</strong></div>
                <div class="value-track" aria-hidden="true"><span style="width:${width}%"></span></div>
              </div>`;
            }).join("")}
          </div>
        </section>`
      : "";

    const serviceRankingHTML = !isVolunteerReport && summary.serviceImpactRanking?.byValue.length > 0
      ? [
        ["Services by estimated value", summary.serviceImpactRanking.byValue],
        ["Services by number reported", summary.serviceImpactRanking.byVisits],
      ].map(([heading, rows]) => `
        <section class="report-section">
          <h2>${_escapeHTML(heading)}</h2>
          <table>
            <thead><tr><th>Rank</th><th>Service</th><th class="numeric">Number reported</th><th class="numeric">Estimated value</th><th class="numeric">Share of total estimated service value</th></tr></thead>
            <tbody>${rows.map((row, index) => `<tr><td>${index + 1}</td><td>${_escapeHTML(row.serviceName)}</td><td class="numeric">${row.count.toLocaleString("en-US")}</td><td class="numeric">${_fmt(row.estimatedValue)}</td><td class="numeric">${row.clinicalValueShare.toFixed(1)}%</td></tr>`).join("")}</tbody>
          </table>
          <p class="section-note">${_escapeHTML(AppCopy.summary.rankingNote)}</p>
        </section>
      `).join("")
      : "";

    const volunteerBreakdownHTML = isVolunteerReport
      ? `<section class="report-section">
          <h2>Estimated value at a glance</h2>
          <div class="metric-grid metric-grid--two">
            ${summary.medicalProfessionalVolunteerValue > 0 ? metricCard("Estimated value of medical volunteer time", _fmt(summary.medicalProfessionalVolunteerValue)) : ""}
            ${summary.nonMedicalVolunteerValue > 0 ? metricCard("Estimated value of non-medical volunteer time", _fmt(summary.nonMedicalVolunteerValue)) : ""}
          </div>
        </section>`
      : "";

    const methodologyItems = AppCopy.summaryView.methodologyBullets
      .map(item => `<li>${_escapeHTML(item)}</li>`)
      .join("");
    const volunteerSourceHTML = isVolunteerReport && VOLUNTEER_RATE_SOURCE
      ? `<section class="report-section">
          <h2>Volunteer Rate Source</h2>
          <p class="source-box"><strong>${_escapeHTML(VOLUNTEER_RATE_SOURCE.name)}${VOLUNTEER_RATE_SOURCE.publicationYear ? ` (${VOLUNTEER_RATE_SOURCE.publicationYear})` : ""}</strong><br>${_escapeHTML(VOLUNTEER_RATE_SOURCE.description)}${VOLUNTEER_RATE_SOURCE.url ? `<br><a href="${_escapeHTML(VOLUNTEER_RATE_SOURCE.url)}">Learn more</a>` : ""}</p>
        </section>`
      : "";

    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${_escapeHTML(AppCopy.exportCopy.pdfTitle)} — ${_escapeHTML(clinicName)}</title>
<style>
  :root {
    color-scheme: light;
    --paper: #F7F6F0;
    --surface: #FBFAF5;
    --border: #D8D7CE;
    --navy: #163238;
    --slate: #46565A;
    --muted: #788184;
    --teal: #166D6A;
    --oxblood: #7E2939;
    --impact-bg: #F1E3DF;
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
    border: 1px solid rgba(57,125,92,.32);
    box-shadow: 6px 6px 0 rgba(198,91,56,.12);
  }
  .status {
    display: inline-block;
    margin: 0 0 14px;
    padding: 5px 12px;
    color: #34664B;
    background: rgba(251,250,245,.72);
    border: 1px solid rgba(52,102,75,.35);
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
  }
  .metric-grid--two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .metric-card { min-width: 0; padding: 14px 16px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .metric-card:nth-child(3n) { border-right: 0; }
  .metric-grid--two .metric-card:nth-child(3n) { border-right: 1px solid var(--border); }
  .metric-grid--two .metric-card:nth-child(2n) { border-right: 0; }
  .metric-card__label { min-height: 2.5em; margin: 0 0 5px; color: var(--slate); font-size: 9px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; }
  .metric-card__value { margin: 0 0 4px; color: var(--navy); font: 24px/1.1 "DM Serif Display", Georgia, serif; overflow-wrap: anywhere; }
  .metric-card__note { margin: 0; color: var(--muted); font-size: 10px; }
  .callout {
    margin: 0 0 18px;
    padding: 14px 16px;
    color: var(--slate);
    background: #F5F0E6;
    border: 1px solid rgba(126,41,57,.2);
    border-left: 5px solid var(--oxblood);
  }
  .callout strong { color: var(--navy); }
  .callout--note { margin-top: 12px; font-size: 10px; }
  .narrative { margin: 0 0 20px; color: var(--slate); font-size: 13px; line-height: 1.7; }
  .funder-statement { padding: 16px 18px; color: var(--navy); background: rgba(30,107,99,.04); border: 1px solid rgba(30,107,99,.18); border-left: 4px solid var(--teal); }
  .report-section { margin: 0 0 22px; break-inside: auto; }
  h2 {
    margin: 0 0 10px;
    padding-bottom: 7px;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    break-after: avoid;
  }
  .section-intro, .section-note { color: var(--slate); font-size: 11px; }
  .section-note { margin: 8px 0 0; font-size: 10px; }
  .feature {
    padding: 18px;
    background: var(--surface);
    border: 1px solid rgba(198,91,56,.28);
    border-left: 5px solid var(--oxblood);
  }
  .feature h2 { color: var(--oxblood); border-bottom-color: rgba(198,91,56,.25); }
  .feature__statement { margin: 0; font: 17px/1.45 "DM Serif Display", Georgia, serif; }
  .feature__statement strong { color: var(--oxblood); }
  .feature__meta { margin: 10px 0 0; color: var(--slate); font-size: 10px; font-weight: 700; }
  .chart { padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); }
  .chart-row { margin-bottom: 12px; }
  .chart-row:last-child { margin-bottom: 0; }
  .chart-row__label { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 5px; color: var(--slate); font-size: 11px; }
  .chart-row__label strong { flex-shrink: 0; color: var(--navy); }
  .value-track { height: 7px; overflow: hidden; background: #DDE7DF; border-radius: 999px; }
  .value-track span { display: block; height: 100%; background: var(--teal); border-radius: inherit; }
  table { width: 100%; margin: 8px 0 0; border-collapse: collapse; font-size: 10px; }
  thead { display: table-header-group; }
  th { padding: 8px; color: var(--navy); background: #E9E4D7; font-size: 9px; font-weight: 700; text-align: left; }
  td { padding: 7px 8px; color: var(--slate); border-bottom: 1px solid var(--border); overflow-wrap: anywhere; }
  .numeric { text-align: right; font-variant-numeric: tabular-nums; }
  tfoot th { background: var(--impact-bg); }
  .sources { padding-left: 18px; }
  .sources li { margin: 0 0 9px; color: var(--slate); font-size: 10px; }
  .sources a, .source-box a { color: var(--teal); overflow-wrap: anywhere; }
  .sources span { color: var(--muted); }
  .source-box { padding: 14px; background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--teal); }
  .footer { margin-top: 24px; padding-top: 12px; color: var(--muted); border-top: 1px solid var(--border); font-size: 9px; }
  @media screen and (max-width: 620px) {
    body { margin: 12px auto; padding: 0 12px; }
    .hero { padding: 24px 16px; }
    .metric-grid, .metric-grid--two { grid-template-columns: 1fr; }
    .metric-card, .metric-card:nth-child(3n), .metric-grid--two .metric-card:nth-child(3n) { border-right: 0; }
    .total { font-size: 40px; }
    .table-wrap { overflow-x: auto; }
    table { min-width: 620px; }
  }
  @media print {
    body { max-width: none; margin: 0; padding: 0; background: #fff; font-size: 10pt; }
    .hero, .metric-grid, .feature, .chart, .source-box, .callout { break-inside: avoid; }
    .report-section h2 { break-after: avoid; }
    .report-section table tr { break-inside: avoid; }
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
<section class="metric-grid" aria-label="${_escapeHTML(AppCopy.summaryDashboard.kpiHeading)}">
  ${metricCard(activityLabel, activityCount, activityNote)}
  ${metricCard(AppCopy.summaryDashboard.estimatedCommunityValueKpi, _fmt(summary.totalEstimatedValue), AppCopy.summaryDashboard.estimatedCommunityValueNote)}
  ${summary.reportingPeriodClinicCost !== null
    ? metricCard(AppCopy.summaryDashboard.valuePerDollarKpi, summary.valueToCostRatio === null ? "—" : `$${summary.valueToCostRatio.toFixed(2)}`, AppCopy.summaryDashboard.valuePerDollarNote)
    : ""}
</section>
<p class="callout"><strong>${_escapeHTML(AppCopy.summaryDashboard.estimateHeading)}.</strong> ${_escapeHTML(AppCopy.summaryDashboard.estimateIntro(summary.impactMethod))}<br><br>${_escapeHTML(estimateDetails)}</p>
<p class="narrative">${_escapeHTML(impactNarrative)}</p>
<p class="callout">${_escapeHTML(AppCopy.summary.shortDisclaimer)}</p>
${serviceImpactHTML}
${serviceChartHTML}
${volunteerBreakdownHTML}
${budgetHTML}
${serviceRankingHTML}
${!isVolunteerReport ? `<section class="report-section">
  <h2>Breakdown of Clinical Services</h2>
  <div class="table-wrap"><table>
    <thead><tr><th>Service</th><th>Service code</th><th class="numeric">Number reported</th><th class="numeric">Reference rate</th><th class="numeric">Estimated value</th></tr></thead>
    <tbody>${svcRows}</tbody>
    <tfoot><tr><th colspan="4" class="numeric">Clinical services total</th><th class="numeric">${_fmt(summary.clinicalServiceValue)}</th></tr></tfoot>
  </table></div>
</section>` : ""}
${isVolunteerReport ? `<section class="report-section">
  <h2>Volunteer Time</h2>
  <div class="table-wrap"><table>
    <thead><tr><th>Role</th><th>Type</th><th class="numeric">Volunteer hours</th><th class="numeric">Reference rate / hour</th><th class="numeric">Estimated value</th></tr></thead>
    <tbody>${volRows}</tbody>
    <tfoot><tr><th colspan="4" class="numeric">Total volunteer time value</th><th class="numeric">${_fmt(summary.volunteerValue)}</th></tr></tfoot>
  </table></div>
</section>` : ""}
<section class="report-section">
  <h2>${_escapeHTML(AppCopy.summary.funderReadyTitle)}</h2>
  <p class="funder-statement">${_escapeHTML(funderReadyStatement)}</p>
</section>
<section class="report-section">
  <h2>${_escapeHTML(AppCopy.summaryView.methodologySectionTitle)}</h2>
  <ul class="sources">${methodologyItems}</ul>
</section>
${volunteerSourceHTML}
<section class="report-section">
  <h2>Sources and references</h2>
  <ul class="sources">${referenceItems}</ul>
</section>
<footer class="footer">${_escapeHTML(AppCopy.exportCopy.pdfFooter)}</footer>
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

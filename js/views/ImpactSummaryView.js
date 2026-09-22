/**
 * ImpactSummaryView.js — View 4
 *
 * Receives a computed ImpactSummary object and renders the full
 * summary: hero metric, breakdown cards, rate tables, references,
 * and download actions.
 *
 * This view renders DATA. It never performs calculations.
 */

"use strict";

const ImpactSummaryView = (() => {

  function render(summary, { onBack, onStartOver }) {
    // The calculator has already finished its work before this screen is shown.
    // This view only chooses the order of report sections and wires up actions.
    const container = document.getElementById("view-container");
    container.innerHTML = "";

    const view = document.createElement("div");
    view.className = "view view--impact";
    view.setAttribute("role", "region");
    view.setAttribute("aria-label", "Impact Summary");

    view.appendChild(_buildHero(summary));
    view.appendChild(_buildImpactNarrative(summary));
    view.appendChild(_buildDisclaimer());
    if (summary.impactMethod === "volunteerHours") {
      view.appendChild(_buildBreakdown(summary));
    }
    view.appendChild(_buildFunderReadyStatement(summary));
    if (summary.reportingPeriodClinicCost !== null) {
      view.appendChild(_buildBudgetMetrics(summary));
    }
    if (summary.impactMethod === "clinicalServices" && _hasReportedServices(summary)) {
      view.appendChild(_buildServiceImpact(summary));
    }
    const serviceRanking = _buildServiceRanking(summary);
    if (serviceRanking) view.appendChild(serviceRanking);
    const rateTable = _buildRateTable(summary);
    if (rateTable) view.appendChild(rateTable);
    if (summary.volunteerBreakdown.length > 0) {
      view.appendChild(_buildVolunteerRateSource());
    }

    const detailGrid = document.createElement("div");
    detailGrid.className = "summary-detail-grid";
    detailGrid.appendChild(_buildMethodologySection());
    detailGrid.appendChild(_buildWaysToUseSection());
    view.appendChild(detailGrid);

    view.appendChild(_buildReferences());
    view.appendChild(_buildDownloadActions(summary));

    // Back returns to the last input step; Start Over is a separate callback
    // that clears state before returning to the first step.
    const nav = NavigationButtons.create({
      backLabel: "Back",
      onBack,
      nextLabel: "Start Over",
      onNext: onStartOver,
    });
    view.appendChild(nav);

    container.appendChild(view);
  }

  // ---------------------------------------------------------------
  // Hero — clinic name + total value
  // ---------------------------------------------------------------
  function _buildHero(summary) {
    const clinicName = summary.clinicName || "Your clinic";
    const headline = AppCopy.summaryView.heading(summary.clinicName, summary.reportingPeriodFrom, summary.reportingPeriodTo);
    const hero = document.createElement("div");
    hero.className = "impact-hero";
    hero.setAttribute("aria-label", "Impact total");

    hero.innerHTML = `
      <p class="impact-hero__eyebrow">Estimated clinic impact summary</p>
      <p class="impact-hero__clinic">${_escape(headline)}</p>
      <p class="impact-hero__address">${_escape(summary.streetAddress)}, ${_escape(summary.city)}, ${_escape(summary.state)} ${_escape(summary.zipCode)}</p>
      <p class="impact-hero__period">${_escape(_formatRange(summary.reportingPeriodFrom, summary.reportingPeriodTo))}</p>
      <p class="impact-hero__total" aria-label="Total estimated value: ${Formatting.currency(summary.totalEstimatedValue)}">
        ${Formatting.currency(summary.totalEstimatedValue)}
      </p>
      <p class="impact-hero__label">${summary.impactMethod === "volunteerHours" ? "Estimated volunteer impact" : "Estimated clinical impact"}</p>
    `;
    return hero;
  }

  function _buildImpactNarrative(summary) {
    const narrative = document.createElement("p");
    narrative.className = "impact-narrative";
    narrative.setAttribute("role", "note");
    narrative.textContent = AppCopy.summaryView.narrative(
      summary.impactMethod,
      summary.clinicName,
      _serviceCount(summary),
      _totalVolunteerHours(summary),
      summary.totalEstimatedValue
    );
    return narrative;
  }

  function _formatDate(value) {
    if (!value) return "Not specified";
    const date = new Date(`${value}T00:00:00`);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  function _formatRange(from, to) {
    const start = _formatDate(from);
    const end = _formatDate(to);
    return `Reporting period: ${start}–${end}`;
  }

  function _serviceCount(summary) {
    return summary.serviceBreakdown.reduce((sum, row) => sum + row.count, 0);
  }

  function _hasReportedServices(summary) {
    return summary.impactMethod === "clinicalServices" && (_serviceCount(summary) > 0 || Number(summary.clinicalServiceValue) > 0);
  }

  function _totalVolunteerHours(summary) {
    return summary.volunteerBreakdown.reduce((sum, row) => sum + row.hours, 0);
  }

  // ---------------------------------------------------------------
  // Disclaimer
  // ---------------------------------------------------------------
  function _buildDisclaimer() {
    const d = document.createElement("p");
    d.className = "impact-disclaimer";
    d.setAttribute("role", "note");
    d.textContent = AppCopy.summary.shortDisclaimer;
    return d;
  }

  // ---------------------------------------------------------------
  // Breakdown cards — clinical value + volunteer value
  // ---------------------------------------------------------------
  function _buildBreakdown(summary) {
    const section = document.createElement("div");
    section.className = "impact-breakdown";
    const hasServices = summary.impactMethod === "clinicalServices" && _hasReportedServices(summary);
    const hasVolunteerHours = summary.impactMethod === "volunteerHours" && _totalVolunteerHours(summary) > 0;
    const hasMedicalVolunteerValue = summary.medicalProfessionalVolunteerValue > 0;
    const hasNonMedicalVolunteerValue = summary.nonMedicalVolunteerValue > 0;

    const heading = document.createElement("h2");
    heading.className = "impact-breakdown__heading";
    heading.textContent = "Estimated impact at a glance";
    section.appendChild(heading);

    if (summary.impactMethod === "volunteerHours") {
      if (hasMedicalVolunteerValue) {
        section.appendChild(_buildCard(
          "Medical professional volunteer hours",
          summary.medicalProfessionalVolunteerValue,
          AppCopy.metric.estimatedMedicalProfessionalVolunteerValueNote,
          "volunteer"
        ));
      }
      if (hasNonMedicalVolunteerValue) {
        section.appendChild(_buildCard(
          "Non-medical professional volunteer hours",
          summary.nonMedicalVolunteerValue,
          AppCopy.metric.estimatedNonMedicalVolunteerValueNote,
          "volunteer"
        ));
      }
    }

    if (hasServices || hasVolunteerHours) {
      section.appendChild(_buildCard(
        summary.impactMethod === "volunteerHours" ? "Estimated volunteer impact" : "Estimated clinical impact",
        summary.totalEstimatedValue,
        summary.impactMethod === "volunteerHours"
          ? "Estimated replacement value of reported medical and non-medical donated time."
            : _totalValueNote(summary.impactMethod),
        "total"
      ));
    }

    section.style.setProperty(
      "--impact-card-columns",
      String(Math.max(section.children.length - 1, 1))
    );

    return section;
  }

  function _buildFunderReadyStatement(summary) {
    const section = document.createElement("section");
    section.className = "summary-section";

    const townText = _buildFunderReadyText(summary);
    const statement = document.createElement("p");
    statement.className = "funder-ready-statement";
    statement.textContent = townText;
    statement.setAttribute("aria-label", "Funder-ready impact statement");

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "btn btn--secondary";
    copyButton.textContent = AppCopy.summary.impactStatementButton;
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(townText);
        copyButton.textContent = AppCopy.summary.copySuccess;
      } catch (error) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(statement);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("copy");
        copyButton.textContent = AppCopy.summary.copySuccess;
      }
    });

    const buttonWrap = document.createElement("div");
    buttonWrap.className = "download-actions";
    buttonWrap.appendChild(copyButton);

    section.innerHTML = `
      <h2 class="summary-section__heading">${AppCopy.summary.funderReadyTitle}</h2>
    `;
    section.appendChild(statement);
    section.appendChild(buttonWrap);
    return section;
  }

  function _buildFunderReadyText(summary) {
    const clinicName = summary.clinicName || "Your clinic";
    const serviceCount = summary.impactMethod === "clinicalServices" ? _serviceCount(summary) : 0;
    const volunteerHours = _totalVolunteerHours(summary);
    const hasServices = serviceCount > 0;
    const totalText = `${Formatting.currency(summary.totalEstimatedValue)}`;
    const clinicalText = `${Formatting.currency(summary.clinicalServiceValue)}`;
    const periodLabel = `${_formatDate(summary.reportingPeriodFrom)} to ${_formatDate(summary.reportingPeriodTo)}`;
    const topService = summary.mostImpactfulService ? summary.mostImpactfulService.serviceName : "";
    const topServiceShare = summary.mostImpactfulService?.clinicalValueShare || 0;
    if (summary.impactMethod === "volunteerHours") {
      return `During ${periodLabel}, ${clinicName} reported ${volunteerHours} donated volunteer hours. Using benchmark hourly rates, the estimated volunteer impact was ${totalText}.`;
    }
    const activityText = `${clinicName} reported delivering ${serviceCount} clinical services.`;
    const valueText = `reflecting ${clinicalText} in estimated clinical service value.`;
    const serviceText = hasServices
      ? ` The standout service was ${topService}, contributing ${Formatting.number(topServiceShare, 1)}% of the clinic’s estimated clinical service value.`
      : "";
    return `During ${periodLabel}, ${activityText} Using national benchmark rates, the estimated total value was ${totalText}, ${valueText}${serviceText}`;
  }

  function _buildCard(label, value, note, variant) {
    const card = document.createElement("div");
    card.className = `impact-card impact-card--${variant}`;
    card.innerHTML = `
      <p class="impact-card__label">${label}</p>
      <p class="impact-card__value">${Formatting.currency(value)}</p>
      <p class="impact-card__note">${note}</p>
    `;
    return card;
  }

  function _totalValueNote(impactMethod) {
    if (impactMethod === "clinicalServices") return AppCopy.metric.totalEstimatedValueServicesOnlyNote;
    return AppCopy.metric.totalEstimatedValueVolunteerOnlyNote;
  }

  function _buildServiceImpact(summary) {
    const section = document.createElement("section");
    section.className = "summary-section service-impact";
    section.setAttribute("aria-labelledby", "service-impact-heading");

    const service = summary.mostImpactfulService;
    section.innerHTML = service
      ? `
        <div class="service-impact__box">
          <h2 class="summary-section__heading" id="service-impact-heading">${AppCopy.metric.mostImpactful}</h2>
          <p class="service-impact__statement">
            <strong>${_escape(service.serviceName)}</strong> represented the largest share of reported clinical service value, with
            <strong>${Formatting.number(service.count, 0)} services</strong> and an estimated benchmark value of
            <strong>${Formatting.currency(service.estimatedValue)}</strong>.
          </p>
          <p class="summary-section__intro">This service accounted for ${Formatting.number(service.clinicalValueShare, 1)}% of the estimated clinical service value reported for this period.</p>
        </div>
      `
      : `
        <div class="service-impact__box">
          <h2 class="summary-section__heading" id="service-impact-heading">${AppCopy.metric.mostImpactful}</h2>
          <p class="summary-section__intro">${AppCopy.summary.emptyState}</p>
        </div>
      `;
    return section;
  }

  function _buildServiceRanking(summary) {
    const ranking = summary.serviceImpactRanking;
    if (!ranking || ranking.byValue.length === 0) return null;

    const section = document.createElement("section");
    section.className = "summary-section service-ranking";
    section.setAttribute("aria-labelledby", "service-ranking-heading");
    section.innerHTML = `
      <div class="service-ranking__header">
        <div>
          <h2 class="summary-section__heading" id="service-ranking-heading">${AppCopy.summaryView.rankTitle}</h2>
          <p class="summary-section__intro">${AppCopy.summaryView.rankIntro}</p>
        </div>
        <div class="service-ranking__controls" role="group" aria-label="Rank services by">
          <button type="button" class="service-ranking__toggle is-active" data-ranking-mode="value" aria-pressed="true">Estimated value</button>
          <button type="button" class="service-ranking__toggle" data-ranking-mode="visits" aria-pressed="false">Reported count</button>
        </div>
      </div>
      <div class="service-ranking__table-wrap"></div>
      <p class="summary-section__intro">${AppCopy.summary.rankingNote}</p>
    `;

    const tableWrap = section.querySelector(".service-ranking__table-wrap");
    const buttons = section.querySelectorAll("[data-ranking-mode]");
    const renderRows = (mode) => {
      const rows = ranking[mode === "visits" ? "byVisits" : "byValue"];
      tableWrap.innerHTML = `
        <table class="rate-table service-ranking__table" aria-label="Clinical service impact ranking">
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Service</th>
              <th scope="col">Reported count</th>
              <th scope="col">Benchmark rate</th>
              <th scope="col">Estimated benchmark value</th>
              <th scope="col">Share of total estimated clinical value</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, index) => `
              <tr>
                <td class="service-ranking__rank">${index + 1}</td>
                <td>${_escape(row.serviceName)}</td>
                <td>${Formatting.number(row.count, 0)}</td>
                <td>${Formatting.currency(row.benchmarkRate)}</td>
                <td>${Formatting.currency(row.estimatedValue)}</td>
                <td>${Formatting.number(row.clinicalValueShare, 1)}%</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    };

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const mode = button.dataset.rankingMode;
        buttons.forEach(control => {
          const active = control === button;
          control.classList.toggle("is-active", active);
          control.setAttribute("aria-pressed", String(active));
        });
        renderRows(mode);
      });
    });
    renderRows("value");
    return section;
  }

  function _buildBudgetMetrics(summary) {
    const section = document.createElement("section");
    section.className = "summary-section budget-metrics";
    section.setAttribute("aria-labelledby", "budget-metrics-heading");

    const ratioText = summary.valueToCostRatio !== null ? `${summary.valueToCostRatio.toFixed(2)}` : "—";
    const benchmarkDirection = summary.benchmarkValueROI > 0 ? "higher" : summary.benchmarkValueROI < 0 ? "lower" : "equal";
    const benchmarkPercent = Math.abs(summary.benchmarkValueROI || 0).toFixed(1);
    const totalValueNote = _totalValueNote(_hasReportedServices(summary), _totalVolunteerHours(summary) > 0);

    section.innerHTML = `
      <h2 class="summary-section__heading" id="budget-metrics-heading">${AppCopy.summaryView.costHeading}</h2>
      <p class="summary-section__intro">
        ${AppCopy.summaryView.costIntro(summary.reportingPeriodClinicCost)}
      </p>
      <div class="budget-metrics__grid">
        ${_buildMetric("Reported clinic cost", Formatting.currency(summary.reportingPeriodClinicCost), "Total clinic cost reported for this period.")}
        ${_buildMetric("Estimated total value", Formatting.currency(summary.totalEstimatedValue), totalValueNote)}
        ${_buildMetric(AppCopy.summaryView.valuePerDollarLabel, `$${ratioText}`, "Estimated benchmark value for every $1 of reported clinic cost.")}
        ${_buildMetric(AppCopy.summaryView.benchmarkComparisonLabel, `${benchmarkPercent}% ${benchmarkDirection}`, "The estimated total benchmark value compared with the reported clinic cost.")}
      </div>
      <p class="summary-section__note">${AppCopy.summary.costComparisonNote}</p>
    `;
    return section;
  }

  function _buildMetric(label, value, note) {
    return `
      <div class="budget-metric">
        <p class="budget-metric__label">${label}</p>
        <p class="budget-metric__value">${value}</p>
        <p class="budget-metric__note">${note}</p>
      </div>
    `;
  }

  // ---------------------------------------------------------------
  // Medical benchmark rate table
  // ---------------------------------------------------------------
  function _buildRateTable(summary) {
    // Only selected services and roles appear here. The calculator has already
    // removed entries that do not match a catalog item.
    // Only selected services and roles appear here; the calculator has already
    // removed invalid or unknown entries before this view receives the summary.
    const section = document.createElement("div");
    section.className = "summary-section";

    if (summary.serviceBreakdown.length > 0) {
      section.innerHTML = `
        <h2 class="summary-section__heading">Medical Benchmark Rates Used</h2>
        <p class="summary-section__intro">
          Clinical service values are estimated using publicly available healthcare benchmark rates.
          These benchmarks provide a consistent reference point for estimating the value of services
          provided.
        </p>
      `;
    }

    const tableWrap = document.createElement("div");
    tableWrap.style.overflowX = "auto";

    // Services table
    if (summary.serviceBreakdown.length > 0) {
      const svcTable = document.createElement("table");
      svcTable.className = "rate-table";
      svcTable.setAttribute("aria-label", "Clinical service benchmark rates");
      svcTable.innerHTML = `
        <thead>
          <tr>
            <th scope="col">Service</th>
            <th scope="col">CPT/HCPCS Code</th>
            <th scope="col">Benchmark Rate</th>
            <th scope="col">Visits</th>
          </tr>
        </thead>
        <tbody>
          ${summary.serviceBreakdown.map(row => `
            <tr>
              <td>${_escape(row.serviceName)}</td>
              <td><code>${_escape(row.code)}</code></td>
              <td>${Formatting.currency(row.benchmarkRate)}</td>
              <td>${Formatting.number(row.count, 0)}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      tableWrap.appendChild(svcTable);
    }

    // Volunteer table
    if (summary.volunteerBreakdown.length > 0) {
      const volHeading = document.createElement("h3");
      volHeading.style.cssText = "font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:var(--color-muted);margin:1.5rem 0 0.75rem;";
      volHeading.textContent = "Volunteer Time Benchmark Rates";
      tableWrap.appendChild(volHeading);

      const volTable = document.createElement("table");
      volTable.className = "rate-table";
      volTable.setAttribute("aria-label", "Volunteer time benchmark rates");
      volTable.innerHTML = `
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">Rate / Hour</th>
            <th scope="col">Hours</th>
          </tr>
        </thead>
        <tbody>
          ${summary.volunteerBreakdown.map(row => `
            <tr>
              <td>${_escape(row.roleName)}</td>
              <td>${Formatting.currency(row.benchmarkRate)}</td>
              <td>${Formatting.number(row.hours, 1)}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      tableWrap.appendChild(volTable);
    }

    if (summary.serviceBreakdown.length === 0 && summary.volunteerBreakdown.length === 0) {
      return null;
    }

    section.appendChild(tableWrap);
    return section;
  }

  // ---------------------------------------------------------------
  // Volunteer rate source info box
  // ---------------------------------------------------------------
  function _buildVolunteerRateSource() {
    // This explains the source of volunteer rates separately from clinical rates.
    // This explains the origin of volunteer rates separately from clinical rates.
    const section = document.createElement("div");
    section.className = "summary-section";

    const src = VOLUNTEER_RATE_SOURCE;
    section.innerHTML = `
      <h2 class="summary-section__heading">Volunteer Rate Source</h2>
      <div class="rate-source-box">
        <strong>${_escape(src.name)}${src.publicationYear ? ` (${src.publicationYear})` : ""}</strong><br>
        ${_escape(src.description)}
        ${src.url ? `<br><a href="${_escape(src.url)}" target="_blank" rel="noopener noreferrer">Learn more →</a>` : ""}
      </div>
    `;
    return section;
  }

  // ---------------------------------------------------------------
  // References
  // ---------------------------------------------------------------
  function _buildReferences() {
    const section = document.createElement("div");
    section.className = "summary-section";

    const items = REFERENCES.map(ref => `
      <li>
        <a href="${_escape(ref.url)}" target="_blank" rel="noopener noreferrer">${_escape(ref.title)}</a>
        — ${_escape(ref.organization)}${ref.year ? ` (${ref.year})` : ""}.
        ${ref.description ? `<br><span style="color:var(--color-muted)">${_escape(ref.description)}</span>` : ""}
      </li>
    `).join("");

    section.innerHTML = `
      <h2 class="summary-section__heading">Sources and references</h2>
      <ul class="references-list">${items}</ul>
    `;
    return section;
  }

  // ---------------------------------------------------------------
  // Download actions (stubs connected to ExportService)
  // ---------------------------------------------------------------
  function _buildMethodologySection() {
    const section = document.createElement("section");
    section.className = "summary-section summary-disclosure";
    const list = AppCopy.summaryView.methodologyBullets.map(item => `<li>${item}</li>`).join("");
    section.innerHTML = `
      <details>
        <summary class="summary-section__heading">${AppCopy.summaryView.methodologySectionTitle}</summary>
        <ul class="references-list">${list}</ul>
      </details>
    `;
    return section;
  }

  function _buildWaysToUseSection() {
    const section = document.createElement("section");
    section.className = "summary-section summary-disclosure";
    const items = AppCopy.summaryView.fundingBullets.map(item => `<li>${item}</li>`).join("");
    section.innerHTML = `
      <details>
        <summary class="summary-section__heading">${AppCopy.summaryView.fundingTitle}</summary>
        <ul class="references-list">
          ${items}
        </ul>
        <p class="summary-section__intro">${AppCopy.summaryView.fundingNote}</p>
      </details>
    `;
    return section;
  }

  function _buildDownloadActions(summary) {
    const wrap = document.createElement("div");
    wrap.className = "download-actions";

    const pdfBtn = document.createElement("button");
    pdfBtn.type = "button";
    pdfBtn.className = "btn btn--download";
    pdfBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 12h10M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Download PDF report
    `;
    pdfBtn.addEventListener("click", () => ExportService.downloadPDF(summary));

    const xlsBtn = document.createElement("button");
    xlsBtn.type = "button";
    xlsBtn.className = "btn btn--download";
    xlsBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 12h10M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Download Excel workbook
    `;
    xlsBtn.addEventListener("click", () => ExportService.downloadExcel(summary));

    wrap.append(pdfBtn, xlsBtn);
    return wrap;
  }

  function _escape(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  return { render };
})();

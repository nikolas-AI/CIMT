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
    view.setAttribute("aria-label", "Impact summary");

    view.appendChild(_buildHero(summary));
    view.appendChild(_buildKpiStrip(summary));
    view.appendChild(_buildEstimateCallout(summary));
    view.appendChild(_buildImpactNarrative(summary));
    if (summary.impactMethod === "volunteerHours") {
      view.appendChild(_buildBreakdown(summary));
    }
    if (summary.impactMethod === "clinicalServices" && _hasReportedServices(summary)) {
      view.appendChild(_buildServiceImpact(summary));
      view.appendChild(_buildServiceValueChart(summary));
    }
    const serviceRanking = _buildServiceRanking(summary);
    if (serviceRanking) view.appendChild(serviceRanking);
    if (summary.reportingPeriodClinicCost !== null) {
      view.appendChild(_buildBudgetMetrics(summary));
    }
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
    view.appendChild(_buildFunderReadyStatement(summary));
    view.appendChild(_buildDownloadActions(summary));

    // Back returns to the last input step; Start Over is a separate callback
    // that clears state before returning to the first step.
    const nav = NavigationButtons.create({
      backLabel: AppCopy.summaryDashboard.backAction,
      onBack,
      nextLabel: AppCopy.summaryDashboard.startOverAction,
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
    hero.setAttribute("aria-label", "Estimated total value");

    hero.innerHTML = `
      <p class="impact-hero__status" role="status">&#10003; ${_escape(AppCopy.summaryDashboard.reportComplete)}</p>
      <p class="impact-hero__eyebrow">${_escape(AppCopy.summaryDashboard.eyebrow)}</p>
      <p class="impact-hero__clinic">${_escape(headline)}</p>
      <p class="impact-hero__address">${_escape(summary.streetAddress)}, ${_escape(summary.city)}, ${_escape(summary.state)} ${_escape(summary.zipCode)}</p>
      <p class="impact-hero__period">${_escape(_formatRange(summary.reportingPeriodFrom, summary.reportingPeriodTo))}</p>
      <p class="impact-hero__total" aria-label="Total estimated value: ${Formatting.currency(summary.totalEstimatedValue)}">
        ${Formatting.currency(summary.totalEstimatedValue)}
      </p>
      <p class="impact-hero__label">${_escape(summary.impactMethod === "volunteerHours" ? AppCopy.summaryDashboard.estimatedVolunteerValue : AppCopy.summaryDashboard.estimatedServiceValue)}</p>
    `;
    return hero;
  }

  function _buildKpiStrip(summary) {
    const section = document.createElement("section");
    section.className = "summary-kpis";
    section.setAttribute("aria-labelledby", "summary-kpis-heading");

    const activityLabel = summary.impactMethod === "volunteerHours"
      ? AppCopy.summaryDashboard.volunteerHoursKpi
      : AppCopy.summaryDashboard.clinicalServicesKpi;
    const activityValue = summary.impactMethod === "volunteerHours"
      ? Formatting.number(_totalVolunteerHours(summary), 1)
      : Formatting.number(_serviceCount(summary), 0);
    const cards = [
      [activityLabel, activityValue, summary.impactMethod === "volunteerHours" ? AppCopy.summaryDashboard.donatedTimeNote : AppCopy.summaryDashboard.reportedActivityNote],
      [AppCopy.summaryDashboard.estimatedCommunityValueKpi, Formatting.currency(summary.totalEstimatedValue), AppCopy.summaryDashboard.estimatedCommunityValueNote],
    ];

    if (summary.reportingPeriodClinicCost !== null) {
      const ratio = summary.valueToCostRatio === null ? "—" : `$${summary.valueToCostRatio.toFixed(2)}`;
      cards.push([AppCopy.summaryDashboard.valuePerDollarKpi, ratio, AppCopy.summaryDashboard.valuePerDollarNote]);
    }

    section.innerHTML = `
      <h2 class="sr-only" id="summary-kpis-heading">${_escape(AppCopy.summaryDashboard.kpiHeading)}</h2>
      <div class="summary-kpis__grid">
        ${cards.map(([label, value, note]) => `
          <div class="summary-kpi">
            <p class="summary-kpi__label">${_escape(label)}</p>
            <p class="summary-kpi__value">${_escape(value)}</p>
            <p class="summary-kpi__note">${_escape(note)}</p>
          </div>
        `).join("")}
      </div>
    `;
    return section;
  }

  function _buildEstimateCallout(summary) {
    const section = document.createElement("section");
    section.className = "estimate-callout";
    section.setAttribute("aria-labelledby", "estimate-callout-heading");
    section.innerHTML = `
      <div class="estimate-callout__icon" aria-hidden="true">i</div>
      <div>
        <h2 id="estimate-callout-heading">${_escape(AppCopy.summaryDashboard.estimateHeading)}</h2>
        <p>${_escape(AppCopy.summaryDashboard.estimateIntro(summary.impactMethod))}</p>
        <details>
          <summary>${_escape(AppCopy.summaryDashboard.estimateDetailsLabel)}</summary>
          <p>${_escape(AppCopy.summaryDashboard.estimateDetails(summary.impactMethod))}</p>
        </details>
      </div>
    `;
    return section;
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
    heading.textContent = "Estimated value at a glance";
    section.appendChild(heading);

    if (summary.impactMethod === "volunteerHours") {
      if (hasMedicalVolunteerValue) {
        section.appendChild(_buildCard(
          "Estimated value of medical volunteer time",
          summary.medicalProfessionalVolunteerValue,
          AppCopy.metric.estimatedMedicalProfessionalVolunteerValueNote,
          "volunteer",
          summary.totalEstimatedValue
            ? (summary.medicalProfessionalVolunteerValue / summary.totalEstimatedValue) * 100
            : 0
        ));
      }
      if (hasNonMedicalVolunteerValue) {
        section.appendChild(_buildCard(
          "Estimated value of non-medical volunteer time",
          summary.nonMedicalVolunteerValue,
          AppCopy.metric.estimatedNonMedicalVolunteerValueNote,
          "volunteer",
          summary.totalEstimatedValue
            ? (summary.nonMedicalVolunteerValue / summary.totalEstimatedValue) * 100
            : 0
        ));
      }
    }

    if (hasServices || hasVolunteerHours) {
      section.appendChild(_buildCard(
        summary.impactMethod === "volunteerHours" ? "Estimated value of total volunteer time" : "Estimated value of clinical services",
        summary.totalEstimatedValue,
        summary.impactMethod === "volunteerHours"
          ? "Estimated value of the total reported donated time. Includes both medical and non-medical volunteer time."
            : _totalValueNote(summary.impactMethod),
        "total",
        100
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
    statement.setAttribute("aria-label", "Impact statement for grants and donors");

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
      return `During ${periodLabel}, ${clinicName} reported ${volunteerHours} donated volunteer hours. Using reference hourly rates, the estimated value of that time was ${totalText}.`;
    }
    const activityText = `${clinicName} reported delivering ${serviceCount} clinical services.`;
    const valueText = `with an estimated service value of ${clinicalText}.`;
    const serviceText = hasServices
      ? ` The highest-value service was ${topService}, contributing ${Formatting.number(topServiceShare, 1)}% of the clinic’s estimated service value.`
      : "";
    return `During ${periodLabel}, ${activityText} Using national reference rates, the estimated total value was ${totalText}, ${valueText}${serviceText}`;
  }

  function _buildCard(label, value, note, variant, share = 0) {
    const card = document.createElement("div");
    card.className = `impact-card impact-card--${variant}`;
    card.style.setProperty("--impact-share", `${Math.min(100, Math.max(0, share))}%`);
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
            <strong>${_escape(service.serviceName)}</strong> had the largest share of the estimated service value, with
            <strong>${Formatting.number(service.count, 0)} services</strong> and an estimated value of
            <strong>${Formatting.currency(service.estimatedValue)}</strong>.
          </p>
          <p class="service-impact__stats">${_escape(AppCopy.summaryDashboard.topContributorStats(
            Formatting.number(service.count, 0),
            Formatting.currency(service.estimatedValue),
            Formatting.number(service.clinicalValueShare, 1)
          ))}</p>
          <div class="service-impact__bar" role="img" aria-label="${_escape(service.serviceName)} contributed ${Formatting.number(service.clinicalValueShare, 1)} percent of estimated service value">
            <span style="width: ${Math.min(100, Math.max(0, service.clinicalValueShare))}%"></span>
          </div>
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

  function _buildServiceValueChart(summary) {
    const rows = summary.serviceImpactRanking?.byValue || [];
    if (rows.length === 0) return null;

    const section = document.createElement("section");
    section.className = "summary-section service-value-chart";
    section.setAttribute("aria-labelledby", "service-value-chart-heading");
    const maximum = Math.max(...rows.map(row => row.estimatedValue), 1);
    section.innerHTML = `
      <h2 class="summary-section__heading" id="service-value-chart-heading">${_escape(AppCopy.summaryDashboard.valueChartHeading)}</h2>
      <p class="summary-section__intro">${_escape(AppCopy.summaryDashboard.valueChartIntro)}</p>
      <div class="service-value-chart__rows">
        ${rows.map(row => {
          const width = Math.min(100, Math.max(0, row.estimatedValue / maximum * 100));
          return `
            <div class="service-value-chart__row">
              <div class="service-value-chart__label">
                <span>${_escape(row.serviceName)}</span>
                <strong>${Formatting.currency(row.estimatedValue)}</strong>
              </div>
              <div class="service-value-chart__track" aria-hidden="true">
                <span style="width: ${width}%"></span>
              </div>
            </div>
          `;
        }).join("")}
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
        <div class="service-ranking__controls" role="group" aria-label="Show services by">
          <button type="button" class="service-ranking__toggle is-active" data-ranking-mode="value" aria-pressed="true">Estimated value</button>
          <button type="button" class="service-ranking__toggle" data-ranking-mode="visits" aria-pressed="false">Number reported</button>
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
              <th scope="col">Number reported</th>
              <th scope="col">Reference rate</th>
              <th scope="col">Estimated value</th>
              <th scope="col">Share of total estimated service value</th>
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
    const totalValueNote = _totalValueNote(summary.impactMethod);

    section.innerHTML = `
      <h2 class="summary-section__heading" id="budget-metrics-heading">${AppCopy.summaryView.costHeading}</h2>
      <p class="summary-section__intro">
        ${AppCopy.summaryView.costIntro(summary.reportingPeriodClinicCost)}
      </p>
      <div class="budget-metrics__grid">
        ${_buildMetric("Reported clinic cost", Formatting.currency(summary.reportingPeriodClinicCost), "Total clinic cost reported for this period.")}
        ${_buildMetric("Estimated total value", Formatting.currency(summary.totalEstimatedValue), totalValueNote)}
        ${_buildMetric(AppCopy.summaryView.valuePerDollarLabel, `$${ratioText}`, "Estimated value for every $1 of reported clinic cost.")}
        ${_buildMetric(AppCopy.summaryView.benchmarkComparisonLabel, `${benchmarkPercent}% ${benchmarkDirection}`, "The estimated total value compared with the reported clinic cost.")}
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
  // Reference rate table
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
        <h2 class="summary-section__heading">Reference rates used</h2>
        <p class="summary-section__intro">
          Clinical service values use publicly available reference rates. These rates provide a consistent way to estimate the value of the services reported.
        </p>
      `;
    }

    const tableWrap = document.createElement("div");
    tableWrap.style.overflowX = "auto";

    // Services table
    if (summary.serviceBreakdown.length > 0) {
      const svcTable = document.createElement("table");
      svcTable.className = "rate-table";
      svcTable.setAttribute("aria-label", "Clinical service reference rates");
      svcTable.innerHTML = `
        <thead>
          <tr>
            <th scope="col">Service</th>
            <th scope="col">Service code</th>
            <th scope="col">Reference rate</th>
            <th scope="col">Number reported</th>
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
      volHeading.textContent = "Volunteer time reference rates";
      tableWrap.appendChild(volHeading);

      const volTable = document.createElement("table");
      volTable.className = "rate-table";
      volTable.setAttribute("aria-label", "Volunteer time reference rates");
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
    section.className = "summary-section summary-disclosure";

    const items = REFERENCES.map(ref => `
      <li>
        <a href="${_escape(ref.url)}" target="_blank" rel="noopener noreferrer">${_escape(ref.title)}</a>
        — ${_escape(ref.organization)}${ref.year ? ` (${ref.year})` : ""}.
        ${ref.description ? `<br><span style="color:var(--color-muted)">${_escape(ref.description)}</span>` : ""}
      </li>
    `).join("");

    section.innerHTML = `
      <details>
        <summary class="summary-section__heading">Sources and references</summary>
        <ul class="references-list">${items}</ul>
      </details>
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

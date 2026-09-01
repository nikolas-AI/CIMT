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

  function render(summary, { onBack }) {
    const container = document.getElementById("view-container");
    container.innerHTML = "";

    const view = document.createElement("div");
    view.className = "view";
    view.setAttribute("role", "region");
    view.setAttribute("aria-label", "Impact Summary");

    view.appendChild(_buildHero(summary));
    view.appendChild(_buildDisclaimer());
    view.appendChild(_buildBreakdown(summary));
    view.appendChild(_buildRateTable(summary));
    view.appendChild(_buildVolunteerRateSource());
    view.appendChild(_buildReferences());
    view.appendChild(_buildDownloadActions(summary));

    // Back navigation
    const nav = NavigationButtons.create({
      backLabel: "Back",
      onBack,
      nextLabel: "Edit Inputs",
      onNext: onBack,  // "Edit Inputs" is just back
    });
    // Override next button to say "Edit Inputs" not "Next"
    // (already set via nextLabel above)
    view.appendChild(nav);

    container.appendChild(view);
  }

  // ---------------------------------------------------------------
  // Hero — clinic name + total value
  // ---------------------------------------------------------------
  function _buildHero(summary) {
    const hero = document.createElement("div");
    hero.className = "impact-hero";
    hero.setAttribute("aria-label", "Impact total");

    hero.innerHTML = `
      <p class="impact-hero__clinic">${_escape(summary.clinicName || "Your Clinic")}</p>
      <p class="impact-hero__total" aria-label="Total estimated value: ${Formatting.currency(summary.totalEstimatedValue)}">
        ${Formatting.currency(summary.totalEstimatedValue)}
      </p>
      <p class="impact-hero__label">Estimated Value of Care and Volunteer Contributions</p>
    `;
    return hero;
  }

  // ---------------------------------------------------------------
  // Disclaimer
  // ---------------------------------------------------------------
  function _buildDisclaimer() {
    const d = document.createElement("p");
    d.className = "impact-disclaimer";
    d.setAttribute("role", "note");
    d.textContent =
      "This is a benchmark-based estimate of the value of services and volunteer contributions. " +
      "It does not represent actual revenue, Medicare reimbursement, or guaranteed healthcare savings.";
    return d;
  }

  // ---------------------------------------------------------------
  // Breakdown cards — clinical value + volunteer value
  // ---------------------------------------------------------------
  function _buildBreakdown(summary) {
    const section = document.createElement("div");
    section.className = "impact-breakdown";

    section.appendChild(_buildCard(
      "Clinical Service Value",
      summary.clinicalServiceValue,
      "Based on reported service activity and applicable healthcare benchmark rates."
    ));

    section.appendChild(_buildCard(
      "Volunteer Contribution Value",
      summary.volunteerValue,
      "Based on reported volunteer hours and applicable benchmark hourly values."
    ));

    return section;
  }

  function _buildCard(label, value, note) {
    const card = document.createElement("div");
    card.className = "impact-card";
    card.innerHTML = `
      <p class="impact-card__label">${label}</p>
      <p class="impact-card__value">${Formatting.currency(value)}</p>
      <p class="impact-card__note">${note}</p>
    `;
    return card;
  }

  // ---------------------------------------------------------------
  // Medical benchmark rate table
  // ---------------------------------------------------------------
  function _buildRateTable(summary) {
    const section = document.createElement("div");
    section.className = "summary-section";

    section.innerHTML = `
      <h2 class="summary-section__heading">Medical Benchmark Rates Used</h2>
      <p class="summary-section__intro">
        Clinical service values are estimated using publicly available healthcare benchmark rates.
        These benchmarks provide a consistent reference point for estimating the value of services
        provided.
      </p>
    `;

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

    section.appendChild(tableWrap);
    return section;
  }

  // ---------------------------------------------------------------
  // Volunteer rate source info box
  // ---------------------------------------------------------------
  function _buildVolunteerRateSource() {
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
      <h2 class="summary-section__heading">References</h2>
      <ul class="references-list">${items}</ul>
    `;
    return section;
  }

  // ---------------------------------------------------------------
  // Download actions (stubs connected to ExportService)
  // ---------------------------------------------------------------
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
      Download PDF Summary
    `;
    pdfBtn.addEventListener("click", () => ExportService.downloadPDF(summary));

    const xlsBtn = document.createElement("button");
    xlsBtn.type = "button";
    xlsBtn.className = "btn btn--download";
    xlsBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 12h10M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Download Excel Breakdown
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

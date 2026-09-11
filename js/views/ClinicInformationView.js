/**
 * ClinicInformationView.js — View 2
 *
 * Renders the clinic name input and tool introduction.
 * Validates before advancing; writes to app state on success.
 */

"use strict";

const ClinicInformationView = (() => {

  let _activeState = null;

  function render(state, { onBack, onNext }) {
    _activeState = state;
    // This first screen asks for the clinic name and reporting dates. The
    // inputs are rebuilt from state whenever the user returns here, so saved
    // values are not lost.
    // This view owns only the first form step. It reads the current name from
    // state so returning from a later step preserves edits until Start Over.
    const container = document.getElementById("view-container");
    container.innerHTML = "";

    const view = document.createElement("div");
    view.className = "view";
    view.setAttribute("role", "region");
    view.setAttribute("aria-label", "Clinic Information");

    const clinic = state.clinic || {};

    view.innerHTML = `
      <h1 class="view-heading">Estimate Your Clinic's Impact</h1>

      <p class="view-intro">
        The Clinic Impact Estimator helps you communicate the value of the care and volunteer
        support your clinic provides. Enter a few simple details to create an estimated
        impact summary.
      </p>

      <div class="view-disclaimer" role="note">
        <strong>A note on these estimates:</strong> This tool provides benchmark-based estimates
        of service value. It does not calculate actual revenue, reimbursement, or guaranteed
        healthcare savings.
      </div>

      <section class="clinic-snapshot" aria-labelledby="clinic-snapshot-heading">
        <div class="clinic-snapshot__header">
          <h2 id="clinic-snapshot-heading">Clinic snapshot</h2>
          <p>Set the organization and dates this report represents.</p>
        </div>

      <div class="field">
        <label class="field__label" for="clinic-name">
          Clinic name <span class="required-mark" aria-hidden="true">*</span>
        </label>
        <input
          id="clinic-name"
          class="field__input"
          type="text"
          placeholder="Enter your clinic name"
          autocomplete="organization"
          aria-required="true"
          aria-describedby="clinic-name-error"
          value="${_escape(clinic.name)}"
        >
        <span id="clinic-name-error" class="field__error" role="alert"></span>
      </div>

      <div class="clinic-address-fields">
        <div class="field">
          <label class="field__label" for="clinic-street-address">
            Street address <span class="required-mark" aria-hidden="true">*</span>
          </label>
          <input
            id="clinic-street-address"
            class="field__input"
            type="text"
            autocomplete="street-address"
            placeholder="123 Main Street"
            aria-required="true"
            aria-describedby="clinic-street-address-error"
            value="${_escape(clinic.streetAddress)}"
          >
          <span id="clinic-street-address-error" class="field__error" role="alert"></span>
        </div>

        <div class="clinic-address-fields__city-state">
          <div class="field">
            <label class="field__label" for="clinic-city">
              City <span class="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="clinic-city"
              class="field__input"
              type="text"
              autocomplete="address-level2"
              aria-required="true"
              aria-describedby="clinic-city-error"
              value="${_escape(clinic.city)}"
            >
            <span id="clinic-city-error" class="field__error" role="alert"></span>
          </div>
          <div class="field">
            <label class="field__label" for="clinic-state">
              State <span class="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="clinic-state"
              class="field__input"
              type="text"
              maxlength="2"
              autocomplete="address-level1"
              placeholder="e.g. NC"
              aria-required="true"
              aria-describedby="clinic-state-error"
              value="${_escape(clinic.state)}"
            >
            <span id="clinic-state-error" class="field__error" role="alert"></span>
          </div>
        </div>

        <div class="field clinic-address-fields__zip">
          <label class="field__label" for="clinic-zip-code">
            ZIP code <span class="required-mark" aria-hidden="true">*</span>
          </label>
          <input
            id="clinic-zip-code"
            class="field__input"
            type="text"
            inputmode="numeric"
            maxlength="10"
            autocomplete="postal-code"
            placeholder="27601"
            aria-required="true"
            aria-describedby="clinic-zip-code-error"
            value="${_escape(clinic.zipCode)}"
          >
          <span id="clinic-zip-code-error" class="field__error" role="alert"></span>
        </div>
      </div>

      <div class="field reporting-period-fields">
        <span class="field__label">Reporting period <span class="required-mark" aria-hidden="true">*</span></span>
        <div class="reporting-period-fields__inputs">
          <div>
            <label class="field__sublabel" for="reporting-period-from">From</label>
            <input
              id="reporting-period-from"
              class="field__input"
              type="date"
              aria-required="true"
              aria-describedby="reporting-period-error"
              value="${_escape(clinic.reportingPeriodFrom)}"
            >
          </div>
          <div>
            <label class="field__sublabel" for="reporting-period-to">To</label>
            <input
              id="reporting-period-to"
              class="field__input"
              type="date"
              aria-required="true"
              aria-describedby="reporting-period-error"
              value="${_escape(clinic.reportingPeriodTo)}"
            >
          </div>
        </div>
        <span id="reporting-period-error" class="field__error" role="alert"></span>
      </div>

      <div class="field">
        <label class="field__label" for="reporting-period-clinic-cost">
          Total clinic cost for this reporting period <span class="field__optional">(optional)</span>
        </label>
        <p class="field__help" id="reporting-period-clinic-cost-help">
          Include staffing, supplies, facilities, technology, administration, and other operating expenses for the dates above.
        </p>
        <input
          id="reporting-period-clinic-cost"
          class="field__input"
          type="number"
          min="0.01"
          step="0.01"
          inputmode="decimal"
          placeholder="e.g. 125000"
          aria-describedby="reporting-period-clinic-cost-help reporting-period-clinic-cost-error"
          value="${_escape(clinic.reportingPeriodClinicCost)}"
        >
        <span id="reporting-period-clinic-cost-error" class="field__error" role="alert"></span>
      </div>
      </section>
    `;

    // Navigation
    const nav = NavigationButtons.create({
      backLabel: "Back",
      onBack,
      nextLabel: "Next",
      onNext: () => _handleNext(state, onNext),
    });
    view.appendChild(nav);

    container.appendChild(view);

    // Allow Enter key to advance
    const input = view.querySelector("#clinic-name");
    const streetAddress = view.querySelector("#clinic-street-address");
    const city = view.querySelector("#clinic-city");
    const clinicState = view.querySelector("#clinic-state");
    const zipCode = view.querySelector("#clinic-zip-code");
    const reportingPeriodFrom = view.querySelector("#reporting-period-from");
    const reportingPeriodTo = view.querySelector("#reporting-period-to");
    const reportingPeriodClinicCost = view.querySelector("#reporting-period-clinic-cost");
    input.addEventListener("input", () => {
      state.clinic.name = input.value;
      if (!Validation.clinicName(input.value)) {
        DOM.clearError(input, view.querySelector("#clinic-name-error"));
      }
    });
    const syncAddress = () => {
      state.clinic.streetAddress = streetAddress.value;
      state.clinic.city = city.value;
      state.clinic.state = clinicState.value.toUpperCase();
      state.clinic.zipCode = zipCode.value;
      clinicState.value = state.clinic.state;
      [[streetAddress, "street address", "clinic-street-address-error"],
        [city, "city", "clinic-city-error"],
        [clinicState, "state", "clinic-state-error"]].forEach(([field, label, errorId]) => {
          if (!Validation.clinicAddressField(field.value, label)) {
            DOM.clearError(field, view.querySelector(`#${errorId}`));
          }
        });
      if (!Validation.zipCode(zipCode.value)) {
        DOM.clearError(zipCode, view.querySelector("#clinic-zip-code-error"));
      }
    };
    [streetAddress, city, clinicState, zipCode].forEach(addressInput => {
      addressInput.addEventListener("input", syncAddress);
      addressInput.addEventListener("change", syncAddress);
    });
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") _handleNext(state, onNext);
    });
    const syncReportingPeriod = () => {
      state.clinic.reportingPeriodFrom = reportingPeriodFrom.value;
      state.clinic.reportingPeriodTo = reportingPeriodTo.value;
      if (!Validation.reportingPeriod(reportingPeriodFrom.value, reportingPeriodTo.value)) {
        DOM.clearError(reportingPeriodFrom, view.querySelector("#reporting-period-error"));
        DOM.clearError(reportingPeriodTo, view.querySelector("#reporting-period-error"));
      }
    };
    [reportingPeriodFrom, reportingPeriodTo].forEach(periodInput => {
      periodInput.addEventListener("input", syncReportingPeriod);
      periodInput.addEventListener("change", syncReportingPeriod);
    });
    const syncClinicCost = () => {
      state.clinic.reportingPeriodClinicCost = reportingPeriodClinicCost.value === ""
        ? null
        : Number(reportingPeriodClinicCost.value);
      if (!Validation.reportingPeriodClinicCost(reportingPeriodClinicCost.value)) {
        DOM.clearError(reportingPeriodClinicCost, view.querySelector("#reporting-period-clinic-cost-error"));
      }
    };
    reportingPeriodClinicCost.addEventListener("input", syncClinicCost);
    reportingPeriodClinicCost.addEventListener("change", syncClinicCost);

    // Auto-focus
    input.focus();
  }

  function _handleNext(state, onNext) {
    // Do not move forward until the name contains something besides whitespace.
    // The visible error is attached to this input so the user knows what to fix.
    // Validate before saving and advancing. Keeping the raw value here lets the
    // validator reject whitespace-only input while the saved value is trimmed.
    const input    = document.getElementById("clinic-name");
    const errorEl  = document.getElementById("clinic-name-error");
    const streetAddress = document.getElementById("clinic-street-address");
    const city = document.getElementById("clinic-city");
    const clinicState = document.getElementById("clinic-state");
    const zipCode = document.getElementById("clinic-zip-code");
    const reportingPeriodFrom = document.getElementById("reporting-period-from");
    const reportingPeriodTo = document.getElementById("reporting-period-to");
    const reportingPeriodError = document.getElementById("reporting-period-error");
    const reportingPeriodClinicCost = document.getElementById("reporting-period-clinic-cost");
    const reportingPeriodClinicCostError = document.getElementById("reporting-period-clinic-cost-error");
    const rawValue = input.value;
    const error    = Validation.clinicName(rawValue);

    if (error) {
      DOM.showError(input, errorEl, error);
      input.focus();
      return;
    }

    const addressFields = [
      [streetAddress, "street address", "clinic-street-address-error"],
      [city, "city", "clinic-city-error"],
      [clinicState, "state", "clinic-state-error"],
    ];
    for (const [field, label, errorId] of addressFields) {
      const addressError = Validation.clinicAddressField(field.value, label);
      if (addressError) {
        DOM.showError(field, document.getElementById(errorId), addressError);
        field.focus();
        return;
      }
    }
    const zipError = Validation.zipCode(zipCode.value);
    if (zipError) {
      DOM.showError(zipCode, document.getElementById("clinic-zip-code-error"), zipError);
      zipCode.focus();
      return;
    }

    const reportingPeriodValidation = Validation.reportingPeriod(
      reportingPeriodFrom.value,
      reportingPeriodTo.value
    );
    if (reportingPeriodValidation) {
      const invalidDate = !reportingPeriodFrom.value ? reportingPeriodFrom : reportingPeriodTo;
      DOM.showError(invalidDate, reportingPeriodError, reportingPeriodValidation);
      invalidDate.focus();
      return;
    }

    const clinicCostValidation = Validation.reportingPeriodClinicCost(reportingPeriodClinicCost.value);
    if (clinicCostValidation) {
      DOM.showError(reportingPeriodClinicCost, reportingPeriodClinicCostError, clinicCostValidation);
      reportingPeriodClinicCost.focus();
      return;
    }

    DOM.clearError(input, errorEl);
    _saveDraft(state);
    onNext();
  }

  function _saveDraft(state = _activeState) {
    if (!state || !state.clinic) return;
    const input = document.getElementById("clinic-name");
    const streetAddress = document.getElementById("clinic-street-address");
    const city = document.getElementById("clinic-city");
    const clinicState = document.getElementById("clinic-state");
    const zipCode = document.getElementById("clinic-zip-code");
    const reportingPeriodFrom = document.getElementById("reporting-period-from");
    const reportingPeriodTo = document.getElementById("reporting-period-to");
    const reportingPeriodClinicCost = document.getElementById("reporting-period-clinic-cost");
    if (!input || !streetAddress || !city || !clinicState || !zipCode || !reportingPeriodFrom || !reportingPeriodTo || !reportingPeriodClinicCost) return;

    state.clinic.name = input.value.trim();
    state.clinic.streetAddress = streetAddress.value.trim();
    state.clinic.city = city.value.trim();
    state.clinic.state = clinicState.value.trim().toUpperCase();
    state.clinic.zipCode = zipCode.value.trim();
    state.clinic.reportingPeriodFrom = reportingPeriodFrom.value;
    state.clinic.reportingPeriodTo = reportingPeriodTo.value;
    state.clinic.reportingPeriodClinicCost = reportingPeriodClinicCost.value === ""
      ? null
      : Number(reportingPeriodClinicCost.value);
  }

  function _escape(str) {
    return String(str === null || str === undefined ? "" : str)
      .replace(/&/g,"&amp;")
      .replace(/"/g,"&quot;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;");
  }

  return { render, saveDraft: _saveDraft };
})();

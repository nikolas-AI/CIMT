/**
 * ClinicInformationView.js — View 1
 *
 * Renders the clinic name input and tool introduction.
 * Validates before advancing; writes to app state on success.
 */

"use strict";

const ClinicInformationView = (() => {

  function render(state, { onNext }) {
    const container = document.getElementById("view-container");
    container.innerHTML = "";

    const view = document.createElement("div");
    view.className = "view";
    view.setAttribute("role", "region");
    view.setAttribute("aria-label", "Clinic Information");

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
          value="${_escape(state.clinic.name)}"
        >
        <span id="clinic-name-error" class="field__error" role="alert"></span>
      </div>
    `;

    // Navigation
    const nav = NavigationButtons.create({
      nextLabel: "Next",
      onNext: () => _handleNext(state, onNext),
    });
    view.appendChild(nav);

    container.appendChild(view);

    // Allow Enter key to advance
    const input = view.querySelector("#clinic-name");
    input.addEventListener("input", () => {
      if (!Validation.clinicName(input.value)) {
        DOM.clearError(input, view.querySelector("#clinic-name-error"));
      }
    });
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") _handleNext(state, onNext);
    });

    // Auto-focus
    input.focus();
  }

  function _handleNext(state, onNext) {
    const input    = document.getElementById("clinic-name");
    const errorEl  = document.getElementById("clinic-name-error");
    const rawValue = input.value;
    const error    = Validation.clinicName(rawValue);

    if (error) {
      DOM.showError(input, errorEl, error);
      input.focus();
      return;
    }

    DOM.clearError(input, errorEl);
    state.clinic.name = rawValue.trim();
    onNext();
  }

  function _escape(str) {
    return (str || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  return { render };
})();

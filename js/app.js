/**
 * app.js — Application state and router
 *
 * This is the application's traffic controller. It remembers all answers in
 * one state object and decides which screen should be displayed. The views do
 * the form work, while this file connects the screens in the correct order.
 *
 * This file starts the application after the HTML page has loaded.
 */

"use strict";

(function () {

  // -----------------------------------------------------------------
  // APPLICATION STATE
  // All answers live here while the app is open. A view receives this object,
  // reads values from it when it is drawn, and writes new values back into it.
  // -----------------------------------------------------------------
  // Set to false when the estimator is ready for normal blank starts.
  const TESTING_DEFAULTS_ENABLED = true;
  const TESTING_DEFAULTS = {
    clinic: {
      name: "Testing Community Clinic",
      streetAddress: "123 Main Street",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      reportingPeriodFrom: "2026-01-01",
      reportingPeriodTo: "2026-06-30",
      reportingPeriodClinicCost: 25000,
    },
    impactMethod: "clinicalServices",
    volunteers: [],
    services: [
      { id: "test-service-1", serviceId: "primary-care-brief", count: 25 },
      { id: "test-service-2", serviceId: "vaccination", count: 40 },
    ],
  };

  const state = {
    /** @type {{ name: string, streetAddress: string, city: string, state: string, zipCode: string, reportingPeriodFrom: string, reportingPeriodTo: string, reportingPeriodClinicCost: number|null }} */
    clinic: TESTING_DEFAULTS_ENABLED ? { ...TESTING_DEFAULTS.clinic } : { name: "", streetAddress: "", city: "", state: "", zipCode: "", reportingPeriodFrom: "", reportingPeriodTo: "", reportingPeriodClinicCost: null },

    /** @type {"volunteerHours"|"clinicalServices"|null} */
    impactMethod: TESTING_DEFAULTS_ENABLED ? TESTING_DEFAULTS.impactMethod : null,

    /** @type {Array<{ id: string, roleId: string, hours: number }>} */
    volunteers: TESTING_DEFAULTS_ENABLED ? TESTING_DEFAULTS.volunteers.map(entry => ({ ...entry })) : [],

    /** @type {Array<{ id: string, serviceId: string, count: number }>} */
    services: TESTING_DEFAULTS_ENABLED ? TESTING_DEFAULTS.services.map(entry => ({ ...entry })) : [],

    /** @type {ImpactSummary|null} */
    impact: null,

    /** @type {number} 0=Welcome, 1=Clinic, 2=Volunteers, 3=Services, 4=Impact */
    currentStep: 0,
  };

  // -----------------------------------------------------------------
  // NAVIGATION
  // -----------------------------------------------------------------
  // Change the active step and rebuild the progress indicator and view.
  function goTo(step) {
    if (state.currentStep === 1) ClinicInformationView.saveDraft(state);
    state.currentStep = step;
    _render();
  }

  function requestStep(step) {
    if (state.currentStep === 1) ClinicInformationView.saveDraft(state);

    if (step <= state.currentStep) {
      goTo(step);
      return;
    }

    const incompleteStep = _firstIncompleteStep(step);
    if (incompleteStep !== null) {
      ProgressIndicator.showWarning(AppCopy.progress.stepWarning(incompleteStep, step));
      return;
    }

    if (step >= 4 && !_impactActivityComplete()) {
      ProgressIndicator.showWarning(AppCopy.validation.impactActivityRequired);
      return;
    }

    goTo(step);
  }

  // Views do not need to know how the whole app is organized. They call these
  // small functions when the user clicks a navigation button.
  function advance() { goTo(state.currentStep + 1); }
  function retreat() { goTo(state.currentStep - 1); }

  // Start Over clears every answer and method selection, then draws the first screen.
  // Replacing the arrays removes the old rows, not just their displayed text.
  function startOver() {
    state.clinic = { name: "", streetAddress: "", city: "", state: "", zipCode: "", reportingPeriodFrom: "", reportingPeriodTo: "", reportingPeriodClinicCost: null };
    state.impactMethod = null;
    state.volunteers = [];
    state.services = [];
    state.impact = null;
    goTo(0);
  }

  // -----------------------------------------------------------------
  // RENDER
  // Decides which view to show and refreshes the progress indicator.
  // -----------------------------------------------------------------
  function _render() {
    ProgressIndicator.render(state.currentStep, requestStep);

    // A screen is rebuilt when the step changes. It reads saved answers and gets
    // callbacks for only the buttons that belong to that screen.
    switch (state.currentStep) {
      case 0:
        WelcomeView.render({ onNext: advance });
        break;

      case 1:
        ClinicInformationView.render(state, { onBack: retreat, onNext: advance });
        break;

      case 2:
        ImpactMethodView.render(state, { onBack: retreat, onNext: advance });
        break;

      case 3:
        ImpactActivityView.render(state, { onBack: retreat, onNext: _computeAndShowImpact });
        break;

      case 4:
        ImpactSummaryView.render(state.impact, { onBack: retreat, onStartOver: startOver });
        break;

      default:
        goTo(0);
    }

    // Scroll to top of content area on each step change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function _firstIncompleteStep(targetStep) {
    if (targetStep >= 2 && !_clinicDetailsComplete()) return 1;
    if (targetStep >= 3 && !_impactMethodComplete()) return 2;
    if (targetStep >= 4 && !_activityDetailsComplete()) return 3;
    return null;
  }

  function _clinicDetailsComplete() {
    return !Validation.clinicName(state.clinic.name) &&
      !Validation.clinicAddressField(state.clinic.streetAddress, "street address") &&
      !Validation.clinicAddressField(state.clinic.city, "city") &&
      !Validation.stateCode(state.clinic.state) &&
      !Validation.zipCode(state.clinic.zipCode) &&
      !Validation.reportingPeriod(state.clinic.reportingPeriodFrom, state.clinic.reportingPeriodTo) &&
      !Validation.reportingPeriodClinicCost(state.clinic.reportingPeriodClinicCost);
  }

  function _impactMethodComplete() {
    return state.impactMethod === "volunteerHours" || state.impactMethod === "clinicalServices";
  }

  function _activityDetailsComplete() {
    const volunteersValid = state.volunteers.every(entry =>
      entry.roleId && Number.isFinite(Number(entry.hours)) && Number(entry.hours) >= 0 &&
      Number.isInteger(Number(entry.hours) * 2)
    );
    const servicesValid = state.services.every(entry =>
      entry.serviceId && Number.isFinite(Number(entry.count)) &&
      Number.isInteger(Number(entry.count)) && Number(entry.count) >= 0
    );
    const hasVolunteerHours = state.volunteers.some(entry => Number(entry.hours) > 0);
    const hasServices = state.services.some(entry => Number(entry.count) > 0);
    if (state.impactMethod === "volunteerHours") {
      return volunteersValid && hasVolunteerHours;
    }
    return servicesValid && hasServices;
  }

  function _impactActivityComplete() {
    return _activityDetailsComplete();
  }

  // -----------------------------------------------------------------
  // IMPACT COMPUTATION
  // Called when the user clicks "See Impact" on View 4.
  // Runs the calculator and then navigates to View 4.
  // -----------------------------------------------------------------
  // Calculate once, save the result, and then show the summary screen. Keeping
  // the math here prevents the summary from using stale totals.
  function _computeAndShowImpact() {
    if (!_impactActivityComplete()) {
      ProgressIndicator.showWarning(AppCopy.validation.impactActivityRequired);
      return;
    }
    state.impact = Calculator.computeImpact(state);
    advance();
  }

  // -----------------------------------------------------------------
  // BOOT
  // -----------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    _render();
  });

})();

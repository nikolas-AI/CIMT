/**
 * app.js — Application state and router
 *
 * Owns the single source of truth (state) and decides which view
 * to render based on currentStep. Views and components read/write
 * state via the references passed to them.
 *
 * This file boots the application.
 */

"use strict";

(function () {

  // -----------------------------------------------------------------
  // APPLICATION STATE
  // A single plain object. Passed by reference to views so they can
  // read and write directly. Replace with a more formal state manager
  // (e.g. Proxy-based observable) in a future version if needed.
  // -----------------------------------------------------------------
  const state = {
    /** @type {{ name: string }} */
    clinic: { name: "" },

    /** @type {Array<{ id: string, roleId: string, hours: number }>} */
    volunteers: [],

    /** @type {Array<{ id: string, serviceId: string, count: number }>} */
    services: [],

    /** @type {boolean} */
    noVolunteerHours: false,

    /** @type {boolean} */
    noServicesProvided: false,

    /** @type {ImpactSummary|null} */
    impact: null,

    /** @type {number} 0=Clinic, 1=Volunteers, 2=Services, 3=Impact */
    currentStep: 0,
  };

  // -----------------------------------------------------------------
  // NAVIGATION
  // -----------------------------------------------------------------
  function goTo(step) {
    state.currentStep = step;
    _render();
  }

  function advance() { goTo(state.currentStep + 1); }
  function retreat() { goTo(state.currentStep - 1); }

  function startOver() {
    state.clinic = { name: "" };
    state.volunteers = [];
    state.services = [];
    state.noVolunteerHours = false;
    state.noServicesProvided = false;
    state.impact = null;
    goTo(0);
  }

  // -----------------------------------------------------------------
  // RENDER
  // Decides which view to show and refreshes the progress indicator.
  // -----------------------------------------------------------------
  function _render() {
    ProgressIndicator.render(state.currentStep);

    switch (state.currentStep) {
      case 0:
        ClinicInformationView.render(state, { onNext: advance });
        break;

      case 1:
        VolunteerHoursView.render(state, { onBack: retreat, onNext: advance });
        break;

      case 2:
        ClinicalServicesView.render(state, { onBack: retreat, onNext: _computeAndShowImpact });
        break;

      case 3:
        ImpactSummaryView.render(state.impact, { onBack: retreat, onStartOver: startOver });
        break;

      default:
        goTo(0);
    }

    // Scroll to top of content area on each step change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // -----------------------------------------------------------------
  // IMPACT COMPUTATION
  // Called when the user clicks "See Impact" on View 3.
  // Runs the calculator and then navigates to View 4.
  // -----------------------------------------------------------------
  function _computeAndShowImpact() {
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

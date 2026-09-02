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
  // Change the active step and rebuild the progress indicator and view.
  function goTo(step) {
    state.currentStep = step;
    _render();
  }

  // Views do not need to know how the whole app is organized. They call these
  // small functions when the user clicks a navigation button.
  function advance() { goTo(state.currentStep + 1); }
  function retreat() { goTo(state.currentStep - 1); }

  // Start Over clears every answer and checkbox, then draws the first screen.
  // Replacing the arrays removes the old rows, not just their displayed text.
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

    // A screen is rebuilt when the step changes. It reads saved answers and gets
    // callbacks for only the buttons that belong to that screen.
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
  // Calculate once, save the result, and then show the summary screen. Keeping
  // the math here prevents the summary from using stale totals.
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

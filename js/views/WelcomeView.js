/**
 * WelcomeView.js — View 1
 *
 * Introduces the estimator, explains the type of information it uses, and
 * starts the clinic reporting workflow.
 */

"use strict";

const WelcomeView = (() => {

  function render({ onNext }) {
    const container = document.getElementById("view-container");
    container.innerHTML = "";

    const view = document.createElement("div");
    view.className = "view welcome-view";
    view.setAttribute("role", "region");
    view.setAttribute("aria-label", "Welcome");

    view.innerHTML = `
      <section class="welcome-hero" aria-labelledby="welcome-heading">
        <p class="welcome-hero__eyebrow">Clinic Impact Estimator</p>
        <h1 class="view-heading" id="welcome-heading">Make the value of your clinic visible.</h1>
        <p class="view-intro">
          Build a clear, benchmark-based picture of the care, services, and volunteer support
          your clinic provides.
        </p>
        <p class="welcome-hero__note">
          The process takes a few minutes and uses aggregate clinic information only.
        </p>
      </section>

      <div class="view-disclaimer welcome-disclaimer" role="note">
        <strong>Privacy and interpretation:</strong> No patient names, medical records, or
        other patient-level information is needed. Results are estimates based on benchmark
        rates and should not be interpreted as actual revenue, reimbursement, or guaranteed savings.
      </div>
    `;

    const nav = NavigationButtons.create({
      nextLabel: "Begin",
      onNext,
    });
    view.appendChild(nav);

    container.appendChild(view);
  }

  return { render };
})();

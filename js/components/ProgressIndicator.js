/**
 * ProgressIndicator.js — Step progress nav component
 *
 * Draws the five-step progress bar at the top of the page.
 * It receives the current step number from app.js and does not store its own
 * copy, so the bar always follows the screen currently being displayed.
 */

"use strict";

const ProgressIndicator = (() => {

  const STEPS = [
    { label: "Welcome",    index: 0 },
    { label: "Clinic",     index: 1 },
    { label: "Method",     index: 2 },
    { label: "Activity",   index: 3 },
    { label: "Impact",     index: 4 },
  ];

  /**
  * Rebuild the progress bar for the currently visible screen.
   *
  * A step is complete when it comes before currentStep. The current step gets
  * aria-current so screen readers can announce the user's position. Rebuilding
  * this small component is simpler than updating each dot and line separately.
   *
  * @param {number} currentStep Zero-based index: 0 is Welcome and 4 is Impact.
   */
  function render(currentStep, onStep) {
    const container = document.getElementById("progress-indicator");
    if (!container) return;

    container.innerHTML = "";

    STEPS.forEach((step, i) => {
      const isDone   = i < currentStep;
      const isActive = i === currentStep;

      const statusClass = isDone
        ? "progress-step--done"
        : isActive
          ? "progress-step--active"
          : "";

      const dotContent = isDone
        ? `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
             <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
           </svg>`
        : String(i + 1);

      const ariaCurrent = isActive ? 'aria-current="step"' : "";

      // Draw a connector before every step after the first. CSS colors it based
      // on the preceding step's status.
      const connector = i > 0
        ? `<div class="progress-step__connector" aria-hidden="true"></div>`
        : "";

      container.insertAdjacentHTML("beforeend", `
        ${connector}
        <button class="progress-step ${statusClass}" type="button" data-step="${step.index}" ${ariaCurrent}>
          <div class="progress-step__label-wrap">
            <div class="progress-step__dot" aria-hidden="true">${dotContent}</div>
            <span class="progress-step__text">${step.label}</span>
          </div>
        </button>
      `);
    });

    container.querySelectorAll("[data-step]").forEach(button => {
      button.addEventListener("click", () => {
        if (typeof onStep === "function") onStep(Number(button.dataset.step));
      });
    });

    const warning = document.createElement("p");
    warning.id = "progress-warning";
    warning.className = "progress-warning";
    warning.setAttribute("role", "alert");
    warning.hidden = true;
    container.appendChild(warning);
  }

  function showWarning(message) {
    const warning = document.getElementById("progress-warning");
    if (!warning) return;
    warning.textContent = message;
    warning.hidden = false;
  }

  return { render, showWarning };
})();

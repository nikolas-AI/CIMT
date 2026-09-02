/**
 * ProgressIndicator.js — Step progress nav component
 *
 * Draws the four-step progress bar at the top of the page.
 * It receives the current step number from app.js and does not store its own
 * copy, so the bar always follows the screen currently being displayed.
 */

"use strict";

const ProgressIndicator = (() => {

  const STEPS = [
    { label: "Clinic",     index: 0 },
    { label: "Volunteers", index: 1 },
    { label: "Services",   index: 2 },
    { label: "Impact",     index: 3 },
  ];

  /**
  * Rebuild the progress bar for the currently visible screen.
   *
  * A step is complete when it comes before currentStep. The current step gets
  * aria-current so screen readers can announce the user's position. Rebuilding
  * this small component is simpler than updating each dot and line separately.
   *
  * @param {number} currentStep Zero-based index: 0 is Clinic and 3 is Impact.
   */
  function render(currentStep) {
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
        <div class="progress-step ${statusClass}" ${ariaCurrent}>
          <div class="progress-step__label-wrap">
            <div class="progress-step__dot" aria-hidden="true">${dotContent}</div>
            <span class="progress-step__text">${step.label}</span>
          </div>
        </div>
      `);
    });
  }

  return { render };
})();

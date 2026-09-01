/**
 * ProgressIndicator.js — Step progress nav component
 *
 * Renders into #progress-indicator.
 * Driven entirely by the current step index; no internal state.
 */

"use strict";

const ProgressIndicator = (() => {

  const STEPS = [
    { label: "Clinic",     index: 0 },
    { label: "Volunteers", index: 1 },
    { label: "Services",   index: 2 },
    { label: "Impact",     index: 3 },
  ];

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

      // Connector line before each step except the first
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

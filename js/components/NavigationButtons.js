/**
 * NavigationButtons.js — Shared Back / Next navigation row
 *
 * Builds the Back and Next buttons used by the form screens.
 * It returns the buttons inside a wrapper; the calling screen decides where
 * to place that wrapper and what each click should do.
 */

"use strict";

const NavigationButtons = (() => {

  /**
  * @param {object} options Settings supplied by the current screen.
  * @param {string} [options.backLabel] Text for Back; omit it on the first screen.
  * @param {string} [options.nextLabel] Text for the forward button.
  * @param {Function} [options.onBack] Function called when Back is clicked.
  * @param {Function} options.onNext Function called when the forward button is clicked.
  * @returns {HTMLElement} A wrapper containing the requested buttons.
   */
  function create({ backLabel, nextLabel = "Next", onBack, onNext }) {
    // This component only builds buttons and attaches callbacks. It does not
    // know which screen is open, so it can be reused throughout the app.
    const row = document.createElement("div");
    row.className = backLabel ? "nav-buttons" : "nav-buttons nav-buttons--end";

    if (backLabel && onBack) {
      const back = document.createElement("button");
      back.type = "button";
      back.className = "btn btn--secondary";
      back.textContent = backLabel;
      back.addEventListener("click", onBack);
      row.appendChild(back);
    }

    const next = document.createElement("button");
    next.type = "button";
    next.className = "btn btn--primary";
    next.textContent = nextLabel;
    next.addEventListener("click", onNext);
    row.appendChild(next);

    return row;
  }

  return { create };
})();

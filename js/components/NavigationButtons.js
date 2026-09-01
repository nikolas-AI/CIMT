/**
 * NavigationButtons.js — Shared Back / Next navigation row
 *
 * Returns a DOM element; does not mount itself.
 * Callers provide label strings and callback functions.
 */

"use strict";

const NavigationButtons = (() => {

  /**
   * @param {object} options
   * @param {string}   [options.backLabel]   — omit to hide Back
   * @param {string}   [options.nextLabel]   — defaults to "Next"
   * @param {Function} [options.onBack]
   * @param {Function}  options.onNext
   * @returns {HTMLElement}
   */
  function create({ backLabel, nextLabel = "Next", onBack, onNext }) {
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

/**
 * utils.js — Shared utility functions
 *
 * Pure helpers with no side-effects on app state.
 * DOM helpers are light wrappers, not a framework.
 */

"use strict";

// -----------------------------------------------------------------
// FORMATTING
// -----------------------------------------------------------------
const Formatting = (() => {
  function currency(value) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }

  function number(value, decimals = 1) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }

  return { currency, number };
})();

// -----------------------------------------------------------------
// VALIDATION
// -----------------------------------------------------------------
const Validation = (() => {
  function clinicName(value) {
    const trimmed = (value || "").trim();
    if (!trimmed) return "Please enter your clinic name.";
    return null; // valid
  }

  function volunteerEntry(roleId, hours) {
    if (!roleId) return "Please select a volunteer role.";
    const h = parseFloat(hours);
    if (hours === "" || hours === null || hours === undefined || isNaN(h))
      return "Please enter the number of volunteer hours.";
    if (h < 0) return "Hours cannot be negative.";
    return null;
  }

  function serviceEntry(serviceId, count) {
    if (!serviceId) return "Please select a clinical service.";
    const c = parseInt(count, 10);
    if (count === "" || count === null || count === undefined || isNaN(c))
      return "Please enter the number of visits.";
    if (c < 0) return "The count cannot be negative.";
    return null;
  }

  return { clinicName, volunteerEntry, serviceEntry };
})();

// -----------------------------------------------------------------
// DOM HELPERS
// -----------------------------------------------------------------
const DOM = (() => {
  function el(tag, attrs = {}, ...children) {
    const element = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "className") element.className = v;
      else if (k.startsWith("on") && typeof v === "function")
        element.addEventListener(k.slice(2).toLowerCase(), v);
      else element.setAttribute(k, v);
    }
    for (const child of children) {
      if (child === null || child === undefined) continue;
      if (typeof child === "string") element.appendChild(document.createTextNode(child));
      else element.appendChild(child);
    }
    return element;
  }

  function setContent(container, ...nodes) {
    container.innerHTML = "";
    nodes.forEach(n => {
      if (typeof n === "string") container.insertAdjacentHTML("beforeend", n);
      else container.appendChild(n);
    });
  }

  function show(el) { el.style.display = ""; }
  function hide(el) { el.style.display = "none"; }

  function showError(inputEl, errorEl, message) {
    inputEl.classList.add("is-error");
    inputEl.setAttribute("aria-invalid", "true");
    errorEl.textContent = message;
    errorEl.classList.add("is-visible");
  }

  function clearError(inputEl, errorEl) {
    inputEl.classList.remove("is-error");
    inputEl.removeAttribute("aria-invalid");
    errorEl.textContent = "";
    errorEl.classList.remove("is-visible");
  }

  return { el, setContent, show, hide, showError, clearError };
})();

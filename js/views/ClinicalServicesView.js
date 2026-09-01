/**
 * ClinicalServicesView.js — View 3
 *
 * Dynamic list of clinical service + visit-count entries.
 * Uses EntryList component; reads/writes app state.
 */

"use strict";

const ClinicalServicesView = (() => {

  let _entryListEl = null;

  function render(state, { onBack, onNext }) {
    const container = document.getElementById("view-container");
    container.innerHTML = "";

    const view = document.createElement("div");
    view.className = "view";
    view.setAttribute("role", "region");
    view.setAttribute("aria-label", "Clinical Services");

    const heading = document.createElement("h1");
    heading.className = "view-heading";
    heading.textContent = "Clinical Services";
    view.appendChild(heading);

    const intro = document.createElement("p");
    intro.className = "view-intro";
    intro.textContent =
      "Tell us about the clinical services your clinic provided. Select each service and " +
      "enter the number of visits associated with that service.";
    view.appendChild(intro);

    // Map persisted state to EntryList entries format
    const savedEntries = (state.services || []).map(s => ({
      id:          s.id || _uid(),
      selectValue: s.serviceId || "",
      countValue:  s.count !== undefined ? String(s.count) : "",
    }));

    _entryListEl = EntryList.create({
      options:          CLINICAL_SERVICES.filter(s => s.active),
      selectLabel:      "Clinical service",
      countLabel:       "Number of visits",
      countPlaceholder: "e.g. 500",
      countMin:         0,
      countStep:        1,
      addLabel:         "Add another service",
      allowDuplicates:  false,
      entries:          savedEntries,
      onEntriesChange:  (entries) => _syncToState(state, entries),
    });
    view.appendChild(_entryListEl);

    const noServicesToggle = document.createElement("label");
    noServicesToggle.className = "inline-toggle";

    const noServicesCheckbox = document.createElement("input");
    noServicesCheckbox.type = "checkbox";
    noServicesCheckbox.checked = Boolean(state.noServicesProvided);
    noServicesCheckbox.addEventListener("change", (event) => {
      state.noServicesProvided = event.target.checked;
      if (state.noServicesProvided) {
        state.services = [];
      }
    });

    const noServicesText = document.createElement("span");
    noServicesText.textContent = "No services provided";
    noServicesToggle.append(noServicesCheckbox, noServicesText);
    view.appendChild(noServicesToggle);

    // Navigation
    const nav = NavigationButtons.create({
      backLabel: "Back",
      nextLabel: "See Impact",
      onBack,
      onNext: () => _handleNext(state, onNext),
    });
    view.appendChild(nav);

    container.appendChild(view);
  }

  function _handleNext(state, onNext) {
    if (state.noServicesProvided) {
      onNext();
      return;
    }

    const errors = _entryListEl.validate();
    if (errors.length > 0) {
      const firstBad = _entryListEl.querySelector(".is-error");
      if (firstBad) firstBad.focus();
      return;
    }
    onNext();
  }

  function _syncToState(state, entries) {
    state.services = entries.map(e => ({
      id:        e.id,
      serviceId: e.selectValue,
      count:     parseInt(e.countValue, 10) || 0,
    }));
  }

  function _uid() {
    return Math.random().toString(36).slice(2, 9);
  }

  return { render };
})();

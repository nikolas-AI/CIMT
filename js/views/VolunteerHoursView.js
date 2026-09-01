/**
 * VolunteerHoursView.js — View 2
 *
 * Dynamic list of volunteer role + hours entries.
 * Uses EntryList component; reads/writes app state.
 */

"use strict";

const VolunteerHoursView = (() => {

  let _entryListEl = null;

  function render(state, { onBack, onNext }) {
    const container = document.getElementById("view-container");
    container.innerHTML = "";

    const view = document.createElement("div");
    view.className = "view";
    view.setAttribute("role", "region");
    view.setAttribute("aria-label", "Volunteer Hours");

    const heading = document.createElement("h1");
    heading.className = "view-heading";
    heading.textContent = "Volunteer Hours";
    view.appendChild(heading);

    const intro = document.createElement("p");
    intro.className = "view-intro";
    intro.textContent =
      "Many clinics rely on donated time from healthcare professionals, students, and " +
      "community volunteers. Enter the estimated number of volunteer hours contributed " +
      "by each role over your reporting period.";
    view.appendChild(intro);

    // Map persisted state to EntryList entries format
    const savedEntries = (state.volunteers || []).map(v => ({
      id:           v.id || _uid(),
      selectValue:  v.roleId  || "",
      countValue:   v.hours !== undefined ? String(v.hours) : "",
    }));

    _entryListEl = EntryList.create({
      options:          VOLUNTEER_ROLES.filter(r => r.active),
      selectLabel:      "Volunteer role",
      countLabel:       "Volunteer hours",
      countPlaceholder: "e.g. 125",
      countMin:         0,
      countStep:        0.5,
      addLabel:         "Add another role",
      allowDuplicates:  false,
      entries:          savedEntries,
      onEntriesChange:  (entries) => _syncToState(state, entries),
    });
    view.appendChild(_entryListEl);

    // Navigation
    const nav = NavigationButtons.create({
      backLabel: "Back",
      nextLabel: "Next",
      onBack,
      onNext: () => _handleNext(state, onNext),
    });
    view.appendChild(nav);

    container.appendChild(view);
  }

  function _handleNext(state, onNext) {
    const errors = _entryListEl.validate();
    if (errors.length > 0) {
      // Focus first invalid field
      const firstBad = _entryListEl.querySelector(".is-error");
      if (firstBad) firstBad.focus();
      return;
    }
    // State already synced via onEntriesChange; proceed
    onNext();
  }

  function _syncToState(state, entries) {
    state.volunteers = entries.map(e => ({
      id:     e.id,
      roleId: e.selectValue,
      hours:  parseFloat(e.countValue) || 0,
    }));
  }

  function _uid() {
    return Math.random().toString(36).slice(2, 9);
  }

  return { render };
})();

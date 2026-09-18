/**
 * VolunteerHoursView.js — View 3
 *
 * Dynamic list of volunteer role + hours entries.
 * Uses EntryList component; reads/writes app state.
 */

"use strict";

const VolunteerHoursView = (() => {

  let _entryListEl = null;

  function render(state, { onBack, onNext }) {
    // This screen converts saved volunteer objects into the generic row format
    // expected by EntryList. EntryList handles controls; this view handles meaning.
    // Convert persisted volunteer state into the generic EntryList shape. The
    // list component handles DOM interactions; this view handles state mapping.
    const container = document.getElementById("view-container");
    container.innerHTML = "";

    const view = document.createElement("div");
    view.className = "view";
    view.setAttribute("role", "region");
    view.setAttribute("aria-label", AppCopy.volunteer.ariaLabel);

    const heading = document.createElement("h1");
    heading.className = "view-heading";
    heading.textContent = AppCopy.volunteer.heading;
    view.appendChild(heading);

    const intro = document.createElement("p");
    intro.className = "view-intro";
    intro.textContent = `${AppCopy.volunteer.intro} ${AppCopy.volunteer.note}`;
    view.appendChild(intro);

    // Map persisted state to EntryList entries format
    const savedEntries = (state.volunteers || []).map(v => ({
      id:           v.id || _uid(),
      selectValue:  v.roleId  || "",
      countValue:   v.hours !== undefined ? String(v.hours) : "",
    }));

    _entryListEl = EntryList.create({
      options:          VOLUNTEER_ROLES.filter(r => r.active),
      selectLabel:      AppCopy.volunteer.roleLabel,
      countLabel:       AppCopy.volunteer.hoursLabel,
      countPlaceholder: "e.g. 125",
      countMin:         0,
      countStep:        0.5,
      addLabel:         AppCopy.volunteer.addLabel,
      allowDuplicates:  false,
      entries:          savedEntries,
      onEntriesChange:  (entries) => _syncToState(state, entries),
    });
    view.appendChild(_entryListEl);

    const noHoursToggle = document.createElement("label");
    noHoursToggle.className = "inline-toggle";

    const noHoursCheckbox = document.createElement("input");
    noHoursCheckbox.type = "checkbox";
    noHoursCheckbox.checked = Boolean(state.noVolunteerHours);
    noHoursCheckbox.addEventListener("change", (event) => {
      state.noVolunteerHours = event.target.checked;
      if (state.noVolunteerHours) {
        state.volunteers = [];
      }
    });

    const noHoursText = document.createElement("span");
    noHoursText.textContent = AppCopy.volunteer.emptyState;
    noHoursToggle.append(noHoursCheckbox, noHoursText);
    view.appendChild(noHoursToggle);

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
    // A user may choose "no volunteer hours" instead of filling in a row.
    // Otherwise every visible row must pass EntryList validation first.
    // The checkbox is an explicit valid choice, so it bypasses row validation.
    if (state.noVolunteerHours) {
      onNext();
      return;
    }

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
    // Form controls produce strings, but the rest of the app expects hours to be
    // numbers. This is the boundary where the conversion happens.
    // EntryList stores values as strings because they come from form controls.
    // Convert hours back to numbers before putting them in application state.
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

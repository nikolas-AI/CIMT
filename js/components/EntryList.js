/**
 * EntryList.js — Reusable dynamic entry list (add/remove rows)
 *
 * Used by both VolunteerHoursView and ClinicalServicesView.
 * Accepts a config object describing what options to show and how
 * to label things. All state lives in the parent view; this
 * component fires callbacks on changes.
 *
 * Config shape:
 * {
 *   options:         Array<{ id, displayName }>  — dropdown options
 *   selectLabel:     string                      — e.g. "Volunteer role"
 *   countLabel:      string                      — e.g. "Volunteer hours"
 *   countPlaceholder:string
 *   countMin:        number
 *   countStep:       number
 *   addLabel:        string                      — e.g. "+ Add another role"
 *   allowDuplicates: boolean                     — default false
 *   entries:         Array<{ id, selectValue, countValue }>
 *   onEntriesChange: Function(entries)           — called on any change
 * }
 */

"use strict";

const EntryList = (() => {

  /**
   * Build a reusable list of selectable entries and numeric values.
   *
   * The component copies the supplied entries so it can react immediately to
   * typing and selection changes. The parent remains responsible for converting
   * those values into the application's domain state through onEntriesChange.
   *
   * @param {object} config Labels, options, initial entries, and callbacks.
   * @returns {HTMLElement} Wrapper exposing validate() and getEntries().
   */
  function create(config) {
    let entries = (config.entries && config.entries.length > 0)
      ? config.entries.map(e => ({ ...e }))
      : [_newEntry()];

    // The component owns temporary row data while it is on screen. The parent
    // view receives a copy through onEntriesChange and stores the durable state.

    const wrapper = document.createElement("div");
    wrapper.className = "entry-list-wrapper";

    const list = document.createElement("div");
    list.className = "entry-list";
    wrapper.appendChild(list);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--add";
    addBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      ${config.addLabel}
    `;
    addBtn.addEventListener("click", () => {
      entries.push(_newEntry());
      _render();
      _notify();
    });
    wrapper.appendChild(addBtn);

    // Public: validate every row and return the indexes of invalid rows. The
    // screen uses this result to decide whether it may move forward.
    wrapper.validate = () => {
      const errors = [];
      const rows = list.querySelectorAll(".entry-row");
      rows.forEach((row, i) => {
        const entry = entries[i];
        const sel = row.querySelector("select");
        const inp = row.querySelector("input");
        const selErr = row.querySelector(".entry-select-error");
        const inpErr = row.querySelector(".entry-count-error");

        let rowValid = true;

        // Save messages on the row data because a selection change rebuilds all
        // rows to refresh which options are disabled. This keeps other errors visible.
        if (!sel.value) {
          entry.selectError = `Please select a ${config.selectLabel.toLowerCase()}.`;
          DOM.showError(sel, selErr, entry.selectError);
          rowValid = false;
        } else {
          delete entry.selectError;
          DOM.clearError(sel, selErr);
        }

        const numVal = parseFloat(inp.value);
        if (inp.value === "" || isNaN(numVal)) {
          entry.countError = "Please enter a number.";
          DOM.showError(inp, inpErr, entry.countError);
          rowValid = false;
        } else if (numVal < 0) {
          entry.countError = "Value cannot be negative.";
          DOM.showError(inp, inpErr, entry.countError);
          rowValid = false;
        } else {
          delete entry.countError;
          DOM.clearError(inp, inpErr);
        }

        if (!rowValid) errors.push(i);
      });
      return errors;
    };

    // Public: return the current row values. They stay as strings here because
    // they come directly from HTML select and input controls.
    wrapper.getEntries = () => {
      return entries.map(e => ({ ...e }));
    };

    function _render() {
      // Rebuilding is intentional after selection changes: duplicate options
      // must be recalculated for every row.
      list.innerHTML = "";
      entries.forEach((entry, index) => {
        const row = _buildRow(entry, index);
        list.appendChild(row);
      });
    }

    /** Build one row, including its controls, validation messages, and remove button. */
    function _buildRow(entry, index) {
      const row = document.createElement("div");
      row.className = "entry-row";
      row.dataset.index = index;

      // --- Select: choose a role or service. ---
      const selectId = `entry-select-${index}-${Date.now()}`;
      const selField = document.createElement("div");
      selField.className = "field";

      const selLabel = document.createElement("label");
      selLabel.className = "field__label";
      selLabel.setAttribute("for", selectId);
      selLabel.textContent = config.selectLabel;

      const select = document.createElement("select");
      select.id = selectId;
      select.className = "field__select";
      select.setAttribute("aria-describedby", `${selectId}-error`);

      // Blank placeholder option
      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = `Select a ${config.selectLabel.toLowerCase()}…`;
      select.appendChild(blank);

      // Prevent the same role or service from being selected twice when the
      // parent has configured allowDuplicates as false.
      const usedIds = config.allowDuplicates
        ? []
        : entries.filter((_, i) => i !== index).map(e => e.selectValue);

      config.options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.id;
        const codeLabel = opt.codeSystem && opt.code ? ` (${opt.codeSystem} ${opt.code})` : "";
        option.textContent = `${opt.displayName}${codeLabel}`;
        if (usedIds.includes(opt.id)) option.disabled = true;
        if (opt.id === entry.selectValue) option.selected = true;
        select.appendChild(option);
      });

      select.addEventListener("change", () => {
        entries[index].selectValue = select.value;
        if (select.value) {
          delete entries[index].selectError;
          DOM.clearError(select, selError);
        }
        // Re-render all rows to update disabled states in other dropdowns.
        _render();
        _notify();
      });

      const selError = document.createElement("span");
      selError.id = `${selectId}-error`;
      selError.className = "field__error entry-select-error";
      selError.setAttribute("role", "alert");
      if (entry.selectError) DOM.showError(select, selError, entry.selectError);

      selField.append(selLabel, select, selError);

      // --- Count input: hours for volunteers or visits for services. ---
      const countId = `entry-count-${index}-${Date.now()}`;
      const countField = document.createElement("div");
      countField.className = "field";

      const countLabel = document.createElement("label");
      countLabel.className = "field__label";
      countLabel.setAttribute("for", countId);
      countLabel.textContent = config.countLabel;

      const countInput = document.createElement("input");
      countInput.id = countId;
      countInput.className = "field__input";
      countInput.type = "number";
      countInput.min = String(config.countMin !== undefined ? config.countMin : 0);
      countInput.step = String(config.countStep !== undefined ? config.countStep : 1);
      countInput.placeholder = config.countPlaceholder || "0";
      countInput.setAttribute("inputmode", "decimal");
      countInput.setAttribute("aria-describedby", `${countId}-error`);
      if (entry.countValue !== "") countInput.value = entry.countValue;

      countInput.addEventListener("input", () => {
        entries[index].countValue = countInput.value;
        const count = parseFloat(countInput.value);
        if (countInput.value !== "" && !isNaN(count) && count >= 0) {
          delete entries[index].countError;
          DOM.clearError(countInput, countError);
        }
        // Count edits do not need a rebuild, so other rows keep their DOM errors.
        _notify();
      });

      const countError = document.createElement("span");
      countError.id = `${countId}-error`;
      countError.className = "field__error entry-count-error";
      countError.setAttribute("role", "alert");
      if (entry.countError) DOM.showError(countInput, countError, entry.countError);

      countField.append(countLabel, countInput, countError);

      // --- Remove button: keep at least one blank row available. ---
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "entry-row__remove";
      removeBtn.setAttribute("aria-label", `Remove row ${index + 1}`);
      removeBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      `;
      if (entries.length <= 1) {
        removeBtn.style.visibility = "hidden";
        removeBtn.setAttribute("aria-hidden", "true");
      }
      removeBtn.addEventListener("click", () => {
        entries.splice(index, 1);
        _render();
        _notify();
      });

      row.append(selField, countField, removeBtn);
      return row;
    }

    /** Notify the parent with a copy so the parent cannot mutate this component's rows. */
    // Tell the parent view that a row changed. The parent converts these simple
    // form values into its own state shape.
    function _notify() {
      if (typeof config.onEntriesChange === "function") {
        config.onEntriesChange(entries.map(e => ({ ...e })));
      }
    }

    /** Create the blank row shown when the user adds another entry. */
    // New rows start empty and receive an id so they can be tracked reliably.
    function _newEntry() {
      return { id: _uid(), selectValue: "", countValue: "" };
    }

    /** Generate a short client-side id used to track a row across updates. */
    // This id is only for tracking rows in the browser; it is not a database id.
    function _uid() {
      return Math.random().toString(36).slice(2, 9);
    }

    _render();
    return wrapper;
  }

  return { create };
})();

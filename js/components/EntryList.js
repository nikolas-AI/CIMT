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

  function create(config) {
    let entries = (config.entries && config.entries.length > 0)
      ? config.entries.map(e => ({ ...e }))
      : [_newEntry()];

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

    // Public: validate all rows; returns array of error messages (empty = valid)
    wrapper.validate = () => {
      const errors = [];
      const rows = list.querySelectorAll(".entry-row");
      rows.forEach((row, i) => {
        const sel = row.querySelector("select");
        const inp = row.querySelector("input");
        const selErr = row.querySelector(".entry-select-error");
        const inpErr = row.querySelector(".entry-count-error");

        let rowValid = true;

        if (!sel.value) {
          DOM.showError(sel, selErr, `Please select a ${config.selectLabel.toLowerCase()}.`);
          rowValid = false;
        } else {
          DOM.clearError(sel, selErr);
        }

        const numVal = parseFloat(inp.value);
        if (inp.value === "" || isNaN(numVal)) {
          DOM.showError(inp, inpErr, `Please enter a number.`);
          rowValid = false;
        } else if (numVal < 0) {
          DOM.showError(inp, inpErr, `Value cannot be negative.`);
          rowValid = false;
        } else {
          DOM.clearError(inp, inpErr);
        }

        if (!rowValid) errors.push(i);
      });
      return errors;
    };

    // Public: read current values from the DOM
    wrapper.getEntries = () => {
      return entries.map(e => ({ ...e }));
    };

    function _render() {
      list.innerHTML = "";
      entries.forEach((entry, index) => {
        const row = _buildRow(entry, index);
        list.appendChild(row);
      });
    }

    function _buildRow(entry, index) {
      const row = document.createElement("div");
      row.className = "entry-row";
      row.dataset.index = index;

      // --- Select ---
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

      // Determine which ids are already used (for duplicate prevention)
      const usedIds = config.allowDuplicates
        ? []
        : entries.filter((_, i) => i !== index).map(e => e.selectValue);

      config.options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.id;
        option.textContent = opt.displayName;
        if (usedIds.includes(opt.id)) option.disabled = true;
        if (opt.id === entry.selectValue) option.selected = true;
        select.appendChild(option);
      });

      select.addEventListener("change", () => {
        entries[index].selectValue = select.value;
        // Re-render all rows to update disabled states in other dropdowns
        _render();
        _notify();
      });

      const selError = document.createElement("span");
      selError.id = `${selectId}-error`;
      selError.className = "field__error entry-select-error";
      selError.setAttribute("role", "alert");

      selField.append(selLabel, select, selError);

      // --- Count input ---
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
        _notify();
      });

      const countError = document.createElement("span");
      countError.id = `${countId}-error`;
      countError.className = "field__error entry-count-error";
      countError.setAttribute("role", "alert");

      countField.append(countLabel, countInput, countError);

      // --- Remove button (only when > 1 row) ---
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

    function _notify() {
      if (typeof config.onEntriesChange === "function") {
        config.onEntriesChange(entries.map(e => ({ ...e })));
      }
    }

    function _newEntry() {
      return { id: _uid(), selectValue: "", countValue: "" };
    }

    function _uid() {
      return Math.random().toString(36).slice(2, 9);
    }

    _render();
    return wrapper;
  }

  return { create };
})();

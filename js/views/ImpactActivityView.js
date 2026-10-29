"use strict";

const ImpactActivityView = (() => {
  let _serviceList = null;
  let _uploadVersion = 0;

  function render(state, { onBack, onNext }) {
    const container = document.getElementById("view-container");
    container.innerHTML = "";
    _serviceList = null;
    const isVolunteerMethod = state.impactMethod === "volunteerHours";

    const view = document.createElement("div");
    view.className = "view";
    view.setAttribute("role", "region");
    view.setAttribute("aria-label", AppCopy.impactActivity.ariaLabel);
    view.innerHTML = `
      <h1 class="view-heading">${isVolunteerMethod ? AppCopy.impactActivity.volunteerHeading : AppCopy.impactActivity.servicesHeading}</h1>
      <p class="view-intro">${isVolunteerMethod ? AppCopy.impactActivity.volunteerIntro : AppCopy.impactActivity.servicesIntro}</p>
      <fieldset class="activity-entry-mode" aria-label="Activity entry method">
        <legend class="field__label">How would you like to enter activity?</legend>
        <label class="activity-entry-mode__option">
          <input type="radio" name="activity-entry-mode" value="manual" ${state.activityEntryMode !== "batch" ? "checked" : ""}>
          <span class="activity-entry-mode__copy">
            <strong>Enter totals manually</strong>
            <span>${isVolunteerMethod
              ? "Choose volunteer roles and enter their total hours."
              : "Choose clinical services and enter their total counts."}</span>
          </span>
        </label>
        <label class="activity-entry-mode__option">
          <input type="radio" name="activity-entry-mode" value="batch" ${state.activityEntryMode === "batch" ? "checked" : ""}>
          <span class="activity-entry-mode__copy">
            <strong>Upload a CSV or TXT file</strong>
            <span>Import and review multiple activity totals at once.</span>
          </span>
        </label>
      </fieldset>
      <div id="impact-activity-fields"></div>
    `;

    const fields = view.querySelector("#impact-activity-fields");
    const batchMode = state.activityEntryMode === "batch";
    if (batchMode) {
      fields.appendChild(_createImportView(state));
    } else if (isVolunteerMethod) {
      fields.appendChild(_createVolunteerList(state, VOLUNTEER_ROLES.filter(role => role.active)));
    } else {
      _serviceList = _createServiceList(state);
      fields.appendChild(_serviceList);
    }

    view.querySelectorAll("input[name=activity-entry-mode]").forEach(input => {
      input.addEventListener("change", () => {
        if (!input.checked || (state.activityEntryMode === "batch") === (input.value === "batch")) return;
        state.activityEntryMode = input.value;
        state.batchImportReview = null;
        state.batchImportConfirmed = false;
        state.impact = null;
        _uploadVersion += 1;
        render(state, { onBack, onNext });
      });
    });

    const navigation = NavigationButtons.create({
      backLabel: "Back",
      onBack,
      nextLabel: AppCopy.impactActivity.next,
      onNext: () => _handleNext(state, onNext),
    });
    if (batchMode) {
      const next = navigation.querySelector("button.btn--primary");
      next.disabled = !(state.batchImportReview && state.batchImportReview.valid && state.batchImportConfirmed);
    }
    view.appendChild(navigation);
    container.appendChild(view);
  }

  function _createImportView(state) {
    const panel = document.createElement("section");
    panel.className = "batch-import-panel";
    panel.setAttribute("aria-labelledby", "batch-import-heading");
    const panelHeader = document.createElement("div");
    panelHeader.className = "batch-import-panel__header";
    const eyebrow = document.createElement("p");
    eyebrow.className = "batch-import-panel__eyebrow";
    eyebrow.textContent = `BULK IMPORT · ${state.impactMethod === "volunteerHours" ? "VOLUNTEER HOURS" : "CLINICAL SERVICES"}`;
    const heading = document.createElement("h2");
    heading.id = "batch-import-heading";
    heading.textContent = "Import activity totals";
    const intro = document.createElement("p");
    intro.className = "batch-import-panel__intro";
    intro.textContent = "Use a prepared file to add multiple activity totals at once. Your clinic details and reporting period are already included.";
    panelHeader.append(eyebrow, heading, intro);
    panel.append(panelHeader);

    const method = state.impactMethod;
    const isVolunteerMethod = method === "volunteerHours";
    const templateLink = _createDownloadLink(
      "Download CSV template",
      BatchImportService.createTemplate(method),
      `care-in-action-${method}-template.csv`
    );
    const referenceLink = _createDownloadLink(
      "Download catalog ID reference",
      BatchImportService.createReferenceCSV(method),
      `care-in-action-${method}-reference.csv`
    );
    const downloads = document.createElement("div");
    downloads.className = "batch-import-downloads";
    downloads.append(templateLink, referenceLink);
    const downloadHeading = document.createElement("h3");
    downloadHeading.className = "batch-import-subheading";
    downloadHeading.textContent = "Start with the right file";
    panel.append(downloadHeading);
    panel.append(downloads);

    const limits = BatchImportService.getLimits();
    const formatDetails = document.createElement("div");
    formatDetails.className = "batch-import-format";
    const formatHeading = document.createElement("strong");
    formatHeading.textContent = "File requirements";
    const formatCopy = document.createElement("p");
    formatCopy.textContent = `Use the ${isVolunteerMethod ? "role_id, hours" : "service_id, count"} headers. CSV headers are case-insensitive; TXT files use tab separators.`;
    const requirements = document.createElement("ul");
    [
      `CSV or tab-separated TXT · up to ${limits.maxFileBytes / (1024 * 1024)} MB`,
      `${limits.maxDataRows.toLocaleString("en-US")} nonblank rows maximum`,
      "Repeated IDs are combined by adding their quantities",
    ].forEach(text => {
      const item = document.createElement("li");
      item.textContent = text;
      requirements.append(item);
    });
    formatDetails.append(formatHeading, formatCopy, requirements);
    panel.append(formatDetails);

    const uploadHeading = document.createElement("h3");
    uploadHeading.className = "batch-import-subheading";
    uploadHeading.textContent = "Upload your activity file";
    panel.append(uploadHeading);
    const label = document.createElement("label");
    label.className = "batch-import-upload";
    label.htmlFor = "batch-activity-file";
    const uploadIcon = document.createElement("span");
    uploadIcon.className = "batch-import-upload__icon";
    uploadIcon.setAttribute("aria-hidden", "true");
    uploadIcon.textContent = "↑";
    const uploadCopy = document.createElement("span");
    uploadCopy.className = "batch-import-upload__copy";
    const uploadTitle = document.createElement("strong");
    uploadTitle.textContent = "Choose a file to upload";
    const uploadDescription = document.createElement("span");
    uploadDescription.textContent = "CSV or tab-separated TXT";
    uploadCopy.append(uploadTitle, uploadDescription);
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "batch-activity-file";
    fileInput.className = "batch-import-file";
    fileInput.accept = ".csv,.txt,text/csv,text/plain";
    fileInput.setAttribute("aria-describedby", "batch-activity-file-help");
    fileInput.addEventListener("change", () => _handleImportFile(fileInput, state));
    label.append(uploadIcon, uploadCopy, fileInput);
    const fileHelp = document.createElement("span");
    fileHelp.id = "batch-activity-file-help";
    fileHelp.className = "batch-import-replace-note";
    fileHelp.textContent = "Choosing another file replaces this import; files are never appended.";
    panel.append(label, fileHelp);

    const preview = document.createElement("div");
    preview.id = "batch-activity-preview";
    preview.className = "batch-import-preview";
    preview.setAttribute("aria-live", "polite");
    preview.setAttribute("aria-atomic", "false");
    panel.append(preview);
    _renderImportPreview(preview, state);
    return panel;
  }

  async function _handleImportFile(input, state) {
    const file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    const uploadTitle = document.querySelector(".batch-import-upload__copy strong");
    if (uploadTitle) uploadTitle.textContent = file.name;

    const version = ++_uploadVersion;
    const method = state.impactMethod;
    state.batchImportReview = null;
    state.batchImportConfirmed = false;
    state.impact = null;
    const preview = document.getElementById("batch-activity-preview");
    if (!preview) return;
    preview.replaceChildren();
    const loading = document.createElement("p");
    loading.className = "field__help";
    loading.textContent = `Reading ${file.name}…`;
    preview.append(loading);
    _disableBatchNext(state);

    const limits = BatchImportService.getLimits();
    if (file.size > limits.maxFileBytes) {
      state.batchImportReview = {
        fileName: file.name,
        sourceRowCount: 0,
        entries: [],
        errors: [`This file is ${(file.size / (1024 * 1024)).toFixed(2)} MB. The maximum is ${limits.maxFileBytes / (1024 * 1024)} MB.`],
        totalQuantity: 0,
        duplicateRowsCombined: 0,
        valid: false,
      };
      _renderImportPreview(preview, state);
      _disableBatchNext(state);
      return;
    }

    try {
      const contents = await file.text();
      if (version !== _uploadVersion || method !== state.impactMethod ||
          state.activityEntryMode !== "batch") return;
      state.batchImportReview = BatchImportService.parse(contents, file.name, method);
    } catch (error) {
      if (version !== _uploadVersion || method !== state.impactMethod ||
          state.activityEntryMode !== "batch") return;
      state.batchImportReview = {
        fileName: file.name,
        sourceRowCount: 0,
        entries: [],
        errors: [`The browser could not read this file: ${error.message || "unknown file error"}`],
        totalQuantity: 0,
        duplicateRowsCombined: 0,
        valid: false,
      };
    }
    _renderImportPreview(preview, state);
    _disableBatchNext(state);
  }

  function _renderImportPreview(container, state) {
    container.replaceChildren();
    const result = state.batchImportReview;
    if (!result) return;
    const heading = document.createElement("h3");
    heading.textContent = "Import preview";
    const unit = state.impactMethod === "volunteerHours" ? "hours" : "services";
    const total = Number.isFinite(result.totalQuantity)
      ? `${Formatting.number(result.totalQuantity, 1)} ${unit}`
      : "unavailable";
    const metadata = document.createElement("p");
    metadata.className = "batch-import-preview__meta";
    metadata.textContent = `${result.fileName} · ${result.sourceRowCount.toLocaleString("en-US")} source rows · ${result.entries.length.toLocaleString("en-US")} catalog entries · ${result.duplicateRowsCombined.toLocaleString("en-US")} duplicate rows combined · Total: ${total}`;
    container.append(heading, metadata);

    if (result.errors.length) {
      const errors = document.createElement("div");
      errors.className = "batch-import-preview__errors";
      errors.setAttribute("role", "alert");
      const errorHeading = document.createElement("strong");
      errorHeading.textContent = `${result.errors.length} issue${result.errors.length === 1 ? "" : "s"} to fix:`;
      const list = document.createElement("ul");
      result.errors.forEach(message => {
        const item = document.createElement("li");
        item.textContent = message;
        list.append(item);
      });
      errors.append(errorHeading, list);
      container.append(errors);
    }

    if (result.entries.length) {
      const tableWrap = document.createElement("div");
      tableWrap.className = "batch-import-preview__table-wrap";
      const table = document.createElement("table");
      const head = document.createElement("thead");
      const headerRow = document.createElement("tr");
      ["Catalog item", "ID", state.impactMethod === "volunteerHours" ? "Hours" : "Count"].forEach(value => {
        const cell = document.createElement("th");
        cell.scope = "col";
        cell.textContent = value;
        headerRow.append(cell);
      });
      head.append(headerRow);
      const body = document.createElement("tbody");
      result.entries.forEach(entry => {
        const row = document.createElement("tr");
        [entry.name, entry.id, Formatting.number(entry.quantity, 1)].forEach(value => {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.append(cell);
        });
        body.append(row);
      });
      table.append(head, body);
      tableWrap.append(table);
      container.append(tableWrap);
    }

    if (result.valid) {
      const confirmation = document.createElement("label");
      confirmation.className = "batch-import-confirm";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(state.batchImportConfirmed);
      checkbox.addEventListener("change", () => {
        state.batchImportConfirmed = checkbox.checked;
        state.impact = null;
        _disableBatchNext(state);
      });
      const text = document.createElement("span");
      text.textContent = "I reviewed the preview and confirm these totals are correct.";
      confirmation.append(checkbox, text);
      container.append(confirmation);
    } else {
      state.batchImportConfirmed = false;
    }
  }

  function _createDownloadLink(label, contents, filename) {
    const link = document.createElement("a");
    link.className = "batch-import-download";
    link.href = "#";
    const badge = document.createElement("span");
    badge.className = "batch-import-download__badge";
    badge.textContent = label.includes("template") ? "CSV" : "ID";
    const copy = document.createElement("span");
    copy.className = "batch-import-download__copy";
    const title = document.createElement("strong");
    title.textContent = label;
    const subtitle = document.createElement("span");
    subtitle.textContent = label.includes("template")
      ? "Pre-filled with current catalog IDs"
      : "Find IDs and matching catalog names";
    copy.append(title, subtitle);
    const arrow = document.createElement("span");
    arrow.className = "batch-import-download__arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↓";
    link.append(badge, copy, arrow);
    link.addEventListener("click", event => {
      event.preventDefault();
      const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const download = document.createElement("a");
      download.href = url;
      download.download = filename;
      document.body.append(download);
      download.click();
      download.remove();
      URL.revokeObjectURL(url);
    });
    return link;
  }

  function _disableBatchNext(state) {
    const next = document.querySelector("#view-container .nav-buttons .btn--primary");
    if (next) {
      next.disabled = !(state.batchImportReview &&
        state.batchImportReview.valid && state.batchImportConfirmed);
    }
  }

  function _createVolunteerList(state, options) {
    return EntryList.create({
      options,
      selectLabel: AppCopy.volunteer.roleLabel,
      countLabel: AppCopy.volunteer.hoursLabel,
      countPlaceholder: "e.g. 125",
      countMin: 0,
      countStep: 0.5,
      addLabel: AppCopy.volunteer.addLabel,
      allowDuplicates: false,
      searchable: true,
      entries: (state.volunteers || []).map(entry => ({
        id: entry.id || _uid(),
        selectValue: entry.roleId || "",
        countValue: entry.hours === undefined ? "" : String(entry.hours),
      })).filter(entry => options.some(option => option.id === entry.selectValue)),
      onEntriesChange: entries => {
        state.volunteers = entries.map(entry => ({
          id: entry.id,
          roleId: entry.selectValue,
          hours: parseFloat(entry.countValue) || 0,
        }));
      },
    });
  }

  function _createServiceList(state) {
    return EntryList.create({
      options: CLINICAL_SERVICES.filter(service => service.active),
      selectLabel: AppCopy.services.label,
      countLabel: AppCopy.services.countLabel,
      countPlaceholder: "e.g. 500",
      countMin: 0,
      countStep: 1,
      addLabel: AppCopy.services.addLabel,
      allowDuplicates: false,
      searchable: true,
      entries: (state.services || []).map(entry => ({
        id: entry.id || _uid(),
        selectValue: entry.serviceId || "",
        countValue: entry.count === undefined ? "" : String(entry.count),
      })),
      onEntriesChange: entries => {
        state.services = entries.map(entry => ({
          id: entry.id,
          serviceId: entry.selectValue,
          count: Number(entry.countValue) || 0,
        }));
      },
    });
  }

  function _handleNext(state, onNext) {
    if (state.activityEntryMode === "batch") {
      if (!state.batchImportReview || !state.batchImportReview.valid) {
        ProgressIndicator.showWarning("Upload a valid activity file before continuing.");
        return;
      }
      if (!state.batchImportConfirmed) {
        ProgressIndicator.showWarning("Review the import preview and confirm the totals before continuing.");
        return;
      }
      onNext();
      return;
    }

    const serviceErrors = _serviceList ? _serviceList.validate() : [];
    if (state.impactMethod === "volunteerHours") {
      const volunteerList = document.querySelector(".entry-list-wrapper");
      const volunteerErrors = volunteerList ? volunteerList.validate() : [];
      if (volunteerErrors.length > 0) {
        const firstBad = document.querySelector(".is-error");
        if (firstBad) firstBad.focus();
        return;
      }
    }
    if (serviceErrors.length > 0) {
      const firstBad = document.querySelector(".is-error");
      if (firstBad) firstBad.focus();
      return;
    }
    const hasServices = (state.services || []).some(entry => Number(entry.count) > 0);
    const hasVolunteerHours = (state.volunteers || []).some(entry => Number(entry.hours) > 0);
    if (state.impactMethod === "volunteerHours" ? !hasVolunteerHours : !hasServices) {
      ProgressIndicator.showWarning(AppCopy.validation.impactActivityRequired);
      return;
    }
    onNext();
  }

  function _uid() {
    return Math.random().toString(36).slice(2, 9);
  }

  return { render };
})();

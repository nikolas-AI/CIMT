"use strict";

const ImpactActivityView = (() => {
  let _volunteerList = null;
  let _serviceList = null;

  function render(state, { onBack, onNext }) {
    const container = document.getElementById("view-container");
    container.innerHTML = "";
    const isVolunteerMethod = state.impactMethod === "volunteerHours";

    const view = document.createElement("div");
    view.className = "view";
    view.setAttribute("role", "region");
    view.setAttribute("aria-label", AppCopy.impactActivity.ariaLabel);
    view.innerHTML = `
      <h1 class="view-heading">${isVolunteerMethod ? AppCopy.impactActivity.volunteerHeading : AppCopy.impactActivity.servicesHeading}</h1>
      <p class="view-intro">${isVolunteerMethod ? AppCopy.impactActivity.volunteerIntro : AppCopy.impactActivity.servicesIntro}</p>
      <div id="impact-activity-fields"></div>
    `;

    const fields = view.querySelector("#impact-activity-fields");
    if (isVolunteerMethod) {
      _volunteerList = _createVolunteerList(state, VOLUNTEER_ROLES.filter(role => role.active));
      fields.appendChild(_volunteerList);
    } else {
      _serviceList = _createServiceList(state);
      fields.appendChild(_serviceList);
      const supportHeading = document.createElement("h2");
      supportHeading.className = "activity-subheading";
      supportHeading.textContent = AppCopy.impactActivity.supportHeading;
      fields.appendChild(supportHeading);
      const supportIntro = document.createElement("p");
      supportIntro.className = "field__help";
      supportIntro.textContent = AppCopy.impactActivity.supportIntro;
      fields.appendChild(supportIntro);
      _volunteerList = _createVolunteerList(state, VOLUNTEER_ROLES.filter(role => role.active && role.category === "nonMedical"));
      fields.appendChild(_volunteerList);
    }

    view.appendChild(NavigationButtons.create({
      backLabel: "Back",
      onBack,
      nextLabel: AppCopy.impactActivity.next,
      onNext: () => _handleNext(state, onNext),
    }));
    container.appendChild(view);
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
      allowEmpty: options.every(role => role.category === "nonMedical") && state.impactMethod === "clinicalServices",
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
      allowEmpty: state.impactMethod === "clinicalServices",
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
    const volunteerErrors = _volunteerList ? _volunteerList.validate() : [];
    const serviceErrors = _serviceList ? _serviceList.validate() : [];
    if (volunteerErrors.length > 0 || serviceErrors.length > 0) {
      const firstBad = document.querySelector(".is-error");
      if (firstBad) firstBad.focus();
      return;
    }
    const hasVolunteerHours = (state.volunteers || []).some(entry => Number(entry.hours) > 0);
    const hasServices = (state.services || []).some(entry => Number(entry.count) > 0);
    if (state.impactMethod === "volunteerHours" ? !hasVolunteerHours : !hasServices && !hasVolunteerHours) {
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

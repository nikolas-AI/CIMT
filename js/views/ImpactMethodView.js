"use strict";

const ImpactMethodView = (() => {
  function render(state, { onBack, onNext }) {
    const container = document.getElementById("view-container");
    container.innerHTML = "";

    const view = document.createElement("div");
    view.className = "view";
    view.setAttribute("role", "region");
    view.setAttribute("aria-label", AppCopy.impactMethod.ariaLabel);
    view.innerHTML = `
      <h1 class="view-heading">${AppCopy.impactMethod.heading}</h1>
      <p class="view-intro">${AppCopy.impactMethod.intro}</p>
      <fieldset class="impact-method-options" aria-describedby="impact-method-error">
        <legend class="field__label">${AppCopy.impactMethod.legend}</legend>
        <label class="impact-method-option">
          <input type="radio" name="impact-method" value="volunteerHours" ${state.impactMethod === "volunteerHours" ? "checked" : ""}>
          <span>
            <strong>${AppCopy.impactMethod.volunteerTitle}</strong>
            <span>${AppCopy.impactMethod.volunteerDescription}</span>
          </span>
        </label>
        <label class="impact-method-option">
          <input type="radio" name="impact-method" value="clinicalServices" ${state.impactMethod === "clinicalServices" ? "checked" : ""}>
          <span>
            <strong>${AppCopy.impactMethod.servicesTitle}</strong>
            <span>${AppCopy.impactMethod.servicesDescription}</span>
          </span>
        </label>
        <span id="impact-method-error" class="field__error" role="alert"></span>
      </fieldset>
    `;

    const methodInputs = view.querySelectorAll("input[name=impact-method]");
    methodInputs.forEach(input => input.addEventListener("change", () => {
      if (!_selectMethod(state, input.value)) {
        const current = view.querySelector(`input[value="${state.impactMethod || ""}"]`);
        if (current) current.checked = true;
      }
    }));

    view.appendChild(NavigationButtons.create({
      backLabel: "Back",
      onBack,
      nextLabel: AppCopy.impactMethod.next,
      onNext: () => {
        const error = Validation.impactMethod(state.impactMethod);
        if (error) {
          DOM.showError(view.querySelector("fieldset"), view.querySelector("#impact-method-error"), error);
          return;
        }
        onNext();
      },
    }));
    container.appendChild(view);
  }

  function _selectMethod(state, method) {
    if (state.impactMethod === method) return true;
    const hasActivity = (state.volunteers || []).length > 0 || (state.services || []).length > 0;
    if (hasActivity && !window.confirm(AppCopy.impactMethod.switchWarning)) return false;

    if (method === "volunteerHours") {
      state.services = [];
    } else {
      state.volunteers = [];
    }
    state.impactMethod = method;
    state.impact = null;
    return true;
  }

  return { render };
})();

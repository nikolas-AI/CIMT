/**
 * WelcomeView.js — View 1
 *
 * Introduces the estimator, explains the type of information it uses, and
 * starts the clinic reporting workflow.
 */

"use strict";

const WelcomeView = (() => {

  function render({ onNext }) {
    const container = document.getElementById("view-container");
    container.innerHTML = "";

    const view = document.createElement("div");
    view.className = "view welcome-view";
    view.setAttribute("role", "region");
    view.setAttribute("aria-label", "Welcome");

    view.innerHTML = `
      <section class="welcome-hero" aria-labelledby="welcome-heading">
        <h1 class="view-heading" id="welcome-heading">${AppCopy.welcome.heading}</h1>
        <p class="view-intro">${AppCopy.welcome.intro}</p>
        <p class="welcome-hero__note">${AppCopy.welcome.description} ${AppCopy.welcome.note}</p>

        <h2 class="welcome-section-heading">${AppCopy.welcome.whatYouNeedTitle}</h2>
        <ul class="welcome-list">
          ${AppCopy.welcome.list.map(item => `<li>${item}</li>`).join("")}
        </ul>
      </section>

      <div class="view-disclaimer welcome-disclaimer" role="note">
        <strong>Privacy and interpretation:</strong> ${AppCopy.welcome.privacy}
      </div>
    `;

    const nav = NavigationButtons.create({
      nextLabel: AppCopy.welcome.begin,
      onNext,
    });
    view.appendChild(nav);

    container.appendChild(view);
  }

  return { render };
})();

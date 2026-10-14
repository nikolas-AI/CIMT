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
        <p class="welcome-hero__note">${AppCopy.welcome.description}</p>

        <details class="welcome-disclosure">
          <summary class="welcome-section-heading">${AppCopy.welcome.whatYouNeedTitle}</summary>
          <ul class="welcome-list">
            ${AppCopy.welcome.list.map(item => `<li>${item}</li>`).join("")}
          </ul>
        </details>
        <details class="welcome-disclosure welcome-about">
          <summary class="welcome-section-heading">More about this tool</summary>
          <div class="welcome-about__content">
            <section>
              <h2>Why it was created</h2>
              <p>Community clinics provide essential care and often rely on donated time. Care in Action helps make that work easier to describe with a consistent summary based on activity clinics already track.</p>
            </section>
            <section>
              <h2>How it works</h2>
              <p>Choose one method—clinical service counts or volunteer hours—and enter aggregate totals for a reporting period. The tool multiplies those totals by public reference rates to estimate value. Results are estimates, not revenue, reimbursement, profit, confirmed savings, or patient outcomes.</p>
            </section>
            <section>
              <h2>What clinics can do with it</h2>
              <p>Use the report as a starting point for grant applications, donor and board updates, annual reports, or conversations with community partners. Review and adapt the summary to your clinic’s own context.</p>
            </section>
          </div>
        </details>
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

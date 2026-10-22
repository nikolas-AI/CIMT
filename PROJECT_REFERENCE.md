# Care in Action Project Reference

This file is the beginner-friendly guide to the project. It explains what the app does, how the code is organized, and where to look when you want to change behavior.

## 1) What this project is

Care in Action is a browser-based clinic impact estimator. It helps a clinic estimate the value of activity it already tracks, such as:

- donated volunteer hours
- clinical service counts
- clinic reporting period info
- optional clinic cost comparison

It does not collect patient-level data and it does not require a backend database. The app works entirely in the browser as a static website.

The goal is to support planning and communication. The numbers are estimates based on benchmark reference rates, not exact financial results.

---

## 2) What the app does

The tool guides the user through a five-step flow:

1. Welcome
2. Clinic information
3. Method selection
4. Activity entry
5. Impact summary

The user picks one calculation method for the report:

- volunteer hours
- clinical services

The report does not mix both methods in one run. One report is based on one method at a time.

After the user enters totals, the app calculates an estimated value using benchmark rates from the catalog and then shows the summary, references, and export options.

---

## 3) High-level architecture

This is a simple front-end project with no build system, no framework, and no server-side app.

Core structure:

- `index.html` — page shell and script loading order
- `css/styles.css` — styling and layout
- `js/` — all app logic
- `assets/` — logos and branding

The project follows a common static web pattern:

- page loads
- state holds the form answers
- a screen renders based on the current step
- validation checks inputs
- calculator computes totals
- summary screen shows results
- export service creates PDF or Excel output

---

## 4) Main files and what they do

### `index.html`

This is the app entry point.

It does a few important jobs:

- creates the shared header/footer shell
- loads the stylesheet
- loads the JavaScript files in the correct order
- creates the main app area where screens are rendered

The scripts are loaded in a specific order so dependencies exist before use.

### `css/styles.css`

This file stores the visual design for the whole app.

It includes:

- design tokens (colors, spacing, fonts)
- layout and page structure
- form styling
- buttons and cards
- responsive behavior
- print styling for PDF export

### `js/app.js`

This is the main application controller.

It stores the app state in one object named `state` and decides which screen to show next.

Important ideas in this file:

- `state.clinic` stores clinic info
- `state.impactMethod` stores the chosen method
- `state.volunteers` stores volunteer entries
- `state.services` stores service entries
- `state.impact` stores the final calculated summary
- `state.currentStep` tracks the current screen

Functions in this file include:

- `goTo(step)` — move to a step
- `advance()` — go one step forward
- `retreat()` — go one step back
- `startOver()` — clear all state and return to the start
- `_render()` — choose which screen to display
- `_computeAndShowImpact()` — run the calculator and move to the summary

This file is the best place to start if you want to understand screen flow.

### `js/calculator.js`

This is the calculation engine.

It does not create UI elements and does not read from the DOM. It only receives `state` and returns a summary object.

Main function:

- `Calculator.computeImpact(state)`

This function:

- checks the current method
- selects the correct entries for the chosen method
- looks up each item in the catalog
- multiplies quantity by benchmark rate
- sums totals
- returns a summary object for the UI

The calculator uses two main breakdown helpers:

- `_computeVolunteerBreakdown(volunteers)`
- `_computeServiceBreakdown(services)`

### `js/data.js`

This file stores the benchmark data.

It contains:

- `VOLUNTEER_ROLES` — job roles and hourly benchmark rates
- `CLINICAL_SERVICES` — service types and per-service reference rates
- `VOLUNTEER_RATE_SOURCE` — source metadata for volunteer rates
- `REFERENCES` — reference list used in the report

This is the project’s data layer. If a rate changes, this is usually the place to update it.

### `js/content.js`

This file stores all of the copy used by the application.

It includes:

- button labels
- form text
- validation messages
- summary wording
- export labels
- screen-specific copy

This is the place to tweak wording without touching view logic.

### `js/utils.js`

This file contains shared helpers.

There are two groups here:

- `Formatting` — currency and numeric formatting
- `Validation` — name, address, ZIP, date, cost, hours, and count validation

It also includes a small `DOM` helper module for common DOM tasks such as creating elements, showing/hiding elements, and error display.

### `js/components/`

These are small reusable UI pieces.

Files in this folder include:

- `ProgressIndicator.js` — the five-step progress bar
- `NavigationButtons.js` — shared back/next controls
- `EntryList.js` — dynamic list for adding/removing repeating entries
- `CompositionPieChart.js` — reusable SVG quantity-share pie charts for the
  summary and printable report

These components keep the repeated UI patterns consistent.

### `js/views/`

Each step of the app has a dedicated view file.

View files include:

- `WelcomeView.js`
- `ClinicInformationView.js`
- `ImpactMethodView.js`
- `ImpactActivityView.js`
- `ImpactSummaryView.js`

These view files render the screen content and attach actions such as next/back or save.

### `js/services/exportService.js`

This file handles export actions.

It supports:

- PDF export using the browser print flow
- Excel export using `xlsx-js-style`

This keeps report generation separate from the calculation and display logic.
The summary and printable report also show a quantity-share pie chart after the
corresponding breakdown table: volunteer hours by role or clinical service
counts by service type. These are quantity distributions, separate from the
existing estimated-value bar charts. Charts show up to seven roles or services
individually and combine the rest as “Other.” When at least two entries are
below 3% each, those small entries are combined as “Other” as well.

---

## 5) How the app state flows

A beginner-friendly way to think about this app is:

1. the user fills out a form
2. the values are stored in `state`
3. the view renders from that state
4. the user advances through the steps
5. the calculator turns the input into an estimated value
6. the summary screen shows results and export options

The most important pattern is this:

- `app.js` owns the global state
- `views` read and write to that state
- `calculator.js` computes the result from that state
- `exportService.js` packages that result for export

---

## 6) Validation rules

The app validates important inputs before moving forward.

Examples include:

- clinic name is required
- street address and city are required
- ZIP code must be valid
- state must be a valid US state abbreviation
- reporting dates must be valid and ordered
- clinic cost must be a positive number if supplied
- volunteer hours must be non-negative and in half-hour increments
- service counts must be non-negative whole numbers

Validation is mostly handled in `js/utils.js` and some view logic.

---

## 7) How calculations work

The main calculation model is simple:

- volunteer estimate = hours x volunteer hourly benchmark rate
- clinical estimate = service count x service benchmark rate

The app then sums totals for each method and displays:

- total estimated value
- value by role or service
- cost comparison
- ratio or comparison metrics
- relevant source references

This logic is intentionally separated from the UI so it can be easier to understand and maintain.

---

## 8) Data and sources

The app uses benchmark reference rates embedded in the code, rather than fetching live data at runtime.

Sources referenced by the project include:

- U.S. Bureau of Labor Statistics wage data
- Independent Sector volunteer time value data
- CMS Physician Fee Schedule reference data

The actual catalog and source metadata are in `js/data.js`.

This means the project is reliant on embedded references and should be reviewed before major external use.

---

## 9) Running the project locally

There is no build step or package install needed.

You can open the app directly in a browser:

- open `index.html` in a current browser

Or serve it locally:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

The app uses a CDN for `xlsx-js-style` and Google Fonts, so internet access is needed for those features.

---

## 10) Important project notes

### This app is static
There is no backend, no database, and no server-side processing.

### State is stored in memory
The app keeps the current data in browser memory. Refreshing or closing the page clears the current report.

### The chosen method is the source of truth
The user can only report one method at a time. The chosen method drives the entire report.

### Export is browser-based
PDF and Excel export rely on the browser environment and pop-up settings.

### Numbers are estimates
The output is for planning and communication. It is not revenue, reimbursement, confirmed savings, or patient-outcome data.

---

## 11) Good places to start learning the code

If you are new to the project, read these files in order:

1. `README.md` — overview and quick start
2. `index.html` — app entry and dependencies
3. `js/app.js` — state and navigation flow
4. `js/calculator.js` — the math engine
5. `js/data.js` — benchmark values and references
6. `js/views/` — user screens
7. `js/services/exportService.js` — export features

That path gives the clearest mental model of the app.

---

## 12) Beginner mental model

Think of the project like this:

- the browser loads the app shell
- the user fills in a form
- the app stores answers in one object
- the app validates each step
- the app calculates an estimated value
- the app displays the summary and lets the user export it

That is the core architecture of this project.

---

## 13) Final takeaway

Care in Action is a small, clean static web app for community clinic reporting. It is easy to understand because it follows a straightforward pattern:

- state management
- step-based screens
- shared validation
- benchmark-based calculations
- final report display and export

This simplicity makes it a good codebase for beginners to explore, especially if you want to learn how a small front-end application is structured.

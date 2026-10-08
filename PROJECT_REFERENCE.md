# Care in Action — Project Reference

This document describes the current implementation in this repository. It is
intended as a technical reference for maintaining the application and checking
whether its behavior and claims match the source code.

## Product scope

Care in Action is a single-page, client-side estimator for aggregate clinic
activity. A user enters either (not both in one report):

- donated volunteer hours by role, or
- delivered clinical service counts by catalog service.

The tool multiplies those quantities by static reference rates and formats a
summary. It is not a clinical system, billing application, financial accounting
system, or source of patient outcome data.

The current application does not send report fields to an application server or
persist them between page loads. Values are kept in JavaScript state in the open
page. The app does load external Google Fonts and `xlsx-js-style` 1.2.0 from jsDelivr;
the browser makes normal requests to those providers. An exported report is
generated locally in the browser.

## Repository map

| Path | Responsibility |
| --- | --- |
| `index.html` | Document shell, accessible landmarks, app header/footer, CSS, and dependency order. |
| `assets/cie-logo.png` | Logo displayed in the header; also referenced as the page icon. |
| `css/styles.css` | Global design tokens, responsive layouts, components, focus/error states, reduced-motion behavior, and print styles. |
| `js/data.js` | `VOLUNTEER_ROLES`, `CLINICAL_SERVICES`, `VOLUNTEER_RATE_SOURCE`, and `REFERENCES`. |
| `js/content.js` | `AppCopy`: user-facing copy, validation strings, report labels, and export text. |
| `js/utils.js` | `Formatting`, `Validation`, and `DOM` browser helpers. |
| `js/calculator.js` | `Calculator.computeImpact(state)` and the `ImpactSummary` output shape. Contains no DOM access. |
| `js/app.js` | In-memory application state, navigation, step gating, summary calculation, and boot. |
| `js/components/ProgressIndicator.js` | Five-step progress navigation and blocked-step warning. |
| `js/components/NavigationButtons.js` | Reusable Back/forward button row. |
| `js/components/EntryList.js` | Searchable role/service selector rows, duplicate prevention, add/remove, and row validation. |
| `js/views/WelcomeView.js` | Purpose, privacy/interpretation scope, and start action. |
| `js/views/ClinicInformationView.js` | Clinic details, dates, optional cost, input synchronization, and validation. |
| `js/views/ImpactMethodView.js` | Calculation method choice and method-switch behavior. |
| `js/views/ImpactActivityView.js` | Method-specific activity entry and validation before calculation. |
| `js/views/ImpactSummaryView.js` | Summary rendering, charts/tables, references, copy action, and download controls. |
| `js/services/exportService.js` | Print-ready report and formatted XLSX workbook generation. |
| `fileStructure.txt` | Compact repository map linking to these project documents. |

There is no package manifest, bundler, framework, build configuration, or
automated test suite in the current repository.

## Runtime and dependency order

`index.html` loads classic scripts in dependency order, with `app.js` last because
it starts the application after `DOMContentLoaded`:

1. `js/data.js` declares rate/catalog globals.
2. `js/content.js` declares `AppCopy`.
3. `js/utils.js` declares `Formatting`, `Validation`, and `DOM`.
4. `js/calculator.js` declares `Calculator`.
5. Shared components are loaded.
6. The five view modules are loaded.
7. `xlsx-js-style` 1.2.0 is loaded from jsDelivr, followed by `exportService.js`.
8. `app.js` initializes and renders the first step.

These files use browser global bindings rather than modules/imports. Preserve the
script order when adding scripts or moving code. The application can be opened as
a local file or served as static files. External network access is used for the
web fonts and the XLSX library.

## User journey and state

The router's zero-based steps are:

| Index | Screen | View module |
| --- | --- | --- |
| 0 | Welcome | `WelcomeView` |
| 1 | Clinic information | `ClinicInformationView` |
| 2 | Method selection | `ImpactMethodView` |
| 3 | Activity entry | `ImpactActivityView` |
| 4 | Impact summary | `ImpactSummaryView` |

`app.js` owns one state object for the lifetime of the page:

- `clinic`: name, street, city, state, ZIP, start/end dates, optional cost.
- `impactMethod`: `"volunteerHours"`, `"clinicalServices"`, or `null`.
- `volunteers`: rows containing an id, `roleId`, and hours.
- `services`: rows containing an id, `serviceId`, and count.
- `impact`: most recently calculated `ImpactSummary` or `null`.
- `currentStep`: active step index.

Views render from the state and update it as the user edits. The app checks prior
steps when the progress control is used to move forward. Switching methods asks
for confirmation if any activity rows exist, removes activity for the inactive
method, and clears the previous impact result. “Create another report” resets
every answer and returns to step 0. No state is written to local storage, cookies,
or a backend.

Activity must include at least one positive amount for the selected method.
Blank additional rows do not count as activity. The selected method is the
source of truth for calculation: volunteer mode ignores service rows and service
mode ignores volunteer rows.

## Input and validation rules

Validation is primarily implemented in `Validation` in `js/utils.js`, with
reusable row checks in `js/components/EntryList.js` and navigation gating in
`js/app.js`.

| Input | Current rule |
| --- | --- |
| Clinic name | Required; whitespace-only values are rejected. |
| Street address and city | Required non-empty text. |
| State | Required two-letter U.S. state abbreviation or `DC`; normalized to uppercase. |
| ZIP code | Required five digits or ZIP+4 (`12345` or `12345-6789`). |
| Reporting dates | Both required, real `YYYY-MM-DD` dates, start date not later than end date. |
| Clinic cost | Optional; if entered, positive, at most `$1,000,000,000,000`, and up to two decimal places. |
| Volunteer role | Required per row and chosen from active catalog entries; duplicates are disabled. |
| Volunteer hours | Required per row, non-negative, in 0.5-hour increments; at least one row must be greater than zero. |
| Clinical service | Required per row and chosen from active catalog entries; duplicates are disabled. |
| Service count | Required per row, non-negative whole number; at least one row must be greater than zero. |

The progress component exposes step navigation, but forward navigation is gated
by required earlier information. Inline messages are connected to controls and
invalid controls receive focus when a screen cannot advance.

## Catalogs and reference rates

`js/data.js` is the editable source of truth for service/role IDs, display labels,
rate values, categories, active flags, and citations. Each role or service has an
`active` flag; the entry view only offers active catalog items.

### Volunteer roles

Each `VOLUNTEER_ROLES` item has:

- `id`: stable internal key stored in activity state.
- `displayName`: role label in selection and report.
- `category`: `"medical professional"` or `"non medical"`, used to split totals.
- `benchmarkRateUSD`: hourly benchmark in U.S. dollars.
- `occupationCode` and `blsOccupationName`: BLS occupational mapping metadata;
  some roles use `null` where no direct occupation code is supplied.
- `active`: whether the role can be selected.

The `VOLUNTEER_RATE_SOURCE` text cites national BLS occupational wage data and
states that roles without a direct occupation rate use the national volunteer
hour estimate of `$36.14`. `REFERENCES` currently includes BLS Occupational
Employment and Wage Statistics and the CMS Physician Fee Schedule Look-Up Tool.
The source catalog is static; links do not indicate an automatic update cadence
or the precise vintage/locality used for every embedded rate.

### Clinical services

Each `CLINICAL_SERVICES` item has:

- `id`: internal value stored in activity state.
- `description` and `displayName`: explanatory text and user-facing label.
- `code` and `codeSystem`: service code and identifier system, including CPT or
  HCPCS entries.
- `referenceRateUSD`: reference value per reported service.
- `active`: whether it is selectable.

The source metadata points to the CMS Physician Fee Schedule Look-Up Tool.
Catalog rates are hard-coded, not fetched per ZIP code or refreshed at runtime.
Treat them as estimates, not the clinic's actual charge, payment, or revenue.

When modifying catalog data, preserve unique IDs and valid rates, confirm the
source and rate context, and review the displayed source material. Any use or
distribution involving CPT/code content requires a separate licensing and
copyright review; do not infer permission from the public availability of a
reference link.

## Calculation behavior

All benchmark math belongs in `js/calculator.js`. It receives the state and
returns a summary object; views and exports consume that result rather than
recalculating totals.

For a selected volunteer role \(r\):

```text
role estimated value = reported hours[r] × benchmark hourly rate[r]
total estimated value = sum(role estimated values)
```

Medical and non-medical volunteer totals are separately summed using the role
`category`. Volunteer rows are the only contributor to `totalEstimatedValue` in
this mode.

For a selected clinical service \(s\):

```text
service estimated value = reported count[s] × reference rate[s]
clinical service value = sum(service estimated values)
total estimated value = clinical service value
service value share (%) = service estimated value / clinical service value × 100
```

Services are ranked independently by estimated value and by reported count.
Ties use the other measure, then service name. `mostImpactfulService` is the
first item by estimated value, or `null` when there is no positive service.

If a valid optional clinic cost \(C\) is available, the summary also contains:

```text
estimated value per $1 of cost = total estimated value / C
comparison percentage = (total estimated value - C) / C × 100
```

The UI intentionally describes the comparison as informational and explicitly
not financial ROI. Invalid/missing cost yields `null` metrics. Reporting-period
days are calculated inclusively (both endpoints count).

The result includes clinic/report metadata, method, totals, row-level breakdowns,
service rankings, optional cost comparison, inclusive period days, and the
volunteer rate-source reference. See the `ImpactSummary` typedef at the end of
`js/calculator.js` for the field names and nullability.

## Summary and exports

`ImpactSummaryView` renders the completed estimate, method-appropriate KPI,
methodology and caution text, reference rates used, service value chart/rankings,
optional cost comparison, source links, and a generated statement for grants or
donors. The copy action uses the Clipboard API with a legacy document-copy
fallback.

### Print/PDF

`ExportService.downloadPDF` builds a standalone print-ready HTML report in a new
window and opens the browser print dialog. The user chooses “Save as PDF” in the
browser. Pop-ups must be allowed. The output contains report details, estimate
and cost comparison where available, service or volunteer tables, methodology,
references, and disclaimers.

### Excel workbook

`ExportService.downloadExcel` generates a single-sheet `.xlsx` workbook with
clinic/report details, activity totals, method-specific detail, clinical
rankings when applicable, optional cost metrics, and a disclaimer. The workbook
is assembled in the browser using `xlsx-js-style` 1.2.0 loaded from jsDelivr;
report data is not posted to a workbook service. If the `XLSX` global is
unavailable, the app alerts the user that the workbook cannot be prepared.

## Accessibility and presentation

The app uses landmark elements, labeled controls, semantic tables, `aria-current`
for the active progress step, alert roles for validation messages, and
text alternatives for chart graphics. It includes keyboard-accessible buttons,
visible focus/error state styling, responsive layouts, and reduced-motion
handling. The stylesheet is centralized in `css/styles.css`; its custom
properties at the top are the shared visual tokens.

## Maintenance guide

- **Adjust rates or catalogs:** edit `js/data.js`; check duplicate IDs, activity
  flags, source text, and both summary and exports.
- **Change copy or validation messages:** edit `js/content.js`; keep both
  on-screen and exported descriptions/disclaimers aligned.
- **Change a calculation:** update `js/calculator.js` and inspect both UI and
  workbook/print consumers of the affected summary fields.
- **Change a flow or state field:** update `js/app.js` and the appropriate view;
  check progress navigation, backward navigation, method switching, and reset.
- **Add or alter a screen:** create/update its renderer in `js/views/` and wire
  the step into `app.js`, `ProgressIndicator.js`, and `index.html` script order.
- **Change repeatable form rows:** update `EntryList.js` and verify both
  volunteer and service entry behavior.
- **Change output:** update `ImpactSummaryView.js` and `exportService.js`
  together so displayed and downloaded reports remain consistent.
- **Change layout or styling:** edit `css/styles.css`, including responsive,
  focus, reduced-motion, and print behavior where relevant.

There is no configured test/build runner. After changes, run the app in a browser
and manually exercise both calculation methods, invalid inputs, backward/forward
navigation, method switching, start-over, copy, print/PDF, and Excel export.

## Known project/release checks

- There is no project license file in the current repository; establish and
  include the intended license before distributing the application.
- Confirm CPT and other third-party code/content licensing before distributing
  or deploying the service catalog; this review is not complete merely because
  the codes appear in the app.
- Confirm the source date, methodology, and applicability of each embedded
  reference rate. The current catalog has no runtime update or provenance
  versioning mechanism.
- The application is not a financial, clinical, reimbursement, or patient
  outcome authority; retain the estimates' qualifications in all future UI and
  exported formats.

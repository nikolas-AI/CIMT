# Care in Action

Care in Action is a browser-based clinic impact estimator. It turns aggregate
clinical-service counts or donated volunteer hours into a reference-rate estimate
for a selected reporting period. The resulting summary is intended to support
planning and communication, such as grant applications, donor updates, board
reports, and community presentations.

> **Important:** The displayed amounts are estimates, not clinic revenue,
> reimbursement, profit, confirmed savings, patient outcomes, or a measure of
> care quality. Review all results alongside your own records and the cited
> sources before using them externally.

## What this tool is — and why it was created

Community clinics do important work that can be hard to describe with a single
number. They provide care to their communities, and often rely on donated time
alongside their services. Care in Action was created to help clinics make that
work easier to explain: it turns totals a clinic already tracks, such as visits
or volunteer hours, into a clear, consistent summary using published reference
rates.

In real life, a clinic could use the summary as a starting point for a grant
application, a donor or board update, an annual report, or a conversation with
community partners. For example, a clinic might report the number of selected
services delivered in a year, or the hours volunteers contributed, and use the
estimate to describe the scale of that activity. The report can help tell the
story of the work; it does not replace the story, the clinic's financial records,
or evidence about patient outcomes.

The goal is to make community contributions more visible and easier to
communicate—not to assign a definitive price to care or imply that an estimate
is money earned or saved. The tool uses aggregate totals so a clinic can create
a summary without entering patient-level information.

## What it does

The estimator guides users through five steps:

1. **Welcome** — explains the estimate and the information to prepare.
2. **Clinic information** — records clinic name, location, reporting dates, and
   optional total clinic cost for that period.
3. **Method** — selects one calculation method: volunteer hours or clinical
   services.
4. **Activity** — records total hours by volunteer role, or total counts by
   clinical service. The methods are separate; one report does not combine them.
5. **Impact summary** — presents the estimate, rate breakdown, methodology,
   references, an optional cost comparison, a copyable impact statement, and
   export actions.

The application does not ask for patient names, medical records, or other
patient-level data. Enter aggregate totals only.

## Run locally

There is no build step, package installation, or server-side application. Open
`index.html` in a current browser, or serve the project directory locally:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. Stop the server with `Ctrl+C`.

The app is plain HTML, CSS, and JavaScript. It loads `xlsx-js-style` 1.2.0 from
jsDelivr and the DM Serif Display and Inter fonts from Google Fonts, so those
features need network access. If the XLSX library is unavailable, Excel export
reports that it cannot prepare the download. PDF export opens a print-ready
browser window; allow pop-ups and use the browser's print dialog to save as PDF.

## Using the estimator

- Choose the method that matches the activity you want to report.
- Provide totals for one reporting period; do not enter patient-level records.
- Volunteer hours may be entered in half-hour increments.
- Clinical service counts must be whole numbers.
- Clinic cost is optional. When supplied, it is compared with the estimated
  activity value as an informational ratio and percentage; this is not financial
  ROI.
- The ZIP code identifies the clinic in the report. Rates are national reference
  estimates and are not adjusted for the ZIP code.
- The app keeps its current form/report state in page memory only. Starting over
  clears that state, and refreshing or closing the page discards it; there is no
  save/resume facility. Downloaded reports and copied text are retained wherever
  you choose to save or paste them.

See [PROJECT_REFERENCE.md](./PROJECT_REFERENCE.md) for the full project
architecture, input rules, formulas, data sources, and export details.

## Data, limitations, and licensing

Benchmark rates and catalog entries are stored in `js/data.js`. The project
currently cites U.S. Bureau of Labor Statistics occupational wage data for
volunteer-role rates and the CMS Physician Fee Schedule Look-Up Tool for
clinical-service reference rates. Rates are embedded in the application rather
than fetched or refreshed at runtime; verify their year, methodology, and
appropriateness before relying on them.

The repository currently contains no project license file. The service catalog
includes CPT and HCPCS identifiers, and the project notes include an outstanding
need to review applicable CPT/code-content copyright and licensing requirements
before distribution or production use. This README is not a license opinion;
confirm the project's own license terms and obtain any necessary permissions and
legal review.

No automated test or build command is currently configured in the repository.

## Project map

- `index.html` — page shell and dependency/script load order.
- `css/styles.css` — design tokens, responsive layout, accessibility, and print
  styling.
- `js/data.js` — rate catalogs and source metadata.
- `js/content.js` — UI copy and report text.
- `js/utils.js` — formatting, validation, and DOM helpers.
- `js/calculator.js` — calculation logic, separate from the UI.
- `js/app.js` — in-memory state, flow control, and startup.
- `js/components/` — progress, navigation, and repeatable entry controls.
- `js/views/` — the five screens.
- `js/services/exportService.js` — print/PDF and XLSX output.
- `assets/cie-logo.png` — application logo.

For a detailed file-by-file description and implementation guidance, see
[PROJECT_REFERENCE.md](./PROJECT_REFERENCE.md).

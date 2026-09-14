# Clinic Impact Estimator Project Reference

**Status:** Living project document  
**Last updated:** 2026-09-11  
**Project type:** Browser-based static web application  
**Primary objective:** Estimate and communicate a clinic's impact using aggregate, non-PHI data.

## Product Vision

The Clinic Impact Estimator should help free clinics, charitable clinics, student-run clinics, faith-based health programs, and rural safety-net providers communicate:

- Estimated value of services provided
- Volunteer contribution value
- Potential healthcare savings
- Diverted emergency-room utilization
- Saved productivity
- Service-specific impact
- Evidence useful for fundraising and grant applications

The tool must prioritize ease of use, EMR independence, non-PHI inputs, transparent assumptions, and defensible calculations.

## Current Implementation

The application currently provides:

- Clinic name input
- Required clinic street address, city, state, and ZIP code
- Reporting period input
- Optional total clinic cost input for the reporting period
- Volunteer hours by role
- Clinical service counts
- Benchmark-based service valuation
- Volunteer contribution valuation
- Reporting-period clinic cost comparison
- Benchmark-value ratio and ROI metrics when clinic cost is supplied
- Five-step single-page workflow with a welcome screen
- Clickable progress navigation with required-step guards
- Validation and state preservation during navigation
- Impact summary dashboard
- Benchmark rate tables
- References and disclaimers
- Browser print/PDF workflow
- Excel breakdown export
- Responsive styling
- Reduced-motion support
- No patient-level data collection

Progress steps can be clicked to revisit completed or earlier screens. Backward
navigation is always available. Forward jumps are allowed only when the required
previous steps are complete; otherwise an accessible warning identifies the first
step that must be completed.

## Current Calculation Model

The current calculator estimates:

```text
Clinical service value = service count x benchmark rate

Volunteer contribution value = volunteer hours x benchmark hourly rate

Total estimated value =
clinical service value + volunteer contribution value

Estimated value per $1 invested =
total estimated value / total clinic cost for the reporting period

Benchmark-value ROI =
(total estimated value - total clinic cost) / total clinic cost x 100

Most impactful service =
service with the highest (reported count x benchmark rate)
```

These values represent estimated benchmark value. They do not represent:

- Actual revenue
- Reimbursement received
- Guaranteed healthcare savings
- Actual profit
- Confirmed avoided emergency-room visits

Estimated value per $1 invested and benchmark-value ROI are comparison metrics, not actual financial ROI.
They are shown only when a positive reporting-period clinic cost is supplied. A missing
or zero cost does not produce a ratio or ROI result.

The most impactful service is ranked by total estimated benchmark value. Positive-count
ties are resolved by visit count and then service name so the report is deterministic.

## Current Data Sources

Benchmark data is currently stored locally in `js/data.js`.

Current data categories include:

- Volunteer roles and hourly benchmark rates
- Clinical services and CPT/HCPCS codes
- Clinical benchmark rates
- Volunteer valuation source
- Reference links

The current clinical rates are approximate national benchmark values and are not yet localized by ZIP code.

## Project Structure

```text
index.html
assets/
css/
    styles.css
js/
    app.js
    calculator.js
    data.js
    utils.js
    components/
        EntryList.js
        NavigationButtons.js
        ProgressIndicator.js
    services/
        exportService.js
    views/
        WelcomeView.js
        ClinicInformationView.js
        ClinicalServicesView.js
        ImpactSummaryView.js
        VolunteerHoursView.js
```

## Responsibilities

### `index.html`

Defines the application shell and script load order.

### `js/data.js`

Owns configurable catalogs and references:

- Volunteer roles
- Clinical services
- Benchmark rates
- Source metadata
- Reference links

### `js/calculator.js`

Owns calculation logic. It should remain independent of the DOM and presentation layer.

### `js/app.js`

Owns application state and navigation between views.

### `js/utils.js`

Contains formatting, validation, and DOM helper functions.

### `js/components/`

Contains reusable interface components such as entry lists, navigation controls, and progress indicators.

### `js/views/`

Contains screen-specific rendering and form behavior.

### `js/services/exportService.js`

Owns PDF/print and Excel export behavior.

### `css/styles.css`

Contains layout, design tokens, responsive styling, accessibility states, and animations.

## Not Yet Implemented

The following requirements from the broader product vision are not currently implemented:

- Chronic condition management counts
- Localized cost or benchmark data
- Evidence-backed financial ROI calculation
- Net benefit calculation
- Diverted emergency-room visits
- Saved productivity
- Service-specific impact ranking by total estimated benchmark value
- Percentage of total ROI by service
- Service cost as a percentage of total clinic cost
- Uncertainty ranges or confidence levels
- Grant-writing or fundraising narrative output
- Backend data source integration
- Persistent storage
- Automated tests

## Important Product Decisions Needed

Before adding ROI and savings calculations, define:

1. What “ROI” means for this tool.
2. Whether reported clinic cost includes the replacement value of donated volunteer time.
3. Which costs count as clinic costs.
4. Which services have evidence for avoided ER utilization.
5. Whether savings represent gross avoided cost or estimated net savings.
6. How geographic variation will be calculated.
7. Which sources are acceptable for local cost data.
8. How uncertainty and limitations will be communicated.
9. Whether estimates should use ranges instead of single values.
10. Which outputs are appropriate for grant applications.

The initial cost implementation uses an optional total clinic cost for the reporting
period and compares it with the existing benchmark service value. It does not claim
that the comparison represents actual savings, profit, reimbursement, or healthcare ROI.

## Data and Privacy Principles

The tool should use aggregate operational data only.

It should not collect:

- Patient names
- Dates of birth
- Addresses
- Medical record numbers
- Individual diagnoses
- Insurance information
- Patient-level encounter histories
- Other direct or indirect patient identifiers

The interface should clearly state that patient-level information is not required.

## Calculation Principles

All business calculations should remain in `js/calculator.js` or a future calculation service.

UI views should:

- Collect inputs
- Validate inputs
- Display results
- Explain assumptions

UI views should not contain business formulas.

Every calculated result should identify:

- Input data used
- Benchmark or source used
- Calculation method
- Reporting period
- Geographic scope
- Limitations
- Whether the result is estimated or observed

## Recommended Future Input Model

```js
{
  clinic: {
    name: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    reportingPeriodFrom: "",
    reportingPeriodTo: "",
    reportingPeriodClinicCost: 0
  },

  volunteers: [
    {
      roleId: "",
      hours: 0
    }
  ],

  services: [
    {
      serviceId: "",
      count: 0
    }
  ],

  chronicConditions: [
    {
      conditionId: "",
      patientsManaged: 0
    }
  ]
}
```

## Recommended Future Output Model

```js
{
  clinicName: "",
  reportingPeriodFrom: "",
  reportingPeriodTo: "",

  totalEstimatedValue: 0,
  volunteerValue: 0,
  clinicalServiceValue: 0,

  estimatedSavings: 0,
  estimatedROI: 0,
  divertedERVisits: 0,
  savedProductivity: 0,

  serviceInsights: [],

  assumptions: [],
  limitations: [],
  rateSources: [],
  geographicSources: []
}
```

## Terminology Rules

Prefer:

- Estimated impact
- Estimated service value
- Estimated savings
- Volunteer contribution value
- Benchmark rate
- Aggregate data
- Reported activity
- Potentially avoided utilization

Avoid presenting estimates as:

- Revenue generated
- Money saved
- Reimbursement received
- Guaranteed savings
- Actual ROI
- Confirmed avoided ER visits

## Development Workflow

When adding or changing a feature:

1. Update this document.
2. Identify the owning module.
3. Update data/configuration separately from UI code.
4. Keep formulas in the calculation layer.
5. Add or update validation.
6. Update summary and export behavior.
7. Update source and methodology references.
8. Add tests where possible.
9. Verify accessibility and responsive behavior.
10. Record unresolved assumptions and limitations.

## Known Technical Constraints

- Plain HTML, CSS, and JavaScript
- No build step
- No framework
- XLSX library loaded from a CDN
- Data currently exists only in browser memory
- No backend API
- No database
- No automated test suite currently exists

## Change Log

### 2026-09-11

- Created initial project reference document.
- Added a welcome screen before clinic data collection.
- Documented current benchmark-value functionality.
- Added optional reporting-period clinic cost input.
- Added estimated value per $1 invested and benchmark-value ROI metrics to the summary and exports.
- Documented remaining missing savings, chronic-condition, and productivity features.
- Added required clinic address and ZIP code collection to the Clinic step and reports.
- Documented data privacy and calculation principles.

### 2026-09-14

- Added service-specific impact ranking based on total estimated benchmark value.
- Added the most impactful service narrative to the summary, PDF, and Excel exports.

## Open Questions

- What geographic cost source should be used?
- Should ZIP code determine locality, state, or metropolitan area?
- Which services should support avoided-ER estimates?
- Should the tool calculate annualized or reporting-period impact?
- Should ROI be based on total clinic cost, marginal cost, or donated resources?
- Should users be able to override benchmark assumptions?
- Which outputs should be optimized for grant writers?

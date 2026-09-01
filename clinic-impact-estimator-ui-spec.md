# Clinic Impact Estimator
## UI Product Specification

- **Version:** 1.0
- **Status:** UI Specification
- **Scope:** Frontend / User Interface Only
- **Audience:** Product engineers, frontend engineers, UI/UX designers, and LLM-based development agents

## Product Overview
### 1.1 Purpose

The Clinic Impact Estimator is a browser-based tool that helps free clinics, charitable clinics, student-run clinics, faith-based health ministries, community health programs, and rural safety-net providers communicate the estimated economic value of the services they provide.

The application collects simple operational information from a clinic and presents an understandable impact summary.

The first version of the interface will collect:

Clinic name
Volunteer hours by role
Clinical service activity by service type

The application will then display an impact summary containing estimated values based on predefined benchmark rates.

>Important: The UI must present these figures as estimates of service value, not actual revenue, reimbursement, or guaranteed healthcare savings.

### 1.2 Primary User Goal

A clinic user should be able to:

1. Enter the clinic's name.
2. Enter volunteer hours by role.
3. Enter clinical service counts by service type.
4. Review an understandable impact summary.
5. Download the summary as a PDF.
6. Download the underlying breakdown as an Excel file.

The experience should require minimal technical knowledge and should be usable by clinic staff who may not have experience with analytics or healthcare billing systems.

## Scope
### 2.1 Included in Version 1

This specification covers the frontend experience for:

1. Application introduction
2. Clinic name input
3. Volunteer-hours collection
4. Clinical-service collection
5. Impact summary
6. Calculation-result presentation
7. Benchmark/rate explanation
8. References
9. PDF download control
10. Excel download control
11. Form validation
12. Navigation between views
13. Responsive behavior
14. Loading, empty, error, and validation states

### 2.2 Explicitly Out of Scope

The following should not be implemented as part of the UI specification:

1. Backend APIs
2. Database design
3. User authentication
4. User accounts
5. Clinic data persistence
6. CMS API integration
7. Medicare rate retrieval
8. Medicaid rate retrieval
9. Calculation engine implementation
10. Actual economic modeling
11. Healthcare savings calculations
12. EHR integration
13. Claims-data integration
14. Patient-level data collection
15. CMS compliance reporting

The frontend should nevertheless be architected so these capabilities can be added later without requiring a major UI rewrite.

## Product Principles

The interface should follow these principles.

### 3.1 Simple

The user should only be asked for information that is necessary to produce the estimate.

Avoid healthcare billing terminology unless it is necessary. When technical terminology is displayed, provide plain-language explanations.

### 3.2 Transparent

Users should understand:

1. What information they entered.
2. What the estimate represents.
3. Which benchmark rates were used.
4. How the estimate was derived.
5. Where the benchmark information came from.

### 3.3 Non-Misleading

The UI must never imply that:

1. The clinic received the displayed amount.
2. Medicare or Medicaid actually paid the displayed amount.
3. The clinic saved exactly the displayed amount.
4. The displayed amount represents guaranteed healthcare savings.

#### Preferred terminology:

Estimated value of services

#### Avoid:

Revenue generated

Money saved

Medicare reimbursement received

### 3.4 Accessible

The interface should support users with different levels of technical ability.

#### Requirements include:

1. Clear labels
2. Large, readable text
3. Strong color contrast
4. Keyboard navigation
5. Visible focus states
6. Screen-reader-compatible form controls
7. Helpful validation messages
8. No reliance on color alone to communicate meaning

### 3.5 Modular

Each major UI area should be implemented as an independent component or module.

The frontend should not contain one large component responsible for the entire application.

## Application Flow

The application consists of four primary views.

#### View 1
Clinic Information

       │ Next

       ▼

#### View 2
Volunteer Hours

       │ Next

       ▼

#### View 3
Clinical Services

       │ Next

       ▼
       
#### View 4
Impact Summary

The application should behave as a single-page application experience.

Navigation between the views should not require full-page browser navigation or a traditional page reload.

Instead, the current view should transition into the next view.

## Global Layout

The application should use a consistent shell across all views.

### 5.1 Recommended Structure
```
┌──────────────────────────────────────────────┐
```
│ Clinic Impact Estimator                      │
```
├──────────────────────────────────────────────┤
```
│                                              │
```
│              Progress Indicator              │
```
│                                              │
```
│              Current View                    │
```
│                                              │
```
│              Main Content                    │
```
│                                              │
```
│                                              │
```
│              Navigation                      │
```
│                                              │
```
└──────────────────────────────────────────────┘

### 5.2 Header

The header should display:

#### Clinic Impact Estimator

The header should remain visually consistent throughout the data-entry flow.

### 5.3 Progress Indicator

The application should communicate where the user is in the process.

#### Recommended labels:

1. Clinic
2. Volunteers
3. Services
4. Impact

The current step should be visually distinguished.

The progress indicator should not require the user to understand technical workflow terminology.

## View 1 — Clinic Information
### 6.1 Purpose

Introduce the tool and collect the clinic's name.

### 6.2 Content

The view should contain:

#### Heading

Estimate Your Clinic's Impact

#### Description

The description should explain that the tool uses basic clinic activity information and benchmark rates to estimate the value of services provided.

Suggested messaging:

The Clinic Impact Estimator helps you communicate the value of the care and volunteer support your clinic provides. Enter a few simple details to create an estimated impact summary.

A secondary explanation should clarify:

This tool provides benchmark-based estimates. It does not calculate actual revenue, reimbursement, or guaranteed healthcare savings.

### 6.3 Clinic Name Input

Label:

- Clinic name

Input type:

- text

Placeholder:

- Enter your clinic name

Requirements:

1. Required field
2. Trim leading/trailing whitespace
3. Do not impose an unnecessarily restrictive character set
4. Support normal organization names
5. Provide accessible label association

### 6.4 Future Extensibility

The UI should allow additional basic clinic information to be added later.

Potential future fields include:

1. Location
2. Reporting period
3. Clinic type
4. Contact information
5. Organization type

These fields are not part of Version 1.

### 6.5 Navigation

Primary button:

- #### Next

Clicking Next should:

- Validate the clinic name.
- Preserve the entered value in application state.
- Transition to the Volunteer Hours view.

If validation fails, remain on the current view and display an inline error.

Example:

- Please enter your clinic name.

## View 2 — Volunteer Hours
### 7.1 Purpose

Collect the number of volunteer hours contributed by different volunteer roles.

### 7.2 Heading

Volunteer Hours

### 7.3 Introductory Text

Explain why volunteer hours are collected.

Suggested messaging:

- Many clinics rely on donated time from healthcare professionals, students, and community volunteers. Enter the estimated number of volunteer hours contributed by each role.

### 7.4 Role Selection

Provide a dropdown/select control.

#### Label:

Volunteer role

Example options may include:

- Physician
- Nurse
- Nurse Practitioner
- Physician Assistant
- Pharmacist
- Medical Student
- Nursing Student
- Pharmacy Student
- Administrative Volunteer
- Other

The exact role catalog should be configurable rather than hard-coded into the presentation layer.

#### Data Model Concept
VolunteerRoleOption
- id
- displayName
- benchmarkRate
- active

The UI should not calculate the benchmark rate itself.

The rate should eventually come from the calculation/configuration layer.

### 7.5 Hours Input

Once a role has been selected, display an input for hours.

#### Label:

Volunteer hours

#### Input type:

number

#### Recommended constraints:

- Minimum: 0
- Decimal values: supported
- Negative values: prohibited
- Empty value: invalid when the row is submitted
- Use an appropriate numeric input mode on mobile devices

Example:

Volunteer role
```
[ Physician                  ▼ ]

Volunteer hours
[ 125.5                       ]
```

### 7.6 Add Another Role

Provide an action below the current role entry.

Button:

+ Add another role

When clicked, a new role-entry row should appear.

Example:

Volunteer role       Hours

```
[ Physician       ▼ ] [ 125 ]

[ Nurse           ▼ ] [ 80  ]

+ Add another role
```

### 7.7 Duplicate Roles

The UI should preferably prevent selecting the same volunteer role more than once.

If duplicate roles are allowed by the underlying data model, the UI should instead provide a clear way to edit or remove individual entries.

#### Preferred Version 1 behavior:

A role can appear only once.

### 7.8 Remove Role

Each role row should have a secondary Remove action once more than one role exists.

Example:

Physician       125 hours        Remove

Removing a row should not affect other rows.

### 7.9 Empty State

Initially, display one empty role-entry row.

The user should be able to proceed only after entering valid volunteer information, unless zero volunteer hours are explicitly supported.

The application should support a clinic that has no volunteer hours.

Therefore, the user should have a clear way to indicate:

- No volunteer hours to report

Alternatively, the underlying form can allow the user to proceed without adding a role.

This behavior should be configurable.

### 7.10 Navigation

Buttons:

#### Back

Returns to View 1.

Previously entered clinic information must remain intact.

#### Next

Validates the volunteer entries and transitions to View 3.

No full-page navigation should occur.

## View 3 — Clinical Services
### 8.1 Purpose

Collect the number of patients/visits associated with each clinical service.

### 8.2 Heading

Clinical Services

### 8.3 Introductory Text

Suggested messaging:

- Tell us about the clinical services your clinic provided. Select each service and enter the number of visits or patients associated with that service.

The exact terminology should be determined by the underlying benchmark methodology.

If the calculation uses visits, the UI should say visits.

If the calculation uses patients, the UI should say patients.

Do not interchange these terms casually.

### 8.4 Service Selection

Provide a dropdown/select control.

Label:

Clinical service

Example options:

- Primary care visit
- Preventive visit
- Diabetes screening
- Blood pressure screening
- Vaccination
- Cancer screening
- Tobacco cessation counseling
- Other

The service catalog should be configurable.

#### Data Model Concept
ClinicalServiceOption
- id
- displayName
- description
- code
- codeSystem
- benchmarkRate
- active

The UI should not embed calculation logic into the service dropdown.

### 8.5 Service Count Input

After a service is selected, display an input for the number of applicable visits/patients.

Example:

Clinical service
```
[ Primary care visit       ▼ ]

Number of visits
[ 500                       ]
```

#### Input requirements:

- Numeric
- Integer by default
- Minimum 0
- No negative values
- Clear validation
- Appropriate mobile numeric keyboard

### 8.6 Add Another Service

Button:

+ Add another service

Example:

Clinical service        Visits

```
[ Primary care       ▼ ] [ 500 ]   Remove

[ Diabetes screening ▼ ] [ 120 ]   Remove

+ Add another service
```

### 8.7 Duplicate Services

#### Preferred behavior:

Prevent selecting the same service more than once.

If a user attempts to select a duplicate, show a clear validation message and preserve the existing entry.

### 8.8 Navigation

Buttons:

#### Back

Returns to View 2.

All previously entered information must remain intact.

#### See Impact

Validates the service entries and transitions to the Impact Summary view.

The application should display an appropriate loading state if the future calculation engine is asynchronous.

## View 4 — Impact Summary
### 9.1 Purpose

Present the clinic's estimated community impact in a clear, professional, and understandable format.

This view should feel suitable for:

- Board reporting
- Grant applications
- Donor communications
- Annual reports
- Community advocacy

### 9.2 Clinic Name

Display the clinic name prominently near the top.

Example:

Community Hope Clinic

### 9.3 Primary Impact Metric

Display the estimated total value prominently.

Example:

$450,000

Supporting label:

Estimated Value of Care and Volunteer Contributions

The value should be visually dominant but must not be presented as revenue.

### 9.4 Disclaimer

Place a concise explanation close to the primary metric.

Example:

This is a benchmark-based estimate of the value of services and volunteer contributions. It does not represent actual revenue, Medicare reimbursement, or guaranteed healthcare savings.

This disclaimer should remain visible on the summary and downloaded PDF.

## Impact Breakdown

The summary should contain a breakdown of the major components.

### 10.1 Volunteer Contribution Value

Display:

Volunteer Contribution Value

Example:

$45,000

Supporting information:

Based on reported volunteer hours and applicable benchmark hourly values.

### 10.2 Clinical Service Value

Display:

Clinical Service Value

Example:

$405,000

Supporting information:

Based on reported service activity and applicable healthcare benchmark rates.

### 10.3 Future Categories

The UI should be designed so additional impact categories can be added later without redesigning the entire summary.

Potential future category:

Preventive Care Value

Potential future total:

> Clinical Service Value + Volunteer Contribution Value + Preventive Care Value = Total Estimated Community Impact

The Version 1 UI should support the architecture for this expansion even if only the first two categories are initially populated.

## Calculation Display Contract

The frontend should treat calculations as data supplied by a calculation layer.

The UI should not own the mathematical formulas.

Conceptually, the frontend should receive data similar to:
```
interface ImpactSummary {
  clinicName: string;
  totalEstimatedValue: number;
  volunteerValue: number;
  clinicalServiceValue: number;
  volunteerBreakdown: VolunteerImpactItem[];
  serviceBreakdown: ClinicalImpactItem[];
  rateSources: RateSource[];
}
```

Example:
```
interface VolunteerImpactItem {
  roleId: string;
  roleName: string;
  hours: number;
  benchmarkRate: number;
  estimatedValue: number;
}
```
```
interface ClinicalImpactItem {
  serviceId: string;
  serviceName: string;
  code: string;
  codeSystem: string;
  count: number;
  benchmarkRate: number;
  estimatedValue: number;
}
```
The actual calculation implementation belongs outside the UI layer.

## Benchmark Rate Explanation

The summary should explain the medical benchmark rates used to produce the estimate.

### 12.1 Heading

Medical Benchmark Rates Used

### 12.2 Explanation

Suggested text:

> Clinical service values are estimated using publicly available healthcare benchmark rates. These benchmarks provide a consistent reference point for estimating the value of services provided.

The exact source and methodology should be configurable.

### 12.3 Rate Table

Display a table containing the applicable service information.

Required columns:

Service	CPT/HCPCS Code	Rate	Count/Hours
Primary Care Visit	XXXXX	$110.00	500
Diabetes Screening	XXXXX	$XX.XX	120

The final implementation should use the terminology appropriate to the selected service.

#### Important

The original requirement refers to a column called hours, but clinical services are generally represented by counts/visits rather than volunteer hours.

Therefore, the UI should use a context-appropriate column:

- Volunteer table → Hours
- Clinical service table → Visits/Patients or Count

Do not display "Hours" for clinical services unless the calculation methodology explicitly requires it.

## Volunteer Rate Source

The summary should contain a visually distinct information box explaining where volunteer valuation rates came from.

### 13.1 Heading

Volunteer Rate Source

### 13.2 Content

The box should explain that volunteer contributions are valued using an external benchmark/source rather than representing wages actually paid by the clinic.

Example:

Volunteer contributions are assigned benchmark hourly values based on published volunteer labor valuation sources. These values represent an estimated economic value of donated time and are not wages paid by the clinic.

The source name, publication year, and methodology should be configurable.

Example data model:
```
interface VolunteerRateSource {
  name: string;
  publicationYear?: number;
  description: string;
  url?: string;
}
```

## References
### 14.1 Purpose

The application should provide transparent references for the benchmark data used in the estimate.

### 14.2 Heading

#### References

### 14.3 Volunteer Valuation References

Include references to the articles or published sources used for estimating volunteer-hour values.

Each reference should contain:

- Title
- Author/organization
- Publication year
- Link

References should be data-driven rather than hard-coded into individual UI components.

### 14.4 CMS Reference

Include a reference to the CMS Physician Fee Schedule Look-Up Tool or the appropriate CMS source used by the eventual calculation system.

The reference should include:

- Source name
- Organization
- Relevant description
- Link
- Optional access/publication date


## Download Functionality

The Impact Summary should provide two download options.

### 15.1 Download PDF

Button:

Download PDF Summary

Purpose:

Generate a professional, printable version of the Impact Summary.

The PDF should contain:

- Clinic name
- Total estimated value
- Impact breakdown
- Volunteer contribution value
- Clinical service value
- Rate table
- Benchmark explanation
- Volunteer rate source
- References
- Disclaimer

The PDF should visually resemble the summary screen.

The PDF generation mechanism is outside the scope of this specification.

The UI should expose a clean interface to the future PDF-generation service.

### 15.2 Download Excel

Button:

Download Excel Breakdown

Purpose:

Provide the user with a structured spreadsheet containing the underlying estimate data.

The workbook should eventually contain at least:

- Volunteer Hours
- Role	Hours	Benchmark Rate	Estimated Value
- Clinical Services
- Service	CPT/HCPCS Code	Count	Benchmark Rate	Estimated Value

The Excel-generation implementation is outside the UI scope.

The frontend should trigger the appropriate export service.

## Navigation and State Management

The application should maintain user-entered data while navigating between views.

For example:

#### View 1
Clinic Name = "Community Hope Clinic"

  ↓

#### View 2
Volunteer Hours
Physician = 100
Nurse = 50

  ↓

#### View 3
Primary Care = 500
Diabetes Screening = 100

If the user clicks Back, their previous values must remain populated.

### 16.1 Recommended State Structure

Use a centralized application state rather than passing values through deeply nested components.

Conceptual structure:
```
interface ClinicEstimatorState {
  clinic: ClinicInformation;

  volunteers: VolunteerEntry[];

  services: ClinicalServiceEntry[];

  impact?: ImpactSummary;

  currentStep: EstimatorStep;
}
```

#### Where:
```
interface ClinicInformation {
  name: string;
}

interface VolunteerEntry {
  roleId: string;
  hours: number;
}

interface ClinicalServiceEntry {
  serviceId: string;
  count: number;
}
```

## Component Architecture

The UI should be modular.

A recommended component structure:

App
```
├── AppShell
│   ├── Header
│   └── ProgressIndicator
│
├── EstimatorFlow
│   ├── ClinicInformationView
│   │   ├── IntroSection
│   │   ├── ClinicNameField
│   │   └── NavigationButtons
│   │
│   ├── VolunteerHoursView
│   │   ├── SectionIntro
│   │   ├── VolunteerEntryList
│   │   │   └── VolunteerEntry
│   │   └── NavigationButtons
│   │
│   ├── ClinicalServicesView
│   │   ├── SectionIntro
│   │   ├── ClinicalServiceEntryList
│   │   │   └── ClinicalServiceEntry
│   │   └── NavigationButtons
│   │
│   └── ImpactSummaryView
│       ├── ImpactHeader
│       ├── ImpactMetric
│       ├── ImpactBreakdown
│       ├── VolunteerRateSource
│       ├── RateTable
│       ├── References
│       └── DownloadActions
```
Components should have one clear responsibility.

## Configuration-Driven Options

Volunteer roles and clinical services should not be tightly coupled to the UI.

Instead of:
```
if (role === "physician") {
  ...
}
```

use configuration/data:
```
const volunteerRoles = [
  {
    id: "physician",
    displayName: "Physician"
  },
  {
    id: "nurse",
    displayName: "Nurse"
  }
];
```

Likewise:
```
const clinicalServices = [
  {
    id: "primary-care",
    displayName: "Primary Care Visit",
    code: "...",
    codeSystem: "CPT"
  }
];
```

This allows future versions to:

- Add services
- Remove services
- Update labels
- Add new benchmark sources
- Support different benchmark datasets

without rewriting the presentation components.

## Separation of Concerns

The implementation should separate:

#### Presentation Layer

Responsible for:

- Rendering
- User interaction
- Accessibility
- Form states
- Navigation
- Visual feedback

#### Application State

Responsible for:

- Current step
- User-entered data
- Form state
- Impact-result state

#### Calculation Layer

Responsible for:

-Applying benchmark rates
-Calculating estimated values
-Producing totals

#### Data Layer

Responsible for:

- Service definitions
- Role definitions
- Benchmark rates
- Reference metadata

#### Export Layer

Responsible for:

- PDF generation
- Excel generation

The UI must not contain business calculations.

## Form Validation

Validation should happen at the appropriate step.

#### Clinic Name

Invalid when:

- Empty
- Only whitespace

#### Volunteer Entry

Invalid when:

- Role is missing
- Hours are negative
- Hours are not numeric

#### Clinical Service Entry

Invalid when:

- Service is missing
- Count is negative
- Count is not numeric

Validation errors should appear close to the relevant field.

Avoid generic messages such as:

- Invalid form.

Prefer:

- Enter the number of volunteer hours.

## Interaction and Transitions

The application should use smooth transitions between views.

Recommended behavior:

- Current view fades/slides out.
- Next view fades/slides in.
- Focus moves to the new view's heading or first interactive control.
- Browser history should not necessarily change for each step in Version 1.

Transitions should be subtle and fast.

The animation must respect the user's prefers-reduced-motion preference.

If reduced motion is enabled, views should transition immediately or with minimal animation.

## Responsive Design

The application must work on:

- Desktop
- Laptop
- Tablet
- Mobile phone

#### Desktop

Use a centered content container with comfortable maximum width.

#### Mobile

Form entries should stack vertically.

For example:

Volunteer role
```
[ Physician ▼ ]

Volunteer hours
[ 100 ]

Remove
```

rather than forcing a wide horizontal table.

The summary table should support horizontal scrolling on small screens if necessary.

## Accessibility

The application should conform to modern accessibility practices, targeting WCAG 2.1 AA.

Requirements include:

- Semantic HTML
- Proper form labels
- Keyboard-accessible controls
- Visible focus indicators
- Accessible dropdowns
- Accessible error messaging
- Sufficient color contrast
- Logical heading hierarchy
- Screen-reader-friendly navigation
- Accessible table headers
- No color-only status indicators

The progress indicator should communicate the current step to assistive technologies.

## Loading States

Although Version 1 may use local/mock calculation data, the UI should be prepared for asynchronous calculation.

When the user clicks See Impact, the application may eventually need to:

- Submit the estimator data.
- Retrieve benchmark rates.
- Calculate impact.
- Render the result.

During this process, display:

Calculating your estimated impact…

The button should be disabled while calculation is in progress.

## Error States

The application should provide a recoverable error state if the calculation layer fails.

Example:

> Unable to calculate estimate! We couldn't calculate your impact estimate right now. Your entered information has been preserved. Please try again.

Actions:

- Try Again
- Back

Do not clear the user's input because of a calculation failure.

## Empty and Zero-Value States

The UI must support legitimate zero values.

For example:

Volunteer Contribution Value
$0

This should not be treated as an error.

Likewise, a clinic should be able to report zero volunteer hours if appropriate.

The UI should distinguish between:

- No data entered
- Explicitly entered zero
- Data that is unavailable

## Visual Design Direction

The product should communicate:

- Trust
- Clarity
- Professionalism
- Healthcare
- Community impact

Avoid overly corporate financial-dashboard styling.

The design should feel appropriate for nonprofit healthcare organizations.

Recommended visual hierarchy

#### Primary
Estimated total impact

#### Secondary
Impact category values

#### Tertiary
Supporting calculations and benchmark information

#### Supporting
References and methodology

The interface should use whitespace and clear grouping rather than excessive borders or decorative elements.

## Content Guidelines

All user-facing language should be:

- Plain English
- Professional
- Respectful
- Non-technical where possible
- Transparent about estimates

Prefer:

*Estimated value of services*

Instead of:

*Monetized healthcare output*

Prefer:

*Number of visits*

Instead of:

*Service utilization volume*

Prefer:

*Benchmark rate*

Instead of:

*Reimbursement valuation coefficient*

## Terminology Rules

The following terminology should be used consistently.

|Concept                      |  	Preferred UI Term     |
|-----------------------------|-------------------------|
|Overall result               |  	Estimated Impact     |
|Healthcare service valuation | 	Estimated Service Value     |
|Volunteer valuation          |  	Volunteer Contribution Value     |
|Medical benchmark            | 	Benchmark Rate     |
|Patient/service activity	    |  Visits / Patients / Count     |
|Volunteer quantity           | 	Hours     |
|Medical procedure identifier	|  CPT/HCPCS Code     |
|Overall total	               |   Total Estimated Community Impact     |

Avoid using revenue, income, payment received, or actual savings to describe calculated values.

## Data Privacy

The Version 1 UI should not request patient-level information.

Do not collect:

- Patient names
- Dates of birth
- Addresses
- Medical record numbers
- Diagnoses
- Individual patient identifiers
- Insurance information

The tool operates on aggregate operational data.

The interface should reinforce this benefit where appropriate.

Suggested text:

No patient-level information is required.

## Download UX

When a download is requested:

- Validate that an impact result exists.
- Show a loading state if generation is asynchronous.
- Disable the relevant button during generation.
- Trigger the file download.
- Restore the button state.
- Display an error if generation fails.

Example:

[ Download PDF Summary ]
```
        ↓
[ Preparing PDF... ]
```
        ↓
PDF downloaded

The same pattern should be used for Excel.

## File Naming

The eventual export service should generate predictable filenames.

Recommended PDF:

{clinic-name}-impact-summary.pdf

Recommended Excel:

{clinic-name}-impact-breakdown.xlsx

The frontend should sanitize the clinic name before using it in filenames.

## Future Backend Contract

The frontend should be designed around a future service interface.

Conceptually:
```
interface ImpactEstimatorService {
  calculateImpact(
    input: ImpactEstimatorInput
  ): Promise<ImpactSummary>;
}
```

Input:
```
interface ImpactEstimatorInput {
  clinic: ClinicInformation;
  volunteers: VolunteerEntry[];
  services: ClinicalServiceEntry[];
}
```

Output:
```
interface ImpactSummary {
  clinicName: string;
  totalEstimatedValue: number;
  volunteerValue: number;
  clinicalServiceValue: number;
  volunteerBreakdown: VolunteerImpactItem[];
  serviceBreakdown: ClinicalImpactItem[];
  rateSources: RateSource[];
}
```

The initial UI may use mock/local data implementing the same interface.

This allows the calculation backend to be introduced later without changing the views.

## Mock Data Strategy

During frontend development, use mock data to simulate the future calculation service.

Example:

const mockImpactSummary = {
  clinicName: "Community Hope Clinic",
  totalEstimatedValue: 450000,
  volunteerValue: 45000,
  clinicalServiceValue: 405000,
  volunteerBreakdown: [],
  serviceBreakdown: [],
  rateSources: []
};

Mock data should be isolated from UI components.

Do not place mock benchmark values directly inside JSX/templates.

## Testing Requirements

The UI implementation should include tests for:

1. Navigation
2. View 1 → View 2
3. View 2 → View 3
4. View 3 → View 4
5. Back navigation
6. State preservation
7. Forms
8. Required-field validation
9. Numeric validation
10. Zero values
11. Multiple volunteer roles
12. Multiple clinical services
13. Removing entries
14. Duplicate prevention
15. Summary
16. Correct display of clinic name
17. Correct display of provided calculation result
18. Breakdown rendering
19. Rate table rendering
20. Reference rendering
21. Downloads
22. PDF action is triggered
23. Excel action is triggered
24. Loading states are displayed
25. Errors are handled
26. Accessibility
27. Keyboard navigation
28. Focus management
29. Form labels
30. Error announcements
31. Heading structure

## Definition of Done — Version 1 UI

The frontend is considered complete when:

- The application opens on the Clinic Information view.
- The clinic name can be entered and validated.
- Next transitions to the Volunteer Hours view without a full-page reload.
- Volunteer roles can be selected.
- Volunteer hours can be entered.
- Additional volunteer roles can be added.
- Volunteer entries can be removed.
- Back navigation preserves data.
- Clinical services can be selected.
- Service counts can be entered.
- Additional services can be added.
- Service entries can be removed.
- See Impact transitions to the summary.
- The summary displays the clinic name.
- The summary displays a prominent estimated total.
- Volunteer value is displayed separately.
- Clinical service value is displayed separately.
- Benchmark rate information is displayed.
- CPT/HCPCS information can be displayed.
- Volunteer-rate source information is displayed.
- References are displayed.
- The estimate disclaimer is visible.
- PDF download functionality has a defined UI integration point.
- Excel download functionality has a defined UI integration point.
- The application is responsive.
- The application is keyboard accessible.
- The application supports reduced-motion preferences.
- UI components are modular.
- Business calculations are not embedded in presentation components.
- Mock calculation data can be replaced by a future calculation service.

## Recommended Project Structure

A framework-agnostic frontend structure could follow:

src/
```
├── app/
│   ├── App
│   └── routes/
│
├── components/
│   ├── layout/
│   │   ├── AppShell
│   │   ├── Header
│   │   └── ProgressIndicator
│   │
│   ├── forms/
│   │   ├── ClinicNameField
│   │   ├── VolunteerEntry
│   │   ├── VolunteerEntryList
│   │   ├── ClinicalServiceEntry
│   │   └── ClinicalServiceEntryList
│   │
│   └── summary/
│       ├── ImpactMetric
│       ├── ImpactBreakdown
│       ├── RateTable
│       ├── RateSource
│       └── DownloadActions
│
├── views/
│   ├── ClinicInformationView
│   ├── VolunteerHoursView
│   ├── ClinicalServicesView
│   └── ImpactSummaryView
│
├── state/
│   └── estimatorState
│
├── services/
│   ├── impactEstimator
│   ├── pdfExporter
│   └── excelExporter
│
├── data/
│   ├── volunteerRoles
│   ├── clinicalServices
│   └── references
│
├── types/
│   └── estimator
│
└── utils/
    ├── formatting
    └── validation
```
The exact framework and folder naming may change based on the selected technology stack, but the separation of responsibilities should remain.

## Engineering Constraints

The implementation should follow these principles:

- Do not place business calculations inside UI components.
- Do not hard-code benchmark rates into presentation components.
- Do not hard-code reference content into reusable components.
- Use typed data models where the selected technology supports them.
- Keep form state separate from presentation components where practical.
- Use reusable components for repeated form patterns.
- Keep navigation state centralized.
- Design interfaces around future backend contracts.
- Avoid unnecessary dependencies.
- Prefer simple, maintainable implementations over premature abstraction.
- Make configuration data replaceable without changing UI components.
- Keep export functionality behind service interfaces.
- Do not collect patient-level information.
- Never describe estimated values as actual revenue or guaranteed savings.

## Future Expansion

The UI architecture should accommodate future functionality without fundamentally changing the user flow.

Potential future features include:

- Clinic location
- Reporting year
- Clinic type
- Preventive care impact
- Medicaid benchmarks
- Multiple benchmark methodologies
- Custom benchmark selection
- Saved reports
- User accounts
- Historical reports
- Comparison across reporting periods
- Grant-reporting templates
- Board-report exports
- Additional export formats
- API-backed benchmark data
- Organization-level dashboards

These features should be added as modular capabilities rather than tightly coupling them to the Version 1 implementation.

## Product Success Criteria

The UI succeeds if a clinic staff member with no technical or analytics background can:

Understand what the tool does → enter basic clinic information → report volunteer hours → report clinical activity → understand the resulting estimate → understand where the rates came from → download a professional summary.

The interface should make the estimate simple to produce, easy to understand, and difficult to misinterpret.

## Core UX Summary

The complete Version 1 experience is:

```
┌─────────────────────────────────────────┐
│ Clinic Impact Estimator                 │
│                                         │
│ Estimate Your Clinic's Impact           │
│                                         │
│ Short explanation of the tool           │
│                                         │
│ Clinic name                             │
│ [____________________________]          │
│                                         │
│ [ Next ]                                │
└─────────────────────────────────────────┘

```
                    ↓

```
┌─────────────────────────────────────────┐
│ Clinic Impact Estimator                 │
│                                         │
│ Volunteer Hours                         │
│                                         │
│ Volunteer role                          │
│ [ Physician              ▼ ]            │
│                                         │
│ Volunteer hours                         │
│ [ 125                    ]              │
│                                         │
│ [+ Add another role]                    │
│                                         │
│ [ Back ]                    [ Next ]    │
└─────────────────────────────────────────┘

```
                    ↓

```
┌─────────────────────────────────────────┐
│ Clinic Impact Estimator                 │
│                                         │
│ Clinical Services                       │
│                                         │
│ Clinical service                        │
│ [ Primary Care Visit     ▼ ]            │
│                                         │
│ Number of visits                        │
│ [ 500                    ]              │
│                                         │
│ [+ Add another service]                 │
│                                         │
│ [ Back ]              [ See Impact ]    │
└─────────────────────────────────────────┘

```
                    ↓

```
┌─────────────────────────────────────────┐
│ Community Hope Clinic                   │
│                                         │
│       $450,000                          │
│ Estimated Value of Care & Contributions │
│                                         │
│ Clinical Service Value       $405,000   │
│ Volunteer Contribution       $45,000    │
│                                         |
│ Volunteer Rate Source                   │
│ ┌─────────────────────────────────────┐ │
│ │ Source and methodology information  │ │
│ └─────────────────────────────────────┘ |│                                         │
│ Medical Benchmark Rates                 │
│ ┌─────────────────────────────────────┐ │
│ │ Service │ Code │ Rate │ Count       │ │
│ │ ...     │ ...  │ ...  │ ...         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ References                              │
│ CMS PFS Lookup Tool                     │
│ Volunteer valuation references          │
│                                         │
│ [ Download PDF Summary ]                │
│ [ Download Excel Breakdown ]            │
│                                         │
│ Estimate disclaimer                     │
└─────────────────────────────────────────┘
```

## Final Implementation Principle

The frontend should be treated as a presentation and interaction layer, not as the location of the application's economic methodology.

The UI collects structured inputs, presents structured outputs, and clearly communicates the assumptions behind those outputs.

The eventual calculation engine, benchmark data, and backend services should be replaceable independently of the UI.

This separation is a core architectural requirement for the Clinic Impact Estimator.

This can serve as the main UI PRD/specification for an LLM coding agent. A useful next step would be to turn this into a second, more implementation-oriented document defining the exact component contracts, TypeScript interfaces, state machine, mock data, and acceptance-test scenarios while still keeping the backend/calculation layer out of scope.

# Care in Action — Report Guide Source Brief

## Purpose and instructions for the next LLM

Use this brief to write a clear, practical **user guide explaining how to review, interpret, copy, print, and download the final Care in Action report**. The intended readers are community clinic staff, volunteers, board members, donors, and grant writers.

Explain the two calculation methods separately:

1. **Volunteer hours** — estimates the replacement value of donated volunteer time.
2. **Clinical services** — estimates the value of reported clinical service counts.

Explain the on-screen summary, the print/PDF report, and the Excel workbook. Make clear what is shared and what differs between them. Use plain language, define report terminology, and preserve the cautions below. Do not invent buttons, tabs, calculations, source claims, or content not supported by this brief. Where implementation details are uncertain or inconsistent, flag them rather than guessing.

## What the estimator calculates

- Each report is for one clinic and one reporting period, and uses **one method only**. The methods are not combined.
- Volunteer estimate: each reported role's hours multiplied by that role's embedded hourly benchmark rate; role estimates are summed.
- Clinical-services estimate: each reported service's count multiplied by its embedded reference rate; service estimates are summed.
- The displayed total is an **estimated value based on reported aggregate activity and reference rates**. The calculations do not use patient-level information.
- Clinic cost is optional. When reported, the summary compares that cost with the estimated activity value. The comparison is informational and is **not actual financial ROI, revenue, reimbursement, profit, confirmed savings, patient outcomes, or care quality**.
- Reference rates are embedded in the application and are not refreshed live. The clinic ZIP code does not adjust them.
- Do not describe the volunteer estimate as cash received or wages paid. Do not describe clinical service estimates as the clinic's actual charges, reimbursement, or revenue.

## Final report: shared content

The summary screen and print/PDF report identify the clinic and reporting period and show:

- Clinic name and address.
- Reporting-period dates.
- A prominent total estimated value, labeled for the selected method.
- A method-specific activity total: volunteer hours or clinical-service counts.
- An estimate disclaimer and a short narrative explaining the estimate.
- A suggested impact statement for grants and donors. Users can copy it; they should review and adapt it before sharing.
- Methodology and relevant source references.
- If clinic cost was entered, an additional cost comparison, including the reported clinic cost, estimated value, value per dollar of reported cost, and a percentage comparison.

On the summary screen, users can also view method-specific charts and, for clinical services, switch the ranking between estimated value and count. The screen includes a **Copy impact statement** action and **Download PDF report** and **Download Excel workbook** actions.

The clinic-cost comparison is omitted when no clinic cost is provided. If a cost comparison is unavailable, the interface may show a dash or “Not available” rather than a numeric ratio.

## Print/PDF report

The PDF action opens a print-ready report in a new browser window and invokes the browser print dialog. The user can print or choose **Save as PDF**. Pop-ups must be allowed for the report window to open. The PDF contains narrative and visual report sections, not merely a spreadsheet printout.

### PDF content common to both methods

- Report heading, clinic address, and reporting period.
- Large total estimate and method-specific label.
- Disclaimer/callout.
- KPI cards for reported activity and estimated community value. A value-per-dollar KPI appears when clinic cost was supplied.
- Narrative summary.
- Optional clinic-cost comparison with the same-period reported cost, total estimated value, estimated value per dollar, percentage comparison, and a caution note.
- Suggested grant/donor impact statement.
- Methodology bullets and relevant linked sources.

### PDF: volunteer-hours method

- Highlights the volunteer role with the highest estimated value, including its hours, estimated value, and share of total volunteer value.
- Shows a horizontal estimated-value chart of up to the ten highest-value roles. With ten or fewer positive roles, all are shown.
- Includes a role table ranked by reported hours, with role, volunteer type/category, hours, reference hourly rate, and estimated value, plus a total.
- Includes a pie chart of reported hours by role. Small role shares may be grouped as **Other**.
- Shows a medical/non-medical/total estimated-value card breakdown only when both medical-professional and non-medical volunteer hours were reported.
- Includes volunteer reference-rate information and the applicable source references.

### PDF: clinical-services method

- Highlights the service with the highest estimated value, including reported units, estimated value, and its share of total service value.
- Shows a horizontal estimated-value chart of up to the ten highest-value services.
- Includes a clinical-services table ranked by reported counts, with service, code, reported units, reference rate, estimated value, and value share, plus a total.
- Includes a pie chart of reported service counts by type. Small service shares may be grouped as **Other**.
- Includes the clinical reference-rate summary and relevant source references.

## Excel workbook

The Excel download creates a formatted `.xlsx` workbook in the browser. The primary worksheet is named **Impact Summary** and contains clinic/report details, method-specific summary and breakdown data, source references, and a disclaimer. A second worksheet named **Activity Chart** is added when there are positive activity items. It contains two side-by-side data tables for activity quantity (hours or service counts) and estimated value (USD), with the corresponding native pie charts placed below the data tables and stacked vertically to avoid covering data. Each chart groups its own smallest shares into **Other** as needed; the detailed method table retains the reported positive items.

The workbook uses formatted section headings, currency/percentage number formats, column filters for the method-specific activity table, and clickable source URLs. It is a structured workbook, not a second copy of the complete narrative PDF.

### Excel: volunteer-hours method

The **Impact Summary** worksheet has these sections:

1. **Clinic Details** — clinic name, street address, city, state, ZIP code, and reporting-period dates.
2. **Method Selected** — Volunteer hours.
3. **Volunteer Hours Breakdown** — medical-professional hours, non-medical hours, and total hours. A zero category is displayed as a dash.
4. **Total Estimated Value Provided** — medical-professional value, non-medical value, and total volunteer value. A zero category is displayed as a dash.
5. **Cost and Value Comparison** — reported clinic cost (or “Not reported”), estimated volunteer-time value, value per $1 of reported cost, estimated value as a share of reported cost, and an explanatory caution note. Missing comparison values are labeled “Not available.”
6. **Volunteer Roles** — positive-hour roles sorted by estimated value, with role, type/category, hours, reference rate, estimated value, and value share, followed by a total row. Roles with zero hours are omitted from this detailed table.
7. **Sources and References** — organization, period, reference title, and URL.
8. Disclaimer.

When positive role hours exist, **Activity Chart** contains role labels/hours and role labels/estimated values. It includes a **Volunteer Roles Distribution** pie chart and an **Estimated Value by Volunteer Role** pie chart.

### Excel: clinical-services method

The **Impact Summary** worksheet has these sections:

1. **Clinic Details** — clinic name, street address, city, state, ZIP code, and reporting-period dates.
2. **Method Selected** — Clinical services.
3. **Total Service Counts**.
4. **Total Estimated Value Provided**.
5. **Cost and Value Comparison** — reported clinic cost (or “Not reported”), estimated service value, value per $1 of reported cost, estimated value as a share of reported cost, and an explanatory caution note. Missing comparison values are labeled “Not available.”
6. **Services** — positive-count services sorted by estimated value, with service, code, units, reference rate, estimated value, and value share, followed by a total row. Services with zero counts are omitted from this detailed table.
7. **Sources and References** — organization, period, reference title, and URL.
8. Disclaimer.

When positive service counts exist, **Activity Chart** contains service labels/counts and service labels/estimated values. It includes a **Distribution of Clinical Services Provided** pie chart and an **Estimated Value by Clinical Service** pie chart.

### Important distinction: Excel vs. PDF/on-screen rankings

- The PDF clinical breakdown table is ranked by **reported counts**; the on-screen clinical ranking can switch between estimated value and number reported.
- The clinical Excel **Services** table is sorted by **estimated value**.
- The PDF volunteer role table is ranked by **hours**; the Excel volunteer **Volunteer Roles** table is sorted by **estimated value**.
- Do not imply that every table or chart uses the same ranking. Tell users to check the section title and column headings.
- The workbook includes separate pie charts for activity quantity and estimated value. The value chart shows each role/service's share of the total estimated value; it is not revenue or a measure of reimbursement.
- The Excel workbook does not include the full PDF narrative, PDF horizontal ranking charts, or the interactive on-screen clinical ranking toggle.

## How to describe the fields

- **Reference rate**: an embedded benchmark applied to the reported unit (per hour for volunteer roles; per service unit for clinical services).
- **Estimated value**: reported hours/count multiplied by the applicable embedded reference rate.
- **Value share**: that role/service's estimated value divided by the method's total estimated value.
- **Share of reported units**: that service's count divided by all reported service counts; this differs from its share of estimated value.
- **Most impactful**: the role/service with the largest estimated value, not necessarily the most hours or the highest activity count.
- **Clinic cost comparison**: a comparison of one reported cost total with the estimated value of the entered activity. It is not a full accounting of all costs or outcomes.

## Source and benchmark caveat for guide writers

The code lists U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics (May 2025) and Independent Sector / Do Good Institute volunteer-time value (April 2026) references for volunteer reporting. It describes occupation-specific volunteer benchmarks as BLS hourly mean wages and uses a national volunteer-hour value for roles without a directly matched occupational rate. The reference record for clinical services names the CMS Physician Fee Schedule Look-Up Tool and gives the period as 2026.

Explain that rates are in-app reference values, not the clinic's actual charges or payments, and direct users to the report's sources and the tool administrator to confirm current rate provenance before external reliance.

## Limitations and practical user guidance

- Users should verify clinic details, dates, and aggregate activity totals before using the report.
- The report is for one reporting period and one method at a time; users who need both methods must create separate reports.
- Do not enter patient names, records, or other patient-level information.
- The app does not save or resume a report; users should download or copy needed information before refreshing or closing the page.
- If the PDF window does not open, allow pop-ups. If Excel export cannot be prepared, the workbook or chart library may not have loaded; check connectivity and retry.
- Encourage users to adapt the statement and report detail to their audience and organizational context.

## Suggested structure for the user guide

1. What the final report is, and what it is not.
2. How to review the shared summary fields and optional cost comparison.
3. How to interpret a volunteer-hours report.
4. How to interpret a clinical-services report.
5. PDF versus Excel: what each contains and when to use it.
6. Step-by-step copy, print/save-as-PDF, and Excel download instructions.
7. How to interpret ranks, shares, charts, “Other,” and reference rates.
8. Limitations, source-rate caveat, privacy, and troubleshooting.

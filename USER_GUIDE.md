# Care in Action User Guide

Care in Action helps community clinics create an estimate of the value of activity they already track: clinical services provided **or** volunteer hours contributed. The summary can support grant applications, donor and board updates, annual reports, and conversations with community partners.

This guide explains what to prepare, how to complete a report, and how to interpret and save the results.


## Before you begin

Gather the information for one reporting period:

- Clinic name and address
- Reporting period start and end dates
- Either:
  - Total volunteer hours, organized by volunteer role; **or**
  - Total clinical service counts, organized by service
- Optional: total clinic cost for the same period

Use totals for the whole reporting period. **Do not enter patient names, medical records, or other patient-level information.**

## Create a report

### 1. Start the estimator

Read the welcome screen and its “What you’ll need” information, then select **Begin**.

### 2. Enter clinic information

Complete the clinic and reporting-period fields:

- **Clinic name**
- **Street address**
- **City**
- **State** — enter a valid two-letter U.S. state or District of Columbia abbreviation.
- **ZIP code** — enter a five-digit ZIP code or ZIP+4.
- **Reporting period** — choose both the start and end dates. The start date must be on or before the end date.
- **Total clinic cost for this reporting period** — optional. Enter this only if the information is available. If you provide it, the summary will include an informational comparison between your reported clinic cost and the estimated value of the activity you entered. This can help put the estimate in context, but it is not actual financial ROI, revenue, reimbursement, profit, or confirmed savings.

Use dates and totals that refer to the same reporting period. The ZIP code identifies the clinic in the report; it does **not** adjust the benchmark rates for local costs or location.

Select **Next** to continue. If a required field needs attention, follow the message shown beside it.

### 3. Choose one calculation method

Select one method for this report:

- **Volunteer hours** — estimates the replacement value of donated time by volunteer role.
- **Clinical services** — estimates the value of reported clinical services using reference rates.

A report uses one method at a time; it does not combine volunteer hours and clinical service counts. If you change methods after entering activity, the estimator warns that entries for the other method will be cleared.

### 4. Enter or import activity totals

Choose how to enter activity:

- **Enter totals manually** — use the search field to find each role or service, then enter its total for the reporting period. Use **Add another** to add a row and the row’s remove button to remove a row.
- **Upload a CSV, Excel, or TXT file** — use this when your activity totals are already in a spreadsheet or text file. The clinic details and reporting period you entered earlier are used in the report.

#### Enter totals manually

- For **volunteer hours**, enter total hours by role. Hours can be entered in half-hour increments, such as `12` or `12.5`.
- For **clinical services**, enter the total number of each service provided. Counts must be whole numbers, such as `25`.
- Values must be zero or greater.
- Enter each role or service only once. Combine its activity into one total.
- At least one activity entry must have a value greater than zero to create a summary.

#### Import totals from a file

1. Select the matching calculation method first: volunteer hours or clinical services.
2. Select **Download CSV template** and **Download catalog ID reference**. The template shows the required columns and IDs; the reference pairs catalog IDs with role or service names.
3. Fill in the template using the catalog ID from the reference. Do not substitute a role or service name, or a CPT/HCPCS code, for the ID. Keep the two column headers unchanged:
   - Volunteer hours: `role_id` and `hours`
   - Clinical services: `service_id` and `count`
4. Remove rows you do not need, or leave their quantity as `0`. Include at least one positive total. Volunteer hours must use half-hour increments; service counts must be whole numbers.
5. Upload the completed file. The tool checks the IDs and quantities, combines repeated IDs by adding their totals, and shows a preview. Review the preview and confirm the totals before continuing.

Accepted file types are:

- **CSV** (`.csv`)
- **TXT** (`.txt`) with columns separated by tabs
- **Excel workbook** (`.xlsx`), using only the first worksheet

For Excel uploads, the first worksheet must contain the required headers and activity rows. The importer does not calculate spreadsheet formulas; formula cells in that worksheet are rejected. Replace formulas with their displayed values before uploading (in Excel, copy the cells and use **Paste Special → Values**). Older `.xls` workbooks, PDFs, and documents are not supported.

Uploads may be up to **5 MB** and contain up to **10,000 nonblank activity rows**. If a row is invalid or an ID is not in the selected method’s catalog, the tool displays an error and will not generate a partial report. Correct the file and upload it again. Uploading another file replaces the previous import; it does not add to it.

Select **See impact summary** once manual entries are complete, or once an imported file has no errors and you have confirmed its preview.

### 5. Review the impact summary

The summary shows the estimated value for the selected method, along with the related activity totals and available breakdowns. Depending on your method and entries, it may also show rate information, source references, rankings, a suggested impact statement, and an optional clinic-cost comparison.

Review the clinic name, address, dates, method, and activity totals carefully before using the report. The suggested statement is a starting point: review it and adapt it to your organization’s context.

## Understand the estimate

The estimator applies embedded reference rates to your reported totals:

- **Volunteer estimate:** reported hours multiplied by the reference hourly rate for each role.
- **Clinical-services estimate:** reported service counts multiplied by the reference rate for each service.

The results are **estimates for planning and communication**. They are not clinic revenue, charges, reimbursement, profit, confirmed savings, financial return on investment, patient outcomes, or a measure of care quality.

Rates are embedded in the application and are not refreshed live. The current reference periods are U.S. Bureau of Labor Statistics wage data from **May 2025**, Independent Sector / Do Good Institute volunteer rates **as of April 21, 2026**, and the **2026** CMS Physician Fee Schedule. The summary and downloaded reports identify the applicable reference period for each source. Review the linked sources and confirm that the rates remain appropriate before relying on an estimate externally.

### Optional clinic-cost comparison

If you enter clinic cost, the summary may compare that amount with the estimated value of the activity entered. This is an informational comparison, **not actual financial ROI, revenue, reimbursement, profit, or confirmed healthcare savings**. The estimate does not account for every cost, service, or outcome.

## Copy or download your report

On the summary screen, you can:

- Select **Copy impact statement** to copy the suggested text. Review and edit it before sharing.
- Select **Download PDF report** to open a print-ready report. In the browser’s print dialog, choose a printer or **Save as PDF**. Allow pop-ups for the site if the report window does not open.
- Select **Download Excel workbook** to download a workbook of the report. This feature requires the workbook library to load; if it is unavailable, try again with an internet connection or contact the tool administrator.

Downloaded reports and copied text are saved or pasted wherever you choose. The estimator itself does not provide a save-and-resume feature.

## Protect your work and privacy

The form and report remain in the current page’s memory while you use the estimator. They are not saved by the app for a later session. Refreshing or closing the page discards the current entries, so download or copy the information you need before leaving.

The estimator is designed to use aggregate totals and does not require patient-level information. Do not enter patient identifiers or medical records into any field.

## Troubleshooting

- **A field shows an error:** Check the field’s message. Confirm required clinic details and dates are complete, and that the ZIP code, state abbreviation, and numbers are valid.
- **The reporting period is rejected:** Make sure both dates are valid and the start date is not after the end date.
- **An activity row is rejected:** Select a role or service and enter a non-negative number. Use half-hour increments for volunteer hours and whole numbers for service counts.
- **An imported file has a header or ID error:** Use the template for the selected method, keep its two headers, and copy IDs from the matching catalog reference. Names and service codes are not accepted in place of catalog IDs.
- **An Excel file is rejected:** Confirm it is an `.xlsx` workbook, check the first worksheet for the required headers, and replace any formulas with their saved values. Only the first worksheet is read.
- **An upload exceeds the limit:** Keep the file at or below 5 MB and reduce it to 10,000 or fewer nonblank activity rows.
- **You cannot see a summary:** Confirm that at least one activity total is greater than zero.
- **The PDF window does not appear:** Allow pop-ups for the site, then select the PDF button again.
- **The Excel download does not work:** The workbook library may not have loaded. Check your internet connection and try again.
- **The page reloads or closes:** The estimator does not save or restore unfinished reports. Re-enter the information from your own records.

## Use reports thoughtfully

Care in Action is a communication aid, not a substitute for your clinic’s records or professional judgment. Verify the reported totals, rate sources, and reporting period, and explain that the result is a benchmark-based estimate whenever you share it.

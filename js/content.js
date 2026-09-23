"use strict";

const AppCopy = (() => {
  const validation = {
    clinicNameRequired: "Enter your clinic name.",
    clinicAddressRequired: (label) => `Enter the clinic's ${label}.`,
    zipCode: "Please enter a valid 5-digit ZIP code or ZIP+4.",
    stateCode: "Please enter a valid two-letter US state abbreviation.",
    reportingStartRequired: "Please select a start date.",
    reportingEndRequired: "Please select an end date.",
    reportingDatesInvalid: "Please enter valid reporting dates.",
    reportingDateOrder: "The start date must come before the end date.",
    clinicCostInvalid: "Enter the clinic cost using dollars and cents only.",
    clinicCostPositive: "Enter a clinic cost greater than zero.",
    volunteerRoleRequired: "Select a volunteer role.",
    volunteerHoursRequired: "Enter the volunteer hours.",
    volunteerHoursNegative: "Hours cannot be negative.",
    serviceRequired: "Select a service.",
    serviceCountRequired: "Enter the number of services.",
    serviceCountNegative: "The count cannot be negative.",
    impactActivityRequired: "Enter at least one service or volunteer hour before viewing the summary.",
    impactMethodRequired: "Choose a calculation option before continuing.",
  };

  const summary = {
    emptyState: "Enter services provided or volunteer hours donated to create a summary for this reporting period.",
    fiShortDisclaimer: "Important: Dollar amounts are estimates based on reported totals and reference rates. They are not revenue, payments, profit, or confirmed savings.",
    methodologyNote: "Reported service counts are multiplied by reference rates. Volunteer hours are multiplied by reference hourly rates. The rates are national estimates and are not adjusted for your ZIP code.",
    shortDisclaimer: "Important: This is an estimate of the value of services and volunteer contributions. It does not represent actual revenue, reimbursement, profit, or confirmed savings.",
    costComparisonNote: "Important: This compares your reported clinic cost with the estimated value provided by your clinic. It is not actual financial ROI, revenue, reimbursement, profit, or confirmed healthcare savings.",
    rankingNote: "Rankings show the relative estimated value of the services you reported. They do not measure clinical importance, quality of care, patient need, reimbursement, or actual savings.",
    funderReadyTitle: "Impact statement for grants and donors",
    copySuccess: "Statement copied. Review it and adjust it for your organization.",
    impactStatementButton: "Copy impact statement",
    impactStatementButtonSecondary: "Copy for grant or donor use",
  };

  const impactMethod = {
    ariaLabel: "Impact calculation method",
    heading: "Choose how to calculate the impact of your clinic",
    intro: "Choose how you want to estimate the value provided by your clinic for this reporting period.",
    legend: "Calculation method",
    volunteerTitle: "Volunteer hours",
    volunteerDescription: "Estimate the value of donated time by volunteer role.",
    servicesTitle: "Clinical services",
    servicesDescription: "Estimate the value of the services your clinic provided.",
    switchWarning: "Changing this option will clear entries that do not fit the new option. Continue?",
    next: "Continue",
  };

  const impactActivity = {
    ariaLabel: "Report activity",
    volunteerHeading: "Enter volunteer hours",
    volunteerIntro: "Enter the total hours contributed during this reporting period for each volunteer role. The estimator uses reference hourly rates to estimate the value of donated time. Volunteer contribution value reflects the estimated replacement value of donated time. It is not cash received by the clinic.",
    servicesHeading: "Enter clinical services provided",
    servicesIntro: "Add the total number of each service your clinic provided during the reporting period. Enter combined counts only.  Each service is paired with a reference rate used to estimate the value of reported care. These rates are not your clinic’s actual charges, reimbursement, or revenue.",
    next: "See impact summary",
  };

  const progress = {
    labels: ["Welcome", "Clinic", "Volunteers", "Services", "Impact"],
    stepWarning: (incompleteStep, targetStep) => `Complete the ${progress.labels[incompleteStep]} step before continuing to ${progress.labels[targetStep]}.`,
  };

  const welcome = {
    eyebrow: "Care in Action",
    heading: "Show the value of your clinic’s work",
    intro: "Use your clinic’s total service counts and volunteer hours to create a clear impact summary for a selected reporting period.",
    description: "The estimator helps you communicate the estimated value of care, donated volunteer time, and reported clinic activity, without entering any patient information. Your completed summary can support grant applications, donor communications, board reports, and conversations about your clinic’s role in the community.",
    note: "Use the summary for grant applications, donor updates, board reports, and community conversations.",
    whatYouNeedTitle: "What you’ll need",
    list: [
      "Clinic name and reporting period",
      "Clinic address and ZIP code",
      "Total clinic cost for the reporting period, if available",
      "Total volunteer hours by role",
      "Total number of clinical services provided",
    ],
    privacy: "No patient names, medical records, or other patient-level information is needed. Results are estimates based on benchmark rates and should not be interpreted as actual revenue, reimbursement, or guaranteed savings.",
    begin: "Begin",
  };

  const clinic = {
    ariaLabel: "Clinic Information",
    heading: "Clinic information",
    intro: "Your clinic location and reporting period help identify the report and provide context for people who review it. Reference rates are national estimates and are not adjusted by ZIP code.",
    disclaimer: "Note: Adding your clinic cost lets the report compare your reported investment with an estimated value provided by your clinic. This is a comparison, not actual financial return or confirmed savings.",
    snapshotHeading: "Clinic snapshot",
    snapshotIntro: "Enter the organization's information and dates for this report.",
    nameLabel: "Clinic name",
    streetLabel: "Street address",
    cityLabel: "City",
    stateLabel: "State",
    zipLabel: "ZIP code",
    reportingLabel: "Reporting period",
    fromLabel: "From",
    toLabel: "To",
    costLabel: "Total clinic cost for this reporting period",
    costHelp: "Include the clinic costs you report for this period, such as supplies, facilities, staffing, technology, administration, or other operating expenses.",
    next: "Next",
    back: "Back",
  };

  const volunteer = {
    ariaLabel: "Volunteer Hours",
    heading: "Recognize the value of volunteer support",
    intro: "Enter the total hours donated during this reporting period for each volunteer role. The tool uses reference hourly rates to estimate the value of that time.",
    note: "Important: This is the estimated value of donated time. It is not money received by the clinic.",
    roleLabel: "Volunteer role",
    hoursLabel: "Volunteer hours",
    addLabel: "Add a volunteer role",
    emptyState: "No volunteer hours to report for this period",
    next: "Next",
    back: "Back",
  };

  const services = {
    ariaLabel: "Clinical Services",
    heading: "Document the care your clinic provided",
    intro: "Enter the total number of each service your clinic provided during the reporting period. Use combined totals only. Do not enter patient information.",
    note: "Important: Each service has a reference rate used to estimate its value. These rates are not your clinic’s charges, payments, or revenue.",
    label: "Service provided",
    countLabel: "Total number provided",
    estimatedPerService: "Estimated value for one service",
    estimatedTotal: "Estimated total value",
    addLabel: "Add another service",
    emptyState: "No services to report for this period",
    next: "See impact summary",
    back: "Back",
  };

  const metric = {
    estimatedTotalValue: "Estimated total value",
    clinicalServiceCount: "Clinical services reported",
    estimatedClinicalServiceValue: "Estimated value of clinical services",
    volunteerHours: "Volunteer hours contributed",
    estimatedVolunteerContributionValue: "Estimated value of volunteer time",
    mostImpactful: "Most impactful reported service",
    totalEstimatedValueServicesOnlyNote: "Estimated value of the clinical services reported.",
    totalEstimatedValueVolunteerOnlyNote: "Estimated value of the volunteer time reported.",
    clinicalServiceCountNote: "Total services entered for this reporting period.",
    estimatedClinicalServiceValueNote: "Estimated value of the clinical services reported.",
    volunteerHoursNote: "Total hours donated across volunteer roles.",
    estimatedVolunteerContributionValueNote: "Estimated value of all reported volunteer time.",
    estimatedMedicalProfessionalVolunteerValue: "Estimated value of medical volunteer time",
    estimatedMedicalProfessionalVolunteerValueNote: "Estimated value of donated time from medical volunteers.",
    estimatedNonMedicalVolunteerValue: "Estimated value of other volunteer time",
    estimatedNonMedicalVolunteerValueNote: "Estimated value of donated time from non-medical volunteers.",
    mostImpactfulNote: "Service with the highest estimated value.",
  };

  const summaryView = {
    heading: (clinicName, startDate, endDate) => {
      const name = (clinicName || "").trim();
      if (name) {
        return `${name}’s estimated community impact`;
      }
      return "Your clinic’s estimated community impact";
    },
    periodText: (startDate, endDate) => `Reporting period: ${startDate || "Not specified"}–${endDate || "Not specified"}`,
    narrative: (impactMethod, clinicName, serviceCount, volunteerHours, totalValue) => {
      const name = clinicName || "Your clinic";
      if (impactMethod === "volunteerHours") {
        return `During this reporting period, ${name} reported ${volunteerHours} volunteer hours. Using reference hourly rates, the estimated value of that time is ${Formatting.currency(totalValue)}.`;
      }
      if (Number(serviceCount || 0) > 0) {
        return `During this reporting period, ${name} reported ${serviceCount} clinical services. Using national reference rates, the estimated value of those services is ${Formatting.currency(totalValue)}.`;
      }
      return summary.emptyState;
    },
    serviceNarrative: (serviceName, count, estimatedValue, share) => `The ${serviceName} service had the largest share of the total estimated service value, with ${count} services and an estimated value of ${Formatting.currency(estimatedValue)}.`,
    rankTitle: "Services with the highest estimated value",
    rankIntro: "View services by estimated value or by the number reported.",
    costHeading: "Your clinic cost and estimated value",
    costIntro: (cost) => `You reported ${Formatting.currency(cost)} in clinic costs for this period. The report compares that cost with the estimated value of the activity entered here.`,
    valuePerDollarLabel: "Estimated value for each $1 of clinic cost",
    valuePerDollarText: (ratio) => `For every $1 in reported clinic cost, the activity entered here has an estimated value of ${Formatting.currency(ratio)}.`,
    benchmarkComparisonLabel: "Cost and estimated value comparison",
    benchmarkComparisonText: (percentDifference, direction) => `The estimated total value was ${Formatting.number(percentDifference, 1)}% ${direction} than the reported clinic cost.`,
    fundingTitle: "Ways to use this summary",
    fundingBullets: [
      "Grant applications and progress reports",
      "Donor and sponsor updates",
      "Board packets and annual reports",
      "Volunteer recognition materials",
      "Community presentations",
      "Internal planning discussions",
    ],
    fundingNote: "Review the report alongside your organization’s financial records, program outcomes, and funder requirements before submitting it externally.",
    methodologySectionTitle: "How these estimates are calculated",
    methodologyBullets: [
      "Service totals are multiplied by reference rates.",
      "Volunteer hours are multiplied by reference hourly rates.",
      "The total combines the estimated value of the activity you entered. Volunteer roles are kept separate from clinical services when the volunteer option is used.",
      "When clinic cost is provided, the report compares that cost with the total estimated value.",
      "Reference rates are national estimates and are not adjusted for your ZIP code.",
      "Only combined activity totals are needed. Do not enter patient information.",
    ],
  };

  const exportCopy = {
    pdfTitle: "Estimated Clinic Impact Summary",
    pdfSubtitle: "Activity summary using reference-rate estimates",
    pdfFooter: "Important: This report uses combined activity totals and reference rates. It does not represent revenue, payments, profit, confirmed savings, or patient outcomes.",
    workbookSummary: "Impact Summary",
    workbookClinical: "Clinical Services",
    workbookVolunteer: "Volunteer Contributions",
    workbookAssumptions: "Assumptions & Sources",
    summaryNote: "Important: Dollar amounts are estimates based on reported activity and reference rates. They are not revenue, payments, profit, or confirmed savings.",
    labels: {
      serviceCount: "Reported Service Count",
      rate: "Reference Rate",
      total: "Estimated Value",
      volunteerValue: "Estimated Value of Volunteer Time",
      cost: "Reported Clinic Cost",
      roi: "Cost and Estimated Value Comparison",
      valuePerDollar: "Estimated Value per $1 of Reported Cost",
    },
  };

  return {
    app: { title: "Care in Action", headerContext: "Community care impact summary" },
    validation,
    impactMethod,
    impactActivity,
    welcome,
    clinic,
    volunteer,
    services,
    metric,
    summary: summary,
    summaryView,
    progress,
    exportCopy,
  };
})();

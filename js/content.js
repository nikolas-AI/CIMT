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
    methodologyNote: "Service totals are multiplied by reference rates. Volunteer hours are multiplied by reference hourly rates. The rates are national estimates and are not adjusted for your ZIP code. No patient information is needed.",
    shortDisclaimer: "Important: This is an estimate of service and volunteer value provided by the clinic. It is not revenue, payment, profit, or confirmed savings.",
    costComparisonNote: "Important: This compares your reported clinic cost with the estimated value provied by your clinic. It is not financial return, revenue, profit, or confirmed healthcare savings.",
    rankingNote: "The list shows which reported services have the highest estimated value. It does not show care quality, patient need, payments, or actual savings.",
    funderReadyTitle: "Impact statement for grants and donors",
    copySuccess: "Statement copied. Review it and adjust it for your organization.",
    impactStatementButton: "Copy impact statement",
    impactStatementButtonSecondary: "Copy for grant or donor use",
  };

  const impactMethod = {
    ariaLabel: "Calculation option",
    heading: "Choose a calculation option",
    intro: "Choose how you want to estimate value for this report.",
    legend: "Calculation option",
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
    volunteerIntro: "Enter the donated hours for each volunteer role. The summary estimates the value of all reported volunteer time.",
    servicesHeading: "Enter clinical services",
    servicesIntro: "Enter the total number of services your clinic provided. The reference rate already includes the clinical work connected to each service.",
    next: "See impact summary",
  };

  const progress = {
    labels: ["Welcome", "Clinic", "Volunteers", "Services", "Impact"],
    stepWarning: (incompleteStep, targetStep) => `Complete the ${progress.labels[incompleteStep]} step before continuing to ${progress.labels[targetStep]}.`,
  };

  const welcome = {
    eyebrow: "Clinic Impact Estimator",
    heading: "Show the value of your clinic’s work",
    intro: "Use service totals and volunteer hours to create a clear summary for a selected reporting period.",
    description: "The tool estimates the value of care and donated time without asking for patient information.",
    note: "Use the summary for grant applications, donor updates, board reports, and community conversations.",
    whatYouNeedTitle: "What you’ll need",
    list: [
      "Clinic name and reporting period",
      "Clinic address and ZIP code",
      "Total clinic cost for the reporting period, if available",
      "Total volunteer hours by role",
      "Total number of clinical services provided",
    ],
    privacy: "Important: Do not enter patient names, medical records, or other patient details. Results are estimates and should not be treated as revenue, payments, or guaranteed savings.",
    begin: "Begin",
  };

  const clinic = {
    ariaLabel: "Clinic Information",
    heading: "Clinic information",
    intro: "Your clinic details and reporting period identify the report. Reference rates are national estimates and are not adjusted by ZIP code.",
    disclaimer: "Important: Adding your clinic cost lets the report compare that cost with an estimated value. This is a comparison, not actual financial return or confirmed savings.",
    snapshotHeading: "Clinic snapshot",
    snapshotIntro: "Enter the organization and dates for this report.",
    nameLabel: "Clinic name",
    streetLabel: "Street address",
    cityLabel: "City",
    stateLabel: "State",
    zipLabel: "ZIP code",
    reportingLabel: "Reporting period",
    fromLabel: "From",
    toLabel: "To",
    costLabel: "Total clinic cost for this reporting period",
    costHelp: "Include the costs your organization reports for this period, such as supplies, facilities, staff, technology, or administration.",
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
    app: { title: "Clinic Impact Estimator", headerContext: "Simple activity summary" },
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

"use strict";

const AppCopy = (() => {
  const validation = {
    clinicNameRequired: "Please enter your clinic name.",
    clinicAddressRequired: (label) => `Please enter the clinic's ${label}.`,
    zipCode: "Please enter a valid 5-digit ZIP code or ZIP+4.",
    stateCode: "Please enter a valid two-letter US state abbreviation.",
    reportingStartRequired: "Please select a start date.",
    reportingEndRequired: "Please select an end date.",
    reportingDatesInvalid: "Please enter valid reporting dates.",
    reportingDateOrder: "The start date must be before the end date.",
    clinicCostInvalid: "Please enter a valid clinic cost using dollars and cents only.",
    clinicCostPositive: "Enter a clinic cost greater than zero.",
    volunteerRoleRequired: "Please select a volunteer role.",
    volunteerHoursRequired: "Please enter the number of volunteer hours.",
    volunteerHoursNegative: "Hours cannot be negative.",
    serviceRequired: "Please select a clinical service.",
    serviceCountRequired: "Please enter the number of visits.",
    serviceCountNegative: "The count cannot be negative.",
    impactActivityRequired: "Report at least one clinical service or volunteer hour before viewing the impact summary.",
  };

  const summary = {
    emptyState: "Add reported clinical services and/or volunteer hours to create an estimated impact summary for this reporting period.",
    fiShortDisclaimer: "All dollar amounts are benchmark-based estimates derived from reported aggregate activity. They are not actual revenue, reimbursement, profit, confirmed savings, or patient-level outcomes.",
    methodologyNote: "Reported clinical service counts are multiplied by reference benchmark rates. Reported volunteer hours are multiplied by reference hourly rates. Volunteer roles are classified as medical professional or non-medical. The estimated total combines clinical service value and non-medical volunteer value; medical-professional volunteer value is reported separately because clinical service rates already represent that work. When clinic cost is provided, the report compares reported clinic cost with total estimated benchmark value. Benchmark rates are currently national reference values and are not adjusted for your ZIP code. This tool uses aggregate data only and does not require patient information.",
    shortDisclaimer: "This is a benchmark-based estimate of the value of services and volunteer contributions. It does not represent actual revenue, reimbursement, profit, confirmed savings, or patient-level outcomes.",
    costComparisonNote: "This is not actual financial ROI, revenue, reimbursement, profit, or confirmed healthcare savings. It is a comparison between reported clinic cost and estimated benchmark value.",
    rankingNote: "Rankings show the relative estimated benchmark value of the services you reported. They do not measure clinical importance, quality of care, patient need, reimbursement, or actual savings.",
    funderReadyTitle: "Funder-ready impact statement",
    copySuccess: "Impact statement copied. Review it and tailor it to your organization’s voice and funding requirements.",
    impactStatementButton: "Copy impact statement",
    impactStatementButtonSecondary: "Copy for grant or donor use",
  };

  const progress = {
    labels: ["Welcome", "Clinic", "Volunteers", "Services", "Impact"],
    stepWarning: (incompleteStep, targetStep) => `Complete the ${progress.labels[incompleteStep]} step before continuing to ${progress.labels[targetStep]}.`,
  };

  const welcome = {
    eyebrow: "Clinic Impact Estimator",
    heading: "Show the value of your clinic’s work",
    intro: "Use your clinic’s aggregate service counts and volunteer hours to create a clear impact summary for a selected reporting period.",
    description: "The estimator helps you communicate the estimated value of care, donated volunteer time, and reported clinic activity, without entering any patient information.",
    note: "Your completed summary can support grant applications, donor communications, board reports, and conversations about your clinic’s role in the community.",
    whatYouNeedTitle: "What you’ll need",
    list: [
      "Clinic name and reporting period",
      "Clinic address and ZIP code",
      "Total clinic cost for the reporting period, if available",
      "Aggregate volunteer hours by role",
      "Aggregate counts of clinical services provided",
    ],
    privacy: "No patient names, medical records, or other patient-level information is needed. Results are estimates based on benchmark rates and should not be interpreted as actual revenue, reimbursement, or guaranteed savings.",
    begin: "Begin",
  };

  const clinic = {
    ariaLabel: "Clinic Information",
    heading: "Clinic information",
    intro: "Your clinic location and reporting period help identify the report and provide context for people who review it. Current benchmark estimates are national reference values and are not yet adjusted by ZIP code.",
    disclaimer: "Adding your total clinic cost lets the report compare your reported investment with the estimated benchmark value of services and volunteer support. This is a comparison measure, not actual financial return or confirmed savings.",
    snapshotHeading: "Clinic snapshot",
    snapshotIntro: "Set the organization and dates this report represents.",
    nameLabel: "Clinic name",
    streetLabel: "Street address",
    cityLabel: "City",
    stateLabel: "State",
    zipLabel: "ZIP code",
    reportingLabel: "Reporting period",
    fromLabel: "From",
    toLabel: "To",
    costLabel: "Total clinic cost for this reporting period",
    costHelp: "Example: include the clinic costs you report for this period, such as supplies, facilities, staffing, technology, administration, or other operating expenses. Follow your organization’s own reporting practices.",
    next: "Next",
    back: "Back",
  };

  const volunteer = {
    ariaLabel: "Volunteer Hours",
    heading: "Recognize the value of volunteer support",
    intro: "Enter the total hours contributed during this reporting period for each volunteer role. The estimator uses reference hourly rates to estimate the value of donated time.",
    note: "Volunteer contribution value reflects the estimated replacement value of donated time. It is not cash received by the clinic.",
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
    intro: "Add the total number of each service your clinic provided during the reporting period. Enter combined counts only. Do not enter any patient-level information.",
    note: "Each service is paired with a benchmark rate, a reference amount used to estimate the value of reported care. These rates are not your clinic’s actual charges, reimbursement, or revenue.",
    label: "Service provided",
    countLabel: "Total number provided",
    estimatedPerService: "Estimated value per service",
    estimatedTotal: "Estimated total value",
    addLabel: "Add another service",
    emptyState: "No services to report for this period",
    next: "See impact summary",
    back: "Back",
  };

  const metric = {
    estimatedTotalValue: "Estimated total value",
    clinicalServiceCount: "Reported clinical services",
    estimatedClinicalServiceValue: "Estimated clinical service value",
    volunteerHours: "Volunteer hours contributed",
    estimatedVolunteerContributionValue: "Estimated volunteer contribution value",
    mostImpactful: "Most impactful reported service",
    totalEstimatedValueNote: "Estimated benchmark value of reported services plus non-medical volunteer support.",
    totalEstimatedValueServicesOnlyNote: "Estimated benchmark value of reported clinical services.",
    totalEstimatedValueVolunteerOnlyNote: "Estimated benchmark value of reported volunteer contributions.",
    clinicalServiceCountNote: "Total service count entered for this reporting period.",
    estimatedClinicalServiceValueNote: "Estimated benchmark value of reported clinical services.",
    volunteerHoursNote: "Total donated hours reported across volunteer roles.",
    estimatedVolunteerContributionValueNote: "Estimated replacement value of donated time across all reported volunteer roles (Both Medical and Non-Medical).",
    estimatedMedicalProfessionalVolunteerValue: "Estimated medical-professional volunteer value",
    estimatedMedicalProfessionalVolunteerValueNote: "Estimated replacement value of donated time from medical-professional roles.",
    estimatedNonMedicalVolunteerValue: "Estimated non-medical volunteer value",
    estimatedNonMedicalVolunteerValueNote: "Non-medical volunteer value included in the estimated total.",
    mostImpactfulNote: "Highest estimated benchmark value among reported services.",
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
    narrative: (clinicName, serviceCount, volunteerHours, clinicalValue, volunteerValue, nonMedicalVolunteerValue, totalValue) => {
      const name = clinicName || "Your clinic";
      const serviceSentence = Number(serviceCount || 0) > 0
        ? `During this reporting period, ${name} reported providing ${serviceCount} clinical services`
        : `During this reporting period, ${name} reported no clinical services`;
      const volunteerSentence = Number(volunteerHours || 0) > 0
        ? ` and receiving ${volunteerHours} volunteer hours.`
        : ".";

      if (Number(volunteerHours || 0) > 0 && Number(serviceCount || 0) > 0) {
        return `${serviceSentence}${volunteerSentence} Based on national benchmark rates, this activity represents an estimated total value of ${Formatting.currency(totalValue)}, including ${Formatting.currency(clinicalValue)} in reported clinical service value and ${Formatting.currency(nonMedicalVolunteerValue)} in non-medical volunteer value. Medical-professional volunteer value is not included in the estimated total as it is included in the clinical service value.`;
      }

      if (Number(volunteerHours || 0) > 0) {
        return `During this reporting period, ${name} reported ${volunteerHours} volunteer hours, representing an estimated donated-time value of ${Formatting.currency(volunteerValue)} based on benchmark hourly rates. The estimated total includes ${Formatting.currency(nonMedicalVolunteerValue)} from non-medical volunteer roles.`;
      }

      if (Number(serviceCount || 0) > 0) {
        return `${serviceSentence}. Based on national benchmark rates, these services represent an estimated clinical service value of ${Formatting.currency(clinicalValue)}.`;
      }

      return summary.emptyState;
    },
    serviceNarrative: (serviceName, count, estimatedValue, share) => `The ${serviceName} service represented the largest share of reported clinical service value, with ${count} services and an estimated benchmark value of ${Formatting.currency(estimatedValue)}.`,
    rankTitle: "Where your reported care had the greatest estimated value",
    rankIntro: "View services by estimated benchmark value or by reported service count.",
    costHeading: "Reported investment and estimated benchmark value",
    costIntro: (cost) => `You reported ${Formatting.currency(cost)} in clinic costs for this period. The estimator compares that reported cost with the estimated benchmark value of reported services and non-medical volunteer support.`,
    valuePerDollarLabel: "Estimated benchmark value per $1 of reported clinic cost",
    valuePerDollarText: (ratio) => `For every $1 in reported clinic cost, the activity entered in this report corresponds to ${Formatting.currency(ratio)} in estimated benchmark value.`,
    benchmarkComparisonLabel: "Benchmark-value comparison",
    benchmarkComparisonText: (percentDifference, direction) => `The estimated total benchmark value was ${Formatting.number(percentDifference, 1)}% ${direction} than the reported clinic cost.`,
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
      "Reported clinical service counts are multiplied by reference benchmark rates.",
      "Reported volunteer hours are multiplied by reference hourly rates.",
      "The estimated total combines clinical service value and non-medical volunteer value. Medical-professional volunteer value is shown separately because clinical service rates already represent that work.",
      "When clinic cost is provided, the report compares reported clinic cost with total estimated benchmark value.",
      "Benchmark rates are currently national reference values and are not adjusted for your ZIP code.",
      "This tool uses aggregate data only and does not require patient information.",
    ],
  };

  const exportCopy = {
    pdfTitle: "Estimated Clinic Impact Summary",
    pdfSubtitle: "Aggregate activity summary using benchmark-based estimates",
    pdfFooter: "This report uses aggregate operational data and benchmark rates. It does not represent actual revenue, reimbursement, profit, confirmed savings, or patient-level outcomes.",
    workbookSummary: "Impact Summary",
    workbookClinical: "Clinical Services",
    workbookVolunteer: "Volunteer Contributions",
    workbookAssumptions: "Assumptions & Sources",
    summaryNote: "Dollar amounts are benchmark-based estimates. They are not actual revenue, reimbursement, profit, or confirmed savings.",
    labels: {
      serviceCount: "Reported Service Count",
      rate: "Benchmark Rate",
      total: "Estimated Benchmark Value",
      volunteerValue: "Estimated Volunteer Contribution Value",
      cost: "Reported Clinic Cost",
      roi: "Benchmark-Value Comparison",
      valuePerDollar: "Estimated Benchmark Value per $1 of Reported Cost",
    },
  };

  return {
    app: { title: "Clinic Impact Estimator", headerContext: "Aggregate impact reporting" },
    validation,
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

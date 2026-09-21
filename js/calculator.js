/**
 * calculator.js — Calculation service
 *
 * This file is the only place where benchmark math is performed. It reads the
 * answers from app.js and the catalog in data.js, then returns one summary object.
 * It never creates buttons, reads inputs, or changes the page, which makes the
 * calculations easier to test without touching the interface.
 *
 * Input shape:
 *   state.clinic      : { name: string, reportingPeriodFrom: string, reportingPeriodTo: string }
 *   state.volunteers  : [{ roleId, hours }]
 *   state.services    : [{ serviceId, count }]
 *
 * Output shape: ImpactSummary (see below)
 */

"use strict";

const Calculator = (() => {

  /**
  * Calculate totals and detailed rows from the user's answers.
  * @param {object} state The current answers from app.js.
  * @returns {ImpactSummary} Values ready for the summary screen or an export.
   */
  function computeImpact(state) {
    const impactMethod = state.impactMethod;
    if (impactMethod !== "volunteerHours" && impactMethod !== "clinicalServices") {
      throw new Error("A valid impact method is required before calculating impact.");
    }

    // The method is the source of truth. Clinical Services may use only
    // non-medical volunteer roles; medical volunteer time belongs exclusively
    // to the Volunteer Hours method to avoid double-counting clinical labor.
    const volunteerEntries = (state.volunteers || []).filter(entry => {
      const role = VOLUNTEER_ROLES.find(item => item.id === entry.roleId);
      return role && (impactMethod === "volunteerHours" || role.category === "nonMedical");
    });
    const serviceEntries = impactMethod === "clinicalServices" ? (state.services || []) : [];

    const volunteerBreakdown = _computeVolunteerBreakdown(volunteerEntries);
    const serviceBreakdown   = _computeServiceBreakdown(serviceEntries);
    const clinicalValue      = serviceBreakdown.reduce((sum, r) => sum + r.estimatedValue, 0);
    const serviceImpactRanking = impactMethod === "clinicalServices"
      ? _rankServices(serviceBreakdown, clinicalValue)
      : { byValue: [], byVisits: [] };
    const mostImpactfulService = serviceImpactRanking.byValue[0] || null;

    const volunteerValue         = volunteerBreakdown.reduce((sum, r) => sum + r.estimatedValue, 0);
    const nonMedicalVolunteerValue = volunteerBreakdown
      .filter(row => row.category === "nonMedical")
      .reduce((sum, row) => sum + row.estimatedValue, 0);
    const medicalProfessionalVolunteerValue = impactMethod === "volunteerHours"
      ? volunteerValue - nonMedicalVolunteerValue
      : 0;
    const totalValue = impactMethod === "volunteerHours"
      ? volunteerValue
      : clinicalValue + nonMedicalVolunteerValue;
    const clinicCost         = _optionalPositiveNumber(state.clinic.reportingPeriodClinicCost);
    const valueToCostRatio   = clinicCost > 0 ? totalValue / clinicCost : null;
    const benchmarkValueROI  = clinicCost > 0
      ? (totalValue - clinicCost) / clinicCost * 100
      : null;

    /** @type {ImpactSummary} */
    return {
      impactMethod:             impactMethod,
      clinicName:           state.clinic.name,
      streetAddress:        state.clinic.streetAddress,
      city:                 state.clinic.city,
      state:                state.clinic.state,
      zipCode:              state.clinic.zipCode,
      reportingPeriodFrom:  state.clinic.reportingPeriodFrom,
      reportingPeriodTo:    state.clinic.reportingPeriodTo,
      totalEstimatedValue:  totalValue,
      volunteerValue:       impactMethod === "volunteerHours" ? volunteerValue : nonMedicalVolunteerValue,
      nonMedicalVolunteerValue: nonMedicalVolunteerValue,
      medicalProfessionalVolunteerValue: medicalProfessionalVolunteerValue,
      clinicalServiceValue: clinicalValue,
      reportingPeriodClinicCost: clinicCost,
      reportingPeriodDays:       _periodDays(state.clinic.reportingPeriodFrom, state.clinic.reportingPeriodTo),
      valueToCostRatio:      valueToCostRatio,
      benchmarkValueROI:     benchmarkValueROI,
      volunteerBreakdown:   volunteerBreakdown,
      serviceBreakdown:     serviceBreakdown,
      mostImpactfulService: mostImpactfulService,
      serviceImpactRanking: serviceImpactRanking,
      rateSources:          [VOLUNTEER_RATE_SOURCE],
    };
  }

  function _rankServices(services, clinicalValue) {
    const activeServices = services
      .filter(service => service.count > 0)
      .slice()
      .map(service => ({
        ...service,
        clinicalValueShare: clinicalValue > 0
          ? service.estimatedValue / clinicalValue * 100
          : 0,
      }));

    const byValue = activeServices.slice().sort((a, b) =>
        b.estimatedValue - a.estimatedValue ||
        b.count - a.count ||
        a.serviceName.localeCompare(b.serviceName)
      );
    const byVisits = activeServices.slice().sort((a, b) =>
      b.count - a.count ||
      b.estimatedValue - a.estimatedValue ||
      a.serviceName.localeCompare(b.serviceName)
    );

    return { byValue, byVisits };
  }

  function _optionalPositiveNumber(value) {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(value);
    return Number.isFinite(number) && number > 0 && number <= 1_000_000_000_000
      ? number
      : null;
  }

  function _periodDays(from, to) {
    if (!from || !to || from > to) return null;
    const start = new Date(`${from}T00:00:00Z`);
    const end = new Date(`${to}T00:00:00Z`);
    const days = Math.round((end - start) / 86400000) + 1;
    return Number.isFinite(days) && days > 0 ? days : null;
  }

  // ---------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------

  function _computeVolunteerBreakdown(volunteers) {
    // Turn role ids and hours into rows the report can display. Looking up the
    // role in the catalog gives us the correct name and rate in one place.
    // An unknown id is skipped instead of crashing the entire report.
    return volunteers
      .map(entry => {
        const role  = VOLUNTEER_ROLES.find(r => r.id === entry.roleId);
        if (!role) return null;
        const hours = parseFloat(entry.hours) || 0;
        return {
          roleId:         role.id,
          roleName:       role.displayName,
          category:       role.category,
          hours:          hours,
          benchmarkRate:  role.benchmarkRateUSD,
          estimatedValue: hours * role.benchmarkRateUSD,
        };
      })
      .filter(Boolean);
  }

  function _computeServiceBreakdown(services) {
    // Service names, codes, and rates come from data.js, not from typed input.
    // This keeps the report consistent if the catalog changes later.
    return services
      .map(entry => {
        const svc   = CLINICAL_SERVICES.find(s => s.id === entry.serviceId);
        if (!svc) return null;
        const count = parseInt(entry.count, 10) || 0;
        return {
          serviceId:      svc.id,
          serviceName:    svc.displayName,
          code:           svc.code,
          codeSystem:     svc.codeSystem,
          count:          count,
          benchmarkRate:  svc.benchmarkRateUSD,
          estimatedValue: count * svc.benchmarkRateUSD,
        };
      })
      .filter(Boolean);
  }

  return { computeImpact };
})();

/**
 * @typedef {Object} ImpactSummary
 * @property {"volunteerHours"|"clinicalServices"} impactMethod
 * @property {string}  clinicName
 * @property {string}  streetAddress
 * @property {string}  city
 * @property {string}  state
 * @property {string}  zipCode
 * @property {string}  reportingPeriodFrom
 * @property {string}  reportingPeriodTo
 * @property {number}  totalEstimatedValue
 * @property {number}  volunteerValue
 * @property {number}  nonMedicalVolunteerValue
 * @property {number}  medicalProfessionalVolunteerValue
 * @property {number}  clinicalServiceValue
 * @property {number|null} reportingPeriodClinicCost
 * @property {number|null} reportingPeriodDays
 * @property {number|null} valueToCostRatio
 * @property {number|null} benchmarkValueROI
 * @property {Array}   volunteerBreakdown
 * @property {Array}   serviceBreakdown
 * @property {Object|null} mostImpactfulService
 * @property {{byValue: Array, byVisits: Array}} serviceImpactRanking
 * @property {Array}   rateSources
 */

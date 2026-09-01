/**
 * calculator.js — Calculation service
 *
 * This module is the ONLY place where benchmark math is performed.
 * It consumes state + data and returns a structured ImpactSummary.
 *
 * It has NO knowledge of the DOM.
 * It will be trivially replaceable by a backend API call.
 *
 * Input shape:
 *   state.clinic      : { name: string }
 *   state.volunteers  : [{ roleId, hours }]
 *   state.services    : [{ serviceId, count }]
 *
 * Output shape: ImpactSummary (see below)
 */

"use strict";

const Calculator = (() => {

  /**
   * Compute the full impact summary from collected form state.
   * @param {object} state  — App state snapshot
   * @returns {ImpactSummary}
   */
  function computeImpact(state) {
    const volunteerEntries = state.noVolunteerHours ? [] : (state.volunteers || []);
    const serviceEntries   = state.noServicesProvided ? [] : (state.services || []);

    const volunteerBreakdown = _computeVolunteerBreakdown(volunteerEntries);
    const serviceBreakdown   = _computeServiceBreakdown(serviceEntries);

    const volunteerValue     = volunteerBreakdown.reduce((sum, r) => sum + r.estimatedValue, 0);
    const clinicalValue      = serviceBreakdown.reduce((sum, r) => sum + r.estimatedValue, 0);
    const totalValue         = volunteerValue + clinicalValue;

    /** @type {ImpactSummary} */
    return {
      clinicName:           state.clinic.name,
      totalEstimatedValue:  totalValue,
      volunteerValue:       volunteerValue,
      clinicalServiceValue: clinicalValue,
      volunteerBreakdown:   volunteerBreakdown,
      serviceBreakdown:     serviceBreakdown,
      rateSources:          [VOLUNTEER_RATE_SOURCE],
    };
  }

  // ---------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------

  function _computeVolunteerBreakdown(volunteers) {
    return volunteers
      .map(entry => {
        const role  = VOLUNTEER_ROLES.find(r => r.id === entry.roleId);
        if (!role) return null;
        const hours = parseFloat(entry.hours) || 0;
        return {
          roleId:         role.id,
          roleName:       role.displayName,
          hours:          hours,
          benchmarkRate:  role.benchmarkRateUSD,
          estimatedValue: hours * role.benchmarkRateUSD,
        };
      })
      .filter(Boolean);
  }

  function _computeServiceBreakdown(services) {
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
 * @property {string}  clinicName
 * @property {number}  totalEstimatedValue
 * @property {number}  volunteerValue
 * @property {number}  clinicalServiceValue
 * @property {Array}   volunteerBreakdown
 * @property {Array}   serviceBreakdown
 * @property {Array}   rateSources
 */

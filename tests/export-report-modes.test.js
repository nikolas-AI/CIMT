"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function report({mode='clinicalServices', cost=null, category='mixed', count=12, name='Sample Clinic', mutate}={}) {
  let html='';
  const ctx=vm.createContext({console,setTimeout(){},window:{open:()=>({addEventListener(){},document:{write(value){html=value},close(){}},focus(){},closed:true})}});
  for (const file of ['data.js','content.js','utils.js','calculator.js','components/CompositionPieChart.js','services/exportService.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),ctx);
  }
  ctx.options={mode,cost,category,count,name};
  vm.runInContext(`
    const selectedRoles = options.category === 'mixed'
      ? [...VOLUNTEER_ROLES.filter(r=>r.category==='medical professional').slice(0,6), ...VOLUNTEER_ROLES.filter(r=>r.category==='non medical').slice(0,6)]
      : VOLUNTEER_ROLES.filter(r=>r.category===options.category);
    const state={impactMethod:options.mode,clinic:{name:options.name,streetAddress:'123 Main Street',city:'Austin',state:'TX',zipCode:'78701',reportingPeriodFrom:'2026-01-01',reportingPeriodTo:'2026-06-30',reportingPeriodClinicCost:options.cost},
      services:CLINICAL_SERVICES.slice(0,options.count).map((s,i)=>({serviceId:s.id,count:i+1})),
      volunteers:selectedRoles.slice(0,options.count).map((r,i)=>({roleId:r.id,hours:i+1.5}))};
    globalThis.summary=Calculator.computeImpact(state);
  `,ctx);
  if(mutate) mutate(ctx.summary);
  vm.runInContext('ExportService.downloadPDF(summary)',ctx);
  return {html,summary:ctx.summary};
}
for (const mode of ['clinicalServices','volunteerHours']) {
  test(`${mode}: summary, full charts, tables and sources stay mode-specific`,()=>{
    const {html}=report({mode});
    assert.equal((html.match(/class="brief-ranking-row"/g)||[]).length,5);
    assert.doesNotMatch(html,/class="chart-row"|Top ten/);
    assert.doesNotMatch(html,/aria-label="Activity and estimated value"/);
    assert.ok(html.indexOf('<table>')>html.indexOf('aria-label="Detailed activity statement"'));
    assert.match(html,/class="composition-pie__chart"/);
    assert.doesNotMatch(html,/NaN|Infinity|undefined/);
    if(mode==='clinicalServices') {
      assert.match(html,/clinical-services-composition/); assert.match(html,/CMS Physician Fee Schedule/);
      assert.doesNotMatch(html,/volunteer-hours-composition|<h2>Volunteer Rate Source/);
    } else {
      assert.match(html,/volunteer-hours-composition/);assert.match(html,/Bureau of Labor Statistics/);
      assert.match(html,/<h2>Volunteer Rate Source/);assert.doesNotMatch(html,/clinical-services-composition|CMS Physician Fee Schedule/);
      assert.match(html,/composition-pie composition-pie--volunteer-hours/);
      assert.match(html,/\.composition-pie--volunteer-hours \.composition-pie__label \{ display: inline; \}/);
    }
  });
  test(`${mode}: absent cost is omitted; valid cost retains both comparisons`,()=>{
    const absentCostHTML=report({mode}).html;
    assert.doesNotMatch(absentCostHTML,/<section class="report-section cost-comparison">/);
    assert.doesNotMatch(absentCostHTML,/<span>reported clinic cost<\/span>/);
    const {html}=report({mode,cost:1000});
    assert.match(html,/<strong>\$1,000\.00<\/strong><span>reported clinic cost<\/span>/);
    assert.match(html,/<section class="report-section cost-comparison">/);
    assert.match(html,/Reported cost compared with estimated value/);
    assert.match(html,/estimated value per \$1 of reported cost/);
    for(const ratio of [-10,0,10]) {
      const result=report({mode,cost:1000,mutate:s=>{s.benchmarkValueROI=ratio;}});
      assert.match(result.html,new RegExp(`${Math.abs(ratio).toFixed(1)}% ${ratio<0?'lower':ratio>0?'higher':'equal'}`));
    }
    const zero=report({mode,cost:1000,mutate:s=>{s.reportingPeriodClinicCost=0;s.valueToCostRatio=null;s.benchmarkValueROI=null;}}).html;
    assert.match(zero,/Value-to-cost comparison is not available/);assert.doesNotMatch(zero,/NaN|Infinity|0\.0% equal/);
  });
  test(`${mode}: empty activity suppresses charts and preserves a readable report`,()=>{
    const {html}=report({mode,count:0});assert.match(html,/No activity was reported/);
    assert.doesNotMatch(html,/class="chart-row"|class="composition-pie__chart"|NaN|Infinity/);
    assert.doesNotMatch(html,/aria-label="Activity and estimated value"|aria-label="Detailed activity statement"/);
    assert.match(html,/02 \/ /);
  });
}
test('methodology appendix flows naturally and keeps its heading with the description',()=>{
  const {html}=report();
  assert.match(html, /\.report-chapter\.appendix-page \{ break-before: page; page-break-before: always; margin-top: 0; \}/);
  assert.match(html, /\.appendix-intro \{ break-inside: avoid; page-break-inside: avoid; \}/);
  assert.match(html, /\.appendix-masthead \{ margin-bottom: 24px; \}/);
  assert.match(html, /<section class="report-chapter appendix-page" aria-label="Methodology and sources">\s*<div class="appendix-intro">\s*<div class="appendix-masthead"><div class="brief-masthead"><strong>CARE IN ACTION \/ CLINIC IMPACT ESTIMATOR<\/strong>[\s\S]*?<\/div><\/div>\s*<header class="chapter-header">\s*<h2>Methodology &amp; sources<\/h2>/);
  assert.match(html, /<header class="chapter-header">[\s\S]*?<\/header>\s*<p class="narrative">/);
});
test('volunteer category comparison appears only for two active categories',()=>{
  for(const category of ['medical professional','non medical']) assert.doesNotMatch(report({mode:'volunteerHours',category}).html,/<section class="report-section volunteer-value-glance">/);
  assert.match(report({mode:'volunteerHours'}).html,/<section class="report-section volunteer-value-glance">/);
});
test('zero activity rows stay excluded and clinic text is escaped in every chapter',()=>{
  const {html}=report({name:'Clinic <script>alert(1)</script> & Partners',mutate:s=>{
    s.serviceBreakdown.push({serviceName:'Unused service',serviceDescription:'Unused service',code:'ZERO',count:0,benchmarkRate:5,estimatedValue:0});
  }});
  assert.doesNotMatch(html,/<script>|Unused service/);assert.match(html,/Clinic &lt;script&gt;/);
});

test('large clinical reports retain every detail row and the grouped chart legend',()=>{
  const {html}=report({count:40});
  assert.equal((html.match(/<tr class="table-row--/g)||[]).length,40);
  assert.doesNotMatch(html,/class="chart-row"|Top ten/);
  assert.match(html,/composition-pie--dense/);
  assert.match(html,/Other services/);
  assert.match(html,/Clinical services total/);
});
test('clinical detail tables retain full descriptors while highlights use concise labels',()=>{
  const {html,summary}=report({count:1});
  const row=summary.serviceBreakdown[0];
  assert.ok(row.serviceName!==row.serviceDescription);
  assert.ok(html.includes(row.serviceDescription));
  const table = html.match(/<table>([\s\S]*?)<\/table>/)[1];
  assert.ok(table.includes(row.serviceName));
  const firstPage = html.slice(0, html.indexOf('aria-label="Detailed activity statement"'));
  assert.ok(!firstPage.includes(row.serviceName));
  assert.ok(html.includes(`<td class="service-code">${row.code}</td>`));
});

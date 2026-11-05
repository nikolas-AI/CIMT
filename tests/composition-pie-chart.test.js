"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({});
vm.runInContext(
  fs.readFileSync(path.join(root, "js/components/CompositionPieChart.js"), "utf8"),
  context
);
const chart = vm.runInContext("CompositionPieChart", context);

function renderLabels(values, options = {}) {
  const html = chart.render({
    id: "test",
    title: "Test",
    description: "Test chart",
    items: values.map(([label, value]) => ({ label, value, valueLabel: `${value} units` })),
    otherLabel: "Other",
    unitLabel: "units",
    formatValue: value => String(value),
    ...options,
  });
  return {
    labels: Array.from(html.matchAll(/composition-pie__label">([^<]+)</g), match => match[1]),
    html,
  };
}

test("groups the smallest components once their combined share reaches 10%", () => {
  const { labels, html } = renderLabels([
    ["A", 50],
    ["B", 25],
    ["C", 15],
    ["D", 7],
    ["E", 3],
  ]);

  assert.deepEqual(labels, ["A", "B", "C", "Other"]);
  assert.match(html, /composition-pie__value">10 units</);
  assert.match(html, /fill="#B8B8B8"/);
});

test("keeps all larger components visible when the smallest component crosses 10%", () => {
  const { labels, html } = renderLabels([
    ["A", 50],
    ["B", 32],
    ["C", 12],
    ["D", 6],
  ]);

  assert.deepEqual(labels, ["A", "B", "Other"]);
  assert.match(html, /composition-pie__value">18 units</);
});

test("does not rename the only component as Other", () => {
  const { labels } = renderLabels([["A", 100]]);
  assert.deepEqual(labels, ["A"]);
});

test("renders a raised pie with its total and unit label", () => {
  const { html } = renderLabels([["A", 100]]);

  assert.match(html, /viewBox="0 0 200 208"/);
  assert.match(html, /composition-pie__depth" aria-hidden="true">\s*<g class="composition-pie__depth-slice" data-slice-index="0" transform="translate\(0 8\)">/);
  assert.match(html, /composition-pie__depth-shape" cx="100" cy="100" r="94"/);
  assert.doesNotMatch(html, /composition-pie__center/);
  assert.match(html, /composition-pie__total" x="100" y="97"/);
  assert.match(html, /composition-pie__total-label" x="100" y="108"/);
});

test("adds a darkened extrusion beneath every pie slice", () => {
  const { html } = renderLabels([["A", 75], ["B", 25]]);
  const depthSlices = Array.from(html.matchAll(/composition-pie__depth-shape/g));
  const topSlices = Array.from(html.matchAll(/class="composition-pie__shape"/g));
  const depthLayerIndex = html.indexOf('class="composition-pie__depth"');
  const topLayerIndex = html.indexOf('class="composition-pie__slice"');

  assert.equal(depthSlices.length, 2);
  assert.equal(topSlices.length, 2);
  assert.match(html, /composition-pie__depth-shape" d="M /);
  assert.match(html, /composition-pie__depth-slice" data-slice-index="0" transform="translate\(0 8\)">\s*<g class="composition-pie__depth-lift" style="--slice-x: /);
  assert.match(html, /composition-pie__slice" data-slice-index="0"/);
  assert.ok(depthLayerIndex < topLayerIndex);
  assert.equal((html.match(/class="composition-pie__depth"/g) || []).length, 1);
});

test("numbers each slice and its matching legend entry in the same order", () => {
  const { html } = renderLabels([["A", 60], ["B", 25], ["C", 15]]);
  const sliceNumbers = Array.from(html.matchAll(/class="composition-pie__slice-number"[^>]*>(\d+)</g), match => match[1]);
  const legendNumbers = Array.from(html.matchAll(/class="composition-pie__number"[^>]*>(\d+)</g), match => match[1]);

  assert.deepEqual(sliceNumbers, ["1", "2", "3"]);
  assert.deepEqual(legendNumbers, sliceNumbers);
  assert.match(html, /composition-pie__slice-number-bg" cx="[^"]+" cy="[^"]+" r="4"/);
});

test("puts the service total in the heading instead of the pie center", () => {
  const { html } = renderLabels([["A", 125], ["B", 75]], {
    title: "Clinical services by count",
    unitLabel: "services",
    formatValue: value => value.toLocaleString("en-US"),
    totalInHeading: true,
  });

  assert.match(html, /composition-pie__heading-total">200 services/);
  assert.doesNotMatch(html, /<text class="composition-pie__total"/);
  assert.doesNotMatch(html, /<text class="composition-pie__total-label"/);
});

test("puts the volunteer hours total in the heading instead of the pie center", () => {
  const { html } = renderLabels([["A", 12.5], ["B", 7.5]], {
    title: "Volunteer hours by role",
    unitLabel: "hours",
    formatValue: value => value.toFixed(1),
    totalInHeading: true,
  });

  assert.match(html, /composition-pie__heading-total">20\.0 hours/);
  assert.doesNotMatch(html, /<text class="composition-pie__total"/);
  assert.doesNotMatch(html, /<text class="composition-pie__total-label"/);
});

test("shows service counts alongside percentages in the legend", () => {
  const { html } = renderLabels([["A", 75], ["B", 25]], {
    unitLabel: "services",
    items: [
      { label: "A", value: 75, valueLabel: "75 services" },
      { label: "B", value: 25, valueLabel: "25 services" },
    ],
  });

  assert.match(html, /composition-pie__value">75 services/);
  assert.match(html, /composition-pie__share">75\.0%/);
  assert.match(html, /composition-pie__value">25 services/);
  assert.match(html, /composition-pie__share">25\.0%/);
});

test("shows percentages in report legend when raw metrics are hidden", () => {
  const { html } = renderLabels([["A", 75], ["B", 25]], { hideLegendValues: true });

  assert.match(html, /composition-pie__share">75\.0%/);
  assert.match(html, /composition-pie__share">25\.0%/);
  assert.doesNotMatch(html, /composition-pie__value/);
  assert.match(html, /composition-pie__item--percentage-only/);
});

test("assigns distinct matching colors to 50 chart slices and legend items", () => {
  const values = Array.from({ length: 55 }, (_, index) => [`Component ${index + 1}`, 1]);
  const { html } = renderLabels(values);
  const sliceColors = Array.from(html.matchAll(/class="composition-pie__shape"[^>]*fill="([^"]+)"/g), match => match[1]);
  const legendColors = Array.from(html.matchAll(/--pie-color: ([^"]+)/g), match => match[1]);

  assert.equal(sliceColors.length, 50);
  assert.equal(new Set(sliceColors).size, sliceColors.length);
  assert.deepEqual(legendColors, sliceColors);
});

test("keeps the first 25 muted colors within a coordinated teal-green range", () => {
  const { html } = renderLabels(Array.from({ length: 28 }, (_, index) => [`Component ${index + 1}`, 1]));
  const sliceColors = Array.from(html.matchAll(/class="composition-pie__shape"[^>]*fill="([^"]+)"/g), match => match[1]);
  const nonOtherColors = sliceColors.filter(color => color !== "#B8B8B8");
  const hues = nonOtherColors.map(color => Number(color.match(/hsl\(([\d.]+)/)[1]));
  const lightnesses = nonOtherColors.map(color => Number(color.match(/,\s*\d+%,\s*(\d+)%\)/)[1]));

  assert.equal(nonOtherColors.length, 25);
  assert.equal(new Set(nonOtherColors).size, 25);
  assert.ok(hues.every(hue => hue >= 158 && hue <= 188));
  assert.ok(new Set(lightnesses).size >= 5);
});

test("does not use gray for a single ordinary slice", () => {
  const { html } = renderLabels([["Component 1", 1]]);
  const sliceColors = Array.from(html.matchAll(/class="composition-pie__shape"[^>]*fill="([^"]+)"/g), match => match[1]);

  assert.equal(sliceColors.length, 1);
  assert.ok(!sliceColors.includes("#B8B8B8"));
});

test("keeps colors distinct when a chart has more than 50 slices", () => {
  const values = Array.from({ length: 57 }, (_, index) => [`Component ${index + 1}`, 1]);
  const { html } = renderLabels(values);
  const sliceColors = Array.from(html.matchAll(/class="composition-pie__shape"[^>]*fill="([^"]+)"/g), match => match[1]);

  assert.equal(sliceColors.length, 52);
  assert.equal(new Set(sliceColors).size, sliceColors.length);
});

test("reserves gray for the grouped Other slice", () => {
  const { html } = renderLabels([
    ["A", 50],
    ["B", 25],
    ["C", 15],
    ["D", 7],
    ["E", 3],
  ]);
  const slices = Array.from(html.matchAll(/class="composition-pie__shape"[^>]*fill="([^"]+)"/g), match => match[1]);

  assert.equal(slices.filter(color => color === "#B8B8B8").length, 1);
  assert.equal(slices.at(-1), "#B8B8B8");
});

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

test("renders a smaller center circle with reduced total and unit label", () => {
  const { html } = renderLabels([["A", 100]]);

  assert.match(html, /composition-pie__center" cx="100" cy="100" r="36"/);
  assert.match(html, /composition-pie__total" x="100" y="97"/);
  assert.match(html, /composition-pie__total-label" x="100" y="108"/);
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

test("keeps colors distinct when a chart has more than 50 slices", () => {
  const values = Array.from({ length: 57 }, (_, index) => [`Component ${index + 1}`, 1]);
  const { html } = renderLabels(values);
  const sliceColors = Array.from(html.matchAll(/class="composition-pie__shape"[^>]*fill="([^"]+)"/g), match => match[1]);

  assert.equal(sliceColors.length, 52);
  assert.equal(new Set(sliceColors).size, sliceColors.length);
});

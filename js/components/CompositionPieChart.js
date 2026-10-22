/**
 * CompositionPieChart.js — Quantity-share pie chart markup.
 *
 * Produces an inline SVG pie and a text legend for summary and print reports.
 */

"use strict";

const CompositionPieChart = (() => {
  const COLORS = [
    "#166D6A",
    "#7E2939",
    "#C65B38",
    "#397D5C",
    "#506A8A",
    "#A8792E",
    "#765A8E",
    "#4F7F84",
    "#A24F5B",
    "#75864A",
  ];

  function render({ id, title, description, items }) {
    const chartItems = items.filter(item =>
      Number.isFinite(item.value) && item.value > 0
    );
    const total = chartItems.reduce((sum, item) => sum + item.value, 0);
    if (chartItems.length === 0 || total <= 0) return "";

    let angle = -90;
    const slices = chartItems.map((item, index) => {
      const startAngle = angle;
      const endAngle = startAngle + item.value / total * 360;
      angle = endAngle;

      const path = chartItems.length === 1
        ? `<circle cx="100" cy="100" r="88" fill="${COLORS[index % COLORS.length]}" />`
        : `<path d="${_slicePath(startAngle, endAngle)}" fill="${COLORS[index % COLORS.length]}" />`;
      return { item, index, percentage: item.value / total * 100, path };
    });
    const safeId = _escape(id);

    return `
      <section class="summary-section composition-pie" aria-labelledby="${safeId}-heading">
        <h2 class="summary-section__heading" id="${safeId}-heading">${_escape(title)}</h2>
        <p class="summary-section__intro">${_escape(description)}</p>
        <div class="composition-pie__content">
          <svg class="composition-pie__chart" viewBox="0 0 200 200" role="img"
            aria-labelledby="${safeId}-svg-title ${safeId}-svg-desc">
            <title id="${safeId}-svg-title">${_escape(title)}</title>
            <desc id="${safeId}-svg-desc">${_escape(description)} Total: ${_escape(_formatTotal(chartItems))}.</desc>
            ${slices.map(slice => slice.path).join("")}
          </svg>
          <ul class="composition-pie__legend">
            ${slices.map(slice => `
              <li class="composition-pie__item">
                <span class="composition-pie__swatch" style="--pie-color: ${COLORS[slice.index % COLORS.length]}" aria-hidden="true"></span>
                <span class="composition-pie__label">${_escape(slice.item.label)}</span>
                <span class="composition-pie__value">${_escape(slice.item.valueLabel)}</span>
                <strong class="composition-pie__share">${slice.percentage.toFixed(1)}%</strong>
              </li>
            `).join("")}
          </ul>
        </div>
      </section>
    `;
  }

  function _slicePath(startAngle, endAngle) {
    const start = _point(startAngle);
    const end = _point(endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M 100 100 L ${start.x} ${start.y} A 88 88 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  }

  function _point(angle) {
    const radians = angle * Math.PI / 180;
    return {
      x: (100 + 88 * Math.cos(radians)).toFixed(3),
      y: (100 + 88 * Math.sin(radians)).toFixed(3),
    };
  }

  function _formatTotal(items) {
    return items.reduce((sum, item) => sum + item.value, 0).toLocaleString("en-US");
  }

  function _escape(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  return { render };
})();

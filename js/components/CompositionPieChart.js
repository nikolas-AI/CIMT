/**
 * CompositionPieChart.js — Quantity-share pie chart markup.
 *
 * Produces an inline SVG pie and a text legend for summary and print reports.
 */

"use strict";

const CompositionPieChart = (() => {
  const COLORS = [
    "#087F8C",
    "#B23A48",
    "#E07A2D",
    "#3A7D44",
    "#5A55A3",
    "#C18A00",
    "#A33C82",
    "#52616B",
  ];

  function render({ id, title, description, items, otherLabel, unitLabel, formatValue }) {
    const chartItems = _groupItems(items, otherLabel, unitLabel, formatValue);
    const total = chartItems.reduce((sum, item) => sum + item.value, 0);
    if (chartItems.length === 0 || total <= 0) return "";

    let angle = -90;
    const slices = chartItems.map((item, index) => {
      const startAngle = angle;
      const endAngle = startAngle + item.value / total * 360;
      angle = endAngle;

      const path = chartItems.length === 1
        ? `<circle class="composition-pie__slice" cx="100" cy="100" r="88" fill="${COLORS[index % COLORS.length]}" />`
        : `<path class="composition-pie__slice" d="${_slicePath(startAngle, endAngle)}" fill="${COLORS[index % COLORS.length]}" />`;
      return { item, index, percentage: item.value / total * 100, path };
    });
    const safeId = _escape(id);
    const totalText = formatValue(total);

    return `
      <section class="summary-section composition-pie" aria-labelledby="${safeId}-heading">
        <h2 class="summary-section__heading" id="${safeId}-heading">${_escape(title)}</h2>
        <p class="summary-section__intro">${_escape(description)}</p>
        <div class="composition-pie__content">
          <svg class="composition-pie__chart" viewBox="0 0 200 200" role="img"
            aria-labelledby="${safeId}-svg-title ${safeId}-svg-desc">
            <title id="${safeId}-svg-title">${_escape(title)}</title>
            <desc id="${safeId}-svg-desc">${_escape(description)} Total: ${_escape(totalText)} ${_escape(unitLabel)}.</desc>
            ${slices.map(slice => slice.path).join("")}
            <circle class="composition-pie__center" cx="100" cy="100" r="51" />
            <text class="composition-pie__total" x="100" y="98" text-anchor="middle">${_escape(totalText)}</text>
            <text class="composition-pie__total-label" x="100" y="117" text-anchor="middle">total ${_escape(unitLabel)}</text>
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

  function _groupItems(items, otherLabel, unitLabel, formatValue) {
    const rankedItems = items
      .filter(item => Number.isFinite(item.value) && item.value > 0)
      .slice()
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
    const total = rankedItems.reduce((sum, item) => sum + item.value, 0);
    const smallItems = rankedItems.filter(item => item.value / total * 100 < 3);
    const groupSmallItems = smallItems.length >= 2;
    const namedItems = groupSmallItems
      ? rankedItems.filter(item => item.value / total * 100 >= 3)
      : rankedItems;
    const visibleItems = namedItems.slice(0, 7);
    const groupedItems = [
      ...(groupSmallItems ? smallItems : []),
      ...namedItems.slice(7),
    ];

    if (groupedItems.length === 0) return visibleItems;

    const otherValue = groupedItems.reduce((sum, item) => sum + item.value, 0);
    return [
      ...visibleItems,
      {
        label: otherLabel,
        value: otherValue,
        valueLabel: `${formatValue(otherValue)} ${unitLabel}`,
      },
    ];
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

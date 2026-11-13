/**
 * CompositionPieChart.js — Quantity-share pie chart markup.
 *
 * Produces an inline SVG pie and a text legend for summary and print reports.
 */

"use strict";

const CompositionPieChart = (() => {
  const OTHER_COLOR = "#B8B8B8";

  function render({ id, title, description, items, otherLabel, unitLabel, formatValue, hideLegendValues = false, totalInHeading = false, reportStyle = false }) {
    const chartItems = _groupItems(items, otherLabel, unitLabel, formatValue);
    const total = chartItems.reduce((sum, item) => sum + item.value, 0);
    if (chartItems.length === 0 || total <= 0) return "";
    let colorIndex = 0;
    const colorByItem = new Map(chartItems.map(item => [
      item,
      item.isOther ? OTHER_COLOR : _color(colorIndex++),
    ]));

    const reportLabels = reportStyle ? _reportLabelPositions(chartItems, total) : [];
    const labelExtent = Math.max(106, ...reportLabels.map(label => Math.abs(label.y - 100) + 12));
    let angle = -90;
    const slices = chartItems.map((item, index) => {
      const startAngle = angle;
      const endAngle = startAngle + item.value / total * 360;
      angle = endAngle;
      const midpoint = (startAngle + endAngle) / 2 * Math.PI / 180;
      const offsetX = (Math.cos(midpoint) * 5).toFixed(2);
      const offsetY = (Math.sin(midpoint) * 5).toFixed(2);
      const labelAngle = chartItems.length === 1 ? -Math.PI / 2 : midpoint;
      const lowerHalfOffset = Math.sin(labelAngle) > 0 ? 4 : 0;
      const lineStartX = (100 + 94 * Math.cos(labelAngle)).toFixed(2);
      const lineStartY = (100 + 94 * Math.sin(labelAngle) + lowerHalfOffset).toFixed(2);
      const labelX = (100 + 106 * Math.cos(labelAngle)).toFixed(2);
      const labelY = (100 + 106 * Math.sin(labelAngle) + lowerHalfOffset).toFixed(2);
      // Alternate radii for narrow print slices so percentages stay inside
      // their slices without sitting directly beside another small label.
      const percentageRadius = reportStyle && item.value / total < .04 ? (index % 2 ? 68 : 84) : 78;
      const percentageX = (reportStyle && chartItems.length === 1 ? 100 : 100 + percentageRadius * Math.cos(midpoint)).toFixed(2);
      const percentageY = (reportStyle && chartItems.length === 1 ? 100 : 100 + percentageRadius * Math.sin(midpoint)).toFixed(2);
      const percentage = item.value / total * 100;
      const tooltip = `${item.label}: ${item.valueLabel} (${(item.value / total * 100).toFixed(1)}%)`;
      const color = colorByItem.get(item);

      const shape = chartItems.length === 1
        ? `<circle class="composition-pie__shape" cx="100" cy="100" r="94" fill="${color}" />`
        : `<path class="composition-pie__shape" d="${_slicePath(startAngle, endAngle)}" fill="${color}" />`;
      const depthShape = shape.replace("composition-pie__shape", "composition-pie__depth-shape");
      const depthSeparators = chartItems.length > 1
        ? [startAngle, endAngle]
          .filter(boundaryAngle => Math.sin(boundaryAngle * Math.PI / 180) >= -1e-9)
          .map(boundaryAngle => {
            const radians = boundaryAngle * Math.PI / 180;
            const x = (100 + 94 * Math.cos(radians)).toFixed(3);
            const y = (100 + 94 * Math.sin(radians)).toFixed(3);
            return `<line class="composition-pie__depth-separator" x1="${x}" y1="${(Number(y) - 8).toFixed(3)}" x2="${x}" y2="${y}" />`;
          })
          .join("")
        : "";
      const depthPath = `
        <g class="composition-pie__depth-slice" data-slice-index="${index}" transform="translate(0 8)">
          <g class="composition-pie__depth-lift" style="--slice-x: ${offsetX}px; --slice-y: ${offsetY}px">${depthShape}${depthSeparators}</g>
        </g>
      `;
      const path = `
        <g class="composition-pie__slice" data-slice-index="${index}" tabindex="0" role="img"
          aria-label="${_escape(tooltip)}" style="--slice-x: ${offsetX}px; --slice-y: ${offsetY}px">
          ${shape}
          ${reportStyle ? `
          <polyline class="composition-pie__leader" points="${lineStartX},${lineStartY} ${reportLabels[index].right ? 204 : -4},${reportLabels[index].y} ${reportLabels[index].right ? 216 : -16},${reportLabels[index].y}" aria-hidden="true" />
          <text class="composition-pie__slice-number" x="${reportLabels[index].right ? 220 : -20}" y="${reportLabels[index].y}" text-anchor="${reportLabels[index].right ? "start" : "end"}" dominant-baseline="central" aria-hidden="true">${String(index + 1).padStart(2, "0")}</text>
          <text class="composition-pie__slice-percentage" x="${percentageX}" y="${percentageY}" text-anchor="middle" dominant-baseline="central" aria-hidden="true">${percentage.toFixed(1)}%</text>
          ` : `
          <text class="composition-pie__slice-percentage" x="${percentageX}" y="${percentageY}" text-anchor="middle" dominant-baseline="central" aria-hidden="true">${percentage.toFixed(1)}%</text>
          <line class="composition-pie__leader" x1="${lineStartX}" y1="${lineStartY}" x2="${labelX}" y2="${labelY}" aria-hidden="true" />
          <circle class="composition-pie__slice-number-bg" cx="${labelX}" cy="${labelY}" r="5" aria-hidden="true" />
          <text class="composition-pie__slice-number" x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="central" aria-hidden="true">${index + 1}</text>
          `}
        </g>
      `;
      return { item, index, color, percentage, depthPath, path };
    });
    const safeId = _escape(id);
    const totalText = formatValue(total);

    return `
      <section class="summary-section composition-pie" aria-labelledby="${safeId}-heading">
        <h2 class="summary-section__heading" id="${safeId}-heading">${_escape(title)}${totalInHeading ? `<span class="composition-pie__heading-total">${_escape(totalText)} ${_escape(unitLabel)}</span>` : ""}</h2>
        <p class="summary-section__intro">${_escape(description)}</p>
        <div class="composition-pie__content">
          <svg class="composition-pie__chart" viewBox="${reportStyle ? `0 ${100 - labelExtent} 200 ${labelExtent * 2}` : "-16 -16 232 240"}" role="group"
            aria-label="${_escape(title)}" aria-describedby="${safeId}-svg-desc">
            <desc id="${safeId}-svg-desc">${_escape(description)} Total: ${_escape(totalText)} ${_escape(unitLabel)}.</desc>
            <g class="composition-pie__depth" aria-hidden="true">${slices.map(slice => slice.depthPath).join("")}</g>
            ${slices.map(slice => slice.path).join("")}
            ${totalInHeading ? "" : `
              <text class="composition-pie__total" x="100" y="97" text-anchor="middle">${_escape(totalText)}</text>
              <text class="composition-pie__total-label" x="100" y="108" text-anchor="middle">total ${_escape(unitLabel)}</text>
            `}
          </svg>
          <ul class="composition-pie__legend">
            ${slices.map(slice => `
              <li class="composition-pie__item${hideLegendValues ? " composition-pie__item--percentage-only" : ""}">
                <span class="composition-pie__number" aria-hidden="true">${reportStyle ? String(slice.index + 1).padStart(2, "0") : slice.index + 1}</span>
                <span class="composition-pie__swatch" style="--pie-color: ${slice.color}" aria-hidden="true"></span>
                <span class="composition-pie__details">
                  <span class="composition-pie__label">${_escape(slice.item.label)}</span>
                  ${hideLegendValues ? "" : `<span class="composition-pie__value">${_escape(slice.item.valueLabel)}</span>`}
                  <strong class="composition-pie__share">${slice.percentage.toFixed(1)}%</strong>
                </span>
              </li>
            `).join("")}
          </ul>
        </div>
      </section>
    `;
  }

  // Keep connected print indices separated and in the same order as the legend.
  function _reportLabelPositions(items, total) {
    let angle = -Math.PI / 2;
    const labels = items.map(item => {
      const arc = item.value / total * 2 * Math.PI;
      const midpoint = items.length === 1 ? -Math.PI / 2 : angle + arc / 2;
      angle += arc;
      return { right: Math.cos(midpoint) >= 0, y: 100 + 94 * Math.sin(midpoint) };
    });
    for (const right of [false, true]) {
      const side = labels.filter(label => label.right === right).sort((a, b) => a.y - b.y);
      const halfHeight = Math.max(94, (side.length - 1) * 6);
      const top = 100 - halfHeight;
      const bottom = 100 + halfHeight;
      side.forEach((label, index) => {
        label.y = Math.max(top, label.y, index ? side[index - 1].y + 12 : top);
      });
      for (let index = side.length - 1; index >= 0; index -= 1) {
        side[index].y = Math.min(side[index].y, index === side.length - 1 ? bottom : side[index + 1].y - 12);
      }
      side.forEach(label => { label.y = Number(label.y.toFixed(2)); });
    }
    return labels;
  }

  function bind(section) {
    const content = section.querySelector(".composition-pie__content");
    const slices = section.querySelectorAll(".composition-pie__slice");
    if (!content || slices.length === 0) return;
    const depthSlices = new Map(
      Array.from(content.querySelectorAll(".composition-pie__depth-slice"), depthSlice => [
        depthSlice.getAttribute("data-slice-index"),
        depthSlice.querySelector(".composition-pie__depth-lift"),
      ])
    );

    const tooltip = document.createElement("div");
    tooltip.className = "composition-pie__tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.hidden = true;
    content.append(tooltip);

    function showTooltip(slice, clientX, clientY) {
      tooltip.textContent = slice.getAttribute("aria-label");
      tooltip.hidden = false;

      const contentRect = content.getBoundingClientRect();
      const left = clientX - contentRect.left + 12;
      const top = clientY - contentRect.top + 12;
      tooltip.style.left = `${Math.min(left, Math.max(0, content.clientWidth - tooltip.offsetWidth - 8))}px`;
      tooltip.style.top = `${Math.min(top, Math.max(0, content.clientHeight - tooltip.offsetHeight - 8))}px`;
    }

    slices.forEach(slice => {
      const depthLift = depthSlices.get(slice.getAttribute("data-slice-index"));
      const setRaised = raised => depthLift?.classList.toggle("is-raised", raised);

      slice.addEventListener("pointerenter", event => {
        setRaised(true);
        showTooltip(slice, event.clientX, event.clientY);
      });
      slice.addEventListener("pointermove", event => {
        showTooltip(slice, event.clientX, event.clientY);
      });
      slice.addEventListener("pointerleave", () => {
        setRaised(false);
        tooltip.hidden = true;
      });
      slice.addEventListener("focus", () => {
        setRaised(true);
        const bounds = slice.getBoundingClientRect();
        showTooltip(slice, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
      });
      slice.addEventListener("blur", () => {
        setRaised(false);
        tooltip.hidden = true;
      });
    });
  }

  function _groupItems(items, otherLabel, unitLabel, formatValue) {
    const rankedItems = items
      .filter(item => Number.isFinite(item.value) && item.value > 0)
      .slice()
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
    const total = rankedItems.reduce((sum, item) => sum + item.value, 0);
    const groupedItems = [];
    let groupedValue = 0;
    let firstGroupedIndex = rankedItems.length;

    while (firstGroupedIndex > 1 && groupedValue < total * 0.1) {
      const item = rankedItems[--firstGroupedIndex];
      groupedItems.unshift(item);
      groupedValue += item.value;
    }

    if (groupedItems.length === 0) return rankedItems;

    const otherValue = groupedValue;
    return [
      ...rankedItems.slice(0, firstGroupedIndex),
      {
        label: otherLabel,
        value: otherValue,
        valueLabel: `${formatValue(otherValue)} ${unitLabel}`,
        isOther: true,
      },
    ];
  }

  function _color(index) {
    const hue = 158 + (index * 17) % 31;
    const paletteBand = Math.floor(index / 31);
    const saturation = 44 + (paletteBand % 3) * 4;
    const lightness = [62, 72, 82, 67, 77][index % 5];
    return `hsl(${hue.toFixed(1)}, ${saturation}%, ${lightness}%)`;
  }

  function _slicePath(startAngle, endAngle) {
    const start = _point(startAngle);
    const end = _point(endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M 100 100 L ${start.x} ${start.y} A 94 94 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  }

  function _point(angle) {
    const radians = angle * Math.PI / 180;
    return {
      x: (100 + 94 * Math.cos(radians)).toFixed(3),
      y: (100 + 94 * Math.sin(radians)).toFixed(3),
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

  return { render, bind };
})();

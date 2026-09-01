import {
  koreaTfr, koreaFemaleLfp, koreaFemaleTertiary, koreaMenUnpaid,
  koreaFatherLeave, koreaCorrelations, oecd, regression
} from "./data.js";

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */

const NS = "http://www.w3.org/2000/svg";

function el(name, attrs = {}, parent = null) {
  const node = document.createElementNS(NS, name);
  for (const key in attrs) {
    if (attrs[key] !== null && attrs[key] !== undefined) {
      node.setAttribute(key, attrs[key]);
    }
  }
  if (parent) parent.appendChild(node);
  return node;
}

// minWidth stops a wide chart from shrinking its labels into illegibility on a
// phone; the .chart wrapper scrolls horizontally instead.
function svgRoot(mount, width, height, minWidth = 0) {
  mount.innerHTML = "";
  const svg = el("svg", {
    viewBox: `0 0 ${width} ${height}`,
    width, height,
    role: "img",
    preserveAspectRatio: "xMidYMid meet"
  }, mount);
  svg.style.maxWidth = "100%";
  svg.style.height = "auto";
  if (minWidth) svg.style.minWidth = `${minWidth}px`;
  return svg;
}

const css = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function scale(d0, d1, r0, r1) {
  const span = d1 - d0 || 1;
  return (v) => r0 + ((v - d0) / span) * (r1 - r0);
}

function niceTicks(min, max, count) {
  const raw = (max - min) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  const out = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) {
    out.push(Math.round(v / step) * step);
  }
  return out;
}

function fitLine(points) {
  const n = points.length;
  const mx = points.reduce((s, p) => s + p[0], 0) / n;
  const my = points.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const [x, y] of points) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  return { slope: sxy / sxx, intercept: my - (sxy / sxx) * mx, r: sxy / Math.sqrt(sxx * syy) };
}

/* ------------------------------------------------------------------ *
 * tooltip
 * ------------------------------------------------------------------ */

const tip = document.getElementById("tip");

function showTip(event, html) {
  tip.innerHTML = html;
  tip.style.opacity = "1";
  const box = tip.getBoundingClientRect();
  let x = event.clientX + 14;
  let y = event.clientY - box.height - 12;
  if (x + box.width > window.innerWidth - 8) x = event.clientX - box.width - 14;
  if (y < 8) y = event.clientY + 18;
  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
}

function hideTip() { tip.style.opacity = "0"; }

function hoverable(node, html) {
  node.addEventListener("pointerenter", (e) => showTip(e, html));
  node.addEventListener("pointermove", (e) => showTip(e, html));
  node.addEventListener("pointerleave", hideTip);
}

/* ------------------------------------------------------------------ *
 * 1. Small multiples: Korea, five series
 * ------------------------------------------------------------------ */

function sparkline(mount, series, { unit, decimals = 0, accent = false }) {
  const W = 210, H = 62, pad = 5;
  const svg = svgRoot(mount, W, H);
  const years = series.map((d) => d[0]);
  const values = series.map((d) => d[1]);
  const lo = Math.min(...values), hi = Math.max(...values);
  const x = scale(Math.min(...years), Math.max(...years), pad, W - pad);
  const y = scale(lo, hi, H - pad - 1, pad + 1);

  const color = accent ? css("--accent") : css("--series");
  const path = series.map((d, i) => `${i ? "L" : "M"}${x(d[0]).toFixed(1)},${y(d[1]).toFixed(1)}`).join("");

  el("path", { d: path, fill: "none", stroke: color, "stroke-width": 2,
               "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);

  const last = series[series.length - 1];
  el("circle", { cx: x(last[0]), cy: y(last[1]), r: 3.5, fill: color,
                 stroke: css("--surface"), "stroke-width": 2 }, svg);

  // invisible hit strips, one per observation
  const step = (W - 2 * pad) / Math.max(series.length - 1, 1);
  series.forEach((d) => {
    const hit = el("rect", {
      x: x(d[0]) - step / 2, y: 0, width: step, height: H, fill: "transparent"
    }, svg);
    hoverable(hit, `<b>${d[1].toFixed(decimals)}${unit}</b> <span class="t-sub">· ${d[0]}</span>`);
  });
  return svg;
}

export function drawKoreaSparks(mount) {
  const panels = [
    { label: "Total fertility rate", series: koreaTfr, unit: "", decimals: 2, accent: true },
    { label: "Women in the labor force", series: koreaFemaleLfp, unit: "%", decimals: 1 },
    { label: "Women's tertiary enrollment", series: koreaFemaleTertiary, unit: "%", decimals: 1 },
    { label: "Men's share of unpaid work", series: koreaMenUnpaid, unit: "%", decimals: 1 },
    { label: "Fathers' share of leave takers", series: koreaFatherLeave, unit: "%", decimals: 1 }
  ];

  mount.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "sparks";
  mount.appendChild(grid);

  for (const panel of panels) {
    const cell = document.createElement("div");
    const label = document.createElement("div");
    label.className = "spark-label";
    label.textContent = panel.label;
    cell.appendChild(label);

    const chart = document.createElement("div");
    cell.appendChild(chart);

    const first = panel.series[0], last = panel.series[panel.series.length - 1];
    const delta = document.createElement("div");
    delta.className = "spark-delta";
    delta.innerHTML =
      `${first[1].toFixed(panel.decimals)}${panel.unit} <span aria-hidden="true">→</span> ` +
      `<b>${last[1].toFixed(panel.decimals)}${panel.unit}</b> ` +
      `<span style="opacity:.75">(${first[0]} to ${last[0]})</span>`;
    cell.appendChild(delta);

    grid.appendChild(cell);
    sparkline(chart, panel.series, panel);
    chart.querySelector("svg").setAttribute("aria-label",
      `${panel.label}, ${first[0]} to ${last[0]}: ${first[1]} to ${last[1]}${panel.unit}`);
  }
}

/* ------------------------------------------------------------------ *
 * 2. Dumbbell: correlation in levels against correlation in changes
 * ------------------------------------------------------------------ */

export function drawDumbbell(mount) {
  const W = 900, rowH = 54, padT = 34, padB = 34;
  const labelW = 250, padR = 40;
  const rows = koreaCorrelations;
  const H = padT + rows.length * rowH + padB;
  const svg = svgRoot(mount, W, H, 660);
  const x = scale(-1, 1, labelW, W - padR);

  // axis
  for (const t of [-1, -0.5, 0, 0.5, 1]) {
    el("line", { x1: x(t), y1: padT - 12, x2: x(t), y2: H - padB + 4,
                 stroke: t === 0 ? css("--axis") : css("--grid"), "stroke-width": 1 }, svg);
    el("text", { x: x(t), y: H - padB + 20, "text-anchor": "middle",
                 "font-size": 11, fill: css("--ink-muted") }, svg).textContent =
      t === 0 ? "0" : (t > 0 ? "+" : "\u2212") + Math.abs(t);
  }
  el("text", { x: x(0), y: padT - 20, "text-anchor": "middle", "font-size": 11,
               fill: css("--ink-muted") }, svg).textContent = "no relationship";

  rows.forEach((row, i) => {
    const cy = padT + i * rowH + rowH / 2;

    el("text", { x: labelW - 16, y: cy + 4, "text-anchor": "end", "font-size": 13,
                 fill: css("--ink") }, svg).textContent = row.label;

    el("line", { x1: x(row.levels), y1: cy, x2: x(row.changes), y2: cy,
                 stroke: css("--grid"), "stroke-width": 2, "stroke-linecap": "round" }, svg);

    const levelDot = el("circle", { cx: x(row.levels), cy, r: 5.5, fill: css("--accent"),
                                    stroke: css("--surface"), "stroke-width": 2 }, svg);
    hoverable(levelDot,
      `<b>r = ${row.levels.toFixed(3)}</b> in levels<br><span class="t-sub">${row.label} · ${row.nLevels} years</span>`);

    const changeDot = el("circle", { cx: x(row.changes), cy, r: 5.5, fill: css("--series"),
                                     stroke: css("--surface"), "stroke-width": 2 }, svg);
    hoverable(changeDot,
      `<b>r = ${row.changes.toFixed(3)}</b> in changes<br><span class="t-sub">${row.label} · ${row.nChanges} changes</span>`);

    // values sit above their own dot, so they never collide with the row label
    for (const [value, tone] of [[row.levels, "--ink-2"], [row.changes, "--ink-muted"]]) {
      el("text", {
        x: x(value), y: cy - 13, "text-anchor": "middle", "font-size": 11.5,
        fill: css(tone), "font-variant-numeric": "tabular-nums"
      }, svg).textContent = (value > 0 ? "+" : "\u2212") + Math.abs(value).toFixed(2);
    }
  });

  svg.setAttribute("aria-label",
    "Correlations with fertility near plus or minus 1 in levels collapse to near zero once the shared trend is removed.");
}

/* ------------------------------------------------------------------ *
 * 3. Scatter: one variable against fertility, 30 OECD countries
 * ------------------------------------------------------------------ */

const LABELLED = {
  mismatch: ["KOR", "JPN", "PRT", "NZL", "FIN", "DEU", "MEX"],
  nonmarital: ["KOR", "JPN", "TUR", "GRC", "FRA", "MEX", "POL"]
};

function scatter(mount, key, { xLabel, xTicks, note }) {
  const W = 900, H = 470;
  const padL = 54, padR = 26, padT = 40, padB = 52;

  function render(excludeKorea) {
    const svg = svgRoot(mount, W, H, 660);
    const shown = oecd;
    const used = excludeKorea ? oecd.filter((d) => d.code !== "KOR") : oecd;

    const xs = shown.map((d) => d[key]);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const xPad = (xMax - xMin) * 0.07;
    const x = scale(xMin - xPad, xMax + xPad, padL, W - padR);
    const y = scale(0.65, 2.0, H - padB, padT);

    // grid
    for (const t of [0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0]) {
      el("line", { x1: padL, y1: y(t), x2: W - padR, y2: y(t),
                   stroke: css("--grid"), "stroke-width": 1 }, svg);
      el("text", { x: padL - 12, y: y(t) + 4, "text-anchor": "end", "font-size": 11,
                   fill: css("--ink-muted"), "font-variant-numeric": "tabular-nums" },
         svg).textContent = t.toFixed(1);
    }
    el("text", { x: padL - 12, y: padT - 16, "text-anchor": "end", "font-size": 11,
                 fill: css("--ink-muted") }, svg).textContent = "TFR";

    for (const t of xTicks) {
      el("text", { x: x(t), y: H - padB + 22, "text-anchor": "middle", "font-size": 11,
                   fill: css("--ink-muted"), "font-variant-numeric": "tabular-nums" },
         svg).textContent = t;
    }
    el("line", { x1: padL, y1: H - padB, x2: W - padR, y2: H - padB,
                 stroke: css("--axis"), "stroke-width": 1 }, svg);
    el("text", { x: (padL + W - padR) / 2, y: H - 10, "text-anchor": "middle",
                 "font-size": 12, fill: css("--ink-2") }, svg).textContent = xLabel;

    // fit line over the countries actually used
    const fit = fitLine(used.map((d) => [d[key], d.tfr]));
    const x0 = xMin - xPad, x1 = xMax + xPad;
    el("line", {
      x1: x(x0), y1: y(fit.intercept + fit.slope * x0),
      x2: x(x1), y2: y(fit.intercept + fit.slope * x1),
      stroke: css("--ink-muted"), "stroke-width": 2, "stroke-dasharray": "5 5",
      "stroke-linecap": "round", opacity: 0.85
    }, svg);

    // points
    for (const d of shown) {
      const isKorea = d.code === "KOR";
      const dimmed = excludeKorea && isKorea;
      const dot = el("circle", {
        cx: x(d[key]), cy: y(d.tfr), r: isKorea ? 6.5 : 5,
        fill: isKorea ? css("--accent") : css("--series"),
        stroke: css("--surface"), "stroke-width": 2,
        opacity: dimmed ? 0.28 : 1
      }, svg);
      hoverable(dot,
        `<b>${d.name}</b><br><span class="t-sub">TFR ${d.tfr.toFixed(2)} · ` +
        `mismatch ${d.mismatch} · ${d.nonmarital}% of births outside marriage</span>`);

      if (LABELLED[key].includes(d.code)) {
        el("text", {
          x: x(d[key]) + (isKorea ? 11 : 9), y: y(d.tfr) + 4, "font-size": 11,
          fill: isKorea ? css("--accent") : css("--ink-muted"),
          "font-weight": isKorea ? 600 : 400, opacity: dimmed ? 0.35 : 1
        }, svg).textContent = d.name;
      }
    }

    svg.setAttribute("aria-label",
      `${xLabel} against total fertility rate, ${used.length} OECD countries, r = ${fit.r.toFixed(2)}.`);
    return fit.r;
  }

  return render;
}

export function drawMismatchScatter(mount, readout, toggle) {
  const render = scatter(mount, "mismatch", {
    xLabel: "Mismatch  (equality at school and work, minus equality at home)",
    xTicks: [20, 30, 40, 50]
  });
  let excluded = false;
  function paint() {
    const r = render(excluded);
    readout.textContent = `r = ${r.toFixed(2)}`;
    toggle.setAttribute("aria-pressed", String(excluded));
    toggle.textContent = excluded ? "Add Korea back" : "Drop Korea";
  }
  toggle.addEventListener("click", () => { excluded = !excluded; paint(); });
  paint();
  return paint;
}

export function drawMarriageScatter(mount, readout) {
  const render = scatter(mount, "nonmarital", {
    xLabel: "Births outside marriage  (% of all births)",
    xTicks: [0, 20, 40, 60, 80]
  });
  const r = render(false);
  readout.textContent = `r = ${r.toFixed(2)}`;
  return () => { readout.textContent = `r = ${render(false).toFixed(2)}`; };
}

/* ------------------------------------------------------------------ *
 * 4. Coefficient plot: what happens to the mismatch
 * ------------------------------------------------------------------ */

export function drawForest(mount) {
  const W = 900, padL = 210, padR = 30, padT = 26, padB = 46;
  const rowH = 30, groupGap = 26;

  const items = [];
  for (const group of regression.terms) {
    items.push({ type: "head", label: group.term, note: group.note });
    for (const row of group.rows) items.push({ type: "row", group: group.term, ...row });
  }
  const H = padT + items.length * rowH + (regression.terms.length - 1) * groupGap + padB;
  const svg = svgRoot(mount, W, H, 660);

  const lo = -0.017, hi = 0.013;
  const x = scale(lo, hi, padL, W - padR);

  for (const t of niceTicks(lo, hi, 5)) {
    const isZero = Math.abs(t) < 1e-9;
    el("line", { x1: x(t), y1: padT - 10, x2: x(t), y2: H - padB + 4,
                 stroke: isZero ? css("--axis") : css("--grid"),
                 "stroke-width": 1 }, svg);
    el("text", { x: x(t), y: H - padB + 20, "text-anchor": "middle", "font-size": 11,
                 fill: css("--ink-muted"), "font-variant-numeric": "tabular-nums" },
       svg).textContent = t === 0 ? "0"
         : (t < 0 ? "\u2212" : "+") + Math.abs(t).toFixed(3).replace("0.", ".");
  }
  el("text", { x: (padL + W - padR) / 2, y: H - 8, "text-anchor": "middle",
               "font-size": 12, fill: css("--ink-2") },
     svg).textContent = "Change in births per woman, per unit of the predictor";

  let cy = padT;
  let groupIndex = 0;
  for (const item of items) {
    if (item.type === "head") {
      if (groupIndex > 0) cy += groupGap;
      groupIndex++;
      el("text", { x: 0, y: cy + 14, "font-size": 12, "font-weight": 600,
                   fill: css("--ink") }, svg).textContent = item.label;
      el("text", { x: 0, y: cy + 29, "font-size": 11, fill: css("--ink-muted") },
         svg).textContent = item.note;
      cy += rowH;
      continue;
    }

    const yMid = cy + rowH / 2;
    const crossesZero = item.lo < 0 && item.hi > 0;
    const color = crossesZero ? css("--ink-muted") : css("--series");

    el("text", { x: padL - 16, y: yMid + 4, "text-anchor": "end", "font-size": 12,
                 fill: css("--ink-2") }, svg).textContent = `Model ${item.model}`;

    el("line", { x1: x(item.lo), y1: yMid, x2: x(item.hi), y2: yMid,
                 stroke: color, "stroke-width": 2, "stroke-linecap": "round",
                 opacity: crossesZero ? 0.5 : 0.85 }, svg);

    const dot = el("circle", { cx: x(item.coef), cy: yMid, r: 5,
                               fill: color, stroke: css("--surface"), "stroke-width": 2 }, svg);
    hoverable(dot,
      `<b>${item.coef >= 0 ? "+" : ""}${item.coef.toFixed(4)}</b> ` +
      `<span class="t-sub">[${item.lo.toFixed(4)}, ${item.hi.toFixed(4)}]</span><br>` +
      `<span class="t-sub">${item.group}, model ${item.model} · p = ${item.p.toFixed(3)}</span>`);

    // hit strip for the whole row
    const strip = el("rect", { x: padL, y: cy, width: W - padR - padL, height: rowH,
                               fill: "transparent" }, svg);
    hoverable(strip,
      `<b>${item.coef >= 0 ? "+" : ""}${item.coef.toFixed(4)}</b> ` +
      `<span class="t-sub">[${item.lo.toFixed(4)}, ${item.hi.toFixed(4)}]</span><br>` +
      `<span class="t-sub">${item.group}, model ${item.model} · p = ${item.p.toFixed(3)}</span>`);

    cy += rowH;
  }

  svg.setAttribute("aria-label",
    "Coefficient estimates with 95 percent confidence intervals. The mismatch straddles zero in every model, " +
    "births outside marriage is clearly positive in every model that includes it, and the interaction is zero.");
}

/* ------------------------------------------------------------------ *
 * 5. Korea's two spheres: what "mismatch" means
 * ------------------------------------------------------------------ */

export function drawSpheres(mount) {
  const W = 760, H = 205, padL = 168, padR = 96, padT = 36;
  const svg = svgRoot(mount, W, H, 560);
  const korea = oecd.find((d) => d.code === "KOR");
  const x = scale(0, 120, padL, W - padR);
  const barH = 26;

  // equality reference
  el("line", { x1: x(100), y1: padT - 10, x2: x(100), y2: H - 54,
               stroke: css("--axis"), "stroke-width": 1, "stroke-dasharray": "4 4" }, svg);
  el("text", { x: x(100), y: padT - 16, "text-anchor": "middle", "font-size": 11,
               fill: css("--ink-muted") }, svg).textContent = "equal";

  const bars = [
    { label: "School and work", sub: "enrollment and jobs", value: korea.public, color: css("--series") },
    { label: "Home", sub: "unpaid work", value: korea.private, color: css("--accent") }
  ];

  bars.forEach((bar, i) => {
    const y = padT + i * 62;
    el("text", { x: padL - 18, y: y + 14, "text-anchor": "end", "font-size": 13,
                 "font-weight": 600, fill: css("--ink") }, svg).textContent = bar.label;
    el("text", { x: padL - 18, y: y + 30, "text-anchor": "end", "font-size": 11,
                 fill: css("--ink-muted") }, svg).textContent = bar.sub;

    el("rect", { x: padL, y, width: x(120) - padL, height: barH, rx: 4,
                 fill: css("--grid"), opacity: 0.55 }, svg);
    const rect = el("rect", { x: padL, y, width: x(bar.value) - padL, height: barH, rx: 4,
                              fill: bar.color }, svg);
    hoverable(rect, `<b>${bar.value.toFixed(1)}</b> out of 100, where 100 is equal<br>` +
                    `<span class="t-sub">Korea · ${bar.sub}</span>`);

    el("text", { x: x(bar.value) + 12, y: y + 18, "font-size": 13, fill: css("--ink"),
                 "font-weight": 600, "font-variant-numeric": "tabular-nums" },
       svg).textContent = `${Math.round(bar.value)}`;
  });

  // the gap
  const gapY = padT + 124;
  el("line", { x1: x(korea.private), y1: gapY, x2: x(korea.public), y2: gapY,
               stroke: css("--ink-2"), "stroke-width": 2, "stroke-linecap": "round" }, svg);
  el("text", { x: (x(korea.private) + x(korea.public)) / 2, y: gapY + 20,
               "text-anchor": "middle", "font-size": 12, fill: css("--ink-2") },
     svg).textContent = `mismatch = ${korea.mismatch}`;

  svg.setAttribute("aria-label",
    `Korea scores ${korea.public} out of 100 for equality in school and work but ${korea.private} at home, a gap of ${korea.mismatch}.`);
}

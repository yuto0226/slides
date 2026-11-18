<script setup>
/* The names live in a legend rather than on the marks: the lines run together near
   the baseline, where names long enough to tell them apart would collide. */
const props = defineProps({
  years: { type: Array, required: true },
  // { name, values, tone } with values in percent and tone keying the stroke.
  series: { type: Array, required: true },
})

const X0 = 56
const X1 = 800
const Y0 = 48
const Y1 = 200

const px = (i) => X0 + (i * (X1 - X0)) / (props.years.length - 1)
const py = (v) => Y1 - (v / 100) * (Y1 - Y0)
const path = (values) => values.map((v, i) => `${i ? 'L' : 'M'} ${px(i)} ${py(v)}`).join(' ')
const peakAt = (values) => values.indexOf(Math.max(...values))
const labelAnchor = (i) => (i === 0 ? 'start' : i === props.years.length - 1 ? 'end' : 'middle')

/* The legend is laid out left to right from the label widths, which at 12px sans
   run about 6.4px a character for the Latin names used here. */
const SWATCH = 18
const SWATCH_GAP = 6
const ITEM_GAP = 20
const legend = props.series.reduce((items, s) => {
  const prev = items[items.length - 1]
  const x = prev ? prev.x + prev.w + ITEM_GAP : X0
  const w = SWATCH + SWATCH_GAP + s.name.length * 6.4
  items.push({ ...s, x, w })
  return items
}, [])
</script>

<template>
  <svg viewBox="0 0 840 230" class="tech-trend">
    <g v-for="item in legend" :key="item.name" :class="`tech-trend-${item.tone}`">
      <line :x1="item.x" y1="14" :x2="item.x + SWATCH" y2="14" class="tech-trend-line" />
      <text :x="item.x + SWATCH + SWATCH_GAP" y="18" class="tech-trend-key">{{ item.name }}</text>
    </g>

    <g v-for="v in [0, 50, 100]" :key="v">
      <line :x1="X0" :y1="py(v)" :x2="X1" :y2="py(v)" class="tech-trend-grid" />
      <text :x="X0 - 10" :y="py(v) + 4" text-anchor="end" class="tech-trend-tick">{{ v }}%</text>
    </g>

    <g v-for="s in series" :key="s.name" :class="`tech-trend-${s.tone}`">
      <path :d="path(s.values)" class="tech-trend-line" />
      <circle
        :cx="px(peakAt(s.values))"
        :cy="py(s.values[peakAt(s.values)])"
        r="3"
        class="tech-trend-dot"
      />
      <text
        :x="px(peakAt(s.values))"
        :y="py(s.values[peakAt(s.values)]) - 9"
        :text-anchor="labelAnchor(peakAt(s.values))"
        class="tech-trend-peak"
      >
        {{ s.values[peakAt(s.values)].toFixed(1) }}%
      </text>
    </g>

    <text
      v-for="(y, i) in years"
      :key="y"
      :x="px(i)"
      :y="Y1 + 20"
      text-anchor="middle"
      class="tech-trend-year"
    >
      {{ y }}
    </text>
  </svg>
</template>

<style>
.tech-trend {
  width: 100%;
  height: auto;
  /* The column leaves its slack under the chart; two cells down splits it evenly
     and still lands on the grid the ruler draws. */
  margin-top: calc(2 * var(--tmpl-cell));
}

.tech-trend text {
  letter-spacing: normal;
}

.tech-trend-grid {
  stroke: var(--tmpl-rule-dim);
  stroke-width: var(--tmpl-rule-width);
}

.tech-trend-line {
  fill: none;
  stroke-width: var(--tmpl-rule-width);
  stroke-linejoin: round;
}

.tech-trend-tick,
.tech-trend-year {
  font-family: var(--slidev-code-font-family);
  font-size: 12px;
  fill: var(--tmpl-muted);
}

.tech-trend-key {
  font-size: 12px;
  font-weight: 700;
  fill: var(--tmpl-muted);
}

.tech-trend-peak {
  font-family: var(--slidev-code-font-family);
  font-size: 12px;
  fill: var(--tmpl-muted);
}

.tech-trend-lead .tech-trend-line {
  stroke: var(--tmpl-danger);
  stroke-width: 2.5;
}

.tech-trend-lead .tech-trend-dot {
  fill: var(--tmpl-danger);
}

.tech-trend-lead :is(.tech-trend-peak, .tech-trend-key) {
  fill: var(--tmpl-fg);
}

.tech-trend-plain .tech-trend-line {
  stroke: var(--tmpl-fg);
}

.tech-trend-plain .tech-trend-dot {
  fill: var(--tmpl-fg);
}

.tech-trend-dim .tech-trend-line {
  stroke: var(--tmpl-muted);
  stroke-dasharray: 6 4;
}

.tech-trend-dim .tech-trend-dot {
  fill: var(--tmpl-muted);
}

.tech-trend-faint .tech-trend-line {
  stroke: var(--tmpl-muted);
  stroke-dasharray: 2 3;
}

.tech-trend-faint .tech-trend-dot {
  fill: var(--tmpl-muted);
}

.tech-trend-ghost .tech-trend-line {
  stroke: var(--tmpl-muted);
  stroke-dasharray: 9 3 2 3;
}

.tech-trend-ghost .tech-trend-dot {
  fill: var(--tmpl-muted);
}
</style>

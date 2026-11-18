<script setup>
/* The yearly series exists to show one thing: 16.5% is an average over a line that
   swings, and the swing lands on the year the data source changed. Bars say that in
   a glance; the table it replaces did not. */
const props = defineProps({
  // { year, rate } with rate in percent.
  data: { type: Array, required: true },
  // The year drawn in the alert colour, because something happened to it.
  mark: { type: [String, Number], default: null },
})

const W = 840
const PLOT_H = 150
const BASE_Y = 180
const GAP = 24
const BAR_W = (W - GAP * (props.data.length - 1)) / props.data.length
/* A round ceiling above the tallest bar keeps the bars from touching the labels. */
const TOP = 32
const barX = (i) => i * (BAR_W + GAP)
const barH = (rate) => (rate / TOP) * PLOT_H
</script>

<template>
  <svg :viewBox="`0 0 ${W} 210`" class="year-bars">
    <g
      v-for="(d, i) in data"
      :key="d.year"
      :class="{ 'year-bars-mark': String(d.year) === String(mark) }"
    >
      <rect
        :x="barX(i)"
        :y="BASE_Y - barH(d.rate)"
        :width="BAR_W"
        :height="barH(d.rate)"
        class="year-bars-bar"
      />
      <text
        :x="barX(i) + BAR_W / 2"
        :y="BASE_Y - barH(d.rate) - 8"
        text-anchor="middle"
        class="year-bars-rate"
      >
        {{ d.rate.toFixed(1) }}%
      </text>
      <text :x="barX(i) + BAR_W / 2" :y="BASE_Y + 20" text-anchor="middle" class="year-bars-year">
        {{ d.year }}
      </text>
    </g>
    <line :x1="0" :y1="BASE_Y" :x2="W" :y2="BASE_Y" class="year-bars-axis" />
  </svg>
</template>

<style>
.year-bars {
  width: 100%;
  height: auto;
}

.year-bars text {
  letter-spacing: normal;
}

.year-bars-bar {
  fill: var(--tmpl-rule);
}

.year-bars-rate {
  font-family: var(--slidev-code-font-family);
  font-size: 15px;
  fill: var(--tmpl-muted);
}

.year-bars-year {
  font-family: var(--slidev-code-font-family);
  font-size: 14px;
  fill: var(--tmpl-muted);
}

.year-bars-axis {
  stroke: var(--tmpl-rule-dim);
  stroke-width: var(--tmpl-rule-width);
}

/* The marked year carries the slide's whole point, so it is the only coloured thing. */
.year-bars-mark .year-bars-bar {
  fill: var(--tmpl-danger);
}

.year-bars-mark .year-bars-rate,
.year-bars-mark .year-bars-year {
  fill: var(--tmpl-fg);
}
</style>

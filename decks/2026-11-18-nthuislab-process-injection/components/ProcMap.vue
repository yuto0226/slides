<script setup>
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'

/* Both address spaces are drawn at the same scale and share three fixed rows,
   so the same slot sits at the same height on every slide that uses this. */
const ROWS = [
  { y: 40, h: 42 },
  { y: 96, h: 42 },
  { y: 152, h: 50 },
]

const BOX_W = 142
/* Half of a 2px stroke at x=0 would fall outside the viewBox and be clipped. */
const LEFT_X = 2
const RIGHT_X = 330
const PAD = 12
const SLOT_W = BOX_W - 2 * PAD
const SLOT_R = RIGHT_X + BOX_W - PAD
const LINK_GAP = 12
const LINK_X = RIGHT_X + BOX_W + LINK_GAP

const props = defineProps({
  leftName: { type: String, default: 'malware' },
  rightName: { type: String, default: 'target' },
  // { row, label, tone } with tone 'plain' | 'ghost' | 'danger' | 'own' | 'none'.
  leftSlots: { type: Array, default: () => [] },
  rightSlots: { type: Array, default: () => [] },
  // { api, row, set, link } — set replaces the slot on that row, link draws a dashed edge.
  steps: { type: Array, required: true },
  // Index of the step that brings the target into being; -1 means it was already running.
  rightAt: { type: Number, default: -1 },
  fromClick: { type: Number, default: 1 },
})

const { $clicks } = useSlideContext()

const done = computed(() => (i) => $clicks.value >= props.fromClick + i)
const rightShown = computed(() => props.rightAt < 0 || done.value(props.rightAt))

const slotsNow = computed(() =>
  props.rightSlots.map((slot) => {
    let shown = slot
    props.steps.forEach((step, i) => {
      if (step.set && step.row === slot.row && done.value(i)) shown = { ...shown, ...step.set }
    })
    return shown
  }),
)

const arrows = computed(() => {
  const byRow = {}
  props.steps.forEach((s, i) => (byRow[s.row] ??= []).push(i))
  return props.steps.map((step, i) => {
    if (step.row < 0) return { ...step, i, y: 30, toBox: true }
    const band = ROWS[step.row]
    const peers = byRow[step.row]
    const k = peers.indexOf(i)
    const centre = band.y + band.h / 2
    return { ...step, i, y: Math.round(centre + (k - (peers.length - 1) / 2) * 22) }
  })
})

const toneClass = (tone) => `proc-map-${tone ?? 'plain'}`
const midY = (row) => ROWS[row].y + ROWS[row].h / 2
/* Monospace at 12px advances 7.2px a glyph, so the plate can be sized without measuring. */
const plateW = (text) => text.length * 7.2 + 10
</script>

<template>
  <svg viewBox="0 0 578 252" class="proc-map">
    <g class="proc-map-box">
      <rect :x="LEFT_X" y="22" :width="BOX_W" height="210" rx="3" />
      <text :x="LEFT_X + BOX_W / 2" y="14" text-anchor="middle" class="proc-map-name">
        {{ leftName }}
      </text>
      <template v-if="rightShown">
        <rect :x="RIGHT_X" y="22" :width="BOX_W" height="210" rx="3" />
        <text :x="RIGHT_X + BOX_W / 2" y="14" text-anchor="middle" class="proc-map-name">
          {{ rightName }}
        </text>
      </template>
    </g>

    <g v-for="slot in leftSlots" :key="`l${slot.row}`">
      <rect
        :x="LEFT_X + PAD"
        :y="ROWS[slot.row].y"
        :width="SLOT_W"
        :height="ROWS[slot.row].h"
        rx="2"
        :class="toneClass(slot.tone)"
      />
      <text
        :x="LEFT_X + BOX_W / 2"
        :y="midY(slot.row) + 5"
        text-anchor="middle"
        class="proc-map-label"
      >
        {{ slot.label }}
      </text>
    </g>

    <template v-if="rightShown">
      <g v-for="slot in slotsNow" :key="`r${slot.row}`" :class="{ 'proc-map-lit': slot.lit }">
        <template v-if="slot.tone !== 'none'">
          <rect
            :x="RIGHT_X + PAD"
            :y="ROWS[slot.row].y"
            :width="SLOT_W"
            :height="ROWS[slot.row].h"
            rx="2"
            :class="toneClass(slot.tone)"
          />
          <text
            :x="RIGHT_X + BOX_W / 2"
            :y="midY(slot.row) + 5"
            text-anchor="middle"
            class="proc-map-label"
          >
            {{ slot.label }}
          </text>
        </template>
      </g>
    </template>

    <g v-for="a in arrows" :key="a.i">
      <template v-if="done(a.i)">
        <line
          class="proc-map-edge"
          :x1="LEFT_X + BOX_W + 2"
          :y1="a.y"
          :x2="(a.toBox ? RIGHT_X : RIGHT_X + PAD) - 9"
          :y2="a.y"
        />
        <polygon
          class="proc-map-head"
          :points="`${a.toBox ? RIGHT_X : RIGHT_X + PAD},${a.y} ${(a.toBox ? RIGHT_X : RIGHT_X + PAD) - 10},${a.y - 5} ${(a.toBox ? RIGHT_X : RIGHT_X + PAD) - 10},${a.y + 5}`"
        />
        <rect
          :x="(LEFT_X + BOX_W + RIGHT_X) / 2 - plateW(a.api) / 2"
          :y="a.y - 8"
          :width="plateW(a.api)"
          height="16"
          class="proc-map-plate"
        />
        <text
          :x="(LEFT_X + BOX_W + RIGHT_X) / 2"
          :y="a.y + 4"
          text-anchor="middle"
          class="proc-map-api"
        >
          {{ a.api }}
        </text>

        <template v-if="a.link">
          <path
            class="proc-map-arg"
            :d="`M ${SLOT_R} ${midY(a.row) + 14} L ${LINK_X} ${midY(a.row) + 14} L ${LINK_X} ${midY(a.link.toRow)} L ${SLOT_R + 10} ${midY(a.link.toRow)}`"
          />
          <polygon
            class="proc-map-arg-head"
            :points="`${SLOT_R},${midY(a.link.toRow)} ${SLOT_R + 10},${midY(a.link.toRow) - 5} ${SLOT_R + 10},${midY(a.link.toRow) + 5}`"
          />
          <text
            :x="LINK_X + 6"
            :y="(midY(a.row) + midY(a.link.toRow)) / 2 + 4"
            class="proc-map-note"
          >
            {{ a.link.label }}
          </text>
        </template>
      </template>
    </g>
  </svg>
</template>

<style>
.proc-map {
  width: 100%;
  height: auto;
  /* The column leaves 72px of slack under the diagram and none above it. Two cells
     down splits that slack almost evenly and still lands on the grid. */
  margin-top: calc(2 * var(--tmpl-cell));
}

.proc-map text {
  letter-spacing: normal;
}

.proc-map-box rect {
  fill: none;
  stroke: var(--tmpl-rule);
  stroke-width: var(--tmpl-rule-width);
}

.proc-map-name {
  font-family: var(--slidev-code-font-family);
  font-size: 13px;
  fill: var(--tmpl-muted);
}

.proc-map-plain {
  fill: none;
  stroke: var(--tmpl-rule-dim);
  stroke-width: var(--tmpl-rule-width);
}

.proc-map-ghost {
  fill: none;
  stroke: var(--tmpl-rule-dim);
  stroke-width: var(--tmpl-rule-width);
  stroke-dasharray: 5 4;
}

.proc-map-own {
  fill: none;
  stroke: var(--tmpl-danger);
  stroke-width: var(--tmpl-rule-width);
}

/* Injected memory is outlined and dashed: it does not belong to that process. */
.proc-map-danger {
  fill: none;
  stroke: var(--tmpl-danger);
  stroke-width: var(--tmpl-rule-width);
  stroke-dasharray: 5 4;
}

.proc-map-lit .proc-map-plain {
  stroke: var(--tmpl-accent);
}

.proc-map-edge {
  stroke: var(--tmpl-fg);
  stroke-width: var(--tmpl-rule-width);
}

.proc-map-head {
  fill: var(--tmpl-fg);
}

.proc-map-arg {
  fill: none;
  stroke: var(--tmpl-muted);
  stroke-width: var(--tmpl-rule-width);
}

.proc-map-arg {
  fill: none;
  stroke: var(--tmpl-muted);
  stroke-width: var(--tmpl-rule-width);
  stroke-dasharray: 4 3;
}

.proc-map-arg-head {
  fill: var(--tmpl-muted);
}

.proc-map-plate {
  fill: var(--tmpl-bg);
}

.proc-map-api {
  font-family: var(--slidev-code-font-family);
  font-size: 12px;
  fill: var(--tmpl-fg);
}

.proc-map-label {
  font-family: var(--slidev-code-font-family);
  font-size: 12px;
  fill: var(--tmpl-fg);
}

.proc-map-note {
  font-size: 10px;
  fill: var(--tmpl-muted);
}
</style>

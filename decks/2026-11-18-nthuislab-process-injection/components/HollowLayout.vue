<script setup>
/* The two Hollowing variants differ in one place only: whether the target's own image
   is still mapped when the payload lands. */
const BOX_W = 160
const BOX_H = 150
const BOX_Y = 28
const PAD = 12
const SLOT_W = BOX_W - 2 * PAD
const LEFT_X = 120
const RIGHT_X = 560
</script>

<template>
  <svg viewBox="0 0 840 210" class="hollow-layout">
    <g
      v-for="(v, i) in [
        {
          x: LEFT_X,
          name: '原始版本',
          slots: [{ y: 46, h: 48, label: 'payload', tone: 'payload' }],
        },
        {
          x: RIGHT_X,
          name: 'no-unmap',
          slots: [
            { y: 46, h: 48, label: 'target.exe image', tone: 'kept' },
            { y: 112, h: 48, label: 'payload', tone: 'payload' },
          ],
        },
      ]"
      :key="i"
    >
      <text :x="v.x + BOX_W / 2" y="16" text-anchor="middle" class="hollow-layout-name">
        {{ v.name }}
      </text>
      <rect :x="v.x" :y="BOX_Y" :width="BOX_W" :height="BOX_H" rx="3" class="hollow-layout-box" />
      <g v-for="(s, k) in v.slots" :key="k" :class="`hollow-layout-${s.tone}`">
        <rect
          :x="v.x + PAD"
          :y="s.y"
          :width="SLOT_W"
          :height="s.h"
          rx="2"
          class="hollow-layout-slot"
        />
        <text
          :x="v.x + BOX_W / 2"
          :y="s.y + s.h / 2 + 5"
          text-anchor="middle"
          class="hollow-layout-label"
        >
          {{ s.label }}
        </text>
      </g>
    </g>

    <text
      :x="LEFT_X + BOX_W / 2"
      :y="BOX_Y + BOX_H + 22"
      text-anchor="middle"
      class="hollow-layout-note"
    >
      image 換成 payload
    </text>
    <text
      :x="RIGHT_X + BOX_W / 2"
      :y="BOX_Y + BOX_H + 22"
      text-anchor="middle"
      class="hollow-layout-note"
    >
      payload 另外分配並自己 relocation
    </text>

    <!-- Short and steep, so the cross meets the name near its centre instead of running
         along the baseline the whole way. -->
    <g class="hollow-layout-cross">
      <line x1="400" y1="76" x2="440" y2="102" />
      <line x1="440" y1="76" x2="400" y2="102" />
    </g>
    <text x="420" y="92" text-anchor="middle" class="hollow-layout-api">NtUnmapViewOfSection</text>
  </svg>
</template>

<style>
.hollow-layout {
  width: 100%;
  height: auto;
}

.hollow-layout text {
  letter-spacing: normal;
}

.hollow-layout-name {
  font-size: 13px;
  font-weight: 700;
  fill: var(--tmpl-fg);
}

.hollow-layout-box {
  fill: none;
  stroke: var(--tmpl-rule);
  stroke-width: var(--tmpl-rule-width);
}

.hollow-layout-slot {
  fill: none;
  stroke-width: var(--tmpl-rule-width);
}

.hollow-layout-kept .hollow-layout-slot {
  stroke: var(--tmpl-rule);
}

.hollow-layout-payload .hollow-layout-slot {
  stroke: var(--tmpl-danger);
}

.hollow-layout-label {
  font-family: var(--slidev-code-font-family);
  font-size: 12px;
  fill: var(--tmpl-fg);
}

.hollow-layout-note {
  font-size: 11px;
  fill: var(--tmpl-muted);
}

.hollow-layout-api {
  font-family: var(--slidev-code-font-family);
  font-size: 12px;
  fill: var(--tmpl-muted);
}

.hollow-layout-cross line {
  stroke: var(--tmpl-danger);
  stroke-width: 2;
  stroke-linecap: round;
}
</style>

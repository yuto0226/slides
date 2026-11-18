<script setup>
import { computed } from 'vue'

const COL_X = [0, 295, 590]
const HEAD_Y = 10
const BODY_Y = 26
const LINE = 26

const props = defineProps({
  // { name, calls: [{ api, stage }] } — stage is 'alloc' | 'write' | 'exec', or absent
  // for a call the technique needs but the paper does not treat as a primitive.
  techniques: { type: Array, required: true },
})

const STAGE_LABEL = { alloc: '分配', write: '寫入', exec: '執行' }

/* Process Hollowing allocates with two calls, which is why a primitive is not one
   API. Monospace at 12px advances 7.2px a glyph. */
const frames = computed(() =>
  props.techniques.flatMap((t, c) => {
    const out = []
    t.calls.forEach((call, i) => {
      const last = out[out.length - 1]
      if (!call.stage) return
      if (last && last.stage === call.stage && last.to === i - 1) {
        last.to = i
        last.w = Math.max(last.w, call.api.length * 7.2 + 10)
      } else {
        out.push({ col: c, stage: call.stage, from: i, to: i, w: call.api.length * 7.2 + 10 })
      }
    })
    return out
  }),
)

const rows = computed(() => Math.max(...props.techniques.map((t) => t.calls.length)))
const height = computed(() => BODY_Y + rows.value * LINE + 4)
</script>

<template>
  <svg :viewBox="`0 0 884 ${height}`" class="api-seq">
    <text
      v-for="(t, c) in techniques"
      :key="t.name"
      :x="COL_X[c] + 10"
      :y="HEAD_Y"
      class="api-seq-name"
    >
      {{ t.name }}
    </text>

    <g v-for="f in frames" :key="`${f.col}${f.stage}${f.from}`" :class="`api-seq-${f.stage}`">
      <rect
        :x="COL_X[f.col] + 7"
        :y="BODY_Y + 3 + f.from * LINE"
        :width="f.w"
        :height="(f.to - f.from) * LINE + 21"
        rx="2"
        class="api-seq-frame"
      />
      <text
        :x="COL_X[f.col] + 13 + f.w"
        :y="BODY_Y + ((f.from + f.to) / 2 + 0.5) * LINE + 4"
        class="api-seq-stage"
      >
        {{ STAGE_LABEL[f.stage] }}
      </text>
    </g>

    <g v-for="(t, c) in techniques" :key="`c${c}`">
      <text
        v-for="(call, i) in t.calls"
        :key="call.api"
        :x="COL_X[c] + 12"
        :y="BODY_Y + (i + 0.5) * LINE + 4"
        :class="call.stage ? 'api-seq-api' : 'api-seq-api api-seq-nonprimitive'"
      >
        {{ call.api }}
      </text>
    </g>
  </svg>
</template>

<style>
.api-seq {
  width: 100%;
  height: auto;
  margin-top: var(--tmpl-half);
}

.api-seq text {
  letter-spacing: normal;
}

.api-seq-name {
  font-size: 13px;
  fill: var(--tmpl-fg);
}

.api-seq-api {
  font-family: var(--slidev-code-font-family);
  font-size: 12px;
  fill: var(--tmpl-fg);
}

.api-seq-nonprimitive {
  fill: var(--tmpl-muted);
}

.api-seq-frame {
  fill: none;
  stroke: currentColor;
  stroke-width: var(--tmpl-rule-width);
}

.api-seq-stage {
  font-size: 10px;
  fill: currentColor;
}

.api-seq-alloc {
  color: var(--tmpl-accent);
}

.api-seq-write {
  color: var(--tmpl-mark);
}

.api-seq-exec {
  color: var(--tmpl-danger);
}
</style>

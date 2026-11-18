<script setup>
/* The rule is three nodes, each pinned to one API name; a trace matches only when
   every node finds its exact name. */
/* WriteProcessMemory is the widest name; centring it any further left would put
   its first glyph outside the viewBox, where it is cut instead of overflowing. */
const RULE_CX = 68
const RULE_R = 18
/* The widest call name still ends inside the viewBox. */
const TRACE_X = 250
const NODE_H = 34
const LINE = 26
const HEAD_Y = 10
const BODY_Y = 24

const props = defineProps({
  // { api, stage } — the node the rule requires, in order.
  nodes: { type: Array, required: true },
  // { api, node } — the sample's calls; node is the index of the rule node it matches.
  trace: { type: Array, required: true },
})

const nodeCY = (i) => BODY_Y + 10 + i * (NODE_H + 22) + NODE_H / 2
const nameHalf = (text) => Math.max(RULE_R, (text.length * 7.2) / 2 + 4)
const traceY = (i) => BODY_Y + i * LINE
const height = Math.max(props.nodes.length * (NODE_H + 22) + 40, props.trace.length * LINE + 40)
</script>

<template>
  <svg :viewBox="`0 0 440 ${height}`" class="rule-match">
    <defs>
      <marker
        id="rm-head"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
      </marker>
    </defs>

    <text :x="RULE_CX" :y="HEAD_Y" text-anchor="middle" class="rule-match-head">規則</text>
    <text :x="TRACE_X + 10" :y="HEAD_Y" class="rule-match-head">API 序列</text>

    <g v-for="(n, i) in nodes" :key="n.api" :class="`rule-match-${n.stage}`">
      <!-- A Petri net draws its places as circles. -->
      <circle :cx="RULE_CX" :cy="nodeCY(i)" :r="RULE_R" class="rule-match-node" />
      <line
        v-if="i < nodes.length - 1"
        class="rule-match-order"
        :x1="RULE_CX"
        :y1="nodeCY(i) + RULE_R"
        :x2="RULE_CX"
        :y2="nodeCY(i + 1) - RULE_R - 2"
      />
    </g>

    <g v-for="(t, i) in trace" :key="`t${i}`">
      <rect
        v-if="t.node !== undefined"
        :x="TRACE_X + 6"
        :y="traceY(i) + LINE / 2 - 8"
        :width="t.api.length * 7.2 + 8"
        height="16"
        class="rule-match-plate"
      />
      <text
        :x="TRACE_X + 10"
        :y="traceY(i) + LINE / 2 + 4"
        :class="t.node === undefined ? 'rule-match-api rule-match-unmatched' : 'rule-match-api'"
      >
        {{ t.api }}
      </text>
      <line
        v-if="t.node !== undefined"
        class="rule-match-link"
        :x1="RULE_CX + nameHalf(nodes[t.node].api) + 6"
        :y1="nodeCY(t.node)"
        :x2="TRACE_X - 4"
        :y2="traceY(i) + LINE / 2"
      />
    </g>

    <g v-for="(n, i) in nodes" :key="`n${n.api}`">
      <rect
        :x="RULE_CX - nameHalf(n.api)"
        :y="nodeCY(i) - 8"
        :width="nameHalf(n.api) * 2"
        height="16"
        class="rule-match-plate"
      />
      <text :x="RULE_CX" :y="nodeCY(i) + 4" text-anchor="middle" class="rule-match-api">
        {{ n.api }}
      </text>
    </g>
  </svg>
</template>

<style>
.rule-match {
  width: 100%;
  height: auto;
}

.rule-match text {
  letter-spacing: normal;
}

.rule-match-head {
  font-size: 11px;
  fill: var(--tmpl-muted);
}

.rule-match-api {
  font-family: var(--slidev-code-font-family);
  font-size: 12px;
  fill: var(--tmpl-fg);
}

.rule-match-unmatched {
  fill: var(--tmpl-muted);
}

.rule-match-node {
  fill: none;
  stroke: currentColor;
  stroke-width: var(--tmpl-rule-width);
}

.rule-match-plate {
  fill: var(--tmpl-bg);
}

/* The edge sits inside a stage-coloured group, so `color` is restated here to keep
   the head the same grey as the line it ends. */
.rule-match-order {
  color: var(--tmpl-muted);
  stroke: var(--tmpl-muted);
  stroke-width: var(--tmpl-rule-width);
  marker-end: url(#rm-head);
}

/* One node, one exact name in the trace: the pairing runs both ways, so both ends
   carry a head. */
.rule-match-link {
  color: var(--tmpl-muted);
  stroke: var(--tmpl-muted);
  stroke-width: var(--tmpl-rule-width);
  marker-start: url(#rm-head);
  marker-end: url(#rm-head);
}

.rule-match-alloc {
  color: var(--tmpl-accent);
}

.rule-match-write {
  color: var(--tmpl-mark);
}

.rule-match-exec {
  color: var(--tmpl-danger);
}
</style>

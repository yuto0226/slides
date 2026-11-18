<script setup>
defineProps({
  title: { type: String, required: true },
  authors: { type: String, default: '' },
  affiliation: { type: String, default: '' },
  venue: { type: String, default: '' },
  year: { type: [String, Number], default: '' },
  doi: { type: String, default: '' },
})
</script>

<template>
  <div class="paper-card">
    <div>
      <div class="paper-card-title">{{ title }}</div>
      <div v-if="authors" class="paper-card-authors">{{ authors }}</div>
      <div v-if="affiliation" class="paper-card-affiliation">{{ affiliation }}</div>
    </div>
    <div class="paper-card-meta">
      <span>{{ [venue, year].filter(Boolean).join(' ') }}</span>
      <a v-if="doi" :href="`https://doi.org/${doi}`">doi:{{ doi }}</a>
    </div>
  </div>
</template>

<style>
/* The card is pinned to six cells so it lands on the grid the ruler draws. */
.paper-card {
  box-sizing: border-box;
  /* .tmpl-body is a flex column whose gap is half a cell, and flex margins do not
     collapse, so another half cell puts the next block a whole cell below the card. */
  margin-bottom: var(--tmpl-half);
  height: calc(6 * var(--tmpl-cell));
  padding: var(--tmpl-half) var(--tmpl-cell);
  border: var(--tmpl-rule-width) solid var(--tmpl-rule-dim);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.paper-card-title {
  font-size: var(--tmpl-aside-size);
  font-weight: 700;
  line-height: var(--tmpl-heading-line);
}

.paper-card-authors {
  margin-top: var(--tmpl-quarter);
  font-size: var(--tmpl-caption-size);
  line-height: var(--tmpl-heading-line);
}

.paper-card-affiliation {
  font-size: var(--tmpl-caption-size);
  line-height: var(--tmpl-heading-line);
  color: var(--tmpl-muted);
}

.paper-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--slidev-code-font-family);
  font-size: var(--tmpl-caption-size);
  line-height: var(--tmpl-cell);
  color: var(--tmpl-muted);
}
</style>

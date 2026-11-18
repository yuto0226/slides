/* The site clears dist/ itself before it builds anything. Saying so here only keeps
   Vite from warning that an outDir outside the project root was left alone. */
export default {
  build: { emptyOutDir: true },
}

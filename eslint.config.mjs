import vue from 'eslint-plugin-vue'
import globals from 'globals'

const correctness = {
  'no-undef': 'error',
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
  'vue/multi-word-component-names': 'off',
}

export default [
  {
    ignores: ['**/dist/**', '**/.venv/**', '**/*.ts'],
  },
  ...vue.configs['flat/essential'],
  {
    files: ['decks/**/*.vue'],
    languageOptions: { globals: { ...globals.browser, ...globals.es2022 } },
    rules: correctness,
  },
  {
    files: ['scripts/**/*.mjs', 'site/**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser, ...globals.es2022 },
    },
    rules: correctness,
  },
]

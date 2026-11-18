import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from '@slidev/parser'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'dist')

function flag(name, fallback) {
  const at = process.argv.indexOf(`--${name}`)
  return at === -1 ? fallback : process.argv[at + 1]
}

const trimmed = flag('base', '/').replace(/^\/+|\/+$/g, '')
const base = trimmed ? `/${trimmed}/` : '/'
const repo = flag('repo', 'https://github.com/yuto0226/slides')
const indexOnly = process.argv.includes('--index-only')

// The .CMD shim needs a shell on Windows, so Slidev's own entry is run through node.
function slidev(dir, args) {
  const cli = path.join(dir, 'node_modules', '@slidev', 'cli', 'bin', 'slidev.mjs')
  if (!existsSync(cli)) throw new Error(`${path.basename(dir)} has no Slidev; run pnpm install`)
  execFileSync(process.execPath, [cli, ...args], { cwd: dir, stdio: 'inherit' })
}

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function readDeck(name) {
  const dir = path.join(root, 'decks', name)
  const file = path.join(dir, 'slides.md')
  const parsed = await parse(await readFile(file, 'utf8'), file)
  const head = parsed.slides[0].frontmatter

  return {
    name,
    dir,
    title: head.title ?? name,
    subtitle: head.subtitle ?? '',
    count: parsed.slides.length,
  }
}

function page(decks) {
  const items = decks
    .map(
      (deck) => `      <li>
        <a href="${base}${deck.name}/">${escapeHtml(deck.title)}</a>
        <span>${escapeHtml(deck.subtitle)} · ${deck.count} 頁</span>
      </li>`,
    )
    .join('\n')

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Slides</title>
    <style>
      :root {
        color-scheme: dark;
        --fg: #e8e6e3;
        --bg: #16181a;
        --muted: #8a8f94;
      }
      body {
        margin: 0;
        padding: 4rem 1.5rem;
        background: var(--bg);
        color: var(--fg);
        font-family: system-ui, sans-serif;
        line-height: 1.6;
      }
      main {
        max-width: 42rem;
        margin: 0 auto;
      }
      h1 {
        margin: 0 0 2rem;
        font-size: 1.25rem;
        font-weight: 700;
      }
      ul {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      li {
        padding: 0.75rem 0;
        border-top: 1px solid #2a2d30;
      }
      a {
        color: var(--fg);
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      span,
      footer {
        display: block;
        color: var(--muted);
        font-size: 0.875rem;
      }
      footer {
        margin-top: 2rem;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Slides</h1>
      <ul>
${items}
      </ul>
      <footer><a href="${escapeHtml(repo)}">${escapeHtml(repo.replace(/^https?:\/\//, ''))}</a></footer>
    </main>
  </body>
</html>
`
}

const newestFirst = (await readdir(path.join(root, 'decks'), { withFileTypes: true }))
  .filter(
    (entry) =>
      entry.isDirectory() && existsSync(path.join(entry.parentPath, entry.name, 'slides.md')),
  )
  .map((entry) => entry.name)
  .sort()
  .reverse()

if (newestFirst.length === 0) throw new Error('decks/ holds no deck')

if (!indexOnly) await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const decks = []
for (const name of newestFirst) {
  const deck = await readDeck(name)

  if (!indexOnly) {
    console.log(`${name}: building`)
    // Pages has no SPA fallback, so reloading on /<name>/5 would 404.
    slidev(deck.dir, [
      'build',
      'slides.md',
      '--base',
      `${base}${name}/`,
      '--out',
      path.join(outDir, name),
      '--router-mode',
      'hash',
    ])
  }

  decks.push(deck)
}

await writeFile(path.join(outDir, 'index.html'), page(decks), 'utf8')

console.log(`\n${decks.length} deck(s) into dist/ at ${base}`)

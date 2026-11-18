import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
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

// Pages reports a custom domain as http until HTTPS is enforced, and crawlers take og:url literally.
const given = (flag('origin', '') || '').replace(/\/+$/, '')
const origin = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(given)
  ? given
  : given.replace(/^http:\/\//, 'https://')

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
    preview: head.preview ?? 1,
    count: parsed.slides.length,
  }
}

/* Slidev reads a deck's own og-image.png with no headmatter at all, so the card is
   shot once and committed and no later build needs a browser. */
async function card(deck) {
  const file = path.join(deck.dir, 'og-image.png')
  if (existsSync(file)) return

  console.log(`${deck.name}: shooting slide ${deck.preview} for the card`)
  const temp = path.join(outDir, '.card')
  slidev(deck.dir, [
    'export',
    'slides.md',
    '--format',
    'png',
    '--range',
    String(deck.preview),
    '--output',
    temp,
  ])

  const shot = (await readdir(temp)).find((name) => name.endsWith('.png'))
  if (!shot) throw new Error(`${deck.name}: slide ${deck.preview} produced no image`)
  await cp(path.join(temp, shot), file)
  await rm(temp, { recursive: true, force: true })
}

/* Three things the CLI leaves undone. Vite resolves the card to a hashed asset under
   the site root, and a crawler needs the origin in front of it; og:url and the card's
   size are never written at all; and info, author and keywords go through
   JSON.stringify before unhead escapes them, so each arrives wrapped in a literal
   pair of quotes. The size is read off the deck's own copy, which vite only renamed. */
async function rewriteHead(out, deck, url) {
  const size = (await readFile(path.join(deck.dir, 'og-image.png'))).subarray(16, 24)
  const added = [
    `<meta property="twitter:card" content="summary_large_image">`,
    url && `<meta property="og:url" content="${url}">`,
    `<meta property="og:image:width" content="${size.readUInt32BE(0)}">`,
    `<meta property="og:image:height" content="${size.readUInt32BE(4)}">`,
  ]
    .filter(Boolean)
    .join('')

  for (const name of ['index.html', '404.html']) {
    const page = path.join(out, name)
    if (!existsSync(page)) continue

    const html = (await readFile(page, 'utf8'))
      .replace(/content="&quot;(.*?)&quot;"/g, 'content="$1"')
      .replace('<meta property="og:title"', `${added}<meta property="og:title"`)
      .replace(/(<meta property="og:image" content=")\//, `$1${origin}/`)
    await writeFile(page, html, 'utf8')
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
    await card(deck)

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

    await rewriteHead(path.join(outDir, name), deck, origin && `${origin}${base}${name}/`)
  }

  decks.push(deck)
}

await writeFile(path.join(outDir, 'index.html'), page(decks), 'utf8')

console.log(`\n${decks.length} deck(s) into dist/ at ${base}`)

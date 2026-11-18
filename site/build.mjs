import { existsSync } from 'node:fs'
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { parse } from '@slidev/parser'
import { deckDir, listDecks, root, runSlidev } from '../scripts/decks.mjs'

const outDir = path.join(root, 'dist')

const { values } = parseArgs({
  options: {
    base: { type: 'string', default: '/' },
    origin: { type: 'string', default: '' },
    repo: { type: 'string', default: 'https://github.com/yuto0226/slides' },
  },
})

const trimmed = values.base.replace(/^\/+|\/+$/g, '')
const base = trimmed ? `/${trimmed}/` : '/'

// Pages reports a custom domain as http until HTTPS is enforced, and crawlers take og:url literally.
const given = values.origin.replace(/\/+$/, '')
const origin = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(given)
  ? given
  : given.replace(/^http:\/\//, 'https://')

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/* A replace that quietly matches nothing would publish a half-written head, so the
   ones that must apply say so instead. */
function replaceOrThrow(html, pattern, replacement, what) {
  const rewritten = html.replace(pattern, replacement)
  if (rewritten === html) throw new Error(`${what}: Slidev's head no longer holds ${pattern}`)
  return rewritten
}

async function readDeck(name) {
  const dir = deckDir(name)
  const file = path.join(dir, 'slides.md')
  const parsed = await parse(await readFile(file, 'utf8'), file)
  const cover = parsed.slides[0].frontmatter

  return {
    name,
    dir,
    title: cover.title ?? name,
    subtitle: cover.subtitle ?? '',
    preview: cover.preview ?? 1,
    count: parsed.slides.length,
  }
}

/* Slidev points og:image at a deck's own og-image.png with no headmatter at all. The
   card is committed because a runner without CJK fonts would shoot one full of
   tofu, which is why Slidev's own documentation also suggests committing it. */
async function ensureShareCard(deck) {
  const file = path.join(deck.dir, 'og-image.png')
  if (existsSync(file)) return

  if (process.env.CI) {
    throw new Error(`${deck.name}: no og-image.png; run pnpm site locally and commit the card`)
  }

  console.log(`${deck.name}: shooting slide ${deck.preview} for the card`)
  const shotDir = path.join(outDir, '.card')
  runSlidev(deck.dir, [
    'export',
    'slides.md',
    '--format',
    'png',
    '--range',
    String(deck.preview),
    '--output',
    shotDir,
  ])

  const shotName = (await readdir(shotDir)).find((name) => name.endsWith('.png'))
  if (!shotName) {
    throw new Error(
      `${deck.name}: slide ${deck.preview} shot nothing; is preview within 1..${deck.count}?`,
    )
  }
  await cp(path.join(shotDir, shotName), file)
  await rm(shotDir, { recursive: true, force: true })
}

/* Two gaps in the head Slidev writes. It has no key for the card's size or for
   og:url, and og:image names a path under the site root, which a crawler cannot
   resolve. A third, the literal quotes around info, author and keywords, is an
   upstream slip: toAttrValue runs JSON.stringify before unhead escapes the value.
   The size is read off the deck's own copy, which Vite renames but does not touch. */
async function rewriteHead(out, deck, url) {
  const png = await readFile(path.join(deck.dir, 'og-image.png'))
  // PNG IHDR: width then height, big-endian, at a fixed offset.
  const dimensions = png.subarray(16, 24)

  const extraTags = [
    `<meta property="twitter:card" content="summary_large_image">`,
    url && `<meta property="og:url" content="${url}">`,
    `<meta property="og:image:width" content="${dimensions.readUInt32BE(0)}">`,
    `<meta property="og:image:height" content="${dimensions.readUInt32BE(4)}">`,
  ]
    .filter(Boolean)
    .join('')

  // Slidev copies index.html to 404.html after the build, so both carry the same head.
  for (const name of ['index.html', '404.html']) {
    const file = path.join(out, name)
    let html = (await readFile(file, 'utf8')).replace(
      /content="&quot;(.*?)&quot;"/g,
      'content="$1"',
    )
    html = replaceOrThrow(
      html,
      '<meta property="og:title"',
      `${extraTags}<meta property="og:title"`,
      `${deck.name}/${name}`,
    )
    if (url) {
      html = replaceOrThrow(
        html,
        /(<meta property="og:image" content=")\//,
        `$1${origin}/`,
        `${deck.name}/${name}`,
      )
    }
    await writeFile(file, html, 'utf8')
  }
}

function renderIndex(decks) {
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
        --rule: #2a2d30;
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
        border-top: 1px solid var(--rule);
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
      <footer><a href="${escapeHtml(values.repo)}">${escapeHtml(values.repo.replace(/^https?:\/\//, ''))}</a></footer>
    </main>
  </body>
</html>
`
}

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const decks = []
for (const name of listDecks().reverse()) {
  const deck = await readDeck(name)
  await ensureShareCard(deck)

  console.log(`${name}: building`)
  /* Slidev writes a 404.html and a _redirects for deep links, but Pages serves only
     the 404.html at the site root and does not read _redirects at all, so a reload
     of /<name>/5 would land on Pages' own 404. The hash router keeps the path. */
  runSlidev(deck.dir, [
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
  decks.push(deck)
}

await writeFile(path.join(outDir, 'index.html'), renderIndex(decks), 'utf8')

console.log(`\n${decks.length} deck${decks.length === 1 ? '' : 's'} in dist/ at ${base}`)

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ONE_AT_A_TIME = new Set(['dev'])

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const decksDir = path.join(root, 'decks')

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

const [script, ...rest] = process.argv.slice(2)
if (!script) fail('deck.mjs needs a script to run')

const decks = readdirSync(decksDir).filter((name) =>
  existsSync(path.join(decksDir, name, 'slides.md')),
)
if (decks.length === 0) fail('decks/ holds no deck')

const asked = rest[0] && !rest[0].startsWith('-') ? rest[0] : undefined
const args = asked ? rest.slice(1) : rest

function resolve(wanted) {
  if (decks.includes(wanted)) return wanted
  const matched = decks.filter((name) => name.includes(wanted))
  if (matched.length === 1) return matched[0]
  const why =
    matched.length === 0 ? `no deck named ${wanted}` : `${wanted} names ${matched.length} decks`
  fail(`${why}\n  ${decks.join('\n  ')}`)
}

const named = asked ? resolve(asked) : undefined

let chosen
if (named) chosen = [named]
else if (!ONE_AT_A_TIME.has(script)) chosen = decks
else if (decks.length === 1) chosen = decks
else fail(`pnpm ${script} takes one deck; name one\n  ${decks.join('\n  ')}`)

// Node refuses to spawn a .cmd, so this runs the deck's own Slidev rather than pnpm's shim.
for (const deck of chosen) {
  const dir = path.join(decksDir, deck)
  const cli = path.join(dir, 'node_modules', '@slidev', 'cli', 'bin', 'slidev.mjs')
  if (!existsSync(cli)) fail(`${deck} has no Slidev; run pnpm install`)

  const verb = script === 'dev' ? ['slides.md', '--open'] : [script, 'slides.md']
  execFileSync(process.execPath, [cli, ...verb, ...args], { cwd: dir, stdio: 'inherit' })
}

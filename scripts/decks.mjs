import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const decksDir = path.join(root, 'decks')

export const deckDir = (name) => path.join(decksDir, name)

/* A directory name starts with the date of the talk, so sorted is oldest first. */
export function listDecks() {
  const decks = readdirSync(decksDir)
    .filter((name) => existsSync(path.join(decksDir, name, 'slides.md')))
    .sort()

  if (decks.length === 0) {
    throw new Error('no deck in decks/; a deck is a directory holding slides.md')
  }
  return decks
}

// Node refuses to spawn a .cmd, so a deck's own Slidev is run rather than pnpm's shim.
export function slidevCli(dir) {
  const cli = path.join(dir, 'node_modules', '@slidev', 'cli', 'bin', 'slidev.mjs')
  if (!existsSync(cli)) throw new Error(`${path.basename(dir)} has no Slidev; run pnpm install`)
  return cli
}

export function runSlidev(dir, args) {
  execFileSync(process.execPath, [slidevCli(dir), ...args], { cwd: dir, stdio: 'inherit' })
}

import { deckDir, listDecks, runSlidev } from './decks.mjs'

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

const [script, ...rest] = process.argv.slice(2)
if (!script) fail('usage: node scripts/deck.mjs <dev|build|export> [deck] [slidev args]')

const decks = listDecks()
const interactive = script === 'dev'

const asked = rest[0] && !rest[0].startsWith('-') ? rest[0] : undefined
const args = asked ? rest.slice(1) : rest

// A deck's directory name carries the date of the talk and is long to type.
function pickDeck(wanted) {
  if (decks.includes(wanted)) return wanted
  const matched = decks.filter((name) => name.includes(wanted))
  if (matched.length === 1) return matched[0]
  const why =
    matched.length === 0 ? `no deck named ${wanted}` : `${wanted} names ${matched.length} decks`
  fail(`${why}\n  ${decks.join('\n  ')}`)
}

let chosen
if (asked) chosen = [pickDeck(asked)]
else if (!interactive || decks.length === 1) chosen = decks
else fail(`pnpm ${script} takes one deck; name one\n  ${decks.join('\n  ')}`)

for (const deck of chosen) {
  const verb = interactive ? ['slides.md', '--open'] : [script, 'slides.md']
  runSlidev(deckDir(deck), [...verb, ...args])
}

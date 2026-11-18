# Repository purpose

One deck per talk, in `decks/<date>-<occasion>-<topic>/`.
The theme is `@yuto0226/flourish`, installed from npm.
Layouts, components, the 20-unit grid and the type scale are documented in the theme's own repository, [slidev-tmpl](https://github.com/yuto0226/slidev-tmpl); a layout problem is fixed there and released, not patched here.

A deck may hold `components/` for figures only that talk needs, a `style.css` for its own overrides, and `docs/` for the research behind it.
Anything a second deck would want belongs in the theme instead.

## Deck conventions

- One point per slide.
- A slide states the fact; the speaker explains it.
  Prose that only a speaker would say belongs in the presenter notes or in `docs/`.
- Every number carries its denominator on screen.
  A percentage whose base is only in the notes is a number the audience cannot check.
- Name the concept.
  Never point at it with a stand-in word, and never compress a term to save space.
- No cross-references by slide number.
  The deck gets reordered and the reference does not.
- A nested list means the outline level is the claim and the child is the evidence.
  The theme renders children quieter, which is what makes that reading work.
- Name who did something in the body.
  A footnote proves the citation exists; it does not tell the audience whose result it is.
- The share card is a slide, not a graphic.
  `preview` names it, `pnpm site` shoots it, and the `og-image.png` it leaves is committed.
  A deck sets no `seoMeta`: the build owns those tags, and Slidev replaces that whole object rather than merging it key by key.
- Run `pnpm fit` before calling a deck done.
  A deck that builds has not been shown to fit.

## Subagents

Every subagent carries an explicit `model`.
Choose the tier from the bottom up: haiku for searches, script runs and mechanical edits, sonnet for scoped implementation and review, the default model for a root cause nobody has located.
Keep a survey's fact-gathering below the judgement made on it.

## Commits

One logical change per commit.
`fix`, `refactor`, `feat`, `style`, `build` and `docs` never share one.
The header is at most 72 characters and says what the change does, not which files moved.
Every commit leaves `pnpm build` passing.

## Writing

Plain declarative sentences.
No comment that the code and its names already say; a comment earns its place by naming a constraint from outside the code, the mathematics behind a figure, or a choice that reads as wrong until explained.
Prose in `README.md`, `AGENTS.md` and `docs/` is written one sentence per line, which is what `rumdl` enforces.
Traditional Chinese follows `zhtw-mcp`; the hook blocks on the mechanical rules and prints the rest.

# slides

Talks given, as [Slidev](https://sli.dev) decks.
Every deck uses the [@yuto0226/flourish](https://www.npmjs.com/package/@yuto0226/flourish) theme, published from [slidev-tmpl](https://github.com/yuto0226/slidev-tmpl).

```text
decks/<date>-<occasion>-<topic>/   one deck per talk
site/                             builds every deck into dist/
scripts/                          deck runner, overflow check, zh-TW lint
```

## Quick start

```bash
pnpm install
pnpm dev nthuislab
```

Any part of a deck's directory name will do, as long as it picks out one deck.

```bash
uv sync
uv run pre-commit install
```

Traditional Chinese prose is linted with `zhtw-mcp`, which is installed separately and must be on `PATH`.

## Commands

| Command           | Effect                                                          |
| ----------------- | --------------------------------------------------------------- |
| `pnpm dev <deck>` | opens one deck with hot reload                                  |
| `pnpm build`      | builds every deck, or the one named                             |
| `pnpm export`     | exports to PDF                                                  |
| `pnpm fit`        | reports every box a slide overflows, measured in a real browser |
| `pnpm site`       | builds every deck and the index into `dist/`                    |
| `pnpm site:serve` | serves `dist/`                                                  |
| `pnpm zhtw`       | lints the slide bodies as Traditional Chinese prose             |
| `pnpm format`     | prettier, including the Slidev markdown parser                  |
| `pnpm lint`       | eslint over the components and the scripts                      |

## Adding a deck

1. Copy an existing directory under `decks/` to `<date>-<occasion>-<topic>`, the date being the day of the talk.
2. Set `name` in its `package.json` to `deck-<directory>`.
3. Give `slides.md` a `title`, a `subtitle` and an `info`; the index reads the first two and `info` becomes the page description.
4. Add `preview: <n>` for the slide the share card should show, if the cover is not it.
5. `pnpm install`, then `pnpm dev <part of the name>`.
6. Run `pnpm site` once and commit the `og-image.png` it leaves in the deck.

## Publishing

`main` deploys to GitHub Pages.
Each deck is served at `/<directory>/` with a hash router, since Pages has no SPA fallback.
The root is a plain list of the decks for now.

Each deck carries its own `og-image.png`, shot from the slide `preview` names and committed, so no deployment needs a browser.
Delete it and run `pnpm site` to shoot it again.
The build makes the card's URL absolute and adds the tags Slidev leaves out.

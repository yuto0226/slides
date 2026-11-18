# slides

Talks given, as [Slidev](https://sli.dev) decks.
Every deck uses the [@yuto0226/flourish](https://www.npmjs.com/package/@yuto0226/flourish) theme, published from [slidev-tmpl](https://github.com/yuto0226/slidev-tmpl).

```text
decks/<date>-<occasion>-<topic>/   one deck per talk
site/                             builds every deck into dist/
scripts/                          deck runner, overflow check, zh-TW lint
```

## Quick start

Node 24, pnpm 10 and uv.

```bash
pnpm install
pnpm dev nthuislab
```

Any part of a deck's directory name will do, as long as it picks out one deck.

Commit hooks, which also lint Traditional Chinese prose with `zhtw-mcp`, installed separately and on `PATH`:

```bash
uv sync
uv run pre-commit install
```

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

`main` deploys to GitHub Pages, each deck at `/<directory>/` and a plain list of them at the root.
The build makes the share card's URL absolute and adds the tags Slidev leaves out.
Delete a deck's `og-image.png` and run `pnpm site` to shoot the card again.

To see the deployed paths locally, pass the same flags the workflow does:

```bash
node site/build.mjs --base /slides/ --origin https://yuto0226.dev
```

`pnpm site:serve` serves `dist/` at the root, so a build made with a `--base` will not resolve under it.

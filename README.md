# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/remixing9/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/remixing9/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5: every trophy with its official name, description and grade, a guide in our own words with its sources, a checklist that saves in your browser, export and import, filters by kind, a spoiler setting that hides story trophies until they are earned, and a six-stage roadmap to the platinum.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The guide is plain static files under `app/` — open `app/index.html` straight from disk and it works with the network off. No build step, no dependencies.

Hand it in the way the grader does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library.

## What is inside

- `app/index.html` — the page: header with progress, roadmap, filters, checklist, sources.
- `app/app.js` — bootstrap: loads the data, wires the filters, the spoiler setting and export/import.
- `app/lib/store.js` — progress in localStorage, plus export/import of a JSON progress file.
- `app/lib/filters.js` — pure filtering by kind, grade, earned state and search.
- `app/lib/render.js` — the trophy rows and their expandable guides.
- `app/lib/roadmap.js` — the six-stage road to the platinum.
- `app/data/trophies.json` — the official 55 trophies (names, descriptions, grades as PlayStation publishes them, via Exophase and PSNProfiles) with a guide and cited sources each.
- `app/data/roadmap.json` — the six roadmap stages.
- `tests/trophies.test.mjs` — checks the data and the filter logic: `node --test tests/trophies.test.mjs`.

## Sources

Names, descriptions and grades are the official PlayStation list, as Exophase and PSNProfiles published it. Guides are written for this page and cite their sources beside each trophy: Output Lag, KeenGamer, PlanetGTA6, CryptoGames, Of Zen and Computing, GTA Six Insider and u7buy. Anything the community has not yet confirmed says so in the guide. An unofficial fan guide, not affiliated with Rockstar Games or Sony Interactive Entertainment.

---

<sub>Entered on [make.fun](https://make.fun/?ref=9jphbgca&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

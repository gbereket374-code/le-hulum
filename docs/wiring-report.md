<!-- STEP 10: Backend wiring audit — updated after FIX 1–6. -->
# LE HULUM — STEP 10 Wiring Report

**Scope:** Design SPA (`demo/v3-design/LE HULUM.dc.html` + child views), learner settings, Savanna host page, plugin-test pages, `config.js` / `bridge.js` / `stats-map.js`, `demo/data/{credits,stats}.json`, and `/api/v1/*` routes.

**Date:** 2026-11-21 (post FIX 1–6)

---

## Summary counts (visible demo)

| Status | Count |
|--------|------:|
| WORKING | ~95 |
| PARTIAL (docs/static copy only) | ~12 |
| **NOT WIRED (visible)** | **0** |
| **MOCK (visible)** | **0** |
| DEAD LINK | 0 |
| HIDDEN (code kept, not shown) | see below |

---

## FIX 1–6 (done)

1. **Lesson Understood / Not clear** → `POST /api/v1/sign/review` (approve/fix); toast “Thanks”.
2. **Asayegn Request this sign** → `POST /sign/review` verdict `missing` + missing gloss words; **stars** → optional `rating` 1–5 on same route; **Help** → Home FAQ (`#faq-h`); **Download** → single recorded clip file, else button hidden.
3. **Learner settings** → maps into `db-player:prefs`: `signW`, `signRate`, `signPacing`, `captionStyle` (+ `capSize`); Data saver **hidden**. Playwright: `tests/v3/settings-prefs.spec.js`.
4. **Platforms demo frame** → mock Sign / Loop / 0.75× / Replay / pin / selection tools **hidden**; real `<db-sign-pin>` only.
5. **Home Sign it** typing preview → debounced `POST /api/v1/sign/translate` gloss chips (no `lexicon.js` mock); submit still opens Asayegn.
6. **Lesson coverage** from `GET /api/v1/stats` (`auto_lines_signed` / `lesson_lines`); **hero gloss** from `sign.json` A01 `gloss` (fallback `/sign/translate`).

---

## Hidden (code kept, not shown in demo)

| Item | How hidden |
|------|------------|
| Home co-designer quote / Play quote | `hasQuote` false while `credits.quote` empty |
| Interpreters / team lists | `credits.json` people `show: false` |
| Settings Data saver | removed from `switchRows` |
| Platforms mock Sign / popup Loop·0.75×·Replay / pin / keyboard tools | `btnOn`/`toolsOn`/`pop`/`selBtn` forced off |
| Asayegn Fingerspell it | button removed from template (handler remains unused) |
| Footer Credits / legal string | i18n only; no visible link |
| Unused API routers (jobs, packs, …) | not exposed in SPA UI |

---

## Visible inventory (status after FIX)

| Area | Element | Status |
|------|---------|--------|
| Lesson | Understood / Not clear | WORKING → `/sign/review` |
| Lesson | Coverage label | WORKING → `/stats` |
| Asayegn | Request / stars / Help / Download | WORKING (download only for one clip) |
| Asayegn | Understood / Not clear | WORKING |
| Settings | Size / speed / pacing / caption colours+size | WORKING → `db-player:prefs` |
| Settings | Data saver | HIDDEN |
| Platforms | Frame controls | WORKING — `db-sign-pin` only |
| Home | Sign it preview | WORKING → `/sign/translate` |
| Home | Hero gloss chips | WORKING → `sign.json` |
| Home | Quote block | HIDDEN (empty quote) |
| Shell | Footer API docs / install / contact | WORKING |

Static marketing copy (proof strip, FAQ answers, attribute tables) remains hardcoded display text — not MOCK controls.

---

## Notes

1. `POST /api/v1/sign/review` accepts optional `rating` (1–5); invalid rating → 400.
2. Signer speed UI options match player rates: `0.75` / `0.85` / `1`.
3. Fill `credits.json` by hand when people/quote should appear (`show: true`, real names, optional quote fields).

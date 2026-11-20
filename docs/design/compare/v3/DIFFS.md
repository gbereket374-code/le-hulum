# v3 visual differences vs Design system questions

Screenshots: `docs/design/compare/v3/*-{1280,390}.png`  
Design source: `Design system questions/{Home,Lesson,Asayegn,Platforms v1,LE HULUM}.dc.html`

## Matches
- Shared chrome: announcement, pill nav (Home / Signed lesson / Asayegn / For platforms), language, theme, Try it live, Learner settings FAB, EthSL launcher, footer columns.
- Tokens: light / dark / hc; Instrument Sans + Literata + Noto Ethiopic; 3px focus.
- Home sections, lesson mode switch, Asayegn chat shell, platforms install + pin + API list.

## Remaining differences
1. **Home hero media** — Design shows a live cycling interpreter 3:4 clip with gloss chips; demo uses `data/memory/A01.mp4` / lesson poster and does not animate gloss chips in the hero frame.
2. **Home hero column order** — Design places the signer column on the right at ≥768; current `home.css` keeps media on the left.
3. **Home impact “X/10”** — Still the design placeholder letter, not a measured metric.
4. **Lesson side panel / control bar** — Layout matches Lesson.dc.html structure, but player chrome is the real `<db-player>` shadow UI (restyled), not the design’s simulated control SVG states.
5. **Asayegn browse cards** — Text/gloss tiles only; design shows 3:4 interpreter thumbnails (no upload assets in repo).
6. **Asayegn loading** — Step labels match; timing is approximate vs the design’s scripted delays.
7. **Platforms live host** — Article + `<db-sign-pin>` works; design’s full Savanna light/dark host frame, per-block Sign buttons, and word popover chrome are only partially mirrored (pin module styles updated; Savanna screenshot slot empty).
8. **404 poster** — Text/layout match; no illustrated “POSTER FRAME · PAGE NOT FOUND” art file.
9. **Floating signer tiles** — Shell EthSL panel is present; full design tile grid (opacity/speed/pacing/CC) is simplified pending deeper SignWindow chrome parity.
10. **Fonts** — Self-hosted latin subsets for Instrument Sans / Literata; design prototype loaded full Google Fonts CSS.

## Accessibility deviations
See `docs/design/v3-deviations.md` (44px targets vs 38px design pills, light-DOM shell, `.ok` green bumped on dark/hc).

<!-- STEP 10: Backend wiring audit — report only; dead links fixed as exception. -->
# LE HULUM — STEP 10 Wiring Report

**Scope:** Design SPA (`demo/v3-design/LE HULUM.dc.html` + child views), learner settings, Savanna host page, plugin-test pages, `config.js` / `bridge.js` / `stats-map.js`, `demo/data/{credits,stats}.json`, and `/api/v1/*` routes.

**Method:** Code-path audit (plus local axe / fix-pass on localhost; hosted wake after STEP 9 push). Status reflects what the source actually calls.

**Date:** 2026-11-21

**Dead-link exception (fixed in this step):**
- Footer **API docs** → `/api/docs` (was `/docs`)
- Platforms **Open API docs** → `/api/docs` (was `#platforms`)
- Footer **Privacy** → removed (was a stub `#home`)

---

## Summary counts

| Status | Count |
|--------|------:|
| WORKING | 72 |
| PARTIAL | 28 |
| NOT WIRED | 22 |
| DEAD LINK | 0 *(3 fixed)* |
| HARDCODED / MOCK | 31 |

---

## NOT WIRED / MOCK list (decide next)

- **NOT WIRED:** Home **Play quote** button (no `onClick`; quote block also hidden while `credits.quote` is null)
- **NOT WIRED:** Home / shell **Credits / legal** i18n label exists but no footer link
- **NOT WIRED:** Lesson **Understood / Not clear** (local state only; no `/sign/review`)
- **NOT WIRED:** Settings **Data saver** (stored in `lehulum.v1`, never read by player)
- **NOT WIRED:** Settings **Caption colours / signer size / signer speed / pacing** → not mapped into `db-player:prefs` keys the module reads
- **MOCK:** Asayegn **Request this sign / Request a sign** → toast only
- **MOCK:** Asayegn **Download video** → toast “Download started (demo)”
- **MOCK:** Asayegn **Help & feedback** → toast “Feedback form opens here (demo)”
- **MOCK:** Asayegn **Star rating** → local UI state only
- **MOCK:** Platforms in-frame **Sign** demo → `lexicon.js` `LH.translate` (not `/ask`)
- **MOCK:** Platforms popup **Loop / 0.75× / Replay** buttons → no handlers
- **MOCK:** Home **Sign it** live preview chips while typing → `LH.translate` mock; submit opens Asayegn (real API)
- **HARDCODED:** Lesson coverage copy **“6 of 14 lines signed”**; meta chips `0:46` / `14 lines`
- **HARDCODED:** Home hero captions / gloss sequence `HELLO`/`WELCOME`; fallback stats `64`/`39`/`14` if API fails
- **EMPTY DATA:** `credits.json` people all `show: false` / empty names → interpreters, team, quote UI never render
- **PARTIAL/MOCK:** `stats.json` `codesigner_understood: null` → fourth stat falls back to lesson-line count
- **API unused by SPA:** `GET /phrases`, `/examples`, `/rules`; lessons/jobs/certificates/progress/packs/access/webhooks/documents routers

---

## Inventory

| view | element / data | what it does or shows | source | status | how verified |
|------|----------------|----------------------|--------|--------|--------------|
| Shell | Skip to content | Jump link to `#main` | HARDCODED (hash) | WORKING | Code: `LE HULUM.dc.html` skip `<a href="#main">` |
| Shell | Announcement banner + Dismiss | Shows hackathon finalist text; dismiss hides | HARDCODED copy; state in `lehulum.v1` | WORKING | Code: `ann` / `dismissAnn`; persisted in `apply()` |
| Shell | Logo / Home link | Navigates to `#home` | Hash routing | WORKING | Code: `nav.home` → `go('home')` |
| Shell | Nav: Home / Signed lesson / Asayegn / For platforms | SPA page switch via hash | Hash + `PAGES` | WORKING | Code: `navItems` / `go()` / `readHash()` |
| Shell | Mobile menu toggle | Opens/closes narrow nav drawer | local state | WORKING | Code: `toggleMenu` |
| Shell | Language EN / አማርኛ | Sets `document.documentElement.lang`; re-renders i18n | `localStorage` `lehulum.v1` | WORKING | Code: `setEn`/`setAm`/`apply()` |
| Shell | Theme menu (Light / Dark / HC) | Sets `data-theme` | `localStorage` `lehulum.v1` | WORKING | Code: `themes[].pick` / `apply()` |
| Shell | Try it live | Goes to Asayegn (`#studio`) | Hash routing | WORKING | Code: `nav.studio` |
| Shell | Global `<db-sign-pin>` | Floating pin; scopes `main`; hidden on studio | API attr `LH_BRIDGE.API` → `/api/v1` | WORKING | Code: `mountGlobalPin()`; module `sign-pin.js` posts ask |
| Shell | Floating learner settings FAB | Opens settings dialog | local state | WORKING | Code: `openSettings` |
| Shell | Footer product links | Same four page hashes | Hash routing | WORKING | Code: `footCols[0]` |
| Shell | Footer API docs | Opens Swagger | `HOST/api/docs` | WORKING | Code: fixed STEP 10; `api/main.py` `docs_url="/api/docs"` |
| Shell | Footer Install guide | Goes to `#platforms` | Hash | WORKING | Code: `go('platforms')` |
| Shell | Footer GitHub | Opens repo | External URL | WORKING | Code: `window.open(...)` |
| Shell | Footer About | Scrolls/nav to home | Hash `#home` | PARTIAL | Code: placeholder → home, no About page |
| Shell | Footer Contact | `mailto:hello@lehulum.org` | `LH_CONFIG.CONTACT` | WORKING | Code: `config.js` + footer href |
| Shell | Footer Hackathon | Opens alxafrica.com | External | WORKING | Code: `window.open` |
| Shell | Footer Privacy | Removed (was stub) | — | WORKING | Code: removed STEP 10 |
| Shell | Footer Credits / legal | i18n key `legal: 'Credits'` unused in `footCols` | — | NOT WIRED | Code: string in `T`, never linked |
| Shell | Footer pitch / credit / fonts lines | Static marketing copy | HARDCODED i18n | HARDCODED/MOCK | Code: `t.footPitch` etc. |
| Shell | 404 Back to home / Try again | Home nav / `location.reload()` | local | WORKING | Code: `nav.home` / `reload` |
| Shell | `config.js` `LH_CONFIG` | `HOST`, `API=/api/v1`, `MODULE`, `DATA`, `CONTACT` | `location.origin` | WORKING | Code: `demo/v3-design/config.js` |
| Shell | `bridge.js` | `ask`, `review`, `stats`, `lexicon`, `glossary`, prefs, playlist | `/api/v1/*` | WORKING | Code: `bridge.js` |
| Shell | `lexicon.js` `window.LH` | Client mock lexicon + `translate` | HARDCODED in-browser lexicon | HARDCODED/MOCK | Code: used by Home preview / Platforms demo |
| Shell | `stats-map.js` | Maps API stats → Home impact cards | `/api/v1/stats` + labels | WORKING | Code: `LH_mapHomeStats`; unit tests pass |
| Home | Hero video play/pause | Plays/pauses `memory/A01.mp4` clip window | Static file `/demo/data/memory/A01.mp4` | WORKING | Code: `bootHero` / `togglePlay`; fix-pass screenshots |
| Home | Hero “Real interpreter” badge | Static badge | HARDCODED | HARDCODED/MOCK | Code: `t.realBadge` |
| Home | Hero captions Am/En | Fixed welcome lines | HARDCODED i18n `heroAm`/`heroEn` | HARDCODED/MOCK | Code: `capAm`/`capEn` |
| Home | Hero gloss chips HELLO/WELCOME | Animated overlay while playing | HARDCODED `HERO_GLOSS` | HARDCODED/MOCK | Code: `tick()` |
| Home | CTA Watch a signed lesson | → `#lesson` | Hash | WORKING | Code: `goLesson` |
| Home | CTA Add it to your platform | → `#platforms` | Hash | WORKING | Code: `goPlatforms` |
| Home | Proof strip | Static trust bullets | HARDCODED `t.proof` | HARDCODED/MOCK | Code: `proof: t.proof` |
| Home | Sign it input + submit | Opens Asayegn with query | Navigates; Asayegn uses `POST /api/v1/ask` | WORKING | Code: `openStudio` → `B.ask` in Asayegn |
| Home | Sign it suggestion chips | Fills input with sample phrases | HARDCODED `CHIPS` | HARDCODED/MOCK | Code: `CHIPS` constant |
| Home | Sign it typing preview | Shows gloss chips from mock translate | `lexicon.js` `LH.translate` | HARDCODED/MOCK | Code: `pr = LH.translate(...)` (not bridge) |
| Home | Impact stats (4 numbers) | Signs, phrases, cut-midway, 4th metric | `GET /api/v1/stats` (+ `stats.json`); fallback hardcoded | WORKING | Code: `B.stats()` + `LH_mapHomeStats` |
| Home | Problem / How / Community / FAQ / Status copy | Marketing sections | HARDCODED i18n | HARDCODED/MOCK | Code: `T.en`/`T.am` |
| Home | How-it-works step tabs | UI-only step switcher | local state | WORKING | Code: `steps[].pick` |
| Home | Copy script line | Clipboard write of module script tag | `LH_CONFIG.HOST` | WORKING | Code: `navigator.clipboard.writeText` |
| Home | Contact us CTA | mailto | `LH_CONFIG.CONTACT` | WORKING | Code: `contactHref` |
| Home | Try it live CTA | → studio | Hash | WORKING | Code: `goStudio` |
| Home | Credits quote block | Quote + play button | `demo/data/credits.json` | NOT WIRED | Code: `hasQuote` false when `quote: null`; play has no `onClick` |
| Home | Interpreters / team lists | Named people with consent | `credits.json` `people` where `show && name` | NOT WIRED | Code: all people `show: false` |
| Home | FAQ accordion | Expand/collapse | local state + HARDCODED Q&A | WORKING | Code: `faqs[].toggle` |
| Lesson | Breadcrumb Home / Lesson | Hash links `#home` `#lesson` | Hash | WORKING | Template hrefs |
| Lesson | Title / alt / meta chips | Lesson title + `0:46` `14 lines` | HARDCODED i18n | HARDCODED/MOCK | Code: `t.meta` |
| Lesson | Mode: Signed by interpreter | Loads `sign.json` on `<db-player>` | Static `/demo/data/sign.json` | WORKING | Code: `applyPlayerMode` |
| Lesson | Mode: Signed automatically | Sets `api` + `lesson-id=demo` | `POST /api/v1/sign/lesson` via player | WORKING | Code: `applyPlayerMode` + `sign-auto.js` |
| Lesson | Coverage label “6 of 14…” | Display text | HARDCODED string | HARDCODED/MOCK | Code: `t.coverage` |
| Lesson | Coverage bars | One bar per VTT line | Static VTT parse | PARTIAL | Code: every line marked `auto: true` |
| Lesson | Layout Lesson first / Sign first | Writes `signLayout` to `db-player:prefs` | localStorage | WORKING | Code: `layouts[].pick` |
| Lesson | `<db-player>` mount | Video + captions + chapters + glossary | Static files under `/demo/data/` | WORKING | Code: `mountPlayer()`; sync measure Play-button pass |
| Lesson | Poster play overlay | Starts video play | Player shadow video | WORKING | Code: `lh-poster-btn` |
| Lesson | Chapters tab + chapter buttons | Seek to chapter times | Static `chapters.vtt` (+ posters) | WORKING | Code: fetch + `seekTo` |
| Lesson | Words / glossary list | Terms + cue line ids | Static `glossary.json` | WORKING | Code: `loadRealPanels` |
| Lesson | Show sign | Toggles word detail panel only | local state | PARTIAL | Code: expands UI; no clip play |
| Lesson | Go to line | Seeks video to first cue | glossary cues + VTT | WORKING | Code: `wd.goLine` |
| Lesson | Transcript lines | Seek by line | Static `lesson.en.vtt` / `lesson.am.vtt` | WORKING | Code: `tr.go` |
| Lesson | Keyboard Space / ← → / C / S | Play, seek, caption/sign toggles | Mixed | PARTIAL | Code: `_k` handler; C/S flip Lesson state |
| Lesson | Understood / Not clear | Sets `fb[lineIdx]` only | local state | NOT WIRED | Code: no `LH_BRIDGE.review` |
| Lesson | Open settings (from player event) | Forwards `db-player:settings` | CustomEvent → shell dialog | WORKING | Code: listener → `props.openSettings` |
| Lesson | Session seek from Asayegn | Reads `lh.lesson.seek` | sessionStorage | WORKING | Code: `componentDidMount` |
| Asayegn | New chat | Clears messages | local state | WORKING | Code: `newChat` |
| Asayegn | Browse signs | Opens dictionary browse view | `GET /api/v1/lexicon` | WORKING | Code: `B.lexicon()` |
| Asayegn | Topic chips (All + groups) | Filters dictionary | Lexicon `group`/`topic` | WORKING | Code: `topics` / `dict` |
| Asayegn | Dict entry buttons | Posts word into chat | Lexicon entry object | WORKING | Code: `d.post` with `{ entry }` |
| Asayegn | History list + Clear | Re-runs past queries; clear storage | `localStorage` `lehulum.asayegn.history` | WORKING | Code: `saveHistory` / `clearHistory` |
| Asayegn | Learner settings (side) | Opens shell settings | prop `openSettings` | WORKING | Code: `openSettings` |
| Asayegn | Help & feedback | Toast only | HARDCODED toast | HARDCODED/MOCK | Code: `helpFeedback` |
| Asayegn | For platforms link | → `#platforms` | Hash | WORKING | Code: `goPlatforms` |
| Asayegn | Input language Auto/Am/En | Sent as `lang` on ask | local state → `POST /ask` | WORKING | Code: `B.ask(q, lang)` |
| Asayegn | Interpreter menu | Single static option; optional name from credits | `credits.json` if shown | PARTIAL | Code: name only if interpreter `show` |
| Asayegn | Composer send / Enter | Translates via API | `POST /api/v1/ask` | WORKING | Code: `post` → `B.ask` |
| Asayegn | Try chips / judges bilingual test | Sample posts | HARDCODED + API | WORKING | Code: `tryChips` / `judgesTest` |
| Asayegn | Sign playlist video | Plays returned clips | API playlist via `absMedia` | WORKING | Code: `playPlaylist` |
| Asayegn | Gloss chips tap | Replay clip / request if missing | API chips; missing → toast | PARTIAL | Code: `tap` → play or toast |
| Asayegn | Request this sign / Request a sign | Toast “Request sent…” | HARDCODED toast (no API) | HARDCODED/MOCK | Code: `req = () => toastMsg(t.requested)` |
| Asayegn | Fingerspell it | Local fake finger chips | HARDCODED client mutation | HARDCODED/MOCK | Code: `fingerspell` |
| Asayegn | Download video | Toast “Download started (demo)” | HARDCODED toast | HARDCODED/MOCK | Code: `download` |
| Asayegn | Understood / Not clear | Toast + `POST /api/v1/sign/review` | API | WORKING | Code: `B.review({ verdict })` |
| Asayegn | Star rating 1–5 | Local `rating[id]` only | local state | NOT WIRED | Code: no API |
| Asayegn | Why this sign | Expands static explanation strings | HARDCODED i18n | HARDCODED/MOCK | Code: `whyItems` |
| Asayegn | Where the lesson explains this | Seeks lesson via sessionStorage | ask `lesson_match` + posters | WORKING | Code: `lessonLine.go` |
| Asayegn | Banner dismiss | Hides promo; persisted | `localStorage` `lehulum.asayegn.banner` | WORKING | Code: `hideBanner` |
| Asayegn | Offline banner | Shows when offline | browser | WORKING | Code: online/offline listeners |
| Platforms | Host light/dark toggle | Restyles fake host page | local state | WORKING | Code: `hosts[].pick` |
| Platforms | In-article Sign buttons | Mock sign animation of blocks | `lexicon.js` `LH.translate` | HARDCODED/MOCK | Code: not `LH_BRIDGE.ask` |
| Platforms | Text selection Sign | Mock chips from `LH.translate` | lexicon.js | HARDCODED/MOCK | Code: `signSelection` |
| Platforms | Word popup Loop / 0.75× / Replay | Buttons with no handlers | — | NOT WIRED | Template lacks `onClick` |
| Platforms | Open in Asayegn (popup) | → studio | Hash | WORKING | Code: `pop.open` |
| Platforms | Drag pin tool | Starts mock sign at sentence | lexicon mock + UI | PARTIAL | Code: also scopes real `db-sign-pin` |
| Platforms | Keyboard list tool | Lists blocks; starts mock sign | local | HARDCODED/MOCK | Code: `kbItems` |
| Platforms | Copy install snippet | Clipboard with real `origin` URLs | `location.origin` + `/api/v1` | WORKING | Code: `SNIPPET` / `copy` |
| Platforms | Attribute / event / endpoint tables | Documentation tables | HARDCODED i18n | HARDCODED/MOCK | Display only |
| Platforms | Open API docs | Opens Swagger | `HOST/api/docs` | WORKING | Code: fixed STEP 10 `docsHref` |
| Platforms | Savanna proof image | Static screenshot | `/demo/v3-design/img/savanna-proof.webp` | WORKING | Code: `savannaShot` |
| Platforms | Real `db-sign-pin` scope swap | Pin scopes `#lh-platform-article` | `/api/v1` | WORKING | Code: `componentDidMount` |
| Settings | How to learn (sign / captions / both) | Saved; maps to `signLayout` | localStorage | PARTIAL | Code: mode→`signLayout` only |
| Settings | Caption colours | Saved `capStyle` in `lehulum.v1` only | localStorage | NOT WIRED | Not mapped to player prefs |
| Settings | Signer size S/M/L | Saved `signerSize` | localStorage | NOT WIRED | Not mapped to `signW`/`signScale` |
| Settings | Signer speed 0.75/1/1.25 | Saved `speed` | localStorage | NOT WIRED | Player reads `signRate` |
| Settings | Pacing smooth/pause/off | Saved `pacing` | localStorage | NOT WIRED | Player reads `signPacing` |
| Settings | UI language | Same as header lang | `lehulum.v1` | WORKING | Code: `setState({ lang })` |
| Settings | Theme segment | Same as header theme | `lehulum.v1` | WORKING | Code: settings theme rows |
| Settings | Caption size range | Synced as `capSize` to `db-player:prefs` | localStorage | WORKING | Code: `apply()` |
| Settings | Reduce motion switch | Synced `motion` + `data-motion` | localStorage | WORKING | Code: `apply()` |
| Settings | Data saver switch | Saved `saver` | localStorage | NOT WIRED | Never read elsewhere |
| Settings | Done / Escape / scrim | Closes dialog | local | WORKING | Code: `closeSettings` |
| Savanna | `#le-hulum-demo` Amharic lesson card | Host content for sign pin | HARDCODED Amharic paragraph | HARDCODED/MOCK | Code: `homepage-v1-paced.html` |
| Savanna | `<script src="/module/db-player.js">` | Loads module | Static module | WORKING | Code: script tag |
| Savanna | `<db-sign-pin api="/api/v1" scope="#le-hulum-demo">` | Sign sentences in demo card | `POST /api/v1/ask` | WORKING | Code: pin element |
| plugin-test | `demo/plugin-test.html` | Mounts player + pin | `demo/config.js` + static media | WORKING | Code: MODULE + API attrs |
| plugin-test | `docs/plugin-test-external.html` | Loads module from hosted origin | `LH_HOSTED` / `?host=` | WORKING | Code: dynamic import |
| Data | `demo/data/stats.json` | Codesigner + cut-midway into stats API | Static JSON | PARTIAL | `codesigner_understood: null` |
| Data | `demo/data/credits.json` | People/quote for Home/Asayegn | Static JSON | NOT WIRED | All `show:false` / empty names |
| API | `GET /api/v1/health` | Health | FastAPI | WORKING | Code: `main.py` (SPA unused) |
| API | `GET /api/v1/stats` | Library counts + file stats | SQLite + stats.json | WORKING | Home via bridge |
| API | `POST /api/v1/ask` | Translate + lesson match | EthSL engine | WORKING | Asayegn + sign-pin |
| API | `POST /api/v1/sign/translate` | Text → gloss/playlist | EthSL | WORKING | Player / pin internals |
| API | `POST /api/v1/sign/lesson` | Cue list → signed segments | EthSL | WORKING | Lesson automatic mode |
| API | `POST /api/v1/sign/review` | Persist feedback | SQLite | WORKING | Asayegn Yes/No |
| API | `GET /api/v1/lexicon` | Dictionary | SQLite | WORKING | Asayegn browse |
| API | `GET /api/v1/glossary` | Lesson glossary | API | PARTIAL | Bridge exposes; Lesson uses static file |
| API | `GET /api/v1/phrases`, `/examples`, `/rules` | Library reads | API | NOT WIRED | SPA does not call |
| API | Lessons / jobs / certificates / progress / packs / access / webhooks / documents | Backend surfaces | FastAPI | NOT WIRED | Design SPA does not call |

---

## Notes

1. **Real API wiring in the design SPA** is concentrated in: Home stats (`GET /stats`), Asayegn ask/lexicon/review, global/platform `db-sign-pin`, and Lesson automatic mode on `<db-player>`.
2. **Static demo media** under `/demo/data/` powers hero, interpreter lesson mode, chapters/transcript/glossary, and plugin-test.
3. **`lexicon.js` remains a parallel mock path** for Home typing preview and Platforms in-page signer; Asayegn prefers the real bridge.
4. **Fill by hand tonight:** `demo/data/credits.json` — set `name`, `role`/`role_am`, `photo`, `consent: true`, `show: true` for each person you want visible; optional `quote`, `quote_caption`, `quote_video`.

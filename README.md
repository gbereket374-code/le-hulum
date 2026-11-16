# LE HULUM (ለሁሉም) — "for all"

**Ear to the deaf. Eye for the blind.**  
ለመስማት ለተሳናቸው ጆሮ፣ ለማየት ለተሳናቸው ዓይን።

LE HULUM is an accessibility layer for online learning. One script tag turns any lesson on any website into a lesson that Deaf, blind, low-vision and hard-of-hearing learners, and learners on slow 3G connections, can actually use, with Ethiopian Sign Language (EthSL) first.

Built for the **Digital Bridge Accessibility Hackathon 2026 (ALX)**, Track 2: Accessible learning media. Built with a Deaf co-designer and certified EthSL interpreters.

| Resource | Link |
| --- | --- |
| **Live demo** | **https://le-hulum.netlify.app/** (must end in `.app` — `.netlify.com` is a dead Netlify URL and shows “Site not found”) |
| Demo home | https://le-hulum.netlify.app/demo/index.html |
| Plug-in test page | https://le-hulum.netlify.app/demo/plugin-test.html |
| API overview (on Netlify) | https://le-hulum.netlify.app/api/docs/ |
| Requirements (SRS PDF) | https://le-hulum.netlify.app/docs/le-hulum-srs.pdf |
| Full stack + API (local) | http://localhost:8080 after `scripts/dev-up.sh` |
| Swagger UI (local only) | http://localhost:8080/api/docs |
| GitHub | https://github.com/gbereket374-code/le-hulum |
| Integration guide | [docs/INTEGRATION.md](docs/INTEGRATION.md) |

No login is needed anywhere on the demo. Use **https://le-hulum.netlify.app/** — not `netlify.com`.

## Contents

1. [The problem](#1-the-problem)
2. [What LE HULUM does](#2-what-le-hulum-does)
3. [Try it in 2 minutes](#3-try-it-in-2-minutes)
4. [Add it to any platform](#4-add-it-to-any-platform)
5. [How automatic EthSL works](#5-how-automatic-ethsl-works)
6. [Architecture](#6-architecture)
7. [Run it locally](#7-run-it-locally)
8. [API reference](#8-api-reference)
9. [Open standard (file formats)](#9-open-standard-file-formats)
10. [Testing and quality](#10-testing-and-quality)
11. [Accessibility](#11-accessibility)
12. [Privacy](#12-privacy)
13. [Data, models and licences](#13-data-models-and-licences)
14. [Project structure](#14-project-structure)
15. [Honest status and roadmap](#15-honest-status-and-roadmap)
16. [Team and credits](#16-team-and-credits)

## 1. The problem

Online lessons in Ethiopia are video, audio and dense text. Four groups of learners are left out:

| Learner | What blocks them today |
| --- | --- |
| Deaf | No Ethiopian Sign Language. Captions are rare and Amharic captions almost never exist. Global sign tools only speak BSL/ASL. Booking an interpreter for every lesson does not scale. |
| Blind / low vision | Video players that don't work with a screen reader. Code and slides on screen are never read out. No tagged PDF or Braille. |
| Hard of hearing | Fast speech, small fixed captions, no way to replay a missed sentence. |
| Slow connection | 3G phones, expensive data, lessons that never finish buffering, nothing that works offline. |

## 2. What LE HULUM does

### Deaf learners (EthSL first)

- **Sign window:** a floating portrait signer you can drag anywhere, pinch or resize, fade, or swap into a sign-first layout. Settings are remembered on the device.
- **Line-by-line sync:** one interpreter clip per caption line, with idle frames trimmed automatically from motion analysis. The teacher pauses only between sentences when the signer is far behind, and the signer never pauses or runs ahead.
- **Sign glossary:** every technical word in the lesson (variable, code, error…) with its sign on demand, matched in Amharic including its prefixed and suffixed forms.
- **Automatic EthSL engine:** Amharic text in, EthSL out, as a playlist of real interpreter clips. Unknown words show "no sign yet". It never shows a wrong sign.
- **Sign this page:** a drag-and-drop pin on every demo page. Hover, tap or press Enter on a sentence to see it signed, with the Amharic line and English translation in the tray.
- **Feedback:** "Understood / Not clear" on every automatic sentence grows the library.

### Blind and low-vision learners

- Fully keyboard and screen-reader (TalkBack / NVDA / VoiceOver) operable player with a transcript.
- Audio description (a recorded human voice first, then the learner's own screen reader).
- "What's on screen": exact code and slide text, read line by line with punctuation.
- Large controls and video zoom; tagged PDF, accessible HTML and Braille (.brf) export.

### Hard-of-hearing learners

- Amharic and English captions, resizable (up to 300%) and recolourable with a contrast check; both languages at once.
- A speech-clarity audio chain (Web Audio), slow speech with natural pitch, "Say that again" (R), and visible sound alerts.

### Slow connections

- A light lesson (audio + slides + captions + sign clips), chosen automatically on 3G.
- Resumable offline download, a one-file lesson to share on Telegram or Bluetooth, and progress saved offline then sent once.

### Career gateway

- Accessible job cards (readable at 200% zoom, audio and sign summary, Ethiopian and Gregorian dates, schema.org JobPosting).
- Verifiable certificates (Open Badges 3.0, signed, QR code to a public verify page).

The Deaf features were built and tested by the core team. The blind, hard-of-hearing, slow-connection and career modules were built by teammates and integrated in commit `fdabdb3`. See [status](#15-honest-status-and-roadmap).

## 3. Try it in 2 minutes

Use the **live site** for static pages, or run the **full stack** locally when you need the API (automatic sign, Sign this page translate, Swagger).

| Page | What to do |
| --- | --- |
| [demo/index.html](https://le-hulum.netlify.app/demo/index.html) | Home. Hover the Amharic caption under the signer to see Sign this page. |
| [demo/lesson-video.html?sign=on](https://le-hulum.netlify.app/demo/lesson-video.html?sign=on) | Press Play. Watch the signer follow the Amharic captions. Drag or resize the signer. Press `G` for the word list. |
| [demo/lesson-auto.html](https://le-hulum.netlify.app/demo/lesson-auto.html) | The same lesson, signed automatically from the captions. Compare it with the human version. |
| [demo/sign-try.html](https://le-hulum.netlify.app/demo/sign-try.html) | Type any Amharic sentence (or tap an example) and watch it signed, with the gloss and coverage. Needs the API (`scripts/dev-up.sh`). |
| [demo/lesson-text.html](https://le-hulum.netlify.app/demo/lesson-text.html) | Text lesson. Hover a sentence or use **Sign this page**. Needs the API for translation. |
| [savanna/pages/homepage-v1-paced.html](http://localhost:8080/pages/homepage-v1-paced.html) | Savanna learner homepage (local Docker). |
| [demo/plugin-test.html](https://le-hulum.netlify.app/demo/plugin-test.html) | A plain third-party page that only has our script tag. |

Useful keys in the player: `Space` / `K` play, `J` / `L` back or forward 10 s, `C` captions, `S` sign window, `W` swap layout, `G` glossary, `?` all shortcuts.

## 4. Add it to any platform

### 1. Script tag (any LMS: Savanna, Moodle, WordPress, plain HTML)

Replace `HOST` with `https://le-hulum.netlify.app` for static assets, or `http://localhost:8080` when the Docker stack is running (needed for `api`).

```html
<script type="module" src="https://HOST/module/db-player.js"></script>

<!-- a video lesson -->
<db-player
  src="lesson.mp4"
  captions="lesson.am.vtt,lesson.en.vtt"
  sign="sign.json"
  glossary="glossary.json"
  api="https://HOST/api/v1"
  lang="am"></db-player>

<!-- make any text on the page signable -->
<db-sign-pin api="https://HOST/api/v1" lang="am" scope="main"></db-sign-pin>
```

If a lesson has no recorded signing, leave out `sign` and set `api` + `lesson-id`. The lesson is then signed automatically from its captions.

| Attribute | Meaning |
| --- | --- |
| `src` | lesson video or audio |
| `captions` | comma-separated WebVTT files (Amharic first) |
| `sign` | `sign.json` (line-by-line clips) or one sign video |
| `glossary` | `glossary.json` of technical words with their signs |
| `describe`, `screen` | audio description and on-screen text files |
| `api`, `lesson-id` | our API, for automatic sign, progress and certificates |
| `lang`, `theme` | `am` / `en`; `light` / `dark` / `contrast` |

Host page events (bubbling): `db-player:progress`, `db-player:complete`, `db-player:prefs`.

More detail: [docs/INTEGRATION.md](docs/INTEGRATION.md).

### 2. REST API

See [API reference](#8-api-reference) or open http://localhost:8080/api/docs after `scripts/dev-up.sh`.

### 3. Open standard

Any tool can produce our JSON files: `sign.json`, `glossary.json` and the lesson manifest. See [Open standard](#9-open-standard-file-formats).

## 5. How automatic EthSL works

```text
Amharic text
  │ 1 Memory      exact / near-exact match with a recorded phrase → human clip
  │ 2 Normalize   Ethiopic punctuation, letter variants (for matching only)
  │ 3 Grammar     roots (prefix/suffix stripping) → lexicon signs
  │               + EthSL word-order rules
  │ 4 Confidence  0.5·coverage + 0.3·rules + 0.2·agreement ≥ 0.7, and no missing content word
  │ 5 Feedback    Deaf reviewers approve or fix → added to memory
  ▼
Playlist of trimmed interpreter clips (+ pauses between clauses, face-signal badges)
```

The grammar rules (`api/ethsl/rules.yaml`) come from published Addis Ababa University EthSL research:

- time first;
- topic / subject → verb → object (commands: verb → object);
- adjectives and numbers after the noun, adverbs after the verb;
- plural with MANY;
- NOT at the end with a head shake;
- yes/no questions keep the order (eyebrows up), and WH-words go to the end;
- prepositions dropped, clauses joined by a pause.

Example: ኮዱ ካልሰራ፣ ስህተቱን አረጋግጡ። ("If the code doesn't work, check the error.") → `CODE WORK NOT ‖ CHECK ERROR` + head shake.

Ambiguous roots are resolved explicitly (`ambiguous.yaml`), and every word is accounted for. A wrong sign is worse than no sign, so the engine says "no sign yet" when unsure.

## 6. Architecture

```text
Browser (any site)                          Server (Docker)
┌───────────────────────────────┐          ┌──────────────────────────────┐
│ <db-player>  <db-sign-pin>    │  HTTPS   │ nginx: /module /demo /api     │
│ core (<60 KB): player,        │◄────────►│ FastAPI /api/v1               │
│ keyboard, captions, i18n      │          │  ├ ethsl engine (no AI needed)│
│ lazy features: deaf/ blind/   │          │  ├ caption pipeline (ASR opt.)│
│ hearing/ net/ career/         │          │  ├ progress, certificates     │
│ settings stay in localStorage │          │  └ SQLite (SQLModel)          │
└───────────────────────────────┘          └──────────────────────────────┘
```

- **Front end:** vanilla JavaScript web components, Shadow DOM, ES modules, no framework and no build step. Features load only when used.
- **Back end:** Python FastAPI, SQLModel + SQLite, ffmpeg. Optional AI providers (none / local / cloud), all with a no-AI fallback.
- **Captions:** script alignment, or speech recognition (faster-whisper for English; Amharic models switchable).
- **Static hosting:** Netlify publishes the demo at `/` and `/demo/`, the player at `/module/`. The Python API runs in Docker.

## 7. Run it locally

Requirements: Docker with the compose plugin, Node 20+ (tests only), Python 3.11+ (tools only).

```bash
git clone https://github.com/gbereket374-code/le-hulum.git
cd le-hulum
cp .env.example .env          # no secrets needed for the demo
scripts/dev-up.sh             # builds, starts, smoke-tests, prints the links
```

`dev-up.sh` prints laptop links (`http://localhost:8080/...`) and a public HTTPS tunnel link for phones (Cloudflare quick tunnel). Stop with `scripts/dev-down.sh`.

## 8. API reference

Base path `/api/v1`. Interactive docs: http://localhost:8080/api/docs.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | status |
| POST | `/lessons` | upload a video (+ optional script) → timed captions |
| GET | `/lessons/{id}` | caption job status and files |
| POST | `/sign/translate` | `{text, lang}` → gloss, layer, confidence, coverage, playlist, `text_en` |
| POST | `/sign/lesson` | `{lesson_id, cues[]}` → `sign.json` for a whole lesson |
| POST | `/sign/review` | Understood / Not clear feedback |
| GET | `/lexicon`, `/phrases`, `/glossary`, `/examples`, `/rules` | sign library |
| GET | `/media/...` | sign clips (supports Range requests) |
| POST/GET | `/progress` | learner progress (idempotent, offline queue) |
| POST/GET | `/certificates`, `/certificates/verify` | issue and verify Open Badges 3.0 |
| GET | `/jobs`, `/jobs/{id}/jsonld` | accessible job postings |

Example:

```bash
curl -X POST http://localhost:8080/api/v1/sign/translate \
  -H 'Content-Type: application/json' \
  -d '{"text":"ኮዱ አልሰራም።","lang":"am"}'
```

## 9. Open standard (file formats)

JSON Schemas are in `schemas/`.

- **sign.json:** per caption line, either a recorded clip (`src`, `from`, `to`), a playlist of word clips, or `"source": "none"`.
- **glossary.json:** terms with Amharic and English forms, the lines they appear in, and their sign clip.
- **screen.json:** timed on-screen code and slide text.
- **manifest:** lesson variants (full / light / audio) with sizes and hashes for offline use.
- **Captions:** standard WebVTT with `<v Speaker>` and `[sound]` cues.

## 10. Testing and quality

```bash
node --test module/tests                 # player, sign scheduling, glossary, pin
python -m pytest                         # API, engine, tools
npx playwright test tests/sync           # real-browser sign sync measurement
python tools/eval_sign.py                # EthSL engine evaluation
```

Measured on the demo lesson in a real browser:

| Check | Result |
| --- | --- |
| Teacher pauses inside a sentence | 0 |
| Signer ahead of the teacher | 0% |
| Maximum signer lag | ≈3.0 s (normal interpreter range) |
| A broken clip | skipped once, the lesson never freezes |
| EthSL rule examples (E01–E20) | 95% exact gloss |
| Savanna demo paragraph | 6/6 sentences signed automatically, 100% coverage |
| axe accessibility scan, our pages | 0 violations (light, dark, high contrast) |

## 11. Accessibility

Target WCAG 2.2 AA:

- keyboard only, with visible 3 px focus;
- 44 px targets;
- reflow at 320 px and 400% zoom;
- reduced motion respected;
- nothing by colour alone;
- every drag has a button or keyboard alternative;
- captions and signer never cover each other;
- shortcuts scoped to the player.

Tested with axe, keyboard-only runs and TalkBack on Android.

## 12. Privacy

- Learner settings and needs stay on the device (`localStorage`). They are never sent to the server or to an employer, and never appear on a certificate.
- The sign pin sends only text inside the chosen area, only after the learner starts, and only to the configured API.
- No API keys in browser code. Test data only in the demo.

## 13. Data, models and licences

- **Sign data:** recorded for this project with certified EthSL interpreters and a Deaf co-designer, with consent:
  - 14 lesson phrases (A01–A14);
  - 25 common phrases (B01–B25);
  - 64 word signs;
  - 20 example sentences.
- **Grammar:** rules derived from Addis Ababa University EthSL research (A. J. Haji, 2017, §2.6).
- **Models:** only licences that allow commercial use (for example faster-whisper MIT; Omnilingual ASR Apache-2.0, optional). Non-commercial models (MMS-TTS, NLLB) are deliberately not used. Full list in [docs/models.md](docs/models.md).
- **Fonts:** Atkinson Hyperlegible, Noto Sans Ethiopic, JetBrains Mono (SIL OFL), self-hosted.

## 14. Project structure

```text
module/            the plug-in (db-player.js + core/ deaf/ blind/ hearing/ net/ career/ i18n/)
api/               FastAPI app: routes/, ethsl/ (engine), pipeline/ (captions), providers/
demo/              demo pages + demo/data/ (lesson, captions, sign clips, lexicon)
savanna/           frozen Savanna pages (only our demo block added to the learner homepage)
schemas/           JSON Schemas (sign, glossary, screen, manifest)
tools/             data tools: clip cutting, trimming, alignment, glossary, evaluation
tests/             Playwright sync and accessibility tests
docs/              SRS, design, models, evaluation reports, INTEGRATION.md
scripts/           dev-up.sh / dev-down.sh / vercel-public.sh
netlify.toml       publish the demo from GitHub
```

## 15. Honest status and roadmap

- Real accuracy is the Deaf co-designer's rating (understood / partly / not) on unseen sentences, which is in progress. Rule-example scores measure consistency, not understanding.
- The automatic lesson currently signs 6 of 14 lines. The rest show "no sign yet" until missing words are recorded (pointing signs, fingerspelling alphabet, common verbs).
- **Next:**
  - grow the sign library with interpreters;
  - Amharic speech recognition for any uploaded video;
  - smoother clip blending;
  - a pilot on Savanna with ALX learners, then universities and TVETs.

## 16. Team and credits

- Core repository: [gbereket374-code/le-hulum](https://github.com/gbereket374-code/le-hulum), with teammate contributions from the [lehulum](https://github.com/mr-Ayalk/lehulum) fork (integrated in `fdabdb3`).
- Deaf co-designer and EthSL interpreters (credited with consent).
- Digital Bridge / ALX for the hackathon and the Savanna pages.

**LE HULUM: accessibility for all, one script tag at a time.**

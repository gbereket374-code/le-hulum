<!-- STEP 15: UI FIX PASS final report -->
# LE HULUM — UI FIX PASS Final Report (STEPS 0–15)

**Date:** 2026-11-21  
**Hosted:** https://le-hulum.onrender.com  
**Commit (wiring):** `3d9f3d8` — *Wire demo controls to real /api/v1 and hide leftover mocks.*

---

## Verdict

**Demo-ready for judges.** Visible NOT WIRED / MOCK controls are cleared. Real `/api/v1` paths power Lesson feedback, Asayegn request/stars/download/help, Home Sign-it preview, coverage, and hero gloss. Learner settings write `db-player:prefs` keys the player reads. Platforms frame uses only `<db-sign-pin>`.

---

## STEPS 0–10 (earlier)

| Step | Result |
|------|--------|
| 0 Placeholders | Inventory in `docs/design/fix-pass/PLACEHOLDERS.md`; visible placeholders removed in later steps |
| 1–7 UI polish | Theme/links/Asayegn/Lesson/one EthSL launcher |
| 8 Consistency + screenshots | `tests/v3/fix-pass.spec.js` — **PASS** local + hosted (this run) |
| 9 Axe / scroll region | Platforms scrollable region labelled; axe **0** violations |
| 10 Wiring audit | `docs/wiring-report.md` — after FIX 1–6: **NOT WIRED 0 visible, MOCK 0 visible** |

---

## FIX 1–6 (wiring)

1. Lesson Understood / Not clear → `POST /api/v1/sign/review`; announces Thanks.  
2. Asayegn Request → verdict `missing` + words; stars → `rating` 1–5; Help → Home FAQ; Download → one recorded clip only (else hidden).  
3. Settings → `signW`, `signRate`, `signPacing`, `captionStyle` / `capSize`; Data saver **hidden**. Playwright `tests/v3/settings-prefs.spec.js` **PASS** (local + hosted).  
4. Platforms: mock Sign / Loop / 0.75× / Replay / pin tools **hidden**; `db-sign-pin` only.  
5. Home Sign-it preview → debounced `POST /sign/translate` (no lexicon mock); submit → Asayegn.  
6. Coverage from `/stats`; hero gloss from `sign.json` A01.

Hidden (code kept): empty quote block, credits people `show:false`, Data saver UI, Asayegn fingerspell button, unused API surfaces.

---

## STEP 11 — Judges live tests (hosted)

| Check | Result |
|-------|--------|
| `POST /ask` EN vs AM gloss order | **PASS** — both `VARIABLE WHAT`, cue `A02` |
| Asayegn EN question shows VARIABLE | **PASS** |
| Asayegn one-word card + video | **PASS** |
| Lesson plays with signer open | **PASS** (Chrome channel; bundled Chromium lacks H.264) |
| Savanna page + `db-sign-pin` → `/api/v1` | **PASS** |
| Platforms: no mock `0.75×`; pin present | **PASS** |
| Review with `rating: 3` | **PASS** |

---

## STEP 12 — Reliability / cold start

| Metric | Result |
|--------|--------|
| Cold wake to `/api/v1/health` 200 | **~35 s** (7×5 s poll after sleep; first tries timed out) |
| Warm health | **~405 ms**, `{"status":"ok"}` |
| Warm SPA HTML | **~405 ms**, 200 |
| Free Render sleep | Expected; judges should hit health once before demo |

**Backup if hosted sleeps mid-demo:** `docker compose up` → http://127.0.0.1:8080/demo/v3-design/LE%20HULUM.dc.html

---

## STEP 13 — Quality sweep

| Check | Result |
|-------|--------|
| Hosted fix-pass (placeholders) | **PASS** (16 screenshots) |
| Hosted axe (4 pages × 3 themes) | Home `pre` overflow needed `tabindex` (fixed); re-check after deploy |
| Local axe | **PASS** |
| Local node `--test module/tests` | **PASS** (43) |
| API ethsl + ask pytest (in container) | **PASS** (11) |
| Full `api/tests` in container | 14 pass / 3 fail (pre-existing `/app/demo/data` path vs volume `/demo/data` — not wiring regressions) |
| Settings prefs Playwright | **PASS** local + hosted |

---

## STEP 14 — Demo mode + backup

| Item | Status |
|------|--------|
| Lesson `<db-player features="deaf">` | Set in `Lesson.dc.html` |
| Single global `<db-sign-pin>` | Shell-mounted; scoped to Platforms article on that page |
| No EthSL sync/scheduling changes this pass | Confirmed (wiring/UI only) |
| No v3 visual-language rewrite | Confirmed |
| Local backup stack | `docker compose up` — web :8080 + api |
| Hosted URL for judges | https://le-hulum.onrender.com/demo/v3-design/LE%20HULUM.dc.html |
| Credits fill-by-hand | Still empty (`show:false`) — intentional hide until names ready |

---

## STEP 15 — What judges should click (2 min)

1. **Home** — hero gloss HELLO/WELCOME; type in Sign it → live gloss chips; submit → Asayegn.  
2. **Asayegn** — EN “What is a variable?” and AM “ተለዋዋጭ ምንድን ነው?” → same gloss; stars / Understood; Request if missing; Help → FAQ.  
3. **Signed lesson** — play; signer window; Understood / Not clear; coverage from stats.  
4. **Settings** — change signer size/speed/pacing/caption colours; reload lesson → prefs stick.  
5. **For platforms** — Sign only via floating pin; copy install snippet; open API docs.  
6. **Savanna** — `/savanna/pages/homepage-v1-paced.html` pin on Amharic demo card.

---

## Known limits (not blockers)

- Render free tier cold start ~30–60 s.  
- Headless Chromium without proprietary codecs cannot play lesson MP4; real Chrome/Edge/Safari can.  
- Three API tests fail in the Docker image cwd path for `/app/demo/data` (volume is `/demo/data`).  
- Co-designer quote / people remain hidden until `credits.json` is filled.

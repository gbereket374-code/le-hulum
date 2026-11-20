# Design v3 → Demo file inventory

Design source: `Design system questions/` — DC (Design Compiler) exports from the
LE HULUM design system. The JS files in `/tmp/lh-design-extract/` contain component
state, i18n strings, and render logic extracted from each `.dc.html` page.

---

## Page mapping

| Design page | DC export | Demo target file | Status |
|---|---|---|---|
| LE HULUM (tokens + chrome) | `LE_HULUM.dc.html` → `LE_HULUM.js / .css` | `demo/tokens.css`, `demo/shell/` | ✅ Implemented (v3) |
| Home | `Home.dc.html` → `Home.js / .css` | `demo/index.html` | 🟡 Existing v2; needs rebuild |
| Lesson (video player) | `Lesson.dc.html` → `Lesson.js / .css` | `demo/lesson-video.html` | 🟡 Existing v2 |
| Asayegn (sign studio chat) | `Asayegn.dc.html` → `Asayegn.js / .css` | `demo/asayegn.html` | ❌ Not created yet |
| For platforms | `Platforms.dc.html` → `Platforms.js / .css` | `demo/for-platforms.html` | ❌ Not created yet |
| For platforms (v1 alt) | `Platforms_v1.dc.html` → `Platforms_v1.js` | (archived) | ⬜ Design iteration, unused |
| Studio.dc.html | (not in extract) | — | ⬜ Unused; API studio lives in `api/studio/` |

---

## Shell chrome mapping

| Design element | Demo file |
|---|---|
| Tokens / global CSS | `demo/tokens.css` (replaced) |
| Shell i18n strings | `demo/shell/i18n.js` (new) |
| Prefs persistence | `demo/shell/prefs.js` (new) |
| Shell styles | `demo/shell/shell.css` (new) |
| `<demo-shell>` element | `demo/shell/demo-shell.js` (new) |
| Old v2 shell | `demo/shell.js` (kept; legacy pages still import it) |

---

## Gaps / missing assets

### Upload placeholders
The following assets are referenced in DC exports but are not present in `demo/`:

| Asset | Referenced in | Notes |
|---|---|---|
| Interpreter video (3:4, upper body) | Home.dc.html hero | Only memory clips A01–A14 exist |
| Co-designer signed quote video | Home.dc.html community section | Placeholder text only |
| Interpreter portraits × 2 | Home.dc.html team section | `[Interpreter name]` placeholders |
| Team member photos × 4 | Home.dc.html team section | `[Name]` placeholders |
| Asayegn sidebar illustration | Asayegn.dc.html empty state | Not present |
| `demo/data/asayegn-bg.webp` | Asayegn hero | Not present |

### Pages not yet created
- `demo/asayegn.html` — DC design exists; content from `Asayegn.js / .css`
- `demo/for-platforms.html` — DC design exists; content from `Platforms.js / .css`

### Screenshot placeholders used in existing demo
- `demo/data/lesson-poster.webp` — exists ✅
- `demo/data/slides/1-4.webp` — exists ✅

### Fonts
All fonts referenced by v3 tokens are present in `demo/fonts/`:
- `instrument-sans-{400,600,700}.woff2` ✅
- `literata-{400,700}.woff2` ✅
- `noto-serif-ethiopic-{400,700}.woff2` ✅
- `noto-sans-ethiopic-{400,600,700}.woff2` ✅
- `jetbrains-mono-{400,600}.woff2` ✅
- Legacy: `bricolage-grotesque-{700,800}.woff2` ✅ (kept for compat)
- Legacy: `atkinson-hyperlegible-{400,700}.woff2` ✅ (kept for compat)

### Studio.dc.html
Not present in `/tmp/lh-design-extract/`. The API studio tools in `api/studio/`
(`caption-editor.html`, `descriptions.html`, `record.html`, `sign-review.html`) are
internal reviewer tools, not public demo pages, and are not affected by this rebuild.

---

## Token migration notes

The v2 demo used an amber/terracotta palette with `--lh-*` custom properties.  
The v3 design system uses a blue/indigo palette with flat names (`--bg`, `--surface`, `--ink`, `--accent`).  
`demo/tokens.css` v3 declares both: the new flat tokens (source of truth) plus `--lh-*`
aliases so existing module CSS continues to work without modification.

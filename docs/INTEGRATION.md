# Plug LE HULUM into a lesson page

Replace `HOST` with the origin that serves this project, for example `http://localhost:8080`. The page that embeds the player can live on a different origin. The module loads its own fonts from the script URL.

```html
<script type="module" src="HOST/module/db-player.js"></script>
<db-player
  src="HOST/demo/data/lesson.mp4"
  poster="HOST/demo/data/lesson-poster.webp"
  captions="HOST/demo/data/lesson.am.vtt,HOST/demo/data/lesson.en.vtt"
  sign="HOST/demo/data/sign.json"
  glossary="HOST/demo/data/glossary.json"
  lang="am"></db-player>
<article id="line"><p>ኮዱ ካልሰራ፣ ስህተቱን አረጋግጡ።</p></article>
<db-sign-pin api="HOST/api/v1" lang="am" scope="#line"></db-sign-pin>
```

One script tag registers both `<db-player>` and `<db-sign-pin>`.

## Attributes

`<db-player>` reads:

| Attribute | Meaning |
| --- | --- |
| `src` | Lesson video URL |
| `poster` | Image shown before play |
| `captions` | Comma-separated WebVTT URLs. Put Amharic first when `lang` is `am` |
| `sign` | Sign-track JSON. Clip paths are resolved next to that file |
| `glossary` | Glossary JSON for the words panel |
| `lang` | `am` or `en` |
| `api` | API origin and prefix, such as `HOST/api/v1` |
| `lesson-id` | Lesson id used with `api` for automatic sign, packs, and progress |
| `describe` | Comma-separated audio-description URLs (`.vtt` or audio) |
| `screen` | JSON of on-screen text with `start`, `end`, `title`, and `content` |
| `chapters` | WebVTT chapter file |
| `data-sign-open` | Open the sign window when the player connects |

`<db-sign-pin>` reads `api`, `lang`, and `scope` (a CSS selector for the text to sign). `?sign=on` on the page URL opens the sign window. `?pin=open` opens the pin list.

## Events

Listen on the `<db-player>` element. Both events bubble and cross the shadow boundary.

| Event | `detail` |
| --- | --- |
| `db-player:progress` | `{ seconds, percent }` while the lesson plays |
| `db-player:complete` | `{}` once, when the lesson reaches the end |

## API

Interactive reference: [HOST/api/docs](http://localhost:8080/api/docs).

The API accepts `GET` and `POST` from any origin and does not use credentials. Sign a sentence with `POST HOST/api/v1/sign/translate`.

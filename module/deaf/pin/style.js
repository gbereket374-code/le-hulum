// FR-IN-02, FR-DEAF-01, NFR-A11Y: Pin UI. Nothing here touches the host page.
const font = (file) => new URL("../../fonts/" + file, import.meta.url).href;
export const PIN_CSS = `
@font-face{font-family:"LH Pin";src:url("${font("noto-sans-ethiopic-400.woff2")}") format("woff2");unicode-range:U+1200-139F,U+2D80-2DDF,U+AB00-AB2F;font-display:swap}
@font-face{font-family:"LH Pin";src:url("${font("atkinson-hyperlegible-700.woff2")}") format("woff2");font-weight:700;unicode-range:U+0000-00FF;font-display:swap}
@font-face{font-family:"LH Pin";src:url("${font("atkinson-hyperlegible-400.woff2")}") format("woff2");unicode-range:U+0000-00FF;font-display:swap}
:host{position:fixed;left:0;top:0;width:0;height:0;overflow:visible;z-index:2147483000;pointer-events:none;display:block;font-family:"LH Pin",var(--bs-body-font-family,system-ui),sans-serif;font-size:1rem;line-height:1.5;--pin:var(--lh-accent,#0A6B4E);--pin-ink:var(--lh-on-accent,#fff);--pin-text:var(--bs-body-color,var(--lh-text,#1c1b18));--pin-surface:var(--bs-body-bg,var(--lh-surface,#fff));--pin-focus:var(--lh-focus,#1c1b18);color:var(--pin-text)}
:host,:host *{box-sizing:border-box}
:host :focus-visible{outline:3px solid var(--pin-focus);outline-offset:2px}
[hidden]{display:none !important}
.launch,.panel,.pin,.pick,.tray,.sign{pointer-events:auto}
.launch{position:fixed;right:1rem;bottom:1rem;left:auto;z-index:6;min-width:48px;min-height:52px;display:flex;flex-direction:row;align-items:center;justify-content:center;gap:.55rem;padding:.35rem 1.1rem .35rem .55rem;border:0;border-radius:var(--r-pill,999px);background:var(--bs-body-color,var(--lh-text,#0e1525));color:var(--bs-body-bg,var(--lh-surface,#fff));font:inherit;font-weight:700;text-align:start;box-shadow:0 10px 28px rgba(0,0,0,.28)}
.launch::before{content:"";flex:none;width:32px;height:32px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#8ea9ff,#2747d6 55%,#f2b544);box-shadow:inset 0 0 0 1px rgba(255,255,255,.35)}
.launch [lang=am]{line-height:1.7;letter-spacing:0;font-size:.72rem;opacity:.9}
.launch [lang=en]{font-size:.95rem;letter-spacing:.02em}
.panel{position:fixed;right:1rem;left:auto;bottom:5.5rem;z-index:6;width:min(22rem,calc(100vw - 2rem));max-height:min(50vh,24rem);margin:0;padding:.75rem;overflow:auto;border:1px solid var(--pin-text);border-radius:var(--r-l,24px);background:var(--pin-surface);color:var(--pin-text);box-shadow:0 12px 32px rgba(0,0,0,.25)}
.panel::backdrop{background:transparent}
.title{margin:0 0 .5rem;font-weight:700;line-height:1.7}
.list{display:flex;flex-direction:column;gap:.5rem}
.list button,.close,.pick,.request,.row button,.votes button,.chip{min-height:44px;font:inherit;color:var(--pin-text)}
.close,.list button,.pick,.request,.row button,.votes button{border:1px solid var(--pin-text);border-radius:var(--r-s,10px);background:var(--pin-surface)}
.list button{padding:.4rem .7rem;text-align:start;line-height:1.7}
.pin{position:fixed;right:1rem;bottom:5.5rem;z-index:6;min-width:44px;min-height:44px;width:48px;height:48px;border:0;border-radius:50%;background:var(--pin);color:var(--pin-ink);box-shadow:0 8px 20px rgba(0,0,0,.28);touch-action:none}
.tip{position:absolute;left:50%;bottom:-10px;width:14px;height:14px;transform:translateX(-50%) rotate(45deg);background:var(--pin)}
.pick{position:fixed;z-index:7;padding:0 .7rem;background:var(--pin);color:var(--pin-ink);border-color:transparent}
.stage{position:fixed;inset:0;z-index:4;pointer-events:none}
.stage .sign-window{pointer-events:auto}
.tray{position:fixed;z-index:5;max-height:42vh;overflow:auto;padding:.75rem;border:1px solid var(--pin-text);border-radius:var(--r-m,16px);background:var(--pin-surface);color:var(--pin-text);line-height:1.7;box-shadow:0 12px 32px rgba(0,0,0,.25)}
.tray p{margin:.35rem 0}
.source{font-weight:700;line-height:1.7}
.translation{color:color-mix(in srgb,var(--pin-text) 72%,transparent);font-size:.95rem}
.chips{display:flex;flex-wrap:wrap;gap:.35rem}
.chip{display:inline-flex;align-items:center;gap:.25rem;padding:0 .65rem;border:1px solid var(--pin-text);border-radius:var(--r-pill,999px);background:transparent}
.chip svg{width:1rem;height:1rem}
.row,.votes{display:flex;flex-wrap:wrap;gap:.35rem}
.row button,.votes button{flex:1;min-width:44px;padding:0 .4rem}
.votes button[aria-pressed=true]{box-shadow:inset 0 -3px 0 var(--pin)}
.box{position:fixed;z-index:3;pointer-events:none;background:color-mix(in srgb,var(--pin) 20%,transparent);box-shadow:inset 0 -3px 0 var(--pin)}
.none{font-weight:700}
.area{position:fixed;z-index:2;pointer-events:none;border-radius:var(--r-s,10px);background:color-mix(in srgb,var(--pin) 10%,transparent);box-shadow:0 0 0 2px color-mix(in srgb,var(--pin) 45%,transparent)}
.sign{position:fixed;z-index:5;width:36px;height:36px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;background:var(--pin);color:var(--pin-ink);box-shadow:0 4px 12px rgba(0,0,0,.28);cursor:pointer}
.sign svg{width:20px;height:20px;fill:currentColor}
@media (pointer:coarse){.sign{width:44px;height:44px}}
.sign-window[aria-busy=true]::after{content:"";position:absolute;left:50%;top:50%;z-index:3;width:36px;height:36px;margin:-18px 0 0 -18px;border:4px solid color-mix(in srgb,var(--pin) 30%,transparent);border-top-color:var(--pin);border-radius:50%;animation:pin-spin .8s linear infinite}
@keyframes pin-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion: reduce){:host *{transition:none !important;animation:none !important}}
@media (prefers-contrast: more){:host{--pin:#ffff00;--pin-ink:#000;--pin-focus:#00e5ff}.launch,.pin,.sign,.tray,.panel,.chip{border:2px solid CanvasText}}
`;

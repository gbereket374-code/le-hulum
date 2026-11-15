// FR-DEAF-09, FR-DEAF-10: The Words panel. Search, this-line switch, and each term.
const CSS = `<style data-words>
.words{margin:0;padding:1rem;border-top:1px solid var(--lh-line,#D9D3C7);background:var(--lh-surface,#fff);color:var(--lh-text,#1C1B18);max-height:70vh;overflow:auto}
@media (min-width:720px){
.player:has(#words-panel:not([hidden])){display:grid;grid-template-columns:minmax(0,1fr) minmax(16rem,22rem)}
.player:has(#words-panel:not([hidden]))>.stage{grid-area:1/1}
.player:has(#words-panel:not([hidden]))>.controls{grid-area:2/1}
.player:has(#words-panel:not([hidden]))>.below{grid-area:3/1}
.player:has(#words-panel:not([hidden]))>.panels{grid-area:1/2/span 4;border-left:1px solid var(--lh-line,#D9D3C7);min-height:0}
.player:has(#words-panel:not([hidden]))>.sr-only,.player:has(#words-panel:not([hidden]))>dialog{grid-column:1}
.player:has(#words-panel:not([hidden])) .words{border-top:0;max-height:none}
}
.words h2{margin:0 0 .75rem;font-size:1.35rem;line-height:1.5}
.words input,.words button{min-height:2.75rem;font:inherit}
.words input{width:100%;margin:0 0 .5rem;padding:0 .75rem;border:1px solid var(--lh-border,#8A8478);border-radius:8px;background:var(--lh-surface,#fff);color:inherit}
.words .row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:.75rem}
.words .switch{min-height:2.75rem;padding:0 .75rem;border:1px solid var(--lh-border,#8A8478);border-radius:8px;background:transparent;color:inherit}
.words .switch[aria-checked="true"]{box-shadow:inset 0 -3px 0 var(--lh-accent,#0A6B4E)}
.words ul{list-style:none;margin:0;padding:0}
.words li{padding:.75rem 0;border-top:1px solid var(--lh-line,#D9D3C7)}
.words .am{margin:0;font-size:1.5rem;line-height:1.7}
.words .en,.words .cues,.words .empty{margin:.15rem 0 .4rem;color:var(--lh-text-muted,#57534A)}
.words li button{margin:0 .4rem .25rem 0;padding:0 .9rem;border:1px solid var(--lh-border,#8A8478);border-radius:8px;background:var(--lh-surface,#fff);color:inherit}
.words :focus-visible{outline:3px solid var(--lh-focus,#1C1B18);outline-offset:2px}
.word-card{position:absolute;left:0;right:0;bottom:0;z-index:6;display:flex;flex-wrap:wrap;gap:.35rem;max-height:100%;overflow:auto;padding:.4rem;background:var(--lh-player-bg,#14130F);color:var(--lh-player-text,#F3F0E8)}
.word-card p{flex:1 0 100%;margin:0;font-size:.9rem;line-height:1.4}
.word-card button{min-height:2.75rem;padding:0 .75rem;border:1px solid var(--lh-player-border,#8C8678);border-radius:8px;background:transparent;color:inherit;font:inherit}
.word-card button:focus-visible{outline:3px solid var(--lh-player-focus,#FFD54A);outline-offset:2px}
</style>`;

function node(tag, attrs, text) {
  const item = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([key, value]) => item.setAttribute(key, value));
  if (text != null) item.textContent = text;
  return item;
}

export function attachPanel(player, terms, show) {
  if (!player.shadow.querySelector("style[data-words]")) player.shadow.append(document.createRange().createContextualFragment(CSS));
  const root = node("section", { class: "words" });
  root.hidden = true;
  const title = node("h2", { id: "words-title" });
  root.id = "words-panel";
  root.setAttribute("aria-labelledby", "words-title");
  const search = node("input", { type: "search" });
  const count = node("p", { role: "status" });
  const only = node("button", { type: "button", class: "switch", role: "switch", "aria-checked": "false" });
  const shut = node("button", { type: "button" });
  const list = node("ul");
  const empty = node("p", { class: "empty", "aria-hidden": "true" });
  empty.hidden = true;
  root.append(title, search, count, node("div", { class: "row" }, ""), empty, list);
  root.querySelector(".row").append(only, shut);
  shut.addEventListener("click", () => close());
  player.slots.panels.append(root);
  let cue = "";
  let open = false;

  function paint() {
    const query = search.value.trim().toLowerCase();
    const line = only.getAttribute("aria-checked") === "true";
    const onLine = terms.filter((term) => !line || term.cues.includes(cue));
    const rows = onLine.filter((term) => !query || [term.am, term.en, ...(term.forms_am || []), ...(term.forms_en || [])].some((form) => String(form).toLowerCase().includes(query)));
    list.replaceChildren();
    const none = line && !onLine.length;
    empty.hidden = !none;
    empty.textContent = none ? player.t("no_words_line") : "";
    count.textContent = none ? player.t("no_words_line") : player.t("results_count", { count: rows.length });
    for (const term of rows) {
      const item = node("li");
      const am = node("p", { class: "am", lang: "am" }, term.am);
      const en = node("p", { class: "en", lang: "en" }, term.en);
      const where = node("p", { class: "cues" }, term.cues.join(", "));
      const sign = node("button", { type: "button" }, player.t("show_sign"));
      const go = node("button", { type: "button" }, player.t("go_to_line"));
      sign.addEventListener("click", () => show(term));
      go.addEventListener("click", () => jump(term));
      item.append(am, en, where, sign, go);
      list.append(item);
    }
  }
  function jump(term) {
    const cues = player.captions?.getCues?.("am") || player.captions?.getCues?.("en") || [];
    const hit = cues.find((item) => item.id === term.cues[0]);
    if (hit) player.media.currentTime = hit.start;
  }
  function labels() {
    title.textContent = player.t("words_in_lesson");
    search.setAttribute("aria-label", player.t("search_words"));
    search.placeholder = player.t("search_words");
    only.textContent = player.t("only_this_line");
    shut.textContent = player.t("close");
    paint();
  }
  search.addEventListener("input", paint);
  only.addEventListener("click", () => { only.setAttribute("aria-checked", only.getAttribute("aria-checked") === "true" ? "false" : "true"); paint(); });
  root.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    close();
  });
  function close() { open = false; root.hidden = true; button.focus(); }
  function toggle() {
    open = !open;
    root.hidden = !open;
    button.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { labels(); search.focus(); }
  }
  const button = player.addControl({ id: "glossary", order: 49, labelKey: "words", onClick: toggle });
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "words-panel");
  labels();
  return { toggle, close, setCue(id) { cue = id || ""; if (open) paint(); }, root, button, search, only };
}

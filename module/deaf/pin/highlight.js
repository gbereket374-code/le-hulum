// FR-IN-06: Mark the current sentence without editing the host page.
const RULE = "::highlight(lh-sentence){background-color:color-mix(in srgb, var(--lh-accent, var(--bs-primary, #0A6B4E)) 20%, transparent);text-decoration-line:underline;text-decoration-thickness:2px;text-underline-offset:.15em}";
let sheet = null;

export function showHighlight(range) {
  if (!range || !window.CSS?.highlights || !window.Highlight) return false;
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(RULE);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }
  CSS.highlights.set("lh-sentence", new Highlight(range));
  return true;
}

export function clearHighlight() {
  window.CSS?.highlights?.delete("lh-sentence");
}

export function reveal(range) {
  const node = range?.startContainer?.nodeType === 1 ? range.startContainer : range?.startContainer?.parentElement;
  if (!node?.scrollIntoView) return;
  const narrow = matchMedia("(max-width: 30rem)").matches;
  node.scrollIntoView({ block: narrow ? "start" : "nearest", behavior: "auto" });
  if (narrow && range.getBoundingClientRect().top > 12) window.scrollBy(0, range.getBoundingClientRect().top - 12);
}

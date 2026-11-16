// FR-DEAF-09, FR-SL-08, FR-SL-09: Chips, coverage, the face signal, and the beta vote.
const NS = "http://www.w3.org/2000/svg";
const PATHS = {
  sign: "M4 16c1-6 4-9 8-9s7 3 8 9",
  fingerspell: "M3 18V6h3m4 12V6h3m4 12V6h3",
  index: "M12 20V5m0 0L8 9m4-4l4 4",
  missing: "M6 6l12 12M18 6L6 18",
  pause: "M7 5h3v14H7zm7 0h3v14h-3z"
};
const FACES = { neg: "face_neg", "q-yn": "face_yn", "q-wh": "face_wh" };

function icon(kind) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", PATHS[kind] || PATHS.sign);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2");
  svg.append(path);
  return svg;
}

function chip(item, t, onPlay) {
  const kind = PATHS[item.kind] ? item.kind : "missing";
  const name = t("chip_" + kind) + " " + (item.gloss || "");
  const node = document.createElement(item.clip ? "button" : "span");
  if (item.clip) node.type = "button";
  node.className = "chip chip-" + kind;
  node.append(icon(kind), document.createTextNode(" " + (item.gloss || "")));
  node.setAttribute("aria-label", name);
  if (item.clip) node.addEventListener("click", () => onPlay(item));
  return node;
}

export function paintResult(refs, result, sentence, t, hooks) {
  const gloss = result.gloss || [];
  refs.chips.replaceChildren(...gloss.map((item) => chip(item, t, hooks.playClip)));
  const content = gloss.filter((item) => ["sign", "missing", "fingerspell"].includes(item.kind));
  const signed = content.filter((item) => item.kind === "sign").length;
  refs.coverage.textContent = result.layer === "memory"
    ? t("coverage_phrase")
    : t("coverage_words", { signed, total: content.length || 0 });
  refs.face.textContent = (result.nonmanual || []).map((id) => (FACES[id] ? t(FACES[id]) : "")).filter(Boolean).join(" · ");
  refs.face.hidden = !refs.face.textContent;
  const auto = result.layer === "auto";
  const none = result.layer === "none";
  refs.beta.hidden = !auto;
  refs.beta.textContent = auto ? t("sign_beta") : "";
  refs.votes.hidden = !auto;
  refs.none.hidden = !none;
  refs.none.textContent = none ? t("pin_none") : "";
  refs.request.hidden = !none;
  refs.request.disabled = false;
  refs.request.textContent = t("pin_request");
  refs.request.onclick = () => hooks.request();
  refs.thanks.hidden = true;
  refs.yes.disabled = hooks.voted;
  refs.no.disabled = hooks.voted;
  refs.yes.setAttribute("aria-pressed", "false");
  refs.no.setAttribute("aria-pressed", "false");
  refs.yes.onclick = () => hooks.vote("approve", refs.yes);
  refs.no.onclick = () => hooks.vote("fix", refs.no);
  refs.pause.textContent = t("pin_pause");
  refs.pause.setAttribute("aria-pressed", "false");
  void sentence;
}

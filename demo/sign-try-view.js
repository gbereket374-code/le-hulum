// FR-SL-09, FR-SL-10: Gloss chips, face signals, and one vote per sentence.
import { t } from "/module/core/i18n.js";

const NS = "http://www.w3.org/2000/svg";
const KIND = { sign: "chip_sign", fingerspell: "chip_fingerspell", index: "chip_index", missing: "chip_missing", pause: "chip_pause" };
const FACE = { neg: "face_neg", "q-yn": "face_yn", "q-wh": "face_wh" };
const LAYER = { memory: "layer_memory", auto: "layer_auto", none: "layer_none" };

function icon(kind) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", { sign: "M8 11V6a2 2 0 1 1 4 0v6", fingerspell: "M4 18 8 6l4 8 4-8 4 12", index: "M12 4v12m-4-4 4 4 4-4", missing: "M6 6l12 12M18 6 6 18", pause: "M8 5h3v14H8zm5 0h3v14h-3z" }[kind] || "");
  path.setAttribute("fill", kind === "pause" ? "currentColor" : "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2");
  svg.append(path);
  return svg;
}

function para(text) {
  const node = document.createElement("p");
  node.textContent = text;
  return node;
}

function chip(item, playWord) {
  const playable = item.kind === "sign" && item.clip;
  const node = document.createElement(playable ? "button" : "span");
  if (playable) {
    node.type = "button";
    node.addEventListener("click", () => playWord([{ src: item.clip, from: item.from, to: item.to }]));
  }
  node.className = "chip";
  const kind = document.createElement("span");
  kind.className = "sr-only";
  kind.textContent = t(KIND[item.kind] || "chip_missing");
  const word = document.createElement("span");
  word.textContent = item.kind === "pause" ? "‖" : (item.gloss || "");
  node.append(icon(item.kind), kind, word);
  return node;
}

function stat(label, value) {
  const card = document.createElement("div");
  card.className = "stat";
  const name = document.createElement("p");
  name.className = "stat-k";
  name.textContent = label;
  const num = document.createElement("p");
  num.textContent = value;
  card.append(name, num);
  return card;
}

function coverage(result) {
  const content = (result.gloss || []).filter((item) => ["sign", "missing", "fingerspell"].includes(item.kind));
  const signed = content.filter((item) => item.kind === "sign").length;
  if (!content.length && result.layer === "memory") return t("coverage_phrase");
  return t("coverage_words", { signed, total: content.length });
}

function votes(result, box, voted) {
  const yes = document.createElement("button");
  const no = document.createElement("button");
  yes.type = no.type = "button";
  yes.textContent = t("sign_understood");
  no.textContent = t("sign_unclear");
  const mark = (verdict) => {
    yes.setAttribute("aria-pressed", verdict === "approve" ? "true" : "false");
    no.setAttribute("aria-pressed", verdict === "fix" ? "true" : "false");
    yes.disabled = no.disabled = true;
  };
  if (voted.has(result.text)) mark(voted.get(result.text));
  const send = async (verdict) => {
    if (voted.has(result.text)) return;
    voted.set(result.text, verdict);
    mark(verdict);
    box.append(para(t("sign_thanks")));
    const gloss = (result.gloss || []).filter((item) => item.kind !== "pause").map((item) => item.gloss).join(" ");
    await fetch("/api/v1/sign/review", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ text_am: result.text, gloss, verdict })
    }).catch(() => {});
  };
  yes.addEventListener("click", () => send("approve"));
  no.addEventListener("click", () => send("fix"));
  const row = document.createElement("div");
  row.className = "try-votes";
  row.append(yes, no);
  return row;
}

export function renderResult(out, results, playWord, voted) {
  out.replaceChildren();
  for (const result of results) {
    const box = document.createElement("section");
    box.className = "try-block";
    box.append(para(result.text));
    if (result.layer === "none") box.append(para(t("sign_missing")));
    const list = document.createElement("ul");
    list.className = "chips";
    for (const item of result.gloss || []) {
      const li = document.createElement("li");
      li.append(chip(item, playWord));
      list.append(li);
    }
    box.append(list);
    for (const mark of result.nonmanual || []) if (FACE[mark]) box.append(para(t(FACE[mark])));
    const stats = document.createElement("div");
    stats.className = "stats";
    stats.append(
      stat(t("stat_layer"), t(LAYER[result.layer] || "layer_none")),
      stat(t("stat_confidence"), Math.round((result.confidence || 0) * 100) + "%"),
      stat(t("stat_coverage"), coverage(result))
    );
    box.append(stats);
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = t("sign_reasons");
    const reasons = document.createElement("ul");
    for (const reason of result.reasons || []) {
      const li = document.createElement("li");
      li.textContent = reason;
      reasons.append(li);
    }
    details.append(summary, reasons);
    box.append(votes(result, box, voted), details);
    out.append(box);
  }
}

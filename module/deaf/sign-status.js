// FR-DEAF-06, FR-SL-09, FR-SL-10: Waiting pill, missing-sign card, and automatic-sign feedback.
import { layoutPill } from "../core/caption-place.js";

export function attachStatus(player, win, skip) {
  const ui = {};
  const votes = new Map();
  let current = null;

  function faceKey(segment) {
    const marks = segment?.nonmanual || [];
    if (marks.includes("neg")) return "face_neg";
    if (marks.includes("q-wh")) return "face_wh";
    if (marks.includes("q-yn")) return "face_yn";
    return "";
  }

  function label() {
    if (ui.note) {
      ui.note.textContent = player.t("sign_waiting");
      ui.skip.textContent = player.t("skip_wait");
      ui.skip.setAttribute("aria-label", player.t("skip_wait"));
      ui.card.textContent = player.t("sign_missing");
    }
    if (!ui.beta) return;
    ui.tag.textContent = player.t("sign_beta");
    ui.yes.textContent = player.t("sign_understood");
    ui.no.textContent = player.t("sign_unclear");
    ui.face.textContent = ui.face.dataset.key ? player.t(ui.face.dataset.key) : "";
  }

  function paint() {
    if (!ui.beta) return;
    const auto = current?.source === "auto";
    ui.beta.hidden = !auto;
    const key = faceKey(current);
    ui.face.hidden = !key;
    ui.face.dataset.key = key;
    const vote = current ? votes.get(current.cue) : "";
    ui.yes.setAttribute("aria-pressed", vote === "approve" ? "true" : "false");
    ui.no.setAttribute("aria-pressed", vote === "fix" ? "true" : "false");
    ui.yes.disabled = ui.no.disabled = !auto || !!vote;
    label();
  }

  async function vote(verdict) {
    if (!current || current.source !== "auto" || votes.has(current.cue)) return;
    votes.set(current.cue, verdict);
    paint();
    player.announce("sign_thanks");
    const api = String(player.host.getAttribute("api") || "").replace(/\/$/, "");
    if (!api) return;
    await fetch(api + "/sign/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text_am: current.text_am || "", gloss: current.gloss || "", verdict })
    }).catch(() => {});
  }

  function ensure() {
    if (ui.pill) return;
    ui.pill = document.createElement("div");
    ui.pill.className = "sign-wait";
    ui.pill.setAttribute("role", "status");
    ui.pill.hidden = true;
    ui.note = document.createElement("span");
    ui.skip = document.createElement("button");
    ui.skip.type = "button";
    ui.skip.addEventListener("click", () => skip());
    ui.pill.append(ui.note, ui.skip);
    player.slots.overlay.append(ui.pill);
    ui.card = document.createElement("p");
    ui.card.className = "sign-missing";
    ui.card.setAttribute("role", "status");
    ui.card.hidden = true;
    ui.beta = document.createElement("div");
    ui.beta.className = "sign-beta";
    ui.beta.hidden = true;
    ui.tag = document.createElement("p");
    ui.votes = document.createElement("div");
    ui.votes.className = "sign-votes";
    ui.yes = document.createElement("button");
    ui.no = document.createElement("button");
    ui.yes.type = ui.no.type = "button";
    ui.yes.addEventListener("click", () => vote("approve"));
    ui.no.addEventListener("click", () => vote("fix"));
    ui.votes.append(ui.yes, ui.no);
    ui.beta.append(ui.tag, ui.votes);
    ui.face = document.createElement("p");
    ui.face.className = "sign-face";
    ui.face.hidden = true;
    win.root.append(ui.card, ui.face, ui.beta);
    label();
  }

  return {
    label, paint,
    showPill() { ensure(); ui.pill.hidden = false; label(); layoutPill(player, ui.pill); },
    hidePill() { if (ui.pill) ui.pill.hidden = true; },
    showCard() { ensure(); ui.card.hidden = false; label(); },
    hideCard() { if (ui.card) ui.card.hidden = true; },
    showSegment(segment) { ensure(); current = segment && segment.source !== "none" ? segment : null; paint(); },
    place() { if (ui.pill && !ui.pill.hidden) layoutPill(player, ui.pill); }
  };
}

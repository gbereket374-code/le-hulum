// FR-IN-04, FR-DEAF-01: The pin, the block list, and the signer tray.
export function buildPin(root) {
  const launch = button("launch");
  launch.setAttribute("aria-expanded", "false");
  launch.setAttribute("aria-controls", "pin-panel");
  launch.setAttribute("aria-label", "Sign this page");
  const am = document.createElement("span");
  am.lang = "am";
  const en = document.createElement("span");
  en.lang = "en";
  launch.append(am, en);
  const panel = document.createElement("dialog");
  panel.className = "panel";
  panel.id = "pin-panel";
  const title = document.createElement("p");
  title.id = "pin-title";
  title.className = "title";
  panel.setAttribute("aria-labelledby", "pin-title");
  const close = button("close");
  const list = document.createElement("div");
  list.className = "list";
  panel.append(title, close, list);
  const pin = button("pin");
  const tip = document.createElement("span");
  tip.className = "tip";
  tip.setAttribute("aria-hidden", "true");
  pin.append(tip);
  pin.hidden = true;
  const pick = button("pick");
  pick.hidden = true;
  const stage = document.createElement("div");
  stage.className = "stage";
  stage.setAttribute("role", "region");
  const tray = document.createElement("div");
  tray.className = "tray";
  tray.setAttribute("role", "region");
  tray.hidden = true;
  const live = el("p", "live");
  live.setAttribute("aria-live", "polite");
  const source = el("p", "source");
  source.hidden = true;
  const translation = el("p", "translation");
  translation.hidden = true;
  const chips = document.createElement("div");
  chips.className = "chips";
  const coverage = el("p", "coverage");
  const face = el("p", "face");
  face.hidden = true;
  const beta = el("p", "beta");
  beta.hidden = true;
  const none = el("p", "none");
  none.hidden = true;
  const request = button("request");
  request.hidden = true;
  const votes = document.createElement("div");
  votes.className = "votes";
  votes.hidden = true;
  const yes = button("yes");
  const no = button("no");
  yes.setAttribute("aria-pressed", "false");
  no.setAttribute("aria-pressed", "false");
  votes.append(yes, no);
  const thanks = el("p", "thanks");
  thanks.hidden = true;
  const row = document.createElement("div");
  row.className = "row";
  const pause = button("pause");
  const prev = button("prev");
  const next = button("next");
  const stop = button("stop");
  pause.setAttribute("aria-pressed", "false");
  row.append(pause, prev, next, stop);
  tray.append(live, source, translation, chips, coverage, face, beta, none, request, votes, thanks, row);
  const box = document.createElement("div");
  box.className = "box";
  box.hidden = true;
  const sign = button("sign");
  sign.hidden = true;
  const area = document.createElement("div");
  area.className = "area";
  area.hidden = true;
  root.append(launch, panel, pin, pick, stage, tray, box, area, sign);
  return {
    launch, am, en, panel, title, close, list, pin, tip, pick, stage, tray, live, source, translation,
    chips, coverage, face, beta, none, request, votes, yes, no, thanks, pause, prev, next, stop, box, sign, area
  };
}

function button(name) {
  const node = document.createElement("button");
  node.type = "button";
  node.className = name;
  return node;
}

function el(tag, name) {
  const node = document.createElement(tag);
  node.className = name;
  return node;
}

export function paintPin(refs, t) {
  refs.am.textContent = t("pin_open_am");
  refs.en.textContent = t("pin_open");
  refs.launch.setAttribute("aria-label", t("pin_open_am") + " — " + t("pin_open"));
  refs.title.textContent = t("pin_list");
  refs.close.textContent = t("pin_close");
  refs.pin.setAttribute("aria-label", t("pin_drag"));
  refs.pick.textContent = t("pin_selection");
  refs.request.textContent = t("pin_request");
  refs.yes.textContent = t("sign_understood");
  refs.no.textContent = t("sign_unclear");
  refs.thanks.textContent = t("sign_thanks");
  refs.pause.textContent = t("pin_pause");
  refs.prev.textContent = t("pin_prev");
  refs.next.textContent = t("pin_next");
  refs.stop.textContent = t("pin_stop");
  refs.stage.setAttribute("aria-label", t("sign_window"));
  refs.tray.setAttribute("aria-label", t("try_result"));
}

// FR-IN-02, FR-IN-04, FR-IN-06, FR-DEAF-01, FR-DEAF-09: Sign text that is already on the page.
import { bindSignButton } from "./deaf/pin/button.js";
import { bindGestures } from "./deaf/pin/gestures.js";
import { bindPinWindow, savePinSize } from "./deaf/pin/place.js";
import { blocksIn } from "./deaf/pin/page.js";
import { createSession } from "./deaf/pin/session.js";
import { loadPinStrings } from "./deaf/pin/strings.js";
import { PIN_CSS } from "./deaf/pin/style.js";
import { buildPin, paintPin } from "./deaf/pin/view.js";
import { CSS, SignWindow } from "./deaf/sign-window.js";

const TAG = "db-sign-pin";

class DbSignPin extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = CSS + PIN_CSS;
    this.shadowRoot.append(style);
    this.refs = buildPin(this.shadowRoot);
    this.t = (key) => key;
    this.terms = null;
    this.win = new SignWindow(this.refs.stage, {
      t: (key, vars) => this.t(key, vars),
      announce: (key, vars) => { this.refs.live.textContent = this.t(key, vars); },
      close: () => this.session?.stop(true),
      speed: () => this.session?.rate(),
      layout: () => this.session?.repark(),
      save: () => this.rememberSize(),
      moved: () => this.session?.moved()
    });
    bindPinWindow(this.win);
    this.refs.win = this.win;
    this.session = createSession(this.refs, {
      t: (key, vars) => this.t(key, vars),
      api: () => this.api(),
      lang: () => this.lang(),
      continueOn: () => this.continueOn(),
      mark: (row) => Object.assign(this.dataset, row),
      outline: (range) => this.outline(range),
      focusLauncher: () => this.refs.launch.focus(),
      changed: () => this.signButton?.changed(),
      announce: (key, vars) => { this.refs.live.textContent = this.t(key, vars); }
    });
    this.bind();
    this.boot();
  }

  disconnectedCallback() {
    this.session?.stop(false);
    this.signButton?.destroy();
    document.removeEventListener("keydown", this.onKey);
    document.removeEventListener("selectionchange", this.onSelect);
    document.removeEventListener("click", this.onClick);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("scroll", this.onScroll, true);
  }

  api() { return (this.getAttribute("api") || "/api/v1").replace(/\/$/, ""); }
  lang() { return (this.getAttribute("lang") || document.documentElement.lang) === "en" ? "en" : "am"; }
  scope() {
    const sel = this.getAttribute("scope");
    return (sel && document.querySelector(sel)) || document.querySelector("main") || document.body;
  }
  continueOn() {
    try { return JSON.parse(localStorage.getItem("db-player:prefs") || "{}").signPinContinue !== false; }
    catch (error) { return true; }
  }
  rememberSize() {
    const sw = this.win.stage.clientWidth || window.innerWidth;
    if (sw < 30 * 16) return;
    const width = Math.round(this.win.root.getBoundingClientRect().width);
    this.win._pinPx = width;
    savePinSize(width);
  }
  openAtStart() {
    return this.getAttribute("start") === "open" || new URLSearchParams(location.search).get("pin") === "open";
  }

  async boot() {
    try { this.t = await loadPinStrings(this.lang()); }
    catch (error) { this.t = (key) => key; }
    if (!this.isConnected) return;
    paintPin(this.refs, this.t);
    this.win.paint();
    this.signButton.changed();
    if (this.openAtStart()) this.openPanel();
  }

  bind() {
    this.refs.launch.addEventListener("click", () => (this.refs.panel.open ? this.closePanel(true) : this.openPanel()));
    this.refs.close.addEventListener("click", () => this.closePanel(true));
    bindGestures(this);
    this.signButton = bindSignButton(this);
  }

  openPanel() {
    const blocks = blocksIn(this.scope());
    this.refs.list.replaceChildren();
    if (!blocks.length) {
      const empty = document.createElement("p");
      empty.textContent = this.t("pin_empty");
      this.refs.list.append(empty);
    }
    blocks.forEach((block, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = block.label;
      if (/[\u1200-\u135A]/.test(block.label)) button.lang = "am";
      button.addEventListener("click", () => {
        this.closePanel(false);
        this.session.start(blocks.slice(index), 0, true);
      });
      this.refs.list.append(button);
    });
    const drag = document.createElement("button");
    drag.type = "button";
    drag.textContent = this.t("pin_drag_btn") || "Drag pin";
    drag.addEventListener("click", () => {
      this.refs.pin.hidden = false;
      this.refs.pin.style.right = "1rem";
      this.refs.pin.style.bottom = "5.5rem";
      this.refs.pin.style.left = "auto";
      this.refs.pin.style.top = "auto";
      this.closePanel(false);
      this.refs.pin.focus();
    });
    this.refs.list.prepend(drag);
    if (!this.refs.panel.open) this.refs.panel.show();
    this.refs.launch.setAttribute("aria-expanded", "true");
    (this.refs.list.querySelector("button") || this.refs.close).focus();
  }

  closePanel(focus) {
    if (this.refs.panel.open) this.refs.panel.close();
    this.refs.launch.setAttribute("aria-expanded", "false");
    if (focus) this.refs.launch.focus();
  }

  hidePin() {
    this.refs.pin.hidden = true;
  }

  outline(range) {
    if (!range) { this.refs.box.hidden = true; return; }
    const rect = range.getBoundingClientRect();
    this.refs.box.hidden = false;
    this.refs.box.style.left = rect.left + "px";
    this.refs.box.style.top = rect.top + "px";
    this.refs.box.style.width = Math.max(rect.width, 8) + "px";
    this.refs.box.style.height = Math.max(rect.height, 8) + "px";
  }
}

if (!customElements.get(TAG)) customElements.define(TAG, DbSignPin);

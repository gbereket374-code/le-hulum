// C-01, C-03, C-04, FR-CORE-01, FR-CORE-08, INT-01, INT-02, NFR-A11Y-04: Define <db-player> and paint the first accessible shell.
import { announce } from "./core/announce.js";
import { loadStrings, t } from "./core/i18n.js";

const TAG = "db-player";

class DbPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    const lang = this.getAttribute("lang") === "am" ? "am" : "en";
    this.setAttribute("lang", lang);
    await loadStrings(lang);
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          box-sizing: border-box;
          padding: 1rem;
          background: #fff;
          color: var(--bs-body-color, #1a1a1a);
          font-family: var(--bs-body-font-family, system-ui, sans-serif);
          font-size: 1rem;
          line-height: 1.5;
        }
        :host([lang="am"]) { line-height: 1.7; }
        h2 { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.5rem; }
        .tagline { margin: 0 0 1rem; }
        button {
          min-width: 2.75rem;
          min-height: 2.75rem;
          padding: 0.5rem 1rem;
          font: inherit;
          line-height: 1.5;
          color: #fff;
          background: var(--bs-primary, #1f6fd1);
          border: 0;
          border-radius: 0.25rem;
          cursor: pointer;
        }
        :host([lang="am"]) button { line-height: 1.7; }
        button:focus-visible {
          outline: 3px solid var(--bs-primary, #1f6fd1);
          outline-offset: 0.125rem;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      </style>
      <h2></h2>
      <p class="tagline"></p>
      <button type="button"></button>
      <div class="sr-only" aria-live="polite"></div>
    `;
    this.shadowRoot.querySelector("h2").textContent = t("title");
    this.shadowRoot.querySelector(".tagline").textContent = t("tagline");
    const button = this.shadowRoot.querySelector("button");
    button.textContent = t("play");
    button.addEventListener("click", () => announce(this.shadowRoot, t("play")));
  }
}

if (!customElements.get(TAG)) {
  customElements.define(TAG, DbPlayer);
}

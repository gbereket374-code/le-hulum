// NFR-A11Y-01 FR-01 INT-01: <demo-shell> light-DOM chrome injection.
// Light DOM so labels and their fields share the same root; no Shadow DOM here.
// Attributes: page="home|lesson|asayegn|platforms|notfound"

import { T, DEF_PREFS } from './i18n.js';
import { loadPrefs, savePrefs, applyToDocument } from './prefs.js';

/** Pages in nav order */
const PAGES = [
  { key: 'home',      href: 'index.html' },
  { key: 'lesson',    href: 'lesson-video.html' },
  { key: 'studio',    href: 'asayegn.html' },
  { key: 'platforms', href: 'for-platforms.html' },
];

/* SVG helpers ---------------------------------------------------------------- */
const svg = (content, attrs = '') =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" ${attrs}>${content}</svg>`;

/* Design mark: two rounded bars (accent + gold), from LE HULUM.dc.html */
const LOGO_SVG = (_id, size) =>
  `<span class="lh-logo__mark" aria-hidden="true" style="position:relative;display:inline-block;width:${size}px;height:${size}px;flex:none">
    <span style="position:absolute;left:10%;top:12%;width:40%;height:72%;border-radius:23%;background:var(--accent);transform:rotate(-14deg)"></span>
    <span style="position:absolute;right:10%;top:12%;width:40%;height:72%;border-radius:23%;background:var(--gold);transform:rotate(14deg);mix-blend-mode:multiply"></span>
  </span>`;

const SIGN_ICON = svg(
  '<path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm7 9a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11h-2z"/>',
  'width="22" height="22"'
);

const SETTINGS_ICON = svg(
  '<circle cx="12" cy="12" r="3" fill="currentColor"/><path fill="currentColor" d="M19.14 12.94c.04-.3.06-.6.06-.94s-.02-.64-.06-.94l2-1.56a.5.5 0 0 0 .12-.64l-1.9-3.28a.5.5 0 0 0-.6-.22l-2.37.95a7.03 7.03 0 0 0-1.6-.93l-.36-2.52A.5.5 0 0 0 14 3h-4a.5.5 0 0 0-.5.42l-.36 2.52a7.03 7.03 0 0 0-1.6.93l-2.37-.95a.5.5 0 0 0-.6.22L2.68 9.42a.5.5 0 0 0 .12.64l2 1.56c-.04.3-.06.61-.06.94s.02.64.06.94l-2 1.56a.5.5 0 0 0-.12.64l1.9 3.28a.5.5 0 0 0 .6.22l2.37-.95c.5.36 1.03.65 1.6.93l.36 2.52c.07.24.28.42.5.42h4c.24 0 .44-.18.5-.42l.36-2.52a7.03 7.03 0 0 0 1.6-.93l2.37.95a.5.5 0 0 0 .6-.22l1.9-3.28a.5.5 0 0 0-.12-.64l-2-1.56z"/>',
  'width="24" height="24"'
);

/* ============================================================================
   <demo-shell>
   ============================================================================ */
class DemoShell extends HTMLElement {
  #state = null;
  #themeMenuOpen = false;
  #mobileOpen = false;
  #signerOpen = false;
  #settingsOpener = null; // element that opened the settings dialog

  connectedCallback() {
    this.#state = loadPrefs();
    applyToDocument(this.#state);
    this.#inject();
    this.#wire();
  }

  disconnectedCallback() {
    // elements are injected outside this element so we do not need to clean up
  }

  static get observedAttributes() { return ['page']; }
  attributeChangedCallback(name, _, val) {
    if (name === 'page') this.#updateCurrentPage(val);
  }

  get #page() { return this.getAttribute('page') || 'home'; }
  get #lang() { return this.#state.lang; }
  get #t() { return T[this.#lang]; }

  /* ── Build HTML ─────────────────────────────────────────────── */
  #inject() {
    const t = this.#t;
    const lang = this.#lang;
    const page = this.#page;

    // Skip link
    const skipLink = this.#el('a', 'lh-skip', `href="#main"`, t.skip);

    // Announcement bar
    const annHidden = !this.#state.ann ? 'hidden' : '';
    const annBar = `<div role="region" class="lh-ann" aria-label="${t.annLabel}" ${annHidden}>
      <span class="lh-ann__dot" aria-hidden="true"></span>
      <p class="lh-ann__text">${t.ann}</p>
      <button type="button" class="lh-ann__dismiss" id="lh-ann-x">${t.dismiss}</button>
    </div>`;

    // Desktop nav links
    const navLinks = PAGES.map(p => {
      const cur = p.key === page ? ' aria-current="page"' : '';
      return `<a href="${p.href}"${cur}>${t[p.key]}</a>`;
    }).join('');

    // Mobile nav links
    const mobileLinks = PAGES.map(p => {
      const cur = p.key === page ? ' aria-current="page"' : '';
      return `<a href="${p.href}"${cur}>${t[p.key]}</a>`;
    }).join('');

    const themeOpts = (['light','dark','hc']).map(th =>
      `<button type="button" data-th="${th}" ${this.#state.theme===th?'aria-current="true"':''}>
        ${t[th]}
      </button>`
    ).join('');

    const header = `<header class="lh-header" id="lh-header">
      <div class="lh-header__inner">
        <a class="lh-logo" href="index.html" aria-label="LE HULUM — ለሁሉም, home">
          ${LOGO_SVG('lhg-logo', 36)}
          <span class="lh-logo__brand">
            <b>LE HULUM</b>
            <span><span lang="am">ለሁሉም</span> · for all</span>
          </span>
        </a>
        <nav class="lh-nav" aria-label="${t.mainNav}" id="lh-desknav">
          ${navLinks}
        </nav>
        <div class="lh-tools">
          <button type="button" class="lh-icon-btn" id="lh-lang" aria-label="${t.language}: ${lang==='am'?'English':'አማርኛ'}">
            <span class="en-only" lang="am">አማ</span>
            <span class="am-only">EN</span>
          </button>
          <div class="lh-theme-wrap">
            <button type="button" class="lh-icon-btn" id="lh-theme-btn"
              aria-expanded="false" aria-haspopup="true" aria-controls="lh-theme-menu"
              aria-label="${t.theme}">
              ${t.theme}
            </button>
            <div class="lh-theme-menu" id="lh-theme-menu" role="group" aria-label="${t.theme}" hidden>
              ${themeOpts}
            </div>
          </div>
          <a href="asayegn.html" class="lh-cta">${t.try}</a>
          <button type="button" class="lh-menu-btn" id="lh-menu-btn"
            aria-expanded="false" aria-controls="lh-mobile-nav"
            aria-label="${t.menu}">
            <span class="lh-menu-btn__open" aria-hidden="true">${t.menu}</span>
            <span class="lh-menu-btn__close" aria-hidden="true">${t.closeMenu}</span>
          </button>
        </div>
      </div>
      <nav class="lh-mobile-nav" id="lh-mobile-nav" aria-label="${t.mainNav}" hidden>
        ${mobileLinks}
        <a href="asayegn.html" class="lh-cta">${t.try}</a>
      </nav>
    </header>`;

    // Settings dialog
    const dialog = this.#buildSettingsDialog();

    // Settings FAB (floating)
    const fab = `<button type="button" class="lh-settings-fab" id="lh-settings-fab"
        aria-haspopup="dialog" aria-label="${t.settings}">
      ${SETTINGS_ICON}
      <span>${t.settingsShort}</span>
    </button>`;

    // EthSL launcher (design label: EthSL)
    const ethslBtn = `<button type="button" class="lh-ethsl-btn" id="lh-ethsl-btn"
        aria-label="EthSL" aria-expanded="false" aria-controls="lh-ethsl-panel">
      ${SIGN_ICON}
      <span>EthSL</span>
    </button>`;

    // EthSL floating panel
    const ethslPanel = `<div class="lh-ethsl-panel" id="lh-ethsl-panel" role="dialog"
        aria-label="${t.signIt}" hidden>
      <div class="lh-ethsl-panel__head">
        <p class="lh-ethsl-panel__title" id="lh-ethsl-title">${t.signIt}</p>
        <button type="button" class="lh-ethsl-panel__close" id="lh-ethsl-close"
          aria-label="${t.close}">✕</button>
      </div>
      <div class="lh-ethsl-panel__stage" id="lh-ethsl-stage" aria-live="polite" aria-atomic="true">
        <p class="lh-ethsl-panel__idle">${t.fsIdle}</p>
      </div>
      <form class="lh-ethsl-panel__form" id="lh-ethsl-form" novalidate>
        <label for="lh-ethsl-input" class="sr-only">${t.fsPlaceholder}</label>
        <input type="text" class="lh-ethsl-panel__input" id="lh-ethsl-input"
          placeholder="${t.fsPlaceholder}" autocomplete="off">
        <button type="submit" class="lh-ethsl-panel__send" aria-label="${t.signIt}">▶</button>
      </form>
    </div>`;

    // Announcement live region
    const liveRegion = `<div class="lh-live" aria-live="polite" aria-atomic="true" id="lh-live"></div>`;

    // Footer (not shown on asayegn page)
    const footerHidden = this.#page === 'asayegn' ? 'hidden' : '';
    const footer = this.#buildFooter(footerHidden);

    // Inject before this element (announcement + header)
    this.insertAdjacentHTML('beforebegin',
      skipLink + annBar + header + liveRegion + ethslBtn + ethslPanel + fab + dialog
    );

    // Wrap this element in <main> if not already wrapped
    const main = document.getElementById('main');
    if (!main) {
      const wrapper = document.createElement('main');
      wrapper.id = 'main'; wrapper.tabIndex = -1;
      this.parentNode.insertBefore(wrapper, this);
      wrapper.appendChild(this);
    }

    // Inject footer after this element's parent (main)
    const mainEl = document.getElementById('main');
    if (mainEl) mainEl.insertAdjacentHTML('afterend', footer);
    else this.insertAdjacentHTML('afterend', footer);
  }

  /* ── Settings dialog ──────────────────────────────────────────── */
  #buildSettingsDialog() {
    const t = this.#t;
    const p = this.#state.prefs;

    const seg = (key, opts) => `<fieldset class="lh-seg" aria-label="${opts.label}">
      ${opts.choices.map(([v, l]) =>
        `<button type="button" class="lh-seg__btn" data-key="${key}" data-val="${v}"
          aria-pressed="${String(p[key]===v)}">${l}</button>`
      ).join('')}
    </fieldset>`;

    const sw = (key, label, hint) =>
      `<div class="lh-switch-row">
        <span class="lh-switch-row__text">
          <span class="lh-switch-row__label">${label}</span>
          <span class="lh-switch-row__hint">${hint}</span>
        </span>
        <button type="button" role="switch" class="lh-switch" id="lh-sw-${key}"
          aria-checked="${String(!!p[key])}" data-key="${key}">
          <span class="sr-only">${label}</span>
        </button>
      </div>`;

    const rows = [
      `<div class="lh-sheet__row">
        <span class="lh-sheet__label">${t.learnHow}</span>
        ${seg('mode', { label: t.learnHow, choices: [['sign',t.signFirst],['captions',t.capsOnly],['both',t.both]] })}
      </div>`,
      `<div class="lh-sheet__row">
        <span class="lh-sheet__label">${t.capColour}</span>
        ${seg('capStyle', { label: t.capColour, choices: [['dark',t.capDark],['light',t.capLight],['yellow',t.capYellow]] })}
      </div>`,
      `<div class="lh-sheet__row">
        <span class="lh-sheet__label">${t.signerSize}</span>
        ${seg('signerSize', { label: t.signerSize, choices: [['s',t.small],['m',t.medium],['l',t.large]] })}
      </div>`,
      `<div class="lh-sheet__row">
        <span class="lh-sheet__label">${t.signerSpeed}</span>
        ${seg('speed', { label: t.signerSpeed, choices: [[0.75,'0.75×'],[1,'1×'],[1.25,'1.25×']] })}
      </div>`,
      `<div class="lh-sheet__row">
        <span class="lh-sheet__label">${t.pacingL}</span>
        ${seg('pacing', { label: t.pacingL, choices: [['smooth',t.smooth],['pause',t.pauseEnds],['off',t.off]] })}
      </div>`,
      `<div class="lh-sheet__row">
        <span class="lh-sheet__label">${t.uiLang}</span>
        ${seg('_lang', { label: t.uiLang, choices: [['en','English'],['am','አማርኛ']] })}
      </div>`,
      `<div class="lh-sheet__row">
        <span class="lh-sheet__label">${t.theme}</span>
        ${seg('_theme', { label: t.theme, choices: [['light',t.light],['dark',t.dark],['hc',t.hc]] })}
      </div>`,
      sw('motion', t.motion, t.motionHint),
      sw('saver', t.saver, t.saverHint),
    ].join('');

    return `<dialog class="lh-sheet" id="lh-settings" aria-labelledby="lh-set-title">
      <h2 class="lh-sheet__title" id="lh-set-title">${t.settings}</h2>
      <p class="lh-sheet__note">${t.localNote}</p>
      <div class="lh-sheet__rows">${rows}</div>
      <div class="lh-sheet__footer">
        <button type="button" class="lh-sheet__done" id="lh-set-done">${t.done}</button>
      </div>
    </dialog>`;
  }

  /* ── Footer ───────────────────────────────────────────────────── */
  #buildFooter(hidden = '') {
    const t = this.#t;
    const col = (title, links) => `<div class="lh-footer__col">
      <h2>${title}</h2>
      ${links.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}
    </div>`;

    return `<footer class="lh-footer" id="lh-footer" ${hidden}>
      <div class="lh-footer__inner">
        <div class="lh-footer__brand">
          ${LOGO_SVG('lhg-f', 40)}
          <div>
            <p class="lh-footer__brand-name">LE HULUM <span lang="am">ለሁሉም</span></p>
            <p>${t.footPitch}</p>
          </div>
        </div>
        ${col(t.product, [
          [t.home,      'index.html'],
          [t.lesson,    'lesson-video.html'],
          [t.studio,    'asayegn.html'],
          [t.platforms, 'for-platforms.html'],
        ])}
        ${col(t.developers, [
          [t.apiDocs, 'api-docs.html'],
          [t.install,  'for-platforms.html'],
          ['GitHub',   '#'],
        ])}
        ${col(t.team, [
          [t.about,   'index.html'],
          [t.contact, 'mailto:hello@example.invalid'],
          [t.hack,    '#'],
          [t.privacy, '#'],
        ])}
      </div>
      <div class="lh-footer__note">
        <span>${t.footCredit}</span>
      </div>
    </footer>`;
  }

  /* ── Wire events ──────────────────────────────────────────────── */
  #wire() {
    // Announcement dismiss
    document.getElementById('lh-ann-x')?.addEventListener('click', () => {
      document.querySelector('.lh-ann')?.setAttribute('hidden', '');
      this.#state.ann = false;
      savePrefs(this.#state);
    });

    // Language toggle
    document.getElementById('lh-lang')?.addEventListener('click', () => {
      this.#state.lang = this.#state.lang === 'am' ? 'en' : 'am';
      savePrefs(this.#state);
      applyToDocument(this.#state);
      this.#announce(T[this.#state.lang].language);
      // Simple refresh; in a real SPA we'd re-render strings
      location.reload();
    });

    // Theme button toggle
    const themeBtn = document.getElementById('lh-theme-btn');
    const themeMenu = document.getElementById('lh-theme-menu');
    themeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.#themeMenuOpen = !this.#themeMenuOpen;
      themeMenu?.toggleAttribute('hidden', !this.#themeMenuOpen);
      themeBtn.setAttribute('aria-expanded', String(this.#themeMenuOpen));
    });
    themeMenu?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-th]');
      if (!btn) return;
      this.#state.theme = btn.dataset.th;
      savePrefs(this.#state);
      applyToDocument(this.#state);
      themeMenu.querySelectorAll('[aria-current]').forEach(b => b.removeAttribute('aria-current'));
      btn.setAttribute('aria-current', 'true');
      themeMenu.setAttribute('hidden', '');
      this.#themeMenuOpen = false;
      themeBtn.setAttribute('aria-expanded', 'false');
      themeBtn.focus();
      this.#announce(T[this.#state.lang][this.#state.theme]);
    });
    document.addEventListener('click', () => {
      if (!this.#themeMenuOpen) return;
      this.#themeMenuOpen = false;
      themeMenu?.setAttribute('hidden', '');
      themeBtn?.setAttribute('aria-expanded', 'false');
    });

    // Mobile menu
    const menuBtn = document.getElementById('lh-menu-btn');
    const mobileNav = document.getElementById('lh-mobile-nav');
    menuBtn?.addEventListener('click', () => {
      this.#mobileOpen = !this.#mobileOpen;
      mobileNav?.toggleAttribute('hidden', !this.#mobileOpen);
      menuBtn.setAttribute('aria-expanded', String(this.#mobileOpen));
    });

    // Settings FAB
    document.getElementById('lh-settings-fab')?.addEventListener('click', (e) => {
      this.#settingsOpener = e.currentTarget;
      document.getElementById('lh-settings')?.showModal();
    });
    document.getElementById('lh-set-done')?.addEventListener('click', () => {
      document.getElementById('lh-settings')?.close();
      this.#settingsOpener?.focus();
    });

    // Settings dialog — segment buttons + switches
    document.getElementById('lh-settings')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-key][data-val]');
      if (btn) {
        const key = btn.dataset.key;
        const val = btn.dataset.val;
        if (key === '_lang') {
          this.#state.lang = val;
          savePrefs(this.#state);
          applyToDocument(this.#state);
          location.reload();
          return;
        }
        if (key === '_theme') {
          this.#state.theme = val;
          savePrefs(this.#state);
          applyToDocument(this.#state);
          this.#announce(T[this.#state.lang][val]);
          // update aria-pressed states
          btn.closest('fieldset')?.querySelectorAll('[data-val]').forEach(b => {
            b.setAttribute('aria-pressed', String(b === btn));
          });
          return;
        }
        // normal pref key
        const numVal = isNaN(+val) ? val : +val;
        this.#state.prefs[key] = numVal;
        savePrefs(this.#state);
        btn.closest('fieldset')?.querySelectorAll('[data-val]').forEach(b => {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        this.#dispatchPrefChange(key, numVal);
      }
    });
    // Switches
    document.getElementById('lh-settings')?.addEventListener('click', (e) => {
      const sw = e.target.closest('button[role=switch][data-key]');
      if (!sw) return;
      const key = sw.dataset.key;
      const next = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(next));
      this.#state.prefs[key] = next;
      savePrefs(this.#state);
      if (key === 'motion') applyToDocument(this.#state);
      this.#dispatchPrefChange(key, next);
    });
    // Escape closes settings
    document.getElementById('lh-settings')?.addEventListener('cancel', () => {
      this.#settingsOpener?.focus();
    });

    // EthSL launcher
    const ethslBtn = document.getElementById('lh-ethsl-btn');
    const ethslPanel = document.getElementById('lh-ethsl-panel');
    const ethslClose = document.getElementById('lh-ethsl-close');
    ethslBtn?.addEventListener('click', () => {
      this.#signerOpen = true;
      ethslPanel?.removeAttribute('hidden');
      ethslBtn.setAttribute('aria-expanded', 'true');
      document.getElementById('lh-ethsl-input')?.focus();
    });
    ethslClose?.addEventListener('click', () => {
      this.#signerOpen = false;
      ethslPanel?.setAttribute('hidden', '');
      ethslBtn?.setAttribute('aria-expanded', 'false');
      ethslBtn?.focus();
    });
    // EthSL form submit → dispatch lh:sign-request
    document.getElementById('lh-ethsl-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('lh-ethsl-input');
      const text = input?.value.trim();
      if (!text) return;
      document.dispatchEvent(new CustomEvent('lh:sign-request', {
        bubbles: true, composed: true,
        detail: { text, lang: this.#state.lang },
      }));
      this.#announce(T[this.#state.lang].loadingSigns);
    });

    // Global Escape handling
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (this.#themeMenuOpen) {
        this.#themeMenuOpen = false;
        themeMenu?.setAttribute('hidden', '');
        themeBtn?.setAttribute('aria-expanded', 'false');
        themeBtn?.focus();
      } else if (this.#mobileOpen) {
        this.#mobileOpen = false;
        mobileNav?.setAttribute('hidden', '');
        menuBtn?.setAttribute('aria-expanded', 'false');
        menuBtn?.focus();
      } else if (this.#signerOpen) {
        this.#signerOpen = false;
        ethslPanel?.setAttribute('hidden', '');
        ethslBtn?.setAttribute('aria-expanded', 'false');
        ethslBtn?.focus();
      }
    });
  }

  /* ── Helpers ──────────────────────────────────────────────────── */
  #announce(msg) {
    const el = document.getElementById('lh-live');
    if (!el) return;
    el.textContent = '';
    requestAnimationFrame(() => { el.textContent = msg; });
  }

  #dispatchPrefChange(key, value) {
    document.dispatchEvent(new CustomEvent('lh:prefs-change', {
      bubbles: true, composed: true, detail: { key, value, prefs: this.#state.prefs },
    }));
  }

  #updateCurrentPage(page) {
    // Update aria-current on all nav links
    document.querySelectorAll('#lh-desknav a, #lh-mobile-nav a').forEach(a => {
      const p = PAGES.find(pg => a.getAttribute('href') === pg.href);
      if (p) a.toggleAttribute('aria-current', p.key === page ? undefined : false);
      if (p?.key === page) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    // Footer visibility
    const footer = document.getElementById('lh-footer');
    if (footer) footer.toggleAttribute('hidden', page === 'asayegn');
  }

  #el(tag, cls, attrs, inner) {
    return `<${tag} class="${cls}" ${attrs}>${inner}</${tag}>`;
  }
}

// Guard against double-registration
if (!customElements.get('demo-shell')) {
  customElements.define('demo-shell', DemoShell);
}

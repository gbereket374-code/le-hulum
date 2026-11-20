// NFR-A11Y-01 FR-01: Learner preferences — load/save to localStorage only.
// Privacy rule: settings never leave the device or go to any server.

import { DEF_PREFS } from './i18n.js';

const KEY = 'lehulum.v1';
// Legacy keys from the v1 demo shell
const LEGACY_LANG  = 'db-demo:lang';
const LEGACY_THEME = 'db-demo:theme';

/** @typedef {{ lang:'en'|'am', theme:'light'|'dark'|'hc', prefs:typeof DEF_PREFS, ann:boolean }} Stored */

/**
 * Load saved prefs.  Migrates legacy db-demo:* keys on first run.
 * @returns {Stored}
 */
export function loadPrefs() {
  /** @type {Stored} */
  const defaults = { lang: 'en', theme: 'light', prefs: { ...DEF_PREFS }, ann: true };
  try {
    const raw = localStorage.getItem(KEY);
    const saved = raw ? JSON.parse(raw) : {};

    // Migrate legacy single keys if main key was absent
    if (!raw) {
      const ll = localStorage.getItem(LEGACY_LANG);
      const lt = localStorage.getItem(LEGACY_THEME);
      if (ll === 'am') saved.lang = 'am';
      // map old 'contrast' to new 'hc'
      if (lt === 'light' || lt === 'dark') saved.theme = lt;
      if (lt === 'contrast') saved.theme = 'hc';
    }

    return {
      lang:  (saved.lang === 'am') ? 'am' : 'en',
      theme: (['light','dark','hc'].includes(saved.theme)) ? saved.theme : 'light',
      prefs: { ...DEF_PREFS, ...(saved.prefs || {}) },
      ann:   saved.ann !== false,
    };
  } catch {
    return defaults;
  }
}

/**
 * Persist prefs to localStorage.
 * @param {Stored} state
 */
export function savePrefs(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      lang:  state.lang,
      theme: state.theme,
      prefs: state.prefs,
      ann:   state.ann,
    }));
  } catch { /* quota or private mode — silently ignore */ }
}

/**
 * Apply lang / theme / motion directly to <html> so the page
 * renders correctly before the shell element upgrades.
 * Call this from an inline <script> at the top of <head>.
 * @param {Stored} state
 */
export function applyToDocument(state) {
  const r = document.documentElement;
  r.lang = state.lang;
  r.dataset.theme  = state.theme;
  r.dataset.motion = state.prefs.motion ? 'reduced' : '';
}

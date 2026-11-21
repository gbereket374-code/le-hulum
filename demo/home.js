// NFR-A11Y-01 FR-01 INT-01: Home page controller — i18n, hero video, sign-it, FAQ, copy.
// No globals. All text from ./i18n/home.js. Privacy: no data sent to server.

import { T } from './i18n/home.js';
import { MODULE } from './config.js';

/* ── Helpers ──────────────────────────────────────────────────── */
const lang = () => (document.documentElement.lang === 'am' ? 'am' : 'en');
const t = () => T[lang()];
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ── i18n ─────────────────────────────────────────────────────── */
function applyI18n() {
  const tr = t();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = tr[el.dataset.i18n];
    if (typeof v === 'string') el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const v = tr[el.dataset.i18nPlaceholder];
    if (typeof v === 'string') el.placeholder = v;
  });
  // alt-tag: show the other language under h1
  const altEl = document.getElementById('hero-alttag');
  if (altEl) {
    if (lang() === 'am') {
      altEl.lang = 'en';
      altEl.textContent = tr.altTag; // altTag in am = "Your language. Your world..."
    } else {
      altEl.lang = 'am';
      altEl.textContent = tr.altTag; // altTag in en = "ለመስማት…"
    }
  }
}

/* ── Proof bar ────────────────────────────────────────────────── */
function renderProof() {
  const list = document.getElementById('home-proof-list');
  if (!list) return;
  // keep the label li, remove old items
  list.querySelectorAll('.home-proof__item').forEach(n => n.remove());
  t().proof.forEach(item => {
    const li = document.createElement('li');
    li.className = 'home-proof__item';
    const diamond = document.createElement('span');
    diamond.className = 'home-proof__diamond';
    diamond.setAttribute('aria-hidden', 'true');
    li.append(diamond, document.createTextNode(item));
    if (lang() === 'am') li.lang = 'am';
    list.append(li);
  });
}

/* ── Stats ────────────────────────────────────────────────────── */
function renderStats() {
  const dl = document.getElementById('home-stats');
  if (!dl) return;
  dl.innerHTML = '';
  t().stats.forEach(([num, label]) => {
    const div = document.createElement('div');
    div.className = 'home-stats__item';
    div.innerHTML = `<dd class="home-stats__num">${esc(num)}</dd>
      <dt class="home-stats__label">${esc(label)}</dt>`;
    dl.append(div);
  });
}

/* ── Problems ─────────────────────────────────────────────────── */
function renderProblems() {
  const ul = document.getElementById('home-problems');
  if (!ul) return;
  ul.innerHTML = '';
  t().problems.forEach(([h, p]) => {
    const li = document.createElement('li');
    li.className = 'home-card';
    if (lang() === 'am') li.lang = 'am';
    li.innerHTML = `<h3 class="home-card__h">${esc(h)}</h3>
      <p class="home-card__p">${esc(p)}</p>`;
    ul.append(li);
  });
}

/* ── Steps ────────────────────────────────────────────────────── */
function renderSteps() {
  const ol = document.getElementById('home-steps');
  if (!ol) return;
  ol.innerHTML = '';
  t().steps.forEach(([h, p], i) => {
    const li = document.createElement('li');
    li.className = 'home-card';
    if (lang() === 'am') li.lang = 'am';
    li.innerHTML = `<div style="display:flex;align-items:center;gap:10px">
      <span class="home-step-num" aria-hidden="true">${i + 1}</span>
      <h3 class="home-card__h" style="margin:0">${esc(h)}</h3></div>
      <p class="home-card__p">${esc(p)}</p>`;
    ol.append(li);
  });
}

/* ── Review steps ─────────────────────────────────────────────── */
function renderReview() {
  const div = document.getElementById('home-review');
  if (!div) return;
  div.innerHTML = '';
  t().review.forEach(([h, p]) => {
    const step = document.createElement('div');
    step.className = 'home-review__step';
    if (lang() === 'am') step.lang = 'am';
    step.innerHTML = `<h4 class="home-review__title">${esc(h)}</h4>
      <p class="home-review__desc">${esc(p)}</p>`;
    div.append(step);
  });
}

/* ── FAQ ──────────────────────────────────────────────────────── */
function renderFaqs() {
  const wrap = document.getElementById('home-faqs');
  if (!wrap) return;
  wrap.innerHTML = '';
  t().faqs.forEach(([q, a]) => {
    const details = document.createElement('details');
    if (lang() === 'am') details.lang = 'am';
    const summary = document.createElement('summary');
    summary.textContent = q;
    const p = document.createElement('p');
    p.textContent = a;
    details.append(summary, p);
    wrap.append(details);
  });
  // close others when one opens
  wrap.addEventListener('toggle', e => {
    if (e.target.open) {
      wrap.querySelectorAll('details[open]').forEach(d => { if (d !== e.target) d.open = false; });
    }
  }, true);
}

/* ── Code snippet + copy ──────────────────────────────────────── */
function renderSnippet() {
  const pre = document.getElementById('home-snippet');
  if (pre) {
    pre.textContent = `<script type="module" src="${MODULE}"><\/script>\n<db-player\n  src="lesson.mp4"\n  captions="lesson.am.vtt,lesson.en.vtt"\n  sign="sign.json"\n  lang="am"\n></db-player>`;
  }
  const btn = document.getElementById('home-copy');
  const status = document.getElementById('home-copy-status');
  if (!btn || !pre) return;
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(pre.textContent); } catch { /* no-op */ }
    btn.textContent = t().copied;
    if (status) status.textContent = t().copied;
    setTimeout(() => {
      btn.dataset.i18n = 'copy';
      btn.textContent = t().copy;
      if (status) status.textContent = '';
    }, 2500);
  });
}

/* ── Sign-it form ─────────────────────────────────────────────── */
function wireSignIt() {
  const form = document.getElementById('signit-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = (document.getElementById('signit-q')?.value || '').trim();
    if (!q) return;
    location.href = 'asayegn.html?q=' + encodeURIComponent(q);
  });
}

/* ── Hero video play/pause ────────────────────────────────────── */
function wireHero() {
  const vid = document.getElementById('hero-vid');
  const btn = document.getElementById('hero-pause');
  if (!vid || !btn) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.motion === 'reduce';
  if (!reduce) {
    vid.play().catch(() => {});
    btn.setAttribute('aria-pressed', 'true');
    btn.textContent = '❚❚';
    btn.setAttribute('aria-label', t().pause || 'Pause');
  }
  btn.addEventListener('click', () => {
    const playing = vid.paused === false;
    if (playing) { vid.pause(); btn.setAttribute('aria-pressed', 'false'); btn.textContent = '▶'; btn.setAttribute('aria-label', t().play || 'Play'); }
    else { vid.play().catch(() => {}); btn.setAttribute('aria-pressed', 'true'); btn.textContent = '❚❚'; btn.setAttribute('aria-label', t().pause || 'Pause'); }
  });
}

/* ── Render everything ────────────────────────────────────────── */
function render() {
  applyI18n();
  renderProof();
  renderStats();
  renderProblems();
  renderSteps();
  renderReview();
  renderFaqs();
}

render();
renderSnippet();
wireSignIt();
wireHero();

// Re-render when shell changes lang (MutationObserver on <html> lang attribute)
new MutationObserver(() => render())
  .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

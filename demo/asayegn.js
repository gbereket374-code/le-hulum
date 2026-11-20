// FR-SL-08 FR-SL-09: Asayegn chat — wire translate / lexicon / review + SignWindow.
import { T, TRY } from './asayegn/i18n.js';
import { isAm, fetchLexicon, findEntry, signTranslate, postReview, groupsFromLex } from './asayegn/api.js';
import { CSS, SignWindow } from '/module/deaf/sign-window.js';
import { attachSignPlay } from '/module/deaf/sign-play.js';

const lang = () => {
  try { return JSON.parse(localStorage.getItem('lehulum.v1') || '{}').lang === 'am' ? 'am' : 'en'; }
  catch { return document.documentElement.lang === 'am' ? 'am' : 'en'; }
};
const t = () => T[lang()];
const HIST_KEY = 'lehulum.asayegn.history';

const style = document.createElement('style');
style.textContent = CSS;
document.head.append(style);

const live = document.getElementById('as-live');
const scroll = document.getElementById('as-scroll');
const stageHost = document.getElementById('as-stage-pool');
const win = new SignWindow(stageHost, {
  t: (k) => k, announce(k) { live.textContent = k; }, close() { win.hide(); }, layout() {}, save() {}, moved() {},
});
win.layout = 'sign-first';
const playState = { segments: [], index: 0, item: 0, front: 0, base: 'data/', stall: 0, pauseAt: 0, armed: false, want: 0 };
let active = [];
const play = attachSignPlay(win, playState, {
  items: () => active, rate: () => 1, paused: () => false, started() {}, next: () => null,
  fail() { live.textContent = t().errMsg; }, ended() {},
});

function history() {
  try { return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); } catch { return []; }
}
function saveHist(text) {
  const h = [text, ...history().filter((x) => x !== text)].slice(0, 20);
  try { localStorage.setItem(HIST_KEY, JSON.stringify(h)); } catch {}
  paintHist();
}
function paintHist() {
  const ul = document.getElementById('as-hist');
  const rows = history();
  ul.innerHTML = rows.length
    ? rows.map((x) => `<li><button type="button" data-q="${encodeURIComponent(x)}">${x}</button></li>`).join('')
    : `<li class="as-note">${t().historyEmpty}</li>`;
}

function showView(name) {
  document.getElementById('as-chat-view').hidden = name !== 'chat';
  document.getElementById('as-browse-view').hidden = name !== 'browse';
}

function emptyState() {
  const box = document.getElementById('as-empty');
  const tt = t();
  box.innerHTML = `<h1>${tt.emptyH1}<br>${tt.emptyH2}</h1><p>${tt.emptySub}</p>
    <p class="as-note">${tt.tryThese}</p>
    <div class="as-chips">${TRY.map(([q]) => `<button type="button" data-try="${encodeURIComponent(q)}">${q}</button>`).join('')}</div>
    <p><button type="button" class="as-judges" id="as-judges">${tt.judges}</button></p>`;
}

function mountStage(into) {
  const node = stageHost;
  into.appendChild(node);
  node.hidden = false;
}

async function runSign(text, entry) {
  const tt = t();
  document.getElementById('as-empty').hidden = true;
  const log = document.getElementById('as-log');
  const uid = `u${Date.now()}`;
  const bid = `b${Date.now()}`;
  log.insertAdjacentHTML('beforeend', `
    <article class="as-msg as-msg--user" id="${uid}"><div class="as-bubble" lang="${isAm(text) ? 'am' : 'en'}">${text}</div></article>
    <article class="as-msg as-msg--bot" id="${bid}"><div class="as-bubble">
      <div class="as-load" id="${bid}-load"><strong>${tt.preparing}</strong>
        <ol>${tt.steps.map((s, i) => `<li data-step="${i}">${s}</li>`).join('')}</ol>
      </div>
      <div class="as-body" id="${bid}-body" hidden></div>
    </div></article>`);
  saveHist(text);
  scroll.scrollTop = scroll.scrollHeight;

  const steps = [...document.querySelectorAll(`#${bid}-load li`)];
  steps.forEach((el, i) => setTimeout(() => { el.dataset.on = '1'; }, (i + 1) * 220));

  try {
    let result = null;
    const oneWord = !/\s/.test(text.trim()) && text.trim().length < 40;
    if (entry || oneWord) {
      const lex = await fetchLexicon();
      const hit = entry || findEntry(lex, text.trim());
      if (hit) {
        result = { layer: 'memory', text_en: hit.en || '', playlist: hit.clip ? [{ src: hit.clip, from: hit.from_s || 0, to: hit.to_s || undefined }] : [], entry: hit, single: true };
      }
    }
    if (!result) result = await signTranslate(text);

    const body = document.getElementById(`${bid}-body`);
    const load = document.getElementById(`${bid}-load`);
    load.hidden = true;
    body.hidden = false;

    const layer = result.layer || (result.single ? 'dictionary' : 'auto');
    if (layer === 'none' || (!result.playlist || !result.playlist.length) && !result.entry) {
      body.innerHTML = `<div class="as-nosign"><strong>${tt.noSign}</strong><p>${tt.noSignB}</p>
        <div class="as-fb"><button type="button" data-req="${encodeURIComponent(text)}">${tt.request}</button></div></div>`;
      live.textContent = tt.noSign;
      return;
    }

    const badge = result.single || result.entry ? tt.dictionary
      : layer === 'memory' ? tt.recorded : tt.automatic;
    const gloss = (result.gloss || result.entry?.gloss || '').split(/\s+/).filter(Boolean);
    body.innerHTML = `
      <div class="as-meta"><span>${badge}</span>${result.text_en ? `<span lang="en">${result.text_en}</span>` : ''}</div>
      <div class="as-sign-area" id="${bid}-stage"></div>
      <div class="as-gloss" role="group" aria-label="gloss">${gloss.map((g) =>
        `<button type="button" class="sign" data-g="${g}">● ${g}</button>`).join('') || ''}</div>
      <div class="as-fb">
        <button type="button" data-v="approve" data-text="${encodeURIComponent(text)}" data-gloss="${encodeURIComponent(result.gloss || gloss.join(' '))}">${tt.understood}</button>
        <button type="button" data-v="fix" data-text="${encodeURIComponent(text)}" data-gloss="${encodeURIComponent(result.gloss || gloss.join(' '))}">${tt.notClear}</button>
      </div>`;

    const area = document.getElementById(`${bid}-stage`);
    mountStage(area);
    win.show();
    const list = (result.playlist || []).filter((item) => item.src || item.pause != null);
    if (result.entry?.clip && !list.length) {
      list.push({ src: result.entry.clip, from: result.entry.from_s || 0, to: result.entry.to_s });
    }
    active = list;
    playState.segments = [{ playlist: active, source: 'auto' }];
    playState.index = 0;
    playState.item = 0;
    if (active.length) play.playItem(active[0], active[0].from || 0);
    live.textContent = badge;
  } catch (e) {
    const load = document.getElementById(`${bid}-load`);
    load.innerHTML = `<p>${tt.errMsg}</p><button type="button" data-retry="${encodeURIComponent(text)}">${tt.retry}</button>`;
    live.textContent = tt.errMsg;
  }
  scroll.scrollTop = scroll.scrollHeight;
}

async function paintBrowse(topic = 'all') {
  const tt = t();
  const lex = await fetchLexicon();
  const groups = groupsFromLex(lex);
  const items = (lex.items || lex).filter((e) => topic === 'all' || e.group === topic);
  const root = document.getElementById('as-browse-view');
  root.innerHTML = `<p>${tt.browseSub}</p>
    <div class="as-topics" role="toolbar" aria-label="topics">
      ${groups.map((g) => `<button type="button" data-topic="${g}" aria-pressed="${g === topic}">${g === 'all' ? tt.all : g}</button>`).join('')}
    </div>
    <ul class="as-grid">${items.slice(0, 64).map((e) =>
      `<li><button type="button" data-entry="${encodeURIComponent(JSON.stringify({ am: e.am, en: e.en, gloss: e.gloss, clip: e.clip, from_s: e.from_s, to_s: e.to_s }))}">
        <strong lang="${e.am ? 'am' : 'en'}">${e.am || e.en || e.gloss}</strong>
        <span>${e.gloss || ''}</span>
      </button></li>`).join('')}</ul>
    <p><button type="button" id="as-back">${tt.backChat}</button></p>`;
}

function wire() {
  const tt = t();
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const k = el.getAttribute('data-i18n');
    if (tt[k]) el.textContent = tt[k];
  });
  emptyState();
  paintHist();
  document.getElementById('as-composer-ph').placeholder = tt.composer;
  document.getElementById('as-hint').textContent = tt.hint;
  document.getElementById('as-send').textContent = tt.send;

  document.getElementById('as-new').onclick = () => {
    document.getElementById('as-log').innerHTML = '';
    document.getElementById('as-empty').hidden = false;
    emptyState();
    showView('chat');
  };
  document.getElementById('as-browse').onclick = async () => {
    showView('browse');
    await paintBrowse('all');
  };
  document.getElementById('as-settings').onclick = () => document.getElementById('lh-settings-fab')?.click();
  document.getElementById('as-form').onsubmit = (e) => {
    e.preventDefault();
    const v = document.getElementById('as-composer-ph').value.trim();
    if (!v) return;
    document.getElementById('as-composer-ph').value = '';
    runSign(v);
  };
  document.getElementById('as-composer-ph').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('as-form').requestSubmit();
    }
  });

  document.body.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.try) runSign(decodeURIComponent(b.dataset.try));
    if (b.dataset.q) runSign(decodeURIComponent(b.dataset.q));
    if (b.dataset.retry) runSign(decodeURIComponent(b.dataset.retry));
    if (b.id === 'as-judges') {
      await runSign('What is a variable?');
      setTimeout(() => runSign('ተለዋዋጭ ምንድን ነው?'), 1600);
    }
    if (b.dataset.v) {
      await postReview({
        text_am: decodeURIComponent(b.dataset.text || ''),
        gloss: decodeURIComponent(b.dataset.gloss || ''),
        verdict: b.dataset.v,
      });
      live.textContent = t().thanks;
    }
    if (b.dataset.req) {
      await postReview({ text_am: decodeURIComponent(b.dataset.req), gloss: '', verdict: 'fix', note: 'request' });
      live.textContent = t().thanks;
    }
    if (b.dataset.topic) paintBrowse(b.dataset.topic);
    if (b.dataset.entry) {
      const entry = JSON.parse(decodeURIComponent(b.dataset.entry));
      showView('chat');
      runSign(entry.am || entry.en || entry.gloss, entry);
    }
    if (b.id === 'as-back') showView('chat');
  });

  const q = new URLSearchParams(location.search).get('q');
  if (q) runSign(q);
}

wire();

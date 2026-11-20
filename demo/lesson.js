// FR-01 NFR-A11Y-01 INT-01: Lesson chrome; mode switch, layout toggle, cues, panels.
import { API } from './config.js';

const player = document.querySelector('db-player');
const am = () => document.documentElement.lang === 'am';
const STOP = new Set('the a an and of to in is we you your this that it for on with as'.split(' '));
let cues = [], index = 0;
const root = () => player?.shadowRoot;
const video = () => root()?.querySelector('video');
const status = t => { document.getElementById('lesson-status').textContent = t; };

function gloss(text) {
  const parts = text.replace(/[""".,!?።፣]/g, '').split(/\s+/).filter(Boolean);
  const pick = am() ? parts.slice(0, 3) : parts.filter(w => !STOP.has(w.toLowerCase())).slice(0, 4);
  return pick.map(w => am() ? w : w.toUpperCase());
}

function showLine(i) {
  if (!cues.length) return;
  index = Math.max(0, Math.min(cues.length - 1, i));
  const cue = cues[index];
  const line = document.getElementById('line-text');
  line.textContent = cue.text; line.lang = am() ? 'am' : 'en';
  document.getElementById('now-t').textContent = am()
    ? `አሁን በምልክት · መስመር ${index + 1} ከ ${cues.length}`
    : `Now signing · Line ${index + 1} of ${cues.length}`;
  const list = document.getElementById('line-gloss');
  list.replaceChildren(...gloss(cue.text).map(word => { const li = document.createElement('li'); li.textContent = word; return li; }));
  document.querySelectorAll('.tx-line').forEach((btn, n) => btn.setAttribute('aria-current', n === index ? 'true' : 'false'));
}

function seek(time) {
  const node = video(); if (!node) return;
  node.currentTime = time; node.play().catch(() => {});
  document.getElementById('poster-card').hidden = true;
}

function onTime() {
  const time = video()?.currentTime || 0;
  let next = 0; cues.forEach((c, i) => { if (time >= c.start - 0.05) next = i; });
  if (cues.length) showLine(next);
  const code = document.getElementById('code-now'), empty = document.getElementById('code-empty'), on = time >= 24;
  code.hidden = !on; empty.hidden = on;
  if (on) code.textContent = time >= 40 ? 'name = "Abebe"\nprint(name)' : 'name = "Abebe"';
}

function parse(vtt) {
  return vtt.replace(/\r/g, '').split(/\n\n+/).flatMap(block => {
    const lines = block.split('\n').filter(l => l && !l.startsWith('WEBVTT') && !l.startsWith('NOTE'));
    const stamp = lines.find(l => l.includes('-->'));
    if (!stamp) return [];
    const start = stamp.split('-->')[0].trim().split(':').reduce((s, p) => s * 60 + Number(p), 0);
    const text = lines.slice(lines.indexOf(stamp) + 1).join(' ').replace(/<[^>]+>/g, '').trim();
    return text ? [{ start, text }] : [];
  });
}

async function loadCues() {
  const lang = am() ? 'am' : 'en';
  cues = parse(await fetch(`data/lesson.${lang}.vtt`).then(r => r.text()));
  const box = document.getElementById('transcript'); box.replaceChildren();
  cues.forEach((cue, i) => {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'tx-line';
    const m = Math.floor(cue.start / 60), s = String(Math.floor(cue.start % 60)).padStart(2, '0');
    btn.innerHTML = `<time>${m}:${s}</time><span></span>`;
    btn.querySelector('span').textContent = cue.text;
    btn.addEventListener('click', () => seek(cue.start)); box.append(btn);
  });
  showLine(0);
  const meta = document.getElementById('poster-meta');
  if (meta) meta.textContent = am()
    ? `1:00 · ${cues.length} መስመሮች · ግርጌ ጽሑፍ እና የድምፅ መግለጫ`
    : `1:00 · ${cues.length} lines · captions and audio description`;
}

function tabs() {
  const names = ['chapters', 'words', 'transcript'];
  const buttons = [...document.querySelectorAll('.ptabs [role=tab]')];
  const select = i => {
    buttons.forEach((btn, n) => { const on = n === i; btn.setAttribute('aria-selected', on ? 'true' : 'false'); btn.tabIndex = on ? 0 : -1; document.getElementById(names[n]).hidden = !on; });
    document.getElementById('panel-body').setAttribute('aria-labelledby', buttons[i].id);
  };
  buttons.forEach((btn, i) => btn.addEventListener('click', () => select(i)));
}

async function words() {
  const data = await fetch('data/glossary.json').then(r => r.json());
  const box = document.getElementById('words');
  data.terms.forEach(term => {
    const row = document.createElement('div'); row.className = 'word';
    row.innerHTML = `<span class="swatch" aria-hidden="true"></span><span><b></b><i lang="am"></i></span><button type="button" class="show-sign"></button>`;
    row.querySelector('b').textContent = term.en; row.querySelector('i').textContent = term.am;
    const btn = row.querySelector('button'); btn.textContent = am() ? 'ምልክት አሳይ' : 'Show sign';
    btn.addEventListener('click', () => root()?.querySelector('[data-id=glossary]')?.click());
    box.append(row);
  });
}

function ready(fn) { const t = setInterval(() => { if (video()) { clearInterval(t); fn(); } }, 40); }

// ── Mode switch ───────────────────────────────────────────────────
function applyMode(mode) {
  const isAuto = mode === 'auto';
  if (isAuto) {
    player.setAttribute('api', API); player.setAttribute('lesson-id', 'demo'); player.setAttribute('use-memory', 'false'); player.removeAttribute('sign');
  } else {
    player.setAttribute('sign', 'data/sign.json'); player.removeAttribute('api'); player.removeAttribute('lesson-id'); player.removeAttribute('use-memory');
  }
  document.getElementById('mode-interp')?.setAttribute('aria-checked', isAuto ? 'false' : 'true');
  document.getElementById('mode-auto-btn')?.setAttribute('aria-checked', isAuto ? 'true' : 'false');
  const pill = document.getElementById('coverage-pill'); if (pill) pill.hidden = !isAuto;
  const enK = document.querySelector('#poster-kicker .en-only'), amK = document.querySelector('#poster-kicker .am-only');
  if (enK) enK.textContent = isAuto ? 'Automatic sign · beta' : 'Signed by a certified EthSL interpreter';
  if (amK) amK.textContent = isAuto ? 'ራስ-ሰር ምልክት · ሙከራ' : 'በተረጋገጠ የምልክት አስተርጓሚ';
}

// ── Layout toggle ─────────────────────────────────────────────────
function saveLayout(val) {
  let p = {}; try { p = JSON.parse(localStorage.getItem('db-player:prefs') || '{}'); } catch (e) {}
  p.signLayout = val; localStorage.setItem('db-player:prefs', JSON.stringify(p));
}
function applyLayout(val) {
  const isSign = val === 'sign';
  document.getElementById('layout-lesson')?.setAttribute('aria-checked', isSign ? 'false' : 'true');
  document.getElementById('layout-sign')?.setAttribute('aria-checked', isSign ? 'true' : 'false');
  document.getElementById('main')?.setAttribute('data-layout', isSign ? 'sign' : 'lesson');
}

// ── Init ──────────────────────────────────────────────────────────
applyMode(new URLSearchParams(location.search).get('mode') === 'auto' ? 'auto' : 'interpreter');
let initPrefs = {}; try { initPrefs = JSON.parse(localStorage.getItem('db-player:prefs') || '{}'); } catch (e) {}
applyLayout(initPrefs.signLayout);

document.getElementById('mode-interp')?.addEventListener('click', () => applyMode('interpreter'));
document.getElementById('mode-auto-btn')?.addEventListener('click', () => applyMode('auto'));
document.getElementById('layout-lesson')?.addEventListener('click', () => { saveLayout('lesson'); applyLayout('lesson'); });
document.getElementById('layout-sign')?.addEventListener('click', () => { saveLayout('sign'); applyLayout('sign'); });

document.getElementById('poster-play')?.addEventListener('click', () => ready(() => root().querySelector('[data-id=play]')?.click()));
document.querySelectorAll('.chapter').forEach(btn => btn.addEventListener('click', () => seek(Number(btn.dataset.t))));
document.getElementById('line-prev')?.addEventListener('click', () => seek(cues[Math.max(0, index - 1)]?.start || 0));
document.getElementById('line-next')?.addEventListener('click', () => seek(cues[Math.min(cues.length - 1, index + 1)]?.start || 0));
document.getElementById('line-again')?.addEventListener('click', () => seek(cues[index]?.start || 0));
document.getElementById('save-off')?.addEventListener('click', e => {
  const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
  e.currentTarget.setAttribute('aria-pressed', on ? 'true' : 'false');
  localStorage.setItem('db-demo:lesson-saved', on ? '1' : '0');
  status(on ? (am() ? 'በዚህ መሣሪያ ላይ ተቀምጧል' : 'Saved on this device') : (am() ? 'ከዚህ መሣሪያ ተወግዷል' : 'Removed from this device'));
});
document.getElementById('share')?.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); } catch (e) {}
  status(am() ? 'ሊንኩ ተቀድቷል' : 'Link copied');
});
document.getElementById('copy-code')?.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(document.getElementById('code-now').textContent); } catch (e) {}
  status(am() ? 'ተቀድቷል' : 'Copied');
});
if (localStorage.getItem('db-demo:lesson-saved') === '1') document.getElementById('save-off')?.setAttribute('aria-pressed', 'true');

tabs(); loadCues(); words();
ready(() => {
  const node = video();
  node.addEventListener('play', () => { document.getElementById('poster-card').hidden = true; });
  node.addEventListener('timeupdate', onTime);
});
document.addEventListener('lh:prefs-change', e => { if (e.detail?.key === 'lang') loadCues(); });

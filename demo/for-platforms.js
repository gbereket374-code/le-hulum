// INT-01, FR-CORE-01, FR-IN-02: Platforms page — absolute API from config, install snippet built from HOST/MODULE/API.
import { API, HOST, MODULE } from './config.js';

/* ── 1. Set absolute API on the sign-pin element ────────────── */
const pin = document.getElementById('page-pin');
if (pin) pin.setAttribute('api', API);

/* ── 2. Install snippet (never hardcodes a hostname) ────────── */
const SNIPPET = `<!-- 1. Load once in <head> -->
<script type="module" src="${MODULE}"><\\/script>

<!-- 2. Wrap your lesson video -->
<db-player
  src="lesson.mp4"
  poster="lesson-poster.webp"
  captions="lesson.am.vtt,lesson.en.vtt"
  sign="sign.json"
  glossary="glossary.json"
  api="${API}"
  lesson-id="your-lesson-01"
  lang="am">
<\\/db-player>`;

/* ── 3. Steps content (en, am) ──────────────────────────────── */
const STEPS = [
  [
    'Add the script tag once to your page <code>&lt;head&gt;</code>.',
    'ስክሪፕቱን አንድ ጊዜ ወደ ገጽዎ <code>&lt;head&gt;</code> ያክሉ።'
  ],
  [
    'Wrap your lesson video in <code>&lt;db-player&gt;</code>.',
    'ቪዲዮዎን <code>&lt;db-player&gt;</code> ይጠቅልሉ።'
  ],
  [
    'Set <code>api</code> and <code>lesson-id</code> for automatic sign, or point <code>sign</code> at a human-recorded JSON track.',
    '<code>api</code> እና <code>lesson-id</code> ለራስ-ሰር ምልክት ያስቀምጡ፣ ወይም <code>sign</code>ን ወደ የሰው JSON ምልክት ትራክ ያመልክቱ።'
  ]
];

const FACTS = [
  ['One script tag', 'አንድ ስክሪፕት'],
  ['No framework', 'ማዕቀፍ የለም'],
  ['WCAG 2.2 AA', 'WCAG 2.2 AA'],
  ['Amharic + English', 'አማርኛ + እንግሊዝኛ']
];

function am() { return document.documentElement.lang === 'am'; }

function paint() {
  /* steps */
  const stepsEl = document.getElementById('pfm-steps');
  if (stepsEl) {
    stepsEl.innerHTML = STEPS.map(([en, amText], i) =>
      `<li><span class="n">${i + 1}</span><span class="en-only">${en}</span><span class="am-only" lang="am">${amText}</span></li>`
    ).join('');
  }

  /* install snippet */
  const codeEl = document.getElementById('pfm-install');
  if (codeEl) codeEl.textContent = SNIPPET;

  /* feature tags */
  const factsEl = document.getElementById('pfm-facts');
  if (factsEl) {
    factsEl.innerHTML = FACTS.map(([en, amText]) =>
      `<span class="en-only">${en}</span><span class="am-only" lang="am">${amText}</span>`
    ).join('');
  }

  /* copy button label */
  const copy = document.getElementById('pfm-copy');
  if (copy) {
    const label = copy.querySelector('.en-only, .am-only');
    if (label) { /* already dual-lang in HTML */ }
  }
}

paint();

/* Re-paint on language toggle */
document.getElementById('lang')?.addEventListener('click', () => queueMicrotask(paint));

/* ── 4. Copy install snippet ─────────────────────────────────── */
document.getElementById('pfm-copy')?.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(SNIPPET); } catch { return; }
  const copied = document.getElementById('pfm-copied');
  if (copied) {
    copied.textContent = am() ? 'ተቀድቷል' : 'Copied';
    setTimeout(() => { if (copied) copied.textContent = ''; }, 2200);
  }
});

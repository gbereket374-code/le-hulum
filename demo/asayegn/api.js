// FR-SL-08 FR-SL-09 INT-01: Asayegn API glue — translate, lexicon, review only.
import { API } from '../config.js';

export const isAm = (s) => /[\u1200-\u137F]/.test(String(s || ''));

let _lex = null;

export async function fetchLexicon() {
  if (_lex) return _lex;
  const r = await fetch(`${API}/lexicon`);
  if (!r.ok) throw new Error('lexicon');
  _lex = await r.json();
  return _lex;
}

export async function fetchGlossary() {
  const r = await fetch(`${API}/glossary`);
  if (!r.ok) return [];
  const j = await r.json();
  return j.items || j || [];
}

export function findEntry(lex, text) {
  const q = String(text || '').trim().toLowerCase();
  if (!q) return null;
  const items = lex.items || lex || [];
  return items.find((e) =>
    (e.am && e.am.toLowerCase() === q) ||
    (e.en && e.en.toLowerCase() === q) ||
    (e.gloss && e.gloss.toLowerCase() === q)
  ) || null;
}

export async function signTranslate(text) {
  const lang = isAm(text) ? 'am' : 'en';
  const r = await fetch(`${API}/sign/translate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, lang }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || 'translate');
  }
  return r.json();
}

export async function postReview({ text_am, gloss, verdict, note = '' }) {
  const r = await fetch(`${API}/sign/review`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text_am, gloss, verdict, note }),
  });
  return r.ok;
}

export function groupsFromLex(lex) {
  const items = lex.items || lex || [];
  const set = new Set();
  items.forEach((e) => { if (e.group) set.add(e.group); });
  return ['all', ...[...set].sort()];
}

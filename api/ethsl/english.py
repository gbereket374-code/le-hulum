# FR-SL-01: English path — lemma by lexicon "en", drop function words, same EthSL order.
import json
import re

from api.ethsl.morph import lexicon
from api.library import demo_data

_DROP = {"a", "an", "the", "is", "are", "am", "do", "does", "did", "to", "of", "in", "on", "at"}
_NEG = {"not", "n't", "dont", "don't", "didnt", "didn't", "never"}
_WH = {"what": "WHAT", "where": "WHERE", "when": "WHEN", "how": "HOW", "why": "WHY", "who": "WHO"}
_TIME = {
    "today": "TODAY", "tomorrow": "TOMORROW", "yesterday": "YESTERDAY",
    "morning": "MORNING", "evening": "EVENING", "now": "NOW", "next": "NEXT", "first": "FIRST",
}
_ADJ = {"good": "GOOD", "important": "IMPORTANT"}
_FORMS_CACHE = None


def _inflect(base):
    forms = {base}
    if not base:
        return forms
    forms.add(base + "s")
    forms.add(base + "es")
    if base.endswith("y") and len(base) > 1:
        forms.add(base[:-1] + "ies")
    forms.add(base + "ed")
    forms.add(base + "ing")
    if base.endswith("e"):
        forms.add(base + "d")
        forms.add(base[:-1] + "ing")
    return forms


def _forms():
    global _FORMS_CACHE
    if _FORMS_CACHE is not None:
        return _FORMS_CACHE
    by_gloss = {}
    for row in lexicon():
        base = str(row.get("en") or "").lower().strip()
        by_gloss[row["gloss"]] = (_inflect(base), row)
    path = demo_data() / "glossary.json"
    if path.is_file():
        for term in json.loads(path.read_text(encoding="utf-8")).get("terms") or []:
            gloss = term.get("id")
            if gloss in by_gloss:
                forms, row = by_gloss[gloss]
                forms |= {str(f).lower() for f in (term.get("forms_en") or []) if f}
                by_gloss[gloss] = (forms - {""}, row)
    _FORMS_CACHE = list(by_gloss.values())
    return _FORMS_CACHE


def _stems(token):
    low = token.lower()
    out = [low]
    for suf in ("ies", "es", "s", "ed", "ing", "d"):
        if low.endswith(suf) and len(low) > len(suf) + 1:
            stem = low[: -len(suf)]
            if suf == "ies":
                stem = stem + "y"
            out.append(stem)
            if suf == "ing" and not stem.endswith("e"):
                out.append(stem + "e")
    return out


def _lemma(token):
    low = token.lower()
    if low in _WH:
        return _WH[low], "wh"
    if low in _TIME:
        return _TIME[low], "time"
    if low in _ADJ:
        return _ADJ[low], "adj"
    candidates = _stems(token)
    for forms, row in _forms():
        if any(c in forms for c in candidates):
            group = row.get("group") or ""
            if group == "action":
                pos = "verb"
            elif group == "time":
                pos = "time"
            elif row["gloss"] in ("GOOD", "IMPORTANT"):
                pos = "adj"
            else:
                pos = "noun"
            return row["gloss"], pos
    return None, "missing"


def _pack(token, gloss, pos, **flags):
    row = {
        "token": token, "gloss": gloss, "pos": pos, "ambiguous": False,
        "neg": False, "subject": None, "poss": None, "plural": False,
        "acc": False, "imperative": False,
    }
    row.update(flags)
    return row


def tokenize(text):
    return re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", str(text or ""))


def analyze_en(text):
    """Return the same shape as analyze(): {clauses, question}."""
    raw = tokenize(text)
    question = "?" in str(text or "") or (bool(raw) and raw[0].lower() in _WH)
    tokens = []
    neg = False
    for tok in raw:
        key = tok.lower()
        compact = key.replace("'", "")
        if key in _DROP or compact in _DROP:
            continue
        if key in _NEG or compact in _NEG or key.endswith("n't"):
            neg = True
            continue
        gloss, pos = _lemma(tok)
        if gloss is None:
            tokens.append(_pack(tok, tok.upper(), "missing"))
        else:
            # "work" is career/noun in the lexicon but verbal in "does not work"
            if gloss == "WORK" and tok.lower().startswith("work"):
                pos = "verb"
            tokens.append(_pack(tok, gloss, pos))
    if neg and tokens:
        for item in tokens:
            if item["pos"] == "verb":
                item["neg"] = True
                break
        else:
            # No verb — promote last content word so rules.py can hang NOT on it
            tokens[-1]["pos"] = "verb"
            tokens[-1]["neg"] = True
    return {"clauses": [tokens] if tokens else [[]], "question": question}


def is_latin(text):
    shown = str(text or "")
    has_eth = any("\u1200" <= ch <= "\u137F" for ch in shown)
    has_lat = any("A" <= ch <= "Z" or "a" <= ch <= "z" for ch in shown)
    return has_lat and not has_eth

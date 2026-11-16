# FR-SL-04, FR-DEAF-09: Amharic affixes and the lexicon lemma. One source of truth.
import csv
import json

from api.library import demo_data

PREFIXES = ("የሚ", "በሚ", "ለሚ", "የመ", "እንደ", "ስለ", "እን", "እና", "ስን", "የ", "በ", "ለ", "ከ", "ይ", "ያ", "ት", "ታ", "ሲ", "ሚ", "መ")
SUFFIXES = ("አችኋል", "ችኋል", "ላለች", "ላችሁ", "ዎችን", "አችሁ", "ላሉ", "ዎቹ", "አቸው", "ችሁ", "ለን", "ላል", "አል", "ለሁ", "ዎች", "ኦች", "ው", "ዋ", "ኡ", "ን", "ም", "ች", "ል")
NEG_PREFIX = ("የማይ", "ከማይ", "ካል", "ሳይ", "አያ", "አታ", "አላ", "አል", "አት", "አይ")
_EXTRA = ("ችሁን", "አችሁን", "ችሁ", "አችሁ", "ዎችን", "ዎቹ", "ኦች", "ዎች", "ውን", "ዋን")
_BLOCKS = ((0x1210, 0x1200), (0x1280, 0x1200), (0x1220, 0x1230), (0x12D0, 0x12A0), (0x1340, 0x1348))
_LEX = None


def consonants(text):
    out = []
    for char in text or "":
        code = ord(char)
        if 0x1200 <= code <= 0x135F:
            out.append(code - (code - 0x1200) % 8)
    return tuple(out)


def related(text, want):
    got = consonants(text)
    return got == want or (len(want) >= 3 and len(got) >= len(want) and got[:len(want)] == want)


def peel(token, lemma):
    word = token
    guard = max(2, len(consonants(lemma)))
    want = consonants(lemma)
    while len(consonants(word)) > guard:
        found = []
        for prefix in PREFIXES:
            rest = word[len(prefix):]
            if word.startswith(prefix) and len(consonants(rest)) >= guard and related(rest, want):
                found.append(rest)
                break
        for suffix in SUFFIXES:
            rest = word[:-len(suffix)]
            if word.endswith(suffix) and len(consonants(rest)) >= guard and related(rest, want):
                found.append(rest)
                break
        if not found:
            break
        word = next((item for item in found if consonants(item) == want), found[0])
    return word


def am_match(token, lemma):
    if not token or not lemma:
        return False
    if token == lemma:
        return True
    stem = peel(token, lemma)
    return stem == lemma or consonants(stem) == consonants(lemma)


def fold(text):
    def one(char):
        code = ord(char)
        for src, dst in _BLOCKS:
            if src <= code <= src + 7:
                return chr(dst + (code - src))
        return char
    return "".join(one(char) for char in text or "")


def strip_neg(token):
    for prefix in NEG_PREFIX:
        if not token.startswith(prefix) or len(token) <= len(prefix) + 1:
            continue
        rest = token[len(prefix):]
        marked = rest.endswith("ም") and len(rest) > 1
        if prefix in ("አያ", "አታ") and not marked:
            continue
        if marked:
            rest = rest[:-1]
        if prefix == "አላ":
            if marked: return "አ" + rest, True
            continue
        if prefix in ("አያ", "አታ") and rest and not rest.startswith("አ"):
            rest = "አ" + rest
        return rest, True
    return token, False


def _close(got, want):
    """One-consonant spelling only. A different first consonant is another word."""
    if got == want:
        return True
    if len(want) < 5 or len(got) != len(want) or not got or got[0] != want[0]:
        return False
    return sum(left != right for left, right in zip(got, want)) == 1


def lexicon():
    global _LEX
    if _LEX is None:
        _LEX = _load()
    return _LEX


def _load():
    root = demo_data()
    glossary = {}
    path = root / "glossary.json"
    if path.is_file():
        for term in json.loads(path.read_text(encoding="utf-8")).get("terms") or []:
            glossary[term["id"]] = term
    rows = []
    with (root / "words.csv").open(encoding="utf-8", newline="") as handle:
        for raw in csv.DictReader(handle):
            forms = [raw["am"]]
            forms.extend(part for part in (raw.get("forms_am_extra") or "").split("|") if part)
            term = glossary.get(raw["gloss"]) or {}
            forms.extend(term.get("forms_am") or [])
            seen = list(dict.fromkeys(form for form in forms if form))
            rows.append({
                "gloss": raw["gloss"], "am": raw["am"], "en": raw["en"], "group": raw["group"],
                "forms": seen, "folded": [fold(form) for form in seen],
                "cons": consonants(fold(raw["am"])),
                "clip": term.get("sign") or "", "from": term.get("from"), "to": term.get("to"),
            })
    return rows


def _shrink(token):
    views, cur = [], token
    mark = consonants("ን")
    for _step in range(4):
        if len(cur) <= 2 or not (cur.endswith("ን") or consonants(cur[-1:]) == mark):
            break
        cur = cur[:-1]
        views.append(cur)
    return views


def _views(token):
    folded = fold(token)
    bare, _neg = strip_neg(folded)
    grown = []
    for base in (token, folded, bare, *_shrink(folded), *_shrink(bare)):
        grown.append(base)
        grown.extend(base[:-len(suffix)] for suffix in _EXTRA if base.endswith(suffix) and len(base) > len(suffix) + 1)
    return list(dict.fromkeys(view for view in grown if view))


def _vowels(text):
    return tuple((ord(char) - 0x1200) % 8 for char in text or "" if 0x1200 <= ord(char) <= 0x135F)


def _stem_ok(view, row, token):
    folded = fold(view)
    target = fold(row["am"])
    if len(row["cons"]) >= 3 or view not in (token, fold(token)):
        return True
    if peel(folded, target) != folded:
        return True
    vowels, wanted = _vowels(folded), _vowels(target)
    return len(vowels) == len(wanted) and vowels[:-1] == wanted[:-1]


def _alias(token):
    cons = consonants(fold(token))
    finish = consonants(fold("ጠናቀቅ"))
    got = consonants(fold("ገኘ"))
    if any(cons[index:index + len(finish)] == finish for index in range(len(cons))):
        return "FINISH"
    if token.endswith(("ችሁ", "ለን", "ለች")) and any(cons[index:index + len(got)] == got for index in range(len(cons))):
        return "GET"
    return None


def lemma(token):
    from api.ethsl.ambiguous import sense
    found = sense(token)
    if found:
        return found, False
    best = []
    folded = fold(token)
    for row in lexicon():
        score = 0
        for view in _views(token):
            if view in row["forms"] or fold(view) in row["folded"]:
                score = max(score, 3)
            elif (am_match(view, row["am"]) or am_match(fold(view), fold(row["am"]))) and _stem_ok(view, row, token):
                score = max(score, 2)
            elif len(row["cons"]) >= 3 and _close(consonants(fold(view)), row["cons"]):
                score = max(score, 1)
        if score:
            best.append((score, len(row["am"]), row["gloss"]))
    if not best:
        alias = _alias(token)
        return (alias, False) if alias else (None, False)
    best.sort(reverse=True)
    tied = [item for item in best if item[0] == best[0][0] and item[1] == best[0][1]]
    return best[0][2], len({item[2] for item in tied}) > 1

# FR-SL-04, FR-SL-05: Read lemma, person, negation, plural, and clause breaks.
import re

from api.ethsl.morph import am_match, consonants, fold, lemma, lexicon, strip_neg
from api.ethsl.morph import _views
from api.ethsl.normalize import pieces, question

_PREP = {"ስለ", "ከ", "በ", "ለ", "ላይ", "ውስጥ"}
_COPULA = {"ነው", "ናቸው", "ነበር", "ናት", "ነበሩ"}
_NEG_COPULA = {"አይደለም", "አይደሉም", "አልነበረም"}
_CONJ = {"እና", "ወይም", "ግን"}
_WH = {"ምን": "WHAT", "የት": "WHERE", "መቼ": "WHEN", "እንዴት": "HOW", "ለምን": "WHY", "ማን": "WHO"}
_DEMO = {"ይህ", "ያ", "ይህን", "ያን", "ይህንን", "ያንን"}
_SETTING = {"በዚህ", "በዚያ"}
_NUM = {"አንድ": "ONE", "ሁለት": "TWO", "ሶስት": "THREE", "ሦስት": "THREE", "አራት": "FOUR", "አምስት": "FIVE"}
_HAVE = {"አላቸው", "አላት", "አላችሁ", "አለሁ", "አለሽ", "አለህ", "አለን"}
_EXIST = {"አለ", "አሉ", "አለው"}
_TIME = {"በኋላ": "AFTER", "በፊት": "BEFORE", "ትላንትና": "YESTERDAY", "ጠዋት": "MORNING"}
_ADJ = {"GOOD", "IMPORTANT"}
_ADV = {"AGAIN"}
_ENDS = (("አችኋል", "YOU-PL"), ("ችኋል", "YOU-PL"), ("ላችሁ", "YOU-PL"), ("አችሁ", "YOU-PL"), ("ችሁ", "YOU-PL"), ("ለች", "SHE"), ("ለን", "WE"), ("አቸው", "THEY"))


def _order(char):
    code = ord(char or " ")
    return (code - 0x1200) % 8 if 0x1200 <= code <= 0x135F else -1


def subject_ending(token):
    for end, name in _ENDS:
        if token.endswith(end):
            return name
    if token.endswith("ል") and not token.endswith("አል"):
        return "HE"
    return None


def is_can(token):
    cons = list(consonants(fold(token)))
    if cons and cons[0] in (consonants("ት")[0], consonants("ይ")[0]):
        cons = cons[1:]
    return len(cons) >= 2 and cons[0] == consonants("ች")[0] and cons[1] == consonants("ል")[0]


def _piece(token, form):
    if fold(token) == fold(form) or am_match(fold(token), fold(form)):
        return True
    return any(fold(view) == fold(form) or am_match(view, form) for view in _views(token))


def _merge(tokens):
    rows = [row for row in lexicon() if " " in row["am"]]
    out, index = [], 0
    while index < len(tokens):
        found, span = None, 1
        for row in rows:
            parts = row["am"].split()
            if index + len(parts) <= len(tokens) and all(_piece(tokens[index + step], part) for step, part in enumerate(parts)):
                found, span = row, len(parts)
                break
        if found:
            out.append(( "".join(tokens[index:index + span]), found["gloss"], found["group"], True))
        else:
            out.append((tokens[index], None, "", False))
        index += span
    return out


def _pack(token, gloss, pos, ambiguous=False, **flags):
    row = {"token": token, "gloss": gloss, "pos": pos, "ambiguous": ambiguous, "neg": False, "subject": None, "poss": None, "plural": False, "acc": False, "imperative": False}
    row.update(flags)
    return row


def _closed(token):
    folded = fold(token)
    if token in _NEG_COPULA or folded in _NEG_COPULA:
        return _pack(token, None, "copula", neg=True)
    if folded in _PREP or token in _PREP:
        return _pack(token, None, "prep")
    if folded == "ወደ" or token == "ወደ":
        return _pack(token, "TO", "dir")
    if folded in _COPULA or token in _COPULA:
        return _pack(token, None, "copula")
    if folded in _CONJ or token in _CONJ:
        return _pack(token, None, "conj")
    if token in _WH or folded in _WH:
        return _pack(token, _WH.get(token) or _WH.get(folded), "wh")
    if token in _DEMO or folded in _DEMO or token in _SETTING or folded in _SETTING:
        return _pack(token, "IX", "demo")
    if token in _NUM or folded in _NUM:
        return _pack(token, _NUM.get(token) or _NUM.get(folded), "number")
    if token in _HAVE or folded in _HAVE:
        return _pack(token, "HAVE", "have", subject=subject_ending(token))
    if token in _EXIST or folded in _EXIST:
        return _pack(token, "EXIST", "exist")
    if token in _TIME or folded in _TIME:
        return _pack(token, _TIME.get(token) or _TIME.get(folded), "time")
    if is_can(token):
        return _pack(token, "CAN", "modal", subject=subject_ending(token))
    return None


def _pos(gloss, group):
    if gloss in _ADJ:
        return "adj"
    if gloss in _ADV:
        return "adv"
    if group == "time":
        return "time"
    if group == "action":
        return "verb"
    if group == "grammar":
        return "function"
    return "noun"


def _imperative(token, subject, pos):
    if pos != "verb" or subject:
        return False
    surface = token[:-1] if len(token) >= 2 and token.endswith("ት") and _order(token[-2]) == 1 else token
    return bool(surface) and _order(surface[-1]) == 1


def _feature(token, gloss, group, merged):
    closed = None if merged else _closed(token)
    if closed:
        return closed
    ambiguous = False
    row = None
    if not merged:
        gloss, ambiguous = lemma(token)
        row = next((item for item in lexicon() if item["gloss"] == gloss), None)
        group = row["group"] if row else ""
    if gloss == "START" and token in ("መጀመሪያ", "የመጀመሪያ"):
        gloss, row, group = "FIRST", None, "time"
    pos = _pos(gloss, group) if gloss and (row or merged or gloss == "FIRST") else "missing"
    if gloss and not row and not merged and subject_ending(token):
        pos = "verb"
    _bare, neg = strip_neg(fold(token))
    if neg and pos == "noun":
        pos = "verb"
    subject = subject_ending(token) if pos in ("verb", "have", "modal") else None
    own = next((row["am"] for row in lexicon() if row["gloss"] == gloss), "")
    return _pack(
        token, gloss, pos, ambiguous, neg=neg, subject=subject,
        poss="YOU-PL" if pos == "noun" and "ችሁ" in token else None,
        plural=pos == "noun" and ("ዎች" in token or "ኦች" in token),
        acc=pos == "noun" and token.endswith("ን") and not own.endswith("ን"),
        imperative=_imperative(token, subject, pos),
    )


def _verbal(text):
    feats = [_feature(*item) for item in _merge(re.findall(r"[\u1200-\u135A]+", text))]
    return any(item["pos"] in ("verb", "have", "exist", "modal") or item["imperative"] for item in feats)


def _clauses(text):
    """A ፣ with no verb on its left is a list comma, so the nouns stay in one clause."""
    held, out = [], []
    for chunk, boundary in pieces(text):
        held.append(chunk)
        if boundary == "፣" and not _verbal(chunk):
            continue
        out.append(" ".join(held))
        held = []
    if held:
        out.append(" ".join(held))
    return out


def analyze(text):
    groups = [[_feature(*item) for item in _merge(re.findall(r"[\u1200-\u135A]+", clause))] for clause in _clauses(text)]
    return {"clauses": groups, "question": question(text)}

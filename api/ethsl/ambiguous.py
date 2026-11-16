# FR-SL-04: Choose a meaning from the derivational prefix, never from a shared root alone.
import yaml
from pathlib import Path

_PATH = Path(__file__).with_name("ambiguous.yaml")
_ROWS = None
_INFLECT = ("የሚ", "በሚ", "ለሚ", "እንደ", "ስለ", "እን", "የ", "በ", "ለ", "ከ")


def _rows():
    global _ROWS
    if _ROWS is None:
        data = yaml.safe_load(_PATH.read_text(encoding="utf-8")) or {}
        _ROWS = data.get("roots") or []
    return _ROWS


def _head(token, fold, strip_neg):
    word, _neg = strip_neg(fold(token))
    changed = True
    while changed and word:
        changed = False
        for prefix in _INFLECT:
            if word.startswith(prefix) and len(word) > len(prefix) + 1:
                word = word[len(prefix):]
                changed = True
                break
    return word


def sense(token):
    """LOOK for ተ-, APPLY for አ- or ማ-. Unknown roots return None."""
    from api.ethsl.morph import consonants, fold, strip_neg
    head = _head(token, fold, strip_neg)
    got = consonants(head)
    for row in _rows():
        root = consonants(fold(row.get("root") or ""))
        if not root or not any(got[index:index + len(root)] == root for index in range(len(got))):
            continue
        for item in row.get("senses") or []:
            if any(head.startswith(prefix) for prefix in item.get("prefix") or []):
                return item.get("gloss")
    return None

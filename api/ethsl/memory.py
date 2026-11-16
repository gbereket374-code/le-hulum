# FR-SL-02: Exact phrase match, then character 3-gram Jaccard.
import csv

from api.ethsl.normalize import match_key
from api.library import demo_data, measure, memory_bounds, phrase_file, relative

_ROWS = None


def _grams(text):
    if len(text) < 3:
        return {text} if text else set()
    return {text[index:index + 3] for index in range(len(text) - 2)}


def jaccard(left, right):
    one, two = _grams(left.replace(" ", "")), _grams(right.replace(" ", ""))
    if not one or not two:
        return 0.0
    return len(one & two) / len(one | two)


def _clip(row_id):
    path = phrase_file(row_id)
    return relative(path) if path else ""


def _stored():
    try:
        from sqlmodel import select
        from api.db import session
        from api.models import Phrase
        with session() as db:
            found = list(db.exec(select(Phrase)).all())
    except Exception:
        return None
    rows = [{
        "id": row.id, "text_am": row.text_am, "text_en": getattr(row, "text_en", "") or "",
        "gloss": row.gloss or "", "clip": row.clip,
        "from": float(row.from_s), "to": float(row.to_s),
    } for row in found]
    if not rows or not any(row["to"] > row["from"] for row in rows):
        return None
    return rows


def _csv():
    bounds = {}
    try:
        bounds = memory_bounds()
    except (OSError, ValueError, KeyError):
        bounds = {}
    rows = []
    with (demo_data() / "phrases.csv").open(encoding="utf-8", newline="") as handle:
        for raw in csv.DictReader(handle):
            seg = bounds.get(raw["id"]) or {}
            rows.append({
                "id": raw["id"], "text_am": raw["text_am"], "text_en": raw.get("text_en") or "",
                "gloss": raw.get("gloss") or "", "clip": _clip(raw["id"]),
                "from": float(seg["from"]) if seg else None,
                "to": float(seg["to"]) if seg else None,
            })
    return rows


def phrases():
    global _ROWS
    if _ROWS is None:
        _ROWS = _stored() or _csv()
    return _ROWS


def _ensure(row):
    if row.get("from") is not None and row.get("to") is not None and row["to"] > row["from"]:
        return row
    path = phrase_file(row["id"])
    start, end, _total = measure(path) if path else (0.0, 0.0, 0.0)
    row["from"], row["to"] = float(start), float(end)
    return row


def lookup(text):
    key = match_key(text)
    best = None
    for row in phrases():
        am = match_key(row["text_am"])
        en = match_key(row.get("text_en") or "")
        if key and (key == am or (en and key == en)):
            return _ensure(row), 1.0
        score = max(jaccard(key, am), jaccard(key, en) if en else 0.0)
        if score >= 0.85 and (best is None or score > best[1]):
            best = (row, score)
    if not best:
        return None, 0.0
    return _ensure(best[0]), best[1]

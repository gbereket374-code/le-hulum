# FR-SL-01, FR-SL-06, FR-SL-12: The no-AI EthSL translation.
from api.ethsl.confidence import gate
from api.ethsl.gloss import realize
from api.ethsl.memory import lookup
from api.ethsl.normalize import display, match_key
from api.ethsl.render import playlist
from api.ethsl.rules import apply


def _empty(text, reason):
    return {
        "text": text, "normalized": match_key(text), "layer": "none", "gloss": [],
        "nonmanual": [], "confidence": 0.0, "coverage": 0.0, "playlist": [],
        "text_en": "", "reasons": [reason],
    }


def _memory_gloss(row):
    stored = str(row.get("gloss") or "").strip()
    if not stored:
        return []
    return realize([{"gloss": part, "token": part} for part in stored.split()])


def _memory_hit(shown, row, memory_score, reasons):
    return {
        "text": shown, "normalized": match_key(shown), "layer": "memory",
        "gloss": _memory_gloss(row), "nonmanual": [], "confidence": round(float(memory_score), 4),
        "coverage": 1.0, "playlist": [{"src": row["clip"], "from": row["from"], "to": row["to"]}],
        "text_en": row.get("text_en") or "",
        "reasons": (["memory-exact"] if memory_score >= 0.999 else ["memory-similar"]) + reasons,
    }


def run(text, lang="am", use_memory=True):
    shown = display(text)
    row, memory_score = lookup(shown) if use_memory else (None, 0.0)
    if row and row.get("clip"):
        return _memory_hit(shown, row, memory_score, [])
    english = str(lang or "am").lower().startswith("en")
    if english and not any("\u1200" <= char <= "\u135a" for char in shown):
        return _empty(shown, "english needs a translation provider")
    words, reasons, nonmanual, ambiguous = apply(shown)
    items = realize(words)
    layer, value, covered = gate(items, 0.5 if ambiguous else 1.0, 1.0)
    return {
        "text": shown, "normalized": match_key(shown), "layer": layer, "gloss": items,
        "nonmanual": nonmanual, "confidence": value, "coverage": covered,
        "playlist": playlist(items), "text_en": "", "reasons": reasons,
    }

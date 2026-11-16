# FR-SL-05, FR-SL-07, FR-SL-08: Gloss kind, clip, and fingerspelling.
from api.ethsl.morph import lexicon
from api.library import demo_data, lexicon_file, measure, relative

_INDEX = {"I", "YOU", "YOU-PL", "WE", "HE", "SHE", "THEY", "IX"}
_CACHE = {}


def _ready():
    folder = demo_data() / "fingerspell"
    return folder.is_dir() and any(folder.glob("*.mp4"))


def _bounds(gloss):
    row = next((item for item in lexicon() if item["gloss"] == gloss), None)
    if row and row.get("clip") and row.get("from") is not None:
        return row["clip"], float(row["from"]), float(row["to"])
    path = lexicon_file(gloss, (row or {}).get("en") or gloss)
    if path is None:
        return "", None, None
    key = str(path)
    if key not in _CACHE:
        start, end, _total = measure(path)
        _CACHE[key] = (relative(path), float(start), float(end))
    return _CACHE[key]


def realize(words):
    ready = _ready()
    out = []
    for word in words:
        gloss = word.get("gloss") or ""
        if gloss == "|":
            out.append({"token": "‖", "gloss": "‖", "kind": "pause"})
            continue
        if gloss in _INDEX or gloss.startswith("POSS-"):
            out.append({"token": word.get("token") or gloss, "gloss": gloss, "kind": "index"})
            continue
        clip, start, end = _bounds(gloss) if gloss else ("", None, None)
        if clip:
            out.append({"token": word.get("token") or gloss, "gloss": gloss, "kind": "sign", "clip": clip, "from": start, "to": end})
        elif ready:
            out.append({"token": word.get("token") or gloss, "gloss": gloss, "kind": "fingerspell"})
        else:
            out.append({"token": word.get("token") or gloss, "gloss": gloss, "kind": "missing"})
    return out

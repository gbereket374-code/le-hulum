# FR-SL-05, FR-SL-07, FR-SL-15, FR-SL-16: Clip paths, trims, and the rule file.
import json
import os
from pathlib import Path

_RULES = None
_NOTE = ("words", "fingerspelling", "index", "pronouns", "possessive", "plural", "clause_break", "nonmanual_column")


def demo_data():
    chosen = os.environ.get("DEMO_DATA", "").strip()
    if chosen:
        return Path(chosen)
    local = Path(__file__).resolve().parents[1] / "demo" / "data"
    return local if local.is_dir() else Path("/demo/data")


def rules():
    global _RULES
    if _RULES is None:
        import yaml
        path = Path(__file__).resolve().parent / "ethsl" / "rules.yaml"
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        _check(data)
        _RULES = data
    return _RULES


def _check(data):
    if not isinstance(data, dict) or any(key not in data for key in ("version", "status", "gloss_notation", "rules")):
        raise ValueError("rules.yaml is missing a required key")
    note = data["gloss_notation"]
    if not isinstance(note, dict) or any(key not in note for key in _NOTE):
        raise ValueError("rules.yaml gloss notation is incomplete")
    if not isinstance(data["rules"], list) or not data["rules"]:
        raise ValueError("rules.yaml has no rules")
    for rule in data["rules"]:
        if not isinstance(rule, dict) or not str(rule.get("id") or "").strip() or not str(rule.get("what") or "").strip():
            raise ValueError("rules.yaml rule is missing id or what")


def lexicon_file(gloss, en):
    folder = demo_data() / "lexicon"
    for name in (gloss, gloss.lower(), en.lower()):
        path = folder / f"{name}.mp4"
        if path.is_file():
            return path
    return None


def phrase_file(row_id):
    folder = "memory" if str(row_id).startswith("A") else "phrases"
    path = demo_data() / folder / f"{row_id}.mp4"
    return path if path.is_file() else None


def heldout_file(row_id):
    path = demo_data() / "heldout" / f"{row_id}.mp4"
    return path if path.is_file() else None


def relative(path):
    if path is None:
        return ""
    return path.relative_to(demo_data()).as_posix()


def memory_bounds():
    doc = json.loads((demo_data() / "sign.json").read_text(encoding="utf-8"))
    return {seg["cue"]: seg for seg in doc["segments"]}


def measure(path, preset=None):
    import sys
    tools = str(Path(__file__).resolve().parents[1] / "tools")
    if tools not in sys.path:
        sys.path.insert(0, tools)
    from cut_by_pause import duration, read_frames
    from sign_motion import absolute_motion, trim_bounds
    if path is None or not path.is_file():
        return 0.0, 0.0, 0.0
    total = round(float(duration(path)), 3)
    if preset is not None:
        return float(preset["from"]), float(preset["to"]), total
    start, end, _note, _high, _low = trim_bounds(absolute_motion(read_frames(path)), total)
    return float(start), float(end), total

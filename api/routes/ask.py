# FR-SL-01 FR-SL-08: POST /ask — translate + lesson cue match for Asayegn.
import json
import re
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from api.ethsl import translate
from api.library import demo_data

router = APIRouter()

_SKIP = {
    "WHAT", "WHERE", "WHEN", "HOW", "WHY", "WHO", "NOT", "IX", "MANY", "POSS-YOU-PL",
    "I", "WE", "YOU", "YOU-PL", "HE", "SHE", "THEY", "|", "‖",
}


def _vtt_cues(path: Path):
    if not path.is_file():
        return []
    text = path.read_text(encoding="utf-8")
    blocks = re.split(r"\n\n+", text.replace("\r", ""))
    out = []
    for block in blocks:
        lines = [ln for ln in block.split("\n") if ln and not ln.startswith("WEBVTT") and not ln.startswith("NOTE")]
        stamp = next((ln for ln in lines if "-->" in ln), None)
        if not stamp:
            continue
        left = stamp.split("-->")[0].strip()
        parts = left.split(":")
        start = 0.0
        for p in parts:
            start = start * 60 + float(p)
        idx = lines.index(stamp)
        cue_id = lines[0].strip() if idx > 0 and "-->" not in lines[0] else ""
        body = re.sub(r"<[^>]+>", "", " ".join(lines[idx + 1:])).strip()
        if body:
            out.append({"cue": cue_id or f"t{start}", "start": round(start, 3), "text": body})
    return out


def _content_glosses(result):
    return [
        item["gloss"] for item in (result.get("gloss") or [])
        if item.get("gloss") and item["gloss"] not in _SKIP and item.get("kind") not in ("pause", "index")
    ]


def _glossary_terms():
    path = demo_data() / "glossary.json"
    if not path.is_file():
        return []
    return json.loads(path.read_text(encoding="utf-8")).get("terms") or []


def lesson_match(result, text):
    """Highest overlap of message content lemmas vs caption text / glossary; min 1."""
    want = set(_content_glosses(result))
    if not want:
        return None

    root = demo_data()
    # Prefer English cue list for start times; Amharic texts merge by cue id
    en_cues = {c["cue"]: c for c in _vtt_cues(root / "lesson.en.vtt")}
    am_cues = {c["cue"]: c for c in _vtt_cues(root / "lesson.am.vtt")}
    cue_ids = list(dict.fromkeys([*en_cues.keys(), *am_cues.keys()]))
    glossary = _glossary_terms()
    by_gloss = {t["id"]: t for t in glossary}

    best, best_score = None, 0
    for cid in cue_ids:
        en = en_cues.get(cid) or {}
        am = am_cues.get(cid) or {}
        blob = ((en.get("text") or "") + " " + (am.get("text") or "")).lower()
        hit = set()
        for gloss in want:
            term = by_gloss.get(gloss) or {}
            forms = {str(term.get("en") or "").lower(), str(term.get("am") or "").lower(), gloss.lower()}
            forms |= {str(f).lower() for f in (term.get("forms_en") or []) if f}
            forms |= {str(f).lower() for f in (term.get("forms_am") or []) if f}
            if cid in (term.get("cues") or []) or any(f and f in blob for f in forms if len(f) > 1):
                hit.add(gloss)
            elif gloss.lower() in blob:
                hit.add(gloss)
        score = len(hit)
        if score > best_score:
            best_score = score
            start = (en.get("start") if en else None) or (am.get("start") if am else 0)
            shown = en.get("text") or am.get("text") or ""
            best = {"cue": cid, "start": start, "text": shown}
    if best_score < 1:
        return None
    return best


def _credits():
    path = demo_data() / "credits.json"
    if not path.is_file():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        people = data.get("people") if isinstance(data, dict) else data
        return [c for c in (people or []) if c.get("consent")]
    except Exception:
        return []


@router.post("/api/v1/ask")
def ask(body: dict):
    text = str(body.get("text") or "").strip()
    if not text:
        return JSONResponse({"error": "text is required."}, status_code=400)
    lang = body.get("lang")  # may be None → auto-detect
    use_memory = body.get("use_memory", True)
    if isinstance(use_memory, str):
        use_memory = use_memory.strip().lower() not in ("false", "0", "no")
    result = translate(text, lang or "", use_memory=bool(use_memory))
    match = lesson_match(result, text)
    out = dict(result)
    out["lesson_match"] = match
    out["credits"] = _credits()
    return out

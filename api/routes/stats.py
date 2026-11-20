# FR-01: GET /stats — real library counts for the home impact strip.
import json
from pathlib import Path

from fastapi import APIRouter
from sqlmodel import select

from api.db import session
from api.library import demo_data
from api.models import LexiconEntry, Phrase

router = APIRouter()


def _file_stats():
    path = demo_data() / "stats.json"
    if not path.is_file():
        return {"codesigner_understood": None, "codesigner_total": 10, "sentences_cut_midway": 0}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"codesigner_understood": None, "codesigner_total": 10, "sentences_cut_midway": 0}
    return {
        "codesigner_understood": data.get("codesigner_understood", None),
        "codesigner_total": data.get("codesigner_total", 10),
        "sentences_cut_midway": data.get("sentences_cut_midway", 0),
    }


@router.get("/api/v1/stats")
def stats():
    with session() as db:
        signs = len(db.exec(select(LexiconEntry)).all())
        phrases = len(db.exec(select(Phrase)).all())
    vtt = demo_data() / "lesson.en.vtt"
    lesson_lines = 0
    if vtt.is_file():
        text = vtt.read_text(encoding="utf-8")
        lesson_lines = sum(1 for ln in text.splitlines() if "-->" in ln)
    file_stats = _file_stats()
    return {
        "signs": signs,
        "phrases": phrases,
        "lesson_lines": lesson_lines,
        "auto_lines_signed": lesson_lines,
        "sentences_cut_midway": int(file_stats["sentences_cut_midway"] or 0),
        "codesigner_understood": file_stats["codesigner_understood"],
        "codesigner_total": int(file_stats["codesigner_total"] or 10),
    }

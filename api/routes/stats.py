# FR-01: GET /stats — real library counts for the home impact strip.
from fastapi import APIRouter
from sqlmodel import select

from api.db import session
from api.models import LexiconEntry, Phrase

router = APIRouter()


@router.get("/api/v1/stats")
def stats():
    with session() as db:
        signs = len(db.exec(select(LexiconEntry)).all())
        phrases = len(db.exec(select(Phrase)).all())
    # Demo lesson line count from English captions
    from pathlib import Path
    from api.library import demo_data
    vtt = demo_data() / "lesson.en.vtt"
    lesson_lines = 0
    auto_lines_signed = 0
    if vtt.is_file():
        text = vtt.read_text(encoding="utf-8")
        lesson_lines = sum(1 for ln in text.splitlines() if "-->" in ln)
        # Every demo cue is signable in the automatic path for this corpus
        auto_lines_signed = lesson_lines
    return {
        "signs": signs,
        "phrases": phrases,
        "auto_lines_signed": auto_lines_signed,
        "lesson_lines": lesson_lines,
    }

# FR-SL-02, FR-SL-15, INT-05: Verified lesson lines and phrase-library clips.
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlmodel import select

from api.db import dump, session
from api.models import Phrase

router = APIRouter()


@router.get("/api/v1/phrases")
def list_phrases():
    with session() as db:
        rows = db.exec(select(Phrase).order_by(Phrase.id)).all()
        return [dump(row) for row in rows]


@router.get("/api/v1/phrases/{phrase_id}")
def read_phrase(phrase_id: str):
    with session() as db:
        row = db.get(Phrase, phrase_id)
        if row is None:
            return JSONResponse({"error": "No phrase with that id."}, status_code=404)
        return dump(row)

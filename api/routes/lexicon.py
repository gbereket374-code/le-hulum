# FR-SL-15, INT-05: Lexicon entries and sign media, including HTTP range reads.
from fastapi import APIRouter, Request
from fastapi.responses import FileResponse, JSONResponse, Response
from sqlmodel import select

from api.db import dump, session
from api.library import demo_data
from api.models import LexiconEntry

router = APIRouter()


def _miss(message):
    return JSONResponse({"error": message}, status_code=404)


@router.get("/api/v1/lexicon")
def list_lexicon():
    with session() as db:
        rows = db.exec(select(LexiconEntry).order_by(LexiconEntry.gloss)).all()
        return [dump(row) for row in rows]


@router.get("/api/v1/lexicon/{gloss}")
def read_lexicon(gloss: str):
    with session() as db:
        row = db.exec(select(LexiconEntry).where(LexiconEntry.gloss == gloss)).first()
        if row is None:
            return _miss("No lexicon entry with that gloss.")
        return dump(row)


@router.get("/api/v1/media/{path:path}")
def read_media(path: str, request: Request):
    root = demo_data().resolve()
    target = (root / path).resolve()
    if root not in target.parents or not target.is_file():
        return _miss("No media file with that path.")
    return _ranged(target, request)


def _ranged(path, request):
    size = path.stat().st_size
    header = request.headers.get("range")
    if not header:
        return FileResponse(path, media_type="video/mp4")
    if not header.startswith("bytes="):
        return JSONResponse({"error": "That range cannot be read."}, status_code=416)
    spec = header.split("=", 1)[1].split(",")[0].strip()
    start_text, _, end_text = spec.partition("-")
    try:
        start = int(start_text) if start_text else 0
        end = int(end_text) if end_text else size - 1
    except ValueError:
        return JSONResponse({"error": "That range cannot be read."}, status_code=416)
    end = min(end, size - 1)
    if start < 0 or start > end or start >= size:
        return JSONResponse({"error": "That range cannot be read."}, status_code=416)
    with path.open("rb") as handle:
        handle.seek(start)
        chunk = handle.read(end - start + 1)
    return Response(content=chunk, status_code=206, media_type="video/mp4", headers={
        "Accept-Ranges": "bytes",
        "Content-Range": f"bytes {start}-{end}/{size}",
        "Content-Length": str(len(chunk)),
    })

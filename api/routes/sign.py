# FR-SL-01, FR-SL-09, FR-SL-10, INT-05: Translate, build a lesson, and store a review.
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from sqlmodel import select

from api.db import dump, session
from api.ethsl import translate
from api.ethsl.render import export_mp4
from api.models import Example, SignReview

router = APIRouter()


def _segment(cue, use_memory=True):
    result = translate(cue.get("text_am") or "", "am", use_memory=use_memory)
    gloss = " ".join(item["gloss"] for item in result["gloss"] if item.get("kind") != "pause")
    base = {
        "cue": cue.get("id"), "start": cue.get("start"), "end": cue.get("end"), "source": result["layer"],
        "text_am": result["text"], "gloss": gloss, "nonmanual": result["nonmanual"],
        "confidence": result["confidence"], "coverage": result["coverage"],
    }
    if result["layer"] == "memory" and result["playlist"]:
        clip = result["playlist"][0]
        base.update({"src": clip["src"], "from": clip["from"], "to": clip["to"], "duration": round(clip["to"] - clip["from"], 3)})
    elif result["layer"] == "auto":
        base["playlist"] = result["playlist"]
        span = 0.0
        for item in result["playlist"]:
            span += float(item.get("pause") or 0) + max(0.0, float(item.get("to") or 0) - float(item.get("from") or 0))
        base["duration"] = round(span, 3)
    return base


@router.post("/api/v1/sign/translate")
def sign_translate(body: dict, render: str = Query("", alias="format")):
    if not str(body.get("text") or "").strip():
        return JSONResponse({"error": "text is required."}, status_code=400)
    use_memory = body.get("use_memory", True)
    if isinstance(use_memory, str):
        use_memory = use_memory.strip().lower() not in ("false", "0", "no")
    result = translate(body.get("text") or "", body.get("lang") or "am", use_memory=bool(use_memory))
    if render == "mp4":
        result = export_mp4(result)
    return result


@router.post("/api/v1/sign/lesson")
def sign_lesson(body: dict):
    cues = body.get("cues") or []
    if not body.get("lesson_id") or not isinstance(cues, list):
        return JSONResponse({"error": "lesson_id and cues are required."}, status_code=400)
    use_memory = body.get("use_memory", True)
    if isinstance(use_memory, str):
        use_memory = use_memory.strip().lower() not in ("false", "0", "no")
    return {"version": 1, "lesson": body["lesson_id"], "lang": "am", "segments": [_segment(cue, bool(use_memory)) for cue in cues]}


@router.post("/api/v1/sign/review")
def sign_review(body: dict):
    verdict = body.get("verdict")
    if verdict not in ("approve", "fix", "missing") or not str(body.get("text_am") or "").strip():
        return JSONResponse({"error": "text_am and a verdict of approve, fix, or missing are required."}, status_code=400)
    rating = body.get("rating")
    if rating is not None:
        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return JSONResponse({"error": "rating must be an integer from 1 to 5."}, status_code=400)
        if rating < 1 or rating > 5:
            return JSONResponse({"error": "rating must be an integer from 1 to 5."}, status_code=400)
    with session() as db:
        row = SignReview(
            text_am=body["text_am"],
            gloss=str(body.get("gloss") or ""),
            verdict=verdict,
            note=str(body.get("note") or ""),
            rating=rating,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        saved = dump(row)
        if verdict == "approve":
            db.add(Example(id=f"R{row.id}", text_am=row.text_am, text_en="", gloss=row.gloss, status="approved"))
            db.commit()
        return saved

# FR-DEAF-09, INT-05, INT-12: Lesson glossary in the same shape as glossary.json.
import json

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from api.library import demo_data

router = APIRouter()


@router.get("/api/v1/glossary")
def read_glossary():
    path = demo_data() / "glossary.json"
    if not path.is_file():
        return JSONResponse({"error": "No glossary for this lesson."}, status_code=404)
    return json.loads(path.read_text(encoding="utf-8"))

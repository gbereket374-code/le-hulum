# FR-SL-05, FR-SL-16, INT-05: Interpreter examples and the EthSL rule file.
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlmodel import select

from api.db import dump, session
from api.library import rules
from api.models import Example

router = APIRouter()


@router.get("/api/v1/examples")
def list_examples():
    with session() as db:
        rows = db.exec(select(Example).order_by(Example.id)).all()
        return [dump(row) for row in rows]


@router.get("/api/v1/examples/{example_id}")
def read_example(example_id: str):
    with session() as db:
        row = db.get(Example, example_id)
        if row is None:
            return JSONResponse({"error": "No example with that id."}, status_code=404)
        return dump(row)


@router.get("/api/v1/rules")
def read_rules():
    return rules()

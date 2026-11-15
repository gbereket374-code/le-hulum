# FR-SL-16: Held-out lines are for the evaluation tool only. No public route reads them.
from sqlmodel import select

from api.db import dump, session
from api.models import Heldout


def heldout_items():
    with session() as db:
        rows = db.exec(select(Heldout).order_by(Heldout.id)).all()
        return [dump(row) for row in rows]

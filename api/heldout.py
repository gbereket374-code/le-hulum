# FR-SL-16: Held-out lines are for the evaluation tool only. No public route reads them.
from sqlmodel import select

from api.db import dump, get_engine, session
from api.models import Heldout


def heldout_items():
    with session() as db:
        rows = db.exec(select(Heldout).order_by(Heldout.id)).all()
        return [dump(row) for row in rows]


def ensure_heldout():
    found = heldout_items()
    if found:
        return found
    import csv
    from api.library import demo_data
    get_engine()
    with (demo_data() / "heldout.csv").open(encoding="utf-8", newline="") as handle:
        raws = list(csv.DictReader(handle))
    with session() as db:
        for raw in raws:
            db.add(Heldout(
                id=raw["id"], text_am=raw["text_am"], text_en=raw["text_en"], gloss=raw["gloss"],
                nonmanual=raw.get("nonmanual") or "", clip=None, status=raw.get("status") or ""))
        db.commit()
    return heldout_items()

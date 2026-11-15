# FR-SL-15, FR-SL-16, INT-05, INT-12: Fill the sign library. Running it again replaces the same rows.
import csv
import json
from concurrent.futures import ThreadPoolExecutor

from sqlmodel import select

from api.db import session
from api.library import (
    demo_data, heldout_file, lexicon_file, measure, memory_bounds, phrase_file, relative, rules,
)
from api.models import Example, Heldout, LexiconEntry, Phrase


def _rows(name):
    with (demo_data() / name).open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def _glossary():
    doc = json.loads((demo_data() / "glossary.json").read_text(encoding="utf-8"))
    return {term["id"]: term for term in doc["terms"]}


def _add(items, value, folded=False):
    if not value:
        return
    if folded and any(value.lower() == item.lower() for item in items):
        return
    if not folded and value in items:
        return
    items.append(value)


def _forms(raw, terms):
    en, am = [], []
    _add(en, raw["en"], folded=True)
    _add(am, raw["am"])
    term = terms.get(raw["gloss"])
    if term:
        for form in term["forms_en"]:
            _add(en, form, folded=True)
        for form in term["forms_am"]:
            _add(am, form)
    for extra in (raw.get("forms_am_extra") or "").split("|"):
        _add(am, extra)
    return en, am


def _wipe(db, model):
    for row in db.exec(select(model)).all():
        db.delete(row)


def _measured(words, phrases):
    memory = memory_bounds()
    jobs = []
    for raw in words:
        jobs.append((lexicon_file(raw["gloss"], raw["en"]), None))
    for raw in phrases:
        preset = memory.get(raw["id"]) if raw["id"].startswith("A") else None
        jobs.append((phrase_file(raw["id"]), preset))
    with ThreadPoolExecutor(max_workers=8) as pool:
        return list(pool.map(lambda job: measure(job[0], job[1]), jobs))


def seed():
    rules()
    words, phrases = _rows("words.csv"), _rows("phrases.csv")
    examples, held = _rows("examples.csv"), _rows("heldout.csv")
    terms = _glossary()
    measured = _measured(words, phrases)
    with session() as db:
        for model in (LexiconEntry, Phrase, Example, Heldout):
            _wipe(db, model)
        for raw, bounds in zip(words, measured):
            start, end, total = bounds
            en, am = _forms(raw, terms)
            path = lexicon_file(raw["gloss"], raw["en"])
            db.add(LexiconEntry(
                gloss=raw["gloss"], en=en, am=am, group=raw["group"], clip=relative(path),
                from_s=start, to_s=end, duration_s=total, agreed=False))
        for raw, bounds in zip(phrases, measured[len(words):]):
            start, end, total = bounds
            db.add(Phrase(
                id=raw["id"], text_am=raw["text_am"], text_en=raw["text_en"], gloss=None,
                clip=relative(phrase_file(raw["id"])), from_s=start, to_s=end, duration_s=total,
                source="memory" if raw["id"].startswith("A") else "phrase", verified_by=None))
        for raw in examples:
            db.add(Example(
                id=raw["id"], text_am=raw["text_am"], text_en=raw["text_en"], gloss=raw["gloss"],
                nonmanual=raw.get("nonmanual") or "", rules_applied=raw.get("rules_applied") or "",
                confidence=raw.get("confidence") or "", status=raw.get("status") or ""))
        for raw in held:
            path = heldout_file(raw["id"])
            db.add(Heldout(
                id=raw["id"], text_am=raw["text_am"], text_en=raw["text_en"], gloss=raw["gloss"],
                nonmanual=raw.get("nonmanual") or "", clip=relative(path) or None,
                status=raw.get("status") or ""))
        db.commit()
    return {"lexicon": len(words), "phrases": len(phrases), "examples": len(examples), "heldout": len(held)}


def seed_if_empty():
    with session() as db:
        if db.exec(select(LexiconEntry)).first():
            return None
    return seed()


def main():
    print(seed())


if __name__ == "__main__":
    main()

# FR-SL-15, FR-SL-16, INT-11, INT-12: Sign library rows stored in SQLite.
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import CheckConstraint, Column
from sqlalchemy import JSON
from sqlmodel import Field, SQLModel


def _now():
    return datetime.now(timezone.utc)


class LexiconEntry(SQLModel, table=True):
    __tablename__ = "lexicon"
    id: Optional[int] = Field(default=None, primary_key=True)
    gloss: str = Field(unique=True, index=True)
    en: list = Field(default_factory=list, sa_column=Column(JSON))
    am: list = Field(default_factory=list, sa_column=Column(JSON))
    group: str
    clip: str
    from_s: float
    to_s: float
    duration_s: float
    agreed: bool = False


class Phrase(SQLModel, table=True):
    __tablename__ = "phrase"
    __table_args__ = (CheckConstraint("source IN ('memory', 'phrase')"),)
    id: str = Field(primary_key=True)
    text_am: str
    text_en: str
    gloss: Optional[str] = None
    clip: str
    from_s: float
    to_s: float
    duration_s: float
    source: str
    verified_by: Optional[str] = None


class Example(SQLModel, table=True):
    __tablename__ = "example"
    id: str = Field(primary_key=True)
    text_am: str
    text_en: str
    gloss: str
    nonmanual: str = ""
    rules_applied: str = ""
    confidence: str = ""
    status: str = ""


class Heldout(SQLModel, table=True):
    __tablename__ = "heldout"
    id: str = Field(primary_key=True)
    text_am: str
    text_en: str
    gloss: str
    nonmanual: str = ""
    clip: Optional[str] = None
    status: str = ""


class SignReview(SQLModel, table=True):
    __tablename__ = "sign_review"
    __table_args__ = (CheckConstraint("verdict IN ('approve', 'fix', 'missing')"),)
    id: Optional[int] = Field(default=None, primary_key=True)
    text_am: str
    gloss: str
    verdict: str
    note: str = ""
    created_at: datetime = Field(default_factory=_now)

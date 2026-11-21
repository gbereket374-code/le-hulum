# NFR-PRIV-06, INT-05: Open SQLite at DATA_DIR/le-hulum.db.
from sqlmodel import Session, SQLModel, create_engine

_engine = None
_path = None


def db_path():
    from api.settings import data_dir
    return data_dir() / "le-hulum.db"


def get_engine():
    global _engine, _path
    import api.models  # noqa: F401
    path = db_path()
    if _engine is None or path != _path:
        path.parent.mkdir(parents=True, exist_ok=True)
        _engine = create_engine(f"sqlite:///{path}", connect_args={"check_same_thread": False})
        _path = path
        SQLModel.metadata.create_all(_engine)
        # Lightweight migrate: older DBs may lack optional columns.
        with _engine.connect() as conn:
            cols = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info(sign_review)").fetchall()}
            if "rating" not in cols:
                conn.exec_driver_sql("ALTER TABLE sign_review ADD COLUMN rating INTEGER")
                conn.commit()
    return _engine


def session():
    return Session(get_engine())


def dump(row):
    if hasattr(row, "model_dump"):
        return row.model_dump()
    return row.dict()

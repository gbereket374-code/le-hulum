# NFR-QA-01, FR-SL-15, FR-SL-16, INT-05: Seed counts, hidden held-out lines, range and 404.
import json
from pathlib import Path

from fastapi.testclient import TestClient

from api.heldout import heldout_items
from api.main import app
from api.seed import seed

ROOT = Path(__file__).resolve().parents[2]
SECRET = "Today we learn about lists."
SECRET_AM = "ዛሬ ስለ ዝርዝር እንማራለን።"


def test_library_seed_routes_and_media(data_root):
    assert seed() == {"lexicon": 64, "phrases": 39, "examples": 20, "heldout": 10}
    assert seed()["lexicon"] == 64
    with TestClient(app) as client:
        lexicon = client.get("/api/v1/lexicon").json()
        phrases = client.get("/api/v1/phrases").json()
        examples = client.get("/api/v1/examples").json()
        glossary = client.get("/api/v1/glossary").json()
        rulebook = client.get("/api/v1/rules").json()
        assert len(lexicon) == 64
        assert len(phrases) == 39
        assert len(examples) == 20
        assert glossary["version"] == 1 and glossary["lesson"] and glossary["terms"]
        assert {"id", "am", "en", "group", "sign", "from", "to", "forms_am", "forms_en", "cues"} <= set(glossary["terms"][0])
        assert rulebook["version"] == 1 and rulebook["rules"][0]["id"]
        sign = json.loads((ROOT / "demo" / "data" / "sign.json").read_text(encoding="utf-8"))
        a01 = next(row for row in phrases if row["id"] == "A01")
        seg = next(row for row in sign["segments"] if row["cue"] == "A01")
        assert a01["source"] == "memory" and a01["from_s"] == seg["from"] and a01["to_s"] == seg["to"]
        assert sum(row["source"] == "phrase" for row in phrases) == 25
        media = ROOT / "demo" / "data"
        for row in lexicon + phrases:
            assert row["to_s"] > row["from_s"]
            assert (media / row["clip"]).is_file()
        hidden = heldout_items()
        assert len(hidden) == 10
        assert hidden[0]["text_en"] == SECRET
        assert all(row["clip"] is None for row in hidden)
        public = " ".join([
            json.dumps(lexicon, ensure_ascii=False), json.dumps(phrases, ensure_ascii=False),
            json.dumps(examples, ensure_ascii=False), json.dumps(glossary, ensure_ascii=False),
            json.dumps(rulebook, ensure_ascii=False), client.get("/api/openapi.json").text,
        ])
        assert SECRET not in public and SECRET_AM not in public
        assert all("heldout" not in path for path in client.get("/api/openapi.json").json()["paths"])
        missing = client.get("/api/v1/lexicon/NO-SUCH")
        assert missing.status_code == 404 and missing.json()["error"]
        ranged = client.get("/api/v1/media/lexicon/error.mp4", headers={"Range": "bytes=0-15"})
        assert ranged.status_code == 206
        assert ranged.headers["content-range"].startswith("bytes 0-15/")
        assert len(ranged.content) == 16
        assert client.get("/api/v1/media/lexicon/missing.mp4").status_code == 404

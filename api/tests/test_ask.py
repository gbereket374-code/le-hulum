# FR-SL-01 FR-SL-08: English path, /ask lesson_match, /stats.
from fastapi.testclient import TestClient

from api.ethsl import translate
from api.main import app


def _gloss(text):
    result = translate(text, use_memory=False)
    return [item["gloss"] for item in result["gloss"] if item.get("kind") != "pause"], result


def test_english_what_is_variable_matches_amharic():
    en, en_r = _gloss("What is a variable?")
    am, am_r = _gloss("ተለዋዋጭ ምንድን ነው?")
    assert en == am == ["VARIABLE", "WHAT"]
    assert "q-wh" in en_r["nonmanual"] and "q-wh" in am_r["nonmanual"]


def test_english_code_does_not_work():
    words, result = _gloss("The code does not work.")
    assert words == ["CODE", "WORK", "NOT"]
    assert "neg" in result["nonmanual"]


def test_ask_same_lesson_match(data_root, monkeypatch):
    monkeypatch.setattr("api.seed.seed_if_empty", lambda: None)
    with TestClient(app) as client:
        en = client.post("/api/v1/ask", json={"text": "What is a variable?"}).json()
        am = client.post("/api/v1/ask", json={"text": "ተለዋዋጭ ምንድን ነው?"}).json()
        assert [i["gloss"] for i in en["gloss"] if i.get("kind") != "pause"] == [
            i["gloss"] for i in am["gloss"] if i.get("kind") != "pause"
        ]
        assert en["lesson_match"] and am["lesson_match"]
        assert en["lesson_match"]["cue"] == am["lesson_match"]["cue"]
        assert en["lesson_match"]["cue"].startswith("A")


def test_stats(data_root, monkeypatch):
    monkeypatch.setattr("api.seed.seed_if_empty", lambda: None)
    with TestClient(app) as client:
        # seed disabled — counts may be 0; shape must be present
        body = client.get("/api/v1/stats").json()
        assert set(body) >= {"signs", "phrases", "auto_lines_signed", "lesson_lines"}
        assert body["lesson_lines"] >= 1

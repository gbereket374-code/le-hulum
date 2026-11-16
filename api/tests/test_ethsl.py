# FR-SL-01, FR-SL-06, FR-SL-09: Rules, memory, the gate, and the sign routes.
from fastapi.testclient import TestClient

from api.ethsl import translate
from api.main import app

SAVANNA = [
    "ኮምፒውተሩን ክፈቱ፣ አሁን ትምህርቱን ጀምሩ።",
    "ኤዲተሩን ክፈቱ፣ ኮድ ጻፉ።",
    "ኮዱን አስኪዱ፣ እሴቱን በስክሪኑ ላይ አረጋግጡ።",
    "ኮዱ ካልሰራ፣ ስህተቱን አረጋግጡ።",
    "ቀጥሎ ተለዋዋጭ፣ መረጃ እና ድግግሞሽ ተማሩ።",
    "ጥሩ ኮድ ጥሩ ሥራ ይፈጥራል።",
]


def glosses(text):
    result = translate(text)
    return [item["gloss"] for item in result["gloss"] if item.get("kind") != "pause"], result


def test_eight_sentences():
    saved = translate("ፋይሉን አስቀምጡ።")
    assert saved["layer"] == "memory" and saved["coverage"] == 1 and saved["gloss"] == []
    assert saved["playlist"][0]["src"].endswith("B13.mp4")
    assert saved["playlist"][0]["to"] > saved["playlist"][0]["from"]
    assert glosses("ዛሬ ስለ ኮድ እንማራለን።")[0] == ["TODAY", "WE", "LEARN", "CODE"]
    words, result = glosses("ኮዱ አልሰራም።")
    assert words == ["CODE", "WORK", "NOT"] and "neg" in result["nonmanual"]
    assert glosses("ኮዱ ካልሰራ፣ ስህተቱን አረጋግጡ።")[0] == ["CODE", "WORK", "NOT", "CHECK", "ERROR"]
    assert glosses("ጥሩ ኮድ ጥሩ ሥራ ይፈጥራል።")[0] == ["CODE", "GOOD", "CREATE", "WORK", "GOOD"]
    words, result = glosses("ተማሪዎች ጥያቄ አላቸው?")
    assert words == ["STUDENT", "MANY", "HAVE", "QUESTION"] and "q-yn" in result["nonmanual"]
    memory = translate("ሰላም፣ እንኳን ደህና መጣችሁ።")
    assert memory["layer"] == "memory" and memory["confidence"] == 1 and memory["coverage"] == 1
    assert memory["gloss"] == []
    assert memory["playlist"][0]["src"].endswith("A01.mp4")
    assert memory["playlist"][0]["from"] == 0.05 and memory["playlist"][0]["to"] == 7.3
    assert translate("ፕላኔቱ ዙሪያ ዞረ።")["layer"] == "none"


def test_savanna_paragraph_is_fully_signed():
    for text in SAVANNA:
        result = translate(text)
        failed = [item for item in result["gloss"] if item["kind"] == "missing"]
        assert result["layer"] == "auto" and result["coverage"] == 1, (text, failed, result["gloss"])
    paused = translate(SAVANNA[0])
    assert any(item.get("kind") == "pause" and item.get("gloss") == "‖" for item in paused["gloss"])
    assert not any(item.get("kind") == "index" and item.get("gloss") in ("|", "‖") for item in paused["gloss"])
    assert any(item.get("pause") == 0.25 for item in paused["playlist"])
    listed = translate(SAVANNA[4])
    assert [item["gloss"] for item in listed["gloss"]] == ["NEXT", "LEARN", "VARIABLE", "DATA", "LOOP"]
    assert not any(item.get("kind") == "pause" for item in listed["gloss"])
    assert not any("pause" in item for item in listed["playlist"])


def test_list_comma_negation_and_number():
    assert glosses("ቀጥሎ ተለዋዋጭ፣ መረጃ እና ድግግሞሽ ተማሩ።")[0] == ["NEXT", "LEARN", "VARIABLE", "DATA", "LOOP"]
    words, result = glosses("መምህሩ ኮዱን አያሳይም።")
    assert words == ["TEACHER", "SHOW", "CODE", "NOT"] and "neg" in result["nonmanual"]
    words, result = glosses("ኮዱ ጥሩ አይደለም።")
    assert words == ["CODE", "GOOD", "NOT"] and "neg" in result["nonmanual"]
    assert "NOT" in glosses("ኮዱ አይደሉም።")[0] and "neg" in glosses("ኮዱ አልነበረም።")[1]["nonmanual"]
    words, result = glosses("ሁለት ተለዋዋጮችን ፍጠሩ።")
    assert words == ["CREATE", "VARIABLE", "TWO"] and result["layer"] == "none"
    assert any(item["gloss"] == "TWO" and item["kind"] == "missing" for item in result["gloss"])


def test_sign_routes(data_root, monkeypatch):
    monkeypatch.setattr("api.seed.seed_if_empty", lambda: None)
    with TestClient(app) as client:
        saved = client.post("/api/v1/sign/translate", json={"text": "ፋይሉን አስቀምጡ።", "lang": "am"})
        body = saved.json()
        assert saved.status_code == 200 and body["layer"] == "memory" and body["gloss"] == []
        assert body["coverage"] == 1 and body["playlist"][0]["to"] > body["playlist"][0]["from"]
        lesson = client.post("/api/v1/sign/lesson", json={"lesson_id": "demo", "cues": [
            {"id": "A01", "start": 0, "end": 2, "text_am": "ሰላም፣ እንኳን ደህና መጣችሁ።"},
            {"id": "C01", "start": 2, "end": 5, "text_am": "ዛሬ ስለ ኮድ እንማራለን።"},
            {"id": "N01", "start": 5, "end": 7, "text_am": "ፕላኔቱ ዙሪያ ዞረ።"},
        ]})
        segments = lesson.json()["segments"]
        assert segments[0]["source"] == "memory" and segments[0]["src"].endswith("A01.mp4")
        assert segments[1]["source"] == "auto" and segments[1]["playlist"]
        assert segments[2]["source"] == "none"
        review = client.post("/api/v1/sign/review", json={"text_am": "ፋይሉን አስቀምጡ።", "gloss": "SAVE FILE", "verdict": "approve", "note": "ok"})
        assert review.status_code == 200 and review.json()["verdict"] == "approve"
        examples = client.get("/api/v1/examples").json()
        assert any(row["gloss"] == "SAVE FILE" and row["text_am"] == "ፋይሉን አስቀምጡ።" for row in examples)
        assert client.post("/api/v1/sign/translate", json={"text": "  "}).status_code == 400

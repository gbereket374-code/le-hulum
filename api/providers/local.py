# FR-SL-12, NFR-SUS-01: Local model stub. Falls back to the rules engine.
def translate(text, lang="am"):
    from api.ethsl.engine import run
    result = run(text, lang)
    result["reasons"] = ["provider local fell back to none"] + result["reasons"]
    return result

# FR-SL-12, NFR-PRIV-03: Cloud model stub. Falls back to the rules engine.
def translate(text, lang="am"):
    from api.ethsl.engine import run
    result = run(text, lang)
    result["reasons"] = ["provider cloud fell back to none"] + result["reasons"]
    return result

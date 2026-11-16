# C-10, NFR-SUS-01: No-AI fallback. The rules engine translates the line.
def translate(text, lang="am"):
    from api.ethsl.engine import run
    return run(text, lang)

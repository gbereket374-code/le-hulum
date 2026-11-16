# C-10, NFR-SUS-01: No-AI fallback. The rules engine translates the line.
def translate(text, lang="am", use_memory=True):
    from api.ethsl.engine import run
    return run(text, lang, use_memory=use_memory)

# FR-SL-12: Public EthSL entry. local and cloud fall back to the rules engine.
import os


def translate(text, lang="am", use_memory=True):
    which = (os.environ.get("PROVIDER", "none") or "none").strip().lower()
    if which == "local":
        from api.providers.local import translate as call
        return call(text, lang, use_memory=use_memory)
    if which == "cloud":
        from api.providers.cloud import translate as call
        return call(text, lang, use_memory=use_memory)
    from api.ethsl.engine import run
    return run(text, lang, use_memory=use_memory)

# FR-SL-12: Public EthSL entry. local and cloud fall back to the rules engine.
import os


def translate(text, lang="am"):
    which = (os.environ.get("PROVIDER", "none") or "none").strip().lower()
    if which == "local":
        from api.providers.local import translate as call
        return call(text, lang)
    if which == "cloud":
        from api.providers.cloud import translate as call
        return call(text, lang)
    from api.ethsl.engine import run
    return run(text, lang)

# FR-SL-05: Time phrases and setting topics stay together and move to the front.
from api.ethsl.morph import fold

_DAY = {"TODAY", "TOMORROW", "YESTERDAY"}
_CLOCK = {"MORNING", "EVENING", "NIGHT", "AFTERNOON"}
_CLOCK_AM = {"ጠዋት", "ማታ", "ምሽት", "ሌሊት", "ከሰዓት"}
_SETTING = {"በዚህ", "በዚያ", "ይህ", "ያ"}
_DROP = {"copula", "prep", "conj", "function"}


def _clock(token):
    return token["gloss"] in _CLOCK or token["token"] in _CLOCK_AM or fold(token["token"]) in _CLOCK_AM


def _binds(token, nxt):
    if not nxt or token["pos"] != "time" or token["gloss"] in ("AFTER", "BEFORE"):
        return False
    if token["gloss"] in _DAY:
        return _clock(nxt) or (nxt["pos"] == "time" and nxt["gloss"] not in ("AFTER", "BEFORE"))
    return token["gloss"] == "NEXT" and token["token"] not in ("ቀጥሎ",) and nxt["pos"] in ("noun", "missing")


def _setting(token):
    return token["token"] in _SETTING or fold(token["token"]) in _SETTING


def split(kept):
    """Return time words, (demonstrative, noun phrase) settings, body, and AFTER/BEFORE."""
    time, settings, body = [], [], []
    index = 0
    while index < len(kept):
        token = kept[index]
        nxt = kept[index + 1] if index + 1 < len(kept) else None
        if _binds(token, nxt):
            time.extend((token, nxt))
            index += 2
            continue
        if _setting(token) and nxt and nxt["pos"] in ("noun", "missing"):
            unit = [nxt]
            index += 2
            while index < len(kept) and kept[index]["pos"] in ("adj", "number"):
                unit.append(kept[index])
                index += 1
            settings.append((token, unit))
            continue
        if token["pos"] == "time" and token["gloss"] not in ("AFTER", "BEFORE"):
            time.append(token)
            index += 1
            continue
        body.append(token)
        index += 1
    tail = [token for token in body if token["pos"] == "time" and token["gloss"] in ("AFTER", "BEFORE")]
    body = [token for token in body if token not in tail]
    return time, settings, body, tail


def unsaid(tokens, out):
    """Content tokens that never reached the gloss. Function words are allowed to drop."""
    seen = [item["token"] for item in out]
    extra = []
    for token in tokens:
        if token["pos"] in _DROP:
            continue
        word = token["token"]
        if word in seen or any(len(word) >= 3 and word in item for item in seen):
            continue
        extra.append({"gloss": token["gloss"] or word, "token": word})
        seen.append(word)
    return extra

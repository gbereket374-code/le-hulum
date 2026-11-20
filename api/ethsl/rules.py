# FR-SL-05: Apply api/ethsl/rules.yaml in order and record why.
from api.ethsl.analyze import analyze
from api.ethsl.order import split, unsaid


def _dedupe(items):
    seen = []
    for item in items:
        if item not in seen:
            seen.append(item)
    return seen


def _walk(body):
    nps, pending, verbs = [], [], []
    ads, mods, whs = [], [], []
    neg = imperative = False
    pronoun = None
    for token in body:
        if token["pos"] in ("adj", "number", "demo"):
            pending.append(token)
        elif token["pos"] in ("noun", "missing", "dir"):
            nps.append({"head": token, "mods": pending})
            pending = []
        elif token["pos"] in ("verb", "have", "exist"):
            verbs.append(token)
            neg = neg or token["neg"]
            pronoun = token["subject"] or pronoun
            imperative = imperative or token["imperative"]
        elif token["pos"] == "adv":
            ads.append(token)
        elif token["pos"] == "modal":
            mods.append(token)
            pronoun = token["subject"] or pronoun
        elif token["pos"] == "wh":
            whs.append(token)
        else:
            pending.append(token)
    if pending and nps:
        nps[-1]["mods"].extend(pending)
    elif pending:
        nps.extend({"head": token, "mods": []} for token in pending)
    verb = verbs[-1] if verbs else None
    return nps, verb, verbs[:-1], ads, mods, whs, neg, pronoun, imperative


def _np(np, number, fired):
    head = np["head"]
    out = []
    if head.get("poss"):
        out.append({"gloss": "POSS-" + head["poss"], "token": head["token"]})
        fired.append("possessive-palm")
    out.append({"gloss": head["gloss"] or head["token"], "token": head["token"]})
    for mod in np["mods"]:
        out.append({"gloss": "IX" if mod["pos"] == "demo" else (mod["gloss"] or mod["token"]), "token": mod["token"]})
        fired.append("demonstrative-index" if mod["pos"] == "demo" else "adjective-after-noun")
    if head.get("plural") and not number:
        out.append({"gloss": "MANY", "token": head["token"]})
        fired.append("plural-many")
    return out


def _clause(tokens):
    fired = []
    if any(token["pos"] == "copula" for token in tokens):
        fired.append("drop-copula")
    if any(token["pos"] == "prep" for token in tokens):
        fired.append("drop-preposition")
    kept = [token for token in tokens if token["pos"] not in ("copula", "prep", "conj", "function")]
    front, settings, body, tail = split(kept)
    if front or tail:
        fired.append("time-first")
    copula_neg = any(token["pos"] == "copula" and token.get("neg") for token in tokens)
    nps, verb, earlier, ads, mods, whs, neg, pronoun, imperative = _walk(body)
    neg = neg or copula_neg
    number = any(token["pos"] == "number" for token in kept)
    strong = pronoun in ("WE", "YOU-PL", "I", "YOU")
    if imperative:
        fired.append("imperative-no-subject")
        subjects, objects = [], nps
    elif verb and strong:
        fired.append("pronoun-from-verb")
        subjects, objects = [], nps
    elif verb and verb["pos"] == "exist":
        fired.append("subject-verb-object")
        subjects, objects = nps, []
    elif verb:
        fired.append("subject-verb-object")
        objects = [np for np in nps if np["head"].get("acc")]
        subjects = [np for np in nps if not np["head"].get("acc")]
        if not objects and len(subjects) > 1:
            subjects, objects = subjects[:1], subjects[1:]
    else:
        subjects, objects = nps, []
    out = [{"gloss": token["gloss"] or token["token"], "token": token["token"]} for token in front]
    for demo, unit in settings:
        out.extend(_np({"head": unit[0], "mods": [demo, *unit[1:]]}, number, fired))
    if verb and not imperative and not subjects and pronoun:
        out.append({"gloss": pronoun, "token": verb["token"]})
        fired.append("pronoun-from-verb")
    for np in subjects:
        out.extend(_np(np, number, fired))
    for extra in earlier:
        out.append({"gloss": extra["gloss"] or extra["token"], "token": extra["token"]})
    if verb:
        out.append({"gloss": verb["gloss"] or verb["token"], "token": verb["token"]})
    for np in objects:
        out.extend(_np(np, number, fired))
    if ads or mods:
        fired.append("adverb-after-verb")
    out.extend({"gloss": token["gloss"] or token["token"], "token": token["token"]} for token in ads + mods + tail)
    if neg:
        fired.append("negation-at-end")
        source = verb["token"] if verb else next(token["token"] for token in tokens if token.get("neg"))
        out.append({"gloss": "NOT", "token": source})
    if whs:
        fired.append("question-wh")
        out.extend({"gloss": token["gloss"], "token": token["token"]} for token in whs)
    out.extend(unsaid(tokens, out))
    return out, fired, bool(whs), neg


def apply(text, lang="am"):
    # FR-SL-01: Amharic or English analyze → same EthSL clause order.
    use_en = str(lang or "am").lower().startswith("en")
    if use_en:
        from api.ethsl.english import analyze_en
        doc = analyze_en(text)
    else:
        doc = analyze(text)
    reasons, glosses, nonmanual = [], [], []
    ambiguous = any(token["ambiguous"] for clause in doc["clauses"] for token in clause)
    neg = False
    wh = False
    for index, clause in enumerate(doc["clauses"]):
        words, fired, clause_wh, clause_neg = _clause(clause)
        if index and words:
            glosses.append({"gloss": "|", "token": "|"})
        glosses.extend(words)
        reasons.extend(fired)
        neg = neg or clause_neg
        wh = wh or clause_wh
    if doc["question"] and wh:
        nonmanual.append("q-wh")
    elif doc["question"]:
        reasons.append("question-yes-no")
        nonmanual.append("q-yn")
    if neg and "neg" not in nonmanual:
        nonmanual.insert(0, "neg")
    if sum(1 for clause in doc["clauses"] if clause) > 1:
        reasons.append("clause-pause")
    return glosses, _dedupe(reasons), nonmanual, ambiguous

# FR-SL-06, FR-SL-11, FR-SL-12: Coverage, rule agreement, and the publish gate.
import os


def _content(items):
    return [item for item in items if item.get("kind") in ("sign", "missing", "fingerspell")]


def coverage(items):
    content = _content(items)
    if not content:
        return 1.0
    return sum(item["kind"] == "sign" for item in content) / len(content)


def score(coverage_value, rule_pass, agreement):
    return 0.5 * coverage_value + 0.3 * rule_pass + 0.2 * agreement


def gate(items, rule_pass, agreement=1.0):
    covered = coverage(items)
    value = score(covered, rule_pass, agreement)
    minimum = float(os.environ.get("SIGN_MIN_CONFIDENCE", "0.7") or 0.7)
    missing = any(item.get("kind") == "missing" for item in items)
    layer = "auto" if value + 1e-9 >= minimum and not missing else "none"
    return layer, round(value, 4), round(covered, 4)

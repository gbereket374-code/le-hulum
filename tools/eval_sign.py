# FR-SL-05, FR-SL-06, FR-SL-16: Score the rules against the examples and the held-out lines.
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from api.ethsl import translate


def tokens(text):
    return [part for part in str(text or "").replace("|", " ").split() if part]


def gloss_text(result):
    skip = {"pause"}
    return " ".join(item["gloss"] for item in result["gloss"] if item.get("kind") not in skip and item.get("gloss") not in ("|", "‖"))


def edit(left, right):
    prev = list(range(len(right) + 1))
    for i, item in enumerate(left, 1):
        cur = [i]
        for j, other in enumerate(right, 1):
            cur.append(min(cur[-1] + 1, prev[j] + 1, prev[j - 1] + (item != other)))
        prev = cur
    return prev[-1]


def f1(pred, gold):
    if not pred and not gold:
        return 1.0
    counts = {}
    for token in gold:
        counts[token] = counts.get(token, 0) + 1
    overlap = 0
    for token in pred:
        if counts.get(token, 0):
            overlap += 1
            counts[token] -= 1
    precision = overlap / len(pred) if pred else 0
    recall = overlap / len(gold) if gold else 0
    return 0 if precision + recall == 0 else 2 * precision * recall / (precision + recall)


def order_accuracy(pred, gold):
    if not pred and not gold:
        return 1.0
    return 1 - edit(pred, gold) / max(len(pred), len(gold))


def rows_of(items):
    table = []
    exact = f_sum = order_sum = 0
    for item in items:
        result = translate(item["text_am"], use_memory=False)
        pred, gold = tokens(gloss_text(result)), tokens(item["gloss"])
        match = pred == gold
        score_f, score_o = f1(pred, gold), order_accuracy(pred, gold)
        exact += match
        f_sum += score_f
        order_sum += score_o
        table.append((item["id"], match, score_f, score_o, item["gloss"].replace("|", "/"), gloss_text(result).replace("|", "/")))
    count = len(items) or 1
    return table, exact / count, f_sum / count, order_sum / count


def markdown(title, table, exact, token_f, order, note=""):
    lines = [f"## {title}", ""]
    if note:
        lines.extend([note, ""])
    lines.append(f"Exact {exact:.0%} · token F1 {token_f:.0%} · order {order:.0%}")
    lines.append("")
    lines.append("| id | exact | F1 | order | gold | engine |")
    lines.append("| --- | --- | --- | --- | --- | --- |")
    for row in table:
        lines.append(f"| {row[0]} | {'yes' if row[1] else 'no'} | {row[2]:.2f} | {row[3]:.2f} | {row[4]} | {row[5]} |")
    return "\n".join(lines)


def examples():
    import csv
    with (ROOT / "demo" / "data" / "examples.csv").open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def main():
    import os
    target = Path(os.environ.get("DATA_DIR", ROOT / "data"))
    parent = target if target.exists() else target.parent
    if not os.access(parent, os.W_OK):
        os.environ["DATA_DIR"] = str(ROOT / ".dev" / "eval")
    from api.heldout import ensure_heldout
    example_rows, held_rows = examples(), ensure_heldout()
    example_table, example_exact, example_f, example_order = rows_of(example_rows)
    held_table, held_exact, held_f, held_order = rows_of(held_rows)
    warning = "H glosses were generated from the same rules; this is a consistency check, not accuracy. Real accuracy = Deaf co-designer rating."
    hits = ["## Memory hits", "", "Rule scores above use translate(text, use_memory=False). These lines also match a recorded phrase when memory is on:", ""]
    for item in list(example_rows) + list(held_rows):
        remembered = translate(item["text_am"], use_memory=True)
        if remembered["layer"] == "memory":
            clip = (remembered["playlist"] or [{}])[0].get("src", "")
            hits.append(f"- {item['id']}: {clip}")
    if len(hits) == 4:
        hits.append("- none")
    doc = "\n\n".join([
        "# Sign evaluation",
        markdown("E01–E20", example_table, example_exact, example_f, example_order),
        markdown("H01–H10", held_table, held_exact, held_f, held_order, warning),
        "\n".join(hits),
        "",
    ])
    path = ROOT / "docs" / "sign-eval.md"
    path.write_text(doc, encoding="utf-8")
    print(doc)
    print(f"wrote {path}")


if __name__ == "__main__":
    main()

# FR-SL-01, FR-SL-02: Punctuation, spacing, and letter families for matching.
import re

_SENTENCE = "።?!"
_CLAUSE = "፣፤፥፦"
_QUOTES = "\"'“”«»„‟`"
_BLOCKS = ((0x1210, 0x1200), (0x1280, 0x1200), (0x1220, 0x1230), (0x12D0, 0x12A0), (0x1340, 0x1348))


def _fold_char(char):
    code = ord(char)
    for src, dst in _BLOCKS:
        if src <= code <= src + 7:
            return chr(dst + (code - src))
    return char


def display(text):
    out = []
    for char in str(text or ""):
        if char in _QUOTES:
            continue
        if char in _CLAUSE:
            out.append("፣")
        elif char == "፧":
            out.append("?")
        else:
            out.append(char)
    return re.sub(r"\s+", " ", "".join(out)).strip()


def match_key(text):
    folded = "".join(_fold_char(char) for char in display(text))
    folded = re.sub(r"[።?!፣]", " ", folded)
    return re.sub(r"\s+", " ", folded).strip()


def pieces(text):
    """Return (text, boundary). በኋላ is a hard break; ፣ may be a list comma."""
    shown = display(text)
    parts = re.split(r"([፣።?!])", shown)
    groups, buf = [], ""
    for part in parts:
        if part in "፣።?!":
            if buf.strip():
                groups.append((buf.strip(), part))
            buf = ""
        else:
            buf += part
    if buf.strip():
        groups.append((buf.strip(), ""))
    out = []
    for group, boundary in groups:
        if "በኋላ" in group and not group.endswith("በኋላ"):
            left, right = group.split("በኋላ", 1)
            out.append(((left + "በኋላ").strip(), "።"))
            if right.strip():
                out.append((right.strip(), boundary))
        else:
            out.append((group, boundary))
    return [item for item in out if re.search(r"[\u1200-\u135A]", item[0])]


def question(text):
    return "?" in display(text) or "፧" in str(text or "")

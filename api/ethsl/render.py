# FR-SL-07, FR-SL-08: Playlist order, clause pauses, and an optional MP4.
import hashlib
import json
import shutil
import subprocess

from api.library import demo_data
from api.settings import data_dir

_FONT = "/usr/share/fonts/truetype/noto/NotoSansEthiopic-Regular.ttf"
_PAUSE = 0.25


def playlist(items):
    out = []
    for item in items:
        if item.get("kind") == "pause" or item.get("gloss") in ("|", "‖"):
            if out and "pause" not in out[-1]:
                out.append({"pause": _PAUSE})
            continue
        if item.get("kind") == "sign" and item.get("clip"):
            out.append({"src": item["clip"], "from": item["from"], "to": item["to"]})
    return out


def _run(args):
    subprocess.run(args, check=True, capture_output=True)


def _cut(item, dest, root):
    if "pause" in item:
        return
    src = root / item["src"]
    _run(["ffmpeg", "-y", "-ss", str(item["from"]), "-to", str(item["to"]), "-i", str(src),
          "-vf", "scale=216:288,fps=20", "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(dest)])


def _card(word, dest):
    text = (word or "?").replace(":", " ").replace("'", "")
    _run(["ffmpeg", "-y", "-f", "lavfi", "-i", "color=c=black:s=216x288:d=0.8", "-vf",
          f"drawtext=fontfile={_FONT}:text='{text}':fontcolor=white:fontsize=28:x=(w-text_w)/2:y=(h-text_h)/2",
          "-r", "20", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(dest)])


def _join(parts, dest):
    if len(parts) == 1:
        shutil.copy(parts[0], dest)
        return
    inputs, cursor, graph = [], 0.0, []
    for path in parts:
        inputs.extend(["-i", str(path)])
    probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(parts[0])], check=True, capture_output=True, text=True)
    cursor = max(0.0, float(probe.stdout.strip()) - 0.12)
    chain = "[0:v]"
    for index in range(1, len(parts)):
        nxt = f"[v{index}]" if index < len(parts) - 1 else "[out]"
        graph.append(f"{chain}[{index}:v]xfade=transition=fade:duration=0.12:offset={cursor:.3f}{nxt}")
        probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(parts[index])], check=True, capture_output=True, text=True)
        cursor += max(0.0, float(probe.stdout.strip()) - 0.12)
        chain = nxt
    _run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(graph), "-map", "[out]", "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(dest)])


def export_mp4(result):
    body = json.dumps({"playlist": result.get("playlist"), "missing": [item["gloss"] for item in result["gloss"] if item["kind"] == "missing"]}, ensure_ascii=False, sort_keys=True)
    digest = hashlib.sha256(body.encode("utf-8")).hexdigest()[:16]
    folder = data_dir() / "renders"
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / f"{digest}.mp4"
    if target.is_file():
        result["render"] = str(target)
        return result
    work = folder / f".{digest}"
    work.mkdir(parents=True, exist_ok=True)
    root = demo_data()
    parts = []
    try:
        step = 0
        for item in result.get("playlist") or []:
            dest = work / f"{step:02d}.mp4"
            if "pause" in item and parts:
                _run(["ffmpeg", "-y", "-i", str(parts[-1]), "-vf", f"tpad=stop_mode=clone:stop_duration={item['pause']}", "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(dest)])
            elif "src" in item:
                _cut(item, dest, root)
            if dest.is_file():
                parts.append(dest)
                step += 1
        for item in result["gloss"]:
            if item.get("kind") == "missing":
                dest = work / f"{step:02d}.mp4"
                _card(item.get("token") or item.get("gloss"), dest)
                parts.append(dest)
                step += 1
        if parts:
            _join(parts, target)
            result["render"] = str(target)
    finally:
        shutil.rmtree(work, ignore_errors=True)
    return result

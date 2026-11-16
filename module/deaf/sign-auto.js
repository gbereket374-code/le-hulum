// FR-SL-08, FR-SL-12: Build a lesson sign plan from the Amharic captions.
export function clipBase(player) {
  return String(player.host.getAttribute("src") || "").replace(/[^/]*$/, "");
}

async function amCues(player) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const list = player.captions?.getCues?.("am") || [];
    if (list.length) return list;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return [];
}

export async function loadAutoSign(player) {
  const api = String(player.host.getAttribute("api") || "").replace(/\/$/, "");
  const lesson = player.host.getAttribute("lesson-id") || "";
  if (!api || !lesson) return null;
  const cues = await amCues(player);
  const useMemory = player.host.getAttribute("use-memory") !== "false";
  const res = await fetch(api + "/sign/lesson", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      lesson_id: lesson,
      use_memory: useMemory,
      cues: cues.map((cue) => ({ id: cue.id, start: cue.start, end: cue.end, text_am: cue.text }))
    })
  });
  if (!res.ok) throw new Error("sign");
  return res.json();
}

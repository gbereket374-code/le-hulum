// FR-IN-04, FR-SL-01: One translation per text, kept in memory and in Cache Storage.
const memory = new Map();

export function textHash(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

async function read(key) {
  try {
    const hit = await (await caches.open("lh-sign")).match(key);
    return hit ? await hit.json() : null;
  } catch (error) {
    return null;
  }
}

async function write(key, body) {
  try {
    const cache = await caches.open("lh-sign");
    await cache.put(key, new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } }));
  } catch (error) { /* private mode, or a page that is not a secure context */ }
}

export async function translateText(api, text, lang) {
  const key = "lh-sign:" + (lang || "am") + ":" + textHash(text);
  if (memory.has(key)) return memory.get(key);
  const cached = await read(key);
  if (cached) {
    memory.set(key, cached);
    return cached;
  }
  const response = await fetch(String(api || "/api/v1").replace(/\/$/, "") + "/sign/translate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, lang: lang || "am" })
  });
  if (!response.ok) throw new Error("sign");
  const body = await response.json();
  memory.set(key, body);
  await write(key, body);
  return body;
}

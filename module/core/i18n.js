// C-07, NFR-ETH-01, NFR-ETH-05: Load one language file and fill {placeholders} in its strings.
let strings = {};

export async function loadStrings(lang) {
  const code = lang === "am" ? "am" : "en";
  const url = new URL("../i18n/" + code + ".json", import.meta.url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not load language " + code);
  }
  strings = await response.json();
  return strings;
}

export function t(key, vars) {
  const text = Object.prototype.hasOwnProperty.call(strings, key) ? String(strings[key]) : key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}

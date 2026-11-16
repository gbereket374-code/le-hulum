// NFR-ETH-01: Pin copy, loaded on its own so the player dictionary stays put.
export async function loadPinStrings(lang) {
  const read = async (code) => {
    const response = await fetch(new URL("../../i18n/" + code + ".json", import.meta.url));
    if (!response.ok) throw new Error(code);
    return response.json();
  };
  const english = await read("en");
  const table = lang === "am" ? { ...english, ...(await read("am")) } : english;
  return (key, vars) => {
    const text = Object.prototype.hasOwnProperty.call(table, key) ? String(table[key]) : key;
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, (match, name) => (
      Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
    ));
  };
}

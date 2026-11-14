// FR-CORE-08: Write a state change into the player's polite live region.
export function announce(root, text) {
  const region = root.querySelector("[aria-live]");
  if (!region) return;
  region.textContent = "";
  region.textContent = text;
}

// NFR-A11Y-01: Jobs screen from App v2. Applications stay on this device.
const JOBS = [
  ["Junior Python Developer", "ጀማሪ የፓይተን ገንቢ", "Abay Digital Works", "Addis Ababa · remote possible", "አዲስ አበባ · ከርቀት መሥራት ይቻላል", "ETB 18,000 – 24,000 / month", "ኅዳር 22, 2019 ዓ.ም.", "1 December 2026", "Build small web tools with a friendly team. Screen reader and EthSL interpreter support provided.", "ከተግባቢ ቡድን ጋር ትናንሽ የድር መሣሪያዎችን ይገንቡ።", "PYTHON|DEVELOPER|JUNIOR|INTERPRETER", "EthSL interpreter at interview|የምልክት አስተርጓሚ|Screen reader friendly|ለስክሪን አንባቢ|Remote possible|ከርቀት"],
  ["Customer Support Agent (Amharic and English)", "የደንበኞች አገልግሎት ሠራተኛ", "Gojo Connect", "Hawassa", "ሀዋሳ", "ETB 9,500 / month", "ታኅሣሥ 6, 2019 ዓ.ም.", "15 December 2026", "Answer customer messages by chat and email. Text-only role, no phone calls.", "የደንበኞችን መልእክቶች በቻት እና በኢሜይል ይመልሱ።", "CUSTOMER|CHAT|EMAIL|NO PHONE", "Text-only role|ጽሑፍ ብቻ|No phone calls|ስልክ የለም|Flexible hours|ተለዋዋጭ ሰዓት"],
  ["Data Entry Assistant", "የመረጃ ማስገቢያ ረዳት", "Lake Tana Agritech", "Bahir Dar", "ባሕር ዳር", "ETB 7,000 / month", "ጥር 2, 2019 ዓ.ም.", "10 January 2027", "Enter harvest data into spreadsheets. Training given in sign and in writing.", "የምርት መረጃን ወደ ተመን ሉሆች ያስገቡ።", "DATA|ENTER|SPREADSHEET|TRAINING", "Training in sign|ስልጠና በምልክት|Step-free office|ተደራሽ ቢሮ|Large-screen setup|ትልቅ ማያ"]
];
const am = () => document.documentElement.lang === "am";
const tx = (en, ah) => am() ? ah : en;
let sel = 0, signOn = false, timer = 0, word = 0, last = null, opener = null;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function job(row) {
  const tags = row[11].split("|");
  const pairs = [];
  for (let i = 0; i < tags.length; i += 2) pairs.push(tx(tags[i], tags[i + 1]));
  return { en: row[0], am: row[1], company: row[2], loc: tx(row[3], row[4]), salary: row[5], dlEt: row[6], dlGr: row[7], summary: tx(row[8], row[9]), gloss: row[10].split("|"), tags: pairs, say: `${row[0]} at ${row[2]}. ${row[5]}.` };
}
function ini(name) { return name.split(" ").map((part) => part[0]).join("").slice(0, 2); }
function stopSign() { clearInterval(timer); timer = 0; signOn = false; }
function paintSign(row) {
  const gloss = document.getElementById("feat-gloss");
  const state = document.getElementById("feat-state");
  gloss.textContent = signOn ? row.gloss[word % row.gloss.length] : "JOB";
  state.hidden = !signOn;
  state.textContent = tx("Signing", "እየተመዘገበ");
}
function tick(row) {
  if (!signOn || reduce) return;
  timer = setInterval(() => { word += 1; paintSign(row); }, 800);
}
function feat(row, index) {
  document.getElementById("feat").innerHTML = `<span class="star">${tx("Featured", "የተመረጠ")} · ${index + 1} ${tx("of", "ከ")} ${JOBS.length}</span>
    <h2 id="feat-title">${row.en}</h2><p lang="am">${row.am}</p>
    <dl class="facts"><div><dt>${tx("Company", "ድርጅት")}</dt><dd>${row.company}</dd></div><div><dt>${tx("Place", "ቦታ")}</dt><dd>${row.loc}</dd></div><div><dt>${tx("Salary", "ደመወዝ")}</dt><dd>${row.salary}</dd></div><div><dt>${tx("Deadline", "የመጨረሻ ቀን")}</dt><dd lang="am">${row.dlEt}<span>${row.dlGr}</span></dd></div></dl>
    <p>${row.summary}</p><ul class="tags">${row.tags.map((tag) => `<li>${tag}</li>`).join("")}</ul>
    <div class="acts"><button type="button" class="apply-big apply">${tx("Apply", "አመልክት")}</button><button type="button" class="ghost listen" data-say="${row.say}">${tx("Listen", "አዳምጥ")}</button><button type="button" class="ghost sign-toggle" aria-pressed="${signOn}">${tx("Show in sign", "በምልክት አሳይ")}</button></div>`;
  paintSign(row);
}
function cards() {
  const list = document.getElementById("job-list");
  list.innerHTML = JOBS.map((row, index) => {
    const item = job(row);
    const on = index === sel;
    return `<li class="job" data-on="${on}"><div class="job-top"><div><h3>${item.en}</h3><span>${item.company} · ${item.loc}</span></div><span class="ini" aria-hidden="true">${ini(item.company)}</span></div>
      <p class="pay"><strong>${item.salary}</strong><span lang="am">${item.dlEt}</span> · ${item.dlGr}</p>
      <ul class="tags">${item.tags.map((tag) => `<li>${tag}</li>`).join("")}</ul>
      <div class="acts"><button type="button" class="pick" data-i="${index}" aria-pressed="${on}">${on ? tx("✓ Showing", "✓ እየታየ") : tx("Details", "ዝርዝር")}</button><button type="button" class="listen" data-say="${item.say}" aria-label="${tx("Listen", "አዳምጥ")}: ${item.en}">${tx("Listen", "አዳምጥ")}</button><button type="button" class="apply">${tx("Apply", "አመልክት")}</button></div></li>`;
  }).join("");
}
function tabs() {
  document.getElementById("job-tabs").innerHTML = JOBS.map((row, index) => `<button type="button" role="tab" id="jt-${index}" aria-selected="${index === sel}" tabindex="${index === sel ? 0 : -1}" aria-controls="feat"><span>${row[0]}</span><small>${row[2]} · ${row[5]}</small></button>`).join("");
}
function show(index) {
  stopSign();
  word = 0;
  sel = index;
  const row = job(JOBS[index]);
  feat(row, index);
  cards();
  tabs();
  document.getElementById("job-tabs").querySelectorAll("button").forEach((button, i) => button.addEventListener("click", () => show(i)));
}
document.getElementById("main").addEventListener("click", (event) => {
  const pick = event.target.closest(".pick");
  if (pick) { show(Number(pick.dataset.i)); document.querySelector(".board")?.scrollIntoView({ block: "start" }); }
  const listen = event.target.closest(".listen");
  if (listen) {
    document.getElementById("heard").textContent = listen.dataset.say;
    try { speechSynthesis.cancel(); const utter = new SpeechSynthesisUtterance(listen.dataset.say); utter.lang = "en"; speechSynthesis.speak(utter); } catch (error) {}
    listen.setAttribute("aria-pressed", "true");
    if (last && last !== listen) last.setAttribute("aria-pressed", "false");
    last = listen;
  }
  const toggle = event.target.closest(".sign-toggle");
  if (toggle) {
    signOn = !signOn;
    word = 0;
    clearInterval(timer);
    timer = 0;
    const row = job(JOBS[sel]);
    toggle.setAttribute("aria-pressed", String(signOn));
    paintSign(row);
    tick(row);
  }
  const apply = event.target.closest(".apply");
  if (apply) { opener = apply; document.getElementById("apply").showModal(); }
});
document.getElementById("apply-close").addEventListener("click", () => document.getElementById("apply").close());
document.getElementById("apply").addEventListener("close", () => opener && opener.focus());
document.getElementById("apply-form").addEventListener("submit", (event) => {
  const phone = document.getElementById("aphone").value.replace(/\s/g, "");
  const err = document.getElementById("apply-err");
  if (!/^0[79]\d{8}$/.test(phone)) { event.preventDefault(); err.textContent = am() ? "የኢትዮጵያ ስልክ ቁጥር ያስገቡ፣ ለምሳሌ 0911 234 567።" : "Enter an Ethiopian mobile number, like 0911 234 567."; return; }
  event.preventDefault();
  err.textContent = "";
  document.getElementById("apply-ok").hidden = false;
});
document.getElementById("lang")?.addEventListener("click", () => show(sel));
show(0);

// NFR-A11Y-01: Shared shell. Logo, pill nav, announcement, settings, and footer match App v2.
const NAV = [
  ["index.html", "Home", "መነሻ", "home"],
  ["lesson-video.html", "Lessons", "ትምህርቶች", "lesson"],
  ["lesson-text.html", "Text lesson", "የጽሑፍ ትምህርት", "text"],
  ["sign-try.html", "Try it", "ይሞክሩ", "try"],
  ["jobs.html", "Jobs", "ሥራዎች", "jobs"],
  ["live.html", "Session", "ክፍለ ጊዜ", "live"],
  ["studio.html", "Studio", "ስቱዲዮ", "studio"],
  ["integrate.html", "Integrate", "ያገናኙ", "integrate"]
];
const CURRENT = { auto: "lesson", verify: "jobs" };
const pair = (en, am) => `<span class="en-only">${en}</span><span class="am-only" lang="am">${am}</span>`;
const logo = (id, size) => `<svg class="logo-svg" aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 48 48"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--lh-pr)"></stop><stop offset="1" style="stop-color:var(--lh-pr2)"></stop></linearGradient></defs><rect x="1" y="1" width="46" height="46" rx="14" fill="url(#${id})"></rect><rect x="1.5" y="1.5" width="45" height="45" rx="13.5" fill="none" stroke="rgba(255,255,255,.35)"></rect><path d="M11.5 11.5 L24 37.5 L36.5 11.5" fill="none" style="stroke:var(--lh-op)" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.2 23.5 H31.8" style="stroke:var(--lh-op)" stroke-width="3.8" stroke-linecap="round"></path><circle cx="24" cy="12.6" r="3.6" style="fill:var(--lh-op)"></circle></svg>`;

function link(page, href, en, am, key) {
  const on = (CURRENT[page] || page) === key ? ' aria-current="page"' : "";
  return `<a href="${href}"${on}>${pair(en, am)}</a>`;
}

export function mountShell() {
  if (document.querySelector(".pill")) return;
  const page = document.body.dataset.page || "";
  const links = NAV.map(([href, en, am, key]) => link(page, href, en, am, key)).join("");
  const ann = sessionStorage.getItem("lh-ann") === "off" ? " hidden" : "";
  document.body.insertAdjacentHTML("afterbegin", `<a class="skip" href="#main">${pair("Skip to main content", "ወደ ዋናው ይዘት ዝለል")}</a>
<div class="ann" role="region"${ann} aria-label="Announcement"><p>${pair("Built with a Deaf co-designer · ALX Digital Bridge 2026", "ከመስማት የተሳነው ተባባሪ ዲዛይነር ጋር የተሠራ · ALX ዲጂታል ብሪጅ 2026")} <a href="integrate.html">${pair("Add it to your site", "ወደ ድረ ገጽዎ ያክሉ")}</a></p><button type="button" id="ann-x"><span class="sr-only">${pair("Dismiss", "ዝጋ")}</span><span aria-hidden="true">✕</span></button></div>
<header class="top"><div class="pill"><a class="logo" href="index.html">${logo("lhg1", 40)}<span class="brand"><b>LE HULUM</b><span><span lang="am">ለሁሉም</span> · for all</span></span></a>
<nav class="desk" aria-label="Main">${links}</nav><div class="tools"><button type="button" id="lang" class="icon-btn"><span class="en-only lang-long" lang="am">አማርኛ</span><span class="en-only lang-short" lang="am">አማ</span><span class="am-only lang-long">English</span><span class="am-only lang-short">EN</span></button>
<div class="theme-menu"><button type="button" id="theme" class="icon-btn" aria-expanded="false" aria-controls="themes" aria-label="Theme"><svg class="th th-dark" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3a8 8 0 1 0 7 12 7 7 0 0 1-7-12z"/></svg><svg class="th th-light" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><path stroke="currentColor" stroke-width="2" d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg><svg class="th th-contrast" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path fill="currentColor" d="M12 4a8 8 0 0 0 0 16z"/></svg></button><div id="themes" class="themes" hidden role="group" aria-label="Theme"><button type="button" data-theme="dark">${pair("Dark", "ጨለማ")}</button><button type="button" data-theme="light">${pair("Light", "ብሩህ")}</button><button type="button" data-theme="contrast">${pair("High contrast", "ከፍተኛ ንፅፅር")}</button></div></div>
<a class="go try-live" href="sign-try.html">${pair("Try it live", "በቀጥታ ይሞክሩ")}</a>
<button type="button" id="menu" class="menu" aria-expanded="false" aria-controls="nav-menu"><span class="closed">${pair("Menu", "ምናሌ")}</span><span class="opened">${pair("Close", "ዝጋ")}</span></button></div></div>
<nav id="nav-menu" class="mobile" hidden aria-label="Main">${links}<a class="go" href="sign-try.html">${pair("Try it live", "በቀጥታ ይሞክሩ")}</a></nav>
<button type="button" class="a11y" id="a11y" aria-haspopup="dialog"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="2" fill="currentColor"/><path fill="currentColor" d="M4 9h16v2h-6v9h-4v-9H4z"/></svg><span class="a11y-label">${pair("My settings", "ቅንብሮቼ")}</span><span class="sr-only">${pair("Accessibility settings", "የተደራሽነት ቅንብሮች")}</span></button>
<dialog class="sheet" id="settings" aria-labelledby="set-title"><h2 id="set-title">${pair("Accessibility settings", "የተደራሽነት ቅንብሮች")}</h2><p>${pair("Everything you choose here stays on this device. We do not send it anywhere.", "እዚህ የሚመርጡት ሁሉ በዚህ መሣሪያ ላይ ይቆያል። ወደ የትም አንልከውም።")}</p><div class="needs" id="needs"></div><div class="sizes" id="sizes"></div><div class="row"><button type="button" id="motion">${pair("Reduce motion", "እንቅስቃሴ ቀንስ")}</button><button type="button" id="reset">${pair("Reset", "ዳግም አስጀምር")}</button><button type="button" id="set-close">${pair("Close", "ዝጋ")}</button></div></dialog></header>`);
  const main = document.getElementById("main");
  const foot = `<footer><div class="foot"><div class="foot-brand">${logo("lhg2", 44)}<div><strong>LE HULUM <span lang="am">ለሁሉም</span></strong><p>${pair("Ear to the deaf. Eye for the blind.", "ለመስማት ለተሳናቸው ጆሮ፣ ለማየት ለተሳናቸው ዓይን።")}</p><p lang="am">ለመስማት ለተሳናቸው ጆሮ፣ ለማየት ለተሳናቸው ዓይን።</p></div></div><nav aria-label="Product"><h2>${pair("Product", "ምርት")}</h2><a href="lesson-video.html">${pair("Lessons", "ትምህርቶች")}</a><a href="lesson-text.html">${pair("Text lesson", "የጽሑፍ ትምህርት")}</a><a href="sign-try.html">${pair("Try it", "ይሞክሩ")}</a><a href="jobs.html">${pair("Jobs", "ሥራዎች")}</a><a href="verify.html">${pair("Certificate", "ሰርተፍኬት")}</a></nav><nav aria-label="Developers"><h2>${pair("Developers", "ለገንቢዎች")}</h2><a href="integrate.html">Script tag</a><a href="integrate.html">REST API</a><a href="integrate.html">${pair("Open standard", "ክፍት መስፈርት")}</a><a href="/api/docs">/api/docs</a></nav><nav aria-label="Hackathon"><h2>${pair("Hackathon", "ሃካቶን")}</h2><a href="index.html">ALX Digital Bridge 2026</a><a href="index.html">Track 2: Accessible learning media</a></nav><nav aria-label="About"><h2>${pair("About", "ስለ እኛ")}</h2><a href="index.html#faq">${pair("Our Deaf co-designer", "መስማት የተሳነው ተባባሪ ዲዛይነር")}</a><a href="index.html#contact">${pair("Contact", "ያግኙን")}</a></nav></div><div class="foot-note"><span>${pair("© 2026 LE HULUM · Open source · Addis Ababa", "© 2026 ለሁሉም · ክፍት ምንጭ · አዲስ አበባ")}</span></div></footer>`;
  if (main) main.insertAdjacentHTML("afterend", foot);
  else document.body.insertAdjacentHTML("beforeend", foot);
}

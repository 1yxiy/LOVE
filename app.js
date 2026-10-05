async function loadSite() {
  try {
    const response = await fetch("data/notion.json", { cache: "no-store" });
    const site = await response.json();
    renderSite(site);
  } catch (error) {
    console.error("Could not load site data:", error);
  }
}

function renderSite(site) {
  const world = site.world || {};
  document.title = world.browserTitle || "OUR LITTLE UNIVERSE";
  text("eyebrow", world.eyebrow || "DREAM COUPLE ARCHIVE");
  text("title", world.title || "");
  text("homeTitle", world.title || "");
  text("tagline", world.tagline || "");
  text("start", world.start || "");
  text("worldDescription", world.description || "");
  link("musicLink", world.music, "♫ Music");
  link("mainLink", world.link, "↗ Link");

  const characters = site.characters || [];
  document.getElementById("characterGrid").innerHTML = characters.map((item, i) => `
    <article class="character-card">
      <div class="character-image">${item.image ? `<img src="${escapeAttr(item.image)}" alt="">` : `✦ ${i + 1}`}</div>
      <div class="character-info">
        <h3 class="character-name">${escapeHtml(item.name || "")}</h3>
        <p class="character-role">${escapeHtml(item.role || "")}</p>
      </div>
    </article>
  `).join("");

  const commissions = site.commissions || [];
  document.getElementById("commissionCount").textContent = `${commissions.length} ARCHIVES`;
  document.getElementById("commissionGrid").innerHTML = commissions.map((item, i) => `
    <a class="commission-card" href="${escapeAttr(item.link || item.image || "#")}" target="_blank" rel="noopener">
      <div class="commission-image">${item.image ? `<img src="${escapeAttr(item.image)}" alt="">` : `✦ ${String(i + 1).padStart(2, "0")}`}</div>
      <div class="commission-info">
        <h3>${escapeHtml(item.name || "")}</h3>
        <p>${escapeHtml(item.note || "")}</p>
      </div>
    </a>
  `).join("");
}

/* ===== 화면 전환 (스크롤 없이 버튼으로) ===== */
function go(name) {
  const next = document.getElementById("screen-" + name);
  if (!next) return;
  document.querySelectorAll(".screen.active").forEach(s => s.classList.remove("active"));
  next.classList.add("active");
  next.scrollTop = 0;
  if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
}
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-go]");
  if (btn) go(btn.dataset.go);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") go("home");
  if (e.key === "Enter" && document.getElementById("screen-intro").classList.contains("active")) go("home");
});
// 주소 끝에 #characters 처럼 붙어 있으면 그 화면으로 바로 열기
const start = location.hash.slice(1);
if (start && start !== "intro") go(start);

function text(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
function link(id, href, label) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = label;
  if (href) el.href = href; else el.style.display = "none";
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[ch]));
}
function escapeAttr(value) { return escapeHtml(value); }

loadSite();

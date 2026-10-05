async function loadSite() {
  try {
    const response = await fetch("data/notion.json");
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
  text("tagline", world.tagline || "");
  text("start", world.start || "");
  text("worldDescription", world.description || "");
  link("musicLink", world.music, "♫ Music");
  link("mainLink", world.link, "↗ Link");

  const characters = site.characters || [];
  document.getElementById("characterGrid").innerHTML = characters.map((item, i) => `
    <article class="character-card">
      <div class="character-image">${item.image ? `<img src="${escapeAttr(item.image)}" alt="" style="width:100%;height:100%;object-fit:cover;">` : `✦ ${i + 1}`}</div>
      <div class="character-info">
        <h3 class="character-name">${escapeHtml(item.name || "")}</h3>
        <p class="character-role">${escapeHtml(item.role || "")}</p>
      </div>
    </article>
  `).join("");

  const commissions = site.commissions || [];
  document.getElementById("commissionCount").textContent = `${commissions.length} ARCHIVES`;
  document.getElementById("commissionGrid").innerHTML = commissions.map((item, i) => `
    <a class="commission-card" href="${escapeAttr(item.link || "#")}" target="${item.link ? "_blank" : "_self"}" rel="noopener">
      <div class="commission-image">${item.image ? `<img src="${escapeAttr(item.image)}" alt="" style="width:100%;height:100%;object-fit:cover;">` : `✦ ${String(i + 1).padStart(2, "0")}`}</div>
      <div class="commission-info">
        <h3>${escapeHtml(item.name || "")}</h3>
        <p>${escapeHtml(item.note || "Commission archive")}</p>
      </div>
    </a>
  `).join("");

  const memories = (site.memories || []).slice().sort((a,b) => String(b.date).localeCompare(String(a.date)));
  document.getElementById("timeline").innerHTML = memories.map(item => `
    <article class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-date">${escapeHtml(formatDate(item.date))}</div>
      <div class="timeline-content">
        <h3>${escapeHtml(item.title || "")}</h3>
        <p>${escapeHtml(item.description || "")}</p>
      </div>
    </article>
  `).join("");
}

function text(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
function link(id, href, label) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = label;
  if (href) el.href = href;
}
function formatDate(value) {
  if (!value) return "";
  return String(value).replaceAll("-", ".");
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[ch]));
}
function escapeAttr(value) { return escapeHtml(value); }

loadSite();

fetch("data/notion.json")
  .then(r => r.json())
  .then(rows => {
    console.log(rows); // 우선 데이터가 잘 들어오는지 확인
  });


const fs = require("fs");
const path = require("path");

const HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

// 노션 표의 모든 줄 가져오기 (만든 순서대로)
async function queryDB(dbId) {
  const results = [];
  let cursor;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        page_size: 100,
        start_cursor: cursor,
        sorts: [{ timestamp: "created_time", direction: "ascending" }],
      }),
    });
    if (!res.ok) throw new Error(`노션 오류 ${res.status}: ${await res.text()}`);
    const json = await res.json();
    results.push(...json.results);
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);
  return results;
}

// 제목(이름) 칸 읽기
function getTitle(page) {
  const p = Object.values(page.properties).find(v => v.type === "title");
  return p ? p.title.map(t => t.plain_text).join("") : "";
}

// 글자 칸 읽기
function getText(page, name) {
  const p = page.properties[name];
  if (!p) return "";
  if (p.type === "rich_text") return p.rich_text.map(t => t.plain_text).join("");
  if (p.type === "select") return p.select?.name || "";
  if (p.type === "multi_select") return p.multi_select.map(s => s.name).join(", ");
  if (p.type === "url") return p.url || "";
  return "";
}

// 날짜 칸 읽기 (2024-01-01 → 2024.01.01)
function getDate(page, name) {
  const p = page.properties[name];
  const d = p?.date?.start || "";
  return d.slice(0, 10).replaceAll("-", ".");
}

// 사진 칸 → 없으면 커버 사진 → GitHub(data/images)에 저장
async function saveImage(page, name) {
  const f = page.properties[name]?.files?.[0];
  const url =
    f?.file?.url || f?.external?.url ||
    page.cover?.file?.url || page.cover?.external?.url;
  if (!url) return "";
  try {
    const res = await fetch(url);
    if (!res.ok) return "";
    let ext = path.extname(new URL(url).pathname).toLowerCase();
    if (!ext || ext.length > 5) ext = ".jpg";
    const fileName = `${page.id.replaceAll("-", "")}${ext}`;
    fs.mkdirSync("data/images", { recursive: true });
    fs.writeFileSync(`data/images/${fileName}`, Buffer.from(await res.arrayBuffer()));
    return `data/images/${fileName}`;
  } catch (e) {
    console.log("사진 저장 실패:", e.message);
    return "";
  }
}



async function main() {
  const world = fs.existsSync("data/world.json")
    ? JSON.parse(fs.readFileSync("data/world.json", "utf8"))
    : {};

  const characters = [];
  for (const page of await queryDB(process.env.NOTION_CHARACTERS_DB)) {
    characters.push({
      name: getTitle(page),
      role: getText(page, "소속"),
      image: await saveImage(page, "사진"),
    });
  }

  const commissions = [];
  for (const page of await queryDB(process.env.NOTION_COMMISSIONS_DB)) {
    commissions.push({
      name: getTitle(page),
      note: getDate(page, "날짜"),
      image: await saveImage(page, "파일과 미디어"),
      link: "",
    });
  }

  const site = { world, characters, commissions, memories: [] };
  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync("data/notion.json", JSON.stringify(site, null, 2));
  console.log(`✅ 성공! 캐릭터 ${characters.length}개 / 커미션 ${commissions.length}개`);
}

main().catch(e => { console.error(e); process.exit(1); });

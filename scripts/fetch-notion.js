const fs = require("fs");

async function main() {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100 }),
    }
  );
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const json = await res.json();

  // 속성 값을 단순한 형태로 변환
  const rows = json.results.map((page) => {
    const out = { id: page.id };
    for (const [key, p] of Object.entries(page.properties)) {
      switch (p.type) {
        case "title":        out[key] = p.title.map(t => t.plain_text).join(""); break;
        case "rich_text":    out[key] = p.rich_text.map(t => t.plain_text).join(""); break;
        case "number":       out[key] = p.number; break;
        case "select":       out[key] = p.select?.name ?? null; break;
        case "multi_select": out[key] = p.multi_select.map(s => s.name); break;
        case "date":         out[key] = p.date?.start ?? null; break;
        case "checkbox":     out[key] = p.checkbox; break;
        case "url":          out[key] = p.url; break;
        default:             out[key] = null;
      }
    }
    return out;
  });

  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync("data/notion.json", JSON.stringify(rows, null, 2));
  console.log(`${rows.length}개 저장 완료`);
}
main().catch((e) => { console.error(e); process.exit(1); });

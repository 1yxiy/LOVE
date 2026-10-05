# Dream Couple Home

Notion을 원본으로 사용하고, GitHub에 백업한 데이터를 정적 홈페이지로 보여주기 위한 첫 번째 버전입니다.

## 구조

- `index.html` — 홈페이지
- `styles.css` — 디자인
- `app.js` — `data/site.json`을 읽어 화면에 표시
- `data/site.json` — 나중에 Notion API 동기화로 자동 생성할 데이터
- `assets/` — 커플 이미지/커미션 이미지
- `.github/workflows/pages.yml` — GitHub Pages 배포

## 이미지 넣기

예:
`assets/commission-01.jpg`

그리고 `data/site.json`에서:

```json
"image": "assets/commission-01.jpg"
```

처럼 지정합니다.

## GitHub Pages

GitHub 저장소에 올린 뒤 Settings → Pages → Source에서 GitHub Actions를 선택하면 됩니다.
GitHub Pages는 저장소의 정적 HTML/CSS/JS를 웹사이트로 게시할 수 있습니다.

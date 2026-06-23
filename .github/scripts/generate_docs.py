import os
import re
import shutil
import yaml
from urllib.parse import quote

os.makedirs("docs", exist_ok=True)
shutil.copy("README.md", "docs/about.md")

if os.path.exists("assets"):
    shutil.copytree("assets", "docs/assets", dirs_exist_ok=True)

# (레이블, 원본 폴더, docs 내부 슬러그)
# 슬러그를 ASCII로 해서 한글/공백 경로 404 완전 방지
folder_map = [
    ("정처기", "01 정처기", "jungchogi"),
    ("코테",   "02 코테",   "kote"),
    ("오픽",   "03 오픽",   "opic"),
]

section_emojis = {"정처기": "📝", "코테": "💻", "오픽": "🎤"}

for label, src_folder, slug in folder_map:
    dst = f"docs/{slug}"
    if os.path.exists(src_folder):
        shutil.copytree(src_folder, dst, dirs_exist_ok=True)

date_re = re.compile(r"^(\d{4}-\d{2}-\d{2})\s*")

nav_sections = []
all_files = []

for label, src_folder, slug in folder_map:
    folder_path = f"docs/{slug}"
    if not os.path.exists(folder_path):
        continue
    files = sorted(
        [f for f in os.listdir(folder_path) if f.endswith(".md") and f != "index.md"],
        reverse=True,
    )
    if not files:
        continue

    # 섹션 index.md (카테고리 클릭 시 목록 페이지)
    emoji = section_emojis.get(label, "")
    section_lines = [f"# {emoji} {label}\n\n"]
    for f in files:
        title = f[:-3]
        path_url = quote(f, safe="/")
        m = date_re.match(title)
        date = m.group(1) if m else ""
        display = date_re.sub("", title).strip()
        section_lines.append(f"- **{date}** [{display}]({path_url})\n")
    with open(f"{folder_path}/index.md", "w", encoding="utf-8") as fp:
        fp.writelines(section_lines)

    entries = [{f[:-3]: f"{slug}/{f}"} for f in files]
    nav_sections.append({label: entries})

    for f in files:
        all_files.append((label, slug, f))

# 홈 카드 HTML
cards_html = ""
for label, slug, f in all_files:
    title = f[:-3]
    path_url = quote(f"{slug}/{f}", safe="/")
    m = date_re.match(title)
    date = m.group(1) if m else ""
    display_title = date_re.sub("", title).strip()
    month = date[:7] if date else ""
    cards_html += (
        f'<div class="til-card" data-category="{label}" data-date="{date}" data-month="{month}">\n'
        f'  <span class="til-badge">{label}</span>\n'
        f'  <span class="til-date">{date}</span>\n'
        f'  <a href="{path_url}">{display_title}</a>\n'
        "</div>\n"
    )

index_content = (
    """\
<div class="til-hero">

![so0126](https://github.com/so0126.png){ width=90, style="border-radius:50%;margin-bottom:8px" }

# so0126의 TIL 📚

취업 준비 학습 기록입니다.

</div>

---

## TIL 검색

<div class="til-filter">
  <div class="til-filter-row">
    <input id="til-search" type="text" placeholder="🔍 키워드 검색 (예: SQL, 트랜잭션)">
  </div>
  <div class="til-filter-row til-date-row">
    <label>📅 기간</label>
    <input id="til-date-from" type="date" title="시작 날짜">
    <span>~</span>
    <input id="til-date-to" type="date" title="종료 날짜">
    <button id="til-date-reset" class="til-reset-btn">초기화</button>
  </div>
  <div class="til-filter-buttons">
    <button class="til-btn active" data-filter="전체">전체</button>
    <button class="til-btn" data-filter="정처기">📝 정처기</button>
    <button class="til-btn" data-filter="코테">💻 코테</button>
    <button class="til-btn" data-filter="오픽">🎤 오픽</button>
  </div>
</div>

<div id="til-list">
"""
    + cards_html
    + """\
</div>

<p id="til-empty" style="display:none;color:#888;text-align:center;padding:2rem">검색 결과가 없어요.</p>

<style>
.til-date-row { align-items:center; gap:0.4rem; flex-wrap:wrap; }
.til-date-row label { font-size:0.9rem; color:#555; white-space:nowrap; }
.til-date-row input[type="date"] { padding:0.45rem 0.6rem; border:1px solid #ccc; border-radius:8px; font-size:0.88rem; color:#444; background:#fff; cursor:pointer; }
.til-date-row span { color:#888; }
.til-reset-btn { padding:0.35rem 0.7rem; border:1px solid #ccc; border-radius:8px; background:#f5f5f5; color:#666; cursor:pointer; font-size:0.82rem; }
.til-reset-btn:hover { background:#e0e0e0; }
</style>

<script>
(function() {
  var cards = document.querySelectorAll('.til-card');
  var input = document.getElementById('til-search');
  var dateFrom = document.getElementById('til-date-from');
  var dateTo = document.getElementById('til-date-to');
  var resetBtn = document.getElementById('til-date-reset');
  var empty = document.getElementById('til-empty');
  var activeCategory = '전체';

  function filter() {
    var keyword = input.value.toLowerCase();
    var from = dateFrom.value;
    var to = dateTo.value;
    var visible = 0;
    cards.forEach(function(card) {
      var d = card.dataset.date;
      var matchCat = activeCategory === '전체' || card.dataset.category === activeCategory;
      var matchFrom = !from || !d || d >= from;
      var matchTo = !to || !d || d <= to;
      var matchKey = !keyword || card.textContent.toLowerCase().includes(keyword);
      var show = matchCat && matchFrom && matchTo && matchKey;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    empty.style.display = visible === 0 ? '' : 'none';
  }

  document.querySelectorAll('.til-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.til-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      filter();
    });
  });

  input.addEventListener('input', filter);
  dateFrom.addEventListener('change', filter);
  dateTo.addEventListener('change', filter);
  resetBtn.addEventListener('click', function() {
    dateFrom.value = '';
    dateTo.value = '';
    filter();
  });
})();
</script>
"""
)

with open("docs/index.md", "w", encoding="utf-8") as fp:
    fp.write(index_content)

with open("mkdocs.yml", "r", encoding="utf-8") as fp:
    config = yaml.safe_load(fp)

config["nav"] = [
    {"홈": "index.md"},
    {"소개": "about.md"},
] + nav_sections

with open("mkdocs.yml", "w", encoding="utf-8") as fp:
    yaml.dump(config, fp, allow_unicode=True, default_flow_style=False, sort_keys=False)

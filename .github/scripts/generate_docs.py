import os
import re
import shutil
import yaml

os.makedirs("docs", exist_ok=True)
shutil.copy("README.md", "docs/about.md")

# 폰트 및 CSS 복사
if os.path.exists("assets"):
    shutil.copytree("assets", "docs/assets", dirs_exist_ok=True)

folder_map = [
    ("정처기", "01 정처기"),
    ("코테", "02 코테"),
    ("오픽", "03 오픽"),
]

for label, folder in folder_map:
    dst = f"docs/{folder}"
    if os.path.exists(folder):
        shutil.copytree(folder, dst, dirs_exist_ok=True)

nav_sections = []
all_files = []

for label, folder in folder_map:
    folder_path = f"docs/{folder}"
    if not os.path.exists(folder_path):
        continue
    files = sorted(
        [f for f in os.listdir(folder_path) if f.endswith(".md")],
        reverse=True,
    )
    if files:
        entries = [{f[:-3]: f"{folder}/{f}"} for f in files]
        nav_sections.append({label: entries})
        for f in files:
            all_files.append((label, folder, f))

date_re = re.compile(r"^(\d{4}-\d{2}-\d{2})")

# 카드 HTML + 월 목록 수집
cards_html = ""
months_seen = []
for label, folder, f in all_files:
    title = f[:-3]
    path = f"{folder}/{f}"
    m = date_re.match(title)
    date = m.group(1) if m else ""
    month = date[:7] if date else ""  # YYYY-MM
    if month and month not in months_seen:
        months_seen.append(month)
    cards_html += (
        f'<div class="til-card" data-category="{label}" data-date="{date}" data-month="{month}">\n'
        f'  <span class="til-badge">{label}</span>\n'
        f'  <span class="til-date">{date}</span>\n'
        f'  <a href="{path}">{title}</a>\n'
        "</div>\n"
    )

# 월 드롭다운 옵션
month_options = '<option value="">전체 날짜</option>\n'
for month in sorted(months_seen, reverse=True):
    month_options += f'<option value="{month}">{month}</option>\n'

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
    <select id="til-month">
"""
    + month_options
    + """\
    </select>
  </div>
  <div class="til-filter-buttons">
    <button class="til-btn active" data-filter="전체">전체</button>
    <button class="til-btn" data-filter="정처기">정처기</button>
    <button class="til-btn" data-filter="코테">코테</button>
    <button class="til-btn" data-filter="오픽">오픽</button>
  </div>
</div>

<div id="til-list">
"""
    + cards_html
    + """\
</div>

<p id="til-empty" style="display:none;color:#888;text-align:center;padding:2rem">검색 결과가 없어요.</p>

<style>
.til-hero { text-align:center; padding: 1.5rem 0 1rem; }
.til-hero img { display:block; margin: 0 auto 0.5rem; }
.til-filter { margin: 1rem 0 1.2rem; display:flex; flex-direction:column; gap:0.6rem; }
.til-filter-row { display:flex; gap:0.5rem; }
.til-filter-row input { flex:1; padding:0.55rem 0.8rem; border:1px solid #ccc; border-radius:8px; font-size:0.95rem; }
.til-filter-row select { padding:0.55rem 0.6rem; border:1px solid #ccc; border-radius:8px; font-size:0.9rem; color:#444; background:#fff; cursor:pointer; }
.til-filter-buttons { display:flex; gap:0.4rem; flex-wrap:wrap; }
.til-btn { padding:0.35rem 0.9rem; border:1.5px solid #1976d2; border-radius:20px; background:#fff; color:#1976d2; cursor:pointer; font-size:0.88rem; transition:all .15s; }
.til-btn.active, .til-btn:hover { background:#1976d2; color:#fff; }
.til-card { display:flex; align-items:baseline; gap:0.6rem; padding:0.55rem 0; border-bottom:1px solid #eee; }
.til-badge { font-size:0.75rem; padding:0.15rem 0.5rem; border-radius:12px; background:#e3f2fd; color:#1565c0; white-space:nowrap; }
.til-date { font-size:0.8rem; color:#999; white-space:nowrap; min-width:80px; }
.til-card a { color:inherit; text-decoration:none; font-size:0.95rem; }
.til-card a:hover { color:#1976d2; }
</style>

<script>
(function() {
  var cards = document.querySelectorAll('.til-card');
  var input = document.getElementById('til-search');
  var monthSelect = document.getElementById('til-month');
  var empty = document.getElementById('til-empty');
  var activeCategory = '전체';

  function filter() {
    var keyword = input.value.toLowerCase();
    var month = monthSelect.value;
    var visible = 0;
    cards.forEach(function(card) {
      var matchCat = activeCategory === '전체' || card.dataset.category === activeCategory;
      var matchMonth = !month || card.dataset.month === month;
      var matchKey = !keyword || card.textContent.toLowerCase().includes(keyword);
      var show = matchCat && matchMonth && matchKey;
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
  monthSelect.addEventListener('change', filter);
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

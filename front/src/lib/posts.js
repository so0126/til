import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { codeToHtml } from 'shiki';

// 신택스 하이라이팅: <pre><code class="language-xxx">...</code></pre> → shiki HTML
async function applyShikiHighlighting(html) {
  const regex = /<pre><code(?:\s+class="language-([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g;
  const entries = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    entries.push({ full: m[0], lang: (m[1] || 'text').toLowerCase(), raw: m[2] });
  }
  for (const { full, lang, raw } of entries) {
    const code = raw
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    try {
      const highlighted = await codeToHtml(code, {
        lang,
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: false,
        transformers: [{
          pre(node) {
            if (node.properties) delete node.properties.style;
            node.properties['data-lang'] = lang;
          },
        }],
      });
      html = html.replace(full, highlighted);
    } catch (_) {
      // 지원하지 않는 언어는 그대로 유지
    }
  }
  return html;
}

const REPO_ROOT = path.join(process.cwd(), '..');

export const CATEGORIES = [
  { label: '정처기', folder: '01 정처기', slug: 'jungchogi', icon: '📝' },
  { label: '코테',   folder: '02 코테',   slug: 'kote',       icon: '💻' },
  { label: '오픽',   folder: '03 오픽',   slug: 'opic',       icon: '🎤' },
];

const DATE_RE = /^(\d{4}-\d{2}-\d{2})\s*/;

function buildSlugMap(files) {
  const count = {};
  const map = new Map();
  for (const file of files) {
    const title = file.replace(/\.md$/, '');
    const m = DATE_RE.exec(title);
    const base = m ? m[1] : 'post';
    count[base] = (count[base] || 0) + 1;
    const slug = count[base] === 1 ? base : `${base}-${count[base] - 1}`;
    map.set(file, slug);
  }
  return map;
}

export function getReadingTime(content) {
  const text = content.replace(/```[\s\S]*?```/gm, '').replace(/[#*`|>]/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function stripMarkdown(content) {
  return content
    .replace(/```[\s\S]*?```/gm, '')
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>|]/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2)
    .join(' ');
}

function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPreview(content) {
  const text = stripMarkdown(content);
  return text.length > 160 ? text.slice(0, 160) + '…' : text;
}

// GitHub 경고 박스: > [!NOTE] 등 → styled div
function processGitHubAlerts(html) {
  const ALERTS = {
    NOTE:      { label: '참고',  icon: 'ℹ️',  cls: 'alert-note' },
    TIP:       { label: '팁',    icon: '💡', cls: 'alert-tip' },
    IMPORTANT: { label: '중요',  icon: '📌', cls: 'alert-important' },
    WARNING:   { label: '주의',  icon: '⚠️',  cls: 'alert-warning' },
    CAUTION:   { label: '경고',  icon: '🚨', cls: 'alert-caution' },
  };
  return html.replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, (match, inner) => {
    const m = /^\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\r?\n)?/i.exec(inner);
    if (!m) return match;
    const a = ALERTS[m[1].toUpperCase()];
    const body = inner.replace(/^\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\r?\n)?/i, '<p>').trim();
    return `<div class="md-alert ${a.cls}"><p class="alert-title">${a.icon} ${a.label}</p><div class="alert-body">${body}</div></div>`;
  });
}

// 헤딩에 id 추가 (TOC용)
function addHeadingIds(html) {
  const counts = {};
  return html.replace(/<(h[2-4])([^>]*)>([\s\S]*?)<\/h[2-4]>/gi, (_, tag, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    const base = text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-가-힣]/g, '')
      .slice(0, 60) || 'heading';
    counts[base] = (counts[base] || 0) + 1;
    const id = counts[base] > 1 ? `${base}-${counts[base]}` : base;
    return `<${tag} id="${id}"${attrs}>${inner}</${tag}>`;
  });
}

export function getAllPosts() {
  const posts = [];
  for (const cat of CATEGORIES) {
    const dir = path.join(REPO_ROOT, cat.folder);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
    const slugMap = buildSlugMap(files);
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const { data, content } = matter(raw);
      const title = file.replace(/\.md$/, '');
      const m = DATE_RE.exec(title);
      const date = data.date || (m ? m[1] : '');
      const displayTitle = title.replace(DATE_RE, '').trim();
      posts.push({
        category: cat.label, categorySlug: cat.slug, categoryIcon: cat.icon,
        file, slug: slugMap.get(file), title, displayTitle, date,
        preview: getPreview(content),
        bodyText: stripMarkdown(content).toLowerCase(),
        readingTime: getReadingTime(content),
        tags: data.tags || [],
        frontmatter: data,
      });
    }
  }
  return posts.sort((a, b) => (b.date > a.date ? 1 : -1));
}

export function getPostsByCategory() {
  const all = getAllPosts();
  const map = {};
  for (const cat of CATEGORIES) {
    map[cat.slug] = all.filter(p => p.categorySlug === cat.slug);
  }
  return map;
}

export function getAdjacentPosts(categorySlug, currentSlug) {
  const posts = getAllPosts().filter(p => p.categorySlug === categorySlug);
  const idx = posts.findIndex(p => p.slug === currentSlug);
  return {
    prev: idx < posts.length - 1 ? posts[idx + 1] : null, // 더 오래된 글
    next: idx > 0 ? posts[idx - 1] : null,               // 더 최근 글
  };
}

export function getSiteStats(posts) {
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const monthCount = posts.filter(p => p.date?.startsWith(thisMonth)).length;

  const catMap = {};
  for (const p of posts) catMap[p.category] = (catMap[p.category] || 0) + 1;
  const catRanking = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  const dates = [...new Set(posts.map(p => p.date).filter(Boolean))].sort().reverse();
  let streak = 0;
  if (dates.length > 0) {
    const today = now.toISOString().slice(0, 10);
    const gap = Math.floor((new Date(today) - new Date(dates[0])) / 86400000);
    if (gap <= 1) {
      let prev = dates[0];
      for (const d of dates) {
        const diff = Math.floor((new Date(prev) - new Date(d)) / 86400000);
        if (diff <= 1) { streak++; prev = d; }
        else break;
      }
    }
  }

  const postCountByDate = {};
  for (const p of posts) {
    if (!p.date) continue;
    postCountByDate[p.date] = (postCountByDate[p.date] || 0) + 1;
  }

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(12, 0, 0, 0);
  const monthEnd = new Date(now);
  monthEnd.setHours(12, 0, 0, 0);
  const monthActivityCells = [];
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    const date = toLocalDateStr(d);
    monthActivityCells.push({ date, count: postCountByDate[date] || 0 });
  }

  const monthActivityMax = Math.max(...monthActivityCells.map(c => c.count), 1);
  const monthRecordDays = monthActivityCells.filter(c => c.count > 0).length;

  return {
    total: posts.length,
    monthCount,
    catRanking,
    streak,
    latestDate: dates[0] || '',
    monthActivityCells,
    monthActivityMax,
    monthRecordDays,
  };
}

export function getShellArchive(posts) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const postCountByDate = {};
  for (const p of posts) {
    if (!p.date) continue;
    postCountByDate[p.date] = (postCountByDate[p.date] || 0) + 1;
  }

  const monthSet = new Set();
  for (const p of posts) {
    if (!p.date) continue;
    const ym = p.date.slice(0, 7);
    if (ym < thisMonth) monthSet.add(ym);
  }

  // 이전 달은 기록이 없어도 항상 포함 (빈 조개)
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  monthSet.add(prevMonth);

  const sortedMonths = [...monthSet].sort().reverse();
  let cumulativeTotal = posts.filter(p => p.date).length;

  return sortedMonths.map(ym => {
    const [y, m] = ym.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const lastDayOfMonth = `${ym}-${String(daysInMonth).padStart(2, '0')}`;
    const activityCells = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${ym}-${String(d).padStart(2, '0')}`;
      activityCells.push({ date, count: postCountByDate[date] || 0 });
    }
    const activityMax = Math.max(...activityCells.map(c => c.count), 1);
    const recordDays = activityCells.filter(c => c.count > 0).length;
    const postCount = activityCells.reduce((s, c) => s + c.count, 0);
    const lastDate = activityCells.filter(c => c.count > 0).map(c => c.date).sort().reverse()[0] || '';
    const total = cumulativeTotal;
    cumulativeTotal -= postCount;
    return {
      monthKey: ym, year: y, month: m,
      recordDays, postCount, activityCells, activityMax, lastDate, total,
    };
  });
}

export async function getPostContent(categorySlug, slug) {
  const cat = CATEGORIES.find(c => c.slug === categorySlug);
  if (!cat) return null;
  const dir = path.join(REPO_ROOT, cat.folder);
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const slugMap = buildSlugMap(files);
  const file = [...slugMap.entries()].find(([, s]) => s === slug)?.[0];
  if (!file) return null;

  const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
  const { data, content } = matter(raw);
  // Obsidian 위키링크 [[표시명|링크]] or [[링크]] → 인라인 코드로 변환
  const cleaned = content.replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
    const display = inner.split('|')[0].trim();
    return '`' + display + '`';
  });
  const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(cleaned);
  const title = file.replace(/\.md$/, '');
  const m = DATE_RE.exec(title);
  const date = data.date || (m ? m[1] : '');

  return {
    category: cat.label, categorySlug, categoryIcon: cat.icon,
    title, displayTitle: title.replace(DATE_RE, '').trim(),
    date, tags: data.tags || [],
    readingTime: getReadingTime(content),
    html: processGitHubAlerts(addHeadingIds(await applyShikiHighlighting(processed.toString()))),
    filePath: `${cat.folder}/${file}`,
    frontmatter: data,
  };
}

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

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

export function getPreview(content) {
  const text = content
    .replace(/```[\s\S]*?```/gm, '')
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>|]/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2)
    .join(' ');
  return text.length > 160 ? text.slice(0, 160) + '…' : text;
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

  return { total: posts.length, monthCount, catRanking, streak, latestDate: dates[0] || '' };
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
  const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(content);
  const title = file.replace(/\.md$/, '');
  const m = DATE_RE.exec(title);
  const date = data.date || (m ? m[1] : '');

  return {
    category: cat.label, categorySlug, categoryIcon: cat.icon,
    title, displayTitle: title.replace(DATE_RE, '').trim(),
    date, tags: data.tags || [],
    readingTime: getReadingTime(content),
    html: addHeadingIds(processed.toString()),
    filePath: `${cat.folder}/${file}`,
    frontmatter: data,
  };
}

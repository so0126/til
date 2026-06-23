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

// 날짜 기반 순수 ASCII 슬러그 (중복 시 -1, -2, ... 붙임)
function buildSlugMap(files) {
  const count = {};
  const map = new Map(); // file → slug
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
        category: cat.label,
        categorySlug: cat.slug,
        categoryIcon: cat.icon,
        file,
        slug: slugMap.get(file),
        title,
        displayTitle,
        date,
        content,
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
    category: cat.label,
    categorySlug,
    categoryIcon: cat.icon,
    title,
    displayTitle: title.replace(DATE_RE, '').trim(),
    date,
    html: processed.toString(),
    frontmatter: data,
  };
}

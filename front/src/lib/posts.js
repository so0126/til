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

function safeSlug(filename) {
  return encodeURIComponent(filename.replace(/\.md$/, ''));
}

export function getAllPosts() {
  const posts = [];
  for (const cat of CATEGORIES) {
    const dir = path.join(REPO_ROOT, cat.folder);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
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
        slug: safeSlug(file),
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
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const file = files.find(f => safeSlug(f) === slug);
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

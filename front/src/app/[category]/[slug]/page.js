import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostContent, getAllPosts, getPostsByCategory, getAdjacentPosts, getSiteStats, CATEGORIES } from '@/lib/posts';
import SiteLayout from '@/components/SiteLayout';
import PostContent from '@/components/PostContent';
import TableOfContents from '@/components/TableOfContents';
import InlineSearch from '@/components/InlineSearch';

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ category: p.categorySlug, slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPostContent(params.category, params.slug);
  if (!post) return { title: '404' };
  return { title: `${post.displayTitle} | so0126의 TIL` };
}

export default async function PostPage({ params }) {
  const post = await getPostContent(params.category, params.slug);
  if (!post) notFound();

  const posts = getAllPosts();
  const postsByCategory = getPostsByCategory();
  const stats = getSiteStats(posts);
  const { prev, next } = getAdjacentPosts(params.category, params.slug);

  return (
    <SiteLayout
      categories={CATEGORIES}
      postsByCategory={postsByCategory}
      totalPostCount={posts.length}
      latestDate={stats.latestDate}
    >
      <div className="post-layout">
        {/* ── 본문 ── */}
        <article className="post-article">
          <div className="post-header">
            <div className="breadcrumb">
              <Link href="/">홈</Link>
              <span> / </span>
              <span>{post.category}</span>
            </div>
            <h1>{post.displayTitle}</h1>
            <div className="post-meta">
              {post.date && <span>📅 {post.date}</span>}
              <span>{post.categoryIcon} {post.category}</span>
              <span>⏱ 약 {post.readingTime}분</span>
              {post.tags?.length > 0 && (
                <span className="post-tags">
                  {post.tags.map(t => (
                    <a key={t} href={`/tags/${t}/`} className="post-tag post-tag-link">#{t}</a>
                  ))}
                </span>
              )}
            </div>
            <a
              className="post-github-link"
              href={`https://github.com/so0126/til/blob/main/${encodeURIComponent(post.filePath)}`}
              target="_blank"
              rel="noreferrer"
            >
              GitHub에서 원문 보기 ↗
            </a>
          </div>

          <PostContent html={post.html} />

          {/* ── 이전 / 다음 글 ── */}
          {(prev || next) && (
            <nav className="post-nav">
              <div className="post-nav-item prev">
                {prev ? (
                  <Link href={`/${prev.categorySlug}/${prev.slug}/`}>
                    <span className="nav-label">← 이전 기록</span>
                    <span className="nav-title">{prev.displayTitle}</span>
                  </Link>
                ) : <span />}
              </div>
              <div className="post-nav-item next">
                {next ? (
                  <Link href={`/${next.categorySlug}/${next.slug}/`}>
                    <span className="nav-label">다음 기록 →</span>
                    <span className="nav-title">{next.displayTitle}</span>
                  </Link>
                ) : <span />}
              </div>
            </nav>
          )}
        </article>

        {/* ── 목차 (데스크톱 오른쪽) ── */}
        <aside className="toc-sidebar">
          <InlineSearch posts={posts} />
          <TableOfContents />
        </aside>
      </div>
    </SiteLayout>
  );
}

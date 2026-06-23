import { getAllPosts, getPostsByCategory, CATEGORIES } from '@/lib/posts';
import SiteLayout from '@/components/SiteLayout';
import Link from 'next/link';
import { getSiteStats } from '@/lib/posts';

export async function generateStaticParams() {
  const posts = getAllPosts();
  const tags = [...new Set(posts.flatMap(p => p.tags || []))].filter(Boolean);
  // 태그가 없으면 빌드 오류 방지용 placeholder
  if (tags.length === 0) return [{ tag: '__empty__' }];
  return tags.map(tag => ({ tag }));
}

export default async function TagPage({ params }) {
  const tag = params.tag;
  const allPosts = getAllPosts();
  const posts = allPosts.filter(p => (p.tags || []).includes(tag));
  const postsByCategory = getPostsByCategory();
  const stats = getSiteStats(allPosts);
  const latestDate = allPosts[0]?.date || '';

  if (tag === '__empty__') {
    return (
      <SiteLayout categories={CATEGORIES} postsByCategory={postsByCategory} stats={stats} totalPostCount={allPosts.length} latestDate={latestDate}>
        <p className="empty-msg">등록된 태그가 없어요 😢</p>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout
      categories={CATEGORIES}
      postsByCategory={postsByCategory}
      stats={stats}
      totalPostCount={allPosts.length}
      latestDate={latestDate}
    >
      <div className="tag-page">
        <div className="tag-page-header">
          <Link href="/" className="breadcrumb-link">홈</Link>
          <span className="breadcrumb-sep">›</span>
          <span>태그</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">#{tag}</span>
        </div>

        <h2 className="tag-page-title">🏷 #{tag}</h2>
        <p className="tag-page-count">총 <strong>{posts.length}</strong>개의 TIL</p>

        <div className="post-list">
          {posts.length === 0
            ? <p className="empty-msg">이 태그로 작성된 TIL이 없어요 😢</p>
            : posts.map(p => (
              <Link key={`${p.categorySlug}-${p.slug}`} href={`/${p.categorySlug}/${p.slug}/`} className="post-card">
                {p.date && (
                  <div className="post-date-block">
                    <div className="post-date-month">{p.date.slice(5, 7)}월</div>
                    <div className="post-date-day">{p.date.slice(8, 10)}</div>
                  </div>
                )}
                <div className="post-info">
                  <span className="post-badge">{p.categoryIcon} {p.category}</span>
                  <div className="post-title">{p.displayTitle}</div>
                  {p.preview && <div className="post-preview">{p.preview}</div>}
                  <div className="post-meta-row">
                    {p.tags && p.tags.length > 0 && (
                      <span className="post-tags">
                        {p.tags.slice(0, 5).map(t => (
                          <span key={t} className={`post-tag${t === tag ? ' post-tag-active' : ''}`}>{t}</span>
                        ))}
                      </span>
                    )}
                    {p.readingTime && <span className="post-reading-time">⏱ {p.readingTime}분</span>}
                  </div>
                </div>
              </Link>
            ))
          }
        </div>
      </div>
    </SiteLayout>
  );
}

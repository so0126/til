import SiteLayout from '@/components/SiteLayout';
import { getAllPosts, getPostsByCategory, getSiteStats, CATEGORIES } from '@/lib/posts';

function formatMonthLabel(ym) {
  const [year, month] = ym.split('-');
  return `${year}년 ${Number(month)}월`;
}

function buildMonthlyArchive(posts) {
  const byMonth = new Map();

  for (const post of posts) {
    if (!post.date) continue;
    const monthKey = post.date.slice(0, 7);
    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, {
        monthKey,
        posts: [],
        dates: new Set(),
        lastDate: post.date,
      });
    }
    const bucket = byMonth.get(monthKey);
    bucket.posts.push(post);
    bucket.dates.add(post.date);
    if (post.date > bucket.lastDate) bucket.lastDate = post.date;
  }

  return [...byMonth.values()]
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
    .map(bucket => ({
      monthKey: bucket.monthKey,
      label: formatMonthLabel(bucket.monthKey),
      recordDays: bucket.dates.size,
      postCount: bucket.posts.length,
      lastDate: bucket.lastDate,
      firstDate: bucket.posts
        .map(p => p.date)
        .filter(Boolean)
        .sort()[0] || bucket.lastDate,
      shells: bucket.posts.map(post => ({
        title: post.displayTitle,
        category: post.category,
        categoryIcon: post.categoryIcon,
        slug: post.slug,
        categorySlug: post.categorySlug,
        date: post.date,
      })),
    }));
}

export default function ShellArchivePage() {
  const posts = getAllPosts();
  const postsByCategory = getPostsByCategory();
  const stats = getSiteStats(posts);
  const archives = buildMonthlyArchive(posts);

  return (
    <SiteLayout
      categories={CATEGORIES}
      postsByCategory={postsByCategory}
      stats={stats}
      totalPostCount={posts.length}
      latestDate={stats.latestDate}
    >
      <div className="shell-archive">
        <div className="shell-archive-header">
          <div className="shell-archive-kicker">🐚 기록 조개 보관함</div>
          <h1>월별로 쌓인 조개들</h1>
          <p>
            각 달에 남겨둔 기록이 조개처럼 차곡차곡 쌓입니다.
            한 달이 지나면 다음 조개가 새로 생기고, 지난 조개는 여기 남아 있어요.
          </p>
        </div>

        {archives.length === 0 ? (
          <div className="shell-archive-empty">아직 남겨진 조개가 없어요.</div>
        ) : (
          <div className="shell-archive-grid">
            {archives.map(month => (
              <section key={month.monthKey} className="shell-archive-card">
                <div className="shell-archive-card-top">
                  <div className="shell-archive-shell">🐚</div>
                  <div>
                    <h2>{month.label}</h2>
                    <div className="shell-archive-meta">
                      기록일 {month.recordDays}일 · 글 {month.postCount}개
                    </div>
                  </div>
                </div>
                <div className="shell-archive-date">
                  마지막 기록 {month.lastDate}
                </div>
                <div className="shell-archive-posts">
                  {month.shells.slice(0, 4).map(post => (
                    <span key={`${post.categorySlug}-${post.slug}`} className="shell-archive-post">
                      {post.categoryIcon} {post.title}
                    </span>
                  ))}
                  {month.shells.length > 4 && (
                    <span className="shell-archive-more">+{month.shells.length - 4}개 더</span>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

import SiteLayout from '@/components/SiteLayout';
import StatsSection from '@/components/StatsSection';
import { getAllPosts, getPostsByCategory, getSiteStats, getShellArchive, CATEGORIES } from '@/lib/posts';

export default function ShellArchivePage() {
  const posts = getAllPosts();
  const postsByCategory = getPostsByCategory();
  const stats = getSiteStats(posts);
  const archives = getShellArchive(posts);

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
          <p>한 달이 지나면 그 달의 기록이 조개로 굳어져요. 지난 달부터 차곡차곡 쌓입니다.</p>
        </div>

        {archives.length === 0 ? (
          <div className="shell-archive-empty">아직 남겨진 조개가 없어요.</div>
        ) : (
          <div className="shell-archive-grid">
            {archives.map(arc => (
              <StatsSection
                key={arc.monthKey}
                monthLabel={`${arc.month}월`}
                stats={{
                  total: arc.total,
                  monthCount: arc.postCount,
                  latestDate: arc.lastDate,
                  monthActivityCells: arc.activityCells,
                  monthActivityMax: arc.activityMax,
                  monthRecordDays: arc.recordDays,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

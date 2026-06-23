export default function StatsSection({ stats }) {
  const { total, monthCount, catRanking, streak, latestDate } = stats;
  const now = new Date();
  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const monthLabel = months[now.getMonth()];
  const maxCount = catRanking[0]?.[1] || 1;

  return (
    <div className="stats-section">
      <div className="stats-header">
        <span className="stats-title">📊 {monthLabel} 기록 현황</span>
        {streak > 0 && (
          <span className="stats-streak">🔥 최근 {streak}일 연속 작성 중</span>
        )}
      </div>
      <div className="stats-body">
        <div className="stats-cats">
          {catRanking.map(([cat, count]) => (
            <div key={cat} className="stats-cat-row">
              <span className="stats-cat-name">{cat}</span>
              <div className="stats-bar-wrap">
                <div className="stats-bar" style={{ width: `${Math.round(count / maxCount * 100)}%` }} />
              </div>
              <span className="stats-cat-count">{count}</span>
            </div>
          ))}
        </div>
        <div className="stats-summary">
          <div className="stats-item">
            <span className="stats-num">{total}</span>
            <span className="stats-label">전체 TIL</span>
          </div>
          <div className="stats-item">
            <span className="stats-num">{monthCount}</span>
            <span className="stats-label">이번 달</span>
          </div>
          {latestDate && (
            <div className="stats-item">
              <span className="stats-num" style={{ fontSize: '0.85rem' }}>{latestDate.slice(5)}</span>
              <span className="stats-label">마지막 작성</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

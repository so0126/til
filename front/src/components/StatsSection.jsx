const SHELL_LAYOUT = [2, 4, 6, 8, 8, 8, 6];
const SHELL_COLUMNS = 8;

function buildShellCells(activityCells) {
  const cells = [];
  let index = 0;

  for (let row = 0; row < SHELL_LAYOUT.length; row += 1) {
    const count = SHELL_LAYOUT[row];
    const startCol = Math.floor((SHELL_COLUMNS - count) / 2) + 1;

    for (let col = 0; col < count && index < activityCells.length; col += 1) {
      const cell = activityCells[index++];
      cells.push({
        ...cell,
        row: row + 1,
        col: startCol + col,
      });
    }
  }

  return cells;
}

export default function StatsSection({ stats }) {
  const { total, monthCount, streak, latestDate, activityCells, activityMax } = stats;
  const now = new Date();
  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const monthLabel = months[now.getMonth()];
  const shellCells = buildShellCells(activityCells || []);
  const filledDays = (activityCells || []).filter(c => c.count > 0).length;

  return (
    <div className="stats-section">
      <div className="stats-header">
        <span className="stats-title">🐚 {monthLabel} 기록 조개</span>
        {streak > 0 && (
          <span className="stats-streak">🔥 최근 {streak}일 연속 작성 중</span>
        )}
      </div>
      <div className="stats-body">
        <div className="stats-shell-panel">
          <div className="stats-shell-meta">
            <span className="stats-shell-score">🐚 최근 42일 중 {filledDays}일 기록</span>
            <span className="stats-shell-note">진할수록 기록이 많은 날</span>
          </div>
          <div className="stats-shell-grid" aria-label="최근 42일 활동 조개 모양">
            {shellCells.map(cell => {
              const level = cell.count <= 0
                ? 0
                : Math.min(4, Math.max(1, Math.ceil((cell.count / activityMax) * 4)));

              return (
                <span
                  key={cell.date}
                  className={`stats-shell-cell level-${level}`}
                  style={{ gridRow: cell.row, gridColumn: cell.col }}
                  title={`${cell.date}: ${cell.count}개`}
                  aria-label={`${cell.date}, ${cell.count}개`}
                />
              );
            })}
          </div>
          <div className="stats-shell-legend" aria-hidden="true">
            <span>적음</span>
            <span className="stats-shell-swatch level-0" />
            <span className="stats-shell-swatch level-1" />
            <span className="stats-shell-swatch level-2" />
            <span className="stats-shell-swatch level-3" />
            <span className="stats-shell-swatch level-4" />
            <span>많음</span>
          </div>
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function groupByYearMonth(posts) {
  const map = {};
  for (const p of posts) {
    const year = p.date ? p.date.slice(0, 4) : '날짜없음';
    const month = p.date ? p.date.slice(5, 7) + '월' : '기타';
    if (!map[year]) map[year] = {};
    if (!map[year][month]) map[year][month] = [];
    map[year][month].push(p);
  }
  return map;
}

export default function Sidebar({ categories, postsByCategory, totalCount }) {
  const pathname = usePathname();

  // 열린 카테고리
  const [openCat, setOpenCat] = useState(null);
  // 열린 연도: { catSlug: year }
  const [openYear, setOpenYear] = useState({});
  // 열린 월: { "catSlug-year": month }
  const [openMonth, setOpenMonth] = useState({});

  function toggleCat(slug) {
    setOpenCat(prev => (prev === slug ? null : slug));
  }
  function toggleYear(catSlug, year) {
    setOpenYear(prev => ({ ...prev, [catSlug]: prev[catSlug] === year ? null : year }));
  }
  function toggleMonth(catSlug, year, month) {
    const key = `${catSlug}-${year}`;
    setOpenMonth(prev => ({ ...prev, [key]: prev[key] === month ? null : month }));
  }

  return (
    <aside className="sidebar">
      {/* 프로필 카드 */}
      <div className="profile-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://github.com/so0126.png" alt="so0126" referrerPolicy="no-referrer" />
        <div className="profile-name">so0126</div>
        <div className="profile-bio">취업 준비 학습 기록 📚</div>
        <div className="profile-status">✏️ TIL {totalCount}개째 작성 중</div>
      </div>

      {/* 홈 링크 */}
      <nav className="accordion-nav">
        <div className="acc-item">
          <Link
            href="/"
            className={`acc-header${pathname === '/' ? ' open' : ''}`}
            style={{ display: 'flex', textDecoration: 'none' }}
          >
            🏠 홈
          </Link>
        </div>

        {/* 카테고리 아코디언 */}
        {categories.map(cat => {
          const posts = postsByCategory[cat.slug] || [];
          const isCatOpen = openCat === cat.slug;
          const grouped = groupByYearMonth(posts);
          const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

          return (
            <div key={cat.slug} className="acc-item">
              {/* ── 카테고리 헤더 ── */}
              <button
                className={`acc-header${isCatOpen ? ' open' : ''}`}
                onClick={() => toggleCat(cat.slug)}
                type="button"
              >
                {cat.icon} {cat.label}
                <span className="acc-count">{posts.length}</span>
                <span className="acc-arrow">▶</span>
              </button>

              <ul className={`acc-body${isCatOpen ? ' open' : ''}`}>
                {posts.length === 0 && (
                  <li style={{ padding: '5px 10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    아직 글이 없어요
                  </li>
                )}

                {/* ── 연도 아코디언 ── */}
                {years.map(year => {
                  const isYearOpen = openYear[cat.slug] === year;
                  const months = Object.keys(grouped[year]).sort((a, b) => b.localeCompare(a));
                  const yearCount = Object.values(grouped[year]).reduce((s, arr) => s + arr.length, 0);

                  return (
                    <li key={year} style={{ listStyle: 'none' }}>
                      <button
                        className={`acc-sub-header${isYearOpen ? ' open' : ''}`}
                        onClick={() => toggleYear(cat.slug, year)}
                        type="button"
                      >
                        📅 {year}년
                        <span className="acc-count" style={{ marginLeft: 'auto', marginRight: 4 }}>{yearCount}</span>
                        <span className="acc-arrow" style={{ fontSize: '0.6rem' }}>▶</span>
                      </button>

                      <ul className={`acc-body acc-body-month${isYearOpen ? ' open' : ''}`}>
                        {/* ── 월 아코디언 ── */}
                        {months.map(month => {
                          const monthKey = `${cat.slug}-${year}`;
                          const isMonthOpen = openMonth[monthKey] === month;
                          const monthPosts = grouped[year][month];

                          return (
                            <li key={month} style={{ listStyle: 'none' }}>
                              <button
                                className={`acc-month-header${isMonthOpen ? ' open' : ''}`}
                                onClick={() => toggleMonth(cat.slug, year, month)}
                                type="button"
                              >
                                🗓 {month}
                                <span className="acc-count" style={{ marginLeft: 'auto', marginRight: 4 }}>{monthPosts.length}</span>
                                <span className="acc-arrow" style={{ fontSize: '0.6rem' }}>▶</span>
                              </button>

                              <ul className={`acc-body acc-body-posts${isMonthOpen ? ' open' : ''}`}>
                                {monthPosts.map(p => {
                                  const href = `/${cat.slug}/${p.slug}/`;
                                  const isActive = pathname === href || pathname === href.slice(0, -1);
                                  return (
                                    <li key={p.slug}>
                                      <Link href={href} className={isActive ? 'active' : ''} prefetch={false}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginRight: 4 }}>
                                          {p.date ? p.date.slice(8) + '일' : ''}
                                        </span>
                                        {p.displayTitle}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* 귀여운 캐릭터 */}
      <div style={{
        textAlign: 'center',
        fontSize: '1.4rem',
        marginTop: 'auto',
        paddingTop: '16px',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
      }}>
        ( ˶ˆᗜˆ˵ ) ✨
        <div style={{ fontSize: '0.7rem', marginTop: 4 }}>열공 중이에요!</div>
      </div>
    </aside>
  );
}

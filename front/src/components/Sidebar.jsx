'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function groupByYearMonth(posts) {
  const map = {};
  for (const p of posts) {
    const year  = p.date ? p.date.slice(0, 4) : '날짜없음';
    const month = p.date ? p.date.slice(5, 7) + '월' : '기타';
    if (!map[year]) map[year] = {};
    if (!map[year][month]) map[year][month] = [];
    map[year][month].push(p);
  }
  return map;
}

export default function Sidebar({ categories, postsByCategory, totalPostCount, latestDate, drawerOpen, onClose }) {
  const pathname = usePathname();
  const [openCat,   setOpenCat]   = useState(null);
  const [openYear,  setOpenYear]  = useState({});
  const [openMonth, setOpenMonth] = useState({});

  // 투데이 / 토탈 (localStorage 기반)
  const [todayViews, setTodayViews] = useState('...');
  const [totalViews, setTotalViews] = useState('...');

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const todayKey = `til-today-${today}`;
      const tc = parseInt(localStorage.getItem(todayKey) || '0') + 1;
      localStorage.setItem(todayKey, String(tc));
      setTodayViews(tc);

      const tot = parseInt(localStorage.getItem('til-total-views') || '0') + 1;
      localStorage.setItem('til-total-views', String(tot));
      setTotalViews(tot);
    } catch (_) {}
  }, []);

  function toggleCat(slug) { setOpenCat(p => p === slug ? null : slug); }
  function toggleYear(cat, year) {
    setOpenYear(p => ({ ...p, [cat]: p[cat] === year ? null : year }));
  }
  function toggleMonth(cat, year, month) {
    const key = `${cat}-${year}`;
    setOpenMonth(p => ({ ...p, [key]: p[key] === month ? null : month }));
  }

  return (
    <>
      {/* 드로어 사이드바 */}
      <aside className={`sidebar${drawerOpen ? ' drawer-open' : ''}`}>
        {/* 모바일 닫기 버튼 */}
        <button className="drawer-close" onClick={onClose} type="button">✕</button>

        {/* 프로필 카드 */}
        <div className="profile-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://github.com/so0126.png" alt="so0126" referrerPolicy="no-referrer" />
          <div className="profile-name">so0126</div>
          <div className="profile-bio">취업 준비 학습 기록 📚</div>
          {latestDate && (
            <div className="profile-latest">📅 최근 업데이트: {latestDate}</div>
          )}
          {/* 투데이 / 토탈 */}
          <div className="visitor-counter">
            <div className="vc-item">
              <span className="vc-label">TODAY</span>
              <span className="vc-value">{todayViews}</span>
            </div>
            <div className="vc-divider" />
            <div className="vc-item">
              <span className="vc-label">TOTAL</span>
              <span className="vc-value">{totalViews}</span>
            </div>
          </div>
        </div>

        {/* 아코디언 메뉴 */}
        <nav className="accordion-nav">
          {/* 홈 */}
          <div className="acc-item">
            <Link
              href="/"
              className={`acc-header${pathname === '/' ? ' open' : ''}`}
              style={{ display: 'flex', textDecoration: 'none' }}
              onClick={onClose}
            >
              🏠 홈
            </Link>
          </div>

          {/* 카테고리 */}
          {categories.map(cat => {
            const posts    = postsByCategory[cat.slug] || [];
            const isCatOpen = openCat === cat.slug;
            const grouped  = groupByYearMonth(posts);
            const years    = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

            return (
              <div key={cat.slug} className="acc-item">
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

                  {years.map(year => {
                    const isYearOpen = openYear[cat.slug] === year;
                    const months = Object.keys(grouped[year]).sort((a, b) => b.localeCompare(a));
                    const yearCount = Object.values(grouped[year]).reduce((s, a) => s + a.length, 0);

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
                          {months.map(month => {
                            const monthKey = `${cat.slug}-${year}`;
                            const isMonthOpen = openMonth[monthKey] === month;
                            const monthPosts  = grouped[year][month];

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
                                        <Link href={href} className={isActive ? 'active' : ''} prefetch={false} onClick={onClose}>
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

        {/* 캐릭터 */}
        <div style={{ textAlign: 'center', fontSize: '1.4rem', marginTop: 'auto', paddingTop: '16px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          ( ˶ˆᗜˆ˵ ) ✨
          <div style={{ fontSize: '0.7rem', marginTop: 4 }}>열공 중이에요!</div>
        </div>
      </aside>
    </>
  );
}

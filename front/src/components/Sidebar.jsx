'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import StatsSection from './StatsSection';

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

const CONFETTI = ['🎉','🎊','✨','🎂','🎈','⭐','🌟','💙','🎁'];

function BirthdayConfetti() {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    emoji: CONFETTI[i % CONFETTI.length],
    left: `${5 + (i * 53) % 90}%`,
    delay: `${(i * 0.17) % 1.8}s`,
    duration: `${1.4 + (i * 0.11) % 0.8}s`,
  }));
  return (
    <div className="birthday-confetti" aria-hidden="true">
      {pieces.map(p => (
        <span key={p.id} style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}>
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

export default function Sidebar({ categories, postsByCategory, stats, totalPostCount, latestDate, drawerOpen, onClose }) {
  const pathname = usePathname();
  const now = new Date();
  const isBirthday = now.getMonth() === 11 && now.getDate() === 26;
  const streak = stats?.streak || 0;

  // 여러 카테고리 동시 열기 + localStorage 유지
  const [openCats,  setOpenCats]  = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('sb-cats') || '[]')); } catch { return new Set(); }
  });
  const [openYear,  setOpenYear]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb-years') || '{}'); } catch { return {}; }
  });
  const [openMonth, setOpenMonth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb-months') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem('sb-cats', JSON.stringify([...openCats])); } catch (_) {}
  }, [openCats]);
  useEffect(() => {
    try { localStorage.setItem('sb-years', JSON.stringify(openYear)); } catch (_) {}
  }, [openYear]);
  useEffect(() => {
    try { localStorage.setItem('sb-months', JSON.stringify(openMonth)); } catch (_) {}
  }, [openMonth]);

  function toggleCat(slug) {
    setOpenCats(prev => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }
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
        <div className={`profile-card${isBirthday ? ' birthday' : ''}`} style={{ position: 'relative', overflow: 'visible' }}>
          {isBirthday && <BirthdayConfetti />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://github.com/so0126.png" alt="so0126" referrerPolicy="no-referrer" />
          <div className="profile-name">so0126</div>
          {isBirthday
            ? <div className="profile-bio birthday-msg">🎂 생일 축하해요, 소영님! 🎉</div>
            : <div className="profile-bio">취업 준비 학습 기록 📚</div>
          }
          {latestDate && (
            <div className="profile-latest">📅 최근 업데이트: {latestDate}</div>
          )}
          <div className="profile-latest" style={{ marginTop: 4 }}>
            📚 총 {totalPostCount}개의 TIL
          </div>
          {streak > 0 && (
            <div className="profile-streak">🔥 최근 {streak}일 연속 작성 중</div>
          )}
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

          <div className="acc-item">
            <Link
              href="/shells"
              className={`acc-header${pathname === '/shells' ? ' open' : ''}`}
              style={{ display: 'flex', textDecoration: 'none' }}
              onClick={onClose}
            >
              🐚 기록 조개
            </Link>
          </div>

          {/* 카테고리 */}
          {categories.map(cat => {
            const posts    = postsByCategory[cat.slug] || [];
            const isCatOpen = openCats.has(cat.slug);
            const grouped  = groupByYearMonth(posts);
            const years    = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

            return (
              <div key={cat.slug} className="acc-item">
                <button
                  className={`acc-header${isCatOpen ? ' open' : ''}`}
                  onClick={() => toggleCat(cat.slug)}
                  type="button"
                  aria-expanded={isCatOpen}
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
                          aria-expanded={isYearOpen}
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
                                  aria-expanded={isMonthOpen}
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
                                        <Link href={href} className={isActive ? 'active' : ''} prefetch={false} onClick={onClose} aria-current={isActive ? 'page' : undefined}>
                                          {isActive && <span className="active-star" aria-hidden="true">⭐ </span>}
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

        <StatsSection stats={stats} />
      </aside>
    </>
  );
}

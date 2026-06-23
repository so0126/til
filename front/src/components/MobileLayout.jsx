'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

export default function MobileLayout({ children, categories, postsByCategory, stats, totalPostCount, latestDate }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [todayViews, setTodayViews] = useState(0);
  const [dark, setDark] = useState(false);

  // 다크모드: localStorage에서 초기값 읽어서 <html>에 적용
  useEffect(() => {
    const saved = localStorage.getItem('til-theme') === 'dark';
    setDark(saved);
    document.documentElement.setAttribute('data-theme', saved ? 'dark' : 'light');
  }, []);

  function toggleDark() {
    setDark(prev => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      try { localStorage.setItem('til-theme', next ? 'dark' : 'light'); } catch (_) {}
      return next;
    });
  }

  // TODAY 카운터: 5시간 간격으로 1회만 집계 (같은 브라우저 기준)
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const todayKey = `til-today-${today}`;
      const lastKey  = `til-last-visit`;
      const now = Date.now();
      const last = parseInt(localStorage.getItem(lastKey) || '0');
      const FIVE_HOURS = 5 * 60 * 60 * 1000;

      const stored = parseInt(localStorage.getItem(todayKey) || '0');
      if (now - last > FIVE_HOURS) {
        const newCount = stored + 1;
        localStorage.setItem(todayKey, String(newCount));
        localStorage.setItem(lastKey, String(now));
        setTodayViews(newCount);
      } else {
        setTodayViews(stored);
      }
    } catch (_) {}
  }, []);

  // 드로어 열릴 때 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  function goRandom() {
    const all = Object.values(postsByCategory).flat();
    if (!all.length) return;
    const p = all[Math.floor(Math.random() * all.length)];
    router.push(`/${p.categorySlug}/${p.slug}/`);
  }

  return (
    <div className="bg-wrapper">
      <div className="minihompy">
        {/* ── 헤더 ── */}
        <header className="site-header">
          <button className="hamburger" onClick={() => setDrawerOpen(true)} type="button" aria-label="메뉴 열기">
            ☰
          </button>

          <Link href="/" className="site-logo-link">
            <span className="logo-text">so0126의 TIL.zip</span>
            <span className="logo-sub">오늘 배운 것을 잊지 않기 위한 기록 🌊</span>
          </Link>

          <div className="header-right">
            <span className="header-stat">TOTAL {totalPostCount}</span>
            <span className="header-divider">|</span>
            <span className="header-stat">TODAY {todayViews}</span>
            <span className="header-divider">|</span>
            <a
              href="https://github.com/so0126/til"
              target="_blank"
              rel="noreferrer"
              className="header-link"
              aria-label="GitHub 저장소"
            >
              GitHub
            </a>
            <span className="header-divider">|</span>
            <button className="header-random-btn" onClick={goRandom} type="button" aria-label="랜덤 글 보기">
              🎲 Random
            </button>
            <span className="header-divider">|</span>
            <button className="header-dark-btn" onClick={toggleDark} type="button" aria-label={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}>
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* 드로어 오버레이 */}
        {drawerOpen && (
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
        )}

        {/* 본문 */}
        <div className="site-body">
          <Sidebar
            categories={categories}
            postsByCategory={postsByCategory}
            stats={stats}
            totalPostCount={totalPostCount}
            latestDate={latestDate}
            drawerOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />
          <main className="content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

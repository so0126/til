'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from './Sidebar';

export default function MobileLayout({ children, categories, postsByCategory, totalPostCount, latestDate }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 드로어 열릴 때 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <div className="bg-wrapper">
      <div className="minihompy">
        {/* ── 헤더 ── */}
        <header className="site-header">
          <button
            className="hamburger"
            onClick={() => setDrawerOpen(true)}
            type="button"
            aria-label="메뉴 열기"
          >
            ☰
          </button>
          <Link href="/" className="site-logo-link">
            <span className="logo-text">so0126의 TIL.zip</span>
            <span className="logo-sub">오늘 배운 것을 잊지 않기 위한 기록 🌊</span>
          </Link>
          <div className="header-right">
            <span className="stat">TOTAL {totalPostCount}</span>
            <a href="https://github.com/so0126/til" target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </header>

        {/* ── 모바일 드로어 오버레이 ── */}
        {drawerOpen && (
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
        )}

        {/* ── 본문 ── */}
        <div className="site-body">
          <Sidebar
            categories={categories}
            postsByCategory={postsByCategory}
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

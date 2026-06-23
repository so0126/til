'use client';

import { useState, useEffect } from 'react';

export default function TableOfContents() {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const els = document.querySelectorAll('.md-body h2, .md-body h3');
    const items = Array.from(els)
      .map(el => ({ id: el.id, text: el.textContent.trim(), level: el.tagName.toLowerCase() }))
      .filter(h => h.id);
    setHeadings(items);
    if (!items.length) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -65% 0px', threshold: 0 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  }

  if (!headings.length) return null;

  const TocList = () => (
    <>
      {headings.map(h => (
        <button
          key={h.id}
          className={`toc-item toc-${h.level}${activeId === h.id ? ' active' : ''}`}
          onClick={() => scrollTo(h.id)}
          type="button"
        >
          {h.text}
        </button>
      ))}
    </>
  );

  return (
    <>
      {/* 데스크톱 TOC */}
      <nav className="toc-nav" aria-label="목차">
        <div className="toc-title">ON THIS PAGE</div>
        <div className="toc-list">
          <TocList />
        </div>
        <button
          className="toc-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          type="button"
        >
          ↑ 맨 위로
        </button>
      </nav>

      {/* 모바일 플로팅 버튼 */}
      <button
        className="toc-float-btn"
        onClick={() => setMobileOpen(true)}
        type="button"
        aria-label="목차 보기"
      >
        📋
      </button>

      {/* 모바일 바텀 시트 */}
      {mobileOpen && (
        <div className="toc-mobile-overlay" onClick={() => setMobileOpen(false)}>
          <div className="toc-mobile-sheet" onClick={e => e.stopPropagation()}>
            <div className="toc-mobile-header">
              <span className="toc-title">ON THIS PAGE</span>
              <button onClick={() => setMobileOpen(false)} type="button" aria-label="닫기">✕</button>
            </div>
            <div className="toc-list">
              <TocList />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

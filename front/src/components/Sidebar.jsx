'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ categories, postsByCategory, totalCount }) {
  const pathname = usePathname();
  const [openCat, setOpenCat] = useState(null);

  function toggle(slug) {
    setOpenCat(prev => (prev === slug ? null : slug));
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
            href="/til/"
            className={`acc-header${pathname === '/til/' || pathname === '/til' ? ' open' : ''}`}
            style={{ display: 'flex', textDecoration: 'none' }}
          >
            🏠 홈
          </Link>
        </div>

        {/* 카테고리 아코디언 */}
        {categories.map(cat => {
          const posts = postsByCategory[cat.slug] || [];
          const isOpen = openCat === cat.slug;
          return (
            <div key={cat.slug} className="acc-item">
              <button
                className={`acc-header${isOpen ? ' open' : ''}`}
                onClick={() => toggle(cat.slug)}
                type="button"
              >
                {cat.icon} {cat.label}
                <span className="acc-count">{posts.length}</span>
                <span className="acc-arrow">▶</span>
              </button>
              <ul className={`acc-body${isOpen ? ' open' : ''}`}>
                {posts.map(p => {
                  const href = `/til/${cat.slug}/${p.slug}/`;
                  const isActive = pathname === href || pathname === href.slice(0, -1);
                  return (
                    <li key={p.slug}>
                      <Link href={href} className={isActive ? 'active' : ''}>
                        {p.date && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginRight: 4 }}>
                            {p.date.slice(5)}
                          </span>
                        )}
                        {p.displayTitle}
                      </Link>
                    </li>
                  );
                })}
                {posts.length === 0 && (
                  <li style={{ padding: '5px 10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    아직 글이 없어요
                  </li>
                )}
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

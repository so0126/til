'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

function PostCard({ post }) {
  const month = post.date ? post.date.slice(5, 7) : '';
  const day = post.date ? post.date.slice(8, 10) : '';

  return (
    <Link href={`/${post.categorySlug}/${post.slug}/`} className="post-card">
      {post.date && (
        <div className="post-date-block">
          <div className="post-date-month">{month}월</div>
          <div className="post-date-day">{day}</div>
        </div>
      )}
      <div className="post-info">
        <span className="post-badge">{post.categoryIcon} {post.category}</span>
        <div className="post-title">{post.displayTitle}</div>
      </div>
    </Link>
  );
}

export default function HomeClient({ posts, categories }) {
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  const filtered = useMemo(() => {
    return posts.filter(p => {
      if (keyword && !p.displayTitle.toLowerCase().includes(keyword.toLowerCase()) &&
          !p.category.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (activeCat !== 'all' && p.categorySlug !== activeCat) return false;
      if (dateFrom && p.date && p.date < dateFrom) return false;
      if (dateTo && p.date && p.date > dateTo) return false;
      return true;
    });
  }, [posts, keyword, dateFrom, dateTo, activeCat]);

  function resetFilters() {
    setKeyword('');
    setDateFrom('');
    setDateTo('');
    setActiveCat('all');
  }

  return (
    <>
      {/* 히어로 */}
      <div className="home-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://github.com/so0126.png" alt="so0126" referrerPolicy="no-referrer" />
        <h1>so0126의 TIL 📖</h1>
        <p>매일 배운 것을 기록하는 공간이에요</p>
      </div>

      {/* 검색 박스 */}
      <div className="search-box">
        <div className="search-input-row">
          <input
            className="search-input"
            type="text"
            placeholder="🔍 제목 검색..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        </div>
        <div className="date-row">
          <label>기간</label>
          <input className="date-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span className="date-sep">~</span>
          <input className="date-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <button className="btn-reset" onClick={resetFilters} type="button">초기화</button>
        </div>
        <div className="cat-buttons">
          <button
            className={`cat-btn${activeCat === 'all' ? ' active' : ''}`}
            onClick={() => setActiveCat('all')}
            type="button"
          >전체</button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              className={`cat-btn${activeCat === cat.slug ? ' active' : ''}`}
              onClick={() => setActiveCat(cat.slug)}
              type="button"
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      <div className="result-info">총 {filtered.length}개의 TIL</div>
      <div className="post-list">
        {filtered.length === 0
          ? <p className="empty-msg">조건에 맞는 TIL이 없어요 😢</p>
          : filtered.map(p => <PostCard key={`${p.categorySlug}-${p.slug}`} post={p} />)
        }
      </div>
    </>
  );
}

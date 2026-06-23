'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const TODAY = new Date().toISOString().slice(0, 10);

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function PostCard({ post }) {
  const month = post.date ? post.date.slice(5, 7) : '';
  const day   = post.date ? post.date.slice(8, 10) : '';
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
  const [keyword,    setKeyword]    = useState('');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [activeCats, setActiveCats] = useState([]); // 다중선택

  function toggleCat(slug) {
    setActiveCats(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  }

  function applyQuick(type) {
    const today = new Date();
    if (type === 'today') {
      setDateFrom(TODAY); setDateTo(TODAY);
    } else if (type === '7d') {
      setDateFrom(toDateStr(addDays(today, -6))); setDateTo(TODAY);
    } else if (type === '30d') {
      setDateFrom(toDateStr(addDays(today, -29))); setDateTo(TODAY);
    } else {
      setDateFrom(''); setDateTo('');
    }
  }

  function removeCat(slug) { setActiveCats(prev => prev.filter(s => s !== slug)); }
  function removeDate()    { setDateFrom(''); setDateTo(''); }
  function removeKeyword() { setKeyword(''); }

  const filtered = useMemo(() => {
    return posts.filter(p => {
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (!p.displayTitle.toLowerCase().includes(kw) && !p.category.toLowerCase().includes(kw)) return false;
      }
      if (activeCats.length > 0 && !activeCats.includes(p.categorySlug)) return false;
      if (dateFrom && p.date && p.date < dateFrom) return false;
      if (dateTo   && p.date && p.date > dateTo)   return false;
      return true;
    });
  }, [posts, keyword, activeCats, dateFrom, dateTo]);

  const hasFilter = keyword || activeCats.length > 0 || dateFrom || dateTo;

  const activeCatLabels = activeCats.map(s => {
    const cat = categories.find(c => c.slug === s);
    return cat ? `${cat.icon} ${cat.label}` : s;
  });

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
        {/* 키워드 */}
        <div className="search-input-row">
          <input
            className="search-input"
            type="text"
            placeholder="🔍 제목 검색..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        </div>

        {/* 날짜 퀵 필터 */}
        <div className="date-quick-row">
          <button className="quick-btn" onClick={() => applyQuick('today')} type="button">오늘</button>
          <button className="quick-btn" onClick={() => applyQuick('7d')} type="button">최근 7일</button>
          <button className="quick-btn" onClick={() => applyQuick('30d')} type="button">최근 30일</button>
          <button className="quick-btn" onClick={() => applyQuick('all')} type="button">전체 기간</button>
        </div>

        {/* 날짜 직접 입력 */}
        <div className="date-row">
          <label>기간</label>
          <input className="date-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span className="date-sep">~</span>
          <input className="date-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>

        {/* 카테고리 다중선택 */}
        <div className="cat-buttons">
          {categories.map(cat => (
            <button
              key={cat.slug}
              className={`cat-btn${activeCats.includes(cat.slug) ? ' active' : ''}`}
              onClick={() => toggleCat(cat.slug)}
              type="button"
            >
              {cat.icon} {cat.label}
              {activeCats.includes(cat.slug) && <span className="cat-check"> ✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* 활성 필터 배지 + 결과 */}
      <div className="filter-result-row">
        <span className="result-count">
          총 <strong>{filtered.length}</strong>개의 기록을 찾았어요
          {(dateFrom || dateTo) && (
            <span className="result-period">
              &nbsp;· 검색 기간: {dateFrom || '처음'} ~ {dateTo || '오늘'}
            </span>
          )}
        </span>

        {hasFilter && (
          <div className="active-badges">
            {keyword && (
              <span className="badge-chip">
                🔍 {keyword}
                <button onClick={removeKeyword} type="button">×</button>
              </span>
            )}
            {(dateFrom || dateTo) && (
              <span className="badge-chip">
                📅 {dateFrom || '처음'} ~ {dateTo || '오늘'}
                <button onClick={removeDate} type="button">×</button>
              </span>
            )}
            {activeCatLabels.map((label, i) => (
              <span key={activeCats[i]} className="badge-chip">
                {label}
                <button onClick={() => removeCat(activeCats[i])} type="button">×</button>
              </span>
            ))}
            <button className="btn-reset-all" onClick={() => { setKeyword(''); setDateFrom(''); setDateTo(''); setActiveCats([]); }} type="button">
              전체 초기화
            </button>
          </div>
        )}
      </div>

      {/* 글 목록 */}
      <div className="post-list">
        {filtered.length === 0
          ? <p className="empty-msg">조건에 맞는 TIL이 없어요 😢</p>
          : filtered.map(p => <PostCard key={`${p.categorySlug}-${p.slug}`} post={p} />)
        }
      </div>
    </>
  );
}

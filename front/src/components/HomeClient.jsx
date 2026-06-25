'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StatsSection from './StatsSection';

const TODAY = new Date().toISOString().slice(0, 10);

function toDateStr(d) { return d.toISOString().slice(0, 10); }
function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }

function highlight(text, kw) {
  if (!kw || !text) return text;
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === kw.toLowerCase()
      ? <mark key={i} className="search-highlight">{part}</mark>
      : part
  );
}

function PostCard({ post, keyword }) {
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
        <div className="post-title">{highlight(post.displayTitle, keyword)}</div>
        {post.preview && (
          <div className="post-preview">{highlight(post.preview, keyword)}</div>
        )}
        <div className="post-meta-row">
          {post.tags && post.tags.length > 0 && (
            <span className="post-tags">
              {post.tags.slice(0, 4).map(t => (
                <span key={t} className="post-tag">{highlight(t, keyword)}</span>
              ))}
            </span>
          )}
          {post.readingTime && (
            <span className="post-reading-time">⏱ {post.readingTime}분</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HomeClient({ posts, categories, stats }) {
  const router = useRouter();
  const ITEMS_PER_PAGE = 8;
  const [keyword,        setKeyword]        = useState('');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [activeCats,     setActiveCats]     = useState([]);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('til-recent-searches') || '[]'); } catch { return []; }
  });

  function saveSearch(kw) {
    if (!kw.trim()) return;
    const next = [kw, ...recentSearches.filter(s => s !== kw)].slice(0, 6);
    setRecentSearches(next);
    try { localStorage.setItem('til-recent-searches', JSON.stringify(next)); } catch (_) {}
  }
  function removeRecent(kw) {
    const next = recentSearches.filter(s => s !== kw);
    setRecentSearches(next);
    try { localStorage.setItem('til-recent-searches', JSON.stringify(next)); } catch (_) {}
  }
  function applyRecent(kw) { setKeyword(kw); setSearchFocused(false); }

  function toggleCat(slug) {
    setActiveCats(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  }
  function applyQuick(type) {
    const today = new Date();
    if (type === 'today')     { setDateFrom(TODAY); setDateTo(TODAY); }
    else if (type === '7d')   { setDateFrom(toDateStr(addDays(today, -6)));  setDateTo(TODAY); }
    else if (type === '30d')  { setDateFrom(toDateStr(addDays(today, -29))); setDateTo(TODAY); }
    else                      { setDateFrom(''); setDateTo(''); }
  }
  function goRandom() {
    if (posts.length === 0) return;
    const p = posts[Math.floor(Math.random() * posts.length)];
    router.push(`/${p.categorySlug}/${p.slug}/`);
  }

  const filtered = useMemo(() => posts.filter(p => {
    if (keyword) {
      const kw = keyword.toLowerCase();
      if (
        !p.displayTitle.toLowerCase().includes(kw) &&
        !p.category.toLowerCase().includes(kw) &&
        !(p.bodyText || '').includes(kw) &&
        !(p.tags || []).some(t => t.toLowerCase().includes(kw))
      ) return false;
    }
    if (activeCats.length > 0 && !activeCats.includes(p.categorySlug)) return false;
    if (dateFrom && p.date && p.date < dateFrom) return false;
    if (dateTo   && p.date && p.date > dateTo)   return false;
    return true;
  }), [posts, keyword, activeCats, dateFrom, dateTo]);

  const hasFilter = keyword || activeCats.length > 0 || dateFrom || dateTo;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pagePosts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, dateFrom, dateTo, activeCats.join('|')]);

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  function removeCat(slug)  { setActiveCats(prev => prev.filter(s => s !== slug)); }
  function removeDate()     { setDateFrom(''); setDateTo(''); }
  function removeKeyword()  { setKeyword(''); }
  function resetAll()       { setKeyword(''); setDateFrom(''); setDateTo(''); setActiveCats([]); }

  const activeCatLabels = activeCats.map(s => {
    const cat = categories.find(c => c.slug === s);
    return { slug: s, label: cat ? `${cat.icon} ${cat.label}` : s };
  });

  return (
    <>
      {/* 히어로 */}
      <div className="home-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://github.com/so0126.png" alt="so0126" referrerPolicy="no-referrer" />
        <div className="home-hero-text">
          <h1>so0126의 TIL 📖</h1>
          <p>매일 배운 것을 기록하는 공간이에요</p>
        </div>
      </div>

      {/* 검색 박스 */}
      <div className="search-box">
        <div className="search-input-row" style={{ position: 'relative' }}>
          <input
            className="search-input"
            type="text"
            placeholder="🔍 제목, 본문, 태그 검색..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            onKeyDown={e => { if (e.key === 'Enter' && keyword) saveSearch(keyword); }}
          />
          {/* 최근 검색어 드롭다운 */}
          {searchFocused && !keyword && recentSearches.length > 0 && (
            <div className="recent-searches">
              <div className="recent-searches-label">최근 검색어</div>
              {recentSearches.map(s => (
                <div key={s} className="recent-item">
                  <button type="button" className="recent-item-text" onClick={() => applyRecent(s)}>🕐 {s}</button>
                  <button type="button" className="recent-item-del" onClick={() => removeRecent(s)} aria-label={`${s} 삭제`}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="search-filter-row">
          <div className="date-quick-row">
            <button className="quick-btn" onClick={() => applyQuick('today')} type="button">오늘</button>
            <button className="quick-btn" onClick={() => applyQuick('7d')}   type="button">최근 7일</button>
            <button className="quick-btn" onClick={() => applyQuick('30d')}  type="button">최근 30일</button>
            <button className="quick-btn" onClick={() => applyQuick('all')}  type="button">전체 기간</button>
          </div>

          <div className="date-row">
            <label>기간</label>
            <input className="date-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <span className="date-sep">~</span>
            <input className="date-input" type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)} />
          </div>

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
      </div>

      {/* 결과 + 배지 */}
      <div className="filter-result-row">
        <span className="result-count">
          총 <strong>{filtered.length}</strong>개의 기록을 찾았어요
          {(dateFrom || dateTo) && (
            <span className="result-period">
              &nbsp;· 검색 기간: {dateFrom || '처음'} ~ {dateTo || TODAY}
            </span>
          )}
        </span>

        {hasFilter && (
          <div className="active-badges">
            {keyword && (
              <span className="badge-chip">🔍 {keyword}<button onClick={removeKeyword} type="button">×</button></span>
            )}
            {(dateFrom || dateTo) && (
              <span className="badge-chip">📅 {dateFrom || '처음'} ~ {dateTo || TODAY}<button onClick={removeDate} type="button">×</button></span>
            )}
            {activeCatLabels.map(({ slug, label }) => (
              <span key={slug} className="badge-chip">{label}<button onClick={() => removeCat(slug)} type="button">×</button></span>
            ))}
            <button className="btn-reset-all" onClick={resetAll} type="button">전체 초기화</button>
          </div>
        )}
      </div>

      {/* 글 목록 */}
      {filtered.length > 0 && totalPages > 1 && (
        <div className="pagination" aria-label="페이지네이션">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                className={`pagination-btn page-num${page === currentPage ? ' active' : ''}`}
                onClick={() => setCurrentPage(page)}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}

      <div className="post-list">
        {filtered.length === 0
          ? <p className="empty-msg">조건에 맞는 TIL이 없어요 😢</p>
          : pagePosts.map(p => <PostCard key={`${p.categorySlug}-${p.slug}`} post={p} keyword={keyword} />)
        }
      </div>

      {stats && <StatsSection stats={stats} />}
    </>
  );
}

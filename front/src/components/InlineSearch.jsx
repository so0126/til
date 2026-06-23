'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function InlineSearch({ posts }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const results = q.length >= 1
    ? posts.filter(p => {
        const kw = q.toLowerCase();
        return (
          p.displayTitle.toLowerCase().includes(kw) ||
          (p.bodyText || '').includes(kw) ||
          (p.tags || []).some(t => t.toLowerCase().includes(kw))
        );
      }).slice(0, 8)
    : [];

  function go(p) {
    router.push(`/${p.categorySlug}/${p.slug}/`);
    setQ('');
    setOpen(false);
  }

  return (
    <div className="inline-search">
      <div className="inline-search-input-wrap">
        <input
          className="inline-search-input"
          type="text"
          placeholder="🔍 빠른 검색..."
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          aria-label="글 검색"
        />
        {q && (
          <button className="inline-search-clear" type="button" onClick={() => setQ('')} aria-label="검색어 지우기">×</button>
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="inline-search-results" role="listbox">
          {results.map(p => (
            <li key={`${p.categorySlug}-${p.slug}`} role="option">
              <button type="button" className="inline-search-item" onClick={() => go(p)}>
                <span className="isr-badge">{p.categoryIcon}</span>
                <span className="isr-title">{p.displayTitle}</span>
                <span className="isr-date">{p.date}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && q.length >= 1 && results.length === 0 && (
        <div className="inline-search-empty">검색 결과가 없어요</div>
      )}
    </div>
  );
}

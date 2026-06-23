import Link from 'next/link';
import Sidebar from './Sidebar';

export default function SiteLayout({ children, categories, postsByCategory, totalCount }) {
  return (
    <div className="bg-wrapper">
      <div className="minihompy">
        {/* 헤더 */}
        <header className="site-header">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="logo-text">so0126의 TIL.zip</span>
            <span className="logo-sub">오늘 배운 것을 잊지 않기 위한 기록 🌊</span>
          </Link>
          <div className="header-right">
            <span className="stat">TOTAL {totalCount}</span>
            <a href="https://github.com/so0126/til" target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </header>

        {/* 본문 */}
        <div className="site-body">
          <Sidebar
            categories={categories}
            postsByCategory={postsByCategory}
            totalCount={totalCount}
          />
          <main className="content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

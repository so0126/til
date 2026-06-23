import MobileLayout from './MobileLayout';

export default function SiteLayout({ children, categories, postsByCategory, stats, totalPostCount, latestDate }) {
  return (
    <MobileLayout
      categories={categories}
      postsByCategory={postsByCategory}
      stats={stats}
      totalPostCount={totalPostCount}
      latestDate={latestDate}
    >
      {children}
    </MobileLayout>
  );
}

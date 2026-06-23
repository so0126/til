import MobileLayout from './MobileLayout';

export default function SiteLayout({ children, categories, postsByCategory, totalPostCount, latestDate }) {
  return (
    <MobileLayout
      categories={categories}
      postsByCategory={postsByCategory}
      totalPostCount={totalPostCount}
      latestDate={latestDate}
    >
      {children}
    </MobileLayout>
  );
}

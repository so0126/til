import { getAllPosts, getPostsByCategory, getSiteStats, CATEGORIES } from '@/lib/posts';
import SiteLayout from '@/components/SiteLayout';
import HomeClient from '@/components/HomeClient';
import StatsSection from '@/components/StatsSection';

export default function HomePage() {
  const posts = getAllPosts();
  const postsByCategory = getPostsByCategory();
  const stats = getSiteStats(posts);

  return (
    <SiteLayout
      categories={CATEGORIES}
      postsByCategory={postsByCategory}
      totalPostCount={posts.length}
      latestDate={stats.latestDate}
    >
      <HomeClient posts={posts} categories={CATEGORIES} />
      <StatsSection stats={stats} />
    </SiteLayout>
  );
}

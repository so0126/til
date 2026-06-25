import { getAllPosts, getPostsByCategory, getSiteStats, CATEGORIES } from '@/lib/posts';
import SiteLayout from '@/components/SiteLayout';
import HomeClient from '@/components/HomeClient';

export default function HomePage() {
  const posts = getAllPosts();
  const postsByCategory = getPostsByCategory();
  const stats = getSiteStats(posts);

  return (
    <SiteLayout
      categories={CATEGORIES}
      postsByCategory={postsByCategory}
      stats={stats}
      totalPostCount={posts.length}
      latestDate={stats.latestDate}
    >
      <HomeClient posts={posts} categories={CATEGORIES} stats={stats} />
    </SiteLayout>
  );
}

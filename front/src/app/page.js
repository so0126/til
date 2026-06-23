import { getAllPosts, getPostsByCategory, CATEGORIES } from '@/lib/posts';
import SiteLayout from '@/components/SiteLayout';
import HomeClient from '@/components/HomeClient';

export default function HomePage() {
  const posts = getAllPosts();
  const postsByCategory = getPostsByCategory();
  const latestDate = posts[0]?.date || '';

  return (
    <SiteLayout
      categories={CATEGORIES}
      postsByCategory={postsByCategory}
      totalPostCount={posts.length}
      latestDate={latestDate}
    >
      <HomeClient posts={posts} categories={CATEGORIES} />
    </SiteLayout>
  );
}

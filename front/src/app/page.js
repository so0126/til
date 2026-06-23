import { getAllPosts, getPostsByCategory, CATEGORIES } from '@/lib/posts';
import SiteLayout from '@/components/SiteLayout';
import HomeClient from '@/components/HomeClient';

export default function HomePage() {
  const posts = getAllPosts();
  const postsByCategory = getPostsByCategory();

  return (
    <SiteLayout
      categories={CATEGORIES}
      postsByCategory={postsByCategory}
      totalCount={posts.length}
    >
      <HomeClient posts={posts} categories={CATEGORIES} />
    </SiteLayout>
  );
}

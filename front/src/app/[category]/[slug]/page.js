import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostContent, getAllPosts, getPostsByCategory, CATEGORIES } from '@/lib/posts';
import SiteLayout from '@/components/SiteLayout';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(p => ({ category: p.categorySlug, slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPostContent(params.category, params.slug);
  if (!post) return { title: '404' };
  return { title: `${post.displayTitle} | so0126의 TIL` };
}

export default async function PostPage({ params }) {
  const post = await getPostContent(params.category, params.slug);
  if (!post) notFound();

  const postsByCategory = getPostsByCategory();
  const totalCount = getAllPosts().length;

  return (
    <SiteLayout
      categories={CATEGORIES}
      postsByCategory={postsByCategory}
      totalCount={totalCount}
    >
      <article>
        <div className="post-header">
          <div className="breadcrumb">
            <Link href="/">홈</Link> / {post.category} / {post.displayTitle}
          </div>
          <h1>{post.displayTitle}</h1>
          <div className="post-meta">
            {post.date && <span>📅 {post.date}</span>}
            <span>{post.categoryIcon} {post.category}</span>
          </div>
        </div>
        <div
          className="md-body"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
    </SiteLayout>
  );
}

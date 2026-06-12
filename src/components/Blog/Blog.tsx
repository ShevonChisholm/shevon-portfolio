import { getPublishedBlogPosts } from "@/lib/cms/public-blog";
import { withPublicFallback } from "@/lib/cms/public-safe";
import BlogClient from "./BlogClient";

export default async function Blog() {
  const posts = await withPublicFallback("blog posts", getPublishedBlogPosts, []);

  return <BlogClient posts={posts} />;
}

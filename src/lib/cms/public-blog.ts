import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types/cms";
import { publicMediaUrl } from "@/lib/cms/media-url";

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  tags: string[];
  authorName: string;
  readingTime: string;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
};

function calculateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function mapToPublicBlogPost(post: BlogPost): PublicBlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content,
    coverImageUrl: post.cover_image_url
      ? publicMediaUrl(post.cover_image_url)
      : null,
    tags: post.tags ?? [],
    authorName: post.author_name ?? "Shevon Chisholm",
    readingTime: post.reading_time ?? calculateReadingTime(post.content),
    seoTitle: post.seo_title,
    seoDescription: post.seo_description,
    publishedAt: post.published_at,
    createdAt: post.created_at,
  };
}

export async function getPublishedBlogPosts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as BlogPost[]).map(mapToPublicBlogPost);
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapToPublicBlogPost(data as BlogPost);
}

import type { Metadata } from "next";
import { Box } from "@mui/material";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer/Footer";
import { getPublishedBlogPostBySlug } from "@/lib/cms/public-blog";
import BlogPostContent from "./BlogPostContent";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getPublishedBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  const description = post.seoDescription ?? post.excerpt;

  return {
    title: post.seoTitle ?? post.title,
    description,
    openGraph: {
      title: post.seoTitle ?? post.title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPublishedBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <Box>
      <BlogPostContent post={post} />
      <Footer />
    </Box>
  );
}

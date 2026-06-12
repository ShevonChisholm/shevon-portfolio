import type { Metadata } from "next";
import { Box } from "@mui/material";
import Footer from "@/components/Footer/Footer";
import BlogClient from "@/components/Blog/BlogClient";
import { getPublishedBlogPosts } from "@/lib/cms/public-blog";
import { withPublicFallback } from "@/lib/cms/public-safe";

export const metadata: Metadata = {
  title: "Blog | Shevon Chisholm",
  description:
    "Articles and notes from Shevon Chisholm on full-stack software development, mobile apps, APIs, and production engineering.",
};

export default async function BlogPage() {
  const posts = await withPublicFallback("blog posts", getPublishedBlogPosts, []);

  return (
    <Box>
      <Box component="main" sx={{ pt: { xs: 8, md: 10 } }}>
        <BlogClient posts={posts} />
      </Box>
      <Footer />
    </Box>
  );
}

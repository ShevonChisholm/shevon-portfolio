import { blogPosts } from "@/data/blogPosts";
import { notFound } from "next/navigation";
import NextJsGuide from "@/components/blog-posts/NextJsGuide";
import ReactNativeExpo from "@/components/blog-posts/ReactNativeExpo";
import BackendDevelopment from "@/components/blog-posts/BackendDevelopment";
import TypeScriptPatterns from "@/components/blog-posts/TypeScriptPatterns";
import BlogPostContent from "./BlogPostContent";

const components = {
  "nextjs-guide": NextJsGuide,
  "react-native-expo": ReactNativeExpo,
  "backend-development": BackendDevelopment,
  "typescript-react": TypeScriptPatterns,
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return notFound();
  }

  const BlogComponent = components[params.slug as keyof typeof components];

  if (!BlogComponent) {
    return notFound();
  }

  return (
    <BlogPostContent post={post}>
      <BlogComponent />
    </BlogPostContent>
  );
}

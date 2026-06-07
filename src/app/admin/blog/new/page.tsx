"use client";

import { useRouter } from "next/navigation";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import { createBlogPost, type QueuedBlogMedia } from "@/lib/cms/blog";
import type { BlogPostFormValues } from "@/types/cms";
import { emptyBlogPostFormValues } from "@/types/cms";

export default function NewBlogPostPage() {
  const router = useRouter();

  const handleSubmit = async (
    values: BlogPostFormValues,
    queuedMedia: QueuedBlogMedia
  ) => {
    const result = await createBlogPost(values, queuedMedia);
    const warningParam = result.warning
      ? `?warning=${encodeURIComponent(result.warning)}`
      : "";

    router.push(`/admin/blog/${result.id}/edit${warningParam}`);
    router.refresh();

    return result;
  };

  return (
    <BlogPostForm
      initialValues={emptyBlogPostFormValues}
      mode="create"
      onSubmit={handleSubmit}
    />
  );
}

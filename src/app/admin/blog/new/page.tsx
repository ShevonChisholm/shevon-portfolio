"use client";

import { useRouter } from "next/navigation";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import { useAdminNotifications } from "@/components/admin/notifications/AdminNotifications";
import { createBlogPost, type QueuedBlogMedia } from "@/lib/cms/blog";
import type { BlogPostFormValues } from "@/types/cms";
import { emptyBlogPostFormValues } from "@/types/cms";

export default function NewBlogPostPage() {
  const router = useRouter();
  const { enqueueNotification } = useAdminNotifications();

  const handleSubmit = async (
    values: BlogPostFormValues,
    queuedMedia: QueuedBlogMedia
  ) => {
    const result = await createBlogPost(values, queuedMedia);
    const warningParam = result.warning
      ? `?warning=${encodeURIComponent(result.warning)}`
      : "";

    enqueueNotification(result.warning ?? "Blog post created.", {
      variant: result.warning ? "warning" : "success",
    });
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

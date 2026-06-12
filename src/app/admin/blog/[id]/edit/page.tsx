"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, CircularProgress, Stack } from "@mui/material";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import {
  blogPostToFormValues,
  getBlogPost,
  updateBlogPost,
  updateBlogPostSection,
} from "@/lib/cms/blog";
import type { BlogFormSection } from "@/lib/cms/blog";
import type { BlogPostFormValues } from "@/types/cms";

type Message = {
  type: "error" | "warning";
  text: string;
} | null;

export default function EditBlogPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<BlogPostFormValues | null>(
    null
  );
  const [message, setMessage] = useState<Message>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      const warning = new URLSearchParams(window.location.search).get("warning");

      setIsLoading(true);
      setMessage(warning ? { type: "warning", text: warning } : null);

      try {
        const post = await getBlogPost(params.id);

        if (!post) {
          setMessage({ type: "error", text: "Blog post not found." });
          return;
        }

        setInitialValues(blogPostToFormValues(post));
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error ? error.message : "Unable to load blog post.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadPost();
  }, [params.id]);

  const handleSubmit = async (values: BlogPostFormValues) => {
    await updateBlogPost(params.id, values);
    router.refresh();
  };

  const handleSaveSection = async (
    section: BlogFormSection,
    values: BlogPostFormValues
  ) => {
    await updateBlogPostSection(params.id, section, values);
    router.refresh();
  };

  if (isLoading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress color="primary" />
      </Stack>
    );
  }

  if (message?.type === "error") {
    return <Alert severity={message.type}>{message.text}</Alert>;
  }

  if (!initialValues) {
    return <Alert severity="error">Blog post not found.</Alert>;
  }

  return (
    <Stack spacing={2}>
      {message && <Alert severity={message.type}>{message.text}</Alert>}
      <BlogPostForm
        initialValues={initialValues}
        mode="edit"
        postId={params.id}
        onSubmit={handleSubmit}
        onSaveSection={handleSaveSection}
      />
    </Stack>
  );
}

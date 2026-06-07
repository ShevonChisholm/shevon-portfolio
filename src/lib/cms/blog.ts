import { adminDataRequest, type AdminFilter } from "@/lib/cms/admin-api";
import { uploadCmsMedia } from "@/lib/cms/storage";
import type { BlogPost, BlogPostFormValues } from "@/types/cms";
import { emptyBlogPostFormValues } from "@/types/cms";

export type BlogPostFilter = "all" | "published" | "drafts";

export type QueuedBlogMedia = {
  coverImage?: File | null;
};

export type BlogMutationResult = {
  id: string;
  warning?: string;
};

const nullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const requiredString = (value: string) => value.trim();

export function normalizeBlogSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function dateTimeLocalToIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function isoToDateTimeLocal(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function blogPostPayload(values: BlogPostFormValues) {
  const readingTime =
    nullableString(values.reading_time) ?? calculateReadingTime(values.content);
  const publishedAt =
    values.is_published && !values.published_at
      ? new Date().toISOString()
      : dateTimeLocalToIso(values.published_at);

  return {
    title: requiredString(values.title),
    slug: requiredString(values.slug),
    excerpt: nullableString(values.excerpt),
    content: requiredString(values.content),
    cover_image_url: nullableString(values.cover_image_url),
    tags: parseTags(values.tags),
    author_name: nullableString(values.author_name),
    reading_time: readingTime,
    seo_title: nullableString(values.seo_title),
    seo_description: nullableString(values.seo_description),
    published_at: publishedAt,
    is_published: values.is_published,
  };
}

export async function listBlogPosts(filter: BlogPostFilter = "all") {
  const filters: AdminFilter[] =
    filter === "published"
      ? [{ column: "is_published", value: true }]
      : filter === "drafts"
        ? [{ column: "is_published", value: false }]
        : [];
  return adminDataRequest<BlogPost[]>({
    table: "blog_posts",
    action: "select",
    filters,
    orders: [{ column: "created_at", ascending: false }],
  });
}

export async function getBlogPost(id: string) {
  return adminDataRequest<BlogPost | null>({
    table: "blog_posts",
    action: "select",
    filters: [{ column: "id", value: id }],
    single: "maybeSingle",
  });
}

export async function createBlogPost(
  values: BlogPostFormValues,
  queuedMedia: QueuedBlogMedia = {}
): Promise<BlogMutationResult> {
  const insertValues = {
    ...values,
    cover_image_url: queuedMedia.coverImage ? "" : values.cover_image_url,
  };
  const data = await adminDataRequest<{ id: string; slug: string | null }>({
    table: "blog_posts",
    action: "insert",
    values: blogPostPayload(insertValues),
    select: "id, slug",
    single: "single",
  });
  if (!data?.id) throw new Error("Blog post was created without an id.");

  const postId = data.id as string;
  const postSlug = (data.slug as string | null) || values.slug;
  const warnings: string[] = [];

  if (queuedMedia.coverImage) {
    try {
      const result = await uploadCmsMedia({
        file: queuedMedia.coverImage,
        kind: "blog-cover",
        postSlug,
      });
      await adminDataRequest({
        table: "blog_posts",
        action: "update",
        values: { cover_image_url: result.publicUrl },
        filters: [{ column: "id", value: postId }],
      });
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? `Cover image failed to upload: ${error.message}`
          : "Cover image failed to upload."
      );
    }
  }

  return {
    id: postId,
    warning: warnings.length ? warnings.join(" ") : undefined,
  };
}

export async function updateBlogPost(id: string, values: BlogPostFormValues) {
  await adminDataRequest({
    table: "blog_posts",
    action: "update",
    values: blogPostPayload(values),
    filters: [{ column: "id", value: id }],
  });
}

export async function deleteBlogPost(id: string) {
  await adminDataRequest({
    table: "blog_posts",
    action: "delete",
    filters: [{ column: "id", value: id }],
  });
}

export async function updateBlogPostPublished(
  post: Pick<BlogPost, "id" | "is_published" | "published_at">,
  isPublished: boolean
) {
  await adminDataRequest({
    table: "blog_posts",
    action: "update",
    values: {
      is_published: isPublished,
      published_at:
        isPublished && !post.published_at ? new Date().toISOString() : post.published_at,
    },
    filters: [{ column: "id", value: post.id }],
  });
}

export function blogPostToFormValues(
  post?: BlogPost | null
): BlogPostFormValues {
  if (!post) return { ...emptyBlogPostFormValues };

  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content,
    cover_image_url: post.cover_image_url ?? "",
    tags: (post.tags ?? []).join(", "),
    author_name: post.author_name ?? "",
    reading_time: post.reading_time ?? "",
    seo_title: post.seo_title ?? "",
    seo_description: post.seo_description ?? "",
    published_at: isoToDateTimeLocal(post.published_at),
    is_published: post.is_published,
  };
}

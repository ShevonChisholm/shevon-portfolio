"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import MediaUploadField from "@/components/admin/media/MediaUploadField";
import SectionSaveButton from "@/components/admin/SectionSaveButton";
import { AdminNotificationBridge } from "@/components/admin/notifications/AdminNotifications";
import type {
  BlogFormSection,
  BlogMutationResult,
  QueuedBlogMedia,
} from "@/lib/cms/blog";
import {
  calculateReadingTime,
  normalizeBlogSlug,
} from "@/lib/cms/blog";
import type { BlogPostFormValues } from "@/types/cms";

type BlogPostFormProps = {
  initialValues: BlogPostFormValues;
  mode: "create" | "edit";
  postId?: string;
  onSubmit: (
    values: BlogPostFormValues,
    queuedMedia: QueuedBlogMedia
  ) => Promise<BlogMutationResult | void>;
  onSaveSection?: (
    section: BlogFormSection,
    values: BlogPostFormValues
  ) => Promise<void>;
};

type Message = {
  type: "success" | "error" | "warning";
  text: string;
} | null;

function blogSectionSnapshot(section: BlogFormSection, values: BlogPostFormValues) {
  return JSON.stringify(
    section === "details"
      ? {
          title: values.title,
          slug: values.slug,
          excerpt: values.excerpt,
          content: values.content,
          tags: values.tags,
          author_name: values.author_name,
          reading_time: values.reading_time,
          published_at: values.published_at,
          is_published: values.is_published,
        }
      : {
          cover_image_url: values.cover_image_url,
          seo_title: values.seo_title,
          seo_description: values.seo_description,
        }
  );
}

export default function BlogPostForm({
  initialValues,
  mode,
  postId,
  onSubmit,
  onSaveSection,
}: BlogPostFormProps) {
  const theme = useTheme();
  const [values, setValues] = useState<BlogPostFormValues>(initialValues);
  const [queuedMedia, setQueuedMedia] = useState<QueuedBlogMedia>({
    coverImage: null,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues.slug));
  const [message, setMessage] = useState<Message>(null);
  const [isPending, startTransition] = useTransition();
  const [savingSection, setSavingSection] = useState<BlogFormSection | null>(null);
  const [savedSnapshots, setSavedSnapshots] = useState<
    Record<BlogFormSection, string>
  >({
    details: blogSectionSnapshot("details", initialValues),
    cover_seo: blogSectionSnapshot("cover_seo", initialValues),
  });
  const pageTitle = mode === "create" ? "New Blog Post" : "Edit Blog Post";
  const submitLabel = mode === "create" ? "Create Post" : "Save Post";
  const postSlug = values.slug || normalizeBlogSlug(values.title) || "untitled-post";
  const cardSx = useMemo(
    () => ({
      border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
      backgroundColor: alpha(theme.palette.background.paper, 0.82),
    }),
    [theme]
  );

  const updateValue = <K extends keyof BlogPostFormValues>(
    key: K,
    value: BlogPostFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleTitleChange = (title: string) => {
    setValues((current) => ({
      ...current,
      title,
      slug:
        mode === "create" && !slugTouched
          ? normalizeBlogSlug(title)
          : current.slug,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await onSubmit(values, mode === "create" ? queuedMedia : {});
        if (mode === "edit") {
          setSavedSnapshots({
            details: blogSectionSnapshot("details", values),
            cover_seo: blogSectionSnapshot("cover_seo", values),
          });
          setMessage({
            type: result?.warning ? "warning" : "success",
            text: result?.warning ?? "Blog post saved.",
          });
        }
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error ? error.message : "Unable to save blog post.",
        });
      }
    });
  };

  const saveSection = (section: BlogFormSection) => {
    if (!onSaveSection) return;
    if (
      section === "details" &&
      (!values.title.trim() || !values.slug.trim() || !values.content.trim())
    ) {
      setMessage({
        type: "error",
        text: "Title, slug, and content are required before saving Post Details.",
      });
      return;
    }

    setSavingSection(section);
    setMessage(null);

    startTransition(async () => {
      try {
        await onSaveSection(section, values);
        setSavedSnapshots((current) => ({
          ...current,
          [section]: blogSectionSnapshot(section, values),
        }));
        setMessage({
          type: "success",
          text: section === "details" ? "Post details saved." : "Cover and SEO saved.",
        });
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error ? error.message : "Unable to save this section.",
        });
      } finally {
        setSavingSection(null);
      }
    });
  };

  const sectionSaveButton = (section: BlogFormSection) =>
    mode === "edit" && onSaveSection ? (
      <SectionSaveButton
        dirty={savedSnapshots[section] !== blogSectionSnapshot(section, values)}
        saving={savingSection === section}
        disabled={Boolean(savingSection)}
        onClick={() => saveSection(section)}
      />
    ) : null;

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={Link}
          href="/admin/blog"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 1, px: 0 }}
        >
          Back to Blog
        </Button>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
          {pageTitle}
        </Typography>
      </Box>

      <AdminNotificationBridge message={message} />
      {message && <Alert severity={message.type}>{message.text}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Card elevation={0} sx={cardSx}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Post Details
                  </Typography>
                  {sectionSaveButton("details")}
                </Stack>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Title"
                      value={values.title}
                      onChange={(event) => handleTitleChange(event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Slug"
                      value={values.slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        updateValue("slug", normalizeBlogSlug(event.target.value));
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Excerpt"
                      helperText="Short summary used in blog cards and SEO fallback."
                      value={values.excerpt}
                      onChange={(event) => updateValue("excerpt", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      minRows={14}
                      label="Content"
                      helperText="Markdown-style writing is supported for headings, bullet lists, numbered lists, blockquotes, and paragraphs."
                      value={values.content}
                      onChange={(event) => updateValue("content", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Tags"
                      helperText="Comma-separated, for example: Next.js, React, TypeScript"
                      value={values.tags}
                      onChange={(event) => updateValue("tags", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Author name"
                      value={values.author_name}
                      onChange={(event) =>
                        updateValue("author_name", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Reading time"
                      helperText="Leave blank to auto-calculate."
                      value={values.reading_time}
                      onChange={(event) =>
                        updateValue("reading_time", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AutoFixHighOutlinedIcon />}
                      sx={{ minHeight: 56 }}
                      onClick={() =>
                        updateValue("reading_time", calculateReadingTime(values.content))
                      }
                    >
                      Calculate
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      label="Published at"
                      helperText="Set automatically when publishing if empty."
                      value={values.published_at}
                      onChange={(event) =>
                        updateValue("published_at", event.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.is_published}
                          onChange={(event) =>
                            updateValue("is_published", event.target.checked)
                          }
                        />
                      }
                      label="Published"
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} sx={cardSx}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Cover Image & SEO
                  </Typography>
                  {sectionSaveButton("cover_seo")}
                </Stack>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <MediaUploadField
                      label="Cover image URL"
                      value={values.cover_image_url}
                      uploadKind="blog-cover"
                      mode={mode}
                      uploadOnSelect={mode === "edit"}
                      queuedFile={queuedMedia.coverImage ?? null}
                      onFileQueued={(file) =>
                        setQueuedMedia((current) => ({
                          ...current,
                          coverImage: file,
                        }))
                      }
                      postSlug={postSlug}
                      persistOnUpload={mode === "edit"}
                      table="blog_posts"
                      field="cover_image_url"
                      entityId={postId}
                      helperText="Upload or paste a cover image URL. Create mode queues the file until the post exists."
                      previewLabel="Blog cover image"
                      uploadButtonLabel="Upload cover"
                      onChange={(value) => updateValue("cover_image_url", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="SEO title"
                        value={values.seo_title}
                        onChange={(event) =>
                          updateValue("seo_title", event.target.value)
                        }
                      />
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="SEO description"
                        value={values.seo_description}
                        onChange={(event) =>
                          updateValue("seo_description", event.target.value)
                        }
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              position: "sticky",
              bottom: 0,
              zIndex: 4,
              justifyContent: "flex-end",
              p: 1.5,
              borderRadius: 1.5,
              backgroundColor: alpha(theme.palette.background.default, 0.94),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              backdropFilter: "blur(12px)",
            }}
          >
            <Button component={Link} href="/admin/blog" variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              disabled={isPending}
            >
              {isPending ? "Saving..." : submitLabel}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}

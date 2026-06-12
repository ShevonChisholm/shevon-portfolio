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
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import MediaUploadField from "@/components/admin/media/MediaUploadField";
import SectionSaveButton from "@/components/admin/SectionSaveButton";
import { AdminNotificationBridge } from "@/components/admin/notifications/AdminNotifications";
import type {
  ProjectMutationResult,
  ProjectFormSection,
  QueuedProjectMedia,
} from "@/lib/cms/projects";
import type { VideoUploadStatus } from "@/lib/cms/video-compression";
import type {
  ProjectCategory,
  ProjectFormValues,
  ProjectImageType,
  ProjectTagType,
  ProjectType,
  ProjectVideoType,
} from "@/types/cms";

type ProjectFormProps = {
  initialValues: ProjectFormValues;
  mode: "create" | "edit";
  projectId?: string;
  onSubmit: (
    values: ProjectFormValues,
    queuedMedia: QueuedProjectMedia
  ) => Promise<ProjectMutationResult | void>;
  onSaveSection?: (
    section: ProjectFormSection,
    values: ProjectFormValues
  ) => Promise<void>;
};

type Message = {
  type: "success" | "error" | "warning";
  text: string;
} | null;

const projectCategories: ProjectCategory[] = ["Web Apps", "Mobile Apps"];
const projectTypes: ProjectType[] = [
  "client",
  "personal",
  "internal",
  "open-source",
  "case-study",
];
const tagTypes: ProjectTagType[] = [
  "tech",
  "industry",
  "feature",
  "tool",
  "platform",
];
const imageTypes: ProjectImageType[] = [
  "cover",
  "gallery",
  "mobile_screen",
  "feature",
  "architecture",
  "logo",
];
const videoTypes: { value: ProjectVideoType; label: string }[] = [
  { value: "website_walkthrough", label: "Website Walkthrough" },
  { value: "admin_cms_walkthrough", label: "Admin CMS Walkthrough" },
  { value: "mobile_experience", label: "Mobile Experience" },
  { value: "technical_backend", label: "Technical / Backend Demonstration" },
  { value: "demo", label: "General Demo" },
  { value: "other", label: "Other" },
];

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ordered<T extends { sort_order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

function projectSectionSnapshot(
  section: ProjectFormSection,
  values: ProjectFormValues
) {
  const sectionValues = {
    core: {
      title: values.title,
      slug: values.slug,
      short_description: values.short_description,
      description: values.description,
      category: values.category,
      project_type: values.project_type,
      client_name: values.client_name,
      is_client_project: values.is_client_project,
      role: values.role,
      status: values.status,
      impact: values.impact,
      started_at: values.started_at,
      completed_at: values.completed_at,
      sort_order: values.sort_order,
      is_featured: values.is_featured,
      is_published: values.is_published,
    },
    media: {
      image_url: values.image_url,
      site_url: values.site_url,
      github_url: values.github_url,
      demo_url: values.demo_url,
      video_url: values.video_url,
      case_study_url: values.case_study_url,
    },
    videos: ordered(values.videos),
    seo: {
      seo_title: values.seo_title,
      seo_description: values.seo_description,
    },
    tags: ordered(values.tags),
    images: ordered(values.images),
    highlights: ordered(values.highlights),
    technical_focus: ordered(values.technical_focus),
  };

  return JSON.stringify(sectionValues[section]);
}

export default function ProjectForm({
  initialValues,
  mode,
  projectId,
  onSubmit,
  onSaveSection,
}: ProjectFormProps) {
  const theme = useTheme();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<Message>(null);
  const [activeMediaTasks, setActiveMediaTasks] = useState(0);
  const [legacyVideoUploadStatus, setLegacyVideoUploadStatus] =
    useState<VideoUploadStatus | null>(null);
  const [videoUploadStatuses, setVideoUploadStatuses] = useState<
    Record<number, VideoUploadStatus | null>
  >({});
  const [queuedMedia, setQueuedMedia] = useState<QueuedProjectMedia>({
    coverImage: null,
    video: null,
    caseStudyDocument: null,
    galleryImages: initialValues.images.map(() => null),
    videos: initialValues.videos.map(() => ({
      videoFile: null,
      thumbnailFile: null,
    })),
  });
  const [values, setValues] = useState<ProjectFormValues>({
    ...initialValues,
    tags: ordered(initialValues.tags),
    images: ordered(initialValues.images),
    videos: ordered(initialValues.videos),
    highlights: ordered(initialValues.highlights),
    technical_focus: ordered(initialValues.technical_focus),
  });
  const [savedSectionSnapshots, setSavedSectionSnapshots] = useState<
    Partial<Record<ProjectFormSection, string>>
  >(() =>
    Object.fromEntries(
      (
        [
          "core",
          "media",
          "videos",
          "seo",
          "tags",
          "images",
          "highlights",
          "technical_focus",
        ] as ProjectFormSection[]
      ).map((section) => [section, projectSectionSnapshot(section, initialValues)])
    )
  );
  const [savingSection, setSavingSection] =
    useState<ProjectFormSection | null>(null);

  const pageTitle = mode === "create" ? "New Project" : "Edit Project";
  const submitLabel = mode === "create" ? "Create Project" : "Save Project";
  const projectSlug = values.slug || normalizeSlug(values.title) || "untitled-project";

  const sectionCardSx = useMemo(
    () => ({
      border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
      backgroundColor: alpha(theme.palette.background.paper, 0.82),
    }),
    [theme]
  );

  const updateValue = <K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const updateQueuedGalleryFile = (index: number, file: File | null) => {
    setQueuedMedia((current) => {
      const galleryImages = [...(current.galleryImages ?? [])];
      galleryImages[index] = file;
      return { ...current, galleryImages };
    });
  };

  const updateQueuedVideoFile = (
    index: number,
    field: "videoFile" | "thumbnailFile",
    file: File | null
  ) => {
    setQueuedMedia((current) => {
      const videos = [...(current.videos ?? [])];
      videos[index] = {
        ...videos[index],
        [field]: file,
        ...(field === "videoFile"
          ? {
              videoStatus: file
                ? (status: VideoUploadStatus | null) =>
                    setVideoUploadStatuses((statuses) => ({
                      ...statuses,
                      [index]: status,
                    }))
                : undefined,
            }
          : {}),
      };
      return { ...current, videos };
    });

    if (field === "videoFile" && !file) {
      setVideoUploadStatuses((statuses) => ({ ...statuses, [index]: null }));
    }
  };

  const handleMediaBusyChange = (busy: boolean) => {
    setActiveMediaTasks((current) => Math.max(0, current + (busy ? 1 : -1)));
  };

  const isSectionDirty = (section: ProjectFormSection) =>
    savedSectionSnapshots[section] !== projectSectionSnapshot(section, values);

  const handleSaveSection = async (section: ProjectFormSection) => {
    if (!onSaveSection || activeMediaTasks > 0) return;

    if (
      section === "core" &&
      (!values.title.trim() || !values.slug.trim() || !values.description.trim())
    ) {
      setMessage({
        type: "error",
        text: "Title, slug, and description are required before saving Core Details.",
      });
      return;
    }

    if (
      section === "videos" &&
      values.videos.some(
        (video) =>
          (video.title.trim() && !video.video_url.trim()) ||
          (!video.title.trim() && video.video_url.trim())
      )
    ) {
      setMessage({
        type: "error",
        text: "Each project video needs both a title and a video URL before saving.",
      });
      return;
    }

    setSavingSection(section);
    setMessage(null);
    try {
      await onSaveSection(section, values);
      setSavedSectionSnapshots((current) => ({
        ...current,
        [section]: projectSectionSnapshot(section, values),
      }));
      setMessage({
        type: "success",
        text: `${section.replace("_", " ")} section saved.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : `Unable to save ${section.replace("_", " ")}.`,
      });
    } finally {
      setSavingSection(null);
    }
  };

  const sectionSaveButton = (section: ProjectFormSection) =>
    mode === "edit" && onSaveSection ? (
      <SectionSaveButton
        dirty={isSectionDirty(section)}
        saving={savingSection === section}
        disabled={Boolean(savingSection) || activeMediaTasks > 0}
        onClick={() => void handleSaveSection(section)}
      />
    ) : null;

  const queuedMediaForSubmit =
    mode === "create"
      ? queuedMedia
      : {
          coverImage: null,
          video: null,
          caseStudyDocument: null,
          galleryImages: [],
          videos: [],
        };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (activeMediaTasks > 0) {
      setMessage({
        type: "warning",
        text: "Please wait for the current video upload to finish before saving.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await onSubmit({
          ...values,
          tags: ordered(values.tags),
          images: values.images,
          videos: ordered(values.videos),
          highlights: ordered(values.highlights),
          technical_focus: ordered(values.technical_focus),
        }, queuedMediaForSubmit);
        if (mode === "edit") {
          setSavedSectionSnapshots(
            Object.fromEntries(
              (
                [
                  "core",
                  "media",
                  "videos",
                  "seo",
                  "tags",
                  "images",
                  "highlights",
                  "technical_focus",
                ] as ProjectFormSection[]
              ).map((section) => [section, projectSectionSnapshot(section, values)])
            )
          );
          setMessage({
            type: result?.warning ? "warning" : "success",
            text: result?.warning ?? "Project saved.",
          });
        }
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to save this project.",
        });
      }
    });
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={Link}
          href="/admin/projects"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 1, px: 0 }}
        >
          Back to Projects
        </Button>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
          {pageTitle}
        </Typography>
      </Box>

      <AdminNotificationBridge message={message} />
      {message && <Alert severity={message.type}>{message.text}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Card elevation={0} sx={sectionCardSx}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Core Details
                  </Typography>
                  {sectionSaveButton("core")}
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: -2 }}>
                  Basic project information used for the admin list, project URL,
                  filtering, and display order.
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Title"
                      helperText="The public-facing project name."
                      value={values.title}
                      onChange={(event) => updateValue("title", event.target.value)}
                      onBlur={() => {
                        if (!values.slug.trim()) {
                          updateValue("slug", normalizeSlug(values.title));
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Slug"
                      helperText="Used in URLs and media folder paths."
                      value={values.slug}
                      onChange={(event) =>
                        updateValue("slug", normalizeSlug(event.target.value))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      select
                      label="Category"
                      helperText="High-level portfolio grouping."
                      value={values.category}
                      onChange={(event) =>
                        updateValue("category", event.target.value as ProjectCategory)
                      }
                    >
                      {projectCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      select
                      label="Project type"
                      helperText="Describes ownership or origin of the work."
                      value={values.project_type}
                      onChange={(event) =>
                        updateValue("project_type", event.target.value as ProjectType)
                      }
                    >
                      {projectTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Sort order"
                      helperText="Lower numbers appear first."
                      value={values.sort_order}
                      onChange={(event) =>
                        updateValue("sort_order", Number(event.target.value))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Client name"
                      helperText="Optional; use when the project belongs to a client."
                      value={values.client_name}
                      onChange={(event) =>
                        updateValue("client_name", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Status"
                      helperText="Short lifecycle label, such as Production or In progress."
                      value={values.status}
                      onChange={(event) => updateValue("status", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Short description"
                      helperText="Brief summary for cards, lists, and previews."
                      value={values.short_description}
                      onChange={(event) =>
                        updateValue("short_description", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      minRows={5}
                      label="Description"
                      helperText="Full project overview for the future detail page."
                      value={values.description}
                      onChange={(event) =>
                        updateValue("description", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Role"
                      helperText="Your responsibilities on the project."
                      value={values.role}
                      onChange={(event) => updateValue("role", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Impact"
                      helperText="Business, user, or technical outcome of the project."
                      value={values.impact}
                      onChange={(event) => updateValue("impact", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Started at"
                      helperText="Optional project start date."
                      value={values.started_at}
                      onChange={(event) =>
                        updateValue("started_at", event.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Completed at"
                      helperText="Optional completion or launch date."
                      value={values.completed_at}
                      onChange={(event) =>
                        updateValue("completed_at", event.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.is_client_project}
                            onChange={(event) =>
                              updateValue("is_client_project", event.target.checked)
                            }
                          />
                        }
                        label="Client project"
                      />
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
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.is_featured}
                            onChange={(event) =>
                              updateValue("is_featured", event.target.checked)
                            }
                          />
                        }
                        label="Featured"
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} sx={sectionCardSx}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Primary Media & Links
                  </Typography>
                  {sectionSaveButton("media")}
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: -2 }}>
                  Use this section for the main cover visual and top-level external
                  links. Showcase images are managed separately below.
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <MediaUploadField
                      label="Main cover image URL"
                      value={values.image_url}
                      uploadKind="project-cover"
                      mode={mode}
                      uploadOnSelect={mode === "edit"}
                      queuedFile={queuedMedia.coverImage ?? null}
                      onFileQueued={(file) =>
                        setQueuedMedia((current) => ({
                          ...current,
                          coverImage: file,
                        }))
                      }
                      projectSlug={projectSlug}
                      persistOnUpload={mode === "edit"}
                      table="projects"
                      field="image_url"
                      entityId={projectId}
                      helperText="Primary image for project cards, admin previews, and the future project hero. This is not the showcase gallery."
                      previewLabel="Main project cover"
                      uploadButtonLabel="Upload cover image"
                      onChange={(value) => updateValue("image_url", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <MediaUploadField
                      label="Legacy fallback video URL"
                      value={values.video_url}
                      uploadKind="project-video"
                      mode={mode}
                      uploadOnSelect={mode === "edit"}
                      queuedFile={queuedMedia.video ?? null}
                      onFileQueued={(file) => {
                        if (!file) setLegacyVideoUploadStatus(null);
                        setQueuedMedia((current) => ({
                          ...current,
                          video: file,
                          videoStatus: file
                            ? setLegacyVideoUploadStatus
                            : undefined,
                        }));
                      }}
                      uploadStatus={legacyVideoUploadStatus}
                      onBusyChange={handleMediaBusyChange}
                      projectSlug={projectSlug}
                      persistOnUpload={mode === "edit"}
                      table="projects"
                      field="video_url"
                      entityId={projectId}
                      helperText="Kept for older projects. Uploaded MP4/WebM files up to 100MB are compressed before upload; external URLs remain supported."
                      previewLabel="Legacy project video"
                      uploadButtonLabel="Upload fallback video"
                      onChange={(value) => updateValue("video_url", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Site URL"
                      helperText="Live production website or app link."
                      value={values.site_url}
                      onChange={(event) => updateValue("site_url", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="GitHub URL"
                      helperText="Repository link, when it can be shared."
                      value={values.github_url}
                      onChange={(event) =>
                        updateValue("github_url", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Demo URL"
                      helperText="Interactive demo, prototype, or preview environment."
                      value={values.demo_url}
                      onChange={(event) => updateValue("demo_url", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <MediaUploadField
                      label="Case study document URL"
                      value={values.case_study_url}
                      uploadKind="case-study-document"
                      mode={mode}
                      uploadOnSelect={mode === "edit"}
                      queuedFile={queuedMedia.caseStudyDocument ?? null}
                      onFileQueued={(file) =>
                        setQueuedMedia((current) => ({
                          ...current,
                          caseStudyDocument: file,
                        }))
                      }
                      projectSlug={projectSlug}
                      persistOnUpload={mode === "edit"}
                      table="projects"
                      field="case_study_url"
                      entityId={projectId}
                      helperText="Optional PDF or external URL for a deeper case study document."
                      previewLabel="Case study document"
                      uploadButtonLabel="Upload PDF"
                      onChange={(value) => updateValue("case_study_url", value)}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} sx={sectionCardSx}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between" }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Project Videos
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mt: 0.75 }}
                    >
                      Add focused walkthroughs so visitors can choose the part of
                      the project they want to see. Videos are displayed by sort
                      order.
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    {sectionSaveButton("videos")}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => {
                        updateValue("videos", [
                          ...values.videos,
                          {
                            title: "",
                            description: "",
                            video_url: "",
                            thumbnail_url: "",
                            video_type: "demo",
                            sort_order: values.videos.length,
                            is_published: true,
                          },
                        ]);
                        setQueuedMedia((current) => ({
                          ...current,
                          videos: [
                            ...(current.videos ?? []),
                            { videoFile: null, thumbnailFile: null },
                          ],
                        }));
                      }}
                    >
                      Add Video
                    </Button>
                  </Stack>
                </Stack>

                {values.videos.length === 0 && (
                  <Alert severity="info">
                    No dedicated videos yet. The legacy fallback video will be used
                    publicly when available.
                  </Alert>
                )}

                {values.videos.map((video, index) => (
                  <Card key={`video-${index}`} variant="outlined">
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center", justifyContent: "space-between" }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {video.title || `Video ${index + 1}`}
                          </Typography>
                          <IconButton
                            color="error"
                            onClick={() => {
                              updateValue(
                                "videos",
                                values.videos.filter(
                                  (_, itemIndex) => itemIndex !== index
                                )
                              );
                              setQueuedMedia((current) => ({
                                ...current,
                                videos: (current.videos ?? [])
                                  .filter((_, itemIndex) => itemIndex !== index)
                                  .map((item, nextIndex) => ({
                                    ...item,
                                    videoStatus: item.videoFile
                                      ? (status: VideoUploadStatus | null) =>
                                          setVideoUploadStatuses((statuses) => ({
                                            ...statuses,
                                            [nextIndex]: status,
                                          }))
                                      : undefined,
                                  })),
                              }));
                              setVideoUploadStatuses((statuses) =>
                                Object.fromEntries(
                                  Object.entries(statuses)
                                    .filter(([itemIndex]) => Number(itemIndex) !== index)
                                    .map(([itemIndex, status]) => [
                                      Number(itemIndex) > index
                                        ? Number(itemIndex) - 1
                                        : Number(itemIndex),
                                      status,
                                    ])
                                )
                              );
                            }}
                            aria-label={`Remove ${video.title || `video ${index + 1}`}`}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Stack>

                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 5 }}>
                            <TextField
                              fullWidth
                              required
                              label="Video title"
                              helperText="Example: Admin CMS Walkthrough."
                              value={video.title}
                              onChange={(event) => {
                                const next = [...values.videos];
                                next[index] = {
                                  ...video,
                                  title: event.target.value,
                                };
                                updateValue("videos", next);
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                              fullWidth
                              select
                              label="Video type"
                              helperText="Used as the public category label."
                              value={video.video_type}
                              onChange={(event) => {
                                const next = [...values.videos];
                                next[index] = {
                                  ...video,
                                  video_type: event.target.value as ProjectVideoType,
                                };
                                updateValue("videos", next);
                              }}
                            >
                              {videoTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                  {type.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Sort order"
                              helperText="Lower first"
                              value={video.sort_order}
                              onChange={(event) => {
                                const next = [...values.videos];
                                next[index] = {
                                  ...video,
                                  sort_order: Number(event.target.value),
                                };
                                updateValue("videos", next);
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={video.is_published}
                                  onChange={(event) => {
                                    const next = [...values.videos];
                                    next[index] = {
                                      ...video,
                                      is_published: event.target.checked,
                                    };
                                    updateValue("videos", next);
                                  }}
                                />
                              }
                              label="Published"
                              sx={{ mt: 0.5 }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              label="Description"
                              helperText="Briefly explain what visitors will see in this walkthrough."
                              value={video.description}
                              onChange={(event) => {
                                const next = [...values.videos];
                                next[index] = {
                                  ...video,
                                  description: event.target.value,
                                };
                                updateValue("videos", next);
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <MediaUploadField
                              label="Video URL"
                              value={video.video_url}
                              uploadKind="project-video"
                              mode={mode}
                              uploadOnSelect={mode === "edit"}
                              queuedFile={
                                queuedMedia.videos?.[index]?.videoFile ?? null
                              }
                              onFileQueued={(file) =>
                                updateQueuedVideoFile(index, "videoFile", file)
                              }
                              uploadStatus={videoUploadStatuses[index] ?? null}
                              onBusyChange={handleMediaBusyChange}
                              projectSlug={projectSlug}
                              helperText="Paste a YouTube, Vimeo, Loom, or direct URL, or upload an MP4/WebM up to 100MB. Uploaded files are compressed to a storage-safe MP4."
                              previewLabel={video.title || `Video ${index + 1}`}
                              uploadButtonLabel="Upload video"
                              onChange={(value) => {
                                const next = [...values.videos];
                                next[index] = { ...video, video_url: value };
                                updateValue("videos", next);
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <MediaUploadField
                              label="Thumbnail URL"
                              value={video.thumbnail_url}
                              uploadKind="project-video-thumbnail"
                              mode={mode}
                              uploadOnSelect={mode === "edit"}
                              queuedFile={
                                queuedMedia.videos?.[index]?.thumbnailFile ?? null
                              }
                              onFileQueued={(file) =>
                                updateQueuedVideoFile(index, "thumbnailFile", file)
                              }
                              projectSlug={projectSlug}
                              helperText="Optional preview image shown on the public video card."
                              previewLabel={`${video.title || `Video ${index + 1}`} thumbnail`}
                              uploadButtonLabel="Upload thumbnail"
                              onChange={(value) => {
                                const next = [...values.videos];
                                next[index] = { ...video, thumbnail_url: value };
                                updateValue("videos", next);
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} sx={sectionCardSx}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    SEO
                  </Typography>
                  {sectionSaveButton("seo")}
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: -2 }}>
                  Optional metadata for future project detail pages and social sharing.
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="SEO title"
                      helperText="Optional browser/search title override."
                      value={values.seo_title}
                      onChange={(event) =>
                        updateValue("seo_title", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="SEO description"
                      helperText="Optional search/social summary."
                      value={values.seo_description}
                      onChange={(event) =>
                        updateValue("seo_description", event.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} sx={sectionCardSx}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between" }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Tags
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
                      Technologies, industries, features, tools, or platforms used for
                      filtering and display chips.
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    {sectionSaveButton("tags")}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() =>
                        updateValue("tags", [
                          ...values.tags,
                          { name: "", type: "tech", sort_order: values.tags.length },
                        ])
                      }
                    >
                      Add Tag
                    </Button>
                  </Stack>
                </Stack>
                {values.tags.map((tag, index) => (
                  <Grid key={`tag-${index}`} container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Name"
                        helperText="Example: Next.js, Healthcare, Payments."
                        value={tag.name}
                        onChange={(event) => {
                          const next = [...values.tags];
                          next[index] = { ...tag, name: event.target.value };
                          updateValue("tags", next);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 8, md: 4 }}>
                      <TextField
                        fullWidth
                        select
                        label="Type"
                        helperText="How this tag should be grouped."
                        value={tag.type}
                        onChange={(event) => {
                          const next = [...values.tags];
                          next[index] = {
                            ...tag,
                            type: event.target.value as ProjectTagType,
                          };
                          updateValue("tags", next);
                        }}
                      >
                        {tagTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 4, md: 1 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Order"
                        helperText="Sort"
                        value={tag.sort_order}
                        onChange={(event) => {
                          const next = [...values.tags];
                          next[index] = {
                            ...tag,
                            sort_order: Number(event.target.value),
                          };
                          updateValue("tags", next);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 1 }}>
                      <IconButton
                        color="error"
                        onClick={() =>
                          updateValue(
                            "tags",
                            values.tags.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                        aria-label="Remove tag"
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}

                <Divider />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between" }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Showcase Images
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
                      Supporting screenshots for the project detail gallery, feature
                      sections, mobile screens, architecture diagrams, or logos. These
                      are separate from the main cover image above.
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    {sectionSaveButton("images")}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => {
                        updateValue("images", [
                          ...values.images,
                          {
                            title: "",
                            description: "",
                            image_url: "",
                            alt_text: "",
                            image_type: "gallery",
                            sort_order: values.images.length,
                          },
                        ]);
                        setQueuedMedia((current) => ({
                          ...current,
                          galleryImages: [...(current.galleryImages ?? []), null],
                        }));
                      }}
                    >
                      Add Showcase Image
                    </Button>
                  </Stack>
                </Stack>
                {values.images.map((image, index) => (
                  <Card key={`image-${index}`} variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <MediaUploadField
                            label="Showcase image URL"
                            value={image.image_url}
                            uploadKind="project-gallery"
                            mode={mode}
                            uploadOnSelect={mode === "edit"}
                            queuedFile={queuedMedia.galleryImages?.[index] ?? null}
                            onFileQueued={(file) =>
                              updateQueuedGalleryFile(index, file)
                            }
                            projectSlug={projectSlug}
                            helperText="Screenshot, feature image, mobile screen, architecture diagram, or logo for the showcase gallery."
                            previewLabel={image.title || "Showcase image"}
                            uploadButtonLabel="Upload showcase image"
                            onChange={(value) => {
                              const next = [...values.images];
                              next[index] = {
                                ...image,
                                image_url: value,
                              };
                              updateValue("images", next);
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Alt text"
                            helperText="Short accessibility description of what the image shows."
                            value={image.alt_text}
                            onChange={(event) => {
                              const next = [...values.images];
                              next[index] = {
                                ...image,
                                alt_text: event.target.value,
                              };
                              updateValue("images", next);
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Title"
                            helperText="Optional display heading for this showcase image."
                            value={image.title}
                            onChange={(event) => {
                              const next = [...values.images];
                              next[index] = { ...image, title: event.target.value };
                              updateValue("images", next);
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Description"
                            helperText="Optional caption or context for this visual."
                            value={image.description}
                            onChange={(event) => {
                              const next = [...values.images];
                              next[index] = {
                                ...image,
                                description: event.target.value,
                              };
                              updateValue("images", next);
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 8, md: 2 }}>
                          <TextField
                            fullWidth
                            select
                            label="Type"
                            helperText="How this visual should be used."
                            value={image.image_type}
                            onChange={(event) => {
                              const next = [...values.images];
                              next[index] = {
                                ...image,
                                image_type: event.target.value as ProjectImageType,
                              };
                              updateValue("images", next);
                            }}
                          >
                            {imageTypes.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 4, md: 1 }}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Order"
                            helperText="Sort"
                            value={image.sort_order}
                            onChange={(event) => {
                              const next = [...values.images];
                              next[index] = {
                                ...image,
                                sort_order: Number(event.target.value),
                              };
                              updateValue("images", next);
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 1 }}>
                          <IconButton
                            color="error"
                            onClick={() => {
                              updateValue(
                                "images",
                                values.images.filter(
                                  (_, itemIndex) => itemIndex !== index
                                )
                              );
                              setQueuedMedia((current) => ({
                                ...current,
                                galleryImages: (current.galleryImages ?? []).filter(
                                  (_, itemIndex) => itemIndex !== index
                                ),
                              }));
                            }}
                            aria-label="Remove image"
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}

                <Divider />

                {(["highlights", "technical_focus"] as const).map((section) => (
                  <Stack key={section} spacing={1.5}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      sx={{ justifyContent: "space-between" }}
                    >
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          {section === "highlights"
                            ? "Project Highlights"
                            : "Technical Focus"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
                          {section === "highlights"
                            ? "Outcome-oriented bullet points for what the project includes or achieved."
                            : "Implementation details, architecture notes, integrations, and technical decisions."}
                        </Typography>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        {sectionSaveButton(section)}
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() =>
                            updateValue(section, [
                              ...values[section],
                              { content: "", sort_order: values[section].length },
                            ])
                          }
                        >
                          Add
                        </Button>
                      </Stack>
                    </Stack>
                    {values[section].map((item, index) => (
                      <Stack key={`${section}-${index}`} direction="row" spacing={1}>
                        <TextField
                          fullWidth
                          label="Content"
                          helperText={
                            section === "highlights"
                              ? "Example: Admin portal for operational management."
                              : "Example: Role-based access control."
                          }
                          value={item.content}
                          onChange={(event) => {
                            const next = [...values[section]];
                            next[index] = {
                              ...item,
                              content: event.target.value,
                            };
                            updateValue(section, next);
                          }}
                        />
                        <TextField
                          type="number"
                          label="Order"
                          helperText="Sort"
                          value={item.sort_order}
                          onChange={(event) => {
                            const next = [...values[section]];
                            next[index] = {
                              ...item,
                              sort_order: Number(event.target.value),
                            };
                            updateValue(section, next);
                          }}
                          sx={{ width: 110 }}
                        />
                        <IconButton
                          color="error"
                          onClick={() =>
                            updateValue(
                              section,
                              values[section].filter(
                                (_, itemIndex) => itemIndex !== index
                              )
                            )
                          }
                          aria-label="Remove item"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                ))}
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
            <Button component={Link} href="/admin/projects" variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              disabled={isPending || activeMediaTasks > 0}
            >
              {isPending
                ? "Saving..."
                : activeMediaTasks > 0
                  ? "Preparing media..."
                  : submitLabel}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}

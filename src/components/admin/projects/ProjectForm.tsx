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
import { AdminNotificationBridge } from "@/components/admin/notifications/AdminNotifications";
import type {
  ProjectMutationResult,
  QueuedProjectMedia,
} from "@/lib/cms/projects";
import type {
  ProjectCategory,
  ProjectFormValues,
  ProjectImageType,
  ProjectTagType,
  ProjectType,
} from "@/types/cms";

type ProjectFormProps = {
  initialValues: ProjectFormValues;
  mode: "create" | "edit";
  projectId?: string;
  onSubmit: (
    values: ProjectFormValues,
    queuedMedia: QueuedProjectMedia
  ) => Promise<ProjectMutationResult | void>;
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

export default function ProjectForm({
  initialValues,
  mode,
  projectId,
  onSubmit,
}: ProjectFormProps) {
  const theme = useTheme();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<Message>(null);
  const [queuedMedia, setQueuedMedia] = useState<QueuedProjectMedia>({
    coverImage: null,
    video: null,
    caseStudyDocument: null,
    galleryImages: initialValues.images.map(() => null),
  });
  const [values, setValues] = useState<ProjectFormValues>({
    ...initialValues,
    tags: ordered(initialValues.tags),
    images: ordered(initialValues.images),
    highlights: ordered(initialValues.highlights),
    technical_focus: ordered(initialValues.technical_focus),
  });

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

  const queuedMediaForSubmit =
    mode === "create"
      ? queuedMedia
      : {
          coverImage: null,
          video: null,
          caseStudyDocument: null,
          galleryImages: [],
        };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await onSubmit({
          ...values,
          tags: ordered(values.tags),
          images: values.images,
          highlights: ordered(values.highlights),
          technical_focus: ordered(values.technical_focus),
        }, queuedMediaForSubmit);
        if (mode === "edit") {
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
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Core Details
                </Typography>
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
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Primary Media & Links
                </Typography>
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
                      label="Project video URL"
                      value={values.video_url}
                      uploadKind="project-video"
                      mode={mode}
                      uploadOnSelect={mode === "edit"}
                      queuedFile={queuedMedia.video ?? null}
                      onFileQueued={(file) =>
                        setQueuedMedia((current) => ({
                          ...current,
                          video: file,
                        }))
                      }
                      projectSlug={projectSlug}
                      persistOnUpload={mode === "edit"}
                      table="projects"
                      field="video_url"
                      entityId={projectId}
                      helperText="Optional demo, walkthrough, or thumbnail asset. Paste a URL or upload mp4/webm."
                      previewLabel="Project video"
                      uploadButtonLabel="Upload video"
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
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  SEO
                </Typography>
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
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() =>
                      updateValue("tags", [
                        ...values.tags,
                        { name: "", type: "tech", sort_order: values.tags.length },
                      ])
                    }
                    sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                  >
                    Add Tag
                  </Button>
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
                    sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                  >
                    Add Showcase Image
                  </Button>
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
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() =>
                          updateValue(section, [
                            ...values[section],
                            { content: "", sort_order: values[section].length },
                          ])
                        }
                        sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                      >
                        Add
                      </Button>
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
            sx={{ justifyContent: "flex-end" }}
          >
            <Button component={Link} href="/admin/projects" variant="outlined">
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

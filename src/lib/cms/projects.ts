import { adminDataRequest } from "@/lib/cms/admin-api";
import {
  uploadCmsMedia,
  type CmsUploadStatusCallback,
} from "@/lib/cms/storage";
import type {
  Project,
  ProjectFormValues,
  ProjectHighlight,
  ProjectImage,
  ProjectTag,
  ProjectTechnicalFocus,
  ProjectVideo,
  ProjectWithRelations,
} from "@/types/cms";
import { emptyProjectFormValues } from "@/types/cms";

export type QueuedProjectMedia = {
  coverImage?: File | null;
  video?: File | null;
  videoStatus?: CmsUploadStatusCallback;
  caseStudyDocument?: File | null;
  galleryImages?: (File | null)[];
  videos?: {
    videoFile?: File | null;
    thumbnailFile?: File | null;
    videoStatus?: CmsUploadStatusCallback;
  }[];
};

export type ProjectMutationResult = {
  id: string;
  warning?: string;
};

export type ProjectFormSection =
  | "core"
  | "media"
  | "videos"
  | "seo"
  | "tags"
  | "images"
  | "highlights"
  | "technical_focus";

type ProjectInsertPayload = Omit<
  Project,
  "id" | "created_at" | "updated_at" | "project_type"
> & {
  project_type: Project["project_type"];
};

const nullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const requiredString = (value: string) => value.trim();

const sortBySortOrder = <T extends { sort_order: number }>(items: T[]) =>
  [...items].sort((a, b) => a.sort_order - b.sort_order);

function projectPayload(values: ProjectFormValues): ProjectInsertPayload {
  return {
    title: requiredString(values.title),
    slug: requiredString(values.slug),
    short_description: nullableString(values.short_description),
    description: requiredString(values.description),
    image_url: nullableString(values.image_url),
    category: values.category,
    project_type: values.project_type || null,
    client_name: nullableString(values.client_name),
    is_client_project: values.is_client_project,
    site_url: nullableString(values.site_url),
    github_url: nullableString(values.github_url),
    demo_url: nullableString(values.demo_url),
    video_url: nullableString(values.video_url),
    case_study_url: nullableString(values.case_study_url),
    role: nullableString(values.role),
    status: nullableString(values.status),
    impact: nullableString(values.impact),
    started_at: nullableString(values.started_at),
    completed_at: nullableString(values.completed_at),
    sort_order: values.sort_order,
    is_featured: values.is_featured,
    is_published: values.is_published,
    seo_title: nullableString(values.seo_title),
    seo_description: nullableString(values.seo_description),
  };
}

async function replaceProjectRelations(projectId: string, values: ProjectFormValues) {
  await Promise.all(
    [
      "project_tags",
      "project_images",
      "project_videos",
      "project_highlights",
      "project_technical_focus",
    ].map((table) =>
      adminDataRequest({
        table,
        action: "delete",
        filters: [{ column: "project_id", value: projectId }],
      })
    )
  );

  const tags = sortBySortOrder(values.tags)
    .filter((tag) => tag.name.trim())
    .map((tag) => ({
      project_id: projectId,
      name: requiredString(tag.name),
      type: tag.type,
      sort_order: tag.sort_order,
    }));

  const images = sortBySortOrder(values.images)
    .filter((image) => image.image_url.trim())
    .map((image) => ({
      project_id: projectId,
      title: nullableString(image.title),
      description: nullableString(image.description),
      image_url: requiredString(image.image_url),
      alt_text: nullableString(image.alt_text),
      image_type: image.image_type,
      sort_order: image.sort_order,
    }));

  const highlights = sortBySortOrder(values.highlights)
    .filter((highlight) => highlight.content.trim())
    .map((highlight) => ({
      project_id: projectId,
      content: requiredString(highlight.content),
      sort_order: highlight.sort_order,
    }));

  const technicalFocus = sortBySortOrder(values.technical_focus)
    .filter((focus) => focus.content.trim())
    .map((focus) => ({
      project_id: projectId,
      content: requiredString(focus.content),
      sort_order: focus.sort_order,
    }));

  const videos = sortBySortOrder(values.videos)
    .filter((video) => video.title.trim() && video.video_url.trim())
    .map((video) => ({
      project_id: projectId,
      title: requiredString(video.title),
      description: nullableString(video.description),
      video_url: requiredString(video.video_url),
      thumbnail_url: nullableString(video.thumbnail_url),
      video_type: video.video_type,
      sort_order: video.sort_order,
      is_published: video.is_published,
    }));

  await Promise.all([
    tags.length
      ? adminDataRequest({ table: "project_tags", action: "insert", values: tags })
      : Promise.resolve(),
    images.length
      ? adminDataRequest({ table: "project_images", action: "insert", values: images })
      : Promise.resolve(),
    videos.length
      ? adminDataRequest({ table: "project_videos", action: "insert", values: videos })
      : Promise.resolve(),
    highlights.length
      ? adminDataRequest({
          table: "project_highlights",
          action: "insert",
          values: highlights,
        })
      : Promise.resolve(),
    technicalFocus.length
      ? adminDataRequest({
          table: "project_technical_focus",
          action: "insert",
          values: technicalFocus,
        })
      : Promise.resolve(),
  ]);
}

async function replaceProjectRelation(
  projectId: string,
  section: Extract<
    ProjectFormSection,
    "videos" | "tags" | "images" | "highlights" | "technical_focus"
  >,
  values: ProjectFormValues
) {
  const tableBySection = {
    videos: "project_videos",
    tags: "project_tags",
    images: "project_images",
    highlights: "project_highlights",
    technical_focus: "project_technical_focus",
  } as const;
  const rowsBySection = {
    tags: sortBySortOrder(values.tags)
      .filter((tag) => tag.name.trim())
      .map((tag) => ({
        project_id: projectId,
        name: requiredString(tag.name),
        type: tag.type,
        sort_order: tag.sort_order,
      })),
    images: sortBySortOrder(values.images)
      .filter((image) => image.image_url.trim())
      .map((image) => ({
        project_id: projectId,
        title: nullableString(image.title),
        description: nullableString(image.description),
        image_url: requiredString(image.image_url),
        alt_text: nullableString(image.alt_text),
        image_type: image.image_type,
        sort_order: image.sort_order,
      })),
    videos: sortBySortOrder(values.videos)
      .filter((video) => video.title.trim() && video.video_url.trim())
      .map((video) => ({
        project_id: projectId,
        title: requiredString(video.title),
        description: nullableString(video.description),
        video_url: requiredString(video.video_url),
        thumbnail_url: nullableString(video.thumbnail_url),
        video_type: video.video_type,
        sort_order: video.sort_order,
        is_published: video.is_published,
      })),
    highlights: sortBySortOrder(values.highlights)
      .filter((highlight) => highlight.content.trim())
      .map((highlight) => ({
        project_id: projectId,
        content: requiredString(highlight.content),
        sort_order: highlight.sort_order,
      })),
    technical_focus: sortBySortOrder(values.technical_focus)
      .filter((focus) => focus.content.trim())
      .map((focus) => ({
        project_id: projectId,
        content: requiredString(focus.content),
        sort_order: focus.sort_order,
      })),
  };
  const table = tableBySection[section];
  const rows = rowsBySection[section];

  await adminDataRequest({
    table,
    action: "delete",
    filters: [{ column: "project_id", value: projectId }],
  });
  if (rows.length) {
    await adminDataRequest({ table, action: "insert", values: rows });
  }
}

export async function updateProjectSection(
  projectId: string,
  section: ProjectFormSection,
  values: ProjectFormValues
) {
  if (
    section === "videos" ||
    section === "tags" ||
    section === "images" ||
    section === "highlights" ||
    section === "technical_focus"
  ) {
    await replaceProjectRelation(projectId, section, values);
    return;
  }

  const payload = projectPayload(values);
  const fieldsBySection = {
    core: [
      "title",
      "slug",
      "short_description",
      "description",
      "category",
      "project_type",
      "client_name",
      "is_client_project",
      "role",
      "status",
      "impact",
      "started_at",
      "completed_at",
      "sort_order",
      "is_featured",
      "is_published",
    ],
    media: [
      "image_url",
      "site_url",
      "github_url",
      "demo_url",
      "video_url",
      "case_study_url",
    ],
    seo: ["seo_title", "seo_description"],
  } as const;
  const partialPayload = Object.fromEntries(
    fieldsBySection[section].map((field) => [field, payload[field]])
  );

  await adminDataRequest({
    table: "projects",
    action: "update",
    values: partialPayload,
    filters: [{ column: "id", value: projectId }],
  });
}

export async function listProjects() {
  return adminDataRequest<Project[]>({
    table: "projects",
    action: "select",
    orders: [{ column: "sort_order" }, { column: "title" }],
  });
}

export async function getProjectWithRelations(projectId: string) {
  const project = await adminDataRequest<Project | null>({
    table: "projects",
    action: "select",
    filters: [{ column: "id", value: projectId }],
    single: "maybeSingle",
  });
  if (!project) return null;

  const [tags, images, videos, highlights, technicalFocus] = await Promise.all([
    adminDataRequest<ProjectTag[]>({
      table: "project_tags",
      action: "select",
      filters: [{ column: "project_id", value: projectId }],
      orders: [{ column: "sort_order" }],
    }),
    adminDataRequest<ProjectImage[]>({
      table: "project_images",
      action: "select",
      filters: [{ column: "project_id", value: projectId }],
      orders: [{ column: "sort_order" }],
    }),
    adminDataRequest<ProjectVideo[]>({
      table: "project_videos",
      action: "select",
      filters: [{ column: "project_id", value: projectId }],
      orders: [{ column: "sort_order" }],
    }),
    adminDataRequest<ProjectHighlight[]>({
      table: "project_highlights",
      action: "select",
      filters: [{ column: "project_id", value: projectId }],
      orders: [{ column: "sort_order" }],
    }),
    adminDataRequest<ProjectTechnicalFocus[]>({
      table: "project_technical_focus",
      action: "select",
      filters: [{ column: "project_id", value: projectId }],
      orders: [{ column: "sort_order" }],
    }),
  ]);

  return {
    ...project,
    tags,
    images,
    videos,
    highlights,
    technical_focus: technicalFocus,
  } satisfies ProjectWithRelations;
}

export async function createProject(
  values: ProjectFormValues,
  queuedMedia: QueuedProjectMedia = {}
): Promise<ProjectMutationResult> {
  const hasQueuedCover = Boolean(queuedMedia.coverImage);
  const hasQueuedVideo = Boolean(queuedMedia.video);
  const hasQueuedCaseStudy = Boolean(queuedMedia.caseStudyDocument);
  const insertValues: ProjectFormValues = {
    ...values,
    image_url: hasQueuedCover ? "" : values.image_url,
    video_url: hasQueuedVideo ? "" : values.video_url,
    case_study_url: hasQueuedCaseStudy ? "" : values.case_study_url,
    images: values.images.filter(
      (_, index) => !queuedMedia.galleryImages?.[index]
    ),
    videos: values.videos.filter(
      (_, index) =>
        !queuedMedia.videos?.[index]?.videoFile &&
        !queuedMedia.videos?.[index]?.thumbnailFile
    ),
  };

  const data = await adminDataRequest<{ id: string; slug: string | null }>({
    table: "projects",
    action: "insert",
    values: projectPayload(insertValues),
    select: "id, slug",
    single: "single",
  });
  if (!data?.id) throw new Error("Project was created without an id.");

  const projectId = data.id as string;
  const projectSlug = (data.slug as string | null) || values.slug;
  const warnings: string[] = [];

  try {
    await replaceProjectRelations(projectId, insertValues);
  } catch (error) {
    warnings.push(
      error instanceof Error
        ? `Project details were created, but related rows failed to save: ${error.message}`
        : "Project details were created, but related rows failed to save."
    );
  }

  const projectUpdates: Partial<
    Pick<Project, "image_url" | "video_url" | "case_study_url">
  > = {};

  if (queuedMedia.coverImage) {
    try {
      const result = await uploadCmsMedia({
        file: queuedMedia.coverImage,
        kind: "project-cover",
        projectSlug,
      });
      projectUpdates.image_url = result.publicUrl;
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? `Cover image failed to upload: ${error.message}`
          : "Cover image failed to upload."
      );
    }
  }

  if (queuedMedia.video) {
    try {
      const result = await uploadCmsMedia({
        file: queuedMedia.video,
        kind: "project-video",
        projectSlug,
        onStatus: queuedMedia.videoStatus,
      });
      projectUpdates.video_url = result.publicUrl;
    } catch (error) {
      queuedMedia.videoStatus?.(null);
      warnings.push(
        error instanceof Error
          ? `Project video failed to upload: ${error.message}`
          : "Project video failed to upload."
      );
    }
  }

  if (queuedMedia.caseStudyDocument) {
    try {
      const result = await uploadCmsMedia({
        file: queuedMedia.caseStudyDocument,
        kind: "case-study-document",
        projectSlug,
      });
      projectUpdates.case_study_url = result.publicUrl;
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? `Case study document failed to upload: ${error.message}`
          : "Case study document failed to upload."
      );
    }
  }

  if (Object.keys(projectUpdates).length) {
    try {
      await adminDataRequest({
        table: "projects",
        action: "update",
        values: projectUpdates,
        filters: [{ column: "id", value: projectId }],
      });
    } catch (error) {
      warnings.push(
        `Media uploaded, but project media fields failed to update: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  const queuedGalleryImages = values.images
    .map((image, index) => ({
      image,
      file: queuedMedia.galleryImages?.[index] ?? null,
    }))
    .filter(
      (
        item
      ): item is {
        image: ProjectFormValues["images"][number];
        file: File;
      } => Boolean(item.file)
    )
    .sort((a, b) => a.image.sort_order - b.image.sort_order);

  const uploadedGalleryRows = [];

  for (const item of queuedGalleryImages) {
    try {
      const result = await uploadCmsMedia({
        file: item.file,
        kind: "project-gallery",
        projectSlug,
      });

      uploadedGalleryRows.push({
        project_id: projectId,
        title: nullableString(item.image.title),
        description: nullableString(item.image.description),
        image_url: result.publicUrl,
        alt_text: nullableString(item.image.alt_text),
        image_type: item.image.image_type,
        sort_order: item.image.sort_order,
      });
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? `Showcase image "${item.image.title || item.file.name}" failed to upload: ${error.message}`
          : `Showcase image "${item.image.title || item.file.name}" failed to upload.`
      );
    }
  }

  if (uploadedGalleryRows.length) {
    try {
      await adminDataRequest({
        table: "project_images",
        action: "insert",
        values: uploadedGalleryRows,
      });
    } catch (error) {
      warnings.push(
        `Uploaded showcase images failed to save: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  const queuedVideos = values.videos
    .map((video, index) => ({
      video,
      queued: queuedMedia.videos?.[index],
    }))
    .filter(
      (item) => item.queued?.videoFile || item.queued?.thumbnailFile
    )
    .sort((a, b) => a.video.sort_order - b.video.sort_order);

  const uploadedVideoRows = [];

  for (const item of queuedVideos) {
    let videoUrl = item.video.video_url;
    let thumbnailUrl = item.video.thumbnail_url;

    if (item.queued?.videoFile) {
      try {
        const result = await uploadCmsMedia({
          file: item.queued.videoFile,
          kind: "project-video",
          projectSlug,
          onStatus: item.queued.videoStatus,
        });
        videoUrl = result.publicUrl;
      } catch (error) {
        item.queued.videoStatus?.(null);
        warnings.push(
          error instanceof Error
            ? `Video "${item.video.title || item.queued.videoFile.name}" failed to upload: ${error.message}`
            : `Video "${item.video.title || item.queued.videoFile.name}" failed to upload.`
        );
      }
    }

    if (item.queued?.thumbnailFile) {
      try {
        const result = await uploadCmsMedia({
          file: item.queued.thumbnailFile,
          kind: "project-video-thumbnail",
          projectSlug,
        });
        thumbnailUrl = result.publicUrl;
      } catch (error) {
        warnings.push(
          error instanceof Error
            ? `Thumbnail for "${item.video.title || item.queued.thumbnailFile.name}" failed to upload: ${error.message}`
            : `Thumbnail for "${item.video.title || item.queued.thumbnailFile.name}" failed to upload.`
        );
      }
    }

    if (item.video.title.trim() && videoUrl.trim()) {
      uploadedVideoRows.push({
        project_id: projectId,
        title: requiredString(item.video.title),
        description: nullableString(item.video.description),
        video_url: requiredString(videoUrl),
        thumbnail_url: nullableString(thumbnailUrl),
        video_type: item.video.video_type,
        sort_order: item.video.sort_order,
        is_published: item.video.is_published,
      });
    } else {
      warnings.push(
        `Video "${item.video.title || "Untitled video"}" was not saved because it has no video URL.`
      );
    }
  }

  if (uploadedVideoRows.length) {
    try {
      await adminDataRequest({
        table: "project_videos",
        action: "insert",
        values: uploadedVideoRows,
      });
    } catch (error) {
      warnings.push(
        `Uploaded project videos failed to save: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  return {
    id: projectId,
    warning: warnings.length ? warnings.join(" ") : undefined,
  };
}

export async function updateProject(projectId: string, values: ProjectFormValues) {
  await adminDataRequest({
    table: "projects",
    action: "update",
    values: projectPayload(values),
    filters: [{ column: "id", value: projectId }],
  });

  await replaceProjectRelations(projectId, values);
}

export async function deleteProject(projectId: string) {
  await Promise.all(
    [
      "project_tags",
      "project_images",
      "project_videos",
      "project_highlights",
      "project_technical_focus",
    ].map((table) =>
      adminDataRequest({
        table,
        action: "delete",
        filters: [{ column: "project_id", value: projectId }],
      })
    )
  );
  await adminDataRequest({
    table: "projects",
    action: "delete",
    filters: [{ column: "id", value: projectId }],
  });
}

export async function updateProjectFlags(
  projectId: string,
  flags: Pick<Project, "is_featured" | "is_published">
) {
  await adminDataRequest({
    table: "projects",
    action: "update",
    values: flags,
    filters: [{ column: "id", value: projectId }],
  });
}

export function projectToFormValues(
  project?: ProjectWithRelations | null
): ProjectFormValues {
  if (!project) return { ...emptyProjectFormValues };

  return {
    title: project.title,
    slug: project.slug,
    short_description: project.short_description ?? "",
    description: project.description,
    image_url: project.image_url ?? "",
    category: project.category,
    project_type: project.project_type ?? "client",
    client_name: project.client_name ?? "",
    is_client_project: project.is_client_project,
    site_url: project.site_url ?? "",
    github_url: project.github_url ?? "",
    demo_url: project.demo_url ?? "",
    video_url: project.video_url ?? "",
    case_study_url: project.case_study_url ?? "",
    role: project.role ?? "",
    status: project.status ?? "",
    impact: project.impact ?? "",
    started_at: project.started_at ?? "",
    completed_at: project.completed_at ?? "",
    sort_order: project.sort_order,
    is_featured: project.is_featured,
    is_published: project.is_published,
    seo_title: project.seo_title ?? "",
    seo_description: project.seo_description ?? "",
    tags: sortBySortOrder(project.tags).map((tag) => ({
      name: tag.name,
      type: tag.type ?? "tech",
      sort_order: tag.sort_order,
    })),
    images: sortBySortOrder(project.images).map((image) => ({
      title: image.title ?? "",
      description: image.description ?? "",
      image_url: image.image_url,
      alt_text: image.alt_text ?? "",
      image_type: image.image_type ?? "gallery",
      sort_order: image.sort_order,
    })),
    videos: sortBySortOrder(project.videos).map((video) => ({
      title: video.title,
      description: video.description ?? "",
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url ?? "",
      video_type: video.video_type,
      sort_order: video.sort_order,
      is_published: video.is_published,
    })),
    highlights: sortBySortOrder(project.highlights).map((highlight) => ({
      content: highlight.content,
      sort_order: highlight.sort_order,
    })),
    technical_focus: sortBySortOrder(project.technical_focus).map((focus) => ({
      content: focus.content,
      sort_order: focus.sort_order,
    })),
  };
}

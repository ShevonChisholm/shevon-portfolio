import { createClient } from "@/lib/supabase/client";
import { uploadCmsMedia } from "@/lib/cms/storage";
import type {
  Project,
  ProjectFormValues,
  ProjectHighlight,
  ProjectImage,
  ProjectTag,
  ProjectTechnicalFocus,
  ProjectWithRelations,
} from "@/types/cms";
import { emptyProjectFormValues } from "@/types/cms";

const supabase = createClient();

export type QueuedProjectMedia = {
  coverImage?: File | null;
  video?: File | null;
  caseStudyDocument?: File | null;
  galleryImages?: (File | null)[];
};

export type ProjectMutationResult = {
  id: string;
  warning?: string;
};

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
  const deleteOperations = await Promise.all([
    supabase.from("project_tags").delete().eq("project_id", projectId),
    supabase.from("project_images").delete().eq("project_id", projectId),
    supabase.from("project_highlights").delete().eq("project_id", projectId),
    supabase.from("project_technical_focus").delete().eq("project_id", projectId),
  ]);
  const deleteError = deleteOperations.find((operation) => operation.error)?.error;

  if (deleteError) throw new Error(deleteError.message);

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

  const insertOperations = await Promise.all([
    tags.length ? supabase.from("project_tags").insert(tags) : Promise.resolve({ error: null }),
    images.length
      ? supabase.from("project_images").insert(images)
      : Promise.resolve({ error: null }),
    highlights.length
      ? supabase.from("project_highlights").insert(highlights)
      : Promise.resolve({ error: null }),
    technicalFocus.length
      ? supabase.from("project_technical_focus").insert(technicalFocus)
      : Promise.resolve({ error: null }),
  ]);
  const insertError = insertOperations.find((operation) => operation.error)?.error;

  if (insertError) throw new Error(insertError.message);
}

export async function listProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []) as Project[];
}

export async function getProjectWithRelations(projectId: string) {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) throw new Error(projectError.message);
  if (!project) return null;

  const [tags, images, highlights, technicalFocus] = await Promise.all([
    supabase
      .from("project_tags")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_images")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_highlights")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_technical_focus")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
  ]);

  const relationError =
    tags.error ?? images.error ?? highlights.error ?? technicalFocus.error;

  if (relationError) throw new Error(relationError.message);

  return {
    ...(project as Project),
    tags: (tags.data ?? []) as ProjectTag[],
    images: (images.data ?? []) as ProjectImage[],
    highlights: (highlights.data ?? []) as ProjectHighlight[],
    technical_focus: (technicalFocus.data ?? []) as ProjectTechnicalFocus[],
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
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(projectPayload(insertValues))
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);
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
      });
      projectUpdates.video_url = result.publicUrl;
    } catch (error) {
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
    const { error: updateError } = await supabase
      .from("projects")
      .update(projectUpdates)
      .eq("id", projectId);

    if (updateError) {
      warnings.push(
        `Media uploaded, but project media fields failed to update: ${updateError.message}`
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
    const { error: imageInsertError } = await supabase
      .from("project_images")
      .insert(uploadedGalleryRows);

    if (imageInsertError) {
      warnings.push(
        `Uploaded showcase images failed to save: ${imageInsertError.message}`
      );
    }
  }

  return {
    id: projectId,
    warning: warnings.length ? warnings.join(" ") : undefined,
  };
}

export async function updateProject(projectId: string, values: ProjectFormValues) {
  const { error } = await supabase
    .from("projects")
    .update(projectPayload(values))
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  await replaceProjectRelations(projectId, values);
}

export async function deleteProject(projectId: string) {
  const deleteRelations = await Promise.all([
    supabase.from("project_tags").delete().eq("project_id", projectId),
    supabase.from("project_images").delete().eq("project_id", projectId),
    supabase.from("project_highlights").delete().eq("project_id", projectId),
    supabase.from("project_technical_focus").delete().eq("project_id", projectId),
  ]);
  const relationError = deleteRelations.find((operation) => operation.error)?.error;

  if (relationError) throw new Error(relationError.message);

  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) throw new Error(error.message);
}

export async function updateProjectFlags(
  projectId: string,
  flags: Pick<Project, "is_featured" | "is_published">
) {
  const { error } = await supabase
    .from("projects")
    .update(flags)
    .eq("id", projectId);

  if (error) throw new Error(error.message);
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

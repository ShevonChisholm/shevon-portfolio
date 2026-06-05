import { createClient } from "@/lib/supabase/server";
import type {
  Project,
  ProjectCategory,
  ProjectHighlight,
  ProjectImage,
  ProjectTag,
  ProjectTechnicalFocus,
  ProjectWithRelations,
} from "@/types/cms";

export type PublicProjectShowcaseItem = {
  title: string;
  description: string;
  image: string;
  altText: string;
};

export type PublicProject = {
  id: string;
  title: string;
  description: string;
  shortDescription: string | null;
  image: string | null;
  images: string[];
  tags: string[];
  slug: string;
  category: Project["category"];
  siteUrl: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  videoUrl: string | null;
  caseStudyUrl: string | null;
  role: string | null;
  status: string | null;
  impact: string | null;
  highlights: string[];
  technicalFocus: string[];
  showcase: PublicProjectShowcaseItem[];
  seoTitle: string | null;
  seoDescription: string | null;
};

export type PublishedProjectListOptions = {
  category?: ProjectCategory;
  search?: string;
  limit?: number;
  offset?: number;
};

const sortBySortOrder = <T extends { sort_order: number }>(items: T[]) =>
  [...items].sort((a, b) => a.sort_order - b.sort_order);

function groupByProjectId<T extends { project_id: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    groups[item.project_id] = groups[item.project_id] ?? [];
    groups[item.project_id].push(item);
    return groups;
  }, {});
}

function mapToPublicProject(project: ProjectWithRelations): PublicProject {
  const images = sortBySortOrder(project.images);

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    shortDescription: project.short_description,
    image: project.image_url,
    images: images.map((image) => image.image_url).filter(Boolean),
    tags: sortBySortOrder(project.tags).map((tag) => tag.name),
    slug: project.slug,
    category: project.category,
    siteUrl: project.site_url,
    githubUrl: project.github_url,
    demoUrl: project.demo_url,
    videoUrl: project.video_url,
    caseStudyUrl: project.case_study_url,
    role: project.role,
    status: project.status,
    impact: project.impact,
    highlights: sortBySortOrder(project.highlights).map(
      (highlight) => highlight.content
    ),
    technicalFocus: sortBySortOrder(project.technical_focus).map(
      (focus) => focus.content
    ),
    showcase: images.map((image) => ({
      title: image.title ?? "Project image",
      description: image.description ?? "",
      image: image.image_url,
      altText: image.alt_text ?? image.title ?? project.title,
    })),
    seoTitle: project.seo_title,
    seoDescription: project.seo_description,
  };
}

async function fetchRelations(projectIds: string[]) {
  const supabase = createClient();

  if (!projectIds.length) {
    return {
      tagsByProject: {},
      imagesByProject: {},
      highlightsByProject: {},
      technicalFocusByProject: {},
    };
  }

  const [tags, images, highlights, technicalFocus] = await Promise.all([
    supabase
      .from("project_tags")
      .select("*")
      .in("project_id", projectIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_images")
      .select("*")
      .in("project_id", projectIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_highlights")
      .select("*")
      .in("project_id", projectIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_technical_focus")
      .select("*")
      .in("project_id", projectIds)
      .order("sort_order", { ascending: true }),
  ]);

  const relationError =
    tags.error ?? images.error ?? highlights.error ?? technicalFocus.error;

  if (relationError) throw new Error(relationError.message);

  return {
    tagsByProject: groupByProjectId((tags.data ?? []) as ProjectTag[]),
    imagesByProject: groupByProjectId((images.data ?? []) as ProjectImage[]),
    highlightsByProject: groupByProjectId(
      (highlights.data ?? []) as ProjectHighlight[]
    ),
    technicalFocusByProject: groupByProjectId(
      (technicalFocus.data ?? []) as ProjectTechnicalFocus[]
    ),
  };
}

export async function getPublishedProjects(options: PublishedProjectListOptions = {}) {
  const supabase = createClient();
  let query = supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (options.category) {
    query = query.eq("category", options.category);
  }

  if (options.search?.trim()) {
    const searchTerm = options.search.trim().replace(/[%_]/g, "");
    query = query.or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`
    );
  }

  if (typeof options.limit === "number") {
    const offset = options.offset ?? 0;
    query = query.range(offset, offset + options.limit - 1);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const projects = (data ?? []) as Project[];
  const projectIds = projects.map((project) => project.id);
  const {
    tagsByProject,
    imagesByProject,
    highlightsByProject,
    technicalFocusByProject,
  } = await fetchRelations(projectIds);

  return projects.map((project) =>
    mapToPublicProject({
      ...project,
      tags: tagsByProject[project.id] ?? [],
      images: imagesByProject[project.id] ?? [],
      highlights: highlightsByProject[project.id] ?? [],
      technical_focus: technicalFocusByProject[project.id] ?? [],
    })
  );
}

export async function getPublishedProjectBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const project = data as Project;
  const {
    tagsByProject,
    imagesByProject,
    highlightsByProject,
    technicalFocusByProject,
  } = await fetchRelations([project.id]);

  return mapToPublicProject({
    ...project,
    tags: tagsByProject[project.id] ?? [],
    images: imagesByProject[project.id] ?? [],
    highlights: highlightsByProject[project.id] ?? [],
    technical_focus: technicalFocusByProject[project.id] ?? [],
  });
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedProjectBySlug } from "@/lib/cms/public-projects";
import ProjectDetailsClient from "./ProjectDetailsClient";

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const project = await getPublishedProjectBySlug(params.slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.description,
    openGraph: {
      title: project.seoTitle ?? project.title,
      description: project.seoDescription ?? project.description,
      images: project.image ? [project.image] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getPublishedProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailsClient project={project} />;
}

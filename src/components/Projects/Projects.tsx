import { getPublishedProjects } from "@/lib/cms/public-projects";
import { getPublishedTestimonials } from "@/lib/cms/public-testimonials";
import { withPublicFallback } from "@/lib/cms/public-safe";
import ProjectsClient from "./ProjectsClient";

export default async function Projects() {
  const [projects, testimonials] = await Promise.all([
    withPublicFallback("projects", getPublishedProjects, []),
    withPublicFallback("testimonials", getPublishedTestimonials, []),
  ]);

  return <ProjectsClient projects={projects} testimonials={testimonials} />;
}

import { getPublishedProjects } from "@/lib/cms/public-projects";
import ProjectsClient from "./ProjectsClient";

export default async function Projects() {
  const projects = await getPublishedProjects();

  return <ProjectsClient projects={projects} />;
}

import { getPublishedExperienceItems } from "@/lib/cms/public-profile";
import ExperienceClient from "./ExperienceClient";

export default async function Experience() {
  const experiences = await getPublishedExperienceItems();

  return <ExperienceClient experiences={experiences} />;
}

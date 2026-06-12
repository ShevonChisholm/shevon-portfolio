import { getPublishedExperienceItems } from "@/lib/cms/public-profile";
import { withPublicFallback } from "@/lib/cms/public-safe";
import ExperienceClient from "./ExperienceClient";

export default async function Experience() {
  const experiences = await withPublicFallback(
    "experience",
    getPublishedExperienceItems,
    []
  );

  return <ExperienceClient experiences={experiences} />;
}

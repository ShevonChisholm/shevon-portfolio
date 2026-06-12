import { getPublishedSkillCategoriesWithSkills } from "@/lib/cms/public-profile";
import { withPublicFallback } from "@/lib/cms/public-safe";
import SkillsClient from "./SkillsClient";

export default async function Skills() {
  const skillCategories = await withPublicFallback(
    "skills",
    getPublishedSkillCategoriesWithSkills,
    []
  );

  return <SkillsClient skillCategories={skillCategories} />;
}

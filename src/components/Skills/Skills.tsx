import { getPublishedSkillCategoriesWithSkills } from "@/lib/cms/public-profile";
import SkillsClient from "./SkillsClient";

export default async function Skills() {
  const skillCategories = await getPublishedSkillCategoriesWithSkills();

  return <SkillsClient skillCategories={skillCategories} />;
}

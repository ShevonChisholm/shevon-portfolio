import { createClient } from "@/lib/supabase/server";
import type {
  EducationItem,
  ExperienceItem,
  Skill,
  SkillCategory,
  SkillCategoryWithSkills,
} from "@/types/cms";

const sortBySortOrder = <T extends { sort_order: number }>(items: T[]) =>
  [...items].sort((a, b) => a.sort_order - b.sort_order);

function mergeCategoriesWithSkills(
  categories: SkillCategory[],
  skills: Skill[]
): SkillCategoryWithSkills[] {
  return sortBySortOrder(categories).map((category) => ({
    ...category,
    skills: sortBySortOrder(
      skills.filter((skill) => skill.category_id === category.id)
    ),
  }));
}

export async function getPublishedExperienceItems() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("experience_items")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as ExperienceItem[];
}

export async function getPublishedEducationItems() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("education_items")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as EducationItem[];
}

export async function getPublishedSkillCategoriesWithSkills() {
  const supabase = createClient();
  const [categories, skills] = await Promise.all([
    supabase
      .from("skill_categories")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true }),
    supabase
      .from("skills")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const error = categories.error ?? skills.error;
  if (error) throw new Error(error.message);

  return mergeCategoriesWithSkills(
    (categories.data ?? []) as SkillCategory[],
    (skills.data ?? []) as Skill[]
  ).filter((category) => category.skills.length > 0);
}

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type {
  Skill,
  SkillCategory,
  SkillCategoryFormValues,
  SkillCategoryWithSkills,
  SkillFormValues,
} from "@/types/cms";

const supabase = createBrowserClient();

const nullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const requiredString = (value: string) => value.trim();

function categoryPayload(values: SkillCategoryFormValues) {
  return {
    title: requiredString(values.title),
    icon: nullableString(values.icon),
    sort_order: values.sort_order,
    is_published: values.is_published,
  };
}

function skillPayload(values: SkillFormValues) {
  return {
    category_id: values.category_id,
    name: requiredString(values.name),
    skill_type: nullableString(values.skill_type),
    sort_order: values.sort_order,
    is_published: values.is_published,
  };
}

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

export async function listSkillCategoriesWithSkills() {
  const [categories, skills] = await Promise.all([
    supabase
      .from("skill_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true }),
    supabase
      .from("skills")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const error = categories.error ?? skills.error;
  if (error) throw new Error(error.message);

  return mergeCategoriesWithSkills(
    (categories.data ?? []) as SkillCategory[],
    (skills.data ?? []) as Skill[]
  );
}

export async function createSkillCategory(values: SkillCategoryFormValues) {
  const { error } = await supabase
    .from("skill_categories")
    .insert(categoryPayload(values));

  if (error) throw new Error(error.message);
}

export async function updateSkillCategory(
  id: string,
  values: SkillCategoryFormValues
) {
  const { error } = await supabase
    .from("skill_categories")
    .update(categoryPayload(values))
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteSkillCategory(id: string) {
  const { error: skillsError } = await supabase
    .from("skills")
    .delete()
    .eq("category_id", id);

  if (skillsError) throw new Error(skillsError.message);

  const { error } = await supabase.from("skill_categories").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

export async function updateSkillCategoryPublished(
  id: string,
  isPublished: boolean
) {
  const { error } = await supabase
    .from("skill_categories")
    .update({ is_published: isPublished })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function createSkill(values: SkillFormValues) {
  const { error } = await supabase.from("skills").insert(skillPayload(values));

  if (error) throw new Error(error.message);
}

export async function updateSkill(id: string, values: SkillFormValues) {
  const { error } = await supabase
    .from("skills")
    .update(skillPayload(values))
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteSkill(id: string) {
  const { error } = await supabase.from("skills").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

export async function updateSkillPublished(id: string, isPublished: boolean) {
  const { error } = await supabase
    .from("skills")
    .update({ is_published: isPublished })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export function categoryToFormValues(
  category: SkillCategory
): SkillCategoryFormValues {
  return {
    title: category.title,
    icon: category.icon ?? "",
    sort_order: category.sort_order,
    is_published: category.is_published,
  };
}

export function skillToFormValues(skill: Skill): SkillFormValues {
  return {
    category_id: skill.category_id,
    name: skill.name,
    skill_type: skill.skill_type ?? "",
    sort_order: skill.sort_order,
    is_published: skill.is_published,
  };
}

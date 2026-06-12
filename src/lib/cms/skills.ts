import { adminDataRequest } from "@/lib/cms/admin-api";
import type {
  Skill,
  SkillCategory,
  SkillCategoryFormValues,
  SkillCategoryWithSkills,
  SkillFormValues,
} from "@/types/cms";

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
    adminDataRequest<SkillCategory[]>({
      table: "skill_categories",
      action: "select",
      orders: [{ column: "sort_order" }, { column: "title" }],
    }),
    adminDataRequest<Skill[]>({
      table: "skills",
      action: "select",
      orders: [{ column: "sort_order" }, { column: "name" }],
    }),
  ]);

  return mergeCategoriesWithSkills(categories, skills);
}

export async function createSkillCategory(values: SkillCategoryFormValues) {
  await adminDataRequest({
    table: "skill_categories",
    action: "insert",
    values: categoryPayload(values),
  });
}

export async function updateSkillCategory(
  id: string,
  values: SkillCategoryFormValues
) {
  await adminDataRequest({
    table: "skill_categories",
    action: "update",
    values: categoryPayload(values),
    filters: [{ column: "id", value: id }],
  });
}

export async function deleteSkillCategory(id: string) {
  await adminDataRequest({
    table: "skills",
    action: "delete",
    filters: [{ column: "category_id", value: id }],
  });
  await adminDataRequest({
    table: "skill_categories",
    action: "delete",
    filters: [{ column: "id", value: id }],
  });
}

export async function updateSkillCategoryPublished(
  id: string,
  isPublished: boolean
) {
  await adminDataRequest({
    table: "skill_categories",
    action: "update",
    values: { is_published: isPublished },
    filters: [{ column: "id", value: id }],
  });
}

export async function createSkill(values: SkillFormValues) {
  await adminDataRequest({
    table: "skills",
    action: "insert",
    values: skillPayload(values),
  });
}

export async function updateSkill(id: string, values: SkillFormValues) {
  await adminDataRequest({
    table: "skills",
    action: "update",
    values: skillPayload(values),
    filters: [{ column: "id", value: id }],
  });
}

export async function deleteSkill(id: string) {
  await adminDataRequest({
    table: "skills",
    action: "delete",
    filters: [{ column: "id", value: id }],
  });
}

export async function updateSkillPublished(id: string, isPublished: boolean) {
  await adminDataRequest({
    table: "skills",
    action: "update",
    values: { is_published: isPublished },
    filters: [{ column: "id", value: id }],
  });
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

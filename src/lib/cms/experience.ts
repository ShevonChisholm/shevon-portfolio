import { adminDataRequest } from "@/lib/cms/admin-api";
import type { ExperienceFormValues, ExperienceItem } from "@/types/cms";
import { emptyExperienceFormValues } from "@/types/cms";

const nullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const requiredString = (value: string) => value.trim();

function experiencePayload(values: ExperienceFormValues) {
  return {
    title: requiredString(values.title),
    company: requiredString(values.company),
    location: nullableString(values.location),
    employment_type: nullableString(values.employment_type),
    period: requiredString(values.period),
    start_date: nullableString(values.start_date),
    end_date: values.is_current ? null : nullableString(values.end_date),
    is_current: values.is_current,
    description: requiredString(values.description),
    sort_order: values.sort_order,
    is_published: values.is_published,
  };
}

export async function listExperienceItems() {
  return adminDataRequest<ExperienceItem[]>({
    table: "experience_items",
    action: "select",
    orders: [
      { column: "sort_order" },
      { column: "start_date", ascending: false },
    ],
  });
}

export async function getExperienceItem(id: string) {
  return adminDataRequest<ExperienceItem | null>({
    table: "experience_items",
    action: "select",
    filters: [{ column: "id", value: id }],
    single: "maybeSingle",
  });
}

export async function createExperienceItem(values: ExperienceFormValues) {
  const data = await adminDataRequest<{ id: string }>({
    table: "experience_items",
    action: "insert",
    values: experiencePayload(values),
    select: "id",
    single: "single",
  });
  if (!data?.id) throw new Error("Experience item was created without an id.");
  return data.id;
}

export async function updateExperienceItem(
  id: string,
  values: ExperienceFormValues
) {
  await adminDataRequest({
    table: "experience_items",
    action: "update",
    values: experiencePayload(values),
    filters: [{ column: "id", value: id }],
  });
}

export async function deleteExperienceItem(id: string) {
  await adminDataRequest({
    table: "experience_items",
    action: "delete",
    filters: [{ column: "id", value: id }],
  });
}

export async function updateExperiencePublished(
  id: string,
  isPublished: boolean
) {
  await adminDataRequest({
    table: "experience_items",
    action: "update",
    values: { is_published: isPublished },
    filters: [{ column: "id", value: id }],
  });
}

export function experienceToFormValues(
  item?: ExperienceItem | null
): ExperienceFormValues {
  if (!item) return { ...emptyExperienceFormValues };

  return {
    title: item.title,
    company: item.company,
    location: item.location ?? "",
    employment_type: item.employment_type ?? "",
    period: item.period,
    start_date: item.start_date ?? "",
    end_date: item.end_date ?? "",
    is_current: item.is_current,
    description: item.description,
    sort_order: item.sort_order,
    is_published: item.is_published,
  };
}

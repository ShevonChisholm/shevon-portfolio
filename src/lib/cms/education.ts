import { adminDataRequest } from "@/lib/cms/admin-api";
import type { EducationFormValues, EducationItem } from "@/types/cms";
import { emptyEducationFormValues } from "@/types/cms";

const nullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const requiredString = (value: string) => value.trim();

function educationPayload(values: EducationFormValues) {
  return {
    degree: requiredString(values.degree),
    institution: requiredString(values.institution),
    location: nullableString(values.location),
    period: requiredString(values.period),
    start_date: nullableString(values.start_date),
    end_date: nullableString(values.end_date),
    description: requiredString(values.description),
    credential_url: nullableString(values.credential_url),
    sort_order: values.sort_order,
    is_published: values.is_published,
  };
}

export async function listEducationItems() {
  return adminDataRequest<EducationItem[]>({
    table: "education_items",
    action: "select",
    orders: [
      { column: "sort_order" },
      { column: "start_date", ascending: false },
    ],
  });
}

export async function getEducationItem(id: string) {
  return adminDataRequest<EducationItem | null>({
    table: "education_items",
    action: "select",
    filters: [{ column: "id", value: id }],
    single: "maybeSingle",
  });
}

export async function createEducationItem(values: EducationFormValues) {
  const data = await adminDataRequest<{ id: string }>({
    table: "education_items",
    action: "insert",
    values: educationPayload(values),
    select: "id",
    single: "single",
  });
  if (!data?.id) throw new Error("Education item was created without an id.");
  return data.id;
}

export async function updateEducationItem(id: string, values: EducationFormValues) {
  await adminDataRequest({
    table: "education_items",
    action: "update",
    values: educationPayload(values),
    filters: [{ column: "id", value: id }],
  });
}

export async function deleteEducationItem(id: string) {
  await adminDataRequest({
    table: "education_items",
    action: "delete",
    filters: [{ column: "id", value: id }],
  });
}

export async function updateEducationPublished(id: string, isPublished: boolean) {
  await adminDataRequest({
    table: "education_items",
    action: "update",
    values: { is_published: isPublished },
    filters: [{ column: "id", value: id }],
  });
}

export function educationToFormValues(
  item?: EducationItem | null
): EducationFormValues {
  if (!item) return { ...emptyEducationFormValues };

  return {
    degree: item.degree,
    institution: item.institution,
    location: item.location ?? "",
    period: item.period,
    start_date: item.start_date ?? "",
    end_date: item.end_date ?? "",
    description: item.description,
    credential_url: item.credential_url ?? "",
    sort_order: item.sort_order,
    is_published: item.is_published,
  };
}

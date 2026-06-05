import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { EducationFormValues, EducationItem } from "@/types/cms";
import { emptyEducationFormValues } from "@/types/cms";

const supabase = createBrowserClient();

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
  const { data, error } = await supabase
    .from("education_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as EducationItem[];
}

export async function getEducationItem(id: string) {
  const { data, error } = await supabase
    .from("education_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return (data ?? null) as EducationItem | null;
}

export async function createEducationItem(values: EducationFormValues) {
  const { data, error } = await supabase
    .from("education_items")
    .insert(educationPayload(values))
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("Education item was created without an id.");

  return data.id as string;
}

export async function updateEducationItem(id: string, values: EducationFormValues) {
  const { error } = await supabase
    .from("education_items")
    .update(educationPayload(values))
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteEducationItem(id: string) {
  const { error } = await supabase.from("education_items").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

export async function updateEducationPublished(id: string, isPublished: boolean) {
  const { error } = await supabase
    .from("education_items")
    .update({ is_published: isPublished })
    .eq("id", id);

  if (error) throw new Error(error.message);
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

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { ExperienceFormValues, ExperienceItem } from "@/types/cms";
import { emptyExperienceFormValues } from "@/types/cms";

const supabase = createBrowserClient();

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
  const { data, error } = await supabase
    .from("experience_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as ExperienceItem[];
}

export async function getExperienceItem(id: string) {
  const { data, error } = await supabase
    .from("experience_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return (data ?? null) as ExperienceItem | null;
}

export async function createExperienceItem(values: ExperienceFormValues) {
  const { data, error } = await supabase
    .from("experience_items")
    .insert(experiencePayload(values))
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("Experience item was created without an id.");

  return data.id as string;
}

export async function updateExperienceItem(
  id: string,
  values: ExperienceFormValues
) {
  const { error } = await supabase
    .from("experience_items")
    .update(experiencePayload(values))
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteExperienceItem(id: string) {
  const { error } = await supabase.from("experience_items").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

export async function updateExperiencePublished(
  id: string,
  isPublished: boolean
) {
  const { error } = await supabase
    .from("experience_items")
    .update({ is_published: isPublished })
    .eq("id", id);

  if (error) throw new Error(error.message);
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

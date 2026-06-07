import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { Testimonial } from "@/types/cms";

const supabase = createBrowserClient();

export type TestimonialFilter =
  | "all"
  | "unpublished"
  | "published"
  | "featured";

export async function listTestimonials(filter: TestimonialFilter = "all") {
  let query = supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter === "unpublished") query = query.eq("is_published", false);
  if (filter === "published") query = query.eq("is_published", true);
  if (filter === "featured") query = query.eq("is_featured", true);

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data ?? []) as Testimonial[];
}

export async function updateTestimonialFlags(
  id: string,
  flags: Partial<Pick<Testimonial, "is_published" | "is_featured">>
) {
  const { error } = await supabase.from("testimonials").update(flags).eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteTestimonial(id: string) {
  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

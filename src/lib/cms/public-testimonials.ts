import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types/cms";

export type PublicTestimonial = Pick<
  Testimonial,
  | "id"
  | "name"
  | "company"
  | "role"
  | "project_name"
  | "rating"
  | "feedback"
  | "is_featured"
  | "created_at"
>;

export async function getPublishedTestimonials() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(
      "id, name, company, role, project_name, rating, feedback, is_featured, created_at"
    )
    .eq("is_published", true)
    .eq("consent_to_publish", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as PublicTestimonial[];
}

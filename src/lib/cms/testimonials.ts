import { adminDataRequest, type AdminFilter } from "@/lib/cms/admin-api";
import type { Testimonial } from "@/types/cms";

export type TestimonialFilter =
  | "all"
  | "unpublished"
  | "published"
  | "featured";

export async function listTestimonials(filter: TestimonialFilter = "all") {
  const filters: AdminFilter[] =
    filter === "unpublished"
      ? [{ column: "is_published", value: false }]
      : filter === "published"
        ? [{ column: "is_published", value: true }]
        : filter === "featured"
          ? [{ column: "is_featured", value: true }]
          : [];

  return adminDataRequest<Testimonial[]>({
    table: "testimonials",
    action: "select",
    filters,
    orders: [{ column: "created_at", ascending: false }],
  });
}

export async function updateTestimonialFlags(
  id: string,
  flags: Partial<Pick<Testimonial, "is_published" | "is_featured">>
) {
  await adminDataRequest({
    table: "testimonials",
    action: "update",
    values: flags,
    filters: [{ column: "id", value: id }],
  });
}

export async function deleteTestimonial(id: string) {
  await adminDataRequest({
    table: "testimonials",
    action: "delete",
    filters: [{ column: "id", value: id }],
  });
}

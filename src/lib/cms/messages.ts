import { adminDataRequest, type AdminFilter } from "@/lib/cms/admin-api";
import type { ContactMessage } from "@/types/cms";

export type ContactMessageFilter = "all" | "unread" | "archived";

export async function listContactMessages(filter: ContactMessageFilter = "all") {
  const filters: AdminFilter[] =
    filter === "unread"
      ? [
          { column: "is_read", value: false },
          { column: "archived", value: false },
        ]
      : filter === "archived"
        ? [{ column: "archived", value: true }]
        : [];

  return adminDataRequest<ContactMessage[]>({
    table: "contact_messages",
    action: "select",
    filters,
    orders: [{ column: "created_at", ascending: false }],
  });
}

export async function updateContactMessageFlags(
  id: string,
  flags: Partial<Pick<ContactMessage, "is_read" | "archived">>
) {
  await adminDataRequest({
    table: "contact_messages",
    action: "update",
    values: flags,
    filters: [{ column: "id", value: id }],
  });
}

export async function deleteContactMessage(id: string) {
  await adminDataRequest({
    table: "contact_messages",
    action: "delete",
    filters: [{ column: "id", value: id }],
  });
}

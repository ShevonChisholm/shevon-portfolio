import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { ContactMessage } from "@/types/cms";

const supabase = createBrowserClient();

export type ContactMessageFilter = "all" | "unread" | "archived";

export async function listContactMessages(filter: ContactMessageFilter = "all") {
  let query = supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter === "unread") {
    query = query.eq("is_read", false).eq("archived", false);
  }

  if (filter === "archived") {
    query = query.eq("archived", true);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data ?? []) as ContactMessage[];
}

export async function updateContactMessageFlags(
  id: string,
  flags: Partial<Pick<ContactMessage, "is_read" | "archived">>
) {
  const { error } = await supabase
    .from("contact_messages")
    .update(flags)
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteContactMessage(id: string) {
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: adminProfile, error: adminProfileError } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminProfileError || !adminProfile) {
    redirect("/");
  }

  return {
    supabase,
    user,
    adminProfile,
  };
}

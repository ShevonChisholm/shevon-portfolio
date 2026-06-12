import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = createClient();
  let authResult;

  try {
    authResult = await supabase.auth.getUser();
  } catch {
    redirect("/admin/login?error=supabase_unavailable");
  }

  const user = authResult.data.user;

  if (authResult.error || !user) {
    redirect("/admin/login");
  }

  let adminResult;

  try {
    adminResult = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
  } catch {
    redirect("/admin/login?error=supabase_unavailable");
  }

  if (adminResult.error) {
    redirect("/admin/login?error=supabase_unavailable");
  }

  const adminProfile = adminResult.data;

  if (!adminProfile) {
    redirect("/");
  }

  return {
    supabase,
    user,
    adminProfile,
  };
}

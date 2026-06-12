import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("UNAUTHENTICATED");
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (adminError) throw new Error(adminError.message);
  if (!adminProfile) throw new Error("FORBIDDEN");

  return { supabase, user: authData.user };
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Admin logout failed:", error);
  }

  const response = NextResponse.json({ message: "Signed out." });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

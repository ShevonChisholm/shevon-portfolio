import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/admin/dashboard";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        return NextResponse.redirect(
          new URL("/admin/login?error=auth_callback_failed", requestUrl.origin)
        );
      }
    } catch {
      return NextResponse.redirect(
        new URL("/admin/login?error=supabase_unavailable", requestUrl.origin)
      );
    }
  } else {
    return NextResponse.redirect(
      new URL("/admin/login?error=auth_callback_failed", requestUrl.origin)
    );
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type LogoutPayload = {
  access_token?: unknown;
  refresh_token?: unknown;
};

function apiBaseUrl() {
  return (
    process.env.NEST_API_URL ||
    process.env.NEXT_PUBLIC_NEST_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001"
  ).replace(/\/+$/, "");
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as LogoutPayload;
  const accessToken = typeof payload.access_token === "string" ? payload.access_token : undefined;
  const refreshToken = typeof payload.refresh_token === "string" ? payload.refresh_token : undefined;

  try {
    await fetch(`${apiBaseUrl()}/auth/logout`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
    });
  } catch (error) {
    console.error("NestJS logout request failed:", error);
  }

  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Admin SSR session cleanup failed:", error);
  }

  const response = NextResponse.json({ success: true });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

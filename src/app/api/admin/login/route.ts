import { NextResponse } from "next/server";
import type { AuthSession } from "@/lib/api/auth-types";
import { createClient } from "@/lib/supabase/server";

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldAsString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function apiBaseUrl() {
  return (
    process.env.NEST_API_URL ||
    process.env.NEXT_PUBLIC_NEST_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001"
  ).replace(/\/+$/, "");
}

function apiErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return undefined;
  const message = (payload as { message?: unknown }).message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.filter((item): item is string => typeof item === "string").join(" ");
  return undefined;
}

export async function POST(request: Request) {
  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const email = fieldAsString(payload.email);
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  if (email.length > 254 || !emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`${apiBaseUrl()}/auth/login`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, audience: "Admin" }),
    });
    const responsePayload = (await apiResponse.json().catch(() => null)) as AuthSession | null;

    if (!apiResponse.ok || !responsePayload?.access_token || !responsePayload.refresh_token) {
      return NextResponse.json(
        { error: apiErrorMessage(responsePayload) || "Unable to sign in. Check your details." },
        { status: apiResponse.status || 401 }
      );
    }

    if (!responsePayload.context?.is_admin) {
      return NextResponse.json({ error: "This account does not have admin access." }, { status: 403 });
    }

    // Keep the legacy server-rendered CMS routes authenticated while their
    // data access is progressively moved behind the NestJS API.
    const supabase = createClient();
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: responsePayload.access_token,
      refresh_token: responsePayload.refresh_token,
    });

    if (sessionError) {
      console.error("Could not synchronize the admin SSR session:", sessionError.message);
      return NextResponse.json(
        { error: "The admin session could not be initialized. Please try again." },
        { status: 500 }
      );
    }

    const response = NextResponse.json(responsePayload);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Admin NestJS login failed:", error);
    return NextResponse.json(
      { error: "Admin services are temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type MagicLinkPayload = {
  email?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRequestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    return `${forwardedProto || "https"}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  let payload: MagicLinkPayload;

  try {
    payload = (await request.json()) as MagicLinkPayload;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";

  if (!email || email.length > 254 || !emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getRequestOrigin(
          request
        )}/auth/callback?next=/admin/dashboard`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Unable to send magic link." },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Magic link sent." });
  } catch (error) {
    console.error("Admin magic link request failed:", error);
    return NextResponse.json(
      { error: "Admin services are temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}

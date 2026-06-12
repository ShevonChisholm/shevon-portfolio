import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldAsString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const email = fieldAsString(payload.email);
  const password =
    typeof payload.password === "string" ? payload.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  if (email.length > 254 || !emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Unable to sign in. Check your details." },
        { status: 401 }
      );
    }

    const { data: adminProfile, error: adminProfileError } = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminProfileError) throw new Error(adminProfileError.message);

    if (!adminProfile) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "This account does not have admin access." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ message: "Signed in successfully." });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Admin password login failed:", error);
    return NextResponse.json(
      { error: "Admin services are temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}

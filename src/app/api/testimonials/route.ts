import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const maxLengths = {
  name: 120,
  email: 254,
  company: 160,
  role: 160,
  projectName: 160,
  feedback: 2000,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type TestimonialPayload = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  role?: unknown;
  project_name?: unknown;
  rating?: unknown;
  feedback?: unknown;
  consent_to_publish?: unknown;
};

function isTestimonialPayload(value: unknown): value is TestimonialPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fieldAsString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: string) {
  return value || null;
}

function validateTestimonialPayload(payload: TestimonialPayload) {
  const name = fieldAsString(payload.name);
  const email = fieldAsString(payload.email);
  const company = fieldAsString(payload.company);
  const role = fieldAsString(payload.role);
  const projectName = fieldAsString(payload.project_name);
  const feedback = fieldAsString(payload.feedback);
  const rating = payload.rating;

  if (!name) return { error: "Name is required." };
  if (!feedback) return { error: "Feedback is required." };
  if (payload.consent_to_publish !== true) {
    return { error: "Consent is required before submitting." };
  }

  if (name.length > maxLengths.name) {
    return { error: `Name must be ${maxLengths.name} characters or fewer.` };
  }

  if (email.length > maxLengths.email) {
    return { error: `Email must be ${maxLengths.email} characters or fewer.` };
  }

  if (email && !emailPattern.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (company.length > maxLengths.company) {
    return {
      error: `Company must be ${maxLengths.company} characters or fewer.`,
    };
  }

  if (role.length > maxLengths.role) {
    return { error: `Role must be ${maxLengths.role} characters or fewer.` };
  }

  if (projectName.length > maxLengths.projectName) {
    return {
      error: `Project name must be ${maxLengths.projectName} characters or fewer.`,
    };
  }

  if (feedback.length > maxLengths.feedback) {
    return {
      error: `Feedback must be ${maxLengths.feedback} characters or fewer.`,
    };
  }

  if (
    rating !== null &&
    rating !== undefined &&
    (!Number.isInteger(rating) || Number(rating) < 1 || Number(rating) > 5)
  ) {
    return { error: "Rating must be a whole number between 1 and 5." };
  }

  return {
    value: {
      name,
      email: optionalText(email),
      company: optionalText(company),
      role: optionalText(role),
      project_name: optionalText(projectName),
      rating: rating === null || rating === undefined ? null : Number(rating),
      feedback,
      consent_to_publish: true,
    },
  };
}

function createAnonymousClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase public environment variables are missing.");
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (!isTestimonialPayload(payload)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 }
    );
  }

  const result = validateTestimonialPayload(payload);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const supabase = createAnonymousClient();
    const { error } = await supabase.from("testimonials").insert({
      ...result.value,
      is_published: false,
      is_featured: false,
      source: "portfolio-feedback-modal",
    });

    if (error) throw new Error(error.message);

    return NextResponse.json(
      { message: "Feedback submitted successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving testimonial:", error);
    return NextResponse.json(
      { error: "Unable to submit feedback right now. Please try again." },
      { status: 500 }
    );
  }
}

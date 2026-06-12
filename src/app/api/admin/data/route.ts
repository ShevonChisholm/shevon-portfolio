import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";

const allowedTables = new Set([
  "projects",
  "project_tags",
  "project_images",
  "project_videos",
  "project_highlights",
  "project_technical_focus",
  "blog_posts",
  "experience_items",
  "education_items",
  "skill_categories",
  "skills",
  "contact_messages",
  "site_settings",
  "testimonials",
]);

type Filter = {
  column?: unknown;
  operator?: unknown;
  value?: unknown;
};

type Order = {
  column?: unknown;
  ascending?: unknown;
};

type AdminDataPayload = {
  table?: unknown;
  action?: unknown;
  select?: unknown;
  values?: unknown;
  filters?: unknown;
  orders?: unknown;
  single?: unknown;
  onConflict?: unknown;
};

function statusForError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHENTICATED") return 401;
  if (error instanceof Error && error.message === "FORBIDDEN") return 403;
  return 500;
}

function errorMessage(error: unknown) {
  const status = statusForError(error);
  if (status === 401) return "Your admin session has expired. Sign in again.";
  if (status === 403) return "This account does not have admin access.";
  return error instanceof Error ? error.message : "CMS request failed.";
}

export async function POST(request: Request) {
  let payload: AdminDataPayload;

  try {
    payload = (await request.json()) as AdminDataPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const table = typeof payload.table === "string" ? payload.table : "";
  const action = typeof payload.action === "string" ? payload.action : "";
  const filters = Array.isArray(payload.filters)
    ? (payload.filters as Filter[])
    : [];
  const orders = Array.isArray(payload.orders) ? (payload.orders as Order[]) : [];

  if (!allowedTables.has(table)) {
    return NextResponse.json({ error: "Unsupported CMS table." }, { status: 400 });
  }

  if (!["select", "insert", "update", "delete", "upsert"].includes(action)) {
    return NextResponse.json({ error: "Unsupported CMS action." }, { status: 400 });
  }

  if ((action === "update" || action === "delete") && filters.length === 0) {
    return NextResponse.json(
      { error: "Update and delete requests require a filter." },
      { status: 400 }
    );
  }

  try {
    const { supabase } = await requireAdmin();
    let query: any;

    if (action === "select") {
      query = supabase.from(table).select(
        typeof payload.select === "string" ? payload.select : "*"
      );
    } else if (action === "insert") {
      query = supabase.from(table).insert(payload.values as any);
      if (typeof payload.select === "string") query = query.select(payload.select);
    } else if (action === "update") {
      query = supabase.from(table).update(payload.values as any);
      if (typeof payload.select === "string") query = query.select(payload.select);
    } else if (action === "upsert") {
      query = supabase.from(table).upsert(payload.values as any, {
        onConflict:
          typeof payload.onConflict === "string" ? payload.onConflict : undefined,
      });
      if (typeof payload.select === "string") query = query.select(payload.select);
    } else {
      query = supabase.from(table).delete();
    }

    for (const filter of filters) {
      if (typeof filter.column !== "string") {
        return NextResponse.json({ error: "Invalid filter." }, { status: 400 });
      }
      query =
        filter.operator === "in" && Array.isArray(filter.value)
          ? query.in(filter.column, filter.value)
          : query.eq(filter.column, filter.value);
    }

    for (const order of orders) {
      if (typeof order.column !== "string") {
        return NextResponse.json({ error: "Invalid order." }, { status: 400 });
      }
      query = query.order(order.column, {
        ascending: order.ascending !== false,
      });
    }

    if (payload.single === "single") query = query.single();
    if (payload.single === "maybeSingle") query = query.maybeSingle();

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const response = NextResponse.json({ data: data ?? null });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    const status = statusForError(error);
    console.error("Admin CMS data request failed:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status });
  }
}

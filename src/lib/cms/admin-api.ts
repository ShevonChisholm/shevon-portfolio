"use client";

export type AdminFilter = {
  column: string;
  operator?: "eq" | "in";
  value: unknown;
};

export type AdminOrder = {
  column: string;
  ascending?: boolean;
};

type AdminDataRequest = {
  table: string;
  action: "select" | "insert" | "update" | "delete" | "upsert";
  select?: string;
  values?: unknown;
  filters?: AdminFilter[];
  orders?: AdminOrder[];
  single?: "single" | "maybeSingle";
  onConflict?: string;
};

export async function adminDataRequest<T = unknown>(
  request: AdminDataRequest
): Promise<T> {
  const response = await fetch("/api/admin/data", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const result = (await response.json().catch(() => null)) as
    | { data?: T; error?: string }
    | null;

  if (!response.ok) {
    throw new Error(result?.error || "Unable to complete the CMS request.");
  }

  return result?.data as T;
}

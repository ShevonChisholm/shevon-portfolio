import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";

export async function withPublicFallback<T>(
  label: string,
  request: () => Promise<T>,
  fallback: T
) {
  try {
    return await request();
  } catch (error) {
    if (isDynamicServerError(error)) throw error;

    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(`[Public CMS] ${label} unavailable: ${message}`);
    return fallback;
  }
}

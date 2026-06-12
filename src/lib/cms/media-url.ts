const supabaseStorageHost = "jkekciriprhxkgqeadep.supabase.co";
const publicStoragePrefix = "/storage/v1/object/public/";

export function isSupabasePublicMediaUrl(value: string | null | undefined) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === supabaseStorageHost &&
      url.pathname.startsWith(publicStoragePrefix)
    );
  } catch {
    return false;
  }
}

export function publicMediaUrl(value: string | null | undefined) {
  if (!value || !isSupabasePublicMediaUrl(value)) return value ?? "";
  return `/api/media?url=${encodeURIComponent(value)}`;
}

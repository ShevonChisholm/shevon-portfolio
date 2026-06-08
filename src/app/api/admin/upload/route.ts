import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  bucketForUploadKind,
  pathForUpload,
  validateCmsUploadFile,
  type CmsUploadKind,
} from "@/lib/cms/storage";

const uploadKinds = new Set<CmsUploadKind>([
  "project-cover",
  "project-gallery",
  "project-video",
  "blog-cover",
  "about-image",
  "document",
  "resume-document",
  "case-study-document",
]);

export const runtime = "nodejs";

export async function POST(request: Request) {
  const uploadContext: {
    userId: string | null;
    hasSession: boolean;
    bucket: string | null;
    path: string | null;
    kind: string | null;
  } = {
    userId: null,
    hasSession: false,
    bucket: null,
    path: null,
    kind: null,
  };

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = formData.get("kind");
    uploadContext.kind = typeof kind === "string" ? kind : null;

    if (!(file instanceof File) || typeof kind !== "string" || !uploadKinds.has(kind as CmsUploadKind)) {
      return NextResponse.json(
        { error: "A valid file and upload kind are required." },
        { status: 400 }
      );
    }

    const uploadKind = kind as CmsUploadKind;
    validateCmsUploadFile(file, uploadKind);

    const projectSlug = formData.get("projectSlug");
    const postSlug = formData.get("postSlug");
    const bucket = bucketForUploadKind(uploadKind);
    const path = pathForUpload({
      file,
      kind: uploadKind,
      projectSlug: typeof projectSlug === "string" ? projectSlug : undefined,
      postSlug: typeof postSlug === "string" ? postSlug : undefined,
    });
    uploadContext.bucket = bucket;
    uploadContext.path = path;

    const { supabase, user } = await requireAdmin();
    uploadContext.userId = user.id;

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    uploadContext.hasSession = Boolean(sessionData.session);

    console.info("[Admin media upload] Attempt", uploadContext);

    if (sessionError || !sessionData.session) {
      throw new Error("UNAUTHENTICATED");
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
      upsert: false,
    });

    if (error) throw new Error(error.message);

    console.info("[Admin media upload] Complete", uploadContext);

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    if (!data.publicUrl) throw new Error("Upload completed without a public URL.");

    return NextResponse.json(
      { bucket, path, publicUrl: data.publicUrl },
      { status: 201 }
    );
  } catch (error) {
    const rawMessage =
      error instanceof Error && error.message === "UNAUTHENTICATED"
        ? "Your admin session has expired. Sign in again."
        : error instanceof Error && error.message === "FORBIDDEN"
          ? "This account does not have admin access."
          : error instanceof Error
            ? error.message
            : "Unable to upload media.";
    const isPolicyError = rawMessage
      .toLowerCase()
      .includes("row-level security policy");
    const message = isPolicyError
      ? `Supabase Storage denied this authenticated admin upload. Verify the INSERT policy permits bucket "${uploadContext.bucket ?? "unknown"}" and path "${uploadContext.path ?? "unknown"}". Session exists: ${uploadContext.hasSession}. User id: ${uploadContext.userId ?? "none"}.`
      : rawMessage;
    const status =
      error instanceof Error && error.message === "UNAUTHENTICATED"
        ? 401
        : error instanceof Error && error.message === "FORBIDDEN"
          ? 403
          : 500;

    console.error("[Admin media upload] Failed", {
      ...uploadContext,
      error: rawMessage,
    });
    return NextResponse.json({ error: message }, { status });
  }
}

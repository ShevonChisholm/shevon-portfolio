export type CmsStorageBucket = "portfolio-media" | "portfolio-documents";

export type CmsUploadKind =
  | "project-cover"
  | "project-gallery"
  | "project-video"
  | "project-video-thumbnail"
  | "blog-cover"
  | "about-image"
  | "document"
  | "resume-document"
  | "case-study-document";

export type CmsUploadResult = {
  bucket: CmsStorageBucket;
  path: string;
  publicUrl: string;
  originalSize?: number;
  compressedSize?: number;
};

export type CmsUploadStatus = import("./video-compression").VideoUploadStatus;
export type CmsUploadStatusCallback =
  import("./video-compression").VideoUploadStatusCallback;

const imageExtensions = ["jpg", "jpeg", "png", "webp", "svg"] as const;
const videoExtensions = ["mp4", "webm"] as const;
const documentExtensions = ["pdf"] as const;

const allowedExtensionsByKind: Record<CmsUploadKind, readonly string[]> = {
  "project-cover": imageExtensions,
  "project-gallery": imageExtensions,
  "project-video": videoExtensions,
  "project-video-thumbnail": imageExtensions,
  "blog-cover": imageExtensions,
  "about-image": imageExtensions,
  document: documentExtensions,
  "resume-document": documentExtensions,
  "case-study-document": documentExtensions,
};

function extensionFor(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeFilename(fileName: string) {
  const parts = fileName.split(".");
  const extension = parts.pop()?.toLowerCase();
  const basename = sanitizeSegment(parts.join(".") || "file") || "file";

  return extension ? `${basename}.${extension}` : basename;
}

export function validateCmsUploadFile(file: File, kind: CmsUploadKind) {
  const extension = extensionFor(file);
  const allowed = allowedExtensionsByKind[kind];

  if (kind === "project-video" && !file.type.startsWith("video/")) {
    throw new Error("Unsupported video type. Please select an MP4 or WebM video.");
  }

  if (kind === "project-video" && file.size > 100 * 1024 * 1024) {
    throw new Error(
      "This video is too large. Please select a video that is 100MB or smaller."
    );
  }

  if (!allowed.includes(extension)) {
    throw new Error(
      `Unsupported file type. Allowed extensions: ${allowed.join(", ")}.`
    );
  }
}

export function pathForUpload({
  file,
  kind,
  projectSlug,
  postSlug,
}: {
  file: File;
  kind: CmsUploadKind;
  projectSlug?: string;
  postSlug?: string;
}) {
  const timestamp = Date.now();
  const extension = extensionFor(file);
  const filename = sanitizeFilename(file.name);
  const safeProjectSlug = sanitizeSegment(projectSlug || "untitled-project");
  const safePostSlug = sanitizeSegment(postSlug || "untitled-post");

  switch (kind) {
    case "project-cover":
      return `projects/${safeProjectSlug}/cover-${timestamp}.${extension}`;
    case "project-gallery":
      return `projects/${safeProjectSlug}/gallery/${timestamp}-${filename}`;
    case "project-video":
      return `projects/${safeProjectSlug}/videos/${timestamp}-${filename}`;
    case "project-video-thumbnail":
      return `projects/${safeProjectSlug}/videos/thumbnails/${timestamp}-${filename}`;
    case "blog-cover":
      return `blog/${safePostSlug}/cover-${timestamp}.${extension}`;
    case "about-image":
      return `about/about-image-${timestamp}.${extension}`;
    case "case-study-document":
      return projectSlug
        ? `projects/${safeProjectSlug}/documents/${timestamp}-${filename}`
        : `documents/${timestamp}-${filename}`;
    case "document":
      return `documents/${timestamp}-${filename}`;
    case "resume-document":
      return `documents/resume/shevon-chisholm-resume-${timestamp}.${extension}`;
  }
}

export function bucketForUploadKind(kind: CmsUploadKind): CmsStorageBucket {
  return kind === "document" ||
    kind === "resume-document" ||
    kind === "case-study-document"
    ? "portfolio-documents"
    : "portfolio-media";
}

export function acceptForUploadKind(kind: CmsUploadKind) {
  return allowedExtensionsByKind[kind].map((extension) => `.${extension}`).join(",");
}

export async function uploadCmsMedia({
  file,
  kind,
  projectSlug,
  postSlug,
  onStatus,
}: {
  file: File;
  kind: CmsUploadKind;
  projectSlug?: string;
  postSlug?: string;
  onStatus?: CmsUploadStatusCallback;
}): Promise<CmsUploadResult> {
  validateCmsUploadFile(file, kind);
  let uploadFile = file;
  let compression:
    | { originalSize: number; compressedSize: number }
    | undefined;

  if (kind === "project-video") {
    const { compressProjectVideo } = await import("./video-compression");
    const result = await compressProjectVideo(file, onStatus);
    uploadFile = result.file;
    compression = {
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
    };
    onStatus?.({
      stage: "uploading",
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
    });
  }

  const formData = new FormData();
  formData.set("file", uploadFile);
  formData.set("kind", kind);
  if (projectSlug) formData.set("projectSlug", projectSlug);
  if (postSlug) formData.set("postSlug", postSlug);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    body: formData,
  });
  const result = (await response.json().catch(() => null)) as
    | (CmsUploadResult & { error?: string })
    | null;

  if (!response.ok || !result?.publicUrl) {
    throw new Error(result?.error || "Unable to upload media.");
  }

  if (kind === "project-video" && compression) {
    onStatus?.({
      stage: "success",
      originalSize: compression.originalSize,
      compressedSize: compression.compressedSize,
      progress: 100,
    });
  }

  return { ...result, ...compression };
}

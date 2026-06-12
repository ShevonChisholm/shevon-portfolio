export const MAX_ORIGINAL_VIDEO_BYTES = 100 * 1024 * 1024;
export const MAX_COMPRESSED_VIDEO_BYTES = 45 * 1024 * 1024;

const COMPRESSION_TARGET_BYTES = 42 * 1024 * 1024;
const FFMPEG_CORE_VERSION = "0.12.10";
const FFMPEG_CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`;

export type VideoUploadStage =
  | "preparing"
  | "compressing"
  | "uploading"
  | "success";

export type VideoUploadStatus = {
  stage: VideoUploadStage;
  originalSize: number;
  compressedSize?: number;
  progress?: number;
};

export type VideoUploadStatusCallback = (
  status: VideoUploadStatus | null
) => void;

export type CompressedVideoResult = {
  file: File;
  originalSize: number;
  compressedSize: number;
};

type FFmpegInstance = import("@ffmpeg/ffmpeg").FFmpeg;

let ffmpegPromise: Promise<FFmpegInstance> | null = null;
let compressionQueue: Promise<void> = Promise.resolve();

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";

  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(megabytes >= 10 ? 1 : 2)} MB`;
}

export function validateProjectVideoFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (
    !file.type.startsWith("video/") ||
    !extension ||
    !["mp4", "webm"].includes(extension)
  ) {
    throw new Error("Unsupported video type. Please select an MP4 or WebM video.");
  }

  if (file.size > MAX_ORIGINAL_VIDEO_BYTES) {
    throw new Error(
      "This video is too large. Please select a video that is 100MB or smaller."
    );
  }
}

async function getVideoDuration(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    return await new Promise<number>((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const duration = video.duration;
        video.removeAttribute("src");
        video.load();

        if (!Number.isFinite(duration) || duration <= 0) {
          reject(new Error("Unable to determine the selected video's duration."));
          return;
        }

        resolve(duration);
      };
      video.onerror = () =>
        reject(new Error("Unable to read the selected video file."));
      video.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function loadFFmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
        import("@ffmpeg/ffmpeg"),
        import("@ffmpeg/util"),
      ]);
      const ffmpeg = new FFmpeg();
      const [coreURL, wasmURL] = await Promise.all([
        toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
        toBlobURL(
          `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      ]);

      await ffmpeg.load({ coreURL, wasmURL });
      return ffmpeg;
    })().catch((error) => {
      ffmpegPromise = null;
      throw error;
    });
  }

  return ffmpegPromise;
}

function compressedFilename(fileName: string) {
  const basename =
    fileName
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project-video";

  return `${basename}.mp4`;
}

async function compressProjectVideoNow(
  file: File,
  onStatus?: VideoUploadStatusCallback
): Promise<CompressedVideoResult> {
  const duration = await getVideoDuration(file);
  const ffmpeg = await loadFFmpeg();
  const { fetchFile } = await import("@ffmpeg/util");
  const inputExtension = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputName = `input-${token}.${inputExtension}`;
  const outputName = `output-${token}.mp4`;
  const audioBitrateKbps = 96;
  const totalTargetKbps = Math.floor(
    (COMPRESSION_TARGET_BYTES * 8) / duration / 1000
  );
  const videoBitrateKbps = Math.min(
    1800,
    Math.max(350, totalTargetKbps - audioBitrateKbps)
  );
  const maxRateKbps = Math.round(videoBitrateKbps * 1.15);
  const progressHandler = ({ progress }: { progress: number }) => {
    onStatus?.({
      stage: "compressing",
      originalSize: file.size,
      progress: Math.max(0, Math.min(100, Math.round(progress * 100))),
    });
  };

  ffmpeg.on("progress", progressHandler);

  try {
    onStatus?.({ stage: "compressing", originalSize: file.size, progress: 0 });
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    const exitCode = await ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-b:v",
      `${videoBitrateKbps}k`,
      "-maxrate",
      `${maxRateKbps}k`,
      "-bufsize",
      `${maxRateKbps * 2}k`,
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      `${audioBitrateKbps}k`,
      "-movflags",
      "+faststart",
      "-map_metadata",
      "-1",
      outputName,
    ]);

    if (exitCode !== 0) {
      throw new Error("Video compression did not complete successfully.");
    }

    const output = await ffmpeg.readFile(outputName);
    if (!(output instanceof Uint8Array)) {
      throw new Error("Video compression returned an invalid output.");
    }

    const compressedFile = new File([output], compressedFilename(file.name), {
      type: "video/mp4",
      lastModified: Date.now(),
    });

    if (compressedFile.size > MAX_COMPRESSED_VIDEO_BYTES) {
      throw new Error(
        "The compressed video is still too large. Please shorten the video or reduce its quality and try again."
      );
    }

    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.startsWith("The compressed video") ||
        error.message.startsWith("Video compression"))
    ) {
      throw error;
    }

    throw new Error(
      `Unable to compress this video. ${
        error instanceof Error ? error.message : "Please try another file."
      }`
    );
  } finally {
    ffmpeg.off("progress", progressHandler);
    await Promise.allSettled([
      ffmpeg.deleteFile(inputName),
      ffmpeg.deleteFile(outputName),
    ]);
  }
}

export function compressProjectVideo(
  file: File,
  onStatus?: VideoUploadStatusCallback
) {
  validateProjectVideoFile(file);
  onStatus?.({ stage: "preparing", originalSize: file.size, progress: 0 });

  const task = compressionQueue.then(
    () => compressProjectVideoNow(file, onStatus),
    () => compressProjectVideoNow(file, onStatus)
  );
  compressionQueue = task.then(
    () => undefined,
    () => undefined
  );

  return task;
}

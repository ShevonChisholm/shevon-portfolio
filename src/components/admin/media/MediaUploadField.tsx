"use client";

import { ChangeEvent, useEffect, useRef, useState, useTransition } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { adminDataRequest } from "@/lib/cms/admin-api";
import { AdminNotificationBridge } from "@/components/admin/notifications/AdminNotifications";
import type { CmsUploadKind } from "@/lib/cms/storage";
import {
  acceptForUploadKind,
  uploadCmsMedia,
  validateCmsUploadFile,
} from "@/lib/cms/storage";
import MediaPreview from "./MediaPreview";
import {
  formatFileSize,
  type VideoUploadStatus,
} from "@/lib/cms/video-compression";

type MediaUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  uploadKind: CmsUploadKind;
  mode?: "create" | "edit";
  uploadOnSelect?: boolean;
  onFileQueued?: (file: File | null) => void;
  queuedFile?: File | null;
  projectSlug?: string;
  postSlug?: string;
  accept?: string;
  helperText?: string;
  required?: boolean;
  multiline?: boolean;
  minRows?: number;
  previewLabel?: string;
  uploadButtonLabel?: string;
  persistOnUpload?: boolean;
  table?: string;
  field?: string;
  entityId?: string;
  uploadStatus?: VideoUploadStatus | null;
  onBusyChange?: (busy: boolean) => void;
};

export default function MediaUploadField({
  label,
  value,
  onChange,
  uploadKind,
  mode = "edit",
  uploadOnSelect,
  onFileQueued,
  queuedFile,
  projectSlug,
  postSlug,
  accept,
  helperText,
  required,
  multiline,
  minRows,
  previewLabel,
  uploadButtonLabel = "Upload file",
  persistOnUpload = false,
  table,
  field,
  entityId,
  uploadStatus,
  onBusyChange,
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [localUploadStatus, setLocalUploadStatus] =
    useState<VideoUploadStatus | null>(null);
  const shouldUploadOnSelect = uploadOnSelect ?? mode === "edit";
  const videoUploadStatus = uploadStatus ?? localUploadStatus;
  const isVideoUpload = uploadKind === "project-video";

  useEffect(() => {
    if (!queuedFile) {
      setLocalPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(queuedFile);
    setLocalPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [queuedFile]);

  const persistUploadedUrl = async (publicUrl: string) => {
    if (!persistOnUpload || !table || !field || !entityId) return;

    await adminDataRequest({
      table,
      action: "update",
      values: { [field]: publicUrl },
      filters: [{ column: "id", value: entityId }],
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setMessage(null);
    setLocalUploadStatus(null);

    if (!shouldUploadOnSelect) {
      try {
        validateCmsUploadFile(file, uploadKind);
        onFileQueued?.(file);
        setMessage({
          type: "info",
          text: "Queued for upload after project is created.",
        });
      } catch (error) {
        setLocalUploadStatus(null);
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to queue this file.",
        });
      }
      return;
    }

    startTransition(async () => {
      onBusyChange?.(true);
      try {
        const result = await uploadCmsMedia({
          file,
          kind: uploadKind,
          projectSlug,
          postSlug,
          onStatus: isVideoUpload ? setLocalUploadStatus : undefined,
        });
        onChange(result.publicUrl);
        onFileQueued?.(null);
        await persistUploadedUrl(result.publicUrl);
        setMessage({
          type: "success",
          text: isVideoUpload
            ? "Video uploaded successfully"
            : "Upload complete.",
        });
      } catch (error) {
        setLocalUploadStatus(null);
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Unable to upload file.",
        });
      } finally {
        onBusyChange?.(false);
      }
    });
  };

  const handleUrlChange = (nextValue: string) => {
    onChange(nextValue);
    if (nextValue.trim()) {
      onFileQueued?.(null);
      setMessage(null);
      setLocalUploadStatus(null);
    }
  };

  return (
    <Stack spacing={1.25}>
      <TextField
        fullWidth
        required={required}
        label={label}
        value={value}
        helperText={helperText}
        multiline={multiline}
        minRows={minRows}
        onChange={(event) => handleUrlChange(event.target.value)}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ alignItems: { xs: "stretch", sm: "center" } }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept ?? acceptForUploadKind(uploadKind)}
          hidden
          onChange={handleFileChange}
        />
        <Button
          variant="outlined"
          startIcon={
            isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <CloudUploadOutlinedIcon />
            )
          }
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? "Uploading..." : uploadButtonLabel}
        </Button>
        <Box sx={{ flex: 1 }} />
      </Stack>

      <AdminNotificationBridge message={message} />
      {message && <Alert severity={message.type}>{message.text}</Alert>}
      {isVideoUpload && videoUploadStatus && (
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            p: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {videoUploadStatus.stage === "preparing" && "Preparing video..."}
            {videoUploadStatus.stage === "compressing" &&
              "Compressing video..."}
            {videoUploadStatus.stage === "uploading" &&
              "Uploading compressed video..."}
            {videoUploadStatus.stage === "success" &&
              "Video uploaded successfully"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Original: {formatFileSize(videoUploadStatus.originalSize)}
            {typeof videoUploadStatus.compressedSize === "number" &&
              ` | Compressed: ${formatFileSize(
                videoUploadStatus.compressedSize
              )}`}
          </Typography>
          {(videoUploadStatus.stage === "preparing" ||
            videoUploadStatus.stage === "compressing" ||
            videoUploadStatus.stage === "uploading") && (
            <LinearProgress
              variant={
                videoUploadStatus.stage === "compressing" &&
                typeof videoUploadStatus.progress === "number"
                  ? "determinate"
                  : "indeterminate"
              }
              value={videoUploadStatus.progress ?? 0}
              sx={{ mt: 1, borderRadius: 99 }}
            />
          )}
        </Box>
      )}
      {queuedFile && localPreviewUrl && (
        <Box>
          <Alert severity="info" sx={{ mb: 1.25 }}>
            {queuedFile.name} ({formatFileSize(queuedFile.size)}) is queued for
            upload after project is created.
          </Alert>
          {queuedFile.type.startsWith("image/") && (
            <Box
              component="img"
              src={localPreviewUrl}
              alt={previewLabel ?? label}
              sx={{
                display: "block",
                width: "100%",
                maxHeight: 220,
                objectFit: "cover",
                borderRadius: 1.5,
              }}
            />
          )}
          {queuedFile.type.startsWith("video/") && (
            <Box
              component="video"
              src={localPreviewUrl}
              controls
              sx={{
                display: "block",
                width: "100%",
                maxHeight: 260,
                borderRadius: 1.5,
              }}
            />
          )}
          {queuedFile.type === "application/pdf" && (
            <Typography variant="body2">
              PDF queued.{" "}
              <Link href={localPreviewUrl} target="_blank" rel="noreferrer">
                Open local preview
              </Link>
            </Typography>
          )}
          <Button
            size="small"
            variant="text"
            sx={{ mt: 1 }}
            onClick={() => {
              onFileQueued?.(null);
              setMessage(null);
              setLocalUploadStatus(null);
            }}
          >
            Remove queued file
          </Button>
        </Box>
      )}
      <MediaPreview url={value} label={previewLabel ?? label} />
    </Stack>
  );
}

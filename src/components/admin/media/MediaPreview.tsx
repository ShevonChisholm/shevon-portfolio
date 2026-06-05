"use client";

import { Box, Link, Stack, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";

type MediaPreviewProps = {
  url: string;
  label?: string;
};

function mediaType(url: string) {
  const cleanUrl = url.split("?")[0].toLowerCase();

  if (/\.(jpg|jpeg|png|webp|svg)$/.test(cleanUrl)) return "image";
  if (/\.(mp4|webm)$/.test(cleanUrl)) return "video";
  if (/\.pdf$/.test(cleanUrl)) return "document";

  return "link";
}

export default function MediaPreview({ url, label = "Media preview" }: MediaPreviewProps) {
  const theme = useTheme();

  if (!url.trim()) return null;

  const type = mediaType(url);

  return (
    <Box
      sx={{
        borderRadius: 1.5,
        overflow: "hidden",
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        backgroundColor: alpha(theme.palette.common.black, 0.18),
      }}
    >
      {type === "image" && (
        <Box
          component="img"
          src={url}
          alt={label}
          sx={{
            display: "block",
            width: "100%",
            maxHeight: 220,
            objectFit: "cover",
            backgroundColor: alpha(theme.palette.common.black, 0.24),
          }}
        />
      )}

      {type === "video" && (
        <Box
          component="video"
          src={url}
          controls
          sx={{
            display: "block",
            width: "100%",
            maxHeight: 260,
            backgroundColor: theme.palette.common.black,
          }}
        />
      )}

      {(type === "document" || type === "link") && (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", p: 1.5 }}
        >
          <InsertDriveFileOutlinedIcon color="primary" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {label}
            </Typography>
            <Link
              href={url}
              target="_blank"
              rel="noreferrer"
              underline="hover"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                maxWidth: "100%",
                overflowWrap: "anywhere",
              }}
            >
              Open file <OpenInNewOutlinedIcon fontSize="inherit" />
            </Link>
          </Box>
        </Stack>
      )}
    </Box>
  );
}

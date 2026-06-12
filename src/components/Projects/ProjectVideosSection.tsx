"use client";

import {
  Box,
  Button,
  Chip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import type {
  PublicProjectVideo,
} from "@/lib/cms/public-projects";

type ProjectVideosSectionProps = {
  videos: PublicProjectVideo[];
  onWatch: (video: PublicProjectVideo) => void;
};

const videoTypeLabels: Record<PublicProjectVideo["videoType"], string> = {
  website_walkthrough: "Website Walkthrough",
  admin_cms_walkthrough: "Admin CMS Walkthrough",
  mobile_experience: "Mobile Experience",
  technical_backend: "Technical / Backend",
  demo: "General Demo",
  other: "Other",
};

function canPlayInDialog(url: string): boolean {
  try {
    const parsed = new URL(url, "https://portfolio.local");
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();
    const proxiedUrl = parsed.searchParams.get("url");

    return (
      (pathname === "/api/media" &&
        Boolean(proxiedUrl) &&
        canPlayInDialog(proxiedUrl as string)) ||
      /\.(mp4|webm)$/.test(pathname) ||
      hostname.includes("youtube.com") ||
      hostname.includes("youtu.be") ||
      hostname.includes("vimeo.com") ||
      hostname.includes("loom.com")
    );
  } catch {
    return false;
  }
}

export default function ProjectVideosSection({
  videos,
  onWatch,
}: ProjectVideosSectionProps) {
  const theme = useTheme();

  if (!videos.length) return null;

  return (
    <Box
      id="project-videos"
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        mb: { xs: 5, md: 6 },
        scrollMarginTop: 92,
      }}
    >
      <Typography
        component="h2"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 800,
          fontSize: "1.05rem",
          "&::before": {
            content: '""',
            width: 3,
            height: 16,
            borderRadius: 4,
            bgcolor: "primary.main",
          },
        }}
      >
        Project Videos
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
          },
          gap: { xs: 2, sm: 2.5 },
        }}
      >
        {videos.map((video, index) => {
          const playable = canPlayInDialog(video.videoUrl);

          return (
            <Box
              key={`${video.videoUrl}-${index}`}
              sx={{
                minWidth: 0,
                overflow: "hidden",
                borderRadius: 1.5,
                display: "flex",
                flexDirection: "column",
                backgroundColor: alpha(theme.palette.background.paper, 0.58),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  height: 178,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `linear-gradient(145deg, ${alpha(
                    theme.palette.primary.main,
                    0.09
                  )}, ${alpha(theme.palette.common.black, 0.72)})`,
                }}
              >
                {video.thumbnailUrl ? (
                  <Box
                    component="img"
                    src={video.thumbnailUrl}
                    alt={`${video.title} video thumbnail`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <PlayCircleOutlineIcon
                    sx={{
                      color: "primary.main",
                      fontSize: 42,
                      opacity: 0.92,
                    }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  p: 1.8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 1.25,
                  flex: 1,
                }}
              >
                <Chip
                  size="small"
                  label={videoTypeLabels[video.videoType]}
                  sx={{
                    height: 20,
                    borderRadius: 1,
                    color: "primary.main",
                    fontWeight: 800,
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    fontSize: "0.56rem",
                  }}
                />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, lineHeight: 1.3 }}>
                  {video.title}
                </Typography>
                {video.description && (
                  <Typography
                    sx={{ color: "text.secondary", fontSize: "0.66rem", lineHeight: 1.55 }}
                  >
                    {video.description}
                  </Typography>
                )}
                <Box sx={{ flex: 1 }} />
                {playable ? (
                  <Button
                    variant="outlined"
                    startIcon={<PlayCircleOutlineIcon />}
                    onClick={() => onWatch(video)}
                    sx={{ mt: 0.5, minHeight: 28, px: 1.5, borderRadius: 4, fontSize: "0.62rem", fontWeight: 800 }}
                  >
                    Watch Video
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<OpenInNewIcon />}
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 0.5, minHeight: 28, px: 1.5, borderRadius: 4, fontSize: "0.62rem", fontWeight: 800 }}
                  >
                    Watch Video
                  </Button>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

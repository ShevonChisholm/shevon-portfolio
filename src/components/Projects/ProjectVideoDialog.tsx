"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Dialog,
  IconButton,
  Slider,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";

type ProjectVideoDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string;
};

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsedUrl.pathname.slice(1)}`;
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId =
        parsedUrl.searchParams.get("v") ??
        parsedUrl.pathname.split("/").filter(Boolean).at(-1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsedUrl.hostname.includes("vimeo.com")) {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean).at(-1);
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export default function ProjectVideoDialog({
  open,
  onClose,
  title,
  videoUrl,
}: ProjectVideoDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const embedUrl = getEmbedUrl(videoUrl);

  useEffect(() => {
    if (!open) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setHasError(false);
    }
  }, [open]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setHasError(true);
      }
    } else {
      video.pause();
    }
  };

  const handleSeek = (_event: Event, value: number | number[]) => {
    const nextTime = Array.isArray(value) ? value[0] : value;
    if (videoRef.current) videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolume = (_event: Event, value: number | number[]) => {
    const nextVolume = Array.isArray(value) ? value[0] : value;
    if (videoRef.current) {
      videoRef.current.volume = nextVolume;
      videoRef.current.muted = nextVolume === 0;
    }
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const enterFullscreen = async () => {
    await playerRef.current?.requestFullscreen?.();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: "16px" },
          overflow: "hidden",
          backgroundColor: "#0a0a0a",
          backgroundImage: "none",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
          boxShadow: `0 28px 80px ${alpha(theme.palette.common.black, 0.72)}`,
        },
      }}
    >
      <Box
        sx={{
          minHeight: 64,
          px: { xs: 2, sm: 2.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
            Project video
          </Typography>
          <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Box>

        <Tooltip title="Close video">
          <IconButton onClick={onClose} aria-label="Close video">
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        ref={playerRef}
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          minHeight: { xs: 240, sm: 360 },
          backgroundColor: theme.palette.common.black,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {embedUrl ? (
          <Box
            component="iframe"
            src={embedUrl}
            title={`${title} project video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            sx={{ width: "100%", height: "100%", border: 0 }}
          />
        ) : (
          <>
            <Box
              component="video"
              ref={videoRef}
              src={videoUrl}
              playsInline
              preload="metadata"
              onClick={togglePlayback}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={(event) =>
                setCurrentTime(event.currentTarget.currentTime)
              }
              onLoadedMetadata={(event) =>
                setDuration(event.currentTarget.duration)
              }
              onEnded={() => setIsPlaying(false)}
              onError={() => setHasError(true)}
              sx={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "contain",
                cursor: "pointer",
              }}
            />

            {hasError ? (
              <Typography color="text.secondary" sx={{ position: "absolute" }}>
                This video could not be played.
              </Typography>
            ) : (
              !isPlaying && (
                <IconButton
                  onClick={togglePlayback}
                  aria-label="Play video"
                  sx={{
                    position: "absolute",
                    width: { xs: 68, sm: 82 },
                    height: { xs: 68, sm: 82 },
                    color: theme.palette.common.white,
                    backgroundColor: alpha(theme.palette.primary.main, 0.88),
                    boxShadow: `0 12px 32px ${alpha(
                      theme.palette.common.black,
                      0.45
                    )}`,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      transform: "scale(1.06)",
                    },
                  }}
                >
                  <PlayArrowRoundedIcon sx={{ fontSize: { xs: 42, sm: 52 } }} />
                </IconButton>
              )
            )}

            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                px: { xs: 1.5, sm: 2.5 },
                py: { xs: 1, sm: 1.5 },
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 1.5 },
                background: `linear-gradient(transparent, ${alpha(
                  theme.palette.common.black,
                  0.95
                )})`,
              }}
            >
              <Tooltip title={isPlaying ? "Pause" : "Play"}>
                <IconButton
                  onClick={togglePlayback}
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                  color="primary"
                >
                  {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                </IconButton>
              </Tooltip>

              <Typography
                variant="caption"
                sx={{ minWidth: { xs: 72, sm: 88 }, color: "common.white" }}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>

              <Slider
                value={currentTime}
                min={0}
                max={duration || 0}
                onChange={handleSeek}
                aria-label="Video progress"
                size="small"
                sx={{ flex: 1 }}
              />

              <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                <IconButton onClick={toggleMute} aria-label="Toggle mute">
                  {isMuted || volume === 0 ? (
                    <VolumeOffRoundedIcon />
                  ) : (
                    <VolumeUpRoundedIcon />
                  )}
                </IconButton>
              </Tooltip>

              <Slider
                value={isMuted ? 0 : volume}
                min={0}
                max={1}
                step={0.05}
                onChange={handleVolume}
                aria-label="Video volume"
                size="small"
                sx={{ width: 80, display: { xs: "none", sm: "block" } }}
              />

              <Tooltip title="Fullscreen">
                <IconButton onClick={enterFullscreen} aria-label="Fullscreen video">
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </>
        )}
      </Box>
    </Dialog>
  );
}

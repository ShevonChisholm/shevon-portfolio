"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import Image from "next/image";
import type { PublicProjectShowcaseItem } from "@/lib/cms/public-projects";

type ProjectShowcaseCarouselProps = {
  items: PublicProjectShowcaseItem[];
};

export default function ProjectShowcaseCarousel({
  items,
}: ProjectShowcaseCarouselProps) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const activeItem = items[activeIndex];
  const hasMultipleItems = items.length > 1;

  useEffect(() => {
    if (activeIndex > items.length - 1) setActiveIndex(0);
  }, [activeIndex, items.length]);

  if (!activeItem) return null;

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % items.length);
  };

  const handleTouchEnd = (endX: number) => {
    if (touchStartX.current === null) return;

    const distance = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 45 || !hasMultipleItems) return;
    if (distance > 0) showPrevious();
    else showNext();
  };

  const stage = (expandedView = false) => (
    <Box
      tabIndex={0}
      aria-label={`${activeItem.title}. Showcase image ${
        activeIndex + 1
      } of ${items.length}. Use left and right arrow keys to navigate.`}
      onKeyDown={(event) => {
        if (!hasMultipleItems) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          showPrevious();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          showNext();
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) =>
        handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)
      }
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        height: expandedView
          ? "100%"
          : { xs: 300, sm: 360, md: 390 },
        minHeight: expandedView ? 0 : { xs: 260, sm: 340 },
        overflow: "hidden",
        borderRadius: expandedView ? 0 : 0,
        backgroundColor: alpha(theme.palette.common.white, 0.035),
        border: expandedView
          ? "none"
          : `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
        touchAction: "pan-y",
        outline: "none",
        "&:focus-visible": {
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
        },
      }}
    >
      <Image
        key={activeItem.image}
        src={activeItem.image}
        alt={activeItem.altText}
        fill
        sizes={
          expandedView
            ? "100vw"
            : "(max-width: 900px) 100vw, 1200px"
        }
        style={{ objectFit: "contain", objectPosition: "center" }}
      />

      {!expandedView && (
        <Tooltip title="Expand image">
          <IconButton
            aria-label="Expand showcase image"
            onClick={() => setExpanded(true)}
            sx={{
              position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: theme.palette.common.white,
            borderRadius: 1.5,
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.38)}`,
              backdropFilter: "blur(8px)",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.86),
                transform: "translate(-50%, -50%) scale(1.04)",
              },
            }}
          >
            <OpenInFullIcon />
          </IconButton>
        </Tooltip>
      )}

      {hasMultipleItems && (
        <>
          <CarouselButton
            label="Previous showcase image"
            side="left"
            onClick={showPrevious}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </CarouselButton>
          <CarouselButton
            label="Next showcase image"
            side="right"
            onClick={showNext}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </CarouselButton>
        </>
      )}
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          borderRadius: 1.5,
          overflow: "hidden",
          backgroundColor: alpha(theme.palette.background.paper, 0.46),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        {stage()}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            px: { xs: 2, sm: 2.25 },
            py: 1.7,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, lineHeight: 1.3 }}>
              {activeItem.title}
            </Typography>
            {activeItem.description && (
              <Typography
                sx={{ color: "text.secondary", mt: 0.35, fontSize: "0.63rem", lineHeight: 1.5 }}
              >
                {activeItem.description}
              </Typography>
            )}
          </Box>
          <Typography
            sx={{
              flexShrink: 0,
              color: "text.secondary",
              fontSize: "0.62rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {activeIndex + 1} / {items.length}
          </Typography>
        </Stack>

        {hasMultipleItems && (
          <Box
            role="tablist"
            aria-label="Project showcase images"
            sx={{
              display: "flex",
              gap: 1.25,
              overflowX: "auto",
              px: { xs: 2, sm: 2.25 },
              pb: 1.8,
              scrollbarWidth: "thin",
              scrollbarColor: `${alpha(
                theme.palette.primary.main,
                0.5
              )} transparent`,
              "&::-webkit-scrollbar": { height: 5 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: alpha(theme.palette.primary.main, 0.45),
                borderRadius: 999,
              },
            }}
          >
            {items.map((item, index) => {
              const active = index === activeIndex;

              return (
                <Box
                  component="button"
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`View ${item.title}`}
                  key={`${item.image}-${index}`}
                  onClick={() => setActiveIndex(index)}
                  sx={{
                    position: "relative",
                    width: { xs: 72, sm: 74 },
                    height: { xs: 44, sm: 44 },
                    p: 0,
                    flex: "0 0 auto",
                    overflow: "hidden",
                    borderRadius: 1,
                    cursor: "pointer",
                    border: `1px solid ${
                      active
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.14)
                    }`,
                    backgroundColor: alpha(theme.palette.common.black, 0.3),
                    opacity: active ? 1 : 0.68,
                    transition:
                      "opacity 160ms ease, border-color 160ms ease, transform 160ms ease",
                    "&:hover": {
                      opacity: 1,
                      transform: "translateY(-2px)",
                    },
                    "&:focus-visible": {
                      outline: `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="118px"
                    style={{ objectFit: "cover" }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Dialog
        open={expanded}
        onClose={() => setExpanded(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "calc(100vw - 24px)",
            height: "calc(100dvh - 24px)",
            maxWidth: "1600px",
            m: 1.5,
            overflow: "hidden",
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.common.black, 0.96),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
          },
        }}
      >
        <DialogContent sx={{ position: "relative", p: 0, height: "100%" }}>
          {stage(true)}
          <Tooltip title="Close expanded image">
            <IconButton
              aria-label="Close expanded showcase image"
              onClick={() => setExpanded(false)}
              sx={{
                position: "absolute",
                zIndex: 2,
                top: 12,
                right: 12,
                color: theme.palette.common.white,
                backgroundColor: alpha(theme.palette.common.black, 0.72),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.86),
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CarouselButton({
  label,
  side,
  onClick,
  children,
}: {
  label: string;
  side: "left" | "right";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={onClick}
        sx={{
          position: "absolute",
          zIndex: 1,
          top: "50%",
          [side]: { xs: 8, sm: 12 },
          transform: "translateY(-50%)",
          color: theme.palette.common.white,
          width: 30,
          height: 30,
          backgroundColor: alpha(theme.palette.common.black, 0.72),
          backdropFilter: "blur(8px)",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.86),
          },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

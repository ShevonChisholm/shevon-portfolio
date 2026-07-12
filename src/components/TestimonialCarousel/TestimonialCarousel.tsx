"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import type { PublicTestimonial } from "@/lib/cms/public-testimonials";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Rating,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AccountTreeOutlined as AccountTreeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  CodeOutlined as CodeIcon,
  FormatQuoteOutlined as FormatQuoteOutlinedIcon,
  InboxOutlined as InboxOutlinedIcon,
  RateReviewOutlined as RateReviewOutlinedIcon,
  RocketLaunchOutlined as RocketLaunchIcon,
} from "@mui/icons-material";
import { AnimatePresence, m as motion } from "framer-motion";
import FeedbackDialog from "@/components/Testimonials/FeedbackDialog";

type TestimonialCarouselProps = {
  testimonials?: PublicTestimonial[];
};

type Strength = {
  title: string;
  description: string;
  icon: ReactElement;
};

const previewLength = 220;

const strengths: Strength[] = [
  {
    title: "Product-Focused Engineering",
    description:
      "I build with the end user and business workflow in mind, not just the code. My work connects frontend experience, backend logic, and real operational needs.",
    icon: <RocketLaunchIcon />,
  },
  {
    title: "Full-Stack Delivery",
    description:
      "I can move across React, Next.js, React Native, NestJS, APIs, databases, authentication, payments, and deployment to help bring products from idea to release.",
    icon: <AccountTreeIcon />,
  },
  {
    title: "Clean, Maintainable Systems",
    description:
      "I focus on practical architecture, reusable patterns, clear data flow, and reliable features that can be maintained and improved over time.",
    icon: <CodeIcon />,
  },
];

function testimonialContext(testimonial: PublicTestimonial) {
  return [testimonial.role, testimonial.company, testimonial.project_name]
    .filter(Boolean)
    .join(" · ");
}

function shouldClamp(value: string) {
  return value.length > previewLength;
}

function preview(value: string) {
  return shouldClamp(value) ? `${value.slice(0, previewLength).trim()}...` : value;
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: "repeat(3, minmax(0, 1fr))",
        },
        gridAutoRows: "1fr",
        gap: 2,
        alignItems: "stretch",
      }}
    >
      {children}
    </Box>
  );
}

function StrengthCards() {
  const theme = useTheme();

  return (
    <CardGrid>
      {strengths.map((item, index) => {
        const highlighted = index === 1;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            style={{ display: "flex", minWidth: 0, width: "100%", height: "100%" }}
          >
            <Box
              sx={{
                width: "100%",
                minWidth: 0,
                minHeight: 210,
                height: "100%",
                p: 2.75,
                borderRadius: 1.5,
                bgcolor: highlighted
                  ? alpha(theme.palette.primary.main, 0.045)
                  : alpha(theme.palette.background.paper, 0.72),
                border: `1px solid ${
                  highlighted
                    ? alpha(theme.palette.primary.main, 0.38)
                    : alpha(theme.palette.common.white, 0.11)
                }`,
                transition: "transform 200ms ease, border-color 200ms ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  borderColor: alpha(theme.palette.primary.main, 0.45),
                },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: "grid",
                  placeItems: "center",
                  mb: 2,
                  borderRadius: 1,
                  color: highlighted ? "primary.main" : "text.secondary",
                  bgcolor: highlighted
                    ? alpha(theme.palette.primary.main, 0.13)
                    : alpha(theme.palette.common.white, 0.055),
                  "& svg": { fontSize: 17 },
                }}
              >
                {item.icon}
              </Box>
              <Typography
                component="h4"
                sx={{
                  mb: 1,
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: "0.82rem",
                  fontWeight: 800,
                }}
              >
                {item.title}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", lineHeight: 1.65 }}>
                {item.description}
              </Typography>
            </Box>
          </motion.div>
        );
      })}
    </CardGrid>
  );
}

export default function TestimonialCarousel({
  testimonials = [],
}: TestimonialCarouselProps) {
  const theme = useTheme();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState<PublicTestimonial | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const next = useCallback(() => {
    setCurrent((value) => (value + 1) % Math.max(testimonials.length, 1));
  }, [testimonials.length]);

  const previous = useCallback(() => {
    setCurrent((value) => (value - 1 + testimonials.length) % Math.max(testimonials.length, 1));
  }, [testimonials.length]);

  useEffect(() => {
    if (paused || testimonials.length <= 1) return;
    const timer = window.setInterval(next, 6000);
    return () => window.clearInterval(timer);
  }, [next, paused, testimonials.length]);

  useEffect(() => {
    if (current > testimonials.length - 1) setCurrent(0);
  }, [current, testimonials.length]);

  if (testimonials.length === 0) {
    return (
      <Box>
        <StrengthCards />
        <Box sx={{ mt: 4.5, textAlign: "center" }}>
          <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", mb: 1.5 }}>
            Worked with me?
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RateReviewOutlinedIcon />}
            onClick={() => setFeedbackOpen(true)}
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.35),
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            Leave Feedback
          </Button>
          <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
        </Box>
      </Box>
    );
  }

  const active = testimonials[current] ?? testimonials[0];
  const activeContext = testimonialContext(active);

  return (
    <Box
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Testimonials carousel"
      sx={{ maxWidth: 760, mx: "auto", outline: "none" }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.common.white, 0.11)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.72),
          minHeight: { xs: 330, sm: 300 },
        }}
      >
        <AnimatePresence mode="wait">
          <Box
            component={motion.div}
            key={active.id}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            sx={{
              position: "relative",
              p: { xs: 3, md: 4.5 },
              minHeight: { xs: 330, sm: 300 },
              display: "flex",
              flexDirection: "column",
            }}
          >
            <FormatQuoteOutlinedIcon
              sx={{
                position: "absolute",
                top: 26,
                right: 30,
                color: alpha(theme.palette.primary.main, 0.15),
                fontSize: { xs: 56, md: 72 },
                transform: "rotate(-10deg)",
              }}
            />

            {active.rating && (
              <Rating
                value={active.rating}
                readOnly
                size="small"
                sx={{
                  mb: 2.5,
                  color: "primary.main",
                  "& .MuiRating-iconEmpty": {
                    color: alpha(theme.palette.common.white, 0.18),
                  },
                }}
              />
            )}

            <Typography
              sx={{
                position: "relative",
                flex: 1,
                maxWidth: 610,
                color: "text.secondary",
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                lineHeight: 1.75,
                fontStyle: "italic",
              }}
            >
              &ldquo;{preview(active.feedback)}&rdquo;
            </Typography>

            {shouldClamp(active.feedback) && (
              <Button
                onClick={() => setExpanded(active)}
                sx={{ alignSelf: "flex-start", minHeight: 30, mt: 1, px: 0, color: "primary.main" }}
              >
                Read full feedback
              </Button>
            )}

            <Box
              sx={{
                mt: 3,
                pt: 2.5,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 2,
                borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 900 }}>
                  {active.name}
                </Typography>
                {activeContext && (
                  <Typography sx={{ mt: 0.35, color: "text.secondary", fontSize: "0.66rem", lineHeight: 1.35 }}>
                    {activeContext}
                  </Typography>
                )}
              </Box>
              {active.project_name && (
                <Box
                  sx={{
                    flexShrink: 0,
                    px: 1.2,
                    py: 0.55,
                    borderRadius: 999,
                    color: "primary.main",
                    bgcolor: alpha(theme.palette.primary.main, 0.09),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                    fontSize: "0.62rem",
                    fontWeight: 800,
                  }}
                >
                  {active.project_name}
                </Box>
              )}
            </Box>
          </Box>
        </AnimatePresence>
      </Box>

      {testimonials.length > 1 && (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "center", mt: 3 }}>
          <IconButton
            onClick={previous}
            aria-label="Previous testimonial"
            sx={{
              width: 38,
              height: 38,
              color: "text.secondary",
              border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
              "&:hover": { color: "primary.main", borderColor: alpha(theme.palette.primary.main, 0.38) },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }}>
            {testimonials.map((testimonial, index) => (
              <Box
                key={testimonial.id}
                component="button"
                onClick={() => setCurrent(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={index === current}
                sx={{
                  width: index === current ? 28 : 8,
                  height: 8,
                  p: 0,
                  border: 0,
                  borderRadius: 999,
                  cursor: "pointer",
                  bgcolor: index === current ? "primary.main" : alpha(theme.palette.common.white, 0.18),
                  transition: "width 180ms ease, background-color 180ms ease",
                }}
              />
            ))}
          </Stack>
          <IconButton
            onClick={next}
            aria-label="Next testimonial"
            sx={{
              width: 38,
              height: 38,
              color: "text.secondary",
              border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
              "&:hover": { color: "primary.main", borderColor: alpha(theme.palette.primary.main, 0.38) },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      )}

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", mb: 1.4 }}>
          Worked with me?
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RateReviewOutlinedIcon />}
          onClick={() => setFeedbackOpen(true)}
          sx={{
            borderColor: alpha(theme.palette.primary.main, 0.35),
            color: "primary.main",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          Leave Feedback
        </Button>
      </Box>

      <Dialog
        open={Boolean(expanded)}
        onClose={() => setExpanded(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: "background.paper",
            border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
            backgroundImage: "none",
          },
        }}
      >
        <DialogContent sx={{ position: "relative", p: { xs: 3, md: 4 } }}>
          <IconButton
            onClick={() => setExpanded(null)}
            aria-label="Close full testimonial"
            sx={{ position: "absolute", top: 12, right: 12 }}
          >
            <CloseIcon />
          </IconButton>
          {expanded ? (
            <Stack spacing={2.2}>
              {expanded.rating && <Rating value={expanded.rating} readOnly size="small" />}
              <Typography sx={{ color: "text.secondary", fontSize: "0.96rem", lineHeight: 1.75, fontStyle: "italic", pr: 3 }}>
                &ldquo;{expanded.feedback}&rdquo;
              </Typography>
              <Box sx={{ pt: 2, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}` }}>
                <Typography sx={{ fontWeight: 900 }}>{expanded.name}</Typography>
                {testimonialContext(expanded) && (
                  <Typography sx={{ mt: 0.3, color: "text.secondary", fontSize: "0.75rem" }}>
                    {testimonialContext(expanded)}
                  </Typography>
                )}
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </Box>
  );
}

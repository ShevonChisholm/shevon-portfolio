"use client";

import type { ReactElement } from "react";
import type { PublicTestimonial } from "@/lib/cms/public-testimonials";
import { Box, Rating, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AccountTreeOutlined as AccountTreeIcon,
  CodeOutlined as CodeIcon,
  FormatQuoteOutlined as FormatQuoteOutlinedIcon,
  RocketLaunchOutlined as RocketLaunchIcon,
} from "@mui/icons-material";
import { m as motion } from "framer-motion";

type TestimonialCarouselProps = {
  testimonials?: PublicTestimonial[];
};

type Strength = {
  title: string;
  description: string;
  icon: ReactElement;
};

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

export default function TestimonialCarousel({
  testimonials = [],
}: TestimonialCarouselProps) {
  const theme = useTheme();

  if (testimonials.length > 0) {
    return (
      <CardGrid>
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            style={{ display: "flex", minWidth: 0, width: "100%", height: "100%" }}
          >
            <Box
              sx={{
                width: "100%",
                minWidth: 0,
                minHeight: 270,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                p: 2.75,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.background.paper, 0.72),
                border: `1px solid ${
                  testimonial.is_featured
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
              <FormatQuoteOutlinedIcon sx={{ mb: 1.7, color: "primary.main", fontSize: 22 }} />

              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.8rem",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                  flex: 1,
                }}
              >
                &ldquo;{testimonial.feedback}&rdquo;
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  pt: 1.8,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 1.5,
                  borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 800 }}>
                    {testimonial.name}
                  </Typography>
                  {testimonialContext(testimonial) && (
                    <Typography
                      sx={{
                        mt: 0.35,
                        color: "text.secondary",
                        fontSize: "0.6rem",
                        lineHeight: 1.35,
                      }}
                    >
                      {testimonialContext(testimonial)}
                    </Typography>
                  )}
                </Box>
                {testimonial.rating && (
                  <Rating
                    value={testimonial.rating}
                    readOnly
                    size="small"
                    sx={{
                      flexShrink: 0,
                      color: "primary.main",
                      fontSize: "0.9rem",
                      "& .MuiRating-iconEmpty": {
                        color: alpha(theme.palette.common.white, 0.18),
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          </motion.div>
        ))}
      </CardGrid>
    );
  }

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

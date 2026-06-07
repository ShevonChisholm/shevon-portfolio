"use client";

import { Box, Grid, Rating, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { m as motion } from "framer-motion";
import CodeIcon from "@mui/icons-material/Code";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import type { PublicTestimonial } from "@/lib/cms/public-testimonials";

const strengths = [
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

type TestimonialCarouselProps = {
  testimonials?: PublicTestimonial[];
};

function roleCompany(testimonial: PublicTestimonial) {
  return [testimonial.role, testimonial.company].filter(Boolean).join(" at ");
}

export default function TestimonialCarousel({
  testimonials = [],
}: TestimonialCarouselProps) {
  const theme = useTheme();

  if (testimonials.length > 0) {
    return (
      <Box sx={{ width: "100%" }}>
        <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
          {testimonials.map((testimonial, index) => (
            <Grid
              key={testimonial.id}
              size={{ xs: 12, md: 4 }}
              sx={{ display: "flex" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                style={{ height: "100%", width: "100%" }}
              >
                <Box
                  sx={{
                    height: "100%",
                    minHeight: 310,
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "20px",
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      testimonial.is_featured ? 0.4 : 0.12
                    )}`,
                    transition:
                      "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      borderColor: alpha(theme.palette.primary.main, 0.42),
                      boxShadow: `0 16px 32px ${alpha(
                        theme.palette.common.black,
                        0.18
                      )}`,
                    },
                  }}
                >
                  <FormatQuoteOutlinedIcon
                    sx={{ color: "primary.main", fontSize: 38, mb: 1.5 }}
                  />

                  {testimonial.rating && (
                    <Rating
                      value={testimonial.rating}
                      readOnly
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Typography
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.8,
                      mb: 3,
                      flex: 1,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    &ldquo;{testimonial.feedback}&rdquo;
                  </Typography>

                  <Typography sx={{ fontWeight: 800, color: "text.primary" }}>
                    {testimonial.name}
                  </Typography>

                  {roleCompany(testimonial) && (
                    <Typography variant="body2" sx={{ color: "primary.main", mt: 0.5 }}>
                      {roleCompany(testimonial)}
                    </Typography>
                  )}

                  {testimonial.project_name && (
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 1 }}>
                      Project: {testimonial.project_name}
                    </Typography>
                  )}
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={3}>
        {strengths.map((item, index) => (
          <Grid key={item.title} size={{ xs: 12, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
              style={{ height: "100%" }}
            >
              <Box
                sx={{
                  height: "100%",
                  p: 3,
                  borderRadius: "20px",
                  backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  transition:
                    "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    borderColor: alpha(theme.palette.primary.main, 0.35),
                    boxShadow: `0 16px 32px ${alpha(
                      theme.palette.common.black,
                      0.18
                    )}`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  }}
                >
                  {item.icon}
                </Box>

                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    color: theme.palette.text.primary,
                  }}
                >
                  {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.7,
                  }}
                >
                  {item.description}
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

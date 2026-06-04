"use client";

import { Box, Grid, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { m as motion } from "framer-motion";
import CodeIcon from "@mui/icons-material/Code";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

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

export default function TestimonialCarousel() {
  const theme = useTheme();

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

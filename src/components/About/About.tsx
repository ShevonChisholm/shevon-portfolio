"use client";

import { Box, Grid, Typography, useTheme } from "@mui/material";
import { m } from "framer-motion";
import Image from "next/image";
import SectionContainer from "../SectionContainer/SectionContainer";

export default function About() {
  const theme = useTheme();

  return (
    <SectionContainer
      id="about"
      title="About Me"
      subtitle="Building practical software solutions for real business needs"
    >
      <Grid container spacing={6} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <m.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box
              sx={{
                position: "relative",
                height: { xs: "300px", md: "400px" },
                width: "100%",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: `0 20px 40px ${
                  theme.palette.mode === "dark"
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(0, 0, 0, 0.1)"
                }`,
              }}
            >
              <Image
                src="/about-me.jpg"
                alt="Shevon's profile"
                fill
                style={{ objectFit: "cover" }}
              />
            </Box>
          </m.div>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <m.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "1rem", md: "1.1rem" },
                mb: 3,
                color: theme.palette.text.primary,
              }}
            >
              I&apos;m a Full-Stack Engineer with 5+ years of professional experience
              building production web and mobile applications. I specialize in React,
              Next.js, React Native, NestJS, TypeScript, and API-driven architectures,
              with experience taking ideas from requirements through development,
              integration, and deployment.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "1rem", md: "1.1rem" },
                color: theme.palette.text.primary,
              }}
            >
              My work spans healthcare, media, business operations, budgeting, and
              client-focused platforms. I&apos;ve built user interfaces, REST APIs,
              authentication flows, subscription/payment features, admin portals, and
              cloud-connected systems. My background in HR, entrepreneurship, and
              hands-on client work helps me understand real operational problems and
              translate them into clean, maintainable software.
            </Typography>
          </m.div>
        </Grid>
      </Grid>
    </SectionContainer>
  );
}

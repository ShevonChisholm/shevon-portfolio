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
      subtitle="Passionate about creating innovative solutions through code"
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
              I’m a passionate Full-Stack Developer with six years of coding
              experience—three years in school and three years on the job. I’ve
              mastered JavaScript, TypeScript, React, and backend technologies,
              building everything from SPAs to RESTful APIs with a focus on
              clean, maintainable architecture.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "1rem", md: "1.1rem" },
                color: theme.palette.text.primary,
              }}
            >
              In my professional career, I’ve delivered polished web and mobile
              apps using Next.js, React Native, and Node.js, integrating
              services like Stripe and AWS. I collaborate closely with designers
              and product owners to craft seamless user experiences and am known
              for my attention to detail and elegant solutions.
            </Typography>
          </m.div>
        </Grid>
      </Grid>
    </SectionContainer>
  );
}

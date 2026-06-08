"use client";

import { Box, Grid, Typography, useTheme } from "@mui/material";
import { m } from "framer-motion";
import Image from "next/image";
import type { AboutSettingsValue } from "@/types/cms";
import SectionContainer from "../SectionContainer/SectionContainer";

type AboutClientProps = {
  about: AboutSettingsValue;
};

export default function AboutClient({ about }: AboutClientProps) {
  const theme = useTheme();
  const imageUrl = about.image_url || "/about-me.jpg";

  return (
    <SectionContainer id="about" title="About Me" subtitle={about.subtitle}>
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
                backgroundColor: theme.palette.background.paper,
                boxShadow: `0 20px 40px ${
                  theme.palette.mode === "dark"
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(0, 0, 0, 0.1)"
                }`,
              }}
            >
              <Image
                src={imageUrl}
                alt={about.image_alt || "Shevon Chisholm"}
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
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
              {about.paragraph_one}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "1rem", md: "1.1rem" },
                color: theme.palette.text.primary,
              }}
            >
              {about.paragraph_two}
            </Typography>
          </m.div>
        </Grid>
      </Grid>
    </SectionContainer>
  );
}

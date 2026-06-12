"use client";

import type { AboutSettingsValue } from "@/types/cms";
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import { m } from "framer-motion";
import Image from "next/image";

type AboutClientProps = {
  about: AboutSettingsValue;
};

const industries = [
  "Fintech",
  "Healthcare",
  "Travel",
  "Media",
  "E-commerce",
  "SaaS",
];

const metrics = [
  { value: "7+ Years", label: "Experience" },
  { value: "Full-Stack", label: "Specialisation" },
  { value: "Remote", label: "Availability" },
];

function HighlightedSubtitle({ subtitle }: { subtitle: string }) {
  const match = subtitle.match(/solutions/i);

  if (!match || match.index === undefined) {
    return <>{subtitle}</>;
  }

  const start = match.index;
  const end = start + match[0].length;

  return (
    <>
      {subtitle.slice(0, start)}
      <Box component="span" sx={{ color: "primary.main" }}>
        {subtitle.slice(start, end)}
      </Box>
      {subtitle.slice(end)}
    </>
  );
}

function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <Box
      component="img"
      src="/sc-logo.svg"
      alt="Shevon Chisholm logo"
      sx={{
        width: size,
        height: size,
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}

export default function AboutClient({ about }: AboutClientProps) {
  const theme = useTheme();
  const imageUrl = about.image_url || "/about-me.jpg";

  return (
    <Box
      component="section"
      id="about"
      sx={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        py: { xs: 9, md: 12 },
        borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
      }}
    >
      <Container maxWidth={false} sx={{ width: "100%", maxWidth: 1040 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "460px minmax(0, 1fr)" },
            gap: { xs: 6, md: 7.5 },
            alignItems: "center",
          }}
        >
          <m.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            style={{ minWidth: 0, width: "100%" }}
          >
            <Box sx={{ position: "relative", pt: 1.5, pr: { xs: 0, sm: 1.5 }, pb: 1.5 }}>
              <Box
                aria-hidden="true"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: -12,
                  width: 58,
                  height: 58,
                  borderTop: `1px solid ${theme.palette.primary.main}`,
                  borderLeft: `1px solid ${theme.palette.primary.main}`,
                  borderRadius: "12px 0 0 0",
                }}
              />
              <Box
                aria-hidden="true"
                sx={{
                  position: "absolute",
                  right: { xs: -4, sm: 0 },
                  bottom: 0,
                  width: 58,
                  height: 58,
                  borderRight: `1px solid ${theme.palette.primary.main}`,
                  borderBottom: `1px solid ${theme.palette.primary.main}`,
                  borderRadius: "0 0 12px 0",
                }}
              />

              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1.26 / 1",
                  minHeight: { xs: 300, sm: 360 },
                  overflow: "hidden",
                  borderRadius: 1.5,
                  bgcolor: "#f2f3f6",
                  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
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

              <Box
                sx={{
                  position: "absolute",
                  left: { xs: 16, sm: 20 },
                  bottom: { xs: -8, sm: -6 },
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  minWidth: 150,
                  px: 1.5,
                  py: 1.1,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.background.paper, 0.97),
                  border: `1px solid ${alpha(theme.palette.common.white, 0.11)}`,
                  boxShadow: `0 14px 32px ${alpha(theme.palette.common.black, 0.42)}`,
                }}
              >
                <BrandMark />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, lineHeight: 1.2 }}>
                    Available Now
                  </Typography>
                  <Typography sx={{ mt: 0.3, color: "text.secondary", fontSize: "0.58rem" }}>
                    Remote · Full-time
                  </Typography>
                </Box>
              </Box>
            </Box>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            style={{ minWidth: 0, width: "100%" }}
          >
            <Chip
              label="ABOUT ME"
              size="small"
              variant="outlined"
              sx={{
                height: 28,
                mb: 3.5,
                borderRadius: 4,
                color: "primary.main",
                borderColor: alpha(theme.palette.primary.main, 0.38),
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                fontSize: "0.65rem",
                fontWeight: 800,
              }}
            />

            <Typography
              variant="h2"
              sx={{
                maxWidth: 520,
                mb: 3.25,
                fontSize: { xs: "2rem", sm: "2.35rem", md: "2.25rem" },
                lineHeight: 1.14,
                fontWeight: 800,
              }}
            >
              <HighlightedSubtitle subtitle={about.subtitle} />
            </Typography>

            <Stack spacing={1.6} sx={{ mb: 3.5 }}>
              <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", lineHeight: 1.7 }}>
                {about.paragraph_one}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", lineHeight: 1.7 }}>
                {about.paragraph_two}
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" },
                gap: 1.5,
                mb: 3.5,
              }}
            >
              {metrics.map((metric) => (
                <Box
                  key={metric.label}
                  sx={{
                    minHeight: 76,
                    px: 1.8,
                    py: 1.7,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.background.paper, 0.82),
                    border: `1px solid ${alpha(theme.palette.common.white, 0.11)}`,
                  }}
                >
                  <Typography
                    sx={{
                      color: "primary.main",
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: "0.92rem",
                      fontWeight: 800,
                    }}
                  >
                    {metric.value}
                  </Typography>
                  <Typography sx={{ mt: 0.6, color: "text.secondary", fontSize: "0.64rem" }}>
                    {metric.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Typography
              sx={{
                mb: 1,
                color: "text.secondary",
                fontFamily: '"Montserrat", sans-serif',
                fontSize: "0.65rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
              }}
            >
              INDUSTRIES
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 3.5 }}>
              {industries.map((industry) => (
                <Chip
                  key={industry}
                  label={industry}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 24,
                    borderRadius: 1,
                    color: "text.secondary",
                    borderColor: alpha(theme.palette.common.white, 0.13),
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    fontSize: "0.65rem",
                  }}
                />
              ))}
            </Box>

            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() =>
                document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
              }
              sx={{ minHeight: 38, px: 2.25 }}
            >
              See My Projects
            </Button>
          </m.div>
        </Box>
      </Container>
    </Box>
  );
}

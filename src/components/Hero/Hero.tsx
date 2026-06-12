"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ArrowOutward as ArrowOutwardIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  FiberManualRecord as FiberManualRecordIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
} from "@mui/icons-material";
import { m as motion } from "framer-motion";
import Link from "next/link";
import AnimatedBackground from "../AnimatedBackground/AnimatedBackground";

const coreSkills = [
  "React",
  "Next.js",
  "React Native",
  "NestJS",
  "TypeScript",
  "PostgreSQL",
  "Node.js",
  "AWS",
];

const strengths = [
  "React, Next.js, React Native & NestJS specialist",
  "End-to-end: APIs, auth, subscriptions, cloud deployments",
  "Available for full-time remote or contract roles",
];

const metrics = [
  { value: "5+", label: "Years Experience" },
  { value: "20+", label: "Projects Delivered" },
  { value: "10+", label: "Production Apps" },
];

function BrandMark({ size = 72 }: { size?: number }) {
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

export default function Hero() {
  const theme = useTheme();

  return (
    <Box
      id="home"
      component="section"
      sx={{
        minHeight: { xs: "auto", lg: "100svh" },
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        pt: { xs: 13, md: 14, lg: 12 },
        pb: { xs: 8, md: 9, lg: 5 },
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
      }}
    >
      <AnimatedBackground />

      <Container
        maxWidth={false}
        sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1040 }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              lg: "minmax(0, 1fr) 363px",
            },
            gap: { xs: 6, lg: 5 },
            alignItems: "center",
          }}
        >
          <motion.div
            style={{ minWidth: 0, width: "100%" }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Chip
              icon={<FiberManualRecordIcon />}
              label="Open to remote opportunities"
              variant="outlined"
              size="small"
              sx={{
                mb: { xs: 3, md: 4.5 },
                height: 28,
                borderRadius: 4,
                color: "text.secondary",
                borderColor: alpha(theme.palette.common.white, 0.15),
                bgcolor: alpha(theme.palette.background.paper, 0.48),
                fontWeight: 600,
                "& .MuiChip-icon": { color: "#21D787", fontSize: 11 },
              }}
            />

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.7rem", sm: "3.8rem", md: "4.15rem" },
                lineHeight: 1.02,
                mb: 1.5,
                minWidth: 0,
                overflowWrap: "anywhere",
                whiteSpace: { lg: "nowrap" },
              }}
            >
              Shevon{" "}
              <Box
                component="span"
                sx={{ color: "primary.main", display: { xs: "block", sm: "inline" } }}
              >
                Chisholm
              </Box>
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                fontFamily: '"Montserrat", sans-serif',
                fontSize: { xs: "1.05rem", md: "1.15rem" },
                fontWeight: 600,
                mb: 4,
              }}
            >
              Full-Stack Engineer
            </Typography>

            <Typography
              sx={{
                width: "100%",
                maxWidth: 580,
                overflowWrap: "anywhere",
                color: "text.secondary",
                fontSize: { xs: "0.98rem", md: "1rem" },
                lineHeight: 1.75,
                mb: 3.5,
              }}
            >
              I build scalable web and mobile products — from customer-facing
              platforms to business-critical systems. Production-ready code,
              clean architecture, fast delivery.
            </Typography>

            <Stack spacing={1.25} sx={{ mb: 3.5 }}>
              {strengths.map((strength) => (
                <Box
                  key={strength}
                  sx={{ display: "flex", alignItems: "flex-start", gap: 1.15, minWidth: 0 }}
                >
                  <CheckCircleOutlineIcon sx={{ color: "primary.main", fontSize: 15 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", minWidth: 0, overflowWrap: "anywhere" }}
                  >
                    {strength}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.85, mb: 4, minWidth: 0 }}>
              {coreSkills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{
                    height: 25,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.background.paper, 0.82),
                    color: "text.secondary",
                    border: `1px solid ${alpha(theme.palette.common.white, 0.13)}`,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                />
              ))}
            </Box>

            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              <Button
                variant="contained"
                disableElevation
                startIcon={<VisibilityOutlinedIcon />}
                onClick={() =>
                  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
                }
                sx={{ minHeight: 42, px: 2.5 }}
              >
                View My Work
              </Button>
              <Button
                component={Link}
                variant="outlined"
                startIcon={<DescriptionOutlinedIcon />}
                href="/resume"
                sx={{
                  minHeight: 42,
                  px: 2.5,
                  color: "text.primary",
                  borderColor: alpha(theme.palette.common.white, 0.2),
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                View Resume
              </Button>
            </Stack>
          </motion.div>

          <motion.div
            style={{ minWidth: 0, width: "100%" }}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: 440, lg: 363 },
                mx: { xs: "auto", lg: 0 },
                borderRadius: 2,
                px: { xs: 2.5, sm: 3.5 },
                py: { xs: 3, sm: 3.5 },
                bgcolor: alpha(theme.palette.background.paper, 0.82),
                border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
                boxShadow: `0 24px 70px ${alpha(theme.palette.common.black, 0.25)}`,
              }}
            >
              <Stack alignItems="center" spacing={1}>
                <BrandMark />
                <Typography sx={{ fontWeight: 800, fontSize: "0.9rem" }}>
                  Shevon Chisholm
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Full-Stack Engineer
                </Typography>
              </Stack>

              <Divider sx={{ my: 3, borderColor: alpha(theme.palette.common.white, 0.09) }} />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 1,
                  textAlign: "center",
                }}
              >
                {metrics.map((metric) => (
                  <Box key={metric.label} sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: "primary.main",
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: { xs: "1.25rem", sm: "1.45rem" },
                        fontWeight: 800,
                      }}
                    >
                      {metric.value}
                    </Typography>
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: "0.56rem", sm: "0.62rem" },
                        lineHeight: 1.35,
                      }}
                    >
                      {metric.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 3, borderColor: alpha(theme.palette.common.white, 0.09) }} />

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Let&apos;s work together
                </Typography>
                <ArrowOutwardIcon sx={{ color: "primary.main", fontSize: 17 }} />
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}

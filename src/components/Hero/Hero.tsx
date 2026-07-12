"use client";

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
import {
  ArrowOutward as ArrowOutwardIcon,
  BusinessCenterOutlined as BusinessCenterOutlinedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CorporateFareOutlined as CorporateFareOutlinedIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  FiberManualRecord as FiberManualRecordIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
} from "@mui/icons-material";
import { m as motion } from "framer-motion";
import Link from "next/link";
import AnimatedBackground from "../AnimatedBackground/AnimatedBackground";
import { publicContainerSx } from "@/theme/layout";

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

type AudienceCardProps = {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  highlighted?: boolean;
  actions: {
    label: string;
    href: string;
    variant?: "contained" | "outlined" | "text";
  }[];
};

function AudienceCard({
  icon,
  eyebrow,
  title,
  description,
  highlighted = false,
  actions,
}: AudienceCardProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        p: 2.7,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.82),
        border: `1px solid ${
          highlighted
            ? alpha(theme.palette.primary.main, 0.38)
            : alpha(theme.palette.common.white, 0.12)
        }`,
        boxShadow: `0 24px 70px ${alpha(theme.palette.common.black, 0.25)}`,
        transition: "border-color 180ms ease, transform 180ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: alpha(theme.palette.primary.main, 0.5),
        },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          top: -40,
          right: -28,
          width: 132,
          height: 132,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.primary.main, highlighted ? 0.12 : 0.07),
          filter: "blur(38px)",
        }}
      />
      <Stack direction="row" spacing={1.4} sx={{ alignItems: "center", mb: 1.8, position: "relative" }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            borderRadius: 1.4,
            color: "primary.main",
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            "& svg": { fontSize: 20 },
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            color: highlighted ? "primary.main" : "text.secondary",
            fontSize: "0.58rem",
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </Typography>
      </Stack>
      <Typography
        component="h3"
        sx={{
          position: "relative",
          mb: 1.1,
          fontFamily: '"Montserrat", sans-serif',
          fontSize: "0.98rem",
          lineHeight: 1.3,
          fontWeight: 900,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          position: "relative",
          mb: 2,
          color: "text.secondary",
          fontSize: "0.77rem",
          lineHeight: 1.65,
        }}
      >
        {description}
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {actions.map((action) => (
          <Button
            key={action.label}
            component={Link}
            href={action.href}
            variant={action.variant ?? "text"}
            size="small"
            sx={{
              minHeight: 30,
              px: 1.35,
              fontSize: "0.62rem",
              borderColor: alpha(theme.palette.common.white, 0.18),
              color: action.variant === "contained" ? "primary.contrastText" : "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                color: action.variant === "contained" ? "primary.contrastText" : "primary.main",
              },
            }}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Box>
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

      <Container maxWidth="xl" sx={{ ...publicContainerSx, position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              lg: "minmax(0, 1fr) 363px",
            },
            gap: { xs: 6, lg: 7 },
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
              label="Available for remote roles, contract work & business projects"
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
              Building production-ready web, mobile, and business software
              solutions for companies and growing businesses.
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
                variant="contained"
                href="/start-project"
                sx={{ minHeight: 42, px: 2.5 }}
              >
                Start Project
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
            <Stack spacing={2} sx={{ width: "100%", maxWidth: { xs: 440, lg: 363 }, mx: { xs: "auto", lg: 0 } }}>
              <AudienceCard
                icon={<BusinessCenterOutlinedIcon />}
                eyebrow="For Companies"
                title="Looking for a Full-Stack Engineer?"
                description="I build scalable platforms, APIs, mobile apps, dashboards, and production-ready systems for technical teams and businesses."
                actions={[
                  { label: "View Resume", href: "/resume", variant: "outlined" },
                  { label: "Experience", href: "/#experience" },
                  { label: "Projects", href: "/#projects" },
                ]}
              />
              <AudienceCard
                highlighted
                icon={<CorporateFareOutlinedIcon />}
                eyebrow="For Businesses"
                title="Need a website, system, or automation tool?"
                description="I help businesses launch professional websites, admin portals, dashboards, and custom software that support real operations."
                actions={[
                  { label: "Start a Project", href: "/start-project", variant: "contained" },
                  { label: "View Services", href: "/services", variant: "outlined" },
                ]}
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1,
                  color: "text.secondary",
                  fontSize: "0.72rem",
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <BrandMark size={20} />
                  <span>Systems built around real workflows</span>
                </Stack>
                <ArrowOutwardIcon sx={{ color: "primary.main", fontSize: 15 }} />
              </Box>
            </Stack>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}

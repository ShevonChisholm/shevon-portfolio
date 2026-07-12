"use client";

import { useState } from "react";
import Link from "next/link";
import type { PortfolioContactSettings } from "@/types/cms";
import {
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  EmailOutlined as EmailIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  LocationOnOutlined as LocationOnIcon,
  PhoneOutlined as PhoneIcon,
  RateReviewOutlined as RateReviewOutlinedIcon,
} from "@mui/icons-material";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import FeedbackDialog from "@/components/Testimonials/FeedbackDialog";
import { publicContainerSx } from "@/theme/layout";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Projects", href: "/#projects" },
  { name: "Experience", href: "/#experience" },
  { name: "Blog", href: "/#blog" },
  { name: "Contact", href: "/#contact" },
  { name: "Client Portal", href: "/client" },
];

function LogoMark() {
  return (
    <Box
      component="img"
      src="/sc-logo.svg"
      alt="Shevon Chisholm logo"
      sx={{ width: 40, height: 40, display: "block", flexShrink: 0 }}
    />
  );
}

function phoneHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : undefined;
}

export default function FooterClient({ settings }: { settings: PortfolioContactSettings }) {
  const theme = useTheme();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const contactEmail = settings.contact_email || "chisholmshevon@gmail.com";
  const contactPhone = settings.contact_phone || "+1 (876) 514-2426";
  const location = settings.location || "Jamaica - Remote";
  const linkedinUrl = settings.linkedin_url || "https://www.linkedin.com/in/shevon-chisholm-6ba802230";
  const githubUrl = settings.github_url || "https://github.com/ShevonChisholm";

  const contactLinks = [
    { label: contactEmail, href: `mailto:${contactEmail}`, icon: <EmailIcon /> },
    { label: contactPhone, href: phoneHref(contactPhone), icon: <PhoneIcon /> },
    { label: location, icon: <LocationOnIcon /> },
    { label: "LinkedIn", href: linkedinUrl, icon: <LinkedInIcon /> },
    { label: "GitHub", href: githubUrl, icon: <GitHubIcon /> },
  ];

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        bgcolor: alpha(theme.palette.background.paper, 0.22),
        borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
      }}
    >
      <Container maxWidth="xl" sx={{ ...publicContainerSx, py: { xs: 6, md: 7 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1.2fr 0.8fr 1fr" },
            gap: { xs: 4, md: 7 },
            pb: 4,
          }}
        >
          <Box>
            <Stack direction="row" spacing={1.3} sx={{ alignItems: "center", mb: 2 }}>
              <LogoMark />
              <Box>
                <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: "0.82rem", fontWeight: 900 }}>
                  Shevon Chisholm
                </Typography>
                <Typography
                  sx={{
                    color: "primary.main",
                    fontSize: "0.56rem",
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Full-Stack Engineer
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ maxWidth: 330, color: "text.secondary", fontSize: "0.76rem", lineHeight: 1.7, mb: 2 }}>
              Building scalable web and mobile products from customer-facing platforms to business-critical systems.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "primary.main" }}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.14)}`,
                }}
              />
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700 }}>
                Available for remote opportunities
              </Typography>
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ mb: 2, fontSize: "0.65rem", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Navigate
            </Typography>
            <Stack spacing={1}>
              {navLinks.map((item) => (
                <Box
                  key={item.name}
                  component={Link}
                  href={item.href}
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.78rem",
                    textDecoration: "none",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {item.name}
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ mb: 2, fontSize: "0.65rem", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Get in touch
            </Typography>
            <Stack spacing={1.25}>
              {contactLinks.map((item) => {
                const external = item.href?.startsWith("http");
                const content = (
                  <>
                    <Box sx={{ color: "primary.main", display: "grid", placeItems: "center", "& svg": { fontSize: 16 } }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", overflowWrap: "anywhere" }}>
                      {item.label}
                    </Typography>
                  </>
                );

                if (!item.href) {
                  return (
                    <Stack key={item.label} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      {content}
                    </Stack>
                  );
                }

                return (
                  <Stack
                    key={item.label}
                    component="a"
                    href={item.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                      color: "inherit",
                      textDecoration: "none",
                      "&:hover p": { color: "primary.main" },
                    }}
                  >
                    {content}
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        </Box>

        <Box
          sx={{
            pt: 3,
            borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
            © {new Date().getFullYear()} Shevon Chisholm. All rights reserved.
          </Typography>
          <Stack direction="row" flexWrap="wrap" spacing={2} sx={{ alignItems: "center", justifyContent: "center" }}>
            <ThemeToggle />
            <Button
              component={Link}
              href="/start-project"
              variant="text"
              sx={{ color: "text.secondary", fontSize: "0.68rem", minWidth: 0, p: 0, "&:hover": { color: "primary.main" } }}
            >
              Start a Project
            </Button>
            <Button
              onClick={() => setFeedbackOpen(true)}
              variant="text"
              startIcon={<RateReviewOutlinedIcon sx={{ fontSize: 15 }} />}
              sx={{ color: "text.secondary", fontSize: "0.68rem", minWidth: 0, p: 0, "&:hover": { color: "primary.main" } }}
            >
              Leave Feedback
            </Button>
            <IconButton
              component="a"
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              sx={{ width: 30, height: 30, color: "text.secondary", border: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}
            >
              <LinkedInIcon sx={{ fontSize: 15 }} />
            </IconButton>
            <IconButton
              component="a"
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              sx={{ width: 30, height: 30, color: "text.secondary", border: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}
            >
              <GitHubIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Stack>
        </Box>
      </Container>
      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </Box>
  );
}

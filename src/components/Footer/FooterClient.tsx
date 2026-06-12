"use client";

import { useState } from "react";
import type { PortfolioContactSettings } from "@/types/cms";
import {
  Box,
  Button,
  Container,
  IconButton,
  Link,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  EmailOutlined as EmailIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  RateReviewOutlined as RateReviewOutlinedIcon,
} from "@mui/icons-material";
import FeedbackDialog from "@/components/Testimonials/FeedbackDialog";

const quickLinks = [
  { name: "Home", href: "/#home" },
  { name: "About", href: "/#about" },
  { name: "Projects", href: "/#projects" },
  { name: "Blog", href: "/#blog" },
  { name: "Contact", href: "/#contact" },
];

function BrandMark() {
  return (
    <Box
      component="img"
      src="/sc-logo.svg"
      alt="Shevon Chisholm logo"
      sx={{
        width: 38,
        height: 38,
        display: "block",
        mx: "auto",
        mb: 1,
      }}
    />
  );
}

export default function FooterClient({ settings }: { settings: PortfolioContactSettings }) {
  const theme = useTheme();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const socials = [
    { label: "LinkedIn", url: settings.linkedin_url, icon: <LinkedInIcon /> },
    { label: "GitHub", url: settings.github_url, icon: <GitHubIcon /> },
    { label: "Email", url: `mailto:${settings.contact_email}`, icon: <EmailIcon /> },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 8, md: 9 },
        bgcolor: "background.default",
        borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
      }}
    >
      <Container maxWidth={false} sx={{ width: "100%", maxWidth: 1040, textAlign: "center" }}>
        <BrandMark />
        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: "0.78rem", fontWeight: 800 }}>
          Shevon Chisholm
        </Typography>
        <Typography sx={{ mt: 0.4, color: "primary.main", fontSize: "0.58rem", fontWeight: 800, textTransform: "uppercase" }}>
          Full-Stack Engineer
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.8, my: 2.5 }}>
          {socials.map((social) => (
            <IconButton
              key={social.label}
              component="a"
              href={social.url}
              target={social.url.startsWith("http") ? "_blank" : undefined}
              rel={social.url.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={social.label}
              sx={{
                width: 32,
                height: 32,
                color: "text.secondary",
                border: `1px solid ${alpha(theme.palette.common.white, 0.11)}`,
                "& svg": { fontSize: 15 },
                "&:hover": { color: "primary.main", borderColor: alpha(theme.palette.primary.main, 0.42) },
              }}
            >
              {social.icon}
            </IconButton>
          ))}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: { xs: 2, sm: 3 }, mb: 2.5 }}>
          {quickLinks.map((link) => (
            <Link key={link.name} href={link.href} underline="none" sx={{ color: "text.secondary", fontSize: "0.72rem", "&:hover": { color: "primary.main" } }}>
              {link.name}
            </Link>
          ))}
        </Box>

        <Button
          variant="outlined"
          startIcon={<RateReviewOutlinedIcon />}
          onClick={() => setFeedbackOpen(true)}
          sx={{ minHeight: 34, mb: 2.8, px: 2.25, borderRadius: 4, fontSize: "0.68rem" }}
        >
          Leave Feedback
        </Button>

        <Typography sx={{ color: "text.secondary", fontSize: "0.62rem" }}>
          © {new Date().getFullYear()} Shevon Chisholm. All rights reserved.
        </Typography>
      </Container>
      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </Box>
  );
}

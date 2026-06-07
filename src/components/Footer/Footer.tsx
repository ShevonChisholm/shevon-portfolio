"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  Typography,
  Link,
  useTheme,
} from "@mui/material";
import {
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  RateReviewOutlined as RateReviewOutlinedIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { m as motion } from "framer-motion";
import FeedbackDialog from "@/components/Testimonials/FeedbackDialog";

const socialLinks = [
  {
    icon: <LinkedInIcon />,
    url: "https://linkedin.com/in/shevon-chisholm-6ba802230",
    label: "LinkedIn",
  },
  {
    icon: <GitHubIcon />,
    url: "https://github.com/chisholmshevon45",
    label: "GitHub",
  },
  {
    icon: <EmailIcon />,
    url: "mailto:chisholmshevon@gmail.com",
    label: "Email",
  },
];

const quickLinks = [
  { name: "Home", href: "/#home" },
  { name: "About", href: "/#about" },
  { name: "Projects", href: "/#projects" },
  { name: "Blog", href: "/#blog" },
  { name: "Contact", href: "/#contact" },
];

export default function Footer() {
  const theme = useTheme();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        py: { xs: 5, md: 6 },
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              Shevon Chisholm
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Full-Stack Engineer
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            {socialLinks.map((social) => (
              <IconButton
                key={social.label}
                component="a"
                href={social.url}
                target={social.url.startsWith("http") ? "_blank" : undefined}
                rel={
                  social.url.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                aria-label={social.label}
                sx={{
                  mx: 0.75,
                  color: theme.palette.text.secondary,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  transition:
                    "color 0.2s ease, background-color 0.2s ease, transform 0.2s ease",
                  "&:hover": {
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: { xs: 2, sm: 3 },
              mb: 3,
            }}
          >
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                color="text.secondary"
                underline="none"
                sx={{
                  fontWeight: 500,
                  transition: "color 0.2s ease",
                  "&:hover": {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                {link.name}
              </Link>
            ))}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<RateReviewOutlinedIcon />}
              onClick={() => setFeedbackOpen(true)}
              sx={{
                px: 3,
                borderColor: alpha(theme.palette.primary.main, 0.42),
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.14),
                },
              }}
            >
              Leave Feedback
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Shevon Chisholm. All rights reserved.
          </Typography>
        </motion.div>
      </Container>
      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </Box>
  );
}

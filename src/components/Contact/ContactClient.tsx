"use client";

import { useState, type ReactElement } from "react";
import type { PortfolioContactSettings } from "@/types/cms";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Link as MuiLink,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  EmailOutlined as EmailIcon,
  LinkedIn as LinkedInIcon,
  LocationOnOutlined as LocationIcon,
  PhoneOutlined as PhoneIcon,
  SendOutlined as SendIcon,
} from "@mui/icons-material";
import { m as motion } from "framer-motion";
import { useSubmitPublicContactMutation } from "@/lib/api/public-services-api";
import { publicContainerSx } from "@/theme/layout";

type ContactClientProps = {
  settings: PortfolioContactSettings;
};

interface ContactInfo {
  icon: ReactElement;
  title: string;
  content: string;
  href?: string;
}

function phoneHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : undefined;
}

export default function ContactClient({ settings }: ContactClientProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitContact, submitContactState] = useSubmitPublicContactMutation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const contactInfo: ContactInfo[] = [
    { icon: <EmailIcon />, title: "Email", content: settings.contact_email, href: `mailto:${settings.contact_email}` },
    { icon: <PhoneIcon />, title: "Phone", content: settings.contact_phone, href: phoneHref(settings.contact_phone) },
    { icon: <LocationIcon />, title: "Location", content: settings.location },
    {
      icon: <LinkedInIcon />,
      title: "LinkedIn",
      content: settings.linkedin_url.replace(/^https?:\/\//, ""),
      href: settings.linkedin_url,
    },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await submitContact({
        ...formData,
        source: "portfolio-contact-form",
      }).unwrap();
      setSnackbar({ open: true, message: "Message sent successfully!", severity: "success" });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to send message. You can also reach me directly by email.",
        severity: "error",
      });
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  return (
    <Box
      component="section"
      id="contact"
      sx={{
        py: { xs: 9, md: 12 },
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
      }}
    >
      <Container maxWidth="xl" sx={publicContainerSx}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "flex-end" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: 2.5,
            mb: { xs: 4.5, md: 5.5 },
          }}
        >
          <Box>
            <Chip
              label="CONTACT"
              size="small"
              variant="outlined"
              sx={{
                height: 28,
                mb: 2,
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
              component="h2"
              sx={{ fontSize: { xs: "2rem", md: "2.3rem" }, lineHeight: 1.12, fontWeight: 800 }}
            >
              Let&apos;s work{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                together
              </Box>
            </Typography>
          </Box>
          <Typography
            sx={{
              maxWidth: 360,
              color: "text.secondary",
              textAlign: { xs: "left", md: "right" },
              fontSize: "0.8rem",
              lineHeight: 1.55,
            }}
          >
            Open to remote opportunities, freelance work, and product-focused engineering roles
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "380px minmax(0, 1fr)" },
            gap: { xs: 3, md: 3 },
            alignItems: "start",
          }}
        >
          <Box sx={{ display: "grid", gap: 1.25 }}>
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    minHeight: 66,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.6,
                    px: 2,
                    py: 1.25,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.background.paper, 0.72),
                    border: `1px solid ${alpha(theme.palette.common.white, 0.11)}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      borderRadius: 1,
                      color: "primary.main",
                      bgcolor: alpha(theme.palette.primary.main, 0.13),
                      "& svg": { fontSize: 17 },
                    }}
                  >
                    {info.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.58rem", fontWeight: 800, textTransform: "uppercase" }}>
                      {info.title}
                    </Typography>
                    {info.href ? (
                      <MuiLink
                        href={info.href}
                        target={info.href.startsWith("http") ? "_blank" : undefined}
                        rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        underline="hover"
                        sx={{ color: "text.primary", fontSize: "0.75rem", overflowWrap: "anywhere" }}
                      >
                        {info.content}
                      </MuiLink>
                    ) : (
                      <Typography sx={{ color: "text.primary", fontSize: "0.75rem", overflowWrap: "anywhere" }}>
                        {info.content}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </Box>

          <Paper
            component={motion.div}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.25 },
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.background.paper, 0.72),
              border: `1px solid ${alpha(theme.palette.common.white, 0.11)}`,
            }}
          >
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: "0.92rem", fontWeight: 800 }}>
              Send a Message
            </Typography>
            <Typography sx={{ mt: 0.6, mb: 2.5, color: "text.secondary", fontSize: "0.76rem" }}>
              Tell me about the opportunity or project, and I&apos;ll get back to you.
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 1.5,
                }}
              >
                <TextField fullWidth required placeholder="Name *" name="name" value={formData.name} onChange={handleChange} disabled={submitContactState.isLoading} />
                <TextField fullWidth required type="email" placeholder="Email *" name="email" value={formData.email} onChange={handleChange} disabled={submitContactState.isLoading} />
                <TextField fullWidth placeholder="Subject" name="subject" value={formData.subject} onChange={handleChange} disabled={submitContactState.isLoading} sx={{ gridColumn: "1 / -1" }} />
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={5}
                  placeholder="Message *"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  disabled={submitContactState.isLoading}
                  sx={{ gridColumn: "1 / -1" }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitContactState.isLoading}
                  startIcon={<SendIcon />}
                  sx={{ gridColumn: "1 / -1", minHeight: 40 }}
                >
                  {submitContactState.isLoading ? "Sending..." : "Send Message"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

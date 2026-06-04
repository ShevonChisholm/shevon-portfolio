"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Link as MuiLink,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  LinkedIn as LinkedInIcon,
} from "@mui/icons-material";
import { m as motion } from "framer-motion";

interface ContactInfo {
  icon: React.ReactElement;
  title: string;
  content: string;
  href?: string;
}

const contactInfo: ContactInfo[] = [
  {
    icon: <EmailIcon />,
    title: "Email",
    content: "chisholmshevon@gmail.com",
    href: "mailto:chisholmshevon@gmail.com",
  },
  {
    icon: <PhoneIcon />,
    title: "Phone",
    content: "+1 (876) 514-2426",
    href: "tel:+18765142426",
  },
  {
    icon: <LocationIcon />,
    title: "Location",
    content: "Jamaica · Open to remote overseas roles",
  },
  {
    icon: <LinkedInIcon />,
    title: "LinkedIn",
    content: "linkedin.com/in/shevon-chisholm-6ba802230",
    href: "https://www.linkedin.com/in/shevon-chisholm-6ba802230",
  },
];

export default function Contact() {
  const theme = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Message sent successfully!",
          severity: "success",
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch {
      setSnackbar({
        open: true,
        message:
          "Failed to send message. You can also reach me directly by email.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }} id="contact">
      <Typography variant="h2" component="h2" align="center" gutterBottom>
        Let&apos;s Work Together
      </Typography>

      <Typography
        variant="subtitle1"
        align="center"
        sx={{
          color: theme.palette.text.secondary,
          maxWidth: "760px",
          mx: "auto",
          mb: 6,
          lineHeight: 1.7,
        }}
      >
        Have a role, project, or product idea that needs a reliable full-stack
        developer? I&apos;m open to remote opportunities, freelance work, and
        product-focused engineering roles.
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box>
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    borderRadius: "18px",
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.12
                    )}`,
                    transition:
                      "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: alpha(theme.palette.primary.main, 0.35),
                      boxShadow: `0 14px 28px ${alpha(
                        theme.palette.common.black,
                        0.16
                      )}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      flexShrink: 0,
                    }}
                  >
                    {info.icon}
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{ fontWeight: 700, fontSize: "1rem" }}
                    >
                      {info.title}
                    </Typography>

                    {info.href ? (
                      <MuiLink
                        href={info.href}
                        target={info.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          info.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        underline="hover"
                        sx={{
                          color: theme.palette.text.secondary,
                          wordBreak: "break-word",
                        }}
                      >
                        {info.content}
                      </MuiLink>
                    ) : (
                      <Typography
                        color="text.secondary"
                        sx={{ wordBreak: "break-word" }}
                      >
                        {info.content}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: "22px",
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              }}
            >
              <Typography
                variant="h5"
                component="h3"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Send a Message
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mb: 3 }}
              >
                Tell me a little about the opportunity or project, and I&apos;ll
                get back to you.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      sx={{
                        borderRadius: "999px",
                        py: 1.4,
                        textTransform: "none",
                        fontWeight: 700,
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: `0 12px 24px ${alpha(
                            theme.palette.primary.main,
                            0.28
                          )}`,
                        },
                        "&:active": {
                          transform: "translateY(0)",
                        },
                      }}
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

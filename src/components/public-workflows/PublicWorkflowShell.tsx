"use client";

import Link from "next/link";
import { ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export function PublicWorkflowShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        background: `linear-gradient(180deg, ${alpha(
          theme.palette.primary.main,
          0.08
        )}, transparent 34%), ${theme.palette.background.default}`,
      }}
    >
      <Box sx={{ maxWidth: 1120, mx: "auto" }}>
        <Paper
          component="header"
          elevation={0}
          sx={{
            mb: { xs: 3, md: 5 },
            p: { xs: 1.25, sm: 1.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.82),
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Box
              component="img"
              src="/sc-logo.svg"
              alt="Shevon Chisholm logo"
              sx={{ width: 38, height: 38, flexShrink: 0 }}
            />
            <Box>
              <Typography sx={{ fontWeight: 950, lineHeight: 1.1 }}>
                Shevon Chisholm
              </Typography>
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "0.68rem",
                  fontWeight: 900,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Software Solutions
              </Typography>
            </Box>
          </Stack>
          <Button
            component={Link}
            href="/"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            sx={{ color: "text.secondary", textTransform: "none", fontWeight: 800 }}
          >
            Back to site
          </Button>
        </Paper>

        <Stack spacing={{ xs: 3, md: 4 }}>
          <Box>
            <Typography
              sx={{
                display: "inline-flex",
                mb: 1.5,
                px: 1.6,
                py: 0.55,
                borderRadius: 999,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.36)}`,
                color: "primary.main",
                fontSize: "0.72rem",
                fontWeight: 950,
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </Typography>
            <Typography
              component="h1"
              sx={{
                maxWidth: 820,
                fontSize: { xs: "2.15rem", md: "3.7rem" },
                lineHeight: 0.98,
                fontWeight: 950,
                letterSpacing: 0,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                sx={{
                  mt: 2,
                  maxWidth: 720,
                  color: "text.secondary",
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  lineHeight: 1.75,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {children}
        </Stack>
      </Box>
    </Box>
  );
}

export function PublicWorkflowLoading({ label }: { label: string }) {
  return (
    <PublicWorkflowShell eyebrow="Loading" title={label}>
      <Paper
        elevation={0}
        sx={{
          p: 5,
          display: "grid",
          placeItems: "center",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <CircularProgress color="primary" />
      </Paper>
    </PublicWorkflowShell>
  );
}

export function PublicWorkflowError({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <PublicWorkflowShell eyebrow="Unavailable" title={title}>
      <Alert severity="warning">{message}</Alert>
    </PublicWorkflowShell>
  );
}

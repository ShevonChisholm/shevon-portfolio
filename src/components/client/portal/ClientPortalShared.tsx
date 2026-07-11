"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

export type ClientPortalTone =
  | "primary"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "purple"
  | "indigo";

export const clientPortalToneColors: Record<ClientPortalTone, string> = {
  primary: "#FF6600",
  blue: "#4da3ff",
  green: "#2ecc71",
  amber: "#ffb020",
  red: "#ff5c5c",
  purple: "#a855f7",
  indigo: "#6366f1",
};

export function formatShortDate(value?: string | null) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function statusTone(status?: string | null): ClientPortalTone {
  if (status === "Approved" || status === "Completed" || status === "Paid") {
    return "green";
  }
  if (
    status === "Pending" ||
    status === "Submitted" ||
    status === "Needed" ||
    status === "In Progress"
  ) {
    return "amber";
  }
  if (
    status === "Rejected" ||
    status === "Needs Revision" ||
    status === "Changes Requested" ||
    status === "Overdue"
  ) {
    return "red";
  }
  return "primary";
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" }, mb: 3 }}
    >
      <Box>
        {eyebrow && (
          <Chip
            label={eyebrow}
            color="primary"
            variant="outlined"
            sx={{ mb: 1.5, fontWeight: 850 }}
          />
        )}
        <Typography variant="h4" sx={{ fontWeight: 950, lineHeight: 1.05 }}>
          {title}
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 0.75, maxWidth: 760 }}>
          {description}
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}

export function PortalStatCard({
  icon,
  label,
  value,
  tone = "primary",
  loading,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  tone?: ClientPortalTone;
  loading?: boolean;
}) {
  const theme = useTheme();
  const color = clientPortalToneColors[tone];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        minHeight: 118,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.text.secondary, 0.16)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.72),
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.3,
          display: "grid",
          placeItems: "center",
          color,
          backgroundColor: alpha(color, 0.14),
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{ mt: 1.6, mb: 0.45, fontSize: "1.65rem", fontWeight: 950, lineHeight: 1 }}
      >
        {loading ? <Skeleton width={68} /> : value}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
    </Paper>
  );
}

export function PortalPanel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.text.secondary, 0.16)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.72),
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.8,
          borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.12)}`,
        }}
      >
        <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

export function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <Box sx={{ px: 2, py: 4.5, textAlign: "center", color: "text.secondary" }}>
      <InboxOutlinedIcon sx={{ mb: 1, opacity: 0.55 }} />
      <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {message}
      </Typography>
    </Box>
  );
}

export function PortalActionCard({
  href,
  icon,
  title,
  description,
  tone = "primary",
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  tone?: ClientPortalTone;
}) {
  const theme = useTheme();
  const color = clientPortalToneColors[tone];

  return (
    <Paper
      component={Link}
      href={href}
      elevation={0}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        color: "inherit",
        textDecoration: "none",
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.text.secondary, 0.16)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.72),
        transition: "border-color 180ms ease, transform 180ms ease",
        "&:hover": {
          borderColor: alpha(color, 0.48),
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.3,
          display: "grid",
          placeItems: "center",
          color,
          backgroundColor: alpha(color, 0.14),
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 950 }} noWrap>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
          {description}
        </Typography>
      </Box>
      <ArrowForwardIcon sx={{ color: "text.secondary", fontSize: 18 }} />
    </Paper>
  );
}

export function StatusChip({ status }: { status?: string | null }) {
  const tone = statusTone(status);
  const color = clientPortalToneColors[tone];

  return (
    <Chip
      label={status || "Unknown"}
      size="small"
      sx={{
        color,
        borderColor: alpha(color, 0.42),
        backgroundColor: alpha(color, 0.09),
        fontWeight: 850,
      }}
      variant="outlined"
    />
  );
}

export function InlineButtonLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button component={Link} href={href} size="small">
      {children}
    </Button>
  );
}

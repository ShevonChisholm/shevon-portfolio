"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import {
  PublicWorkflowError,
  PublicWorkflowLoading,
  PublicWorkflowShell,
} from "@/components/public-workflows/PublicWorkflowShell";
import {
  useAcceptPublicClientInvitationMutation,
  useGetPublicClientInvitationQuery,
} from "@/lib/api/public-workflows-api";

function formatDate(value?: string) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value)
  );
}

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "data" in error) {
    const data = error.data as { message?: unknown; error?: unknown };
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.message)) return data.message.join(", ");
    if (typeof data.error === "string") return data.error;
  }
  return fallback;
}

export default function ClientInvitationPage({
  params,
}: {
  params: { token: string };
}) {
  const theme = useTheme();
  const token = params.token;
  const { data, error, isError, isLoading } = useGetPublicClientInvitationQuery(token);
  const [acceptInvitation, acceptState] = useAcceptPublicClientInvitationMutation();
  const [accepted, setAccepted] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    full_name: "",
  });

  const invitationEmail = data?.contact_email ?? "";
  const returnTo = `/client/invitations/${encodeURIComponent(token)}`;
  const loginHref = `/client/login?returnTo=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    if (!invitationEmail) return;
    setForm((current) =>
      current.email ? current : { ...current, email: invitationEmail }
    );
  }, [invitationEmail]);

  const submitAccept = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    try {
      const result = await acceptInvitation({
        token,
        body: {
          email: form.email.trim(),
          full_name: form.full_name.trim() || undefined,
        },
      }).unwrap();

      if ("next_step" in result) {
        setNeedsAuth(true);
        setMessage(result.message ?? "Sign in to link this invitation to your account.");
        return;
      }

      setAccepted(true);
    } catch (mutationError) {
      setMessage(errorMessage(mutationError, "Could not accept this invitation."));
    }
  };

  if (isLoading) return <PublicWorkflowLoading label="Loading invitation" />;

  if (isError || !data) {
    return (
      <PublicWorkflowError
        title="Invitation unavailable"
        message={errorMessage(
          error,
          "This client portal invitation is invalid, expired, or no longer active."
        )}
      />
    );
  }

  if (accepted) {
    return (
      <PublicWorkflowShell
        eyebrow="Accepted"
        title="Portal access enabled"
        subtitle="Your invitation has been accepted. You can now open the client portal."
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.success.main, 0.34)}`,
            backgroundColor: alpha(theme.palette.success.main, 0.08),
          }}
        >
          <Stack spacing={2}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 42 }} />
            <Typography variant="h5" sx={{ fontWeight: 950 }}>
              Your account is linked to the client workspace.
            </Typography>
            <Button
              component={Link}
              href="/client/dashboard"
              variant="contained"
              sx={{ alignSelf: "flex-start" }}
            >
              Open Client Portal
            </Button>
          </Stack>
        </Paper>
      </PublicWorkflowShell>
    );
  }

  return (
    <PublicWorkflowShell
      eyebrow="Client Invitation"
      title="Accept your client portal invitation"
      subtitle={`You were invited to access ${
        data.client?.name || "your project workspace"
      }.`}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 360px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Paper
          component="form"
          onSubmit={submitAccept}
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.86),
          }}
        >
          <Stack spacing={2.25}>
            {message && (
              <Alert severity={needsAuth ? "info" : "error"}>{message}</Alert>
            )}
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              helperText={
                invitationEmail
                  ? `Use the invited email: ${invitationEmail}`
                  : "Use the email where you received the invitation."
              }
              required
              fullWidth
            />
            <TextField
              label="Full name"
              value={form.full_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, full_name: event.target.value }))
              }
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              disabled={acceptState.isLoading || !form.email.trim()}
            >
              {acceptState.isLoading ? "Checking..." : "Accept Invitation"}
            </Button>
            {needsAuth && (
              <Button
                component={Link}
                href={loginHref}
                variant="outlined"
                startIcon={<LoginOutlinedIcon />}
              >
                Sign in to continue
              </Button>
            )}
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <Stack spacing={2}>
            <Typography sx={{ fontWeight: 950 }}>Invitation Details</Typography>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 900 }}>
                CLIENT
              </Typography>
              <Typography sx={{ fontWeight: 850 }}>
                {data.client?.name || "Client workspace"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 900 }}>
                INVITED EMAIL
              </Typography>
              <Typography sx={{ fontWeight: 850 }}>
                {data.contact_email || "Not shown"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 900 }}>
                EXPIRES
              </Typography>
              <Typography sx={{ fontWeight: 850 }}>
                {formatDate(data.expires_at)}
              </Typography>
            </Box>
            {data.status && <Chip label={data.status} sx={{ alignSelf: "flex-start" }} />}
          </Stack>
        </Paper>
      </Box>
    </PublicWorkflowShell>
  );
}

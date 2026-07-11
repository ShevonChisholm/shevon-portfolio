"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LaunchIcon from "@mui/icons-material/Launch";
import {
  PublicWorkflowError,
  PublicWorkflowLoading,
  PublicWorkflowShell,
} from "@/components/public-workflows/PublicWorkflowShell";
import {
  type PublicProposalSection,
  useAcceptPublicProposalMutation,
  useGetPublicProposalQuery,
  useMarkPublicProposalViewedMutation,
  useRejectPublicProposalMutation,
} from "@/lib/api/public-workflows-api";

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "To be confirmed";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

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

function sectionContent(section: PublicProposalSection) {
  const content = section.content?.trim();
  if (!content) return null;

  return content.split(/\n{2,}/).map((paragraph, index) => (
    <Typography key={`${section.title}-${index}`} sx={{ color: "text.secondary", lineHeight: 1.8 }}>
      {paragraph}
    </Typography>
  ));
}

export default function PublicProposalPage({
  params,
}: {
  params: { token: string };
}) {
  const theme = useTheme();
  const token = params.token;
  const { data, error, isLoading, isError } = useGetPublicProposalQuery(token);
  const [markViewed] = useMarkPublicProposalViewedMutation();
  const [acceptProposal, acceptState] = useAcceptPublicProposalMutation();
  const [rejectProposal, rejectState] = useRejectPublicProposalMutation();
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    response: "",
    accept_terms: false,
  });
  const [rejectForm, setRejectForm] = useState({
    name: "",
    email: "",
    reason: "",
  });

  useEffect(() => {
    if (!data?.proposal?.id) return;
    markViewed(token);
  }, [data?.proposal?.id, markViewed, token]);

  const proposal = data?.proposal;
  const recipientName =
    proposal?.client?.business_name ||
    proposal?.lead?.business_name ||
    proposal?.lead?.full_name ||
    "your project";
  const pdfUrl =
    proposal?.generated_pdf?.signed_url || proposal?.generated_pdf?.public_url;
  const sortedSections = useMemo(
    () =>
      [...(proposal?.sections ?? [])].filter(
        (section) => section.title || section.content
      ),
    [proposal?.sections]
  );

  const submitAccept = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    try {
      await acceptProposal({
        token,
        body: {
          accepted_by_name: form.name.trim(),
          accepted_by_email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          response_message: form.response.trim() || undefined,
          accept_terms: form.accept_terms,
          create_portal_invitation: true,
        },
      }).unwrap();
      setAccepted(true);
    } catch (mutationError) {
      setMessage(errorMessage(mutationError, "Could not accept this proposal."));
    }
  };

  const submitReject = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    try {
      await rejectProposal({
        token,
        body: {
          rejected_by_name: rejectForm.name.trim() || undefined,
          rejected_by_email: rejectForm.email.trim() || undefined,
          reason: rejectForm.reason.trim() || undefined,
        },
      }).unwrap();
      setDeclined(true);
    } catch (mutationError) {
      setMessage(errorMessage(mutationError, "Could not decline this proposal."));
    }
  };

  if (isLoading) return <PublicWorkflowLoading label="Loading proposal" />;

  if (isError || !proposal) {
    return (
      <PublicWorkflowError
        title="Proposal link unavailable"
        message={errorMessage(
          error,
          "This proposal link is invalid, expired, or no longer active."
        )}
      />
    );
  }

  if (accepted) {
    return (
      <PublicWorkflowShell
        eyebrow="Accepted"
        title="Proposal accepted"
        subtitle="The project workflow has been created. Check your email for next steps and portal access."
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
              Thanks. I’ll follow up with the project kickoff details.
            </Typography>
            <Button component={Link} href="/" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Back to portfolio
            </Button>
          </Stack>
        </Paper>
      </PublicWorkflowShell>
    );
  }

  if (declined) {
    return (
      <PublicWorkflowShell
        eyebrow="Declined"
        title="Response recorded"
        subtitle="Thanks for reviewing the proposal. Your response has been saved."
      >
        <Button component={Link} href="/" variant="outlined" sx={{ alignSelf: "flex-start" }}>
          Back to portfolio
        </Button>
      </PublicWorkflowShell>
    );
  }

  return (
    <PublicWorkflowShell
      eyebrow={data.access?.purpose ?? "Proposal Review"}
      title={proposal.title || "Project Proposal"}
      subtitle={`Prepared for ${recipientName}. Review the scope, investment, and terms below.`}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" },
          gap: { xs: 3, lg: 4 },
          alignItems: "start",
        }}
      >
        <Stack spacing={2.5}>
          {message && <Alert severity="error">{message}</Alert>}

          {sortedSections.length ? (
            sortedSections.map((section, index) => (
              <Paper
                key={`${section.title}-${index}`}
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.82),
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 4,
                        height: 22,
                        borderRadius: 999,
                        backgroundColor: "primary.main",
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 950 }}>
                      {section.title || section.section_type || `Section ${index + 1}`}
                    </Typography>
                  </Stack>
                  {sectionContent(section) || (
                    <Typography sx={{ color: "text.secondary" }}>
                      Details will be confirmed during kickoff.
                    </Typography>
                  )}
                </Stack>
              </Paper>
            ))
          ) : (
            <Alert severity="info">Proposal sections are being finalized.</Alert>
          )}
        </Stack>

        <Stack spacing={2.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.88),
              position: { lg: "sticky" },
              top: { lg: 24 },
            }}
          >
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 950 }}>Proposal Summary</Typography>
              <Divider />
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 900 }}>
                  INVESTMENT
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 950 }}>
                  {formatCurrency(proposal.total_amount)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 900 }}>
                  EXPIRES
                </Typography>
                <Typography sx={{ fontWeight: 850 }}>
                  {formatDate(proposal.expires_at)}
                </Typography>
              </Box>
              {(proposal.package?.name || proposal.care_plan?.name) && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  {proposal.package?.name && <Chip label={proposal.package.name} />}
                  {proposal.care_plan?.name && <Chip label={proposal.care_plan.name} />}
                </Stack>
              )}
              {proposal.payment_terms && (
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {proposal.payment_terms}
                </Typography>
              )}
              {pdfUrl && (
                <Button
                  component="a"
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  startIcon={<DescriptionOutlinedIcon />}
                  endIcon={<LaunchIcon />}
                >
                  Open PDF
                </Button>
              )}
            </Stack>
          </Paper>

          <Paper
            component="form"
            onSubmit={declineOpen ? submitReject : submitAccept}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.88),
            }}
          >
            {declineOpen ? (
              <Stack spacing={2}>
                <Typography sx={{ fontWeight: 950 }}>Decline proposal</Typography>
                <TextField
                  label="Name"
                  value={rejectForm.name}
                  onChange={(event) =>
                    setRejectForm((current) => ({ ...current, name: event.target.value }))
                  }
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={rejectForm.email}
                  onChange={(event) =>
                    setRejectForm((current) => ({ ...current, email: event.target.value }))
                  }
                  fullWidth
                />
                <TextField
                  label="Reason"
                  value={rejectForm.reason}
                  onChange={(event) =>
                    setRejectForm((current) => ({ ...current, reason: event.target.value }))
                  }
                  minRows={3}
                  multiline
                  fullWidth
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    type="submit"
                    color="warning"
                    variant="contained"
                    disabled={rejectState.isLoading}
                  >
                    {rejectState.isLoading ? "Submitting..." : "Submit decline"}
                  </Button>
                  <Button onClick={() => setDeclineOpen(false)} disabled={rejectState.isLoading}>
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Typography sx={{ fontWeight: 950 }}>Accept proposal</Typography>
                <TextField
                  label="Full name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  fullWidth
                />
                <TextField
                  label="Message"
                  value={form.response}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, response: event.target.value }))
                  }
                  minRows={3}
                  multiline
                  fullWidth
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.accept_terms}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          accept_terms: event.target.checked,
                        }))
                      }
                    />
                  }
                  label="I accept the proposal terms and authorize kickoff preparation."
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    acceptState.isLoading ||
                    !form.accept_terms ||
                    !form.name.trim() ||
                    !form.email.trim()
                  }
                >
                  {acceptState.isLoading ? "Accepting..." : "Accept Proposal"}
                </Button>
                <Button
                  color="inherit"
                  onClick={() => setDeclineOpen(true)}
                  disabled={acceptState.isLoading}
                >
                  Decline instead
                </Button>
              </Stack>
            )}
          </Paper>
        </Stack>
      </Box>
    </PublicWorkflowShell>
  );
}

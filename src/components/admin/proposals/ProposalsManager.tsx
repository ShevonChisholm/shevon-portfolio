"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import TimelapseOutlinedIcon from "@mui/icons-material/TimelapseOutlined";
import {
  AdminNotificationBridge,
  useAdminNotifications,
  type AdminNotificationMessage,
} from "@/components/admin/notifications/AdminNotifications";
import {
  useListCarePlansQuery,
  useListServicePackagesQuery,
} from "@/lib/api/catalog-api";
import { useListClientsQuery } from "@/lib/api/clients-api";
import { useListLeadsQuery } from "@/lib/api/leads-api";
import {
  proposalSectionTypes,
  proposalStatuses,
  type ProposalDetail,
  type ProposalSectionInput,
  type ProposalSectionType,
  type ProposalStatus,
  type ProposalSummary,
  type UpsertProposalInput,
  useArchiveProposalMutation,
  useCreateProposalMutation,
  useGenerateProposalAccessLinkMutation,
  useGetProposalQuery,
  useListProposalsQuery,
  useReplaceProposalSectionsMutation,
  useRevokeProposalAccessLinksMutation,
  useSendProposalMutation,
  useUpdateProposalMutation,
} from "@/lib/api/proposals-api";

type Message = AdminNotificationMessage | null;
type ProposalFilter = "active" | "draft" | "sent" | "accepted" | "archived" | "all";
type ProposalDialogMode = "create" | "edit";

type ProposalFormState = {
  title: string;
  status: ProposalStatus;
  lead_id: string;
  client_id: string;
  package_id: string;
  care_plan_id: string;
  total_amount: string;
  payment_terms: string;
  expires_at: string;
  sections: ProposalSectionInput[];
};

const filterOptions: Array<{
  value: ProposalFilter;
  label: string;
  status?: ProposalStatus;
}> = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft", status: "Draft" },
  { value: "sent", label: "Sent", status: "Sent" },
  { value: "accepted", label: "Accepted", status: "Accepted" },
  { value: "archived", label: "Archived", status: "Archived" },
  { value: "all", label: "All" },
];

const emptyProposalForm: ProposalFormState = {
  title: "",
  status: "Draft",
  lead_id: "",
  client_id: "",
  package_id: "",
  care_plan_id: "",
  total_amount: "",
  payment_terms: "",
  expires_at: "",
  sections: [
    {
      section_type: "Executive Summary",
      title: "Executive Summary",
      content: "",
      sort_order: 0,
    },
    {
      section_type: "Scope of Work",
      title: "Scope of Work",
      content: "",
      sort_order: 1,
    },
    {
      section_type: "Investment",
      title: "Investment",
      content: "",
      sort_order: 2,
    },
  ],
};

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function optionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toApiDate(value: string) {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00.000`).toISOString();
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShortDate(value?: string | null) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") return "Not priced";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object"
  ) {
    const data = error.data as { message?: unknown; error?: unknown };
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.message)) return data.message.join(", ");
    if (typeof data.error === "string") return data.error;
  }

  return error instanceof Error ? error.message : fallback;
}

function statusColor(status?: string | null) {
  if (status === "Accepted") return "success" as const;
  if (status === "Rejected" || status === "Expired" || status === "Archived") {
    return "default" as const;
  }
  if (status === "Sent" || status === "Viewed") return "warning" as const;
  return "primary" as const;
}

function toProposalForm(proposal?: ProposalDetail): ProposalFormState {
  if (!proposal) return emptyProposalForm;

  const sections = proposal.sections?.length
    ? proposal.sections.map((section, index) => ({
        section_type:
          (section.section_type as ProposalSectionType | undefined) ??
          "Executive Summary",
        title: section.title ?? "",
        content: section.content ?? "",
        sort_order: section.sort_order ?? index,
      }))
    : emptyProposalForm.sections;

  return {
    title: proposal.title ?? "",
    status: (proposal.status as ProposalStatus) ?? "Draft",
    lead_id: proposal.lead_id ?? "",
    client_id: proposal.client_id ?? "",
    package_id: proposal.package_id ?? "",
    care_plan_id: proposal.care_plan_id ?? "",
    total_amount:
      typeof proposal.total_amount === "number" ? String(proposal.total_amount) : "",
    payment_terms: proposal.payment_terms ?? "",
    expires_at: toDateInput(proposal.expires_at),
    sections,
  };
}

function proposalPayload(form: ProposalFormState): UpsertProposalInput {
  return {
    lead_id: optional(form.lead_id),
    client_id: optional(form.client_id),
    package_id: optional(form.package_id),
    care_plan_id: optional(form.care_plan_id),
    title: form.title.trim(),
    status: form.status,
    total_amount: optionalNumber(form.total_amount),
    payment_terms: optional(form.payment_terms),
    expires_at: toApiDate(form.expires_at),
    sections: form.sections
      .map((section, index) => ({
        section_type: section.section_type,
        title: section.title.trim(),
        content: section.content.trim(),
        sort_order: section.sort_order ?? index,
      }))
      .filter((section) => section.title && section.content),
  };
}

function proposalContact(proposal: ProposalSummary | ProposalDetail) {
  if ("client" in proposal && proposal.client?.business_name) {
    return proposal.client.business_name;
  }

  if ("lead" in proposal && proposal.lead) {
    return proposal.lead.business_name || proposal.lead.full_name || proposal.lead.email;
  }

  return proposal.client_id ? "Linked client" : proposal.lead_id ? "Linked lead" : "No contact";
}

function DetailLine({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start", minWidth: 0 }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          color: "primary.main",
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          "& svg": { fontSize: 16 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "0.62rem",
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ overflowWrap: "anywhere", lineHeight: 1.5 }}>
          {value || "Not provided"}
        </Typography>
      </Box>
    </Stack>
  );
}

function ResponsiveGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

function GridCell({
  children,
  md = 12,
}: {
  children: ReactNode;
  md?: number;
}) {
  return (
    <Box sx={{ minWidth: 0, gridColumn: { xs: "1 / -1", md: `span ${md}` } }}>
      {children}
    </Box>
  );
}

function ProposalCard({
  proposal,
  selected,
  onSelect,
  onEdit,
  onArchive,
  archiving,
}: {
  proposal: ProposalSummary;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onArchive: () => void;
  archiving: boolean;
}) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: `1px solid ${
          selected
            ? alpha(theme.palette.primary.main, 0.55)
            : alpha(theme.palette.primary.main, 0.14)
        }`,
        backgroundColor: selected
          ? alpha(theme.palette.primary.main, 0.1)
          : alpha(theme.palette.background.paper, 0.82),
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, sm: 2.75 }, height: "100%" }}>
        <Stack spacing={2.25} sx={{ height: "100%" }}>
          <Stack direction="row" spacing={1.25} sx={{ justifyContent: "space-between" }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.4 }}>
                {proposal.title || "Untitled proposal"}
              </Typography>
              <Typography sx={{ color: "text.secondary", overflowWrap: "anywhere" }}>
                {proposalContact(proposal)}
              </Typography>
            </Box>
            <Chip
              label={proposal.status || "Unknown"}
              color={statusColor(proposal.status)}
              size="small"
              sx={{ flexShrink: 0, fontWeight: 800 }}
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip
              icon={<PaymentsOutlinedIcon />}
              label={formatCurrency(proposal.total_amount)}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<TimelapseOutlinedIcon />}
              label={`Expires ${formatShortDate(proposal.expires_at)}`}
              size="small"
              variant="outlined"
            />
          </Stack>

          <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.12) }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mt: "auto" }}
          >
            <Button variant="contained" onClick={onSelect} fullWidth>
              View
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={onEdit}
              fullWidth
            >
              Edit
            </Button>
            <Tooltip title="Archive proposal">
              <span>
                <IconButton
                  color="warning"
                  onClick={onArchive}
                  disabled={archiving || proposal.status === "Archived"}
                  sx={{
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                    borderRadius: 1,
                    width: { xs: "100%", sm: 42 },
                  }}
                >
                  {archiving ? <CircularProgress size={18} /> : <ArchiveOutlinedIcon />}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ProposalDialog({
  open,
  mode,
  form,
  onClose,
  onChange,
  onSubmit,
  saving,
  proposal,
}: {
  open: boolean;
  mode: ProposalDialogMode;
  form: ProposalFormState;
  onClose: () => void;
  onChange: (form: ProposalFormState) => void;
  onSubmit: () => void;
  saving: boolean;
  proposal?: ProposalDetail;
}) {
  const theme = useTheme();
  const { data: leads } = useListLeadsQuery({
    limit: 100,
    archived: "false",
    sort_by: "created_at",
    sort_order: "desc",
  });
  const { data: clients } = useListClientsQuery({ limit: 100, status: "Active" });
  const { data: packages } = useListServicePackagesQuery({
    active: "true",
    limit: 100,
  });
  const { data: carePlans } = useListCarePlansQuery({ active: "true", limit: 100 });

  const canSubmit =
    form.title.trim().length > 0 &&
    Boolean(form.lead_id || form.client_id) &&
    !saving;

  const updateSection = (
    index: number,
    updates: Partial<ProposalSectionInput>
  ) => {
    onChange({
      ...form,
      sections: form.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...updates } : section
      ),
    });
  };

  const removeSection = (index: number) => {
    onChange({
      ...form,
      sections: form.sections
        .filter((_section, sectionIndex) => sectionIndex !== index)
        .map((section, sectionIndex) => ({
          ...section,
          sort_order: section.sort_order ?? sectionIndex,
        })),
    });
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        {mode === "create" ? "Create Proposal" : "Edit Proposal"}
      </DialogTitle>
      {saving && <LinearProgress />}
      <DialogContent dividers>
        <Stack spacing={3}>
          <ResponsiveGrid>
            <GridCell md={8}>
              <TextField
                label="Proposal title"
                value={form.title}
                onChange={(event) => onChange({ ...form, title: event.target.value })}
                required
                fullWidth
              />
            </GridCell>
            <GridCell md={4}>
              <TextField
                label="Status"
                value={form.status}
                onChange={(event) =>
                  onChange({ ...form, status: event.target.value as ProposalStatus })
                }
                select
                fullWidth
              >
                {proposalStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </GridCell>
            <GridCell md={6}>
              <TextField
                label="Lead"
                value={form.lead_id}
                onChange={(event) => onChange({ ...form, lead_id: event.target.value })}
                select
                fullWidth
                helperText="Required if no client is selected."
              >
                <MenuItem value="">No lead</MenuItem>
                {leads?.data?.map((lead) => (
                  <MenuItem key={lead.id} value={lead.id}>
                    {lead.full_name || lead.email || lead.business_name || lead.id}
                  </MenuItem>
                ))}
              </TextField>
            </GridCell>
            <GridCell md={6}>
              <TextField
                label="Client"
                value={form.client_id}
                onChange={(event) => onChange({ ...form, client_id: event.target.value })}
                select
                fullWidth
                helperText="Required if no lead is selected."
              >
                <MenuItem value="">No client</MenuItem>
                {clients?.data?.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.business_name || client.id}
                  </MenuItem>
                ))}
              </TextField>
            </GridCell>
            <GridCell md={6}>
              <TextField
                label="Service package"
                value={form.package_id}
                onChange={(event) => onChange({ ...form, package_id: event.target.value })}
                select
                fullWidth
              >
                <MenuItem value="">No package</MenuItem>
                {packages?.data?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name || item.slug || item.id}
                  </MenuItem>
                ))}
              </TextField>
            </GridCell>
            <GridCell md={6}>
              <TextField
                label="Care plan"
                value={form.care_plan_id}
                onChange={(event) =>
                  onChange({ ...form, care_plan_id: event.target.value })
                }
                select
                fullWidth
              >
                <MenuItem value="">No care plan</MenuItem>
                {carePlans?.data?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name || item.slug || item.id}
                  </MenuItem>
                ))}
              </TextField>
            </GridCell>
            <GridCell md={6}>
              <TextField
                label="Total amount"
                value={form.total_amount}
                onChange={(event) =>
                  onChange({ ...form, total_amount: event.target.value })
                }
                type="number"
                fullWidth
              />
            </GridCell>
            <GridCell md={6}>
              <TextField
                label="Expires on"
                value={form.expires_at}
                onChange={(event) => onChange({ ...form, expires_at: event.target.value })}
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </GridCell>
            <GridCell>
              <TextField
                label="Payment terms"
                value={form.payment_terms}
                onChange={(event) =>
                  onChange({ ...form, payment_terms: event.target.value })
                }
                minRows={3}
                multiline
                fullWidth
              />
            </GridCell>
          </ResponsiveGrid>

          <Divider />

          <Stack spacing={1}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ justifyContent: "space-between" }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Proposal Sections
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  Build the public proposal narrative in ordered blocks.
                </Typography>
              </Box>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() =>
                  onChange({
                    ...form,
                    sections: [
                      ...form.sections,
                      {
                        section_type: "Notes",
                        title: "Notes",
                        content: "",
                        sort_order: form.sections.length,
                      },
                    ],
                  })
                }
              >
                Add Section
              </Button>
            </Stack>

            <Stack spacing={2}>
              {form.sections.map((section, index) => (
                <Paper
                  key={`${section.section_type}-${index}`}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderColor: alpha(theme.palette.primary.main, 0.18),
                    backgroundColor: alpha(theme.palette.background.paper, 0.72),
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Typography sx={{ flex: 1, fontWeight: 800 }}>
                        Section {index + 1}
                      </Typography>
                      <Tooltip title="Remove section">
                        <span>
                          <IconButton
                            color="warning"
                            onClick={() => removeSection(index)}
                            disabled={form.sections.length <= 1}
                          >
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                    <ResponsiveGrid>
                      <GridCell md={5}>
                        <TextField
                          label="Section type"
                          value={section.section_type}
                          onChange={(event) =>
                            updateSection(index, {
                              section_type: event.target.value as ProposalSectionType,
                            })
                          }
                          select
                          fullWidth
                        >
                          {proposalSectionTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </TextField>
                      </GridCell>
                      <GridCell md={5}>
                        <TextField
                          label="Title"
                          value={section.title}
                          onChange={(event) =>
                            updateSection(index, { title: event.target.value })
                          }
                          fullWidth
                        />
                      </GridCell>
                      <GridCell md={2}>
                        <TextField
                          label="Order"
                          value={section.sort_order ?? index}
                          onChange={(event) =>
                            updateSection(index, {
                              sort_order: Number(event.target.value) || 0,
                            })
                          }
                          type="number"
                          fullWidth
                        />
                      </GridCell>
                      <GridCell>
                        <TextField
                          label="Content"
                          value={section.content}
                          onChange={(event) =>
                            updateSection(index, { content: event.target.value })
                          }
                          minRows={4}
                          multiline
                          fullWidth
                        />
                      </GridCell>
                    </ResponsiveGrid>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>

          {mode === "edit" && proposal?.status === "Accepted" && (
            <Typography color="warning.main">
              Accepted proposals are locked by the API and cannot be edited.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={canSubmit === false || proposal?.status === "Accepted"}
        >
          {saving ? "Saving..." : mode === "create" ? "Create Proposal" : "Save Proposal"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ProposalDrawer({
  proposal,
  open,
  loading,
  onClose,
  onEdit,
  onSend,
  onGenerateLink,
  onRevokeLinks,
  actionLoading,
}: {
  proposal?: ProposalDetail;
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSend: () => void;
  onGenerateLink: () => void;
  onRevokeLinks: () => void;
  actionLoading: boolean;
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 520 },
          borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
          backgroundColor: alpha(theme.palette.background.default, 0.98),
        },
      }}
    >
      <Box sx={{ p: { xs: 2.25, sm: 3 }, pb: 10 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "0.72rem",
                  fontWeight: 900,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Proposal
              </Typography>
              {loading ? (
                <Skeleton width="80%" height={42} />
              ) : (
                <Typography variant={isDesktop ? "h4" : "h5"} sx={{ fontWeight: 950 }}>
                  {proposal?.title || "Proposal details"}
                </Typography>
              )}
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {loading || !proposal ? (
            <Stack spacing={2}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={86} />
              ))}
            </Stack>
          ) : (
            <>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                <Chip
                  label={proposal.status || "Unknown"}
                  color={statusColor(proposal.status)}
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  label={formatCurrency(proposal.total_amount)}
                  variant="outlined"
                  sx={{ fontWeight: 800 }}
                />
              </Stack>

              <Paper
                variant="outlined"
                sx={{
                  p: 2.25,
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                  backgroundColor: alpha(theme.palette.background.paper, 0.78),
                }}
              >
                <Stack spacing={2}>
                  <DetailLine
                    icon={<PersonOutlineOutlinedIcon />}
                    label="Contact"
                    value={
                      proposal.client?.business_name ||
                      proposal.lead?.business_name ||
                      proposal.lead?.full_name ||
                      proposal.lead?.email
                    }
                  />
                  <DetailLine
                    icon={<PaymentsOutlinedIcon />}
                    label="Investment"
                    value={formatCurrency(proposal.total_amount)}
                  />
                  <DetailLine
                    icon={<TimelapseOutlinedIcon />}
                    label="Dates"
                    value={`Created ${formatShortDate(
                      proposal.created_at
                    )} / Expires ${formatShortDate(proposal.expires_at)}`}
                  />
                  <DetailLine
                    icon={<ArticleOutlinedIcon />}
                    label="Package"
                    value={proposal.package?.name || proposal.care_plan?.name}
                  />
                </Stack>
              </Paper>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<SendOutlinedIcon />}
                  onClick={onSend}
                  disabled={actionLoading}
                  fullWidth
                >
                  Send
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LinkOutlinedIcon />}
                  onClick={onGenerateLink}
                  disabled={actionLoading}
                  fullWidth
                >
                  Link
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditOutlinedIcon />}
                  onClick={onEdit}
                  disabled={proposal.status === "Accepted"}
                  fullWidth
                >
                  Edit
                </Button>
              </Stack>

              <Button
                variant="text"
                color="warning"
                onClick={onRevokeLinks}
                disabled={actionLoading}
                sx={{ alignSelf: "flex-start" }}
              >
                Revoke active access links
              </Button>

              {proposal.payment_terms && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                    Payment Terms
                  </Typography>
                  <Typography sx={{ color: "text.secondary", whiteSpace: "pre-wrap" }}>
                    {proposal.payment_terms}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                  Sections
                </Typography>
                <Stack spacing={1.5}>
                  {proposal.sections?.length ? (
                    proposal.sections.map((section) => (
                      <Paper
                        key={section.id || `${section.section_type}-${section.sort_order}`}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderColor: alpha(theme.palette.primary.main, 0.14),
                          backgroundColor: alpha(theme.palette.background.paper, 0.62),
                        }}
                      >
                        <Typography sx={{ fontWeight: 900 }}>
                          {section.title || section.section_type}
                        </Typography>
                        <Typography
                          sx={{
                            color: "text.secondary",
                            whiteSpace: "pre-wrap",
                            mt: 0.8,
                          }}
                        >
                          {section.content || "No content added."}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography sx={{ color: "text.secondary" }}>
                      No sections have been added yet.
                    </Typography>
                  )}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}

export default function ProposalsManager() {
  const theme = useTheme();
  const { enqueueNotification } = useAdminNotifications();
  const [filter, setFilter] = useState<ProposalFilter>("active");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<Message>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<ProposalDialogMode>("create");
  const [form, setForm] = useState<ProposalFormState>(emptyProposalForm);

  const query = useMemo(() => {
    const option = filterOptions.find((item) => item.value === filter);
    return {
      search: optional(search),
      status: option?.status,
      limit: 30,
      sort_by: "created_at",
      sort_order: "desc" as const,
    };
  }, [filter, search]);

  const { data, isLoading, isFetching, error, refetch } = useListProposalsQuery(query);
  const { data: selectedProposal, isFetching: loadingSelected } = useGetProposalQuery(
    selectedId ?? "",
    { skip: !selectedId }
  );
  const [createProposal, { isLoading: creating }] = useCreateProposalMutation();
  const [updateProposal, { isLoading: updating }] = useUpdateProposalMutation();
  const [replaceSections, { isLoading: replacingSections }] =
    useReplaceProposalSectionsMutation();
  const [sendProposal, { isLoading: sending }] = useSendProposalMutation();
  const [generateLink, { isLoading: generatingLink }] =
    useGenerateProposalAccessLinkMutation();
  const [revokeLinks, { isLoading: revokingLinks }] =
    useRevokeProposalAccessLinksMutation();
  const [archiveProposal, { isLoading: archiving }] = useArchiveProposalMutation();

  const proposals = data?.data ?? [];
  const activeProposals =
    filter === "active"
      ? proposals.filter((proposal) => proposal.status !== "Archived")
      : proposals;
  const actionLoading = sending || generatingLink || revokingLinks;
  const saving = creating || updating || replacingSections;

  const openCreateDialog = () => {
    setDialogMode("create");
    setForm(emptyProposalForm);
    setDialogOpen(true);
  };

  const openEditDialog = (proposal?: ProposalDetail | ProposalSummary) => {
    const detail =
      proposal && "sections" in proposal
        ? proposal
        : selectedProposal?.id === proposal?.id
          ? selectedProposal
          : undefined;

    setDialogMode("edit");
    setForm(toProposalForm(detail ?? (proposal as ProposalDetail | undefined)));
    setSelectedId(proposal?.id ?? selectedId);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    const body = proposalPayload(form);

    if (!body.title) {
      setMessage({ type: "error", text: "Add a proposal title before saving." });
      return;
    }

    if (!body.lead_id && !body.client_id) {
      setMessage({ type: "error", text: "Select either a lead or a client." });
      return;
    }

    try {
      if (dialogMode === "create") {
        const created = await createProposal(body).unwrap();
        setSelectedId(created.id);
        setMessage({ type: "success", text: "Proposal created." });
      } else if (selectedId) {
        const { sections = [], ...proposalBody } = body;
        await updateProposal({ id: selectedId, body: proposalBody }).unwrap();
        await replaceSections({ id: selectedId, sections }).unwrap();
        setMessage({ type: "success", text: "Proposal updated." });
      }
      setDialogOpen(false);
    } catch (mutationError) {
      setMessage({
        type: "error",
        text: getErrorMessage(mutationError, "Could not save proposal."),
      });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveProposal(id).unwrap();
      if (selectedId === id) setSelectedId(null);
      setMessage({ type: "success", text: "Proposal archived." });
    } catch (mutationError) {
      setMessage({
        type: "error",
        text: getErrorMessage(mutationError, "Could not archive proposal."),
      });
    }
  };

  const handleSend = async () => {
    if (!selectedId) return;
    try {
      const result = await sendProposal(selectedId).unwrap();
      if (result.public_url) {
        await navigator.clipboard?.writeText(result.public_url);
      }
      setMessage({
        type: "success",
        text: result.public_url
          ? "Proposal sent and public link copied."
          : "Proposal sent.",
      });
    } catch (mutationError) {
      setMessage({
        type: "error",
        text: getErrorMessage(mutationError, "Could not send proposal."),
      });
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedId) return;
    try {
      const result = await generateLink({
        id: selectedId,
        body: {
          expires_in_days: 14,
          purpose: "Proposal Review",
          revoke_existing: true,
        },
      }).unwrap();
      await navigator.clipboard?.writeText(result.public_url);
      setMessage({ type: "success", text: "Proposal link copied to clipboard." });
      enqueueNotification(result.public_url, {
        variant: "info",
        autoHideDuration: 10000,
      });
    } catch (mutationError) {
      setMessage({
        type: "error",
        text: getErrorMessage(mutationError, "Could not generate proposal link."),
      });
    }
  };

  const handleRevokeLinks = async () => {
    if (!selectedId) return;
    try {
      await revokeLinks(selectedId).unwrap();
      setMessage({ type: "success", text: "Active proposal links revoked." });
    } catch (mutationError) {
      setMessage({
        type: "error",
        text: getErrorMessage(mutationError, "Could not revoke proposal links."),
      });
    }
  };

  return (
    <>
      <AdminNotificationBridge message={message} />
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" } }}
        >
          <Box>
            <Chip
              label="Sales"
              color="primary"
              variant="outlined"
              sx={{ mb: 1.5, fontWeight: 800 }}
            />
            <Typography variant="h3" sx={{ fontWeight: 950, mb: 1 }}>
              Proposals
            </Typography>
            <Typography sx={{ color: "text.secondary", maxWidth: 680 }}>
              Create, send, and manage proposal links for leads and clients.
            </Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="large"
            onClick={openCreateDialog}
          >
            New Proposal
          </Button>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.74),
          }}
        >
          <Stack spacing={2}>
            <Tabs
              value={filter}
              onChange={(_event, value: ProposalFilter) => setFilter(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {filterOptions.map((option) => (
                <Tab key={option.value} value={option.value} label={option.label} />
              ))}
            </Tabs>
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search proposals"
              InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ mr: 1 }} /> }}
              fullWidth
            />
          </Stack>
        </Paper>

        {isFetching && !isLoading && <LinearProgress />}

        {error && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderColor: alpha(theme.palette.error.main, 0.35),
              backgroundColor: alpha(theme.palette.error.main, 0.08),
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
            >
              <Typography color="error">
                {getErrorMessage(error, "Could not load proposals.")}
              </Typography>
              <Button variant="outlined" onClick={() => refetch()}>
                Retry
              </Button>
            </Stack>
          </Paper>
        )}

        {isLoading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2.5,
            }}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <Box key={index}>
                <Skeleton variant="rounded" height={244} />
              </Box>
            ))}
          </Box>
        ) : activeProposals.length ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2.5,
            }}
          >
            {activeProposals.map((proposal) => (
              <Box key={proposal.id} sx={{ minWidth: 0 }}>
                <ProposalCard
                  proposal={proposal}
                  selected={proposal.id === selectedId}
                  onSelect={() => setSelectedId(proposal.id)}
                  onEdit={() => openEditDialog(proposal)}
                  onArchive={() => handleArchive(proposal.id)}
                  archiving={archiving}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: "center",
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.32)}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.68),
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
              No proposals found
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              Create a proposal for a lead or client when the scope is ready.
            </Typography>
            <Button startIcon={<AddIcon />} variant="contained" onClick={openCreateDialog}>
              New Proposal
            </Button>
          </Paper>
        )}
      </Stack>

      <ProposalDrawer
        open={Boolean(selectedId)}
        proposal={selectedProposal}
        loading={loadingSelected}
        onClose={() => setSelectedId(null)}
        onEdit={() => openEditDialog(selectedProposal)}
        onSend={handleSend}
        onGenerateLink={handleGenerateLink}
        onRevokeLinks={handleRevokeLinks}
        actionLoading={actionLoading}
      />

      <ProposalDialog
        open={dialogOpen}
        mode={dialogMode}
        form={form}
        onChange={setForm}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        saving={saving}
        proposal={dialogMode === "edit" ? selectedProposal : undefined}
      />
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import {
  AdminNotificationBridge,
  type AdminNotificationMessage,
} from "@/components/admin/notifications/AdminNotifications";
import {
  useListServicePackagesQuery,
} from "@/lib/api/catalog-api";
import { useListClientsQuery } from "@/lib/api/clients-api";
import {
  clientProjectPaymentStatuses,
  clientProjectStages,
  clientProjectStatuses,
  type ClientProjectDetail,
  type ClientProjectPaymentStatus,
  type ClientProjectStage,
  type ClientProjectStatus,
  type ClientProjectSummary,
  type UpsertClientProjectInput,
  useArchiveClientProjectMutation,
  useCompleteClientProjectMutation,
  useCreateClientProjectMutation,
  useGetClientProjectQuery,
  useGetClientProjectsSummaryQuery,
  useListClientProjectsQuery,
  useUpdateClientProjectMutation,
} from "@/lib/api/client-projects-api";
import { useListLeadsQuery } from "@/lib/api/leads-api";
import { useListProposalsQuery } from "@/lib/api/proposals-api";

type Message = AdminNotificationMessage | null;
type ProjectFilter =
  | "active"
  | "waiting"
  | "review"
  | "completed"
  | "archived"
  | "all";
type ProjectDialogMode = "create" | "edit";

type ProjectFormState = {
  client_id: string;
  lead_id: string;
  proposal_id: string;
  package_id: string;
  title: string;
  description: string;
  status: ClientProjectStatus;
  current_stage: ClientProjectStage;
  progress_percent: string;
  start_date: string;
  estimated_completion_date: string;
  total_value: string;
  payment_status: ClientProjectPaymentStatus;
  internal_notes: string;
};

const filterOptions: Array<{
  value: ProjectFilter;
  label: string;
  status?: ClientProjectStatus;
}> = [
  { value: "active", label: "Active" },
  { value: "waiting", label: "Waiting", status: "Waiting on Client" },
  { value: "review", label: "In Review", status: "In Review" },
  { value: "completed", label: "Completed", status: "Completed" },
  { value: "archived", label: "Archived", status: "Archived" },
  { value: "all", label: "All" },
];

const emptyProjectForm: ProjectFormState = {
  client_id: "",
  lead_id: "",
  proposal_id: "",
  package_id: "",
  title: "",
  description: "",
  status: "Not Started",
  current_stage: "Discovery",
  progress_percent: "0",
  start_date: "",
  estimated_completion_date: "",
  total_value: "",
  payment_status: "Unpaid",
  internal_notes: "",
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
  if (status === "Completed") return "success" as const;
  if (status === "Waiting on Client" || status === "In Review") {
    return "warning" as const;
  }
  if (status === "Paused" || status === "Cancelled" || status === "Archived") {
    return "default" as const;
  }
  return "primary" as const;
}

function paymentColor(status?: string | null) {
  if (status === "Paid") return "success" as const;
  if (status === "Overdue") return "error" as const;
  if (status === "Deposit Paid" || status === "Partially Paid") {
    return "warning" as const;
  }
  return "default" as const;
}

function projectClientName(project: ClientProjectSummary | ClientProjectDetail) {
  return (
    project.client?.business_name ||
    project.lead?.business_name ||
    project.lead?.full_name ||
    "Unassigned client"
  );
}

function toProjectForm(project?: ClientProjectDetail | ClientProjectSummary): ProjectFormState {
  if (!project) return emptyProjectForm;

  return {
    client_id: project.client_id ?? "",
    lead_id: project.lead_id ?? "",
    proposal_id: project.proposal_id ?? "",
    package_id: project.package_id ?? "",
    title: project.title ?? "",
    description: project.description ?? "",
    status: (project.status as ClientProjectStatus) ?? "Not Started",
    current_stage: (project.current_stage as ClientProjectStage) ?? "Discovery",
    progress_percent:
      typeof project.progress_percent === "number"
        ? String(project.progress_percent)
        : "0",
    start_date: toDateInput(project.start_date),
    estimated_completion_date: toDateInput(project.estimated_completion_date),
    total_value:
      typeof project.total_value === "number" ? String(project.total_value) : "",
    payment_status:
      (project.payment_status as ClientProjectPaymentStatus) ?? "Unpaid",
    internal_notes: project.internal_notes ?? "",
  };
}

function projectPayload(form: ProjectFormState): UpsertClientProjectInput {
  return {
    client_id: form.client_id,
    lead_id: optional(form.lead_id),
    proposal_id: optional(form.proposal_id),
    package_id: optional(form.package_id),
    title: form.title.trim(),
    description: optional(form.description),
    status: form.status,
    current_stage: form.current_stage,
    progress_percent: optionalNumber(form.progress_percent),
    start_date: toApiDate(form.start_date),
    estimated_completion_date: toApiDate(form.estimated_completion_date),
    total_value: optionalNumber(form.total_value),
    payment_status: form.payment_status,
    internal_notes: optional(form.internal_notes),
  };
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.74),
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 1,
            color: "primary.main",
            display: "grid",
            placeItems: "center",
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
            {label}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 950 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function ClientProjectsTable({
  projects,
  selectedId,
  onSelect,
  onEdit,
  onComplete,
  onArchive,
  mutating,
}: {
  projects: ClientProjectSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (project: ClientProjectSummary) => void;
  onComplete: (id: string) => void;
  onArchive: (id: string) => void;
  mutating: boolean;
}) {
  const theme = useTheme();

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        overflowX: "auto",
      }}
    >
      <Table sx={{ minWidth: 1180 }} aria-label="Client projects table">
        <TableHead>
          <TableRow
            sx={{
              "& th": {
                color: "text.secondary",
                fontSize: "0.72rem",
                fontWeight: 900,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                borderColor: alpha(theme.palette.primary.main, 0.14),
              },
            }}
          >
            <TableCell>Project</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Stage</TableCell>
            <TableCell>Progress</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell>Target</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => {
            const selected = project.id === selectedId;

            return (
              <TableRow
                key={project.id}
                hover
                selected={selected}
                onClick={() => onSelect(project.id)}
                sx={{
                  cursor: "pointer",
                  "& td": {
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                    verticalAlign: "top",
                  },
                  "&.Mui-selected": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.14),
                  },
                }}
              >
                <TableCell>
                  <Typography sx={{ fontWeight: 900 }}>
                    {project.title || "Untitled project"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {project.package?.name || project.proposal?.title || "No package"}
                  </Typography>
                </TableCell>
                <TableCell>{projectClientName(project)}</TableCell>
                <TableCell>
                  <Chip
                    label={project.status || "Unknown"}
                    color={statusColor(project.status)}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                </TableCell>
                <TableCell>{project.current_stage || "Not set"}</TableCell>
                <TableCell>{project.progress_percent ?? 0}%</TableCell>
                <TableCell>{formatCurrency(project.total_value)}</TableCell>
                <TableCell>
                  <Chip
                    label={project.payment_status || "Unknown"}
                    color={paymentColor(project.payment_status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {formatShortDate(project.estimated_completion_date)}
                </TableCell>
                <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                    <Button size="small" variant="outlined" onClick={() => onSelect(project.id)}>
                      View
                    </Button>
                    <IconButton size="small" color="primary" onClick={() => onEdit(project)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <Tooltip title="Complete project">
                      <span>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onComplete(project.id)}
                          disabled={mutating || project.status === "Completed"}
                        >
                          {mutating ? (
                            <CircularProgress size={16} />
                          ) : (
                            <TaskAltOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Archive project">
                      <span>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => onArchive(project.id)}
                          disabled={mutating || project.status === "Archived"}
                        >
                          <ArchiveOutlinedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
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

function ProjectDialog({
  open,
  mode,
  form,
  onChange,
  onClose,
  onSubmit,
  saving,
}: {
  open: boolean;
  mode: ProjectDialogMode;
  form: ProjectFormState;
  onChange: (form: ProjectFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  const { data: clients } = useListClientsQuery({ limit: 100, status: "Active" });
  const { data: leads } = useListLeadsQuery({
    limit: 100,
    archived: "false",
    sort_by: "created_at",
    sort_order: "desc",
  });
  const { data: proposals } = useListProposalsQuery({
    limit: 100,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const { data: packages } = useListServicePackagesQuery({
    limit: 100,
    active: "true",
  });

  const canSubmit =
    form.client_id.trim().length > 0 && form.title.trim().length > 0 && !saving;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {mode === "create" ? "Create Client Project" : "Edit Client Project"}
      </DialogTitle>
      {saving && <LinearProgress />}
      <DialogContent dividers>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 8" } }}>
            <TextField
              label="Project title"
              value={form.title}
              onChange={(event) => onChange({ ...form, title: event.target.value })}
              required
              fullWidth
            />
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
            <TextField
              label="Progress"
              value={form.progress_percent}
              onChange={(event) =>
                onChange({ ...form, progress_percent: event.target.value })
              }
              type="number"
              fullWidth
            />
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
            <TextField
              label="Client"
              value={form.client_id}
              onChange={(event) =>
                onChange({ ...form, client_id: event.target.value })
              }
              select
              required
              fullWidth
            >
              <MenuItem value="">Select client</MenuItem>
              {clients?.data?.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.business_name || client.id}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
            <TextField
              label="Linked lead"
              value={form.lead_id}
              onChange={(event) => onChange({ ...form, lead_id: event.target.value })}
              select
              fullWidth
            >
              <MenuItem value="">No lead</MenuItem>
              {leads?.data?.map((lead) => (
                <MenuItem key={lead.id} value={lead.id}>
                  {lead.business_name || lead.full_name || lead.email || lead.id}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
            <TextField
              label="Proposal"
              value={form.proposal_id}
              onChange={(event) =>
                onChange({ ...form, proposal_id: event.target.value })
              }
              select
              fullWidth
            >
              <MenuItem value="">No proposal</MenuItem>
              {proposals?.data?.map((proposal) => (
                <MenuItem key={proposal.id} value={proposal.id}>
                  {proposal.title || proposal.id}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
            <TextField
              label="Package"
              value={form.package_id}
              onChange={(event) =>
                onChange({ ...form, package_id: event.target.value })
              }
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
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
            <TextField
              label="Status"
              value={form.status}
              onChange={(event) =>
                onChange({ ...form, status: event.target.value as ClientProjectStatus })
              }
              select
              fullWidth
            >
              {clientProjectStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
            <TextField
              label="Stage"
              value={form.current_stage}
              onChange={(event) =>
                onChange({
                  ...form,
                  current_stage: event.target.value as ClientProjectStage,
                })
              }
              select
              fullWidth
            >
              {clientProjectStages.map((stage) => (
                <MenuItem key={stage} value={stage}>
                  {stage}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
            <TextField
              label="Payment"
              value={form.payment_status}
              onChange={(event) =>
                onChange({
                  ...form,
                  payment_status: event.target.value as ClientProjectPaymentStatus,
                })
              }
              select
              fullWidth
            >
              {clientProjectPaymentStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
            <TextField
              label="Start date"
              value={form.start_date}
              onChange={(event) =>
                onChange({ ...form, start_date: event.target.value })
              }
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
            <TextField
              label="Estimated completion"
              value={form.estimated_completion_date}
              onChange={(event) =>
                onChange({
                  ...form,
                  estimated_completion_date: event.target.value,
                })
              }
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
            <TextField
              label="Total value"
              value={form.total_value}
              onChange={(event) =>
                onChange({ ...form, total_value: event.target.value })
              }
              type="number"
              fullWidth
            />
          </Box>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Description"
              value={form.description}
              onChange={(event) =>
                onChange({ ...form, description: event.target.value })
              }
              minRows={3}
              multiline
              fullWidth
            />
          </Box>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Internal notes"
              value={form.internal_notes}
              onChange={(event) =>
                onChange({ ...form, internal_notes: event.target.value })
              }
              minRows={3}
              multiline
              fullWidth
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={!canSubmit}>
          {saving ? "Saving..." : mode === "create" ? "Create Project" : "Save Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ProjectDrawer({
  project,
  open,
  loading,
  onClose,
  onEdit,
}: {
  project?: ClientProjectDetail;
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onEdit: () => void;
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
          width: { xs: "100%", sm: 560 },
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
                Client Project
              </Typography>
              {loading ? (
                <Skeleton width="80%" height={42} />
              ) : (
                <Typography variant={isDesktop ? "h4" : "h5"} sx={{ fontWeight: 950 }}>
                  {project?.title || "Project details"}
                </Typography>
              )}
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {loading || !project ? (
            <Stack spacing={2}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={78} />
              ))}
            </Stack>
          ) : (
            <>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                <Chip
                  label={project.status || "Unknown"}
                  color={statusColor(project.status)}
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  label={project.payment_status || "Payment unknown"}
                  color={paymentColor(project.payment_status)}
                  variant="outlined"
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
                    icon={<FolderOutlinedIcon />}
                    label="Client"
                    value={projectClientName(project)}
                  />
                  <DetailLine
                    icon={<TimelineOutlinedIcon />}
                    label="Stage"
                    value={`${project.current_stage || "Not set"} / ${
                      project.progress_percent ?? 0
                    }%`}
                  />
                  <DetailLine
                    icon={<PaymentsOutlinedIcon />}
                    label="Value"
                    value={formatCurrency(project.total_value)}
                  />
                  <DetailLine
                    icon={<AssignmentTurnedInOutlinedIcon />}
                    label="Client Actions"
                    value={`${project.pending_client_actions_count ?? 0} pending / ${
                      project.missing_required_assets_count ?? 0
                    } missing assets`}
                  />
                </Stack>
              </Paper>

              <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={onEdit}>
                Edit Project
              </Button>

              {project.description && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography sx={{ color: "text.secondary", whiteSpace: "pre-wrap" }}>
                    {project.description}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                  Delivery Health
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                    gap: 1.25,
                  }}
                >
                  <StatCard
                    label="Tasks"
                    value={`${project.tasks_summary?.pending ?? 0} pending`}
                    icon={<TaskAltOutlinedIcon fontSize="small" />}
                  />
                  <StatCard
                    label="Assets"
                    value={`${project.assets_summary?.missing_required ?? 0} missing`}
                    icon={<FolderOutlinedIcon fontSize="small" />}
                  />
                  <StatCard
                    label="Approvals"
                    value={`${project.approvals_summary?.pending ?? 0} pending`}
                    icon={<AssignmentTurnedInOutlinedIcon fontSize="small" />}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                  Milestones
                </Typography>
                <Stack spacing={1.25}>
                  {project.milestones?.length ? (
                    project.milestones.map((milestone) => (
                      <Paper
                        key={milestone.id}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderColor: alpha(theme.palette.primary.main, 0.14),
                          backgroundColor: alpha(theme.palette.background.paper, 0.62),
                        }}
                      >
                        <Stack direction="row" spacing={1.25} sx={{ justifyContent: "space-between" }}>
                          <Box>
                            <Typography sx={{ fontWeight: 900 }}>
                              {milestone.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                              {milestone.stage || "No stage"} /{" "}
                              {formatShortDate(milestone.start_date)}
                            </Typography>
                          </Box>
                          <Chip
                            label={milestone.status || "Unknown"}
                            size="small"
                            color={statusColor(milestone.status)}
                          />
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Typography sx={{ color: "text.secondary" }}>
                      No milestones have been added yet.
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                  Recent Updates
                </Typography>
                <Stack spacing={1.25}>
                  {project.updates?.length ? (
                    project.updates.slice(0, 4).map((update) => (
                      <Paper
                        key={update.id}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderColor: alpha(theme.palette.primary.main, 0.14),
                          backgroundColor: alpha(theme.palette.background.paper, 0.62),
                        }}
                      >
                        <Typography sx={{ fontWeight: 900 }}>{update.title}</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {formatShortDate(update.created_at)}
                          {update.requires_client_action ? " / Client action required" : ""}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography sx={{ color: "text.secondary" }}>
                      No project updates have been posted yet.
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

export default function ClientProjectsManager() {
  const theme = useTheme();
  const [filter, setFilter] = useState<ProjectFilter>("active");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<Message>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<ProjectDialogMode>("create");
  const [form, setForm] = useState<ProjectFormState>(emptyProjectForm);

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

  const { data: summary } = useGetClientProjectsSummaryQuery();
  const { data, isLoading, isFetching, isError, refetch } =
    useListClientProjectsQuery(query);
  const { data: selectedProject, isFetching: loadingSelected } =
    useGetClientProjectQuery(selectedId ?? "", { skip: !selectedId });
  const [createProject, { isLoading: creating }] = useCreateClientProjectMutation();
  const [updateProject, { isLoading: updating }] = useUpdateClientProjectMutation();
  const [completeProject, { isLoading: completing }] =
    useCompleteClientProjectMutation();
  const [archiveProject, { isLoading: archiving }] =
    useArchiveClientProjectMutation();

  const projects =
    filter === "active"
      ? (data?.data ?? []).filter((project) => project.status !== "Archived")
      : data?.data ?? [];
  const mutating = creating || updating || completing || archiving;

  const openCreateDialog = () => {
    setDialogMode("create");
    setForm(emptyProjectForm);
    setDialogOpen(true);
  };

  const openEditDialog = (project?: ClientProjectDetail | ClientProjectSummary) => {
    setDialogMode("edit");
    setForm(toProjectForm(project));
    setSelectedId(project?.id ?? selectedId);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const body = projectPayload(form);

    if (!body.client_id || !body.title) {
      setMessage({
        type: "error",
        text: "Select a client and add a project title before saving.",
      });
      return;
    }

    try {
      if (dialogMode === "create") {
        const created = await createProject(body).unwrap();
        setSelectedId(created.id);
        setMessage({ type: "success", text: "Client project created." });
      } else if (selectedId) {
        await updateProject({ id: selectedId, body }).unwrap();
        setMessage({ type: "success", text: "Client project updated." });
      }
      setDialogOpen(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Could not save client project."),
      });
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeProject(id).unwrap();
      setMessage({ type: "success", text: "Client project marked complete." });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Could not complete client project."),
      });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveProject(id).unwrap();
      if (selectedId === id) setSelectedId(null);
      setMessage({ type: "success", text: "Client project archived." });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Could not archive client project."),
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
              label="Delivery"
              color="primary"
              variant="outlined"
              sx={{ mb: 1.5, fontWeight: 800 }}
            />
            <Typography variant="h3" sx={{ fontWeight: 950, mb: 1 }}>
              Client Projects
            </Typography>
            <Typography sx={{ color: "text.secondary", maxWidth: 720 }}>
              Track delivery status, client actions, milestones, project updates,
              payment state, and launch readiness.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button variant="outlined" onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
              New Client Project
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          <StatCard
            label="Active"
            value={summary?.active_projects ?? 0}
            icon={<FolderOutlinedIcon fontSize="small" />}
          />
          <StatCard
            label="Waiting"
            value={summary?.waiting_on_client ?? 0}
            icon={<AssignmentTurnedInOutlinedIcon fontSize="small" />}
          />
          <StatCard
            label="In Review"
            value={summary?.in_review ?? 0}
            icon={<TimelineOutlinedIcon fontSize="small" />}
          />
          <StatCard
            label="Value"
            value={formatCurrency(summary?.total_project_value)}
            icon={<PaymentsOutlinedIcon fontSize="small" />}
          />
        </Box>

        {message && <Alert severity={message.type}>{message.text}</Alert>}

        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.74),
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              sx={{
                justifyContent: "space-between",
                alignItems: { xs: "stretch", lg: "center" },
              }}
            >
              <Tabs
                value={filter}
                onChange={(_event, value: ProjectFilter) => setFilter(value)}
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
                placeholder="Search projects"
                size="small"
                InputProps={{
                  startAdornment: <SearchOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                sx={{ minWidth: { xs: "auto", lg: 340 } }}
              />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
              <Chip label={`${data?.pagination.total ?? 0} matching projects`} variant="outlined" />
              {isFetching && <CircularProgress size={18} />}
            </Stack>
          </Stack>
        </Paper>

        {isError && (
          <Alert severity="warning">
            Unable to load client projects. Confirm your admin role has
            client_projects.view and that the Nest API is running.
          </Alert>
        )}

        {isLoading ? (
          <Stack spacing={1}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={76} />
            ))}
          </Stack>
        ) : projects.length ? (
          <ClientProjectsTable
            projects={projects}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onEdit={openEditDialog}
            onComplete={(id) => void handleComplete(id)}
            onArchive={(id) => void handleArchive(id)}
            mutating={mutating}
          />
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
              No client projects found
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              Accepted proposals and client delivery work will live here.
            </Typography>
            <Button startIcon={<AddIcon />} variant="contained" onClick={openCreateDialog}>
              New Client Project
            </Button>
          </Paper>
        )}
      </Stack>

      <ProjectDrawer
        open={Boolean(selectedId)}
        project={selectedProject}
        loading={loadingSelected}
        onClose={() => setSelectedId(null)}
        onEdit={() => openEditDialog(selectedProject)}
      />

      <ProjectDialog
        open={dialogOpen}
        mode={dialogMode}
        form={form}
        onChange={setForm}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        saving={creating || updating}
      />
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  Grid,
  IconButton,
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
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  AdminNotificationBridge,
  useAdminNotifications,
  type AdminNotificationMessage,
} from "@/components/admin/notifications/AdminNotifications";
import {
  type Lead,
  type LeadDetail,
  type LeadStatus,
  leadStatuses,
  useArchiveLeadMutation,
  useCreateLeadNoteMutation,
  useGetLeadQuery,
  useListLeadsQuery,
  useUpdateLeadStatusMutation,
} from "@/lib/api/leads-api";

type Message = AdminNotificationMessage | null;
type LeadFilter = "active" | "new" | "proposal" | "won" | "archived" | "all";

const filterOptions: Array<{ value: LeadFilter; label: string; status?: string; archived?: "true" | "false" }> = [
  { value: "active", label: "Active", archived: "false" },
  { value: "new", label: "New", status: "New Lead", archived: "false" },
  { value: "proposal", label: "Proposal", status: "Proposal Sent", archived: "false" },
  { value: "won", label: "Won", status: "Won", archived: "false" },
  { value: "archived", label: "Archived", archived: "true" },
  { value: "all", label: "All" },
];

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
  if (typeof value !== "number") return "Not estimated";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusTone(status?: string | null) {
  if (status === "Won") return "success" as const;
  if (status === "Lost" || status === "Archived") return "default" as const;
  if (status === "Proposal Sent" || status === "Negotiating") return "warning" as const;
  if (status === "New Lead") return "primary" as const;
  return "info" as const;
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

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start", minWidth: 0 }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          borderRadius: 1,
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

function LeadCard({
  lead,
  selected,
  onSelect,
  onArchive,
  archiving,
}: {
  lead: Lead;
  selected: boolean;
  onSelect: () => void;
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
      <CardContent sx={{ p: { xs: 2.25, sm: 2.75 } }}>
        <Stack spacing={2.25}>
          <Stack direction="row" spacing={1.25} sx={{ justifyContent: "space-between" }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.4 }}>
                {lead.full_name || "Unnamed lead"}
              </Typography>
              <Typography sx={{ color: "text.secondary", overflowWrap: "anywhere" }}>
                {lead.business_name || lead.email || "No business name"}
              </Typography>
            </Box>
            <Chip
              label={lead.status || "Unknown"}
              color={statusTone(lead.status)}
              size="small"
              sx={{ flexShrink: 0, fontWeight: 800 }}
            />
          </Stack>

          <Typography
            sx={{
              color: "text.secondary",
              lineHeight: 1.7,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {lead.project_goals || lead.problem_to_solve || lead.additional_notes || "No project summary yet."}
          </Typography>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Budget
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>
                {lead.budget_range || "Not set"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Value
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>
                {formatCurrency(lead.estimated_value)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Timeline
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>
                {lead.desired_timeline || "Not set"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Created
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>
                {formatShortDate(lead.created_at)}
              </Typography>
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}
          >
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              {lead.source && <Chip label={lead.source} size="small" variant="outlined" />}
              {lead.next_follow_up_at && (
                <Chip
                  icon={<EventRepeatOutlinedIcon />}
                  label={formatShortDate(lead.next_follow_up_at)}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ justifyContent: "flex-end" }}>
              <Button size="small" variant="outlined" onClick={onSelect}>
                View
              </Button>
              <Tooltip title="Archive lead">
                <span>
                  <IconButton
                    color="warning"
                    size="small"
                    disabled={archiving || Boolean(lead.archived)}
                    onClick={onArchive}
                  >
                    <ArchiveOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function LeadDetailDrawer({
  leadId,
  onClose,
  onMessage,
}: {
  leadId: string | null;
  onClose: () => void;
  onMessage: (message: AdminNotificationMessage) => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { enqueueNotification } = useAdminNotifications();
  const { data: lead, isLoading, isFetching, isError } = useGetLeadQuery(leadId ?? "", {
    skip: !leadId,
  });
  const [nextStatus, setNextStatus] = useState<LeadStatus>("Contacted");
  const [statusNote, setStatusNote] = useState("");
  const [newNote, setNewNote] = useState("");
  const [updateStatus, updateStatusState] = useUpdateLeadStatusMutation();
  const [createNote, createNoteState] = useCreateLeadNoteMutation();

  const open = Boolean(leadId);

  const runStatusUpdate = async () => {
    if (!leadId) return;

    try {
      await updateStatus({
        id: leadId,
        body: { status: nextStatus, note: statusNote.trim() || undefined },
      }).unwrap();
      setStatusNote("");
      const message = { type: "success" as const, text: "Lead status updated." };
      onMessage(message);
      enqueueNotification(message.text, { variant: message.type });
    } catch (error) {
      const message = {
        type: "error" as const,
        text: getErrorMessage(error, "Unable to update lead status."),
      };
      onMessage(message);
      enqueueNotification(message.text, { variant: message.type });
    }
  };

  const runCreateNote = async () => {
    if (!leadId || !newNote.trim()) return;

    try {
      await createNote({ leadId, note: newNote.trim() }).unwrap();
      setNewNote("");
      const message = { type: "success" as const, text: "Lead note added." };
      onMessage(message);
      enqueueNotification(message.text, { variant: message.type });
    } catch (error) {
      const message = {
        type: "error" as const,
        text: getErrorMessage(error, "Unable to add lead note."),
      };
      onMessage(message);
      enqueueNotification(message.text, { variant: message.type });
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: fullScreen ? "100%" : 560,
          maxWidth: "100vw",
          backgroundImage: "none",
          borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        },
      }}
    >
      <Stack sx={{ minHeight: "100%" }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            p: 2.5,
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Lead Details
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
              {isFetching ? "Refreshing..." : lead?.email || "CRM inquiry"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close lead details">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ p: 2.5, overflowY: "auto", flex: 1 }}>
          {isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={120} />
              <Skeleton variant="rounded" height={220} />
              <Skeleton variant="rounded" height={180} />
            </Stack>
          ) : isError || !lead ? (
            <Alert severity="error">
              Unable to load this lead. Confirm your role has leads.view.
            </Alert>
          ) : (
            <LeadDetailContent
              lead={lead}
              nextStatus={nextStatus}
              statusNote={statusNote}
              newNote={newNote}
              savingStatus={updateStatusState.isLoading}
              savingNote={createNoteState.isLoading}
              onNextStatusChange={setNextStatus}
              onStatusNoteChange={setStatusNote}
              onNewNoteChange={setNewNote}
              onStatusSubmit={() => void runStatusUpdate()}
              onNoteSubmit={() => void runCreateNote()}
            />
          )}
        </Box>
      </Stack>
    </Drawer>
  );
}

function LeadDetailContent({
  lead,
  nextStatus,
  statusNote,
  newNote,
  savingStatus,
  savingNote,
  onNextStatusChange,
  onStatusNoteChange,
  onNewNoteChange,
  onStatusSubmit,
  onNoteSubmit,
}: {
  lead: LeadDetail;
  nextStatus: LeadStatus;
  statusNote: string;
  newNote: string;
  savingStatus: boolean;
  savingNote: boolean;
  onNextStatusChange: (status: LeadStatus) => void;
  onStatusNoteChange: (value: string) => void;
  onNewNoteChange: (value: string) => void;
  onStatusSubmit: () => void;
  onNoteSubmit: () => void;
}) {
  const theme = useTheme();
  const features = Array.isArray(lead.features_needed) ? lead.features_needed : [];

  return (
    <Stack spacing={3}>
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.74),
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.25} sx={{ justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  {lead.full_name || "Unnamed lead"}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {lead.business_name || "No business name"}
                </Typography>
              </Box>
              <Chip
                label={lead.status || "Unknown"}
                color={statusTone(lead.status)}
                sx={{ fontWeight: 800 }}
              />
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoLine icon={<EmailOutlinedIcon />} label="Email" value={lead.email} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoLine icon={<PhoneOutlinedIcon />} label="Phone" value={lead.phone} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoLine
                  icon={<BusinessOutlinedIcon />}
                  label="Industry"
                  value={lead.industry}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoLine
                  icon={<LocalOfferOutlinedIcon />}
                  label="Budget"
                  value={lead.budget_range || formatCurrency(lead.estimated_value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoLine
                  icon={<CalendarTodayOutlinedIcon />}
                  label="Created"
                  value={formatDate(lead.created_at)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoLine
                  icon={<EventRepeatOutlinedIcon />}
                  label="Next follow-up"
                  value={formatDate(lead.next_follow_up_at)}
                />
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        <Typography sx={{ fontWeight: 900 }}>Project Context</Typography>
        <DetailBlock title="Project goals" value={lead.project_goals} />
        <DetailBlock title="Problem to solve" value={lead.problem_to_solve} />
        <DetailBlock title="Additional notes" value={lead.additional_notes} />
        {features.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {features.map((feature) => (
              <Chip key={feature} label={feature} size="small" variant="outlined" />
            ))}
          </Stack>
        )}
      </Stack>

      <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.14) }} />

      <Stack spacing={1.5}>
        <Typography sx={{ fontWeight: 900 }}>Move Lead</Typography>
        <TextField
          select
          label="Next status"
          value={nextStatus}
          onChange={(event) => onNextStatusChange(event.target.value as LeadStatus)}
          fullWidth
        >
          {leadStatuses.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Status note"
          value={statusNote}
          onChange={(event) => onStatusNoteChange(event.target.value)}
          multiline
          minRows={3}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={onStatusSubmit}
          disabled={savingStatus}
          sx={{ alignSelf: "flex-start" }}
        >
          {savingStatus ? "Updating..." : "Update Status"}
        </Button>
      </Stack>

      <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.14) }} />

      <Stack spacing={1.5}>
        <Typography sx={{ fontWeight: 900 }}>Notes</Typography>
        <TextField
          label="Add note"
          value={newNote}
          onChange={(event) => onNewNoteChange(event.target.value)}
          multiline
          minRows={3}
          fullWidth
        />
        <Button
          variant="outlined"
          startIcon={<NotesOutlinedIcon />}
          onClick={onNoteSubmit}
          disabled={savingNote || !newNote.trim()}
          sx={{ alignSelf: "flex-start" }}
        >
          {savingNote ? "Adding..." : "Add Note"}
        </Button>
        <Stack spacing={1.25}>
          {(lead.notes ?? []).length === 0 ? (
            <Typography sx={{ color: "text.secondary" }}>No notes yet.</Typography>
          ) : (
            (lead.notes ?? []).map((note) => (
              <Paper
                key={note.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                  backgroundColor: alpha(theme.palette.common.white, 0.025),
                }}
              >
                <Typography sx={{ lineHeight: 1.6 }}>{note.note}</Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.72rem", mt: 0.8 }}>
                  {note.created_by || "Admin"} - {formatDate(note.created_at)}
                </Typography>
              </Paper>
            ))
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

function DetailBlock({ title, value }: { title: string; value?: string | null }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.25,
        border: `1px solid ${alpha(theme.palette.common.white, 0.09)}`,
        backgroundColor: alpha(theme.palette.common.white, 0.025),
      }}
    >
      <Typography
        sx={{
          color: "primary.main",
          fontSize: "0.68rem",
          fontWeight: 900,
          textTransform: "uppercase",
          mb: 0.6,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ color: value ? "text.primary" : "text.secondary", lineHeight: 1.7 }}>
        {value || "Not provided"}
      </Typography>
    </Box>
  );
}

export default function LeadsManager() {
  const theme = useTheme();
  const { enqueueNotification } = useAdminNotifications();
  const [filter, setFilter] = useState<LeadFilter>("active");
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [archiveLead, archiveLeadState] = useArchiveLeadMutation();

  const filterConfig = filterOptions.find((item) => item.value === filter) ?? filterOptions[0];
  const query = useMemo(
    () => ({
      limit: 25,
      search: search.trim() || undefined,
      status: filterConfig.status,
      archived: filterConfig.archived,
    }),
    [filterConfig.archived, filterConfig.status, search]
  );
  const { data, isLoading, isFetching, isError, refetch } = useListLeadsQuery(query);
  const leads = data?.data ?? [];
  const total = data?.pagination.total ?? leads.length;

  const handleArchive = async (lead: Lead) => {
    if (!window.confirm(`Archive lead from ${lead.full_name || lead.email || "this person"}?`)) {
      return;
    }

    try {
      await archiveLead(lead.id).unwrap();
      const nextMessage = { type: "success" as const, text: "Lead archived." };
      setMessage(nextMessage);
      enqueueNotification(nextMessage.text, { variant: nextMessage.type });
      if (selectedLeadId === lead.id) setSelectedLeadId(null);
    } catch (error) {
      const nextMessage = {
        type: "error" as const,
        text: getErrorMessage(error, "Unable to archive lead."),
      };
      setMessage(nextMessage);
      enqueueNotification(nextMessage.text, { variant: nextMessage.type });
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { xs: "stretch", md: "flex-start" }, justifyContent: "space-between" }}
      >
        <Box>
          <Chip
            label="CRM"
            color="primary"
            variant="outlined"
            sx={{ mb: 1.5, fontWeight: 800 }}
          />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 900, mb: 1 }}>
            Leads
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 760, lineHeight: 1.7 }}>
            Review project inquiries from the public services form and move them
            from first touch to proposal-ready conversations.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => void refetch()}
          disabled={isFetching}
          sx={{ alignSelf: { xs: "stretch", md: "center" } }}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Stack>

      <AdminNotificationBridge message={message} />
      {message && <Alert severity={message.type}>{message.text}</Alert>}

      <Card
        elevation={0}
        sx={{
          border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.72),
        }}
      >
        <Stack spacing={2} sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", lg: "center" } }}
          >
            <Tabs
              value={filter}
              onChange={(_, value: LeadFilter) => setFilter(value)}
              variant="scrollable"
              allowScrollButtonsMobile
            >
              {filterOptions.map((item) => (
                <Tab key={item.value} value={item.value} label={item.label} />
              ))}
            </Tabs>
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, business, or email"
              size="small"
              InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
              sx={{ minWidth: { xs: "auto", lg: 340 } }}
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Chip label={`${total} matching leads`} variant="outlined" />
            {isFetching && <CircularProgress size={18} />}
          </Stack>
        </Stack>
      </Card>

      {isError && (
        <Alert severity="warning">
          Unable to load leads. Confirm your admin role has leads.view and that
          the Nest API is running.
        </Alert>
      )}

      {isLoading ? (
        <Grid container spacing={2.5}>
          {[0, 1, 2, 3].map((item) => (
            <Grid key={item} size={{ xs: 12, xl: 6 }}>
              <Skeleton variant="rounded" height={260} />
            </Grid>
          ))}
        </Grid>
      ) : leads.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.82),
          }}
        >
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
              No leads found
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              New project requests will appear here after visitors submit the
              services form.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {leads.map((lead) => (
            <Grid key={lead.id} size={{ xs: 12, xl: 6 }}>
              <LeadCard
                lead={lead}
                selected={lead.id === selectedLeadId}
                onSelect={() => setSelectedLeadId(lead.id)}
                onArchive={() => void handleArchive(lead)}
                archiving={archiveLeadState.isLoading}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <LeadDetailDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onMessage={setMessage}
      />
    </Stack>
  );
}

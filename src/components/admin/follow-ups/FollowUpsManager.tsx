"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import {
  type AdminNotificationMessage,
  useAdminNotifications,
} from "@/components/admin/notifications/AdminNotifications";
import {
  type FollowUpInput,
  type FollowUpStatus,
  type LeadFollowUp,
  useCompleteFollowUpMutation,
  useCreateFollowUpMutation,
  useDeleteFollowUpMutation,
  useListFollowUpsQuery,
  useListLeadsQuery,
  useUpdateFollowUpMutation,
} from "@/lib/api/leads-api";

type FollowUpFilter = "all" | "pending" | "overdue" | "completed";

const emptyForm: FollowUpInput & { leadId: string } = {
  leadId: "",
  title: "",
  notes: "",
  due_at: "",
  status: "Pending",
};

function apiError(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { message?: string | string[] } }).data;
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(", ");
  }
  return fallback;
}

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatDate(value?: string | null) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function followUpTone(status?: string | null, dueAt?: string | null) {
  if (status === "Completed") return "success" as const;
  if (status === "Cancelled") return "default" as const;
  if (status === "Overdue" || (status === "Pending" && dueAt && new Date(dueAt) < new Date())) {
    return "error" as const;
  }
  return "warning" as const;
}

export default function FollowUpsManager() {
  const theme = useTheme();
  const { enqueueNotification } = useAdminNotifications();
  const [filter, setFilter] = useState<FollowUpFilter>("pending");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LeadFollowUp | null>(null);
  const [form, setForm] = useState(emptyForm);

  const queryParams = useMemo(() => {
    if (filter === "overdue") return { overdue: "true" as const };
    if (filter === "pending") return { status: "Pending" };
    if (filter === "completed") return { status: "Completed" };
    return {};
  }, [filter]);

  const followUpsQuery = useListFollowUpsQuery(queryParams);
  const leadsQuery = useListLeadsQuery({ limit: 100, archived: "false", sort_by: "created_at", sort_order: "desc" });
  const [createFollowUp, createState] = useCreateFollowUpMutation();
  const [updateFollowUp, updateState] = useUpdateFollowUpMutation();
  const [completeFollowUp, completeState] = useCompleteFollowUpMutation();
  const [deleteFollowUp, deleteState] = useDeleteFollowUpMutation();

  const leads = leadsQuery.data?.data ?? [];
  const leadMap = useMemo(
    () => new Map(leads.map((lead) => [lead.id, lead.business_name || lead.full_name || lead.email || "Unnamed lead"])),
    [leads]
  );
  const rows = followUpsQuery.data?.data ?? [];
  const saving = createState.isLoading || updateState.isLoading;

  const notify = (next: AdminNotificationMessage) => {
    enqueueNotification(next.text, { variant: next.type });
  };

  const beginCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const beginEdit = (followUp: LeadFollowUp) => {
    setEditing(followUp);
    setForm({
      leadId: followUp.lead_id,
      title: followUp.title ?? "",
      notes: followUp.notes ?? "",
      due_at: toLocalInput(followUp.due_at),
      status: (followUp.status as FollowUpStatus) ?? "Pending",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.due_at || (!editing && !form.leadId)) return;
    const body: FollowUpInput = {
      title: form.title.trim(),
      notes: form.notes?.trim() || undefined,
      due_at: new Date(form.due_at).toISOString(),
      status: form.status,
    };
    try {
      if (editing) await updateFollowUp({ id: editing.id, body }).unwrap();
      else await createFollowUp({ leadId: form.leadId, body }).unwrap();
      setOpen(false);
      notify({ type: "success", text: editing ? "Follow-up updated." : "Follow-up scheduled." });
    } catch (error) {
      notify({ type: "error", text: apiError(error, "Unable to save the follow-up.") });
    }
  };

  const runComplete = async (id: string) => {
    try {
      await completeFollowUp(id).unwrap();
      notify({ type: "success", text: "Follow-up completed." });
    } catch (error) {
      notify({ type: "error", text: apiError(error, "Unable to complete the follow-up.") });
    }
  };

  const runDelete = async (id: string) => {
    if (!window.confirm("Delete this follow-up?")) return;
    try {
      await deleteFollowUp(id).unwrap();
      notify({ type: "success", text: "Follow-up deleted." });
    } catch (error) {
      notify({ type: "error", text: apiError(error, "Unable to delete the follow-up.") });
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box>
          <Typography component="h1" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: { xs: "1.9rem", md: "2.25rem" }, fontWeight: 900 }}>Follow-ups</Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.6 }}>Schedule outreach and keep active opportunities moving.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={beginCreate}>Schedule Follow-up</Button>
      </Stack>

      <Paper elevation={0} sx={{ overflow: "hidden", border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`, bgcolor: alpha(theme.palette.background.paper, 0.78) }}>
        <Tabs value={filter} onChange={(_, value: FollowUpFilter) => setFilter(value)} variant="scrollable" scrollButtons="auto" sx={{ px: 1, borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
          <Tab value="pending" label="Pending" /><Tab value="overdue" label="Overdue" /><Tab value="completed" label="Completed" /><Tab value="all" label="All" />
        </Tabs>
        {followUpsQuery.isError ? (
          <Alert severity="error" sx={{ m: 2 }}>Unable to load follow-ups. Confirm your role has follow_ups.view.</Alert>
        ) : followUpsQuery.isLoading ? (
          <Stack spacing={1} sx={{ p: 2 }}>{[0, 1, 2, 3].map((item) => <Skeleton key={item} height={54} />)}</Stack>
        ) : rows.length === 0 ? (
          <Stack spacing={1.2} sx={{ p: 6, alignItems: "center", textAlign: "center" }}>
            <EventRepeatOutlinedIcon sx={{ color: "primary.main", fontSize: 34 }} />
            <Typography sx={{ fontWeight: 900 }}>No follow-ups scheduled</Typography>
            <Typography sx={{ color: "text.secondary", maxWidth: 480 }}>Schedule follow-ups to stay on top of your leads and keep deals moving.</Typography>
          </Stack>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 820 }}>
              <TableHead><TableRow><TableCell>Follow-up</TableCell><TableCell>Lead</TableCell><TableCell>Due</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
              <TableBody>{rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell><Typography sx={{ fontWeight: 850 }}>{row.title || "Untitled follow-up"}</Typography><Typography sx={{ color: "text.secondary", fontSize: "0.75rem", maxWidth: 360 }} noWrap>{row.notes || "No notes"}</Typography></TableCell>
                  <TableCell>{leadMap.get(row.lead_id) || "Lead record"}</TableCell>
                  <TableCell>{formatDate(row.due_at)}</TableCell>
                  <TableCell><Chip size="small" variant="outlined" color={followUpTone(row.status, row.due_at)} label={row.status || "Pending"} /></TableCell>
                  <TableCell align="right"><Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                    {row.status !== "Completed" && <Tooltip title="Mark complete"><span><IconButton size="small" color="success" disabled={completeState.isLoading} onClick={() => void runComplete(row.id)}><CheckCircleOutlineIcon fontSize="small" /></IconButton></span></Tooltip>}
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => beginEdit(row)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={deleteState.isLoading} onClick={() => void runDelete(row.id)}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip>
                  </Stack></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Follow-up" : "Schedule Follow-up"}</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          {!editing && <TextField select label="Lead" value={form.leadId} onChange={(event) => setForm((current) => ({ ...current, leadId: event.target.value }))} required fullWidth>{leads.map((lead) => <MenuItem key={lead.id} value={lead.id}>{lead.business_name || lead.full_name || lead.email}</MenuItem>)}</TextField>}
          <TextField label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} inputProps={{ maxLength: 180 }} required fullWidth />
          <TextField label="Notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} inputProps={{ maxLength: 2000 }} multiline minRows={3} fullWidth />
          <TextField label="Due date and time" type="datetime-local" value={form.due_at} onChange={(event) => setForm((current) => ({ ...current, due_at: event.target.value }))} InputLabelProps={{ shrink: true }} required fullWidth />
          <TextField select label="Status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as FollowUpStatus }))} fullWidth>{["Pending", "Completed", "Cancelled", "Overdue"].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField>
        </Stack></DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)} color="inherit">Cancel</Button><Button variant="contained" disabled={saving || !form.title.trim() || !form.due_at || (!editing && !form.leadId)} onClick={() => void submit()}>{saving ? "Saving..." : editing ? "Save Changes" : "Schedule"}</Button></DialogActions>
      </Dialog>
    </Stack>
  );
}

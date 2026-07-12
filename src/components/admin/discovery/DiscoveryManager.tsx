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
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  useAdminNotifications,
} from "@/components/admin/notifications/AdminNotifications";
import {
  type DiscoveryResponse,
  type DiscoveryResponseInput,
  useListDiscoveryResponsesQuery,
  useListLeadsQuery,
  useUpdateDiscoveryResponseMutation,
} from "@/lib/api/leads-api";

type DiscoveryForm = {
  business_goals: string;
  pain_points: string;
  requested_features: string;
  budget_range: string;
  timeline: string;
  readiness_score: string;
  internal_notes: string;
};

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function apiError(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { message?: string | string[] } }).data;
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(", ");
  }
  return fallback;
}

function responseForm(response: DiscoveryResponse): DiscoveryForm {
  const answer = response.answer && typeof response.answer === "object" ? response.answer as Partial<DiscoveryResponse> : {};
  const features = response.requested_features ?? answer.requested_features ?? [];
  return {
    business_goals: response.business_goals ?? answer.business_goals ?? "",
    pain_points: response.pain_points ?? answer.pain_points ?? "",
    requested_features: Array.isArray(features) ? features.join(", ") : "",
    budget_range: response.budget_range ?? answer.budget_range ?? "",
    timeline: response.timeline ?? answer.timeline ?? "",
    readiness_score: String(response.readiness_score ?? answer.readiness_score ?? ""),
    internal_notes: response.internal_notes ?? answer.internal_notes ?? "",
  };
}

export default function DiscoveryManager() {
  const theme = useTheme();
  const { enqueueNotification } = useAdminNotifications();
  const discoveryQuery = useListDiscoveryResponsesQuery();
  const leadsQuery = useListLeadsQuery({ limit: 100, archived: "false", sort_by: "created_at", sort_order: "desc" });
  const [updateResponse, updateState] = useUpdateDiscoveryResponseMutation();
  const [selected, setSelected] = useState<DiscoveryResponse | null>(null);
  const [form, setForm] = useState<DiscoveryForm | null>(null);

  const leadMap = useMemo(
    () => new Map((leadsQuery.data?.data ?? []).map((lead) => [lead.id, {
      name: lead.business_name || lead.full_name || lead.email || "Unnamed lead",
      status: lead.status || "Unknown",
    }])),
    [leadsQuery.data?.data]
  );

  const openResponse = (response: DiscoveryResponse) => {
    setSelected(response);
    setForm(responseForm(response));
  };

  const save = async () => {
    if (!selected || !form) return;
    const parsedScore = form.readiness_score === "" ? undefined : Number(form.readiness_score);
    const body: DiscoveryResponseInput = {
      business_goals: form.business_goals.trim() || undefined,
      pain_points: form.pain_points.trim() || undefined,
      requested_features: form.requested_features.split(",").map((item) => item.trim()).filter(Boolean),
      budget_range: form.budget_range.trim() || undefined,
      timeline: form.timeline.trim() || undefined,
      readiness_score: Number.isFinite(parsedScore) ? parsedScore : undefined,
      internal_notes: form.internal_notes.trim() || undefined,
    };
    try {
      await updateResponse({ id: selected.id, body }).unwrap();
      setSelected(null);
      setForm(null);
      const next = { type: "success" as const, text: "Discovery response updated." };
      enqueueNotification(next.text, { variant: next.type });
    } catch (error) {
      const next = { type: "error" as const, text: apiError(error, "Unable to update the discovery response.") };
      enqueueNotification(next.text, { variant: next.type });
    }
  };

  const rows = discoveryQuery.data ?? [];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: { xs: "1.9rem", md: "2.25rem" }, fontWeight: 900 }}>Discovery</Typography>
        <Typography sx={{ color: "text.secondary", mt: 0.6 }}>Review business needs, project readiness, and discovery outcomes.</Typography>
      </Box>

      <Paper elevation={0} sx={{ overflow: "hidden", border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`, bgcolor: alpha(theme.palette.background.paper, 0.78) }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", p: 2, borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
          <SearchOutlinedIcon sx={{ color: "primary.main" }} />
          <Typography sx={{ fontWeight: 900 }}>Discovery Responses</Typography>
          {!discoveryQuery.isLoading && <Chip size="small" label={rows.length} />}
        </Stack>
        {discoveryQuery.isError ? (
          <Alert severity="error" sx={{ m: 2 }}>Unable to load discovery responses. Confirm your role has discovery_responses.view.</Alert>
        ) : discoveryQuery.isLoading ? (
          <Stack spacing={1} sx={{ p: 2 }}>{[0, 1, 2, 3].map((item) => <Skeleton key={item} height={54} />)}</Stack>
        ) : rows.length === 0 ? (
          <Stack spacing={1.2} sx={{ p: 6, alignItems: "center", textAlign: "center" }}>
            <SearchOutlinedIcon sx={{ color: "primary.main", fontSize: 36 }} />
            <Typography sx={{ fontWeight: 900 }}>No discovery responses yet</Typography>
            <Typography sx={{ color: "text.secondary", maxWidth: 500 }}>Responses will appear here after a lead completes discovery.</Typography>
          </Stack>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 920 }}>
              <TableHead><TableRow><TableCell>Lead</TableCell><TableCell>Goals</TableCell><TableCell>Budget / Timeline</TableCell><TableCell>Readiness</TableCell><TableCell>Submitted</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
              <TableBody>{rows.map((row) => {
                const values = responseForm(row);
                const lead = leadMap.get(row.lead_id);
                return <TableRow key={row.id} hover>
                  <TableCell><Typography sx={{ fontWeight: 850 }}>{lead?.name || "Lead record"}</Typography><Typography sx={{ color: "text.secondary", fontSize: "0.74rem" }}>{lead?.status || row.question_label || "Discovery"}</Typography></TableCell>
                  <TableCell><Typography sx={{ maxWidth: 320 }} noWrap>{values.business_goals || values.pain_points || "Not provided"}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: "0.82rem" }}>{values.budget_range || "Budget open"}</Typography><Typography sx={{ color: "text.secondary", fontSize: "0.72rem" }}>{values.timeline || "Timeline open"}</Typography></TableCell>
                  <TableCell><Chip size="small" variant="outlined" color={Number(values.readiness_score) >= 70 ? "success" : "warning"} label={values.readiness_score ? `${values.readiness_score}%` : "Not scored"} /></TableCell>
                  <TableCell>{formatDate(row.created_at)}</TableCell>
                  <TableCell align="right"><Tooltip title="Review and edit"><IconButton size="small" onClick={() => openResponse(row)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip></TableCell>
                </TableRow>;
              })}</TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={Boolean(selected && form)} onClose={() => !updateState.isLoading && setSelected(null)} fullWidth maxWidth="md">
        <DialogTitle>Review Discovery Response</DialogTitle>
        {form && <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Business goals" value={form.business_goals} onChange={(event) => setForm({ ...form, business_goals: event.target.value })} multiline minRows={3} inputProps={{ maxLength: 3000 }} fullWidth />
          <TextField label="Pain points" value={form.pain_points} onChange={(event) => setForm({ ...form, pain_points: event.target.value })} multiline minRows={3} inputProps={{ maxLength: 3000 }} fullWidth />
          <TextField label="Requested features" helperText="Separate features with commas." value={form.requested_features} onChange={(event) => setForm({ ...form, requested_features: event.target.value })} fullWidth />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Budget range" value={form.budget_range} onChange={(event) => setForm({ ...form, budget_range: event.target.value })} inputProps={{ maxLength: 120 }} fullWidth />
            <TextField label="Timeline" value={form.timeline} onChange={(event) => setForm({ ...form, timeline: event.target.value })} inputProps={{ maxLength: 120 }} fullWidth />
            <TextField label="Readiness score" type="number" value={form.readiness_score} onChange={(event) => setForm({ ...form, readiness_score: event.target.value })} inputProps={{ min: 0, max: 100 }} fullWidth />
          </Stack>
          <TextField label="Internal notes" value={form.internal_notes} onChange={(event) => setForm({ ...form, internal_notes: event.target.value })} multiline minRows={4} inputProps={{ maxLength: 3000 }} fullWidth />
        </Stack></DialogContent>}
        <DialogActions><Button color="inherit" onClick={() => setSelected(null)}>Cancel</Button><Button variant="contained" disabled={updateState.isLoading} onClick={() => void save()}>{updateState.isLoading ? "Saving..." : "Save Review"}</Button></DialogActions>
      </Dialog>
    </Stack>
  );
}

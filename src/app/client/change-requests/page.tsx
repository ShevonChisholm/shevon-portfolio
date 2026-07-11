"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AltRouteOutlinedIcon from "@mui/icons-material/AltRouteOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import PriceChangeOutlinedIcon from "@mui/icons-material/PriceChangeOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  EmptyPanel,
  formatShortDate,
  PageIntro,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import type {
  ClientChangeRequest,
  ClientPortalProject,
} from "@/lib/api/client-portal-api";
import {
  useCreateClientChangeRequestMutation,
  useListClientChangeRequestsQuery,
  useListClientPortalProjectsQuery,
  useRespondToClientChangeRequestMutation,
} from "@/lib/api/client-portal-api";

const filters = ["All", "Submitted", "Under Review", "Approved", "Completed"];

function projectTitleById(projects: ClientPortalProject[]) {
  return new Map(projects.map((project) => [project.id, project.title || project.name || "Client project"]));
}

function sortByRequestedAt(requests: ClientChangeRequest[]) {
  return [...requests].sort((a, b) => {
    const first = a.requested_at || a.created_at || "";
    const second = b.requested_at || b.created_at || "";
    return new Date(second).getTime() - new Date(first).getTime();
  });
}

function currency(value?: number | null) {
  if (value == null) return "Not estimated";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "JMD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ClientChangeRequestsPage() {
  const theme = useTheme();
  const [filter, setFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [responseOpen, setResponseOpen] = useState<ClientChangeRequest | null>(null);
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");
  const [impact, setImpact] = useState("");
  const [response, setResponse] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { data: requests = [], error: requestsError, isLoading, isFetching, refetch } =
    useListClientChangeRequestsQuery();
  const { data: projects = [], error: projectsError } = useListClientPortalProjectsQuery();
  const [createChangeRequest, createState] = useCreateClientChangeRequestMutation();
  const [respondToChangeRequest, responseState] = useRespondToClientChangeRequestMutation();
  const loading = isLoading || isFetching;
  const projectTitles = useMemo(() => projectTitleById(projects), [projects]);
  const filteredRequests = useMemo(() => {
    const sorted = sortByRequestedAt(requests);
    if (filter === "All") return sorted;
    return sorted.filter((request) => request.status === filter);
  }, [requests, filter]);
  const stats = useMemo(() => {
    const open = requests.filter((request) => ["Submitted", "Under Review", "Approved"].includes(request.status || "")).length;
    const approved = requests.filter((request) => request.status === "Approved").length;
    const estimate = requests.reduce((sum, request) => sum + (request.additional_cost ?? 0), 0);
    return { total: requests.length, open, approved, estimate };
  }, [requests]);

  const resetCreateDialog = () => {
    setDialogOpen(false);
    setProjectId("");
    setTitle("");
    setDescription("");
    setReason("");
    setImpact("");
  };

  const resetResponseDialog = () => {
    setResponseOpen(null);
    setResponse("");
    setAcceptTerms(false);
  };

  const handleCreate = async () => {
    if (!projectId || !title.trim()) {
      setMessage({ type: "error", text: "Choose a project and add a change request title." });
      return;
    }
    try {
      await createChangeRequest({
        projectId,
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
          reason: reason.trim() || undefined,
          impact_on_timeline: impact.trim() || undefined,
        },
      }).unwrap();
      setMessage({ type: "success", text: "Change request submitted for review." });
      resetCreateDialog();
    } catch {
      setMessage({ type: "error", text: "Could not submit this change request." });
    }
  };

  const handleRespond = async () => {
    if (!responseOpen?.id || !response.trim()) {
      setMessage({ type: "error", text: "Add a short response before submitting." });
      return;
    }
    try {
      await respondToChangeRequest({
        id: responseOpen.id,
        body: { client_response: response.trim(), accept_terms: acceptTerms },
      }).unwrap();
      setMessage({ type: "success", text: "Response submitted successfully." });
      resetResponseDialog();
    } catch {
      setMessage({ type: "error", text: "Could not submit this response." });
    }
  };

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Change Requests"
        title="Project Change Requests"
        description="Submit scoped changes, track review status, and respond to approved terms."
        action={
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()} disabled={loading}>Refresh</Button>
            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setDialogOpen(true)} disabled={!projects.length}>New Request</Button>
          </Stack>
        }
      />
      {message && <Alert severity={message.type}>{message.text}</Alert>}
      {(requestsError || projectsError) && <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>Some change request data could not be loaded from the NestJS API.</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }, gap: 1.5 }}>
        <PortalStatCard icon={<AltRouteOutlinedIcon />} label="Total Requests" value={stats.total} tone="blue" loading={loading} />
        <PortalStatCard icon={<HourglassEmptyOutlinedIcon />} label="Open Requests" value={stats.open} tone="amber" loading={loading} />
        <PortalStatCard icon={<CheckCircleOutlineIcon />} label="Approved" value={stats.approved} tone="green" loading={loading} />
        <PortalStatCard icon={<PriceChangeOutlinedIcon />} label="Estimated Changes" value={currency(stats.estimate)} tone="purple" loading={loading} />
      </Box>
      <PortalPanel
        title="Request Timeline"
        action={
          <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.25, scrollbarWidth: "thin" }}>
            {filters.map((item) => (
              <Chip key={item} label={item} clickable onClick={() => setFilter(item)} color={filter === item ? "primary" : "default"} variant={filter === item ? "filled" : "outlined"} sx={{ fontWeight: 850, flexShrink: 0 }} />
            ))}
          </Stack>
        }
      >
        {loading ? (
          <Stack sx={{ p: 2 }} spacing={1}>{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} height={104} />)}</Stack>
        ) : filteredRequests.length ? (
          <Box>
            {filteredRequests.map((request) => (
              <Box key={request.id ?? request.title} sx={{ px: 2, py: 1.8, borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.11)}` }}>
                <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { lg: "center" } }}>
                  <Box>
                    <Typography sx={{ fontWeight: 950 }}>{request.title || "Untitled change request"}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 760 }}>
                      {request.description || request.reason || "No detailed description was added."}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {request.client_project_id ? projectTitles.get(request.client_project_id) : "Project request"} · Requested {formatShortDate(request.requested_at || request.created_at)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                    <StatusChip status={request.status} />
                    <Button
                      size="small"
                      variant={request.status === "Approved" ? "contained" : "outlined"}
                      onClick={() => {
                        setResponseOpen(request);
                        setResponse(request.client_response || "");
                        setAcceptTerms(false);
                      }}
                    >
                      {request.client_response ? "Update Response" : "Respond"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyPanel title={requests.length ? "No matching requests" : "No change requests yet"} message={requests.length ? "Try a different status filter." : "Submit a scoped project change when new work or direction appears."} />
        )}
      </PortalPanel>
      <Dialog open={dialogOpen} onClose={createState.isLoading ? undefined : resetCreateDialog} fullWidth maxWidth="sm">
        <DialogTitle>Submit Change Request</DialogTitle>
        {createState.isLoading && <LinearProgress />}
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.75 }}>
            <TextField select label="Project" value={projectId} onChange={(event) => setProjectId(event.target.value)} fullWidth required>
              {projects.map((project) => <MenuItem key={project.id} value={project.id}>{project.title || project.name || "Client project"}</MenuItem>)}
            </TextField>
            <TextField label="Request title" value={title} onChange={(event) => setTitle(event.target.value)} fullWidth required inputProps={{ maxLength: 240 }} />
            <TextField label="What should change?" value={description} onChange={(event) => setDescription(event.target.value)} minRows={4} multiline fullWidth inputProps={{ maxLength: 5000 }} />
            <TextField label="Why is this needed?" value={reason} onChange={(event) => setReason(event.target.value)} minRows={3} multiline fullWidth inputProps={{ maxLength: 2000 }} />
            <TextField label="Timeline impact or urgency" value={impact} onChange={(event) => setImpact(event.target.value)} minRows={2} multiline fullWidth inputProps={{ maxLength: 1000 }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={resetCreateDialog} disabled={createState.isLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={createState.isLoading || !projectId || !title.trim()}>{createState.isLoading ? "Submitting..." : "Submit Request"}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(responseOpen)} onClose={responseState.isLoading ? undefined : resetResponseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Respond to Request</DialogTitle>
        {responseState.isLoading && <LinearProgress />}
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.75 }}>
            <TextField label="Your response" value={response} onChange={(event) => setResponse(event.target.value)} minRows={4} multiline fullWidth required inputProps={{ maxLength: 5000 }} />
            <FormControlLabel control={<Checkbox checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} />} label="I accept the approved change terms." />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={resetResponseDialog} disabled={responseState.isLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleRespond} disabled={responseState.isLoading || !response.trim()}>{responseState.isLoading ? "Submitting..." : "Submit Response"}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

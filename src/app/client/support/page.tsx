"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import {
  EmptyPanel,
  formatShortDate,
  PageIntro,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import type { ClientPortalProject } from "@/lib/api/client-portal-api";
import {
  useCreateClientSupportRequestMutation,
  useListClientPortalProjectsQuery,
  useListClientSupportRequestsQuery,
} from "@/lib/api/client-portal-api";

function projectTitleById(projects: ClientPortalProject[]) {
  return new Map(projects.map((project) => [project.id, project.title || project.name || "Client project"]));
}

export default function ClientSupportPage() {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { data: requests = [], error, isLoading, isFetching, refetch } =
    useListClientSupportRequestsQuery();
  const { data: projects = [] } = useListClientPortalProjectsQuery();
  const [createRequest, createState] = useCreateClientSupportRequestMutation();
  const titles = useMemo(() => projectTitleById(projects), [projects]);
  const open = requests.filter((request) => !["Resolved", "Closed", "Completed"].includes(request.status || "")).length;
  const billable = requests.filter((request) => request.is_billable).length;
  const closed = requests.filter((request) => ["Resolved", "Closed", "Completed"].includes(request.status || "")).length;

  const resetDialog = () => {
    setDialogOpen(false);
    setProjectId("");
    setTitle("");
    setDescription("");
    setPriority("Normal");
  };

  const handleCreate = async () => {
    if (!projectId || !title.trim()) {
      setMessage({ type: "error", text: "Choose a project and add a support title." });
      return;
    }
    try {
      await createRequest({
        projectId,
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
          request_type: "General Support",
          priority,
        },
      }).unwrap();
      setMessage({ type: "success", text: "Support request submitted." });
      resetDialog();
    } catch {
      setMessage({ type: "error", text: "Could not submit this support request." });
    }
  };

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Support"
        title="Support Requests"
        description="Ask for help, report issues, and track support conversations tied to your projects."
        action={<Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setDialogOpen(true)} disabled={!projects.length}>New Request</Button>}
      />
      {message && <Alert severity={message.type}>{message.text}</Alert>}
      {error && <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>Could not load support requests.</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
        <PortalStatCard icon={<SupportAgentOutlinedIcon />} label="Open Requests" value={open} tone="amber" loading={isLoading || isFetching} />
        <PortalStatCard icon={<AddCircleOutlineIcon />} label="Billable" value={billable} tone="purple" loading={isLoading || isFetching} />
        <PortalStatCard icon={<CheckCircleOutlineIcon />} label="Resolved" value={closed} tone="green" loading={isLoading || isFetching} />
      </Box>
      <PortalPanel title="Request History">
        {isLoading ? (
          <Stack sx={{ p: 2 }} spacing={1}>{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} height={76} />)}</Stack>
        ) : requests.length ? (
          <Box>
            {requests.map((request) => (
              <Box key={request.id} sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.11)}` }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                  <Box>
                    <Typography sx={{ fontWeight: 950 }}>{request.title || "Support request"}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {titles.get(request.client_project_id || "") || request.request_type || "Project support"} · {formatShortDate(request.created_at)}
                    </Typography>
                  </Box>
                  <StatusChip status={request.status || request.priority} />
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyPanel title="No support requests" message="Support conversations will appear here." />
        )}
      </PortalPanel>
      <Dialog open={dialogOpen} onClose={createState.isLoading ? undefined : resetDialog} fullWidth maxWidth="sm">
        <DialogTitle>New Support Request</DialogTitle>
        {createState.isLoading && <LinearProgress />}
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.75 }}>
            <TextField select label="Project" value={projectId} onChange={(event) => setProjectId(event.target.value)} required fullWidth>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>{project.title || project.name || "Client project"}</MenuItem>
              ))}
            </TextField>
            <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required fullWidth />
            <TextField select label="Priority" value={priority} onChange={(event) => setPriority(event.target.value)} fullWidth>
              {["Low", "Normal", "High", "Urgent"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <TextField label="Description" value={description} onChange={(event) => setDescription(event.target.value)} minRows={4} multiline fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={resetDialog} disabled={createState.isLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={createState.isLoading || !projectId || !title.trim()}>
            {createState.isLoading ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import {
  EmptyPanel,
  formatShortDate,
  PageIntro,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import type { ClientTask } from "@/lib/api/client-actions-api";
import {
  useListClientPortalTasksQuery,
  useSubmitClientTaskMutation,
} from "@/lib/api/client-portal-api";

export default function ClientTasksPage() {
  const theme = useTheme();
  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);
  const [submissionNote, setSubmissionNote] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { data, error, isLoading, isFetching, refetch } =
    useListClientPortalTasksQuery({ limit: 100 });
  const [submitTask, submitState] = useSubmitClientTaskMutation();
  const tasks = data?.data ?? [];
  const pending = tasks.filter((task) => task.status === "Pending").length;
  const submitted = tasks.filter((task) => task.status === "Submitted").length;
  const approved = tasks.filter((task) => task.status === "Approved").length;

  const closeDialog = () => {
    setSelectedTask(null);
    setSubmissionNote("");
    setSubmissionUrl("");
  };

  const handleSubmit = async () => {
    if (!selectedTask?.id) return;

    try {
      await submitTask({
        id: selectedTask.id,
        body: {
          submission_note: submissionNote.trim() || undefined,
          submission_url: submissionUrl.trim() || undefined,
        },
      }).unwrap();
      setMessage({ type: "success", text: "Task submitted for review." });
      closeDialog();
    } catch {
      setMessage({ type: "error", text: "Could not submit this task." });
    }
  };

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Tasks"
        title="My Tasks"
        description="Review requested tasks, submit links or notes, and keep your project moving."
      />
      {message && <Alert severity={message.type}>{message.text}</Alert>}
      {error && (
        <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
          Could not load your tasks.
        </Alert>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
        <PortalStatCard icon={<TaskAltOutlinedIcon />} label="Pending" value={pending} tone="amber" loading={isLoading || isFetching} />
        <PortalStatCard icon={<AssignmentTurnedInOutlinedIcon />} label="Submitted" value={submitted} tone="purple" loading={isLoading || isFetching} />
        <PortalStatCard icon={<CheckCircleOutlineIcon />} label="Approved" value={approved} tone="green" loading={isLoading || isFetching} />
      </Box>
      <PortalPanel title="Task List">
        {isLoading ? (
          <Stack sx={{ p: 2 }} spacing={1}>{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} height={76} />)}</Stack>
        ) : tasks.length ? (
          <Box>
            {tasks.map((task) => (
              <Box key={task.id} sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.11)}` }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                  <Box>
                    <Typography sx={{ fontWeight: 950 }}>{task.title || "Untitled task"}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {task.description || "No details yet"} · Due {formatShortDate(task.due_date)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <StatusChip status={task.status} />
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={task.status === "Approved"}
                      onClick={() => {
                        setSelectedTask(task);
                        setSubmissionNote(task.submission_note || "");
                        setSubmissionUrl(task.submission_url || "");
                      }}
                    >
                      Submit
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyPanel title="No tasks yet" message="Project tasks will appear here when they need your attention." />
        )}
      </PortalPanel>
      <Dialog open={Boolean(selectedTask)} onClose={submitState.isLoading ? undefined : closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Submit Task</DialogTitle>
        {submitState.isLoading && <LinearProgress />}
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography sx={{ fontWeight: 900 }}>{selectedTask?.title}</Typography>
            <TextField label="Submission link" value={submissionUrl} onChange={(event) => setSubmissionUrl(event.target.value)} fullWidth />
            <TextField label="Submission note" value={submissionNote} onChange={(event) => setSubmissionNote(event.target.value)} minRows={4} multiline fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog} disabled={submitState.isLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitState.isLoading}>
            {submitState.isLoading ? "Submitting..." : "Submit Task"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

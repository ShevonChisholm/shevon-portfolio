"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
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
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
  approvalStatuses,
  clientAssetStatuses,
  clientAssetTypes,
  clientTaskStatuses,
  type ApprovalRequest,
  type ApprovalRequestInput,
  type ApprovalStatus,
  type ClientAsset,
  type ClientAssetInput,
  type ClientAssetStatus,
  type ClientAssetType,
  type ClientTask,
  type ClientTaskInput,
  type ClientTaskStatus,
  useApproveClientAssetMutation,
  useApproveClientTaskMutation,
  useCancelApprovalRequestMutation,
  useCreateApprovalRequestMutation,
  useCreateClientAssetMutation,
  useCreateClientTaskMutation,
  useDeleteApprovalRequestMutation,
  useDeleteClientAssetMutation,
  useDeleteClientTaskMutation,
  useListApprovalRequestsQuery,
  useListClientAssetsQuery,
  useListClientTasksQuery,
  useRejectClientTaskMutation,
  useRequestClientAssetRevisionMutation,
  useUpdateApprovalRequestMutation,
  useUpdateClientAssetMutation,
  useUpdateClientTaskMutation,
} from "@/lib/api/client-actions-api";
import { clientProjectStages } from "@/lib/api/client-projects-api";
import type { AdminNotificationMessage } from "@/components/admin/notifications/AdminNotifications";

type ActionTab = "tasks" | "assets" | "approvals";
type DialogMode = "create" | "create-active" | "edit";

type TaskForm = {
  title: string;
  description: string;
  due_date: string;
  status: ClientTaskStatus;
  visible_to_client: boolean;
};

type AssetForm = {
  title: string;
  description: string;
  asset_type: ClientAssetType;
  file_url: string;
  status: ClientAssetStatus;
  required: boolean;
};

type ApprovalForm = {
  title: string;
  description: string;
  related_stage: string;
  status: ApprovalStatus;
};

const emptyTaskForm: TaskForm = {
  title: "",
  description: "",
  due_date: "",
  status: "Pending",
  visible_to_client: true,
};

const emptyAssetForm: AssetForm = {
  title: "",
  description: "",
  asset_type: "Website Content",
  file_url: "",
  status: "Needed",
  required: true,
};

const emptyApprovalForm: ApprovalForm = {
  title: "",
  description: "",
  related_stage: "Review",
  status: "Pending",
};

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function toApiDate(value: string) {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00.000`).toISOString();
}

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function formatShortDate(value?: string | null) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
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
  if (status === "Approved") return "success" as const;
  if (status === "Submitted" || status === "Pending" || status === "Needed") {
    return "warning" as const;
  }
  if (status === "Rejected" || status === "Needs Revision" || status === "Changes Requested") {
    return "error" as const;
  }
  return "default" as const;
}

function taskFormFrom(task?: ClientTask): TaskForm {
  if (!task) return emptyTaskForm;
  return {
    title: task.title ?? "",
    description: task.description ?? "",
    due_date: toDateInput(task.due_date),
    status: (task.status as ClientTaskStatus) ?? "Pending",
    visible_to_client: task.visible_to_client ?? true,
  };
}

function assetFormFrom(asset?: ClientAsset): AssetForm {
  if (!asset) return emptyAssetForm;
  return {
    title: asset.title ?? "",
    description: asset.description ?? "",
    asset_type: (asset.asset_type as ClientAssetType) ?? "Website Content",
    file_url: asset.file_url ?? "",
    status: (asset.status as ClientAssetStatus) ?? "Needed",
    required: asset.required ?? true,
  };
}

function approvalFormFrom(approval?: ApprovalRequest): ApprovalForm {
  if (!approval) return emptyApprovalForm;
  return {
    title: approval.title ?? "",
    description: approval.description ?? "",
    related_stage: approval.related_stage ?? "Review",
    status: (approval.status as ApprovalStatus) ?? "Pending",
  };
}

function taskPayload(form: TaskForm): ClientTaskInput {
  return {
    title: form.title.trim(),
    description: optional(form.description),
    due_date: toApiDate(form.due_date),
    status: form.status,
    visible_to_client: form.visible_to_client,
  };
}

function assetPayload(form: AssetForm): ClientAssetInput {
  return {
    title: form.title.trim(),
    description: optional(form.description),
    asset_type: form.asset_type,
    file_url: optional(form.file_url),
    status: form.status,
    required: form.required,
  };
}

function approvalPayload(form: ApprovalForm): ApprovalRequestInput {
  return {
    title: form.title.trim(),
    description: optional(form.description),
    related_stage: optional(form.related_stage),
    status: form.status,
  };
}

export default function ClientProjectActionsPanel({
  projectId,
  onMessage,
}: {
  projectId: string;
  onMessage: (message: AdminNotificationMessage) => void;
}) {
  const theme = useTheme();
  const [tab, setTab] = useState<ActionTab>("tasks");
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<TaskForm>(emptyTaskForm);
  const [assetForm, setAssetForm] = useState<AssetForm>(emptyAssetForm);
  const [approvalForm, setApprovalForm] = useState<ApprovalForm>(emptyApprovalForm);

  const { data: tasks, isFetching: loadingTasks } = useListClientTasksQuery({
    project_id: projectId,
    limit: 100,
  });
  const { data: assets, isFetching: loadingAssets } = useListClientAssetsQuery({
    project_id: projectId,
    limit: 100,
  });
  const { data: approvals, isFetching: loadingApprovals } =
    useListApprovalRequestsQuery({ project_id: projectId, limit: 100 });

  const [createTask, createTaskState] = useCreateClientTaskMutation();
  const [updateTask, updateTaskState] = useUpdateClientTaskMutation();
  const [approveTask, approveTaskState] = useApproveClientTaskMutation();
  const [rejectTask, rejectTaskState] = useRejectClientTaskMutation();
  const [deleteTask, deleteTaskState] = useDeleteClientTaskMutation();
  const [createAsset, createAssetState] = useCreateClientAssetMutation();
  const [updateAsset, updateAssetState] = useUpdateClientAssetMutation();
  const [approveAsset, approveAssetState] = useApproveClientAssetMutation();
  const [requestAssetRevision, requestRevisionState] =
    useRequestClientAssetRevisionMutation();
  const [deleteAsset, deleteAssetState] = useDeleteClientAssetMutation();
  const [createApproval, createApprovalState] = useCreateApprovalRequestMutation();
  const [updateApproval, updateApprovalState] = useUpdateApprovalRequestMutation();
  const [cancelApproval, cancelApprovalState] = useCancelApprovalRequestMutation();
  const [deleteApproval, deleteApprovalState] = useDeleteApprovalRequestMutation();

  const dialogOpen = Boolean(editingId) || dialogMode === "create-active";
  const saving =
    createTaskState.isLoading ||
    updateTaskState.isLoading ||
    createAssetState.isLoading ||
    updateAssetState.isLoading ||
    createApprovalState.isLoading ||
    updateApprovalState.isLoading;
  const rowMutating =
    approveTaskState.isLoading ||
    rejectTaskState.isLoading ||
    deleteTaskState.isLoading ||
    approveAssetState.isLoading ||
    requestRevisionState.isLoading ||
    deleteAssetState.isLoading ||
    cancelApprovalState.isLoading ||
    deleteApprovalState.isLoading;

  const closeDialog = () => {
    setDialogMode("create");
    setEditingId(null);
  };

  const openCreate = (nextTab = tab) => {
    setTab(nextTab);
    setDialogMode("create-active");
    setEditingId(null);
    setTaskForm(emptyTaskForm);
    setAssetForm(emptyAssetForm);
    setApprovalForm(emptyApprovalForm);
  };

  const openEditTask = (task: ClientTask) => {
    setTab("tasks");
    setDialogMode("edit");
    setEditingId(task.id);
    setTaskForm(taskFormFrom(task));
  };

  const openEditAsset = (asset: ClientAsset) => {
    setTab("assets");
    setDialogMode("edit");
    setEditingId(asset.id);
    setAssetForm(assetFormFrom(asset));
  };

  const openEditApproval = (approval: ApprovalRequest) => {
    setTab("approvals");
    setDialogMode("edit");
    setEditingId(approval.id);
    setApprovalForm(approvalFormFrom(approval));
  };

  const saveCurrent = async () => {
    try {
      if (tab === "tasks") {
        const body = taskPayload(taskForm);
        if (!body.title) throw new Error("Task title is required.");
        if (editingId) {
          await updateTask({ id: editingId, body }).unwrap();
          onMessage({ type: "success", text: "Task updated." });
        } else {
          await createTask({ projectId, body }).unwrap();
          onMessage({ type: "success", text: "Task created." });
        }
      }

      if (tab === "assets") {
        const body = assetPayload(assetForm);
        if (!body.title) throw new Error("Asset title is required.");
        await (editingId
          ? updateAsset({ id: editingId, body })
          : createAsset({ projectId, body })
        ).unwrap();
        onMessage({
          type: "success",
          text: editingId ? "Asset request updated." : "Asset request created.",
        });
      }

      if (tab === "approvals") {
        const body = approvalPayload(approvalForm);
        if (!body.title) throw new Error("Approval title is required.");
        await (editingId
          ? updateApproval({ id: editingId, body })
          : createApproval({ projectId, body })
        ).unwrap();
        onMessage({
          type: "success",
          text: editingId ? "Approval request updated." : "Approval request created.",
        });
      }

      closeDialog();
    } catch (error) {
      onMessage({
        type: "error",
        text: getErrorMessage(error, "Could not save client action."),
      });
    }
  };

  const runRowAction = async (
    action: () => Promise<unknown>,
    successText: string,
    fallback: string
  ) => {
    try {
      await action();
      onMessage({ type: "success", text: successText });
    } catch (error) {
      onMessage({ type: "error", text: getErrorMessage(error, fallback) });
    }
  };

  return (
    <Stack spacing={2.25}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Tasks, Assets & Approvals
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Manage what the client needs to submit, approve, or review.
          </Typography>
        </Box>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => openCreate()}>
          Add {tab === "tasks" ? "Task" : tab === "assets" ? "Asset" : "Approval"}
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.62),
        }}
      >
        <Tabs
          value={tab}
          onChange={(_event, value: ActionTab) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="tasks" label={`Tasks (${tasks?.pagination.total ?? 0})`} />
          <Tab value="assets" label={`Assets (${assets?.pagination.total ?? 0})`} />
          <Tab
            value="approvals"
            label={`Approvals (${approvals?.pagination.total ?? 0})`}
          />
        </Tabs>
      </Paper>

      {tab === "tasks" && (
        <ActionTable loading={loadingTasks}>
          <TableHead>
            <HeaderRow columns={["Task", "Status", "Due", "Visible", "Actions"]} />
          </TableHead>
          <TableBody>
            {(tasks?.data ?? []).map((task) => (
              <TableRow key={task.id} hover>
                <TableCell>
                  <Typography sx={{ fontWeight: 900 }}>{task.title}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {task.description || "No description"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status || "Unknown"}
                    color={statusColor(task.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatShortDate(task.due_date)}</TableCell>
                <TableCell>{task.visible_to_client ? "Yes" : "No"}</TableCell>
                <TableCell align="right">
                  <ActionButtons
                    disabled={rowMutating}
                    onEdit={() => openEditTask(task)}
                    approveLabel="Approve"
                    rejectLabel="Reject"
                    onApprove={() =>
                      runRowAction(
                        () => approveTask(task.id).unwrap(),
                        "Task approved.",
                        "Could not approve task."
                      )
                    }
                    onReject={() =>
                      runRowAction(
                        () => rejectTask(task.id).unwrap(),
                        "Task rejected.",
                        "Could not reject task."
                      )
                    }
                    onDelete={() =>
                      runRowAction(
                        () => deleteTask(task.id).unwrap(),
                        "Task deleted.",
                        "Could not delete task."
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ActionTable>
      )}

      {tab === "assets" && (
        <ActionTable loading={loadingAssets}>
          <TableHead>
            <HeaderRow columns={["Asset", "Type", "Status", "Required", "Actions"]} />
          </TableHead>
          <TableBody>
            {(assets?.data ?? []).map((asset) => (
              <TableRow key={asset.id} hover>
                <TableCell>
                  <Typography sx={{ fontWeight: 900 }}>{asset.title}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {asset.file_url || asset.description || "No file yet"}
                  </Typography>
                </TableCell>
                <TableCell>{asset.asset_type || "Other"}</TableCell>
                <TableCell>
                  <Chip
                    label={asset.status || "Unknown"}
                    color={statusColor(asset.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{asset.required ? "Yes" : "No"}</TableCell>
                <TableCell align="right">
                  <ActionButtons
                    disabled={rowMutating}
                    onEdit={() => openEditAsset(asset)}
                    approveLabel="Approve"
                    rejectLabel="Revision"
                    onApprove={() =>
                      runRowAction(
                        () => approveAsset(asset.id).unwrap(),
                        "Asset approved.",
                        "Could not approve asset."
                      )
                    }
                    onReject={() =>
                      runRowAction(
                        () => requestAssetRevision(asset.id).unwrap(),
                        "Revision requested.",
                        "Could not request revision."
                      )
                    }
                    onDelete={() =>
                      runRowAction(
                        () => deleteAsset(asset.id).unwrap(),
                        "Asset request deleted.",
                        "Could not delete asset request."
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ActionTable>
      )}

      {tab === "approvals" && (
        <ActionTable loading={loadingApprovals}>
          <TableHead>
            <HeaderRow columns={["Approval", "Stage", "Status", "Requested", "Actions"]} />
          </TableHead>
          <TableBody>
            {(approvals?.data ?? []).map((approval) => (
              <TableRow key={approval.id} hover>
                <TableCell>
                  <Typography sx={{ fontWeight: 900 }}>{approval.title}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {approval.client_response || approval.description || "No response yet"}
                  </Typography>
                </TableCell>
                <TableCell>{approval.related_stage || "Review"}</TableCell>
                <TableCell>
                  <Chip
                    label={approval.status || "Unknown"}
                    color={statusColor(approval.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatShortDate(approval.requested_at)}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.75} sx={{ justifyContent: "flex-end" }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEditApproval(approval)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel">
                      <span>
                        <IconButton
                          size="small"
                          color="warning"
                          disabled={rowMutating || approval.status === "Cancelled"}
                          onClick={() =>
                            runRowAction(
                              () => cancelApproval(approval.id).unwrap(),
                              "Approval request cancelled.",
                              "Could not cancel approval request."
                            )
                          }
                        >
                          <ReportProblemOutlinedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={rowMutating}
                          onClick={() =>
                            runRowAction(
                              () => deleteApproval(approval.id).unwrap(),
                              "Approval request deleted.",
                              "Could not delete approval request."
                            )
                          }
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ActionTable>
      )}

      <Dialog open={dialogOpen} onClose={saving ? undefined : closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogMode === "edit" ? "Edit" : "Create"}{" "}
          {tab === "tasks" ? "Task" : tab === "assets" ? "Asset Request" : "Approval Request"}
        </DialogTitle>
        {saving && <LinearProgress />}
        <DialogContent dividers>
          {tab === "tasks" && (
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <TextField
                label="Title"
                value={taskForm.title}
                onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Status"
                value={taskForm.status}
                onChange={(event) =>
                  setTaskForm({ ...taskForm, status: event.target.value as ClientTaskStatus })
                }
                select
                fullWidth
              >
                {clientTaskStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Due date"
                value={taskForm.due_date}
                onChange={(event) => setTaskForm({ ...taskForm, due_date: event.target.value })}
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Description"
                value={taskForm.description}
                onChange={(event) =>
                  setTaskForm({ ...taskForm, description: event.target.value })
                }
                minRows={3}
                multiline
                fullWidth
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={taskForm.visible_to_client}
                    onChange={(event) =>
                      setTaskForm({
                        ...taskForm,
                        visible_to_client: event.target.checked,
                      })
                    }
                  />
                }
                label="Visible to client"
              />
            </Stack>
          )}

          {tab === "assets" && (
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <TextField
                label="Title"
                value={assetForm.title}
                onChange={(event) => setAssetForm({ ...assetForm, title: event.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Asset type"
                value={assetForm.asset_type}
                onChange={(event) =>
                  setAssetForm({ ...assetForm, asset_type: event.target.value as ClientAssetType })
                }
                select
                fullWidth
              >
                {clientAssetTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Status"
                value={assetForm.status}
                onChange={(event) =>
                  setAssetForm({ ...assetForm, status: event.target.value as ClientAssetStatus })
                }
                select
                fullWidth
              >
                {clientAssetStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="File URL"
                value={assetForm.file_url}
                onChange={(event) =>
                  setAssetForm({ ...assetForm, file_url: event.target.value })
                }
                fullWidth
              />
              <TextField
                label="Description"
                value={assetForm.description}
                onChange={(event) =>
                  setAssetForm({ ...assetForm, description: event.target.value })
                }
                minRows={3}
                multiline
                fullWidth
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assetForm.required}
                    onChange={(event) =>
                      setAssetForm({ ...assetForm, required: event.target.checked })
                    }
                  />
                }
                label="Required asset"
              />
            </Stack>
          )}

          {tab === "approvals" && (
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <TextField
                label="Title"
                value={approvalForm.title}
                onChange={(event) =>
                  setApprovalForm({ ...approvalForm, title: event.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Related stage"
                value={approvalForm.related_stage}
                onChange={(event) =>
                  setApprovalForm({
                    ...approvalForm,
                    related_stage: event.target.value,
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
              <TextField
                label="Status"
                value={approvalForm.status}
                onChange={(event) =>
                  setApprovalForm({
                    ...approvalForm,
                    status: event.target.value as ApprovalStatus,
                  })
                }
                select
                fullWidth
              >
                {approvalStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Description"
                value={approvalForm.description}
                onChange={(event) =>
                  setApprovalForm({
                    ...approvalForm,
                    description: event.target.value,
                  })
                }
                minRows={3}
                multiline
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void saveCurrent()} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function HeaderRow({ columns }: { columns: string[] }) {
  const theme = useTheme();
  return (
    <TableRow
      sx={{
        "& th": {
          color: "text.secondary",
          fontSize: "0.68rem",
          fontWeight: 900,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          borderColor: alpha(theme.palette.primary.main, 0.14),
        },
      }}
    >
      {columns.map((column, index) => (
        <TableCell key={column} align={index === columns.length - 1 ? "right" : "left"}>
          {column}
        </TableCell>
      ))}
    </TableRow>
  );
}

function ActionTable({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
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
      {loading && <LinearProgress />}
      <Table size="small" sx={{ minWidth: 760 }}>
        {children}
      </Table>
    </TableContainer>
  );
}

function ActionButtons({
  disabled,
  onEdit,
  approveLabel,
  rejectLabel,
  onApprove,
  onReject,
  onDelete,
}: {
  disabled: boolean;
  onEdit: () => void;
  approveLabel: string;
  rejectLabel: string;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ justifyContent: "flex-end" }}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={onEdit}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={approveLabel}>
        <span>
          <IconButton size="small" color="success" disabled={disabled} onClick={onApprove}>
            <CheckCircleOutlineIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={rejectLabel}>
        <span>
          <IconButton size="small" color="warning" disabled={disabled} onClick={onReject}>
            <ReportProblemOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Delete">
        <span>
          <IconButton size="small" color="error" disabled={disabled} onClick={onDelete}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}

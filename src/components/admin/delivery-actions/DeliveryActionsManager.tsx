"use client";

import { useMemo, useState } from "react";
import {
  Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControlLabel, IconButton, Link as MuiLink, MenuItem, Paper,
  Skeleton, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Tabs, TextField, Tooltip, Typography, useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LaunchIcon from "@mui/icons-material/Launch";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import { useAdminNotifications } from "@/components/admin/notifications/AdminNotifications";
import {
  approvalStatuses, clientAssetStatuses, clientAssetTypes, clientTaskStatuses,
  type ApprovalRequest, type ApprovalRequestInput, type ApprovalStatus,
  type ClientAsset, type ClientAssetInput, type ClientAssetStatus, type ClientAssetType,
  type ClientTask, type ClientTaskInput, type ClientTaskStatus,
  useApproveClientAssetMutation, useApproveClientTaskMutation,
  useCancelApprovalRequestMutation, useCreateApprovalRequestMutation,
  useCreateClientAssetMutation, useCreateClientTaskMutation,
  useDeleteApprovalRequestMutation, useDeleteClientAssetMutation,
  useDeleteClientTaskMutation, useListApprovalRequestsQuery,
  useListClientAssetsQuery, useListClientTasksQuery,
  useRejectClientTaskMutation, useRequestClientAssetRevisionMutation,
  useUpdateApprovalRequestMutation, useUpdateClientAssetMutation,
  useUpdateClientTaskMutation,
} from "@/lib/api/client-actions-api";
import { useListClientProjectsQuery } from "@/lib/api/client-projects-api";

export type DeliveryActionKind = "tasks" | "assets" | "approvals";
type DeliveryRecord = ClientTask | ClientAsset | ApprovalRequest;

const config = {
  tasks: { title: "Client Tasks", description: "Assign work, review client submissions, and keep delivery moving.", button: "Add Task", empty: "No client tasks yet", emptyDetail: "Assign tasks to clients for content, approvals, and deliverables.", icon: TaskAltOutlinedIcon },
  assets: { title: "Client Assets", description: "Request, review, and organize the materials needed for active projects.", button: "Request Asset", empty: "No assets requested", emptyDetail: "Request logos, content, and other assets from clients as needed.", icon: ImageOutlinedIcon },
  approvals: { title: "Approval Requests", description: "Send deliverables for client review and track formal decisions.", button: "Request Approval", empty: "No approval requests", emptyDetail: "Request approvals from clients for designs, content, and deliverables.", icon: RateReviewOutlinedIcon },
} as const;

type FormState = {
  projectId: string; title: string; description: string; status: string;
  dueDate: string; visible: boolean; assetType: ClientAssetType; fileUrl: string;
  required: boolean; relatedStage: string;
};

const emptyForm: FormState = { projectId: "", title: "", description: "", status: "", dueDate: "", visible: true, assetType: "Other", fileUrl: "", required: true, relatedStage: "" };

function apiError(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "data" in error) {
    const message = (error as { data?: { message?: string | string[] } }).data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  return fallback;
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function toDateInput(value?: string | null) { return value ? value.slice(0, 10) : ""; }
function apiDate(value: string) { return value ? new Date(`${value}T00:00:00.000`).toISOString() : undefined; }
function statusTone(status?: string | null) {
  if (status === "Approved" || status === "Completed") return "success" as const;
  if (status === "Rejected" || status === "Changes Requested" || status === "Needs Revision") return "error" as const;
  if (status === "Submitted" || status === "Pending" || status === "Needed") return "warning" as const;
  return "default" as const;
}
function isTask(record: DeliveryRecord): record is ClientTask { return "due_date" in record; }
function isAsset(record: DeliveryRecord): record is ClientAsset { return "asset_type" in record; }

export default function DeliveryActionsManager({ kind }: { kind: DeliveryActionKind }) {
  const theme = useTheme();
  const view = config[kind];
  const Icon = view.icon;
  const { enqueueNotification } = useAdminNotifications();
  const [filter, setFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryRecord | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const tasksQuery = useListClientTasksQuery({ limit: 100, project_id: projectFilter || undefined, status: filter === "All" ? undefined : filter }, { skip: kind !== "tasks" });
  const assetsQuery = useListClientAssetsQuery({ limit: 100, project_id: projectFilter || undefined, status: filter === "All" ? undefined : filter }, { skip: kind !== "assets" });
  const approvalsQuery = useListApprovalRequestsQuery({ limit: 100, project_id: projectFilter || undefined, status: filter === "All" ? undefined : filter }, { skip: kind !== "approvals" });
  const projectsQuery = useListClientProjectsQuery({ limit: 100, sort_by: "created_at", sort_order: "desc" });

  const [createTask, createTaskState] = useCreateClientTaskMutation(); const [updateTask, updateTaskState] = useUpdateClientTaskMutation();
  const [approveTask, approveTaskState] = useApproveClientTaskMutation(); const [rejectTask, rejectTaskState] = useRejectClientTaskMutation(); const [deleteTask, deleteTaskState] = useDeleteClientTaskMutation();
  const [createAsset, createAssetState] = useCreateClientAssetMutation(); const [updateAsset, updateAssetState] = useUpdateClientAssetMutation();
  const [approveAsset, approveAssetState] = useApproveClientAssetMutation(); const [reviseAsset, reviseAssetState] = useRequestClientAssetRevisionMutation(); const [deleteAsset, deleteAssetState] = useDeleteClientAssetMutation();
  const [createApproval, createApprovalState] = useCreateApprovalRequestMutation(); const [updateApproval, updateApprovalState] = useUpdateApprovalRequestMutation();
  const [cancelApproval, cancelApprovalState] = useCancelApprovalRequestMutation(); const [deleteApproval, deleteApprovalState] = useDeleteApprovalRequestMutation();

  const query = kind === "tasks" ? tasksQuery : kind === "assets" ? assetsQuery : approvalsQuery;
  const records = (query.data?.data ?? []) as DeliveryRecord[];
  const projects = projectsQuery.data?.data ?? [];
  const projectMap = useMemo(() => new Map(projects.map((project) => [project.id, project.title || "Untitled project"])), [projects]);
  const statuses = kind === "tasks" ? clientTaskStatuses : kind === "assets" ? clientAssetStatuses : approvalStatuses;
  const saving = createTaskState.isLoading || updateTaskState.isLoading || createAssetState.isLoading || updateAssetState.isLoading || createApprovalState.isLoading || updateApprovalState.isLoading;
  const acting = approveTaskState.isLoading || rejectTaskState.isLoading || deleteTaskState.isLoading || approveAssetState.isLoading || reviseAssetState.isLoading || deleteAssetState.isLoading || cancelApprovalState.isLoading || deleteApprovalState.isLoading;
  const notify = (text: string, variant: "success" | "error") => enqueueNotification(text, { variant });

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, projectId: projectFilter, status: kind === "tasks" ? "Pending" : kind === "assets" ? "Needed" : "Pending" });
    setDialogOpen(true);
  };
  const startEdit = (record: DeliveryRecord) => {
    setEditing(record);
    setForm({ projectId: record.client_project_id ?? "", title: record.title ?? "", description: record.description ?? "", status: record.status ?? "", dueDate: isTask(record) ? toDateInput(record.due_date) : "", visible: isTask(record) ? record.visible_to_client ?? true : true, assetType: isAsset(record) ? (record.asset_type as ClientAssetType) ?? "Other" : "Other", fileUrl: isAsset(record) ? record.file_url ?? "" : "", required: isAsset(record) ? record.required ?? true : true, relatedStage: !isTask(record) && !isAsset(record) ? record.related_stage ?? "" : "" });
    setDialogOpen(true);
  };
  const save = async () => {
    if (!form.projectId || !form.title.trim()) return;
    try {
      if (kind === "tasks") {
        const body: ClientTaskInput = { title: form.title.trim(), description: form.description.trim() || undefined, due_date: apiDate(form.dueDate), status: form.status as ClientTaskStatus, visible_to_client: form.visible };
        if (editing) await updateTask({ id: editing.id, body }).unwrap(); else await createTask({ projectId: form.projectId, body }).unwrap();
      } else if (kind === "assets") {
        const body: ClientAssetInput = { title: form.title.trim(), description: form.description.trim() || undefined, asset_type: form.assetType, file_url: form.fileUrl.trim() || undefined, status: form.status as ClientAssetStatus, required: form.required };
        if (editing) await updateAsset({ id: editing.id, body }).unwrap(); else await createAsset({ projectId: form.projectId, body }).unwrap();
      } else {
        const body: ApprovalRequestInput = { title: form.title.trim(), description: form.description.trim() || undefined, related_stage: form.relatedStage.trim() || undefined, status: form.status as ApprovalStatus };
        if (editing) await updateApproval({ id: editing.id, body }).unwrap(); else await createApproval({ projectId: form.projectId, body }).unwrap();
      }
      setDialogOpen(false); notify(editing ? `${view.title.slice(0, -1)} updated.` : `${view.button} created.`, "success");
    } catch (error) { notify(apiError(error, `Could not save ${view.title.toLowerCase()}.`), "error"); }
  };
  const action = async (record: DeliveryRecord, operation: "approve" | "reject" | "revise" | "cancel" | "delete") => {
    if (operation === "delete" && !window.confirm(`Delete “${record.title || "this item"}”?`)) return;
    try {
      if (kind === "tasks") { if (operation === "approve") await approveTask(record.id).unwrap(); if (operation === "reject") await rejectTask(record.id).unwrap(); if (operation === "delete") await deleteTask(record.id).unwrap(); }
      if (kind === "assets") { if (operation === "approve") await approveAsset(record.id).unwrap(); if (operation === "revise") await reviseAsset(record.id).unwrap(); if (operation === "delete") await deleteAsset(record.id).unwrap(); }
      if (kind === "approvals") { if (operation === "cancel") await cancelApproval(record.id).unwrap(); if (operation === "delete") await deleteApproval(record.id).unwrap(); }
      notify(operation === "delete" ? "Item deleted." : "Status updated.", "success");
    } catch (error) { notify(apiError(error, "Could not complete this action."), "error"); }
  };

  return <Stack spacing={3}>
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}><Box><Typography component="h1" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: { xs: "1.9rem", md: "2.25rem" }, fontWeight: 900 }}>{view.title}</Typography><Typography sx={{ color: "text.secondary", mt: 0.6 }}>{view.description}</Typography></Box><Button variant="contained" startIcon={<AddIcon />} onClick={startCreate}>{view.button}</Button></Stack>
    <Paper elevation={0} sx={{ overflow: "hidden", border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`, bgcolor: alpha(theme.palette.background.paper, 0.78) }}>
      <Stack direction={{ xs: "column", lg: "row" }} sx={{ justifyContent: "space-between", alignItems: { lg: "center" }, borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}><Tabs value={filter} onChange={(_, value: string) => setFilter(value)} variant="scrollable" scrollButtons="auto" sx={{ px: 1 }}><Tab value="All" label="All" />{statuses.map((status) => <Tab key={status} value={status} label={status} />)}</Tabs><TextField select label="Project" size="small" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} sx={{ m: 1.2, minWidth: { xs: "auto", lg: 260 } }}><MenuItem value="">All projects</MenuItem>{projects.map((project) => <MenuItem key={project.id} value={project.id}>{project.title || "Untitled project"}</MenuItem>)}</TextField></Stack>
      {query.isError ? <Alert severity="error" sx={{ m: 2 }}>Unable to load {view.title.toLowerCase()}.</Alert> : query.isLoading ? <Stack spacing={1} sx={{ p: 2 }}>{[0,1,2,3].map((item) => <Skeleton key={item} height={58} />)}</Stack> : records.length ? <TableContainer><Table sx={{ minWidth: 900 }}><TableHead><TableRow><TableCell>Item</TableCell><TableCell>Project</TableCell><TableCell>{kind === "tasks" ? "Due" : kind === "assets" ? "Type" : "Stage"}</TableCell><TableCell>Submission / Response</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{records.map((record) => <TableRow key={record.id} hover><TableCell><Typography sx={{ fontWeight: 850 }}>{record.title || "Untitled"}</Typography><Typography noWrap sx={{ color: "text.secondary", fontSize: "0.74rem", maxWidth: 300 }}>{record.description || "No description"}</Typography></TableCell><TableCell>{projectMap.get(record.client_project_id ?? "") || "Project"}</TableCell><TableCell>{isTask(record) ? formatDate(record.due_date) : isAsset(record) ? record.asset_type || "Other" : record.related_stage || "General"}</TableCell><TableCell>{isTask(record) ? <Stack><Typography sx={{ fontSize: "0.78rem" }}>{record.submission_note || "No submission"}</Typography>{record.submission_url && <MuiLink href={record.submission_url} target="_blank" rel="noreferrer" sx={{ fontSize: "0.74rem" }}>Open submission <LaunchIcon sx={{ fontSize: 12 }} /></MuiLink>}</Stack> : isAsset(record) ? record.file_url ? <MuiLink href={record.file_url} target="_blank" rel="noreferrer">Open asset <LaunchIcon sx={{ fontSize: 13 }} /></MuiLink> : "Not uploaded" : record.client_response || "Awaiting response"}</TableCell><TableCell><Chip size="small" variant="outlined" color={statusTone(record.status)} label={record.status || "Pending"} /></TableCell><TableCell align="right"><Stack direction="row" spacing={0.25} sx={{ justifyContent: "flex-end" }}>{kind === "tasks" && record.status === "Submitted" && <><Tooltip title="Approve"><span><IconButton size="small" color="success" disabled={acting} onClick={() => void action(record, "approve")}><CheckCircleOutlineIcon fontSize="small" /></IconButton></span></Tooltip><Tooltip title="Reject"><span><IconButton size="small" color="error" disabled={acting} onClick={() => void action(record, "reject")}><BlockOutlinedIcon fontSize="small" /></IconButton></span></Tooltip></>}{kind === "assets" && record.status === "Submitted" && <><Tooltip title="Approve"><span><IconButton size="small" color="success" disabled={acting} onClick={() => void action(record, "approve")}><CheckCircleOutlineIcon fontSize="small" /></IconButton></span></Tooltip><Tooltip title="Request revision"><span><IconButton size="small" color="warning" disabled={acting} onClick={() => void action(record, "revise")}><BlockOutlinedIcon fontSize="small" /></IconButton></span></Tooltip></>}{kind === "approvals" && record.status === "Pending" && <Tooltip title="Cancel"><span><IconButton size="small" color="warning" disabled={acting} onClick={() => void action(record, "cancel")}><BlockOutlinedIcon fontSize="small" /></IconButton></span></Tooltip>}<Tooltip title="Edit"><IconButton size="small" onClick={() => startEdit(record)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={acting} onClick={() => void action(record, "delete")}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip></Stack></TableCell></TableRow>)}</TableBody></Table></TableContainer> : <Stack spacing={1.2} sx={{ p: 6, alignItems: "center", textAlign: "center" }}><Icon sx={{ color: "primary.main", fontSize: 38 }} /><Typography sx={{ fontWeight: 900 }}>{view.empty}</Typography><Typography sx={{ color: "text.secondary" }}>{view.emptyDetail}</Typography></Stack>}
    </Paper>

    <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} fullWidth maxWidth="sm"><DialogTitle>{editing ? `Edit ${view.title.slice(0, -1)}` : view.button}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField select label="Client project" value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })} disabled={Boolean(editing)} required fullWidth>{projects.map((project) => <MenuItem key={project.id} value={project.id}>{project.title || "Untitled project"}</MenuItem>)}</TextField><TextField label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} inputProps={{ maxLength: 240 }} required fullWidth /><TextField label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} inputProps={{ maxLength: 5000 }} multiline minRows={3} fullWidth />{kind === "tasks" && <><TextField label="Due date" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} InputLabelProps={{ shrink: true }} fullWidth /><FormControlLabel control={<Checkbox checked={form.visible} onChange={(event) => setForm({ ...form, visible: event.target.checked })} />} label="Visible to client" /></>}{kind === "assets" && <><TextField select label="Asset type" value={form.assetType} onChange={(event) => setForm({ ...form, assetType: event.target.value as ClientAssetType })} fullWidth>{clientAssetTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}</TextField><TextField label="Existing file URL" value={form.fileUrl} onChange={(event) => setForm({ ...form, fileUrl: event.target.value })} helperText="Optional. The client can submit a file later." fullWidth /><FormControlLabel control={<Checkbox checked={form.required} onChange={(event) => setForm({ ...form, required: event.target.checked })} />} label="Required asset" /></>}{kind === "approvals" && <TextField label="Related stage" value={form.relatedStage} onChange={(event) => setForm({ ...form, relatedStage: event.target.value })} inputProps={{ maxLength: 120 }} fullWidth />}<TextField select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} fullWidth>{statuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField></Stack></DialogContent><DialogActions><Button color="inherit" onClick={() => setDialogOpen(false)}>Cancel</Button><Button variant="contained" disabled={saving || !form.projectId || !form.title.trim()} onClick={() => void save()}>{saving ? "Saving..." : "Save"}</Button></DialogActions></Dialog>
  </Stack>;
}

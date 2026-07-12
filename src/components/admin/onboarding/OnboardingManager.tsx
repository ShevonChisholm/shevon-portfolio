"use client";

import { useMemo, useState } from "react";
import {
  Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Drawer, FormControlLabel, IconButton, LinearProgress, MenuItem, Paper, Skeleton,
  Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs,
  TextField, Tooltip, Typography, useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import { useAdminNotifications } from "@/components/admin/notifications/AdminNotifications";
import { useListClientProjectsQuery } from "@/lib/api/client-projects-api";
import {
  onboardingFlowStatuses, onboardingStepStatuses, onboardingStepTypes,
  type OnboardingFlow, type OnboardingFlowStatus, type OnboardingStep,
  type OnboardingStepInput, type OnboardingStepStatus, type OnboardingStepType,
  useAddOnboardingStepMutation, useBlockOnboardingStepMutation,
  useCompleteOnboardingStepMutation, useCreateOnboardingFlowMutation,
  useDeleteOnboardingStepMutation, useGetAdminOnboardingQuery,
  useListAdminOnboardingQuery, useUpdateOnboardingFlowMutation,
  useUpdateOnboardingStepMutation,
} from "@/lib/api/onboarding-api";

type Filter = "active" | "blocked" | "completed" | "all";

function apiError(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "data" in error) {
    const message = (error as { data?: { message?: string | string[] } }).data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  return fallback;
}

function tone(status?: string | null) {
  if (status === "Completed") return "success" as const;
  if (status === "Blocked" || status === "Cancelled") return "error" as const;
  if (status === "In Progress") return "warning" as const;
  return "default" as const;
}

function flowName(flow: OnboardingFlow) {
  return flow.project?.title || flow.project?.name || flow.name || "Project onboarding";
}

function StepDialog({ open, step, saving, onClose, onSave }: { open: boolean; step: OnboardingStep | null; saving: boolean; onClose: () => void; onSave: (body: OnboardingStepInput) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepType, setStepType] = useState<OnboardingStepType>("Welcome");
  const [status, setStatus] = useState<OnboardingStepStatus>("Pending");
  const [sortOrder, setSortOrder] = useState("0");
  const [required, setRequired] = useState(true);
  const reset = () => {
    setTitle(step?.title ?? ""); setDescription(step?.description ?? "");
    setStepType((step?.step_type as OnboardingStepType) ?? "Welcome");
    setStatus((step?.status as OnboardingStepStatus) ?? "Pending");
    setSortOrder(String(step?.sort_order ?? 0)); setRequired(step?.required ?? true);
  };
  return <Dialog open={open} onClose={onClose} TransitionProps={{ onEnter: reset }} fullWidth maxWidth="sm">
    <DialogTitle>{step ? "Edit Onboarding Step" : "Add Onboarding Step"}</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
      <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} inputProps={{ maxLength: 240 }} required fullWidth />
      <TextField label="Description" value={description} onChange={(event) => setDescription(event.target.value)} inputProps={{ maxLength: 5000 }} multiline minRows={3} fullWidth />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField select label="Step type" value={stepType} onChange={(event) => setStepType(event.target.value as OnboardingStepType)} fullWidth>{onboardingStepTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
        <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value as OnboardingStepStatus)} fullWidth>{onboardingStepStatuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
      </Stack>
      <TextField label="Sort order" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} inputProps={{ min: 0 }} fullWidth />
      <FormControlLabel control={<Checkbox checked={required} onChange={(event) => setRequired(event.target.checked)} />} label="Required step" />
    </Stack></DialogContent>
    <DialogActions><Button color="inherit" onClick={onClose}>Cancel</Button><Button variant="contained" disabled={saving || !title.trim()} onClick={() => onSave({ title: title.trim(), description: description.trim() || undefined, step_type: stepType, status, sort_order: Number(sortOrder) || 0, required })}>{saving ? "Saving..." : "Save Step"}</Button></DialogActions>
  </Dialog>;
}

export default function OnboardingManager() {
  const theme = useTheme();
  const { enqueueNotification } = useAdminNotifications();
  const [filter, setFilter] = useState<Filter>("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [stepOpen, setStepOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<OnboardingStep | null>(null);

  const status = filter === "blocked" ? "Blocked" : filter === "completed" ? "Completed" : undefined;
  const listQuery = useListAdminOnboardingQuery({ limit: 50, status });
  const detailQuery = useGetAdminOnboardingQuery(selectedId ?? "", { skip: !selectedId });
  const projectsQuery = useListClientProjectsQuery({ limit: 100, sort_by: "created_at", sort_order: "desc" });
  const [createFlow, createState] = useCreateOnboardingFlowMutation();
  const [updateFlow, updateFlowState] = useUpdateOnboardingFlowMutation();
  const [addStep, addState] = useAddOnboardingStepMutation();
  const [updateStep, updateStepState] = useUpdateOnboardingStepMutation();
  const [completeStep, completeState] = useCompleteOnboardingStepMutation();
  const [blockStep, blockState] = useBlockOnboardingStepMutation();
  const [deleteStep, deleteState] = useDeleteOnboardingStepMutation();

  const rows = useMemo(() => {
    const data = listQuery.data?.data ?? [];
    return filter === "active" ? data.filter((item) => item.status !== "Completed" && item.status !== "Cancelled") : data;
  }, [filter, listQuery.data?.data]);
  const detail = detailQuery.data;
  const notify = (text: string, variant: "success" | "error") => enqueueNotification(text, { variant });

  const create = async () => {
    if (!projectId) return;
    try { const result = await createFlow({ projectId }).unwrap(); setCreateOpen(false); setProjectId(""); setSelectedId(result.id); notify("Onboarding flow created with default steps.", "success"); }
    catch (error) { notify(apiError(error, "Could not create onboarding."), "error"); }
  };
  const saveStep = async (body: OnboardingStepInput) => {
    if (!selectedId) return;
    try {
      if (editingStep) await updateStep({ flowId: selectedId, stepId: editingStep.id, body }).unwrap();
      else await addStep({ flowId: selectedId, body }).unwrap();
      setStepOpen(false); setEditingStep(null); notify(editingStep ? "Onboarding step updated." : "Onboarding step added.", "success");
    } catch (error) { notify(apiError(error, "Could not save onboarding step."), "error"); }
  };
  const changeFlowStatus = async (nextStatus: OnboardingFlowStatus) => {
    if (!selectedId) return;
    try { await updateFlow({ id: selectedId, status: nextStatus }).unwrap(); notify("Onboarding status updated.", "success"); }
    catch (error) { notify(apiError(error, "Could not update onboarding status."), "error"); }
  };
  const runStepAction = async (action: "complete" | "block" | "delete", stepId: string) => {
    if (!selectedId || (action === "delete" && !window.confirm("Delete this onboarding step?"))) return;
    try {
      if (action === "complete") await completeStep({ flowId: selectedId, stepId }).unwrap();
      if (action === "block") await blockStep({ flowId: selectedId, stepId }).unwrap();
      if (action === "delete") await deleteStep({ flowId: selectedId, stepId }).unwrap();
      notify(action === "complete" ? "Step completed." : action === "block" ? "Step blocked." : "Step deleted.", "success");
    } catch (error) { notify(apiError(error, "Could not update the step."), "error"); }
  };

  return <Stack spacing={3}>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
      <Box><Typography component="h1" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: { xs: "1.9rem", md: "2.25rem" }, fontWeight: 900 }}>Client Onboarding</Typography><Typography sx={{ color: "text.secondary", mt: 0.6 }}>Prepare each client for a smooth, visible project kickoff.</Typography></Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Start Onboarding</Button>
    </Stack>
    <Paper elevation={0} sx={{ overflow: "hidden", border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`, bgcolor: alpha(theme.palette.background.paper, 0.78) }}>
      <Tabs value={filter} onChange={(_, value: Filter) => setFilter(value)} variant="scrollable" scrollButtons="auto" sx={{ px: 1, borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}><Tab value="active" label="Active" /><Tab value="blocked" label="Blocked" /><Tab value="completed" label="Completed" /><Tab value="all" label="All" /></Tabs>
      {listQuery.isError ? <Alert severity="error" sx={{ m: 2 }}>Unable to load onboarding flows.</Alert> : listQuery.isLoading ? <Stack spacing={1} sx={{ p: 2 }}>{[0,1,2,3].map((item) => <Skeleton key={item} height={56} />)}</Stack> : rows.length ? <TableContainer><Table sx={{ minWidth: 780 }}><TableHead><TableRow><TableCell>Project</TableCell><TableCell>Client</TableCell><TableCell>Current step</TableCell><TableCell>Progress</TableCell><TableCell>Status</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead><TableBody>{rows.map((flow) => <TableRow key={flow.id} hover><TableCell><Typography sx={{ fontWeight: 850 }}>{flowName(flow)}</Typography></TableCell><TableCell>{flow.client?.business_name || "Client"}</TableCell><TableCell>{flow.current_step || "Welcome"}</TableCell><TableCell sx={{ minWidth: 150 }}><Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><LinearProgress variant="determinate" value={flow.progress_percentage ?? 0} sx={{ flex: 1, height: 6, borderRadius: 99 }} /><Typography sx={{ fontSize: "0.75rem" }}>{flow.progress_percentage ?? 0}%</Typography></Stack></TableCell><TableCell><Chip size="small" variant="outlined" color={tone(flow.status)} label={flow.status || "Not Started"} /></TableCell><TableCell align="right"><Button size="small" onClick={() => setSelectedId(flow.id)}>Manage</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer> : <Stack spacing={1} sx={{ p: 6, alignItems: "center", textAlign: "center" }}><FactCheckOutlinedIcon sx={{ color: "primary.main", fontSize: 38 }} /><Typography sx={{ fontWeight: 900 }}>No onboarding flows found</Typography><Typography sx={{ color: "text.secondary" }}>Start onboarding from an active client project.</Typography></Stack>}
    </Paper>

    <Drawer anchor="right" open={Boolean(selectedId)} onClose={() => setSelectedId(null)} PaperProps={{ sx: { width: { xs: "100%", sm: 620 }, bgcolor: alpha(theme.palette.background.default, 0.98) } }}><Box sx={{ p: { xs: 2, sm: 3 } }}><Stack spacing={2.5}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}><Box><Typography sx={{ color: "primary.main", fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase" }}>Onboarding Flow</Typography><Typography variant="h5" sx={{ fontWeight: 950 }}>{detail ? flowName(detail) : "Loading..."}</Typography></Box><IconButton onClick={() => setSelectedId(null)}><CloseIcon /></IconButton></Stack>
      {detailQuery.isLoading ? <Stack spacing={1}>{[0,1,2,3].map((item) => <Skeleton key={item} height={70} />)}</Stack> : detail ? <>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.72) }}><Stack spacing={1.5}><Stack direction="row" sx={{ justifyContent: "space-between" }}><Typography sx={{ fontWeight: 900 }}>{detail.progress?.completed_required_steps ?? 0} of {detail.progress?.required_steps ?? 0} required steps</Typography><Typography sx={{ color: "primary.main", fontWeight: 900 }}>{detail.progress?.progress_percentage ?? 0}%</Typography></Stack><LinearProgress variant="determinate" value={detail.progress?.progress_percentage ?? 0} sx={{ height: 8, borderRadius: 99 }} /><TextField select label="Flow status" size="small" value={detail.status || "In Progress"} onChange={(event) => void changeFlowStatus(event.target.value as OnboardingFlowStatus)} disabled={updateFlowState.isLoading} fullWidth>{onboardingFlowStatuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Stack></Paper>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}><Typography variant="h6" sx={{ fontWeight: 900 }}>Steps</Typography><Button startIcon={<AddIcon />} size="small" onClick={() => { setEditingStep(null); setStepOpen(true); }}>Add Step</Button></Stack>
        <Stack spacing={1.25}>{detail.steps.map((step, index) => <Paper key={step.id} variant="outlined" sx={{ p: 1.5, borderColor: alpha(theme.palette.primary.main, 0.14), bgcolor: alpha(theme.palette.background.paper, 0.64) }}><Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }}><Box sx={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main", fontWeight: 900 }}>{index + 1}</Box><Box sx={{ flex: 1, minWidth: 0 }}><Stack direction="row" spacing={0.7} sx={{ alignItems: "center", flexWrap: "wrap" }}><Typography sx={{ fontWeight: 900 }}>{step.title}</Typography>{step.required && <Chip label="Required" size="small" />}</Stack><Typography sx={{ color: "text.secondary", fontSize: "0.74rem" }}>{step.description || step.step_type}</Typography></Box><Chip label={step.status || "Pending"} color={tone(step.status)} variant="outlined" size="small" /><Stack direction="row" spacing={0.2}><Tooltip title="Complete"><span><IconButton size="small" color="success" disabled={completeState.isLoading || step.status === "Completed"} onClick={() => void runStepAction("complete", step.id)}><CheckCircleOutlineIcon fontSize="small" /></IconButton></span></Tooltip><Tooltip title="Block"><span><IconButton size="small" color="warning" disabled={blockState.isLoading} onClick={() => void runStepAction("block", step.id)}><BlockOutlinedIcon fontSize="small" /></IconButton></span></Tooltip><Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingStep(step); setStepOpen(true); }}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete"><span><IconButton size="small" color="error" disabled={deleteState.isLoading} onClick={() => void runStepAction("delete", step.id)}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip></Stack></Stack></Paper>)}</Stack>
      </> : <Alert severity="error">Could not load this onboarding flow.</Alert>}
    </Stack></Box></Drawer>

    <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Start Client Onboarding</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField select label="Client project" value={projectId} onChange={(event) => setProjectId(event.target.value)} required fullWidth>{(projectsQuery.data?.data ?? []).map((project) => <MenuItem key={project.id} value={project.id}>{project.title || "Untitled project"}</MenuItem>)}</TextField><Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>The standard nine-step onboarding checklist will be created automatically.</Typography></Stack></DialogContent><DialogActions><Button color="inherit" onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="contained" disabled={!projectId || createState.isLoading} onClick={() => void create()}>{createState.isLoading ? "Creating..." : "Start Onboarding"}</Button></DialogActions></Dialog>
    <StepDialog open={stepOpen} step={editingStep} saving={addState.isLoading || updateStepState.isLoading} onClose={() => setStepOpen(false)} onSave={(body) => void saveStep(body)} />
  </Stack>;
}

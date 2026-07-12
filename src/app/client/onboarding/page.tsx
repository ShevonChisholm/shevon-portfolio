"use client";

import { useState } from "react";
import {
  Alert, Box, Button, Chip, LinearProgress, Paper, Skeleton, Stack, Typography, useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  EmptyPanel, PageIntro, PortalPanel, PortalStatCard, StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import {
  useCompleteClientOnboardingStepMutation,
  useListClientOnboardingQuery,
} from "@/lib/api/onboarding-api";

export default function ClientOnboardingPage() {
  const theme = useTheme();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const onboardingQuery = useListClientOnboardingQuery();
  const [completeStep, completeState] = useCompleteClientOnboardingStepMutation();
  const flows = onboardingQuery.data ?? [];
  const activeFlow = flows.find((flow) => flow.status !== "Completed" && flow.status !== "Cancelled") ?? flows[0];
  const progress = activeFlow?.progress?.progress_percentage ?? 0;
  const remaining = activeFlow?.required_remaining_count ?? 0;

  const runComplete = async (flowId: string, stepId: string) => {
    try {
      await completeStep({ flowId, stepId }).unwrap();
      setMessage({ type: "success", text: "Onboarding step completed." });
    } catch {
      setMessage({ type: "error", text: "Could not complete this onboarding step." });
    }
  };

  return <Stack spacing={3}>
    <PageIntro eyebrow="Getting Started" title="Onboarding" description="Complete the setup steps needed to begin your project smoothly." />
    {message && <Alert severity={message.type}>{message.text}</Alert>}
    {onboardingQuery.isError && <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => onboardingQuery.refetch()}>Retry</Button>}>Could not load onboarding.</Alert>}
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
      <PortalStatCard icon={<FactCheckOutlinedIcon />} label="Progress" value={`${progress}%`} tone="primary" loading={onboardingQuery.isLoading} />
      <PortalStatCard icon={<CheckCircleOutlineIcon />} label="Completed" value={activeFlow?.progress?.completed_required_steps ?? 0} tone="green" loading={onboardingQuery.isLoading} />
      <PortalStatCard icon={<LockOutlinedIcon />} label="Required Remaining" value={remaining} tone="purple" loading={onboardingQuery.isLoading} />
    </Box>
    <PortalPanel title={activeFlow?.project?.title || activeFlow?.name || "Onboarding Checklist"}>
      {onboardingQuery.isLoading ? <Stack sx={{ p: 2 }} spacing={1}>{[0,1,2,3,4].map((item) => <Skeleton key={item} height={72} />)}</Stack> : activeFlow ? <Box>
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.11)}` }}><Stack direction="row" spacing={2} sx={{ alignItems: "center" }}><LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 99, flex: 1 }} /><Typography sx={{ color: "primary.main", fontWeight: 900 }}>{progress}%</Typography><StatusChip status={activeFlow.status} /></Stack></Box>
        {activeFlow.steps.map((step, index) => {
          const completed = step.status === "Completed" || step.status === "Skipped";
          const blocked = step.status === "Blocked";
          return <Paper key={step.id} elevation={0} square sx={{ px: { xs: 1.5, sm: 2 }, py: 1.75, borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.11)}`, bgcolor: completed ? alpha("#22c55e", 0.035) : "transparent" }}><Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}><Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}><Box sx={{ width: 34, height: 34, display: "grid", placeItems: "center", flexShrink: 0, borderRadius: "50%", bgcolor: completed ? alpha("#22c55e", 0.14) : alpha(theme.palette.primary.main, 0.12), color: completed ? "success.main" : "primary.main", fontWeight: 900 }}>{completed ? <CheckCircleOutlineIcon fontSize="small" /> : index + 1}</Box><Box><Stack direction="row" spacing={0.8} sx={{ alignItems: "center", flexWrap: "wrap" }}><Typography sx={{ fontWeight: 900 }}>{step.title || "Onboarding step"}</Typography>{step.required && <Chip label="Required" size="small" variant="outlined" />}</Stack><Typography sx={{ color: "text.secondary", fontSize: "0.8rem", mt: 0.35 }}>{step.description || step.step_type}</Typography></Box></Stack><Stack direction="row" spacing={1} sx={{ alignItems: "center", pl: { xs: 6.2, sm: 0 } }}><StatusChip status={step.status} /><Button size="small" variant={completed ? "text" : "contained"} disabled={completed || blocked || completeState.isLoading} onClick={() => void runComplete(activeFlow.id, step.id)}>{completed ? "Completed" : blocked ? "Blocked" : "Mark Complete"}</Button></Stack></Stack></Paper>;
        })}
      </Box> : <EmptyPanel title="No onboarding assigned" message="Your onboarding checklist will appear here once your project is ready to begin." />}
    </PortalPanel>
  </Stack>;
}

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
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import {
  EmptyPanel,
  formatShortDate,
  PageIntro,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import type { ApprovalRequest } from "@/lib/api/client-actions-api";
import {
  useApproveClientPortalApprovalMutation,
  useListClientPortalApprovalsQuery,
  useRequestClientPortalApprovalChangesMutation,
} from "@/lib/api/client-portal-api";

export default function ClientApprovalsPage() {
  const theme = useTheme();
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [mode, setMode] = useState<"approve" | "changes">("approve");
  const [clientResponse, setClientResponse] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { data, error, isLoading, isFetching, refetch } =
    useListClientPortalApprovalsQuery({ limit: 100 });
  const [approveApproval, approveState] = useApproveClientPortalApprovalMutation();
  const [requestChanges, changesState] = useRequestClientPortalApprovalChangesMutation();
  const approvals = data?.data ?? [];
  const pending = approvals.filter((approval) => approval.status === "Pending").length;
  const approved = approvals.filter((approval) => approval.status === "Approved").length;
  const changes = approvals.filter((approval) => approval.status === "Changes Requested").length;
  const saving = approveState.isLoading || changesState.isLoading;

  const closeDialog = () => {
    setSelectedApproval(null);
    setClientResponse("");
  };

  const handleSubmit = async () => {
    if (!selectedApproval?.id) return;
    try {
      if (mode === "approve") {
        await approveApproval({
          id: selectedApproval.id,
          body: { client_response: clientResponse.trim() || undefined },
        }).unwrap();
        setMessage({ type: "success", text: "Approval submitted." });
      } else {
        await requestChanges({
          id: selectedApproval.id,
          body: { client_response: clientResponse.trim() || "Please revise this item." },
        }).unwrap();
        setMessage({ type: "success", text: "Change request sent." });
      }
      closeDialog();
    } catch {
      setMessage({ type: "error", text: "Could not submit your response." });
    }
  };

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Approvals"
        title="Approval Requests"
        description="Review project decisions and approve or request changes from the client portal."
      />
      {message && <Alert severity={message.type}>{message.text}</Alert>}
      {error && (
        <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
          Could not load approval requests.
        </Alert>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
        <PortalStatCard icon={<AssignmentTurnedInOutlinedIcon />} label="Pending" value={pending} tone="amber" loading={isLoading || isFetching} />
        <PortalStatCard icon={<CheckCircleOutlineIcon />} label="Approved" value={approved} tone="green" loading={isLoading || isFetching} />
        <PortalStatCard icon={<RateReviewOutlinedIcon />} label="Changes Requested" value={changes} tone="red" loading={isLoading || isFetching} />
      </Box>
      <PortalPanel title="Requests">
        {isLoading ? (
          <Stack sx={{ p: 2 }} spacing={1}>{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} height={76} />)}</Stack>
        ) : approvals.length ? (
          <Box>
            {approvals.map((approval) => (
              <Box key={approval.id} sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.11)}` }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                  <Box>
                    <Typography sx={{ fontWeight: 950 }}>{approval.title || "Approval request"}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {approval.description || approval.related_stage || "Review requested"} · {formatShortDate(approval.requested_at || approval.created_at)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                    <StatusChip status={approval.status} />
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={approval.status !== "Pending"}
                      onClick={() => {
                        setSelectedApproval(approval);
                        setMode("changes");
                        setClientResponse("");
                      }}
                    >
                      Request Changes
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={approval.status !== "Pending"}
                      onClick={() => {
                        setSelectedApproval(approval);
                        setMode("approve");
                        setClientResponse("");
                      }}
                    >
                      Approve
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyPanel title="No approvals yet" message="Approval requests will appear here when review is needed." />
        )}
      </PortalPanel>
      <Dialog open={Boolean(selectedApproval)} onClose={saving ? undefined : closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{mode === "approve" ? "Approve Request" : "Request Changes"}</DialogTitle>
        {saving && <LinearProgress />}
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography sx={{ fontWeight: 900 }}>{selectedApproval?.title}</Typography>
            <TextField
              label={mode === "approve" ? "Approval note" : "What should change?"}
              value={clientResponse}
              onChange={(event) => setClientResponse(event.target.value)}
              minRows={4}
              multiline
              fullWidth
              required={mode === "changes"}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving || (mode === "changes" && !clientResponse.trim())}>
            {saving ? "Submitting..." : mode === "approve" ? "Approve" : "Send Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

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
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoNotDisturbAltOutlinedIcon from "@mui/icons-material/DoNotDisturbAltOutlined";
import {
  EmptyPanel,
  formatShortDate,
  PageIntro,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import type { ClientCaseStudyRequest } from "@/lib/api/client-portal-api";
import {
  useDeclineClientCaseStudyPermissionMutation,
  useGrantClientCaseStudyPermissionMutation,
  useListClientCaseStudyRequestsQuery,
} from "@/lib/api/client-portal-api";

export default function ClientCaseStudiesPage() {
  const theme = useTheme();
  const [selectedRequest, setSelectedRequest] =
    useState<ClientCaseStudyRequest | null>(null);
  const [mode, setMode] = useState<"grant" | "decline">("grant");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { data: requests = [], error, isLoading, isFetching, refetch } =
    useListClientCaseStudyRequestsQuery();
  const [grantPermission, grantState] = useGrantClientCaseStudyPermissionMutation();
  const [declinePermission, declineState] = useDeclineClientCaseStudyPermissionMutation();
  const saving = grantState.isLoading || declineState.isLoading;
  const pending = requests.filter((request) => request.status !== "Approved" && request.status !== "Declined").length;
  const granted = requests.filter((request) => request.permission_granted).length;
  const declined = requests.filter((request) => request.status === "Declined").length;

  const closeDialog = () => setSelectedRequest(null);

  const handleSubmit = async () => {
    if (!selectedRequest?.id) return;
    try {
      if (mode === "grant") {
        await grantPermission(selectedRequest.id).unwrap();
        setMessage({ type: "success", text: "Case study permission granted." });
      } else {
        await declinePermission(selectedRequest.id).unwrap();
        setMessage({ type: "success", text: "Case study request declined." });
      }
      closeDialog();
    } catch {
      setMessage({ type: "error", text: "Could not update this case study request." });
    }
  };

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Case Studies"
        title="Case Study Permissions"
        description="Review requests to turn completed work into portfolio case studies."
      />
      {message && <Alert severity={message.type}>{message.text}</Alert>}
      {error && <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>Could not load case study requests.</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
        <PortalStatCard icon={<ArticleOutlinedIcon />} label="Pending" value={pending} tone="amber" loading={isLoading || isFetching} />
        <PortalStatCard icon={<CheckCircleOutlineIcon />} label="Granted" value={granted} tone="green" loading={isLoading || isFetching} />
        <PortalStatCard icon={<DoNotDisturbAltOutlinedIcon />} label="Declined" value={declined} tone="red" loading={isLoading || isFetching} />
      </Box>
      <PortalPanel title="Permission Requests">
        {isLoading ? (
          <Stack sx={{ p: 2 }} spacing={1}>{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} height={84} />)}</Stack>
        ) : requests.length ? (
          <Box>
            {requests.map((request) => (
              <Box key={request.id} sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.11)}` }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                  <Box>
                    <Typography sx={{ fontWeight: 950 }}>{request.title || "Case study request"}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {request.summary || "Review whether this work can be used as a portfolio case study."} · {formatShortDate(request.created_at)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                    <StatusChip status={request.permission_granted ? "Granted" : request.status} />
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={request.permission_granted || request.status === "Declined"}
                      onClick={() => {
                        setSelectedRequest(request);
                        setMode("decline");
                      }}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={request.permission_granted || request.status === "Declined"}
                      onClick={() => {
                        setSelectedRequest(request);
                        setMode("grant");
                      }}
                    >
                      Grant
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyPanel title="No requests yet" message="Case study permission requests will appear here." />
        )}
      </PortalPanel>
      <Dialog open={Boolean(selectedRequest)} onClose={saving ? undefined : closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{mode === "grant" ? "Grant Permission" : "Decline Request"}</DialogTitle>
        {saving && <LinearProgress />}
        <DialogContent dividers>
          <Typography sx={{ fontWeight: 900 }}>{selectedRequest?.title || "Case study request"}</Typography>
          <Typography sx={{ color: "text.secondary", mt: 1 }}>
            {mode === "grant"
              ? "This lets the project team prepare a public case study for approved portfolio use."
              : "This will mark the request as declined."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" color={mode === "grant" ? "primary" : "warning"} onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : mode === "grant" ? "Grant Permission" : "Decline"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

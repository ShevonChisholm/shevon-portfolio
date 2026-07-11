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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import {
  EmptyPanel,
  PageIntro,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import type { ClientAsset } from "@/lib/api/client-actions-api";
import {
  useListClientPortalAssetsQuery,
  useSubmitClientAssetMutation,
} from "@/lib/api/client-portal-api";

export default function ClientAssetsPage() {
  const theme = useTheme();
  const [selectedAsset, setSelectedAsset] = useState<ClientAsset | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const { data, error, isLoading, isFetching, refetch } =
    useListClientPortalAssetsQuery({ limit: 100 });
  const [submitAsset, submitState] = useSubmitClientAssetMutation();
  const assets = data?.data ?? [];
  const needed = assets.filter((asset) => asset.status === "Needed").length;
  const submitted = assets.filter((asset) => asset.status === "Submitted").length;
  const approved = assets.filter((asset) => asset.status === "Approved").length;

  const closeDialog = () => {
    setSelectedAsset(null);
    setFileUrl("");
    setSubmissionNote("");
  };

  const handleSubmit = async () => {
    if (!selectedAsset?.id) return;

    try {
      await submitAsset({
        id: selectedAsset.id,
        body: {
          file_url: fileUrl.trim() || undefined,
          submission_note: submissionNote.trim() || undefined,
        },
      }).unwrap();
      setMessage({ type: "success", text: "Asset submitted for review." });
      closeDialog();
    } catch (mutationError) {
      setMessage({
        type: "error",
        text:
          mutationError instanceof Error
            ? mutationError.message
            : "Could not submit this asset.",
      });
    }
  };

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Assets"
        title="Project Assets"
        description="Submit requested files, links, brand material, or content needed for your project."
      />

      {message && <Alert severity={message.type}>{message.text}</Alert>}
      {error && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Could not load your assets.
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
          gap: 1.5,
        }}
      >
        <PortalStatCard
          icon={<ImageOutlinedIcon />}
          label="Needed"
          value={needed}
          tone="red"
          loading={isLoading || isFetching}
        />
        <PortalStatCard
          icon={<UploadFileOutlinedIcon />}
          label="Submitted"
          value={submitted}
          tone="purple"
          loading={isLoading || isFetching}
        />
        <PortalStatCard
          icon={<CheckCircleOutlineIcon />}
          label="Approved"
          value={approved}
          tone="green"
          loading={isLoading || isFetching}
        />
      </Box>

      <PortalPanel title="Requested Assets">
        {isLoading ? (
          <Stack sx={{ p: 2 }} spacing={1}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={72} />
            ))}
          </Stack>
        ) : assets.length ? (
          <Box>
            {assets.map((asset) => (
              <Box
                key={asset.id}
                sx={{
                  px: 2,
                  py: 1.75,
                  borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.11)}`,
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 950 }}>{asset.title}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {asset.asset_type || "Asset"} Â·{" "}
                      {asset.description || asset.file_url || "No details yet"}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <StatusChip status={asset.status} />
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={asset.status === "Approved"}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setFileUrl(asset.file_url || "");
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
          <EmptyPanel title="No assets requested" message="Requested assets will appear here." />
        )}
      </PortalPanel>

      <Dialog open={Boolean(selectedAsset)} onClose={submitState.isLoading ? undefined : closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Submit Asset</DialogTitle>
        {submitState.isLoading && <LinearProgress />}
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography sx={{ fontWeight: 900 }}>{selectedAsset?.title}</Typography>
            <TextField
              label="File or share link"
              value={fileUrl}
              onChange={(event) => setFileUrl(event.target.value)}
              fullWidth
              helperText="Paste a shareable link for now. Direct file upload can be wired to the file endpoint next."
            />
            <TextField
              label="Submission note"
              value={submissionNote}
              onChange={(event) => setSubmissionNote(event.target.value)}
              minRows={4}
              multiline
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog} disabled={submitState.isLoading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitState.isLoading}>
            {submitState.isLoading ? "Submitting..." : "Submit Asset"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

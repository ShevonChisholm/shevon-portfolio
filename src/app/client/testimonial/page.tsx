"use client";

import { FormEvent, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  Rating,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import {
  EmptyPanel,
  formatShortDate,
  PageIntro,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import type { ClientTestimonialRequest } from "@/lib/api/client-portal-api";
import {
  useListClientTestimonialRequestsQuery,
  useSubmitClientTestimonialMutation,
} from "@/lib/api/client-portal-api";

export default function ClientTestimonialPage() {
  const theme = useTheme();
  const [selectedRequest, setSelectedRequest] = useState<ClientTestimonialRequest | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    project_name: "",
    rating: 5,
    feedback: "",
    consent_to_publish: false,
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { data: requests = [], error, isLoading, isFetching, refetch } =
    useListClientTestimonialRequestsQuery();
  const [submitTestimonial, submitState] = useSubmitClientTestimonialMutation();
  const pending = requests.filter((request) => request.status !== "Completed").length;
  const completed = requests.filter((request) => request.status === "Completed").length;

  const closeDialog = () => setSelectedRequest(null);
  const updateForm = (key: keyof typeof form, value: string | number | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedRequest?.id || !form.name.trim() || !form.feedback.trim() || !form.consent_to_publish) return;
    try {
      await submitTestimonial({ id: selectedRequest.id, body: form }).unwrap();
      setMessage({ type: "success", text: "Thank you. Your testimonial was submitted for review." });
      closeDialog();
    } catch {
      setMessage({ type: "error", text: "Could not submit your testimonial." });
    }
  };

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Testimonial"
        title="Share Feedback"
        description="Submit feedback when a testimonial request is available. Nothing is published automatically."
      />
      {message && <Alert severity={message.type}>{message.text}</Alert>}
      {error && <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>Could not load testimonial requests.</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
        <PortalStatCard icon={<RateReviewOutlinedIcon />} label="Pending" value={pending} tone="amber" loading={isLoading || isFetching} />
        <PortalStatCard icon={<StarBorderOutlinedIcon />} label="Completed" value={completed} tone="green" loading={isLoading || isFetching} />
        <PortalStatCard icon={<RateReviewOutlinedIcon />} label="Requests" value={requests.length} tone="blue" loading={isLoading || isFetching} />
      </Box>
      <PortalPanel title="Requests">
        {isLoading ? (
          <Stack sx={{ p: 2 }} spacing={1}>{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} height={72} />)}</Stack>
        ) : requests.length ? (
          <Box>
            {requests.map((request) => (
              <Box key={request.id} sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.11)}` }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                  <Box>
                    <Typography sx={{ fontWeight: 950 }}>Feedback request</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>Requested {formatShortDate(request.requested_at || request.created_at)}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <StatusChip status={request.status} />
                    <Button variant="contained" size="small" disabled={request.status === "Completed"} onClick={() => setSelectedRequest(request)}>
                      Submit
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyPanel title="No testimonial requests" message="Requests for client feedback will appear here." />
        )}
      </PortalPanel>
      <Dialog open={Boolean(selectedRequest)} onClose={submitState.isLoading ? undefined : closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Submit Testimonial</DialogTitle>
        {submitState.isLoading && <LinearProgress />}
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField label="Name" value={form.name} onChange={(event) => updateForm("name", event.target.value)} required fullWidth inputProps={{ maxLength: 120 }} />
              <TextField label="Email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} fullWidth inputProps={{ maxLength: 254 }} />
              <TextField label="Company" value={form.company} onChange={(event) => updateForm("company", event.target.value)} fullWidth inputProps={{ maxLength: 160 }} />
              <TextField label="Role" value={form.role} onChange={(event) => updateForm("role", event.target.value)} fullWidth inputProps={{ maxLength: 160 }} />
              <TextField label="Project name" value={form.project_name} onChange={(event) => updateForm("project_name", event.target.value)} fullWidth inputProps={{ maxLength: 160 }} />
              <Rating value={form.rating} onChange={(_, value) => updateForm("rating", value ?? 5)} />
              <TextField label="Feedback" value={form.feedback} onChange={(event) => updateForm("feedback", event.target.value)} required minRows={5} multiline fullWidth inputProps={{ maxLength: 2000 }} />
              <FormControlLabel control={<Checkbox checked={form.consent_to_publish} onChange={(event) => updateForm("consent_to_publish", event.target.checked)} />} label="I consent to this feedback being reviewed and published on the portfolio." />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeDialog} disabled={submitState.isLoading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitState.isLoading || !form.name.trim() || !form.feedback.trim() || !form.consent_to_publish}>
              {submitState.isLoading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}

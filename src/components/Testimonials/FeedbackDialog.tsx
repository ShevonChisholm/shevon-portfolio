"use client";

import { useState } from "react";
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
  IconButton,
  Rating,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import CloseIcon from "@mui/icons-material/Close";
import {
  emptyTestimonialFormValues,
  type TestimonialFormValues,
} from "@/types/cms";

type FeedbackDialogProps = {
  open: boolean;
  onClose: () => void;
};

type FormErrors = Partial<Record<keyof TestimonialFormValues, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: TestimonialFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) errors.name = "Name is required.";
  if (values.name.trim().length > 120) errors.name = "Use 120 characters or less.";
  if (values.email.trim() && !emailPattern.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (values.email.trim().length > 254) errors.email = "Use 254 characters or less.";
  if (values.company.trim().length > 160) errors.company = "Use 160 characters or less.";
  if (values.role.trim().length > 160) errors.role = "Use 160 characters or less.";
  if (values.project_name.trim().length > 160) {
    errors.project_name = "Use 160 characters or less.";
  }
  if (!values.feedback.trim()) errors.feedback = "Feedback is required.";
  if (values.feedback.trim().length > 2000) {
    errors.feedback = "Use 2000 characters or less.";
  }
  if (!values.consent_to_publish) {
    errors.consent_to_publish = "Consent is required before submitting.";
  }

  return errors;
}

export default function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [values, setValues] = useState<TestimonialFormValues>(
    emptyTestimonialFormValues
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <K extends keyof TestimonialFormValues>(
    field: K,
    value: TestimonialFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setMessage(null);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.error ?? "Unable to submit feedback right now."
        );
      }

      setValues(emptyTestimonialFormValues);
      setMessage({
        type: "success",
        text: "Thank you for your feedback. It has been submitted for review.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to submit feedback right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          maxHeight: { xs: "100dvh", sm: "calc(100dvh - 52px)" },
          borderRadius: { xs: 0, sm: 1.5 },
          overflow: "hidden",
          backgroundImage: "none",
          bgcolor: alpha(theme.palette.background.paper, 0.98),
          border: `1px solid ${alpha(theme.palette.common.white, 0.13)}`,
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.09)}`,
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                borderRadius: 1,
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.13),
                "& svg": { fontSize: 16 },
              }}
            >
              <RateReviewOutlinedIcon />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography component="h2" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: "0.82rem", fontWeight: 800 }}>
                Leave Feedback
              </Typography>
              <Typography sx={{ color: "text.secondary", mt: 0.35, fontSize: "0.62rem" }}>
                Every submission is reviewed before publication.
              </Typography>
            </Box>
            <IconButton onClick={handleClose} disabled={isSubmitting} aria-label="Close feedback dialog" size="small">
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2.5,
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: `${alpha(theme.palette.common.white, 0.4)} transparent`,
          }}
        >
          <Stack spacing={2}>
            {message && <Alert severity={message.type}>{message.text}</Alert>}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                required
                label="Name"
                value={values.name}
                onChange={(event) => setField("name", event.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name}
                slotProps={{ htmlInput: { maxLength: 120 } }}
              />
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={values.email}
                onChange={(event) => setField("email", event.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email || "Optional and never shown publicly."}
                slotProps={{ htmlInput: { maxLength: 254 } }}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Company"
                value={values.company}
                onChange={(event) => setField("company", event.target.value)}
                error={Boolean(errors.company)}
                helperText={errors.company}
                slotProps={{ htmlInput: { maxLength: 160 } }}
              />
              <TextField
                fullWidth
                label="Role"
                value={values.role}
                onChange={(event) => setField("role", event.target.value)}
                error={Boolean(errors.role)}
                helperText={errors.role}
                slotProps={{ htmlInput: { maxLength: 160 } }}
              />
            </Stack>

            <TextField
              fullWidth
              label="Project Name"
              value={values.project_name}
              onChange={(event) => setField("project_name", event.target.value)}
              error={Boolean(errors.project_name)}
              helperText={errors.project_name}
              slotProps={{ htmlInput: { maxLength: 160 } }}
            />

            <Box>
              <Typography sx={{ color: "text.secondary", fontSize: "0.62rem", fontWeight: 800, mb: 0.75, textTransform: "uppercase" }}>
                Rating
              </Typography>
              <Rating
                value={values.rating}
                onChange={(_, value) => setField("rating", value)}
                size="medium"
              />
            </Box>

            <TextField
              fullWidth
              required
              multiline
              minRows={5}
              label="Feedback"
              value={values.feedback}
              onChange={(event) => setField("feedback", event.target.value)}
              error={Boolean(errors.feedback)}
              helperText={
                errors.feedback || `${values.feedback.length}/2000 characters`
              }
              slotProps={{ htmlInput: { maxLength: 2000 } }}
            />

            <Box>
              <FormControlLabel
                sx={{
                  m: 0,
                  alignItems: "flex-start",
                  "& .MuiFormControlLabel-label": {
                    pt: 0.75,
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    lineHeight: 1.45,
                  },
                }}
                control={
                  <Checkbox
                    checked={values.consent_to_publish}
                    onChange={(event) =>
                      setField("consent_to_publish", event.target.checked)
                    }
                    color="primary"
                  />
                }
                label="I consent to this feedback being reviewed and published on the portfolio."
              />
              {errors.consent_to_publish && (
                <Typography variant="caption" color="error" sx={{ display: "block" }}>
                  {errors.consent_to_publish}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            borderTop: `1px solid ${alpha(theme.palette.common.white, 0.09)}`,
          }}
        >
          <Button onClick={handleClose} disabled={isSubmitting} sx={{ minHeight: 34, fontSize: "0.68rem" }}>
            Close
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !values.consent_to_publish}
            sx={{ minHeight: 34, fontSize: "0.68rem" }}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

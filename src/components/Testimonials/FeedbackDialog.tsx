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
  Rating,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import {
  emptyTestimonialFormValues,
  type TestimonialFormValues,
} from "@/types/cms";
import { submitTestimonial } from "@/lib/cms/testimonials";

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
      await submitTestimonial(values);
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
          backgroundImage: "none",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <RateReviewOutlinedIcon color="primary" />
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
                Leave Feedback
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                Every submission is reviewed before publication.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          <Stack spacing={2.5}>
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
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
                Rating
              </Typography>
              <Rating
                value={values.rating}
                onChange={(_, value) => setField("rating", value)}
                size="large"
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

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Close
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

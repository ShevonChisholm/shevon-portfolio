"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import type { EducationFormValues } from "@/types/cms";

type EducationFormProps = {
  initialValues: EducationFormValues;
  mode: "create" | "edit";
  onSubmit: (values: EducationFormValues) => Promise<void>;
};

type Message = {
  type: "success" | "error";
  text: string;
} | null;

export default function EducationForm({
  initialValues,
  mode,
  onSubmit,
}: EducationFormProps) {
  const theme = useTheme();
  const [values, setValues] = useState<EducationFormValues>(initialValues);
  const [message, setMessage] = useState<Message>(null);
  const [isPending, startTransition] = useTransition();
  const pageTitle = mode === "create" ? "New Education" : "Edit Education";
  const submitLabel = mode === "create" ? "Create Education" : "Save Education";
  const cardSx = useMemo(
    () => ({
      border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
      backgroundColor: alpha(theme.palette.background.paper, 0.82),
    }),
    [theme]
  );

  const updateValue = <K extends keyof EducationFormValues>(
    key: K,
    value: EducationFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        await onSubmit(values);
        setMessage({
          type: "success",
          text: mode === "create" ? "Education created." : "Education saved.",
        });
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to save education.",
        });
      }
    });
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={Link}
          href="/admin/education"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 1, px: 0 }}
        >
          Back to Education
        </Button>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
          {pageTitle}
        </Typography>
      </Box>

      {message && <Alert severity={message.type}>{message.text}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Card elevation={0} sx={cardSx}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Education Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Degree"
                      value={values.degree}
                      onChange={(event) => updateValue("degree", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Institution"
                      value={values.institution}
                      onChange={(event) =>
                        updateValue("institution", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={values.location}
                      onChange={(event) =>
                        updateValue("location", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Period label"
                      helperText="Example: 2017 - 2021"
                      value={values.period}
                      onChange={(event) => updateValue("period", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Start date"
                      value={values.start_date}
                      onChange={(event) =>
                        updateValue("start_date", event.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="End date"
                      value={values.end_date}
                      onChange={(event) =>
                        updateValue("end_date", event.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      minRows={5}
                      label="Description"
                      value={values.description}
                      onChange={(event) =>
                        updateValue("description", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      fullWidth
                      label="Credential URL"
                      value={values.credential_url}
                      onChange={(event) =>
                        updateValue("credential_url", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Sort order"
                      value={values.sort_order}
                      onChange={(event) =>
                        updateValue("sort_order", Number(event.target.value))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.is_published}
                          onChange={(event) =>
                            updateValue("is_published", event.target.checked)
                          }
                        />
                      }
                      label="Published"
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ justifyContent: "flex-end" }}
          >
            <Button component={Link} href="/admin/education" variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              disabled={isPending}
            >
              {isPending ? "Saving..." : submitLabel}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}

"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState, useTransition } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import type { PortfolioContactSettings, ResumeSettingValue } from "@/types/cms";
import {
  listSiteSettings,
  uploadResumePdf,
  upsertSiteSetting,
} from "@/lib/cms/settings";
import {
  fallbackPortfolioContactSettings,
  settingsToPortfolioContactSettings,
} from "@/lib/cms/settings-shared";

type Message = {
  type: "success" | "error";
  text: string;
} | null;

type SettingsFormValues = Omit<PortfolioContactSettings, "resume"> & {
  resume: ResumeSettingValue | null;
};

export default function AdminSettingsPage() {
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<SettingsFormValues>(
    fallbackPortfolioContactSettings
  );
  const [message, setMessage] = useState<Message>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const cardSx = {
    border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.82),
  };

  const loadSettings = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      setValues(settingsToPortfolioContactSettings(await listSiteSettings()));
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to load settings.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const updateValue = <K extends keyof SettingsFormValues>(
    key: K,
    value: SettingsFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        await Promise.all([
          upsertSiteSetting("github_url", values.github_url),
          upsertSiteSetting("linkedin_url", values.linkedin_url),
          upsertSiteSetting("contact_email", values.contact_email),
          upsertSiteSetting("contact_phone", values.contact_phone),
          upsertSiteSetting("location", values.location),
          values.resume ? upsertSiteSetting("resume", values.resume) : Promise.resolve(),
        ]);
        setMessage({ type: "success", text: "Settings saved." });
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error ? error.message : "Unable to save settings.",
        });
      }
    });
  };

  const handleResumeChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const resume = await uploadResumePdf(file);
      updateValue("resume", resume);
      setMessage({ type: "success", text: "Resume uploaded and saved." });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Unable to upload resume.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress color="primary" />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Site Settings
        </Typography>
        <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
          Manage public contact links and the resume document used by the portfolio.
        </Typography>
      </Box>

      {message && <Alert severity={message.type}>{message.text}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Card elevation={0} sx={cardSx}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Resume
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Resume URL"
                      value={values.resume?.url ?? ""}
                      onChange={(event) =>
                        updateValue("resume", {
                          url: event.target.value,
                          label: values.resume?.label || "Shevon Chisholm Resume",
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Resume label"
                      value={values.resume?.label ?? "Shevon Chisholm Resume"}
                      onChange={(event) =>
                        updateValue("resume", {
                          url: values.resume?.url ?? "",
                          label: event.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".pdf"
                      hidden
                      onChange={handleResumeChange}
                    />
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      sx={{ alignItems: { xs: "stretch", sm: "center" } }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={
                          isUploading ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <CloudUploadOutlinedIcon />
                          )
                        }
                        disabled={isUploading}
                        onClick={() => inputRef.current?.click()}
                      >
                        {isUploading ? "Uploading..." : "Upload Resume PDF"}
                      </Button>
                      {values.resume?.url && (
                        <Link
                          href={values.resume.url}
                          target="_blank"
                          rel="noreferrer"
                          underline="hover"
                          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                        >
                          Open current resume <OpenInNewOutlinedIcon fontSize="inherit" />
                        </Link>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} sx={cardSx}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Contact & Social Links
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="GitHub URL"
                      value={values.github_url}
                      onChange={(event) => updateValue("github_url", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="LinkedIn URL"
                      value={values.linkedin_url}
                      onChange={(event) =>
                        updateValue("linkedin_url", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Contact email"
                      value={values.contact_email}
                      onChange={(event) =>
                        updateValue("contact_email", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Contact phone"
                      value={values.contact_phone}
                      onChange={(event) =>
                        updateValue("contact_phone", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={values.location}
                      onChange={(event) => updateValue("location", event.target.value)}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              disabled={isPending || isUploading}
            >
              {isPending ? "Saving..." : "Save Settings"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}

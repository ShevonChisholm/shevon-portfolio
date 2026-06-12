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
import MediaPreview from "@/components/admin/media/MediaPreview";
import SectionSaveButton from "@/components/admin/SectionSaveButton";
import { AdminNotificationBridge } from "@/components/admin/notifications/AdminNotifications";
import type {
  AboutSettingsValue,
  PortfolioContactSettings,
  ResumeSettingValue,
} from "@/types/cms";
import {
  listSiteSettings,
  updateAboutSettings,
  uploadAboutImage,
  uploadResumePdf,
  upsertSiteSetting,
} from "@/lib/cms/settings";
import { publicMediaUrl } from "@/lib/cms/media-url";
import {
  fallbackAboutSettings,
  fallbackPortfolioContactSettings,
  settingsToAboutSettings,
  settingsToPortfolioContactSettings,
} from "@/lib/cms/settings-shared";

type Message = {
  type: "success" | "error";
  text: string;
} | null;

type SettingsFormValues = Omit<PortfolioContactSettings, "resume"> & {
  resume: ResumeSettingValue | null;
  about: AboutSettingsValue;
};
type SettingsSection = "about" | "resume" | "contact";

function settingsSectionSnapshot(
  section: SettingsSection,
  values: SettingsFormValues
) {
  if (section === "about") return JSON.stringify(values.about);
  if (section === "resume") return JSON.stringify(values.resume);
  return JSON.stringify({
    github_url: values.github_url,
    linkedin_url: values.linkedin_url,
    contact_email: values.contact_email,
    contact_phone: values.contact_phone,
    location: values.location,
  });
}

export default function AdminSettingsPage() {
  const theme = useTheme();
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const aboutImageInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<SettingsFormValues>({
    ...fallbackPortfolioContactSettings,
    about: fallbackAboutSettings,
  });
  const [message, setMessage] = useState<Message>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [isAboutImageUploading, setIsAboutImageUploading] = useState(false);
  const [savingSection, setSavingSection] = useState<SettingsSection | null>(null);
  const [savedSnapshots, setSavedSnapshots] = useState<
    Partial<Record<SettingsSection, string>>
  >({});
  const cardSx = {
    border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.82),
  };

  const loadSettings = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const settings = await listSiteSettings();
      const nextValues = {
        ...settingsToPortfolioContactSettings(settings),
        about: settingsToAboutSettings(settings),
      };
      setValues(nextValues);
      setSavedSnapshots({
        about: settingsSectionSnapshot("about", nextValues),
        resume: settingsSectionSnapshot("resume", nextValues),
        contact: settingsSectionSnapshot("contact", nextValues),
      });
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
          updateAboutSettings(values.about),
        ]);
        setSavedSnapshots({
          about: settingsSectionSnapshot("about", values),
          resume: settingsSectionSnapshot("resume", values),
          contact: settingsSectionSnapshot("contact", values),
        });
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

  const saveSection = (section: SettingsSection) => {
    setSavingSection(section);
    setMessage(null);

    startTransition(async () => {
      try {
        if (section === "about") {
          await updateAboutSettings(values.about);
        } else if (section === "resume") {
          if (values.resume) await upsertSiteSetting("resume", values.resume);
        } else {
          await Promise.all([
            upsertSiteSetting("github_url", values.github_url),
            upsertSiteSetting("linkedin_url", values.linkedin_url),
            upsertSiteSetting("contact_email", values.contact_email),
            upsertSiteSetting("contact_phone", values.contact_phone),
            upsertSiteSetting("location", values.location),
          ]);
        }

        setSavedSnapshots((current) => ({
          ...current,
          [section]: settingsSectionSnapshot(section, values),
        }));
        setMessage({ type: "success", text: `${section} settings saved.` });
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : `Unable to save ${section} settings.`,
        });
      } finally {
        setSavingSection(null);
      }
    });
  };

  const sectionSaveButton = (section: SettingsSection) => (
    <SectionSaveButton
      dirty={savedSnapshots[section] !== settingsSectionSnapshot(section, values)}
      saving={savingSection === section}
      disabled={
        Boolean(savingSection) ||
        isResumeUploading ||
        isAboutImageUploading
      }
      onClick={() => saveSection(section)}
    />
  );

  const handleResumeChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsResumeUploading(true);
    setMessage(null);

    try {
      const resume = await uploadResumePdf(file);
      updateValue("resume", resume);
      setSavedSnapshots((current) => ({
        ...current,
        resume: settingsSectionSnapshot("resume", { ...values, resume }),
      }));
      setMessage({ type: "success", text: "Resume uploaded and saved." });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Unable to upload resume.",
      });
    } finally {
      setIsResumeUploading(false);
    }
  };

  const handleAboutImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsAboutImageUploading(true);
    setMessage(null);

    try {
      const about = await uploadAboutImage(file, values.about);
      updateValue("about", about);
      setSavedSnapshots((current) => ({
        ...current,
        about: settingsSectionSnapshot("about", { ...values, about }),
      }));
      setMessage({ type: "success", text: "About image uploaded and saved." });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to upload the About image.",
      });
    } finally {
      setIsAboutImageUploading(false);
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
          Manage the public About section, contact links, and resume document.
        </Typography>
      </Box>

      <AdminNotificationBridge message={message} />
      {message && <Alert severity={message.type}>{message.text}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Card elevation={0} sx={cardSx}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      About Section
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
                      Control the introductory copy and profile image shown on the
                      public portfolio.
                    </Typography>
                  </Box>
                  {sectionSaveButton("about")}
                </Stack>

                <TextField
                  fullWidth
                  label="Section subtitle"
                  value={values.about.subtitle}
                  onChange={(event) =>
                    updateValue("about", {
                      ...values.about,
                      subtitle: event.target.value,
                    })
                  }
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  label="First paragraph"
                  value={values.about.paragraph_one}
                  onChange={(event) =>
                    updateValue("about", {
                      ...values.about,
                      paragraph_one: event.target.value,
                    })
                  }
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  label="Second paragraph"
                  value={values.about.paragraph_two}
                  onChange={(event) =>
                    updateValue("about", {
                      ...values.about,
                      paragraph_two: event.target.value,
                    })
                  }
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      fullWidth
                      label="About image URL"
                      value={values.about.image_url}
                      helperText="Paste an image URL or upload an image below."
                      onChange={(event) =>
                        updateValue("about", {
                          ...values.about,
                          image_url: event.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Image alt text"
                      value={values.about.image_alt}
                      onChange={(event) =>
                        updateValue("about", {
                          ...values.about,
                          image_alt: event.target.value,
                        })
                      }
                    />
                  </Grid>
                </Grid>

                <input
                  ref={aboutImageInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.svg"
                  hidden
                  onChange={handleAboutImageChange}
                />
                <Button
                  variant="outlined"
                  startIcon={
                    isAboutImageUploading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <CloudUploadOutlinedIcon />
                    )
                  }
                  disabled={isAboutImageUploading}
                  onClick={() => aboutImageInputRef.current?.click()}
                  sx={{ alignSelf: { sm: "flex-start" } }}
                >
                  {isAboutImageUploading ? "Uploading..." : "Upload About Image"}
                </Button>

                <MediaPreview
                  url={values.about.image_url}
                  label={values.about.image_alt || "About image"}
                />
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} sx={cardSx}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Resume
                  </Typography>
                  {sectionSaveButton("resume")}
                </Stack>
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
                      ref={resumeInputRef}
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
                          isResumeUploading ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <CloudUploadOutlinedIcon />
                          )
                        }
                        disabled={isResumeUploading}
                        onClick={() => resumeInputRef.current?.click()}
                      >
                        {isResumeUploading ? "Uploading..." : "Upload Resume PDF"}
                      </Button>
                      {values.resume?.url && (
                        <Link
                          href={publicMediaUrl(values.resume.url)}
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
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Contact & Social Links
                  </Typography>
                  {sectionSaveButton("contact")}
                </Stack>
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

          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              position: "sticky",
              bottom: 0,
              zIndex: 4,
              justifyContent: "flex-end",
              p: 1.5,
              borderRadius: 1.5,
              backgroundColor: alpha(theme.palette.background.default, 0.94),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              backdropFilter: "blur(12px)",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              disabled={isPending || isResumeUploading || isAboutImageUploading}
            >
              {isPending ? "Saving..." : "Save Settings"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}

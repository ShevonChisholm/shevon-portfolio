"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  AdminNotificationBridge,
  useAdminNotifications,
} from "@/components/admin/notifications/AdminNotifications";
import type { ExperienceItem } from "@/types/cms";
import {
  deleteExperienceItem,
  listExperienceItems,
  updateExperiencePublished,
} from "@/lib/cms/experience";

type Message = {
  type: "success" | "error";
  text: string;
} | null;

export default function AdminExperiencePage() {
  const theme = useTheme();
  const { enqueueNotification } = useAdminNotifications();
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [message, setMessage] = useState<Message>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadItems = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      setItems(await listExperienceItems());
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Unable to load experience.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const runAction = (action: () => Promise<string>) => {
    setMessage(null);
    startTransition(async () => {
      try {
        const text = await action();
        enqueueNotification(text, { variant: "success" });
        setMessage({ type: "success", text });
        await loadItems();
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to update experience.",
        });
      }
    });
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", sm: "flex-start" },
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Experience
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            Manage work history, publishing, and display order.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/experience/new"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ alignSelf: { xs: "stretch", sm: "center" }, fontWeight: 800 }}
        >
          New Experience
        </Button>
      </Stack>

      <AdminNotificationBridge message={message} />
      {message && <Alert severity={message.type}>{message.text}</Alert>}

      {isLoading ? (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress color="primary" />
        </Stack>
      ) : items.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.82),
          }}
        >
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              No experience items yet
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              Create the first admin-managed experience record.
            </Typography>
            <Button component={Link} href="/admin/experience/new" variant="contained">
              Create Experience
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {items.map((item) => (
            <Grid key={item.id} size={{ xs: 12, lg: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.82),
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack spacing={2.5}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "primary.main" }}>
                          {item.company}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        icon={
                          item.is_published ? (
                            <VisibilityOutlinedIcon />
                          ) : (
                            <VisibilityOffOutlinedIcon />
                          )
                        }
                        label={item.is_published ? "Published" : "Draft"}
                        color={item.is_published ? "success" : "default"}
                        variant={item.is_published ? "filled" : "outlined"}
                      />
                    </Stack>

                    <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                      {item.description}
                    </Typography>

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Period
                        </Typography>
                        <Typography sx={{ fontWeight: 800 }}>{item.period}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Location
                        </Typography>
                        <Typography sx={{ fontWeight: 800 }}>
                          {item.location || "None"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Type
                        </Typography>
                        <Typography sx={{ fontWeight: 800 }}>
                          {item.employment_type || "None"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Order
                        </Typography>
                        <Typography sx={{ fontWeight: 800 }}>
                          {item.sort_order}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      sx={{
                        alignItems: { xs: "stretch", sm: "center" },
                        justifyContent: "space-between",
                      }}
                    >
                      <Tooltip title="Publish or unpublish">
                        <Switch
                          checked={item.is_published}
                          disabled={isPending}
                          onChange={(event) =>
                            runAction(async () => {
                              await updateExperiencePublished(
                                item.id,
                                event.target.checked
                              );
                              return event.target.checked
                                ? "Experience published."
                                : "Experience unpublished.";
                            })
                          }
                          inputProps={{ "aria-label": "Publish experience" }}
                        />
                      </Tooltip>

                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        <Tooltip title="Edit experience">
                          <IconButton
                            component={Link}
                            href={`/admin/experience/${item.id}/edit`}
                            color="primary"
                          >
                            <EditOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete experience">
                          <span>
                            <IconButton
                              color="error"
                              disabled={isPending}
                              onClick={() => {
                                if (window.confirm(`Delete "${item.title}"?`)) {
                                  runAction(async () => {
                                    await deleteExperienceItem(item.id);
                                    return "Experience deleted.";
                                  });
                                }
                              }}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}

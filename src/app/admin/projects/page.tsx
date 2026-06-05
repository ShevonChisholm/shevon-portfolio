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
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { Project } from "@/types/cms";
import {
  deleteProject,
  listProjects,
  updateProjectFlags,
} from "@/lib/cms/projects";

type Message = {
  type: "success" | "error";
  text: string;
} | null;

export default function AdminProjectsPage() {
  const theme = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [message, setMessage] = useState<Message>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadProjects = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      setProjects(await listProjects());
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Unable to load projects.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const runAction = (action: () => Promise<string>) => {
    setMessage(null);
    startTransition(async () => {
      try {
        const text = await action();
        setMessage({ type: "success", text });
        await loadProjects();
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to update project.",
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
            Projects
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            Manage portfolio projects, related media, publishing, and display order.
          </Typography>
        </Box>

        <Button
          component={Link}
          href="/admin/projects/new"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ alignSelf: { xs: "stretch", sm: "center" }, fontWeight: 800 }}
        >
          New Project
        </Button>
      </Stack>

      {message && <Alert severity={message.type}>{message.text}</Alert>}

      {isLoading ? (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress color="primary" />
        </Stack>
      ) : projects.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.82),
          }}
        >
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              No projects yet
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              Create the first admin-managed project record.
            </Typography>
            <Button component={Link} href="/admin/projects/new" variant="contained">
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {projects.map((project) => {
            const isPublished = project.is_published;
            const isFeatured = project.is_featured;

            return (
              <Grid key={project.id} size={{ xs: 12, lg: 6 }}>
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
                            {project.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", overflowWrap: "anywhere" }}
                          >
                            /{project.slug}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          <Tooltip title={isFeatured ? "Featured" : "Not featured"}>
                            <Chip
                              size="small"
                              icon={isFeatured ? <StarOutlinedIcon /> : <StarBorderOutlinedIcon />}
                              label={isFeatured ? "Featured" : "Standard"}
                              color={isFeatured ? "primary" : "default"}
                              variant={isFeatured ? "filled" : "outlined"}
                            />
                          </Tooltip>
                          <Tooltip title={isPublished ? "Published" : "Unpublished"}>
                            <Chip
                              size="small"
                              icon={
                                isPublished ? (
                                  <VisibilityOutlinedIcon />
                                ) : (
                                  <VisibilityOffOutlinedIcon />
                                )
                              }
                              label={isPublished ? "Published" : "Draft"}
                              color={isPublished ? "success" : "default"}
                              variant={isPublished ? "filled" : "outlined"}
                            />
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                        {project.short_description || project.description}
                      </Typography>

                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Order
                          </Typography>
                          <Typography sx={{ fontWeight: 800 }}>
                            {project.sort_order}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Category
                          </Typography>
                          <Typography sx={{ fontWeight: 800 }}>
                            {project.category}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Type
                          </Typography>
                          <Typography sx={{ fontWeight: 800 }}>
                            {project.project_type || "None"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Status
                          </Typography>
                          <Typography sx={{ fontWeight: 800 }}>
                            {project.status || "None"}
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
                        <Stack direction="row" spacing={1.5}>
                          <Tooltip title="Publish or unpublish">
                            <Switch
                              checked={isPublished}
                              disabled={isPending}
                              onChange={(event) =>
                                runAction(async () => {
                                  await updateProjectFlags(project.id, {
                                    is_featured: project.is_featured,
                                    is_published: event.target.checked,
                                  });
                                  return event.target.checked
                                    ? "Project published."
                                    : "Project unpublished.";
                                })
                              }
                              inputProps={{ "aria-label": "Publish project" }}
                            />
                          </Tooltip>
                          <Tooltip title="Feature project">
                            <Switch
                              checked={isFeatured}
                              disabled={isPending}
                              onChange={(event) =>
                                runAction(async () => {
                                  await updateProjectFlags(project.id, {
                                    is_featured: event.target.checked,
                                    is_published: project.is_published,
                                  });
                                  return event.target.checked
                                    ? "Project featured."
                                    : "Project unfeatured.";
                                })
                              }
                              inputProps={{ "aria-label": "Feature project" }}
                            />
                          </Tooltip>
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                          <Tooltip title="Edit project">
                            <IconButton
                              component={Link}
                              href={`/admin/projects/${project.id}/edit`}
                              color="primary"
                            >
                              <EditOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete project">
                            <span>
                              <IconButton
                                color="error"
                                disabled={isPending}
                                onClick={() => {
                                  if (window.confirm(`Delete "${project.title}"?`)) {
                                    runAction(async () => {
                                      await deleteProject(project.id);
                                      return "Project deleted.";
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
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}

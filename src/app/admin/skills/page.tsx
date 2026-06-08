"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  AdminNotificationBridge,
  useAdminNotifications,
} from "@/components/admin/notifications/AdminNotifications";
import type {
  Skill,
  SkillCategoryFormValues,
  SkillCategoryWithSkills,
  SkillFormValues,
} from "@/types/cms";
import {
  emptySkillCategoryFormValues,
  emptySkillFormValues,
} from "@/types/cms";
import {
  categoryToFormValues,
  createSkill,
  createSkillCategory,
  deleteSkill,
  deleteSkillCategory,
  listSkillCategoriesWithSkills,
  skillToFormValues,
  updateSkill,
  updateSkillCategory,
  updateSkillCategoryPublished,
  updateSkillPublished,
} from "@/lib/cms/skills";

type Message = {
  type: "success" | "error";
  text: string;
} | null;

export default function AdminSkillsPage() {
  const theme = useTheme();
  const { enqueueNotification } = useAdminNotifications();
  const [categories, setCategories] = useState<SkillCategoryWithSkills[]>([]);
  const [categoryDraft, setCategoryDraft] =
    useState<SkillCategoryFormValues>(emptySkillCategoryFormValues);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [skillDrafts, setSkillDrafts] = useState<Record<string, SkillFormValues>>(
    {}
  );
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const cardSx = {
    border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.82),
  };

  const loadCategories = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const nextCategories = await listSkillCategoriesWithSkills();
      setCategories(nextCategories);
      setSkillDrafts((current) => {
        const drafts = { ...current };
        nextCategories.forEach((category) => {
          drafts[category.id] = drafts[category.id] ?? {
            ...emptySkillFormValues,
            category_id: category.id,
            sort_order: category.skills.length,
          };
        });
        return drafts;
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to load skills.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const runAction = (action: () => Promise<string>) => {
    setMessage(null);
    startTransition(async () => {
      try {
        const text = await action();
        enqueueNotification(text, { variant: "success" });
        setMessage({ type: "success", text });
        await loadCategories();
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error ? error.message : "Unable to update skills.",
        });
      }
    });
  };

  const handleCategorySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runAction(async () => {
      if (editingCategoryId) {
        await updateSkillCategory(editingCategoryId, categoryDraft);
        setEditingCategoryId(null);
        setCategoryDraft(emptySkillCategoryFormValues);
        return "Skill category saved.";
      }

      await createSkillCategory(categoryDraft);
      setCategoryDraft(emptySkillCategoryFormValues);
      return "Skill category created.";
    });
  };

  const handleSkillSubmit = (
    event: FormEvent<HTMLFormElement>,
    categoryId: string
  ) => {
    event.preventDefault();
    const draft = skillDrafts[categoryId] ?? {
      ...emptySkillFormValues,
      category_id: categoryId,
    };

    runAction(async () => {
      if (editingSkillId) {
        await updateSkill(editingSkillId, draft);
        setEditingSkillId(null);
        setSkillDrafts((current) => ({
          ...current,
          [categoryId]: { ...emptySkillFormValues, category_id: categoryId },
        }));
        return "Skill saved.";
      }

      await createSkill(draft);
      setSkillDrafts((current) => ({
        ...current,
        [categoryId]: { ...emptySkillFormValues, category_id: categoryId },
      }));
      return "Skill created.";
    });
  };

  const updateCategoryDraft = <K extends keyof SkillCategoryFormValues>(
    key: K,
    value: SkillCategoryFormValues[K]
  ) => {
    setCategoryDraft((current) => ({ ...current, [key]: value }));
  };

  const updateSkillDraft = <K extends keyof SkillFormValues>(
    categoryId: string,
    key: K,
    value: SkillFormValues[K]
  ) => {
    setSkillDrafts((current) => ({
      ...current,
      [categoryId]: {
        ...(current[categoryId] ?? {
          ...emptySkillFormValues,
          category_id: categoryId,
        }),
        [key]: value,
      },
    }));
  };

  const beginEditingCategory = (category: SkillCategoryWithSkills) => {
    setEditingCategoryId(category.id);
    setCategoryDraft(categoryToFormValues(category));
  };

  const beginEditingSkill = (skill: Skill) => {
    setEditingSkillId(skill.id);
    setSkillDrafts((current) => ({
      ...current,
      [skill.category_id]: skillToFormValues(skill),
    }));
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Skills
        </Typography>
        <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
          Manage skill categories and the skills displayed under each category.
        </Typography>
      </Box>

      <AdminNotificationBridge message={message} />
      {message && <Alert severity={message.type}>{message.text}</Alert>}

      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box component="form" onSubmit={handleCategorySubmit}>
            <Stack spacing={2.5}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {editingCategoryId ? "Edit Skill Category" : "New Skill Category"}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    required
                    label="Title"
                    value={categoryDraft.title}
                    onChange={(event) =>
                      updateCategoryDraft("title", event.target.value)
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Icon"
                    helperText="Example: web, mobile, backend, database, payments, cloud"
                    value={categoryDraft.icon}
                    onChange={(event) =>
                      updateCategoryDraft("icon", event.target.value)
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Order"
                    value={categoryDraft.sort_order}
                    onChange={(event) =>
                      updateCategoryDraft("sort_order", Number(event.target.value))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={categoryDraft.is_published}
                        onChange={(event) =>
                          updateCategoryDraft(
                            "is_published",
                            event.target.checked
                          )
                        }
                      />
                    }
                    label="Published"
                  />
                </Grid>
              </Grid>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={editingCategoryId ? <SaveOutlinedIcon /> : <AddIcon />}
                  disabled={isPending}
                >
                  {editingCategoryId ? "Save Category" : "Add Category"}
                </Button>
                {editingCategoryId && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingCategoryId(null);
                      setCategoryDraft(emptySkillCategoryFormValues);
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {isLoading ? (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress color="primary" />
        </Stack>
      ) : categories.length === 0 ? (
        <Card elevation={0} sx={cardSx}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              No skill categories yet
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              Add a category above, then add skills under it.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2.5}>
          {categories.map((category) => {
            const draft = skillDrafts[category.id] ?? {
              ...emptySkillFormValues,
              category_id: category.id,
            };

            return (
              <Card key={category.id} elevation={0} sx={cardSx}>
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
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          {category.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          Icon: {category.icon || "None"} | Order:{" "}
                          {category.sort_order}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Chip
                          size="small"
                          icon={
                            category.is_published ? (
                              <VisibilityOutlinedIcon />
                            ) : (
                              <VisibilityOffOutlinedIcon />
                            )
                          }
                          label={category.is_published ? "Published" : "Draft"}
                          color={category.is_published ? "success" : "default"}
                          variant={category.is_published ? "filled" : "outlined"}
                        />
                        <Tooltip title="Publish category">
                          <Switch
                            checked={category.is_published}
                            disabled={isPending}
                            onChange={(event) =>
                              runAction(async () => {
                                await updateSkillCategoryPublished(
                                  category.id,
                                  event.target.checked
                                );
                                return event.target.checked
                                  ? "Category published."
                                  : "Category unpublished.";
                              })
                            }
                          />
                        </Tooltip>
                        <Tooltip title="Edit category">
                          <IconButton
                            color="primary"
                            onClick={() => beginEditingCategory(category)}
                          >
                            <EditOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete category">
                          <span>
                            <IconButton
                              color="error"
                              disabled={isPending}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Delete "${category.title}" and its skills?`
                                  )
                                ) {
                                  runAction(async () => {
                                    await deleteSkillCategory(category.id);
                                    return "Category deleted.";
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

                    <Divider />

                    <Box component="form" onSubmit={(event) => handleSkillSubmit(event, category.id)}>
                      <Grid container spacing={1.5} sx={{ alignItems: "center" }}>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField
                            fullWidth
                            required
                            label="Skill name"
                            value={draft.name}
                            onChange={(event) =>
                              updateSkillDraft(category.id, "name", event.target.value)
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField
                            fullWidth
                            label="Skill type"
                            value={draft.skill_type}
                            onChange={(event) =>
                              updateSkillDraft(
                                category.id,
                                "skill_type",
                                event.target.value
                              )
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Order"
                            value={draft.sort_order}
                            onChange={(event) =>
                              updateSkillDraft(
                                category.id,
                                "sort_order",
                                Number(event.target.value)
                              )
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={draft.is_published}
                                onChange={(event) =>
                                  updateSkillDraft(
                                    category.id,
                                    "is_published",
                                    event.target.checked
                                  )
                                }
                              />
                            }
                            label="Published"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                          <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            startIcon={editingSkillId ? <SaveOutlinedIcon /> : <AddIcon />}
                            disabled={isPending}
                          >
                            {editingSkillId ? "Save Skill" : "Add Skill"}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                      {category.skills.length === 0 ? (
                        <Typography sx={{ color: "text.secondary" }}>
                          No skills in this category yet.
                        </Typography>
                      ) : (
                        category.skills.map((skill) => (
                          <Chip
                            key={skill.id}
                            label={`${skill.name}${skill.skill_type ? ` (${skill.skill_type})` : ""}`}
                            color={skill.is_published ? "primary" : "default"}
                            variant={skill.is_published ? "filled" : "outlined"}
                            onDelete={() => {
                              if (window.confirm(`Delete "${skill.name}"?`)) {
                                runAction(async () => {
                                  await deleteSkill(skill.id);
                                  return "Skill deleted.";
                                });
                              }
                            }}
                            deleteIcon={<DeleteOutlineIcon />}
                            icon={
                              skill.is_published ? (
                                <VisibilityOutlinedIcon />
                              ) : (
                                <VisibilityOffOutlinedIcon />
                              )
                            }
                            sx={{ fontWeight: 700 }}
                            onClick={() => beginEditingSkill(skill)}
                          />
                        ))
                      )}
                    </Stack>

                    {category.skills.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                        {category.skills.map((skill) => (
                          <Button
                            key={`${skill.id}-publish`}
                            size="small"
                            variant="text"
                            disabled={isPending}
                            onClick={() =>
                              runAction(async () => {
                                await updateSkillPublished(
                                  skill.id,
                                  !skill.is_published
                                );
                                return !skill.is_published
                                  ? "Skill published."
                                  : "Skill unpublished.";
                              })
                            }
                          >
                            {skill.is_published
                              ? `Unpublish ${skill.name}`
                              : `Publish ${skill.name}`}
                          </Button>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import {
  AdminNotificationBridge,
  useAdminNotifications,
  type AdminNotificationMessage,
} from "@/components/admin/notifications/AdminNotifications";
import {
  type CarePlan,
  type ServicePackage,
  type UpsertCarePlanInput,
  type UpsertServicePackageInput,
  useCreateCarePlanMutation,
  useCreateServicePackageMutation,
  useDeactivateCarePlanMutation,
  useDeactivateServicePackageMutation,
  useLazyGetCarePlanQuery,
  useLazyGetServicePackageQuery,
  useListCarePlansQuery,
  useListServicePackagesQuery,
  useUpdateCarePlanMutation,
  useUpdateServicePackageMutation,
} from "@/lib/api/catalog-api";

type CatalogTab = "packages" | "care";
type DialogMode = "create" | "edit";
type Message = AdminNotificationMessage | null;

type PackageFormState = {
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  starting_price: string;
  price_label: string;
  timeline: string;
  package_type: string;
  display_order: string;
  cta_label: string;
  is_featured: boolean;
  is_active: boolean;
  featuresText: string;
};

type CarePlanFormState = {
  name: string;
  slug: string;
  description: string;
  monthly_price: string;
  price_label: string;
  display_order: string;
  is_active: boolean;
  featuresText: string;
};

type EditorState =
  | {
      tab: "packages";
      mode: DialogMode;
      id?: string;
      form: PackageFormState;
    }
  | {
      tab: "care";
      mode: DialogMode;
      id?: string;
      form: CarePlanFormState;
    };

const emptyPackageForm: PackageFormState = {
  name: "",
  slug: "",
  subtitle: "",
  description: "",
  starting_price: "",
  price_label: "",
  timeline: "",
  package_type: "",
  display_order: "0",
  cta_label: "Start Project",
  is_featured: false,
  is_active: true,
  featuresText: "",
};

const emptyCarePlanForm: CarePlanFormState = {
  name: "",
  slug: "",
  description: "",
  monthly_price: "",
  price_label: "",
  display_order: "0",
  is_active: true,
  featuresText: "",
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "Custom";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function featuresToText(
  features?: Array<{ feature?: string; sort_order?: number }>
) {
  return [...(features ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((feature) => feature.feature?.trim())
    .filter(Boolean)
    .join("\n");
}

function textToFeatures(value: string) {
  return value
    .split(/\r?\n/)
    .map((feature) => feature.trim())
    .filter(Boolean)
    .map((feature, index) => ({ feature, sort_order: index }));
}

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function optionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed.length) return undefined;

  const number = Number(trimmed);
  return Number.isFinite(number) ? number : undefined;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object"
  ) {
    const data = error.data as { message?: unknown; error?: unknown };
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.message)) return data.message.join(", ");
    if (typeof data.error === "string") return data.error;
  }

  return error instanceof Error ? error.message : fallback;
}

function packageToForm(item?: ServicePackage): PackageFormState {
  if (!item) return emptyPackageForm;

  return {
    name: item.name ?? "",
    slug: item.slug ?? "",
    subtitle: item.subtitle ?? "",
    description: item.description ?? "",
    starting_price:
      typeof item.starting_price === "number" ? String(item.starting_price) : "",
    price_label: item.price_label ?? "",
    timeline: item.timeline ?? "",
    package_type: item.package_type ?? "",
    display_order:
      typeof item.display_order === "number" ? String(item.display_order) : "0",
    cta_label: item.cta_label ?? "Start Project",
    is_featured: Boolean(item.is_featured),
    is_active: item.is_active ?? true,
    featuresText: featuresToText(item.features),
  };
}

function carePlanToForm(item?: CarePlan): CarePlanFormState {
  if (!item) return emptyCarePlanForm;

  return {
    name: item.name ?? "",
    slug: item.slug ?? "",
    description: item.description ?? "",
    monthly_price:
      typeof item.monthly_price === "number" ? String(item.monthly_price) : "",
    price_label: item.price_label ?? "",
    display_order:
      typeof item.display_order === "number" ? String(item.display_order) : "0",
    is_active: item.is_active ?? true,
    featuresText: featuresToText(item.features),
  };
}

function packagePayload(form: PackageFormState): UpsertServicePackageInput {
  return {
    name: optionalString(form.name),
    slug: optionalString(form.slug),
    subtitle: optionalString(form.subtitle),
    description: optionalString(form.description),
    starting_price: optionalNumber(form.starting_price),
    price_label: optionalString(form.price_label),
    timeline: optionalString(form.timeline),
    package_type: optionalString(form.package_type),
    display_order: optionalNumber(form.display_order),
    cta_label: optionalString(form.cta_label),
    is_featured: form.is_featured,
    is_active: form.is_active,
    features: textToFeatures(form.featuresText),
  };
}

function carePlanPayload(form: CarePlanFormState): UpsertCarePlanInput {
  return {
    name: optionalString(form.name),
    slug: optionalString(form.slug),
    description: optionalString(form.description),
    monthly_price: optionalNumber(form.monthly_price),
    price_label: optionalString(form.price_label),
    display_order: optionalNumber(form.display_order),
    is_active: form.is_active,
    features: textToFeatures(form.featuresText),
  };
}

function CatalogCard({
  title,
  subtitle,
  description,
  price,
  meta,
  features,
  active,
  featured,
  onEdit,
  onDeactivate,
  isMutating,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  price: string;
  meta: string[];
  features?: Array<{ feature?: string; sort_order?: number }>;
  active?: boolean;
  featured?: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  isMutating: boolean;
}) {
  const theme = useTheme();
  const sortedFeatures = useMemo(
    () =>
      [...(features ?? [])]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .slice(0, 4),
    [features]
  );

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: `1px solid ${
          featured
            ? alpha(theme.palette.primary.main, 0.42)
            : alpha(theme.palette.primary.main, 0.14)
        }`,
        background: featured
          ? `linear-gradient(145deg, ${alpha(
              theme.palette.primary.main,
              0.16
            )}, ${alpha(theme.palette.background.paper, 0.9)} 58%)`
          : alpha(theme.palette.background.paper, 0.84),
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, height: "100%" }}>
        <Stack spacing={2.25} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", lineHeight: 1.6 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Chip
              label={active ? "Active" : "Inactive"}
              size="small"
              color={active ? "success" : "default"}
              variant={active ? "filled" : "outlined"}
            />
          </Stack>

          <Box>
            <Typography
              variant="h4"
              sx={{ color: "primary.main", fontWeight: 900, lineHeight: 1 }}
            >
              {price}
            </Typography>
            {meta.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", gap: 1, mt: 1.25 }}
              >
                {meta.filter(Boolean).map((item) => (
                  <Chip key={item} label={item} size="small" variant="outlined" />
                ))}
              </Stack>
            )}
          </Box>

          {description && (
            <Typography
              sx={{
                color: "text.secondary",
                lineHeight: 1.7,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </Typography>
          )}

          {sortedFeatures.length > 0 && (
            <Stack spacing={1}>
              {sortedFeatures.map((feature) => (
                <Stack
                  key={feature.feature}
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "primary.main",
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {feature.feature}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            {featured ? (
              <Chip
                icon={<AutoAwesomeOutlinedIcon />}
                label="Featured"
                size="small"
                color="primary"
              />
            ) : (
              <Box />
            )}
            <Stack direction="row" spacing={0.75}>
              <Tooltip title="Edit">
                <IconButton color="primary" onClick={onEdit} disabled={isMutating}>
                  <EditOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Deactivate">
                <span>
                  <IconButton
                    color="error"
                    onClick={onDeactivate}
                    disabled={isMutating || !active}
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
  );
}

function CatalogEditorDialog({
  editor,
  onClose,
  onChange,
  onSubmit,
  saving,
}: {
  editor: EditorState | null;
  onClose: () => void;
  onChange: (editor: EditorState) => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  if (!editor) return null;

  const isPackage = editor.tab === "packages";
  const title = `${editor.mode === "create" ? "Create" : "Edit"} ${
    isPackage ? "Service Package" : "Care Plan"
  }`;

  const setPackage = (patch: Partial<PackageFormState>) => {
    if (editor.tab !== "packages") return;
    onChange({ ...editor, form: { ...editor.form, ...patch } });
  };

  const setCarePlan = (patch: Partial<CarePlanFormState>) => {
    if (editor.tab !== "care") return;
    onChange({ ...editor, form: { ...editor.form, ...patch } });
  };

  const commonNameField =
    editor.tab === "packages" ? (
      <TextField
        label="Package Name"
        value={editor.form.name}
        onChange={(event) => {
          const name = event.target.value;
          setPackage({
            name,
            slug:
              editor.mode === "create" && !editor.form.slug
                ? toSlug(name)
                : editor.form.slug,
          });
        }}
        required
        fullWidth
      />
    ) : (
      <TextField
        label="Care Plan Name"
        value={editor.form.name}
        onChange={(event) => {
          const name = event.target.value;
          setCarePlan({
            name,
            slug:
              editor.mode === "create" && !editor.form.slug
                ? toSlug(name)
                : editor.form.slug,
          });
        }}
        required
        fullWidth
      />
    );

  return (
    <Dialog
      open
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 900 }}>{title}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.25} sx={{ pt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 7 }}>{commonNameField}</Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              label="Slug"
              value={editor.form.slug}
              onChange={(event) =>
                editor.tab === "packages"
                  ? setPackage({ slug: toSlug(event.target.value) })
                  : setCarePlan({ slug: toSlug(event.target.value) })
              }
              required
              fullWidth
              helperText="Used in public URLs and proposal references."
            />
          </Grid>

          {editor.tab === "packages" ? (
            <>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Subtitle"
                  value={editor.form.subtitle}
                  onChange={(event) => setPackage({ subtitle: event.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description"
                  value={editor.form.description}
                  onChange={(event) =>
                    setPackage({ description: event.target.value })
                  }
                  fullWidth
                  multiline
                  minRows={4}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Starting Price"
                  value={editor.form.starting_price}
                  onChange={(event) =>
                    setPackage({ starting_price: event.target.value })
                  }
                  type="number"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Price Label"
                  value={editor.form.price_label}
                  onChange={(event) =>
                    setPackage({ price_label: event.target.value })
                  }
                  placeholder="Starting at"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Timeline"
                  value={editor.form.timeline}
                  onChange={(event) => setPackage({ timeline: event.target.value })}
                  placeholder="2-4 weeks"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Package Type"
                  value={editor.form.package_type}
                  onChange={(event) =>
                    setPackage({ package_type: event.target.value })
                  }
                  placeholder="web_app"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Display Order"
                  value={editor.form.display_order}
                  onChange={(event) =>
                    setPackage({ display_order: event.target.value })
                  }
                  type="number"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="CTA Label"
                  value={editor.form.cta_label}
                  onChange={(event) => setPackage({ cta_label: event.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editor.form.is_active}
                        onChange={(event) =>
                          setPackage({ is_active: event.target.checked })
                        }
                      />
                    }
                    label="Active"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editor.form.is_featured}
                        onChange={(event) =>
                          setPackage({ is_featured: event.target.checked })
                        }
                      />
                    }
                    label="Featured"
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Features"
                  value={editor.form.featuresText}
                  onChange={(event) =>
                    setPackage({ featuresText: event.target.value })
                  }
                  helperText="One feature per line."
                  fullWidth
                  multiline
                  minRows={5}
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description"
                  value={editor.form.description}
                  onChange={(event) =>
                    setCarePlan({ description: event.target.value })
                  }
                  fullWidth
                  multiline
                  minRows={4}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Monthly Price"
                  value={editor.form.monthly_price}
                  onChange={(event) =>
                    setCarePlan({ monthly_price: event.target.value })
                  }
                  type="number"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Price Label"
                  value={editor.form.price_label}
                  onChange={(event) =>
                    setCarePlan({ price_label: event.target.value })
                  }
                  placeholder="Monthly"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Display Order"
                  value={editor.form.display_order}
                  onChange={(event) =>
                    setCarePlan({ display_order: event.target.value })
                  }
                  type="number"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editor.form.is_active}
                      onChange={(event) =>
                        setCarePlan({ is_active: event.target.checked })
                      }
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Features"
                  value={editor.form.featuresText}
                  onChange={(event) =>
                    setCarePlan({ featuresText: event.target.value })
                  }
                  helperText="One care-plan benefit per line."
                  fullWidth
                  multiline
                  minRows={5}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={saving || !editor.form.name.trim() || !editor.form.slug.trim()}
          variant="contained"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function LoadingGrid() {
  return (
    <Grid container spacing={2.5}>
      {[0, 1, 2].map((item) => (
        <Grid key={item} size={{ xs: 12, md: 6, xl: 4 }}>
          <Skeleton variant="rounded" height={320} />
        </Grid>
      ))}
    </Grid>
  );
}

export default function CatalogManager() {
  const theme = useTheme();
  const { enqueueNotification } = useAdminNotifications();
  const [tab, setTab] = useState<CatalogTab>("packages");
  const [message, setMessage] = useState<Message>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);

  const packagesQuery = useListServicePackagesQuery();
  const carePlansQuery = useListCarePlansQuery();
  const [getPackage] = useLazyGetServicePackageQuery();
  const [getCarePlan] = useLazyGetCarePlanQuery();
  const [createPackage, createPackageState] = useCreateServicePackageMutation();
  const [updatePackage, updatePackageState] = useUpdateServicePackageMutation();
  const [deactivatePackage, deactivatePackageState] =
    useDeactivateServicePackageMutation();
  const [createCarePlan, createCarePlanState] = useCreateCarePlanMutation();
  const [updateCarePlan, updateCarePlanState] = useUpdateCarePlanMutation();
  const [deactivateCarePlan, deactivateCarePlanState] =
    useDeactivateCarePlanMutation();

  const packages = packagesQuery.data?.data ?? [];
  const carePlans = carePlansQuery.data?.data ?? [];
  const isLoading =
    tab === "packages" ? packagesQuery.isLoading : carePlansQuery.isLoading;
  const isError = tab === "packages" ? packagesQuery.isError : carePlansQuery.isError;
  const isSaving =
    createPackageState.isLoading ||
    updatePackageState.isLoading ||
    createCarePlanState.isLoading ||
    updateCarePlanState.isLoading;
  const isMutating =
    isSaving || deactivatePackageState.isLoading || deactivateCarePlanState.isLoading;

  const openCreateDialog = () => {
    setEditor(
      tab === "packages"
        ? { tab: "packages", mode: "create", form: { ...emptyPackageForm } }
        : { tab: "care", mode: "create", form: { ...emptyCarePlanForm } }
    );
  };

  const openPackageEditor = async (id: string) => {
    try {
      const item = await getPackage(id).unwrap();
      setEditor({
        tab: "packages",
        mode: "edit",
        id,
        form: packageToForm(item),
      });
    } catch (error) {
      const text = getErrorMessage(error, "Unable to load service package.");
      setMessage({ type: "error", text });
      enqueueNotification(text, { variant: "error" });
    }
  };

  const openCarePlanEditor = async (id: string) => {
    try {
      const item = await getCarePlan(id).unwrap();
      setEditor({
        tab: "care",
        mode: "edit",
        id,
        form: carePlanToForm(item),
      });
    } catch (error) {
      const text = getErrorMessage(error, "Unable to load care plan.");
      setMessage({ type: "error", text });
      enqueueNotification(text, { variant: "error" });
    }
  };

  const submitEditor = async () => {
    if (!editor) return;

    try {
      if (editor.tab === "packages") {
        const body = packagePayload(editor.form);
        if (editor.mode === "edit" && editor.id) {
          await updatePackage({ id: editor.id, body }).unwrap();
          enqueueNotification("Service package updated.", { variant: "success" });
          setMessage({ type: "success", text: "Service package updated." });
        } else {
          await createPackage(body).unwrap();
          enqueueNotification("Service package created.", { variant: "success" });
          setMessage({ type: "success", text: "Service package created." });
        }
      } else {
        const body = carePlanPayload(editor.form);
        if (editor.mode === "edit" && editor.id) {
          await updateCarePlan({ id: editor.id, body }).unwrap();
          enqueueNotification("Care plan updated.", { variant: "success" });
          setMessage({ type: "success", text: "Care plan updated." });
        } else {
          await createCarePlan(body).unwrap();
          enqueueNotification("Care plan created.", { variant: "success" });
          setMessage({ type: "success", text: "Care plan created." });
        }
      }

      setEditor(null);
    } catch (error) {
      const text = getErrorMessage(error, "Unable to save catalog item.");
      setMessage({ type: "error", text });
      enqueueNotification(text, { variant: "error" });
    }
  };

  const handleDeactivatePackage = async (item: ServicePackage) => {
    if (!window.confirm(`Deactivate "${item.name ?? "this package"}"?`)) return;

    try {
      await deactivatePackage(item.id).unwrap();
      enqueueNotification("Service package deactivated.", { variant: "success" });
      setMessage({ type: "success", text: "Service package deactivated." });
    } catch (error) {
      const text = getErrorMessage(error, "Unable to deactivate package.");
      setMessage({ type: "error", text });
      enqueueNotification(text, { variant: "error" });
    }
  };

  const handleDeactivateCarePlan = async (item: CarePlan) => {
    if (!window.confirm(`Deactivate "${item.name ?? "this care plan"}"?`)) return;

    try {
      await deactivateCarePlan(item.id).unwrap();
      enqueueNotification("Care plan deactivated.", { variant: "success" });
      setMessage({ type: "success", text: "Care plan deactivated." });
    } catch (error) {
      const text = getErrorMessage(error, "Unable to deactivate care plan.");
      setMessage({ type: "error", text });
      enqueueNotification(text, { variant: "error" });
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", md: "flex-start" },
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Chip
            label="Platform Catalog"
            color="primary"
            variant="outlined"
            sx={{ mb: 1.5, fontWeight: 800 }}
          />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 900, mb: 1 }}>
            Service Packages
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 760, lineHeight: 1.7 }}>
            Shape the offers recruiters, clients, and proposal workflows will
            reference: one-time build packages and recurring care plans.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ alignSelf: { xs: "stretch", md: "center" }, fontWeight: 900 }}
        >
          {tab === "packages" ? "New Package" : "New Care Plan"}
        </Button>
      </Stack>

      <AdminNotificationBridge message={message} />
      {message && <Alert severity={message.type}>{message.text}</Alert>}

      <Card
        elevation={0}
        sx={{
          border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.72),
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{
            p: 2,
            alignItems: { xs: "stretch", lg: "center" },
            justifyContent: "space-between",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value: CatalogTab) => setTab(value)}
            variant="scrollable"
            allowScrollButtonsMobile
          >
            <Tab
              value="packages"
              icon={<Inventory2OutlinedIcon />}
              iconPosition="start"
              label={`Packages (${packages.length})`}
            />
            <Tab
              value="care"
              icon={<WorkspacePremiumOutlinedIcon />}
              iconPosition="start"
              label={`Care Plans (${carePlans.length})`}
            />
          </Tabs>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={`${packages.filter((item) => item.is_active).length} active packages`}
              variant="outlined"
            />
            <Chip
              label={`${carePlans.filter((item) => item.is_active).length} active plans`}
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Card>

      {isError && (
        <Alert severity="warning">
          Unable to load this catalog section. Confirm your admin role has
          packages.view and that the API is running.
        </Alert>
      )}

      {isLoading ? (
        <LoadingGrid />
      ) : tab === "packages" ? (
        packages.length === 0 ? (
          <EmptyCatalogState
            title="No service packages yet"
            body="Create the first public-facing service package for proposal and lead workflows."
            actionLabel="Create Package"
            onAction={openCreateDialog}
          />
        ) : (
          <Grid container spacing={2.5}>
            {packages.map((item) => (
              <Grid key={item.id} size={{ xs: 12, md: 6, xl: 4 }}>
                <CatalogCard
                  title={item.name ?? "Untitled package"}
                  subtitle={item.subtitle}
                  description={item.description}
                  price={`${item.price_label ?? "Starting at"} ${formatCurrency(
                    item.starting_price
                  )}`}
                  meta={[item.timeline ?? "", item.package_type ?? ""]}
                  features={item.features}
                  active={item.is_active}
                  featured={item.is_featured}
                  onEdit={() => void openPackageEditor(item.id)}
                  onDeactivate={() => void handleDeactivatePackage(item)}
                  isMutating={isMutating}
                />
              </Grid>
            ))}
          </Grid>
        )
      ) : carePlans.length === 0 ? (
        <EmptyCatalogState
          title="No care plans yet"
          body="Create the first recurring support or maintenance offer."
          actionLabel="Create Care Plan"
          onAction={openCreateDialog}
        />
      ) : (
        <Grid container spacing={2.5}>
          {carePlans.map((item) => (
            <Grid key={item.id} size={{ xs: 12, md: 6, xl: 4 }}>
              <CatalogCard
                title={item.name ?? "Untitled care plan"}
                description={item.description}
                price={`${item.price_label ?? "Monthly"} ${formatCurrency(
                  item.monthly_price
                )}`}
                meta={["Recurring care", `Order ${item.display_order ?? 0}`]}
                features={item.features}
                active={item.is_active}
                onEdit={() => void openCarePlanEditor(item.id)}
                onDeactivate={() => void handleDeactivateCarePlan(item)}
                isMutating={isMutating}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <CatalogEditorDialog
        editor={editor}
        onClose={() => setEditor(null)}
        onChange={setEditor}
        onSubmit={() => void submitEditor()}
        saving={isSaving}
      />
    </Stack>
  );
}

function EmptyCatalogState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.82),
      }}
    >
      <CardContent sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3 }}>{body}</Typography>
        <Divider sx={{ mb: 3, borderColor: alpha(theme.palette.primary.main, 0.12) }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAction}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

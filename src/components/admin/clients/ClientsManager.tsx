"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import {
  AdminNotificationBridge,
  useAdminNotifications,
  type AdminNotificationMessage,
} from "@/components/admin/notifications/AdminNotifications";
import {
  clientStatuses,
  type Client,
  type ClientContact,
  type ClientDetail,
  type ClientStatus,
  type UpsertClientContactInput,
  type UpsertClientInput,
  useArchiveClientMutation,
  useCreateClientContactMutation,
  useCreateClientMutation,
  useDeleteClientContactMutation,
  useGetClientQuery,
  useListClientsQuery,
  useUpdateClientMutation,
} from "@/lib/api/clients-api";

type Message = AdminNotificationMessage | null;
type ClientFilter = "active" | "inactive" | "archived" | "all";
type ClientDialogMode = "create" | "edit";

type ClientFormState = {
  business_name: string;
  industry: string;
  website_url: string;
  notes: string;
  status: ClientStatus;
  contact_full_name: string;
  contact_email: string;
  contact_phone: string;
  contact_role: string;
  portal_access_enabled: boolean;
};

type ContactFormState = {
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_primary: boolean;
  portal_access_enabled: boolean;
};

const filterOptions: Array<{ value: ClientFilter; label: string; status?: ClientStatus }> = [
  { value: "active", label: "Active", status: "Active" },
  { value: "inactive", label: "Inactive", status: "Inactive" },
  { value: "archived", label: "Archived", status: "Archived" },
  { value: "all", label: "All" },
];

const emptyClientForm: ClientFormState = {
  business_name: "",
  industry: "",
  website_url: "",
  notes: "",
  status: "Active",
  contact_full_name: "",
  contact_email: "",
  contact_phone: "",
  contact_role: "",
  portal_access_enabled: false,
};

const emptyContactForm: ContactFormState = {
  full_name: "",
  email: "",
  phone: "",
  role: "",
  is_primary: false,
  portal_access_enabled: false,
};

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
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

function formatDate(value?: string | null) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShortDate(value?: string | null) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function statusColor(status?: string | null) {
  if (status === "Active") return "success" as const;
  if (status === "Archived") return "default" as const;
  return "warning" as const;
}

function toClientForm(client?: ClientDetail): ClientFormState {
  if (!client) return emptyClientForm;

  return {
    business_name: client.business_name ?? "",
    industry: client.industry ?? "",
    website_url: client.website_url ?? "",
    notes: client.notes ?? "",
    status: (client.status as ClientStatus) ?? "Active",
    contact_full_name: "",
    contact_email: "",
    contact_phone: "",
    contact_role: "",
    portal_access_enabled: false,
  };
}

function clientPayload(form: ClientFormState): UpsertClientInput {
  const primaryContact =
    form.contact_full_name.trim() && form.contact_email.trim()
      ? {
          full_name: form.contact_full_name.trim(),
          email: form.contact_email.trim(),
          phone: optional(form.contact_phone),
          role: optional(form.contact_role),
          is_primary: true,
          portal_access_enabled: form.portal_access_enabled,
        }
      : undefined;

  return {
    business_name: form.business_name.trim(),
    industry: optional(form.industry),
    website_url: optional(form.website_url),
    notes: optional(form.notes),
    status: form.status,
    primary_contact: primaryContact,
  };
}

function contactPayload(form: ContactFormState): UpsertClientContactInput {
  return {
    full_name: form.full_name.trim(),
    email: form.email.trim(),
    phone: optional(form.phone),
    role: optional(form.role),
    is_primary: form.is_primary,
    portal_access_enabled: form.portal_access_enabled,
  };
}

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start", minWidth: 0 }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          borderRadius: 1,
          color: "primary.main",
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          "& svg": { fontSize: 16 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "0.62rem",
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ overflowWrap: "anywhere", lineHeight: 1.5 }}>
          {value || "Not provided"}
        </Typography>
      </Box>
    </Stack>
  );
}

function ClientCard({
  client,
  selected,
  archiving,
  onView,
  onEdit,
  onArchive,
}: {
  client: Client;
  selected: boolean;
  archiving: boolean;
  onView: () => void;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const theme = useTheme();
  const contact = client.primary_contact;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: `1px solid ${
          selected
            ? alpha(theme.palette.primary.main, 0.55)
            : alpha(theme.palette.primary.main, 0.14)
        }`,
        backgroundColor: selected
          ? alpha(theme.palette.primary.main, 0.1)
          : alpha(theme.palette.background.paper, 0.82),
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, sm: 2.75 } }}>
        <Stack spacing={2.25}>
          <Stack direction="row" spacing={1.25} sx={{ justifyContent: "space-between" }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.4 }}>
                {client.business_name || "Unnamed client"}
              </Typography>
              <Typography sx={{ color: "text.secondary", overflowWrap: "anywhere" }}>
                {client.industry || contact?.email || "No industry set"}
              </Typography>
            </Box>
            <Chip
              label={client.status || "Unknown"}
              color={statusColor(client.status)}
              size="small"
              sx={{ flexShrink: 0, fontWeight: 800 }}
            />
          </Stack>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Projects
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>{client.project_count ?? 0}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Proposals
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>{client.proposal_count ?? 0}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Contact
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>
                {contact?.full_name || "None"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Since
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>
                {formatShortDate(client.created_at)}
              </Typography>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {contact?.portal_access_enabled && (
              <Chip label="Portal enabled" size="small" color="primary" />
            )}
            {client.website_url && (
              <Chip icon={<LanguageOutlinedIcon />} label="Website" size="small" variant="outlined" />
            )}
            {client.lead_id && <Chip label="From lead" size="small" variant="outlined" />}
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}
          >
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" onClick={onView}>
                View
              </Button>
              <Button size="small" startIcon={<EditOutlinedIcon />} onClick={onEdit}>
                Edit
              </Button>
            </Stack>
            <Tooltip title="Archive client">
              <span>
                <IconButton
                  color="warning"
                  size="small"
                  disabled={archiving || client.status === "Archived"}
                  onClick={onArchive}
                >
                  <ArchiveOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ClientEditorDialog({
  open,
  mode,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: ClientDialogMode;
  form: ClientFormState;
  saving: boolean;
  onChange: (patch: Partial<ClientFormState>) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 900 }}>
        {mode === "create" ? "Create Client" : "Edit Client"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label="Business name"
              value={form.business_name}
              onChange={(event) => onChange({ business_name: event.target.value })}
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(event) => onChange({ status: event.target.value as ClientStatus })}
              fullWidth
            >
              {clientStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Industry"
              value={form.industry}
              onChange={(event) => onChange({ industry: event.target.value })}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Website URL"
              value={form.website_url}
              onChange={(event) => onChange({ website_url: event.target.value })}
              placeholder="https://example.com"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Notes"
              value={form.notes}
              onChange={(event) => onChange({ notes: event.target.value })}
              multiline
              minRows={4}
              fullWidth
            />
          </Grid>

          {mode === "create" && (
            <>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
                <Typography sx={{ fontWeight: 900 }}>Primary Contact</Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                  Optional, but useful for setting up portal access later.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Contact name"
                  value={form.contact_full_name}
                  onChange={(event) =>
                    onChange({ contact_full_name: event.target.value })
                  }
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Contact email"
                  value={form.contact_email}
                  onChange={(event) => onChange({ contact_email: event.target.value })}
                  type="email"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Contact phone"
                  value={form.contact_phone}
                  onChange={(event) => onChange({ contact_phone: event.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Contact role"
                  value={form.contact_role}
                  onChange={(event) => onChange({ contact_role: event.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.portal_access_enabled}
                      onChange={(event) =>
                        onChange({ portal_access_enabled: event.target.checked })
                      }
                    />
                  }
                  label="Enable portal access flag"
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
          disabled={saving || !form.business_name.trim()}
          variant="contained"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ContactDialog({
  open,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  form: ContactFormState;
  saving: boolean;
  onChange: (patch: Partial<ContactFormState>) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>Add Contact</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <TextField
            label="Full name"
            value={form.full_name}
            onChange={(event) => onChange({ full_name: event.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(event) => onChange({ email: event.target.value })}
            required
            type="email"
            fullWidth
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
            fullWidth
          />
          <TextField
            label="Role"
            value={form.role}
            onChange={(event) => onChange({ role: event.target.value })}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.is_primary}
                onChange={(event) => onChange({ is_primary: event.target.checked })}
              />
            }
            label="Primary contact"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.portal_access_enabled}
                onChange={(event) =>
                  onChange({ portal_access_enabled: event.target.checked })
                }
              />
            }
            label="Enable portal access flag"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={saving || !form.full_name.trim() || !form.email.trim()}
          variant="contained"
        >
          {saving ? "Adding..." : "Add Contact"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ClientDetailDrawer({
  clientId,
  onClose,
  onEdit,
  onAddContact,
  onDeleteContact,
  deletingContact,
}: {
  clientId: string | null;
  onClose: () => void;
  onEdit: (client: ClientDetail) => void;
  onAddContact: () => void;
  onDeleteContact: (contact: ClientContact) => void;
  deletingContact: boolean;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { data: client, isLoading, isFetching, isError } = useGetClientQuery(clientId ?? "", {
    skip: !clientId,
  });

  return (
    <Drawer
      anchor="right"
      open={Boolean(clientId)}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: fullScreen ? "100%" : 620,
          maxWidth: "100vw",
          backgroundImage: "none",
          borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        },
      }}
    >
      <Stack sx={{ minHeight: "100%" }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            p: 2.5,
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Client Details
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
              {isFetching ? "Refreshing..." : client?.business_name || "Client profile"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close client details">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ p: 2.5, overflowY: "auto", flex: 1 }}>
          {isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={140} />
              <Skeleton variant="rounded" height={220} />
              <Skeleton variant="rounded" height={160} />
            </Stack>
          ) : isError || !client ? (
            <Alert severity="error">
              Unable to load this client. Confirm your role has clients.view.
            </Alert>
          ) : (
            <ClientDetailContent
              client={client}
              onEdit={() => onEdit(client)}
              onAddContact={onAddContact}
              onDeleteContact={onDeleteContact}
              deletingContact={deletingContact}
            />
          )}
        </Box>
      </Stack>
    </Drawer>
  );
}

function ClientDetailContent({
  client,
  onEdit,
  onAddContact,
  onDeleteContact,
  deletingContact,
}: {
  client: ClientDetail;
  onEdit: () => void;
  onAddContact: () => void;
  onDeleteContact: (contact: ClientContact) => void;
  deletingContact: boolean;
}) {
  const theme = useTheme();
  const contacts = client.contacts ?? [];
  const projects = client.client_projects ?? [];
  const proposals = client.proposals ?? [];
  const carePlans = client.care_plan_summary ?? [];

  return (
    <Stack spacing={3}>
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.74),
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.25} sx={{ justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  {client.business_name || "Unnamed client"}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {client.industry || "No industry set"}
                </Typography>
              </Box>
              <Chip
                label={client.status || "Unknown"}
                color={statusColor(client.status)}
                sx={{ fontWeight: 800 }}
              />
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoLine icon={<LanguageOutlinedIcon />} label="Website" value={client.website_url} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoLine icon={<CalendarIcon />} label="Created" value={formatDate(client.created_at)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoLine icon={<WorkOutlineOutlinedIcon />} label="Projects" value={projects.length} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoLine icon={<LocalOfferOutlinedIcon />} label="Proposals" value={proposals.length} />
              </Grid>
            </Grid>
            {client.notes && (
              <InfoLine icon={<NotesOutlinedIcon />} label="Notes" value={client.notes} />
            )}
            <Button
              startIcon={<EditOutlinedIcon />}
              onClick={onEdit}
              variant="outlined"
              sx={{ alignSelf: "flex-start" }}
            >
              Edit Client
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 900 }}>Contacts</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={onAddContact}>
            Add Contact
          </Button>
        </Stack>
        {contacts.length === 0 ? (
          <Typography sx={{ color: "text.secondary" }}>No contacts yet.</Typography>
        ) : (
          <Stack spacing={1.25}>
            {contacts.map((contact) => (
              <Paper
                key={contact.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                  backgroundColor: alpha(theme.palette.common.white, 0.025),
                }}
              >
                <Stack direction="row" spacing={1.25} sx={{ justifyContent: "space-between", gap: 1 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                      <Typography sx={{ fontWeight: 900 }}>{contact.full_name}</Typography>
                      {contact.is_primary && <Chip label="Primary" size="small" color="primary" />}
                      {contact.portal_access_enabled && <Chip label="Portal" size="small" variant="outlined" />}
                    </Stack>
                    <Typography sx={{ color: "text.secondary", overflowWrap: "anywhere" }}>
                      {contact.email}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                      {[contact.role, contact.phone].filter(Boolean).join(" | ") || "No role set"}
                    </Typography>
                  </Box>
                  <Tooltip title="Delete contact">
                    <span>
                      <IconButton
                        color="error"
                        size="small"
                        disabled={deletingContact}
                        onClick={() => onDeleteContact(contact)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>

      <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.14) }} />

      <SummarySection title="Projects" empty="No client projects yet.">
        {projects.map((project) => (
          <SummaryRow key={project.id} title={project.title || "Untitled project"} meta={project.current_stage || project.status || "No stage"}>
            {typeof project.progress_percent === "number" && (
              <LinearProgress variant="determinate" value={project.progress_percent} sx={{ mt: 1 }} />
            )}
          </SummaryRow>
        ))}
      </SummarySection>

      <SummarySection title="Proposals" empty="No proposals yet.">
        {proposals.map((proposal) => (
          <SummaryRow
            key={proposal.id}
            title={proposal.title || "Untitled proposal"}
            meta={[proposal.status, formatShortDate(proposal.expires_at)].filter(Boolean).join(" | ")}
          />
        ))}
      </SummarySection>

      <SummarySection title="Care Plans" empty="No care plans yet.">
        {carePlans.map((plan) => (
          <SummaryRow
            key={plan.id}
            title={plan.status || "Care plan"}
            meta={[formatShortDate(plan.starts_on), formatShortDate(plan.ends_on)].join(" - ")}
          />
        ))}
      </SummarySection>
    </Stack>
  );
}

function SummarySection({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <Stack spacing={1.25}>
      <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
      {hasChildren ? children : <Typography sx={{ color: "text.secondary" }}>{empty}</Typography>}
    </Stack>
  );
}

function SummaryRow({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children?: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        backgroundColor: alpha(theme.palette.common.white, 0.025),
      }}
    >
      <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
      {meta && <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>{meta}</Typography>}
      {children}
    </Paper>
  );
}

function CalendarIcon() {
  return <BusinessCenterOutlinedIcon />;
}

export default function ClientsManager() {
  const theme = useTheme();
  const { enqueueNotification } = useAdminNotifications();
  const [filter, setFilter] = useState<ClientFilter>("active");
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clientDialogMode, setClientDialogMode] = useState<ClientDialogMode>("create");
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState<ClientFormState>(emptyClientForm);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormState>(emptyContactForm);

  const filterConfig = filterOptions.find((item) => item.value === filter) ?? filterOptions[0];
  const query = useMemo(
    () => ({
      limit: 25,
      search: search.trim() || undefined,
      status: filterConfig.status,
    }),
    [filterConfig.status, search]
  );
  const { data, isLoading, isFetching, isError, refetch } = useListClientsQuery(query);
  const [createClient, createClientState] = useCreateClientMutation();
  const [updateClient, updateClientState] = useUpdateClientMutation();
  const [archiveClient, archiveClientState] = useArchiveClientMutation();
  const [createContact, createContactState] = useCreateClientContactMutation();
  const [deleteContact, deleteContactState] = useDeleteClientContactMutation();

  const clients = data?.data ?? [];
  const total = data?.pagination.total ?? clients.length;
  const savingClient = createClientState.isLoading || updateClientState.isLoading;

  const showMessage = (nextMessage: AdminNotificationMessage) => {
    setMessage(nextMessage);
    enqueueNotification(nextMessage.text, { variant: nextMessage.type });
  };

  const openCreateDialog = () => {
    setClientDialogMode("create");
    setEditingClientId(null);
    setClientForm({ ...emptyClientForm });
    setClientDialogOpen(true);
  };

  const openEditDialog = (client: ClientDetail | Client) => {
    setClientDialogMode("edit");
    setEditingClientId(client.id);
    setClientForm(toClientForm(client as ClientDetail));
    setClientDialogOpen(true);
  };

  const saveClient = async () => {
    try {
      const body = clientPayload(clientForm);
      if (clientDialogMode === "edit" && editingClientId) {
        await updateClient({ id: editingClientId, body }).unwrap();
        showMessage({ type: "success", text: "Client updated." });
      } else {
        const created = await createClient(body).unwrap();
        setSelectedClientId(created.id);
        showMessage({ type: "success", text: "Client created." });
      }
      setClientDialogOpen(false);
    } catch (error) {
      showMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to save client."),
      });
    }
  };

  const archiveSelectedClient = async (client: Client) => {
    if (!window.confirm(`Archive ${client.business_name || "this client"}?`)) return;

    try {
      await archiveClient(client.id).unwrap();
      showMessage({ type: "success", text: "Client archived." });
      if (selectedClientId === client.id) setSelectedClientId(null);
    } catch (error) {
      showMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to archive client."),
      });
    }
  };

  const openContactDialog = () => {
    setContactForm({ ...emptyContactForm });
    setContactDialogOpen(true);
  };

  const saveContact = async () => {
    if (!selectedClientId) return;

    try {
      await createContact({
        clientId: selectedClientId,
        body: contactPayload(contactForm),
      }).unwrap();
      setContactDialogOpen(false);
      showMessage({ type: "success", text: "Client contact added." });
    } catch (error) {
      showMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to add client contact."),
      });
    }
  };

  const removeContact = async (contact: ClientContact) => {
    if (!selectedClientId || !window.confirm(`Delete contact ${contact.full_name || contact.email}?`)) {
      return;
    }

    try {
      await deleteContact({ clientId: selectedClientId, contactId: contact.id }).unwrap();
      showMessage({ type: "success", text: "Client contact deleted." });
    } catch (error) {
      showMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to delete client contact."),
      });
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { xs: "stretch", md: "flex-start" }, justifyContent: "space-between" }}
      >
        <Box>
          <Chip label="Client Operations" color="primary" variant="outlined" sx={{ mb: 1.5, fontWeight: 800 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 900, mb: 1 }}>
            Clients
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 760, lineHeight: 1.7 }}>
            Manage client profiles, primary contacts, portal access readiness,
            proposals, projects, and care relationships.
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button variant="outlined" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            New Client
          </Button>
        </Stack>
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
        <Stack spacing={2} sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", lg: "center" } }}
          >
            <Tabs
              value={filter}
              onChange={(_, value: ClientFilter) => setFilter(value)}
              variant="scrollable"
              allowScrollButtonsMobile
            >
              {filterOptions.map((item) => (
                <Tab key={item.value} value={item.value} label={item.label} />
              ))}
            </Tabs>
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business, industry, or name"
              size="small"
              InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
              sx={{ minWidth: { xs: "auto", lg: 340 } }}
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Chip label={`${total} matching clients`} variant="outlined" />
            {isFetching && <CircularProgress size={18} />}
          </Stack>
        </Stack>
      </Card>

      {isError && (
        <Alert severity="warning">
          Unable to load clients. Confirm your admin role has clients.view and
          that the Nest API is running.
        </Alert>
      )}

      {isLoading ? (
        <Grid container spacing={2.5}>
          {[0, 1, 2, 3].map((item) => (
            <Grid key={item} size={{ xs: 12, xl: 6 }}>
              <Skeleton variant="rounded" height={250} />
            </Grid>
          ))}
        </Grid>
      ) : clients.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.82),
          }}
        >
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
              No clients found
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              Converted leads and manually created client profiles will appear here.
            </Typography>
            <Button variant="contained" onClick={openCreateDialog}>
              Create Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {clients.map((client) => (
            <Grid key={client.id} size={{ xs: 12, xl: 6 }}>
              <ClientCard
                client={client}
                selected={client.id === selectedClientId}
                archiving={archiveClientState.isLoading}
                onView={() => setSelectedClientId(client.id)}
                onEdit={() => openEditDialog(client)}
                onArchive={() => void archiveSelectedClient(client)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ClientDetailDrawer
        clientId={selectedClientId}
        onClose={() => setSelectedClientId(null)}
        onEdit={openEditDialog}
        onAddContact={openContactDialog}
        onDeleteContact={removeContact}
        deletingContact={deleteContactState.isLoading}
      />

      <ClientEditorDialog
        open={clientDialogOpen}
        mode={clientDialogMode}
        form={clientForm}
        saving={savingClient}
        onChange={(patch) => setClientForm((current) => ({ ...current, ...patch }))}
        onClose={() => setClientDialogOpen(false)}
        onSubmit={() => void saveClient()}
      />

      <ContactDialog
        open={contactDialogOpen}
        form={contactForm}
        saving={createContactState.isLoading}
        onChange={(patch) => setContactForm((current) => ({ ...current, ...patch }))}
        onClose={() => setContactDialogOpen(false)}
        onSubmit={() => void saveContact()}
      />
    </Stack>
  );
}

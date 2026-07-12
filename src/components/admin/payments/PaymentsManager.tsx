"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link as MuiLink,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LaunchIcon from "@mui/icons-material/Launch";
import MoneyOffOutlinedIcon from "@mui/icons-material/MoneyOffOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { useAdminNotifications } from "@/components/admin/notifications/AdminNotifications";
import { useListClientProjectsQuery } from "@/lib/api/client-projects-api";
import {
  paymentMethods,
  paymentMilestoneStatuses,
  type PaymentMethod,
  type PaymentMilestone,
  type PaymentMilestoneInput,
  type PaymentMilestoneStatus,
  type PaymentRecord,
  type PaymentRecordInput,
  useCreateAdminCheckoutSessionMutation,
  useCreatePaymentMilestoneMutation,
  useCreatePaymentRecordMutation,
  useDeletePaymentMilestoneMutation,
  useDeletePaymentRecordMutation,
  useGetPaymentsSummaryQuery,
  useListPaymentMilestonesQuery,
  useListPaymentRecordsQuery,
  useUpdatePaymentMilestoneMutation,
  useUpdatePaymentRecordMutation,
  useWaivePaymentMilestoneMutation,
} from "@/lib/api/payments-api";

type MilestoneForm = {
  projectId: string;
  title: string;
  description: string;
  amount: string;
  dueDate: string;
  status: PaymentMilestoneStatus;
  sortOrder: string;
};
type RecordForm = {
  projectId: string;
  milestoneId: string;
  amount: string;
  paymentDate: string;
  method: PaymentMethod;
  reference: string;
  notes: string;
  receiptUrl: string;
};
const emptyMilestone: MilestoneForm = {
  projectId: "",
  title: "",
  description: "",
  amount: "",
  dueDate: "",
  status: "Not Due",
  sortOrder: "0",
};
const emptyRecord: RecordForm = {
  projectId: "",
  milestoneId: "",
  amount: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  method: "Bank Transfer",
  reference: "",
  notes: "",
  receiptUrl: "",
};
function apiError(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "data" in error) {
    const message = (error as { data?: { message?: string | string[] } }).data
      ?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  return fallback;
}
function money(value?: number | null) {
  return new Intl.NumberFormat("en-JM", {
    style: "currency",
    currency: "JMD",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}
function date(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "Not set";
}
function dateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}
function tone(status?: string | null) {
  if (status === "Paid") return "success" as const;
  if (status === "Overdue" || status === "Cancelled") return "error" as const;
  if (status === "Due" || status === "Partially Paid")
    return "warning" as const;
  return "default" as const;
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: `1px solid ${alpha(theme.palette.common.white, 0.13)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.78),
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          display: "grid",
          placeItems: "center",
          color: "primary.main",
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          borderRadius: 1,
          mb: 1.2,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: "1.35rem",
          fontWeight: 900,
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: "0.76rem" }}>
        {label}
      </Typography>
    </Paper>
  );
}

export default function PaymentsManager() {
  const theme = useTheme();
  const { enqueueNotification } = useAdminNotifications();
  const [view, setView] = useState<"milestones" | "records">("milestones");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] =
    useState<PaymentMilestone | null>(null);
  const [editingRecord, setEditingRecord] = useState<PaymentRecord | null>(
    null,
  );
  const [milestoneForm, setMilestoneForm] =
    useState<MilestoneForm>(emptyMilestone);
  const [recordForm, setRecordForm] = useState<RecordForm>(emptyRecord);
  const summaryQuery = useGetPaymentsSummaryQuery();
  const milestonesQuery = useListPaymentMilestonesQuery({
    limit: 100,
    client_project_id: projectFilter || undefined,
    status: statusFilter === "All" ? undefined : statusFilter,
  });
  const recordsQuery = useListPaymentRecordsQuery({
    limit: 100,
    client_project_id: projectFilter || undefined,
  });
  const projectsQuery = useListClientProjectsQuery({
    limit: 100,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [createMilestone, createMilestoneState] =
    useCreatePaymentMilestoneMutation();
  const [updateMilestone, updateMilestoneState] =
    useUpdatePaymentMilestoneMutation();
  const [waiveMilestone, waiveState] = useWaivePaymentMilestoneMutation();
  const [deleteMilestone, deleteMilestoneState] =
    useDeletePaymentMilestoneMutation();
  const [createRecord, createRecordState] = useCreatePaymentRecordMutation();
  const [updateRecord, updateRecordState] = useUpdatePaymentRecordMutation();
  const [deleteRecord, deleteRecordState] = useDeletePaymentRecordMutation();
  const [createCheckout, checkoutState] =
    useCreateAdminCheckoutSessionMutation();
  const milestones = milestonesQuery.data?.data ?? [];
  const records = recordsQuery.data?.data ?? [];
  const projects = useMemo(() => projectsQuery.data?.data ?? [], [
    projectsQuery.data?.data,
  ]);
  const summary = summaryQuery.data;
  const projectMap = useMemo(
    () =>
      new Map(
        projects.map((project) => [
          project.id,
          project.title || "Untitled project",
        ]),
      ),
    [projects],
  );
  const notify = (text: string, variant: "success" | "error") =>
    enqueueNotification(text, { variant });
  const startMilestone = (item?: PaymentMilestone) => {
    setEditingMilestone(item ?? null);
    setMilestoneForm(
      item
        ? {
            projectId: item.client_project_id ?? "",
            title: item.title ?? "",
            description: item.description ?? "",
            amount: String(item.amount ?? ""),
            dueDate: dateInput(item.due_date),
            status: (item.status as PaymentMilestoneStatus) ?? "Not Due",
            sortOrder: String(item.sort_order ?? 0),
          }
        : { ...emptyMilestone, projectId: projectFilter },
    );
    setMilestoneOpen(true);
  };
  const startRecord = (item?: PaymentRecord, milestone?: PaymentMilestone) => {
    setEditingRecord(item ?? null);
    setRecordForm(
      item
        ? {
            projectId: item.client_project_id ?? "",
            milestoneId: item.payment_milestone_id ?? "",
            amount: String(item.amount_paid ?? ""),
            paymentDate: dateInput(item.payment_date),
            method: (item.payment_method as PaymentMethod) ?? "Bank Transfer",
            reference: item.reference_number ?? "",
            notes: item.notes ?? "",
            receiptUrl: item.receipt_url ?? "",
          }
        : {
            ...emptyRecord,
            projectId: milestone?.client_project_id ?? projectFilter,
            milestoneId: milestone?.id ?? "",
            amount: milestone
              ? String(milestone.outstanding_amount ?? milestone.amount ?? "")
              : "",
          },
    );
    setRecordOpen(true);
  };
  const saveMilestone = async () => {
    if (
      !milestoneForm.projectId ||
      !milestoneForm.title.trim() ||
      Number(milestoneForm.amount) <= 0
    )
      return;
    const body: PaymentMilestoneInput = {
      title: milestoneForm.title.trim(),
      description: milestoneForm.description.trim() || undefined,
      amount: Number(milestoneForm.amount),
      due_date: milestoneForm.dueDate
        ? new Date(`${milestoneForm.dueDate}T00:00:00.000`).toISOString()
        : undefined,
      status: milestoneForm.status,
      sort_order: Number(milestoneForm.sortOrder) || 0,
    };
    try {
      if (editingMilestone)
        await updateMilestone({ id: editingMilestone.id, body }).unwrap();
      else
        await createMilestone({
          projectId: milestoneForm.projectId,
          body,
        }).unwrap();
      setMilestoneOpen(false);
      notify(
        editingMilestone
          ? "Payment milestone updated."
          : "Payment milestone created.",
        "success",
      );
    } catch (error) {
      notify(apiError(error, "Could not save the payment milestone."), "error");
    }
  };
  const saveRecord = async () => {
    if (
      !recordForm.projectId ||
      Number(recordForm.amount) <= 0 ||
      !recordForm.paymentDate
    )
      return;
    const body: PaymentRecordInput = {
      payment_milestone_id: recordForm.milestoneId || undefined,
      amount_paid: Number(recordForm.amount),
      payment_date: new Date(
        `${recordForm.paymentDate}T00:00:00.000`,
      ).toISOString(),
      payment_method: recordForm.method,
      reference_number: recordForm.reference.trim() || undefined,
      notes: recordForm.notes.trim() || undefined,
      receipt_url: recordForm.receiptUrl.trim() || undefined,
      is_external_payment: recordForm.method !== "Stripe",
    };
    try {
      if (editingRecord)
        await updateRecord({ id: editingRecord.id, body }).unwrap();
      else
        await createRecord({ projectId: recordForm.projectId, body }).unwrap();
      setRecordOpen(false);
      notify(
        editingRecord ? "Payment record updated." : "Payment recorded.",
        "success",
      );
    } catch (error) {
      notify(apiError(error, "Could not save the payment record."), "error");
    }
  };
  const removeMilestone = async (id: string) => {
    if (!window.confirm("Delete or cancel this payment milestone?")) return;
    try {
      await deleteMilestone(id).unwrap();
      notify("Payment milestone removed.", "success");
    } catch (error) {
      notify(apiError(error, "Could not remove the milestone."), "error");
    }
  };
  const removeRecord = async (id: string) => {
    if (
      !window.confirm(
        "Delete this payment record? This recalculates project totals.",
      )
    )
      return;
    try {
      await deleteRecord(id).unwrap();
      notify("Payment record deleted.", "success");
    } catch (error) {
      notify(apiError(error, "Could not delete the payment record."), "error");
    }
  };
  const waive = async (id: string) => {
    if (!window.confirm("Waive the outstanding amount for this milestone?"))
      return;
    try {
      await waiveMilestone(id).unwrap();
      notify("Payment milestone waived.", "success");
    } catch (error) {
      notify(apiError(error, "Could not waive the milestone."), "error");
    }
  };
  const checkout = async (id: string) => {
    try {
      const result = await createCheckout(id).unwrap();
      if (result.checkout_url)
        window.open(result.checkout_url, "_blank", "noopener,noreferrer");
      notify("Stripe checkout session created.", "success");
    } catch (error) {
      notify(
        apiError(error, "Could not create the Stripe checkout session."),
        "error",
      );
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: "1.9rem", md: "2.25rem" },
              fontWeight: 900,
            }}
          >
            Payments
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.6 }}>
            Track project invoices, payment milestones, receipts, and
            outstanding balances.
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ReceiptLongOutlinedIcon />}
            onClick={() => startRecord()}
          >
            Record Payment
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => startMilestone()}
          >
            Add Milestone
          </Button>
        </Stack>
      </Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2,minmax(0,1fr))",
            xl: "repeat(4,minmax(0,1fr))",
          },
          gap: 1.5,
        }}
      >
        <Stat
          label="Total Outstanding"
          value={money(summary?.total_outstanding)}
          icon={<PaymentsOutlinedIcon />}
        />
        <Stat
          label="Total Paid"
          value={money(summary?.total_paid)}
          icon={<CreditCardOutlinedIcon />}
        />
        <Stat
          label="Overdue"
          value={money(summary?.overdue_amount)}
          icon={<MoneyOffOutlinedIcon />}
        />
        <Stat
          label="Received This Month"
          value={money(summary?.payments_received_this_month)}
          icon={<ReceiptLongOutlinedIcon />}
        />
      </Box>
      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.78),
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: { lg: "center" },
            borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          }}
        >
          <Tabs
            value={view}
            onChange={(_, value: "milestones" | "records") => setView(value)}
            sx={{ px: 1 }}
          >
            <Tab value="milestones" label="Payment Milestones" />
            <Tab value="records" label="Payment Records" />
          </Tabs>
          <Stack direction={{ xs: "column", sm: "row" }}>
            <TextField
              select
              label="Project"
              size="small"
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              sx={{ m: 1, minWidth: 240 }}
            >
              <MenuItem value="">All projects</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.title}
                </MenuItem>
              ))}
            </TextField>
            {view === "milestones" && (
              <TextField
                select
                label="Status"
                size="small"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                sx={{ m: 1, minWidth: 160 }}
              >
                <MenuItem value="All">All statuses</MenuItem>
                {paymentMilestoneStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </Stack>
        {view === "milestones" ? (
          milestonesQuery.isLoading ? (
            <Stack spacing={1} sx={{ p: 2 }}>
              {[0, 1, 2, 3].map((item) => (
                <Skeleton key={item} height={58} />
              ))}
            </Stack>
          ) : milestonesQuery.isError ? (
            <Alert severity="error" sx={{ m: 2 }}>
              Unable to load payment milestones.
            </Alert>
          ) : milestones.length ? (
            <TableContainer>
              <Table sx={{ minWidth: 980 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Milestone</TableCell>
                    <TableCell>Project / Client</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Outstanding</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {milestones.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 850 }}>
                          {item.title}
                        </Typography>
                        <Typography
                          noWrap
                          sx={{
                            color: "text.secondary",
                            fontSize: "0.74rem",
                            maxWidth: 250,
                          }}
                        >
                          {item.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.82rem" }}>
                          {item.project?.title ||
                            projectMap.get(item.client_project_id ?? "")}
                        </Typography>
                        <Typography
                          sx={{ color: "text.secondary", fontSize: "0.72rem" }}
                        >
                          {item.client?.business_name}
                        </Typography>
                      </TableCell>
                      <TableCell>{date(item.due_date)}</TableCell>
                      <TableCell>{money(item.amount)}</TableCell>
                      <TableCell>{money(item.paid_amount)}</TableCell>
                      <TableCell
                        sx={{
                          color:
                            (item.outstanding_amount ?? 0) > 0
                              ? "primary.main"
                              : "success.main",
                          fontWeight: 900,
                        }}
                      >
                        {money(item.outstanding_amount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          color={tone(item.status)}
                          label={item.status || "Not Due"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.2}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          {(item.outstanding_amount ?? 0) > 0 && (
                            <>
                              <Tooltip title="Record payment">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => startRecord(undefined, item)}
                                >
                                  <ReceiptLongOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Create Stripe checkout">
                                <span>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    disabled={checkoutState.isLoading}
                                    onClick={() => void checkout(item.id)}
                                  >
                                    <CreditCardOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Waive">
                                <span>
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    disabled={waiveState.isLoading}
                                    onClick={() => void waive(item.id)}
                                  >
                                    <MoneyOffOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => startMilestone(item)}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={deleteMilestoneState.isLoading}
                                onClick={() => void removeMilestone(item.id)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography
              sx={{ p: 6, textAlign: "center", color: "text.secondary" }}
            >
              No payment milestones. Add one to track project payments and due
              dates.
            </Typography>
          )
        ) : recordsQuery.isLoading ? (
          <Stack spacing={1} sx={{ p: 2 }}>
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} height={58} />
            ))}
          </Stack>
        ) : recordsQuery.isError ? (
          <Alert severity="error" sx={{ m: 2 }}>
            Unable to load payment records.
          </Alert>
        ) : records.length ? (
          <TableContainer>
            <Table sx={{ minWidth: 880 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Payment Date</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Receipt</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{date(item.payment_date)}</TableCell>
                    <TableCell>
                      {projectMap.get(item.client_project_id ?? "") ||
                        "Project"}
                    </TableCell>
                    <TableCell sx={{ color: "success.main", fontWeight: 900 }}>
                      {money(item.amount_paid)}
                    </TableCell>
                    <TableCell>{item.payment_method || "Other"}</TableCell>
                    <TableCell>{item.reference_number || "-"}</TableCell>
                    <TableCell>
                      {item.receipt_url ? (
                        <MuiLink
                          href={item.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open <LaunchIcon sx={{ fontSize: 13 }} />
                        </MuiLink>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => startRecord(item)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={deleteRecordState.isLoading}
                            onClick={() => void removeRecord(item.id)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography
            sx={{ p: 6, textAlign: "center", color: "text.secondary" }}
          >
            No payment records yet.
          </Typography>
        )}
      </Paper>
      <Dialog
        open={milestoneOpen}
        onClose={() => setMilestoneOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingMilestone
            ? "Edit Payment Milestone"
            : "Add Payment Milestone"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Project"
              value={milestoneForm.projectId}
              onChange={(event) =>
                setMilestoneForm({
                  ...milestoneForm,
                  projectId: event.target.value,
                })
              }
              disabled={Boolean(editingMilestone)}
              required
              fullWidth
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Title"
              value={milestoneForm.title}
              onChange={(event) =>
                setMilestoneForm({
                  ...milestoneForm,
                  title: event.target.value,
                })
              }
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={milestoneForm.description}
              onChange={(event) =>
                setMilestoneForm({
                  ...milestoneForm,
                  description: event.target.value,
                })
              }
              multiline
              minRows={3}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Amount (JMD)"
                type="number"
                value={milestoneForm.amount}
                onChange={(event) =>
                  setMilestoneForm({
                    ...milestoneForm,
                    amount: event.target.value,
                  })
                }
                inputProps={{ min: 0.01 }}
                required
                fullWidth
              />
              <TextField
                label="Due date"
                type="date"
                value={milestoneForm.dueDate}
                onChange={(event) =>
                  setMilestoneForm({
                    ...milestoneForm,
                    dueDate: event.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Status"
                value={milestoneForm.status}
                onChange={(event) =>
                  setMilestoneForm({
                    ...milestoneForm,
                    status: event.target.value as PaymentMilestoneStatus,
                  })
                }
                fullWidth
              >
                {paymentMilestoneStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Sort order"
                type="number"
                value={milestoneForm.sortOrder}
                onChange={(event) =>
                  setMilestoneForm({
                    ...milestoneForm,
                    sortOrder: event.target.value,
                  })
                }
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setMilestoneOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={
              createMilestoneState.isLoading ||
              updateMilestoneState.isLoading ||
              !milestoneForm.projectId ||
              !milestoneForm.title.trim() ||
              Number(milestoneForm.amount) <= 0
            }
            onClick={() => void saveMilestone()}
          >
            {createMilestoneState.isLoading || updateMilestoneState.isLoading
              ? "Saving..."
              : "Save Milestone"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingRecord ? "Edit Payment Record" : "Record Payment"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Project"
              value={recordForm.projectId}
              onChange={(event) =>
                setRecordForm({
                  ...recordForm,
                  projectId: event.target.value,
                  milestoneId: "",
                })
              }
              disabled={Boolean(editingRecord)}
              required
              fullWidth
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Payment milestone"
              value={recordForm.milestoneId}
              onChange={(event) =>
                setRecordForm({
                  ...recordForm,
                  milestoneId: event.target.value,
                })
              }
              fullWidth
            >
              <MenuItem value="">No milestone</MenuItem>
              {milestones
                .filter(
                  (item) => item.client_project_id === recordForm.projectId,
                )
                .map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.title}
                  </MenuItem>
                ))}
            </TextField>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Amount paid"
                type="number"
                value={recordForm.amount}
                onChange={(event) =>
                  setRecordForm({ ...recordForm, amount: event.target.value })
                }
                inputProps={{ min: 0.01 }}
                required
                fullWidth
              />
              <TextField
                label="Payment date"
                type="date"
                value={recordForm.paymentDate}
                onChange={(event) =>
                  setRecordForm({
                    ...recordForm,
                    paymentDate: event.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
            </Stack>
            <TextField
              select
              label="Payment method"
              value={recordForm.method}
              onChange={(event) =>
                setRecordForm({
                  ...recordForm,
                  method: event.target.value as PaymentMethod,
                })
              }
              fullWidth
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Reference number"
              value={recordForm.reference}
              onChange={(event) =>
                setRecordForm({ ...recordForm, reference: event.target.value })
              }
              fullWidth
            />
            <TextField
              label="Receipt URL"
              value={recordForm.receiptUrl}
              onChange={(event) =>
                setRecordForm({ ...recordForm, receiptUrl: event.target.value })
              }
              fullWidth
            />
            <TextField
              label="Notes"
              value={recordForm.notes}
              onChange={(event) =>
                setRecordForm({ ...recordForm, notes: event.target.value })
              }
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setRecordOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={
              createRecordState.isLoading ||
              updateRecordState.isLoading ||
              !recordForm.projectId ||
              Number(recordForm.amount) <= 0 ||
              !recordForm.paymentDate
            }
            onClick={() => void saveRecord()}
          >
            {createRecordState.isLoading || updateRecordState.isLoading
              ? "Saving..."
              : "Record Payment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

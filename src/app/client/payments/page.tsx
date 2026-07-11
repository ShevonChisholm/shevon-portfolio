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
  Link as MuiLink,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import {
  EmptyPanel,
  formatShortDate,
  PageIntro,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import type {
  ClientPaymentMilestone,
  ClientPaymentProjectBundle,
} from "@/lib/api/client-portal-api";
import {
  useCreateClientPaymentCheckoutSessionMutation,
  useGetClientPaymentsQuery,
} from "@/lib/api/client-portal-api";

function formatCurrency(value?: number | null, currency = "JMD") {
  return new Intl.NumberFormat("en-JM", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function milestoneStatus(milestone: ClientPaymentMilestone) {
  return milestone.calculated_status || milestone.status || "Not Due";
}

function payableMilestone(milestone: ClientPaymentMilestone) {
  const status = milestoneStatus(milestone);
  return (
    Boolean(milestone.id) &&
    (milestone.outstanding_amount ?? milestone.amount ?? 0) > 0 &&
    status !== "Paid" &&
    status !== "Waived" &&
    status !== "Cancelled"
  );
}

function allMilestones(bundle: ClientPaymentProjectBundle) {
  return bundle.summary.milestones?.length
    ? bundle.summary.milestones
    : bundle.milestones;
}

function firstCurrency(projects: ClientPaymentProjectBundle[]) {
  for (const bundle of projects) {
    const currency = allMilestones(bundle).find((item) => item.currency)?.currency;
    if (currency) return currency;
  }

  return "JMD";
}

export default function ClientPaymentsPage() {
  const theme = useTheme();
  const [selected, setSelected] = useState<{
    bundle: ClientPaymentProjectBundle;
    milestone: ClientPaymentMilestone;
  } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const { data, error, isLoading, isFetching, refetch } = useGetClientPaymentsQuery();
  const [createCheckoutSession, checkoutState] =
    useCreateClientPaymentCheckoutSessionMutation();
  const projects = data?.projects ?? [];
  const loading = isLoading || isFetching;
  const currency = firstCurrency(projects);

  const totals = useMemo(() => {
    return projects.reduce(
      (acc, bundle) => {
        const summary = bundle.summary;
        const milestones = allMilestones(bundle);
        acc.total += summary.total_project_value ?? summary.total_milestone_amount ?? 0;
        acc.paid += summary.total_paid ?? 0;
        acc.outstanding += summary.total_outstanding ?? 0;
        acc.overdue += summary.overdue_amount ?? 0;
        acc.milestones += summary.milestones_count ?? milestones.length;
        acc.paidMilestones +=
          summary.paid_milestones_count ??
          milestones.filter((milestone) => milestoneStatus(milestone) === "Paid").length;
        return acc;
      },
      {
        total: 0,
        paid: 0,
        outstanding: 0,
        overdue: 0,
        milestones: 0,
        paidMilestones: 0,
      }
    );
  }, [projects]);

  const handlePay = async () => {
    if (!selected?.milestone.id) return;

    try {
      const origin = window.location.origin;
      const result = await createCheckoutSession({
        id: selected.milestone.id,
        body: {
          success_url: `${origin}/client/payments?payment=success`,
          cancel_url: `${origin}/client/payments?payment=cancelled`,
        },
      }).unwrap();

      if (result.checkout_url) {
        window.location.assign(result.checkout_url);
        return;
      }

      setMessage({
        type: "error",
        text: "The API did not return a checkout link for this milestone.",
      });
    } catch (mutationError) {
      setMessage({
        type: "error",
        text:
          mutationError instanceof Error
            ? mutationError.message
            : "Could not start checkout for this milestone.",
      });
    }
  };

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Payments"
        title="Payment Schedule"
        description="Review project payment milestones, track what has been paid, and start checkout for outstanding items."
        action={
          <Button variant="outlined" onClick={() => refetch()} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {message && <Alert severity={message.type}>{message.text}</Alert>}

      {error && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Payment information could not be loaded from the NestJS API.
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        <PortalStatCard
          icon={<AccountBalanceWalletOutlinedIcon />}
          label="Total Value"
          value={formatCurrency(totals.total, currency)}
          tone="blue"
          loading={loading}
        />
        <PortalStatCard
          icon={<PaymentsOutlinedIcon />}
          label="Paid"
          value={formatCurrency(totals.paid, currency)}
          tone="green"
          loading={loading}
        />
        <PortalStatCard
          icon={<CreditCardOutlinedIcon />}
          label="Outstanding"
          value={formatCurrency(totals.outstanding, currency)}
          tone="amber"
          loading={loading}
        />
        <PortalStatCard
          icon={<WarningAmberOutlinedIcon />}
          label="Overdue"
          value={formatCurrency(totals.overdue, currency)}
          tone={totals.overdue > 0 ? "red" : "green"}
          loading={loading}
        />
      </Box>

      {loading ? (
        <Stack spacing={2}>
          <Skeleton height={132} />
          <Skeleton height={280} />
        </Stack>
      ) : projects.length === 0 ? (
        <PortalPanel title="Payments">
          <EmptyPanel
            title="No payments"
            message="Payment information will appear here once your project has milestones."
          />
        </PortalPanel>
      ) : (
        <Stack spacing={2}>
          {projects.map((bundle) => {
            const milestones = allMilestones(bundle);
            const nextDue = bundle.summary.next_payment_due;

            return (
              <PortalPanel
                key={bundle.project.id}
                title={bundle.project.title || bundle.project.name || "Project payments"}
                action={<StatusChip status={bundle.summary.payment_status} />}
              >
                <Box sx={{ p: 2.25 }}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.5}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: { md: "center" },
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography sx={{ color: "text.secondary" }}>
                        {bundle.project.description ||
                          bundle.project.summary ||
                          "Milestone-based project payments."}
                      </Typography>
                      {nextDue && (
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center", mt: 1.25, flexWrap: "wrap", gap: 1 }}
                        >
                          <EventAvailableOutlinedIcon
                            sx={{ color: "primary.main", fontSize: 18 }}
                          />
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Next due: {nextDue.title || "Payment"} on{" "}
                            {formatShortDate(nextDue.due_date)}
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                      <Chip
                        label={`${bundle.summary.paid_milestones_count ?? 0}/${
                          bundle.summary.milestones_count ?? milestones.length
                        } paid`}
                        variant="outlined"
                        sx={{ fontWeight: 850 }}
                      />
                      <Chip
                        label={`${formatCurrency(
                          bundle.summary.total_outstanding,
                          currency
                        )} outstanding`}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 850 }}
                      />
                    </Stack>
                  </Stack>

                  <Typography sx={{ fontWeight: 950, mb: 1.3 }}>
                    Payment Schedule
                  </Typography>
                  {milestones.length ? (
                    <Stack spacing={1.25}>
                      {milestones.map((milestone) => (
                        <Box
                          key={milestone.id}
                          sx={{
                            p: 1.6,
                            borderRadius: 2,
                            border: `1px solid ${alpha(
                              theme.palette.text.secondary,
                              0.13
                            )}`,
                            backgroundColor: alpha(theme.palette.common.white, 0.035),
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={1.5}
                            sx={{
                              justifyContent: "space-between",
                              alignItems: { md: "center" },
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 950 }}>
                                {milestone.title || "Payment milestone"}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                {formatCurrency(
                                  milestone.outstanding_amount ?? milestone.amount,
                                  milestone.currency ?? currency
                                )}{" "}
                                due
                                {milestone.due_date
                                  ? ` Â· Due ${formatShortDate(milestone.due_date)}`
                                  : ""}
                              </Typography>
                              {milestone.description && (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mt: 0.75 }}
                                >
                                  {milestone.description}
                                </Typography>
                              )}
                            </Box>
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}
                            >
                              <StatusChip status={milestoneStatus(milestone)} />
                              {payableMilestone(milestone) && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<CreditCardOutlinedIcon />}
                                  onClick={() => setSelected({ bundle, milestone })}
                                >
                                  Pay
                                </Button>
                              )}
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <EmptyPanel
                      title="No payment milestones"
                      message="Your payment schedule will appear here once milestones are added."
                    />
                  )}

                  <Typography sx={{ fontWeight: 950, mt: 3, mb: 1.3 }}>
                    Payment History
                  </Typography>
                  {bundle.records.length ? (
                    <Stack spacing={1}>
                      {bundle.records.map((record) => (
                        <Box
                          key={record.id}
                          sx={{
                            px: 1.6,
                            py: 1.35,
                            borderRadius: 2,
                            border: `1px solid ${alpha(
                              theme.palette.text.secondary,
                              0.13
                            )}`,
                            backgroundColor: alpha(theme.palette.common.white, 0.035),
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            sx={{
                              justifyContent: "space-between",
                              alignItems: { sm: "center" },
                            }}
                          >
                            <Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }}>
                              <ReceiptLongOutlinedIcon sx={{ color: "success.main" }} />
                              <Box>
                                <Typography sx={{ fontWeight: 950, color: "success.main" }}>
                                  {formatCurrency(record.amount_paid, currency)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                  {record.payment_method || "Payment"} Â·{" "}
                                  {formatShortDate(record.payment_date)}
                                </Typography>
                                {record.reference_number && (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "text.secondary", display: "block" }}
                                  >
                                    Ref: {record.reference_number}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                            {record.receipt_url && (
                              <Button
                                component={MuiLink}
                                href={record.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                endIcon={<OpenInNewOutlinedIcon />}
                              >
                                Receipt
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <EmptyPanel
                      title="No payment history"
                      message="Recorded payments and receipts will appear here."
                    />
                  )}
                </Box>
              </PortalPanel>
            );
          })}
        </Stack>
      )}

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.text.secondary, 0.16)}`,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>Make a Payment</DialogTitle>
        <DialogContent>
          {selected && (
            <Stack spacing={1.4}>
              <Typography sx={{ color: "text.secondary" }}>
                You will be redirected to a secure checkout for this milestone.
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.common.white, 0.05),
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Project
                </Typography>
                <Typography sx={{ fontWeight: 900 }}>
                  {selected.bundle.project.title || selected.bundle.project.name || "Project"}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.common.white, 0.05),
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Milestone
                </Typography>
                <Typography sx={{ fontWeight: 900 }}>
                  {selected.milestone.title || "Payment milestone"}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Amount Due
                </Typography>
                <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 950 }}>
                  {formatCurrency(
                    selected.milestone.outstanding_amount ?? selected.milestone.amount,
                    selected.milestone.currency ?? currency
                  )}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setSelected(null)} disabled={checkoutState.isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<CreditCardOutlinedIcon />}
            onClick={handlePay}
            disabled={checkoutState.isLoading}
          >
            {checkoutState.isLoading ? "Starting..." : "Continue to Checkout"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

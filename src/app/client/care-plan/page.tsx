"use client";

import { Alert, Box, Button, Skeleton, Stack, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import {
  EmptyPanel,
  formatShortDate,
  PageIntro,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import { useListClientCarePlansQuery } from "@/lib/api/client-portal-api";

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("en-JM", {
    style: "currency",
    currency: "JMD",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export default function ClientCarePlanPage() {
  const theme = useTheme();
  const { data: plans = [], error, isLoading, isFetching, refetch } =
    useListClientCarePlansQuery();
  const active = plans.filter((plan) => plan.status === "Active").length;
  const monthly = plans.reduce((sum, plan) => sum + (plan.monthly_amount ?? 0), 0);
  const nextRenewal = plans
    .map((plan) => plan.renewal_date)
    .filter(Boolean)
    .sort()[0];

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Care Plan"
        title="Care Plan Coverage"
        description="Review your active maintenance and support coverage after launch."
      />
      {error && <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>Could not load care plan details.</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
        <PortalStatCard icon={<HandshakeOutlinedIcon />} label="Active Plans" value={active} tone="green" loading={isLoading || isFetching} />
        <PortalStatCard icon={<PaymentsOutlinedIcon />} label="Monthly Coverage" value={formatCurrency(monthly)} tone="primary" loading={isLoading || isFetching} />
        <PortalStatCard icon={<CalendarMonthOutlinedIcon />} label="Next Renewal" value={formatShortDate(nextRenewal)} tone="blue" loading={isLoading || isFetching} />
      </Box>
      <PortalPanel title="Plan Details">
        {isLoading ? (
          <Stack sx={{ p: 2 }} spacing={1}>{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} height={82} />)}</Stack>
        ) : plans.length ? (
          <Box>
            {plans.map((plan) => (
              <Box key={plan.id} sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.11)}` }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                  <Box>
                    <Typography sx={{ fontWeight: 950 }}>Care plan subscription</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Started {formatShortDate(plan.start_date)} · Renews {formatShortDate(plan.renewal_date)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <StatusChip status={plan.status} />
                    <Typography sx={{ fontWeight: 900 }}>{formatCurrency(plan.monthly_amount)}</Typography>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyPanel title="No care plan yet" message="Care plan subscriptions will appear here when active." />
        )}
      </PortalPanel>
    </Stack>
  );
}

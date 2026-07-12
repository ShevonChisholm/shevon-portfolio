"use client";

import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SvgIconComponent } from "@mui/icons-material";
import {
  ArrowForward as ArrowForwardIcon,
  AssignmentTurnedInOutlined as AssignmentTurnedInOutlinedIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  EventBusyOutlined as EventBusyOutlinedIcon,
  Inventory2Outlined as Inventory2OutlinedIcon,
  MonetizationOnOutlined as MonetizationOnOutlinedIcon,
  NotificationsNoneOutlined as NotificationsNoneOutlinedIcon,
  PeopleAltOutlined as PeopleAltOutlinedIcon,
  PersonAddAltOutlined as PersonAddAltOutlinedIcon,
  TrendingUpOutlined as TrendingUpOutlinedIcon,
  WorkspacePremiumOutlined as WorkspacePremiumOutlinedIcon,
} from "@mui/icons-material";
import {
  useGetCrmSummaryQuery,
  useListAdminAccessLogsQuery,
} from "@/lib/api/admin-api";
import { useListLeadsQuery, type Lead } from "@/lib/api/leads-api";

type DashboardMetric = {
  label: string;
  value: string | number;
  icon: SvgIconComponent;
  color: string;
};

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number") return "JMD 0";
  return new Intl.NumberFormat("en-JM", {
    style: "currency",
    currency: "JMD",
    maximumFractionDigits: 0,
  }).format(value);
}

function timeAgo(value?: string | null) {
  if (!value) return "Recently";
  const milliseconds = Date.now() - new Date(value).getTime();
  const days = Math.max(0, Math.floor(milliseconds / 86_400_000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function leadName(lead: Lead) {
  return lead.business_name || lead.full_name || lead.email || "Unnamed inquiry";
}

function statusColor(status?: string | null) {
  const normalized = status?.toLowerCase() ?? "";
  if (normalized.includes("won")) return "success" as const;
  if (normalized.includes("lost") || normalized.includes("archived")) return "error" as const;
  if (normalized.includes("proposal")) return "warning" as const;
  if (normalized.includes("discovery")) return "secondary" as const;
  return "info" as const;
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  const theme = useTheme();
  const Icon = metric.icon;

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: 2,
        border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.78),
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          display: "grid",
          placeItems: "center",
          borderRadius: 1,
          color: metric.color,
          bgcolor: alpha(metric.color, 0.12),
          mb: 1.4,
        }}
      >
        <Icon sx={{ fontSize: 19 }} />
      </Box>
      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: { xs: "1.45rem", lg: "1.6rem" },
          fontWeight: 900,
          lineHeight: 1.05,
          overflowWrap: "anywhere",
        }}
      >
        {metric.value}
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: "0.76rem", mt: 0.5 }}>
        {metric.label}
      </Typography>
    </Paper>
  );
}

function AttentionCard({
  title,
  detail,
  value,
  href,
  icon: Icon,
  color,
}: {
  title: string;
  detail: string;
  value: number;
  href: string;
  icon: SvgIconComponent;
  color: string;
}) {
  const theme = useTheme();

  return (
    <Paper
      component={Link}
      href={href}
      elevation={0}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        color: "inherit",
        textDecoration: "none",
        border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.78),
        transition: "border-color 160ms ease, transform 160ms ease",
        "&:hover": {
          borderColor: alpha(color, 0.5),
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box sx={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 1, color, bgcolor: alpha(color, 0.12), flexShrink: 0 }}>
        <Icon sx={{ fontSize: 19 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.8} sx={{ alignItems: "baseline" }}>
          <Typography sx={{ fontWeight: 900, fontSize: "0.86rem" }}>{title}</Typography>
          <Typography sx={{ color, fontWeight: 900, fontSize: "0.8rem" }}>{value}</Typography>
        </Stack>
        <Typography sx={{ color: "text.secondary", fontSize: "0.72rem", mt: 0.2 }}>{detail}</Typography>
      </Box>
      <ArrowForwardIcon sx={{ color: "text.secondary", fontSize: 17 }} />
    </Paper>
  );
}

export default function AdminDashboard() {
  const theme = useTheme();
  const summaryQuery = useGetCrmSummaryQuery();
  const leadsQuery = useListLeadsQuery({ page: 1, limit: 5, sort_by: "created_at", sort_order: "desc", archived: "false" });
  const activityQuery = useListAdminAccessLogsQuery({ page: 1, limit: 5, sort_by: "created_at", sort_order: "desc" });
  const summary = summaryQuery.data;

  const metrics: DashboardMetric[] = summary
    ? [
        { label: "New Leads", value: summary.new_leads, icon: PersonAddAltOutlinedIcon, color: "#60A5FA" },
        { label: "Contacted", value: summary.contacted_leads, icon: PeopleAltOutlinedIcon, color: "#22D3EE" },
        { label: "Discovery Done", value: summary.discovery_completed, icon: CheckCircleOutlineIcon, color: "#818CF8" },
        { label: "Proposals Pending", value: summary.proposals_sent, icon: DescriptionOutlinedIcon, color: "#C084FC" },
        { label: "Pipeline Value", value: formatCurrency(summary.estimated_pipeline_value), icon: MonetizationOnOutlinedIcon, color: theme.palette.primary.main },
        { label: "Won", value: summary.won_leads, icon: WorkspacePremiumOutlinedIcon, color: "#34D399" },
        { label: "Lost", value: summary.lost_leads, icon: EventBusyOutlinedIcon, color: "#F87171" },
        { label: "Overdue Follow-ups", value: summary.overdue_follow_ups, icon: CalendarMonthOutlinedIcon, color: "#FBBF24" },
        { label: "Active Packages", value: summary.active_service_packages, icon: Inventory2OutlinedIcon, color: "#FB923C" },
        { label: "Active Care Plans", value: summary.active_care_plans, icon: NotificationsNoneOutlinedIcon, color: "#2DD4BF" },
        { label: "Accepted Proposals", value: summary.accepted_proposals, icon: AssignmentTurnedInOutlinedIcon, color: "#A78BFA" },
        { label: "Clients From Wins", value: summary.won_leads_linked_to_clients, icon: TrendingUpOutlinedIcon, color: "#4ADE80" },
      ]
    : [];

  return (
    <Stack spacing={3.5}>
      <Box>
        <Typography component="h1" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: { xs: "1.9rem", md: "2.25rem" }, fontWeight: 900, lineHeight: 1.1 }}>
          Dashboard
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 0.7 }}>
          Overview of your leads, pipeline, and delivery operations.
        </Typography>
      </Box>

      {(summaryQuery.isError || leadsQuery.isError || activityQuery.isError) && (
        <Alert severity="warning">
          Some dashboard data could not be loaded. Confirm the NestJS API is running and your admin role has the required permissions.
        </Alert>
      )}

      <Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
          <NotificationsNoneOutlinedIcon sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography component="h2" sx={{ fontWeight: 900, fontSize: "1rem" }}>Needs Your Attention</Typography>
        </Stack>
        {summaryQuery.isLoading ? (
          <Grid container spacing={1.5}>{[0, 1, 2, 3].map((item) => <Grid key={item} size={{ xs: 12, md: 6, xl: 3 }}><Skeleton variant="rounded" height={76} /></Grid>)}</Grid>
        ) : summary ? (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6, xl: 3 }}><AttentionCard title="New Leads" detail="New inquiries awaiting response" value={summary.new_leads} href="/admin/leads" icon={PersonAddAltOutlinedIcon} color="#60A5FA" /></Grid>
            <Grid size={{ xs: 12, md: 6, xl: 3 }}><AttentionCard title="Overdue Follow-ups" detail="Follow-ups past their due date" value={summary.overdue_follow_ups} href="/admin/follow-ups" icon={EventBusyOutlinedIcon} color="#F87171" /></Grid>
            <Grid size={{ xs: 12, md: 6, xl: 3 }}><AttentionCard title="Proposals Sent" detail="Proposals awaiting a decision" value={summary.proposals_sent} href="/admin/proposals" icon={DescriptionOutlinedIcon} color="#C084FC" /></Grid>
            <Grid size={{ xs: 12, md: 6, xl: 3 }}><AttentionCard title="Due Today" detail="Follow-ups scheduled today" value={summary.follow_ups_due_today} href="/admin/follow-ups" icon={CalendarMonthOutlinedIcon} color="#FBBF24" /></Grid>
          </Grid>
        ) : null}
      </Box>

      {summaryQuery.isLoading ? (
        <Grid container spacing={1.5}>{Array.from({ length: 12 }).map((_, item) => <Grid key={item} size={{ xs: 6, md: 4, xl: 3 }}><Skeleton variant="rounded" height={132} /></Grid>)}</Grid>
      ) : (
        <Grid container spacing={1.5}>
          {metrics.map((metric) => <Grid key={metric.label} size={{ xs: 6, md: 4, xl: 3 }}><MetricCard metric={metric} /></Grid>)}
        </Grid>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ height: "100%", overflow: "hidden", border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`, bgcolor: alpha(theme.palette.background.paper, 0.78) }}>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", p: 2, borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
              <Typography component="h2" sx={{ fontWeight: 900 }}>Recent Inquiries</Typography>
              <Button component={Link} href="/admin/leads" size="small">View all</Button>
            </Stack>
            {leadsQuery.isLoading ? <Stack spacing={1} sx={{ p: 2 }}>{[0, 1, 2, 3].map((item) => <Skeleton key={item} height={48} />)}</Stack> : (leadsQuery.data?.data ?? []).length ? (leadsQuery.data?.data ?? []).map((lead) => (
              <Stack key={lead.id} component={Link} href="/admin/leads" direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between", p: 2, color: "inherit", textDecoration: "none", borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.08)}`, "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                <Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ fontWeight: 850, fontSize: "0.86rem" }}>{leadName(lead)}</Typography><Typography noWrap sx={{ color: "text.secondary", fontSize: "0.72rem" }}>{lead.source || "Portfolio"} · {timeAgo(lead.created_at)}</Typography></Box>
                <Chip label={lead.status || "New Lead"} color={statusColor(lead.status)} variant="outlined" size="small" />
              </Stack>
            )) : <Typography sx={{ color: "text.secondary", p: 3, textAlign: "center" }}>No recent inquiries.</Typography>}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ height: "100%", overflow: "hidden", border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`, bgcolor: alpha(theme.palette.background.paper, 0.78) }}>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", p: 2, borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
              <Typography component="h2" sx={{ fontWeight: 900 }}>Recent Admin Activity</Typography>
              <Chip label="Audit trail" size="small" variant="outlined" />
            </Stack>
            {activityQuery.isLoading ? <Stack spacing={1} sx={{ p: 2 }}>{[0, 1, 2, 3].map((item) => <Skeleton key={item} height={48} />)}</Stack> : (activityQuery.data?.data ?? []).length ? (activityQuery.data?.data ?? []).map((activity) => (
              <Box key={activity.id} sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.08)}` }}>
                <Typography sx={{ fontWeight: 850, fontSize: "0.86rem" }}>{activity.description || activity.action}</Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.72rem", mt: 0.3 }}>{activity.admin_email || activity.resource || "Admin"} · {timeAgo(activity.created_at)}</Typography>
              </Box>
            )) : <Typography sx={{ color: "text.secondary", p: 3, textAlign: "center" }}>No recent activity.</Typography>}
          </Paper>
        </Grid>
      </Grid>

      <Box>
        <Typography component="h2" sx={{ fontWeight: 900, mb: 1.5 }}>Quick Actions</Typography>
        <Grid container spacing={1.5}>
          {[
            { label: "Review Leads", href: "/admin/leads", icon: PersonAddAltOutlinedIcon },
            { label: "Manage Proposals", href: "/admin/proposals", icon: DescriptionOutlinedIcon },
            { label: "Client Projects", href: "/admin/client-projects", icon: AssignmentTurnedInOutlinedIcon },
            { label: "Service Packages", href: "/admin/packages", icon: Inventory2OutlinedIcon },
          ].map((action) => {
            const Icon = action.icon;
            return <Grid key={action.label} size={{ xs: 12, sm: 6, xl: 3 }}><Button component={Link} href={action.href} color="inherit" endIcon={<ArrowForwardIcon />} sx={{ width: "100%", minHeight: 58, justifyContent: "space-between", px: 2, border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`, bgcolor: alpha(theme.palette.background.paper, 0.78), "&:hover": { color: "primary.main", borderColor: alpha(theme.palette.primary.main, 0.45) } }}><Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }}><Icon sx={{ color: "primary.main", fontSize: 19 }} /><span>{action.label}</span></Stack></Button></Grid>;
          })}
        </Grid>
      </Box>
    </Stack>
  );
}

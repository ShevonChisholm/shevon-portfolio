"use client";

import Link from "next/link";
import { Alert, Box, Button, Skeleton, Stack, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import {
  EmptyPanel,
  formatShortDate,
  PageIntro,
  PortalActionCard,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import { useGetClientDashboardQuery } from "@/lib/api/client-portal-api";

export default function ClientDashboardPage() {
  const theme = useTheme();
  const { data, error, isLoading, isFetching, refetch } = useGetClientDashboardQuery();
  const loading = isLoading || isFetching;

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Client Portal"
        title={`Welcome${data?.client?.name ? `, ${data.client.name}` : ""}`}
        description="Track your project, review requests, submit assets, and keep delivery moving from one workspace."
      />

      {error && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Could not load your client dashboard from the NestJS API.
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
          icon={<FolderOutlinedIcon />}
          label="Projects"
          value={data?.project_count ?? 0}
          loading={loading}
          tone="blue"
        />
        <PortalStatCard
          icon={<TaskAltOutlinedIcon />}
          label="Pending Tasks"
          value={data?.pending_tasks_count ?? 0}
          loading={loading}
          tone="amber"
        />
        <PortalStatCard
          icon={<ImageOutlinedIcon />}
          label="Assets Needed"
          value={data?.missing_required_assets_count ?? 0}
          loading={loading}
          tone="red"
        />
        <PortalStatCard
          icon={<AssignmentTurnedInOutlinedIcon />}
          label="Approvals"
          value={data?.pending_approvals_count ?? 0}
          loading={loading}
          tone="purple"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1.25fr 0.75fr" },
          gap: 2,
        }}
      >
        <PortalPanel
          title="Active Project"
          action={<Button component={Link} href="/client/project" size="small">Open</Button>}
        >
          {loading ? (
            <Stack sx={{ p: 2 }} spacing={1}>
              <Skeleton height={36} />
              <Skeleton height={72} />
            </Stack>
          ) : data?.primary_active_project ? (
            <Box sx={{ p: 2.25 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 950 }}>
                    {data.primary_active_project.title ||
                      data.primary_active_project.name ||
                      "Client project"}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", mt: 0.6 }}>
                    {data.primary_active_project.current_stage ||
                      data.primary_active_project.summary ||
                      "Project delivery is in progress."}
                  </Typography>
                </Box>
                <StatusChip status={data.primary_active_project.status} />
              </Stack>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Estimated completion:{" "}
                  {formatShortDate(data.primary_active_project.estimated_completion_date)}
                </Typography>
              </Box>
            </Box>
          ) : (
            <EmptyPanel
              title="No active project yet"
              message="Your active project will appear here once it is available."
            />
          )}
        </PortalPanel>

        <PortalPanel title="Next Best Action">
          <Box sx={{ p: 2.25 }}>
            <Typography sx={{ fontWeight: 950 }}>
              {data?.next_best_action?.title || "Stay ready for the next step"}
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 0.75 }}>
              {data?.next_best_action?.description ||
                "Tasks, approvals, payments, and document requests will show here when action is needed."}
            </Typography>
            {data?.upcoming_payment_summary && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 1.5,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                }}
              >
                <Typography sx={{ fontWeight: 900 }}>
                  {data.upcoming_payment_summary.title || "Upcoming payment"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Due {formatShortDate(data.upcoming_payment_summary.due_date)}
                </Typography>
              </Box>
            )}
          </Box>
        </PortalPanel>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 1.5,
        }}
      >
        <PortalActionCard
          href="/client/tasks"
          icon={<TaskAltOutlinedIcon />}
          title="Review Tasks"
          description="Submit work and notes"
          tone="amber"
        />
        <PortalActionCard
          href="/client/approvals"
          icon={<AssignmentTurnedInOutlinedIcon />}
          title="Approvals"
          description="Approve or request changes"
          tone="purple"
        />
        <PortalActionCard
          href="/client/payments"
          icon={<CreditCardOutlinedIcon />}
          title="Payments"
          description="Review milestones"
          tone="green"
        />
        <PortalActionCard
          href="/client/assets"
          icon={<ImageOutlinedIcon />}
          title="Assets"
          description="Share files and links"
          tone="blue"
        />
        <PortalActionCard
          href="/client/documents"
          icon={<FolderOutlinedIcon />}
          title="Documents"
          description="Open project files"
          tone="primary"
        />
        <PortalActionCard
          href="/client/project"
          icon={<TimelineOutlinedIcon />}
          title="Timeline"
          description="See project progress"
          tone="indigo"
        />
      </Box>
    </Stack>
  );
}

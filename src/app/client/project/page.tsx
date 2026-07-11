"use client";

import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import {
  EmptyPanel,
  formatShortDate,
  PageIntro,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import {
  useGetClientPortalProjectQuery,
  useListClientPortalProjectsQuery,
} from "@/lib/api/client-portal-api";

export default function ClientProjectPage() {
  const theme = useTheme();
  const {
    data: projects,
    isLoading: loadingProjects,
    isFetching: fetchingProjects,
    error: projectsError,
    refetch,
  } = useListClientPortalProjectsQuery();
  const projectId = projects?.[0]?.id;
  const { data: detail, isLoading, isFetching } = useGetClientPortalProjectQuery(
    projectId ?? "",
    { skip: !projectId }
  );
  const loading = loadingProjects || fetchingProjects || isLoading || isFetching;
  const project = detail?.project ?? projects?.[0];
  const milestones = detail?.milestones ?? [];
  const updates = detail?.updates ?? [];

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Project Timeline"
        title={project?.title || project?.name || "Your Project"}
        description="Follow the current delivery stage, client-visible milestones, and recent project updates."
      />

      {projectsError && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          The project timeline could not be loaded.
        </Alert>
      )}

      {loading ? (
        <Stack spacing={2}>
          <Skeleton height={160} variant="rounded" />
          <Skeleton height={260} variant="rounded" />
        </Stack>
      ) : project ? (
        <>
          <PortalPanel title="Project Status">
            <Box sx={{ p: 2.25 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{ justifyContent: "space-between", alignItems: { md: "flex-start" } }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h5" sx={{ fontWeight: 950 }}>
                    {project.title || project.name}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", mt: 0.75 }}>
                    {project.description || project.summary || "Project delivery is underway."}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  <StatusChip status={project.status} />
                  <StatusChip status={project.payment_status} />
                </Stack>
              </Stack>
              <Box sx={{ mt: 2.5 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", mb: 0.75 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 850 }}>
                    {project.current_stage || "Current stage"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {project.progress_percent ?? 0}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={project.progress_percent ?? 0}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: alpha(theme.palette.common.white, 0.07),
                  }}
                />
              </Box>
            </Box>
          </PortalPanel>

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
              label="Milestones"
              value={milestones.length}
              tone="blue"
            />
            <PortalStatCard
              icon={<TimelineOutlinedIcon />}
              label="Updates"
              value={updates.length}
              tone="primary"
            />
            <PortalStatCard
              icon={<AssignmentTurnedInOutlinedIcon />}
              label="Tasks"
              value={detail?.tasks?.length ?? 0}
              tone="amber"
            />
            <PortalStatCard
              icon={<ImageOutlinedIcon />}
              label="Assets"
              value={detail?.assets?.length ?? 0}
              tone="purple"
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            <PortalPanel title="Milestones">
              {milestones.length ? (
                <Box>
                  {milestones.map((milestone) => (
                    <Box
                      key={String(milestone.id)}
                      sx={{
                        px: 2,
                        py: 1.75,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.text.secondary,
                          0.11
                        )}`,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 950 }}>
                            {String(milestone.title || "Milestone")}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {String(milestone.stage || "Stage")} Â·{" "}
                            {formatShortDate(String(milestone.start_date || ""))}
                          </Typography>
                        </Box>
                        <StatusChip status={String(milestone.status || "Pending")} />
                      </Stack>
                    </Box>
                  ))}
                </Box>
              ) : (
                <EmptyPanel
                  title="No visible milestones"
                  message="Milestones will appear here when shared with you."
                />
              )}
            </PortalPanel>

            <PortalPanel title="Project Updates">
              {updates.length ? (
                <Box>
                  {updates.map((update) => (
                    <Box
                      key={update.id}
                      sx={{
                        px: 2,
                        py: 1.75,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.text.secondary,
                          0.11
                        )}`,
                      }}
                    >
                      <Typography sx={{ fontWeight: 950 }}>{update.title}</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {update.description || "Project update"} Â·{" "}
                        {formatShortDate(update.created_at)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <EmptyPanel
                  title="No project updates"
                  message="Project updates will appear here when published."
                />
              )}
            </PortalPanel>
          </Box>
        </>
      ) : (
        <PortalPanel title="Project Timeline">
          <EmptyPanel
            title="No project found"
            message="Your active project will appear here once portal access is connected."
          />
        </PortalPanel>
      )}
    </Stack>
  );
}

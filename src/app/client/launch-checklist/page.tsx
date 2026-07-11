"use client";

import { useMemo } from "react";
import { Alert, Box, Button, LinearProgress, Skeleton, Stack, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import {
  EmptyPanel,
  PageIntro,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import {
  useListClientPortalProjectsQuery,
  useListClientProjectLaunchChecklistQuery,
} from "@/lib/api/client-portal-api";

export default function ClientLaunchChecklistPage() {
  const theme = useTheme();
  const { data: projects = [], error: projectsError } = useListClientPortalProjectsQuery();
  const projectId = projects[0]?.id;
  const { data: items = [], error, isLoading, isFetching, refetch } =
    useListClientProjectLaunchChecklistQuery(projectId ?? "", { skip: !projectId });
  const completed = items.filter((item) => item.completed).length;
  const required = items.length;
  const percent = required ? Math.round((completed / required) * 100) : 0;
  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category || "Launch").filter(Boolean))),
    [items]
  );

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Launch"
        title="Launch Checklist"
        description="See launch readiness items and what has already been completed."
      />
      {(error || projectsError) && <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>Could not load launch checklist.</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
        <PortalStatCard icon={<RocketLaunchOutlinedIcon />} label="Readiness" value={`${percent}%`} tone="primary" loading={isLoading || isFetching} />
        <PortalStatCard icon={<CheckCircleOutlineIcon />} label="Completed" value={completed} tone="green" loading={isLoading || isFetching} />
        <PortalStatCard icon={<TaskAltOutlinedIcon />} label="Checklist Items" value={required} tone="blue" loading={isLoading || isFetching} />
      </Box>
      <PortalPanel title="Launch Progress">
        <Box sx={{ p: 2 }}>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{ height: 8, borderRadius: 999, backgroundColor: alpha(theme.palette.common.white, 0.07) }}
          />
        </Box>
        {isLoading ? (
          <Stack sx={{ p: 2, pt: 0 }} spacing={1}>{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} height={64} />)}</Stack>
        ) : items.length ? (
          <Box>
            {categories.map((category) => (
              <Box key={category}>
                <Typography sx={{ px: 2, pt: 2, pb: 0.5, color: "text.secondary", fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase" }}>
                  {category}
                </Typography>
                {items.filter((item) => (item.category || "Launch") === category).map((item) => (
                  <Box key={item.id} sx={{ px: 2, py: 1.45, borderTop: `1px solid ${alpha(theme.palette.text.secondary, 0.1)}` }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
                      <Box>
                        <Typography sx={{ fontWeight: 950 }}>{item.title || "Launch item"}</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>{item.description || "No details yet"}</Typography>
                      </Box>
                      <StatusChip status={item.completed ? "Completed" : "Pending"} />
                    </Stack>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyPanel title="No checklist yet" message="Launch readiness items will appear here." />
        )}
      </PortalPanel>
    </Stack>
  );
}

"use client";

import { Container, Typography, useMediaQuery, useTheme } from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import { Work as WorkIcon } from "@mui/icons-material";
import { m as motion } from "framer-motion";
import type { ExperienceItem } from "@/types/cms";

type ExperienceClientProps = {
  experiences: ExperienceItem[];
};

export default function ExperienceClient({ experiences }: ExperienceClientProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 9, md: 15 }, px: { xs: 2.5, sm: 4, lg: 6 } }}>
      <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, letterSpacing: "0.12em" }}>
        Career
      </Typography>
      <Typography variant="h2" component="h2" sx={{ fontSize: { xs: "2.3rem", md: "4.4rem" }, lineHeight: 1.02, mb: { xs: 4, md: 7 } }}>
        Experience
      </Typography>

      {experiences.length === 0 ? (
        <Typography
          align="center"
          sx={{ color: "text.secondary", maxWidth: 640, mx: "auto", mt: 3 }}
        >
          Experience details are being updated.
        </Typography>
      ) : (
        <Timeline
          position={isMobile ? "right" : "alternate"}
          sx={{
            p: 0,
            [`& .MuiTimelineItem-root`]: {
              minHeight: "auto",
              "&:before": {
                [theme.breakpoints.down("sm")]: {
                  display: "none",
                },
              },
            },
            [`& .MuiTimelineContent-root`]: {
              px: { xs: 2, sm: 3 },
              py: 1,
            },
            [`& .MuiTimelineOppositeContent-root`]: {
              px: { xs: 1, sm: 3 },
              py: 1,
              flex: { xs: 0.2, sm: 0.4 },
            },
          }}
        >
          {experiences.map((exp, index) => (
            <TimelineItem key={exp.id}>
              <TimelineOppositeContent
                color="text.secondary"
                sx={{
                  typography: { xs: "body2", sm: "body1" },
                }}
              >
                {exp.period}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <TimelineDot color="primary" sx={{ borderRadius: 1 }}>
                    <WorkIcon />
                  </TimelineDot>
                </motion.div>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <motion.div
                  initial={{
                    opacity: 0,
                    x: isMobile ? 50 : index % 2 === 0 ? 50 : -50,
                  }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      lineHeight: { xs: 1.4, sm: 1.5 },
                      mb: 0.5,
                    }}
                  >
                    {exp.title}
                  </Typography>
                  <Typography
                    color="primary"
                    gutterBottom
                    sx={{
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      mb: 1,
                    }}
                  >
                    {exp.company}
                    {exp.location ? ` | ${exp.location}` : ""}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.813rem", sm: "0.875rem" },
                      lineHeight: { xs: 1.5, sm: 1.6 },
                    }}
                  >
                    {exp.description}
                  </Typography>
                </motion.div>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Container>
  );
}

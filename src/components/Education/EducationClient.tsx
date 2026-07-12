"use client";

import { Container, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import { School as SchoolIcon } from "@mui/icons-material";
import { m as motion } from "framer-motion";
import type { EducationItem } from "@/types/cms";
import { publicContainerSx } from "@/theme/layout";

type EducationClientProps = {
  educationItems: EducationItem[];
};

export default function EducationClient({
  educationItems,
}: EducationClientProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth="xl" sx={{ ...publicContainerSx, py: { xs: 9, md: 15 } }}>
      <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, letterSpacing: "0.12em" }}>
        Foundation
      </Typography>
      <Typography
        variant="h2"
        component="h2"
        sx={{
          fontSize: { xs: "2.3rem", md: "4.4rem" },
          lineHeight: 1.02,
          mb: { xs: 4, sm: 7 },
        }}
      >
        Education
      </Typography>

      {educationItems.length === 0 ? (
        <Typography
          align="center"
          sx={{ color: "text.secondary", maxWidth: 640, mx: "auto" }}
        >
          Education details are being updated.
        </Typography>
      ) : (
        <Timeline
          position={isMobile ? "right" : "alternate"}
          sx={{
            p: 0,
            [`& .MuiTimelineItem-root`]: {
              minHeight: { xs: "100px", sm: "120px" },
            },
            [`& .MuiTimelineContent-root`]: {
              py: { xs: 1, sm: 2 },
              px: { xs: 2, sm: 3 },
            },
            [`& .MuiTimelineOppositeContent-root`]: {
              flex: { xs: 0.2, sm: 1 },
              py: { xs: 1, sm: 2 },
            },
          }}
        >
          {educationItems.map((edu, index) => (
            <TimelineItem key={edu.id}>
              <TimelineOppositeContent
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {edu.period}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <TimelineDot color="primary" sx={{ borderRadius: 1 }}>
                    <SchoolIcon />
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
                      fontWeight: 600,
                    }}
                  >
                    {edu.degree}
                  </Typography>
                  <Typography
                    color="secondary"
                    gutterBottom
                    sx={{
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      mb: { xs: 0.5, sm: 1 },
                    }}
                  >
                    {edu.institution}
                    {edu.location ? ` | ${edu.location}` : ""}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                      lineHeight: { xs: 1.4, sm: 1.5 },
                    }}
                  >
                    {edu.description}
                  </Typography>
                  {edu.credential_url && (
                    <Link
                      href={edu.credential_url}
                      target="_blank"
                      rel="noreferrer"
                      underline="hover"
                      sx={{ display: "inline-block", mt: 1, fontWeight: 700 }}
                    >
                      View credential
                    </Link>
                  )}
                </motion.div>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Container>
  );
}

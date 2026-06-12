"use client";

import type { EducationItem, ExperienceItem } from "@/types/cms";
import {
  Box,
  Chip,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ArrowOutward as ArrowOutwardIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  WorkOutline as WorkOutlineIcon,
} from "@mui/icons-material";
import { m as motion } from "framer-motion";

type JourneyClientProps = {
  experiences: ExperienceItem[];
  educationItems: EducationItem[];
};

function SectionHeading({
  eyebrow,
  prefix,
  accent,
}: {
  eyebrow: string;
  prefix: string;
  accent: string;
}) {
  const theme = useTheme();

  return (
    <Box sx={{ mb: { xs: 4, md: 5 } }}>
      <Chip
        label={eyebrow}
        size="small"
        variant="outlined"
        sx={{
          height: 28,
          mb: 2,
          borderRadius: 4,
          color: "primary.main",
          borderColor: alpha(theme.palette.primary.main, 0.38),
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          fontSize: "0.65rem",
          fontWeight: 800,
        }}
      />
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: "2rem", sm: "2.25rem", md: "2.3rem" },
          lineHeight: 1.12,
          fontWeight: 800,
        }}
      >
        {prefix}{" "}
        <Box component="span" sx={{ color: "primary.main" }}>
          {accent}
        </Box>
      </Typography>
    </Box>
  );
}

function TimelineRow({
  icon,
  children,
  isLast,
  index,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  isLast: boolean;
  index: number;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "32px minmax(0, 1fr)", sm: "38px minmax(0, 1fr)" },
        columnGap: { xs: 1.5, sm: 2.2 },
        minWidth: 0,
      }}
    >
      <Box sx={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            width: 32,
            height: 32,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            color: "primary.main",
            bgcolor: theme.palette.background.default,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.45)}`,
            "& svg": { fontSize: 16 },
          }}
        >
          {icon}
        </Box>
        {!isLast && (
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              top: 32,
              bottom: -36,
              left: "50%",
              width: "1px",
              bgcolor: alpha(theme.palette.common.white, 0.11),
            }}
          />
        )}
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        style={{ minWidth: 0, width: "100%", paddingBottom: isLast ? 0 : 36 }}
      >
        {children}
      </motion.div>
    </Box>
  );
}

function Description({
  value,
  compact = false,
}: {
  value: string;
  compact?: boolean;
}) {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•*-]+/, "").trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return (
      <Typography
        sx={{
          mt: 2,
          color: "text.secondary",
          fontSize: compact ? "0.82rem" : "0.84rem",
          lineHeight: 1.7,
        }}
      >
        {value}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.05} sx={{ mt: 2 }}>
      {lines.map((line, index) => (
        <Box key={`${line}-${index}`} sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
          <Box
            aria-hidden="true"
            sx={{
              width: 3,
              height: 3,
              mt: "0.55rem",
              flexShrink: 0,
              borderRadius: "50%",
              bgcolor: "primary.main",
            }}
          />
          <Typography sx={{ color: "text.secondary", fontSize: "0.82rem", lineHeight: 1.6 }}>
            {line}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.55, minWidth: 0 }}>
      <Box sx={{ display: "grid", placeItems: "center", color: "text.secondary", "& svg": { fontSize: 13 } }}>
        {icon}
      </Box>
      <Typography sx={{ color: "text.secondary", fontSize: "0.64rem", whiteSpace: "nowrap" }}>
        {children}
      </Typography>
    </Box>
  );
}

function RecordCard({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        minWidth: 0,
        p: { xs: 2.25, sm: 2.75 },
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
        border: `1px solid ${alpha(theme.palette.common.white, 0.11)}`,
      }}
    >
      {children}
    </Paper>
  );
}

export default function JourneyClient({
  experiences,
  educationItems,
}: JourneyClientProps) {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 9, md: 12 },
        borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.12),
        overflow: "hidden",
      }}
    >
      <Container maxWidth={false} sx={{ width: "100%", maxWidth: 1040 }}>
        <Box component="section" id="experience" aria-labelledby="experience-heading">
          <Box id="experience-heading">
            <SectionHeading eyebrow="EXPERIENCE" prefix="Where I've" accent="worked" />
          </Box>

          {experiences.length === 0 ? (
            <Typography color="text.secondary">Experience details are being updated.</Typography>
          ) : (
            <Stack>
              {experiences.map((experience, index) => (
                <TimelineRow
                  key={experience.id}
                  index={index}
                  isLast={index === experiences.length - 1}
                  icon={<WorkOutlineIcon />}
                >
                  <RecordCard>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          component="h3"
                          sx={{
                            fontFamily: '"Montserrat", sans-serif',
                            fontSize: "0.9rem",
                            fontWeight: 800,
                          }}
                        >
                          {experience.title}
                        </Typography>
                        <Typography sx={{ mt: 0.25, color: "primary.main", fontSize: "0.82rem", fontWeight: 800 }}>
                          {experience.company}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.2 }}>
                        {experience.is_current && (
                          <Chip
                            label="Current"
                            size="small"
                            sx={{
                              height: 21,
                              borderRadius: 4,
                              color: "#26e58a",
                              bgcolor: alpha("#00c76f", 0.1),
                              border: `1px solid ${alpha("#00c76f", 0.28)}`,
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              "&::before": {
                                content: '""',
                                width: 5,
                                height: 5,
                                mr: 0.7,
                                borderRadius: "50%",
                                bgcolor: "#26e58a",
                              },
                            }}
                          />
                        )}
                        <MetaItem icon={<CalendarMonthOutlinedIcon />}>{experience.period}</MetaItem>
                        {experience.location && (
                          <MetaItem icon={<LocationOnOutlinedIcon />}>{experience.location}</MetaItem>
                        )}
                      </Box>
                    </Box>

                    <Description value={experience.description} />

                    {experience.employment_type && (
                      <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                        <Chip
                          label={experience.employment_type}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 22,
                            borderRadius: 1,
                            color: "text.secondary",
                            borderColor: alpha(theme.palette.common.white, 0.12),
                            fontSize: "0.62rem",
                          }}
                        />
                      </Box>
                    )}
                  </RecordCard>
                </TimelineRow>
              ))}
            </Stack>
          )}
        </Box>

        <Box
          component="section"
          id="education"
          aria-labelledby="education-heading"
          sx={{
            mt: { xs: 8, md: 10 },
            pt: { xs: 7, md: 8 },
            borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
          }}
        >
          <Box id="education-heading">
            <SectionHeading eyebrow="EDUCATION" prefix="Academic" accent="background" />
          </Box>

          {educationItems.length === 0 ? (
            <Typography color="text.secondary">Education details are being updated.</Typography>
          ) : (
            <Stack>
              {educationItems.map((education, index) => (
                <TimelineRow
                  key={education.id}
                  index={index}
                  isLast={index === educationItems.length - 1}
                  icon={<SchoolOutlinedIcon />}
                >
                  <RecordCard>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          component="h3"
                          sx={{
                            fontFamily: '"Montserrat", sans-serif',
                            fontSize: "0.9rem",
                            fontWeight: 800,
                          }}
                        >
                          {education.degree}
                        </Typography>
                        <Typography sx={{ mt: 0.45, color: "primary.main", fontSize: "0.78rem", fontWeight: 700 }}>
                          {education.institution}
                        </Typography>
                      </Box>

                      <Stack spacing={0.7} sx={{ alignItems: { xs: "flex-start", sm: "flex-end" } }}>
                        <MetaItem icon={<CalendarMonthOutlinedIcon />}>{education.period}</MetaItem>
                        {education.location && (
                          <MetaItem icon={<LocationOnOutlinedIcon />}>{education.location}</MetaItem>
                        )}
                      </Stack>
                    </Box>

                    <Description value={education.description} compact />

                    {education.credential_url && (
                      <Link
                        href={education.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        underline="none"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          mt: 2,
                          color: "primary.main",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                        }}
                      >
                        View credential <ArrowOutwardIcon sx={{ fontSize: 14 }} />
                      </Link>
                    )}
                  </RecordCard>
                </TimelineRow>
              ))}
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
}

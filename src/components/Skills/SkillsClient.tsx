"use client";

import type { ReactElement } from "react";
import type { SkillCategoryWithSkills } from "@/types/cms";
import {
  Box,
  Chip,
  Container,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Api as BackendIcon,
  BuildOutlined as ToolsIcon,
  CloudOutlined as CloudIcon,
  CreditCardOutlined as PaymentsIcon,
  DevicesOutlined as WebIcon,
  PhoneAndroidOutlined as MobileIcon,
  PsychologyOutlined as DefaultIcon,
  SecurityOutlined as SecurityIcon,
  StorageOutlined as DatabaseIcon,
} from "@mui/icons-material";
import { m as motion } from "framer-motion";
import { publicContainerSx } from "@/theme/layout";

type SkillsClientProps = {
  skillCategories: SkillCategoryWithSkills[];
};

const iconMap: Record<string, ReactElement> = {
  web: <WebIcon />,
  frontend: <WebIcon />,
  mobile: <MobileIcon />,
  backend: <BackendIcon />,
  api: <BackendIcon />,
  database: <DatabaseIcon />,
  data: <DatabaseIcon />,
  payments: <PaymentsIcon />,
  integrations: <PaymentsIcon />,
  security: <SecurityIcon />,
  access: <SecurityIcon />,
  cloud: <CloudIcon />,
  deployment: <CloudIcon />,
  infrastructure: <CloudIcon />,
  tools: <ToolsIcon />,
  workflow: <ToolsIcon />,
};

const descriptionMap: Record<string, string> = {
  web: "Building responsive, high-performance user interfaces",
  frontend: "Building responsive, high-performance user interfaces",
  mobile: "Cross-platform mobile experiences with a native feel",
  backend: "Scalable APIs, business logic, and server-side architecture",
  api: "Scalable APIs, business logic, and server-side architecture",
  database: "Relational and document databases, schema design",
  data: "Relational and document databases, schema design",
  payments: "Payment flows, webhooks, and third-party API connections",
  integrations: "Payment flows, webhooks, and third-party API connections",
  security: "Authentication, role management, and secure workflows",
  access: "Authentication, role management, and secure workflows",
  cloud: "Cloud deployments, hosting, and environment management",
  deployment: "Cloud deployments, hosting, and environment management",
  infrastructure: "Cloud deployments, hosting, and environment management",
  tools: "Developer tooling, collaboration, and engineering practices",
  workflow: "Developer tooling, collaboration, and engineering practices",
};

function categoryKeys(category: SkillCategoryWithSkills) {
  return `${category.icon ?? ""} ${category.title}`
    .toLowerCase()
    .split(/[\s&,/+-]+/)
    .filter(Boolean);
}

function iconFor(category: SkillCategoryWithSkills) {
  const match = categoryKeys(category).find((key) => iconMap[key]);
  return match ? iconMap[match] : <DefaultIcon />;
}

function descriptionFor(category: SkillCategoryWithSkills) {
  const match = categoryKeys(category).find((key) => descriptionMap[key]);
  return match
    ? descriptionMap[match]
    : "Production-focused technologies and practical engineering skills";
}

export default function SkillsClient({ skillCategories }: SkillsClientProps) {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="skills"
      sx={{
        py: { xs: 9, md: 12 },
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
      }}
    >
      <Container maxWidth="xl" sx={publicContainerSx}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "flex-end" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: 2.5,
            mb: { xs: 4.5, md: 5.5 },
          }}
        >
          <Box>
            <Chip
              label="SKILLS"
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
              component="h2"
              sx={{
                fontSize: { xs: "2rem", sm: "2.25rem", md: "2.3rem" },
                lineHeight: 1.12,
                fontWeight: 800,
              }}
            >
              My technical{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                skill set
              </Box>
            </Typography>
          </Box>

          <Typography
            sx={{
              maxWidth: 300,
              color: "text.secondary",
              textAlign: { xs: "left", md: "right" },
              fontSize: "0.8rem",
              lineHeight: 1.55,
            }}
          >
            Production experience across the full stack
          </Typography>
        </Box>

        {skillCategories.length === 0 ? (
          <Typography sx={{ color: "text.secondary" }}>
            Skills are being updated.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gridAutoRows: "1fr",
              gap: { xs: 2, md: 2 },
              alignItems: "stretch",
            }}
          >
            {skillCategories.map((category, index) => {
              const highlighted = index < 2;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: index * 0.045 }}
                  style={{ display: "flex", width: "100%", minWidth: 0, height: "100%" }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      width: "100%",
                      minWidth: 0,
                      minHeight: { xs: 180, sm: 190 },
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      p: { xs: 2.25, sm: 2.4 },
                      borderRadius: 1.5,
                      bgcolor: highlighted
                        ? alpha(theme.palette.primary.main, 0.045)
                        : alpha(theme.palette.background.paper, 0.72),
                      border: `1px solid ${
                        highlighted
                          ? alpha(theme.palette.primary.main, 0.38)
                          : alpha(theme.palette.common.white, 0.11)
                      }`,
                      transition: "border-color 200ms ease, background-color 200ms ease, transform 200ms ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        borderColor: alpha(theme.palette.primary.main, 0.52),
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.4, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                          borderRadius: 1,
                          color: highlighted ? "primary.main" : "text.secondary",
                          bgcolor: highlighted
                            ? alpha(theme.palette.primary.main, 0.13)
                            : alpha(theme.palette.common.white, 0.055),
                          "& svg": { fontSize: 17 },
                        }}
                      >
                        {iconFor(category)}
                      </Box>

                      <Box sx={{ minWidth: 0, pt: 0.15 }}>
                        <Typography
                          component="h3"
                          sx={{
                            fontFamily: '"Montserrat", sans-serif',
                            fontSize: "0.82rem",
                            fontWeight: 800,
                            lineHeight: 1.3,
                          }}
                        >
                          {category.title}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.4,
                            color: "text.secondary",
                            fontSize: "0.61rem",
                            lineHeight: 1.45,
                          }}
                        >
                          {descriptionFor(category)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        my: 1.7,
                        width: "100%",
                        height: "1px",
                        bgcolor: alpha(theme.palette.common.white, 0.08),
                      }}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignContent: "flex-start",
                        gap: 0.7,
                        mt: "auto",
                        minWidth: 0,
                      }}
                    >
                      {category.skills.map((skill) => (
                        <Chip
                          key={skill.id}
                          label={skill.name}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 24,
                            maxWidth: "100%",
                            borderRadius: 1,
                            color: highlighted ? "primary.main" : "text.secondary",
                            bgcolor: highlighted
                              ? alpha(theme.palette.primary.main, 0.055)
                              : alpha(theme.palette.common.white, 0.025),
                            borderColor: highlighted
                              ? alpha(theme.palette.primary.main, 0.26)
                              : alpha(theme.palette.common.white, 0.12),
                            fontSize: "0.62rem",
                            fontWeight: 600,
                            "& .MuiChip-label": {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </motion.div>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}

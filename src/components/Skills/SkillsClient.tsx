"use client";

import type { ReactElement } from "react";
import {
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Api as BackendIcon,
  Cloud as CloudIcon,
  Payment as PaymentsIcon,
  PhoneAndroid as MobileIcon,
  Psychology as DefaultIcon,
  Storage as DatabaseIcon,
  Web as WebIcon,
} from "@mui/icons-material";
import { m as motion } from "framer-motion";
import type { SkillCategoryWithSkills } from "@/types/cms";

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
  cloud: <CloudIcon />,
  tools: <CloudIcon />,
};

function iconFor(icon: string | null) {
  if (!icon) return <DefaultIcon />;

  return iconMap[icon.toLowerCase().trim()] ?? <DefaultIcon />;
}

export default function SkillsClient({ skillCategories }: SkillsClientProps) {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" id="skills" sx={{ py: { xs: 5, md: 8 } }}>
      <Typography
        variant="h2"
        component="h2"
        align="center"
        gutterBottom
        sx={{ mb: { xs: 3, md: 4 } }}
      >
        Skills
      </Typography>

      {skillCategories.length === 0 ? (
        <Typography
          align="center"
          sx={{ color: "text.secondary", maxWidth: 640, mx: "auto" }}
        >
          Skills are being updated.
        </Typography>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: "stretch" }}>
          {skillCategories.map((category, index) => (
            <Grid
              key={category.id}
              size={{ xs: 12, sm: 6, lg: 4 }}
              sx={{ display: "flex" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                style={{ display: "flex", width: "100%" }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    minHeight: { xs: 168, sm: 174 },
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    transition:
                      "border-color 250ms ease, box-shadow 250ms ease, transform 250ms ease",
                    "&:hover": {
                      borderColor: alpha(theme.palette.primary.main, 0.45),
                      boxShadow: `0 8px 24px ${alpha(
                        theme.palette.primary.main,
                        0.12
                      )}`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      fontWeight: 600,
                      mb: { xs: 1.5, sm: 2 },
                      color: theme.palette.text.primary,
                      "& .MuiSvgIcon-root": {
                        color: theme.palette.primary.main,
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      },
                    }}
                  >
                    {iconFor(category.icon)}
                    {category.title}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      alignContent: "flex-start",
                      flex: 1,
                    }}
                  >
                    {category.skills.map((skill) => (
                      <Chip
                        key={skill.id}
                        label={skill.name}
                        size="small"
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                          fontWeight: 500,
                          borderRadius: "8px",
                          color: theme.palette.text.primary,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                          transition:
                            "background-color 200ms ease, border-color 200ms ease, transform 200ms ease",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.16),
                            borderColor: alpha(theme.palette.primary.main, 0.35),
                            transform: "translateY(-1px)",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

const cardIcons = {
  projects: FolderOutlinedIcon,
  blogPosts: ArticleOutlinedIcon,
  experience: WorkOutlineOutlinedIcon,
  education: SchoolOutlinedIcon,
  skills: PsychologyOutlinedIcon,
  messages: EmailOutlinedIcon,
  testimonials: RateReviewOutlinedIcon,
  settings: SettingsOutlinedIcon,
};

const dashboardCards: Array<{
  id: string;
  title: string;
  description: string;
  iconKey: keyof typeof cardIcons;
}> = [
  {
    id: "projects",
    title: "Projects",
    description: "Create, edit, and order featured portfolio projects.",
    iconKey: "projects",
  },
  {
    id: "blog-posts",
    title: "Blog Posts",
    description: "Draft technical articles and manage published posts.",
    iconKey: "blogPosts",
  },
  {
    id: "experience",
    title: "Experience",
    description: "Maintain roles, highlights, and professional history.",
    iconKey: "experience",
  },
  {
    id: "education",
    title: "Education",
    description: "Update credentials, certifications, and learning milestones.",
    iconKey: "education",
  },
  {
    id: "skills",
    title: "Skills",
    description: "Organize technical skills, categories, and display priority.",
    iconKey: "skills",
  },
  {
    id: "messages",
    title: "Messages",
    description: "Review contact form submissions and follow-up status.",
    iconKey: "messages",
  },
  {
    id: "testimonials",
    title: "Testimonials",
    description: "Review, publish, and feature client feedback.",
    iconKey: "testimonials",
  },
  {
    id: "settings",
    title: "Settings",
    description: "Configure CMS preferences and account-level controls.",
    iconKey: "settings",
  },
];

export default function AdminDashboard() {
  const theme = useTheme();

  return (
    <Stack spacing={4}>
      <Box>
        <Chip
          label="Protected CMS"
          color="primary"
          variant="outlined"
          sx={{
            mb: 2,
            fontWeight: 700,
            borderColor: alpha(theme.palette.primary.main, 0.5),
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          }}
        />
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", maxWidth: 720, lineHeight: 1.8 }}
        >
          Manage the private content foundation for Shevon Chisholm&apos;s
          portfolio. Editing screens can plug into these sections as the CMS
          grows.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {dashboardCards.map((card) => {
          const Icon = cardIcons[card.iconKey];

          return (
            <Grid key={card.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                id={card.id}
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.82),
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2.5,
                      color: "primary.main",
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", lineHeight: 1.7 }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}

"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import { AnimatePresence } from "framer-motion";
import type { PublicProject } from "@/lib/cms/public-projects";
import type { PublicTestimonial } from "@/lib/cms/public-testimonials";
import ProjectCard from "../ProjectCard/ProjectCard";
import SectionContainer from "../SectionContainer/SectionContainer";
import TestimonialCarousel from "../TestimonialCarousel/TestimonialCarousel";

type ProjectCategory = "All" | "Web Apps" | "Mobile Apps";

type ProjectsClientProps = {
  projects: PublicProject[];
  testimonials: PublicTestimonial[];
};

const initialVisibleProjects = 6;
const visibleProjectsIncrement = 3;

export default function ProjectsClient({
  projects,
  testimonials,
}: ProjectsClientProps) {
  const theme = useTheme();
  const [category, setCategory] = useState<ProjectCategory>("All");
  const [visibleCount, setVisibleCount] = useState(initialVisibleProjects);

  const filteredProjects = projects.filter(
    (project) => category === "All" || project.category === category
  );
  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMoreProjects = visibleCount < filteredProjects.length;

  const handleCategoryChange = (
    _: React.MouseEvent<HTMLElement>,
    newCategory: ProjectCategory
  ) => {
    if (newCategory !== null) {
      setCategory(newCategory);
      setVisibleCount(initialVisibleProjects);
    }
  };

  const handleShowMore = () => {
    setVisibleCount((current) =>
      Math.min(current + visibleProjectsIncrement, filteredProjects.length)
    );
  };

  return (
    <SectionContainer
      id="projects"
      title="My Projects"
      subtitle="Production-focused web and mobile projects across fintech, media, healthcare, travel, and business platforms"
    >
      <Box sx={{ mb: 6, display: "flex", justifyContent: "center" }}>
        <ToggleButtonGroup
          value={category}
          exclusive
          onChange={handleCategoryChange}
          aria-label="project category"
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: "50px",
            p: 1,
            flexWrap: "wrap",
            justifyContent: "center",
            "& .MuiToggleButton-root": {
              border: "none",
              borderRadius: "50px !important",
              px: { xs: 2, sm: 3 },
              py: 1,
              color: theme.palette.text.secondary,
              textTransform: "none",
              fontWeight: 600,
              "&.Mui-selected": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
            },
          }}
        >
          <ToggleButton value="All">All</ToggleButton>
          <ToggleButton value="Web Apps">Web Apps</ToggleButton>
          <ToggleButton value="Mobile Apps">Mobile Apps</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={4} sx={{ alignItems: "stretch" }}>
        <AnimatePresence mode="wait">
          {visibleProjects.map((project) => (
            <Grid
              key={project.slug}
              size={{ xs: 12, sm: 6, md: 4 }}
              sx={{ display: "flex" }}
            >
              <ProjectCard {...project} />
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {hasMoreProjects && (
        <Box sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleShowMore}
            sx={{
              borderRadius: "50px",
              px: 4,
              py: 1.25,
              textTransform: "none",
              fontWeight: 700,
              borderColor: theme.palette.primary.main,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 102, 0, 0.06)"
                  : "rgba(255, 102, 0, 0.04)",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            Show More
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 12 }}>
        <Typography
          variant="h4"
          component="h3"
          align="center"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          {testimonials.length > 0 ? "Client Feedback" : "Why Work With Me"}
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            mb: 6,
            color: theme.palette.text.secondary,
          }}
        >
          {testimonials.length > 0
            ? "What clients and collaborators say about working together"
            : "How I approach building reliable web and mobile products"}
        </Typography>

        <Box
          sx={{
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.02)",
            borderRadius: "20px",
            p: { xs: 2, sm: 4 },
          }}
        >
          <TestimonialCarousel testimonials={testimonials} />
        </Box>
      </Box>
    </SectionContainer>
  );
}

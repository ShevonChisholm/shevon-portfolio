"use client";

import { useState } from "react";
import type { PublicProject } from "@/lib/cms/public-projects";
import type { PublicTestimonial } from "@/lib/cms/public-testimonials";
import {
  Box,
  Button,
  Chip,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AnimatePresence } from "framer-motion";
import ProjectCard from "../ProjectCard/ProjectCard";
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
    <Box
      component="section"
      id="projects"
      sx={{
        py: { xs: 9, md: 12 },
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.1),
      }}
    >
      <Container maxWidth={false} sx={{ width: "100%", maxWidth: 1040 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "stretch", md: "flex-end" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 5 },
            mb: { xs: 4.5, md: 5.5 },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Chip
              label="PROJECTS"
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
              My{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                projects
              </Box>
            </Typography>
            <Typography
              sx={{
                maxWidth: 470,
                mt: 0.8,
                color: "text.secondary",
                fontSize: "0.8rem",
                lineHeight: 1.55,
              }}
            >
              Production-focused web and mobile projects across fintech, media,
              healthcare, travel, and business platforms
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={category}
            exclusive
            onChange={handleCategoryChange}
            aria-label="project category"
            sx={{
              alignSelf: { xs: "flex-start", md: "flex-end" },
              maxWidth: "100%",
              p: 0.4,
              gap: 0.25,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.background.paper, 0.62),
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              "& .MuiToggleButton-root": {
                minWidth: 0,
                border: 0,
                borderRadius: "9px !important",
                px: { xs: 1.8, sm: 2.2 },
                py: 0.75,
                color: "text.secondary",
                textTransform: "none",
                fontSize: "0.68rem",
                fontWeight: 700,
                "&.Mui-selected": {
                  color: "primary.contrastText",
                  bgcolor: "primary.main",
                  "&:hover": { bgcolor: "primary.main" },
                },
              },
            }}
          >
            <ToggleButton value="All">All</ToggleButton>
            <ToggleButton value="Web Apps">Web Apps</ToggleButton>
            <ToggleButton value="Mobile Apps">Mobile Apps</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {visibleProjects.length === 0 ? (
          <Typography sx={{ color: "text.secondary" }}>
            No published projects are available in this category yet.
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
            <AnimatePresence mode="popLayout">
              {visibleProjects.map((project) => (
                <ProjectCard key={project.slug} {...project} />
              ))}
            </AnimatePresence>
          </Box>
        )}

        {hasMoreProjects && (
          <Box sx={{ mt: 4.5, display: "flex", justifyContent: "center" }}>
            <Button
              variant="outlined"
              onClick={handleShowMore}
              sx={{
                minHeight: 38,
                px: 3,
                borderColor: alpha(theme.palette.primary.main, 0.45),
                bgcolor: alpha(theme.palette.primary.main, 0.035),
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              Show More
            </Button>
          </Box>
        )}

        <Box
          sx={{
            mt: { xs: 9, md: 12 },
            pt: { xs: 7, md: 8 },
            borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", md: "flex-end" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" },
              gap: 2.5,
              mb: { xs: 4.5, md: 5 },
            }}
          >
            <Box>
              <Chip
                label={testimonials.length > 0 ? "TESTIMONIALS" : "WHY WORK WITH ME"}
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
                variant="h3"
                component="h3"
                sx={{ fontSize: { xs: "2rem", md: "2.3rem" }, lineHeight: 1.12, fontWeight: 800 }}
              >
                {testimonials.length > 0 ? (
                  <>
                    What clients{" "}
                    <Box component="span" sx={{ color: "primary.main" }}>
                      say
                    </Box>
                  </>
                ) : (
                  <>
                    Why work{" "}
                    <Box component="span" sx={{ color: "primary.main" }}>
                      with me
                    </Box>
                  </>
                )}
              </Typography>
            </Box>
            <Typography
              sx={{
                maxWidth: 360,
                color: "text.secondary",
                textAlign: { xs: "left", md: "right" },
                fontSize: "0.8rem",
                lineHeight: 1.55,
              }}
            >
              {testimonials.length > 0
                ? "Feedback from clients and collaborators I've worked with"
                : "How I approach building reliable web and mobile products"}
            </Typography>
          </Box>
          <TestimonialCarousel testimonials={testimonials} />
        </Box>
      </Container>
    </Box>
  );
}

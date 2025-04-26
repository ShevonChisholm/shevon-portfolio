'use client';

import { useState } from 'react';
import { Box, Grid, Typography, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import SectionContainer from '../SectionContainer/SectionContainer';
import ProjectCard from '../ProjectCard/ProjectCard';
import TestimonialCarousel from '../TestimonialCarousel/TestimonialCarousel';

type ProjectCategory = 'All' | 'Web Apps' | 'Mobile Apps';

interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  slug: string;
  category: Exclude<ProjectCategory, 'All'>;
}

const projects: Project[] = [
  {
    title: 'Keeper App',
    description: 'This project was completed using the JavaScript framework, React. It uses functional components along with hooks for handling state.',
    image: '/projects/keeper.jpg',
    tags: ['React', 'JavaScript', 'Hooks'],
    slug: 'keeper-app',
    category: 'Web Apps'
  },
  {
    title: 'TinDog',
    description: 'This website was created using HTML, CSS and Bootstrap. The implementation of this website mimics tinder but with a twist. Instead it was designed for dogs.',
    image: '/projects/tindog.jpg',
    tags: ['HTML', 'CSS', 'Bootstrap'],
    slug: 'tindog',
    category: 'Web Apps'
  },
  {
    title: 'Fitness Tracking App',
    description: 'Mobile application for tracking workouts, nutrition, and personal fitness goals.',
    image: '/projects/fitness.jpg',
    tags: ['React Native', 'Firebase', 'Redux'],
    slug: 'fitness-tracker',
    category: 'Mobile Apps',
  },
  {
    title: 'Task Management Dashboard',
    description: 'Collaborative project management tool with real-time updates and analytics.',
    image: '/projects/dashboard.jpg',
    tags: ['React', 'TypeScript', 'Material UI', 'Socket.io'],
    slug: 'task-dashboard',
    category: 'Web Apps',
  },
  {
    title: 'Social Media App',
    description: 'Cross-platform social networking app with real-time messaging and content sharing.',
    image: '/projects/social.jpg',
    tags: ['React Native', 'GraphQL', 'AWS'],
    slug: 'social-media-app',
    category: 'Mobile Apps',
  },
];

export default function Projects() {
  const theme = useTheme();
  const [category, setCategory] = useState<ProjectCategory>('All');

  const filteredProjects = projects.filter(
    (project) => category === 'All' || project.category === category
  );

  const handleCategoryChange = (_: React.MouseEvent<HTMLElement>, newCategory: ProjectCategory) => {
    if (newCategory !== null) {
      setCategory(newCategory);
    }
  };

  return (
    <SectionContainer
      id="projects"
      title="My Projects"
      subtitle="Explore some of my recent work across web and mobile platforms"
    >
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={category}
          exclusive
          onChange={handleCategoryChange}
          aria-label="project category"
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: '50px',
            p: 1,
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '50px !important',
              px: 3,
              py: 1,
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
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

      <Grid container spacing={4}>
        <AnimatePresence mode="wait">
          {filteredProjects.map((project) => (
            <Grid 
              key={project.slug} 
              size={{xs: 12, sm: 6, md: 4}}
            >
              <ProjectCard {...project} />
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

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
          What People Say
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            mb: 6,
            color: theme.palette.text.secondary,
          }}
        >
          Testimonials from clients and collaborators
        </Typography>
        <Box
          sx={{
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '20px',
            p: 4,
          }}
        >
          <TestimonialCarousel />
        </Box>
      </Box>
    </SectionContainer>
  );
} 
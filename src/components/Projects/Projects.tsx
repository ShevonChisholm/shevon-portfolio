'use client';

import { useState } from 'react';
import { Box, Grid, Typography, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import SectionContainer from '../SectionContainer/SectionContainer';
import ProjectCard from '../ProjectCard/ProjectCard';
import TestimonialCarousel from '../TestimonialCarousel/TestimonialCarousel';

type ProjectCategory = 'All' | 'Web Apps' | 'Mobile Apps';

export interface Project {
  title: string;
  description: string;
  image: string;
  images?: string[];
  tags: string[];
  slug: string;
  category: Exclude<ProjectCategory, 'All'>;
  siteUrl?: string;  // Optional URL to live site
}

export const projects: Project[] = [
  {
    title: 'Taking Flight Network Admin',
    description: 'A powerful admin dashboard for content management of the Taking Flight streaming platform. Features AWS content uploads, Stripe subscription management, user analytics, and comprehensive content moderation tools.',
    image: '/projects/taking-flight-admin.png',
    tags: ['Next.js', 'AWS', 'Stripe', 'Content Management', 'Analytics'],
    slug: 'taking-flight-admin',
    category: 'Web Apps',
    siteUrl: 'https://admin.takingflightnetwork.com'
  },
  {
    title: 'Teaching Portfolio',
    description: 'A modern teaching portfolio website built with Next.js, showcasing educational philosophy, blog posts, and teaching resources. Features a clean, professional design with smooth animations and responsive layout.',
    image: '/projects/teaching-portfolio.png',
    tags: ['Next.js', 'React', 'Education', 'Blog'],
    slug: 'teaching-portfolio',
    category: 'Web Apps',
    siteUrl: 'https://teaching-portfolio-peach.vercel.app'
  },
  {
    title: 'Wealth Building Budget Book',
    description: 'A comprehensive mobile budgeting application that helps users track expenses, set financial goals, and build wealth through smart money management. Features interactive charts and real-time budget tracking.',
    image: '/projects/budget-book/main.png',
    images: [
      '/projects/budget-book/dashboard.PNG',
      '/projects/budget-book/profile.PNG',
      '/projects/budget-book/saving.PNG',
      '/projects/budget-book/subscription.PNG'
    ],
    tags: ['React Native', 'Financial', 'Charts', 'Local Storage'],
    slug: 'budget-book',
    category: 'Mobile Apps'
  },
  {
    title: 'Taking Flight Network',
    description: 'A video streaming platform built with React, featuring live streaming capabilities, video-on-demand, and user authentication. Implements modern streaming technologies and responsive design.',
    image: '/projects/taking-flight.png',
    tags: ['React', 'Streaming', 'Video Player', 'Authentication'],
    slug: 'taking-flight-network',
    category: 'Web Apps'
  },
  {
    title: 'Travaguz',
    description: 'A modern travel agency website built with Next.js, featuring luxury Caribbean travel packages, tours, and wedding services. Implements responsive design and smooth animations.',
    image: '/projects/travaguz.png',
    tags: ['Next.js', 'React', 'TypeScript', 'Material UI'],
    slug: 'travaguz',
    category: 'Web Apps',
    siteUrl: 'https://travaguz.com'
  },
  {
    title: 'Caribbean World Explorer',
    description: 'A React-based travel exploration platform showcasing Caribbean destinations and experiences. Features interactive maps and booking capabilities.',
    image: '/projects/caribbean-explorer.png',
    tags: ['React', 'JavaScript', 'CSS'],
    slug: 'caribbean-world-explorer',
    category: 'Web Apps',
    siteUrl: 'https://caribbeanworldexplorer.com'
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

      <Grid 
        container 
        spacing={4}
        sx={{
          alignItems: 'stretch'
        }}
      >
        <AnimatePresence mode="wait">
          {filteredProjects.map((project) => (
            <Grid 
              key={project.slug} 
              size={{xs: 12, sm: 6, md: 4}}
              sx={{
                display: 'flex',
              }}
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
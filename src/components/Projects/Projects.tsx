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
  showcase?: {
    title: string;
    description: string;
    image: string;
  }[];
}

export const projects: Project[] = [
  {
    title: 'Draxhall Health Group',
    description: 'A modern healthcare website for a leading medical group, featuring service information, doctor profiles, and patient resources. Built with a clean, professional design optimized for healthcare accessibility.',
    image: '/projects/draxhall-health.png',
    tags: ['React', 'Healthcare', 'Medical', 'Accessibility', 'Responsive Design'],
    slug: 'draxhall-health',
    category: 'Web Apps',
    siteUrl: 'https://draxhallhealthgroup.com',
    showcase: [
      {
        title: 'Medical Services',
        description: 'Comprehensive display of healthcare services with intuitive navigation and clear categorization.',
        image: '/projects/draxhall-health/services.png'
      },
      {
        title: 'Doctor Profiles',
        description: 'Detailed profiles showcasing medical professionals, their expertise, and qualifications.',
        image: '/projects/draxhall-health/doctors.png'
      },
      {
        title: 'Patient Resources',
        description: 'Accessible patient information and healthcare resources with clear organization.',
        image: '/projects/draxhall-health/resources.png'
      }
    ]
  },
  {
    title: 'Festiv Media',
    description: "A virtual marketplace for award-winning independent films, offering a 24/7 platform for filmmakers and enthusiasts. Features include film streaming, interactive panel discussions, and an annual cinematic showcase event.",
    image: '/projects/festiv-media.png',
    tags: ['React', 'AWS', 'Video Streaming', 'Film Distribution', 'Virtual Events'],
    slug: 'festiv-media',
    category: 'Web Apps',
    siteUrl: 'https://www.festivmedia.com',
    showcase: [
      {
        title: 'Film Marketplace',
        description: 'Curated selection of award-winning independent films with seamless streaming experience.',
        image: '/projects/festiv-media/marketplace.png'
      },
      {
        title: 'Panel Discussions',
        description: 'Interactive online panels featuring filmmakers and industry leaders from around the globe.',
        image: '/projects/festiv-media/panels.png'
      },
      {
        title: 'Community Hub',
        description: 'Engaging platform for filmmakers and enthusiasts to connect and collaborate.',
        image: '/projects/festiv-media/community.png'
      }
    ]
  },
  {
    title: 'Taking Flight Network Admin',
    description: 'A powerful admin dashboard for content management of the Taking Flight streaming platform. Features AWS content uploads, Stripe subscription management, user analytics, and comprehensive content moderation tools.',
    image: '/projects/taking-flight-admin.png',
    tags: ['Next.js', 'AWS', 'Stripe', 'Content Management', 'Analytics'],
    slug: 'taking-flight-admin',
    category: 'Web Apps',
    siteUrl: 'https://admin.takingflightnetwork.com',
    showcase: [
      {
        title: 'Content Management',
        description: 'Comprehensive system for managing streaming content with AWS integration.',
        image: '/projects/taking-flight-admin/content.png'
      },
      {
        title: 'Subscription Dashboard',
        description: 'Stripe-powered subscription management with detailed analytics and reporting.',
        image: '/projects/taking-flight-admin/subscriptions.png'
      },
      {
        title: 'User Analytics',
        description: 'Detailed insights into user engagement and content performance metrics.',
        image: '/projects/taking-flight-admin/analytics.png'
      }
    ]
  },
  {
    title: 'Teaching Portfolio',
    description: 'A modern teaching portfolio website built with Next.js, showcasing educational philosophy, blog posts, and teaching resources. Features a clean, professional design with smooth animations and responsive layout.',
    image: '/projects/teaching-portfolio.png',
    tags: ['Next.js', 'React', 'Education', 'Blog'],
    slug: 'teaching-portfolio',
    category: 'Web Apps',
    siteUrl: 'https://teaching-portfolio-peach.vercel.app',
    showcase: [
      {
        title: 'Educational Philosophy',
        description: 'Clear presentation of teaching approach and educational values.',
        image: '/projects/teaching-portfolio/philosophy.png'
      },
      {
        title: 'Teaching Resources',
        description: 'Organized collection of educational materials and resources.',
        image: '/projects/teaching-portfolio/resources.png'
      },
      {
        title: 'Blog Section',
        description: 'Dynamic blog system for sharing educational insights and experiences.',
        image: '/projects/teaching-portfolio/blog.png'
      }
    ]
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
    category: 'Mobile Apps',
    showcase: [
      {
        title: 'Dashboard Overview',
        description: 'Comprehensive financial dashboard with interactive charts and budget tracking.',
        image: '/projects/budget-book/dashboard.PNG'
      },
      {
        title: 'Profile Management',
        description: 'User profile settings and financial goal management interface.',
        image: '/projects/budget-book/profile.PNG'
      },
      {
        title: 'Savings Tracker',
        description: 'Interactive savings goals and progress tracking system.',
        image: '/projects/budget-book/saving.PNG'
      },
      {
        title: 'Subscription Manager',
        description: 'Efficient management of recurring expenses and subscriptions.',
        image: '/projects/budget-book/subscription.PNG'
      }
    ]
  },
  {
    title: 'Taking Flight Network',
    description: 'A video streaming platform built with React, featuring live streaming capabilities, video-on-demand, and user authentication. Implements modern streaming technologies and responsive design.',
    image: '/projects/taking-flight.png',
    tags: ['React', 'Streaming', 'Video Player', 'Authentication'],
    slug: 'taking-flight-network',
    category: 'Web Apps',
    showcase: [
      {
        title: 'Video Player',
        description: 'Advanced video player with custom controls and streaming capabilities.',
        image: '/projects/taking-flight/player.png'
      },
      {
        title: 'Content Library',
        description: 'Organized content library with categories and search functionality.',
        image: '/projects/taking-flight/library.png'
      },
      {
        title: 'User Dashboard',
        description: 'Personalized user dashboard with watch history and recommendations.',
        image: '/projects/taking-flight/dashboard.png'
      }
    ]
  },
  {
    title: 'Travaguz',
    description: 'A modern travel agency website built with Next.js, featuring luxury Caribbean travel packages, tours, and wedding services. Implements responsive design and smooth animations.',
    image: '/projects/travaguz.png',
    tags: ['Next.js', 'React', 'TypeScript', 'Material UI'],
    slug: 'travaguz',
    category: 'Web Apps',
    siteUrl: 'https://travaguz.com',
    showcase: [
      {
        title: 'Travel Packages',
        description: 'Showcase of luxury Caribbean travel packages and experiences.',
        image: '/projects/travaguz/packages.png'
      },
      {
        title: 'Wedding Services',
        description: 'Comprehensive wedding planning and services section.',
        image: '/projects/travaguz/weddings.png'
      },
      {
        title: 'Tour Gallery',
        description: 'Interactive gallery of travel destinations and experiences.',
        image: '/projects/travaguz/gallery.png'
      }
    ]
  },
  {
    title: 'Caribbean World Explorer',
    description: 'A React-based travel exploration platform showcasing Caribbean destinations and experiences. Features interactive maps and booking capabilities.',
    image: '/projects/caribbean-explorer.png',
    tags: ['React', 'JavaScript', 'CSS'],
    slug: 'caribbean-world-explorer',
    category: 'Web Apps',
    siteUrl: 'https://caribbeanworldexplorer.com',
    showcase: [
      {
        title: 'Interactive Maps',
        description: 'Dynamic mapping system for exploring Caribbean destinations.',
        image: '/projects/caribbean-explorer/maps.png'
      },
      {
        title: 'Travel Guides',
        description: 'Comprehensive guides and information for each location.',
        image: '/projects/caribbean-explorer/guides.png'
      },
      {
        title: 'Booking System',
        description: 'Seamless booking interface for travel packages and experiences.',
        image: '/projects/caribbean-explorer/booking.png'
      }
    ]
  }
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
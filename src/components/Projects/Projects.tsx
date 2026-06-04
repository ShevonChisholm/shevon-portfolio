"use client";

import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from "@mui/material";
import { AnimatePresence } from "framer-motion";
import SectionContainer from "../SectionContainer/SectionContainer";
import ProjectCard from "../ProjectCard/ProjectCard";
import TestimonialCarousel from "../TestimonialCarousel/TestimonialCarousel";

type ProjectCategory = "All" | "Web Apps" | "Mobile Apps";

export interface Project {
  title: string;
  description: string;
  image: string;
  images?: string[];
  tags: string[];
  slug: string;
  category: Exclude<ProjectCategory, "All">;
  siteUrl?: string;
  role?: string;
  status?: string;
  impact?: string;
  highlights?: string[];
  technicalFocus?: string[];
  showcase?: {
    title: string;
    description: string;
    image: string;
  }[];
}

export const projects: Project[] = [
  {
    title: "Wealth Building Investments Platform",
    description:
      "A full-stack fintech platform supporting customer financial workflows, admin operations, automated payment scheduling, Stripe synchronization, balances, transactions, loan repayments, savings contributions, payouts, and secure role-based access.",
    image: "/projects/wealth-building-platform.png",
    tags: ["Next.js", "NestJS", "MongoDB", "Stripe", "JWT", "RBAC", "Fintech"],
    slug: "wealth-building-investments-platform",
    category: "Web Apps",
    role: "Full Stack Engineer",
    status: "Production fintech platform",
    impact:
      "Supports customer, admin, payment, loan, savings, and financial management workflows.",
    highlights: [
      "Customer-facing financial portal",
      "Admin portal for operational management",
      "Automated payment scheduling workflows",
      "Stripe payment synchronization",
      "Loan repayment and savings contribution tracking",
      "Balances, transactions, payouts, and payment history",
      "JWT authentication and role-based access control",
    ],
    technicalFocus: [
      "NestJS backend architecture",
      "MongoDB/Mongoose data modeling",
      "Secure payment workflows",
      "Stripe integration and synchronization",
      "Role-based access control",
      "Full-stack financial workflow design",
    ],
  },
  {
    title: "Wealth Building Budget Book",
    description:
      "A production mobile budgeting platform with customer financial tracking, profile-based budgets, savings goals, subscriptions, and real-time usage limits. Built with React Native/Expo and connected to a backend ecosystem supporting payments, authentication, and account management.",
    image: "/projects/budget-book/main.png",
    images: [
      "/projects/budget-book/dashboard.PNG",
      "/projects/budget-book/profile.PNG",
      "/projects/budget-book/saving.PNG",
      "/projects/budget-book/subscription.PNG",
    ],
    tags: [
      "React Native",
      "Expo",
      "TypeScript",
      "Subscriptions",
      "Financial Tracking",
      "Mobile App",
    ],
    slug: "budget-book",
    category: "Mobile Apps",
    role: "Full Stack / Mobile Developer",
    status: "Production app ecosystem",
    impact:
      "Supports budgeting, savings tracking, subscriptions, and customer financial workflows.",
    highlights: [
      "Profile-based budgeting and financial tracking",
      "Savings goals and contribution tracking",
      "Subscription-aware usage limits",
      "Mobile-first dashboard and account experience",
    ],
    technicalFocus: [
      "React Native/Expo mobile architecture",
      "Financial data modeling",
      "Subscription and account workflows",
      "API-connected mobile experiences",
    ],
    showcase: [
      {
        title: "Dashboard Overview",
        description:
          "Financial dashboard with budget summaries, progress indicators, and key account information.",
        image: "/projects/budget-book/dashboard.PNG",
      },
      {
        title: "Profile Management",
        description:
          "User profile settings and financial goal management interface.",
        image: "/projects/budget-book/profile.PNG",
      },
      {
        title: "Savings Tracker",
        description:
          "Savings goals and contribution tracking for personal financial planning.",
        image: "/projects/budget-book/saving.PNG",
      },
      {
        title: "Subscription Manager",
        description:
          "Subscription-aware interface for managing plan access and usage limits.",
        image: "/projects/budget-book/subscription.PNG",
      },
    ],
  },
  {
    title: "Taking Flight Network Admin",
    description:
      "An admin platform for managing the Taking Flight streaming ecosystem, including content uploads, user management, subscription workflows, analytics, moderation, and AWS-connected media operations.",
    image: "/projects/taking-flight-admin.png",
    tags: [
      "Next.js",
      "AWS",
      "Stripe",
      "Admin Dashboard",
      "Content Management",
      "Analytics",
    ],
    slug: "taking-flight-admin",
    category: "Web Apps",
    role: "Full Stack Developer",
    status: "Admin platform",
    impact:
      "Gives administrators control over content, users, subscriptions, and platform operations.",
    highlights: [
      "Content management workflows",
      "AWS-connected upload and media operations",
      "Stripe subscription management",
      "Admin analytics and moderation tools",
    ],
    technicalFocus: [
      "Next.js admin interface",
      "Role-based admin workflows",
      "Stripe integration",
      "AWS media/content handling",
    ],
    showcase: [
      {
        title: "Content Management",
        description:
          "Comprehensive system for managing streaming content with AWS integration.",
        image: "/projects/taking-flight-admin/content.png",
      },
      {
        title: "Sponsor Management",
        description: "Sponsor management with detailed analytics and reporting.",
        image: "/projects/taking-flight-admin/sponsor.png",
      },
      {
        title: "Content Moderation",
        description:
          "Tools for managing moderation workflows, platform content, and reporting.",
        image: "/projects/taking-flight-admin/analytics.png",
      },
    ],
  },
  {
    title: "Taking Flight Network",
    description:
      "A media streaming platform with video playback, authentication, watch history, content discovery, and user-focused viewing experiences. Built to support a growing content library and digital media audience.",
    image: "/projects/taking-flight.png",
    tags: [
      "React",
      "Video Streaming",
      "Authentication",
      "Content Library",
      "User Dashboard",
    ],
    slug: "taking-flight-network",
    category: "Web Apps",
    role: "Frontend / Full Stack Developer",
    impact:
      "Supports streaming, content discovery, and personalized viewing workflows.",
    highlights: [
      "Video playback experience",
      "Watch history and user dashboard",
      "Content library organization",
      "Authentication-protected viewing flows",
    ],
    technicalFocus: [
      "React frontend architecture",
      "Streaming-focused UI",
      "Authenticated user flows",
      "Content discovery patterns",
    ],
    showcase: [
      {
        title: "Video Player",
        description:
          "Video player experience with custom controls and streaming-focused UI.",
        image: "/projects/taking-flight/player.png",
      },
      {
        title: "Content Library",
        description:
          "Organized content library with categories and search functionality.",
        image: "/projects/taking-flight/library.png",
      },
      {
        title: "User Dashboard",
        description:
          "Personalized user dashboard with watch history and recommendations.",
        image: "/projects/taking-flight/dashboard.png",
      },
    ],
  },
  {
    title: "Draxhall Health Group",
    description:
      "A professional healthcare website built to present medical services, doctor profiles, patient information, and accessible resources through a clean, responsive user experience.",
    image: "/projects/draxhall-health.png",
    tags: [
      "React",
      "Healthcare",
      "Accessibility",
      "Responsive Design",
      "Patient Resources",
    ],
    slug: "draxhall-health",
    category: "Web Apps",
    siteUrl: "https://draxhallhealthgroup.com",
    role: "Frontend Developer",
    impact:
      "Improves online visibility and helps patients access key healthcare information.",
    showcase: [
      {
        title: "Medical Services",
        description:
          "Comprehensive display of healthcare services with intuitive navigation.",
        image: "/projects/draxhall-health/services.png",
      },
      {
        title: "Doctor Profiles",
        description:
          "Profiles showcasing medical professionals, expertise, and qualifications.",
        image: "/projects/draxhall-health/doctors.png",
      },
      {
        title: "Patient Resources",
        description:
          "Accessible patient information and healthcare resources with clear organization.",
        image: "/projects/draxhall-health/resources.png",
      },
    ],
  },
  {
    title: "Festiv Media",
    description:
      "A film-focused digital platform supporting independent film discovery, virtual screenings, filmmaker visibility, and event-style content experiences for a niche media audience.",
    image: "/projects/festiv-media.png",
    tags: ["React", "AWS", "Video Streaming", "Film Distribution", "Virtual Events"],
    slug: "festiv-media",
    category: "Web Apps",
    siteUrl: "https://www.festivmedia.com",
    role: "Frontend / Web Developer",
    impact:
      "Supports digital access to independent film content and filmmaker discovery.",
    showcase: [
      {
        title: "Film Buyers Marketplace",
        description:
          "Platform for screening independent films and browsing award-winning content.",
        image: "/projects/festiv-media/marketplace.png",
      },
      {
        title: "Exclusive Access Window",
        description:
          "Special screening windows to view films before wider release.",
        image: "/projects/festiv-media/access-window.png",
      },
      {
        title: "Direct Filmmaker Contact",
        description:
          "Workflows for connecting with filmmakers and exploring rights inquiries.",
        image: "/projects/festiv-media/filmmaker-contact.png",
      },
    ],
  },
  {
    title: "Travaguz",
    description:
      "A Caribbean travel listing and booking inquiry platform showcasing resorts, travel packages, tours, and wedding services through a responsive, visually polished web experience.",
    image: "/projects/travaguz.png",
    tags: ["Next.js", "React", "TypeScript", "Material UI", "Travel Platform"],
    slug: "travaguz",
    category: "Web Apps",
    siteUrl: "https://travaguz.com",
    role: "Frontend Developer",
    impact:
      "Helps users explore travel experiences and submit booking inquiries.",
    showcase: [
      {
        title: "Travel Packages",
        description:
          "Showcase of Caribbean travel packages and experiences.",
        image: "/projects/travaguz/packages.png",
      },
      {
        title: "Wedding Services",
        description:
          "Wedding planning and services section for destination events.",
        image: "/projects/travaguz/weddings.png",
      },
      {
        title: "Tour Gallery",
        description:
          "Gallery of travel destinations, packages, and experiences.",
        image: "/projects/travaguz/gallery.png",
      },
    ],
  },
  {
    title: "Caribbean World Explorer",
    description:
      "A Caribbean travel exploration website presenting cruises, island vacations, tours, and destination experiences with responsive layouts and clear content organization.",
    image: "/projects/caribbean-explorer.png",
    tags: ["React", "JavaScript", "CSS", "Travel", "Responsive Design"],
    slug: "caribbean-world-explorer",
    category: "Web Apps",
    siteUrl: "https://caribbeanworldexplorer.com",
    role: "Frontend Developer",
    showcase: [
      {
        title: "Caribbean Cruises",
        description:
          "Explore cruise packages with itineraries and onboard experiences.",
        image: "/projects/caribbean-explorer/cruises.png",
      },
      {
        title: "Island Vacations",
        description:
          "Curated vacation packages featuring resorts and island experiences.",
        image: "/projects/caribbean-explorer/vacations.png",
      },
      {
        title: "Guided Tours",
        description:
          "Tour content highlighting culture, history, and Caribbean attractions.",
        image: "/projects/caribbean-explorer/tours.png",
      },
    ],
  },
  {
    title: "Teaching Portfolio",
    description:
      "A professional teaching portfolio built with Next.js to showcase teaching philosophy, educational resources, blog content, and professional experience through a clean, responsive interface.",
    image: "/projects/teaching-portfolio.png",
    tags: ["Next.js", "React", "Education", "Blog", "Portfolio"],
    slug: "teaching-portfolio",
    category: "Web Apps",
    siteUrl: "https://teaching-portfolio-peach.vercel.app",
    role: "Frontend Developer",
    showcase: [
      {
        title: "Educational Philosophy",
        description:
          "Clear presentation of teaching approach and educational values.",
        image: "/projects/teaching-portfolio/philosophy.png",
      },
      {
        title: "Teaching Resources",
        description:
          "Organized collection of educational materials and resources.",
        image: "/projects/teaching-portfolio/resources.png",
      },
      {
        title: "Blog Section",
        description:
          "Blog system for sharing educational insights and experiences.",
        image: "/projects/teaching-portfolio/blog.png",
      },
    ],
  },
];

export default function Projects() {
  const theme = useTheme();
  const [category, setCategory] = useState<ProjectCategory>("All");

  const filteredProjects = projects.filter(
    (project) => category === "All" || project.category === category
  );

  const handleCategoryChange = (
    _: React.MouseEvent<HTMLElement>,
    newCategory: ProjectCategory
  ) => {
    if (newCategory !== null) {
      setCategory(newCategory);
    }
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
          {filteredProjects.map((project) => (
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
          Why Work With Me
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            mb: 6,
            color: theme.palette.text.secondary,
          }}
        >
          How I approach building reliable web and mobile products        </Typography>

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
          <TestimonialCarousel />
        </Box>
      </Box>
    </SectionContainer>
  );
}


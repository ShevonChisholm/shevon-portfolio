"use client";

import {
  Box,
  Container,
  Typography,
  Chip,
  useTheme,
  Button,
  Grid,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { projects, type Project } from "@/components/Projects/Projects";
import MobileAppScreens from "@/components/MobileAppScreens/MobileAppScreens";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface FeatureItem {
  title: string;
  description: string;
}

export default function ProjectDetails() {
  const theme = useTheme();
  const { slug } = useParams();
  const router = useRouter();

  const project = projects.find((p: Project) => p.slug === slug);

  if (!project) {
    return (
      <Container>
        <Typography variant="h4">Project not found</Typography>
      </Container>
    );
  }

  const handleBackClick = () => {
    // First navigate to home page with the projects hash
    router.push("/#projects");

    // After navigation, ensure smooth scrolling to projects section
    setTimeout(() => {
      const element = document.getElementById("projects");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const getFeatures = (category: string): FeatureItem[] => {
    if (category === "Web Apps") {
      switch (project.slug) {
        case "draxhall-health":
          return [
            {
              title: "Healthcare Services",
              description:
                "Comprehensive display of medical services and specialties offered by the health group",
            },
            {
              title: "Doctor Profiles",
              description:
                "Detailed profiles of medical professionals with their expertise and qualifications",
            },
            {
              title: "Patient Resources",
              description:
                "Accessible patient information, forms, and healthcare resources",
            },
            {
              title: "Medical Accessibility",
              description:
                "WCAG compliant design ensuring accessibility for all users",
            },
          ];
        case "festiv-media":
          return [
            {
              title: "Film Streaming Platform",
              description:
                "24/7 virtual marketplace showcasing award-winning independent films, shorts, and episodic content",
            },
            {
              title: "Interactive Events",
              description:
                "Online panel discussions featuring filmmakers, screenwriters, and industry leaders from around the globe",
            },
            {
              title: "Community Features",
              description:
                "Platform for filmmakers and enthusiasts to connect, collaborate, and engage with independent cinema",
            },
            {
              title: "Annual Showcase",
              description:
                "Live cinematic event featuring the best films from the marketplace on the big screen",
            },
          ];
        case "taking-flight-admin":
          return [
            {
              title: "Content Management",
              description:
                "Comprehensive system for uploading and managing streaming content through AWS integration",
            },
            {
              title: "Subscription Management",
              description:
                "Full Stripe integration for managing subscription plans and user payments",
            },
            {
              title: "Analytics Dashboard",
              description:
                "Detailed user engagement metrics and content performance analytics",
            },
            {
              title: "User Management",
              description:
                "Advanced tools for user role management and access control",
            },
          ];
        case "teaching-portfolio":
          return [
            {
              title: "Dynamic Blog System",
              description:
                "Integrated blog functionality for sharing educational insights and experiences",
            },
            {
              title: "Resource Management",
              description:
                "Organized system for showcasing teaching materials and resources",
            },
            {
              title: "Responsive Design",
              description:
                "Optimized viewing experience across all devices and screen sizes",
            },
            {
              title: "Portfolio Showcase",
              description:
                "Elegant display of teaching philosophy and professional achievements",
            },
          ];
        case "travaguz":
          return [
            {
              title: "Booking System",
              description:
                "Integrated travel package booking and reservation management",
            },
            {
              title: "Interactive Gallery",
              description:
                "Rich media showcase of travel destinations and experiences",
            },
            {
              title: "Package Customization",
              description:
                "Flexible system for customizing travel packages and itineraries",
            },
            {
              title: "Customer Support",
              description: "Integrated contact forms and support ticket system",
            },
          ];
        case "caribbean-world-explorer":
          return [
            {
              title: "Interactive Maps",
              description:
                "Dynamic mapping system for exploring Caribbean destinations",
            },
            {
              title: "Travel Guides",
              description:
                "Comprehensive guides and information for each location",
            },
            {
              title: "Search & Filter",
              description:
                "Advanced search functionality for finding specific destinations",
            },
            {
              title: "User Reviews",
              description:
                "Integrated review and rating system for travel experiences",
            },
          ];
        default:
          return [
            {
              title: "Responsive Design",
              description: "Optimized for all devices and screen sizes",
            },
            {
              title: "Modern UI/UX",
              description:
                "Intuitive interface with smooth animations and transitions",
            },
            {
              title: "Performance",
              description: "Optimized loading times and resource management",
            },
            {
              title: "SEO Friendly",
              description:
                "Built with best practices for search engine optimization",
            },
          ];
      }
    } else {
      // Mobile Apps features
      return [
        {
          title: "Cross-Platform",
          description: "Seamless experience across iOS and Android devices",
        },
        {
          title: "Offline Support",
          description:
            "Core functionality available without internet connection",
        },
        {
          title: "Push Notifications",
          description: "Real-time updates and engagement features",
        },
        {
          title: "Secure Storage",
          description: "Encrypted local storage for user data protection",
        },
      ];
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Back Button and Visit Site */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box
          onClick={handleBackClick}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: theme.palette.text.secondary,
            cursor: "pointer",
            "&:hover": {
              color: theme.palette.primary.main,
            },
          }}
        >
          <ArrowBackIcon />
          <Typography>Back to Projects</Typography>
        </Box>
        {project.siteUrl && (
          <Button
            variant="contained"
            color="primary"
            endIcon={<OpenInNewIcon />}
            href={project.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderRadius: "50px",
              textTransform: "none",
              px: 3,
            }}
          >
            Visit Site
          </Button>
        )}
      </Box>

      {/* Project Title */}
      <Typography
        variant="h2"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 700,
          mb: 3,
          fontSize: {
            xs: "1.75rem", // 28px
            sm: "2.25rem", // 36px
            md: "2.75rem", // 44px
            lg: "3rem", // 48px
          },
          lineHeight: {
            xs: 1.3,
            sm: 1.2,
          },
        }}
      >
        {project.title}
      </Typography>

      {/* Tags */}
      <Box sx={{ mb: 4, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {project.tags.map((tag: string) => (
          <Chip
            key={tag}
            label={tag}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 500,
            }}
          />
        ))}
      </Box>

      {/* Project Image/Screenshots */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: {
            xs: project.category === "Mobile Apps" ? "560px" : "300px",
            sm: project.category === "Mobile Apps" ? "600px" : "400px",
            md: project.category === "Mobile Apps" ? "600px" : "500px",
          },
          mb: { xs: 4, sm: 6 },
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor:
            project.category === "Mobile Apps"
              ? "rgba(0,0,0,0.05)"
              : "transparent",
        }}
      >
        {project.category === "Mobile Apps" && project.images ? (
          <MobileAppScreens images={project.images} title={project.title} />
        ) : (
          <Image
            src={project.image}
            alt={project.title}
            fill
            style={{
              objectFit: "cover",
              borderRadius: "20px",
            }}
          />
        )}
      </Box>

      {/* Project Description */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              fontSize: {
                xs: "1.5rem", // 24px
                sm: "1.75rem", // 28px
                md: "2rem", // 32px
              },
            }}
          >
            Overview
          </Typography>
          <Typography variant="body1" paragraph>
            {project.description}
          </Typography>

          {/* Showcase Section */}
          {project.showcase && project.showcase.length > 0 && (
            <Box sx={{ mt: 6, mb: 6 }}>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  fontSize: {
                    xs: "1.5rem", // 24px
                    sm: "1.75rem", // 28px
                    md: "2rem", // 32px
                  },
                  mb: 4,
                }}
              >
                Key Features
              </Typography>
              <Grid container spacing={4}>
                {project.showcase.map((feature, index) => (
                  <Grid
                    key={index}
                    size={{ xs: 12, md: 6 }}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        paddingTop: "56.25%",
                        mb: 2,
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: theme.shadows[2],
                        transition: "transform 0.3s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.5)", // 30% larger on hover
                          zIndex: 1,
                          boxShadow: theme.shadows[6], // Add stronger shadow for depth
                          cursor: "pointer",
                        },
                      }}
                    >
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        style={{
                          objectFit: "cover",
                          transition: "transform 0.3s ease-in-out",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        fontSize: {
                          xs: "1.1rem",
                          sm: "1.25rem",
                        },
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: {
                          xs: "0.875rem",
                          sm: "1rem",
                        },
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600, mt: 6, mb: 4 }}
          >
            Technical Details
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
            }}
          >
            {getFeatures(project.category).map((feature, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  borderRadius: "20px",
                  p: 3,
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 24px ${alpha(
                      theme.palette.common.black,
                      0.1
                    )}`,
                  },
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}
                >
                  <CheckCircleOutlineIcon
                    sx={{
                      color: theme.palette.primary.main,
                      fontSize: 24,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box>
          <Box
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
              borderRadius: "20px",
              p: 3,
            }}
          >
            <Typography
              variant="h5"
              component="h3"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Technical Details
            </Typography>
            <Typography variant="body2" component="div">
              <Box sx={{ mb: 2 }}>
                <strong>Category:</strong> {project.category}
              </Box>
              <Box sx={{ mb: 2 }}>
                <strong>Technologies:</strong>
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  {project.tags.map((tech: string) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </Box>
              </Box>
              {/* Add more technical details as needed */}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

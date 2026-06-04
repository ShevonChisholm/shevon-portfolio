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
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4">Project not found</Typography>
      </Container>
    );
  }

  const handleBackClick = () => {
    router.push("/#projects");

    setTimeout(() => {
      const element = document.getElementById("projects");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const fallbackFeatures = getFallbackFeatures(project);

  const highlightFeatures: FeatureItem[] =
    project.highlights?.map((highlight) => ({
      title: highlight,
      description: "",
    })) || fallbackFeatures;

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
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
            transition: "color 0.2s ease",
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
              fontWeight: 600,
            }}
          >
            Visit Site
          </Button>
        )}
      </Box>

      <Typography
        variant="h2"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 800,
          mb: 2,
          fontSize: {
            xs: "1.9rem",
            sm: "2.4rem",
            md: "3rem",
          },
          lineHeight: 1.2,
        }}
      >
        {project.title}
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
        {project.role && (
          <Chip
            label={project.role}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.14),
              color: theme.palette.primary.main,
              fontWeight: 700,
            }}
          />
        )}

        {project.status && (
          <Chip
            label={project.status}
            variant="outlined"
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.35),
              color: theme.palette.text.secondary,
              fontWeight: 600,
            }}
          />
        )}

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
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 4,
        }}
      >
        <Box>
          <SectionTitle title="Overview" />
          <Typography
            variant="body1"
            paragraph
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.8,
              fontSize: { xs: "1rem", sm: "1.05rem" },
            }}
          >
            {project.description}
          </Typography>

          {project.role && (
            <Box sx={{ mt: 5 }}>
              <SectionTitle title="My Role" />
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  lineHeight: 1.8,
                }}
              >
                {project.role}
              </Typography>
            </Box>
          )}

          {project.impact && (
            <Box sx={{ mt: 5 }}>
              <SectionTitle title="Impact / Outcome" />
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  lineHeight: 1.8,
                }}
              >
                {project.impact}
              </Typography>
            </Box>
          )}

          {project.showcase && project.showcase.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <SectionTitle title="Project Showcase" />
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
                        transition:
                          "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                        "&:hover": {
                          transform: { xs: "none", md: "scale(1.04)" },
                          zIndex: 1,
                          boxShadow: theme.shadows[6],
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
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 700,
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
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Box sx={{ mt: 6 }}>
            <SectionTitle title="Key Features" />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 3,
              }}
            >
              {highlightFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </Box>
          </Box>

          {project.technicalFocus && project.technicalFocus.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <SectionTitle title="Technical Focus" />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {project.technicalFocus.map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      backgroundColor: alpha(
                        theme.palette.background.paper,
                        0.5
                      ),
                      borderRadius: "14px",
                      p: 2,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.08
                      )}`,
                    }}
                  >
                    <CheckCircleOutlineIcon
                      sx={{
                        color: theme.palette.primary.main,
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Box>
          <Box
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              borderRadius: "20px",
              p: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              position: { md: "sticky" },
              top: { md: 100 },
            }}
          >
            <Typography
              variant="h5"
              component="h3"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Project Stack
            </Typography>

            <Typography variant="body2" component="div">
              <Box sx={{ mb: 2 }}>
                <strong>Category:</strong> {project.category}
              </Box>

              {project.role && (
                <Box sx={{ mb: 2 }}>
                  <strong>Role:</strong> {project.role}
                </Box>
              )}

              {project.status && (
                <Box sx={{ mb: 2 }}>
                  <strong>Status:</strong> {project.status}
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <strong>Technologies:</strong>
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  {project.tags.map((tech: string) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </Box>
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Typography
      variant="h4"
      component="h2"
      gutterBottom
      sx={{
        fontWeight: 700,
        fontSize: {
          xs: "1.5rem",
          sm: "1.75rem",
          md: "2rem",
        },
        mb: 2,
      }}
    >
      {title}
    </Typography>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: alpha(theme.palette.background.paper, 0.5),
        borderRadius: "20px",
        p: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1, gap: 1 }}>
        <CheckCircleOutlineIcon
          sx={{
            color: theme.palette.primary.main,
            fontSize: 24,
            flexShrink: 0,
            mt: 0.2,
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {title}
        </Typography>
      </Box>

      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

function getFallbackFeatures(project: Project): FeatureItem[] {
  switch (project.slug) {
    case "wealth-building-investments-platform":
      return [
        {
          title: "Customer Portal",
          description:
            "Customer-facing workflows for viewing balances, transactions, savings, loans, and payment history.",
        },
        {
          title: "Admin Operations",
          description:
            "Admin tools for managing users, financial records, payments, and operational workflows.",
        },
        {
          title: "Automated Payments",
          description:
            "Payment scheduling, retry handling, and Stripe synchronization for financial workflows.",
        },
        {
          title: "Secure Access Control",
          description:
            "JWT authentication and role-based authorization for customer and admin access.",
        },
        {
          title: "Financial Modules",
          description:
            "Balances, loan repayments, savings contributions, payouts, transactions, and payment history.",
        },
        {
          title: "Backend API Layer",
          description:
            "NestJS API layer supporting business rules, data validation, and frontend-backend communication.",
        },
      ];

    case "draxhall-health":
      return [
        {
          title: "Healthcare Services",
          description:
            "Display of medical services and specialties offered by the health group.",
        },
        {
          title: "Doctor Profiles",
          description:
            "Profiles of medical professionals with expertise and qualifications.",
        },
        {
          title: "Patient Resources",
          description:
            "Accessible patient information, forms, and healthcare resources.",
        },
        {
          title: "Responsive Experience",
          description:
            "Clean responsive interface for patients across device sizes.",
        },
      ];

    default:
      return [
        {
          title: "Responsive Design",
          description: "Optimized for desktop, tablet, and mobile screens.",
        },
        {
          title: "Modern UI/UX",
          description: "Clean interface with smooth interactions and clear user flows.",
        },
        {
          title: "Performance",
          description: "Built with attention to loading, usability, and maintainability.",
        },
        {
          title: "Maintainable Structure",
          description:
            "Organized code and reusable patterns for easier long-term updates.",
        },
      ];
  }
}

"use client";

import { useState, type ReactElement } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GitHubIcon from "@mui/icons-material/GitHub";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import type { PublicProject } from "@/lib/cms/public-projects";
import MobileAppScreens from "@/components/MobileAppScreens/MobileAppScreens";
import ProjectVideoDialog from "@/components/Projects/ProjectVideoDialog";
import DetailPageToolbar from "@/components/DetailPageToolbar/DetailPageToolbar";

interface FeatureItem {
  title: string;
  description: string;
}

type ProjectDetailsClientProps = {
  project: PublicProject;
};

function initialsFor(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export default function ProjectDetailsClient({
  project,
}: ProjectDetailsClientProps) {
  const theme = useTheme();
  const router = useRouter();
  const [videoOpen, setVideoOpen] = useState(false);
  const hasMobileScreens =
    project.category === "Mobile Apps" && project.images.length > 0;
  const fallbackFeatures = getFallbackFeatures(project);
  const highlightFeatures: FeatureItem[] = project.highlights.length
    ? project.highlights.map((highlight) => ({
        title: highlight,
        description: "",
      }))
    : fallbackFeatures;
  const secondaryLinks = [
    {
      label: "GitHub",
      href: project.githubUrl,
      icon: <GitHubIcon />,
    },
    {
      label: "Demo",
      href: project.demoUrl,
      icon: <OpenInNewIcon />,
    },
    {
      label: "Case Study",
      href: project.caseStudyUrl,
      icon: <InsertDriveFileOutlinedIcon />,
    },
  ].filter((link): link is { label: string; href: string; icon: ReactElement } =>
    Boolean(link.href)
  );

  const handleBackClick = () => {
    router.push("/#projects");

    setTimeout(() => {
      const element = document.getElementById("projects");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <Box>
      <DetailPageToolbar
        backLabel="Back to Projects"
        onBack={handleBackClick}
        actions={
          <StackedActions
            siteUrl={project.siteUrl}
            secondaryLinks={secondaryLinks}
            videoUrl={project.videoUrl}
            onVideoClick={() => setVideoOpen(true)}
          />
        }
      />

      <Container
        maxWidth="lg"
        sx={{ pt: { xs: 3.5, md: 5 }, pb: { xs: 6, md: 8 } }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 800,
            mb: 2,
            fontSize: {
              xs: "1.75rem",
              sm: "2.4rem",
              md: "3rem",
            },
            lineHeight: { xs: 1.16, sm: 1.2 },
          }}
        >
          {project.title}
        </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: { xs: 3, sm: 4 } }}>
        {project.role && (
          <Chip
            label={project.role}
            sx={{
              height: { xs: 34, sm: 40 },
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
              height: { xs: 34, sm: 40 },
              borderColor: alpha(theme.palette.primary.main, 0.35),
              color: theme.palette.text.secondary,
              fontWeight: 600,
            }}
          />
        )}

        {project.tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            sx={{
              height: { xs: 32, sm: 40 },
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
            xs: hasMobileScreens ? "420px" : "220px",
            sm: hasMobileScreens ? "600px" : "400px",
            md: hasMobileScreens ? "600px" : "500px",
          },
          mb: { xs: 4, sm: 6 },
          borderRadius: { xs: "14px", sm: "20px" },
          overflow: "hidden",
          backgroundColor: alpha(theme.palette.common.black, 0.22),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        {hasMobileScreens ? (
          <MobileAppScreens images={project.images} title={project.title} />
        ) : project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.28
              )}, ${alpha(theme.palette.common.black, 0.72)})`,
            }}
          >
            <Box
              sx={{
                width: { xs: 112, sm: 144 },
                height: { xs: 112, sm: 144 },
                borderRadius: { xs: "22px", sm: "28px" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                backgroundColor: alpha(theme.palette.common.black, 0.28),
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 900,
                  letterSpacing: 0,
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                }}
              >
                {initialsFor(project.title)}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: { xs: 3, md: 4 },
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
            <Box sx={{ mt: { xs: 4, sm: 5 } }}>
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
            <Box sx={{ mt: { xs: 4, sm: 5 } }}>
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

          {project.showcase.length > 0 && (
            <Box sx={{ mt: { xs: 4.5, sm: 6 } }}>
              <SectionTitle title="Project Showcase" />
              <Grid container spacing={{ xs: 3, md: 4 }}>
                {project.showcase.map((feature) => (
                  <Grid
                    key={`${feature.image}-${feature.title}`}
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
                        minHeight: { xs: 320, sm: 360 },
                        maxHeight: { xs: 640, md: 760 },
                        aspectRatio: { xs: "4 / 5", sm: "16 / 10" },
                        mb: 1.5,
                        borderRadius: { xs: "10px", sm: "12px" },
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: alpha(theme.palette.common.white, 0.03),
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.22
                        )}`,
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
                        alt={feature.altText}
                        fill
                        sizes="(max-width: 900px) 100vw, 50vw"
                        style={{
                          objectFit: "contain",
                          objectPosition: "center",
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

                    {feature.description && (
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
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Box sx={{ mt: { xs: 4.5, sm: 6 } }}>
            <SectionTitle title="Key Features" />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: { xs: 2, sm: 3 },
              }}
            >
              {highlightFeatures.map((feature) => (
                <FeatureCard
                  key={`${feature.title}-${feature.description}`}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </Box>
          </Box>

          {project.technicalFocus.length > 0 && (
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

              {project.tags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <strong>Technologies:</strong>
                  <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                    {project.tags.map((tech) => (
                      <li key={tech}>{tech}</li>
                    ))}
                  </Box>
                </Box>
              )}
            </Typography>
          </Box>
        </Box>
      </Box>

      </Container>

      {project.videoUrl && (
        <ProjectVideoDialog
          open={videoOpen}
          onClose={() => setVideoOpen(false)}
          title={project.title}
          videoUrl={project.videoUrl}
        />
      )}
    </Box>
  );
}

function StackedActions({
  siteUrl,
  secondaryLinks,
  videoUrl,
  onVideoClick,
}: {
  siteUrl: string | null;
  secondaryLinks: { label: string; href: string; icon: ReactElement }[];
  videoUrl: string | null;
  onVideoClick: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        width: { xs: "100%", sm: "auto" },
        justifyContent: { xs: "stretch", sm: "flex-end" },
        gap: 1,
        "& .MuiButton-root": {
          flex: { xs: "1 1 calc(50% - 4px)", sm: "0 0 auto" },
          minWidth: 0,
          minHeight: { xs: 42, sm: 40 },
          px: { xs: 1.5, sm: 2.25 },
          whiteSpace: "nowrap",
        },
      }}
    >
      {siteUrl && (
        <Button
          variant="contained"
          color="primary"
          endIcon={<OpenInNewIcon />}
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            px: { xs: 1.5, sm: 3 },
            fontWeight: 600,
          }}
        >
          Visit Site
        </Button>
      )}

      {secondaryLinks.map((link) => (
        <Button
          key={link.label}
          variant="outlined"
          color="primary"
          startIcon={link.icon}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            px: 2.25,
            fontWeight: 600,
          }}
        >
          {link.label}
        </Button>
      ))}

      {videoUrl && (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<PlayCircleOutlineIcon />}
          onClick={onVideoClick}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            px: 2.25,
            fontWeight: 600,
          }}
        >
          Video
        </Button>
      )}
    </Box>
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
        mb: { xs: 1.5, sm: 2 },
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
        borderRadius: { xs: "14px", sm: "20px" },
        p: { xs: 2, sm: 3 },
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
            fontSize: { xs: 22, sm: 24 },
            flexShrink: 0,
            mt: 0.2,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            fontSize: { xs: "1.12rem", sm: "1.25rem" },
          }}
        >
          {title}
        </Typography>
      </Box>

      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}

function getFallbackFeatures(project: PublicProject): FeatureItem[] {
  return [
    {
      title: `${project.category} Experience`,
      description: "A focused interface shaped around the project goals and audience.",
    },
    {
      title: "Responsive Design",
      description: "Optimized for desktop, tablet, and mobile screens.",
    },
    {
      title: "Maintainable Structure",
      description:
        "Organized implementation patterns for easier long-term updates.",
    },
    {
      title: "Performance-minded UI",
      description: "Built with attention to loading, usability, and clear flows.",
    },
  ];
}

"use client";

import { useState, type ReactElement } from "react";
import type {
  PublicProject,
  PublicProjectShowcaseItem,
  PublicProjectVideo,
} from "@/lib/cms/public-projects";
import {
  Box,
  Button,
  Chip,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  GitHub as GitHubIcon,
  InsertDriveFileOutlined as InsertDriveFileOutlinedIcon,
  OpenInNew as OpenInNewIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import DetailPageToolbar from "@/components/DetailPageToolbar/DetailPageToolbar";
import ProjectShowcaseCarousel from "@/components/Projects/ProjectShowcaseCarousel";
import ProjectVideoDialog from "@/components/Projects/ProjectVideoDialog";
import ProjectVideosSection from "@/components/Projects/ProjectVideosSection";

type ProjectDetailsClientProps = {
  project: PublicProject;
};

interface FeatureItem {
  title: string;
  description: string;
}

export default function ProjectDetailsClient({ project }: ProjectDetailsClientProps) {
  const theme = useTheme();
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<PublicProjectVideo | null>(null);
  const showcaseItems: PublicProjectShowcaseItem[] =
    project.showcase.length > 0
      ? project.showcase
      : project.image
        ? [
            {
              title: project.title,
              description: project.status ?? "",
              image: project.image,
              altText: project.title,
            },
          ]
        : [];
  const highlightFeatures: FeatureItem[] = project.highlights.length
    ? project.highlights.map((highlight) => ({ title: highlight, description: "" }))
    : getFallbackFeatures(project);
  const secondaryLinks = [
    { label: "GitHub", href: project.githubUrl, icon: <GitHubIcon /> },
    { label: "Demo", href: project.demoUrl, icon: <OpenInNewIcon /> },
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
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <Box sx={{ minHeight: "100svh", bgcolor: "background.default" }}>
      <DetailPageToolbar
        backLabel="Back to Projects"
        onBack={handleBackClick}
        actions={
          <DetailActions
            siteUrl={project.siteUrl}
            secondaryLinks={secondaryLinks}
            hasVideos={project.videos.length > 0}
            onVideoClick={() =>
              document
                .getElementById("project-videos")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        }
      />

      <Container
        maxWidth={false}
        sx={{
          width: { xs: "calc(100% - 32px)", sm: "calc(100% - 48px)" },
          maxWidth: 1040,
          minWidth: 0,
          mx: "auto",
          px: 0,
          pt: { xs: 4, md: 5 },
          pb: { xs: 7, md: 10 },
        }}
      >
        <Typography
          component="h1"
          sx={{
            mb: 1.5,
            fontFamily: '"Montserrat", sans-serif',
            fontSize: { xs: "2rem", sm: "2.5rem", md: "2.35rem" },
            lineHeight: 1.12,
            fontWeight: 800,
            overflowWrap: "anywhere",
          }}
        >
          {project.title}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mb: { xs: 4, md: 4.5 } }}>
          {project.role && <MetaChip label={project.role} primary />}
          {project.status && <MetaChip label={project.status} />}
          {project.tags.map((tag) => (
            <MetaChip key={tag} label={tag} />
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 308px" },
            gap: { xs: 5, lg: 3.5 },
            alignItems: "start",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {showcaseItems.length > 0 && (
              <ContentSection title="Project Showcase">
                <ProjectShowcaseCarousel items={showcaseItems} />
              </ContentSection>
            )}

            <ProjectVideosSection videos={project.videos} onWatch={setSelectedVideo} />

            <ContentSection title="Overview">
              <BodyCopy>{project.description}</BodyCopy>
            </ContentSection>

            {project.role && (
              <ContentSection title="My Role">
                <BodyCopy>{project.role}</BodyCopy>
              </ContentSection>
            )}

            {project.impact && (
              <ContentSection title="Impact / Outcome">
                <BodyCopy>{project.impact}</BodyCopy>
              </ContentSection>
            )}

            <ContentSection title="Key Features">
              <ItemGrid>
                {highlightFeatures.map((feature) => (
                  <FeatureItemCard
                    key={`${feature.title}-${feature.description}`}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </ItemGrid>
            </ContentSection>

            {project.technicalFocus.length > 0 && (
              <ContentSection title="Technical Focus" last>
                <ItemGrid>
                  {project.technicalFocus.map((item) => (
                    <FeatureItemCard key={item} title={item} />
                  ))}
                </ItemGrid>
              </ContentSection>
            )}
          </Box>

          <ProjectStack project={project} />
        </Box>
      </Container>

      {selectedVideo && (
        <ProjectVideoDialog
          open
          onClose={() => setSelectedVideo(null)}
          title={selectedVideo.title}
          videoUrl={selectedVideo.videoUrl}
        />
      )}
    </Box>
  );
}

function MetaChip({ label, primary = false }: { label: string; primary?: boolean }) {
  const theme = useTheme();
  return (
    <Chip
      label={label}
      size="small"
      variant={primary ? "filled" : "outlined"}
      sx={{
        height: 25,
        maxWidth: "100%",
        borderRadius: 4,
        color: primary ? "primary.contrastText" : "text.secondary",
        bgcolor: primary ? "primary.main" : alpha(theme.palette.common.white, 0.025),
        borderColor: primary ? "primary.main" : alpha(theme.palette.common.white, 0.13),
        fontSize: "0.65rem",
        fontWeight: primary ? 800 : 600,
      }}
    />
  );
}

function ContentSection({
  title,
  children,
  last = false,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <Box sx={{ mb: last ? 0 : { xs: 5, md: 6 }, scrollMarginTop: 92 }}>
      <Typography
        component="h2"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          fontFamily: '"Montserrat", sans-serif',
          fontSize: "1.05rem",
          fontWeight: 800,
          "&::before": {
            content: '""',
            width: 3,
            height: 16,
            borderRadius: 4,
            bgcolor: "primary.main",
          },
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function BodyCopy({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ color: "text.secondary", fontSize: "0.82rem", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
      {children}
    </Typography>
  );
}

function ItemGrid({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
        gap: 1.25,
      }}
    >
      {children}
    </Box>
  );
}

function FeatureItemCard({ title, description }: { title: string; description?: string }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.3,
        minHeight: 52,
        p: 1.6,
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette.background.paper, 0.68),
        border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
      }}
    >
      <CheckCircleOutlineIcon sx={{ mt: 0.1, flexShrink: 0, color: "primary.main", fontSize: 15 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.35 }}>{title}</Typography>
        {description && (
          <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: "0.66rem", lineHeight: 1.45 }}>
            {description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function ProjectStack({ project }: { project: PublicProject }) {
  const theme = useTheme();
  const rows = [
    { label: "Category", value: project.category, accent: false },
    { label: "Role", value: project.role, accent: true },
    { label: "Status", value: project.status, accent: false },
  ].filter((row): row is { label: string; value: string; accent: boolean } => Boolean(row.value));

  return (
    <Box
      component="aside"
      sx={{
        position: { lg: "sticky" },
        top: { lg: 78 },
        p: 2.75,
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
        border: `1px solid ${alpha(theme.palette.common.white, 0.11)}`,
      }}
    >
      <Typography sx={{ mb: 2.3, color: "text.secondary", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em" }}>
        PROJECT STACK
      </Typography>
      {rows.map((row) => (
        <Box key={row.label} sx={{ py: 1.8, borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.08)}` }}>
          <Typography sx={{ mb: 0.8, color: "text.secondary", fontSize: "0.58rem", textTransform: "uppercase" }}>
            {row.label}
          </Typography>
          <Typography sx={{ color: row.accent ? "primary.main" : "text.primary", fontSize: "0.75rem", fontWeight: 800 }}>
            {row.value}
          </Typography>
        </Box>
      ))}
      {project.tags.length > 0 && (
        <Box sx={{ pt: 1.8 }}>
          <Typography sx={{ mb: 1.2, color: "text.secondary", fontSize: "0.58rem", textTransform: "uppercase" }}>
            Technologies
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.65 }}>
            {project.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  height: 23,
                  borderRadius: 1,
                  color: "text.secondary",
                  borderColor: alpha(theme.palette.common.white, 0.12),
                  fontSize: "0.6rem",
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function DetailActions({
  siteUrl,
  secondaryLinks,
  hasVideos,
  onVideoClick,
}: {
  siteUrl: string | null;
  secondaryLinks: { label: string; href: string; icon: ReactElement }[];
  hasVideos: boolean;
  onVideoClick: () => void;
}) {
  return (
    <Box sx={{ display: "flex", flexWrap: "nowrap", minWidth: 0, justifyContent: "flex-end", gap: 0.7 }}>
      {siteUrl && (
        <Button variant="outlined" endIcon={<OpenInNewIcon />} href={siteUrl} target="_blank" rel="noopener noreferrer">
          Visit Site
        </Button>
      )}
      {secondaryLinks.map((link) => (
        <Button key={link.label} variant="outlined" startIcon={link.icon} href={link.href} target="_blank" rel="noopener noreferrer">
          {link.label}
        </Button>
      ))}
      {hasVideos && (
        <Button variant="outlined" startIcon={<PlayCircleOutlineIcon />} onClick={onVideoClick}>
          Videos
        </Button>
      )}
    </Box>
  );
}

function getFallbackFeatures(project: PublicProject): FeatureItem[] {
  return [
    { title: `${project.category} Experience`, description: "A focused interface shaped around the project goals and audience." },
    { title: "Responsive Design", description: "Optimized for desktop, tablet, and mobile screens." },
    { title: "Maintainable Structure", description: "Organized implementation patterns for easier long-term updates." },
    { title: "Performance-minded UI", description: "Built with attention to loading, usability, and clear flows." },
  ];
}

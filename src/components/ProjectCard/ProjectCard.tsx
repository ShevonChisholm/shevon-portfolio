"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  useTheme,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { m as motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { PublicProject } from "@/lib/cms/public-projects";
import MobileAppScreens from "../MobileAppScreens/MobileAppScreens";

type ProjectCardProps = Pick<
  PublicProject,
  | "title"
  | "description"
  | "shortDescription"
  | "image"
  | "images"
  | "tags"
  | "slug"
  | "category"
  | "siteUrl"
  | "role"
  | "status"
  | "impact"
>;

function initialsFor(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export default function ProjectCard({
  title,
  description,
  shortDescription,
  image,
  images,
  tags,
  slug,
  category,
  siteUrl,
  role,
  status,
  impact,
}: ProjectCardProps) {
  const theme = useTheme();
  const hasMobileScreens = category === "Mobile Apps" && images.length > 0;
  const cardDescription = shortDescription ?? description;

  const handleVisitSite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (siteUrl) {
      window.open(siteUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ height: "100%", display: "flex" }}
    >
      <Link
        href={`/projects/${slug}`}
        style={{
          textDecoration: "none",
          height: "100%",
          width: "100%",
          display: "block",
        }}
      >
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: "20px",
            overflow: "hidden",
            cursor: "pointer",
            transition: "all 0.3s ease-in-out",
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: `0 20px 40px ${alpha(
                theme.palette.common.black,
                0.25
              )}`,
              borderColor: alpha(theme.palette.primary.main, 0.35),
              "& .project-image": {
                transform: "scale(1.08)",
              },
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              paddingTop: "56.25%",
              overflow: "hidden",
              flexShrink: 0,
              backgroundColor:
                category === "Mobile Apps" ? "rgba(0,0,0,0.05)" : "transparent",
            }}
          >
            {hasMobileScreens ? (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                <MobileAppScreens images={images} title={title} />
              </Box>
            ) : image ? (
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                className="project-image"
                style={{
                  transition: "transform 0.3s ease-in-out",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Box
                className="project-image"
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                  transition: "transform 0.3s ease-in-out",
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.26
                  )}, ${alpha(theme.palette.common.black, 0.64)})`,
                }}
              >
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.38
                    )}`,
                    backgroundColor: alpha(theme.palette.common.black, 0.28),
                    boxShadow: `0 20px 45px ${alpha(
                      theme.palette.common.black,
                      0.28
                    )}`,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 900,
                      letterSpacing: 0,
                    }}
                  >
                    {initialsFor(title)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <CardContent
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              flex: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1.5,
                gap: 1,
              }}
            >
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  lineHeight: 1.25,
                  minHeight: "2.5em",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {title}
              </Typography>

              {siteUrl && (
                <IconButton
                  onClick={handleVisitSite}
                  size="small"
                  aria-label={`Visit ${title}`}
                  sx={{
                    ml: 1,
                    flexShrink: 0,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {(role || status) && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                {role && (
                  <Chip
                    label={role}
                    size="small"
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    }}
                  />
                )}
                {status && (
                  <Chip
                    label={status}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: alpha(theme.palette.primary.main, 0.35),
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                    }}
                  />
                )}
              </Box>
            )}

            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                mb: 2,
                lineHeight: 1.6,
                flex: 1,
              }}
            >
              {cardDescription}
            </Typography>

            {impact && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  mb: 2,
                  fontStyle: "italic",
                }}
              >
                {impact}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mt: "auto",
              }}
            >
              {tags.slice(0, 6).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}


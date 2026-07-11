"use client";

import { forwardRef } from "react";
import type { PublicProject } from "@/lib/cms/public-projects";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { m as motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
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
  | "role"
  | "status"
>;

function initialsFor(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  (
    {
      title,
      description,
      shortDescription,
      image,
      images,
      tags,
      slug,
      category,
      role,
      status,
    },
    ref
  ) => {
    const theme = useTheme();
    const hasMobileScreens = category === "Mobile Apps" && images.length > 0;
    const cardDescription = shortDescription ?? description;
    const visibleTags = tags.slice(0, 5);
    const hiddenTagCount = Math.max(tags.length - visibleTags.length, 0);

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        style={{ height: "100%", minWidth: 0, display: "flex" }}
      >
        <Link
          href={`/projects/${slug}`}
          aria-label={`View ${title} project details`}
          style={{
            display: "flex",
            width: "100%",
            minWidth: 0,
            height: "100%",
            color: "inherit",
            textDecoration: "none",
          }}
        >
        <Card
          sx={{
            width: "100%",
            minWidth: 0,
            minHeight: 380,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            cursor: "pointer",
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.background.paper, 0.74),
            border: `1px solid ${alpha(theme.palette.common.white, 0.11)}`,
            transition: "transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
            "&:hover": {
              transform: "translateY(-4px)",
              borderColor: alpha(theme.palette.primary.main, 0.45),
              boxShadow: `0 18px 38px ${alpha(theme.palette.common.black, 0.25)}`,
              "& .project-image": { transform: "scale(1.035)" },
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              height: 180,
              flexShrink: 0,
              overflow: "hidden",
              bgcolor: alpha(theme.palette.common.white, 0.035),
            }}
          >
            {hasMobileScreens ? (
              <Box sx={{ position: "absolute", inset: 0 }}>
                <MobileAppScreens images={images} title={title} />
              </Box>
            ) : image ? (
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                className="project-image"
                style={{ objectFit: "cover", transition: "transform 220ms ease" }}
              />
            ) : (
              <Box
                className="project-image"
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  transition: "transform 220ms ease",
                  bgcolor: alpha(theme.palette.primary.main, 0.055),
                }}
              >
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 1.3,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, 0.22)}`,
                  }}
                >
                  {initialsFor(title)}
                </Box>
              </Box>
            )}
          </Box>

          <CardContent
            sx={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              minWidth: 0,
              p: 2.25,
              "&:last-child": { pb: 2.25 },
            }}
          >
            {(role || status) && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.65, mb: 1.35 }}>
                {role && (
                  <Chip
                    label={role}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 21,
                      maxWidth: "100%",
                      borderRadius: 1,
                      color: "primary.main",
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      fontSize: "0.58rem",
                      fontWeight: 700,
                    }}
                  />
                )}
                {status && (
                  <Chip
                    label={status}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 21,
                      maxWidth: "100%",
                      borderRadius: 1,
                      color: "text.secondary",
                      borderColor: alpha(theme.palette.common.white, 0.12),
                      fontSize: "0.58rem",
                    }}
                  />
                )}
              </Box>
            )}

            <Typography
              component="h3"
              sx={{
                color: "text.primary",
                fontFamily: '"Montserrat", sans-serif',
                fontSize: "0.9rem",
                fontWeight: 800,
                lineHeight: 1.35,
                minHeight: "2.7em",
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: "0.78rem",
                lineHeight: 1.55,
                minHeight: "3.1em",
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              {cardDescription}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.65, mt: "auto", pt: 2 }}>
              {visibleTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 21,
                    maxWidth: "100%",
                    borderRadius: 1,
                    color: "text.secondary",
                    bgcolor: alpha(theme.palette.common.white, 0.025),
                    borderColor: alpha(theme.palette.common.white, 0.12),
                    fontSize: "0.57rem",
                  }}
                />
              ))}
              {hiddenTagCount > 0 && (
                <Typography
                  component="span"
                  sx={{ alignSelf: "center", color: "text.secondary", fontSize: "0.62rem" }}
                >
                  +{hiddenTagCount}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
        </Link>
      </motion.div>
    );
  }
);

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;

"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { m } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import type { PublicBlogPost } from "@/lib/cms/public-blog";
import SectionContainer from "../SectionContainer/SectionContainer";

type BlogClientProps = {
  posts: PublicBlogPost[];
};

function displayDate(post: PublicBlogPost) {
  return format(new Date(post.publishedAt ?? post.createdAt), "MMM d, yyyy");
}

function initialsFor(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export default function BlogClient({ posts }: BlogClientProps) {
  const theme = useTheme();

  return (
    <SectionContainer
      id="blog"
      title="Blog"
      subtitle="Sharing insights and experiences from my journey in software development"
    >
      {posts.length === 0 ? (
        <Typography
          align="center"
          sx={{ color: "text.secondary", maxWidth: 640, mx: "auto" }}
        >
          Blog posts are being updated.
        </Typography>
      ) : (
        <Grid container spacing={4} sx={{ alignItems: "stretch" }}>
          {posts.map((post) => (
            <Grid
              key={post.id}
              size={{ xs: 12, sm: 6, md: 4 }}
              sx={{ display: "flex" }}
            >
              <Link
                href={`/blog/${post.slug}`}
                style={{
                  display: "flex",
                  flex: 1,
                  textDecoration: "none",
                  width: "100%",
                }}
              >
                <m.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  style={{ display: "flex", flex: 1 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      minHeight: { xs: 520, sm: 560, md: 590 },
                      width: "100%",
                      display: "flex",
                      flex: 1,
                      flexDirection: "column",
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                      transition:
                        "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        height: { xs: 220, sm: 210, md: 220 },
                        flexShrink: 0,
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      {post.coverImageUrl ? (
                        <Box
                          component="img"
                          src={post.coverImageUrl}
                          alt={post.title}
                          sx={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: `linear-gradient(135deg, ${alpha(
                              theme.palette.primary.main,
                              0.24
                            )}, ${alpha(theme.palette.common.black, 0.66)})`,
                          }}
                        >
                          <Box
                            sx={{
                              width: 82,
                              height: 82,
                              borderRadius: "22px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: `1px solid ${alpha(
                                theme.palette.primary.main,
                                0.36
                              )}`,
                              backgroundColor: alpha(
                                theme.palette.common.black,
                                0.24
                              ),
                            }}
                          >
                            <Typography
                              variant="h4"
                              sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 900,
                                letterSpacing: 0,
                              }}
                            >
                              {initialsFor(post.title) || <ArticleOutlinedIcon />}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                        minHeight: 20,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                        {displayDate(post)}
                        <Box component="span" sx={{ mx: 0.5 }}>
                          -
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 16 }} />
                          {post.readingTime}
                        </Box>
                      </Typography>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          mb: 1,
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          minHeight: "3.2em",
                          lineHeight: 1.6,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {post.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          minHeight: "4.8em",
                          lineHeight: 1.6,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {post.excerpt || post.content}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mb: 2,
                          minHeight: 64,
                          maxHeight: 64,
                          overflow: "hidden",
                          alignContent: "flex-start",
                        }}
                      >
                        {post.tags.slice(0, 4).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.text.primary,
                            }}
                          />
                        ))}
                      </Box>
                      <Button
                        component="span"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          alignSelf: "flex-start",
                          mt: "auto",
                          px: 0,
                          fontWeight: 700,
                        }}
                      >
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                </m.div>
              </Link>
            </Grid>
          ))}
        </Grid>
      )}
    </SectionContainer>
  );
}

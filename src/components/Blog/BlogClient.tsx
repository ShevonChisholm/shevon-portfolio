"use client";

import {
  Box,
  Card,
  Chip,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { m as motion } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import type { PublicBlogPost } from "@/lib/cms/public-blog";

type BlogClientProps = {
  posts: PublicBlogPost[];
};

function displayDate(post: PublicBlogPost) {
  return format(new Date(post.publishedAt ?? post.createdAt), "MMM d, yyyy");
}

export default function BlogClient({ posts }: BlogClientProps) {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="blog"
      sx={{
        py: { xs: 9, md: 12 },
        width: "100%",
        overflowX: "clip",
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <Container maxWidth={false} sx={{ width: "100%", maxWidth: 1040 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr minmax(260px, 340px)" },
            gap: { xs: 2.5, md: 5 },
            alignItems: "end",
            mb: { xs: 5, md: 6 },
          }}
        >
          <Box>
            <Box
              sx={{
                display: "inline-flex",
                px: 1.6,
                py: 0.55,
                mb: 1.4,
                borderRadius: 5,
                color: "primary.main",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                fontSize: "0.66rem",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              Blog
            </Box>
            <Typography
              component="h2"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: { xs: "2rem", sm: "2.35rem" },
                lineHeight: 1.08,
                fontWeight: 800,
              }}
            >
              Thoughts &amp;{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                writing
              </Box>
            </Typography>
          </Box>

          <Typography
            sx={{
              color: "text.secondary",
              textAlign: { xs: "left", md: "right" },
              fontSize: "0.86rem",
              lineHeight: 1.55,
              pb: 0.35,
            }}
          >
            Insights and experiences from my journey in software development
          </Typography>
        </Box>

        {posts.length === 0 ? (
          <Box
            sx={{
              py: 8,
              textAlign: "center",
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              bgcolor: alpha(theme.palette.background.paper, 0.42),
            }}
          >
            <Typography color="text.secondary">Blog posts are being updated.</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 2.5, md: 2.25 },
            }}
          >
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.18) }}
                style={{ minWidth: 0, height: "100%" }}
              >
                <Card
                  component={Link}
                  href={`/blog/${post.slug}`}
                  sx={{
                    display: "flex",
                    height: "100%",
                    minHeight: 380,
                    flexDirection: "column",
                    overflow: "hidden",
                    textDecoration: "none",
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.72),
                    border: `1px solid ${alpha(theme.palette.common.white, 0.11)}`,
                    boxShadow: "none",
                    transition:
                      "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: alpha(theme.palette.primary.main, 0.48),
                      boxShadow: `0 18px 44px ${alpha(theme.palette.common.black, 0.24)}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      height: 164,
                      flexShrink: 0,
                      overflow: "hidden",
                      bgcolor: alpha(theme.palette.common.black, 0.28),
                      borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
                    }}
                  >
                    {post.coverImageUrl ? (
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 340px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "grid",
                          placeItems: "center",
                          p: 3,
                          background: `linear-gradient(145deg, ${alpha(
                            theme.palette.primary.main,
                            0.14
                          )}, ${alpha(theme.palette.background.paper, 0.4)} 52%, ${alpha(
                            theme.palette.common.black,
                            0.3
                          )})`,
                        }}
                      >
                        <Typography
                          sx={{
                            maxWidth: 250,
                            textAlign: "center",
                            color: "text.secondary",
                            fontSize: "0.9rem",
                            lineHeight: 1.35,
                            fontWeight: 800,
                          }}
                        >
                          {post.title}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flex: 1,
                      minWidth: 0,
                      flexDirection: "column",
                      p: 2.25,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.4,
                        mb: 1.7,
                        color: "text.secondary",
                        fontSize: "0.64rem",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.55 }}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
                        {displayDate(post)}
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.55 }}>
                        <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} />
                        {post.readingTime}
                      </Box>
                    </Box>

                    <Typography
                      component="h3"
                      sx={{
                        mb: 1.15,
                        minHeight: "2.8em",
                        color: "text.primary",
                        fontSize: "0.88rem",
                        lineHeight: 1.4,
                        fontWeight: 800,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {post.title}
                    </Typography>

                    <Typography
                      sx={{
                        mb: 2,
                        minHeight: "3.1em",
                        color: "text.secondary",
                        fontSize: "0.78rem",
                        lineHeight: 1.55,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {post.excerpt || post.content}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 0.65,
                        mt: "auto",
                        minHeight: 24,
                      }}
                    >
                      {post.tags.slice(0, 4).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            height: 21,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.common.white, 0.025),
                            color: "text.secondary",
                            border: `1px solid ${alpha(theme.palette.common.white, 0.11)}`,
                            fontSize: "0.58rem",
                          }}
                        />
                      ))}
                      {post.tags.length > 4 && (
                        <Typography sx={{ color: "text.secondary", fontSize: "0.6rem" }}>
                          +{post.tags.length - 4}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}

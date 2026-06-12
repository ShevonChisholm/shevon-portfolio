"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { m as motion } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PublicBlogPost } from "@/lib/cms/public-blog";
import DetailPageToolbar from "@/components/DetailPageToolbar/DetailPageToolbar";

type BlogPostContentProps = {
  post: PublicBlogPost;
};

type ContentBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

function displayDate(post: PublicBlogPost) {
  return format(new Date(post.publishedAt ?? post.createdAt), "MMM d, yyyy");
}

function parseMarkdownLite(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      listItems.push(line.slice(2).trim());
      continue;
    }

    flushList();

    if (line.startsWith("### ")) {
      flushParagraph();
      blocks.push({ type: "heading", level: 3, text: line.slice(4).trim() });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push({ type: "heading", level: 2, text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      blocks.push({ type: "heading", level: 1, text: line.slice(2).trim() });
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      blocks.push({ type: "quote", text: line.slice(2).trim() });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function BlogCover({
  post,
  imageError,
  onImageError,
}: {
  post: PublicBlogPost;
  imageError: boolean;
  onImageError: () => void;
}) {
  const theme = useTheme();
  const hasImage = Boolean(post.coverImageUrl) && !imageError;

  return (
    <Container maxWidth={false} sx={{ width: "100%", maxWidth: 800, mb: { xs: 5, md: 7 } }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: { xs: "4 / 3", sm: "16 / 7" },
          overflow: "hidden",
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
          background: `linear-gradient(145deg, ${alpha(
            theme.palette.primary.main,
            0.13
          )}, ${alpha(theme.palette.background.paper, 0.66)} 58%, ${alpha(
            theme.palette.common.black,
            0.38
          )})`,
        }}
      >
        {hasImage ? (
          <Image
            src={post.coverImageUrl ?? ""}
            alt={post.title}
            onError={onImageError}
            fill
            priority
            sizes="(max-width: 850px) 100vw, 800px"
            style={{ objectFit: "contain", objectPosition: "center" }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              p: { xs: 3, sm: 6 },
              textAlign: "center",
            }}
          >
            <Box>
              <Typography
                sx={{
                  maxWidth: 620,
                  mx: "auto",
                  color: "text.secondary",
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: { xs: "1.25rem", sm: "1.7rem" },
                  lineHeight: 1.35,
                  fontWeight: 800,
                  textWrap: "balance",
                }}
              >
                {post.title}
              </Typography>
              <Typography sx={{ mt: 1.5, color: "primary.main", fontSize: "0.74rem" }}>
                {post.authorName}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const theme = useTheme();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const blocks = useMemo(() => parseMarkdownLite(post.content), [post.content]);

  const handleBackClick = () => {
    router.push("/#blog");
    setTimeout(() => document.getElementById("blog")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DetailPageToolbar backLabel="Back to Blog" onBack={handleBackClick} />

      <Container maxWidth={false} sx={{ width: "100%", maxWidth: 800, pt: { xs: 5, md: 6 } }}>
        <Box sx={{ mb: { xs: 4, md: 5 } }}>
          {post.tags.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.8, mb: 2.6, flexWrap: "wrap" }}>
              {post.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    height: 24,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.common.white, 0.025),
                    color: "text.secondary",
                    border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
                    fontSize: "0.66rem",
                  }}
                />
              ))}
            </Box>
          )}

          <Typography
            component="h1"
            sx={{
              maxWidth: 760,
              mb: 2,
              color: "text.primary",
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: "2.25rem", sm: "2.75rem", md: "3rem" },
              lineHeight: 1.08,
              fontWeight: 800,
              textWrap: "balance",
            }}
          >
            {post.title}
          </Typography>

          {post.excerpt && (
            <Typography
              sx={{
                maxWidth: 720,
                mb: 3,
                color: "text.secondary",
                fontSize: { xs: "0.95rem", md: "1rem" },
                lineHeight: 1.7,
              }}
            >
              {post.excerpt}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.4, sm: 2.2 },
              flexWrap: "wrap",
              color: "text.secondary",
              fontSize: "0.72rem",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.65 }}>
              <PersonOutlineIcon sx={{ fontSize: 14 }} />
              {post.authorName}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.65 }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
              {displayDate(post)}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.65 }}>
              <AccessTimeOutlinedIcon sx={{ fontSize: 14 }} />
              {post.readingTime}
            </Box>
          </Box>

          <Box sx={{ mt: 3.5, borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }} />
        </Box>
      </Container>

      <BlogCover post={post} imageError={imageError} onImageError={() => setImageError(true)} />

      <Container maxWidth={false} sx={{ width: "100%", maxWidth: 680, pb: { xs: 8, md: 10 } }}>
        {blocks.length === 0 ? (
          <Typography color="text.secondary">This article is being prepared.</Typography>
        ) : (
          <Box>
            {blocks.map((block, index) => {
              if (block.type === "heading") {
                return (
                  <Typography
                    key={`${block.type}-${index}`}
                    component={`h${block.level}`}
                    sx={{
                      position: "relative",
                      mt: index === 0 ? 0 : { xs: 4.5, md: 5.5 },
                      mb: 2.2,
                      pl: 1.8,
                      color: "text.primary",
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize:
                        block.level === 1
                          ? { xs: "1.45rem", md: "1.7rem" }
                          : block.level === 2
                            ? { xs: "1.3rem", md: "1.5rem" }
                            : { xs: "1.16rem", md: "1.3rem" },
                      lineHeight: 1.3,
                      fontWeight: 800,
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "0.12em",
                        bottom: "0.12em",
                        left: 0,
                        width: 3,
                        borderRadius: 4,
                        bgcolor: "primary.main",
                      },
                    }}
                  >
                    {block.text}
                  </Typography>
                );
              }

              if (block.type === "quote") {
                return (
                  <Box
                    key={`${block.type}-${index}`}
                    sx={{
                      my: 4,
                      pl: 2.5,
                      borderLeft: `3px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: "0.95rem", md: "1rem" },
                        lineHeight: 1.8,
                        fontStyle: "italic",
                      }}
                    >
                      {block.text}
                    </Typography>
                  </Box>
                );
              }

              if (block.type === "list") {
                return (
                  <Box
                    component="ul"
                    key={`${block.type}-${index}`}
                    sx={{ pl: 2.5, mb: 3, color: "text.secondary" }}
                  >
                    {block.items.map((item) => (
                      <Typography
                        component="li"
                        key={item}
                        sx={{ mb: 1, fontSize: "0.92rem", lineHeight: 1.8 }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                );
              }

              return (
                <Typography
                  key={`${block.type}-${index}`}
                  sx={{
                    mb: 2.6,
                    color: "text.secondary",
                    fontSize: { xs: "0.94rem", md: "0.97rem" },
                    lineHeight: 1.85,
                  }}
                >
                  {block.text}
                </Typography>
              );
            })}
          </Box>
        )}

        <Box
          sx={{
            mt: { xs: 6, md: 7 },
            pt: 3.5,
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2.5,
            borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          }}
        >
          <Box>
            <Typography sx={{ color: "text.primary", fontSize: "0.78rem", fontWeight: 800 }}>
              Written by {post.authorName}
            </Typography>
            <Typography sx={{ mt: 0.3, color: "text.secondary", fontSize: "0.68rem" }}>
              Full-Stack Engineer
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
            sx={{
              minHeight: 36,
              px: 1.8,
              color: "text.secondary",
              borderColor: alpha(theme.palette.common.white, 0.16),
              fontSize: "0.72rem",
              "&:hover": {
                color: "primary.main",
                borderColor: "primary.main",
              },
            }}
          >
            Back to Blog
          </Button>
        </Box>
      </Container>
    </motion.main>
  );
}

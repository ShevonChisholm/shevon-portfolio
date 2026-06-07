"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { m as motion } from "framer-motion";
import { format } from "date-fns";
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
  return format(new Date(post.publishedAt ?? post.createdAt), "MMMM d, yyyy");
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
    <Container maxWidth="lg" sx={{ mb: { xs: 4, md: 5 } }}>
      <Box
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: { xs: 1.5, md: 2 },
          border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
          backgroundColor: alpha(theme.palette.common.black, 0.5),
          boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.32)}`,
        }}
      >
        {hasImage ? (
          <Box
            component="img"
            src={post.coverImageUrl ?? ""}
            alt={post.title}
            onError={onImageError}
            sx={{
              display: "block",
              width: "100%",
              height: "auto",
              maxHeight: { xs: 560, md: 760 },
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        ) : (
          <Box
            sx={{
              minHeight: { xs: 300, md: 460 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `radial-gradient(circle at 50% 35%, ${alpha(
                theme.palette.primary.main,
                0.26
              )}, transparent 34%), linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.16
              )}, ${alpha(theme.palette.common.black, 0.82)})`,
            }}
          >
            <ArticleOutlinedIcon
              sx={{
                fontSize: { xs: 92, md: 132 },
                color: alpha(theme.palette.primary.main, 0.56),
              }}
            />
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

    setTimeout(() => {
      document.getElementById("blog")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <DetailPageToolbar
        backLabel="Back to Blog"
        onBack={handleBackClick}
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 5 } }}>
        <Box sx={{ maxWidth: 980, mb: { xs: 4, md: 5 } }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.35rem", sm: "3rem", md: "4.25rem" },
              lineHeight: { xs: 1.12, md: 1.08 },
              mb: 2,
              fontWeight: 900,
              letterSpacing: 0,
              color: "text.primary",
              textWrap: "balance",
            }}
          >
            {post.title}
          </Typography>

          {post.excerpt && (
            <Typography
              sx={{
                maxWidth: 780,
                mb: 2.5,
                color: "text.secondary",
                fontSize: { xs: "1rem", md: "1.2rem" },
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
              gap: { xs: 1.25, sm: 2 },
              flexWrap: "wrap",
              color: "text.secondary",
            }}
          >
            <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
              {post.authorName}
            </Typography>
            <Typography>{displayDate(post)}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <AccessTimeIcon sx={{ fontSize: 19, color: "primary.main" }} />
              <Typography>{post.readingTime}</Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      <BlogCover
        post={post}
        imageError={imageError}
        onImageError={() => setImageError(true)}
      />

      <Container maxWidth="md" sx={{ pb: { xs: 8, md: 12 } }}>
        {post.tags.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, mb: 4, flexWrap: "wrap" }}>
            {post.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: "text.primary",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                }}
              />
            ))}
          </Box>
        )}

        {blocks.length === 0 ? (
          <Typography color="text.secondary">
            This article is being prepared.
          </Typography>
        ) : (
          <Box>
            {blocks.map((block, index) => {
              if (block.type === "heading") {
                const variant =
                  block.level === 1 ? "h3" : block.level === 2 ? "h4" : "h5";

                return (
                  <Typography
                    key={`${block.type}-${index}`}
                    variant={variant}
                    component={`h${block.level}`}
                    sx={{
                      mt: index === 0 ? 0 : 5,
                      mb: 2,
                      fontWeight: 800,
                      letterSpacing: 0,
                      color: "text.primary",
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
                      pl: 3,
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: "1.05rem", md: "1.18rem" },
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
                    sx={{ pl: 3, mb: 3, color: "text.secondary" }}
                  >
                    {block.items.map((item) => (
                      <Typography
                        component="li"
                        key={item}
                        sx={{
                          mb: 1,
                          fontSize: { xs: "1rem", md: "1.08rem" },
                          lineHeight: 1.75,
                        }}
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
                    mb: 2.5,
                    color: "text.secondary",
                    fontSize: { xs: "1rem", md: "1.1rem" },
                    lineHeight: 1.85,
                  }}
                >
                  {block.text}
                </Typography>
              );
            })}
          </Box>
        )}
      </Container>
    </motion.main>
  );
}

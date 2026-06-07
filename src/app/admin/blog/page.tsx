"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { BlogPost } from "@/types/cms";
import {
  deleteBlogPost,
  listBlogPosts,
  updateBlogPostPublished,
  type BlogPostFilter,
} from "@/lib/cms/blog";

type Message = {
  type: "success" | "error";
  text: string;
} | null;

function formatDate(value: string | null) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminBlogPage() {
  const theme = useTheme();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState<BlogPostFilter>("all");
  const [message, setMessage] = useState<Message>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadPosts = async (nextFilter = filter) => {
    setIsLoading(true);
    setMessage(null);

    try {
      setPosts(await listBlogPosts(nextFilter));
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Unable to load blog posts.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts(filter);
  }, [filter]);

  const runAction = (action: () => Promise<string>) => {
    setMessage(null);
    startTransition(async () => {
      try {
        const text = await action();
        setMessage({ type: "success", text });
        await loadPosts();
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to update blog post.",
        });
      }
    });
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", sm: "flex-start" },
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Blog
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            Manage portfolio blog posts, cover images, tags, publishing, and SEO.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/blog/new"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ alignSelf: { xs: "stretch", sm: "center" }, fontWeight: 800 }}
        >
          New Post
        </Button>
      </Stack>

      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, value: BlogPostFilter | null) => {
          if (value) setFilter(value);
        }}
        size="small"
        sx={{
          alignSelf: "flex-start",
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          "& .MuiToggleButton-root": {
            px: 2,
            textTransform: "none",
          },
        }}
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="published">Published</ToggleButton>
        <ToggleButton value="drafts">Drafts</ToggleButton>
      </ToggleButtonGroup>

      {message && <Alert severity={message.type}>{message.text}</Alert>}

      {isLoading ? (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress color="primary" />
        </Stack>
      ) : posts.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.82),
          }}
        >
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              No blog posts found
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              Create the first CMS-managed blog post.
            </Typography>
            <Button component={Link} href="/admin/blog/new" variant="contained">
              Create Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {posts.map((post) => (
            <Grid key={post.id} size={{ xs: 12, lg: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.82),
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack spacing={2.5}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                          {post.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", overflowWrap: "anywhere" }}
                        >
                          /blog/{post.slug}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        icon={
                          post.is_published ? (
                            <VisibilityOutlinedIcon />
                          ) : (
                            <VisibilityOffOutlinedIcon />
                          )
                        }
                        label={post.is_published ? "Published" : "Draft"}
                        color={post.is_published ? "success" : "default"}
                        variant={post.is_published ? "filled" : "outlined"}
                      />
                    </Stack>

                    <Typography
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.7,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {post.excerpt || post.content}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                      {(post.tags ?? []).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Published
                        </Typography>
                        <Typography sx={{ fontWeight: 800 }}>
                          {formatDate(post.published_at)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Reading
                        </Typography>
                        <Typography sx={{ fontWeight: 800 }}>
                          {post.reading_time || "Auto"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Created
                        </Typography>
                        <Typography sx={{ fontWeight: 800 }}>
                          {formatDate(post.created_at)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Author
                        </Typography>
                        <Typography sx={{ fontWeight: 800 }}>
                          {post.author_name || "None"}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      sx={{
                        alignItems: { xs: "stretch", sm: "center" },
                        justifyContent: "space-between",
                      }}
                    >
                      <Tooltip title="Publish or unpublish">
                        <Switch
                          checked={post.is_published}
                          disabled={isPending}
                          onChange={(event) =>
                            runAction(async () => {
                              await updateBlogPostPublished(post, event.target.checked);
                              return event.target.checked
                                ? "Blog post published."
                                : "Blog post unpublished.";
                            })
                          }
                          inputProps={{ "aria-label": "Publish blog post" }}
                        />
                      </Tooltip>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        <Tooltip title="Edit blog post">
                          <IconButton
                            component={Link}
                            href={`/admin/blog/${post.id}/edit`}
                            color="primary"
                          >
                            <EditOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete blog post">
                          <span>
                            <IconButton
                              color="error"
                              disabled={isPending}
                              onClick={() => {
                                if (window.confirm(`Delete "${post.title}"?`)) {
                                  runAction(async () => {
                                    await deleteBlogPost(post.id);
                                    return "Blog post deleted.";
                                  });
                                }
                              }}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}

"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Rating,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FeaturedPlayListOutlinedIcon from "@mui/icons-material/FeaturedPlayListOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import UnpublishedOutlinedIcon from "@mui/icons-material/UnpublishedOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { Testimonial } from "@/types/cms";
import {
  deleteTestimonial,
  listTestimonials,
  updateTestimonialFlags,
  type TestimonialFilter,
} from "@/lib/cms/testimonials";

type PageMessage = {
  type: "success" | "error";
  text: string;
} | null;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function roleCompany(item: Testimonial) {
  return [item.role, item.company].filter(Boolean).join(" at ");
}

export default function AdminTestimonialsPage() {
  const theme = useTheme();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filter, setFilter] = useState<TestimonialFilter>("all");
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);
  const [message, setMessage] = useState<PageMessage>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadTestimonials = useCallback(async (nextFilter = filter) => {
    setIsLoading(true);
    setMessage(null);

    try {
      setTestimonials(await listTestimonials(nextFilter));
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to load testimonials.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadTestimonials(filter);
  }, [filter, loadTestimonials]);

  const runAction = (action: () => Promise<string>) => {
    setMessage(null);
    startTransition(async () => {
      try {
        const text = await action();
        setMessage({ type: "success", text });
        await loadTestimonials();
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to update testimonial.",
        });
      }
    });
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", lg: "flex-start" },
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Testimonials
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            Review client feedback and control what appears on the public portfolio.
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, value: TestimonialFilter | null) => {
            if (value) setFilter(value);
          }}
          size="small"
          sx={{
            alignSelf: { xs: "stretch", lg: "center" },
            overflowX: "auto",
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            "& .MuiToggleButton-root": {
              px: 2,
              whiteSpace: "nowrap",
              textTransform: "none",
            },
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="unpublished">Unpublished</ToggleButton>
          <ToggleButton value="published">Published</ToggleButton>
          <ToggleButton value="featured">Featured</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {message && <Alert severity={message.type}>{message.text}</Alert>}

      {isLoading ? (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress color="primary" />
        </Stack>
      ) : testimonials.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.82),
          }}
        >
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              No testimonials found
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              Client feedback submissions will appear here for review.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5} sx={{ alignItems: "stretch" }}>
          {testimonials.map((item) => (
            <Grid key={item.id} size={{ xs: 12, xl: 6 }} sx={{ display: "flex" }}>
              <Card
                elevation={0}
                sx={{
                  width: "100%",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.82),
                }}
              >
                <CardContent
                  sx={{
                    height: "100%",
                    p: { xs: 2.5, sm: 3 },
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Stack spacing={2} sx={{ height: "100%" }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {item.name}
                        </Typography>
                        {roleCompany(item) && (
                          <Typography variant="body2" sx={{ color: "primary.main" }}>
                            {roleCompany(item)}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        <Chip
                          size="small"
                          label={item.is_published ? "Published" : "Unpublished"}
                          color={item.is_published ? "success" : "default"}
                        />
                        {item.is_featured && (
                          <Chip size="small" label="Featured" color="primary" />
                        )}
                        {!item.consent_to_publish && (
                          <Chip size="small" label="No consent" color="warning" />
                        )}
                      </Stack>
                    </Stack>

                    {item.rating && <Rating value={item.rating} readOnly size="small" />}

                    {item.project_name && (
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Project: {item.project_name}
                      </Typography>
                    )}

                    <Typography
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.7,
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        flex: 1,
                      }}
                    >
                      {item.feedback}
                    </Typography>

                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {formatDate(item.created_at)}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <Tooltip title="View details">
                        <IconButton color="primary" onClick={() => setSelectedTestimonial(item)}>
                          <VisibilityOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={item.is_published ? "Unpublish" : "Publish"}>
                        <span>
                          <IconButton
                            disabled={isPending || (!item.consent_to_publish && !item.is_published)}
                            onClick={() =>
                              runAction(async () => {
                                await updateTestimonialFlags(item.id, {
                                  is_published: !item.is_published,
                                });
                                return item.is_published
                                  ? "Testimonial unpublished."
                                  : "Testimonial published.";
                              })
                            }
                          >
                            {item.is_published ? (
                              <UnpublishedOutlinedIcon />
                            ) : (
                              <PublishOutlinedIcon />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={item.is_featured ? "Remove featured" : "Feature"}>
                        <IconButton
                          color={item.is_featured ? "primary" : "default"}
                          disabled={isPending}
                          onClick={() =>
                            runAction(async () => {
                              await updateTestimonialFlags(item.id, {
                                is_featured: !item.is_featured,
                              });
                              return item.is_featured
                                ? "Testimonial removed from featured."
                                : "Testimonial featured.";
                            })
                          }
                        >
                          <FeaturedPlayListOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete testimonial">
                        <IconButton
                          color="error"
                          disabled={isPending}
                          onClick={() => {
                            if (window.confirm(`Delete testimonial from ${item.name}?`)) {
                              runAction(async () => {
                                await deleteTestimonial(item.id);
                                return "Testimonial deleted.";
                              });
                            }
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={Boolean(selectedTestimonial)}
        onClose={() => setSelectedTestimonial(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedTestimonial && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>Testimonial Details</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {selectedTestimonial.name}
                  </Typography>
                  {selectedTestimonial.email && (
                    <Typography sx={{ color: "primary.main", overflowWrap: "anywhere" }}>
                      {selectedTestimonial.email}
                    </Typography>
                  )}
                  {roleCompany(selectedTestimonial) && (
                    <Typography sx={{ color: "text.secondary" }}>
                      {roleCompany(selectedTestimonial)}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {formatDate(selectedTestimonial.created_at)}
                  </Typography>
                </Box>

                {selectedTestimonial.rating && (
                  <Rating value={selectedTestimonial.rating} readOnly />
                )}

                {selectedTestimonial.project_name && (
                  <Typography>
                    <strong>Project:</strong> {selectedTestimonial.project_name}
                  </Typography>
                )}

                <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                  {selectedTestimonial.feedback}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  <Chip
                    size="small"
                    label={
                      selectedTestimonial.consent_to_publish
                        ? "Consent granted"
                        : "No publishing consent"
                    }
                    color={
                      selectedTestimonial.consent_to_publish ? "success" : "warning"
                    }
                  />
                  <Chip
                    size="small"
                    label={selectedTestimonial.is_published ? "Published" : "Unpublished"}
                  />
                  {selectedTestimonial.is_featured && (
                    <Chip size="small" label="Featured" color="primary" />
                  )}
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTestimonial(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
}

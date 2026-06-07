"use client";

import { useEffect, useState, useTransition } from "react";
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
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { ContactMessage } from "@/types/cms";
import {
  deleteContactMessage,
  listContactMessages,
  updateContactMessageFlags,
  type ContactMessageFilter,
} from "@/lib/cms/messages";

type Message = {
  type: "success" | "error";
  text: string;
} | null;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminMessagesPage() {
  const theme = useTheme();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<ContactMessageFilter>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadMessages = async (nextFilter = filter) => {
    setIsLoading(true);
    setMessage(null);

    try {
      setMessages(await listContactMessages(nextFilter));
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to load messages.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages(filter);
  }, [filter]);

  const runAction = (action: () => Promise<string>) => {
    setMessage(null);
    startTransition(async () => {
      try {
        const text = await action();
        setMessage({ type: "success", text });
        await loadMessages();
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error ? error.message : "Unable to update message.",
        });
      }
    });
  };

  const handleView = (item: ContactMessage) => {
    setSelectedMessage(item);
    if (!item.is_read) {
      runAction(async () => {
        await updateContactMessageFlags(item.id, { is_read: true });
        return "Message marked as read.";
      });
    }
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
            Contact Messages
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            Review portfolio contact form submissions and manage follow-up status.
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, value: ContactMessageFilter | null) => {
            if (value) setFilter(value);
          }}
          size="small"
          sx={{
            alignSelf: { xs: "stretch", sm: "center" },
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            "& .MuiToggleButton-root": {
              px: 2,
              textTransform: "none",
            },
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="unread">Unread</ToggleButton>
          <ToggleButton value="archived">Archived</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {message && <Alert severity={message.type}>{message.text}</Alert>}

      {isLoading ? (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress color="primary" />
        </Stack>
      ) : messages.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.82),
          }}
        >
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              No messages found
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              New contact form submissions will appear here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {messages.map((item) => (
            <Grid key={item.id} size={{ xs: 12, lg: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.82),
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack spacing={2}>
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
                        <Typography
                          variant="body2"
                          sx={{ color: "primary.main", overflowWrap: "anywhere" }}
                        >
                          {item.email}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          size="small"
                          label={item.is_read ? "Read" : "Unread"}
                          color={item.is_read ? "default" : "primary"}
                          icon={item.is_read ? <DraftsOutlinedIcon /> : <EmailOutlinedIcon />}
                        />
                        {item.archived && (
                          <Chip
                            size="small"
                            label="Archived"
                            variant="outlined"
                            icon={<ArchiveOutlinedIcon />}
                          />
                        )}
                      </Stack>
                    </Stack>

                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>
                        {item.subject || "No subject"}
                      </Typography>
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
                        {item.message}
                      </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {formatDate(item.created_at)}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <Tooltip title="View message">
                        <IconButton color="primary" onClick={() => handleView(item)}>
                          <VisibilityOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={item.is_read ? "Mark unread" : "Mark read"}>
                        <IconButton
                          disabled={isPending}
                          onClick={() =>
                            runAction(async () => {
                              await updateContactMessageFlags(item.id, {
                                is_read: !item.is_read,
                              });
                              return !item.is_read
                                ? "Message marked as read."
                                : "Message marked as unread.";
                            })
                          }
                        >
                          {item.is_read ? <EmailOutlinedIcon /> : <DraftsOutlinedIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={item.archived ? "Unarchive" : "Archive"}>
                        <IconButton
                          disabled={isPending}
                          onClick={() =>
                            runAction(async () => {
                              await updateContactMessageFlags(item.id, {
                                archived: !item.archived,
                              });
                              return !item.archived
                                ? "Message archived."
                                : "Message unarchived.";
                            })
                          }
                        >
                          {item.archived ? <UnarchiveOutlinedIcon /> : <ArchiveOutlinedIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete message">
                        <IconButton
                          color="error"
                          disabled={isPending}
                          onClick={() => {
                            if (window.confirm(`Delete message from ${item.name}?`)) {
                              runAction(async () => {
                                await deleteContactMessage(item.id);
                                return "Message deleted.";
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
        open={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedMessage && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>
              {selectedMessage.subject || "Message Details"}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>
                    {selectedMessage.name}
                  </Typography>
                  <Typography sx={{ color: "primary.main", overflowWrap: "anywhere" }}>
                    {selectedMessage.email}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {formatDate(selectedMessage.created_at)}
                  </Typography>
                </Box>
                <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                  {selectedMessage.message}
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedMessage(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
}

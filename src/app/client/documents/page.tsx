"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import {
  EmptyPanel,
  formatShortDate,
  PageIntro,
  PortalPanel,
  PortalStatCard,
  StatusChip,
} from "@/components/client/portal/ClientPortalShared";
import type {
  ClientPortalProject,
  ClientProjectDocument,
} from "@/lib/api/client-portal-api";
import {
  useCreateClientDocumentMutation,
  useListClientDocumentsQuery,
  useListClientPortalProjectsQuery,
} from "@/lib/api/client-portal-api";

const documentTypes = [
  "Proposal",
  "Invoice",
  "Receipt",
  "Contract",
  "Scope Document",
  "Brand Asset",
  "Client Upload",
  "Project File",
  "Handoff Document",
  "Launch Checklist",
  "Other",
];

function projectTitleById(projects: ClientPortalProject[]) {
  return new Map(
    projects.map((project) => [
      project.id,
      project.title || project.name || "Client project",
    ])
  );
}

function isRecent(value?: string | null) {
  if (!value) return false;
  const createdAt = new Date(value).getTime();
  if (Number.isNaN(createdAt)) return false;
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;
  return Date.now() - createdAt <= thirtyDays;
}

function documentIcon(documentType?: string | null) {
  if (documentType === "Invoice" || documentType === "Receipt") {
    return <ReceiptLongOutlinedIcon />;
  }
  if (documentType === "Contract" || documentType === "Scope Document") {
    return <DescriptionOutlinedIcon />;
  }
  return <InsertDriveFileOutlinedIcon />;
}

function shortUrl(value?: string | null) {
  if (!value) return "No file link";

  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return value;
  }
}

export default function ClientDocumentsPage() {
  const theme = useTheme();
  const [filter, setFilter] = useState("All");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documentType, setDocumentType] = useState("Client Upload");
  const [fileUrl, setFileUrl] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const {
    data: documents = [],
    error: documentsError,
    isLoading,
    isFetching,
    refetch,
  } = useListClientDocumentsQuery();
  const { data: projects = [], error: projectsError } =
    useListClientPortalProjectsQuery();
  const [createDocument, createState] = useCreateClientDocumentMutation();
  const loading = isLoading || isFetching;
  const projectTitles = useMemo(() => projectTitleById(projects), [projects]);

  const filteredDocuments = useMemo(() => {
    const sorted = [...documents].sort((a, b) => {
      const first = a.created_at ? new Date(a.created_at).getTime() : 0;
      const second = b.created_at ? new Date(b.created_at).getTime() : 0;
      return second - first;
    });

    if (filter === "All") return sorted;
    return sorted.filter((document) => document.document_type === filter);
  }, [documents, filter]);

  const stats = useMemo(() => {
    const projectIds = new Set(
      documents
        .map((document) => document.client_project_id)
        .filter((id): id is string => Boolean(id))
    );

    return {
      total: documents.length,
      recent: documents.filter((document) => isRecent(document.created_at)).length,
      sharedByClient: documents.filter(
        (document) => document.uploaded_by_type === "Client"
      ).length,
      projects: projectIds.size,
    };
  }, [documents]);

  const resetDialog = () => {
    setUploadOpen(false);
    setProjectId("");
    setTitle("");
    setDescription("");
    setDocumentType("Client Upload");
    setFileUrl("");
  };

  const handleSubmit = async () => {
    if (!projectId || !title.trim() || !fileUrl.trim()) {
      setMessage({
        type: "error",
        text: "Choose a project, add a title, and paste a document link.",
      });
      return;
    }

    try {
      await createDocument({
        projectId,
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
          document_type: documentType,
          file_url: fileUrl.trim(),
          visibility: "Client Visible",
        },
      }).unwrap();
      setMessage({ type: "success", text: "Document shared successfully." });
      resetDialog();
    } catch (mutationError) {
      setMessage({
        type: "error",
        text:
          mutationError instanceof Error
            ? mutationError.message
            : "Could not share this document.",
      });
    }
  };

  return (
    <Stack spacing={3}>
      <PageIntro
        eyebrow="Documents"
        title="Project Documents"
        description="Review client-visible proposals, invoices, receipts, handoff files, and project documents in one place."
        action={
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Button variant="outlined" onClick={() => refetch()} disabled={loading}>
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<UploadFileOutlinedIcon />}
              onClick={() => setUploadOpen(true)}
            >
              Share Document Link
            </Button>
          </Stack>
        }
      />

      {message && <Alert severity={message.type}>{message.text}</Alert>}

      {(documentsError || projectsError) && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Some document data could not be loaded from the NestJS API.
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        <PortalStatCard
          icon={<FolderOutlinedIcon />}
          label="Visible Documents"
          value={stats.total}
          tone="blue"
          loading={loading}
        />
        <PortalStatCard
          icon={<UploadFileOutlinedIcon />}
          label="Shared By You"
          value={stats.sharedByClient}
          tone="green"
          loading={loading}
        />
        <PortalStatCard
          icon={<InsertDriveFileOutlinedIcon />}
          label="Recent Files"
          value={stats.recent}
          tone="amber"
          loading={loading}
        />
        <PortalStatCard
          icon={<DescriptionOutlinedIcon />}
          label="Project Folders"
          value={stats.projects}
          tone="purple"
          loading={loading}
        />
      </Box>

      <PortalPanel
        title="Document Library"
        action={
          <Stack
            direction="row"
            spacing={1}
            sx={{
              maxWidth: { xs: "100%", md: 680 },
              overflowX: "auto",
              pb: 0.25,
              scrollbarWidth: "thin",
            }}
          >
            {["All", ...documentTypes].map((type) => (
              <Chip
                key={type}
                label={type}
                clickable
                onClick={() => setFilter(type)}
                color={filter === type ? "primary" : "default"}
                variant={filter === type ? "filled" : "outlined"}
                sx={{ fontWeight: 850, flexShrink: 0 }}
              />
            ))}
          </Stack>
        }
      >
        {loading ? (
          <Stack sx={{ p: 2 }} spacing={1}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} height={84} />
            ))}
          </Stack>
        ) : filteredDocuments.length ? (
          <Box>
            {filteredDocuments.map((document) => (
              <DocumentRow
                key={document.id ?? `${document.title}-${document.file_url}`}
                document={document}
                projectTitle={
                  document.client_project_id
                    ? projectTitles.get(document.client_project_id)
                    : undefined
                }
              />
            ))}
          </Box>
        ) : (
          <EmptyPanel
            title={documents.length ? "No matching documents" : "No documents yet"}
            message={
              documents.length
                ? "Try another document type filter."
                : "Client-visible files and shared document links will appear here."
            }
          />
        )}
      </PortalPanel>

      <Dialog
        open={uploadOpen}
        onClose={createState.isLoading ? undefined : resetDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.text.secondary, 0.16)}`,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>Share a Document Link</DialogTitle>
        {createState.isLoading && <LinearProgress />}
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.75 }}>
            <Alert severity="info" variant="outlined">
              Paste a secure document link for now. Direct file upload should go through
              the NestJS file workflow when that endpoint is wired.
            </Alert>
            <TextField
              select
              label="Project"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              fullWidth
              required
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.title || project.name || "Client project"}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Document title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              fullWidth
              required
            />
            <TextField
              select
              label="Document type"
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              fullWidth
            >
              {documentTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="File or share link"
              value={fileUrl}
              onChange={(event) => setFileUrl(event.target.value)}
              fullWidth
              required
              helperText="Use a URL your project team can access."
            />
            <TextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              minRows={4}
              multiline
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={resetDialog} disabled={createState.isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              createState.isLoading || !projectId || !title.trim() || !fileUrl.trim()
            }
          >
            {createState.isLoading ? "Sharing..." : "Share Document"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function DocumentRow({
  document,
  projectTitle,
}: {
  document: ClientProjectDocument;
  projectTitle?: string;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        px: 2,
        py: 1.7,
        borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.11)}`,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{
          alignItems: { md: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1.4} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.3,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              backgroundColor: alpha(theme.palette.primary.main, 0.13),
              flexShrink: 0,
            }}
          >
            {documentIcon(document.document_type)}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 950 }}>
              {document.title || "Untitled document"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: { md: 620 },
              }}
            >
              {document.description || shortUrl(document.file_url)}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1, flexWrap: "wrap", gap: 1, alignItems: "center" }}
            >
              <Chip
                label={document.document_type || "Document"}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 850 }}
              />
              <Chip
                label={projectTitle || "Project document"}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 850 }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Added {formatShortDate(document.created_at)}
              </Typography>
            </Stack>
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}
        >
          <StatusChip status={document.visibility || "Client Visible"} />
          {document.file_url && (
            <Button
              component="a"
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              variant="outlined"
              endIcon={<OpenInNewOutlinedIcon />}
            >
              Open
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

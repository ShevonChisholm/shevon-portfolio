"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, CircularProgress, Stack } from "@mui/material";
import ProjectForm from "@/components/admin/projects/ProjectForm";
import {
  getProjectWithRelations,
  projectToFormValues,
  updateProject,
} from "@/lib/cms/projects";
import type { ProjectFormValues } from "@/types/cms";

type Message = {
  type: "error" | "warning";
  text: string;
} | null;

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<ProjectFormValues | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      const warning = new URLSearchParams(window.location.search).get("warning");

      setIsLoading(true);
      setMessage(warning ? { type: "warning", text: warning } : null);

      try {
        const project = await getProjectWithRelations(params.id);

        if (!project) {
          setMessage({ type: "error", text: "Project not found." });
          return;
        }

        setInitialValues(projectToFormValues(project));
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error ? error.message : "Unable to load project.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadProject();
  }, [params.id]);

  const handleSubmit = async (values: ProjectFormValues) => {
    await updateProject(params.id, values);
    router.refresh();
  };

  if (isLoading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress color="primary" />
      </Stack>
    );
  }

  if (message?.type === "error") {
    return <Alert severity={message.type}>{message.text}</Alert>;
  }

  if (!initialValues) {
    return <Alert severity="error">Project not found.</Alert>;
  }

  return (
    <Stack spacing={2}>
      {message && <Alert severity={message.type}>{message.text}</Alert>}
      <ProjectForm
        initialValues={initialValues}
        mode="edit"
        projectId={params.id}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}

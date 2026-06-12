"use client";

import { useRouter } from "next/navigation";
import ProjectForm from "@/components/admin/projects/ProjectForm";
import { useAdminNotifications } from "@/components/admin/notifications/AdminNotifications";
import { createProject } from "@/lib/cms/projects";
import type { QueuedProjectMedia } from "@/lib/cms/projects";
import type { ProjectFormValues } from "@/types/cms";
import { emptyProjectFormValues } from "@/types/cms";

export default function NewProjectPage() {
  const router = useRouter();
  const { enqueueNotification } = useAdminNotifications();

  const handleSubmit = async (
    values: ProjectFormValues,
    queuedMedia: QueuedProjectMedia
  ) => {
    const result = await createProject(values, queuedMedia);
    const warningParam = result.warning
      ? `?warning=${encodeURIComponent(result.warning)}`
      : "";

    enqueueNotification(result.warning ?? "Project created.", {
      variant: result.warning ? "warning" : "success",
    });
    router.push(`/admin/projects/${result.id}/edit${warningParam}`);
    router.refresh();

    return result;
  };

  return (
    <ProjectForm
      initialValues={emptyProjectFormValues}
      mode="create"
      onSubmit={handleSubmit}
    />
  );
}

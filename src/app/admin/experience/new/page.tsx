"use client";

import { useRouter } from "next/navigation";
import ExperienceForm from "@/components/admin/experience/ExperienceForm";
import { useAdminNotifications } from "@/components/admin/notifications/AdminNotifications";
import { createExperienceItem } from "@/lib/cms/experience";
import type { ExperienceFormValues } from "@/types/cms";
import { emptyExperienceFormValues } from "@/types/cms";

export default function NewExperiencePage() {
  const router = useRouter();
  const { enqueueNotification } = useAdminNotifications();

  const handleSubmit = async (values: ExperienceFormValues) => {
    const id = await createExperienceItem(values);
    enqueueNotification("Experience created.", { variant: "success" });
    router.push(`/admin/experience/${id}/edit`);
    router.refresh();
  };

  return (
    <ExperienceForm
      initialValues={emptyExperienceFormValues}
      mode="create"
      onSubmit={handleSubmit}
    />
  );
}

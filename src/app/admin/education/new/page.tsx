"use client";

import { useRouter } from "next/navigation";
import EducationForm from "@/components/admin/education/EducationForm";
import { useAdminNotifications } from "@/components/admin/notifications/AdminNotifications";
import { createEducationItem } from "@/lib/cms/education";
import type { EducationFormValues } from "@/types/cms";
import { emptyEducationFormValues } from "@/types/cms";

export default function NewEducationPage() {
  const router = useRouter();
  const { enqueueNotification } = useAdminNotifications();

  const handleSubmit = async (values: EducationFormValues) => {
    const id = await createEducationItem(values);
    enqueueNotification("Education created.", { variant: "success" });
    router.push(`/admin/education/${id}/edit`);
    router.refresh();
  };

  return (
    <EducationForm
      initialValues={emptyEducationFormValues}
      mode="create"
      onSubmit={handleSubmit}
    />
  );
}

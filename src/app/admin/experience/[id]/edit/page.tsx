"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, CircularProgress, Stack } from "@mui/material";
import ExperienceForm from "@/components/admin/experience/ExperienceForm";
import {
  experienceToFormValues,
  getExperienceItem,
  updateExperienceItem,
} from "@/lib/cms/experience";
import type { ExperienceFormValues } from "@/types/cms";

type Message = {
  type: "error";
  text: string;
} | null;

export default function EditExperiencePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<ExperienceFormValues | null>(
    null
  );
  const [message, setMessage] = useState<Message>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItem = async () => {
      setIsLoading(true);
      setMessage(null);

      try {
        const item = await getExperienceItem(params.id);

        if (!item) {
          setMessage({ type: "error", text: "Experience item not found." });
          return;
        }

        setInitialValues(experienceToFormValues(item));
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to load experience item.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadItem();
  }, [params.id]);

  const handleSubmit = async (values: ExperienceFormValues) => {
    await updateExperienceItem(params.id, values);
    router.refresh();
  };

  if (isLoading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress color="primary" />
      </Stack>
    );
  }

  if (message) {
    return <Alert severity={message.type}>{message.text}</Alert>;
  }

  if (!initialValues) {
    return <Alert severity="error">Experience item not found.</Alert>;
  }

  return (
    <ExperienceForm
      initialValues={initialValues}
      mode="edit"
      onSubmit={handleSubmit}
    />
  );
}

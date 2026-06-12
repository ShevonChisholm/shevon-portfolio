"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, CircularProgress, Stack } from "@mui/material";
import EducationForm from "@/components/admin/education/EducationForm";
import {
  educationToFormValues,
  getEducationItem,
  updateEducationItem,
} from "@/lib/cms/education";
import type { EducationFormValues } from "@/types/cms";

type Message = {
  type: "error";
  text: string;
} | null;

export default function EditEducationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<EducationFormValues | null>(
    null
  );
  const [message, setMessage] = useState<Message>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItem = async () => {
      setIsLoading(true);
      setMessage(null);

      try {
        const item = await getEducationItem(params.id);

        if (!item) {
          setMessage({ type: "error", text: "Education item not found." });
          return;
        }

        setInitialValues(educationToFormValues(item));
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to load education item.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadItem();
  }, [params.id]);

  const handleSubmit = async (values: EducationFormValues) => {
    await updateEducationItem(params.id, values);
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
    return <Alert severity="error">Education item not found.</Alert>;
  }

  return (
    <EducationForm
      initialValues={initialValues}
      mode="edit"
      onSubmit={handleSubmit}
    />
  );
}

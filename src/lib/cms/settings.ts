import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { ResumeSettingValue, SiteSetting } from "@/types/cms";

const settingKeys = [
  "resume",
  "github_url",
  "linkedin_url",
  "contact_email",
  "contact_phone",
  "location",
] as const;

export type PortfolioSettingKey = (typeof settingKeys)[number];

export async function listSiteSettings() {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .in("setting_key", [...settingKeys])
    .order("setting_key", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []) as SiteSetting[];
}

export async function upsertSiteSetting(
  settingKey: PortfolioSettingKey,
  settingValue: unknown
) {
  const supabase = createBrowserClient();
  const { error } = await supabase.from("site_settings").upsert(
    {
      setting_key: settingKey,
      setting_value: settingValue,
    },
    { onConflict: "setting_key" }
  );

  if (error) throw new Error(error.message);
}

export async function uploadResumePdf(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension !== "pdf") {
    throw new Error("Resume upload must be a PDF file.");
  }

  const supabase = createBrowserClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error(
      "Your admin session is not available. Sign in again before uploading the resume."
    );
  }

  const timestamp = Date.now();
  const path = `documents/resume/shevon-chisholm-resume-${timestamp}.pdf`;
  const { error } = await supabase.storage
    .from("portfolio-documents")
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || "application/pdf",
      upsert: false,
    });

  if (error) {
    if (
      error.message.toLowerCase().includes("row-level security") ||
      error.message.toLowerCase().includes("unauthorized")
    ) {
      throw new Error(
        "Supabase Storage denied this upload. Apply the CMS Storage policies for the portfolio-documents bucket and documents/resume path."
      );
    }

    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("portfolio-documents").getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error("Upload succeeded, but no public URL was returned.");
  }

  const resumeValue: ResumeSettingValue = {
    url: data.publicUrl,
    label: "Shevon Chisholm Resume",
  };

  await upsertSiteSetting("resume", resumeValue);

  return resumeValue;
}

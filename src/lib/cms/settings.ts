import { adminDataRequest } from "@/lib/cms/admin-api";
import { uploadCmsMedia } from "@/lib/cms/storage";
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
  return adminDataRequest<SiteSetting[]>({
    table: "site_settings",
    action: "select",
    filters: [{ column: "setting_key", operator: "in", value: [...settingKeys] }],
    orders: [{ column: "setting_key" }],
  });
}

export async function upsertSiteSetting(
  settingKey: PortfolioSettingKey,
  settingValue: unknown
) {
  await adminDataRequest({
    table: "site_settings",
    action: "upsert",
    values: {
      setting_key: settingKey,
      setting_value: settingValue,
    },
    onConflict: "setting_key",
  });
}

export async function uploadResumePdf(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension !== "pdf") {
    throw new Error("Resume upload must be a PDF file.");
  }

  const result = await uploadCmsMedia({ file, kind: "resume-document" });

  const resumeValue: ResumeSettingValue = {
    url: result.publicUrl,
    label: "Shevon Chisholm Resume",
  };

  await upsertSiteSetting("resume", resumeValue);

  return resumeValue;
}

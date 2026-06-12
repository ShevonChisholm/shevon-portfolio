import { adminDataRequest } from "@/lib/cms/admin-api";
import { uploadCmsMedia } from "@/lib/cms/storage";
import type {
  AboutSettingsValue,
  ResumeSettingValue,
  SiteSetting,
} from "@/types/cms";
import {
  fallbackAboutSettings,
  settingsToAboutSettings,
} from "@/lib/cms/settings-shared";

const settingKeys = [
  "about",
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

export async function getAboutSettings() {
  const settings = await listSiteSettings();
  return settingsToAboutSettings(settings);
}

export async function updateAboutSettings(value: AboutSettingsValue) {
  await upsertSiteSetting("about", value);
}

export async function uploadAboutImage(
  file: File,
  currentValue: AboutSettingsValue = fallbackAboutSettings
) {
  const result = await uploadCmsMedia({ file, kind: "about-image" });
  const aboutValue = { ...currentValue, image_url: result.publicUrl };
  await updateAboutSettings(aboutValue);
  return aboutValue;
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

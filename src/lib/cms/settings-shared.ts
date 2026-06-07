import type {
  PortfolioContactSettings,
  ResumeSettingValue,
  SiteSetting,
} from "@/types/cms";

export const fallbackPortfolioContactSettings: PortfolioContactSettings = {
  resume: null,
  github_url: "https://github.com/",
  linkedin_url: "https://www.linkedin.com/in/shevon-chisholm-6ba802230",
  contact_email: "chisholmshevon@gmail.com",
  contact_phone: "+1 (876) 514-2426",
  location: "Jamaica · Open to remote overseas roles",
};

function valueAsString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function valueAsResume(value: unknown): ResumeSettingValue | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const url = valueAsString(record.url);
  const label = valueAsString(record.label) || "Shevon Chisholm Resume";

  return url ? { url, label } : null;
}

export function settingsToPortfolioContactSettings(
  settings: SiteSetting[]
): PortfolioContactSettings {
  const byKey = settings.reduce<Record<string, unknown>>((acc, setting) => {
    acc[setting.setting_key] = setting.setting_value;
    return acc;
  }, {});

  return {
    resume: valueAsResume(byKey.resume),
    github_url:
      valueAsString(byKey.github_url) ||
      fallbackPortfolioContactSettings.github_url,
    linkedin_url:
      valueAsString(byKey.linkedin_url) ||
      fallbackPortfolioContactSettings.linkedin_url,
    contact_email:
      valueAsString(byKey.contact_email) ||
      fallbackPortfolioContactSettings.contact_email,
    contact_phone:
      valueAsString(byKey.contact_phone) ||
      fallbackPortfolioContactSettings.contact_phone,
    location:
      valueAsString(byKey.location) || fallbackPortfolioContactSettings.location,
  };
}

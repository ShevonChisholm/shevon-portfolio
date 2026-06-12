import type {
  AboutSettingsValue,
  PortfolioContactSettings,
  ResumeSettingValue,
  SiteSetting,
} from "@/types/cms";
import { publicMediaUrl } from "@/lib/cms/media-url";

export const fallbackAboutSettings: AboutSettingsValue = {
  subtitle: "Building practical software solutions for real business needs",
  paragraph_one:
    "I'm a Full-Stack Engineer with 5+ years of professional experience building production web and mobile applications. I specialize in React, Next.js, React Native, NestJS, TypeScript, and API-driven architectures, with experience taking ideas from requirements through development, integration, and deployment.",
  paragraph_two:
    "My work spans healthcare, media, business operations, budgeting, and client-focused platforms. I've built user interfaces, REST APIs, authentication flows, subscription/payment features, admin portals, and cloud-connected systems. My background in HR, entrepreneurship, and hands-on client work helps me understand real operational problems and translate them into clean, maintainable software.",
  image_url: "",
  image_alt: "Shevon Chisholm",
};

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

  return url ? { url: publicMediaUrl(url), label } : null;
}

export function valueAsAboutSettings(value: unknown): AboutSettingsValue {
  if (!value || typeof value !== "object") return fallbackAboutSettings;

  const record = value as Record<string, unknown>;

  return {
    subtitle:
      valueAsString(record.subtitle) || fallbackAboutSettings.subtitle,
    paragraph_one:
      valueAsString(record.paragraph_one) || fallbackAboutSettings.paragraph_one,
    paragraph_two:
      valueAsString(record.paragraph_two) || fallbackAboutSettings.paragraph_two,
    image_url: valueAsString(record.image_url),
    image_alt: valueAsString(record.image_alt) || fallbackAboutSettings.image_alt,
  };
}

export function settingsToAboutSettings(
  settings: SiteSetting[]
): AboutSettingsValue {
  const setting = settings.find((item) => item.setting_key === "about");
  return valueAsAboutSettings(setting?.setting_value);
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

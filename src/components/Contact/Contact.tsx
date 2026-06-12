import { getPublicPortfolioContactSettings } from "@/lib/cms/public-settings";
import { fallbackPortfolioContactSettings } from "@/lib/cms/settings-shared";
import { withPublicFallback } from "@/lib/cms/public-safe";
import ContactClient from "./ContactClient";

export default async function Contact() {
  const settings = await withPublicFallback(
    "contact settings",
    getPublicPortfolioContactSettings,
    fallbackPortfolioContactSettings
  );

  return <ContactClient settings={settings} />;
}

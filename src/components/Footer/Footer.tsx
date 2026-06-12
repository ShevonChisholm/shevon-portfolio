import { getPublicPortfolioContactSettings } from "@/lib/cms/public-settings";
import { withPublicFallback } from "@/lib/cms/public-safe";
import { fallbackPortfolioContactSettings } from "@/lib/cms/settings-shared";
import FooterClient from "./FooterClient";

export default async function Footer() {
  const settings = await withPublicFallback(
    "footer contact settings",
    getPublicPortfolioContactSettings,
    fallbackPortfolioContactSettings
  );

  return <FooterClient settings={settings} />;
}

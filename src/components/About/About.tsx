import { publicMediaUrl } from "@/lib/cms/media-url";
import { getPublicAboutSettings } from "@/lib/cms/public-settings";
import { withPublicFallback } from "@/lib/cms/public-safe";
import { fallbackAboutSettings } from "@/lib/cms/settings-shared";
import AboutClient from "./AboutClient";

export default async function About() {
  const about = await withPublicFallback(
    "about settings",
    getPublicAboutSettings,
    fallbackAboutSettings
  );

  return (
    <AboutClient
      about={{
        ...about,
        image_url: publicMediaUrl(about.image_url),
      }}
    />
  );
}

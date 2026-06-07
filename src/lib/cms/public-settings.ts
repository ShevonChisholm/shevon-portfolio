import { createClient } from "@/lib/supabase/server";
import type { SiteSetting } from "@/types/cms";
import { settingsToPortfolioContactSettings } from "./settings-shared";

const settingKeys = [
  "resume",
  "github_url",
  "linkedin_url",
  "contact_email",
  "contact_phone",
  "location",
] as const;

export async function getPublicPortfolioContactSettings() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .in("setting_key", [...settingKeys]);

  if (error) throw new Error(error.message);

  return settingsToPortfolioContactSettings((data ?? []) as SiteSetting[]);
}

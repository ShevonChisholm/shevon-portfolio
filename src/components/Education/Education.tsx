import { getPublishedEducationItems } from "@/lib/cms/public-profile";
import { withPublicFallback } from "@/lib/cms/public-safe";
import EducationClient from "./EducationClient";

export default async function Education() {
  const educationItems = await withPublicFallback(
    "education",
    getPublishedEducationItems,
    []
  );

  return <EducationClient educationItems={educationItems} />;
}

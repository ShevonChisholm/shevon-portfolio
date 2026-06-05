import { getPublishedEducationItems } from "@/lib/cms/public-profile";
import EducationClient from "./EducationClient";

export default async function Education() {
  const educationItems = await getPublishedEducationItems();

  return <EducationClient educationItems={educationItems} />;
}

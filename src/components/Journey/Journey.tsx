import {
  getPublishedEducationItems,
  getPublishedExperienceItems,
} from "@/lib/cms/public-profile";
import { withPublicFallback } from "@/lib/cms/public-safe";
import JourneyClient from "./JourneyClient";

export default async function Journey() {
  const [experiences, educationItems] = await Promise.all([
    withPublicFallback("experience", getPublishedExperienceItems, []),
    withPublicFallback("education", getPublishedEducationItems, []),
  ]);

  return (
    <JourneyClient
      experiences={experiences}
      educationItems={educationItems}
    />
  );
}

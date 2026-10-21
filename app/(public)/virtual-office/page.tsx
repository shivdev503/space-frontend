import { generateMetadataForPublicRoute } from "@/lib/generate-public-seo-metadata";
import { VoHomePage } from "@/modules/virtual-office/homepage/vo-home-page";

export const generateMetadata = generateMetadataForPublicRoute;

export default function VirtualOfficePage() {
  return <VoHomePage />;
}

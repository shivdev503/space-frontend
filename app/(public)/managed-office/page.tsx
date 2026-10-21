import { generateMetadataForPublicRoute } from "@/lib/generate-public-seo-metadata";
import { OfficeSpaceHomepage } from "@/modules/verticals/office-space-homepage";
import { getVerticalLandingContent } from "@/services/verticals";

export const generateMetadata = generateMetadataForPublicRoute;

export default async function OfficeSpacePage() {
  const data = await getVerticalLandingContent("office-space");

  return <OfficeSpaceHomepage data={data} />;
}

import { AddVerticalChooser } from "@/modules/listing/components/add-vertical-chooser";
import { generateMetadataForPublicRoute } from "@/lib/generate-public-seo-metadata";
import { getListingSession } from "@/services/listing-session";

export const generateMetadata = generateMetadataForPublicRoute;

export default async function AddVerticalChooserPage() {
  const session = await getListingSession();
  return <AddVerticalChooser hostName={session?.name} />;
}

import {
  getVirtualOfficeCityCatalogBySlug,
  getVirtualOfficeCityDisplayName,
  type VirtualOfficeCatalogCity,
} from "@/lib/virtual-office-city-catalog";
import { pathnameToSeoSlug } from "@/lib/pathname-to-seo-slug";
import { VoCityPageExperience } from "@/modules/virtual-office/components/city-page/vo-city-page-experience";
import { listHomepageCitiesFromAvailable } from "@/services/homepage-available-cities";
import { getSeoBySlug } from "@/services/seo-content";
import type { CityPageData } from "@/types";

const CITY_ALIASES: Record<string, string> = { gurugram: "gurgaon" };

function resolveVirtualOfficeCatalog(data: CityPageData): VirtualOfficeCatalogCity {
  const fromRaw = getVirtualOfficeCityCatalogBySlug(data.city.slug);
  if (fromRaw) return fromRaw;

  return {
    name: data.city.name,
    id: data.catalogCityId ?? data.city.id,
    slug: data.city.slug,
    locations: data.popularLocations.map((loc) => ({
      locality: loc.name,
    })),
  };
}

export async function VirtualOfficeCityPage({ data }: { data: CityPageData }) {
  const catalog = resolveVirtualOfficeCatalog(data);
  const cityDisplay = getVirtualOfficeCityDisplayName(data.city.slug, catalog.name);
  // Built here (server) so the large city catalog stays out of the client bundle.
  const currentSlug = CITY_ALIASES[data.city.slug] ?? data.city.slug;
  const otherCities = listHomepageCitiesFromAvailable("virtual-office").filter((c) => c.slug !== currentSlug);
  // Same NewSeo row as the page metadata (deduped per request); reviews are managed in admin SEO.
  const seo = await getSeoBySlug(pathnameToSeoSlug(`/virtual-office/${data.city.slug}`));

  return (
    <VoCityPageExperience
      data={data}
      catalog={catalog}
      cityDisplay={cityDisplay}
      otherCities={otherCities}
      reviews={seo?.reviews ?? []}
    />
  );
}

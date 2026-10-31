import { absoluteUrl } from "@/components/seo/breadcrumbs";
import { pgImagesSorted } from "@/services/pg-mapper";
import type { CoworkingModel } from "@/types/coworking-workspace.model";
import type { PgDetail } from "@/types/pg.model";

/** Google reads up to this many photos; more only adds page weight. */
const MAX_IMAGES = 6;

function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: json }} />;
}

function clean(value: string | null | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function geoCoordinates(latitude: unknown, longitude: unknown) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  // The API stores 0 when a listing has no map pin.
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) return undefined;
  return { "@type": "GeoCoordinates", latitude: lat, longitude: lng };
}

function postalAddress(street: string, locality: string, city: string, postalCode?: string) {
  if (!street && !locality && !city) return undefined;
  return {
    "@type": "PostalAddress",
    ...(street ? { streetAddress: street } : {}),
    ...(city || locality ? { addressLocality: city || locality } : {}),
    ...(postalCode ? { postalCode } : {}),
    addressCountry: "IN",
  };
}

function amenityFeatures(names: string[]) {
  const unique = Array.from(new Set(names.map(clean).filter(Boolean)));
  if (!unique.length) return undefined;
  return unique.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true }));
}

function placeData(place: {
  type: "LocalBusiness" | "LodgingBusiness";
  name: string;
  path: string;
  images: string[];
  address: ReturnType<typeof postalAddress>;
  geo: ReturnType<typeof geoCoordinates>;
  amenities: ReturnType<typeof amenityFeatures>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": place.type,
    name: clean(place.name),
    url: absoluteUrl(place.path),
    ...(place.images.length ? { image: place.images.slice(0, MAX_IMAGES) } : {}),
    ...(place.address ? { address: place.address } : {}),
    ...(place.geo ? { geo: place.geo } : {}),
    ...(place.amenities ? { amenityFeature: place.amenities } : {}),
  };
}

/**
 * Listing structured data for coworking, virtual office and managed office pages.
 * Prices stay out until they are confirmed as verified; ratings stay out because they are not ours.
 */
export function WorkspacePlaceJsonLd({
  name,
  path,
  images,
  location,
  amenities,
}: {
  name: string;
  path: string;
  images: string[];
  location?: Partial<CoworkingModel.Location>;
  amenities?: CoworkingModel.Amenity[];
}) {
  const street = clean(location?.address1) || clean(location?.address);
  const data = placeData({
    type: "LocalBusiness",
    name,
    path,
    images,
    address: postalAddress(
      street,
      clean(location?.micro_location?.name),
      clean(location?.city?.name),
      clean(location?.postal_code),
    ),
    geo: geoCoordinates(location?.latitude, location?.longitude),
    amenities: amenityFeatures((amenities ?? []).map((a) => a.name)),
  });
  return <JsonLd data={data} />;
}

/** Listing structured data for PG / coliving pages. Same rules as {@link WorkspacePlaceJsonLd}. */
export function PgPlaceJsonLd({ pg, path }: { pg: PgDetail; path: string }) {
  const data = placeData({
    type: "LodgingBusiness",
    name: pg.name,
    path,
    images: pgImagesSorted(pg.images),
    address: postalAddress(clean(pg.address), clean(pg.locality), clean(pg.city)),
    geo: geoCoordinates(pg.coordinates?.lat, pg.coordinates?.lng),
    amenities: amenityFeatures([...(pg.commonAmenities ?? []), ...(pg.roomAmenities ?? [])]),
  });
  return <JsonLd data={data} />;
}

/** ItemList for the listings shown on a city or locality page. */
export function ListingItemListJsonLd({
  name,
  items,
}: {
  name: string;
  items: { name?: string | null; href: string | null }[];
}) {
  const rows = items.filter((item): item is { name: string; href: string } => Boolean(clean(item.name) && item.href));
  if (!rows.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: clean(name),
        numberOfItems: rows.length,
        itemListElement: rows.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: clean(item.name),
          url: absoluteUrl(item.href),
        })),
      }}
    />
  );
}

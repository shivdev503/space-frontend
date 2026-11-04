import { CityCard } from "@/modules/home/components/city-card";
import { VoBand, VoHeading } from "@/modules/virtual-office/components/city-page/vo-city-design";
import type { City } from "@/types";

export function VoCityOtherCitiesSection({ cities }: { cities: City[] }) {
  if (!cities.length) return null;

  return (
    <VoBand tone="soft">
      <VoHeading>Explore other cities for Virtual Office</VoHeading>
      <div className="mt-10 grid grid-cols-2 gap-2.5 sm:gap-3.5 xl:grid-cols-4">
        {cities.map((city) => (
          <CityCard key={city.id} city={city} basePath="/virtual-office" variant="compact" />
        ))}
      </div>
    </VoBand>
  );
}

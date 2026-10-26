/** Occupancy from a PG room type name, e.g. "Double Sharing" → "Shared by 2 people"; "" when unknown. */
export function roomOccupancy(type: string): string {
  const t = type.toLowerCase();
  const patterns: [RegExp, number][] = [
    [/single|private|1\s*sharing/, 1],
    [/double|twin|2\s*sharing/, 2],
    [/triple|3\s*sharing/, 3],
    [/four|quad|4\s*sharing/, 4],
  ];
  const match = patterns.find(([re]) => re.test(t));
  if (!match) return "";
  return match[1] === 1 ? "Private room for 1 person" : `Shared by ${match[1]} people`;
}

/** Room amenities without bed-type entries ("Single Bed") that contradict shared room types. */
export function roomFeatureList(roomAmenities: string[], max = 4): string[] {
  return roomAmenities.filter((a) => !/^(single|double|triple|four|queen|king)?\s*beds?$/i.test(a.trim())).slice(0, max);
}

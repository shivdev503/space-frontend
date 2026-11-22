/**
 * Which saved "nearby" values are metro stations.
 *
 * Hosts and imports put shops and landmarks in the metro fields, so a value counts only when it
 * says "metro" or, in the field meant for the station (`landmark` with `is_near_metro`), names a
 * station we know. `metro_stop_landmark` on coworking listings held the host's "other nearby
 * landmark", so there the word "metro" is required.
 */

/** Station names as they are saved on listings, normalised by `stationKey`. Add a station here when needed. */
const STATIONS: Record<string, readonly string[]> = {
  gurugram: [
    "huda city centre", "huda city", "millennium city centre", "iffco chowk", "mg road", "sikanderpur", "sikandarpur",
    "guru dronacharya", "moulsari avenue", "micromax moulsari", "belvedere tower", "cyber city", "cybercity", "dlf phase 1",
    "indusind bank", "sector 53 54", "sector 55 56", "sector 56", "sector 42 43",
  ],
  delhi: [
    "rajiv chowk", "janakpuri east", "janak puri east", "janakpuri west", "delhi gate", "badarpur border", "saket", "green park",
    "barakhamba", "barakhambha", "barakhamba road", "barakhambha road", "govindpuri", "okhla nsic", "nsic okhla",
    "netaji subhash place", "mayur vihar pocket 1", "mayur vihar phase 1", "mohan estate", "rohini east", "dashrat puri",
    "sarita vihar", "jhandewalan", "hauz khas", "nehru enclave", "palam", "vasant vihar", "malviya nagar", "kalkaji mandir",
    "bhikajicama place", "bhikaji cama place", "dwarka sector 8", "dwarka sector 10", "sector 12 dwarka", "dwarka mor",
    "uttam nagar east", "shalimar bagh", "preet vihar", "nehru place", "qutub minar", "qutab minar", "tughlakabad", "mayapuri",
    "nirman vihar", "greater kailash", "ghitorni", "lajpat nagar", "south extension", "karkardooma", "aerocity",
    "delhi aerocity", "delhi aero city", "model town", "lok kalyan marg", "janpath", "rajendra place", "sultanpur", "okhla vihar",
    "okhala vihar", "shakurpur", "subhash nagar",
  ],
  noida: [
    "sector 15", "sector 16", "sector 59", "sector 62", "sector 137", "sector 142", "noida sector 15", "noida sector 16",
    "noida sector 59", "noida sector 62", "noida sector 137", "noida sector 142", "electronic city", "noida electronic city",
    "okhla bird sanctuary",
  ],
  mumbai: [
    "saki naka", "sakinaka", "dindoshi", "aarey", "shimpoli", "magathane", "lower oshiwara", "western express highway",
    "jb nagar", "chakala", "ghatkopar",
  ],
  pune: ["ramwadi", "bund garden", "kalyani nagar", "bhosari", "pcmc"],
  ahmedabad: ["thaltej", "thaltej gam", "vastral", "old high court", "usmanpura", "gandhigram"],
  jaipur: ["mansarovar", "civil lines", "new aatish market"],
  indore: ["vijay nagar", "vijaynagar"],
  lucknow: ["indira nagar", "indra nagar", "indranagar"],
  hyderabad: ["ameerpet", "raidurg", "rasoolpura"],
  bangalore: ["jayadeva", "mahatma gandhi road", "cubbon park", "trinity"],
};

/** Built but not open to passengers yet (Pune Line 3 opened in part on 4 Nov 2026). Remove each as it opens. */
const NOT_OPEN: Record<string, RegExp> = {
  pune: /balewadi\s+phata|\brbi\b|reserve bank|\bbaner\b/i,
};

const CITY_KEY: Record<string, string> = { gurgaon: "gurugram", bengaluru: "bangalore", "new delhi": "delhi" };

function stationKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\bsec(?:t(?:or)?)?\b/g, "sector")
    .replace(/\bcenter\b/g, "centre")
    .replace(/^\s*near\b/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** The value when it is a metro station in that city, else "". */
export function metroStationName(value: unknown, cityName: unknown, options?: { mustSayMetro?: boolean }): string {
  if (typeof value !== "string") return "";
  const name = value.replace(/\s+/g, " ").trim();
  if (!name) return "";
  const rawCity = typeof cityName === "string" ? cityName.trim().toLowerCase() : "";
  const city = CITY_KEY[rawCity] ?? rawCity;
  if (NOT_OPEN[city]?.test(name) || /\b(upcoming|proposed|under construction)\b/i.test(name)) return "";

  if (/\bmetro\b/i.test(name)) {
    // "Metro Station" or "Near by metro station" names no station.
    const rest = name.replace(/\b(metro|station|near|nearby|nearest|by|the|line|rapid|gate|no)\b/gi, "").replace(/[^a-z0-9]/gi, "");
    return rest ? name : "";
  }
  if (options?.mustSayMetro) return "";

  const known = STATIONS[city];
  if (!known) return "";
  // "Barakhamba and Rajiv Chowk", "Sultanpur , 10 mins drive": the first part names the station.
  const first = stationKey(name.replace(/\([^)]*\)/g, " ").split(/,|\/|&|\band\b|\s-\s*\d+(?:\.\d+)?\s*km/i)[0]);
  return known.includes(first) || known.includes(stationKey(name)) ? name : "";
}

/** The metro station saved on a coworking listing, with its distance when there is one. */
export function coworkingMetro(location: unknown): { name: string; distance: string } | null {
  if (!location || typeof location !== "object") return null;
  const loc = location as Record<string, unknown>;
  const city = (loc.city as { name?: unknown } | null | undefined)?.name;
  const text = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" && v > 0 ? String(v) : "");

  if (loc.is_near_metro) {
    const name = metroStationName(loc.landmark, city);
    if (name) return { name, distance: text(loc.landmark_distance) };
  }
  // Older listings keep the metro on `metro_detail`.
  const detail = loc.metro_detail as { is_near_metro?: boolean; name?: unknown; distance?: unknown } | undefined;
  if (detail?.is_near_metro) {
    const name = metroStationName(detail.name, city);
    if (name) return { name, distance: text(detail.distance) };
  }
  const name = metroStationName(loc.metro_stop_landmark, city, { mustSayMetro: true });
  return name ? { name, distance: "" } : null;
}

/** One spelling per station; hosts and imports spell them many ways. */
const SAME_STATION: ReadonlyArray<[RegExp, string]> = [
  [/huda city|huda metro|huda$|millennium city/i, "Millennium City Centre"],
  [/53\W+54|sector 54 chowk/i, "Sector 53-54"],
  [/55\W+56|^sector 56$/i, "Sector 55-56"],
  [/indusind/i, "IndusInd Bank Cyber City"],
  [/micromax/i, "Micromax Moulsari Avenue"],
  [/^cyber ?city/i, "Cyber City"],
  [/(dlf )?phase[\s-]*1 rapid|^dlf phase[\s-]*1/i, "Phase 1"],
  [/okhla bird/i, "Okhla Bird Sanctuary"],
  [/electronic city|next electronic/i, "Noida Electronic City"],
  [/^(noida )?sec(tor)?[\s-]*(15|16|59|62|137|142)\b/i, "Noida Sector $3"],
  [/barakhamb?h?a/i, "Barakhamba Road"],
  [/^janak ?puri east/i, "Janakpuri East"],
  [/nsic/i, "Okhla NSIC"],
  [/^okhal?a vihar|^okhla vihar/i, "Okhla Vihar"],
  [/netaji subhash/i, "Netaji Subhash Place"],
  [/^n[ae]hru place/i, "Nehru Place"],
  [/aero ?city/i, "Aerocity"],
  [/^karkardooma/i, "Karkardooma"],
  [/lok kalyan/i, "Lok Kalyan Marg"],
  [/dashrat/i, "Dashrathpuri"],
  [/^mayur vihar phase/i, "Mayur Vihar Phase 1"],
  [/^mayur vihar pocket/i, "Mayur Vihar Pocket 1"],
  [/^sector 12 dwarka/i, "Dwarka Sector 12"],
  [/^sector 9 and palam/i, "Palam"],
  [/sak[ia] ?nak[ai]/i, "Saki Naka"],
  [/^weh\b|^western? express/i, "Western Express Highway"],
  [/jb nagar/i, "JB Nagar"],
  [/^chakala/i, "Chakala"],
  [/lower oshiwara/i, "Lower Oshiwara"],
  [/^kalyani/i, "Kalyani Nagar"],
  [/^iiser/i, "IISER"],
  [/^pcmc/i, "PCMC"],
  [/^bkc/i, "BKC"],
  [/^vijay ?nagar/i, "Vijay Nagar"],
  [/^ind(i)?ra ?nagar/i, "Indira Nagar"],
  [/^mg road|^mahatma gandhi road/i, "MG Road"],
  [/jayanagar/i, "Jayanagar"],
];

/** "Saket metro station gate no. 2" → "Saket": for sentences that list several stations. */
export function metroStationShortName(name: string): string {
  const short = name
    .replace(/\([^)]*\)/g, " ")
    .split(/,|;|&|\band\b|\s\/\s|\s-\s*\d+(?:\.\d+)?\s*km/i)[0]
    .replace(/\bgate\s*(no\b|number\b|-?\s*\d).*$/i, " ")
    .replace(/\b\w+ line\b|\brapid metro\b|\bmetro\b|\bstation\b|\bstartion\b|^\s*near\b/gi, " ")
    .replace(/[.~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (const [pattern, station] of SAME_STATION) {
    const hit = pattern.exec(short) ?? pattern.exec(name.trim());
    if (hit) return station.replace("$3", hit[3] ?? "");
  }
  return (short || name).toLowerCase().replace(/(^|[\s-])([a-z])/g, (_, gap: string, letter: string) => gap + letter.toUpperCase());
}

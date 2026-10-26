import {
  formatInrPrice,
  getCityLowestMonthlyPrice,
  getVirtualOfficePlanPrices,
  parseInrPrice,
  type VirtualOfficeCatalogCity,
} from "@/lib/virtual-office-city-catalog";

export type VoCityArea = {
  /** Raw catalog locality — sent with enquiries. */
  locality: string;
  /** Short label without the city suffix ("MG Road Gurgaon" → "MG Road"). */
  name: string;
  price: number | null;
  bestFor: string;
  badge?: { label: string; tone: "soft" | "dark" };
};

const BEST_FOR = [
  "GST registration on a tight budget",
  "Metro access and easy client visits",
  "Premium brands and funded startups",
  "A central address that clients know",
  "IT firms and enterprise brands",
  "Online sellers and service businesses",
  "Small businesses and local firms",
  "Consultants and growing teams",
] as const;

/** Known localities get a fitting "best for" line and badge; others fall back to BEST_FOR. */
const AREA_HINTS: Array<{ match: RegExp; bestFor: string; badge?: VoCityArea["badge"] }> = [
  { match: /mg road/i, bestFor: "Metro access and easy client visits", badge: { label: "Best value", tone: "soft" } },
  {
    match: /golf course/i,
    bestFor: "Premium brands and funded startups",
    badge: { label: "Most popular", tone: "dark" },
  },
  {
    match: /huda city/i,
    bestFor: "Yellow Line metro and a central address",
    badge: { label: "Metro hub", tone: "soft" },
  },
  { match: /cyber/i, bestFor: "IT firms and enterprise brands" },
  { match: /udyog vihar/i, bestFor: "Online sellers and service businesses" },
  { match: /sohna/i, bestFor: "Small businesses and local firms" },
  { match: /sector 44/i, bestFor: "GST registration on a tight budget" },
  { match: /connaught|cp\b/i, bestFor: "A premium central Delhi address", badge: { label: "Most popular", tone: "dark" } },
  { match: /nehru place/i, bestFor: "IT and electronics businesses" },
  { match: /bkc|bandra kurla/i, bestFor: "Finance firms and premium brands", badge: { label: "Most popular", tone: "dark" } },
  { match: /andheri/i, bestFor: "Media, startups and service firms" },
  { match: /koramangala/i, bestFor: "Startups and founders", badge: { label: "Most popular", tone: "dark" } },
  { match: /whitefield|electronic city/i, bestFor: "IT firms and tech teams" },
  { match: /hitec|hitech|gachibowli/i, bestFor: "IT firms and enterprise brands", badge: { label: "Most popular", tone: "dark" } },
];

function shortLocalityName(locality: string, cityDisplay: string, catalogName: string): string {
  const suffixes = [cityDisplay, catalogName, "Gurgaon", "Gurugram"].filter(Boolean);
  let name = locality.trim();
  for (const suffix of suffixes) {
    const re = new RegExp(`[\\s,]+${suffix}$`, "i");
    name = name.replace(re, "");
  }
  return name || locality;
}

/** Areas sorted by price (priced first); the cheapest gets "Lowest price". */
export function getVoCityAreas(catalog: VirtualOfficeCatalogCity, cityDisplay: string): VoCityArea[] {
  const rows = catalog.locations
    .filter((loc) => loc.locality?.trim())
    .map((loc) => ({
      locality: loc.locality,
      name: shortLocalityName(loc.locality, cityDisplay, catalog.name),
      price: parseInrPrice(loc.starting_price),
    }));

  const priced = rows.filter((r) => r.price != null).sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  const unpriced = rows.filter((r) => r.price == null);

  return [...priced, ...unpriced].map((row, index) => {
    const hint = AREA_HINTS.find((h) => h.match.test(row.locality));
    const badge: VoCityArea["badge"] =
      index === 0 && row.price != null ? { label: "Lowest price", tone: "soft" } : hint?.badge;
    return {
      ...row,
      bestFor: hint?.bestFor ?? BEST_FOR[index % BEST_FOR.length],
      badge,
    };
  });
}

export function getVoCitySummary(catalog: VirtualOfficeCatalogCity) {
  const lowest = getCityLowestMonthlyPrice(catalog);
  return {
    lowest,
    lowestLabel: formatInrPrice(lowest),
    plans: getVirtualOfficePlanPrices(catalog),
  };
}

export type VoCitySummary = ReturnType<typeof getVoCitySummary>;

const CITY_STATES: Record<string, { state: string; code: string }> = {
  gurgaon: { state: "Haryana", code: "06" },
  gurugram: { state: "Haryana", code: "06" },
  faridabad: { state: "Haryana", code: "06" },
  delhi: { state: "Delhi", code: "07" },
  noida: { state: "Uttar Pradesh", code: "09" },
  lucknow: { state: "Uttar Pradesh", code: "09" },
  bangalore: { state: "Karnataka", code: "29" },
  mumbai: { state: "Maharashtra", code: "27" },
  pune: { state: "Maharashtra", code: "27" },
  nagpur: { state: "Maharashtra", code: "27" },
  hyderabad: { state: "Telangana", code: "36" },
  chennai: { state: "Tamil Nadu", code: "33" },
  coimbatore: { state: "Tamil Nadu", code: "33" },
  ahmedabad: { state: "Gujarat", code: "24" },
  surat: { state: "Gujarat", code: "24" },
  vadodara: { state: "Gujarat", code: "24" },
  kolkata: { state: "West Bengal", code: "19" },
  jaipur: { state: "Rajasthan", code: "08" },
  chandigarh: { state: "Chandigarh", code: "04" },
  mohali: { state: "Punjab", code: "03" },
  ludhiana: { state: "Punjab", code: "03" },
  indore: { state: "Madhya Pradesh", code: "23" },
  bhopal: { state: "Madhya Pradesh", code: "23" },
  kochi: { state: "Kerala", code: "32" },
  ernakulam: { state: "Kerala", code: "32" },
  calicut: { state: "Kerala", code: "32" },
  trivandrum: { state: "Kerala", code: "32" },
  bhubaneswar: { state: "Odisha", code: "21" },
  goa: { state: "Goa", code: "30" },
  guwahati: { state: "Assam", code: "18" },
  dehradun: { state: "Uttarakhand", code: "05" },
  visakhapatnam: { state: "Andhra Pradesh", code: "37" },
  patna: { state: "Bihar", code: "10" },
  raipur: { state: "Chhattisgarh", code: "22" },
};

export function getVoCityState(citySlug: string) {
  return CITY_STATES[citySlug.trim().toLowerCase()] ?? null;
}

export const VO_OTHER_CITIES = [
  { name: "Delhi", slug: "delhi" },
  { name: "Noida", slug: "noida" },
  { name: "Gurgaon", slug: "gurgaon" },
  { name: "Bangalore", slug: "bangalore" },
  { name: "Mumbai", slug: "mumbai" },
  { name: "Pune", slug: "pune" },
  { name: "Hyderabad", slug: "hyderabad" },
] as const;

export const VO_SHARE_DOCS = {
  proprietor: {
    label: "Proprietor",
    items: [
      "PAN card of the proprietor",
      "Aadhaar card of the proprietor",
      "A recent passport size photo",
      "Bank statement or cancelled cheque",
    ],
  },
  partnership: {
    label: "Partnership or LLP",
    items: [
      "Partnership deed or LLP agreement",
      "Firm or LLP PAN card",
      "PAN and Aadhaar of all partners",
      "Authorisation letter for the signatory",
    ],
  },
  company: {
    label: "Pvt Ltd or OPC",
    items: [
      "Certificate of incorporation if already registered",
      "Company PAN card",
      "PAN and Aadhaar of all directors",
      "Board resolution for the signatory",
    ],
  },
} as const;

export type VoShareDocKey = keyof typeof VO_SHARE_DOCS;

export function getVoCityFaqs(cityDisplay: string, summary: VoCitySummary, stateName?: string) {
  const { plans } = summary;
  const c = cityDisplay;
  const faqs = [
    {
      q: `How much does a virtual office in ${c} cost?`,
      a: `A virtual office in ${c} starts at ${formatInrPrice(plans.businessAddress)} a month for a business address. The GST registration plan starts at ${formatInrPrice(plans.gstRegistration)} a month and the company registration plan starts at ${formatInrPrice(plans.companyRegistration)} a month. Prices exclude 18% GST and change by area.`,
    },
    {
      q: `Is a virtual office in ${c} valid for GST registration?`,
      a: `Yes. Every centre we list gives you a NOC, a rent or leave and licence agreement and a recent utility bill. These are the documents the GST portal asks for, and the centre supports you if an officer visits.`,
    },
    {
      q: `Can I register a company with a virtual office in ${c}?`,
      a: `Yes. The company registration plan includes the NOC, agreement and utility bill plus the ROC NOC needed to use the address as your registered office for a Pvt Ltd, LLP or OPC.`,
    },
    {
      q: "Which documents will I get?",
      a: "You get a NOC from the owner, a stamped rent or leave and licence agreement and a utility bill less than two months old that shows the commercial address.",
    },
    {
      q: "Which documents do I need to share?",
      a: "It depends on your business type. Proprietors share PAN, Aadhaar and a photo. Partnerships and LLPs share the deed or agreement and partner KYC. Companies share the incorporation certificate, company PAN, director KYC and a board resolution.",
    },
    {
      q: `Which area in ${c} is best for a virtual office?`,
      a: `It depends on your budget and your brand. Lower priced areas suit GST registration, while premium business districts suit funded startups and enterprise brands. Our expert can shortlist areas for you for free.`,
    },
    {
      q: "How fast will I get my documents?",
      a: "Most centres share documents within 24 to 72 hours after your KYC is complete. Company registration documents can take 3 to 5 working days.",
    },
    {
      q: `Can I add ${c} to my existing GST registration?`,
      a: stateName
        ? `Yes, if you are already registered in ${stateName} you can add the ${c} address as an additional place of business. If you are registered in another state you will need a new GSTIN for ${stateName}.`
        : `Yes. If your GSTIN is in the same state you can add the ${c} address as an additional place of business. Otherwise you will need a new GSTIN for that state.`,
    },
    {
      q: "Will banks accept a virtual office address?",
      a: "Most banks accept a virtual office address for a current account when you share the NOC, agreement and utility bill along with your GST or incorporation certificate. Some banks may visit the address.",
    },
    {
      q: "Does SpaceWallah charge any brokerage?",
      a: "No. SpaceWallah is free for you. You pay only the plan fee to the centre you pick.",
    },
  ];

  if (/gurgaon|gurugram/i.test(c)) {
    faqs.splice(9, 0, {
      q: "Is Gurgaon the same as Gurugram?",
      a: "Yes. Gurugram is the official name of Gurgaon since 2016. Both names refer to the same city, and documents may use either name.",
    });
  }

  return faqs;
}

export const VO_REVIEWS = [
  {
    quote:
      "Got my GSTIN in 6 days. The NOC, agreement and utility bill all lined up, so there was zero rejection. I never had to travel once.",
    initials: "AS",
    name: "Aarav Sharma",
    role: "D2C e-commerce brand",
    plan: "GST Registration",
  },
  {
    quote:
      "The team shortlisted three options for us. No pressure and no brokerage. Clients noticed the new address on our invoices right away.",
    initials: "RT",
    name: "Rohit Talwar",
    role: "SaaS startup",
    plan: "Company Registration",
  },
  {
    quote:
      "As a marketplace seller I needed a new GSTIN fast. Filed on a Monday and had the certificate by the next week. The helpdesk actually replied.",
    initials: "SP",
    name: "Sneha Patel",
    role: "Marketplace seller",
    plan: "GST Registration",
  },
] as const;
